# I’NAZ Magazine

Azərbaycan dilində, mobil uyğun, statik jurnal saytı və Pages CMS məzmun modeli. Sayt semantik HTML, müasir CSS və Vanilla JavaScript istifadə edir. Məqalələr Markdown, parametrlər YAML fayllarında saxlanılır.

## Lokal işə salma

Node.js 22 və ya daha yeni versiya tələb olunur.

```bash
npm install
npm run dev
```

Brauzerdə `http://127.0.0.1:4173` ünvanını açın. Yekun çıxış üçün `npm run build`, build və testlər üçün `npm run check` istifadə olunur. `dist/` yayımlanacaq hazır saytdır.

VS Code Live Server istifadə edilirsə, `dist/index.html` faylını açın. Layihənin kökündən və ya `content/` içindən HTML açmayın.

## Məzmun quruluşu

- `content/articles/` — Markdown məqalələr
- `content/pages/` — məxfilik və istifadə qaydaları
- `content/data/` — sayt, ana səhifə, menyu və bölmə parametrləri
- `haqqinda.md` — Haqqımızda səhifəsinin əsas mətni
- `cumle.md` — ana səhifədə “I’NAZ haqqında” hissəsinin cümləsi
- `public/media/` — şəkillər
- `.pages.yml` — Pages CMS idarəetmə sahələri

`status: draft` olan məqalələr canlı build-ə daxil edilmir. `home_section` məqalənin ana səhifədə iki böyük məqalədən biri, dörd kiçik kartdan biri və ya yalnız bölmə səhifəsində görünəcəyini müəyyən edir. `home_order` sıralamanı idarə edir.

## Pages CMS

1. [Pages CMS](https://app.pagescms.org/) saytında GitHub ilə daxil olun və repository-ni seçin.
2. CMS repository kökündəki `.pages.yml` faylını avtomatik oxuyacaq.
3. GitHub App üçün seçilmiş repository-yə `Contents: Read and write` icazəsi verin.
4. CMS-də saxlanan hər dəyişiklik GitHub commit-i yaradır və `main` branch-də sayt avtomatik yenidən qurulur.

CMS Azərbaycan dilindədir və hər sahənin altında nə işə yaradığı yazılıb. Şəkil sahəsində mövcud şəkli görmək, silmək, media kitabxanasından başqasını seçmək və yenisini yükləmək olar. Şəkil təsviri əlçatanlıq və Google üçün vacibdir.

Şəkillər `.pages.yml` daxilində `media` adlı kitabxanaya bağlanır. Yüklənən fayllar `public/media/` qovluğunda saxlanır və saytda `/media/fayl-adi` ünvanı ilə istifadə olunur. Loqolar da bu kitabxanadadır; buna görə CMS onları önizləyə və dəyişə bilir.

Yeni məqalə üçün **Məzmunlar → New** seçin, vacib sahələri doldurun, şəkli və şəklin təsvirini əlavə edin. Ana səhifədə eyni anda 2 “Əsas böyük məqalə” və 4 “Kiçik məqalə kartı” saxlayın. Sıra üçün böyük məqalələrə 1–2, kiçiklərə 3–6 yazın. Hazır məqalənin vəziyyətini **Yayımlanmış** edin.

Ana və Haqqımızda mətnləri, əlaqə məlumatları, loqolar, navbar/footer menyusu, bölmə səhifələri və hüquqi mətnlər CMS-in ayrıca bölmələrindən idarə olunur.

## GitHub Pages və domen

Repository-də **Settings → Pages → Source** bölməsində **GitHub Actions** seçilir. `main` branch-ə hər push `.github/workflows/deploy.yml` vasitəsilə saytı yoxlayır və `dist/` qovluğunu yayımlayır.

Əsas domen `content/data/site.yml` faylındakı `base_url` sahəsində saxlanılır. Build hər səhifəyə title, description, canonical, Open Graph məlumatları, məqalələrə Article schema, həmçinin `sitemap.xml` və `robots.txt` yaradır.

## Şəkillər və performans

Build məqalələrin əsas şəkillərini avtomatik olaraq 480, 900 və 1400 piksel WebP variantlarına çevirir. Brauzer ekran ölçüsünə uyğun variantı seçir, aşağıdakı şəkillər isə lazım olduqda yüklənir. Orijinal şəkilləri 2000–2500 piksel və mümkün qədər 1 MB-dan aşağı saxlamaq tövsiyə olunur.
