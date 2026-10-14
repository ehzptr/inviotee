# Plan 018: Write the theme-authoring guide (`SKILL.md` + README section) and remove `NOTE.md`

> **Executor instructions**: Follow this plan step by step. Run every
> verification command and confirm the expected result before moving to the
> next step. If anything in "STOP conditions" occurs, stop and report — do not
> improvise. When done, update the status row for this plan in
> `plans/README.md` unless a reviewer told you they maintain the index.
>
> **Drift check (run first)** — compare against the snapshot this plan was written from (plus plans 014–017):
> - `grep -n '"new-theme"' package.json` → 1 match, and `test -f scripts/check-theme.mjs && test -f src/styles/base.css && test -f src/chinese-java/theme.css && echo ok` → `ok` (plans 014–017 are DONE). Otherwise STOP.
> - `cat NOTE.md` → exactly one line: `[ ] Create SKILL.md in root project for creating new theme using AI`. If it has other content, STOP.
> - `test ! -e SKILL.md && echo ok` → `ok`
> - `grep -n "^## " README.md` → contains `## Guest links` and `## Deploy`

## Status

- **Priority**: P2
- **Effort**: S
- **Risk**: LOW (documentation only, plus deleting one note file)
- **Depends on**: plans/017-new-theme-scaffold-and-neutral-head.md (also needs 014 and 016 to be DONE)
- **Category**: docs
- **Planned at**: snapshot `repomix-output.xml` of 2026-10-14 (no git SHA available to the planner)

## Why this matters

The rules for a theme are spread over `build.mjs`, `scripts/check-theme.mjs`, `src/shared/*.js` and the reference theme. Someone adding a theme (or an AI assistant asked to) has to reverse-engineer which element ids are mandatory, which colour tokens must exist, which files they may and may not edit, and how to know they are done. `NOTE.md` records the intent: "Create SKILL.md in root project for creating new theme using AI". This plan writes that guide once, as `SKILL.md` at the repo root (readable by people and by AI agents), and points the README at it.

## Current state

- `NOTE.md` (root) — one line: `[ ] Create SKILL.md in root project for creating new theme using AI`.
- `README.md` — sections: intro, `## Quick start`, `## How it works` (bullets for templates, content, `theme.json`, CSS files from plan 016, `build.mjs`), `## Guest links`, `## Deploy`. It ends the "How it works" list with the sentence `To make an invitation for a new couple, copy src/content/chinese-java.json, edit the values, and rebuild.`
- The facts this guide must state are enforced by code that exists after plans 014–017 (the guide must agree with them; Step 3 checks that mechanically):
  - `scripts/new-theme.mjs` (`bun run new-theme <slug> "<Label>"`) — scaffolds `src/<slug>/` and `src/content/<slug>.json` from `chinese-java`.
  - `scripts/check-theme.mjs` — the `NEEDS` table (DOM hooks per shared script) and `GLOBALS` (names each mode page script must declare); `scripts/check-build.mjs` — no unreplaced `{{…}}`, every local `src`/`href` exists; `scripts/check-css.mjs` — every class used has a rule in `dist/css/<theme>.css`; `scripts/check-js.mjs` — inline scripts parse.
  - Theme folder layout: `src/<theme>/{swipe,scroll,zoom}.html`, `theme.json`, `theme.css`, `partials/`, `fragments/{story,banks}.html`, `assets/`; shared, theme-independent code: `src/shared/*.js`, `src/styles/base.css`, `build.mjs`.
  - Colour tokens `base.css` needs from every theme (defined in `src/chinese-java/theme.css`): `cream`, `paper`, `shell`, `ink`, `ink-hover`, `muted`, `gold`, `gold-ink`, `seal`, `danger`, `scrim`; fonts `--font-sans`, `--font-display`; motion `--motion-fast`, `--motion-ui`, `--motion-slow`, `--ease-out-ui`, `--ease-in-out-ui`, `--ease-drawer`.
  - Content keys used by the templates (from `src/content/chinese-java.json`): `date`, `rsvpDeadline`, `groom.{nick,name,parents,ig}`, `bride.{nick,name,parents,ig}`, `verse.{text,source}`, `wish.{text,source}`, `event.{akad,resepsi,calendarStart,calendarEnd}`, `venue.{name,address}`, `story[]` of `{year,title,text}`, `banks[]` of `{bank,number,name}`, `gift.address`, `music.label`; `build.mjs` derives `{{short}}`, `{{dateLong}}`, `{{dateFull}}`, `{{dateDay}}`, `{{dateWeekday}}`, `{{dateMonthYear}}`, `{{year}}`, `{{rsvpDeadline}}`, `{{countdownIso}}`, `{{venue.q}}`, `{{calendarUrl}}`; and `{{theme.name}}`, `{{theme.label}}`, `{{theme.description}}` come from `theme.json` / the folder name.
