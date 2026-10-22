const { chromium } = require("playwright-core");
(async()=>{
 const b=await chromium.connectOverCDP("http://127.0.0.1:9225");
 const p=b.contexts()[0].pages()[0];
 await p.goto("http://127.0.0.1:8787/?shell=1",{waitUntil:"domcontentloaded",timeout:60000});
 await p.waitForTimeout(20000);
 const info=await p.evaluate(()=>({url:location.href,game:!!window.__ra2game,body:document.body.innerText.slice(0,220)}));
 console.log(JSON.stringify(info));
 await p.screenshot({path:"D:/dsh-workspace/hj2/phone-stable-reload.png"});
 await b.close();
})().catch(e=>{console.error("FATAL",e);process.exit(1)});
