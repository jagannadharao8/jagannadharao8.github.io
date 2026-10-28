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

    const form = new FormData();
    form.set('text', 'Private test claim: experiment QZ7319 produced exactly 4321 purple tokens in a sealed notebook. No public evidence has been provided.');
    const analysis = await fetch('https://jagannadharao8-fake-news-detection.hf.space/api/analyze', {
      method:'POST', body:form, signal:AbortSignal.timeout(150000)
    });
    if(!analysis.ok) throw new Error('Analysis HTTP '+analysis.status);
    const result = await analysis.json();
    const matches = result.verdict === result.card?.final_label;
    console.log(JSON.stringify({analysisStatus:analysis.status,verdict:result.verdict,cardVerdict:result.card?.final_label,
      confidence:result.confidence,scoreType:result.score_type,ragAvailable:result.rag?.available,consistent:matches}));
    if(!matches || result.verdict!=='Uncertain') throw new Error('Private unsupported claim was not consistently uncertain');
  }
 }catch(e){console.log('Space probe: '+e.message); process.exitCode=1;}
 await browser.close();
})().catch(e=>{console.error(e);process.exit(1)});
