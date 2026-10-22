const { chromium } = require("playwright-core");
(async () => {
  const ctx = await chromium.launchPersistentContext("D:/dsh-workspace/hj2/edge-profile-1024", {
    executablePath: "C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe",
    headless: true, viewport: { width: 1024, height: 768 },
    args: ["--use-angle=swiftshader", "--enable-unsafe-swiftshader", "--autoplay-policy=no-user-gesture-required"]
  });
  const page = ctx.pages()[0] || await ctx.newPage();
  page.on("pageerror", e => console.log("PAGEERROR", e.message.slice(0,1200)));
  page.on("console", m => { const t=m.text(); if(/SidebarDiag|HudDiag|error|fail|exception/i.test(t)) console.log("CONSOLE", m.type(), t.slice(0,700)); });
  await page.goto("http://127.0.0.1:4000/?shell=1", { waitUntil: "domcontentloaded", timeout: 60000 });
  await page.waitForFunction(() => document.body.innerText.includes("Skirmish"), null, { timeout: 180000 });
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
  await page.waitForTimeout(10000);
  console.log("deploy");
  await page.mouse.click(430, 380);
  await page.waitForTimeout(600);
  await page.keyboard.press("d");
  await page.waitForTimeout(5000);
  await page.screenshot({ path: "D:/dsh-workspace/hj2/bc1.png" });
  console.log("click power");
  await page.mouse.click(912, 296);
  await page.waitForTimeout(15000);
  await page.screenshot({ path: "D:/dsh-workspace/hj2/bc2.png" });
  console.log("click power again + place");
  await page.mouse.click(912, 296);
  await page.waitForTimeout(1000);
  await page.mouse.click(390, 330);
  await page.waitForTimeout(5000);
  await page.screenshot({ path: "D:/dsh-workspace/hj2/bc3.png" });
  await page.waitForTimeout(6000);
  await page.screenshot({ path: "D:/dsh-workspace/hj2/bc4.png" });
  console.log("done");
  await ctx.close();
})().catch(e => { console.error("FATAL", e); process.exit(1); });
