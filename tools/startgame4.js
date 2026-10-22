const { chromium } = require("playwright-core");
(async () => {
  const ctx = await chromium.launchPersistentContext("D:/dsh-workspace/hj2/edge-profile", {
    executablePath: "C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe",
    headless: true, viewport: { width: 1280, height: 800 },
    args: ["--use-angle=swiftshader", "--enable-unsafe-swiftshader", "--autoplay-policy=no-user-gesture-required"]
  });
  const page = ctx.pages()[0] || await ctx.newPage();
  page.on("pageerror", e => console.log("PAGEERROR", e.message.slice(0,1200)));
  page.on("console", m => { const t=m.text(); if(/error|fail|exception|crash|GameLoader|Starting|unsupported|SMIN|map/i.test(t)) console.log("CONSOLE", m.type(), t.slice(0,700)); });
  await page.goto("http://127.0.0.1:4000/?shell=1", { waitUntil: "domcontentloaded", timeout: 60000 });
  await page.waitForFunction(() => document.body.innerText.includes("Skirmish"), null, { timeout: 180000 });
  await page.getByText("Skirmish", { exact: true }).click();
  await page.waitForTimeout(2500);
  await page.getByText("???").first().click();
  await page.waitForTimeout(300);
  await page.getByText("中國", { exact: true }).last().click();
  await page.waitForTimeout(400);
  await page.getByText("自訂戰役", { exact: true }).click();
  await page.waitForTimeout(1200);
  await page.locator("input.new-message").fill("正式錦標賽");
  await page.waitForTimeout(800);
  await page.locator("div.map-list div.list-item").first().dblclick();
  await page.waitForTimeout(5000);
  console.log("BODY:", (await page.evaluate(() => document.body.innerText)).slice(0,800));
  await page.screenshot({ path: "D:/dsh-workspace/hj2/shot-mapstart.png" });
  for (let i=0;i<15;i++) {
    await page.waitForTimeout(4000);
    let body="";
    try { body = await page.evaluate(() => document.body.innerText.slice(0,500)); } catch(e) { body="EVALERR "+e.message; }
    console.log("TICK",i,JSON.stringify(body));
    if (i%3===0) await page.screenshot({ path: `D:/dsh-workspace/hj2/game-${i}.png` });
    if (/失敗|错误|Error|Fatal|崩潰|crash|不受支持/i.test(body)) break;
  }
  await page.screenshot({ path: "D:/dsh-workspace/hj2/shot-game-final.png" });
  await ctx.close();
})().catch(e => { console.error("FATAL", e); process.exit(1); });
