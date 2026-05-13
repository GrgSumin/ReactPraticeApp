# React Practice

A LeetCode-style coding app for React, Next.js, and TypeScript. Solve 50 hand-picked challenges directly in the browser — write your code in a Monaco editor, hit **Run**, see your component rendered live, and watch automated checks validate your solution. Progress, XP, and streaks persist locally.

![status](https://img.shields.io/badge/challenges-50-blue) ![status](https://img.shields.io/badge/next.js-15-black) ![status](https://img.shields.io/badge/react-19-61dafb) ![status](https://img.shields.io/badge/typescript-5-3178c6)

---

## What it does

- **50 challenges** spanning hooks (`useState`, `useEffect`, `useReducer`, `useContext`, `useMemo`, `useCallback`, `useRef`), custom hooks, forms, TypeScript props, Next.js API routes & dynamic routing, common UI patterns (modal, tabs, accordion, carousel, autocomplete), and small games (tic-tac-toe, memory match).
- **In-browser code execution**: your code is transpiled with `@babel/standalone` and rendered inside a sandboxed iframe, so you see a live React component instantly — no build step.
- **Automated grading**: each challenge has 3–5 regex-based checks (e.g. "destructures `useState` into a tuple", "calls `clearInterval` in cleanup"). Pass all checks and the challenge is marked solved.
- **Progress tracking**: solved set, XP, level (Beginner → Expert), and daily streak persist via `localStorage`. Code drafts also auto-save per challenge.
- **3-pane workspace**: problem description on the left, Monaco editor in the middle, Preview / Console / Tests tabs on the right.

---

## Challenge library

50 problems, drawn from common React interview patterns at **Meta, Airbnb, Uber, Stripe**, plus practice sources like **GreatFrontEnd**, **bigfrontend.dev**, and **Frontend Mentor**.

### Easy — 15
useState basics · list rendering with `key` · TypeScript props interface · `useEffect` on mount · controlled input · conditional rendering · theme toggle · Next.js API route · counter with min/max bounds · like button · traffic light · password visibility toggle · character counter · accordion · simple tabs

### Medium — 20
`useContext` theme · `useReducer` todos · `useLocalStorage` hook · `useMemo` · `useCallback` + `memo` · dynamic route `[id]` · data fetching (loading/error) · form validation · `useRef` focus · star rating · debounced search (`useDebounce`) · pagination · modal (ESC + backdrop) · tooltip with delay · `usePrevious` hook · `useToggle` hook · image carousel · OTP input · stopwatch · countdown timer

### Hard — 15
Context + Reducer global store · `useFetch(url)` hook · optimistic UI with rollback · tic-tac-toe · infinite scroll with `IntersectionObserver` · type-ahead autocomplete (debounce + keyboard nav) · nested comments (recursive tree, immutable updates) · file explorer tree · drag-and-drop reorderable list · memory match game · shopping cart · multi-step form wizard · compound components (`Tabs.Tab` / `Tabs.Panel`) · render props · `useOnClickOutside` hook

---

## Tech stack

| Layer | Choice |
|---|---|
| Framework | Next.js 15 (App Router) |
| Runtime | React 19 |
| Language | TypeScript |
| Styling | Tailwind CSS + CSS variables for dark/light theming |
| UI primitives | shadcn-style components built on Radix (`Button`, `Badge`, `Tabs`, `Tooltip`, `Progress`) |
| Editor | Monaco (`@monaco-editor/react`) with JSX/TSX + VS Code dark theme |
| Code execution | `@babel/standalone` (transpile) + sandboxed `<iframe srcdoc>` (render) |
| Icons | `lucide-react` |

The iframe loads React 18 from unpkg and only carries the `allow-scripts` sandbox flag, so user code is isolated from the host page's origin and can't read parent state.

---

## Getting started

```bash
npm install
npm run dev          # http://localhost:3000
```

Other scripts:

```bash
npm run build        # production build
npm run start        # serve the production build
npm run lint         # eslint
npm run typecheck    # tsc --noEmit
```

---

## How the execution engine works

When you click **Run**:

1. **Preprocess** — strips `import` statements and the `export default` wrapper, since the iframe doesn't run as an ES module.
2. **Transpile** — `Babel.transform()` with `preset-typescript` (`isTSX: true`) and `preset-react` converts TSX → plain JS.
3. **Sandbox** — the transpiled code is injected into an `<iframe srcdoc="…" sandbox="allow-scripts">` together with React 18 from unpkg, `console.*` interceptors, and shims for Next.js APIs (`useRouter` returns a mock `{ query: { id: "42" } }`, `NextResponse.json` returns a plain object) so Next-flavored challenges still execute.
4. **Render** — the iframe mounts the default-exported component into `#root` via `ReactDOM.createRoot`.
5. **Capture** — `console.log/warn/error/info` calls and window errors `postMessage` back to the parent, which streams them into the Console tab.
6. **Grade** — the original source string is run against each challenge's regex checks; results render in the Tests tab. If every check passes, the challenge is marked solved and XP is awarded.

See [`src/lib/sandbox.ts`](src/lib/sandbox.ts) for the full pipeline.

---

## Progress & gamification

| Difficulty | XP per solve |
|---|---|
| Easy | 10 |
| Medium | 20 |
| Hard | 40 |

**Levels** are awarded by total XP: Beginner (0) → Intermediate (80) → Advanced (200) → Expert (400+).

**Streak** tracks consecutive days with at least one solve, reset if you skip a day.

Everything lives in `localStorage` under the `rp.progress.v1` key, plus per-challenge code drafts under `rp.code.<challenge-id>`.

---

## Project structure

```
src/
├── app/
│   ├── api/hello/route.ts     # GET → { message: "Hello World" }, others → 405
│   ├── globals.css            # Tailwind + theme CSS variables
│   ├── layout.tsx             # root layout, forces dark mode
│   └── page.tsx               # the only page — sidebar + 3-pane workspace
├── components/
│   ├── ui/                    # Button, Badge, Tabs, Tooltip, Progress
│   ├── TopNav.tsx             # logo · progress · XP · streak · theme toggle
│   ├── Sidebar.tsx            # filtered, grouped challenge list
│   ├── ChallengeDetail.tsx    # 3-pane layout + run/hint/reset/solution buttons
│   ├── CodeEditor.tsx         # Monaco wrapper
│   └── OutputPanel.tsx        # Preview · Console · Tests tabs
├── lib/
│   ├── challenges/
│   │   ├── helpers.ts         # regex check builders
│   │   ├── easy.ts            # 15
│   │   ├── medium.ts          # 20
│   │   ├── hard.ts            # 15
│   │   └── index.ts           # re-exports + XP map
│   ├── progress.ts            # localStorage-backed store via useSyncExternalStore
│   ├── sandbox.ts             # preprocess + Babel + iframe srcdoc builder + check runner
│   └── utils.ts               # cn() helper
└── types/index.ts             # Challenge, Check, ProgressState, etc.
```

---

## Adding a new challenge

Pick a file in `src/lib/challenges/`, append an object to the exported array, give it a unique `id`, and define a few regex checks. Each challenge needs:

```ts
{
  id: "m21-my-challenge",
  title: "Short imperative title",
  difficulty: "easy" | "medium" | "hard",
  category: "useState",          // groups it in the sidebar
  description: "Markdown-ish text. **Bold** and `inline code` supported.",
  concepts: ["useState", "events"],
  starterCode: `…`,              // shown in the editor on first open
  solution: `…`,                 // revealed by the Solution button
  hint: "One-sentence nudge.",
  checks: [
    re("id-1", "What this check is asserting", /regex/),
  ],
  source: "Optional credit",
}
```

---

## Credits & inspiration

Challenge ideas borrowed from:

- [GreatFrontEnd](https://www.greatfrontend.com/) — star rating, counter bounds, tabs, file explorer
- [bigfrontend.dev](https://bigfrontend.dev/) — `useDebounce`, `usePrevious`, `useToggle`, `useOnClickOutside`
- [Frontend Mentor](https://www.frontendmentor.io/) — accordion, modal, traffic light
- Classic Meta / Airbnb / Uber / Stripe React interviews — tic-tac-toe, autocomplete, infinite scroll, OTP input, nested comments, optimistic UI

---

## License

MIT — do whatever you want with it.
