---
name: inviotee
description: Static wedding and event invitation themes with guest-personalized viewing modes.
colors:
  primary: "#573E28"
  accent: "#D1A046"
  seal: "#9A2B1E"
  background: "#F3E1CF"
  surface: "#FBF4EA"
  text: "#573E28"
  text-muted: "#6B5440"
  text-gold: "#7D5A10"
typography:
  display:
    fontFamily: "Cormorant Garamond, Georgia, serif"
    fontSize: "40px"
    fontWeight: 600
    lineHeight: 1
  headline:
    fontFamily: "Cormorant Garamond, Georgia, serif"
    fontSize: "28px"
    fontWeight: 600
    lineHeight: 1.1
  title:
    fontFamily: "Cormorant Garamond, Georgia, serif"
    fontSize: "22px"
    fontWeight: 500
    lineHeight: 1.2
  body:
    fontFamily: "Outfit, system-ui, sans-serif"
    fontSize: "14px"
    fontWeight: 400
    lineHeight: 1.5
  label:
    fontFamily: "Outfit, system-ui, sans-serif"
    fontSize: "12px"
    fontWeight: 500
    lineHeight: 1.4
    letterSpacing: "0.01em"
rounded:
  sm: "8px"
  md: "12px"
  lg: "16px"
  xl: "24px"
  full: "9999px"
spacing:
  xs: "8px"
  sm: "12px"
  md: "16px"
  lg: "24px"
  xl: "32px"
components:
  button-primary:
    backgroundColor: "{colors.primary}"
    textColor: "{colors.surface}"
    typography: "{typography.label}"
    rounded: "{rounded.full}"
    padding: "16px 24px"
    height: "44px"
  button-ghost:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.primary}"
    typography: "{typography.label}"
    rounded: "{rounded.full}"
    padding: "12px 20px"
    height: "44px"
  input-field:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.primary}"
    typography: "{typography.body}"
    rounded: "{rounded.md}"
    padding: "10px 14px"
    height: "40px"
  nav-chip:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.text-muted}"
    typography: "{typography.label}"
    rounded: "{rounded.xl}"
    padding: "8px 12px"
    height: "56px"
---

# Design System: inviotee

## Overview

**Creative North Star: "The Silk Garden Sanctuary"**

inviotee presents wedding and event invitations as calm, ceremonial digital objects for mobile-first guests. The system should feel warm, respectful, and premium without theatrical excess: cream paper surfaces, brown ink typography, antique-gold accents, Chinese-Javanese ornament used sparingly, and dense but legible content within a narrow 480px frame. Brand personality is refined and confident: solid ink actions, paper-like surfaces, gold details, and decorative motifs that frame rather than dominate the invitation. Mobile scrutiny, guest personalization, countdowns, galleries, and RSVP all sit inside this restrained visual world, with reduced-motion and touch support treated as part of the core experience rather than an afterthought.

**Key Characteristics:**
- Warm cream and paper backgrounds with brown ink text.
- Cormorant Garamond display type over Outfit body copy.
- Rounded-full buttons and chips, 12-24px field/card radius, and decorative corner frames.
- Sparse gold and seal-red accents on otherwise quiet surfaces.
- Narrow, mobile-first layout with 44px tap targets and keyboard-focus outlines.
- Motion is spatial and brief, gated for reduced motion and coarse pointers.

## Colors

The palette is a warm paper-and-ink system with one antique-gold accent and one ceremonial seal red, used sparingly.

