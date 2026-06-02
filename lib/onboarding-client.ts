import type { OnboardingPatch } from "@/lib/user-types";

export async function saveOnboarding(patch: OnboardingPatch) {
  const response = await fetch("/api/user/onboarding", {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(patch)
  });

  if (!response.ok) {
    throw new Error("保存失败");
  }

  return response.json() as Promise<{ user: unknown }>;
}
