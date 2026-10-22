const { chromium } = require("playwright-core");
(async () => {
  const ctx = await chromium.launchPersistentContext("D:/dsh-workspace/hj2/edge-profile-1024", {
    executablePath: "C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe",
    headless: true, viewport: { width: 1024, height: 768 },
    args: ["--use-angle=swiftshader", "--enable-unsafe-swiftshader"]
  });
  const page = ctx.pages()[0] || await ctx.newPage();
  page.on("pageerror", e => console.log("PAGEERROR", e.message.slice(0,800)));
  await page.goto("http://127.0.0.1:4000/?shell=1", { waitUntil: "domcontentloaded", timeout: 60000 });
  await page.waitForFunction(() => document.body.innerText.includes("Skirmish"), null, { timeout: 180000 });
  await page.getByText("Skirmish", { exact: true }).click();
  await page.waitForTimeout(2000);
  await page.getByText("???").first().click();
  await page.waitForTimeout(300);
  await page.getByText("中國", { exact: true }).last().click();
  await page.waitForTimeout(300);
  let body = await page.evaluate(() => document.body.innerText);
  if (!body.includes("正式錦標賽地圖 A")) {
    await page.getByText("自訂戰役", { exact: true }).click();
    await page.waitForTimeout(1000);
    await page.locator("input.new-message").fill("正式錦標賽");
    await page.waitForTimeout(600);
    await page.locator("div.map-list div.list-item").first().dblclick();
    await page.waitForTimeout(1500);
  }
  await page.getByText("開始遊戲", { exact: true }).click();
  await page.waitForTimeout(10000);
  await page.mouse.click(430, 380);
  await page.waitForTimeout(500);
  await page.keyboard.press("d");
  await page.waitForTimeout(4000);
  const pt = await page.evaluate(() => window.__ra2debug.helpers.getSidebarTechnoClickPointByName('CAPOWR'));
  await page.mouse.click(pt.x, pt.y);
  await page.waitForTimeout(30000);
  await page.mouse.click(pt.x, pt.y);
  await page.waitForTimeout(800);
  await page.mouse.click(520, 430);
  await page.waitForTimeout(3000);
  const info = await page.evaluate(() => {
    const p = window.__ra2player;
    const sm = window.__ra2debug?.sidebarModel ?? window.__ra2game?.playerUi?.sidebarModel;
    return {
      buildings: [...p.buildings].map(b => b.name),
      avail: p.production.getAvailableObjects().map(o => ({ name: o.name, tech: o.techLevel, prereq: o.prerequisite, cat: o.buildCat })),
      tabs: (window.__ra2game?.playerUi?.sidebarModel?.tabs ?? []).map(t => ({ id: t.id, items: t.items.map(i => i.target?.rules?.name) }))
    };
  });
  console.log(JSON.stringify(info, null, 1).slice(0, 5000));
  await page.screenshot({ path: "D:/dsh-workspace/hj2/bc10.png" });
  await ctx.close();
})().catch(e => { console.error("FATAL", e); process.exit(1); });
