# 002 — Fix exiting slide easing

- **Status**: TODO
- **Commit**: 91d37c4
- **Severity**: MEDIUM
- **Category**: Easing (AUDIT §2)
- **Estimated scope**: 1 file, 1 token

## Problem

Swipe-mode exits a slide with `ease: "power2.in"`. Ease-in starts slow, delaying the moment the user watches an exit. Per the audit, exits should use ease-out.

Evidence:
- `src/chinese-java/swipe.html:476`

Current code:

```js
gsap.to(out, { autoAlpha: 0, y: -48 * dir, duration: .4 * k, ease: "power2.in", overwrite: true });
```

## Target

```js
gsap.to(out, { autoAlpha: 0, y: -48 * dir, duration: .4 * k, ease: "power2.out", overwrite: true });
```

`k` already disables motion for reduced motion. Entry uses `expo.out` and stays unchanged.

## Repo conventions to follow

- Motion is GSAP; durations are scaled by `k`.
- Entering uses `expo.out`; exiting should also start fast and slow down.

## Steps

1. In `src/chinese-java/swipe.html`, change only `"power2.in"` to `"power2.out"` on the outgoing-slide tween (`gsap.to(out, ...)`).
2. Do not change the entering tween, durations, or other section navigation easings.
3. Run `bun run build && bun run check`.

## Boundaries

- Only the outgoing slide tween.
- Do NOT edit swipe entrances, nav, or loader motion.
- If the surrounding block has drifted since commit `91d37c4`, STOP and report.

## Verification

- **Mechanical**: `grep -n 'power2\.' src/chinese-java/swipe.html` shows `power2.out` on the outgoing tween; `bun run build && bun run check` exit 0.
- **Feel check**: swipe in each direction and observe the departing slide: it should leave immediately rather than ramping up speed, while the incoming slide still eases with `expo.out`.
- **Done when**: the outgoing slide uses `power2.out`, build and check pass.
```><|end|>assistant<|channel|>analysis<|message|>Continue writing 003.<|end|><|start|>استع的 assistant to=write<|channel|>analysis <|constrain|>xml<|message|><rfl:parameter name="path">
/workspaces/inviotee.github.io/animation-plans/003-soften-nav-celebration-bounce.md