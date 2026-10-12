## Audit: `index.html`

**Evidence:** I read the code and ran the detector. I did not run it in a browser, so touch gestures, real contrast and rendered focus rings are untested.

### Audit Health Score

| # | Dimension | Score | Key finding |
|---|---|---|---|
| 1 | Accessibility | 2 | Nav focus ring clipped, slide changes not announced |
| 2 | Performance | 3 | Layout reads fixed, map deferred, no blur effects left |
| 3 | Theming | 3 | Light only by design, a few repeated hard-coded hex values |
| 4 | Responsive | 2 | Scaled canvas shrinks text on phones narrower than 414px, several targets under 44px |
| 5 | Implementation Integrity | 3 | Coherent system, detector finding is a false positive |
| **Total** | | **13/20** | **Acceptable** |

### Implementation Integrity Verdict

**Pass.** The cream, gold and ink tokens, the Cormorant and Outfit pairing, and the nav, frame and tab behavior all hang together as one wedding-invitation system.

The detector's one finding is a false positive. It reports "flat type hierarchy" with every heading at 16px. The page styles itself with Tailwind's runtime build, which the static detector never sees. The real sizes are 64px for the h1, 40px for h2, and 14px for body text.

### Executive Summary
- Score **13/20**. Issues by severity: **P0: 0, P1: 0, P2: 6, P3: 4**.
- Top issues:
  1. The nav's focus ring is clipped.
  2. A keyboard focus on an off-screen chip can break the nav alignment.
  3. Screen readers get no announcement when the section changes.
  4. Autoplay starts on its own and advances every 15 seconds.
  5. Text shrinks below 12px on narrow phones.

### Detailed Findings

**[P2] Focus ring clipped on nav chips**
- Location: `#navView` has `overflow-hidden`, and each chip is exactly as tall as the list (56px).
- Category: Accessibility
- Impact: Keyboard users lose the top, bottom and edge of the focus indicator.
- Standard: WCAG 2.4.7 and 2.4.11
- Fix: give the chips an inset outline, `outline-offset: -3px`.
- Command: `/impeccable harden`

**[P2] Tabbing to an off-screen chip scrolls the clipped container**
- Location: `#navView` and `#navList`, which is moved with a transform.
- Category: Accessibility
- Impact: Browsers scroll overflow-hidden containers to reveal a focused child. That scroll stacks on the transform, so the active chip no longer sits in the middle.
- Fix: on a chip's `focus`, call `go()` and reset `navView.scrollLeft = 0`.
- Command: `/impeccable harden`

**[P2] Section changes are not announced**
- Location: the `go()` function. Focus stays on the chip, and `aria-current` alone is silent.
- Category: Accessibility
- Impact: Screen reader users activate a chip and hear nothing.
- Standard: WCAG 4.1.3
- Fix: add a polite live region and write the section name into it on each change, or move focus to the new section.
- Command: `/impeccable harden`

**[P2] Autoplay starts by default**
- Location: `openInvitation()` calls `startAuto()` with a 15-second interval.
- Category: Accessibility
- Impact: The Ayat, story and RSVP sections move on while someone is still reading. A pause button exists, but stopping is opt-in.
- Standard: WCAG 2.2.1 and 2.2.2
- Fix: start paused, or pause on any interaction. Typing in the RSVP form already pauses it.
- Command: `/impeccable harden`

**[P2] Text shrinks on narrow phones**
- Location: `fit()` scales the 414px canvas with `Math.min(w/414, h/736)`. At 360px wide the scale is about 0.87.
- Category: Responsive
- Impact: Nav labels (`text-xs`, 12px) render at about 10.4px, and 14px body text at about 12px. Browser font-size settings are ignored.
- Standard: WCAG 1.4.4
- Fix: raise the label sizes to 13–14px, or scale text separately from the layout.
- Command: `/impeccable adapt`

**[P2] Targets under 44px**
- Location: `.tlink` (32px: Instagram links and "Salin"), and the tab buttons (40px).
- Category: Responsive
- Impact: Mis-taps on phones.
- Standard: WCAG 2.5.8
- Fix: use `min-h-11` on both.
- Command: `/impeccable adapt`

**[P3] The nav cannot be swiped sideways.**
- Location: `Observer` listens for vertical drags only, and the list moves only on tap.
- Category: Responsive
- Impact: A sideways swipe on the nav does nothing. This matches `original.html`, but people usually expect a strip to drag.
- Command: `/impeccable adapt`

**[P3] Loader `animate-pulse` ignores reduced motion.**
- Category: Accessibility
- Impact: A low-risk opacity pulse.
- Fix: guard it with `motion-safe:`.
- Command: `/impeccable polish`

**[P3] Repeated hard-coded colors.**
- Location: `#7D5A10` in the focus outline, `#6a4c31` in the button hover, and `rgb(87 62 40/.5)` in shadows.
- Category: Theming
- Impact: These duplicate the `gold-ink` and `ink` tokens, so they drift if the palette changes.
- Command: `/impeccable extract`

**[P3] Generic gallery alt text and no required marks.**
- Location: the gallery images read "Galeri foto N", and the RSVP fields have no visible required marker.
- Category: Accessibility
- Command: `/impeccable clarify`

### Patterns & Systemic Issues
- Focus and keyboard handling was designed around transform-driven UI (the nav and the slides) but not verified for keyboard use.
- Sizes are fixed in px on a scaled canvas, so text and tap targets shrink together on small phones.

### Positive Findings
- Everything animated is transform or opacity.
- The corner frames use a single timeline.
- Reduced motion zeroes durations but keeps state changes.
- `inert` keeps the nav and bottom bar unreachable until the invitation opens, and hidden slides leave the tab order.
- Each section has a named region, `aria-pressed` and `aria-current` are used correctly, and every form field has a label.
- The RSVP form and the ucapan list are protected from the stage's swipe handler.
- Text contrast passes: muted on paper is about 5.5:1.

### Recommended Actions
1. **[P2] `/impeccable harden`**: focus ring clip, focus-scroll misalignment, section announcements, autoplay default.
2. **[P2] `/impeccable adapt`**: text size on narrow phones, 44px targets, optional sideways nav drag.
3. **[P3] `/impeccable extract`**: swap the repeated hex values for tokens.
4. **[P3] `/impeccable clarify`**: alt text and required markers.
5. **`/impeccable polish`**: final pass.

You can ask me to run these one at a time, all at once, or in any order you prefer.

Re-run `/impeccable audit` after fixes to see your score improve.