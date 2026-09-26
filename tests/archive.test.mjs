import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import YAML from 'yaml';
import {archiveSettings,splitArticles} from '../scripts/archive.mjs';

test('Archive rules preserve missing flags and exclude every draft',()=>{
 const rows=[{slug:'old',status:'published',date:'2026-01-01',archive:true},{slug:'active',status:'published',date:'2026-03-01'}, {slug:'new',status:'published',date:'2026-04-01',archive:true},{slug:'draft',status:'draft',archive:true}, {slug:'false',status:'published',date:'2026-01-01',archive:false}];
 const result=splitArticles(rows);
 assert.deepEqual(result.archived.map(a=>a.slug),['new','old']);
 assert.deepEqual(result.active.map(a=>a.slug),['active','false']);
 assert.equal(rows[0].slug,'old');
});
test('Archive settings safely default and respect valid CMS overrides',()=>{
 const defaults={enabled:true,title:'Əvvəlki məzmunlar',initial_count:3,open_label:'Daha çox məzmun',close_label:'Arxivi bağla'};
 for(const value of [undefined,null,'bad',{}, {enabled:'false',title:' ',initial_count:8,open_label:null,close_label:[]}])assert.deepEqual(archiveSettings(value),defaults);
 assert.equal(archiveSettings({enabled:false}).enabled,false);
 assert.equal(archiveSettings({initial_count:'2'}).initial_count,2);
 assert.equal(archiveSettings({title:'Keçmiş yazılar'}).title,'Keçmiş yazılar');
});
test('CMS archive switch and settings match supported field structure',async()=>{
 const config=YAML.parse(await readFile('.pages.yml','utf8'));
 const field=config.content.find(c=>c.name==='articles').fields.find(f=>f.name==='archive');
 assert.equal(field.type,'boolean');assert.equal(field.default,false);assert.match(field.description,/məqalə silinmir/);
 const settings=config.content.find(c=>c.name==='archive_settings');
 assert.deepEqual(settings.fields.map(f=>f.name),['enabled','title','initial_count','open_label','close_label']);
 assert.deepEqual(settings.fields.find(f=>f.name==='initial_count').options.values,['2','3']);
});

