# Plan 016: Give every theme its own stylesheet (tokens per theme, shared utilities in one base file)

> **Executor instructions**: Follow this plan step by step. Run every
> verification command and confirm the expected result before moving to the
> next step. If anything in "STOP conditions" occurs, stop and report — do not
> improvise. When done, update the status row for this plan in
> `plans/README.md` unless a reviewer told you they maintain the index.
>
> **Drift check (run first)** — compare against the snapshot this plan was written from:
> - Plan 014 and 015 must be DONE: `test -f scripts/check-theme.mjs && test -f src/chinese-java/fragments/story.html && echo ok` → `ok`. Otherwise STOP.
> - `test -f src/styles/main.css && grep -c "@theme" src/styles/main.css` → `1`
> - `grep -n '"css"' package.json` → 1 match containing `dist/main.css`
> - `grep -n "main.css" src/chinese-java/partials/head-assets.html build.mjs` → one match in each file
>
> Any mismatch is a STOP condition.

## Status

- **Priority**: P1
- **Effort**: M
- **Risk**: MED (visual regression if a literal is missed; the Tailwind split itself was not test-compiled by the planner — step 4 is the first real compile, so treat a compile error as a STOP condition)
- **Depends on**: plans/014-theme-contract-check.md, plans/015-fragments-to-theme-files.md
- **Category**: tech-debt
- **Planned at**: snapshot `repomix-output.xml` of 2026-10-14 (no git SHA available to the planner)

## Why this matters

All styling lives in one `src/styles/main.css`: the Chinese Java palette (`@theme`), the shared button/field utilities written against it, and many hard-coded colour literals (`rgb(87 62 40 / …)`, `#6a4c31`, `#a3402a`, desktop-shell colours). It compiles to a single `dist/main.css` that every theme links. A second theme cannot define its own colours: redefining `--color-ink` in the same `@theme` would restyle Chinese Java too, and a theme's pages would carry the other theme's rules. After this plan each theme has `src/<theme>/theme.css` (its tokens and decor) that imports one shared `src/styles/base.css` (utilities written only against tokens), and compiles to `dist/css/<theme>.css`. A new theme sets its own palette and gets working buttons, fields and dialogs for free.

## Current state

- `src/styles/main.css` (exact structure; line numbers approximate):
  - lines 1–5: `@import "tailwindcss" source(none);` then `@source "../chinese-java/**/*.html";`, `@source "../batak-dayak/**/*.html";`, `@source "../../build.mjs";`, `@source "../shared/**/*.js";`
  - `@theme { ... }` with `--color-cream #F3E1CF`, `--color-paper #FBF4EA`, `--color-ink #573E28`, `--color-muted #6B5440`, `--color-gold #D1A046`, `--color-gold-ink #7D5A10`, `--color-seal #9A2B1E`, `--font-sans: "Outfit", sans-serif`, `--font-display: "Cormorant Garamond", serif`, `--motion-fast 120ms`, `--motion-ui 200ms`, `--motion-slow 300ms`, `--ease-out-ui`, `--ease-in-out-ui`, `--ease-drawer`.
  - `@layer base { ... }`, utilities `btn`, `btn-ghost`, `tlink`, `field`, `grain`, `float`, `nav-chip`, `act-btn`, the rule `#page .tlink { min-height: 2.75rem; }`, three media queries (reduced motion, `(hover: none), (pointer: coarse)`, and the `min-width: 1280px` desktop shell), and four plain `.btn/.btn-ghost/.act-btn/.nav-chip { transition-duration…; transition-timing-function… }` rules.
  - Colour literals that are really tokens: `rgb(87_62_40/.55)` and `rgb(87 62 40 …)` = the ink colour `#573E28` (87,62,40); `#6a4c31` = ink hover; `#a3402a` = invalid-field border; `rgb(40 26 14 / .6)` = dialog backdrop; `rgb(245 235 217 / 1)` = desktop backdrop behind the canvas.
  - `@utility grain` is a data-URI SVG noise whose colour matrix (`.34 .24 .16`) encodes the ink colour; templates use it (`class="grain ..."`) as Chinese-Java decor.
