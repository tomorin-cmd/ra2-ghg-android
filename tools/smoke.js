const { chromium } = require("playwright-core");
(async () => {
  const browser = await chromium.launch({
    executablePath: "C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe",
    headless: true,
    args: ["--use-angle=swiftshader", "--enable-unsafe-swiftshader", "--autoplay-policy=no-user-gesture-required"]
  });
  const ctx = await browser.newContext({ viewport: { width: 1280, height: 800 } });
  const page = await ctx.newPage();
  page.on("console", (m) => {
    const t = m.text();
    if (/error|fail|seed|GameRes|Application|Csf|rules|map|exception/i.test(t)) console.log("CONSOLE", m.type(), t.slice(0, 800));
  });
  page.on("pageerror", (e) => console.log("PAGEERROR", e.message.slice(0, 1200)));
  page.on("requestfailed", (r) => console.log("REQFAIL", r.url(), r.failure()?.errorText));
  console.log("goto");
  await page.goto("http://127.0.0.1:4000/?shell=1", { waitUntil: "domcontentloaded", timeout: 60000 });
  for (let i = 0; i < 60; i++) {
    await page.waitForTimeout(5000);
    let text = "";
    try { text = await page.evaluate(() => document.body.innerText.slice(0, 400)); } catch (e) { text = "EVALERR " + e.message; }
    console.log("TICK", i, JSON.stringify(text));
    if (/Single Player|单人|遭遇战|Skirmish|CAMPAIGN|主菜单|Main Menu|OK|继续/i.test(text)) break;
  }
  await page.screenshot({ path: "D:/dsh-workspace/hj2/shot1.png", fullPage: false });
  console.log("url", page.url(), "title", await page.title());
  await browser.close();
})().catch(e => { console.error("FATAL", e); process.exit(1); });
