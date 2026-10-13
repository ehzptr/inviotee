// Simple static file server for development (Node/Bun compatible)
import { createServer } from "node:http";
import { readFile, stat } from "node:fs/promises";
import { resolve, dirname, extname, sep } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "../dist"); // built by build.mjs
let port = parseInt(process.argv[2] || "3000", 10);

const MIME = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "application/javascript",
  ".json": "application/json",
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".webp": "image/webp",
  ".mp3": "audio/mpeg",
  ".wav": "audio/wav",
};

async function handler(req, res) {
  const url = new URL(req.url, `http://localhost:${port}`);
  let rel;
  try { rel = decodeURIComponent(url.pathname); } catch { res.writeHead(400); return res.end("Bad request"); }
  let filePath = resolve(root, "." + rel);
  // block ../ escapes out of src/
  if (filePath !== root && !filePath.startsWith(root + sep)) { res.writeHead(403); return res.end("Forbidden"); }
  try {
    if ((await stat(filePath)).isDirectory()) filePath = resolve(filePath, "index.html");
    const body = await readFile(filePath); // read first so a miss can still send a real 404
    res.writeHead(200, { "Content-Type": MIME[extname(filePath)] ?? "application/octet-stream" });
    res.end(body);
  } catch {
    res.writeHead(404);
    res.end("Not found");
  }
}

async function startServer(p) {
  return new Promise((resolve, reject) => {
    const srv = createServer(handler);
    srv.listen(p, () => {
      console.log(`Dev server: http://localhost:${p}`);
      resolve(srv);
    });
    srv.on("error", (err) => {
      if (err.code === "EADDRINUSE") {
        srv.close();
        resolve(startServer(p + 1));
      } else reject(err);
    });
  });
}

await startServer(port);
