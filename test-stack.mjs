import { chromium } from "playwright";
const BASE = "http://localhost:3002";

(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();

  // Capturar stack traces completos
  page.on("pageerror", (e) => {
    console.log("\n=== PAGE ERROR ===");
    console.log("Message:", e.message);
    console.log("Stack:", e.stack?.split("\n").slice(0,12).join("\n"));
  });

  await page.goto(`${BASE}/login`, { waitUntil: "load" });
  await page.fill('input[name="email"]', "empleado@smartstyle.co");
  await page.fill('input[name="password"]', "SmartStyle2026!");
  await page.click('button[type="submit"]');

  await page.waitForURL("**/empleado/**", { timeout: 30000 }).catch(() => {});
  console.log("URL:", page.url());

  await page.waitForTimeout(5000);
  console.log("Done waiting.");

  await browser.close();
})().catch((e) => console.error("FATAL:", e.message));