- Page-colour literals that live outside the CSS tokens and must be updated by hand per theme: `partials/head-assets.html` (`theme-color` meta, favicon colour, font links) and `partials/loader.html` (background before CSS loads).
- Docs convention: short imperative sentences, fenced `bash` blocks, backticked paths (see `README.md`).

## Commands you will need

| Purpose | Command | Expected |
|---|---|---|
| Hook names present in guide | the `for` loop in Step 3 | no output |
| Build and checks | `bun run build && bun run check` | exit 0 |

## Scope

**In scope**: `SKILL.md` (create), `README.md` (add a section and two bullets), `NOTE.md` (delete).

**Out of scope** (do NOT touch): any script, template, CSS, `PRODUCT.md`, `skills-lock.json`, the `.claude`/`.codex`/`.github/hooks` folders.

## Git workflow

- Branch `advisor/018-theme-guide`; one commit; plain imperative message.
- Do NOT push or open a PR unless the operator instructed it.

## Steps

### Step 1: Create `SKILL.md`

Create `SKILL.md` at the repo root with exactly this content:

````markdown
---
name: new-invitation-theme
description: Create or restyle an inviotee invitation theme (own look, same features). Use when asked to add, design or change a theme in this repo.
---

# Create a new inviotee theme

A theme is a folder `src/<theme>/` plus `src/content/<theme>.json`. The build (`build.mjs`) and the shared scripts are the same for every theme, so a new theme changes **looks and markup only**.

## Read first

- `PRODUCT.md` — who uses this and the constraints (static site, mobile-first, guest links via `?to=`).
- `src/chinese-java/DESIGN.md` — the reference theme's design system. It is the starting point, not the look to copy.
- `src/<theme>/DESIGN.md` if it already exists (the Batak Dayak seed does).

## Steps

1. **Scaffold**: `bun run new-theme <slug> "<Label>"` (slug: lowercase letters, digits, dashes). It copies the reference theme, so the result builds and passes the checks right away. A theme marked `"stub": true` in its `theme.json` is replaced and keeps its `DESIGN.md`.
2. **Content**: edit `src/content/<slug>.json` (it holds the sample couple). Keys: `date` (`YYYY-MM-DD`), `rsvpDeadline`, `groom` and `bride` (`nick`, `name`, `parents` list, `ig`), `verse` and `wish` (`text`, `source`), `event` (`akad`, `resepsi`, `calendarStart`/`calendarEnd` as `HH:MM`), `venue` (`name`, `address`), `story` (list of `year`, `title`, `text`), `banks` (list of `bank`, `number`, `name`), `gift.address`, `music.label`. Lists such as `parents` are joined with line breaks.
3. **Palette and type**: edit the `@theme` block in `src/<slug>/theme.css`. These tokens must all exist because the shared styles use them: `--color-cream` (page), `paper` (raised surface), `shell` (desktop backdrop), `ink` (text and primary buttons), `ink-hover`, `muted` (secondary text), `gold` (accent fill), `gold-ink` (accent text), `seal`, `danger`, `scrim` (dialog backdrop); `--font-sans`, `--font-display`; `--motion-fast`, `--motion-ui`, `--motion-slow`, `--ease-out-ui`, `--ease-in-out-ui`, `--ease-drawer`. Keep text contrast at 4.5:1 or better for `ink` on `cream` and `paper`, `muted` on `cream`, `gold-ink` on `cream`, and `paper` on `ink` (button text). Then update the page-colour values that live outside the tokens: in `partials/head-assets.html` the `theme-color` meta, the favicon colour and the font links, and in `partials/loader.html` the background shown before the CSS loads.
4. **Markup**: restyle `swipe.html`, `scroll.html`, `zoom.html`, `partials/*.html` and `fragments/*.html` (one list item for `story`, one for `banks`; `{{.field}}` is an item field, `{{.attrs}}` is where call-site attributes go). Keep every `{{placeholder}}` and every `{{> partial}}` include. Use Tailwind classes built from your tokens (`bg-cream`, `text-ink`, `text-gold-ink`, `font-display`, …); `btn`, `btn-ghost`, `tlink`, `field`, `float`, `nav-chip`, `act-btn` come from `src/styles/base.css`.
5. **Assets**: replace the files in `src/<slug>/assets/`. Keep the names the templates use (`bg.svg`, `frame-tl/tr/bl/br.svg`, `logo.svg`, `bank.svg`, `photo-1.svg` … `photo-7.svg`, `music.wav`) or update every reference; `bun run check` fails on a missing file.
6. **Loop until green**: `bun run build && bun run check`. Read the message, fix the theme, repeat. Then run `bun run dev` and look at all three modes at phone width (about 390px) and at 1280px or wider (swipe and zoom show a framed canvas there).
7. **Clean up leftovers**: `grep -rniE "chinese|kawung|java" src/<slug>` and remove or replace what is Chinese-Java-specific (copy, motifs in the `zoom.html` script, the `grain` utility in `theme.css`). Write `src/<slug>/DESIGN.md` describing the finished look.

