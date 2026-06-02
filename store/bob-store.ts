"use client";

import { create } from "zustand";

type BobState = {
  selectedWord: string | null;
  setSelectedWord: (word: string) => void;
  lastCoinResult: string | null;
  setLastCoinResult: (result: string) => void;
};

export const useBobStore = create<BobState>((set) => ({
  selectedWord: null,
  setSelectedWord: (word) => set({ selectedWord: word }),
  lastCoinResult: null,
  setLastCoinResult: (result) => set({ lastCoinResult: result })
}));
