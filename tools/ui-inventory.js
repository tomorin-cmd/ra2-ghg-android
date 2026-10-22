const { chromium } = require("playwright-core");
(async()=>{
 const ctx=await chromium.launchPersistentContext("D:/dsh-workspace/hj2/edge-profile-dist",{
  executablePath:"C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe",headless:true,
  viewport:{width:1024,height:768},args:["--use-angle=swiftshader","--enable-unsafe-swiftshader"]});
 const page=ctx.pages()[0]||await ctx.newPage();
 await page.goto("http://127.0.0.1:4002/?shell=1",{waitUntil:"domcontentloaded",timeout:60000});
 await page.waitForFunction(()=>document.body.innerText.includes("Skirmish"),null,{timeout:180000});
 const collect=async(label)=>{
   const texts=await page.evaluate(()=>{
     const out=new Set();
     const w=document.createTreeWalker(document.body,NodeFilter.SHOW_TEXT);
     while(w.nextNode()){const t=w.currentNode.nodeValue.trim(); if(/[A-Za-z]{2,}/.test(t)&&t.length<120) out.add(t);}
     document.querySelectorAll('[title],[data-r-tooltip],[placeholder]').forEach(el=>{for(const a of ['title','data-r-tooltip','placeholder']){const v=el.getAttribute(a);if(v&&/[A-Za-z]{2,}/.test(v)&&v.length<160) out.add(`[${a}] ${v}`);}});
     return [...out];
   });
   console.log('\n=== '+label+' ===\n'+texts.join('\n'));
 };
 await collect('HOME');
 await page.getByText("Skirmish",{exact:true}).click(); await page.waitForTimeout(2500); await collect('SKIRMISH');
 await page.getByText("上一頁",{exact:true}).click().catch(()=>{}); await page.waitForTimeout(1000);
 await page.getByText("選項",{exact:true}).click().catch(()=>{}); await page.waitForTimeout(1500); await collect('OPTIONS');
 await ctx.close();
})().catch(e=>{console.error("FATAL",e);process.exit(1)});
