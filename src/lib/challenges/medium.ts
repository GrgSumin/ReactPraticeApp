import type { Challenge } from "@/types";
import { re } from "./helpers";

export const mediumChallenges: Challenge[] = [
  {
    id: "m1-usecontext",
    title: "useContext theme",
    difficulty: "medium",
    category: "useContext",
    description:
      "Create a `ThemeContext` whose value is `\"dark\"`. Wrap a child with `<ThemeContext.Provider>` and read the value in the child with `useContext`.",
    concepts: ["createContext", "Provider", "useContext"],
    starterCode: `import React, { createContext, useContext } from "react";

// TODO: create ThemeContext, Provider wrapping <Child />, useContext in Child

function Child() {
  return <p>theme: ?</p>;
}

export default function App() {
  return <Child />;
}
`,
    solution: `import React, { createContext, useContext } from "react";

const ThemeContext = createContext("dark");

function Child() {
  const theme = useContext(ThemeContext);
  return <p>theme: {theme}</p>;
}

export default function App() {
  return (
    <ThemeContext.Provider value="dark">
      <Child />
    </ThemeContext.Provider>
  );
}
`,
    hint: "`createContext(default)` makes the context object, then wrap with `<Ctx.Provider value=...>`.",
    checks: [
      re("create", "Calls createContext", /createContext/),
      re("provider", "Renders a Provider", /\.Provider/),
      re("use", "Reads value with useContext", /useContext\s*\(/),
    ],
  },
  {
    id: "m2-todo-reducer",
    title: "useReducer todo list",
    difficulty: "medium",
    category: "useReducer",
    description:
      "Implement an immutable todo reducer handling `ADD_TODO` (append) and `REMOVE_TODO` (filter). State is an array of `{ id, text }`.",
    concepts: ["useReducer", "immutability", "actions"],
    starterCode: `import React, { useReducer } from "react";

function reducer(state, action) {
  // TODO: handle ADD_TODO and REMOVE_TODO
  return state;
}

export default function Todos() {
  const [todos, dispatch] = useReducer(reducer, []);
  return (
    <div>
      <button onClick={() => dispatch({ type: "ADD_TODO", text: "New" })}>Add</button>
      <ul>
        {todos.map((t) => (
          <li key={t.id}>
            {t.text}{" "}
            <button onClick={() => dispatch({ type: "REMOVE_TODO", id: t.id })}>×</button>
          </li>
        ))}
      </ul>
    </div>
  );
}
`,
    solution: `import React, { useReducer } from "react";

function reducer(state, action) {
  switch (action.type) {
    case "ADD_TODO":
      return [...state, { id: Date.now(), text: action.text }];
    case "REMOVE_TODO":
      return state.filter((t) => t.id !== action.id);
    default:
      return state;
  }
}

export default function Todos() {
  const [todos, dispatch] = useReducer(reducer, []);
  return (
    <div>
      <button onClick={() => dispatch({ type: "ADD_TODO", text: "New" })}>Add</button>
      <ul>
        {todos.map((t) => (
          <li key={t.id}>
            {t.text}{" "}
            <button onClick={() => dispatch({ type: "REMOVE_TODO", id: t.id })}>×</button>
          </li>
        ))}
      </ul>
    </div>
  );
}
`,
    hint: "Spread for add, filter for remove. Never mutate `state` directly.",
    checks: [
      re("useReducer", "Uses useReducer", /useReducer/),
      re("add", "Handles ADD_TODO", /ADD_TODO/),
      re("remove", "Handles REMOVE_TODO", /REMOVE_TODO/),
      re("immutable", "Uses spread or filter (immutable)", /\.\.\.state|\.filter\s*\(/),
    ],
  },
  {
    id: "m3-uselocalstorage",
    title: "useLocalStorage custom hook",
    difficulty: "medium",
    category: "Custom Hooks",
    description:
      "Write `useLocalStorage(key, initial)` that returns `[value, setValue]`, reads the initial value from `localStorage`, and writes on every change.",
    concepts: ["custom hooks", "useEffect", "localStorage"],
    starterCode: `import React, { useState, useEffect } from "react";

// TODO: implement useLocalStorage

export default function App() {
  const [name, setName] = useState("");
  return <input value={name} onChange={(e) => setName(e.target.value)} />;
}
`,
    solution: `import React, { useState, useEffect } from "react";

function useLocalStorage(key, initial) {
  const [value, setValue] = useState(() => {
    try {
      const raw = localStorage.getItem(key);
      return raw !== null ? JSON.parse(raw) : initial;
    } catch {
      return initial;
    }
  });
  useEffect(() => {
    localStorage.setItem(key, JSON.stringify(value));
  }, [key, value]);
  return [value, setValue];
}

export default function App() {
  const [name, setName] = useLocalStorage("name", "");
  return <input value={name} onChange={(e) => setName(e.target.value)} />;
}
`,
    hint: "Use a lazy initializer for `useState` (`useState(() => ...)`) and a `useEffect` that depends on `[key, value]`.",
    checks: [
      re("hook", "Defines useLocalStorage", /function\s+useLocalStorage|const\s+useLocalStorage\s*=/),
      re("get", "Reads via localStorage.getItem", /localStorage\.getItem/),
      re("set", "Writes via localStorage.setItem", /localStorage\.setItem/),
      re("effect", "Persists in useEffect", /useEffect/),
    ],
    source: "bigfrontend.dev",
  },
  {
    id: "m4-usememo",
    title: "useMemo expensive sum",
    difficulty: "medium",
    category: "useMemo/useCallback",
    description:
      "Memoize the sum of `nums` so it only recomputes when `nums` changes. A re-render button should NOT cause recomputation.",
    concepts: ["useMemo", "dependency array", "memoization"],
    starterCode: `import React, { useState } from "react";

export default function Expensive() {
  const [nums] = useState([1, 2, 3, 4, 5]);
  const [, setTick] = useState(0);
  // TODO: memoize the total
  const total = nums.reduce((a, b) => a + b, 0);
  return (
    <div>
      <p>Total: {total}</p>
      <button onClick={() => setTick((r) => r + 1)}>Re-render</button>
    </div>
  );
}
`,
    solution: `import React, { useState, useMemo } from "react";

export default function Expensive() {
  const [nums] = useState([1, 2, 3, 4, 5]);
  const [, setTick] = useState(0);
  const total = useMemo(() => nums.reduce((a, b) => a + b, 0), [nums]);
  return (
    <div>
      <p>Total: {total}</p>
      <button onClick={() => setTick((r) => r + 1)}>Re-render</button>
    </div>
  );
}
`,
    hint: "`useMemo(() => compute(), [dep])` — the dep is what your computation depends on.",
    checks: [
      re("useMemo", "Calls useMemo", /useMemo\s*\(/),
      re("deps", "Has dependency array", /useMemo\s*\([\s\S]+?,\s*\[/),
    ],
  },
  {
    id: "m5-usecallback",
    title: "useCallback with memo'd child",
    difficulty: "medium",
    category: "useMemo/useCallback",
    description:
      "Wrap the click handler in `useCallback` and the child in `React.memo` so the child doesn't re-render when the parent re-renders for unrelated reasons.",
    concepts: ["useCallback", "React.memo", "referential stability"],
    starterCode: `import React, { useState } from "react";

const Child = ({ onClick }) => {
  console.log("Child render");
  return <button onClick={onClick}>Click</button>;
};

export default function App() {
  const [count, setCount] = useState(0);
  const handle = () => setCount((c) => c + 1);
  return (
    <div>
      <p>{count}</p>
      <Child onClick={handle} />
    </div>
  );
}
`,
    solution: `import React, { useCallback, useState, memo } from "react";

const Child = memo(({ onClick }) => {
  console.log("Child render");
  return <button onClick={onClick}>Click</button>;
});

export default function App() {
  const [count, setCount] = useState(0);
  const handle = useCallback(() => setCount((c) => c + 1), []);
  return (
    <div>
      <p>{count}</p>
      <Child onClick={handle} />
    </div>
  );
}
`,
    hint: "`useCallback(fn, [])` keeps the same function reference across renders.",
    checks: [
      re("useCallback", "Uses useCallback", /useCallback/),
      re("memo", "Wraps child with memo", /\bmemo\s*\(/),
    ],
  },
  {
    id: "m6-dynamic-route",
    title: "Dynamic route [id]",
    difficulty: "medium",
    category: "Dynamic Routing",
    description:
      "Inside `pages/posts/[id].js`, use `useRouter` from `next/router` to read `id` from `router.query` and render `Post {id}`.",
    concepts: ["Next.js", "useRouter", "dynamic segments"],
    starterCode: `import { useRouter } from "next/router";

export default function Page() {
  // TODO: read id from router.query
  return <div>Post ?</div>;
}
`,
    solution: `import { useRouter } from "next/router";

export default function Page() {
  const router = useRouter();
  const { id } = router.query;
  return <div>Post {id}</div>;
}
`,
    hint: "`const router = useRouter(); const { id } = router.query;`",
    checks: [
      re("import", "Imports useRouter", /useRouter/),
      re("call", "Calls useRouter()", /useRouter\s*\(\s*\)/),
      re("query", "Reads id from query", /(query\.id|router\.query|\{\s*id\s*\}\s*=)/),
    ],
  },
  {
    id: "m7-fetch-loading-error",
    title: "Data fetching with loading & error",
    difficulty: "medium",
    category: "useEffect",
    description:
      "Fetch `/api/hello` on mount. Show \"Loading...\" while pending, an error message on failure, and the JSON on success.",
    concepts: ["useEffect", "fetch", "loading/error states"],
    starterCode: `import React, { useEffect, useState } from "react";

export default function App() {
  // TODO: fetch /api/hello and track loading/data/error
  return <p>Loading...</p>;
}
`,
    solution: `import React, { useEffect, useState } from "react";

export default function App() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetch("/api/hello")
      .then((r) => r.json())
      .then(setData)
      .catch(setError)
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <p>Loading...</p>;
  if (error) return <p>Error</p>;
  return <pre>{JSON.stringify(data)}</pre>;
}
`,
    hint: "Three pieces of state: data, loading, error. Chain `.then().catch().finally()`.",
    checks: [
      re("loading", "Tracks loading state", /loading/i),
      re("error", "Tracks error state", /error/i),
      re("fetch", "Calls fetch", /fetch\s*\(/),
      re("effect", "Fetches in useEffect", /useEffect/),
    ],
    source: "Airbnb",
  },
  {
    id: "m8-form-validation",
    title: "Form with email validation",
    difficulty: "medium",
    category: "Forms",
    description:
      "Email input with format validation. Show an inline error when invalid (and not empty), and disable Submit until valid.",
    concepts: ["controlled inputs", "derived validation", "disabled"],
    starterCode: `import React, { useState } from "react";

export default function Form() {
  return (
    <form>
      <input />
      <button>Submit</button>
    </form>
  );
}
`,
    solution: `import React, { useState } from "react";

export default function Form() {
  const [email, setEmail] = useState("");
  const valid = /^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$/.test(email);
  return (
    <form onSubmit={(e) => e.preventDefault()}>
      <input value={email} onChange={(e) => setEmail(e.target.value)} />
      {!valid && email.length > 0 && (
        <p style={{ color: "red" }}>Invalid email</p>
      )}
      <button disabled={!valid}>Submit</button>
    </form>
  );
}
`,
    hint: "Derive `valid` from a regex test of the email value. Use it for the error and the `disabled` attribute.",
    checks: [
      re("email-at", "Uses an @ check or regex", /@/),
      re("disabled", "Disables submit when invalid", /disabled\s*=/),
      re("error-msg", "Shows error message", /Invalid|error/i),
    ],
  },
  {
    id: "m9-useref-focus",
    title: "useRef to focus an input",
    difficulty: "medium",
    category: "useState",
    description:
      "Click the button to focus the input using `ref.current.focus()`.",
    concepts: ["useRef", "DOM refs"],
    starterCode: `import React, { useRef } from "react";

export default function App() {
  return (
    <div>
      <input />
      <button>Focus</button>
    </div>
  );
}
`,
    solution: `import React, { useRef } from "react";

export default function App() {
  const ref = useRef(null);
  return (
    <div>
      <input ref={ref} />
      <button onClick={() => ref.current.focus()}>Focus</button>
    </div>
  );
}
`,
    hint: "Create a ref with `useRef(null)`, attach via `ref={ref}`, and call `ref.current.focus()`.",
    checks: [
      re("useRef", "Uses useRef", /useRef/),
      re("focus", "Calls .focus()", /\.focus\s*\(/),
      re("current", "Reads .current", /\.current/),
    ],
  },
  {
    id: "m10-star-rating",
    title: "Star rating widget",
    difficulty: "medium",
    category: "UI Components",
    description:
      "Render 5 stars. Hovering previews a rating; clicking sets it. Leaving the row reverts the preview to the selected rating.",
    concepts: ["useState", "onMouseEnter/Leave", "derived display"],
    starterCode: `import React, { useState } from "react";

export default function StarRating() {
  return (
    <div>
      {[1, 2, 3, 4, 5].map((n) => (
        <span key={n} style={{ fontSize: 32 }}>★</span>
      ))}
    </div>
  );
}
`,
    solution: `import React, { useState } from "react";

export default function StarRating() {
  const [rating, setRating] = useState(0);
  const [hover, setHover] = useState(0);
  const display = hover || rating;
  return (
    <div>
      {[1, 2, 3, 4, 5].map((n) => (
        <span
          key={n}
          onClick={() => setRating(n)}
          onMouseEnter={() => setHover(n)}
          onMouseLeave={() => setHover(0)}
          style={{
            cursor: "pointer",
            fontSize: 32,
            color: n <= display ? "gold" : "#555",
          }}
        >
          ★
        </span>
      ))}
      <p>{rating}/5</p>
    </div>
  );
}
`,
    hint: "Track `rating` and `hover` separately; the displayed value is `hover || rating`.",
    checks: [
      re("rating", "Has rating state", /rating/i),
      re("enter", "Has onMouseEnter", /onMouseEnter/),
      re("leave", "Has onMouseLeave", /onMouseLeave/),
      re("click", "Click sets rating", /onClick/),
      re("five", "Renders 5 stars", /\[\s*1,\s*2,\s*3,\s*4,\s*5\s*\]|Array.*5/),
    ],
    source: "GreatFrontEnd / Airbnb",
  },
  {
    id: "m11-debounced-search",
    title: "Debounced search input",
    difficulty: "medium",
    category: "Custom Hooks",
    description:
      "Write a `useDebounce(value, delay)` hook and use it to derive a debounced search query. The debounced value updates 300ms after typing stops.",
    concepts: ["custom hooks", "setTimeout", "cleanup"],
    starterCode: `import React, { useState, useEffect } from "react";

// TODO: implement useDebounce(value, delay)

export default function Search() {
  const [q, setQ] = useState("");
  const dq = q; // replace with debounced
  return (
    <div>
      <input value={q} onChange={(e) => setQ(e.target.value)} />
      <p>Searching: {dq}</p>
    </div>
  );
}
`,
    solution: `import React, { useState, useEffect } from "react";

function useDebounce(value, delay) {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(t);
  }, [value, delay]);
  return debounced;
}

export default function Search() {
  const [q, setQ] = useState("");
  const dq = useDebounce(q, 300);
  return (
    <div>
      <input value={q} onChange={(e) => setQ(e.target.value)} />
      <p>Searching: {dq}</p>
    </div>
  );
}
`,
    hint: "Schedule a `setTimeout` in `useEffect` and clear it in the cleanup.",
    checks: [
      re("hook", "Defines useDebounce", /function\s+useDebounce|const\s+useDebounce/),
      re("timeout", "Uses setTimeout", /setTimeout/),
      re("clear", "Cleans up clearTimeout", /clearTimeout/),
    ],
    source: "bigfrontend.dev",
  },
  {
    id: "m12-pagination",
    title: "Pagination",
    difficulty: "medium",
    category: "UI Components",
    description:
      "Given 25 items, show 5 per page. Prev/Next buttons navigate pages; disable at boundaries; show `page / total`.",
    concepts: ["useState", "slice", "boundaries"],
    starterCode: `import React, { useState } from "react";

const items = Array.from({ length: 25 }, (_, i) => "Item " + (i + 1));
const PER_PAGE = 5;

export default function Pager() {
  return (
    <div>
      <ul>{items.slice(0, PER_PAGE).map((x) => <li key={x}>{x}</li>)}</ul>
      <button>Prev</button>
      <button>Next</button>
    </div>
  );
}
`,
    solution: `import React, { useState } from "react";

const items = Array.from({ length: 25 }, (_, i) => "Item " + (i + 1));
const PER_PAGE = 5;

export default function Pager() {
  const [page, setPage] = useState(0);
  const pages = Math.ceil(items.length / PER_PAGE);
  const slice = items.slice(page * PER_PAGE, (page + 1) * PER_PAGE);
  return (
    <div>
      <ul>{slice.map((x) => <li key={x}>{x}</li>)}</ul>
      <button
        onClick={() => setPage((p) => Math.max(0, p - 1))}
        disabled={page === 0}
      >
        Prev
      </button>
      <span> {page + 1} / {pages} </span>
      <button
        onClick={() => setPage((p) => Math.min(pages - 1, p + 1))}
        disabled={page === pages - 1}
      >
        Next
      </button>
    </div>
  );
}
`,
    hint: "Slice by `[page*PER_PAGE, (page+1)*PER_PAGE]` and clamp with `Math.max`/`Math.min`.",
    checks: [
      re("page-state", "Tracks page in state", /useState\s*\(\s*0/),
      re("slice", "Uses Array.slice", /\.slice\s*\(/),
      re("disabled", "Disables at boundary", /disabled\s*=/),
    ],
  },
  {
    id: "m13-modal",
    title: "Modal with ESC and backdrop close",
    difficulty: "medium",
    category: "UI Components",
    description:
      "Modal that opens on button click. Pressing ESC or clicking the backdrop closes it. Clicking inside the dialog should NOT close it.",
    concepts: ["useEffect", "keyboard events", "event.stopPropagation"],
    starterCode: `import React, { useState, useEffect } from "react";

export default function App() {
  const [open, setOpen] = useState(false);
  return (
    <div>
      <button onClick={() => setOpen(true)}>Open</button>
    </div>
  );
}
`,
    solution: `import React, { useState, useEffect } from "react";

export default function App() {
  const [open, setOpen] = useState(false);
  useEffect(() => {
    function onKey(e) { if (e.key === "Escape") setOpen(false); }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);
  return (
    <div>
      <button onClick={() => setOpen(true)}>Open</button>
      {open && (
        <div
          onClick={() => setOpen(false)}
          style={{
            position: "fixed", inset: 0, background: "rgba(0,0,0,.5)",
            display: "flex", alignItems: "center", justifyContent: "center",
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              background: "white", color: "#111",
              padding: 24, borderRadius: 8, minWidth: 220,
            }}
          >
            <p>Modal content</p>
            <button onClick={() => setOpen(false)}>Close</button>
          </div>
        </div>
      )}
    </div>
  );
}
`,
    hint: "Listen for keydown globally; on the inner dialog call `e.stopPropagation()` so backdrop click doesn't close it.",
    checks: [
      re("esc", "Handles Escape key", /Escape/),
      re("stop", "Stops backdrop propagation on dialog", /stopPropagation/),
      re("open", "Open state", /useState\s*\(\s*false/),
      re("cleanup", "Removes keydown listener", /removeEventListener/),
    ],
    source: "Frontend Mentor / Meta",
  },
  {
    id: "m14-tooltip-delay",
    title: "Tooltip with delay",
    difficulty: "medium",
    category: "UI Components",
    description:
      "Hovering the button for 400ms shows a tooltip. Leaving cancels the delay and hides it.",
    concepts: ["setTimeout", "useRef", "cleanup"],
    starterCode: `import React, { useState } from "react";

export default function App() {
  return (
    <div>
      <button>Hover me</button>
    </div>
  );
}
`,
    solution: `import React, { useState, useRef } from "react";

export default function App() {
  const [show, setShow] = useState(false);
  const timer = useRef(null);
  function enter() {
    timer.current = setTimeout(() => setShow(true), 400);
  }
  function leave() {
    clearTimeout(timer.current);
    setShow(false);
  }
  return (
    <div
      style={{ position: "relative", display: "inline-block" }}
      onMouseEnter={enter}
      onMouseLeave={leave}
    >
      <button>Hover me</button>
      {show && (
        <div
          style={{
            position: "absolute", top: "100%", left: 0,
            background: "#222", color: "white",
            padding: "4px 8px", borderRadius: 4, fontSize: 12,
            marginTop: 4,
          }}
        >
          Tooltip!
        </div>
      )}
    </div>
  );
}
`,
    hint: "Store the timer id in `useRef` so leave() can `clearTimeout(timer.current)`.",
    checks: [
      re("setTimeout", "Uses setTimeout", /setTimeout/),
      re("clearTimeout", "Clears the timeout", /clearTimeout/),
      re("useRef", "Stores timer in useRef", /useRef/),
    ],
  },
  {
    id: "m15-useprevious",
    title: "usePrevious custom hook",
    difficulty: "medium",
    category: "Custom Hooks",
    description:
      "Implement `usePrevious(value)` returning the value from the previous render. Use it to display the previous count.",
    concepts: ["custom hooks", "useRef", "useEffect"],
    starterCode: `import React, { useState } from "react";

// TODO: implement usePrevious(value)

export default function App() {
  const [count, setCount] = useState(0);
  // const prev = usePrevious(count);
  return (
    <div>
      <button onClick={() => setCount(count + 1)}>+</button>
      <p>now: {count}, prev: ?</p>
    </div>
  );
}
`,
    solution: `import React, { useEffect, useRef, useState } from "react";

function usePrevious(value) {
  const ref = useRef();
  useEffect(() => {
    ref.current = value;
  }, [value]);
  return ref.current;
}

export default function App() {
  const [count, setCount] = useState(0);
  const prev = usePrevious(count);
  return (
    <div>
      <button onClick={() => setCount(count + 1)}>+</button>
      <p>now: {count}, prev: {prev ?? "—"}</p>
    </div>
  );
}
`,
    hint: "Store the value in a ref inside `useEffect`. The ref is updated *after* render, so reads return the previous value.",
    checks: [
      re("hook", "Defines usePrevious", /function\s+usePrevious|const\s+usePrevious/),
      re("useRef", "Uses useRef", /useRef/),
      re("update", "Updates ref in useEffect", /useEffect[\s\S]*?ref\.current\s*=/),
    ],
    source: "bigfrontend.dev",
  },
  {
    id: "m16-usetoggle",
    title: "useToggle custom hook",
    difficulty: "medium",
    category: "Custom Hooks",
    description:
      "Build `useToggle(initial = false)` returning `[value, toggle]` where `toggle()` flips the boolean.",
    concepts: ["custom hooks", "useCallback"],
    starterCode: `import React from "react";

// TODO: implement useToggle

export default function App() {
  // const [on, toggle] = useToggle();
  return <button>OFF</button>;
}
`,
    solution: `import React, { useState, useCallback } from "react";

function useToggle(initial = false) {
  const [v, setV] = useState(initial);
  const toggle = useCallback(() => setV((p) => !p), []);
  return [v, toggle];
}

export default function App() {
  const [on, toggle] = useToggle();
  return <button onClick={toggle}>{on ? "ON" : "OFF"}</button>;
}
`,
    hint: "Wrap the toggle callback in `useCallback` so consumers get a stable reference.",
    checks: [
      re("hook", "Defines useToggle", /function\s+useToggle|const\s+useToggle/),
      re("tuple", "Returns a tuple", /return\s*\[/),
      re("negate", "Negates the boolean", /!\s*\w|set\w+\s*\(\s*\([^)]*\)\s*=>\s*!/),
    ],
    source: "bigfrontend.dev",
  },
  {
    id: "m17-carousel",
    title: "Image carousel",
    difficulty: "medium",
    category: "UI Components",
    description:
      "Show an image with Prev/Next buttons. Wrap around at both ends so going past the last image returns to the first.",
    concepts: ["useState", "modulo", "circular index"],
    starterCode: `import React, { useState } from "react";

const imgs = [
  "https://placehold.co/300x200/red/white?text=1",
  "https://placehold.co/300x200/blue/white?text=2",
  "https://placehold.co/300x200/green/white?text=3",
];

export default function Carousel() {
  return (
    <div>
      <img src={imgs[0]} alt="" />
      <button>‹</button>
      <button>›</button>
    </div>
  );
}
`,
    solution: `import React, { useState } from "react";

const imgs = [
  "https://placehold.co/300x200/red/white?text=1",
  "https://placehold.co/300x200/blue/white?text=2",
  "https://placehold.co/300x200/green/white?text=3",
];

export default function Carousel() {
  const [i, setI] = useState(0);
  const prev = () => setI((p) => (p - 1 + imgs.length) % imgs.length);
  const next = () => setI((p) => (p + 1) % imgs.length);
  return (
    <div>
      <img src={imgs[i]} alt="" />
      <div>
        <button onClick={prev}>‹</button>
        <button onClick={next}>›</button>
      </div>
      <p>{i + 1} / {imgs.length}</p>
    </div>
  );
}
`,
    hint: "Use modular arithmetic: `(i - 1 + n) % n` and `(i + 1) % n`.",
    checks: [
      re("modulo", "Uses modulo for wrap-around", /%\s*\w+\.length|%\s*\d/),
      re("decrement", "Has prev that decrements", /-\s*1/),
      re("increment", "Has next that increments", /\+\s*1/),
    ],
    source: "GreatFrontEnd",
  },
  {
    id: "m18-otp",
    title: "OTP input (4 digits)",
    difficulty: "medium",
    category: "Forms",
    description:
      "Four single-character inputs. Typing a digit auto-focuses the next box. Only digits accepted; `maxLength` is 1.",
    concepts: ["useRef arrays", "controlled inputs", "focus management"],
    starterCode: `import React, { useState, useRef } from "react";

export default function OTP() {
  return (
    <div>
      <input style={{ width: 32, margin: 2 }} />
      <input style={{ width: 32, margin: 2 }} />
      <input style={{ width: 32, margin: 2 }} />
      <input style={{ width: 32, margin: 2 }} />
    </div>
  );
}
`,
    solution: `import React, { useState, useRef } from "react";

export default function OTP() {
  const [vals, setVals] = useState(["", "", "", ""]);
  const refs = useRef([]);
  function handle(i, v) {
    if (!/^\\d?$/.test(v)) return;
    const copy = [...vals];
    copy[i] = v;
    setVals(copy);
    if (v && refs.current[i + 1]) refs.current[i + 1].focus();
  }
  return (
    <div>
      {vals.map((v, i) => (
        <input
          key={i}
          value={v}
          maxLength={1}
          ref={(el) => (refs.current[i] = el)}
          onChange={(e) => handle(i, e.target.value)}
          style={{ width: 32, textAlign: "center", margin: 2 }}
        />
      ))}
    </div>
  );
}
`,
    hint: "Store an array of refs on `useRef([])`. After setting a value, call `.focus()` on the next ref.",
    checks: [
      re("array", "Stores 4 values", /\[\s*"",\s*"",\s*"",\s*""\s*\]|Array\(4\)/),
      re("refs", "Uses useRef", /useRef/),
      re("focus", "Auto-focuses next input", /\.focus\s*\(\s*\)/),
      re("maxLength", "Sets maxLength=1", /maxLength\s*=/),
    ],
    source: "Uber / Stripe interview",
  },
  {
    id: "m19-stopwatch",
    title: "Stopwatch (start/pause/reset)",
    difficulty: "medium",
    category: "useEffect",
    description:
      "Stopwatch with Start, Pause, and Reset. Display seconds with one decimal. Start/pause must work without leaking timers.",
    concepts: ["useEffect", "setInterval", "useRef", "cleanup"],
    starterCode: `import React, { useState } from "react";

export default function Stopwatch() {
  return (
    <div>
      <p>0.0s</p>
      <button>Start</button>
      <button>Pause</button>
      <button>Reset</button>
    </div>
  );
}
`,
    solution: `import React, { useState, useEffect, useRef } from "react";

export default function Stopwatch() {
  const [ms, setMs] = useState(0);
  const [running, setRunning] = useState(false);
  const ref = useRef(null);
  useEffect(() => {
    if (running) {
      ref.current = setInterval(() => setMs((m) => m + 100), 100);
    }
    return () => clearInterval(ref.current);
  }, [running]);
  return (
    <div>
      <p>{(ms / 1000).toFixed(1)}s</p>
      <button onClick={() => setRunning(true)}>Start</button>
      <button onClick={() => setRunning(false)}>Pause</button>
      <button onClick={() => { setRunning(false); setMs(0); }}>Reset</button>
    </div>
  );
}
`,
    hint: "Run `setInterval` only while `running` is true; return `clearInterval` in cleanup.",
    checks: [
      re("interval", "Uses setInterval", /setInterval/),
      re("clear", "Uses clearInterval cleanup", /clearInterval/),
      re("running", "Has a running state", /running|useState\s*\(\s*false/),
    ],
  },
  {
    id: "m20-countdown",
    title: "Countdown timer",
    difficulty: "medium",
    category: "useEffect",
    description:
      "Counts down from 10 seconds and stops at 0 (display \"Time's up!\"). A Reset button restarts.",
    concepts: ["useEffect", "setTimeout", "state machine"],
    starterCode: `import React, { useState } from "react";

export default function Countdown() {
  return (
    <div>
      <p>10</p>
      <button>Reset</button>
    </div>
  );
}
`,
    solution: `import React, { useState, useEffect } from "react";

export default function Countdown() {
  const [seconds, setSeconds] = useState(10);
  useEffect(() => {
    if (seconds <= 0) return;
    const t = setTimeout(() => setSeconds((s) => s - 1), 1000);
    return () => clearTimeout(t);
  }, [seconds]);
  return (
    <div>
      <p>{seconds > 0 ? seconds : "Time's up!"}</p>
      <button onClick={() => setSeconds(10)}>Reset</button>
    </div>
  );
}
`,
    hint: "Schedule a `setTimeout` in `useEffect` depending on `seconds`; bail out when it reaches 0.",
    checks: [
      re("timeout", "Uses setTimeout or setInterval", /setTimeout|setInterval/),
      re("dec", "Decrements seconds", /-\s*1/),
      re("stop", "Stops at 0", /<=\s*0|===?\s*0/),
    ],
  },
];
