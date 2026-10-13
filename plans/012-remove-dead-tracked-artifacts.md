# Plan 012: Remove committed dead artifacts (`repomix-output.xml`, `satumomen.html`)

> **Executor instructions**: Follow this plan step by step. Run every
> verification command and confirm the expected result before moving to the
> next step. If anything in "STOP conditions" occurs, stop and report — do not
> improvise. When done, update the status row for this plan in
> `plans/README.md` — unless a reviewer dispatched you and told you they
> maintain the index.
>
> **Drift check (run first)**: `git diff --stat 78eddce..HEAD -- repomix-output.xml src/chinese-java/satumomen.html`
> If any in-scope file changed since this plan was written, compare the
> "Current state" excerpts against the live code before proceeding; on a
> mismatch, treat it as a STOP condition.

## Status

- **Priority**: P3
- **Effort**: S
- **Risk**: MED
- **Depends on**: none
- **Category**: tech-debt
- **Planned at**: commit `78eddce`, 2026-10-13

## Why this matters

Two large, unneeded files are tracked:

- `repomix-output.xml` (~243 KB) is a generated snapshot used to run the audit that produced the `plans/` folder. It is already excluded by `.repomixignore`; the generated copy is not a runtime input.
- `src/chinese-java/satumomen.html` (~125 KB) is a vendored third-party invitation sample (satumomen.com) that `build.mjs` never reads — only themes with `src/content/<theme>.json` are built.

Both inflate clone/review cost and, worse, the vendored sample embeds a Cloudflare beacon token string and remote CDN asset URLs that look like project source. Removing them leaves only the four templates the build actually uses.

## Current state

- `repomix-output.xml` — tracked at repository root; 243 KB. `.repomixignore` already excludes `node_modules`, `.agents`, etc., and names `src/chinese-java/satumomen.html` for repomix output, which indicates it is treated as external material.
- `src/chinese-java/satumomen.html` — tracked; 125 KB; contains no template placeholders and is not listed in `theme.json`'s `modes`.
- Neither file is referenced by `build.mjs`, any script, or any workflow:
  - `grep -R "repomix-output.xml\|satumomen.html" .github scripts build.mjs src/content src/chinese-java/*.html` returns no matches (the only matches are inside `satumomen.html` itself and `.repomixignore`).

## Commands you will need

| Purpose | Command | Expected |
|---|---|---|
| Check references | `grep -R "repomix-output.xml\|satumomen.html" .github scripts build.mjs src` (excluding the file itself) | `src/chinese-java/satumomen.html` self-match and `.repomixignore` only |
| Remove | `git rm repomix-output.xml 'src/chinese-java/satumomen.html'` | exit 0 |
| Build | `bun run build` | exit 0 |
| Check | `bun run check` | exit 0, no problems |

## Scope

**In scope** (the only files you should modify):
- `repomix-output.xml` (delete)
- `src/chinese-java/satumomen.html` (delete)

**Out of scope** (do NOT touch, even though they look related):
- `.repomixignore` — its entries remain correct even after deletion.
- The four real templates (`scroll.html`, `swipe.html`, `zoom.html`) and their partials.
- `src/shared/*` scripts.
- `build.mjs`, `scripts/*`, `.github/*`.

## Git workflow

- Branch: `advisor/012-remove-dead-artifacts`
- Commit message style: imperative, as in prior plans (`Remove committed dead artifacts`).
- Do NOT push or open a PR unless the operator instructed it.

## Steps

### Step 1: Confirm the files are unreferenced

1. `grep -R "repomix-output.xml" --exclude-dir=node_modules --exclude-dir=.git . 2>/dev/null`
   - Acceptable matches: `.repomixignore` only (and this plan file under `plans/`).
2. `grep -R "satumomen.html" --exclude-dir=node_modules --exclude-dir=.git . 2>/dev/null`
   - Acceptable matches: `.repomixignore` and `src/chinese-java/satumomen.html` itself only.

**Verify**: no `.github/`, `scripts/`, `build.mjs`, or other `src/` file references either path.

### Step 2: Remove them

1. `git rm repomix-output.xml 'src/chinese-java/satumomen.html'`
2. `git status --short`
   - Expected: two `D` lines, no other in-scope changes.

**Verify**: `test ! -e repomix-output.xml && test ! -e src/chinese-java/satumomen.html && echo ok` → `ok`.

### Step 3: Rebuild to prove the build still produces the same pages

1. `bun run build`
2. `bun run check`
3. `test -f dist/index.html && grep -c 'href="chinese-java/' dist/index.html` → `3`

**Verify**: all commands exit 0 (the grep exit status is 1 only because it counts matches; use `... ; true` if your runner aborts on non-zero).

## Test plan

The existing `check-build.mjs` already verifies every built page references only files that exist; since the removed files were never built or referenced, the check is unchanged. No new tests are needed. If the operator wants a regression guard against re-adding large binaries, that is out of scope for this plan.

## Done criteria

- [ ] `test ! -e repomix-output.xml && test ! -e src/chinese-java/satumomen.html`
- [ ] `git ls-files repomix-output.xml src/chinese-java/satumomen.html` returns no paths
- [ ] `bun run build && bun run check` exit 0
- [ ] `grep -c 'href="chinese-java/' dist/index.html` → `3`
- [ ] No files outside the in-scope list are modified (`git status`)
- [ ] `plans/README.md` status row updated

## STOP conditions

- A search in step 1 finds a reference in `build.mjs`, scripts, workflow, templates, or partials — read it; the file may be load-bearing after all.
- The Cloudflare beacon token in `satumomen.html` is needed by the operator (ask before deleting — but still recommend removal either way).
- `bun run build` or `bun run check` fails after removal. This should not happen because the files were never built; failure means a hidden reference exists (STOP and report, do not improvise).
- The operator explicitly wants to keep `satumomen.html` as a design reference. In that case mark this plan REJECTED in `plans/README.md` with reason "kept as reference" and delete only `repomix-output.xml`.

## Maintenance notes

- Deleted files remain recoverable via git history; nothing is permanently lost.
- `.repomixignore` can stay as-is even after deletion — extra ignore entries are harmless.
- If a future repomix run is needed, regenerate `repomix-output.xml` locally and do not commit it; consider adding it to `.gitignore` if accidental commits recur.
