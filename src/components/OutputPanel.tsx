"use client";

import { useEffect, useRef, useState } from "react";
import { Check, X, Eye, Terminal, ListChecks, Loader2 } from "lucide-react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import type { CheckResult, ConsoleEntry } from "@/types";

interface Props {
  srcdoc: string | null;
  busy: boolean;
  logs: ConsoleEntry[];
  onLog: (entry: ConsoleEntry) => void;
  onReady: () => void;
  checks: CheckResult[];
}

export function OutputPanel({ srcdoc, busy, logs, onLog, onReady, checks }: Props) {
  const iframeRef = useRef<HTMLIFrameElement | null>(null);
  const [tab, setTab] = useState("preview");

  useEffect(() => {
    function handler(e: MessageEvent) {
      const data = e.data;
      if (!data || typeof data !== "object") return;
      if (data.type === "console" && data.level && Array.isArray(data.args)) {
        onLog({ level: data.level, args: data.args, time: Date.now() });
      } else if (data.type === "ready") {
        onReady();
      } else if (data.type === "crashed") {
        onReady();
      }
    }
    window.addEventListener("message", handler);
    return () => window.removeEventListener("message", handler);
  }, [onLog, onReady]);

  useEffect(() => {
    if (srcdoc && iframeRef.current) {
      iframeRef.current.srcdoc = srcdoc;
    }
  }, [srcdoc]);

  const passed = checks.filter((c) => c.passed).length;
  const errorCount = logs.filter((l) => l.level === "error").length;

  return (
    <div className="flex h-full min-h-0 flex-col bg-card">
      <Tabs value={tab} onValueChange={setTab} className="flex h-full min-h-0 flex-col">
        <div className="flex items-center justify-between border-b border-border px-3 py-2">
          <TabsList className="h-8">
            <TabsTrigger value="preview" className="gap-1.5 text-xs">
              <Eye className="h-3 w-3" /> Preview
            </TabsTrigger>
            <TabsTrigger value="console" className="gap-1.5 text-xs">
              <Terminal className="h-3 w-3" /> Console
              {errorCount > 0 && (
                <span className="ml-1 rounded-full bg-destructive/20 px-1.5 text-[10px] text-destructive">
                  {errorCount}
                </span>
              )}
            </TabsTrigger>
            <TabsTrigger value="tests" className="gap-1.5 text-xs">
              <ListChecks className="h-3 w-3" /> Tests
              {checks.length > 0 && (
                <span
                  className={cn(
                    "ml-1 rounded-full px-1.5 text-[10px]",
                    passed === checks.length
                      ? "bg-easy/20 text-easy"
                      : "bg-secondary text-muted-foreground",
                  )}
                >
                  {passed}/{checks.length}
                </span>
              )}
            </TabsTrigger>
          </TabsList>
          {busy && <Loader2 className="h-3.5 w-3.5 animate-spin text-muted-foreground" />}
        </div>

        <TabsContent value="preview" className="mt-0 min-h-0 flex-1 overflow-hidden">
          <div className="h-full w-full bg-white">
            <iframe
              ref={iframeRef}
              title="preview"
              sandbox="allow-scripts"
              className="h-full w-full border-0"
            />
          </div>
        </TabsContent>

        <TabsContent value="console" className="mt-0 min-h-0 flex-1 overflow-hidden">
          <div className="scrollbar-thin h-full overflow-y-auto bg-[#0a0a0a] p-3 font-mono text-xs">
            {logs.length === 0 && (
              <p className="text-muted-foreground">No console output. Use console.log() in your code.</p>
            )}
            {logs.map((l, i) => (
              <div
                key={i}
                className={cn(
                  "whitespace-pre-wrap py-0.5",
                  l.level === "error" && "text-hard",
                  l.level === "warn" && "text-medium",
                  l.level === "log" && "text-foreground",
                  l.level === "info" && "text-primary",
                )}
              >
                <span className="mr-2 text-muted-foreground">›</span>
                {l.args.join(" ")}
              </div>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="tests" className="mt-0 min-h-0 flex-1 overflow-hidden">
          <div className="scrollbar-thin h-full overflow-y-auto p-3 text-sm">
            {checks.length === 0 && (
              <p className="text-xs text-muted-foreground">Click Run to evaluate your code against the checks.</p>
            )}
            <ul className="space-y-1.5">
              {checks.map((c) => (
                <li
                  key={c.id}
                  className={cn(
                    "flex items-start gap-2 rounded-md border px-3 py-2 text-xs",
                    c.passed
                      ? "border-easy/30 bg-easy/5 text-foreground"
                      : "border-border bg-secondary/50 text-muted-foreground",
                  )}
                >
                  {c.passed ? (
                    <Check className="mt-0.5 h-3.5 w-3.5 shrink-0 text-easy" />
                  ) : (
                    <X className="mt-0.5 h-3.5 w-3.5 shrink-0 text-muted-foreground" />
                  )}
                  <span className="leading-snug">{c.description}</span>
                </li>
              ))}
            </ul>
            {checks.length > 0 && passed === checks.length && (
              <div className="mt-3 rounded-md border border-easy/40 bg-easy/10 px-3 py-2 text-xs font-medium text-easy">
                All checks passed — challenge complete!
              </div>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
