"use client";

import { useMemo, useState } from "react";
import { Check } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { challenges, categories } from "@/lib/challenges";
import { useProgress } from "@/lib/progress";
import { cn } from "@/lib/utils";
import type { Challenge, Difficulty } from "@/types";

interface Props {
  activeId: string;
  onSelect: (id: string) => void;
}

const DIFFICULTIES: ("all" | Difficulty)[] = ["all", "easy", "medium", "hard"];

export function Sidebar({ activeId, onSelect }: Props) {
  const { solved } = useProgress();
  const [diff, setDiff] = useState<"all" | Difficulty>("all");
  const [cat, setCat] = useState<"all" | string>("all");

  const filtered = useMemo(() => {
    return challenges.filter(
      (c) =>
        (diff === "all" || c.difficulty === diff) &&
        (cat === "all" || c.category === cat),
    );
  }, [diff, cat]);

  const grouped = useMemo(() => {
    const map = new Map<string, Challenge[]>();
    for (const c of filtered) {
      if (!map.has(c.category)) map.set(c.category, []);
      map.get(c.category)!.push(c);
    }
    return map;
  }, [filtered]);

  return (
    <aside className="flex h-full w-[260px] shrink-0 flex-col border-r border-border bg-[#0a0a0a] text-sm">
      <div className="flex flex-col gap-3 border-b border-border px-3 py-3">
        <div>
          <p className="mb-1 text-[10px] uppercase tracking-wider text-muted-foreground">Difficulty</p>
          <div className="flex gap-1">
            {DIFFICULTIES.map((d) => (
              <button
                key={d}
                onClick={() => setDiff(d)}
                className={cn(
                  "rounded px-2 py-0.5 text-xs capitalize transition-colors",
                  diff === d
                    ? "bg-foreground text-background"
                    : "bg-secondary text-muted-foreground hover:bg-accent hover:text-foreground",
                )}
              >
                {d}
              </button>
            ))}
          </div>
        </div>
        <div>
          <p className="mb-1 text-[10px] uppercase tracking-wider text-muted-foreground">Category</p>
          <select
            value={cat}
            onChange={(e) => setCat(e.target.value)}
            className="w-full rounded border border-border bg-secondary px-2 py-1 text-xs text-foreground outline-none focus:border-primary"
          >
            <option value="all">All categories</option>
            {categories.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>
      </div>

      <nav className="flex-1 overflow-y-auto scrollbar-thin">
        {Array.from(grouped.entries()).map(([category, items]) => (
          <div key={category} className="border-b border-border/60 py-2">
            <p className="px-3 pb-1 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
              {category}
            </p>
            <ul>
              {items.map((c) => {
                const isActive = c.id === activeId;
                const isSolved = !!solved[c.id];
                return (
                  <li key={c.id}>
                    <button
                      onClick={() => onSelect(c.id)}
                      className={cn(
                        "flex w-full items-center justify-between gap-2 px-3 py-1.5 text-left transition-colors",
                        isActive
                          ? "bg-primary/10 text-foreground"
                          : "text-muted-foreground hover:bg-accent hover:text-foreground",
                      )}
                    >
                      <span className="flex min-w-0 items-center gap-1.5">
                        {isSolved ? (
                          <Check className="h-3 w-3 shrink-0 text-easy" />
                        ) : (
                          <span className="inline-block h-3 w-3 shrink-0" />
                        )}
                        <span className="truncate text-xs">{c.title}</span>
                      </span>
                      <Badge variant={c.difficulty} className="shrink-0 px-1.5 py-0 text-[10px]">
                        {c.difficulty[0].toUpperCase()}
                      </Badge>
                    </button>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
        {filtered.length === 0 && (
          <p className="px-3 py-6 text-center text-xs text-muted-foreground">No challenges match.</p>
        )}
      </nav>
    </aside>
  );
}
