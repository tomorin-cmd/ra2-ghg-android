const { chromium } = require("playwright-core");
(async()=>{
 const ctx=await chromium.launchPersistentContext("D:/dsh-workspace/hj2/edge-profile-dist",{
  executablePath:"C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe",headless:true,
  viewport:{width:1024,height:768},args:["--use-angle=swiftshader","--enable-unsafe-swiftshader"]});
 const page=ctx.pages()[0]||await ctx.newPage();
 page.on("pageerror",e=>console.log("PAGEERROR",e.message.slice(0,1200)));
 page.on("console",m=>{const t=m.text();if(/error|Error|Unsupported|trigger|Trigger|house|House|map|Map|fail/i.test(t)) console.log("C",m.type(),t.slice(0,600))});
 await page.goto("http://127.0.0.1:4002/?shell=1",{waitUntil:"domcontentloaded",timeout:60000});
 await page.waitForFunction(()=>document.body.innerText.includes("Skirmish"),null,{timeout:180000});
 await page.getByText("Skirmish",{exact:true}).click();
 await page.waitForTimeout(2500);
 await page.getByText("???").first().click();
 await page.waitForTimeout(300);
 await page.getByText("中國",{exact:true}).last().click();
 await page.waitForTimeout(300);
 await page.getByText("自訂戰役",{exact:true}).click();
 await page.waitForTimeout(1200);
 await page.locator("input.new-message").fill("TRN01");
 await page.waitForTimeout(800);
 console.log("items", JSON.stringify(await page.locator("div.map-list div.list-item").allInnerTexts()));
 await page.locator("div.map-list div.list-item").first().dblclick();
 await page.waitForTimeout(15000);
 const info=await page.evaluate(()=>{
   const p=window.__ra2player; const g=window.__ra2game;
   return {body:document.body.innerText.slice(0,300), buildings:[...p.buildings].map(b=>b.name), units:p.getOwnedObjects?.().filter(o=>o.isUnit?.()).map(u=>u.name).slice(0,20), players:g.getPlayerList?.().getAll?.().map(x=>x.name), map:g.map?.name};
 });
 console.log(JSON.stringify(info,null,1).slice(0,3000));
 await page.screenshot({path:"D:/dsh-workspace/hj2/campaign-trn01.png"});
 await ctx.close();
})().catch(e=>{console.error("FATAL",e);process.exit(1)});