## The contract the shared scripts rely on

Every mode page must contain these DOM hooks for the shared script it includes (`{{> name.js}}`); a missing one throws on load and stops the page script. `bun run check` verifies them.

| Shared script | Needs |
|---|---|
| `music.js` | `#music`, `#btnMusic` |
| `countdown.js` | `#countdown`, `#cdDone` |
| `tabs.js` | `[data-gift]`, `[data-gift-panel]`, `[data-rt]`, `[data-rp]` |
| `lightbox.js` | `[data-lb]`, `#lbImg`, `#lbPrev`, `#lbNext`, `#dlgLb` |
| `qr.js` | `#btnQr`, `#qrBox` |
| `rsvp.js` | `#rsvpForm`, `#rsvpStatus`, `#rsvpSend`, `#tplComment`, `#noComments`, `#comments`, `#cCount`, `#rCode`, `#rPhone`, `#rMsg` |
| `guest.js`, `copy.js` | nothing mandatory (`[data-guest]`, `[data-group]`, `[data-copy]` are optional) |

Each mode's own page script must declare `$`, `$$`, `k`, `stopAuto`, `openDlg` and a variable named `opened`, because the shared scripts call them.

## Do not

- Edit `src/shared/*`, `src/styles/base.css` or `build.mjs` to change one theme's look. They serve every theme; if a theme truly needs a change there, make it a separate, reviewed change that keeps the other themes passing.
- Put colour literals into `base.css`; add a token and require it from every theme instead.
- Delete the `{{theme.*}}`-driven `<title>` and meta tags, or hard-code the theme name in templates.
- Leave `"stub": true` in a theme that is meant to ship (it switches the checks off).

## Done when

`bun run build && bun run check` exits 0, the three modes look right at phone and desktop widths, and `grep -rniE "chinese|kawung|java" src/<slug>` has nothing left that does not belong.
````

**Verify**: `head -4 SKILL.md` shows the `---` frontmatter with `name: new-invitation-theme`; `grep -c "" SKILL.md` → between `45` and `70` lines.

### Step 2: Update `README.md`

