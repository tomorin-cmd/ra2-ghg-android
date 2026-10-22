const { chromium } = require("playwright-core");
(async () => {
  const ctx = await chromium.launchPersistentContext("D:/dsh-workspace/hj2/edge-profile", {
    executablePath: "C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe",
    headless: true, viewport: { width: 1280, height: 800 },
    args: ["--use-angle=swiftshader", "--enable-unsafe-swiftshader"]
  });
  const page = ctx.pages()[0] || await ctx.newPage();
  page.on("pageerror", e => console.log("PAGEERROR", e.message.slice(0,1000)));
  page.on("console", m => { const t=m.text(); if(/error|fail|unsupported|GameLoader|Starting/i.test(t)) console.log("CONSOLE", m.type(), t.slice(0,600)); });
  await page.goto("http://127.0.0.1:4000/?shell=1", { waitUntil: "domcontentloaded", timeout: 60000 });
  await page.waitForFunction(() => document.body.innerText.includes("Skirmish"), null, { timeout: 120000 });
  await page.getByText("Skirmish", { exact: true }).click();
  await page.waitForTimeout(3000);
  await page.getByText("???").first().click();
  await page.waitForTimeout(400);
  await page.getByText("中國", { exact: true }).last().click();
  await page.waitForTimeout(500);
  console.log("open custom campaign");
  await page.getByText("自訂戰役", { exact: true }).click();
  await page.waitForTimeout(2000);
  console.log("map count", await page.getByText("正式錦標賽地圖 A（2）", { exact: true }).count());
  if (await page.getByText("正式錦標賽地圖 A（2）", { exact: true }).count()) {
    await page.getByText("正式錦標賽地圖 A（2）", { exact: true }).click();
    await page.waitForTimeout(500);
  }
  await page.screenshot({ path: "D:/dsh-workspace/hj2/shot-customsel.png" });
  console.log("click use map");
  await page.getByText("使用地圖", { exact: true }).click();
  await page.waitForTimeout(3000);
  console.log("BODY:", (await page.evaluate(() => document.body.innerText)).slice(0,1500));
  await page.screenshot({ path: "D:/dsh-workspace/hj2/shot-afteruse.png" });
  await ctx.close();
})().catch(e => { console.error("FATAL", e); process.exit(1); });
