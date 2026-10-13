// content/<theme>.json + <theme>/<mode>.html templates -> dist/<theme>/<mode>.html
// Run: node build.mjs [theme]. Themes without a content file (batak-dayak stub) are skipped.
import { readFile, writeFile, mkdir, cp, readdir } from "node:fs/promises";
import { existsSync } from "node:fs";
import { join } from "node:path";

const SRC = "src", OUT = "dist";
const esc = s => String(s).replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]);
const fmt = (date, opts) => new Intl.DateTimeFormat("id-ID", { timeZone: "Asia/Jakarta", ...opts }).format(new Date(`${date}T00:00:00+07:00`));

/** every value a template may reference as {{key}}; dates are derived so weekday/day/year can never disagree */
function scalars(c) {
    const [y, m, d] = c.date.split("-");
    const at = t => `${y}${m}${d}T${t.replace(":", "")}00`;
    const title = `Pernikahan ${c.groom.nick} & ${c.bride.nick}`;
    const place = `${c.venue.name} - ${c.venue.address}`;
    return {
        short: `${c.groom.nick} & ${c.bride.nick}`,
        dateLong: fmt(c.date, { weekday: "long", day: "numeric", month: "long", year: "numeric" }).replace(/^(\p{L}+),?\s*/u, "$1, "),
        dateFull: fmt(c.date, { day: "numeric", month: "long", year: "numeric" }),
        dateDay: fmt(c.date, { day: "2-digit" }),
        dateWeekday: fmt(c.date, { weekday: "long" }),
        dateMonthYear: fmt(c.date, { month: "long", year: "numeric" }),
        year: y,
        rsvpDeadline: fmt(c.rsvpDeadline, { day: "numeric", month: "long", year: "numeric" }),
        countdownIso: `${c.date}T${c.event.calendarStart}:00+07:00`,
        "venue.q": encodeURIComponent(place),
        calendarUrl: "https://calendar.google.com/calendar/u/0/r/eventedit?" + new URLSearchParams({
            text: title, dates: `${at(c.event.calendarStart)}/${at(c.event.calendarEnd)}`, ctz: "Asia/Jakarta", details: "", location: place,
        }),
    };
}

/** repeating markup; attrs comes from {{@name attrs}} so each mode can add its own data-* hooks */
const fragments = {
    story: (c, a) => c.story.map(s => `<li ${a ? a + " " : ""}class="grid grid-cols-[72px_1fr] gap-x-4 py-3">
    <span class="font-display text-[32px] font-semibold italic leading-none text-gold-ink tabular-nums">${esc(s.year)}</span>
    <div>
        <h3 class="text-sm font-semibold">${esc(s.title)}</h3>
        <p class="mt-1 text-sm text-muted">${esc(s.text)}</p>
    </div>
</li>`).join("\n"),
    banks: c => c.banks.map(b => `<div class="flex items-center gap-3 py-3">
    <img src="assets/bank.svg" alt="Logo ${esc(b.bank)}" class="w-14 shrink-0 object-contain">
    <div class="min-w-0 flex-1">
        <p class="text-lg font-semibold tabular-nums">${esc(b.number)}</p>
        <p class="text-sm text-muted">${esc(b.bank)} · a.n. ${esc(b.name)}</p>
    </div>
    <button data-copy="${esc(b.number)}" class="tlink">Salin</button>
</div>`).join("\n"),
};

function render(html, c, vars, file) {
    // pass 1: fragments (their text may itself contain {{scalars}}); pass 2: scalars and {{a.b}} lookups
    html = html.replace(/\{\{@(\w+)([^}]*)\}\}/g, (_, name, attrs) => {
        if (!fragments[name]) throw new Error(`${file}: unknown fragment @${name}`);
        return fragments[name](c, attrs.trim());
    });
    return html.replace(/\{\{([\w.]+)\}\}/g, (_, key) => {
        const v = key in vars ? vars[key] : key.split(".").reduce((o, k) => o?.[k], c);
        if (v === undefined || typeof v === "object" && !Array.isArray(v)) throw new Error(`${file}: no content for {{${key}}}`);
        return Array.isArray(v) ? v.map(esc).join("<br>") : esc(v);
    });
}

const only = process.argv[2];
for (const theme of await readdir(SRC)) {
    const contentFile = join(SRC, "content", `${theme}.json`);
    if ((only && theme !== only) || !existsSync(contentFile)) continue;
    const content = JSON.parse(await readFile(contentFile, "utf8"));
    const { modes } = JSON.parse(await readFile(join(SRC, theme, "theme.json"), "utf8"));
    const vars = scalars(content);
    await mkdir(join(OUT, theme), { recursive: true });
    for (const mode of modes) {
        const file = join(SRC, theme, `${mode}.html`);
        const html = render(await readFile(file, "utf8"), content, vars, file);
        await writeFile(join(OUT, theme, `${mode}.html`), html);
        console.log(`built ${OUT}/${theme}/${mode}.html`);
    }
    await cp(join(SRC, theme, "assets"), join(OUT, theme, "assets"), { recursive: true });
}
