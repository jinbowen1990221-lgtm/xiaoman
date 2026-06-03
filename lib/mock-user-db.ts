import { getSupabase } from "@/lib/supabase";
import type {
  CoinFlip,
  OnboardingPatch,
  PredictionStatus,
  StoredLotteryFavorite,
  StoredNote,
  StoredPrediction,
  StoredRecord,
  User
} from "@/lib/user-types";

/* ============================================================
   Data access layer.
   - If Supabase is configured (SUPABASE_URL + SERVICE_ROLE_KEY),
     reads/writes go to Postgres.
   - Otherwise falls back to an in-memory store (dev/demo).
   All functions are async so the call sites are storage-agnostic.
   ============================================================ */

const globalForUsers = globalThis as unknown as {
  __bobUsers?: Map<string, User>;
  __bobCoinFlips?: CoinFlip[];
  __bobRecords?: StoredRecord[];
  __bobNotes?: StoredNote[];
  __bobPredictions?: StoredPrediction[];
  __bobLotteryFavorites?: StoredLotteryFavorite[];
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
const lotteryFavStore = globalForUsers.__bobLotteryFavorites ?? [];
globalForUsers.__bobLotteryFavorites = lotteryFavStore;

/* ---------------- users ---------------- */

export async function getMockUserByPhone(phone: string): Promise<User | null> {
  const sb = getSupabase();
  if (sb) {
    const { data } = await sb.from("users").select("*").eq("phone", phone).maybeSingle();
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

  const sb = getSupabase();
  if (sb) {
    const existing = await getMockUserByPhone(phone);
    if (existing) return existing;
    const { data } = await sb.from("users").insert(draft).select("*").single();
    return (data as User) ?? draft;
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
  const sb = getSupabase();
  if (sb) {
    const { data } = await sb
      .from("users")
      .update({ ...patch, updated_at: new Date().toISOString() })
      .eq("phone", phone)
      .select("*")
      .single();
    return data as User;
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
  const sb = getSupabase();
  if (sb) {
    const { data } = await sb.from("coin_flips").insert(coinFlip).select("*").single();
    return (data as CoinFlip) ?? coinFlip;
  }
  coinFlips.unshift(coinFlip);
  return coinFlip;
}

export async function updateCoinFlipFollowed(userId: string, id: string, followed: boolean): Promise<CoinFlip | null> {
  const sb = getSupabase();
  if (sb) {
    const { data } = await sb
      .from("coin_flips")
      .update({ followed })
      .eq("id", id)
      .eq("user_id", userId)
      .select("*")
      .maybeSingle();
    return (data as CoinFlip) ?? null;
  }
  const coinFlip = coinFlips.find((item) => item.id === id && item.user_id === userId);
  if (!coinFlip) return null;
  coinFlip.followed = followed;
  return coinFlip;
}

export async function getCoinFlipsForUser(userId: string, limit = 20): Promise<CoinFlip[]> {
  const sb = getSupabase();
  if (sb) {
    const { data } = await sb
      .from("coin_flips")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .limit(limit);
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
  const sb = getSupabase();
  if (sb) {
    const { data } = await sb.from("records").insert(record).select("*").single();
    return (data as StoredRecord) ?? record;
  }
  recordsStore.unshift(record);
  return record;
}

export async function getRecordsForUser(userId: string, limit = 100): Promise<StoredRecord[]> {
  const sb = getSupabase();
  if (sb) {
    const { data } = await sb
      .from("records")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .limit(limit);
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
  const sb = getSupabase();
  if (sb) {
    const { data } = await sb.from("notes").insert(note).select("*").single();
    return (data as StoredNote) ?? note;
  }
  notesStore.unshift(note);
  return note;
}

export async function getNotesForUser(userId: string, limit = 50): Promise<StoredNote[]> {
  const sb = getSupabase();
  if (sb) {
    const { data } = await sb
      .from("notes")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .limit(limit);
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
  const sb = getSupabase();
  if (sb) {
    const { data } = await sb.from("predictions").insert(prediction).select("*").single();
    return (data as StoredPrediction) ?? prediction;
  }
  predictionsStore.unshift(prediction);
  return prediction;
}

export async function getPredictionsForUser(
  userId: string,
  limit = 30
): Promise<StoredPrediction[]> {
  const sb = getSupabase();
  if (sb) {
    const { data } = await sb
      .from("predictions")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .limit(limit);
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
  const sb = getSupabase();
  if (sb) {
    const { data } = await sb
      .from("predictions")
      .update({ status, verified_at })
      .eq("id", id)
      .eq("user_id", userId)
      .select("*")
      .single();
    return (data as StoredPrediction) ?? null;
  }
  const found = predictionsStore.find((p) => p.id === id && p.user_id === userId);
  if (!found) return null;
  found.status = status;
  found.verified_at = verified_at;
  return found;
}

/* ---------------- 幸运号收藏 ---------------- */

export async function createLotteryFavorite(
  userId: string,
  input: Pick<StoredLotteryFavorite, "type" | "reds" | "blues" | "narrative">
): Promise<StoredLotteryFavorite> {
  const fav: StoredLotteryFavorite = {
    id: crypto.randomUUID(),
    user_id: userId,
    type: input.type,
    reds: input.reds ?? [],
    blues: input.blues ?? [],
    narrative: input.narrative ?? "",
    created_at: new Date().toISOString()
  };
  const sb = getSupabase();
  if (sb) {
    const { data } = await sb.from("lottery_favorites").insert(fav).select("*").single();
    return (data as StoredLotteryFavorite) ?? fav;
  }
  lotteryFavStore.unshift(fav);
  return fav;
}

export async function getLotteryFavorites(
  userId: string,
  limit = 30
): Promise<StoredLotteryFavorite[]> {
  const sb = getSupabase();
  if (sb) {
    const { data } = await sb
      .from("lottery_favorites")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .limit(limit);
    return (data as StoredLotteryFavorite[]) ?? [];
  }
  return lotteryFavStore.filter((item) => item.user_id === userId).slice(0, limit);
}

export async function deleteLotteryFavorite(id: string, userId: string): Promise<boolean> {
  const sb = getSupabase();
  if (sb) {
    await sb.from("lottery_favorites").delete().eq("id", id).eq("user_id", userId);
    return true;
  }
  const idx = lotteryFavStore.findIndex((p) => p.id === id && p.user_id === userId);
  if (idx >= 0) lotteryFavStore.splice(idx, 1);
  return true;
}
