# Plan 015: Move the story and bank-row markup out of `build.mjs` into per-theme fragment files

> **Executor instructions**: Follow this plan step by step. Run every
> verification command and confirm the expected result before moving to the
> next step. If anything in "STOP conditions" occurs, stop and report — do not
> improvise. When done, update the status row for this plan in
> `plans/README.md` unless a reviewer told you they maintain the index.
>
> **Drift check (run first)** — compare against the snapshot this plan was written from:
> - `grep -n "^const fragments = {" build.mjs` → 1 match
> - `grep -n "{{@" src/chinese-java/*.html` → exactly six lines: `{{@story data-in="up"}}` and `{{@banks}}` in swipe.html and zoom.html, and `{{@story}}` (no attributes) and `{{@banks}}` in scroll.html
> - `grep -n "unknown fragment" build.mjs` → 1 match
>
> Any mismatch is a STOP condition.

## Status

- **Priority**: P1
- **Effort**: S
- **Risk**: LOW (output must be token-identical; step 3 proves it)
- **Depends on**: none
- **Category**: tech-debt
- **Planned at**: snapshot `repomix-output.xml` of 2026-10-14 (no git SHA available to the planner)

## Why this matters

The HTML for the story timeline and the bank-account rows lives inside `build.mjs` as JavaScript template strings full of Chinese Java styling (`text-gold-ink`, `font-display`, `grid-cols-[72px_1fr]`, `assets/bank.svg`). A new theme that wants a different timeline or bank row cannot change them without editing the shared build script, which would change every other theme too. After this plan each theme owns these two pieces of markup as plain HTML files next to its templates, and `build.mjs` only knows how to repeat a fragment once per list item.

## Current state

- `build.mjs` (the `fragments` object, exact current text):
  ```js
  const fragments = {
      story: (c, a) => c.story.map(s => `<li ${a ? a + " " : ""}class="grid grid-cols-[72px_1fr] gap-x-4 py-3">
      <span class="font-display text-[32px] font-semibold italic leading-none text-gold-ink tabular-nums">${esc(s.year)}</span>
      <div>
          <h3 class="text-sm font-semibold">${esc(s.title)}</h3>
          <p class="mt-1 text-sm text-muted">${esc(s.text)}</p>
      </div>
  </li>`).join("\n"),
      banks: c => c.banks.map(b => `<div class="flex items-center gap-3 py-3">
      <img src="assets/bank.svg" alt="Logo ${esc(b.bank)}" class="w-14 shrink-0 object-contain">
      <div class="min-w-0 flex-1">
          <p class="text-lg font-semibold tabular-nums">${esc(b.number)}</p>
          <p class="text-sm text-muted">${esc(b.bank)} · a.n. ${esc(b.name)}</p>
      </div>
      <button data-copy="${esc(b.number)}" class="tlink">Salin</button>
  </div>`).join("\n"),
  };
  ```
- `render()` in `build.mjs`, the fragment pass (exact):
  ```js
  html = html.replace(/\{\{@(\w+)([^}]*)\}\}/g, (_, name, attrs) => {
      if (!fragments[name]) throw new Error(`${file}: unknown fragment @${name}`);
      return fragments[name](c, attrs.trim());
  });
  ```
  and `render(html, c, vars, file, theme)` already receives `theme`.
- Templates call `{{@story data-in="up"}}` (swipe and zoom) or `{{@story}}` with no attributes (scroll), and `{{@banks}}` (inside the gift panel, all three modes). With no attributes `{{.attrs}}` must produce an empty string so the output is `<li class=...>`.
- Content shapes: `story` is a list of `{year, title, text}` whose text may contain `{{year}}` / `{{dateFull}}` (resolved later by the scalar pass, because the fragment pass runs first and `esc()` leaves braces alone). `banks` is a list of `{bank, number, name}`.
- Class names in these fragments are compiled by Tailwind because `src/styles/main.css` has `@source "../../build.mjs";` and `@source "../chinese-java/**/*.html";` — after this plan the classes live in `src/chinese-java/fragments/*.html`, which the second glob already covers. **Leave the `build.mjs` source line in place** (the generated `dist/index.html` template in `build.mjs` still uses classes; plan 016 removes that dependency).
- Placeholder vocabulary already in use: `{{key}}` scalars, `{{a.b}}` content paths, `{{@name attrs}}` fragments, `{{> file}}` partials. This plan adds item fields inside fragment files only, written `{{.field}}` (leading dot) so they can never collide with a global like `{{year}}`.

## Commands you will need

| Purpose | Command | Expected |
|---|---|---|
| Build | `bun run build` | prints three `built dist/chinese-java/...` lines, exit 0 |
| Checks | `bun run check` | exit 0 |

## Scope

**In scope**: `build.mjs`, `src/chinese-java/fragments/story.html` (create), `src/chinese-java/fragments/banks.html` (create).

**Out of scope** (do NOT touch): templates, partials, content JSON, `src/styles/main.css`, other scripts, the `indexHtml` function.

## Git workflow

- Branch `advisor/015-fragments-to-files`; one commit; plain imperative message.
- Do NOT push or open a PR unless the operator instructed it.

