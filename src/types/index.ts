export type Difficulty = "easy" | "medium" | "hard";

export interface Check {
  id: string;
  description: string;
  test: (code: string) => boolean;
}

export interface Challenge {
  id: string;
  title: string;
  difficulty: Difficulty;
  category: string;
  description: string;
  starterCode: string;
  solution: string;
  hint: string;
  checks: Check[];
  concepts: string[];
  source?: string;
}

export interface CheckResult {
  id: string;
  description: string;
  passed: boolean;
}

export interface RunResult {
  ok: boolean;
  logs: ConsoleEntry[];
  error?: string;
  checks: CheckResult[];
}

export interface ConsoleEntry {
  level: "log" | "warn" | "error" | "info";
  args: string[];
  time: number;
}

export interface ProgressState {
  solved: Record<string, true>;
  xp: number;
  lastSolvedDate: string | null;
  streak: number;
}
