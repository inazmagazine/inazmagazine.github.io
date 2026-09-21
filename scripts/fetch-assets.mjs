// One-time, explicitly sourced sample images. The production build never needs network access.
import { mkdir, writeFile } from 'node:fs/promises';
const images = [
  ['architecture', '34868966', 'Simeon Galabov', 'https://www.pexels.com/photo/minimalist-concrete-wall-with-shadow-patterns-34868966/'],
  ['ceramics', '14770816', 'Amar Preciado', 'https://www.pexels.com/photo/view-of-ceramic-dishes-in-a-workshop-14770816/'],
  ['fashion', '9853293', 'Ron Lach', 'https://www.pexels.com/photo/beautiful-woman-wearing-a-beige-dress-9853293/'],
  ['portrait', '19748978', 'Jingru Li', 'https://www.pexels.com/photo/portrait-of-brunette-woman-in-a-studio-19748978/'],
  ['interior', '30167066', 'Letícia Alvares', 'https://www.pexels.com/photo/sunlit-minimalist-interior-with-white-chairs-30167066/'],
  ['coast', '10188050', 'Theo Savoy', 'https://www.pexels.com/photo/landscape-of-cliffs-and-sea-10188050/']
];
await mkdir('public/media', { recursive: true });
await Promise.all(images.map(async ([name, id]) => {
  const response = await fetch(`https://images.pexels.com/photos/${id}/pexels-photo-${id}.jpeg?auto=compress&cs=tinysrgb&w=2000`, {signal:AbortSignal.timeout(45000)});
  if (!response.ok) throw new Error(`${name}: ${response.status}`);
  await writeFile(`public/media/${name}.jpg`, Buffer.from(await response.arrayBuffer()));
  console.log(`Saved ${name}`);
}));
await writeFile('public/media/credits.json', JSON.stringify(images.map(([file,id,photographer,source])=>({file:`${file}.jpg`,photographer,source,license:'https://www.pexels.com/license/',note:'Nümunə foto; şəxsin I’NAZ ilə əlaqəsi və ya müsahibəsi olduğu iddia edilmir.'})),null,2));
