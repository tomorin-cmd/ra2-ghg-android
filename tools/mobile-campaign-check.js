const { chromium } = require("playwright-core");
(async()=>{
 const ctx=await chromium.launchPersistentContext("D:/dsh-workspace/hj2/edge-profile-mobilecamp",{
  executablePath:"C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe",headless:true,
  viewport:{width:800,height:363},deviceScaleFactor:3.5,hasTouch:true,isMobile:true,
  args:["--use-angle=swiftshader","--enable-unsafe-swiftshader"]});
 const page=ctx.pages()[0]||await ctx.newPage();
 page.on("pageerror",e=>console.log("PAGEERROR",e.message.slice(0,1200)));
 page.on("console",m=>{const t=m.text();if(/Campaign|Failed|error|Error/.test(t)) console.log("C",m.type(),t.slice(0,700))});
 await page.goto("http://127.0.0.1:4002/?shell=1",{waitUntil:"domcontentloaded",timeout:60000});
 await page.waitForFunction(()=>document.body.innerText.includes("遭遇战"),null,{timeout:180000});
 await page.getByText("战役（测试）",{exact:true}).tap(); await page.waitForTimeout(700);
 await page.getByText("教学：基本训练",{exact:true}).tap();
 await page.waitForTimeout(25000);
 const info=await page.evaluate(()=>({player:!!window.__ra2player,name:window.__ra2player?.name,status:window.__ra2game?.status,rect:document.querySelector('canvas')?.getBoundingClientRect().toJSON(),body:document.body.innerText.slice(0,200)}));
 console.log(JSON.stringify(info));
 await page.screenshot({path:"D:/dsh-workspace/hj2/mobile-campaign-trn01.png"});
 await ctx.close();
})().catch(e=>{console.error("FATAL",e);process.exit(1)});
