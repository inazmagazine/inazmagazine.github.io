import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile, readdir, access } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import path from 'node:path';
import { parseHTML } from 'linkedom';
import YAML from 'yaml';

async function walk(dir) {
  const entries = await readdir(dir, { withFileTypes:true });
  return (await Promise.all(entries.map(e => e.isDirectory() ? walk(path.join(dir,e.name)) : path.join(dir,e.name)))).flat();
}
test('Every CMS image field resolves to a named repository media source', async () => {
  const config = YAML.parse(await readFile('.pages.yml','utf8'));
  assert.ok(Array.isArray(config.media));
  const names = new Set(config.media.map(m => m.name));
  async function inspect(value) {
    if (!value || typeof value !== 'object') return;
    if (value.options?.media) assert.ok(names.has(value.options.media), value.label);
    for (const child of Object.values(value)) await inspect(child);
  }
  await inspect(config.content); await inspect(config.components);
  for (const source of config.media) await access(source.input);
  const site=YAML.parse(await readFile('content/data/site.yml','utf8'));
  for (const logo of [site.logo_light,site.logo_dark]) await access(path.join('public',logo));
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

test('Google üçün crawl edilə bilən favicon faylları yaradılır', async () => {
  for (const file of ['favicon.svg', 'favicon-96.png', 'apple-touch-icon.png']) {
    assert.equal(existsSync(path.join('dist', file)), true, `${file} yaradılmayıb`);
  }
  const home = await readFile(path.join('dist', 'index.html'), 'utf8');
  assert.match(home, /rel="icon" type="image\/svg\+xml" href="\/favicon\.svg"/);
  assert.match(home, /rel="icon" type="image\/png" sizes="96x96" href="\/favicon-96\.png"/);
});
