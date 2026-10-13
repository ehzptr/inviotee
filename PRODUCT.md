# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

Primary users are event hosts who need a shareable digital invitation:
- wedding couples preparing a personal invitation;
- event planners or organizers preparing invitations for clients;
- company or event organizers preparing invitations for gatherings.

They typically work from a content JSON file and need guest-specific links. Guests are the secondary audience and receive a URL, often on mobile devices and mobile data.

## Product Purpose

inviotee is a static wedding/event invitation theme system. It renders a couple's or event's details from `src/content/<theme>.json` into HTML templates for multiple viewing modes (`swipe`, `scroll`, `zoom`), copies assets, compiles Tailwind CSS, and produces a deployable static site under `dist/`.

Success means a host can customize an invitation, build it, and share mode-specific URLs such as `?to=<guest>&group=<group>` without running a backend.

## Positioning

The product differentiates by keeping invitations static and deployable to GitHub Pages while supporting multiple viewing modes, guest-specific links, QR codes, music, RSVP/demo comments, and build-time content substitution. It avoids a heavy application backend; the build pipeline and content JSON are the product surface.

## Operating Context

- Static build command: `bun run build` (`bun run css` + `node build.mjs`).
- Verification: `bun run check` runs `check-css.mjs`, `check-js.mjs`, and `check-build.mjs`.
- Development: `bun run dev` starts CSS watch, HTML rebuild, and static server at `http://localhost:3000`.
- Deployment: GitHub Actions (`.github/workflows/static.yml`) builds on push to `main` and publishes `dist/` to GitHub Pages.
- Content is edited in `src/content/<theme>.json`; templates live in `src/<theme>/*.html`; shared behavior lives in `src/shared/*.js`.
- Visual identity is theme-specific and documented in `src/<theme>/DESIGN.md` (for example `src/chinese-java/DESIGN.md`).
- Built output under `dist/` is generated and should not be committed.

## Capabilities and Constraints

Confirmed capabilities:
- Multi-mode invitation rendering (`swipe`, `scroll`, `zoom`).
- Build-time partials and placeholders from content JSON.
- Guest personalization via query params (`to`, `group`).
- Guest QR code encoding the guest's invitation URL.
- Background music and loader/countdown UI.
- Build-time CSS checks for missing Tailwind classes, JS syntax/const duplication, unreplaced placeholders, and missing local assets.
- Static deploy without a backend.

Known constraints and undecided product facts:
- RSVP endpoint is empty in `src/shared/rsvp.js`; responses are demo-only and remain on the page.
- Only `chinese-java` is fully implemented; `batak-dayak` is a stub without content or templates.
- There is no automated test suite; verification is the build and check scripts.
- There is no `.env`/secrets contract; no runtime secret management is needed.
- RSVP persistence, authentication, and multi-tenant hosting are not implemented.
- New themes require content, `theme.json`, templates, and assets.

## Brand Commitments

- Visual identity is defined by the "Chinese Java" theme: cream/paper/ink/gold tokens, Cormorant Garamond display type, Outfit sans-serif, phosphor icons, and a small fixed 480px mobile-centric layout.
- Product copy is primarily Indonesian, including RSVP, comments, countdown, and guest links.
- Accessibility-related commitments present in code: mobile tap targets, focus-visible outlines, `prefers-reduced-motion` handling in JavaScript, reduced-motion CSS guards, and coarse-pointer hover gating.
- Existing design tokens and patterns should be preserved unless a redesign is explicitly requested.

## Evidence on Hand

- Repository: wedding invitation themes and content system at `/workspaces/inviotee.github.io`.
- Real content file: `src/content/chinese-java.json`.
- Theme metadata: `src/chinese-java/theme.json`.
- Templates: `src/chinese-java/{swipe,scroll,zoom}.html`.
- Shared scripts: `src/shared/*.js`.
- Partials: `src/chinese-java/partials/*.html`.
- Compiled CSS source: `src/styles/main.css`.
- CI workflow: `.github/workflows/static.yml`.
- Generated index: `dist/index.html` after `bun run build`.
- No connected backend, RSVP endpoint, image assets beyond SVGs/music, or automated tests are present.

## Product Principles

- Keep invitations static and deployable without a backend.
- Preserve guest personalization as a first-class feature.
- Favor reusable templates and partials over duplicated markup.
- Fail builds on missing assets, unreplaced placeholders, or invalid CSS class usage.
- Maintain mobile-first usability and accessible feedback.
- Add new themes through documented content and template conventions rather than ad hoc copying.

## Accessibility & Inclusion

- Mobile-first 480px-ish layout with 44px-or-larger tap targets; compact 32px links only where documented.
- Focus-visible outlines on interactive elements.
- Reduced-motion handling in JavaScript and CSS.
- Coarse-pointer hover gating to avoid sticky hover states.
- High-contrast text tokens (`--color-muted`, `--color-gold-ink`) improved from earlier low-contrast values.
```<|end|><|start|>write to=assistant<|channel|>analysis<|message|>Created file successfully: PRODUCT.md