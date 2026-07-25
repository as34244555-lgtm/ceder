# 🕌 Ezan Vakti — Namaz Vakitleri

Şehrinize veya konumunuza göre güncel namaz vakitlerini gösteren, sıradaki vakte geri sayım yapan ve vakit girdiğinde sesli/bildirimli uyaran modern bir web uygulaması.

## Özellikler

- 🇹🇷 Türkiye'nin 81 ili için şehir seçimi veya "Konumumu Kullan" ile GPS tabanlı otomatik konum
- ⏱️ Sıradaki vakte canlı geri sayım ve gün içindeki tüm vakitlerin (İmsak, Güneş, Öğle, İkindi, Akşam, Yatsı) listesi
- 🔔 Vakit girdiğinde sesli uyarı (Web Audio ile üretilen kısa bir nağme) ve isteğe bağlı tarayıcı bildirimi
- ⏰ Vakitten belirli dakikalar önce hatırlatma seçeneği (5/10/15 dk)
- 📅 Hicri ve miladi tarih gösterimi
- 🌙 Gece yarısını geçince otomatik güncellenen vakitler
- Vakitler, [Aladhan API](https://aladhan.com/prayer-times-api) üzerinden Diyanet İşleri Başkanlığı hesaplama yöntemiyle (method 13) hesaplanır.

## Kullanılan Teknolojiler

- [React 19](https://react.dev) + [TypeScript](https://www.typescriptlang.org/)
- [Vite](https://vite.dev)
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
  components/      # UI bileşenleri
  data/            # Türkiye il listesi
  hooks/           # Konum, veri çekme, geri sayım ve uyarı mantığı
  utils/           # Ses, bildirim ve localStorage yardımcıları
```

Vaktin hayırlı olsun 🤲
