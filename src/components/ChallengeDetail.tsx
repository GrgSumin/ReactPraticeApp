"use client";

import { Fragment, useEffect, useState } from "react";
import { Play, Lightbulb, RotateCcw, BookOpen } from "lucide-react";
import {
  Group,
  Panel,
  useDefaultLayout,
  type LayoutStorage,
} from "react-resizable-panels";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ResizeHandle } from "@/components/ui/resize-handle";
import { CodeEditor } from "./CodeEditor";
import { OutputPanel } from "./OutputPanel";
import { buildSrcdoc, runChecks, transpile } from "@/lib/sandbox";
import { useProgress } from "@/lib/progress";
import type { Challenge, CheckResult, ConsoleEntry } from "@/types";

interface Props {
  challenge: Challenge;
}

const codeStorageKey = (id: string) => `rp.code.${id}`;

const ssrSafeStorage: LayoutStorage = {
  getItem: (key) =>
    typeof window !== "undefined" ? window.localStorage.getItem(key) : null,
  setItem: (key, value) => {
    if (typeof window !== "undefined") window.localStorage.setItem(key, value);
  },
};

function useIsLgUp() {
  const [isLg, setIsLg] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia("(min-width: 1024px)");
    const update = () => setIsLg(mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);
  return isLg;
}

export function ChallengeDetail({ challenge }: Props) {
  const [code, setCode] = useState(challenge.starterCode);
  const [showHint, setShowHint] = useState(false);
  const [srcdoc, setSrcdoc] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [logs, setLogs] = useState<ConsoleEntry[]>([]);
  const [checks, setChecks] = useState<CheckResult[]>([]);
  const { markSolved } = useProgress();
  const isLg = useIsLgUp();

  const horizontal = useDefaultLayout({
    id: "rp.layout.detail.h.v2",
    storage: ssrSafeStorage,
  });
  const vertical = useDefaultLayout({
    id: "rp.layout.detail.v.v2",
    storage: ssrSafeStorage,
  });

  useEffect(() => {
    let next = challenge.starterCode;
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem(codeStorageKey(challenge.id));
      if (saved !== null) next = saved;
    }
    setCode(next);
    setShowHint(false);
    setSrcdoc(null);
    setLogs([]);
    setChecks([]);
  }, [challenge.id, challenge.starterCode]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const t = setTimeout(() => {
      localStorage.setItem(codeStorageKey(challenge.id), code);
    }, 300);
    return () => clearTimeout(t);
  }, [code, challenge.id]);

  function run() {
    setBusy(true);
    setLogs([]);
    const t = transpile(code);
    const checkResults = runChecks(code, challenge.checks);
    setChecks(checkResults);
    if (!t.ok) {
      setSrcdoc(null);
      setLogs([
        { level: "error", args: ["Syntax error: " + (t.error ?? "unknown")], time: Date.now() },
      ]);
      setBusy(false);
      return;
    }
    setSrcdoc(buildSrcdoc(t.code ?? "", t.exportName ?? null));
    if (checkResults.every((c) => c.passed)) {
      markSolved(challenge);
    }
  }

  function reset() {
    setCode(challenge.starterCode);
    setShowHint(false);
    setLogs([]);
    setChecks([]);
  }

  function showSolution() {
    setCode(challenge.solution);
  }

  const description = (
    <section className="scrollbar-thin h-full min-h-0 overflow-y-auto bg-background p-5">
      <div className="mb-3 flex items-center gap-2">
        <Badge variant={challenge.difficulty}>{challenge.difficulty}</Badge>
        <Badge variant="outline" className="text-[10px]">
          {challenge.category}
        </Badge>
        {challenge.source && (
          <span className="text-[11px] text-muted-foreground">· {challenge.source}</span>
        )}
      </div>
      <h1 className="mb-3 text-lg font-semibold leading-tight">{challenge.title}</h1>
      <DescriptionMarkdown text={challenge.description} />
      <div className="mt-5">
        <p className="mb-1.5 text-[11px] uppercase tracking-wider text-muted-foreground">Concepts</p>
        <div className="flex flex-wrap gap-1">
          {challenge.concepts.map((c) => (
            <Badge key={c} variant="secondary" className="text-[10px] font-normal">
              {c}
            </Badge>
          ))}
        </div>
      </div>
      {showHint && (
        <div className="mt-5 rounded-md border border-medium/30 bg-medium/5 p-3">
          <p className="mb-1 text-[11px] font-medium uppercase tracking-wider text-medium">Hint</p>
          <p className="text-sm leading-snug text-foreground">{challenge.hint}</p>
        </div>
      )}
    </section>
  );

  const editorPane = (
    <section className="flex h-full min-h-0 flex-col">
      <div className="min-h-0 flex-1">
        <CodeEditor value={code} onChange={setCode} />
      </div>
      <div className="flex flex-wrap items-center gap-2 border-t border-border bg-background px-3 py-2">
        <Button size="sm" onClick={run} disabled={busy} className="gap-1.5">
          <Play className="h-3 w-3" /> Run
        </Button>
        <Button size="sm" variant="outline" onClick={() => setShowHint(true)} className="gap-1.5">
          <Lightbulb className="h-3 w-3" /> Hint
        </Button>
        <Button size="sm" variant="ghost" onClick={reset} className="gap-1.5">
          <RotateCcw className="h-3 w-3" /> Reset
        </Button>
        <Button size="sm" variant="ghost" onClick={showSolution} className="gap-1.5">
          <BookOpen className="h-3 w-3" /> Solution
        </Button>
      </div>
    </section>
  );

  const outputPane = (
    <section className="h-full min-h-0">
      <OutputPanel
        srcdoc={srcdoc}
        busy={busy}
        logs={logs}
        checks={checks}
        onLog={(entry) => setLogs((cur) => [...cur, entry])}
        onReady={() => setBusy(false)}
      />
    </section>
  );

  if (isLg) {
    return (
      <Group
        id="rp-detail-h"
        orientation="horizontal"
        defaultLayout={horizontal.defaultLayout}
        onLayoutChanged={horizontal.onLayoutChanged}
        className="h-full w-full"
      >
        <Panel id="desc" defaultSize="28%" minSize="16%">
          {description}
        </Panel>
        <ResizeHandle orientation="horizontal" />
        <Panel id="editor" defaultSize="40%" minSize="20%">
          {editorPane}
        </Panel>
        <ResizeHandle orientation="horizontal" />
        <Panel id="output" defaultSize="32%" minSize="18%">
          {outputPane}
        </Panel>
      </Group>
    );
  }

  return (
    <Group
      id="rp-detail-v"
      orientation="vertical"
      defaultLayout={vertical.defaultLayout}
      onLayoutChanged={vertical.onLayoutChanged}
      className="h-full w-full"
    >
      <Panel id="desc" defaultSize="28%" minSize="12%">
        {description}
      </Panel>
      <ResizeHandle orientation="vertical" />
      <Panel id="editor" defaultSize="40%" minSize="20%">
        {editorPane}
      </Panel>
      <ResizeHandle orientation="vertical" />
      <Panel id="output" defaultSize="32%" minSize="15%">
        {outputPane}
      </Panel>
    </Group>
  );
}

