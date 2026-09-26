import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile, readdir, access } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import path from 'node:path';
import { parseHTML } from 'linkedom';
import YAML from 'yaml';

test('Qalan Markdown fayllarının frontmatter və məqalə sahələri etibarlıdır', async () => {
  const config=YAML.parse(await readFile('.pages.yml','utf8'));
  const articleFields=config.content.find(entry=>entry.name==='articles').fields;
  const required=articleFields.filter(field=>field.required&&field.name!=='body').map(field=>field.name);
  const paths=['cumle.md','haqqinda.md',...(await walk('content')).filter(file=>file.endsWith('.md'))];
  const decoder=new TextDecoder('utf-8',{fatal:true});
  const slugs=new Set();
  for(const file of paths){
    const raw=decoder.decode(await readFile(file));
    const match=raw.match(/^---\r?\n([\s\S]*?)\r?\n---(?:\r?\n|$)([\s\S]*)$/);
    assert.ok(match,`${file}: frontmatter --- sərhədləri yoxdur`);
    const data=YAML.parse(match[1]);
    assert.ok(data&&typeof data==='object',`${file}: YAML obyekt deyil`);
    if(!file.replaceAll('\\','/').startsWith('content/articles/')) continue;
    for(const field of required) assert.ok(data[field]!==undefined&&data[field]!==null&&String(data[field]).trim(),`${file}: ${field} boşdur`);
    assert.ok(match[2].trim(),`${file}: məqalə mətni boşdur`);
    assert.match(String(data.date),/^\d{4}-\d{2}-\d{2}$/,`${file}: tarix YYYY-MM-DD olmalıdır`);
    assert.equal(new Date(`${data.date}T12:00:00Z`).toISOString().slice(0,10),String(data.date),`${file}: tarix etibarsızdır`);
    assert.ok(['draft','published'].includes(data.status),`${file}: status etibarsızdır`);
    if(data.image?.startsWith('/')) await access(path.join('public',data.image));
    const slug=path.basename(file,'.md').toLowerCase();
    assert.ok(!slugs.has(slug),`${file}: dublikat slug`);
    slugs.add(slug);
  }
});

async function walk(dir) {
  const entries = await readdir(dir, { withFileTypes:true });
  return (await Promise.all(entries.map(e => e.isDirectory() ? walk(path.join(dir,e.name)) : path.join(dir,e.name)))).flat();
}
test('Every CMS image field resolves to a named repository media source', async () => {
  const config = YAML.parse(await readFile('.pages.yml','utf8'));
  assert.ok(Array.isArray(config.media));
  assert.ok(config.content.find(entry=>entry.name==='articles').exclude.includes('.gitkeep'));
  const names = new Set(config.media.map(m => m.name));
  async function inspect(value) {
    if (!value || typeof value !== 'object') return;
    if (value.options?.media) assert.ok(names.has(value.options.media), value.label);
    for (const child of Object.values(value)) await inspect(child);
  }
  await inspect(config.content); await inspect(config.components);
  for (const source of config.media) await access(source.input);
  for (const file of ['logo-light.png','logo-dark.png','placeholder.svg']) await access(path.join('dist','media',file));
});
test('Generated internal links and all image variants exist', async () => {
  for (const file of (await walk('dist')).filter(p => p.endsWith('.html'))) {
    const d=parseHTML(await readFile(file,'utf8')).document;
    const urls=[...d.querySelectorAll('[href],[src]')].flatMap(e=>[e.getAttribute('href'),e.getAttribute('src')]);
    for(const e of d.querySelectorAll('[srcset]')) urls.push(...e.getAttribute('srcset').split(',').map(s=>s.trim().split(' ')[0]));
    for(const url of urls.filter(u=>u?.startsWith('/')&&!u.startsWith('//'))) {
      const local=url.split(/[?#]/)[0];
      await assert.doesNotReject(access(path.join('dist',local,local.endsWith('/')?'index.html':'')), file+' '+url);
    }
    assert.equal(d.querySelectorAll('main h1').length,1,file);
    for(const img of d.querySelectorAll('img')) assert.ok(img.hasAttribute('alt'),file);
  }
});

test('Brand PNG favicon variants are square and linked on every page', async () => {
  const sharp=(await import('sharp')).default;
  for (const size of [16,32,48,96,180]) {
    const file=size===180?'apple-touch-icon.png':`favicon-${size}.png`;
    const meta=await sharp(path.join('dist',file)).metadata();
    assert.equal(meta.width,size); assert.equal(meta.height,size); assert.equal(meta.format,'png');
  }
  for(const file of (await walk('dist')).filter(p=>p.endsWith('.html'))) {
    const html=await readFile(file,'utf8');
    assert.ok(html.includes('sizes="96x96" href="/favicon.png"'));
    assert.ok(html.includes('rel="apple-touch-icon"'));
    assert.ok(!html.includes('href="/favicon.svg"'));
  }
  assert.ok(!(await readFile('dist/robots.txt','utf8')).includes('Disallow:'));
});
