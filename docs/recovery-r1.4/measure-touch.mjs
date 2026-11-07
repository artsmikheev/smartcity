import { chromium } from '/tmp/smartcity-r12-tools/node_modules/playwright/index.mjs';
import { writeFile } from 'node:fs/promises';
const b=await chromium.launch({headless:true});const p=await b.newPage({viewport:{width:375,height:812}});
const output=[];
for(const [name,path,id] of [['home','/','home-hero'],['catalog','/layouts?preview=content','catalog-list'],['detail','/apartment/demo-k1-305?preview=content','detail-content'],['favorites','/favorites?preview=content','favorites-list'],['lead','/lead','lead-screen'],['success','/lead/success?preview=content','lead-success']]){
 await p.goto('http://127.0.0.1:8081'+path,{waitUntil:'networkidle'});await p.getByTestId(id).waitFor();
 const rows=await p.evaluate(()=>[...document.querySelectorAll('[role="button"], [role="radio"], [role="checkbox"], [role="tab"], input')].filter(e=>e.getClientRects().length && getComputedStyle(e).visibility!=='hidden').map(e=>{const r=e.getBoundingClientRect();return {label:e.getAttribute('aria-label')||e.textContent,id:e.getAttribute('data-testid'),width:r.width,height:r.height,role:e.getAttribute('role'),pass:r.width>=47.9&&r.height>=47.9};}));
 output.push({screen:name,rows});
}
await writeFile('/home/ubuntu/recovery-r1-4/touch-targets.json',JSON.stringify(output,null,2)+'\n');await b.close();
const fail=output.flatMap(e=>e.rows.filter(r=>!r.pass).map(r=>({...r,screen:e.screen})));
console.log(JSON.stringify({controls:output.reduce((n,e)=>n+e.rows.length,0),failed:fail},null,2));if(fail.length)throw new Error('Targets below48');
