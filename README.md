# 🕌 Ezan Vakti — Namaz Vakitleri

Dünyanın her yerinden namaz vakitlerini gösteren, kıble pusulası, aylık takvim,
dijital tesbih ve dualar içeren; ana ekrana eklenebilen (PWA) modern bir namaz
vakti uygulaması.

## Özellikler

### Namaz Vakitleri
- 🇹🇷 Türkiye'nin 81 ili için hızlı şehir seçimi, GPS ile otomatik konum veya
  dünya genelinde herhangi bir şehir/ülke girişi
- ⏱️ Sıradaki vakte canlı geri sayım, ilerleme çubuğu ve günün tüm vakitleri
  (İmsak, Güneş, Öğle, İkindi, Akşam, Yatsı)
- 🔔 Vakit girdiğinde **gerçek ezan sesi** (CC0 lisanslı) veya kısa nağme ile
  sesli uyarı, isteğe bağlı tarayıcı bildirimi ve vakit öncesi hatırlatma
- 📅 Hicri ve miladi tarih gösterimi, gece yarısı otomatik güncelleme
- 🧮 Diyanet dahil 14 farklı namaz vakti hesaplama yöntemi

### Kıble Pusulası
- 🧭 Konumunuzdan Kâbe'ye gerçek zamanlı açı ve mesafe hesaplama
- Cihaz pusulasıyla dönen ok, sensör yoksa sabit açı gösterimi

### Aylık Takvim
- 📆 Ay bazlı tüm namaz vakitleri tek tabloda, ay ileri/geri gezinme

### Zikir
- 📿 Seçilebilir zikirlerle dijital tesbih sayacı (titreşimli geri bildirim)
- 🤲 Ezan duası dahil kısa günlük dualar (Arapça, okunuş, anlam)

### Genel
- 🌓 Gerçek açık/koyu/sistem tema desteği, 12/24 saat formatı
- 📱 **PWA**: Ana ekrana eklenebilir, çevrimdışı çalışabilir (service worker
  ile önbelleklenen vakitler ve uygulama kabuğu)
- Alt sekme navigasyonu: Vakitler / Kıble / Takvim / Zikir / Ayarlar

Vakitler, [Aladhan API](https://aladhan.com/prayer-times-api) üzerinden hesaplanır.

## Kullanılan Teknolojiler

- [React 19](https://react.dev) + [TypeScript](https://www.typescriptlang.org/)
- [Vite](https://vite.dev) + [vite-plugin-pwa](https://vite-pwa-org.netlify.app/)
- [Tailwind CSS v4](https://tailwindcss.com)
- [lucide-react](https://lucide.dev) ikonları

## Geliştirme

```bash
npm install
npm run dev
```

Ardından tarayıcıda `http://localhost:5173` adresini açın.

## Derleme

```bash
npm run build
```

## Lint

```bash
npm run lint
```

## Proje Yapısı

```
src/
  api/            # Aladhan API ve ters coğrafi kodlama istekleri
  components/     # UI bileşenleri (sekmeler, pusula, takvim, tesbih, dualar...)
  data/           # Şehirler, hesaplama yöntemleri, zikirler, dualar
  hooks/          # Konum, veri çekme, geri sayım, pusula, tema ve uyarı mantığı
  utils/          # Ses, bildirim, kıble hesaplama ve localStorage yardımcıları
public/
  audio/          # CC0 lisanslı ezan sesi (bkz. LICENSE.md)
  icons/          # PWA ikonları
```

Vaktin hayırlı olsun 🤲
