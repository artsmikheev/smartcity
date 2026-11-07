import { chromium } from '/tmp/smartcity-r12-tools/node_modules/playwright/index.mjs';
import { writeFile } from 'node:fs/promises';
const out='/home/ubuntu/recovery-r1-4';const b=await chromium.launch({headless:true});const p=await b.newPage({viewport:{width:375,height:812},deviceScaleFactor:1});
const errors=[],rpcRequests=[];p.on('pageerror',e=>errors.push(e.message));p.on('console',m=>{if(m.type()==='error')errors.push(m.text());});p.on('request',r=>{if(r.url().includes('/rpc/submit_lead'))rpcRequests.push({method:r.method()});});
const check=(v,msg)=>{if(!v)throw new Error(msg);};
async function goto(path,id){await p.goto('http://127.0.0.1:8081'+path,{waitUntil:'networkidle',timeout:120000});await p.getByTestId(id).waitFor({timeout:60000});await p.evaluate(()=>document.fonts.ready);}
async function snap(name){await p.screenshot({path:`${out}/${name}-375x812.png`});}
await goto('/lead?type=manager_call','lead-screen');await snap('lead-default');
check(!(await p.getByTestId('floating-tab-bar').isVisible()),'Lead has no visible pill');
const controls=await p.evaluate(()=>Object.fromEntries(['inputname','inputphone','lead-channel-call','lead-channel-telegram','lead-consent','lead-consent-link','lead-submit','lead-close'].map(id=>{const e=document.querySelector(`[data-testid="${id}"]`);const r=e.getBoundingClientRect(),s=getComputedStyle(e);return[id,{width:r.width,height:r.height,fontSize:s.fontSize,radius:s.borderRadius,border:s.border,role:e.getAttribute('role')}];})));
check(controls.inputname.height===52&&controls.inputphone.height===52,'Input52');check(controls.inputname.fontSize==='16px','Input16');check(controls['lead-channel-call'].height===56&&controls['lead-channel-telegram'].height===56,'Radio56');check(controls['lead-close'].width===48&&controls['lead-close'].height===48,'Close48');check(controls['lead-submit'].height===52,'Submit52');
await p.getByTestId('lead-submit').click();await p.getByTestId('lead-error').waitFor();await snap('lead-validation');
check((await p.getByTestId('inputname').getAttribute('aria-invalid'))==='true','Name invalid aria');check((await p.getByTestId('inputphone').getAttribute('aria-invalid'))==='true','Phone invalid aria');
await p.getByTestId('inputname').fill('Тест');await p.getByTestId('inputphone').fill('89991234567');check((await p.getByTestId('inputphone').inputValue())==='+7 (999) 123-45-67','Phonepaste8→+7');
await p.getByTestId('lead-channel-telegram').click();await p.waitForFunction(()=>document.querySelector('[data-testid="lead-channel-telegram"]').getAttribute('aria-checked')==='true');
await p.getByTestId('lead-channel-call').press('Space');await p.waitForFunction(()=>document.querySelector('[data-testid="lead-channel-call"]').getAttribute('aria-checked')==='true');
await p.getByTestId('lead-consent-link').click();await p.getByTestId('lead-consent-modal').waitFor();await snap('lead-consent-unavailable');
await p.getByRole('button',{name:'Закрыть текст согласия',exact:true}).click();await p.getByTestId('lead-submit').dblclick();await p.getByTestId('lead-error').waitFor();check((await p.getByTestId('inputname').inputValue())==='Тест','Unsubmittedformvaluesremain');check(!p.url().includes('/success'),'Unconfigured notsuccess');
await goto('/lead?type=mortgage','lead-screen');await snap('lead-mortgage');
await goto('/lead?preview=submitting&type=apartment','lead-screen');await p.getByTestId('lead-submit-spinner').waitFor();await snap('lead-submitting');check(await p.getByTestId('lead-submit').isDisabled(),'Submitting disabled');check(await p.getByTestId('lead-close').isDisabled(),'Sendingcloseblocked');
await goto('/lead/success?preview=content','lead-success');await snap('lead-success-preview');check((await p.getByTestId('lead-success-reference').textContent())==='DEMO-REFERENCE','Honestpreviewref');check(await p.getByTestId('lead-success-preview-label').isVisible(),'Demolabelvisible');check(!(await p.getByTestId('floating-tab-bar').isVisible()),'Successpillnotvisible');
await goto('/lead/success?reference=SC-261107-abcdef','lead-success');await snap('lead-success-unverified');check(await p.getByText('Нет подтверждения заявки',{exact:true}).isVisible(),'URLrefignored');check(!(await p.getByTestId('lead-success-reference').count()),'No fakeID');
await p.getByTestId('lead-success-home').click();await p.locator('[data-testid="home-hero"]:visible').waitFor();check(new URL(p.url()).pathname==='/','Successfinishhome');
check(rpcRequests.length===0,'No actualRPC for demo or invalid forms');check(errors.length===0,errors.join('\n'));
await writeFile(`${out}/lead-measurements.json`,JSON.stringify({controls,rpcRequests,errors,checks:['defaultform','invalidaria','RUmaskpaste','radioselect','consentdocumentunavailable','preservedinputs','submittingdisabled','demo successclear','URLproofrejected','finishhome','noRPC']},null,2)+'\n');await b.close();console.log('Lead / Success production UI and no-send checks PASS');
