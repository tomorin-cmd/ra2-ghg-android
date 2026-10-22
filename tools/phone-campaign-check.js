const { chromium } = require("playwright-core");
(async()=>{
 const b=await chromium.connectOverCDP("http://127.0.0.1:9223");
 const ctx=b.contexts()[0]; const page=ctx.pages()[0];
 page.on("pageerror",e=>console.log("PAGEERROR",e.message.slice(0,600)));
 await page.waitForFunction(()=>document.body.innerText.includes("战役（测试）"),null,{timeout:30000});
 console.log("HOME OK", (await page.evaluate(()=>document.body.innerText)).slice(0,180));
 await page.getByText("战役（测试）",{exact:true}).click(); await page.waitForTimeout(800);
 console.log("MENU", (await page.evaluate(()=>document.body.innerText)).slice(-180));
 await page.screenshot({path:"D:/dsh-workspace/hj2/phone-campaign-menu.png"});
 await page.getByText("教学：基本训练",{exact:true}).click();
 await page.waitForTimeout(30000);
 const info=await page.evaluate(()=>({player:!!window.__ra2player,name:window.__ra2player?.name,status:window.__ra2game?.status,body:document.body.innerText.slice(0,400)}));
 console.log("TRN01",JSON.stringify(info));
 await page.screenshot({path:"D:/dsh-workspace/hj2/phone-campaign-trn01.png"});
 await b.close();
})().catch(e=>{console.error("FATAL",e);process.exit(1)});
