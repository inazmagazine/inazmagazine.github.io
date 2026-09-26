const text=(value,fallback)=>typeof value==='string'&&value.trim()?value.trim():fallback;
export function archiveSettings(config={}) {
  config=config&&typeof config==='object'?config:{};
  return {enabled:typeof config.enabled==='boolean'?config.enabled:true,
    title:text(config.title,'Əvvəlki məzmunlar'),
    initial_count:[2,3,'2','3'].includes(config.initial_count)?Number(config.initial_count):3,
    open_label:text(config.open_label,'Daha çox məzmun'),close_label:text(config.close_label,'Arxivi bağla')};
}
export function splitArticles(articles) {
  const published=articles.filter(a=>a.status==='published').sort((a,b)=>String(b.date).localeCompare(String(a.date)));
  return {active:published.filter(a=>a.archive!==true),archived:published.filter(a=>a.archive===true)};
}
