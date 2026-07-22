import { getSupabase } from "@/lib/supabase";
import type {
  CoinFlip,
  OnboardingPatch,
  PredictionStatus,
  StoredNote,
  StoredPrediction,
  StoredRecord,
  User
} from "@/lib/user-types";

/* ============================================================
   Data access layer.
   - If Supabase is configured (SUPABASE_URL + SERVICE_ROLE_KEY),
     reads/writes go to Postgres.
   - Local development falls back to an in-memory store.
   - Production fails closed when Supabase is unavailable so writes never look
     successful when they were only stored in a short-lived server process.
   All functions are async so the call sites are storage-agnostic.
   ============================================================ */

export class PersistenceError extends Error {
  readonly operation: string;
  readonly originalError: unknown;

  constructor(operation: string, originalError: unknown) {
    super(`Persistence unavailable during ${operation}`);
    this.name = "PersistenceError";
    this.operation = operation;
    this.originalError = originalError;
  }
}

function failPersistence(operation: string, error: unknown): never {
  console.error(`[persistence] ${operation} failed`, error);
  throw new PersistenceError(operation, error);
}

function getPersistenceClient(operation: string) {
  const client = getSupabase();
  if (!client && process.env.NODE_ENV === "production") {
    failPersistence(operation, new Error("Supabase is not configured"));
  }
  return client;
}

function checkSupabaseError(operation: string, error: unknown) {
  if (error) failPersistence(operation, error);
}

function requireSupabaseData<T>(operation: string, data: T | null, error: unknown): T {
  checkSupabaseError(operation, error);
  if (data === null) failPersistence(operation, new Error("Supabase returned no row"));
  return data;
}

const globalForUsers = globalThis as unknown as {
  __bobUsers?: Map<string, User>;
  __bobCoinFlips?: CoinFlip[];
  __bobRecords?: StoredRecord[];
  __bobNotes?: StoredNote[];
  __bobPredictions?: StoredPrediction[];
};

const users = globalForUsers.__bobUsers ?? new Map<string, User>();
globalForUsers.__bobUsers = users;
const coinFlips = globalForUsers.__bobCoinFlips ?? [];
globalForUsers.__bobCoinFlips = coinFlips;
const recordsStore = globalForUsers.__bobRecords ?? [];
globalForUsers.__bobRecords = recordsStore;
const notesStore = globalForUsers.__bobNotes ?? [];
globalForUsers.__bobNotes = notesStore;
const predictionsStore = globalForUsers.__bobPredictions ?? [];
globalForUsers.__bobPredictions = predictionsStore;

/* ---------------- users ---------------- */

export async function getMockUserByPhone(phone: string): Promise<User | null> {
  const sb = getPersistenceClient("read user");
  if (sb) {
    const { data, error } = await sb.from("users").select("*").eq("phone", phone).maybeSingle();
    checkSupabaseError("read user", error);
    return (data as User) ?? null;
  }
  return users.get(phone) ?? null;
}

export async function getOrCreateMockUser(phone: string): Promise<User> {
  const now = new Date().toISOString();
  const draft: User = {
    id: crypto.randomUUID(),
    phone,
    nickname: null,
    birthday: null,
    birthday_type: "solar",
    lifestyle: null,
    initial_thought: null,
    remind_time: "22:00",
    remind_enabled: true,
    onboarding_completed: false,
    onboarding_step: "intro",
    preferred_lottery: "double_color",
    created_at: now,
    updated_at: now
  };

  const sb = getPersistenceClient("create user");
  if (sb) {
    const existing = await getMockUserByPhone(phone);
    if (existing) return existing;
    const { data, error } = await sb.from("users").insert(draft).select("*").single();
    return requireSupabaseData("create user", data as User | null, error);
  }

  // in-memory: keep the demo shortcut so 13900000000 is a ready onboarded user
  const existing = users.get(phone);
  if (existing) return existing;
  if (phone === "13900000000") {
    draft.onboarding_completed = true;
    draft.nickname = "阿和";
    draft.birthday = "2001-04-21";
    draft.lifestyle = "working";
    draft.initial_thought = "最近总睡不好";
    draft.onboarding_step = "done";
  }
  users.set(phone, draft);
  return draft;
}

export async function updateMockUser(phone: string, patch: OnboardingPatch): Promise<User> {
  const sb = getPersistenceClient("update user");
  if (sb) {
    const { data, error } = await sb
      .from("users")
      .update({ ...patch, updated_at: new Date().toISOString() })
      .eq("phone", phone)
      .select("*")
      .single();
    return requireSupabaseData("update user", data as User | null, error);
  }
  const current = await getOrCreateMockUser(phone);
  const next: User = { ...current, ...patch, updated_at: new Date().toISOString() };
  users.set(phone, next);
  return next;
}

/* ---------------- coin flips ---------------- */

export async function createCoinFlip(
  userId: string,
  input: Pick<CoinFlip, "option_a" | "option_b" | "result" | "bob_comment">
): Promise<CoinFlip> {
  const coinFlip: CoinFlip = {
    id: crypto.randomUUID(),
    user_id: userId,
    option_a: input.option_a,
    option_b: input.option_b,
    result: input.result,
    bob_comment: input.bob_comment,
    followed: null,
    created_at: new Date().toISOString()
  };
  const sb = getPersistenceClient("create coin flip");
  if (sb) {
    const { data, error } = await sb.from("coin_flips").insert(coinFlip).select("*").single();
    return requireSupabaseData("create coin flip", data as CoinFlip | null, error);
  }
  coinFlips.unshift(coinFlip);
  return coinFlip;
}

