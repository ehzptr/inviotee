# Plan 014: Validate theme contract and content at build time (`check-theme`, friendly content errors)

> **Executor instructions**: Follow this plan step by step. Run every
> verification command and confirm the expected result before moving to the
> next step. If anything in "STOP conditions" occurs, stop and report — do not
> improvise. When done, update the status row for this plan in
> `plans/README.md` unless a reviewer told you they maintain the index.
>
> **Drift check (run first)** — compare against the snapshot this plan was written from:
> - `grep -c "continue;" build.mjs` → at least 1, and `grep -n "!existsSync(contentFile)) continue" build.mjs` → 1 match
> - `grep -n '"check"' package.json` → 1 match containing `check-build.mjs`
> - `ls scripts` → contains `check-build.mjs check-css.mjs check-js.mjs dev-server.mjs`
> - `grep -c "tplComment\|qrBox" src/chinese-java/partials/*.html` → non-zero
>
> Any mismatch is a STOP condition.

## Status

- **Priority**: P1
- **Effort**: S
- **Risk**: LOW
- **Depends on**: none (plans 001–013 are DONE)
- **Category**: tests / dx
- **Planned at**: snapshot `repomix-output.xml` of 2026-10-14 (no git SHA available to the planner)

## Why this matters

A new theme has to satisfy an unwritten contract: the shared scripts in `src/shared/*.js` look up specific element ids and attributes while the page loads, and rely on a few functions the page's own script must define. Break any of it and the browser throws a `TypeError`, the page script stops, and nothing in `bun run check` notices (the checks only verify syntax, CSS classes, placeholders and file references). Content problems are just as unfriendly: a missing key surfaces as `Cannot read properties of undefined (reading 'nick')` with no file name. And a theme whose content file is misnamed is silently skipped, so CI stays green while the theme never ships. This plan makes the contract explicit and enforced, which is the foundation for adding themes safely (and for letting an AI agent iterate until the check passes).

## Current state

- `build.mjs` — theme loop (top-level `for (const theme of await readdir(SRC))`). Today:
  ```js
  for (const theme of await readdir(SRC)) {
      const contentFile = join(SRC, "content", `${theme}.json`);
      if ((only && theme !== only) || !existsSync(contentFile)) continue;
      const content = JSON.parse(await readFile(contentFile, "utf8"));
      const meta = JSON.parse(await readFile(join(SRC, theme, "theme.json"), "utf8"));
      const { modes } = meta;
      built.push({ name: theme, label: meta.label ?? theme, description: meta.description ?? "", modes });
      const vars = scalars(content);
  ```
  `scalars(c)` reads `c.date`, `c.groom.nick`, `c.bride.nick`, `c.venue.name`, `c.venue.address`, `c.rsvpDeadline`, `c.event.calendarStart`, `c.event.calendarEnd`; the `fragments` object reads `c.story` and `c.banks` (lists).
- `src/` directories that are not themes: `content/`, `shared/`, `styles/`. A theme directory has `theme.json`.
- `src/batak-dayak/theme.json` is a one-line stub: `{"name":"batak-dayak","label":"Batak Dayak","description":"Wedding invitation Batak Dayak theme (stub)","modes":["swipe","scroll","zoom"],"metadata":{...}}`; its three templates contain only an HTML comment; it has no `src/content/batak-dayak.json`.
- `src/shared/*.js` (all are included by each mode template as `{{> name.js}}`). What each touches at load:
  - `guest.js` — defines `qs`, `guest`; fills `[data-guest]`, `[data-group]` (optional).
  - `copy.js` — delegated click on `[data-copy]` (optional).
  - `music.js` — `#music`, `#btnMusic`; uses page globals `stopAuto`, `opened`.
  - `countdown.js` — `#countdown` (with `data-datetime`), `#cdDone`, `.tabular-nums` inside the countdown.
  - `tabs.js` — `[data-gift]`, `[data-gift-panel]`, `[data-rt]`, `[data-rp]`; uses `stopAuto`, `k`, `gsap`.
  - `lightbox.js` — `[data-lb] img`, `#lbImg`, `#lbPrev`, `#lbNext`, `#dlgLb`; uses `openDlg`.
  - `qr.js` — `#btnQr` (listener attached at load: throws if missing), `#qrBox`.
  - `rsvp.js` — `#rsvpForm` (listener at load), `#rsvpStatus`, `#rsvpSend`, `#tplComment`, `#noComments`, `#comments`, `#cCount`, `#rCode`, `#rPhone`, `#rMsg`; uses `showRsvpTab` from `tabs.js`.
