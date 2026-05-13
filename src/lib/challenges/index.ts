import type { Challenge } from "@/types";
import { easyChallenges } from "./easy";
import { mediumChallenges } from "./medium";
import { hardChallenges } from "./hard";

export const challenges: Challenge[] = [
  ...easyChallenges,
  ...mediumChallenges,
  ...hardChallenges,
];

export const categories = Array.from(new Set(challenges.map((c) => c.category)));

export function findChallenge(id: string) {
  return challenges.find((c) => c.id === id);
}

export const XP_BY_DIFFICULTY: Record<Challenge["difficulty"], number> = {
  easy: 10,
  medium: 20,
  hard: 40,
};
