"use client";

import { create } from "zustand";
import type { BirthdayType, Lifestyle, User } from "@/lib/user-types";

type OnboardingData = {
  nickname: string;
  birthday: string | null;
  birthdayType: BirthdayType;
  lifestyle: Lifestyle | null;
  initialThought: string;
  remindTime: string;
  remindEnabled: boolean;
};

interface OnboardingState extends OnboardingData {
  saveError: string;
  setField: <K extends keyof OnboardingData>(key: K, value: OnboardingData[K]) => void;
  setSaveError: (message: string) => void;
  hydrateFromUser: (user: User) => void;
  reset: () => void;
}

const initialState: OnboardingData = {
  nickname: "",
  birthday: null,
  birthdayType: "solar",
  lifestyle: null,
  initialThought: "",
  remindTime: "22:00",
  remindEnabled: true
};

export const useOnboardingStore = create<OnboardingState>((set) => ({
  ...initialState,
  saveError: "",
  setField: (key, value) => set({ [key]: value } as Pick<OnboardingData, typeof key>),
  setSaveError: (message) => set({ saveError: message }),
  hydrateFromUser: (user) =>
    set({
      nickname: user.nickname ?? "",
      birthday: user.birthday,
      birthdayType: user.birthday_type,
      lifestyle: user.lifestyle,
      initialThought: user.initial_thought ?? "",
      remindTime: user.remind_time ?? "22:00",
      remindEnabled: user.remind_enabled
    }),
  reset: () => set({ ...initialState, saveError: "" })
}));
