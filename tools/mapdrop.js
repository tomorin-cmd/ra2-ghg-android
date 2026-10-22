const { chromium } = require("playwright-core");
const fs = require("fs");
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
  await page.getByText("???").first().click();
  await page.waitForTimeout(400);
  await page.getByText("中國", { exact: true }).last().click();
  await page.waitForTimeout(500);
  console.log("click map slot parent");
  await page.locator("div.menu-mp-slot", { hasText: "島嶼" }).click();
  await page.waitForTimeout(2000);
  const body = await page.evaluate(() => document.body.innerText);
  fs.writeFileSync("D:/dsh-workspace/hj2/mapdropdown.txt", body);
  console.log("body length", body.length, "has 選擇地圖", body.includes("選擇地圖"), "has 錦標", body.includes("錦標"));
  await page.screenshot({ path: "D:/dsh-workspace/hj2/shot-mapdrop.png" });
  console.log("click tournament");
  const loc = page.getByText(/正式錦標賽地圖 A/);
  console.log("count", await loc.count());
  if (await loc.count()) { await loc.first().click(); await page.waitForTimeout(1500); }
  const body2 = await page.evaluate(() => document.body.innerText);
  fs.writeFileSync("D:/dsh-workspace/hj2/mapdropdown2.txt", body2);
  console.log("body2 len", body2.length, "has 使用地圖", body2.includes("使用地圖"));
  await page.screenshot({ path: "D:/dsh-workspace/hj2/shot-mapdrop2.png" });
  await ctx.close();
})().catch(e => { console.error("FATAL", e); process.exit(1); });
