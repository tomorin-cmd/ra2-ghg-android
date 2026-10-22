const http = require("http");
const fs = require("fs");
const path = require("path");
const root = "D:/dsh-workspace/hj2/ra2ios/RedAlert2-Mac-iOS-iPad-main/redalert2/dist";
const game = "D:/dsh-workspace/hj2/ra2ios/RedAlert2-Mac-iOS-iPad-main/gameres-export";
const mime = { ".html":"text/html; charset=utf-8", ".js":"text/javascript", ".css":"text/css", ".json":"application/json", ".wasm":"application/wasm", ".png":"image/png", ".jpg":"image/jpeg", ".webp":"image/webp", ".mp3":"audio/mpeg", ".webm":"video/webm", ".csf":"application/octet-stream", ".ini":"text/plain; charset=utf-8", ".mix":"application/octet-stream" };
const server = http.createServer((req, res) => {
  let urlPath = decodeURIComponent((req.url || "/").split("?")[0]);
  let base = root, rel = urlPath.replace(/^\/+/, "");
  if (rel.startsWith("gameres/")) { base = game; rel = rel.slice("gameres/".length); }
  if (!rel || rel.endsWith("/")) rel += "index.html";
  const file = path.resolve(base, rel);
  if (!file.startsWith(path.resolve(base)) || !fs.existsSync(file) || fs.statSync(file).isDirectory()) {
    if (base === root && fs.existsSync(path.join(root, "index.html"))) {
      res.writeHead(200, { "Content-Type": "text/html; charset=utf-8", "Cross-Origin-Opener-Policy":"same-origin", "Cross-Origin-Embedder-Policy":"require-corp", "Cache-Control":"no-store" });
      fs.createReadStream(path.join(root, "index.html")).pipe(res); return;
    }
    res.writeHead(404); res.end("not found"); return;
  }
  const ext = path.extname(file).toLowerCase();
  res.writeHead(200, { "Content-Type": mime[ext] || "application/octet-stream", "Content-Length": fs.statSync(file).size, "Cross-Origin-Opener-Policy":"same-origin", "Cross-Origin-Embedder-Policy":"require-corp", "Cache-Control":"no-store" });
  fs.createReadStream(file).pipe(res);
});
server.listen(4002, "127.0.0.1", () => console.log("serving 4002"));

