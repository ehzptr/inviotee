# 001 — Gate button motion for reduced motion and touch

- **Status**: TODO
- **Commit**: 91d37c4
- **Severity**: HIGH
- **Category**: Accessibility (AUDIT §6)
- **Estimated scope**: 1 file

## Problem

Tailwind button utilities in `src/styles/main.css` animate hover/active transforms and color/background changes. JavaScript already sets `k = 0` for reduced motion, but these CSS transitions still move buttons under `prefers-reduced-motion`, and `hover:` styles can fire on touch taps.

Evidence:
- `src/styles/main.css:34` `btn`: `transition duration-200 hover:-translate-y-0.5 ... active:scale-[.97]`
- `src/styles/main.css:37` `btn-ghost`: `transition duration-200 hover:bg-ink/5 active:scale-[.97]`
- `src/styles/main.css:57` `act-btn`: `transition duration-200 hover:bg-ink/15 active:scale-95`

Current code:

```css
@utility btn {
    @apply inline-flex min-h-11 items-center justify-center gap-2 rounded-full bg-ink px-6 text-sm font-medium text-paper shadow-[0_10px_24px_-10px_rgb(87_62_40/.55)] transition duration-200 hover:-translate-y-0.5 hover:bg-[#6a4c31] active:translate-y-0 active:scale-[.97] disabled:opacity-60 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold-ink;
}
@utility btn-ghost {
    @apply inline-flex min-h-11 items-center justify-center gap-2 rounded-full border border-ink/30 px-5 text-sm font-medium text-ink transition duration-200 hover:bg-ink/5 active:scale-[.97] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold-ink;
}
@utility act-btn {
    @apply grid size-12 place-items-center rounded-full bg-ink/10 text-ink transition duration-200 hover:bg-ink/15 active:scale-95 aria-pressed:bg-ink aria-pressed:text-paper focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold-ink;
}
```

## Target

Keep color/opacity/background feedback. Disable transforms under reduced motion and on coarse/touch-only pointers.

Append verbatim to the end of `src/styles/main.css`:

```css
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
```

Do not remove Tailwind utility classes; the media queries override transform behavior.

## Repo conventions to follow

- Styling is in `src/styles/main.css` with Tailwind v4 `@utility` definitions; global rules live in `@layer base`.
- JavaScript already uses `const k = matchMedia("(prefers-reduced-motion: reduce)").matches ? 0 : 1;` in `src/chinese-java/swipe.html`, `scroll.html`, and `zoom.html`.
- Buttons animate only `transform` and `color`/`background`, so overriding `transition-property` does not break layout-dependent states.

## Steps

1. Leave `@utility btn`, `@utility btn-ghost`, and `@utility act-btn` unchanged.
2. Append the target media-query block to the end of `src/styles/main.css`.
3. Run `bun run build`.
4. Run `bun run check`.

## Boundaries

- Do NOT change templates or shared JS.
- Do NOT remove hover/active feedback entirely; reduced motion keeps color, background, and opacity.
- Do NOT add `!important` unless overriding a higher-specificity utility; the appended media query has equal class specificity and later source order.
- If Tailwind emits different selector names for these utilities, STOP and report instead of guessing.

## Verification

- **Mechanical**: `bun run build && bun run check` exit 0.
- **Feel check**:
  - In a normal pointer browser, buttons still lift slightly on hover and scale on press.
  - In DevTools Rendering panel with `prefers-reduced-motion: reduce`, buttons do not translate or scale, but color/background feedback remains.
  - In touch/coarse-pointer emulation, tapping a button does not leave a lingering translated hover state.
- **Done when**: the media-query block is present, build and check pass, and reduced-motion movement is gone while feedback remains.
```<|end|><|start|>write to=assistant<|channel|>analysis <|constrain|>xml<|message|><rfl:parameter name="path">
/workspaces/inviotee.github.io/animation-plans/002-fix-exiting-slide-easing.md