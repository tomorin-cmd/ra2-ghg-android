const { chromium } = require("playwright-core");
(async()=>{
 const b=await chromium.connectOverCDP("http://127.0.0.1:9224");
 const p=b.contexts()[0].pages()[0];
 const info=await p.evaluate(()=>({
  url:location.href, hash:location.hash,
  game:!!window.__ra2game, player:window.__ra2player?.name,
  map:window.__ra2game?.gameOpts?.mapName,
  campaign:window.__ra2game?.gameOpts?.campaign,
  body:document.body.innerText.slice(0,300),
  ls:Object.fromEntries(Object.keys(localStorage).map(k=>[k,String(localStorage.getItem(k)).slice(0,120)]))
 }));
 console.log(JSON.stringify(info,null,1));
 await b.close();
})().catch(e=>{console.error("FATAL",e);process.exit(1)});
