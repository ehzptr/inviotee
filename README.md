# inviotee

Static wedding-invitation themes (Indonesian). Each theme has three viewing modes (`swipe`, `scroll`, `zoom`); `build.mjs` fills the HTML templates with the couple's details and writes the finished site to `dist/`.

## Quick start

```bash
bun install
bun run dev      # CSS watcher + HTML rebuild + server at http://localhost:3000
bun run build    # one-off build into dist/
bun run check    # sanity checks on the built pages
```

## How it works

- `src/<theme>/{swipe,scroll,zoom}.html` — page templates with `{{placeholders}}` (and `{{> partial}}` includes).
- `src/content/<theme>.json` — the couple's details: names, date, venue, story, bank accounts, music label.
- `src/<theme>/theme.json` — theme label, description and the list of modes to build.
- `src/styles/main.css` — Tailwind CSS source; compiled to `dist/main.css`.
- `build.mjs` — renders everything into `dist/`.

To make an invitation for a new couple, copy `src/content/chinese-java.json`, edit the values, and rebuild.

## Guest links

Append the guest's name and group to the page URL:

```
https://<site>/chinese-java/swipe.html?to=Nama%20Tamu&group=VIP
```

## Deploy

Pushing to `main` runs `.github/workflows/static.yml`, which builds the site and publishes `dist/` to GitHub Pages. `dist/` is not committed.
