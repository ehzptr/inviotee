# 003 — Soften nav celebration bounce

- **Status**: TODO
- **Commit**: 91d37c4
- **Severity**: MEDIUM
- **Category**: Physicality / Cohesion (AUDIT §3, §7)
- **Estimated scope**: 1 file, 3 tokens

## Problem

Section-change nav performs a triple overshoot: elastic pill stretch, `back.out(3)` icon scale from 0.5, and `back.out(1.3)` pill slide. Nav is used on every section change, so the bounce reads playful in a crisp wedding invitation.

Evidence:
- `src/chinese-java/swipe.html:432-434`

Current code:

```js
gsap.to(pill, { x: m.lefts[n], duration: .5 * k, ease: "back.out(1.3)" });
gsap.fromTo(pill, { scaleX: 1.3 }, { scaleX: 1, duration: .7 * k, ease: "elastic.out(1,.5)" });
gsap.fromTo(items[n].firstElementChild, { scale: .5, y: 5 }, { scale: 1, y: 0, duration: .6 * k, ease: "back.out(3)" });
```

## Target

```js
gsap.to(pill, { x: m.lefts[n], duration: .5 * k, ease: "power3.out" });
gsap.fromTo(pill, { scaleX: 1.3 }, { scaleX: 1, duration: .4 * k, ease: "power2.out" });
gsap.fromTo(items[n].firstElementChild, { scale: .6, y: 5 }, { scale: 1, y: 0, duration: .5 * k, ease: "back.out(1.7)" });
```

Rationale:
- `elastic.out(1,.5)` on a frequent interaction rings; `power2.out` settles quickly.
- `scale: 0.5` with `back.out(3)` is too strong; `scale: 0.6` with `back.out(1.7)` matches the recommended overshoot ceiling (0.1–0.3 bounce range for occasional moments; nav is high-frequency).

## Repo conventions to follow

- Durations are scaled by `k`, where `k = 0` disables motion.
- GSAP transform shorthands (`x`, `scaleX`, `scale`, `y`) are used for movement.

## Steps

1. Replace the three nav tweens with the target code above.
2. Leave `measure`, `clamp`-based `navList` translate, `enter`, `mark`, and other swipe behavior unchanged.
3. Run `bun run build && bun run check`.

## Boundaries

- Only lines 432–434.
- Do NOT touch nav item content, map loading, or gallery motion.
- If the nav block has drifted since commit `91d37c4`, STOP and report.

## Verification

- **Mechanical**: `grep -n 'back.out\|elastic.out\|power3.out' src/chinese-java/swipe.html`; build and check exit 0.
- **Feel check**: open swipe mode and repeatedly tap nav chips. The active chip should arrive promptly with a light, quick bounce, and never ring; interaction should feel settled on every repeated press.
- **Done when**: no elastic easing remains in nav, build/check pass.
```><|start|>assistant<|channel|>analysis<|message|>Write 004.<|end|><|start|>استع的 assistant to=write<|channel|>analysis <|constrain|>xml<|message|><rfl:parameter name="path">
/workspaces/inviotee.github.io/animation-plans/004-introduce-motion-tokens.md