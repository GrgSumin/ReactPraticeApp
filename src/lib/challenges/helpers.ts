import type { Check } from "@/types";

export function re(id: string, description: string, pattern: RegExp): Check {
  return { id, description, test: (code) => pattern.test(code) };
}

export function and(id: string, description: string, ...patterns: RegExp[]): Check {
  return { id, description, test: (code) => patterns.every((p) => p.test(code)) };
}
