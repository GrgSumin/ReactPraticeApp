"use client";

import { useState } from "react";
import { TopNav } from "@/components/TopNav";
import { Sidebar } from "@/components/Sidebar";
import { ChallengeDetail } from "@/components/ChallengeDetail";
import { challenges, findChallenge } from "@/lib/challenges";
import { TooltipProvider } from "@/components/ui/tooltip";

export default function Home() {
  const [activeId, setActiveId] = useState(challenges[0].id);
  const challenge = findChallenge(activeId) ?? challenges[0];

  return (
    <TooltipProvider delayDuration={200}>
      <div className="flex h-screen min-h-0 flex-col">
        <TopNav />
        <div className="flex min-h-0 flex-1">
          <Sidebar activeId={activeId} onSelect={setActiveId} />
          <main className="min-h-0 flex-1">
            <ChallengeDetail key={challenge.id} challenge={challenge} />
          </main>
        </div>
      </div>
    </TooltipProvider>
  );
}
