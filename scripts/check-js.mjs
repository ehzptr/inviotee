// Fails if the inline script of any built page has a syntax error or a duplicate top-level const/let (catches bad partial merges).
import { readFileSync, readdirSync } from "node:fs";
import { Script } from "node:vm";

for (const t of readdirSync("dist", { withFileTypes: true }).filter(d => d.isDirectory())) {
    for (const f of readdirSync(`dist/${t.name}`).filter(f => f.endsWith(".html"))) {
        const code = [...readFileSync(`dist/${t.name}/${f}`, "utf8").matchAll(/<script>([\s\S]*?)<\/script>/g)].map(m => m[1]).join("\n");
        new Script(code, { filename: `${t.name}/${f}` }); // throws SyntaxError on failure; does not execute
        console.log("ok", `${t.name}/${f}`);
    }
}
