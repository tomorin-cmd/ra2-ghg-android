const { chromium } = require("playwright-core");
(async () => {
  const browser = await chromium.connectOverCDP("http://127.0.0.1:9222");
  const pages = browser.contexts()[0].pages();
  console.log("pages", pages.length);
  const page = pages[0];
  const info = await page.evaluate(() => {
    const c = document.querySelector('canvas');
    return {
      inner: [window.innerWidth, window.innerHeight],
      dpr: window.devicePixelRatio,
      screen: [window.screen.width, window.screen.height],
      canvas: c ? { rect: c.getBoundingClientRect().toJSON(), w: c.width, h: c.height } : null,
      body: document.body.innerText.slice(0,200),
      ua: navigator.userAgent
    };
  });
  console.log(JSON.stringify(info, null, 1));
  await browser.close();
})().catch(e => { console.error("FATAL", e); process.exit(1); });
