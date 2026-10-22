const { chromium } = require("playwright-core");
(async () => {
  const ctx = await chromium.launchPersistentContext("D:/dsh-workspace/hj2/edge-profile", {
    executablePath: "C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe",
    headless: true, viewport: { width: 1280, height: 800 },
    args: ["--use-angle=swiftshader", "--enable-unsafe-swiftshader", "--autoplay-policy=no-user-gesture-required"]
  });
  const page = ctx.pages()[0] || await ctx.newPage();
  page.on("pageerror", e => console.log("PAGEERROR", e.message.slice(0,1500)));
  page.on("console", m => { const t=m.text(); if(/error|fail|exception|crash|GameLoader|unsupported/i.test(t)) console.log("CONSOLE", m.type(), t.slice(0,700)); });
  await page.goto("http://127.0.0.1:4000/?shell=1", { waitUntil: "domcontentloaded", timeout: 60000 });
  await page.waitForFunction(() => document.body.innerText.includes("Skirmish"), null, { timeout: 120000 });
  await page.getByText("Skirmish", { exact: true }).click();
  await page.waitForTimeout(2500);
  await page.getByText("???").first().click();
  await page.waitForTimeout(300);
  await page.getByText("中國", { exact: true }).last().click();
  await page.waitForTimeout(400);
  let body = await page.evaluate(() => document.body.innerText);
  if (body.includes("島嶼之戰")) {
    await page.getByText("自訂戰役", { exact: true }).click();
    await page.waitForTimeout(1200);
    await page.locator("input.new-message").fill("正式錦標賽");
    await page.waitForTimeout(700);
    await page.locator("div.map-list div.list-item").first().dblclick();
    await page.waitForTimeout(2000);
  }
  await page.getByText("開始遊戲", { exact: true }).click();
  await page.waitForTimeout(12000);
  await page.screenshot({ path: "D:/dsh-workspace/hj2/play1.png" });
  console.log("click mcv + deploy");
  await page.mouse.click(560, 380);
  await page.waitForTimeout(500);
  await page.keyboard.press("d");
  await page.waitForTimeout(3500);
  await page.screenshot({ path: "D:/dsh-workspace/hj2/play2.png" });
  console.log("zoom");
  await page.mouse.move(560, 380);
  await page.mouse.wheel(0, -600);
  await page.waitForTimeout(1500);
  await page.screenshot({ path: "D:/dsh-workspace/hj2/play3.png" });
  console.log("body", (await page.evaluate(() => document.body.innerText)).slice(0,600));
  await ctx.close();
})().catch(e => { console.error("FATAL", e); process.exit(1); });
