import {mkdtemp,writeFile,readFile} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import path from 'node:path';
import {execFileSync} from 'node:child_process';
import assert from 'node:assert/strict';
import YAML from 'yaml';
import {parseHTML} from 'linkedom';

const fixture=await mkdtemp(path.join(tmpdir(),'inaz-archive-'));
const settings=path.join(fixture,'settings.yml');
const base={title:'Test məqaləsi',date:'2026-09-01',description:'Test təsviri',author:'I’NAZ',category:'Peşəkarlar',status:'published',home_section:'main',image:'/media/placeholder.svg'};
const writeArticle=async(name,data)=>writeFile(path.join(fixture,name+'.md'),'---\n'+YAML.stringify(data)+'---\nMəqalə mətni.\n');
const build=()=>execFileSync(process.execPath,['scripts/build.mjs'],{env:{...process.env,INAZ_ARTICLES_DIR:fixture,INAZ_ARCHIVE_FILE:settings},stdio:'pipe'});
try {
 await writeArticle('active',base);await writeArticle('draft',{...base,status:'draft',archive:true});
 await writeFile(settings,'initial_count: 99\ntitle: ""\nenabled: wrong\n');
 for(const count of [0,1,2,3,4,7]){
  for(let i=0;i<count;i++)await writeArticle('archive-'+i,{...base,archive:true,date:`2026-09-${String(i+2).padStart(2,'0')}`,title:`Arxiv ${i} — Azərbaycan, Peşəkarlar, Mədəniyyət və uzun başlıq`,image:i%2?'':'/media/placeholder.svg'});
  build();
  for(const route of ['index.html','mezmunlar/index.html','pesekarlar/index.html']){
   const document=parseHTML(await readFile('dist/'+route,'utf8')).document;
   assert.equal(document.querySelectorAll('.archive-card').length,count);
   assert.equal(document.querySelectorAll('.archive-toggle').length,count>3?1:0);
   if(count){
    assert.equal(document.querySelector('.archive-section h2').textContent,'Əvvəlki məzmunlar');
    assert.equal(document.querySelectorAll('.archive-extra .archive-card').length,Math.max(0,count-3));
    const urls=[...document.querySelectorAll('.archive-card')].map(a=>a.getAttribute('href'));
    assert.equal(new Set(urls).size,count);assert.equal(urls[0],`/mezmunlar/archive-${count-1}/`);
   }
  }
  const index=JSON.parse(await readFile('dist/search-index.json','utf8'));
  assert.equal(index.filter(a=>a.archive).length,count);assert.equal(index.length,count+1);
  const sitemap=await readFile('dist/sitemap.xml','utf8');assert.ok(!sitemap.includes('/draft/'));
  for(let i=0;i<count;i++){assert.ok(sitemap.includes(`/archive-${i}/`));assert.ok((await readFile(`dist/mezmunlar/archive-${i}/index.html`,'utf8')).includes('Məqalə mətni'));}
  const home=parseHTML(await readFile('dist/index.html','utf8')).document;
  assert.equal(home.querySelectorAll('.lead-story').length,1);
  console.log(`Archive integration: ${count} archived + active + draft OK`);
 }
 await writeFile(settings,'enabled: false\n');build();assert.ok(!(await readFile('dist/index.html','utf8')).includes('class="archive-section'));
 await writeFile(settings,'initial_count: 2\n');build();assert.equal(parseHTML(await readFile('dist/index.html','utf8')).document.querySelectorAll('.archive-extra .archive-card').length,5);
 console.log('Archive disabled and initial count 2 OK');
 await writeFile(settings,'title: [broken');build();assert.equal(parseHTML(await readFile('dist/index.html','utf8')).document.querySelectorAll('.archive-extra .archive-card').length,4);
 await writeArticle('active',{...base,home_section:'small'});build();assert.equal(parseHTML(await readFile('dist/index.html','utf8')).document.querySelectorAll('main h1').length,1);
 await writeArticle('active',{...base,archive:true});build();const archivedOnly=parseHTML(await readFile('dist/index.html','utf8')).document;assert.equal(archivedOnly.querySelectorAll('.lead-story').length,0);assert.equal(archivedOnly.querySelectorAll('.archive-card').length,8);assert.match(archivedOnly.querySelector('main h1').textContent,/Hələ məqalə yoxdur/);
 console.log('Malformed YAML, archived main stories and archive-only homepage OK');
}finally{
 execFileSync(process.execPath,['scripts/build.mjs'],{stdio:'inherit'});
}
