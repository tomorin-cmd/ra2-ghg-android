const { chromium } = require("playwright-core");
(async()=>{
 const ctx=await chromium.launchPersistentContext("D:/dsh-workspace/hj2/edge-profile-dist",{
  executablePath:"C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe",headless:true,
  viewport:{width:1024,height:768},args:["--use-angle=swiftshader","--enable-unsafe-swiftshader"]});
 const page=ctx.pages()[0]||await ctx.newPage();
 page.on("pageerror",e=>console.log("PAGEERROR",e.message.slice(0,1800)));
 page.on("console",m=>{const t=m.text();if(/Campaign|onGameEnd|next|Error|error|Failed/i.test(t)) console.log("C",m.type(),t.slice(0,900))});
 await page.goto("http://127.0.0.1:4002/?shell=1",{waitUntil:"domcontentloaded",timeout:60000});
 await page.waitForFunction(()=>document.body.innerText.includes("Campaign (Debug)"),null,{timeout:180000});
 await page.getByText("Campaign (Debug)",{exact:true}).click(); await page.waitForTimeout(600);
 await page.getByText("盟军 01",{exact:true}).click(); await page.waitForTimeout(15000);
 console.log("OBJECTIVES", JSON.stringify((await page.evaluate(()=>document.body.innerText)).split('\n').filter(x=>x.includes('任務目標'))));
 await page.screenshot({path:"D:/dsh-workspace/hj2/campaign-objectives.png"});
 const r=await page.evaluate(()=>{
   const g=window.__ra2game;
   const t=g.map.getTriggers().find(t=>t.actions.some(a=>a.type===1));
   if(!t) return {found:false};
   g.triggers.forceTrigger(t.id,g);
   return {found:true,name:t.name,status:g.status};
 });
 console.log("FORCE",JSON.stringify(r));
 await page.waitForTimeout(1500);
 console.log("DIALOG", (await page.evaluate(()=>document.body.innerText)).slice(-300));
 await page.screenshot({path:"D:/dsh-workspace/hj2/campaign-next-prompt.png"});
 const nextBtn=page.getByText("下一關",{exact:true});
 if(await nextBtn.count()){
   await nextBtn.click();
   await page.waitForTimeout(18000);
   const info=await page.evaluate(()=>({map:window.__ra2game?.gameOpts?.mapName,name:window.__ra2player?.name,status:window.__ra2game?.status}));
   console.log("NEXT",JSON.stringify(info));
   await page.screenshot({path:"D:/dsh-workspace/hj2/campaign-all02.png"});
 } else console.log("NO NEXT BUTTON");
 await ctx.close();
})().catch(e=>{console.error("FATAL",e);process.exit(1)});
