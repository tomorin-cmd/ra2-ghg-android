const { chromium } = require("playwright-core");
(async () => {
  const ctx = await chromium.launchPersistentContext("D:/dsh-workspace/hj2/edge-profile-touch1024", {
    executablePath: "C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe",
    headless: true, viewport: { width: 1024, height: 768 }, hasTouch: true,
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
  const geom = await page.evaluate(() => {
    const c=document.querySelector('canvas'); const r=c.getBoundingClientRect();
    const h=window.__ra2debug.helpers;
    return { rect:{x:r.x,y:r.y,w:r.width,h:r.height}, client:[c.clientWidth,c.clientHeight], mcv:h.getOwnedUnitClickPointByName('CMCV') };
  });
  console.log("geom", JSON.stringify(geom));
  const p = geom.mcv; // 1024x768, no scaling
  await page.touchscreen.tap(p.viewportX, p.viewportY);
  await page.waitForTimeout(500);
  const sel = await page.evaluate(() => window.__ra2game.getUnitSelection().getSelectedUnits().map(u=>[u.name,u.id]));
  console.log("selection", JSON.stringify(sel));
  await page.keyboard.press("d");
  await page.waitForTimeout(5000);
  const b = await page.evaluate(() => ({ buildings: [...window.__ra2player.buildings].map(x=>x.name) }));
  console.log("after d", JSON.stringify(b));
  await page.screenshot({path:'D:/dsh-workspace/hj2/touch1024.png'});
  await ctx.close();
})().catch(e=>{console.error("FATAL",e);process.exit(1)});
