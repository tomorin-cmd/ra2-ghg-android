const { chromium } = require("playwright-core");
(async()=>{
 const ctx=await chromium.launchPersistentContext("D:/dsh-workspace/hj2/edge-profile-uiinv4",{
  executablePath:"C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe",headless:true,
  viewport:{width:1024,height:768},args:["--use-angle=swiftshader","--enable-unsafe-swiftshader"]});
 const page=ctx.pages()[0]||await ctx.newPage();
 await page.goto("http://127.0.0.1:4002/?shell=1",{waitUntil:"domcontentloaded",timeout:60000});
 await page.waitForFunction(()=>document.body.innerText.includes("遭遇战"),null,{timeout:180000});
 await page.getByText("遭遇战",{exact:true}).click(); await page.waitForTimeout(2500);
 await page.getByText("開始遊戲",{exact:true}).click(); await page.waitForTimeout(10000);
 await page.evaluate(()=>window.__ra2game?.end());
 await page.waitForTimeout(8000);
 const eng=await page.evaluate(()=>{const out=new Set();const w=document.createTreeWalker(document.body,NodeFilter.SHOW_TEXT);while(w.nextNode()){const t=w.currentNode.nodeValue.trim();if(/[A-Za-z]{2,}/.test(t)&&t.length<150)out.add(t);}return [...out];});
 console.log("ENG",JSON.stringify(eng.slice(0,100)));
 console.log("BODY", (await page.evaluate(()=>document.body.innerText)).slice(-500));
 await page.screenshot({path:"D:/dsh-workspace/hj2/score-zh.png"});
 await ctx.close();
})().catch(e=>{console.error("FATAL",e);process.exit(1)});
