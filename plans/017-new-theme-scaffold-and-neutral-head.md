# Plan 017: Add `bun run new-theme` and make the page `<head>` theme-neutral

> **Executor instructions**: Follow this plan step by step. Run every
> verification command and confirm the expected result before moving to the
> next step. If anything in "STOP conditions" occurs, stop and report — do not
> improvise. When done, update the status row for this plan in
> `plans/README.md` unless a reviewer told you they maintain the index.
>
> **Drift check (run first)** — compare against the snapshot this plan was written from (plus plans 014–016):
> - `test -f scripts/check-theme.mjs && test -f src/chinese-java/theme.css && test -f src/chinese-java/fragments/story.html && echo ok` → `ok` (plans 014, 015, 016 are DONE). Otherwise STOP.
> - `grep -c "Chinese Java" src/chinese-java/scroll.html src/chinese-java/swipe.html src/chinese-java/zoom.html` → `2` each (the `<title>` and `og:title`)
> - `grep -c "Tema undangan pernikahan adat Cina kombinasi Jawa" src/chinese-java/scroll.html src/chinese-java/swipe.html src/chinese-java/zoom.html` → `2` each
> - `grep -c 'name="theme-color"' src/chinese-java/*.html` → `1` each
> - `grep -n 'vars\["theme.name"\]' build.mjs` → 1 match (added by plan 016)
> - `grep -rn "metadata" build.mjs scripts src/shared src/chinese-java --include=*.mjs --include=*.js --include=*.html` → no matches (the `metadata` object in `theme.json` is unused)
>
> Any mismatch is a STOP condition.

## Status

- **Priority**: P1
- **Effort**: M
- **Risk**: LOW
- **Depends on**: plans/014-theme-contract-check.md, plans/015-fragments-to-theme-files.md, plans/016-per-theme-css.md
- **Category**: dx
- **Planned at**: snapshot `repomix-output.xml` of 2026-10-14 (no git SHA available to the planner)

## Why this matters

Today a new theme means copying `src/chinese-java` by hand, renaming the content file, editing `theme.json`, then hunting for the places that still say "Chinese Java" or carry its colours: the `<title>`, `og:title` and description in all three mode templates, the `theme-color` meta, and the favicon. Nothing tells the author what they missed. After this plan, (1) those head details come from `theme.json` or live in the theme's own `head-assets.html` partial, so templates contain nothing theme-specific there, and (2) `bun run new-theme <slug> "<Label>"` creates a complete, buildable theme from the reference theme in one command, which already passes `bun run check`.

## Current state

