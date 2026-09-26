# Arxiv məzmunlar

Pages CMS → Məzmunlar → məqalə → **Arxivə göndər** seçimini aktiv edin və saxlayın. Məqalə silinmir, faylı və URL-si dəyişmir. Seçimi söndürmək onu aktiv məzmunlara qaytarır. Qaralamalar heç bir ictimai siyahıda göstərilmir.

**Arxiv ayarları** bölməsində görünürlük, başlıq, ilkin say (2 və ya 3) və düymələrin mətnləri dəyişdirilir. Boş və yanlış ayarlar standart dəyərlərə qayıdır. Bölməni gizlətmək arxiv məqalələrinin birbaşa URL-lərini və axtarış nəticələrini gizlətmir.

Arxiv ana səhifədə, Məzmunlar siyahısında və uyğun kateqoriya səhifəsində aktiv məzmundan sonra göstərilir. İlkin kartlardan sonrakı kartlar düymə ilə açılıb-bağlanır. Sıralama tarix üzrə ən yenidən ən köhnəyədir. Axtarışda arxiv məqalələrinin yanında Arxiv nişanı görünür; sitemap-da qalırlar. Layihədə RSS sistemi yoxdur.

Əl ilə redaktə edərkən Markdown frontmatter daxilində `archive: true` və ya `archive: false` yazın. Sahə olmadıqda məqalə aktiv hesab olunur. Məqalə `status: published` olmadıqda göstərilmir.

Yoxlama: `npm run check` production build, unit testlər və ayrıca müvəqqəti test məzmunu ilə arxiv build ssenarilərini işlədir. Testdən sonra build mövcud real məqalələrlə bərpa olunur.
