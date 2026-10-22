const { chromium } = require("playwright-core");
(async()=>{
 const ctx=await chromium.launchPersistentContext("D:/dsh-workspace/hj2/edge-profile-uiinv2",{
  executablePath:"C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe",headless:true,
  viewport:{width:1024,height:768},args:["--use-angle=swiftshader","--enable-unsafe-swiftshader"]});
 const page=ctx.pages()[0]||await ctx.newPage();
 await page.goto("http://127.0.0.1:4002/?shell=1",{waitUntil:"domcontentloaded",timeout:60000});
 await page.waitForFunction(()=>document.body.innerText.includes("遭遇战")||document.body.innerText.includes("战役（测试）"),null,{timeout:180000});
 const collect=async(label)=>{
   const texts=await page.evaluate(()=>{
     const out=new Set();
     const w=document.createTreeWalker(document.body,NodeFilter.SHOW_TEXT);
     while(w.nextNode()){const t=w.currentNode.nodeValue.trim(); if(/[A-Za-z]{2,}/.test(t)&&t.length<150) out.add(t);}
     document.querySelectorAll('[title],[data-r-tooltip],[placeholder]').forEach(el=>{for(const a of ['title','data-r-tooltip','placeholder']){const v=el.getAttribute(a);if(v&&/[A-Za-z]{2,}/.test(v)&&v.length<200) out.add(`[${a}] ${v}`);}});
     return [...out];
   });
   console.log('\n=== '+label+' ===\n'+texts.join('\n'));
 };
 await collect('HOME'); await page.screenshot({path:'D:/dsh-workspace/hj2/ui-zh-home.png'});
 await page.getByText('局域网联机',{exact:true}).click(); await page.waitForTimeout(1800); await collect('LAN'); await page.screenshot({path:'D:/dsh-workspace/hj2/ui-zh-lan.png'});
 await page.getByText('返回',{exact:true}).click().catch(()=>{});
 await page.waitForTimeout(500);
 await page.getByText('选项',{exact:true}).click().catch(()=>{});
 await page.waitForTimeout(1200); await collect('OPTIONS'); await page.screenshot({path:'D:/dsh-workspace/hj2/ui-zh-options.png'});
 await ctx.close();
})().catch(e=>{console.error("FATAL",e);process.exit(1)});
