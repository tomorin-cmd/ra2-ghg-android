const { chromium } = require("playwright-core");
(async () => {
  const ctx = await chromium.launchPersistentContext("D:/dsh-workspace/hj2/edge-profile", {
    executablePath: "C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe",
    headless: true, viewport: { width: 1280, height: 800 },
    args: ["--use-angle=swiftshader", "--enable-unsafe-swiftshader"]
  });
  const page = ctx.pages()[0] || await ctx.newPage();
  await page.goto("http://127.0.0.1:4000/?shell=1", { waitUntil: "domcontentloaded", timeout: 60000 });
  await page.waitForFunction(() => document.body.innerText.includes("Skirmish"), null, { timeout: 120000 });
  await page.getByText("Skirmish", { exact: true }).click();
  await page.waitForTimeout(3000);
  const info = await page.evaluate(() => {
    const out = [];
    for (const el of document.querySelectorAll('*')) {
      const t = el.innerText || '';
      if (t.includes('島嶼') || t.includes('錦標')) {
        out.push({tag: el.tagName, cls: el.className, text: t.slice(0,120), childCount: el.children.length});
      }
    }
    return out.slice(0,40);
  });
  console.log(JSON.stringify(info, null, 1));
  await ctx.close();
})().catch(e => { console.error("FATAL", e); process.exit(1); });
