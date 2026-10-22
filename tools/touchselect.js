const { chromium } = require("playwright-core");
(async () => {
  const ctx = await chromium.launchPersistentContext("D:/dsh-workspace/hj2/edge-profile-touch", {
    executablePath: "C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe",
    headless: true, viewport: { width: 800, height: 363 }, deviceScaleFactor: 3.5,
    hasTouch: true, isMobile: true,
    args: ["--use-angle=swiftshader", "--enable-unsafe-swiftshader"]
  });
  const page = ctx.pages()[0] || await ctx.newPage();
  page.on("pageerror", e => console.log("PAGEERROR", e.message.slice(0,800)));
  await page.goto("http://127.0.0.1:4002/?shell=1", { waitUntil: "domcontentloaded", timeout: 60000 });
  await page.waitForFunction(() => document.body.innerText.includes("Skirmish"), null, { timeout: 180000 });
  await page.getByText("Skirmish", { exact: true }).tap();
  await page.waitForTimeout(2500);
  await page.getByText("???").first().tap();
  await page.waitForTimeout(400);
  await page.getByText("中國", { exact: true }).last().tap();
  await page.waitForTimeout(400);
  let body = await page.evaluate(() => document.body.innerText);
  if (!body.includes("正式錦標賽地圖 A")) {
    await page.getByText("自訂戰役", { exact: true }).tap();
    await page.waitForTimeout(1200);
    await page.locator("input.new-message").fill("正式錦標賽");
    await page.waitForTimeout(700);
    await page.locator("div.map-list div.list-item").first().dblclick();
    await page.waitForTimeout(2000);
  }
  await page.getByText("開始遊戲", { exact: true }).tap();
  await page.waitForTimeout(10000);
  const sel = async () => page.evaluate(() => window.__ra2game.getUnitSelection().getSelectedUnits().map(u=>[u.name,u.id]));
  console.log("initial selection", JSON.stringify(await sel()));
  let found = false;
  for (let y = 90; y <= 150 && !found; y += 12) {
    for (let x = 190; x <= 270 && !found; x += 12) {
      await page.touchscreen.tap(x, y);
      await page.waitForTimeout(250);
      const s = await sel();
      if (s.length) { console.log("selected at", x, y, JSON.stringify(s)); found = true; }
    }
  }
  if (found) {
    await page.keyboard.press("d");
    await page.waitForTimeout(5000);
    const b = await page.evaluate(() => ({ buildings: [...window.__ra2player.buildings].map(x=>x.name) }));
    console.log("after d", JSON.stringify(b));
  }
  await page.screenshot({ path: "D:/dsh-workspace/hj2/touch-select.png" });
  await ctx.close();
})().catch(e => { console.error("FATAL", e); process.exit(1); });
