const { chromium } = require("playwright-core");
(async () => {
  const ctx = await chromium.launchPersistentContext("D:/dsh-workspace/hj2/edge-profile", {
    executablePath: "C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe",
    headless: true, viewport: { width: 1280, height: 800 },
    args: ["--use-angle=swiftshader", "--enable-unsafe-swiftshader"]
  });
  const page = ctx.pages()[0] || await ctx.newPage();
  await page.goto("http://127.0.0.1:4000/?shell=1", { waitUntil: "domcontentloaded", timeout: 60000 });
  await page.waitForFunction(() => document.body.innerText.includes("Skirmish"), null, { timeout: 120000 });
  await page.getByText("Skirmish", { exact: true }).click();
  await page.waitForTimeout(3000);
  await page.locator("pre.menu-mp-slot-text", { hasText: "島嶼" }).click();
  await page.waitForTimeout(1500);
  console.log("BODY:\n", (await page.evaluate(() => document.body.innerText)).slice(0,3000));
  await page.screenshot({ path: "D:/dsh-workspace/hj2/shot-maplist.png" });
  const pres = await page.evaluate(() => Array.from(document.querySelectorAll('pre.menu-mp-slot-text')).map(p=>p.innerText));
  console.log("PRES", JSON.stringify(pres.slice(0,20)));
  await ctx.close();
})().catch(e => { console.error("FATAL", e); process.exit(1); });
