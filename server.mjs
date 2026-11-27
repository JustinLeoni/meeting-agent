import http from "node:http";
import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.dirname(fileURLToPath(import.meta.url));
const publicDir = path.join(root, "public");
const port = Number(process.env.PORT || 8787);

const mime = { ".html": "text/html; charset=utf-8", ".js": "text/javascript; charset=utf-8", ".css": "text/css; charset=utf-8" };

async function readBody(req) {
  let data = "";
  for await (const chunk of req) data += chunk;
  return JSON.parse(data || "{}");
}

async function chat(req, res) {
  if (!process.env.NVIDIA_API_KEY) {
    res.writeHead(503, { "content-type": "application/json" });
    return res.end(JSON.stringify({ error: "NVIDIA_API_KEY no está configurada en el servidor." }));
  }
  const { messages = [] } = await readBody(req);
  const upstream = await fetch("https://integrate.api.nvidia.com/v1/chat/completions", {
    method: "POST",
    headers: { "authorization": `Bearer ${process.env.NVIDIA_API_KEY}`, "content-type": "application/json" },
    body: JSON.stringify({ model: process.env.NVIDIA_MODEL || "meta/llama-3.1-8b-instruct", messages, temperature: 0.3, max_tokens: 500 })
  });
  const text = await upstream.text();
  res.writeHead(upstream.status, { "content-type": "application/json" });
  res.end(text);
}

const server = http.createServer(async (req, res) => {
  try {
    if (req.method === "POST" && req.url === "/api/chat") return await chat(req, res);
    const requested = req.url === "/" ? "/index.html" : req.url;
    const file = path.normalize(path.join(publicDir, requested));
    if (!file.startsWith(publicDir)) throw new Error("invalid path");
    const body = await fs.readFile(file);
    res.writeHead(200, { "content-type": mime[path.extname(file)] || "application/octet-stream" });
    res.end(body);
  } catch {
    res.writeHead(404, { "content-type": "text/plain; charset=utf-8" });
    res.end("Not found");
  }
});

server.listen(port, () => console.log(`Meeting Agent: http://localhost:${port}`));