## Steps

### Step 1: Take a baseline

`bun run build`, then `B="${TMPDIR:-/tmp}/p015"; mkdir -p "$B" && rm -rf "$B/before" && cp -r dist "$B/before"`. Every later diff uses `$B/before`.

### Step 2: Create the two fragment files

`src/chinese-java/fragments/story.html` (one list item; `{{.attrs}}` is where call-site attributes go):

```html
<li {{.attrs}}class="grid grid-cols-[72px_1fr] gap-x-4 py-3">
    <span class="font-display text-[32px] font-semibold italic leading-none text-gold-ink tabular-nums">{{.year}}</span>
    <div>
        <h3 class="text-sm font-semibold">{{.title}}</h3>
        <p class="mt-1 text-sm text-muted">{{.text}}</p>
    </div>
</li>
```

`src/chinese-java/fragments/banks.html`:

```html
<div class="flex items-center gap-3 py-3">
    <img src="assets/bank.svg" alt="Logo {{.bank}}" class="w-14 shrink-0 object-contain">
    <div class="min-w-0 flex-1">
        <p class="text-lg font-semibold tabular-nums">{{.number}}</p>
        <p class="text-sm text-muted">{{.bank}} · a.n. {{.name}}</p>
    </div>
    <button data-copy="{{.number}}" class="tlink">Salin</button>
</div>
```

Keep the text byte-for-byte as shown (note `{{.attrs}}class=` has no space before `class` — the code below adds the trailing space when attributes exist).

**Verify**: `ls src/chinese-java/fragments` → `banks.html story.html`.

### Step 3: Replace the `fragments` object with a file-based renderer

In `build.mjs`:

1. Delete the whole `const fragments = { ... };` block and its leading comment line (`/** repeating markup; ... */`).
2. Put this in its place:
   ```js
   /** repeating markup: {{@name attrs}} renders src/<theme>/fragments/<name>.html once per item of content[name].
    *  Inside the file {{.field}} is an escaped item field and {{.attrs}} the attrs written at the call site. */
   function fragment(name, attrs, c, theme, file) {
       const p = join(SRC, theme, "fragments", `${name}.html`);
       if (!existsSync(p)) throw new Error(`${file}: unknown fragment @${name} (expected ${p})`);
       if (!Array.isArray(c[name])) throw new Error(`${file}: content.${name} must be a list for @${name}`);
       const tpl = readFileSync(p, "utf8").trimEnd();
       return c[name].map(item => tpl.replace(/\{\{\.(\w+)\}\}/g, (_, f) => {
           if (f === "attrs") return attrs ? attrs + " " : "";
           if (item[f] === undefined) throw new Error(`${p}: item has no "${f}"`);
           return esc(item[f]);
       })).join("\n");
   }
   ```
3. In `render()` replace the fragment pass with:
   ```js
   html = html.replace(/\{\{@(\w+)([^}]*)\}\}/g, (_, name, attrs) => fragment(name, attrs.trim(), c, theme, file));
   ```

**Verify**: `bun run build` exits 0. For each mode `m` in `scroll swipe zoom`:
`diff <(tr -s ' \t\r\n' '\n' < "$B/before/chinese-java/$m.html") <(tr -s ' \t\r\n' '\n' < dist/chinese-java/$m.html)` → **no output** (identical apart from whitespace). Any hunk is a STOP condition.
Then `grep -n "fragments\[" build.mjs` → no output and `bun run check` → exit 0.

### Step 4: Prove the error messages

- Temporarily rename `src/chinese-java/fragments/banks.html` → `banks.html.bak`; `node build.mjs chinese-java` → fails with `unknown fragment @banks (expected src/chinese-java/fragments/banks.html)`. Rename back.
- Temporarily edit `banks.html` to contain `{{.nope}}`; build fails with `item has no "nope"`. Undo.

**Verify**: `bun run build && bun run check` → exit 0 and `git status` shows only the in-scope files.

## Test plan

The whitespace-insensitive diff against the pre-change build (step 3) is the regression test; step 4 covers the new error paths. No framework is added.

## Done criteria

- [ ] `bun run build && bun run check` exit 0
- [ ] Token diffs for swipe, scroll and zoom against `$B/before` are empty
- [ ] `grep -c "fragments = " build.mjs` → `0`; `ls src/chinese-java/fragments` lists both files
- [ ] Only in-scope files modified
- [ ] `plans/README.md` status row updated

## STOP conditions

- Any drift-check mismatch (for example a template already calls a fragment other than `story` or `banks`).
- A token diff shows any hunk after step 3.
- A template needs a fragment attribute syntax this renderer cannot express (report the exact call).

## Maintenance notes

- A new theme provides its own `fragments/story.html` and `fragments/banks.html` (or any other list fragment: add a list to the content JSON, a file named after it, and `{{@name}}` in a template).
- `{{.field}}` values are HTML-escaped; `{{year}}`-style globals inside item *values* still resolve in the later scalar pass.
- Plan 016 removes the last Tailwind dependency on `build.mjs` (the index page); until then keep `@source "../../build.mjs"` in `src/styles/main.css`.
