const { chromium } = require("playwright-core");
(async()=>{
 const ctx=await chromium.launchPersistentContext("D:/dsh-workspace/hj2/edge-profile-dist",{
  executablePath:"C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe",headless:true,
  viewport:{width:1024,height:768},args:["--use-angle=swiftshader","--enable-unsafe-swiftshader"]});
 const page=ctx.pages()[0]||await ctx.newPage();
 page.on("pageerror",e=>console.log("PAGEERROR",e.message.slice(0,1200)));
 await page.goto("http://127.0.0.1:4002/?shell=1",{waitUntil:"domcontentloaded",timeout:60000});
 await page.waitForFunction(()=>document.body.innerText.includes("Skirmish"),null,{timeout:180000});
 await page.getByText("Skirmish",{exact:true}).click(); await page.waitForTimeout(2500);
 await page.getByText("???").first().click(); await page.waitForTimeout(300);
 await page.getByText("中國",{exact:true}).last().click(); await page.waitForTimeout(300);
 await page.getByText("開始遊戲",{exact:true}).click(); await page.waitForTimeout(12000);
 const info=await page.evaluate(()=>({player:!!window.__ra2player,name:window.__ra2player?.name,credits:window.__ra2player?.credits,units:window.__ra2player?window.__ra2player.getOwnedObjects(true).filter(o=>o.isUnit?.()).map(u=>u.name):null,status:window.__ra2game?.status,campaign:window.__ra2game?.gameOpts?.campaign}));
 console.log(JSON.stringify(info));
 await page.screenshot({path:"D:/dsh-workspace/hj2/skirmish-regression.png"});
 await ctx.close();
})().catch(e=>{console.error("FATAL",e);process.exit(1)});