- `package.json` scripts: `"css": "tailwindcss -i src/styles/main.css -o dist/main.css"`, `"dev:css": "tailwindcss -i src/styles/main.css -o dist/main.css --watch"`, `"build": "bun run css && bun run build:html"`, `"dev": "concurrently \"bun run dev:css\" \"bun run dev:html\" \"bun run dev:server\""`.
- `build.mjs` — `build.mjs` wipes `dist/<theme>/` on every build, so CSS must **not** be written inside `dist/<theme>/`; this plan writes it to `dist/css/<theme>.css`. The `indexHtml` template string in `build.mjs` links `main.css` and uses Chinese-Java classes (`font-display`, `text-gold-ink`, `btn-ghost`, `text-muted`, fonts from Google).
- `src/chinese-java/partials/head-assets.html` ends with `<link rel="stylesheet" href="../main.css">` (pages live at `dist/<theme>/<mode>.html`).
- `scripts/check-css.mjs` currently reads one `dist/main.css` for every page (exact code: `const css = readFileSync("dist/main.css", "utf8");` then loops all `dist/**/*.html`).
- `scripts/check-theme.mjs` (plan 014) loops non-stub themes; this plan adds a `theme.css` requirement to it.
- Existing evidence that plain `var(--token)` references in ordinary CSS rules compile fine: `main.css` already uses `var(--color-cream)`, `var(--font-sans)` and `var(--motion-ui)` outside utilities.
- Token vocabulary (keep these names; templates use them as `bg-cream`, `text-ink`, …): `cream` page background, `paper` raised surface, `ink` text and primary buttons, `muted` secondary text, `gold` accent fill, `gold-ink` accent text, `seal` secondary accent. This plan adds four: `ink-hover`, `shell`, `danger`, `scrim`.

## Commands you will need

| Purpose | Command | Expected |
|---|---|---|
| Install | `bun install` | exit 0 |
| Compile CSS | `bun run css` | exit 0, writes `dist/css/chinese-java.css` |
| Build | `bun run build` | exit 0 |
| Checks | `bun run check` | exit 0 |
| Serve | `bun run dev:server` | `Dev server: http://localhost:3000` |

## Scope

**In scope**: `src/styles/base.css` (create), `src/styles/main.css` (delete), `src/chinese-java/theme.css` (create), `scripts/css.mjs` (create), `package.json` (scripts `css`, `dev:css`), `src/chinese-java/partials/head-assets.html`, `build.mjs` (one var + `indexHtml`), `scripts/check-css.mjs`, `scripts/check-theme.mjs`, `README.md` and `PRODUCT.md` (the lines naming `main.css`).

**Out of scope** (do NOT touch): templates, other partials, fragments, shared scripts, the workflow file, `src/batak-dayak/*`, any colour or spacing *value* (this plan moves and tokenises, it must not redesign).

## Git workflow

- Branch `advisor/016-per-theme-css`; commit after step 3 and after step 7; plain imperative messages.
- Do NOT push or open a PR unless the operator instructed it.

## Steps

### Step 1: Baseline

`bun run build`, then:
`B="${TMPDIR:-/tmp}/p016"; mkdir -p "$B" && rm -rf "$B/before" && cp -r dist "$B/before" && cp dist/main.css "$B/main.before.css"`.

### Step 2: Create `src/styles/base.css`

Create it with exactly this content (it is the old `main.css` minus the imports, minus `@theme`, minus `grain`, with colour literals replaced by tokens; everything else is unchanged):

