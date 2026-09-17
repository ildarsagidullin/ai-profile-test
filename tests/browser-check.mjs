import assert from "node:assert/strict";
import { writeFileSync } from "node:fs";
import { resolve } from "node:path";

const endpoint = process.env.CDP_ENDPOINT ?? "http://127.0.0.1:9224";
const pages = await (await fetch(`${endpoint}/json`)).json();
const page = pages.find((item) => item.type === "page");
if (!page) throw new Error("Не найдена вкладка Edge для браузерной проверки");

const socket = new WebSocket(page.webSocketDebuggerUrl);
const pending = new Map();
let messageId = 0;
socket.addEventListener("message", (event) => {
  const message = JSON.parse(event.data);
  if (!message.id || !pending.has(message.id)) return;
  const { resolve: done, reject } = pending.get(message.id);
  pending.delete(message.id);
  message.error ? reject(new Error(JSON.stringify(message.error))) : done(message.result);
});
await new Promise((done, reject) => {
  socket.addEventListener("open", done, { once: true });
  socket.addEventListener("error", reject, { once: true });
});

function command(method, params = {}) {
  const id = ++messageId;
  socket.send(JSON.stringify({ id, method, params }));
  return new Promise((done, reject) => pending.set(id, { resolve: done, reject }));
}

async function evaluate(expression) {
  const response = await command("Runtime.evaluate", { expression, awaitPromise: true, returnByValue: true });
  if (response.exceptionDetails) throw new Error(response.exceptionDetails.text);
  return response.result.value;
}

const pause = (duration = 80) => new Promise((done) => setTimeout(done, duration));

async function waitFor(expression, timeout = 5000) {
  const started = Date.now();
  while (Date.now() - started < timeout) {
    if (await evaluate(expression)) return;
    await pause(70);
  }
  throw new Error(`Не дождались условия: ${expression}`);
}

async function setViewport(width, height) {
  await command("Emulation.setDeviceMetricsOverride", { width, height, deviceScaleFactor: 1, mobile: true, screenWidth: width, screenHeight: height });
  await pause(120);
}

async function navigate(url) {
  await command("Page.navigate", { url });
  await waitFor("document.readyState === 'complete'");
  await waitFor("Boolean(document.querySelector('#app > *'))");
}

async function clickValue(value) {
  await evaluate(`(() => { const input = [...document.querySelectorAll('input')].find((item) => item.value === ${JSON.stringify(value)}); if (!input) throw new Error('Нет варианта ${value}'); input.click(); return true; })()`);
  await pause();
}

async function clickPrimary() {
  await evaluate("document.querySelector('.actions .btn-primary, #app > .btn-primary').click(); true");
  await pause();
}

async function fill(selector, value) {
  await evaluate(`(() => { const field = document.querySelector(${JSON.stringify(selector)}); field.value = ${JSON.stringify(value)}; field.dispatchEvent(new Event('input', { bubbles: true })); return true; })()`);
  await pause();
}

async function screenshot(filename) {
  const metrics = await command("Page.getLayoutMetrics");
  const width = Math.ceil(metrics.cssContentSize.width);
  const height = Math.ceil(metrics.cssContentSize.height);
  const shot = await command("Page.captureScreenshot", {
    format: "png",
    fromSurface: true,
    captureBeyondViewport: true,
    clip: { x: 0, y: 0, width, height, scale: 1 }
  });
  writeFileSync(resolve(filename), Buffer.from(shot.data, "base64"));
  return { width, height };
}

await command("Page.enable");
await command("Runtime.enable");
await setViewport(390, 844);
await navigate("http://localhost:4174/?demo=1&utm_source=instagram&utm_campaign=reel-a&utm_content=hook-1");
await evaluate("localStorage.clear(); sessionStorage.clear(); location.reload(); true");
await waitFor("document.readyState === 'complete' && Boolean(document.querySelector('#app > *'))");

const introWidth = await evaluate("({scroll: document.documentElement.scrollWidth, client: document.documentElement.clientWidth})");
assert.equal(introWidth.scroll, introWidth.client, "Первый экран не должен иметь горизонтальный скролл");
await screenshot("intro-390-cdp.png");

// Черновик, возврат назад и восстановление после перезагрузки.
await clickPrimary();
await clickValue("business");
await clickPrimary();
await clickValue("constant");
await evaluate("[...document.querySelectorAll('button')].find((button) => button.textContent.includes('Назад')).click(); true");
await pause();
assert.equal(await evaluate("document.querySelector('input[value=\"business\"]').checked"), true);
await command("Page.reload");
await waitFor("document.readyState === 'complete' && Boolean(document.querySelector('input[value=\"business\"]'))");
assert.equal(await evaluate("document.querySelector('input[value=\"business\"]').checked"), true);

// Полное прохождение с максимальными ответами.
await clickPrimary();
await clickValue("constant");
await clickPrimary();
for (const value of ["chatgpt", "claude", "gemini", "code", "automation"]) await clickValue(value);
await clickPrimary();
await clickValue("automation");
await clickPrimary();
await clickValue("systems");
await clickPrimary();
await clickValue("tests");
await clickPrimary();
await clickValue("agent");
await clickValue("workflow");
await clickPrimary();
await clickValue("automated");
await clickPrimary();
await clickValue("business");
await clickPrimary();
assert.match(await evaluate("document.querySelector('h2').textContent"), /бизнес-процессы/);
await clickValue("result");
await clickPrimary();
await clickValue("regular");
await clickPrimary();
await clickValue("over20");
await clickPrimary();
await clickValue("none");
await clickPrimary();
await fill("textarea", "Автоматизировать продажи и поддержку, сэкономив 10 часов в неделю");
await clickPrimary();
await waitFor("Boolean(document.querySelector('.contact-title'))");

// Ошибка контакта, затем Instagram в URL-формате.
await fill("#name", "И");
await clickPrimary();
assert.match(await evaluate("document.querySelector('.error-message').textContent"), /хотя бы два/);
await fill("#name", "Ильдар");
await clickValue("instagram");
await fill("#username", "https://instagram.com/ildar.ai/");
await clickValue("on");
await clickPrimary();
await waitFor("Boolean(document.querySelector('.result-title'))");
assert.equal(await evaluate("document.querySelector('.result-title').textContent"), "AI-архитектор");
assert.equal(await evaluate("document.querySelector('.score-value').textContent"), "100");
assert.equal(await evaluate("document.querySelectorAll('.dimension-item').length"), 4);
assert.equal(await evaluate("document.documentElement.scrollWidth === document.documentElement.clientWidth"), true);
await screenshot("result-390-cdp.png");

await setViewport(430, 932);
assert.equal(await evaluate("document.documentElement.scrollWidth === document.documentElement.clientWidth"), true);
await screenshot("result-430-cdp.png");

await setViewport(1440, 1000);
assert.equal(await evaluate("document.documentElement.scrollWidth === document.documentElement.clientWidth"), true);
await screenshot("result-1440-cdp.png");

const completed = JSON.parse(await evaluate("localStorage.getItem('ai-profile-reels-complete-v1')"));
assert.equal(completed.result.overall, 100);
assert.equal(completed.contactChannel, "Instagram");

console.log(JSON.stringify({ ok: true, profile: completed.result.profile.name, overall: completed.result.overall }));
socket.close();