1. In the `## How it works` bullet list, after the bullet that describes `src/<theme>/{swipe,scroll,zoom}.html`, add these three bullets (adjust only the leading `-` style if the file uses another):
   ```
   - `src/<theme>/partials/*.html` and `src/<theme>/fragments/*.html` — theme-owned markup included with `{{> name.html}}` (once) or `{{@name}}` (once per list item in the content file).
   - `src/shared/*.js` — behaviour shared by every theme and mode (music, countdown, RSVP, tabs, lightbox, QR), included with `{{> name.js}}`.
   - `scripts/check-*.mjs` — the checks behind `bun run check`, including the theme contract (`check-theme.mjs`).
   ```
2. Add a new section directly before `## Guest links`:
   ````
   ## Add a theme

   ```bash
   bun run new-theme my-theme "My Theme"   # copies chinese-java to src/my-theme and src/content/my-theme.json
   bun run dev                              # preview while you edit theme.css, templates, assets and content
   bun run check                            # must pass; it enforces the theme contract
   ```

   The step-by-step guide, including the colour tokens and DOM hooks a theme must provide, is in [SKILL.md](SKILL.md) (written so an AI assistant can follow it too).
   ````

**Verify**: `grep -n "^## " README.md` → the new `## Add a theme` appears immediately before `## Guest links`; `grep -c "SKILL.md" README.md` → `1`.

### Step 3: Prove the guide matches the code

1. Every DOM hook the check enforces is documented (this prints nothing when the guide is complete):
   `for h in '#music' '#btnMusic' '#countdown' '#cdDone' '[data-gift]' '[data-gift-panel]' '[data-rt]' '[data-rp]' '[data-lb]' '#lbImg' '#lbPrev' '#lbNext' '#dlgLb' '#btnQr' '#qrBox' '#rsvpForm' '#rsvpStatus' '#rsvpSend' '#tplComment' '#noComments' '#comments' '#cCount' '#rCode' '#rPhone' '#rMsg'; do grep -qF -- "$h" SKILL.md || echo "SKILL.md lacks $h"; grep -qF -- "\"$h\"" scripts/check-theme.mjs || echo "check-theme.mjs lacks $h"; done`
2. Every colour token the guide lists exists in the reference theme:
   `for t in cream paper shell ink ink-hover muted gold gold-ink seal danger scrim; do grep -q -- "--color-$t:" src/chinese-java/theme.css || echo "theme.css lacks --color-$t"; done`
3. Every content key the guide lists exists in the reference content: `node -e 'const c=require("./src/content/chinese-java.json");const g=(o,p)=>p.split(".").reduce((x,k)=>x?.[k],o);const miss=["date","rsvpDeadline","groom.nick","groom.name","groom.parents","groom.ig","bride.nick","bride.name","bride.parents","bride.ig","verse.text","verse.source","wish.text","wish.source","event.akad","event.resepsi","event.calendarStart","event.calendarEnd","venue.name","venue.address","story","banks","gift.address","music.label"].filter(p=>g(c,p)===undefined);console.log(miss.join(" ")||"ok")'` → `ok`.
4. Every asset name the guide lists is real: `for a in bg frame-tl frame-tr frame-bl frame-br logo bank photo-1 photo-7; do test -f src/chinese-java/assets/$a.svg || echo "missing $a.svg"; done; test -f src/chinese-java/assets/music.wav || echo "missing music.wav"`.

**Verify**: all four commands print nothing (command 3 prints `ok`). If a line appears, fix the guide (never the code) so it matches reality, and mention it in your report.

### Step 4: Remove `NOTE.md`

`rm NOTE.md` (its only item is done).

**Verify**: `test ! -e NOTE.md && echo gone` → `gone`; `grep -rn "NOTE.md" --exclude-dir=node_modules --exclude-dir=dist --exclude-dir=.git --exclude-dir=plans --exclude-dir=animation-plans .` → no output (if a file still mentions it, report it instead of editing out-of-scope files).

## Test plan

Step 3 is the test: it cross-checks the guide's hook list against `scripts/check-theme.mjs`, its token list against `theme.css`, its content keys against the reference content and its asset names against the assets folder. Optional end-to-end: ask an AI assistant to follow `SKILL.md` to create a throwaway theme; `bun run check` is the acceptance test.

## Done criteria

- [ ] `SKILL.md` exists with frontmatter and 45–70 lines
- [ ] Step 3's four commands print nothing (or `ok`)
- [ ] `README.md` has `## Add a theme` before `## Guest links` and links `SKILL.md`
- [ ] `NOTE.md` is gone
- [ ] `bun run build && bun run check` exit 0
- [ ] Only in-scope files modified
- [ ] `plans/README.md` status row updated

## STOP conditions

- Any drift-check mismatch (especially if `NOTE.md` has more than the one line).
- Step 3 finds a mismatch you cannot resolve by editing the guide.
- You are tempted to change a script or template to match the guide.

## Maintenance notes

- This guide is now part of the contract: whoever changes `NEEDS`/`GLOBALS` in `scripts/check-theme.mjs`, the token set in `base.css`, or the content keys must update `SKILL.md` in the same change (Step 3's loops can be reused as a quick check).
- If the project later adds a theme-specific design linter or screenshots, add the command to step 6 of the guide.
- To let Claude Code load it as a skill automatically, a copy can live at `.claude/skills/new-invitation-theme/SKILL.md`; it is kept at the repo root here because that is where `NOTE.md` asked for it.