### Primary
- **Ink Brown** (#573E28): primary text, solid button backgrounds, icons, and strong frames.

### Accent
- **Antique Gold** (#D1A046): decorative lines, icons, emphasis, and active accent.
- **Text Gold** (#7D5A10): gold used for text and links at sufficient contrast.

### Neutral
- **Cream** (#F3E1CF): main page background and warm canvas.
- **Paper** (#FBF4EA): floating surfaces, dialogs, fields, and card-like containers.
- **Muted Brown** (#6B5440): secondary text and labels at 5.5:1 contrast on cream.
- **Seal Red** (#9A2B1E): used very sparingly for Chinese-inspired ornament.

### Named Rules
**The One Voice Rule.** Ink carries hierarchy and action; gold is rare enough to remain meaningful, and seal red is reserved for ornamental moments.

## Typography

**Display Font:** Cormorant Garamond (with Georgia, serif)
**Body Font:** Outfit (with system-ui, sans-serif)
**Label/Mono Font:** Outfit

**Character:** A formal serif display paired with a clean geometric sans. Display type carries ceremony; body type does the practical work. The scale is mobile-first and weighted toward small, dense invitation content.

### Hierarchy
- **Display** (600, 40px, 1): hero couple names and invitation headlines.
- **Headline** (600, 28px, 1.1): section titles in templates and the generated index.
- **Title** (500, 22px, 1.2): dialogs, card headings, and featured names.
- **Body** (400, 14px, 1.5): invitation copy, form fields, comments, and most UI text.
- **Label** (500, 12px, 1.4, 0.01em): controls, navigation, metadata, and status text.

### Named Rules
**The Mobile Rhythm Rule.** Keep body copy compact and generous in line height so guest flows remain readable on narrow screens.

## Layout

The design is mobile-first with a 480px content width, 34px side padding on the generated index, and vertical section stacking. The scroll mode may expand to 720px on large screens while the swipe and zoom modes keep the 414px scaled canvas. Invitation pages use touch-first containers (`#stage`, `[data-scroll]`), a fixed four-item bottom navigation, a three-column gallery grid with a tall first item, and dialogs sized to `min(92vw, 360px)`. Spacing follows Tailwind's 4px scale, with 8-32px used for most local rhythm and 44px-or-larger tap targets for primary interaction.

## Elevation & Depth

Depth is restrained: flat paper-like surfaces by default, with subtle rings and only a few soft ambient shadows. Buttons use an inset-feeling raised shadow, floating surfaces use a soft brown shadow, and dialogs use a dark backdrop. There is no heavy elevation stack; hierarchy comes from background tone, borders, and typography before shadows.

### Shadow Vocabulary
- **Button Shadow** (`box-shadow: 0 10px 24px -10px rgb(87 62 40 / .55)`): primary buttons at rest.
- **Floating Surface Shadow** (`box-shadow: 0 8px 24px -8px rgb(87 62 40 / .5)`): floating panels and readable surfaces.
- **Dialog Backdrop** (`background: rgb(40 26 14 / .6)`): modal and lightbox backgrounds.

### Named Rules
**The Soft Paper Rule.** Surfaces remain flat until shadow is needed for elevation or separation; shadow is a separator, not a decorative effect.

## Shapes

The form language mixes full pill controls with moderately rounded containers. Primary actions are fully rounded pills; fields use 12px radius; cards and dialogs use 16-24px radius; gallery items use 8px and specially rounded corner radii. Decorative corner frames use SVG motifs rather than heavy UI chrome. Borders are usually `ink/10` to `ink/30`.

## Components

### Buttons
- **Shape:** full pill radius.
- **Primary:** ink background, paper text, compact label typography, 44px minimum height, 16px/24px padding, shadow at rest, slight upward hover lift, 0.97 press scale.
- **Ghost/Secondary:** paper surface, ink border, ink text, 44px height.
- **Icon Button:** 48px circular target with ink/10 background and active ink fill.
- **Hover / Focus:** 200ms color and transform transitions; focus-visible uses a 2px gold-ink outline.

### Fields
- **Shape:** 12px radius, white background, 1px ink/25 border.
- **Focus:** border shifts to gold-ink.
- **Disabled:** ink/5 background and muted text.

### Cards / Containers
- **Corner Style:** 12-24px radius, sometimes fully rounded where specified in templates.
- **Background:** paper surface with ink/25 ring or ink/10 borders.
- **Shadow Strategy:** only floating and button surfaces use shadow; other surfaces stay flat.
- **Internal Padding:** 16-32px, with compact 8-16px padding inside controls.

### Navigation
- **Style:** fixed 56px bottom nav chips with muted default text, paper active state, `transition-colors` at 300ms, and keyboard-focus outlines.
- **Active State:** `aria-[current=true]:text-paper`.

### Dialogs and Lightbox
- **Shape:** 24px radius for QR dialog, near-full-screen lightbox.
- **Backgrounds:** paper or black/85.
- **Behavior:** native `<dialog>` elements with forms, keyboard close, and guest QR generation on open.

### Loader
- **Shape:** full-screen overlay (`fixed inset-0`) centered on a 24px-padded content block.
- **Background:** cream canvas with the warm paper token.
- **Content:** italic 40px display monogram/short name in ink, with a 96px gold rule.
- **Motion:** pulsing opacity only, and at least 24px inset from every viewport edge.

## Do's and Don'ts

### Do:
- **Do** use the cream, paper, ink, and gold tokens as the core palette; keep seal red rare.
- **Do** keep the mobile-first 480px frame and 44px tap targets.
- **Do** use Cormorant Garamond for display moments and Outfit for UI text.
- **Do** use rounded-full controls and modest 12-24px container radius.
- **Do** keep motion under 300ms for UI interactions and gate it for reduced motion and coarse pointers.
- **Do** use soft rings and sparse shadows rather than heavy elevation.

### Don't:
- **Don't** introduce cool or saturated palette colors that break the warm paper-and-ink system.
- **Don't** use large or loud decorative motion; interaction motion must stay brief.
- **Don't** remove hover/focus feedback, including for reduced-motion users.
- **Don't** replace content copy or guest flows without updating the content JSON and build checks.
- **Don't** hardcode guest-specific content that belongs in `src/content/<theme>.json`.
```<|end|><|start|>write to=assistant<|channel|>analysis<|message|>Created file successfully: DESIGN.md