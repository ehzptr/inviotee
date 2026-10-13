// Fails if a built page still contains a {{placeholder}} or points at a local file that does not exist.
import { readFileSync, readdirSync, existsSync } from "node:fs";
import { join, dirname, resolve } from "node:path";

let bad = 0;
for (const f of readdirSync("dist", { recursive: true }).filter(f => f.endsWith(".html"))) {
    const file = join("dist", f), html = readFileSync(file, "utf8");
    for (const m of html.matchAll(/\{\{[\w.@> -]+\}\}/g)) { console.log(`${file}: unreplaced ${m[0]}`); bad++; }
    for (const m of html.matchAll(/\b(?:src|href)="([^"]+)"/g)) {
        const url = m[1].split(/[?#]/)[0];
        if (!url || /^(https?:|data:|mailto:|tel:)/.test(url)) continue;
        if (!existsSync(resolve(dirname(file), url))) { console.log(`${file}: missing ${m[1]}`); bad++; }
    }
}
process.exit(bad ? 1 : 0);
