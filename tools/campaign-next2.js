const { chromium } = require("playwright-core");
(async()=>{
 const ctx=await chromium.launchPersistentContext("D:/dsh-workspace/hj2/edge-profile-dist",{
  executablePath:"C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe",headless:true,
  viewport:{width:1024,height:768},args:["--use-angle=swiftshader","--enable-unsafe-swiftshader"]});
 const page=ctx.pages()[0]||await ctx.newPage();
 page.on("pageerror",e=>console.log("PAGEERROR",e.message.slice(0,1800)));
 page.on("console",m=>{const t=m.text();if(/Campaign|onGameEnd|next|Error|error|Failed/i.test(t)) console.log("C",m.type(),t.slice(0,800))});
 await page.goto("http://127.0.0.1:4002/?shell=1",{waitUntil:"domcontentloaded",timeout:60000});
 await page.waitForFunction(()=>document.body.innerText.includes("Campaign (Debug)"),null,{timeout:180000});
 await page.getByText("Campaign (Debug)",{exact:true}).click(); await page.waitForTimeout(600);
 await page.getByText("盟军 01",{exact:true}).click(); await page.waitForTimeout(9000);
 // close briefing: try both traditional and simplified OK labels
 for (const label of ["確定","确定"]) {
   const btn=page.getByText(label,{exact:true});
   if(await btn.count()){ await btn.last().click(); break; }
 }
 await page.waitForTimeout(500);
 await page.screenshot({path:"D:/dsh-workspace/hj2/campaign-objectives2.png"});
 await page.evaluate(()=>{ const g=window.__ra2game; const t=g.map.getTriggers().find(t=>t.actions.some(a=>a.type===1)); if(t) g.triggers.forceTrigger(t.id,g); });
 await page.waitForTimeout(1500);
 const body=await page.evaluate(()=>document.body.innerText);
 console.log("HAS_NEXT", body.includes("下一關"), "TAIL", body.slice(-240));
 await page.screenshot({path:"D:/dsh-workspace/hj2/campaign-next-prompt2.png"});
 const nextBtn=page.getByText("下一關",{exact:true});
 if(await nextBtn.count()){
   await nextBtn.click(); await page.waitForTimeout(18000);
   console.log("NEXT",JSON.stringify(await page.evaluate(()=>({map:window.__ra2game?.gameOpts?.mapName,name:window.__ra2player?.name,status:window.__ra2game?.status}))));
   await page.screenshot({path:"D:/dsh-workspace/hj2/campaign-all02.png"});
 }
 await ctx.close();
})().catch(e=>{console.error("FATAL",e);process.exit(1)});
