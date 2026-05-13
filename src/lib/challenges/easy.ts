import type { Challenge } from "@/types";
import { re, and } from "./helpers";

export const easyChallenges: Challenge[] = [
  {
    id: "e1-fix-usestate",
    title: "Fix broken useState counter",
    difficulty: "easy",
    category: "useState",
    description:
      "The counter below is broken. `useState` returns a tuple `[value, setter]`, and the `onClick` prop must be a function. Make the button increment the count.\n\n**Example output:**\n```\nclick → Count: 1\nclick → Count: 2\n```",
    concepts: ["useState", "destructuring", "event handlers"],
    starterCode: `import React, { useState } from "react";

export default function Counter() {
  const count = useState(0);
  return (
    <button onClick={count + 1}>Count: {count}</button>
  );
}
`,
    solution: `import React, { useState } from "react";

export default function Counter() {
  const [count, setCount] = useState(0);
  return (
    <button onClick={() => setCount(count + 1)}>Count: {count}</button>
  );
}
`,
    hint: "useState returns [value, setter]. onClick wants a function, not an expression that runs immediately.",
    checks: [
      re("destructures", "Destructures useState into a tuple", /const\s*\[\s*\w+\s*,\s*set\w+\s*\]\s*=\s*useState/),
      re("arrow", "Passes an arrow function to onClick", /onClick\s*=\s*\{\s*\(.*?\)\s*=>/),
      re("setter", "Calls the setter function", /set\w+\s*\(/),
    ],
  },
  {
    id: "e2-list-map",
    title: "Render a list with .map()",
    difficulty: "easy",
    category: "useState",
    description:
      "Render the `fruits` array as an unordered list. Each `<li>` must have a unique `key` prop.",
    concepts: ["arrays", "key prop", "JSX"],
    starterCode: `import React from "react";

const fruits = ["apple", "banana", "cherry"];

export default function FruitList() {
  return <ul>{/* render fruits here */}</ul>;
}
`,
    solution: `import React from "react";

const fruits = ["apple", "banana", "cherry"];

export default function FruitList() {
  return (
    <ul>
      {fruits.map((fruit) => (
        <li key={fruit}>{fruit}</li>
      ))}
    </ul>
  );
}
`,
    hint: "Use `fruits.map(...)` inside `{}` in JSX and give each `<li>` a `key`.",
    checks: [
      re("map", "Uses .map() to iterate fruits", /fruits\.map\s*\(/),
      re("li", "Renders <li> elements", /<li/),
      re("key", "Provides a key prop", /key\s*=/),
    ],
  },
  {
    id: "e3-ts-props",
    title: "TypeScript props interface",
    difficulty: "easy",
    category: "TypeScript Props",
    description:
      "Define a `UserProps` interface with `name: string`, `age: number`, and an optional `bio?: string`. Use it to type the component's props and render them.",
    concepts: ["TypeScript", "interfaces", "optional props"],
    starterCode: `import React from "react";

// TODO: define UserProps interface

export default function User(props) {
  return null;
}
`,
    solution: `import React from "react";

interface UserProps {
  name: string;
  age: number;
  bio?: string;
}

export default function User({ name, age, bio }: UserProps) {
  return (
    <div>
      <h2>{name}, {age}</h2>
      {bio && <p>{bio}</p>}
    </div>
  );
}

// preview-only:
// <User name="Ada" age={28} bio="Mathematician" />
`,
    hint: "An optional property is declared with `?:`, e.g. `bio?: string`.",
    checks: [
      re("interface", "Defines a UserProps interface", /interface\s+UserProps/),
      re("name", "Has name: string", /name\s*:\s*string/),
      re("age", "Has age: number", /age\s*:\s*number/),
      re("optional", "Has optional bio?: string", /bio\s*\?\s*:\s*string/),
    ],
  },
  {
    id: "e4-effect-mount",
    title: "useEffect on mount",
    difficulty: "easy",
    category: "useEffect",
    description:
      "Use `useEffect` with an empty dependency array so that `console.log(\"mounted\")` runs exactly once when the component mounts.",
    concepts: ["useEffect", "dependency array"],
    starterCode: `import React, { useEffect } from "react";

export default function Mount() {
  // TODO: log "mounted" once on mount
  return <div>Hello</div>;
}
`,
    solution: `import React, { useEffect } from "react";

export default function Mount() {
  useEffect(() => {
    console.log("mounted");
  }, []);
  return <div>Hello</div>;
}
`,
    hint: "An empty `[]` dependency array runs the effect once after the first render.",
    checks: [
      re("useEffect", "Calls useEffect", /useEffect\s*\(/),
      re("empty-deps", "Passes an empty dependency array", /useEffect\s*\([\s\S]+?,\s*\[\s*\]\s*\)/),
      re("log", "Calls console.log", /console\.log\s*\(/),
    ],
  },
  {
    id: "e5-controlled-input",
    title: "Controlled text input",
    difficulty: "easy",
    category: "Forms",
    description:
      "Make the input controlled: its `value` should come from state and update on change. Display the current value below the input.",
    concepts: ["controlled inputs", "useState", "onChange"],
    starterCode: `import React, { useState } from "react";

export default function ControlledInput() {
  return (
    <div>
      <input />
      <p>You typed: </p>
    </div>
  );
}
`,
    solution: `import React, { useState } from "react";

export default function ControlledInput() {
  const [value, setValue] = useState("");
  return (
    <div>
      <input value={value} onChange={(e) => setValue(e.target.value)} />
      <p>You typed: {value}</p>
    </div>
  );
}
`,
    hint: "Set `value={state}` and update state inside `onChange` from `e.target.value`.",
    checks: [
      re("useState", "Uses useState", /useState/),
      re("value-prop", "Binds value prop", /value\s*=\s*\{/),
      re("onChange", "Has onChange handler", /onChange\s*=/),
      re("target-value", "Reads e.target.value", /e\.target\.value/),
    ],
  },
  {
    id: "e6-conditional",
    title: "Conditional rendering",
    difficulty: "easy",
    category: "useState",
    description:
      "Add a boolean state and a Toggle button. Show the paragraph only when the state is true.",
    concepts: ["conditional rendering", "useState"],
    starterCode: `import React, { useState } from "react";

export default function Toggle() {
  return (
    <div>
      <button>Toggle</button>
      <p>Hello, world!</p>
    </div>
  );
}
`,
    solution: `import React, { useState } from "react";

export default function Toggle() {
  const [show, setShow] = useState(true);
  return (
    <div>
      <button onClick={() => setShow(!show)}>Toggle</button>
      {show && <p>Hello, world!</p>}
    </div>
  );
}
`,
    hint: "Render `{boolean && <Element />}` to conditionally include an element.",
    checks: [
      re("bool-state", "Uses a boolean useState", /useState\s*\(\s*(true|false)\s*\)/),
      re("cond-render", "Uses && for conditional render", /\{\s*\w+\s*&&/),
      re("toggle", "Toggles state with negation", /set\w+\s*\(\s*!/),
    ],
  },
  {
    id: "e7-theme-toggle",
    title: "Light/dark theme toggle",
    difficulty: "easy",
    category: "useState",
    description:
      "Click a button to toggle between dark and light. Change the container's className OR inline style based on the current theme.",
    concepts: ["useState", "conditional className"],
    starterCode: `import React, { useState } from "react";

export default function Theme() {
  return (
    <div>
      <button>Toggle theme</button>
    </div>
  );
}
`,
    solution: `import React, { useState } from "react";

export default function Theme() {
  const [dark, setDark] = useState(true);
  return (
    <div
      style={{
        background: dark ? "#111" : "#fff",
        color: dark ? "#fff" : "#111",
        padding: 16,
      }}
    >
      <button onClick={() => setDark(!dark)}>Toggle theme</button>
    </div>
  );
}
`,
    hint: "Use a ternary inside `style` or `className` keyed on the boolean.",
    checks: [
      re("bool", "Uses boolean state", /useState\s*\(\s*(true|false)\s*\)/),
      re("conditional-styling", "Conditionally styles based on state", /(className|style)\s*=\s*\{[\s\S]*?\?[\s\S]*?:/),
      re("toggle", "Toggles via negation", /set\w+\s*\(\s*!/),
    ],
  },
  {
    id: "e8-api-route",
    title: "Next.js API route",
    difficulty: "easy",
    category: "Next.js API Routes",
    description:
      "Write a Next.js App Router handler at `app/api/hello/route.ts`. GET must return JSON `{ message: \"Hello World\" }`. Any other method must respond with status 405.",
    concepts: ["Next.js", "Route Handlers", "NextResponse"],
    starterCode: `// app/api/hello/route.ts
// TODO: implement GET and reject other methods with 405
`,
    solution: `import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({ message: "Hello World" });
}

export async function POST() {
  return new NextResponse("Method Not Allowed", { status: 405 });
}
`,
    hint: "Export an async function named after the HTTP method. Use `NextResponse.json` and `{ status: 405 }`.",
    checks: [
      re("GET", "Exports a GET function", /export\s+(async\s+)?function\s+GET/),
      re("hello", "Returns JSON with message Hello World", /message\s*:\s*["'`]Hello World["'`]/),
      re("405", "Returns status 405 for other methods", /status\s*:\s*405/),
    ],
    source: "GreatFrontEnd / Next.js docs",
  },
  {
    id: "e9-counter-bounds",
    title: "Counter with min/max bounds",
    difficulty: "easy",
    category: "useState",
    description:
      "Build a counter with `min = 0` and `max = 10`. The decrement button is disabled when count is 0, and the increment button is disabled when count is 10.",
    concepts: ["useState", "disabled attribute", "guards"],
    starterCode: `import React, { useState } from "react";

export default function Counter() {
  const [count, setCount] = useState(0);
  return (
    <div>
      <button>−</button>
      <span style={{ margin: "0 12px" }}>{count}</span>
      <button>+</button>
    </div>
  );
}
`,
    solution: `import React, { useState } from "react";

export default function Counter() {
  const [count, setCount] = useState(0);
  return (
    <div>
      <button onClick={() => setCount(count - 1)} disabled={count <= 0}>−</button>
      <span style={{ margin: "0 12px" }}>{count}</span>
      <button onClick={() => setCount(count + 1)} disabled={count >= 10}>+</button>
    </div>
  );
}
`,
    hint: "Use the `disabled` attribute with `count <= 0` and `count >= 10`.",
    checks: [
      re("disabled", "Uses disabled attribute", /disabled\s*=/),
      re("min", "Guards minimum at 0", /<=\s*0|count\s*===?\s*0/),
      re("max", "Guards maximum at 10", />=\s*10|count\s*===?\s*10/),
    ],
    source: "GreatFrontEnd",
  },
  {
    id: "e10-like-button",
    title: "Like button toggle",
    difficulty: "easy",
    category: "useState",
    description:
      "Build a like button that toggles a filled heart and increments/decrements a count. First click likes (count goes up); second click un-likes (count goes back down).",
    concepts: ["useState", "toggling state", "multiple state values"],
    starterCode: `import React, { useState } from "react";

export default function Like() {
  return <button>♡ 0</button>;
}
`,
    solution: `import React, { useState } from "react";

export default function Like() {
  const [liked, setLiked] = useState(false);
  const [count, setCount] = useState(0);

  function toggle() {
    if (liked) {
      setLiked(false);
      setCount(count - 1);
    } else {
      setLiked(true);
      setCount(count + 1);
    }
  }

  return <button onClick={toggle}>{liked ? "♥" : "♡"} {count}</button>;
}
`,
    hint: "Track liked (boolean) and count (number). On click, branch on liked to adjust both.",
    checks: [
      re("two-states", "Uses two useState calls", /useState[\s\S]+useState/),
      re("conditional-icon", "Renders different icons by state", /liked\s*\?|\?\s*["'`]♥/),
      re("increment", "Increments count on like", /count\s*\+\s*1|c\s*\+\s*1/),
      re("decrement", "Decrements count on un-like", /count\s*-\s*1|c\s*-\s*1/),
    ],
    source: "Meta",
  },
  {
    id: "e11-traffic-light",
    title: "Traffic light",
    difficulty: "easy",
    category: "useEffect",
    description:
      "Cycle through red → yellow → green every 1000ms using `setInterval`. Show three circles, with only the active one colored.",
    concepts: ["useEffect", "setInterval", "cleanup"],
    starterCode: `import React, { useState, useEffect } from "react";

const lights = ["red", "yellow", "green"];

export default function TrafficLight() {
  return <div>red</div>;
}
`,
    solution: `import React, { useState, useEffect } from "react";

const lights = ["red", "yellow", "green"];

export default function TrafficLight() {
  const [i, setI] = useState(0);

  useEffect(() => {
    const t = setInterval(() => setI((p) => (p + 1) % lights.length), 1000);
    return () => clearInterval(t);
  }, []);

  return (
    <div style={{ display: "flex", gap: 8 }}>
      {lights.map((l) => (
        <div
          key={l}
          style={{
            width: 40,
            height: 40,
            borderRadius: "50%",
            background: l === lights[i] ? l : "#333",
          }}
        />
      ))}
    </div>
  );
}
`,
    hint: "Use `setInterval` in `useEffect` and return `clearInterval` for cleanup.",
    checks: [
      re("interval", "Calls setInterval", /setInterval/),
      re("cleanup", "Clears the interval on unmount", /clearInterval/),
      re("state", "Tracks current light index", /useState\s*\(\s*0\s*\)/),
    ],
    source: "Frontend Mentor / classic",
  },
  {
    id: "e12-password-toggle",
    title: "Password visibility toggle",
    difficulty: "easy",
    category: "Forms",
    description:
      "An input plus a button that toggles the input's `type` between `\"password\"` and `\"text\"`. Button label updates accordingly.",
    concepts: ["useState", "controlled type attribute"],
    starterCode: `import React, { useState } from "react";

export default function PwToggle() {
  return (
    <div>
      <input type="password" defaultValue="secret" />
      <button>Show</button>
    </div>
  );
}
`,
    solution: `import React, { useState } from "react";

export default function PwToggle() {
  const [show, setShow] = useState(false);
  return (
    <div>
      <input type={show ? "text" : "password"} defaultValue="secret" />
      <button onClick={() => setShow(!show)}>{show ? "Hide" : "Show"}</button>
    </div>
  );
}
`,
    hint: "Bind `type` to a ternary on the boolean state.",
    checks: [
      re("conditional-type", "Conditionally sets input type", /type\s*=\s*\{[^}]*\?/),
      re("toggle", "Toggles boolean state", /set\w+\s*\(\s*!\w+\s*\)/),
    ],
  },
  {
    id: "e13-char-counter",
    title: "Twitter-style character counter",
    difficulty: "easy",
    category: "Forms",
    description:
      "A textarea bound to state with a max of 280 characters. Show `X/280`, and make the count red when length is over 280.",
    concepts: ["controlled inputs", "derived state", "conditional style"],
    starterCode: `import React, { useState } from "react";

const MAX = 280;

export default function CharCounter() {
  return (
    <div>
      <textarea rows={4} cols={40} />
      <p>0/{MAX}</p>
    </div>
  );
}
`,
    solution: `import React, { useState } from "react";

const MAX = 280;

export default function CharCounter() {
  const [text, setText] = useState("");
  const over = text.length > MAX;
  return (
    <div>
      <textarea
        rows={4}
        cols={40}
        value={text}
        onChange={(e) => setText(e.target.value)}
      />
      <p style={{ color: over ? "red" : undefined }}>
        {text.length}/{MAX}
      </p>
    </div>
  );
}
`,
    hint: "Derive `over = text.length > MAX` and use it for color.",
    checks: [
      re("state", "Tracks text in state", /useState/),
      re("max", "References 280 limit", /280/),
      re("conditional-color", "Conditionally colors when over limit", /color\s*:|className.*\?/),
    ],
  },
  {
    id: "e14-accordion",
    title: "Accordion (single open)",
    difficulty: "easy",
    category: "UI Components",
    description:
      "Render a list of Q/A items. Clicking a question expands its answer; only one item may be open at a time.",
    concepts: ["useState", "conditional rendering"],
    starterCode: `import React, { useState } from "react";

const items = [
  { title: "Q1", body: "A1" },
  { title: "Q2", body: "A2" },
  { title: "Q3", body: "A3" },
];

export default function Accordion() {
  return (
    <div>
      {items.map((it, i) => (
        <div key={i}>
          <button>{it.title}</button>
        </div>
      ))}
    </div>
  );
}
`,
    solution: `import React, { useState } from "react";

const items = [
  { title: "Q1", body: "A1" },
  { title: "Q2", body: "A2" },
  { title: "Q3", body: "A3" },
];

export default function Accordion() {
  const [open, setOpen] = useState(null);
  return (
    <div>
      {items.map((it, i) => (
        <div key={i}>
          <button onClick={() => setOpen(open === i ? null : i)}>
            {it.title}
          </button>
          {open === i && <p>{it.body}</p>}
        </div>
      ))}
    </div>
  );
}
`,
    hint: "Track a single `open` index. Set to `null` to close, or to `i` to open. Clicking the open one closes it.",
    checks: [
      re("state", "Tracks open index (null initially)", /useState\s*\(\s*null/),
      re("click", "Has click handler", /onClick/),
      re("conditional", "Conditionally renders body", /open\s*===?\s*i/),
    ],
    source: "Frontend Mentor",
  },
  {
    id: "e15-tabs-simple",
    title: "Simple tabs",
    difficulty: "easy",
    category: "UI Components",
    description:
      "Render three tab buttons and a panel area. Clicking a tab switches the panel content. Active tab is bold.",
    concepts: ["useState", "conditional style"],
    starterCode: `import React, { useState } from "react";

const tabs = ["Profile", "Settings", "About"];

export default function Tabs() {
  return (
    <div>
      <div>{tabs.map((t) => <button key={t}>{t}</button>)}</div>
      <p>Panel for ?</p>
    </div>
  );
}
`,
    solution: `import React, { useState } from "react";

const tabs = ["Profile", "Settings", "About"];

export default function Tabs() {
  const [active, setActive] = useState(0);
  return (
    <div>
      <div>
        {tabs.map((t, i) => (
          <button
            key={t}
            onClick={() => setActive(i)}
            style={{ fontWeight: active === i ? "bold" : "normal" }}
          >
            {t}
          </button>
        ))}
      </div>
      <p>Panel for {tabs[active]}</p>
    </div>
  );
}
`,
    hint: "Track the active index in state and use a ternary on `fontWeight`.",
    checks: [
      re("state", "Tracks active tab", /useState\s*\(\s*0/),
      re("click", "Click sets active tab", /setActive/),
      re("conditional-style", "Highlights active tab", /active\s*===?\s*i/),
    ],
    source: "GreatFrontEnd",
  },
];
