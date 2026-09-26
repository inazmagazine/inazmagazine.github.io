import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import YAML from 'yaml';
import {createTheme,parseHex,contrast,contrastText,selectFont,FONT_CHOICES,LEGACY,themeCss} from '../scripts/theme.mjs';

test('HEX parsing validates the full value; invalid/empty config keeps the brown palette',()=>{
 assert.equal(parseHex(' #ABCDEF '),'#abcdef');
 for(const x of ['',null,42,'#abc','#zzzzzz','#123456;display:none','red'])assert.equal(parseHex(x,'fallback'),'fallback');
 for(const x of [undefined,null,{}, {primary:''},{primary:'invalid'},{primary:'#ff0000',automatic:false}])assert.deepEqual(createTheme(x).colors,LEGACY);
});
test('HSL palettes meet AA for normal text, headings, links, surfaces and footer',()=>{
 for(const primary of ['#411D0B','#a9d9ff','#064e3b','#ef263a','#fffefa','#010101']){
   const {colors:c}=createTheme({primary});
   for(const key of ['text','heading','text-muted','category','link','link-hover'])assert.ok(contrast(c[key],c.background)>=4.5,`${primary} ${key}`);
   assert.ok(contrast(c['footer-text'],c.footer)>=4.5);
   assert.ok(contrast(c['surface-text'],c.surface)>=4.5);
   assert.ok(contrast(c['surface-muted'],c.surface)>=4.5);
   assert.ok(contrast(c['surface-heading'],c.surface)>=4.5);
   assert.ok(contrast(c['input-text'],c['surface-alt'])>=4.5);
   assert.ok(contrast(c['text-on-primary'],c.primary)>=4.5);
   assert.ok(contrast(c['button-text'],c['button-hover'])>=4.5);
   assert.ok(contrast(c.focus,c.background)>=3);
 }
 assert.equal(contrastText('#ffffff'),'#000000');assert.equal(contrastText('#000000'),'#ffffff');
});
test('Valid enabled overrides win; empty, disabled or invalid overrides return to automatic',()=>{
 const base={primary:'#a9d9ff',custom_enabled:true,colors:{footer:'#172a40',footer_text:'#fafafa',background:'#eeeeee'}};
 const t=createTheme(base);assert.equal(t.colors.footer,'#172a40');assert.equal(t.colors['footer-text'],'#fafafa');
 assert.ok(contrast(t.colors.text,t.colors.background)>=4.5);
 const automatic=createTheme({primary:base.primary});
 for(const colors of [{footer:''},{footer:'invalid'},null])assert.equal(createTheme({...base,colors}).colors.footer,automatic.colors.footer);
 assert.equal(createTheme({...base,custom_enabled:false}).colors.footer,automatic.colors.footer);
 const surface=createTheme({primary:'#a9d9ff',custom_enabled:true,colors:{surface:'#101820',header:'#ffffff'}}).colors;
 assert.ok(contrast(surface['surface-text'],surface.surface)>=4.5);
 assert.ok(contrast(surface['surface-muted'],surface.surface)>=4.5);
 assert.ok(contrast(surface['header-text'],surface.header)>=4.5);
});
test('Font selection is normalized and allowlisted; only selected fonts are emitted',()=>{
 assert.equal(selectFont('  JOSEFIN   sans '),'Josefin Sans');
 for(const v of ['',null,'bad','";color:red'])assert.equal(selectFont(v),'Manrope');
 const t=createTheme({fonts:{body:'Josefin Sans',heading:'Lora',eyebrow:'Noto Sans',navigation:'Source Sans 3'}});
 const css=themeCss(t);assert.ok(css.includes('josefin-sans-latin-ext.woff2'));assert.ok(!css.includes('cormorant-latin'));
});
test('Official fonts have verified hashes/weights; eyebrow uses a complete AZ family',async()=>{
 const manifest=JSON.parse(await readFile('assets/fonts/verified.json','utf8'));
 for(const [name,font] of Object.entries(FONT_CHOICES)){
   const record=Object.values(manifest).find(r=>r.files.map(x=>x.file).join()===font.files.join());assert.ok(record,name);
   if(name==='Manrope'){assert.deepEqual(record.missing,['Ə']);assert.equal(createTheme({fonts:{eyebrow:'Manrope'}}).fonts.eyebrow,'Noto Sans');}
   else {assert.ok(record.coverage,name);assert.equal(record.characters,'əƏğĞşŞıİçÇöÖüÜ');}
   for(const f of record.files){assert.equal(createHash('sha256').update(await readFile('assets/fonts/'+f.file)).digest('hex'),f.sha256);assert.ok(f.weights.some(([min,max])=>min<=400&&max>=700));}
 }
});
test('Legacy typography is the default for absent, empty and invalid settings',()=>{
 const defaults={body:'Manrope',heading:'Cormorant',eyebrow:'Noto Sans',navigation:'Manrope'};
 for(const fonts of [undefined,{},null,{body:'',heading:'',eyebrow:'',navigation:''},{body:'bad',heading:'bad',eyebrow:'bad',navigation:'bad'}])assert.deepEqual(createTheme({fonts}).fonts,defaults);
 const css=themeCss(createTheme());assert.ok(css.includes("font-family:'Manrope'"));assert.ok(!css.includes('Manrope AZ'));assert.ok(css.includes('noto-sans-latin-ext.woff2'));
});
test('CMS design schema matches config, supported HEX strings and font dropdowns',async()=>{
 const cms=YAML.parse(await readFile('.pages.yml','utf8'));const entry=cms.content.find(x=>x.name==='design');assert.equal(entry.path,'content/data/design.yml');
 const fields=entry.fields;assert.equal(fields.find(x=>x.name==='primary').type,'string');
 assert.equal(fields.find(x=>x.name==='colors').fields.length,10);
 for(const f of fields.find(x=>x.name==='fonts').fields){assert.equal(f.type,'select');assert.deepEqual(f.options.values,Object.keys(FONT_CHOICES));}
 assert.doesNotThrow(()=>createTheme(YAML.parse('primary: null\nfonts: null\ncolors: null')));
});
