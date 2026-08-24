# 🕌 Ezan Vakti Ultra — Namaz Vakitleri

Dünyanın her yerinden namaz vakitlerini gösteren; kıble, aylık takvim, namaz
takibi, Ramazan modu, zekât hesaplama, yakındaki camiler, tesbih, dualar ve
Esmaü'l-Hüsna içeren; **PWA** olarak kurulan ve **Capacitor** ile Play Store'a
`.aab` olarak paketlenebilen modern bir namaz vakti uygulaması.

## Özellikler

### Namaz Vakitleri
- Türkiye'nin 81 ili, GPS veya dünya genelinde şehir/ülke
- Canlı geri sayım, ilerleme çubuğu, 6 vakit listesi
- Kısa uyarı nağmesi; çoklu hatırlatma (5/10/15/30/45 dk)
- Kerahat vakti uyarısı
- Favori şehirler, 14 hesaplama yöntemi, 12/24 saat, açık/koyu tema

### Namazlarım
- Günlük kıldım/kılmadım takibi, haftalık istatistik
- Kaza namazı sayacı

### Kıble, Takvim, Ramazan
- Kıble pusulası (GPS veya şehirden otomatik)
- Aylık miladi + hicri takvim, önemli dini gün bildirimleri
- Ramazan modu: iftar/sahur geri sayımı, 30 günlük oruç takibi

### Daha menüsü
- Kur'an-ı Kerim (meal + tilavet)
- Zikir & dualar, Esmaü'l-Hüsna, namaz nasıl kılınır rehberi
- Zekât & fitre hesaplama
- Yakındaki camiler (OpenStreetMap)
- Günün ayeti/hadisi

### PWA + Android
- Ana ekrana eklenebilir, çevrimdışı çalışır
- Capacitor Android projesi (`android/`) — Play Store `.aab` üretimi için bkz. [PLAY_STORE.md](./PLAY_STORE.md)

### Android Studio (Next.js gerekmez)

Bu uygulama **Next.js değil**; React + Vite + Capacitor.

1. Repoyu bilgisayara alın (GitHub Clone veya ZIP).
2. Web arayüzünü gömmek için (bir kez):
   ```bash
   npm ci
   npm run build
   npx cap sync android
   ```
3. Android Studio → **Open** → `android` klasörünü seçin.
4. Gradle sync → **Build → Build APK(s)** veya Run.

Sadece APK denemek için `android/` klasörü (içinde `assets/public` doluysa) doğrudan da açılabilir.

## Geliştirme

```bash
npm install
npm run dev
```

## Derleme / Lint

```bash
npm run build
npm run lint
```

## Android (Play Store .aab)

```bash
npm run cap:sync   # web build + android senkron
npm run cap:open   # Android Studio'da aç
```

Detaylar ve **“web sınırları .aab ile kalkar mı?”** cevabı: [PLAY_STORE.md](./PLAY_STORE.md)

## Teknolojiler

React 19 · TypeScript · Vite 8 · Tailwind CSS v4 · vite-plugin-pwa · Capacitor 8 · Aladhan API · OpenStreetMap Overpass

## Canlı site

Hedef adres: **https://ezan-vakti.surge.sh**

Her push’ta `.github/workflows/deploy-live.yml` şunu yapar:

1. `npm run build`
2. `gh-pages` dalını günceller (yedek yayın)
3. Repo secret’ları `SURGE_LOGIN` + `SURGE_TOKEN` varsa Surge’e yayınlar

### Surge’ü bir kez bağlama

1. https://surge.sh hesabı (`aakdniz935@gmail.com`) → token alın (`npx surge token`)
2. Repo → Settings → Secrets and variables → Actions:
   - `SURGE_LOGIN` = e-posta
   - `SURGE_TOKEN` = token
3. Actions → **Deploy Live** → Run workflow

Manuel: `npm run deploy:web`

### GitHub Pages (yedek URL)

`gh-pages` dalı her zaman güncel Ultra build’i tutar. Bir kez açın:

Repo → Settings → Pages → Deploy from a branch → `gh-pages` / `/` → Save  
Adres: `https://as34244555-lgtm.github.io/ceder/`

PWA önbelleği yüzünden eski sürüm görürseniz gizli pencerede açın veya site verisini temizleyin.

Vaktin hayırlı olsun 🤲