- `src/chinese-java/{scroll,swipe,zoom}.html` — the head of each file starts like this (indentation and the favicon's full URL abbreviated with `…`; take the real text from the file):
  ```html
  <meta name="theme-color" content="#F3E1CF">
  <meta name="format-detection" content="telephone=no">

  <title>Wedding - Chinese Java (Scroll)</title>            <!-- swipe: "Wedding - Chinese Java"; zoom: "… (Zoom)" -->
  <meta name="description" content="Tema undangan pernikahan adat Cina kombinasi Jawa">
  <meta property="og:type" content="website">
  <meta property="og:title" content="Wedding - Chinese Java">
  <meta property="og:description" content="Tema undangan pernikahan adat Cina kombinasi Jawa">
  <meta property="og:image" content="">
  <link rel="icon"
      href="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 32 32'%3E…%23573E28…">

  {{> head-assets.html}}
  ```
- `src/chinese-java/partials/head-assets.html` — included once at the end of `<head>`; after plan 016 it holds the font links, the Phosphor icon stylesheet and `<link rel="stylesheet" href="../css/{{theme.name}}.css">`.
- `src/chinese-java/partials/loader.html` — has an inline `style="background:#F3E1CF; padding:24px;"` (page colour before the stylesheet loads). It is already theme-owned (lives in the theme's `partials/`); this plan leaves it alone and docs (plan 018) mention it.
- `src/chinese-java/theme.json` today:
  ```json
  {
      "name": "chinese-java",
      "label": "Chinese Java",
      "description": "Wedding invitation Chinese Java theme (original design)",
      "modes": ["swipe", "scroll", "zoom"],
      "metadata": { "couple": { "bride": "Larasati Wibowo", "groom": "Bima Prasetya" }, "date": "2027-02-21", "venue": "Gedung Melati", "venue_address": "Jl. Cempaka Putih Raya No. 17, Jakarta Pusat" }
  }
  ```
  (the real file is pretty-printed over many lines; the `metadata` object is read by nothing).
- `build.mjs` — in the theme loop, after plan 016: `const vars = scalars(content);` then `vars["theme.name"] = theme;`. `render()` resolves `{{a.b}}` by `key in vars` first, so extra dotted keys put into `vars` work as placeholders. `meta` (the parsed `theme.json`) is in scope in the loop.
- `src/content/chinese-java.json` — first key is `"theme": "chinese-java"` (informational, read by nothing); sample couple data for the reference theme.
- Existing scripts use plain node, a leading comment and `process.exit(code)`; `package.json` scripts are one-liners.

## Commands you will need

| Purpose | Command | Expected |
|---|---|---|
| Install | `bun install` | exit 0 |
| Build | `bun run build` | prints `built dist/chinese-java/{swipe,scroll,zoom}.html`, exit 0 |
| Checks | `bun run check` | exit 0 |
| Scaffold | `bun run new-theme <slug> "<Label>"` | prints `created src/<slug> ...`, exit 0 |

## Scope

**In scope**: `build.mjs` (two lines), `scripts/new-theme.mjs` (create), `package.json` (one script), `src/chinese-java/{scroll,swipe,zoom}.html` (head only), `src/chinese-java/partials/head-assets.html`, `src/chinese-java/theme.json`.

**Out of scope** (do NOT touch): `src/shared/*`, `src/styles/base.css`, `src/chinese-java/theme.css`, fragments, `src/chinese-java/partials/loader.html`, check scripts, `src/batak-dayak/*` (it is replaced later by running the scaffold, not by this plan), the workflow file.

## Git workflow

- Branch `advisor/017-new-theme`; one commit per part (steps 2–4 head changes, step 5 scaffold); plain imperative messages.
- Do NOT push or open a PR unless the operator instructed it.

## Steps

### Step 1: Baseline

`bun run build`, then `B="${TMPDIR:-/tmp}/p017"; mkdir -p "$B" && rm -rf "$B/before" && cp -r dist "$B/before"`. Every later diff uses `$B/before`.

### Step 2: Expose the theme's label and description as placeholders

In `build.mjs`, directly after the line `vars["theme.name"] = theme; ...` (from plan 016) add:

```js
vars["theme.label"] = meta.label ?? theme; vars["theme.description"] = meta.description ?? ""; // for <title>, og: tags
```

**Verify**: `grep -n 'theme.label' build.mjs` → 1 match; `bun run build` exits 0.

### Step 3: Simplify `theme.json` and use it in the templates

1. Replace `src/chinese-java/theme.json` with (4-space indent, exactly):
   ```json
   {
       "name": "chinese-java",
       "label": "Chinese Java",
       "description": "Tema undangan pernikahan adat Cina kombinasi Jawa",
       "modes": ["swipe", "scroll", "zoom"]
   }
   ```
   (The description now equals the text the templates carry today; the unused `metadata` object is dropped.)
2. In each of `scroll.html`, `swipe.html`, `zoom.html`:
   - `<title>Wedding - Chinese Java (Scroll)</title>` → `<title>Wedding - {{theme.label}} (Scroll)</title>` (swipe has no suffix, zoom has `(Zoom)`; keep each file's suffix).
   - `<meta property="og:title" content="Wedding - Chinese Java">` → `content="Wedding - {{theme.label}}"`.
   - both `content="Tema undangan pernikahan adat Cina kombinasi Jawa"` (the `description` and `og:description` metas) → `content="{{theme.description}}"`.

**Verify**: `grep -c "Chinese Java" src/chinese-java/*.html` → `0` for each; `bun run build` exits 0. For each mode `m` in `scroll swipe zoom`:
`diff <(tr -s ' \t\r\n' '\n' < "$B/before/chinese-java/$m.html") <(tr -s ' \t\r\n' '\n' < dist/chinese-java/$m.html)` → **no output**. (Index page text changes; the mode pages must not.)

### Step 4: Move the theme's colour bits into its own head partial

1. In each of the three templates delete the line `<meta name="theme-color" content="#F3E1CF">` and the whole `<link rel="icon" href="data:image/svg+xml,…">` element (it may span two lines; copy its exact text first).
2. Append those two (the `<meta>` line and the complete `<link rel="icon" …>` element, unchanged) to the **end** of `src/chinese-java/partials/head-assets.html`, one per line.

**Verify**: `grep -c 'theme-color\|rel="icon"' src/chinese-java/scroll.html src/chinese-java/swipe.html src/chinese-java/zoom.html` → `0` each; `grep -c 'theme-color\|rel="icon"' src/chinese-java/partials/head-assets.html` → `2`. `bun run build` then, because these tokens moved within `<head>`, compare as sorted token lists: for each mode `m`:
`diff <(tr -s ' \t\r\n' '\n' < "$B/before/chinese-java/$m.html" | sort) <(tr -s ' \t\r\n' '\n' < dist/chinese-java/$m.html | sort)` → **no output**. Then `bun run check` → exit 0.

### Step 5: Create the scaffold command

Create `scripts/new-theme.mjs` with exactly this content:

```js
// Usage: bun run new-theme <slug> ["Display Label"]
// Copies the reference theme (chinese-java) to src/<slug> and its content file to src/content/<slug>.json, so the new theme
// builds and passes `bun run check` immediately. A theme marked "stub": true in its theme.json is replaced (its DESIGN.md is kept).
import { cpSync, existsSync, readFileSync, readdirSync, rmSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const FROM = "chinese-java", RESERVED = ["content", "shared", "styles"];
const [slug, labelArg] = process.argv.slice(2);
const die = msg => { console.error(msg); process.exit(1); };
if (!slug || !/^[a-z][a-z0-9-]*$/.test(slug) || RESERVED.includes(slug))
    die('usage: bun run new-theme <slug> ["Display Label"]   (slug: lowercase letters, digits and dashes; not content/shared/styles)');
if (slug === FROM) die(`"${FROM}" is the reference theme`);
const label = labelArg ?? slug.replace(/-/g, " ").replace(/\b\w/g, c => c.toUpperCase());
const from = join("src", FROM), to = join("src", slug), contentFrom = join("src", "content", `${FROM}.json`), contentTo = join("src", "content", `${slug}.json`);

const stub = existsSync(join(to, "theme.json")) && JSON.parse(readFileSync(join(to, "theme.json"), "utf8")).stub;
if (existsSync(to) && !stub) die(`${to} already exists`);
if (existsSync(contentTo)) die(`${contentTo} already exists`);

if (existsSync(to)) for (const f of readdirSync(to)) if (f !== "DESIGN.md") rmSync(join(to, f), { recursive: true }); // replace a stub, keep its design notes
cpSync(from, to, { recursive: true, filter: p => p !== join(from, "DESIGN.md") }); // the reference theme's DESIGN.md describes that theme, not this one
for (const f of readdirSync(to, { recursive: true })) { // the label appears in comments and headers of the copied text files
    const p = join(to, f);
    if (/\.(html|css|js|json)$/.test(p)) writeFileSync(p, readFileSync(p, "utf8").replaceAll("Chinese Java", label));
}
const { modes } = JSON.parse(readFileSync(join(from, "theme.json"), "utf8"));
writeFileSync(join(to, "theme.json"), JSON.stringify({ name: slug, label, description: `Tema undangan ${label}`, modes }, null, 4) + "\n");
writeFileSync(contentTo, readFileSync(contentFrom, "utf8").replace(/("theme":\s*")[^"]*(")/, `$1${slug}$2`)); // sample couple data; replace it

console.log(`created ${to} and ${contentTo}
next: edit ${to}/theme.css (colours, fonts), the templates, partials, fragments and assets, and ${contentTo};
then \`bun run build && bun run check\` until it passes, and look at the pages with \`bun run dev\`.`);
```

Add to `package.json` scripts (after `"check"`, keep the others unchanged): `"new-theme": "node scripts/new-theme.mjs"`. Mind the comma on the previous line.

**Verify**: `node -e 'JSON.parse(require("fs").readFileSync("package.json","utf8"))'` exits 0.

### Step 6: Prove the scaffold works

1. Happy path: `bun run new-theme demo-theme "Demo Theme"` → prints `created src/demo-theme and src/content/demo-theme.json`.
   - `ls src/demo-theme` → `assets  fragments  partials  scroll.html  swipe.html  theme.css  theme.json  zoom.html` (no `DESIGN.md`).
   - `grep -rn "Chinese Java" src/demo-theme src/content/demo-theme.json` → no matches.
   - `grep -n '"name"\|"label"\|"stub"' src/demo-theme/theme.json` → name `demo-theme`, label `Demo Theme`, no `stub`.
   - `bun run build && bun run check` → exit 0 (the new theme builds and passes every check without edits).
   - `grep -c "demo-theme" dist/index.html` → at least `3` (listed on the index page); `grep -c "<title>Wedding - Demo Theme" dist/demo-theme/swipe.html` → `1`.
2. Cleanup: `rm -rf src/demo-theme src/content/demo-theme.json dist && bun run build` → exit 0.
3. Stub replacement: create `src/tmp-stub/theme.json` containing `{"name":"tmp-stub","stub":true}` and `src/tmp-stub/DESIGN.md` containing `keep me`; run `bun run new-theme tmp-stub` → exit 0; `cat src/tmp-stub/DESIGN.md` → `keep me`; `grep -c stub src/tmp-stub/theme.json` → `0`. Then `rm -rf src/tmp-stub src/content/tmp-stub.json dist && bun run build` → exit 0.
4. Refusals: `bun run new-theme chinese-java` → exit 1; `bun run new-theme Bad_Name` → exit 1 with the usage line; `bun run new-theme demo2 && bun run new-theme demo2` → second call exit 1 with `already exists`; then `rm -rf src/demo2 src/content/demo2.json dist && bun run build`.

**Verify**: `git status --short` lists only in-scope files (no `demo*`/`tmp-stub` leftovers); `bun run build && bun run check` → exit 0.

## Test plan

Step 6 is the test: scaffolding a theme and requiring the full build plus all checks to pass untouched is an end-to-end test of the whole theme contract. The sorted-token diffs in steps 3 and 4 guard the reference theme's output. No framework is added.

## Done criteria

- [ ] `bun run build && bun run check` exit 0
- [ ] `grep -c "Chinese Java" src/chinese-java/*.html` → `0` each; mode pages token-identical to before (steps 3–4)
- [ ] Step 6 passes in full, and `git status --short` shows no scaffold leftovers
- [ ] `grep -n '"new-theme"' package.json` → 1 match
- [ ] Only in-scope files modified
- [ ] `plans/README.md` status row updated

## STOP conditions

- Any drift-check mismatch.
- A token diff in step 3 or 4 shows any hunk.
- The scaffolded theme fails `bun run build` or `bun run check` without edits. Report the exact messages; do not edit check scripts or shared files to make it pass (that would mean plans 014–016 and this scaffold disagree).
- Tailwind in the scaffolded theme cannot resolve `@import "../styles/base.css"` (path problem).

## Maintenance notes

- The scaffold copies `chinese-java` as the reference; keep that theme building cleanly, and change `FROM` if it is ever renamed.
- A fresh theme still carries Chinese Java sample copy, kawung/coin decor in `zoom.html`, the `grain` utility in `theme.css`, and sample couple data in its content file. The authoring guide (plan 018) tells authors how to find and replace them.
- `loader.html` still holds a hard-coded page colour for the moment before CSS loads; it is part of each theme's palette checklist in plan 018.
- If more head metadata becomes theme-specific (for example an `og:image`), put it in the theme's `head-assets.html` rather than the mode templates.
