const { chromium } = require("playwright-core");
(async () => {
  const ctx = await chromium.launchPersistentContext("D:/dsh-workspace/hj2/edge-profile-touch", {
    executablePath: "C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe",
    headless: true, viewport: { width: 800, height: 363 }, deviceScaleFactor: 3.5,
    hasTouch: true, isMobile: true,
    args: ["--use-angle=swiftshader", "--enable-unsafe-swiftshader"]
  });
  const page = ctx.pages()[0] || await ctx.newPage();
  await page.goto("http://127.0.0.1:4002/?shell=1", { waitUntil: "domcontentloaded", timeout: 60000 });
  await page.waitForFunction(() => document.body.innerText.includes("Skirmish"), null, { timeout: 120000 });
  const info = await page.evaluate(() => {
    const c=document.querySelector('canvas'); const r=c.getBoundingClientRect();
    return { inner:[innerWidth,innerHeight], vv:[visualViewport.width,visualViewport.height,visualViewport.scale], dpr:devicePixelRatio, rect:{x:r.x,y:r.y,w:r.width,h:r.height}, canvas:[c.width,c.height], client:[c.clientWidth,c.clientHeight], menu:document.querySelector('.video-wrapper')?.getBoundingClientRect().toJSON() };
  });
  console.log(JSON.stringify(info,null,1));
  await page.screenshot({path:'D:/dsh-workspace/hj2/mobile-menu.png'});
  await ctx.close();
})().catch(e=>{console.error("FATAL",e);process.exit(1)});
