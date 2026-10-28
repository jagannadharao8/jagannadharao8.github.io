// Inspect the hosted process after the follow-up publication.
const {chromium}=require('playwright');
(async()=>{
 const browser=await chromium.launch();
 const page=await browser.newPage();
 await page.goto('https://jagannadharao-ai-research-agent.streamlit.app',{waitUntil:'domcontentloaded'});
 const wake=page.getByRole('button',{name:'Yes, get this app back up!'});
 if(await wake.isVisible().catch(()=>false)) await wake.click();
 await page.waitForTimeout(15000);
 for(const frame of page.frames()) {
   console.log(JSON.stringify({url:frame.url(),headings:await frame.getByRole('heading').allTextContents(),
     visibleText:(await frame.locator('body').innerText().catch(()=>'' )).slice(0,1600)}));
 }
 try {
  const meta=await fetch('https://huggingface.co/api/spaces/jagannadharao8/fake-news-detection',{signal:AbortSignal.timeout(20000)});
  const data=await meta.json();
  console.log(JSON.stringify({spaceStage:data.runtime?.stage,spaceSha:data.sha,configurationError:data.runtime?.errorMessage}));
  if(data.runtime?.stage==='RUNNING'){
    for(const path of ['/health','/api/history']) {
      const response=await fetch('https://jagannadharao8-fake-news-detection.hf.space'+path,{signal:AbortSignal.timeout(20000)});
      console.log(JSON.stringify({path,status:response.status}));
      await response.body?.cancel();
    }

  }
 }catch(e){console.log('Space probe: '+e.message); process.exitCode=1;}
 await browser.close();
})().catch(e=>{console.error(e);process.exit(1)});
