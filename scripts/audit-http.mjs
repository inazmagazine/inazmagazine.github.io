import { readFile,readdir } from 'node:fs/promises';
import path from 'node:path';
import { parseHTML } from 'linkedom';
const origin=process.env.AUDIT_ORIGIN||'http://127.0.0.1:4173';
async function walk(dir){return (await Promise.all((await readdir(dir,{withFileTypes:true})).map(e=>e.isDirectory()?walk(path.join(dir,e.name)):path.join(dir,e.name)))).flat()}
const files=await walk('dist');
const urls=new Set();
for(const file of files.filter(p=>p.endsWith('.html'))){
  const route='/'+path.relative('dist',file).replaceAll('\\','/').replace(/index\.html$/,'');
  urls.add((process.env.BASE_PATH||'')+route);
  const d=parseHTML(await readFile(file,'utf8')).document;
  for(const el of d.querySelectorAll('[src],[href]'))for(const attr of ['src','href']){const url=el.getAttribute(attr);if(url?.startsWith('/')&&!url.startsWith('//'))urls.add(url.split('#')[0]);}
  for(const el of d.querySelectorAll('[srcset]'))for(const part of el.getAttribute('srcset').split(','))urls.add(part.trim().split(' ')[0]);
}
const css=await readFile('dist/styles.css','utf8');
for(const match of css.matchAll(/url\(['"]?([^)'"]+)/g))urls.add(new URL(match[1],origin+(process.env.BASE_PATH||'')+'/styles.css').pathname);
let failures=[];let bytes=0;const start=performance.now();
for(const url of urls){const res=await fetch(origin+url);bytes+=(await res.arrayBuffer()).byteLength;if(res.status!==200)failures.push({url,status:res.status});}
console.log(JSON.stringify({requests:urls.size,failures,totalBytes:bytes,durationMs:Math.round(performance.now()-start)},null,2));
if(failures.length)process.exitCode=1;
