const { chromium } = require("playwright-core");
(async()=>{
 const b=await chromium.connectOverCDP("http://127.0.0.1:9222");
 const p=b.contexts()[0].pages()[0];
 const info=await p.evaluate(()=>{
  const v=document.querySelector('video'); const ph=document.querySelector('.video-placeholder');
  return {url:location.href, scripts:[...document.scripts].map(s=>s.src).filter(Boolean).slice(-3), videos:document.querySelectorAll('video').length, placeholder:!!ph, v: v?{src:v.currentSrc, ready:v.readyState, err:v.error?{code:v.error.code,msg:v.error.message}:null, paused:v.paused, w:v.videoWidth, h:v.videoHeight}:null, inner:[innerWidth,innerHeight]};
 });
 console.log(JSON.stringify(info,null,1));
 await b.close();
})().catch(e=>{console.error("FATAL",e);process.exit(1)});
