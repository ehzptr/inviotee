# 004 — Introduce motion tokens

- **Status**: TODO
- **Commit**: 91d37c4
- **Severity**: LOW
- **Category**: Cohesion / Tokens (AUDIT §7)
- **Estimated scope**: 1 file

## Problem

Motion values are hand-typed across CSS and GSAP. There are no shared tokens for easings or durations, so near-identical curves and timings cannot be changed in one place.

Evidence:
- `src/styles/main.css:34` `btn`: `transition duration-200 ... active:scale-[.97]`
- `src/styles/main.css:37` `btn-ghost`: `transition duration-200 ... active:scale-[.97]`
- `src/styles/main.css:54` `nav-chip`: `transition-colors duration-300 ...`
- GSAP easings in `src/chinese-java/swipe.html`: `back.out(1.3)`, `elastic.out(1,.5)`, `back.out(3)`, `power3.out`, `expo.out`

Recommended audit values:
- `--ease-out`: `cubic-bezier(0.23, 1, 0.32, 1)`
- `--ease-in-out`: `cubic-bezier(0.77, 0, 0.175, 1)`
- `--ease-drawer`: `cubic-bezier(0.32, 0.72, 0, 1)`
- UI durations under 300ms: buttons/popovers 100-250ms, modals/drawers 200-500ms

## Target

Add to the existing `@theme` block in `src/styles/main.css`:

```css
@theme {
    ...
    --motion-fast: 120ms;
    --motion-ui: 200ms;
    --motion-slow: 300ms;
    --ease-out-ui: cubic-bezier(0.23, 1, 0.32, 1);
    --ease-in-out-ui: cubic-bezier(0.77, 0, 0.175, 1);
    --ease-drawer: cubic-bezier(0.32, 0.72, 0, 1);
}
```

Add selector overrides after the utilities:

```css
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
```

Keep color, hover, and active behaviors identical. GSAP easings remain explicit in this pass; only CSS-side tokens are introduced.

## Repo conventions to follow

- Tailwind v4 theme variables live in `src/styles/main.css` under `@theme`.
- Utility definitions use `@utility`.
- No new dependencies or JS token plumbing.

## Steps

1. Add the six target variables to the existing `@theme` block.
2. Append the four selector override rules near the end of `src/styles/main.css`.
3. Run `bun run build`.
4. Run `bun run check`.

## Boundaries

- Do not edit templates, partials, or shared JS.
- Do not remove existing Tailwind `duration-*` classes unless they become redundant.
- If Tailwind rejects `var()` in `transition-duration` or `transition-timing-function`, STOP and report.
- GSAP strings are intentionally untouched here to keep the change small.

## Verification

- **Mechanical**: `bun run build && bun run check` exit 0; `grep` finds all six CSS variables.
- **Feel check**: buttons and nav chip animate with the same durations and curves as before; no timing regressions. In DevTools, transition values resolve to the token variables.
- **Done when**: motion tokens exist, overrides apply, build and check pass.
```