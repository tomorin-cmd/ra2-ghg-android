const { chromium } = require("playwright-core");
(async () => {
  const ctx = await chromium.launchPersistentContext("D:/dsh-workspace/hj2/edge-profile-1024", {
    executablePath: "C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe",
    headless: true, viewport: { width: 1024, height: 768 },
    args: ["--use-angle=swiftshader", "--enable-unsafe-swiftshader"]
  });
  const page = ctx.pages()[0] || await ctx.newPage();
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
  const info = await page.evaluate(() => {
    const c = document.querySelector('canvas');
    const root = document.getElementById('ra2web-root');
    const el = document.elementFromPoint(912,296);
    const el2 = document.elementFromPoint(430,380);
    return {
      canvas: c ? { rect: c.getBoundingClientRect().toJSON(), w: c.width, h: c.height, cls: c.className, style: c.getAttribute('style') } : null,
      rootChildren: root ? Array.from(root.children).map(x => ({tag:x.tagName, id:x.id, cls:x.className, rect:x.getBoundingClientRect().toJSON()})) : null,
      sidebarTop: el ? {tag:el.tagName, id:el.id, cls:el.className, html:el.outerHTML.slice(0,300)} : null,
      worldTop: el2 ? {tag:el2.tagName, id:el2.id, cls:el2.className} : null
    };
  });
  console.log(JSON.stringify(info, null, 1));
  await ctx.close();
})().catch(e => { console.error("FATAL", e); process.exit(1); });