```css
/* Shared utilities and base rules. Written only against theme tokens (see src/<theme>/theme.css); no colour literals here. */

@layer base {
    html:not(.open) { overflow: hidden; } /* locked on the cover until the invitation is opened */
    html, body { background: var(--color-cream); }
    body { font-family: var(--font-sans); color: var(--color-ink); -webkit-tap-highlight-color: transparent; }
    h1, h2, h3, blockquote { text-wrap: balance; }
    p { text-wrap: pretty; }
    ::selection { background: color-mix(in srgb, var(--color-gold) 45%, transparent); }
    :focus-visible { outline: 2px solid var(--color-gold-ink); outline-offset: 2px; }
    dialog::backdrop { background: var(--color-scrim); }
    button { cursor: pointer; }
    #stage { touch-action: none; }
    [data-scroll] { touch-action: pan-y; }
    .field:user-invalid { border-color: var(--color-danger); }
}

@utility btn {
    @apply inline-flex min-h-11 items-center justify-center gap-2 rounded-full bg-ink px-6 text-sm font-medium text-paper shadow-[0_10px_24px_-10px_color-mix(in_srgb,var(--color-ink)_55%,transparent)] transition duration-200 hover:-translate-y-0.5 hover:bg-ink-hover active:translate-y-0 active:scale-[.97] disabled:opacity-60 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold-ink;
}
@utility btn-ghost {
    @apply inline-flex min-h-11 items-center justify-center gap-2 rounded-full border border-ink/30 px-5 text-sm font-medium text-ink transition duration-200 hover:bg-ink/5 active:scale-[.97] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold-ink;
}
@utility tlink {
    @apply inline-flex min-h-8 items-center gap-1.5 text-sm font-medium text-gold-ink underline decoration-gold/60 underline-offset-4 transition-colors hover:text-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold-ink;
}
@utility field {
    @apply w-full rounded-xl border border-ink/25 bg-white px-3.5 py-2.5 text-sm text-ink transition-colors focus:border-gold-ink disabled:bg-ink/5 disabled:text-muted focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold-ink;
}

/* solid floating surface: readable over the patterned background */
@utility float {
    @apply bg-paper ring-1 ring-ink/25 shadow-[0_8px_24px_-8px_color-mix(in_srgb,var(--color-ink)_50%,transparent)];
}
@utility nav-chip {
    @apply relative z-10 flex h-14 w-full flex-col items-center justify-center gap-0.5 text-xs font-medium text-muted transition-colors duration-300 aria-[current=true]:text-paper focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold-ink;
}
@utility act-btn {
    @apply grid size-12 place-items-center rounded-full bg-ink/10 text-ink transition duration-200 hover:bg-ink/15 active:scale-95 aria-pressed:bg-ink aria-pressed:text-paper focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold-ink;
}

/* scroll mode keeps 44px tap targets; swipe/zoom use the compact 32px tlink */
#page .tlink { min-height: 2.75rem; }

@media (prefers-reduced-motion: reduce) {
    .btn,
    .btn-ghost,
    .nav-chip,
    .act-btn {
        transition-property: color, background-color, border-color, opacity;
    }

    .btn:hover,
    .btn-ghost:hover,
    .nav-chip:hover,
    .act-btn:hover,
    .btn:active,
    .btn-ghost:active,
    .nav-chip:active,
    .act-btn:active {
        transform: none;
    }
}

@media (hover: none), (pointer: coarse) {
    .btn:hover,
    .btn-ghost:hover,
    .nav-chip:hover,
    .act-btn:hover {
        transform: none;
    }
}

.btn {
    transition-duration: var(--motion-ui);
    transition-timing-function: var(--ease-out-ui);
}
.btn-ghost {
    transition-duration: var(--motion-ui);
    transition-timing-function: var(--ease-out-ui);
}
.act-btn {
    transition-duration: var(--motion-ui);
    transition-timing-function: var(--ease-out-ui);
}
.nav-chip {
    transition-duration: var(--motion-slow);
    transition-timing-function: var(--ease-out-ui);
}

/* desktop shell: keep swipe/zoom compositions intact, but make the scaled canvas feel intentionally framed rather than floating in empty browser chrome */
@media (min-width: 1280px) {
    #viewport {
        background:
            radial-gradient(ellipse 75% 60% at 50% 50%, transparent 30%, color-mix(in srgb, var(--color-ink) 10%, transparent) 100%),
            var(--color-shell);
    }

    #stage {
        border-radius: 32px;
        box-shadow: 0 42px 100px -52px color-mix(in srgb, var(--color-ink) 60%, transparent);
        overflow: hidden;
    }

    #page {
        border-radius: 30px;
        box-shadow: 0 34px 80px -50px color-mix(in srgb, var(--color-ink) 35%, transparent);
    }
}
```

