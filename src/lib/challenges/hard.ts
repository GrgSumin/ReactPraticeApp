import type { Challenge } from "@/types";
import { re } from "./helpers";

export const hardChallenges: Challenge[] = [
  {
    id: "h1-context-reducer",
    title: "Context + Reducer global store",
    difficulty: "hard",
    category: "useContext",
    description:
      "Combine `useReducer` with `useContext` to expose a global counter store. The Provider passes the `[state, dispatch]` tuple as its value; a deeply nested child reads and dispatches.",
    concepts: ["useContext", "useReducer", "Provider composition"],
    starterCode: `import React from "react";

// TODO: createContext + useReducer + Provider, with a child that dispatches

export default function App() {
  return <div>Counter goes here</div>;
}
`,
    solution: `import React, { createContext, useContext, useReducer } from "react";

const Ctx = createContext(null);

function reducer(state, action) {
  if (action.type === "INCREMENT") return { ...state, count: state.count + 1 };
  return state;
}

function useStore() {
  return useContext(Ctx);
}

function Child() {
  const [state, dispatch] = useStore();
  return (
    <button onClick={() => dispatch({ type: "INCREMENT" })}>
      {state.count}
    </button>
  );
}

export default function App() {
  const value = useReducer(reducer, { count: 0 });
  return (
    <Ctx.Provider value={value}>
      <Child />
    </Ctx.Provider>
  );
}
`,
    hint: "`useReducer` returns `[state, dispatch]`. Pass that whole tuple as the Provider's `value`.",
    checks: [
      re("createContext", "Uses createContext", /createContext/),
      re("useReducer", "Uses useReducer", /useReducer/),
      re("useContext", "Uses useContext", /useContext/),
      re("provider", "Renders Provider", /\.Provider/),
    ],
  },
  {
    id: "h2-usefetch",
    title: "useFetch(url) custom hook",
    difficulty: "hard",
    category: "Custom Hooks",
    description:
      "Implement `useFetch(url)` returning `{ data, loading, error }`. It must refetch when `url` changes and avoid updating state after unmount.",
    concepts: ["custom hooks", "useEffect", "cancellation"],
    starterCode: `import React from "react";

// TODO: implement useFetch(url)

export default function App() {
  // const { data, loading, error } = useFetch("/api/hello");
  return <p>Loading...</p>;
}
`,
    solution: `import React, { useState, useEffect } from "react";

function useFetch(url) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  useEffect(() => {
    let alive = true;
    setLoading(true);
    setError(null);
    fetch(url)
      .then((r) => r.json())
      .then((d) => { if (alive) setData(d); })
      .catch((e) => { if (alive) setError(e); })
      .finally(() => { if (alive) setLoading(false); });
    return () => { alive = false; };
  }, [url]);
  return { data, loading, error };
}

export default function App() {
  const { data, loading, error } = useFetch("/api/hello");
  if (loading) return <p>Loading...</p>;
  if (error) return <p>Error</p>;
  return <pre>{JSON.stringify(data)}</pre>;
}
`,
    hint: "Use an `alive` flag inside the effect; the cleanup sets it false so late responses are ignored.",
    checks: [
      re("hook", "Defines useFetch", /function\s+useFetch|const\s+useFetch/),
      re("triple", "Returns loading and error", /loading[\s\S]*error|error[\s\S]*loading/),
      re("fetch", "Calls fetch", /fetch\s*\(/),
      re("cancel", "Uses an alive/aborted flag", /alive|AbortController|cancelled/i),
    ],
    source: "bigfrontend.dev / Uber",
  },
  {
    id: "h3-optimistic",
    title: "Optimistic UI update",
    difficulty: "hard",
    category: "Patterns",
    description:
      "A Like button that increments the count immediately, then calls a fake API. If the call fails, roll back the count and surface an error.",
    concepts: ["optimistic updates", "rollback", "async error handling"],
    starterCode: `import React, { useState } from "react";

function fakeApi(success) {
  return new Promise((res, rej) => setTimeout(() => success ? res() : rej(), 400));
}

export default function Like() {
  return <button>♥ 0</button>;
}
`,
    solution: `import React, { useState } from "react";

function fakeApi(success) {
  return new Promise((res, rej) => setTimeout(() => success ? res() : rej(), 400));
}

export default function Like() {
  const [count, setCount] = useState(0);
  const [err, setErr] = useState(null);

  async function like() {
    setCount((c) => c + 1);
    setErr(null);
    try {
      await fakeApi(Math.random() > 0.5);
    } catch {
      setCount((c) => c - 1);
      setErr("Failed");
    }
  }

  return (
    <div>
      <button onClick={like}>♥ {count}</button>
      {err && <p style={{ color: "red" }}>{err}</p>}
    </div>
  );
}
`,
    hint: "Update first, then `try { await api } catch { revert + show error }`.",
    checks: [
      re("inc-first", "Optimistically increments first", /setCount\([^)]*\+\s*1/),
      re("catch", "Catches the error", /catch/),
      re("rollback", "Rolls back on error", /catch[\s\S]*setCount[\s\S]*-\s*1|c\s*-\s*1/),
    ],
    source: "Airbnb / Meta",
  },
  {
    id: "h4-tictactoe",
    title: "Tic-Tac-Toe",
    difficulty: "hard",
    category: "Games",
    description:
      "Build a 3×3 tic-tac-toe board. Detect wins, alternate X/O, show whose turn it is, and provide a Reset button.",
    concepts: ["array state", "immutable updates", "win detection"],
    starterCode: `import React, { useState } from "react";

export default function TicTacToe() {
  return <div>Grid goes here</div>;
}
`,
    solution: `import React, { useState } from "react";

const LINES = [
  [0,1,2],[3,4,5],[6,7,8],
  [0,3,6],[1,4,7],[2,5,8],
  [0,4,8],[2,4,6],
];

function winner(b) {
  for (const [a,c,d] of LINES) {
    if (b[a] && b[a] === b[c] && b[a] === b[d]) return b[a];
  }
  return null;
}

export default function TicTacToe() {
  const [board, setBoard] = useState(Array(9).fill(null));
  const [xTurn, setXTurn] = useState(true);
  const w = winner(board);
  function play(i) {
    if (board[i] || w) return;
    const copy = [...board];
    copy[i] = xTurn ? "X" : "O";
    setBoard(copy);
    setXTurn(!xTurn);
  }
  return (
    <div>
      <p>{w ? w + " wins" : "Turn: " + (xTurn ? "X" : "O")}</p>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 40px)" }}>
        {board.map((c, i) => (
          <button key={i} onClick={() => play(i)} style={{ height: 40 }}>{c}</button>
        ))}
      </div>
      <button onClick={() => { setBoard(Array(9).fill(null)); setXTurn(true); }}>Reset</button>
    </div>
  );
}
`,
    hint: "Hardcode the 8 winning lines and check each one after every move.",
    checks: [
      re("board", "Uses a 9-cell board", /Array\(9\)|Array\.from\([^)]*length\s*:\s*9/),
      re("win", "Has win detection", /winner|wins/i),
      re("reset", "Has reset", /Reset|Array\(9\)\.fill\(null\)/),
    ],
    source: "Airbnb / Meta",
  },
  {
    id: "h5-infinite-scroll",
    title: "Infinite scroll with IntersectionObserver",
    difficulty: "hard",
    category: "Patterns",
    description:
      "Render a scrollable list. When a sentinel element scrolls into view, append the next 20 items.",
    concepts: ["IntersectionObserver", "refs", "appending state"],
    starterCode: `import React, { useState, useEffect, useRef } from "react";

export default function Feed() {
  const [items, setItems] = useState(Array.from({ length: 20 }, (_, i) => i));
  return (
    <div style={{ height: 200, overflow: "auto" }}>
      {items.map((n) => <p key={n}>Row {n}</p>)}
    </div>
  );
}
`,
    solution: `import React, { useState, useEffect, useRef } from "react";

export default function Feed() {
  const [items, setItems] = useState(Array.from({ length: 20 }, (_, i) => i));
  const sentinel = useRef(null);
  useEffect(() => {
    const obs = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting) {
        setItems((cur) => [
          ...cur,
          ...Array.from({ length: 20 }, (_, i) => cur.length + i),
        ]);
      }
    });
    if (sentinel.current) obs.observe(sentinel.current);
    return () => obs.disconnect();
  }, []);
  return (
    <div style={{ height: 200, overflow: "auto" }}>
      {items.map((n) => <p key={n}>Row {n}</p>)}
      <div ref={sentinel} />
    </div>
  );
}
`,
    hint: "Place a `<div ref={sentinel} />` at the end and `obs.observe()` it. On intersection, append more.",
    checks: [
      re("io", "Uses IntersectionObserver", /IntersectionObserver/),
      re("ref", "Has a sentinel ref", /useRef/),
      re("disconnect", "Disconnects observer on cleanup", /disconnect\s*\(/),
    ],
    source: "Meta",
  },
  {
    id: "h6-autocomplete",
    title: "Type-ahead autocomplete",
    difficulty: "hard",
    category: "Patterns",
    description:
      "Build an autocomplete: typing filters a static fruit list (debounced 150ms), arrow keys move the active suggestion, Enter selects.",
    concepts: ["debouncing", "keyboard navigation", "controlled inputs"],
    starterCode: `import React, { useState, useEffect } from "react";

const fruits = ["apple","apricot","banana","blueberry","cherry","date","grape","mango","orange","peach"];

export default function Auto() {
  return (
    <div>
      <input />
      <ul></ul>
    </div>
  );
}
`,
    solution: `import React, { useState, useEffect } from "react";

const fruits = ["apple","apricot","banana","blueberry","cherry","date","grape","mango","orange","peach"];

function useDebounce(v, d) {
  const [x, setX] = useState(v);
  useEffect(() => {
    const t = setTimeout(() => setX(v), d);
    return () => clearTimeout(t);
  }, [v, d]);
  return x;
}

export default function Auto() {
  const [q, setQ] = useState("");
  const [active, setActive] = useState(0);
  const dq = useDebounce(q, 150);
  const matches = dq ? fruits.filter((f) => f.startsWith(dq.toLowerCase())) : [];
  function onKey(e) {
    if (e.key === "ArrowDown") setActive((a) => Math.min(matches.length - 1, a + 1));
    if (e.key === "ArrowUp") setActive((a) => Math.max(0, a - 1));
    if (e.key === "Enter" && matches[active]) {
      setQ(matches[active]);
    }
  }
  return (
    <div>
      <input
        value={q}
        onChange={(e) => { setQ(e.target.value); setActive(0); }}
        onKeyDown={onKey}
      />
      <ul style={{ listStyle: "none", padding: 0 }}>
        {matches.map((m, i) => (
          <li
            key={m}
            style={{
              padding: "2px 6px",
              background: i === active ? "#444" : "transparent",
              color: i === active ? "white" : "inherit",
            }}
          >
            {m}
          </li>
        ))}
      </ul>
    </div>
  );
}
`,
    hint: "Debounce the query, filter the list, then handle `ArrowDown`/`ArrowUp`/`Enter` in `onKeyDown`.",
    checks: [
      re("debounce", "Has debouncing logic", /setTimeout|useDebounce/),
      re("filter", "Filters the list", /\.filter\s*\(/),
      re("arrows", "Handles arrow keys", /ArrowDown|ArrowUp/),
      re("enter", "Handles Enter to select", /Enter/),
    ],
    source: "Uber",
  },
  {
    id: "h7-nested-comments",
    title: "Nested comments thread",
    difficulty: "hard",
    category: "Patterns",
    description:
      "Render a recursive comment tree. Each node has a reply input; submitting adds a child comment. Updates must be immutable.",
    concepts: ["recursion", "immutable tree updates"],
    starterCode: `import React, { useState } from "react";

const seed = { id: 1, text: "Root", replies: [{ id: 2, text: "Child", replies: [] }] };

export default function App() {
  // TODO: recursive Comment component + reply handler
  return <div>Comments</div>;
}
`,
    solution: `import React, { useState } from "react";

const seed = { id: 1, text: "Root", replies: [{ id: 2, text: "Child", replies: [] }] };

function Comment({ node, onReply }) {
  const [draft, setDraft] = useState("");
  return (
    <div style={{ marginLeft: 16, marginTop: 4 }}>
      <p style={{ margin: 0 }}>{node.text}</p>
      <input
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        placeholder="reply..."
      />
      <button onClick={() => { onReply(node.id, draft); setDraft(""); }}>
        Reply
      </button>
      {node.replies.map((r) => (
        <Comment key={r.id} node={r} onReply={onReply} />
      ))}
    </div>
  );
}

export default function App() {
  const [tree, setTree] = useState(seed);
  function reply(parentId, text) {
    if (!text) return;
    function go(n) {
      if (n.id === parentId) {
        return { ...n, replies: [...n.replies, { id: Date.now(), text, replies: [] }] };
      }
      return { ...n, replies: n.replies.map(go) };
    }
    setTree(go(tree));
  }
  return <Comment node={tree} onReply={reply} />;
}
`,
    hint: "Write a pure `go(node)` that returns either the patched node or recursively-mapped children. Never mutate.",
    checks: [
      re("recursive", "Comment renders Comment recursively", /Comment[\s\S]*Comment/),
      re("spread", "Uses spread for immutability", /\.\.\.\w+/),
      re("map-replies", "Maps over replies", /replies\.map/),
    ],
    source: "Reddit / Meta",
  },
  {
    id: "h8-file-explorer",
    title: "File explorer tree",
    difficulty: "hard",
    category: "Patterns",
    description:
      "Render a recursive folder/file tree. Folders are clickable to expand/collapse children. Files have a 📄 icon, folders 📂/📁.",
    concepts: ["recursion", "useState per node"],
    starterCode: `import React, { useState } from "react";

const tree = {
  name: "root",
  type: "folder",
  children: [
    { name: "src", type: "folder", children: [
      { name: "index.js", type: "file" },
      { name: "App.js", type: "file" },
    ]},
    { name: "package.json", type: "file" },
  ],
};

export default function App() {
  return <pre>tree goes here</pre>;
}
`,
    solution: `import React, { useState } from "react";

const tree = {
  name: "root",
  type: "folder",
  children: [
    { name: "src", type: "folder", children: [
      { name: "index.js", type: "file" },
      { name: "App.js", type: "file" },
    ]},
    { name: "package.json", type: "file" },
  ],
};

function Node({ node }) {
  const [open, setOpen] = useState(true);
  if (node.type === "file") return <li>📄 {node.name}</li>;
  return (
    <li>
      <span
        onClick={() => setOpen(!open)}
        style={{ cursor: "pointer", userSelect: "none" }}
      >
        {open ? "📂" : "📁"} {node.name}
      </span>
      {open && (
        <ul>
          {node.children.map((c) => (
            <Node key={c.name} node={c} />
          ))}
        </ul>
      )}
    </li>
  );
}

export default function App() {
  return <ul><Node node={tree} /></ul>;
}
`,
    hint: "Each `Node` keeps its own `open` state. Files terminate the recursion.",
    checks: [
      re("recursive", "Defines a recursive Node", /Node[\s\S]*Node/),
      re("toggle", "Toggles open state", /useState\s*\(\s*(true|false)\s*\)/),
      re("file-folder", "Distinguishes file vs folder", /file|folder/),
    ],
    source: "GreatFrontEnd",
  },
  {
    id: "h9-drag-drop",
    title: "Drag-and-drop reorderable list",
    difficulty: "hard",
    category: "Patterns",
    description:
      "A reorderable list using HTML5 drag-and-drop. Dragging an item over another reorders the array on drop.",
    concepts: ["drag events", "splice", "preventDefault"],
    starterCode: `import React, { useState } from "react";

export default function App() {
  const [items] = useState(["A","B","C","D"]);
  return (
    <ul>
      {items.map((it) => <li key={it}>{it}</li>)}
    </ul>
  );
}
`,
    solution: `import React, { useState } from "react";

export default function App() {
  const [items, setItems] = useState(["A","B","C","D"]);
  const [dragIdx, setDragIdx] = useState(null);
  function onDrop(targetIdx) {
    if (dragIdx === null || dragIdx === targetIdx) return;
    const copy = [...items];
    const [moved] = copy.splice(dragIdx, 1);
    copy.splice(targetIdx, 0, moved);
    setItems(copy);
    setDragIdx(null);
  }
  return (
    <ul style={{ listStyle: "none", padding: 0 }}>
      {items.map((it, i) => (
        <li
          key={it}
          draggable
          onDragStart={() => setDragIdx(i)}
          onDragOver={(e) => e.preventDefault()}
          onDrop={() => onDrop(i)}
          style={{
            padding: 8, border: "1px solid #444", margin: 4, cursor: "move",
          }}
        >
          {it}
        </li>
      ))}
    </ul>
  );
}
`,
    hint: "`onDragOver` must call `e.preventDefault()` or `onDrop` will never fire.",
    checks: [
      re("draggable", "Marks items draggable", /draggable/),
      re("dragStart", "Tracks drag start", /onDragStart/),
      re("drop", "Has drop handler", /onDrop/),
      re("preventDefault", "preventDefault in dragOver", /preventDefault/),
    ],
    source: "Uber / Airbnb",
  },
  {
    id: "h10-memory-game",
    title: "Memory match game",
    difficulty: "hard",
    category: "Games",
    description:
      "8 face-down cards (4 pairs). Click to flip; two non-matching cards flip back after ~700ms. Matched cards stay open.",
    concepts: ["useEffect", "array shuffling", "side effects on state changes"],
    starterCode: `import React, { useState } from "react";

const pairs = ["🐶","🐱","🦊","🐼"];

export default function Memory() {
  return <div>Grid goes here</div>;
}
`,
    solution: `import React, { useState, useEffect } from "react";

const pairs = ["🐶","🐱","🦊","🐼"];

const init = () =>
  [...pairs, ...pairs]
    .sort(() => Math.random() - 0.5)
    .map((emoji, i) => ({ id: i, emoji, open: false, done: false }));

export default function Memory() {
  const [cards, setCards] = useState(init);
  const [picks, setPicks] = useState([]);
  useEffect(() => {
    if (picks.length === 2) {
      const [a, b] = picks;
      if (cards[a].emoji === cards[b].emoji) {
        setCards((cs) =>
          cs.map((c, i) => (i === a || i === b ? { ...c, done: true } : c)),
        );
      }
      const t = setTimeout(() => {
        setCards((cs) => cs.map((c) => (c.done ? c : { ...c, open: false })));
        setPicks([]);
      }, 700);
      return () => clearTimeout(t);
    }
  }, [picks]);

  function flip(i) {
    if (cards[i].open || picks.length === 2) return;
    setCards((cs) => cs.map((c, idx) => (idx === i ? { ...c, open: true } : c)));
    setPicks((p) => [...p, i]);
  }

  return (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 40px)", gap: 4 }}>
      {cards.map((c, i) => (
        <button key={c.id} onClick={() => flip(i)} style={{ height: 40 }}>
          {c.open ? c.emoji : "?"}
        </button>
      ))}
    </div>
  );
}
`,
    hint: "Track `picks` (indexes). When length is 2, mark `done` if matching, then close non-matched after a timeout.",
    checks: [
      re("picks", "Tracks picks array", /useState\s*\(\s*\[\s*\]/),
      re("two", "Compares when 2 picked", /picks\.length\s*===?\s*2|length\s*===?\s*2/),
      re("done", "Marks matched as done", /done/),
    ],
    source: "GreatFrontEnd",
  },
  {
    id: "h11-shopping-cart",
    title: "Shopping cart",
    difficulty: "hard",
    category: "Patterns",
    description:
      "Three products. + and − buttons adjust each item's quantity; quantity 0 removes it from the cart. Total updates live.",
    concepts: ["object state", "immutable updates", "derived totals"],
    starterCode: `import React, { useState } from "react";

const products = [
  { id: 1, name: "Apple", price: 2 },
  { id: 2, name: "Bread", price: 5 },
  { id: 3, name: "Cheese", price: 8 },
];

export default function Cart() {
  return <div>Cart UI</div>;
}
`,
    solution: `import React, { useState } from "react";

const products = [
  { id: 1, name: "Apple", price: 2 },
  { id: 2, name: "Bread", price: 5 },
  { id: 3, name: "Cheese", price: 8 },
];

export default function Cart() {
  const [cart, setCart] = useState({});
  function add(id) {
    setCart((c) => ({ ...c, [id]: (c[id] || 0) + 1 }));
  }
  function remove(id) {
    setCart((c) => {
      const n = { ...c, [id]: (c[id] || 0) - 1 };
      if (n[id] <= 0) delete n[id];
      return n;
    });
  }
  const total = Object.entries(cart).reduce(
    (acc, [id, qty]) => acc + products.find((p) => p.id === Number(id)).price * qty,
    0,
  );
  return (
    <div>
      {products.map((p) => (
        <div key={p.id}>
          {p.name} \${p.price}
          <button onClick={() => add(p.id)}>+</button>
          <button onClick={() => remove(p.id)}>−</button>
          <span> qty: {cart[p.id] || 0}</span>
        </div>
      ))}
      <p>Total: \${total}</p>
    </div>
  );
}
`,
    hint: "Store `cart` as a `{ [productId]: qty }` object. Use `Object.entries` + `reduce` for the total.",
    checks: [
      re("state", "Has cart state", /useState/),
      re("ops", "Defines add/remove", /add|remove/i),
      re("total", "Computes a total", /total/i),
      re("reduce", "Uses reduce or sum", /\.reduce\s*\(/),
    ],
    source: "Airbnb / Stripe",
  },
  {
    id: "h12-wizard",
    title: "Multi-step form wizard",
    difficulty: "hard",
    category: "Forms",
    description:
      "Three-step wizard: name → email → review. Next disabled until the current step is valid; Back disabled on first step.",
    concepts: ["step machine", "per-step validation", "shared form data"],
    starterCode: `import React, { useState } from "react";

export default function Wizard() {
  return <div>Wizard goes here</div>;
}
`,
    solution: `import React, { useState } from "react";

export default function Wizard() {
  const [step, setStep] = useState(0);
  const [data, setData] = useState({ name: "", email: "" });
  const valid =
    step === 0 ? data.name.length > 0 :
    step === 1 ? /@/.test(data.email) :
    true;
  return (
    <div>
      {step === 0 && (
        <input
          placeholder="Name"
          value={data.name}
          onChange={(e) => setData({ ...data, name: e.target.value })}
        />
      )}
      {step === 1 && (
        <input
          placeholder="Email"
          value={data.email}
          onChange={(e) => setData({ ...data, email: e.target.value })}
        />
      )}
      {step === 2 && <pre>{JSON.stringify(data, null, 2)}</pre>}
      <div style={{ marginTop: 8 }}>
        <button onClick={() => setStep((s) => s - 1)} disabled={step === 0}>Back</button>
        <button onClick={() => setStep((s) => s + 1)} disabled={!valid || step === 2}>Next</button>
      </div>
      <p>Step {step + 1} of 3</p>
    </div>
  );
}
`,
    hint: "Compute `valid` from the current step and the form data; pipe it into the Next button's `disabled`.",
    checks: [
      re("step", "Tracks current step", /useState\s*\(\s*0/),
      re("valid", "Validates per step", /valid/i),
      re("nav", "Has Next and Back", /Next[\s\S]*Back|Back[\s\S]*Next/),
    ],
  },
  {
    id: "h13-compound",
    title: "Compound components (Tabs.Tab + Tabs.Panel)",
    difficulty: "hard",
    category: "Patterns",
    description:
      "Implement Tabs as a compound component. Consumers compose `<Tabs><Tabs.List>...</Tabs.List><Tabs.Panel index={0}>...</Tabs.Panel></Tabs>`. State is shared via context.",
    concepts: ["compound components", "context", "named children"],
    starterCode: `import React from "react";

// TODO: implement Tabs, Tabs.List, Tabs.Tab, Tabs.Panel

export default function App() {
  return <div>Tabs go here</div>;
}
`,
    solution: `import React, { createContext, useContext, useState } from "react";

const Ctx = createContext(null);

function Tabs({ children, defaultIndex = 0 }) {
  const [active, setActive] = useState(defaultIndex);
  return <Ctx.Provider value={{ active, setActive }}>{children}</Ctx.Provider>;
}

Tabs.List = function List({ children }) {
  return <div>{children}</div>;
};

Tabs.Tab = function Tab({ index, children }) {
  const { active, setActive } = useContext(Ctx);
  return (
    <button
      onClick={() => setActive(index)}
      style={{ fontWeight: active === index ? "bold" : "normal" }}
    >
      {children}
    </button>
  );
};

Tabs.Panel = function Panel({ index, children }) {
  const { active } = useContext(Ctx);
  return active === index ? <div>{children}</div> : null;
};

export default function App() {
  return (
    <Tabs>
      <Tabs.List>
        <Tabs.Tab index={0}>One</Tabs.Tab>
        <Tabs.Tab index={1}>Two</Tabs.Tab>
      </Tabs.List>
      <Tabs.Panel index={0}>Panel one</Tabs.Panel>
      <Tabs.Panel index={1}>Panel two</Tabs.Panel>
    </Tabs>
  );
}
`,
    hint: "Attach `Tab` and `Panel` as static properties of `Tabs`. Share state via `createContext`.",
    checks: [
      re("tab", "Has Tabs.Tab static", /Tabs\.Tab\b/),
      re("panel", "Has Tabs.Panel static", /Tabs\.Panel\b/),
      re("context", "Uses context to share state", /useContext|createContext/),
    ],
    source: "Kent C. Dodds / GreatFrontEnd",
  },
  {
    id: "h14-render-props",
    title: "Render props (Toggle)",
    difficulty: "hard",
    category: "Patterns",
    description:
      "Implement `<Toggle>{({ on, toggle }) => ...}</Toggle>` — the component manages a boolean and renders `children` as a function.",
    concepts: ["render props", "functions as children"],
    starterCode: `import React from "react";

// TODO: Toggle that calls children as a function

export default function App() {
  return <div>Render prop goes here</div>;
}
`,
    solution: `import React, { useState } from "react";

function Toggle({ children }) {
  const [on, setOn] = useState(false);
  return children({ on, toggle: () => setOn((p) => !p) });
}

export default function App() {
  return (
    <Toggle>
      {({ on, toggle }) => (
        <button onClick={toggle}>{on ? "ON" : "OFF"}</button>
      )}
    </Toggle>
  );
}
`,
    hint: "Return `children({ on, toggle })`. Consumers pass a function as children, not JSX.",
    checks: [
      re("call", "Calls children as a function", /children\s*\(/),
      re("toggle", "Component is named Toggle", /function\s+Toggle|const\s+Toggle\s*=/),
      re("fn-children", "Children is a function", /\{[^}]*\}\s*=>\s*\(/),
    ],
  },
  {
    id: "h15-click-outside",
    title: "useOnClickOutside hook",
    difficulty: "hard",
    category: "Custom Hooks",
    description:
      "Implement `useOnClickOutside(ref, handler)`. Clicking anywhere outside the ref'd element invokes `handler`.",
    concepts: ["custom hooks", "document events", "node.contains"],
    starterCode: `import React, { useState, useRef } from "react";

// TODO: implement useOnClickOutside(ref, handler)

export default function App() {
  const [open, setOpen] = useState(true);
  const ref = useRef(null);
  // useOnClickOutside(ref, () => setOpen(false));
  return (
    <div>
      <button onClick={() => setOpen(true)}>Open</button>
      {open && <div ref={ref} style={{ border: "1px solid #555", padding: 16, marginTop: 8 }}>Click outside to close</div>}
    </div>
  );
}
`,
    solution: `import React, { useState, useRef, useEffect } from "react";

function useOnClickOutside(ref, handler) {
  useEffect(() => {
    function listener(e) {
      if (!ref.current || ref.current.contains(e.target)) return;
      handler(e);
    }
    document.addEventListener("mousedown", listener);
    return () => document.removeEventListener("mousedown", listener);
  }, [ref, handler]);
}

export default function App() {
  const [open, setOpen] = useState(true);
  const ref = useRef(null);
  useOnClickOutside(ref, () => setOpen(false));
  return (
    <div>
      <button onClick={() => setOpen(true)}>Open</button>
      {open && (
        <div
          ref={ref}
          style={{ border: "1px solid #555", padding: 16, marginTop: 8 }}
        >
          Click outside to close
        </div>
      )}
    </div>
  );
}
`,
    hint: "Listen for `mousedown` on `document`. If the event target is not inside `ref.current`, run `handler`.",
    checks: [
      re("hook", "Defines useOnClickOutside", /function\s+useOnClickOutside|const\s+useOnClickOutside/),
      re("contains", "Uses .contains() on the ref", /\.contains\s*\(/),
      re("listener", "Adds a mousedown listener", /mousedown/),
      re("cleanup", "Removes the listener on cleanup", /removeEventListener/),
    ],
    source: "bigfrontend.dev",
  },
];
