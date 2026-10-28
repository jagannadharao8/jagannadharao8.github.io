const { chromium } = require('playwright');
const fs = require('node:fs');
(async () => {
  fs.mkdirSync('live-results', {recursive:true});
  const results = {};
  const browser = await chromium.launch();
  const page = await browser.newPage();
  for (let attempt=0;attempt<8;attempt++) {
    await page.goto('https://jagannadharao8.github.io', {waitUntil:'domcontentloaded'});
    const html = await page.content();
    if (html.includes('Download PDF') && html.includes('85.29%')) {
      results.portfolio = 'Updated content and PDF link are live';
      break;
    }
    await page.waitForTimeout(15000);
  }
  if (!results.portfolio) results.portfolio = 'Updated content not yet visible';
  try {
    await page.goto('https://jagannadharao-ai-research-agent.streamlit.app', {waitUntil:'domcontentloaded'});
    const wake = page.getByRole('button', {name:'Yes, get this app back up!'});
    if (await wake.isVisible().catch(()=>false)) await wake.click();
    let app;
    for (let attempt=0;attempt<12;attempt++) {
      for (const frame of page.frames()) {
        if (await frame.getByRole('heading',{name:'🧠 AI Research Assistant',exact:true}).isVisible().catch(()=>false)) {
          app = frame; break;
        }
      }
      if (app) break;
      await page.waitForTimeout(10000);
    }
    if (!app) {
      results.research = 'Updated UI not detected; hosting refresh/settings need checking';
    } else {
      const input = app.getByRole('textbox',{name:'Ask a question'});
      await input.fill('Explain precision and recall in binary classification in two sentences.');
      await input.press('Enter');
      await app.getByRole('heading',{name:'Download the last completed report'}).waitFor({timeout:90000});
      const text = await app.locator('body').innerText();
      if (/Configured model unavailable|Groq rejected|provider could not|returned an empty/i.test(text)) throw Error('Provider error displayed');
      results.research = 'Updated UI generated an answer and exposed report downloads';
    }
  } catch (error) {
    results.research = 'Live check incomplete: ' + error.message.slice(0,200);
  }
  try {
    const health = await fetch('https://jagannadharao8-fake-news-detection.hf.space/health', {signal:AbortSignal.timeout(90000)});
    const history = await fetch('https://jagannadharao8-fake-news-detection.hf.space/api/history', {signal:AbortSignal.timeout(90000)});
    results.fakeNews = {health:health.status, historyStatus:history.status,
      sourceUpdateDetected:history.status===410};
    await history.body?.cancel();
  } catch (error) { results.fakeNews = {error:error.message.slice(0,160)}; }
  fs.writeFileSync('live-results/status.json', JSON.stringify(results,null,2));
  console.log(JSON.stringify(results,null,2));
  await browser.close();
  if (!results.portfolio.startsWith('Updated content and')) process.exitCode=1;
})().catch(error=>{console.error(error);process.exit(1);});
