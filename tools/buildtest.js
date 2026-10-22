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
  const qstate = async () => page.evaluate(() => {
    const p = window.__ra2player;
    const q = p.production.getAllQueues().find(q => q.type === 0);
    return { credits: p.credits, status: q.status, size: q.currentSize, first: q.getFirst()?.rules?.name, buildings: [...p.buildings].map(b => b.name) };
  });
  const pt = await page.evaluate(() => window.__ra2debug.helpers.getSidebarTechnoClickPointByName('CAPOWR'));
  console.log("pt", JSON.stringify(pt));
  await page.mouse.click(pt.x, pt.y);
  for (let i=0;i<20;i++) {
    await page.waitForTimeout(2000);
    const s = await qstate();
    console.log("prod", i, JSON.stringify(s));
    if (s.status === 2) break;
  }
  console.log("enter placement");
  await page.mouse.click(pt.x, pt.y);
  await page.waitForTimeout(1000);
  for (const [x,y] of [[540,400],[520,430],[470,470],[360,420],[450,300],[600,350]]) {
    await page.mouse.click(x,y);
    await page.waitForTimeout(1200);
    const s = await qstate();
    console.log("place", x, y, JSON.stringify(s));
    if (s.buildings.includes('CAPOWR')) break;
  }
  await page.screenshot({ path: "D:/dsh-workspace/hj2/bc9.png" });
  await ctx.close();
})().catch(e => { console.error("FATAL", e); process.exit(1); });
