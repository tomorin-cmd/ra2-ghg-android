const { chromium } = require("playwright-core");
(async()=>{
 const ctx=await chromium.launchPersistentContext("D:/dsh-workspace/hj2/edge-profile-uiinv5",{
  executablePath:"C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe",headless:true,
  viewport:{width:1024,height:768},args:["--use-angle=swiftshader","--enable-unsafe-swiftshader"]});
 const page=ctx.pages()[0]||await ctx.newPage();
 await page.goto("http://127.0.0.1:4002/?shell=1",{waitUntil:"domcontentloaded",timeout:60000});
 await page.waitForFunction(()=>document.body.innerText.includes("遭遇战"),null,{timeout:180000});
 console.log("CAMPAIGN BUTTON", await page.getByText("战役（测试）",{exact:true}).count());
 await page.getByText("战役（测试）",{exact:true}).click(); await page.waitForTimeout(800);
 console.log("OVERLAY", (await page.evaluate(()=>document.body.innerText)).slice(-220));
 await page.screenshot({path:"D:/dsh-workspace/hj2/ui-zh-campaign-menu.png"});
 await ctx.close();
})().catch(e=>{console.error("FATAL",e);process.exit(1)});
