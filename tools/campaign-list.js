const { chromium } = require("playwright-core");
(async()=>{
 const ctx=await chromium.launchPersistentContext("D:/dsh-workspace/hj2/edge-profile-dist",{
  executablePath:"C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe",headless:true,
  viewport:{width:1024,height:768},args:["--use-angle=swiftshader","--enable-unsafe-swiftshader"]});
 const page=ctx.pages()[0]||await ctx.newPage();
 page.on("pageerror",e=>console.log("PAGEERROR",e.message.slice(0,1000)));
 page.on("console",m=>{const t=m.text();if(/map|Error|error|Unsupported|missing/i.test(t)) console.log("C",m.type(),t.slice(0,500))});
 await page.goto("http://127.0.0.1:4002/?shell=1",{waitUntil:"domcontentloaded",timeout:60000});
 await page.waitForFunction(()=>document.body.innerText.includes("Skirmish"),null,{timeout:180000});
 await page.getByText("Skirmish",{exact:true}).click();
 await page.waitForTimeout(2500);
 await page.getByText("自訂戰役",{exact:true}).click();
 await page.waitForTimeout(1500);
 await page.locator("input.new-message").fill("ALL01");
 await page.waitForTimeout(1000);
 console.log("ALL01 items", JSON.stringify(await page.locator("div.map-list div.list-item").allInnerTexts()));
 await page.locator("input.new-message").fill("TRN01");
 await page.waitForTimeout(1000);
 console.log("TRN01 items", JSON.stringify(await page.locator("div.map-list div.list-item").allInnerTexts()));
 await page.locator("input.new-message").fill("");
 await page.waitForTimeout(500);
 console.log("first maps", JSON.stringify((await page.locator("div.map-list div.list-item").allInnerTexts()).slice(-10)));
 await page.screenshot({path:"D:/dsh-workspace/hj2/campaign-maplist.png"});
 await ctx.close();
})().catch(e=>{console.error("FATAL",e);process.exit(1)});
