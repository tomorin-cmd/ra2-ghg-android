const { chromium } = require("playwright-core");
(async () => {
  const ctx = await chromium.launchPersistentContext("D:/dsh-workspace/hj2/edge-profile", {
    executablePath: "C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe",
    headless: true,
    viewport: { width: 1280, height: 800 },
    args: ["--use-angle=swiftshader", "--enable-unsafe-swiftshader", "--autoplay-policy=no-user-gesture-required"]
  });
  const page = ctx.pages()[0] || await ctx.newPage();
  page.on("console", (m) => {
    const t = m.text();
    if (/error|fail|seed|GameRes|Application|Csf|rules|map|exception|skip/i.test(t)) console.log("CONSOLE", m.type(), t.slice(0, 700));
  });
  page.on("pageerror", (e) => console.log("PAGEERROR", e.message.slice(0, 1200)));
  console.log("goto");
  await page.goto("http://127.0.0.1:4000/?shell=1", { waitUntil: "domcontentloaded", timeout: 60000 });
  await page.waitForFunction(() => document.body.innerText.includes("Skirmish"), null, { timeout: 180000 });
  console.log("menu ready");
  await page.screenshot({ path: "D:/dsh-workspace/hj2/shot-menu.png" });
  console.log("click skirmish");
  await page.getByText("Skirmish", { exact: true }).click();
  await page.waitForTimeout(6000);
  console.log("BODY:", (await page.evaluate(() => document.body.innerText)).slice(0, 3000));
  await page.screenshot({ path: "D:/dsh-workspace/hj2/shot-skirmish.png" });
  await ctx.close();
})().catch(e => { console.error("FATAL", e); process.exit(1); });
