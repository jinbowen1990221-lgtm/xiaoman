import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { sessionCookieOptions } from "@/lib/cookie";
import { updateMockUser } from "@/lib/mock-user-db";
import { createSessionToken, SESSION_COOKIE } from "@/lib/session";
import type { OnboardingPatch } from "@/lib/user-types";

export async function PATCH(request: Request) {
  const currentUser = await getCurrentUser();
  if (!currentUser) {
    return NextResponse.json({ error: "未登录" }, { status: 401 });
  }

  const body = (await request.json().catch(() => ({}))) as OnboardingPatch;
  const nextStep = getNextStep(body);
  const patch = {
    ...sanitizePatch(body),
    ...(nextStep ? { onboarding_step: nextStep } : {})
  } as OnboardingPatch;
  const user = await updateMockUser(currentUser.phone, patch);
  const token = await createSessionToken(user);
  const response = NextResponse.json({ user });
  response.cookies.set(SESSION_COOKIE, token, sessionCookieOptions);
  return response;
}

function getNextStep(body: OnboardingPatch) {
  if (body.onboarding_completed) return "done";
  if (body.remind_time !== undefined || body.remind_enabled !== undefined) return "done";
  if (body.initial_thought !== undefined) return "remind";
  if (body.lifestyle !== undefined) return "thought";
  if (body.birthday !== undefined) return "lifestyle";
  if (body.nickname !== undefined) return "birthday";
  return undefined;
}

function sanitizePatch(body: OnboardingPatch): OnboardingPatch {
  const patch: OnboardingPatch = {
    nickname: body.nickname?.slice(0, 20),
    birthday: body.birthday,
    birthday_type: body.birthday_type,
    lifestyle: body.lifestyle,
    initial_thought: body.initial_thought?.slice(0, 200),
    remind_time: body.remind_time,
    remind_enabled: body.remind_enabled,
    onboarding_completed: body.onboarding_completed
  };
  return Object.fromEntries(
    Object.entries(patch).filter(([, value]) => value !== undefined)
  ) as OnboardingPatch;
}
