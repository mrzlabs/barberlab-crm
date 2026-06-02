import { chromium } from "playwright";

const BASE = "http://localhost:3002";

(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  const pageErrors = [];
  page.on("pageerror", (e) => pageErrors.push(e.message));

  await page.goto(`${BASE}/login`, { waitUntil: "load", timeout: 15000 });
  await page.fill('input[name="email"]', "empleado@smartstyle.co");
  await page.fill('input[name="password"]', "SmartStyle2026!");
  console.log("→ Login en :3002 ...");
  await page.click('button[type="submit"]');

  await page.waitForURL("**/empleado/**", { timeout: 30000 })
    .catch(() => page.waitForURL("**/cambiar-clave**", { timeout: 2000 }).catch(() => {}));

  const url = page.url();
  console.log("  URL post-login:", url);

  await page.waitForTimeout(4000);

  const h2s   = await page.$$eval("h2", (es) => es.map((e) => e.textContent?.trim())).catch(() => []);
  const body  = await page.evaluate(() => document.body.innerText.replace(/\s+/g," ").trim().slice(0,1000)).catch(() => "");

  console.log("  H2s:", h2s);
  console.log("\n--- Contenido ---");
  console.log(body);

  const hasBug = pageErrors.some((e) =>
    e.includes("ERR_INVALID_ARG_TYPE") || e.includes("Buffer") || e.includes("Received an instance of Date")
  );
  console.log("\n--- Diagnóstico ---");
  if (pageErrors.length) console.log("Errores JS:", pageErrors.slice(0,5));
  else console.log("✓ Sin errores JavaScript");
  console.log(hasBug ? "✗ ERR_INVALID_ARG_TYPE PERSISTE" : "✓ Sin ERR_INVALID_ARG_TYPE");

  const ss = "C:/Users/USUARIO/AppData/Local/Temp/mi-agenda-final.png";
  await page.screenshot({ path: ss, fullPage: false });
  console.log("→ Screenshot:", ss);
  await browser.close();
})().catch((e) => { console.error("FATAL:", e.message); process.exit(1); });
