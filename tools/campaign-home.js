const { chromium } = require("playwright-core");
(async()=>{
 const ctx=await chromium.launchPersistentContext("D:/dsh-workspace/hj2/edge-profile-dist",{
  executablePath:"C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe",headless:true,
  viewport:{width:1024,height:768},args:["--use-angle=swiftshader","--enable-unsafe-swiftshader"]});
 const page=ctx.pages()[0]||await ctx.newPage();
 page.on("pageerror",e=>console.log("PAGEERROR",e.message.slice(0,1800)));
 page.on("console",m=>{const t=m.text();if(/Campaign|Failed to load|error|Error|map not found/i.test(t)) console.log("C",m.type(),t.slice(0,900))});
 await page.goto("http://127.0.0.1:4002/?shell=1",{waitUntil:"domcontentloaded",timeout:60000});
 await page.waitForFunction(()=>document.body.innerText.includes("Campaign (Debug)"),null,{timeout:180000});
 console.log("menu has campaign button");
 await page.getByText("Campaign (Debug)",{exact:true}).click();
 await page.waitForTimeout(18000);
 const info=await page.evaluate(()=>({player:!!window.__ra2player, game:!!window.__ra2game, name:window.__ra2player?.name, buildings:window.__ra2player?[...window.__ra2player.buildings].map(b=>b.name):null, units:window.__ra2player?window.__ra2player.getOwnedObjects(true).filter(o=>o.isUnit?.()).map(u=>u.name):null, status:window.__ra2game?.status}));
 console.log(JSON.stringify(info));
 await page.screenshot({path:"D:/dsh-workspace/hj2/campaign-homebutton.png"});
 await ctx.close();
})().catch(e=>{console.error("FATAL",e);process.exit(1)});
