import type { OnboardingPatch } from "@/lib/user-types";
import { useOnboardingStore } from "@/store/onboarding-store";

export async function saveOnboarding(patch: OnboardingPatch): Promise<boolean> {
  const setError = useOnboardingStore.getState().setSaveError;
  setError("");
  try {
    const response = await fetch("/api/user/onboarding", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(patch)
    });
    const data = (await response.json().catch(() => ({}))) as { error?: string };

    if (!response.ok) {
      setError(data.error ?? "暂时没存好，请稍后再试");
      return false;
    }
    return true;
  } catch {
    setError("网络有点慢，请稍后再试");
    return false;
  }
}
