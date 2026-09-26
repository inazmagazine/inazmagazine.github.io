# Pages CMS: rəng və şriftlər

Pages CMS-də **Dizayn ayarları** bölməsini açın.

1. **Avtomatik palitra istifadə et** aktiv olsun. **Əsas rəng** sahəsinə
   `#RRGGBB` yazın, məsələn `#A9D9FF`. Digər tonlar build zamanı hesablanır.
   Açıq rənglər açıq fon, çox tünd rənglər tünd fon yaradır.
2. Konkret hissəni dəyişmək üçün **Fərdi rəngləri aktiv et** seçin və
   **Fərdi rənglər** qrupunda həmin sahəni doldurun. Boş sahə avtomatik rəngdir.
   Sahəni təmizləmək avtomatik rəngə qaytarır; toggle-u söndürmək bütün fərdi
   rəngləri müvəqqəti deaktiv edir. Mətn/fon cütünü özünüz seçdikdə oxunaqlılığı
   yoxlayın: sistem açıq şəkildə seçdiyiniz rəngi dəyişdirmir.
3. **Şriftlər** qrupunda əsas mətn, başlıq, kiçik kateqoriya yazıları və yuxarı
   menyu üçün ayrıca seçim edin. Josefin Sans daxil olmaqla bütün seçimlər lokal
   WOFF2 fayllarıdır. Default əsas mətn/navbar rəsmi Manrope, başlıqlar Cormorant, kiçik kateqoriya yazıları Noto Sans-dır. Boş və yanlış seçim həmin defaulta qayıdır. Manrope böyük Ə-ni dəstəkləmədiyindən eyebrow üçün seçilsə, bütöv Noto Sans istifadə edilir. Loqo şəkli bu ayarlardan dəyişmir.
4. Saxladıqdan sonra GitHub **Actions → Build and deploy** nəticəsinin yaşıl
   tamamlanmasını gözləyin və saytı yeniləyin. İndiki lokal dəyişikliklər əvvəlcə
   GitHub-a push edilməlidir ki, yeni CMS bölməsi hesabınızda görünsün.

Yanlış HEX, boş/tanınmayan şrift, silinmiş və hətta səhv formatlı dizayn YAML-ı
build-i dayandırmır. Sistem etibarlı qəhvəyi və default şrift ayarına qayıdır.
Avtomatik palitra söndürüləndə də qəhvəyi palitra işləyir; aktiv fərdi rənglər
onun üzərinə tətbiq edilə bilər.

Ayar faylı: `content/data/design.yml`. Məqalələrin öz fon rəngləri ayrıca qalır.
Header/footer üçün açıq və tünd loqo fonun kontrastına uyğun seçilir, şəkillərə
CSS filter tətbiq edilmir. Grid, spacing və responsive breakpoint-lər dəyişmir.
