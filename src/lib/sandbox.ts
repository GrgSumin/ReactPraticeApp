"use client";

import * as Babel from "@babel/standalone";
import type { Check, CheckResult, ConsoleEntry } from "@/types";

function preprocess(code: string) {
  let p = code;
  // Strip single-line imports.
  p = p.replace(/^[ \t]*import\b[^\n]*?from\s+["'][^"']+["'];?[ \t]*\n?/gm, "");
  p = p.replace(/^[ \t]*import\s+["'][^"']+["'];?[ \t]*\n?/gm, "");
  // Strip `export` keyword on named declarations so they parse as plain code.
  p = p.replace(
    /^[ \t]*export\s+(?=(async\s+)?function\s+|const\s+|let\s+|var\s+|class\s+|interface\s+|type\s+|enum\s+)/gm,
    "",
  );

  let exportName: string | null = null;
  const namedFn = p.match(/export\s+default\s+function\s+(\w+)/);
  if (namedFn) {
    exportName = namedFn[1];
    p = p.replace(/export\s+default\s+function\s+\w+/, `function ${exportName}`);
  } else if (/export\s+default\s+function\s*\(/.test(p)) {
    exportName = "__default";
    p = p.replace(/export\s+default\s+function\s*\(/, "function __default(");
  } else {
    const identMatch = p.match(/export\s+default\s+(\w+)\s*;?\s*$/m);
    if (identMatch) {
      exportName = identMatch[1];
      p = p.replace(/export\s+default\s+\w+\s*;?\s*$/m, "");
    } else if (/export\s+default\s+/.test(p)) {
      exportName = "__default";
      p = p.replace(/export\s+default\s+/, "const __default = ");
    }
  }

  return { processed: p, exportName };
}

export interface TranspileResult {
  ok: boolean;
  code?: string;
  exportName?: string | null;
  error?: string;
}

export function transpile(code: string): TranspileResult {
  const { processed, exportName } = preprocess(code);
  try {
    const out = Babel.transform(processed, {
      presets: [
        ["typescript", { isTSX: true, allExtensions: true, onlyRemoveTypeImports: true }],
        "react",
      ],
      filename: "user.tsx",
    });
    return { ok: true, code: out.code || "", exportName };
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    return { ok: false, error: msg };
  }
}

export function buildSrcdoc(transpiled: string, exportName: string | null): string {
  const safeName = exportName ?? "undefined";
  const escaped = transpiled.replace(/<\/script/gi, "<\\/script");

  return `<!doctype html>
<html>
  <head>
    <meta charset="utf-8" />
    <style>
      body { margin: 0; padding: 16px; font-family: system-ui, -apple-system, sans-serif; color: #111; background: #fff; }
      *, *::before, *::after { box-sizing: border-box; }
      pre { font-family: ui-monospace, SFMono-Regular, Menlo, monospace; }
      .__rp_empty { color: #888; font-size: 13px; }
    </style>
  </head>
  <body>
    <div id="root"></div>
    <script src="https://unpkg.com/react@18.3.1/umd/react.development.js"></script>
    <script src="https://unpkg.com/react-dom@18.3.1/umd/react-dom.development.js"></script>
    <script>
      (function () {
        function post(msg) { try { parent.postMessage(msg, '*'); } catch (e) {} }
        function serialize(a) {
          try {
            if (a instanceof Error) return a.message;
            if (typeof a === 'object' && a !== null) return JSON.stringify(a);
            return String(a);
          } catch (e) { return String(a); }
        }
        ['log','error','warn','info'].forEach(function (level) {
          var orig = console[level].bind(console);
          console[level] = function () {
            var args = Array.prototype.slice.call(arguments);
            orig.apply(null, args);
            post({ type: 'console', level: level, args: args.map(serialize) });
          };
        });
        window.addEventListener('error', function (e) {
          post({ type: 'console', level: 'error', args: [e.message || 'Error'] });
        });
        window.addEventListener('unhandledrejection', function (e) {
          var reason = e && e.reason;
          var msg = (reason && (reason.message || reason)) || 'unhandled rejection';
          post({ type: 'console', level: 'error', args: ['Unhandled rejection: ' + msg] });
        });

        var useState = React.useState, useEffect = React.useEffect, useReducer = React.useReducer,
            useContext = React.useContext, useRef = React.useRef, useMemo = React.useMemo,
            useCallback = React.useCallback, useLayoutEffect = React.useLayoutEffect,
            useImperativeHandle = React.useImperativeHandle, createContext = React.createContext,
            memo = React.memo, forwardRef = React.forwardRef, Fragment = React.Fragment,
            Children = React.Children, cloneElement = React.cloneElement;

        var useRouter = function () {
          return { query: { id: '42' }, pathname: '/posts/42', asPath: '/posts/42', push: function () {}, replace: function () {}, back: function () {} };
        };
        function NextResponse(body, init) {
          if (!(this instanceof NextResponse)) return new NextResponse(body, init);
          this.body = body;
          this.status = (init && init.status) || 200;
        }
        NextResponse.json = function (data, init) {
          return { json: data, status: (init && init.status) || 200 };
        };

        try {
          ${escaped}
          var Comp = (typeof ${safeName} !== 'undefined') ? ${safeName} : null;
          if (Comp) {
            var root = ReactDOM.createRoot(document.getElementById('root'));
            root.render(React.createElement(Comp));
            post({ type: 'ready' });
          } else {
            var note = document.createElement('p');
            note.className = '__rp_empty';
            note.textContent = 'No preview — this challenge has no rendered component (e.g. an API route). Check the Tests tab.';
            document.getElementById('root').appendChild(note);
            post({ type: 'ready' });
          }
        } catch (err) {
          var msg = (err && err.message) || String(err);
          post({ type: 'console', level: 'error', args: [msg] });
          post({ type: 'crashed' });
        }
      })();
    </script>
  </body>
</html>`;
}

export function runChecks(code: string, checks: Check[]): CheckResult[] {
  return checks.map((c) => {
    let passed = false;
    try {
      passed = c.test(code);
    } catch {
      passed = false;
    }
    return { id: c.id, description: c.description, passed };
  });
}

export interface IframeMessage {
  type: "console" | "ready" | "crashed";
  level?: ConsoleEntry["level"];
  args?: string[];
}
