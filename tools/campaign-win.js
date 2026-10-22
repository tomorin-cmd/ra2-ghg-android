const { chromium } = require("playwright-core");
(async()=>{
 const ctx=await chromium.launchPersistentContext("D:/dsh-workspace/hj2/edge-profile-dist",{
  executablePath:"C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe",headless:true,
  viewport:{width:1024,height:768},args:["--use-angle=swiftshader","--enable-unsafe-swiftshader"]});
 const page=ctx.pages()[0]||await ctx.newPage();
 page.on("pageerror",e=>console.log("PAGEERROR",e.message.slice(0,1500)));
 page.on("console",m=>{const t=m.text();if(/Campaign\] (Win|Lose)|onGameEnd|error/i.test(t)) console.log("C",m.type(),t.slice(0,800))});
 await page.goto("http://127.0.0.1:4002/?shell=1",{waitUntil:"domcontentloaded",timeout:60000});
 await page.waitForFunction(()=>document.body.innerText.includes("Skirmish"),null,{timeout:180000});
 await page.getByText("Skirmish",{exact:true}).click(); await page.waitForTimeout(2500);
 await page.getByText("???").first().click(); await page.waitForTimeout(300);
 await page.getByText("中國",{exact:true}).last().click(); await page.waitForTimeout(300);
 await page.getByText("自訂戰役",{exact:true}).click(); await page.waitForTimeout(1200);
 await page.locator("input.new-message").fill("TRN01"); await page.waitForTimeout(700);
 await page.locator("div.map-list div.list-item").first().dblclick(); await page.waitForTimeout(2500);
 await page.getByText("開始遊戲",{exact:true}).click(); await page.waitForTimeout(8000);
 const r=await page.evaluate(()=>{
   const g=window.__ra2game;
   const t=g.map.getTriggers().find(t=>t.actions.some(a=>a.type===1));
   if(!t) return {found:false, triggers:g.map.getTriggers().length};
   const before={status:g.status,localDefeated:g.localPlayer.defeated,defeated:g.playerList.getAll().map(p=>[p.name,p.defeated])};
   g.triggers.forceTrigger(t.id,g);
   return {found:true,name:t.name,id:t.id,before,after:{status:g.status,localDefeated:g.localPlayer.defeated,defeated:g.playerList.getAll().map(p=>[p.name,p.defeated])}};
 });
 console.log(JSON.stringify(r,null,1));
 await page.waitForTimeout(1000);
 await ctx.close();
})().catch(e=>{console.error("FATAL",e);process.exit(1)});