- Each mode page script declares, with these exact forms: `const $ = ...`, `const $$ = ...`, `const k = ...`, `function stopAuto`, `function openDlg`, and `let ... opened ...` (e.g. `let cur = 0, opened = false;`).
- Existing check scripts follow one convention: standalone `.mjs` in `scripts/`, leading comment saying what fails, `process.exit(bad ? 1 : 0)`. Model the new script on `scripts/check-build.mjs`.
- `package.json` `check` script: `node scripts/check-css.mjs && node scripts/check-js.mjs && node scripts/check-build.mjs`.

## Commands you will need

| Purpose | Command | Expected on success |
|---|---|---|
| Install | `bun install` | exit 0 |
| Build | `bun run build` | prints `built dist/chinese-java/{swipe,scroll,zoom}.html`, exit 0 |
| All checks | `bun run check` | exit 0 |
| Theme check only | `node scripts/check-theme.mjs` | prints `ok chinese-java/swipe` (and scroll, zoom), exit 0 |

## Scope

**In scope**: `build.mjs`, `scripts/check-theme.mjs` (create), `package.json` (`check` script only), `src/batak-dayak/theme.json` (add `"stub": true`).

**Out of scope** (do NOT touch): templates, partials, `src/shared/*`, CSS, the other check scripts, `.github/workflows/static.yml` (it already runs `bun run check`).

## Git workflow

- Branch `advisor/014-theme-contract-check`; two commits (build.mjs + stub flag, then the check script); plain imperative messages.
- Do NOT push or open a PR unless the operator instructed it.

## Steps

### Step 1: Friendly content validation and no silent skips in `build.mjs`

1. Directly above the `scalars` function add:
   ```js
   /** content keys read directly by scalars() and the fragments; {{keys}} used in templates are checked by render() */
   const REQUIRED = ["date", "rsvpDeadline", "groom.nick", "bride.nick", "venue.name", "venue.address", "event.calendarStart", "event.calendarEnd", "story", "banks"];
   const SHAPE = { date: /^\d{4}-\d{2}-\d{2}$/, rsvpDeadline: /^\d{4}-\d{2}-\d{2}$/, "event.calendarStart": /^\d{2}:\d{2}$/, "event.calendarEnd": /^\d{2}:\d{2}$/ };
   const pick = (o, path) => path.split(".").reduce((x, k) => x?.[k], o);
   function validate(c, file) {
       const errs = REQUIRED.filter(p => pick(c, p) === undefined).map(p => `missing ${p}`);
       for (const [p, re] of Object.entries(SHAPE)) if (pick(c, p) !== undefined && !re.test(pick(c, p))) errs.push(`${p} must match ${re}`);
       for (const p of ["story", "banks"]) if (pick(c, p) !== undefined && !Array.isArray(c[p])) errs.push(`${p} must be a list`);
       if (errs.length) throw new Error(`${file}: ${errs.join("; ")}`);
   }
   ```
2. Replace the first five lines of the theme loop body (from `const contentFile = ...` through `const { modes } = meta;`) with:
   ```js
       const themeFile = join(SRC, theme, "theme.json"), contentFile = join(SRC, "content", `${theme}.json`);
       if ((only && theme !== only) || !existsSync(themeFile)) continue; // content/, shared/, styles/ are not themes
       const meta = JSON.parse(await readFile(themeFile, "utf8"));
       if (!existsSync(contentFile)) {
           if (!meta.stub) console.warn(`skipped ${theme}: no ${contentFile} (add "stub": true to theme.json to silence this)`);
           continue;
       }
       const content = JSON.parse(await readFile(contentFile, "utf8"));
       validate(content, contentFile);
       const { modes } = meta;
   ```
   Leave the rest of the loop (`built.push(...)`, `scalars`, `rm`, `mkdir`, the mode loop, `cp`) unchanged.
