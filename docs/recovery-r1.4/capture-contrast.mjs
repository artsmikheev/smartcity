import { chromium } from '/tmp/smartcity-r12-tools/node_modules/playwright/index.mjs';
import { mkdir, writeFile } from 'node:fs/promises';
const out='/home/ubuntu/recovery-r1-4/contrast-analysis';await mkdir(out,{recursive:true});
const b=await chromium.launch({headless:true});const p=await b.newPage({viewport:{width:375,height:812},deviceScaleFactor:1});
const regions=[];
for(const [name,path,root] of [['home','/','home-hero'],['detail','/apartment/demo-k1-305?preview=content','detail-hero']]){
 await p.goto('http://127.0.0.1:8081'+path,{waitUntil:'networkidle'});await p.getByTestId(root).waitFor();await p.evaluate(()=>document.fonts.ready);
 const data=await p.evaluate(root=>{
  const hero=document.querySelector(`[data-testid="${root}"]`);
  const labels=[...hero.querySelectorAll('div, h1, h2, h3, h4, h5, h6')].filter(e=>e.childElementCount===0 && e.textContent.trim() && e.getBoundingClientRect().height>0);
  return labels.map((e,i)=>{const r=e.getBoundingClientRect(),s=getComputedStyle(e);const info={index:i,text:e.textContent,box:{x:r.x,y:r.y,width:r.width,height:r.height},color:s.color,fontSize:s.fontSize,weight:s.fontWeight};e.style.visibility='hidden';return info;});
 },root);
 // These pixels are background measurement data only, not UI evidence.
 await p.screenshot({path:`${out}/${name}-background-only.png`});regions.push({name,regions:data});
}
await writeFile(`${out}/regions.json`,JSON.stringify(regions,null,2)+'\n');await b.close();console.log('Captured actual background pixels for hero labels.');
