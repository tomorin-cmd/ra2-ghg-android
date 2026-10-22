const { chromium } = require("playwright-core");
(async () => {
  const ctx = await chromium.launchPersistentContext("D:/dsh-workspace/hj2/edge-profile", {
    executablePath: "C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe",
    headless: true, viewport: { width: 1280, height: 800 },
    args: ["--use-angle=swiftshader", "--enable-unsafe-swiftshader"]
  });
  const page = ctx.pages()[0] || await ctx.newPage();
  page.on("pageerror", e => console.log("PAGEERROR", e.message.slice(0,500)));
  await page.goto("http://127.0.0.1:4000/?shell=1", { waitUntil: "domcontentloaded", timeout: 60000 });
  await page.waitForFunction(() => document.body.innerText.includes("Skirmish"), null, { timeout: 120000 });
  await page.getByText("Skirmish", { exact: true }).click();
  await page.waitForTimeout(4000);
  const info = await page.evaluate(() => {
    const sels = Array.from(document.querySelectorAll('select')).map(s => ({name:s.name, cls:s.className, opts:Array.from(s.options).map(o=>o.text)}));
    const inputs = Array.from(document.querySelectorAll('input')).map(i => ({type:i.type, cls:i.className, value:i.value}));
    const btns = Array.from(document.querySelectorAll('button')).map(b => ({text:b.innerText, cls:b.className}));
    const html = document.querySelector('.player-slot, .players, .lobby-form')?.outerHTML?.slice(0,3000);
    return {sels, inputs, btns, html};
  });
  console.log(JSON.stringify(info, null, 1).slice(0,8000));
  console.log("CLICK CUSTOM CAMPAIGN");
  await page.getByText("自訂戰役", { exact: true }).click();
  await page.waitForTimeout(3000);
  console.log("BODY2:", (await page.evaluate(() => document.body.innerText)).slice(0,2000));
  await page.screenshot({ path: "D:/dsh-workspace/hj2/shot-customcamp.png" });
  await ctx.close();
})().catch(e => { console.error("FATAL", e); process.exit(1); });
