const { chromium } = require("playwright-core");
(async () => {
  const ctx = await chromium.launchPersistentContext("D:/dsh-workspace/hj2/edge-profile-dist", {
    executablePath: "C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe",
    headless: true, viewport: { width: 1024, height: 768 },
    args: ["--use-angle=swiftshader", "--enable-unsafe-swiftshader"]
  });
  const page = ctx.pages()[0] || await ctx.newPage();
  page.on("pageerror", e => console.log("PAGEERROR", e.message.slice(0,1000)));
  page.on("console", m => { const t=m.text(); if(/error|fail|seed|GameRes|Csf/i.test(t)) console.log("CONSOLE", m.type(), t.slice(0,600)); });
  await page.goto("http://127.0.0.1:4002/?shell=1", { waitUntil: "domcontentloaded", timeout: 60000 });
  await page.waitForFunction(() => document.body.innerText.includes("Skirmish"), null, { timeout: 180000 });
  console.log("MENU OK", JSON.stringify((await page.evaluate(() => document.body.innerText)).slice(0,300)));
  await page.screenshot({ path: "D:/dsh-workspace/hj2/dist-menu.png" });
  await ctx.close();
})().catch(e => { console.error("FATAL", e); process.exit(1); });
