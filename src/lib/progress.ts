"use client";

import { create } from "zustand";
import {
  persist,
  type PersistStorage,
  type StorageValue,
} from "zustand/middleware";
import type { Challenge, ProgressState } from "@/types";
import { XP_BY_DIFFICULTY } from "@/lib/challenges";

const STORAGE_KEY = "rp.progress.v1";

const DEFAULT_STATE: ProgressState = {
  solved: {},
  xp: 0,
  lastSolvedDate: null,
  streak: 0,
};

type ProgressStore = ProgressState & {
  markSolved: (challenge: Challenge) => void;
  reset: () => void;
};

// Pre-Zustand versions wrote the bare ProgressState JSON under STORAGE_KEY;
// Zustand persist expects { state, version }. Wrap legacy values on read so
// existing users keep their XP / streak / solved set.
const legacyCompatStorage: PersistStorage<ProgressState> = {
  getItem: (name) => {
    if (typeof window === "undefined") return null;
    const raw = window.localStorage.getItem(name);
    if (!raw) return null;
    try {
      const parsed: unknown = JSON.parse(raw);
      if (
        parsed &&
        typeof parsed === "object" &&
        "state" in parsed &&
        "version" in parsed
      ) {
        return parsed as StorageValue<ProgressState>;
      }
      return { state: parsed as ProgressState, version: 0 };
    } catch {
      return null;
    }
  },
  setItem: (name, value) => {
    if (typeof window === "undefined") return;
    try {
      window.localStorage.setItem(name, JSON.stringify(value));
    } catch {
      /* quota / private mode */
    }
  },
  removeItem: (name) => {
    if (typeof window === "undefined") return;
    window.localStorage.removeItem(name);
  },
};

function todayKey() {
  return new Date().toISOString().slice(0, 10);
}

function dayDiff(a: string, b: string) {
  const da = new Date(a + "T00:00:00Z").getTime();
  const db = new Date(b + "T00:00:00Z").getTime();
  return Math.round((db - da) / (24 * 60 * 60 * 1000));
}

export const useProgress = create<ProgressStore>()(
  persist(
    (set, get) => ({
      ...DEFAULT_STATE,
      markSolved: (challenge) => {
        const cur = get();
        if (cur.solved[challenge.id]) return;
        const xp = cur.xp + XP_BY_DIFFICULTY[challenge.difficulty];
        const today = todayKey();
        let streak = cur.streak;
        if (cur.lastSolvedDate === null) {
          streak = 1;
        } else {
          const d = dayDiff(cur.lastSolvedDate, today);
          if (d === 0) streak = Math.max(streak, 1);
          else if (d === 1) streak = streak + 1;
          else streak = 1;
        }
        set({
          solved: { ...cur.solved, [challenge.id]: true },
          xp,
          streak,
          lastSolvedDate: today,
        });
      },
      reset: () => set({ ...DEFAULT_STATE }),
    }),
    {
      name: STORAGE_KEY,
      version: 0,
      storage: legacyCompatStorage,
      partialize: (s) => ({
        solved: s.solved,
        xp: s.xp,
        lastSolvedDate: s.lastSolvedDate,
        streak: s.streak,
      }),
      skipHydration: true,
    },
  ),
);

if (typeof window !== "undefined") {
  void useProgress.persist.rehydrate();
}

export function levelForXp(xp: number) {
  if (xp >= 400) return { name: "Expert", min: 400, next: Infinity };
  if (xp >= 200) return { name: "Advanced", min: 200, next: 400 };
  if (xp >= 80) return { name: "Intermediate", min: 80, next: 200 };
  return { name: "Beginner", min: 0, next: 80 };
}
