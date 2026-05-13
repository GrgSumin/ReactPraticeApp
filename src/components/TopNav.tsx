"use client";

import { Sparkles, Trophy, Flame, Moon, Sun } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { useProgress, levelForXp } from "@/lib/progress";
import { challenges } from "@/lib/challenges";
import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

export function TopNav() {
  const { solved, xp, streak } = useProgress();
  const solvedCount = Object.keys(solved).length;
  const total = challenges.length;
  const level = levelForXp(xp);
  const [dark, setDark] = useState(true);

  useEffect(() => {
    document.documentElement.classList.toggle("dark", dark);
  }, [dark]);

  return (
    <header className="flex h-14 shrink-0 items-center justify-between border-b border-border bg-background/80 px-5 backdrop-blur">
      <div className="flex items-center gap-2">
        <div className="flex h-7 w-7 items-center justify-center rounded-md bg-primary/15 text-primary">
          <Sparkles className="h-4 w-4" />
        </div>
        <span className="text-sm font-semibold tracking-tight">React Practice</span>
      </div>

      <div className="flex items-center gap-6 text-xs">
        <div className="flex items-center gap-2">
          <Trophy className="h-3.5 w-3.5 text-medium" />
          <span className="font-medium tabular-nums">
            {solvedCount}/{total} solved
          </span>
          <div className="w-24">
            <Progress value={(solvedCount / total) * 100} />
          </div>
        </div>
        <div className={cn("flex items-center gap-1.5", "text-muted-foreground")}>
          <span className="font-medium text-foreground tabular-nums">{xp} XP</span>
          <span>·</span>
          <span>{level.name}</span>
        </div>
        <div className="flex items-center gap-1.5 text-muted-foreground">
          <Flame className="h-3.5 w-3.5 text-hard" />
          <span className="tabular-nums">{streak} day{streak === 1 ? "" : "s"}</span>
        </div>
        <Button variant="ghost" size="icon" onClick={() => setDark((d) => !d)} aria-label="Toggle theme">
          {dark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
        </Button>
      </div>
    </header>
  );
}
