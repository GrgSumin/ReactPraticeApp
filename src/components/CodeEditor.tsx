"use client";

import dynamic from "next/dynamic";
import { useEffect, useRef } from "react";

const MonacoEditor = dynamic(() => import("@monaco-editor/react").then((m) => m.default), {
  ssr: false,
  loading: () => (
    <div className="flex h-full items-center justify-center text-xs text-muted-foreground">
      Loading editor…
    </div>
  ),
});

interface Props {
  value: string;
  onChange: (v: string) => void;
  language?: "typescript" | "javascript";
}

export function CodeEditor({ value, onChange, language = "typescript" }: Props) {
  const editorRef = useRef<unknown>(null);

  return (
    <MonacoEditor
      height="100%"
      defaultLanguage={language}
      language={language}
      theme="vs-dark"
      value={value}
      onChange={(v) => onChange(v ?? "")}
      onMount={(editor, monaco) => {
        editorRef.current = editor;
        monaco.languages.typescript.typescriptDefaults.setCompilerOptions({
          jsx: monaco.languages.typescript.JsxEmit.React,
          jsxFactory: "React.createElement",
          reactNamespace: "React",
          allowNonTsExtensions: true,
          target: monaco.languages.typescript.ScriptTarget.Latest,
          allowJs: true,
          esModuleInterop: true,
          isolatedModules: false,
          moduleResolution: monaco.languages.typescript.ModuleResolutionKind.NodeJs,
        });
        monaco.languages.typescript.typescriptDefaults.setDiagnosticsOptions({
          noSemanticValidation: true,
          noSyntaxValidation: false,
        });
      }}
      options={{
        fontSize: 13,
        minimap: { enabled: false },
        scrollBeyondLastLine: false,
        smoothScrolling: true,
        cursorBlinking: "smooth",
        fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace",
        fontLigatures: true,
        padding: { top: 12 },
        tabSize: 2,
        wordWrap: "on",
        automaticLayout: true,
      }}
    />
  );
}
