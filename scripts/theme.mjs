// Build-time palette: HSL tones + linear-sRGB WCAG contrast, no runtime service.
export const DEFAULT_PRIMARY='#411d0b';
export const FONT_CHOICES={
  'Manrope':{family:'Manrope',fallback:'Arial,sans-serif',files:['manrope-latin.woff2','manrope-latin-ext.woff2'],weights:'200 800',legacy:true},
  'Cormorant':{family:'Cormorant',fallback:'Georgia,serif',files:['cormorant-latin.woff2','cormorant-latin-ext.woff2'],weights:'300 700',legacy:true},
  'Josefin Sans':{family:'Josefin Sans',fallback:'Arial,sans-serif',files:['josefin-sans-latin.woff2','josefin-sans-latin-ext.woff2'],weights:'100 700'},
  'Noto Sans':{family:'Noto Sans',fallback:'Arial,sans-serif',files:['noto-sans-latin.woff2','noto-sans-latin-ext.woff2'],weights:'100 900'},
  'Source Sans 3':{family:'Source Sans 3',fallback:'Arial,sans-serif',files:['source-sans-3-latin.woff2','source-sans-3-latin-ext.woff2'],weights:'200 900'},
  'Lora':{family:'Lora',fallback:'Georgia,serif',files:['lora-latin.woff2','lora-latin-ext.woff2'],weights:'400 700'}
};
export function parseHex(value,fallback=null){return typeof value==='string'&&/^#[\da-f]{6}$/i.test(value.trim())?value.trim().toLowerCase():fallback;}
export function luminance(hex){const rgb=[1,3,5].map(i=>parseInt(hex.slice(i,i+2),16)/255).map(v=>v<=.04045?v/12.92:((v+.055)/1.055)**2.4);return rgb[0]*.2126+rgb[1]*.7152+rgb[2]*.0722;}
export function contrast(a,b){const x=luminance(a),y=luminance(b);return (Math.max(x,y)+.05)/(Math.min(x,y)+.05);}
export function contrastText(bg){return contrast('#ffffff',bg)>=contrast('#000000',bg)?'#ffffff':'#000000';}
function hsl(hex){const [r,g,b]=[1,3,5].map(i=>parseInt(hex.slice(i,i+2),16)/255);const max=Math.max(r,g,b),min=Math.min(r,g,b),d=max-min,l=(max+min)/2;let h=0,s=0;if(d){s=d/(1-Math.abs(2*l-1));h=(max===r?((g-b)/d)%6:max===g?(b-r)/d+2:(r-g)/d+4)*60;}return [(h+360)%360,s,l];}
function tone(h,s,l){const c=(1-Math.abs(2*l-1))*s,x=c*(1-Math.abs((h/60)%2-1)),m=l-c/2;const [r,g,b]=h<60?[c,x,0]:h<120?[x,c,0]:h<180?[0,c,x]:h<240?[0,x,c]:h<300?[x,0,c]:[c,0,x];return '#'+[r,g,b].map(v=>Math.round((v+m)*255).toString(16).padStart(2,'0')).join('');}
function readable(color,bg,min=4.5){if(contrast(color,bg)>=min)return color;const [h,s,l]=hsl(color);const target=contrastText(bg)==='#ffffff'?1:0;for(let i=1;i<=100;i++){const c=tone(h,s,l+(target-l)*i/100);if(contrast(c,bg)>=min)return c;}return contrastText(bg);}
export const LEGACY={primary:'#411d0b','primary-hover':'#57290f',background:'#411d0b',surface:'#411d0b','surface-alt':'#2b1207',header:'#411d0b',footer:'#2b1207',text:'#f7ebdd','text-muted':'#ead7c5','text-on-primary':'#f7ebdd',heading:'#f7ebdd',border:'rgba(247,235,221,.25)',accent:'#c69055',link:'#f7ebdd','link-hover':'#d9b99b','footer-text':'#f7ebdd','header-text':'#f7ebdd',category:'#d9b99b',focus:'#c69055','surface-text':'#f7ebdd',button:'#f7ebdd','button-text':'#411d0b','button-hover':'#d9b99b'};
Object.assign(LEGACY,{'surface-muted':'#ead7c5','surface-category':'#d9b99b','surface-heading':'#f7ebdd','input-text':'#f7ebdd','footer-muted':'#d9b99b'});
export function selectFont(value,fallback='Manrope'){const key=typeof value==='string'?value.trim().replace(/\s+/g,' ').toLowerCase():'';return Object.keys(FONT_CHOICES).find(k=>k.toLowerCase()===key)||fallback;}
export function createTheme(config={}){
  if(!config||typeof config!=='object')config={};
  const primary=parseHex(config.primary,DEFAULT_PRIMARY);let colors={...LEGACY};
  if(config.automatic!==false&&primary!==DEFAULT_PRIMARY){
    const [h,s,l]=hsl(primary),sat=Math.min(s,.65),dark=luminance(primary)<.12;
    const background=tone(h,sat*.35,dark?.105:.975),surface=tone(h,sat*.3,dark?.16:.995);
    const text=tone(h,sat*.25,dark?.94:.12),footer=tone(h,sat*.7,.09);
    colors={primary,'primary-hover':tone(h,s,Math.max(.03,Math.min(.97,l+(l<.5?.08:-.08)))),background,surface,'surface-alt':tone(h,sat*.4,dark?.21:.94),header:background,footer,text,'text-muted':readable(tone(h,sat*.35,dark?.72:.4),background),'text-on-primary':contrastText(primary),heading:text,border:readable(tone(h,sat*.3,dark?.35:.75),background,1.5),accent:readable(tone(h,Math.max(.35,sat),dark?.7:.35),background,3),link:readable(tone(h,sat,dark?.8:.28),background),'link-hover':readable(tone(h,sat,dark?.9:.2),background),'footer-text':readable(tone(h,sat*.15,.93),footer),'header-text':text,category:readable(tone(h,sat*.35,dark?.78:.35),background),focus:readable(tone(h,Math.max(.35,sat),dark?.7:.35),background,3),'surface-text':readable(text,surface)};
  }
  if(config.automatic!==false&&primary!==DEFAULT_PRIMARY){colors['primary-hover']=readable(colors['primary-hover'],colors['text-on-primary']);colors.button=colors.primary;colors['button-text']=colors['text-on-primary'];colors['button-hover']=colors['primary-hover'];}
  if(config.custom_enabled===true&&config.colors&&typeof config.colors==='object')for(const key of ['background','header','footer','text','heading','footer-text','surface','accent','link','border']){const value=parseHex(config.colors[key.replaceAll('-','_')]);if(value)colors[key]=value;}
  // Derive contextual foregrounds after background overrides. Explicit text
  // overrides stay exact; the editor is responsible for those custom pairs.
  const hasOverride=key=>config.custom_enabled===true&&parseHex(config.colors?.[key.replaceAll('-','_')]);
  for(const key of ['text','heading','link','link-hover'])if(!hasOverride(key))colors[key]=readable(colors[key],colors.background);
  colors['header-text']=readable(colors.text,colors.header);
  if(!parseHex(config.custom_enabled&&config.colors?.footer_text))colors['footer-text']=readable(colors['footer-text'],colors.footer);
  colors['surface-text']=readable(colors.text,colors.surface);
  colors['surface-heading']=hasOverride('heading')?colors.heading:readable(colors.heading,colors.surface);
  colors['surface-muted']=readable(colors['text-muted'],colors.surface);
  colors['surface-category']=readable(colors.category,colors.surface);
  colors['input-text']=readable(colors.text,colors['surface-alt']);
  colors['footer-muted']=hasOverride('footer-text')?colors['footer-text']:readable(colors['footer-muted']||colors.category,colors.footer);
  colors['text-muted']=readable(colors['text-muted'],colors.background);
  colors.category=readable(colors.category,colors.background);
  colors.focus=readable(colors.accent,colors.background,3);
  const fonts={body:selectFont(config.fonts?.body),heading:selectFont(config.fonts?.heading,'Cormorant'),eyebrow:selectFont(config.fonts?.eyebrow,'Noto Sans'),navigation:selectFont(config.fonts?.navigation)};
  // Official Manrope lacks capital schwa. Use one complete official family for
  // the entire uppercase label, rather than mixing glyphs inside a word.
  if(fonts.eyebrow==='Manrope')fonts.eyebrow='Noto Sans';
  return {colors,fonts};
}
export function themeCss(theme){
  const families=[...new Set(Object.values(theme.fonts))];
  const faces=families.flatMap(name=>{const f=FONT_CHOICES[name];return f.files.map((file,i)=>`@font-face{font-family:'${f.family}';src:url('./fonts/${file}') format('woff2');font-style:normal;font-weight:${f.weights};font-display:swap;${f.legacy?(i===0?'':'unicode-range:U+0100-02FF,U+1E00-1EFF;'):f.files.length>1?'unicode-range:'+(i===0?'U+0000-00FF,U+0131,U+0152-0153,U+02BB-02BC,U+02C6,U+02DA,U+02DC,U+0304,U+0308,U+0329,U+2000-206F,U+20AC,U+2122,U+2191,U+2193,U+2212,U+2215,U+FEFF,U+FFFD':'U+0100-02BA,U+02BD-02C5,U+02C7-02CC,U+02CE-02D7,U+02DD-02FF,U+1D00-1DBF,U+1E00-1EFF,U+2020,U+20A0-20AB,U+20AD-20C0,U+2113,U+2C60-2C7F,U+A720-A7FF')+';':''}}`);}).join('\n');
  return faces+'\n:root{'+Object.entries(theme.colors).map(([k,v])=>`--color-${k}:${v};`).join('')+Object.entries(theme.fonts).map(([k,v])=>`--font-${k}:'${FONT_CHOICES[v].family}',${FONT_CHOICES[v].fallback};`).join('')+'}\n';
}
