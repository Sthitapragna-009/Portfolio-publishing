// Minimal static file server for local preview.
const http = require("http");
const fs = require("fs");
const path = require("path");

const root = __dirname;
const port = Number(process.env.PORT) || 5190;

// Send the same security headers Vercel does (vercel.json), so a page that
// breaks the Content-Security-Policy breaks here first, not in production.
let siteHeaders = {};
try {
  const all = JSON.parse(fs.readFileSync(path.join(root, "vercel.json"), "utf8")).headers || [];
  const site = all.find((h) => h.source === "/(.*)");
  if (site) for (const h of site.headers) siteHeaders[h.key] = h.value.replace("; upgrade-insecure-requests", "");
} catch (e) {}

const types = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".svg": "image/svg+xml",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".png": "image/png",
  ".webp": "image/webp",
  ".pdf": "application/pdf",
  ".mp4": "video/mp4",
  ".woff2": "font/woff2",
  ".woff": "font/woff",
  ".ico": "image/x-icon",
  ".xml": "application/xml; charset=utf-8",
  ".txt": "text/plain; charset=utf-8",
  ".gz": "application/gzip",
  ".wav": "audio/wav",
};

http
  .createServer((req, res) => {
    const url = decodeURIComponent(req.url.split("?")[0]);
    let rel = url === "/" ? "/index.html" : url;
    let file = path.join(root, rel);

    // Keep requests inside the project root.
    if (!file.startsWith(root)) {
      res.writeHead(403).end("Forbidden");
      return;
    }

    if (fs.existsSync(file) && fs.statSync(file).isDirectory()) {
      file = path.join(file, "index.html");
    }

    fs.readFile(file, (err, data) => {
      if (err) {
        res.writeHead(404, { "Content-Type": "text/plain" }).end("Not found");
        return;
      }
      res.writeHead(200, {
        "Content-Type": types[path.extname(file).toLowerCase()] || "application/octet-stream",
        "Cache-Control": "no-cache",
      });
      res.end(data);
    });
  })
  .listen(port, () => console.log("serving " + root + " on http://localhost:" + port));
