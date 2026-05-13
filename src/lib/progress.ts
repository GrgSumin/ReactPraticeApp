"use client";

import { useCallback, useEffect, useSyncExternalStore } from "react";
import type { Challenge, ProgressState } from "@/types";
import { XP_BY_DIFFICULTY } from "@/lib/challenges";

const STORAGE_KEY = "rp.progress.v1";

const DEFAULT_STATE: ProgressState = {
  solved: {},
  xp: 0,
  lastSolvedDate: null,
  streak: 0,
};

type Listener = () => void;
const listeners = new Set<Listener>();
let cache: ProgressState | null = null;

function load(): ProgressState {
  if (typeof window === "undefined") return DEFAULT_STATE;
  if (cache) return cache;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    cache = raw ? { ...DEFAULT_STATE, ...JSON.parse(raw) } : DEFAULT_STATE;
  } catch {
    cache = DEFAULT_STATE;
  }
  return cache!;
}

function persist(next: ProgressState) {
  cache = next;
  if (typeof window !== "undefined") {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    } catch {
      /* quota / private mode */
    }
  }
  listeners.forEach((l) => l());
}

function subscribe(l: Listener) {
  listeners.add(l);
  return () => listeners.delete(l);
}

function getSnapshot(): ProgressState {
  return load();
}

function getServerSnapshot(): ProgressState {
  return DEFAULT_STATE;
}

function todayKey() {
  return new Date().toISOString().slice(0, 10);
}

function dayDiff(a: string, b: string) {
  const da = new Date(a + "T00:00:00Z").getTime();
  const db = new Date(b + "T00:00:00Z").getTime();
  return Math.round((db - da) / (24 * 60 * 60 * 1000));
}

export function useProgress() {
  const state = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  const markSolved = useCallback((challenge: Challenge) => {
    const cur = load();
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
    persist({
      ...cur,
      solved: { ...cur.solved, [challenge.id]: true },
      xp,
      streak,
      lastSolvedDate: today,
    });
  }, []);

  const reset = useCallback(() => persist(DEFAULT_STATE), []);

  return { ...state, markSolved, reset };
}

export function levelForXp(xp: number) {
  if (xp >= 400) return { name: "Expert", min: 400, next: Infinity };
  if (xp >= 200) return { name: "Advanced", min: 200, next: 400 };
  if (xp >= 80) return { name: "Intermediate", min: 80, next: 200 };
  return { name: "Beginner", min: 0, next: 80 };
}

export function useIsClient() {
  const state = useSyncExternalStore(
    (cb) => {
      const id = setTimeout(cb, 0);
      return () => clearTimeout(id);
    },
    () => true,
    () => false,
  );
  return state;
}

export function useHydrationFlag() {
  const isClient = useIsClient();
  // touch useEffect once just to avoid an unused-symbol warning if removed later
  useEffect(() => undefined, []);
  return isClient;
}