3. In `src/batak-dayak/theme.json` add `"stub":true,` right after `"name":"batak-dayak",` (keep it valid JSON on one line).

**Verify**: `bun run build` → exit 0, prints the three `built dist/chinese-java/...` lines and **no** `skipped` warning. Then negative test: temporarily rename the key `"groom"` to `"groomX"` in `src/content/chinese-java.json`, run `node build.mjs chinese-java` → exits non-zero with a message starting `src/content/chinese-java.json: missing groom.nick`; rename it back and rebuild → exit 0.

### Step 2: Create `scripts/check-theme.mjs`

Create the file with exactly this content:

```js
// Fails if a built theme breaks the contract the shared scripts rely on: valid theme.json, real templates, required DOM hooks, page-level names.
// Run after `bun run build`. Themes with "stub": true in theme.json are skipped.
import { readFileSync, readdirSync, existsSync } from "node:fs";
import { join } from "node:path";

/** DOM hooks each src/shared/*.js touches while the page loads; a missing one throws and stops the whole page script */
const NEEDS = {
    "guest.js": [],
    "copy.js": [],
    "music.js": ["#music", "#btnMusic"],
    "countdown.js": ["#countdown", "#cdDone"],
    "tabs.js": ["[data-gift]", "[data-gift-panel]", "[data-rt]", "[data-rp]"],
    "lightbox.js": ["[data-lb]", "#lbImg", "#lbPrev", "#lbNext", "#dlgLb"],
    "qr.js": ["#btnQr", "#qrBox"],
    "rsvp.js": ["#rsvpForm", "#rsvpStatus", "#rsvpSend", "#tplComment", "#noComments", "#comments", "#cCount", "#rCode", "#rPhone", "#rMsg"],
};
/** names the shared scripts expect the page's own script to declare */
const GLOBALS = {
    "$": /const\s+\$\s*=/, "$$": /const\s+\$\$\s*=/, k: /const\s+k\s*=/,
    stopAuto: /function\s+stopAuto\b/, openDlg: /function\s+openDlg\b/, opened: /let\s[^;]*\bopened\b/,
};
const hook = (html, sel) => sel[0] === "#"
    ? html.includes(`id="${sel.slice(1)}"`)
    : new RegExp(`[\\s"']${sel.slice(1, -1)}(?=[\\s=>/])`).test(html); // [data-x] attribute

let bad = 0;
const fail = msg => { console.log(msg); bad++; };

for (const f of existsSync("src/shared") ? readdirSync("src/shared") : [])
    if (f.endsWith(".js") && !(f in NEEDS)) fail(`src/shared/${f}: add it to NEEDS in scripts/check-theme.mjs`);

for (const d of readdirSync("src", { withFileTypes: true }).filter(d => d.isDirectory())) {
    const dir = join("src", d.name), themeFile = join(dir, "theme.json");
    if (!existsSync(themeFile)) continue; // content/, shared/, styles/ are not themes
    const meta = JSON.parse(readFileSync(themeFile, "utf8"));
    if (meta.stub) continue;
    if (meta.name !== d.name) fail(`${themeFile}: "name" must be "${d.name}"`);
    if (!Array.isArray(meta.modes) || !meta.modes.length) { fail(`${themeFile}: "modes" must be a non-empty list`); continue; }
    for (const mode of meta.modes) {
        const label = `${d.name}/${mode}`, tplFile = join(dir, `${mode}.html`), outFile = join("dist", d.name, `${mode}.html`);
        if (!existsSync(tplFile)) { fail(`${label}: missing template ${tplFile}`); continue; }
        const tpl = readFileSync(tplFile, "utf8");
        if (!tpl.replace(/<!--[\s\S]*?-->/g, "").trim()) { fail(`${label}: template is empty (comment only)`); continue; }
        if (!existsSync(outFile)) { fail(`${label}: not built (${outFile} missing); is src/content/${d.name}.json present?`); continue; }
        const html = readFileSync(outFile, "utf8"), before = bad;
        const code = [...html.matchAll(/<script>([\s\S]*?)<\/script>/g)].map(m => m[1]).join("\n");
        const used = [...tpl.matchAll(/\{\{>\s*([\w.-]+\.js)\s*\}\}/g)].map(m => m[1]).filter(n => n in NEEDS);
        for (const name of used) for (const sel of NEEDS[name]) if (!hook(html, sel)) fail(`${label}: ${name} needs ${sel}`);
        if (used.length) {
            for (const [g, re] of Object.entries(GLOBALS)) if (!re.test(code)) fail(`${label}: page script must declare ${g}`);
            if (!/gsap(\.min)?\.js/.test(html)) fail(`${label}: gsap script tag missing`);
        }
        if (bad === before) console.log("ok", label);
    }
}
process.exit(bad ? 1 : 0);
```

**Verify**: `bun run build && node scripts/check-theme.mjs` → prints `ok chinese-java/swipe`, `ok chinese-java/scroll`, `ok chinese-java/zoom`, exit 0. If any line other than these appears on the unmodified repo, that is a STOP condition (report the exact line; do not edit templates in this plan).

### Step 3: Wire it into `check`

In `package.json` change the `check` script to end with the new check (keep the existing parts exactly, fix the indentation to two spaces like the other scripts):
`"check": "node scripts/check-css.mjs && node scripts/check-js.mjs && node scripts/check-build.mjs && node scripts/check-theme.mjs"`

**Verify**: `bun run check` → exit 0.

### Step 4: Prove it catches a broken theme

1. In `src/chinese-java/partials/qr-dialog.html` rename `id="qrBox"` to `id="qrBoxX"`. Run `bun run build && node scripts/check-theme.mjs` → exit 1 and three lines `chinese-java/<mode>: qr.js needs #qrBox`. Rename it back.
2. In `src/chinese-java/swipe.html` temporarily rename `function stopAuto` to `function stopAutoX`. Run `bun run build && node scripts/check-theme.mjs` → exit 1 with `chinese-java/swipe: page script must declare stopAuto`. Undo.
3. Final: `bun run build && bun run check` → exit 0.

## Test plan

There is no test framework; step 4's three negative tests are the tests. Do not add one.

## Done criteria

- [ ] `bun run build && bun run check` exits 0 and prints no `skipped` warning
- [ ] `node scripts/check-theme.mjs` prints exactly three `ok chinese-java/...` lines
- [ ] Negative tests in step 1 and step 4 failed as described and were undone (`git status` shows no leftover edits to templates, partials or content)
- [ ] `grep -n '"stub":true' src/batak-dayak/theme.json` → 1 match
- [ ] Only in-scope files modified
- [ ] `plans/README.md` status row updated

## STOP conditions

- Any drift-check mismatch.
- `check-theme.mjs` reports a failure on the unmodified `chinese-java` theme (the NEEDS or GLOBALS tables were derived by reading; if one is wrong, report which, do not "fix" the template).
- `build.mjs` differs from the excerpt so that step 1.2 is ambiguous.
- Making the check pass would require editing a template, partial or shared script.

## Maintenance notes

- `NEEDS` is the written contract for `src/shared/*.js`. Anyone adding a shared script must add its entry (the check fails until they do) and a new theme must provide every listed hook in every mode.
- If the mode scripts later stop declaring one of the `GLOBALS` (for example when an engine is extracted), update that table in the same change.
- Plan 016 adds one more requirement to this script (`theme.css`); plan 018's SKILL.md and README describe this contract to theme authors.
- A theme that is intentionally unfinished must say `"stub": true`; removing the flag is what turns the checks on.
