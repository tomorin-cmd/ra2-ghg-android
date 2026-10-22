const { chromium } = require("playwright-core");
(async () => {
  const ctx = await chromium.launchPersistentContext("D:/dsh-workspace/hj2/edge-profile", {
    executablePath: "C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe",
    headless: true, viewport: { width: 1280, height: 800 },
    args: ["--use-angle=swiftshader", "--enable-unsafe-swiftshader", "--autoplay-policy=no-user-gesture-required"]
  });
  const page = ctx.pages()[0] || await ctx.newPage();
  page.on("pageerror", e => console.log("PAGEERROR", e.message.slice(0,1200)));
  page.on("console", m => { const t=m.text(); if(/error|fail|exception|crash|GameLoader|Starting|CMCV|PLA|unsupported/i.test(t)) console.log("CONSOLE", m.type(), t.slice(0,800)); });
  await page.goto("http://127.0.0.1:4000/?shell=1", { waitUntil: "domcontentloaded", timeout: 60000 });
  await page.waitForFunction(() => document.body.innerText.includes("Skirmish"), null, { timeout: 120000 });
  await page.getByText("Skirmish", { exact: true }).click();
  await page.waitForTimeout(3000);
  await page.getByText("???").first().click();
  await page.waitForTimeout(400);
  await page.getByText("中國", { exact: true }).last().click();
  await page.waitForTimeout(500);
  console.log("choose map");
  await page.getByText("島嶼之戰（2）", { exact: true }).click();
  await page.waitForTimeout(1000);
  console.log("map option count", await page.getByText("正式錦標賽地圖 A（2）", { exact: true }).count());
  await page.getByText("正式錦標賽地圖 A（2）", { exact: true }).click();
  await page.waitForTimeout(1000);
  await page.screenshot({ path: "D:/dsh-workspace/hj2/shot-tournament.png" });
  console.log("start");
  await page.getByText("開始遊戲", { exact: true }).click();
  for (let i=0;i<18;i++) {
    await page.waitForTimeout(5000);
    let body="";
    try { body = await page.evaluate(() => document.body.innerText.slice(0,700)); } catch(e) { body="EVALERR "+e.message; }
    console.log("TICK",i,JSON.stringify(body));
    if (i%3===0) await page.screenshot({ path: `D:/dsh-workspace/hj2/shot-game-${i}.png` });
    if (/失敗|错误|Error|Fatal|崩潰|crash|不受支持/i.test(body)) break;
  }
  await page.screenshot({ path: "D:/dsh-workspace/hj2/shot-game-final.png" });
  await ctx.close();
})().catch(e => { console.error("FATAL", e); process.exit(1); });