function DescriptionMarkdown({ text }: { text: string }) {
  const blocks: { kind: "code" | "para"; body: string }[] = [];
  const lines = text.split("\n");
  let i = 0;
  while (i < lines.length) {
    if (lines[i].trim().startsWith("```")) {
      i++;
      const buf: string[] = [];
      while (i < lines.length && !lines[i].trim().startsWith("```")) {
        buf.push(lines[i]);
        i++;
      }
      i++;
      blocks.push({ kind: "code", body: buf.join("\n") });
      continue;
    }
    const buf: string[] = [];
    while (i < lines.length && lines[i].trim() !== "" && !lines[i].trim().startsWith("```")) {
      buf.push(lines[i]);
      i++;
    }
    if (buf.length) blocks.push({ kind: "para", body: buf.join("\n") });
    while (i < lines.length && lines[i].trim() === "") i++;
  }

  return (
    <div className="text-sm leading-relaxed text-muted-foreground">
      {blocks.map((b, idx) =>
        b.kind === "code" ? (
          <pre
            key={idx}
            className="my-2 overflow-x-auto rounded-md bg-secondary p-3 font-mono text-[12px] text-foreground"
          >
            {b.body}
          </pre>
        ) : (
          <p key={idx} className="my-2">
            {renderInline(b.body)}
          </p>
        ),
      )}
    </div>
  );
}

function renderInline(text: string): React.ReactNode {
  const tokens: { kind: "code" | "bold" | "text"; body: string }[] = [];
  const re = /(`[^`]+`|\*\*[^*]+\*\*)/g;
  let last = 0;
  let m: RegExpExecArray | null;
  while ((m = re.exec(text))) {
    if (m.index > last) tokens.push({ kind: "text", body: text.slice(last, m.index) });
    const piece = m[0];
    if (piece.startsWith("`")) tokens.push({ kind: "code", body: piece.slice(1, -1) });
    else tokens.push({ kind: "bold", body: piece.slice(2, -2) });
    last = m.index + piece.length;
  }
  if (last < text.length) tokens.push({ kind: "text", body: text.slice(last) });

  return tokens.map((t, i) => {
    if (t.kind === "code")
      return (
        <code
          key={i}
          className="rounded bg-secondary px-1 py-0.5 font-mono text-[12px] text-foreground"
        >
          {t.body}
        </code>
      );
    if (t.kind === "bold")
      return (
        <strong key={i} className="font-semibold text-foreground">
          {t.body}
        </strong>
      );
    return <Fragment key={i}>{t.body}</Fragment>;
  });
}
