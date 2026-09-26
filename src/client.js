const fallbackImage = new URL('./media/placeholder.svg', document.currentScript.src).href;
document.addEventListener('error', event => {
  const image = event.target;
  if (image instanceof HTMLImageElement && !image.dataset.fallback) {
    image.dataset.fallback = 'true';
    image.closest('picture')?.querySelectorAll('source').forEach(source => source.remove());
    image.src = fallbackImage;
  }
}, true);
const menu = document.querySelector('.menu-toggle');
const nav = document.querySelector('#main-nav');
function closeMenu() {
  if (!menu || !nav) return;
  menu.setAttribute('aria-expanded', 'false');
  menu.textContent = 'Menyu';
  nav.classList.remove('is-open');
}
menu?.addEventListener('click', () => {
  const open = menu.getAttribute('aria-expanded') === 'true';
  menu.setAttribute('aria-expanded', String(!open));
  menu.textContent = open ? 'Menyu' : 'Bağla';
  nav?.classList.toggle('is-open', !open);
});
document.addEventListener('keydown', event => {
  if (event.key === 'Escape' && menu?.getAttribute('aria-expanded') === 'true') {
    closeMenu();
    menu.focus();
  }
});
nav?.addEventListener('click', event => { if (event.target.closest('a')) closeMenu(); });
matchMedia('(min-width:768px)').addEventListener('change', closeMenu);
const norm = value => String(value || '').toLocaleLowerCase('az').normalize('NFD').replace(/[\u0300-\u036f]/g, '');
const listing = document.querySelector('[data-listing]');
if (listing) {
  const items = [...listing.children];
  const input = document.querySelector('[name=q]');
  const sort = document.querySelector('[name=sort]');
  const params = new URLSearchParams(location.search);
  if (input) input.value = params.get('q') || '';
  if (sort) sort.value = params.get('sort') === 'old' ? 'old' : 'new';
  const category = params.get('category') || '';
  const update = () => {
    const shown = items.filter(el => (!norm(input?.value) || norm(el.dataset.search).includes(norm(input.value))) && (!category || el.dataset.category === category));
    items.forEach(el => { el.hidden = !shown.includes(el); });
    shown.sort((a,b) => (sort?.value === 'old' ? 1 : -1) * a.dataset.date.localeCompare(b.dataset.date)).forEach(el => listing.append(el));
    document.querySelector('[data-count]').textContent = `${shown.length} məzmun`;
    document.querySelector('[data-empty]').hidden = shown.length > 0;
  };
  input?.addEventListener('input', update);
  sort?.addEventListener('change', update);
  input?.form?.addEventListener('submit', event => { event.preventDefault(); update(); });
  update();
}
const search = document.querySelector('[data-global-search]');
if (search) {
  const results = document.querySelector('[data-search-results]');
  const status = document.querySelector('[data-search-status]');
  let data = null;
  const render = () => {
    results.replaceChildren();
    const query = norm(search.value).trim();
    if (query.length < 2) { status.textContent = 'Axtarmaq üçün ən azı iki hərf yazın.'; return; }
    if (!data) { status.textContent = 'Məlumatlar yüklənir…'; return; }
    const found = data.filter(a => norm(`${a.title} ${a.description} ${a.author} ${a.text}`).includes(query));
    status.textContent = found.length ? `${found.length} nəticə tapıldı.` : 'Nəticə tapılmadı.';
    for (const article of found) {
      const link = document.createElement('a');
      link.className = 'card';
      link.href = article.url;
      const picture = document.createElement('picture');
      const img = document.createElement('img');
      img.src = article.image; img.alt = article.alt || ''; img.loading = 'lazy';
      img.width = 480; img.height = 360;
      picture.append(img);
      const heading = document.createElement('h3'); heading.textContent = article.title;
      const description = document.createElement('p'); description.textContent = article.description;
      link.append(picture, heading, description);
      if(article.archive){const badge=document.createElement('span');badge.className='archive-badge';badge.textContent='Arxiv';link.append(badge);}
      results.append(link);
    }
  };
  search.addEventListener('input', render);
  fetch('/search-index.json').then(response => { if (!response.ok) throw new Error('Search index'); return response.json(); })
    .then(value => { data = value; render(); })
    .catch(() => { status.textContent = 'Axtarış məlumatını yükləmək mümkün olmadı. Səhifəni yeniləyin.'; });
}
document.querySelector('[data-copy-link]')?.addEventListener('click', async event => {
  const button = event.currentTarget;
  try { await navigator.clipboard.writeText(location.href); button.textContent = 'Köçürüldü'; }
  catch { button.textContent = 'Keçidi ünvan sətrindən köçürün'; }
});

document.querySelectorAll('.archive-toggle').forEach(button => {
 button.addEventListener('click', () => {
  const expanded=button.getAttribute('aria-expanded')!=='true';
  const panel=document.getElementById(button.getAttribute('aria-controls'));
  if(!panel)return;
  panel.hidden=!expanded;button.setAttribute('aria-expanded',String(expanded));
  button.querySelector('[data-archive-label]').textContent=expanded?button.dataset.closeLabel:button.dataset.openLabel;
  button.querySelector('[data-archive-arrow]').textContent=expanded?'↑':'↓';
 });
});
