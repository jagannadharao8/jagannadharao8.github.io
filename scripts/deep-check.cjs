// Verify the default lexical retrieval after its dependency manifest redeployment.
// Final validation after the tested runtime SDK and refreshed portfolio were published.
const {chromium}=require('playwright');
const fs=require('node:fs');
const assert=require('node:assert/strict');
(async()=>{
fs.mkdirSync('deep-results',{recursive:true});
const results={};
const browser=await chromium.launch();
const page=await browser.newPage({acceptDownloads:true});
try{
 await page.goto('https://jagannadharao-ai-research-agent.streamlit.app',{waitUntil:'domcontentloaded'});
 const wake=page.getByRole('button',{name:'Yes, get this app back up!'});
 if(await wake.isVisible().catch(()=>false))await wake.click();
 let app;
 for(let n=0;n<48&&!app;n++){
  const wakeAgain=page.getByRole('button',{name:'Yes, get this app back up!'});
  if(await wakeAgain.isVisible().catch(()=>false))await wakeAgain.click();
  for(const frame of page.frames())if(await frame.getByRole('heading',{name:'🧠 AI Research Assistant',exact:true}).isVisible().catch(()=>false))app=frame;
  if(!app)await page.waitForTimeout(5000);
 }
 assert(app,'Research UI did not load');
 async function ask(query,expected){
   const before=await app.locator('[data-testid="stChatMessage"]').count();
   await app.getByRole('textbox',{name:'Ask a question'}).fill(query);
   await app.getByRole('textbox',{name:'Ask a question'}).press('Enter');
   for(let n=0;n<120;n++){
     const boxes=app.locator('[data-testid="stChatMessage"]');
     if(await boxes.count()>=before+2){
       const last=await boxes.last().innerText();
       if(last.includes('Citation review:')&&(!expected||last.includes(expected)))return last;
       if(/Configure GROQ|Configured model unavailable|Groq rejected|rate limit reached|could not complete|empty answer|could not be processed|not enough values/.test(last))throw Error(last.slice(-800));
     }
     await page.waitForTimeout(1000);
   }
   throw Error('Answer timed out; '+(await app.locator('body').innerText()).slice(-1200));
 }
 const direct=await ask('Explain precision and recall in binary classification in two sentences.');
 assert(/precision/i.test(direct)&&/recall/i.test(direct));
 results.direct='Answer generated';
 for(const name of ['Markdown','Word','PDF']){
   const event=page.waitForEvent('download');
   await app.getByRole('button',{name,exact:true}).click();
   const download=await event;
   const target='deep-results/'+download.suggestedFilename();
   await download.saveAs(target);
   assert(fs.statSync(target).size>50);
   if(name==='PDF')assert(fs.readFileSync(target).subarray(0,4).equals(Buffer.from('%PDF')));
 }
 results.downloads='Markdown, DOCX and PDF downloaded';
 await app.getByRole('button',{name:'Clear this session',exact:true}).click();
 await app.getByRole('heading',{name:'Download the last completed report'}).waitFor({state:'hidden'});
 assert.equal(await app.locator('[data-testid="stChatMessage"]').count(),0);
 results.clearSession='Chat and report cleared';
 await app.getByRole('button',{name:'Clear this session',exact:true}).click();
 await app.getByRole('heading',{name:'Download the last completed report'}).waitFor({state:'hidden'});
 await app.locator('input[type=file]').setInputFiles([]);
 const web=await ask('Search the web for the official Python tutorial on list comprehensions. Explain the syntax briefly and cite your retrieved sources.');
 assert(web.includes('Mode: Web'),'Explicit search did not use web retrieval');
 assert(/\[\d+\]/.test(web),'Web answer has no citation');
 results.web='Web retrieval, answer and citation rendered';
 await app.getByRole('button',{name:'Clear this session',exact:true}).click();
 await app.getByRole('heading',{name:'Download the last completed report'}).waitFor({state:'hidden'});
 const query='What is the calibration code stated in the uploaded document? Answer with the code and its citation.';
 for(const [file,code,other] of [['doc-a.docx','AMBER7319','COBALT8426'],['doc-b.docx','COBALT8426','AMBER7319']]){
   const upload=app.locator('input[type=file]');
   await upload.setInputFiles('fixtures/'+file);
   await app.getByText(file,{exact:true}).waitFor();
   // Wait for the uploader-triggered Streamlit rerun before sending chat input.
   await page.waitForTimeout(3000);
   await app.locator('[data-testid="stStatusWidget"]').waitFor({state:'hidden',timeout:60000});
   await app.getByRole('textbox',{name:'Ask a question'}).waitFor();
   const answer=await ask(query,code);
   assert(answer.includes('Mode: Document'));
   assert(answer.includes('TF-IDF lexical'),'Updated lightweight retrieval was not active');
   // Previous chat can appear in the prompt, but the answer must follow the current document.
   const primary=answer.split('Mode:')[0];
   assert(!primary.includes(other),'Answer reused a fact from the other document');
   assert(/\[\d+\]/.test(primary),'Document answer has no citation');
   results[file]='Current-document code and citation verified';
 }

}catch(e){results.researchError=e.message;
 results.researchFrames=[];
 for(const frame of page.frames()) results.researchFrames.push({url:frame.url(),text:(await frame.locator('body').innerText().catch(()=>'' )).slice(-1800)});
 process.exitCode=1;}
try{
 const base='https://jagannadharao8-fake-news-detection.hf.space';
 const checks=[
  [{},400,'empty input'],
  [{url:'https://example.com'},400,'URL disabled']
 ];
 for(const [fields,status,label] of checks){
  const form=new FormData();for(const[k,v]of Object.entries(fields))form.set(k,v);
  const res=await fetch(base+'/api/analyze',{method:'POST',body:form,signal:AbortSignal.timeout(30000)});
  assert.equal(res.status,status,label);await res.body?.cancel();
 }
 const bad=new FormData();bad.set('image',new Blob(['not a PDF'],{type:'application/pdf'}),'invalid.pdf');
 const invalid=await fetch(base+'/api/analyze',{method:'POST',body:bad,signal:AbortSignal.timeout(30000)});
 assert.equal(invalid.status,400);await invalid.body?.cancel();
 const form=new FormData();
 form.set('text','Private test claim: experiment QZ7319 produced exactly 4321 purple tokens in a sealed notebook. No public evidence has been provided.');
 const res=await fetch(base+'/api/analyze',{method:'POST',body:form,signal:AbortSignal.timeout(150000)});
 assert.equal(res.status,200);const data=await res.json();
 assert.equal(data.verdict,'Uncertain');assert.equal(data.card.final_label,data.verdict);
 assert.equal(data.confidence,null);
 const history=await fetch(base+'/api/history',{signal:AbortSignal.timeout(30000)});
 assert.equal(history.status,410);await history.body?.cancel();
 results.fakeNews='Empty/URL/malformed-PDF rejected; unsupported claim and evidence card uncertain; shared history disabled';
}catch(e){results.fakeNewsError=e.message;process.exitCode=1;}
try{
 await page.goto('https://jagannadharao8.github.io',{waitUntil:'networkidle'});
 const errors=[];page.on('pageerror',e=>errors.push(e.message));
 for(const width of [390,768,1440]){
   await page.setViewportSize({width,height:900});
   assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1),'Horizontal overflow at '+width);
 }
 const pdf=await fetch('https://jagannadharao8.github.io/resume.pdf');
 assert.equal(pdf.status,200);
 const bytes=Buffer.from(await pdf.arrayBuffer());assert(bytes.subarray(0,4).equals(Buffer.from('%PDF')));
 fs.writeFileSync('deep-results/resume.pdf',bytes);
 assert.equal(errors.length,0);
 results.portfolio='390/768/1440 widths fit; published PDF downloaded';
}catch(e){results.portfolioError=e.message;process.exitCode=1;}
await browser.close();
fs.writeFileSync('deep-results/status.json',JSON.stringify(results,null,2));
console.log(JSON.stringify(results,null,2));
})().catch(e=>{console.error(e);process.exit(1)});
