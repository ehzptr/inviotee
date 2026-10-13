// Fails if a class used in a built page has no rule in dist/main.css (catches templates/fragments the CSS build can't see).
import { readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";

const css = readFileSync("dist/main.css", "utf8");
const skip = /^(ph-|ph$|ch$|sec$|slide$|panel$|pc$|ov$|group$|peer$|notranslate$|open$)/; // phosphor icons + JS/state hooks, not Tailwind
const esc = t => t.replace(/[^\w-]/g, c => "\\" + c);
let bad = 0;
for (const f of readdirSync("dist", { recursive: true }).filter(f => f.endsWith(".html"))) {
    const html = readFileSync(join("dist", f), "utf8");
    const tokens = new Set([...html.matchAll(/\bclass="([^"]*)"/g)].flatMap(m => m[1].split(/\s+/)).filter(Boolean));
    for (const t of tokens) if (!skip.test(t) && !css.includes("." + esc(t))) { console.log(`${f}: missing .${t}`); bad++; }
}
process.exit(bad ? 1 : 0);
