import type { User } from "@/lib/user-types";

export const SESSION_COOKIE = "bob_session";
const TOKEN_VERSION = "v1";

export type SessionPayload = {
  user: User;
  iat: number;
};

/* ------------------------------------------------------------------
   HMAC-signed sessions (Web Crypto — works in both Edge & Node).
   The payload is base64url(JSON); the signature is HMAC-SHA256 over it.
   A tampered or forged token fails verification → treated as logged out.
   Set SESSION_SECRET in production. ------------------------------------ */

function getSecret() {
  return (
    process.env.SESSION_SECRET ??
    // dev-only fallback so local works; MUST be overridden in production
    "xiaoman-dev-secret-change-me"
  );
}

const encoder = new TextEncoder();

async function importKey(secret: string) {
  return crypto.subtle.importKey(
    "raw",
    encoder.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign", "verify"]
  );
}

async function sign(data: string): Promise<string> {
  const key = await importKey(getSecret());
  const sig = await crypto.subtle.sign("HMAC", key, encoder.encode(data));
  return bytesToBase64Url(new Uint8Array(sig));
}

async function verify(data: string, signature: string): Promise<boolean> {
  try {
    const key = await importKey(getSecret());
    return await crypto.subtle.verify(
      "HMAC",
      key,
      base64UrlToBytes(signature),
      encoder.encode(data)
    );
  } catch {
    return false;
  }
}

export async function createSessionToken(user: User): Promise<string> {
  const payload = base64UrlEncode(JSON.stringify({ user, iat: Date.now() } satisfies SessionPayload));
  const data = `${TOKEN_VERSION}.${payload}`;
  const signature = await sign(data);
  return `${data}.${signature}`;
}

export async function readSessionToken(token?: string | null): Promise<SessionPayload | null> {
  if (!token) return null;
  const parts = token.split(".");
  if (parts.length !== 3) return null;
  const [version, payload, signature] = parts;
  if (version !== TOKEN_VERSION) return null;

  const ok = await verify(`${version}.${payload}`, signature);
  if (!ok) return null;

  try {
    return JSON.parse(base64UrlDecode(payload)) as SessionPayload;
  } catch {
    return null;
  }
}

export function getSafeRedirectForUser(user: User) {
  if (user.onboarding_completed) return "/";
  return getOnboardingPath(user);
}

export function getOnboardingPath(user: User) {
  if (user.onboarding_step && user.onboarding_step !== "intro") {
    return `/onboarding/${user.onboarding_step}`;
  }
  if (!user.nickname) return "/onboarding/intro";
  if (!user.birthday) return "/onboarding/birthday";
  if (!user.lifestyle) return "/onboarding/lifestyle";
  if (user.remind_time === null && user.remind_enabled) return "/onboarding/remind";
  return "/onboarding/done";
}

/* ---------- base64url helpers (Edge + Node safe) ---------- */

function base64UrlEncode(value: string) {
  const encoded =
    typeof Buffer === "undefined"
      ? btoa(unescape(encodeURIComponent(value)))
      : Buffer.from(value, "utf8").toString("base64");
  return encoded.replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");
}

function base64UrlDecode(value: string) {
  const padded = `${value}${"=".repeat((4 - (value.length % 4)) % 4)}`;
  const base64 = padded.replace(/-/g, "+").replace(/_/g, "/");
  if (typeof Buffer === "undefined") {
    return decodeURIComponent(escape(atob(base64)));
  }
  return Buffer.from(base64, "base64").toString("utf8");
}

function bytesToBase64Url(bytes: Uint8Array) {
  let base64: string;
  if (typeof Buffer === "undefined") {
    let binary = "";
    for (let i = 0; i < bytes.length; i++) binary += String.fromCharCode(bytes[i]);
    base64 = btoa(binary);
  } else {
    base64 = Buffer.from(bytes).toString("base64");
  }
  return base64.replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");
}

function base64UrlToBytes(value: string) {
  const padded = `${value}${"=".repeat((4 - (value.length % 4)) % 4)}`;
  const base64 = padded.replace(/-/g, "+").replace(/_/g, "/");
  const binary = typeof Buffer === "undefined" ? atob(base64) : Buffer.from(base64, "base64").toString("binary");
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
  return bytes;
}
