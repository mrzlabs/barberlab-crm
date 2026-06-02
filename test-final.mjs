import { chromium } from "playwright";
const BASE = "http://localhost:3000";

(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  const errors = [];
  page.on("pageerror", (e) => errors.push(e.message));

  await page.goto(`${BASE}/login`, { waitUntil: "load" });
  await page.fill('input[name="email"]', "empleado@smartstyle.co");
  await page.fill('input[name="password"]', "SmartStyle2026!");
  await page.click('button[type="submit"]');

  await page.waitForURL("**/empleado/**", { timeout: 30000 }).catch(() => {});
  console.log("  URL:", page.url());
  await page.waitForTimeout(5000);

  const h2s  = await page.$$eval("h2", (es) => es.map((e) => e.textContent?.trim())).catch(() => []);
  const body = await page.evaluate(() => document.body.innerText.replace(/\s+/g," ").trim().slice(0,600)).catch(() => "");

  console.log("  H2s:", h2s);
  console.log("  Contenido:", body);

  const hasBug = errors.some((e) => e.includes("instance of Date") || e.includes("ERR_INVALID"));
  console.log(errors.length ? `\n  Errores JS (${errors.length}): ` + errors[0].slice(0,80) : "\n  ✓ Sin errores JavaScript");
  console.log(hasBug ? "✗ BUG PERSISTE" : "✓ ERR_INVALID_ARG_TYPE RESUELTO");

  const ss = "C:/Users/USUARIO/AppData/Local/Temp/mi-agenda-ok.png";
  await page.screenshot({ path: ss, fullPage: false });
  console.log("  Screenshot:", ss);
  await browser.close();
})().catch((e) => { console.error("FATAL:", e.message); process.exit(1); });