Before saving, compare against the live `src/styles/main.css`: if any rule in it is missing from the text above (the snapshot may have drifted), add it unchanged and mention it in your report.

**Verify**: `grep -c "rgb(\|#[0-9A-Fa-f]\{3,6\}" src/styles/base.css` → `0` (no colour literals left; the one `rgb(` in a comment would also count, there is none).

### Step 3: Create `src/chinese-java/theme.css`

```css
/* Chinese Java: palette, type and motion tokens plus decor. Shared utilities live in ../styles/base.css. */
@import "tailwindcss" source(none);
@import "../styles/base.css";
@source "./**/*.html";
@source "../shared/**/*.js";

@theme {
    --color-cream: #F3E1CF;    /* page background */
    --color-paper: #FBF4EA;    /* raised surface */
    --color-shell: #F5EBD9;    /* desktop backdrop behind the invitation canvas */
    --color-ink: #573E28;      /* text and primary buttons */
    --color-ink-hover: #6A4C31;
    --color-muted: #6B5440;    /* 5.5:1 on cream; replaces ink/60 (3.4:1) */
    --color-gold: #D1A046;     /* accent for fills and decor */
    --color-gold-ink: #7D5A10; /* gold for text: 4.9:1 on cream */
    --color-seal: #9A2B1E;     /* Chinese red, used sparingly: ampersands */
    --color-danger: #A3402A;   /* invalid field border */
    --color-scrim: rgb(40 26 14 / .6); /* dialog backdrop */
    --font-sans: "Outfit", sans-serif;
    --font-display: "Cormorant Garamond", serif;
    --motion-fast: 120ms;
    --motion-ui: 200ms;
    --motion-slow: 300ms;
    --ease-out-ui: cubic-bezier(0.23, 1, 0.32, 1);
    --ease-in-out-ui: cubic-bezier(0.77, 0, 0.175, 1);
    --ease-drawer: cubic-bezier(0.32, 0.72, 0, 1);
}

/* decor used only by this theme's templates */
@utility grain {
    background-image: url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='160' height='160'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='.8' numOctaves='2' stitchTiles='stitch'/><feColorMatrix values='0 0 0 0 .34 0 0 0 0 .24 0 0 0 0 .16 0 0 0 .9 0'/></filter><rect width='100%' height='100%' filter='url(%23n)'/></svg>");
}
```

If the live `main.css` `@theme` or `grain` differs from this text, copy the live values instead (only the four new tokens are additions).

### Step 4: CSS build script and package scripts

Create `scripts/css.mjs`:

```js
// Compile src/<theme>/theme.css -> dist/css/<theme>.css for every theme that has one. --watch keeps them rebuilding.
// Needs the tailwindcss CLI on PATH (it is when run through `bun run`).
import { readdirSync, existsSync, mkdirSync } from "node:fs";
import { spawn } from "node:child_process";

const watch = process.argv.includes("--watch");
const themes = readdirSync("src", { withFileTypes: true }).filter(d => d.isDirectory() && existsSync(`src/${d.name}/theme.css`)).map(d => d.name);
if (!themes.length) { console.error("no src/<theme>/theme.css found"); process.exit(1); }
mkdirSync("dist/css", { recursive: true });
let failed = 0;
await Promise.all(themes.map(t => new Promise(done => {
    const p = spawn("tailwindcss", ["-i", `src/${t}/theme.css`, "-o", `dist/css/${t}.css`, ...(watch ? ["--watch"] : [])], { stdio: "inherit" });
    p.on("exit", code => { if (code) failed = 1; done(); });
})));
process.exit(failed);
```

In `package.json` set `"css": "node scripts/css.mjs"` and `"dev:css": "node scripts/css.mjs --watch"` (leave every other script as it is).

**Verify**: `bun run css` → exit 0 and `test -s dist/css/chinese-java.css && echo ok` → `ok`. If Tailwind reports an error about `@import`, `@utility` or `@apply` in the imported file, that is a STOP condition: paste the full error into your report (do not restructure the CSS on your own).

### Step 5: Link the per-theme stylesheet, neutral index page

1. `build.mjs`: directly after the line `const vars = scalars(content);` add
   `vars["theme.name"] = theme; // head-assets.html links css/<theme>.css`