export async function updateCoinFlipFollowed(userId: string, id: string, followed: boolean): Promise<CoinFlip | null> {
  const sb = getPersistenceClient("update coin flip");
  if (sb) {
    const { data, error } = await sb
      .from("coin_flips")
      .update({ followed })
      .eq("id", id)
      .eq("user_id", userId)
      .select("*")
      .maybeSingle();
    checkSupabaseError("update coin flip", error);
    return (data as CoinFlip) ?? null;
  }
  const coinFlip = coinFlips.find((item) => item.id === id && item.user_id === userId);
  if (!coinFlip) return null;
  coinFlip.followed = followed;
  return coinFlip;
}

export async function getCoinFlipsForUser(userId: string, limit = 20): Promise<CoinFlip[]> {
  const sb = getPersistenceClient("list coin flips");
  if (sb) {
    const { data, error } = await sb
      .from("coin_flips")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .limit(limit);
    checkSupabaseError("list coin flips", error);
    return (data as CoinFlip[]) ?? [];
  }
  return coinFlips.filter((item) => item.user_id === userId).slice(0, limit);
}

/* ---------------- daily records (journal) ---------------- */

export async function createRecord(
  userId: string,
  input: Pick<StoredRecord, "content" | "images" | "input_type" | "audio_duration" | "mood">
): Promise<StoredRecord> {
  const record: StoredRecord = {
    id: crypto.randomUUID(),
    user_id: userId,
    content: input.content,
    images: input.images ?? [],
    input_type: input.input_type,
    audio_duration: input.audio_duration ?? null,
    mood: input.mood ?? null,
    created_at: new Date().toISOString()
  };
  const sb = getPersistenceClient("create record");
  if (sb) {
    const { data, error } = await sb.from("records").insert(record).select("*").single();
    return requireSupabaseData("create record", data as StoredRecord | null, error);
  }
  recordsStore.unshift(record);
  return record;
}

export async function getRecordsForUser(userId: string, limit = 100): Promise<StoredRecord[]> {
  const sb = getPersistenceClient("list records");
  if (sb) {
    const { data, error } = await sb
      .from("records")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .limit(limit);
    checkSupabaseError("list records", error);
    return (data as StoredRecord[]) ?? [];
  }
  return recordsStore.filter((item) => item.user_id === userId).slice(0, limit);
}

/* ---------------- saved 今日预感 notes ---------------- */

export async function createNote(
  userId: string,
  input: Pick<StoredNote, "choice" | "text" | "possibility">
): Promise<StoredNote> {
  const note: StoredNote = {
    id: crypto.randomUUID(),
    user_id: userId,
    choice: input.choice,
    text: input.text,
    possibility: input.possibility,
    created_at: new Date().toISOString()
  };
  const sb = getPersistenceClient("create note");
  if (sb) {
    const { data, error } = await sb.from("notes").insert(note).select("*").single();
    return requireSupabaseData("create note", data as StoredNote | null, error);
  }
  notesStore.unshift(note);
  return note;
}

export async function getNotesForUser(userId: string, limit = 50): Promise<StoredNote[]> {
  const sb = getPersistenceClient("list notes");
  if (sb) {
    const { data, error } = await sb
      .from("notes")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .limit(limit);
    checkSupabaseError("list notes", error);
    return (data as StoredNote[]) ?? [];
  }
  return notesStore.filter((item) => item.user_id === userId).slice(0, limit);
}

/* ---------------- predictions (应验闭环) ---------------- */

export async function createPrediction(
  userId: string,
  input: Pick<StoredPrediction, "content" | "basis" | "category" | "confidence">
): Promise<StoredPrediction> {
  const prediction: StoredPrediction = {
    id: crypto.randomUUID(),
    user_id: userId,
    content: input.content,
    basis: input.basis,
    category: input.category,
    confidence: input.confidence,
    status: "pending",
    created_at: new Date().toISOString(),
    verified_at: null
  };
  const sb = getPersistenceClient("create prediction");
  if (sb) {
    const { data, error } = await sb.from("predictions").insert(prediction).select("*").single();
    return requireSupabaseData("create prediction", data as StoredPrediction | null, error);
  }
  predictionsStore.unshift(prediction);
  return prediction;
}

export async function getPredictionsForUser(
  userId: string,
  limit = 30
): Promise<StoredPrediction[]> {
  const sb = getPersistenceClient("list predictions");
  if (sb) {
    const { data, error } = await sb
      .from("predictions")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .limit(limit);
    checkSupabaseError("list predictions", error);
    return (data as StoredPrediction[]) ?? [];
  }
  return predictionsStore.filter((item) => item.user_id === userId).slice(0, limit);
}

export async function updatePredictionStatus(
  id: string,
  userId: string,
  status: PredictionStatus
): Promise<StoredPrediction | null> {
  const verified_at = new Date().toISOString();
  const sb = getPersistenceClient("update prediction");
  if (sb) {
    const { data, error } = await sb
      .from("predictions")
      .update({ status, verified_at })
      .eq("id", id)
      .eq("user_id", userId)
      .select("*")
      .maybeSingle();
    checkSupabaseError("update prediction", error);
    return (data as StoredPrediction) ?? null;
  }
  const found = predictionsStore.find((p) => p.id === id && p.user_id === userId);
  if (!found) return null;
  found.status = status;
  found.verified_at = verified_at;
  return found;
}
