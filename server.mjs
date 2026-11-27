import http from "node:http";
import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { chromium } from "playwright";

const root = path.dirname(fileURLToPath(import.meta.url));
const publicDir = path.join(root, "public");
const port = Number(process.env.PORT || 8787);
const meetingProfileDir = process.env.MEETING_PROFILE_DIR || path.join(root, ".meeting-profile");
let meetingBrowser;
let meetingContext;
let meetingPage;
let meetingState = { status: "idle", url: null, message: "Sin reunión" };

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

async function joinMeeting(req, res) {
  const { meeting_url: meetingUrl } = await readBody(req);
  if (!/^https:\/\/meet\.google\.com\/[a-z0-9-]+/i.test(meetingUrl || "")) {
    res.writeHead(400, { "content-type": "application/json" });
    return res.end(JSON.stringify({ error: "Introduce un enlace válido de Google Meet." }));
  }
  meetingState = { status: "opening", url: meetingUrl, message: "Abriendo Google Meet…" };
  res.writeHead(202, { "content-type": "application/json" });
  res.end(JSON.stringify(meetingState));
  try {
    if (!meetingContext) meetingContext = await chromium.launchPersistentContext(meetingProfileDir, { headless: false, executablePath: process.env.CHROME_PATH || "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome", viewport: { width: 1280, height: 800 } });
    if (!meetingPage || meetingPage.isClosed()) meetingPage = await meetingContext.newPage();
    await meetingPage.goto(meetingUrl, { waitUntil: "domcontentloaded", timeout: 30000 });
    await meetingPage.waitForTimeout(2500);
    if (meetingPage.url().includes("accounts.google.com")) {
      meetingState = { status: "login_required", url: meetingUrl, message: "Inicia sesión con la cuenta Google exclusiva de Nova en la ventana abierta y vuelve a pulsar Entrar con Nova." };
      return;
    }
    const nameInput = meetingPage.locator('input[placeholder*="nombre" i], input[aria-label*="nombre" i]').first();
    if (await nameInput.count()) await nameInput.fill(process.env.MEETING_DISPLAY_NAME || "Nova — Agente IA");
    const joinButton = meetingPage.getByRole("button", { name: /unirse ahora|solicitar unirse|join now|ask to join/i }).first();
    if (await joinButton.count()) await joinButton.click();
    meetingState = { status: "joined_or_waiting", url: meetingUrl, message: "Nova está en Meet o esperando aprobación del anfitrión." };
  } catch (error) {
    meetingState = { status: "error", url: meetingUrl, message: error.message };
  }
}

function meetingStatus(res) {
  res.writeHead(200, { "content-type": "application/json" });
  res.end(JSON.stringify(meetingState));
}

const server = http.createServer(async (req, res) => {
  try {
    if (req.method === "POST" && req.url === "/api/chat") return await chat(req, res);
    if (req.method === "POST" && req.url === "/api/meetings/join") return await joinMeeting(req, res);
    if (req.method === "GET" && req.url === "/api/meetings/status") return meetingStatus(res);
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
