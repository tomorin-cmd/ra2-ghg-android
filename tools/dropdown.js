const { chromium } = require("playwright-core");
(async () => {
  const ctx = await chromium.launchPersistentContext("D:/dsh-workspace/hj2/edge-profile", {
    executablePath: "C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe",
    headless: true, viewport: { width: 1280, height: 800 },
    args: ["--use-angle=swiftshader", "--enable-unsafe-swiftshader"]
  });
  const page = ctx.pages()[0] || await ctx.newPage();
  page.on("pageerror", e => console.log("PAGEERROR", e.message.slice(0,800)));
  page.on("console", m => { const t=m.text(); if(/error|fail/i.test(t)) console.log("CONSOLE", m.type(), t.slice(0,400)); });
  await page.goto("http://127.0.0.1:4000/?shell=1", { waitUntil: "domcontentloaded", timeout: 60000 });
  await page.waitForFunction(() => document.body.innerText.includes("Skirmish"), null, { timeout: 120000 });
  await page.getByText("Skirmish", { exact: true }).click();
  await page.waitForTimeout(4000);
  console.log("??? count", await page.getByText("???").count());
  await page.getByText("???").first().click();
  await page.waitForTimeout(1500);
  console.log("BODY AFTER CLICK:\n", (await page.evaluate(() => document.body.innerText)).slice(0,2500));
  await page.screenshot({ path: "D:/dsh-workspace/hj2/shot-dropdown.png" });
  await ctx.close();
})().catch(e => { console.error("FATAL", e); process.exit(1); });
