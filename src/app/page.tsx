"use client";

import { useEffect, useState } from "react";
import {
  Group,
  Panel,
  useDefaultLayout,
  type LayoutStorage,
} from "react-resizable-panels";
import { TopNav } from "@/components/TopNav";
import { Sidebar } from "@/components/Sidebar";
import { ChallengeDetail } from "@/components/ChallengeDetail";
import { ResizeHandle } from "@/components/ui/resize-handle";
import { challenges, findChallenge } from "@/lib/challenges";
import { TooltipProvider } from "@/components/ui/tooltip";

const ssrSafeStorage: LayoutStorage = {
  getItem: (key) =>
    typeof window !== "undefined" ? window.localStorage.getItem(key) : null,
  setItem: (key, value) => {
    if (typeof window !== "undefined") window.localStorage.setItem(key, value);
  },
};

export default function Home() {
  const [activeId, setActiveId] = useState(challenges[0].id);
  const challenge = findChallenge(activeId) ?? challenges[0];
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const desktop = useDefaultLayout({
    id: "rp.layout.desktop.v2",
    storage: ssrSafeStorage,
  });

  useEffect(() => {
    if (!sidebarOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setSidebarOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [sidebarOpen]);

  function selectFromDrawer(id: string) {
    setActiveId(id);
    setSidebarOpen(false);
  }

  return (
    <TooltipProvider delayDuration={200}>
      <div className="flex h-screen min-h-0 flex-col">
        <TopNav onToggleSidebar={() => setSidebarOpen((v) => !v)} />

        <div className="hidden min-h-0 flex-1 lg:block">
          <Group
            id="rp-desktop"
            orientation="horizontal"
            defaultLayout={desktop.defaultLayout}
            onLayoutChanged={desktop.onLayoutChanged}
            className="h-full w-full"
          >
            <Panel id="sidebar" defaultSize="18%" minSize="12%" maxSize="32%">
              <div className="h-full border-r border-border">
                <Sidebar activeId={activeId} onSelect={setActiveId} />
              </div>
            </Panel>
            <ResizeHandle orientation="horizontal" />
            <Panel id="main" defaultSize="82%" minSize="40%">
              <ChallengeDetail key={challenge.id} challenge={challenge} />
            </Panel>
          </Group>
        </div>

        <div className="relative flex min-h-0 flex-1 lg:hidden">
          {sidebarOpen && (
            <>
              <button
                type="button"
                aria-label="Close challenge list"
                onClick={() => setSidebarOpen(false)}
                className="fixed inset-x-0 bottom-0 top-14 z-40 bg-black/60 backdrop-blur-sm"
              />
              <div className="fixed bottom-0 left-0 top-14 z-50 w-72 max-w-[85%] border-r border-border bg-[#0a0a0a] shadow-2xl">
                <Sidebar activeId={activeId} onSelect={selectFromDrawer} />
              </div>
            </>
          )}
          <div className="min-h-0 flex-1">
            <ChallengeDetail key={challenge.id} challenge={challenge} />
          </div>
        </div>
      </div>
    </TooltipProvider>
  );
}