2. `src/chinese-java/partials/head-assets.html`: replace `href="../main.css"` with `href="../css/{{theme.name}}.css"` (only that attribute).
3. `build.mjs`: replace the whole `indexHtml` constant with:
   ```js
   const indexHtml = themes => `<!doctype html>
   <html lang="id"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1">
   <title>Undangan Pernikahan</title>
   <style>
   body{font:16px/1.5 system-ui,sans-serif;max-width:480px;margin:0 auto;padding:4rem 2rem;color:#222}
   h1{margin:0 0 2rem}h2{margin:2rem 0 .25rem}p{margin:0 0 .75rem;color:#555}
   a{display:inline-block;margin:0 .5rem .5rem 0;padding:.6rem 1.1rem;border:1px solid #888;border-radius:999px;color:inherit;text-decoration:none}
   a:hover,a:focus-visible{background:#eee}
   </style></head>
   <body>
   <h1>Undangan</h1>
   ${themes.map(t => `<section><h2>${esc(t.label)}</h2><p>${esc(t.description)}</p>${t.modes.map(m => `<a href="${esc(t.name)}/${esc(m)}.html?to=Nama%20Tamu">${esc(m)}</a>`).join("\n")}</section>`).join("\n")}
   </body></html>
   `;
   ```
   (The index becomes a plain, theme-neutral page; this is the one intended visual change.)

**Verify**: `bun run build` → exit 0; `grep -c 'css/chinese-java.css' dist/chinese-java/swipe.html dist/chinese-java/scroll.html dist/chinese-java/zoom.html` → `1` for each; `grep -c "main.css" dist/index.html` → `0`.

### Step 6: Per-theme CSS in the checks

1. `scripts/check-css.mjs`: replace its contents with
   ```js
   // Fails if a class used in a built page has no rule in that theme's dist/css/<theme>.css (catches templates/fragments the CSS build can't see).
   import { readFileSync, readdirSync } from "node:fs";
   import { join } from "node:path";

   const skip = /^(ph-|ph$|ch$|sec$|slide$|panel$|pc$|ov$|group$|peer$|notranslate$|open$)/; // phosphor icons + JS/state hooks, not Tailwind
   const esc = t => t.replace(/[^\w-]/g, c => "\\" + c);
   const sheets = new Map();
   const sheet = theme => sheets.get(theme) ?? sheets.set(theme, readFileSync(join("dist", "css", `${theme}.css`), "utf8")).get(theme);
   let bad = 0;
   for (const f of readdirSync("dist", { recursive: true }).filter(f => f.endsWith(".html") && /[\\/]/.test(f))) { // dist/index.html has no theme
       const theme = f.split(/[\\/]/)[0], html = readFileSync(join("dist", f), "utf8");
       const tokens = new Set([...html.matchAll(/\bclass="([^"]*)"/g)].flatMap(m => m[1].split(/\s+/)).filter(Boolean));
       for (const t of tokens) if (!skip.test(t) && !sheet(theme).includes("." + esc(t))) { console.log(`${f}: missing .${t}`); bad++; }
   }
   process.exit(bad ? 1 : 0);
   ```
2. `scripts/check-theme.mjs`: directly after the `if (!Array.isArray(meta.modes) ...) { ...; continue; }` line add
   ```js
       if (!existsSync(join(dir, "theme.css"))) fail(`${d.name}: missing ${join(dir, "theme.css")}`);
       else if (!existsSync(join("dist", "css", `${d.name}.css`))) fail(`${d.name}: dist/css/${d.name}.css not built (run bun run css)`);
   ```
3. Delete the old entry file: `rm src/styles/main.css`.

**Verify**: `bun run build && bun run check` → exit 0.

### Step 7: Prove nothing changed visually, then update docs

1. Shared rules survived the move (every count must be at least 1):
   `for s in '.btn' '.btn-ghost' '.tlink' '.field' '.float' '.nav-chip' '.act-btn' '.grain' '#page .tlink' '#viewport' '::backdrop' ':user-invalid' 'min-width: 1280px'; do printf '%s  ' "$s"; grep -cF -- "$s" dist/css/chinese-java.css; done`
   A `0` is a STOP condition (report which). (A full selector diff against the old `dist/main.css` is deliberately not used: the old file also contained classes that only the old index page used, which no longer exist.)
2. Literal check: `grep -c "rgb(87" dist/css/chinese-java.css` → `0`; `grep -ci "6a4c31" dist/css/chinese-java.css` → at least `1`.
3. Pages unchanged except the stylesheet link: for each mode `m`:
   `diff <(tr -s ' \t\r\n' '\n' < "$B/before/chinese-java/$m.html") <(tr -s ' \t\r\n' '\n' < dist/chinese-java/$m.html)` → exactly one removed token group (`href="../main.css">`) and one added (`href="../css/chinese-java.css">`), nothing else.
4. Browser smoke test (`bun run dev:server`, open `http://localhost:3000/chinese-java/swipe.html`, `scroll.html`, `zoom.html`): cover shows the brown "Buka undangan" pill; hovering it lightens it; dialogs (QR icon) have a dark brown backdrop; on a window ≥1280px wide swipe/zoom show the framed canvas on a warm backdrop. If no browser is available, say so in your report instead of claiming this passed.
5. Docs: in `README.md` replace the bullet that mentions `src/styles/main.css` with two bullets: ``- `src/<theme>/theme.css` — the theme's colour, font and motion tokens (Tailwind `@theme`) and decor; imports the shared utilities.`` and ``- `src/styles/base.css` — shared button, field and dialog styles, written only against tokens.``, and say compiled CSS goes to `dist/css/<theme>.css`. In `PRODUCT.md` change the line `Compiled CSS source: ...` to name `src/<theme>/theme.css` and `src/styles/base.css`.
   **Verify**: `grep -rn "main.css" --exclude-dir=node_modules --exclude-dir=dist --exclude-dir=plans --exclude-dir=animation-plans --exclude-dir=.git .` → no output.

## Test plan

`bun run check` (class coverage per theme and the new theme.css requirement), plus the shared-rule and literal checks in step 7. No test framework is added.

## Done criteria

- [ ] `bun run build && bun run check` exit 0
- [ ] `rm -rf dist && bun run build` leaves `ls dist` showing `chinese-java  css  index.html` and no `main.css`
- [ ] Every shared-rule count in step 7.1 is at least 1; `grep -c "rgb(87" dist/css/chinese-java.css` → `0`
- [ ] Page diffs show only the stylesheet link change
- [ ] `grep -c "rgb(\|#[0-9A-Fa-f]\{3,6\}" src/styles/base.css` → `0`
- [ ] The `grep -rn "main.css"` command in step 7 prints nothing
- [ ] Only in-scope files modified
- [ ] `plans/README.md` status row updated

## STOP conditions

- Any drift-check mismatch, or plans 014/015 not done.
- Tailwind fails to compile `theme.css` (imports, `@utility` or `@apply` in the imported file, `color-mix` in arbitrary shadow values). Report the full error; the possible fallbacks (inlining base.css into each theme, plain `box-shadow` declarations) are design decisions for the owner.
- A shared-rule count in step 7.1 is `0`.
- You find a template using a class that exists only in the old `main.css` and that this plan neither moved nor listed.
- You would have to change a colour value, not just tokenise it.

## Maintenance notes

- A new theme needs its own `theme.css` with the same imports and **every** token above (names are the contract: `cream`, `paper`, `shell`, `ink`, `ink-hover`, `muted`, `gold`, `gold-ink`, `seal`, `danger`, `scrim`, `font-sans`, `font-display`, motion tokens). Contrast expectations from PRODUCT.md apply: `muted` and `gold-ink` must keep at least 4.5:1 on `cream`.
- Decor utilities that belong to one look (like `grain`) go in that theme's `theme.css`, not in `base.css`.
- `base.css` must stay literal-free; if a shared utility needs a new colour, add a token and require it from every theme (and list it in plan 018's SKILL.md).
- CSS output lives in `dist/css/`, outside `dist/<theme>/`, because `build.mjs` wipes the theme folder on every build.
- Fonts and the Phosphor icon CSS are still loaded from third-party CDNs by `head-assets.html`; self-hosting is a separate decision.
