# 🕌 Ezan Vakti — Namaz Vakitleri

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
- Zikir & dualar, Esmaü'l-Hüsna, namaz nasıl kılınır rehberi
- Zekât & fitre hesaplama
- Yakındaki camiler (OpenStreetMap)
- Günün ayeti/hadisi

### PWA + Android
- Ana ekrana eklenebilir, çevrimdışı çalışır
- Capacitor Android projesi (`android/`) — Play Store `.aab` üretimi için bkz. [PLAY_STORE.md](./PLAY_STORE.md)

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

## Canlı site (kalıcı)

**https://ezan-vakti.surge.sh**

Yeniden yayınlamak için:

```bash
npm run build
npx surge ./dist ezan-vakti.surge.sh
```

(Surge hesabı: `aakdniz935@gmail.com` — şifre sıfırlama: https://surge.sh)

GitHub Pages yedek: `gh-pages` dalı hazır. Repo → Settings → Pages → Deploy from branch → `gh-pages` / `/` seçilince:
`https://as34244555-lgtm.github.io/ceder/`

Vaktin hayırlı olsun 🤲
