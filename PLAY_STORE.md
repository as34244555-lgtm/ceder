# Play Store'a Yükleme (.aab) Rehberi

Bu proje, **Capacitor** ile Android native kabuğuna sarılmış bir React web uygulamasıdır.
`android/` klasörü Android Studio ile açılıp **Android App Bundle (.aab)** olarak dışa aktarılabilir.

## Kısa cevap: Web sınırları `.aab` ile otomatik kalkar mı?

**Hayır — tek başına WebView/.aab paketi sınırları kaldırmaz.**

| Özellik | Sadece web/PWA | Capacitor WebView (.aab) | Capacitor + native eklenti / native kod |
|---|---|---|---|
| Play Store'a yükleme | ❌ | ✅ | ✅ |
| Ana ekran ikonu / tam ekran | ✅ (PWA) / ✅ | ✅ | ✅ |
| Konum, ses, kıble (uygulama açıkken) | ✅ | ✅ | ✅ |
| Uygulama kapalıyken güvenilir ezan bildirimi | ❌ / zayıf | ⚠️ sınırlı (WebView arka planı kısıtlı) | ✅ Local/Push Notifications plugin + Foreground Service |
| Kalıcı durum çubuğu bildirimi (6 vakit) | ❌ | ❌ | ✅ Android Foreground Service |
| Ana ekran widget | ❌ | ❌ | ✅ native Android Widget |
| Namazda sessize alma / arama reddetme | ❌ | ❌ | ✅ native izin + kod |

**Pratik sonuç:**
1. Bu PR'daki Capacitor kurulumu ile **Play Store'a .aab yükleyebilirsin**.
2. Uygulama açıkken/ön plandayken deneyim rakiplerle rekabet eder.
3. "Telefon kilitliyken kesin ezan sesi", "kalıcı bildirim", "widget" gibi özellikler için **ek native eklenti / Kotlin kodu** gerekir; WebView'e almak yetmez.

## Android Studio ile .aab üretme

### Gereksinimler
- Android Studio (Ladybug veya daha yeni)
- JDK 17+ (Android Studio ile gelir)
- Play Console hesabı

### Adımlar

```bash
# 1) Web build + native projeyi senkronize et
npm install
npm run cap:sync

# 2) Android Studio'da aç
npm run cap:open
# veya: npx cap open android
```

Android Studio içinde:
1. **Build → Generate Signed Bundle / APK**
2. **Android App Bundle** seç
3. Bir keystore oluştur (veya mevcut olanı kullan) — **keystore'u kaybetme**
4. `release` build type ile imzala
5. Çıktı genelde:
   `android/app/release/app-release.aab`

### Play Console
1. Yeni uygulama oluştur (Türkçe ad: **Ezan Vakti Ultra**)
2. Package name: `com.ezanvakti.app` (capacitor.config.ts ile aynı olmalı)
3. Production / Internal testing track'e `.aab` yükle
4. Mağaza listesi, gizlilik politikası, içerik derecelendirmesi doldur

## Geliştirme döngüsü

Web kodunu değiştirdikten sonra her seferinde:

```bash
npm run cap:sync
```

Sonra Android Studio'da Run / yeniden paketle.

## Bu PR'da eklenen native özellikler

1. `@capacitor/local-notifications` — vakit / hatırlatma / kamet zamanlanır
2. **Foreground Service** (`OngoingPrayerService`) — kalıcı “sonraki namaz” bildirimi
3. Boot’ta servis yeniden başlar (`BootCompletedReceiver`)
4. Pil optimizasyonu + exact alarm ayar kısayolları (`PrayerNative` eklentisi)
5. Ana ekran **App Widget**
6. Wear OS için `wear_prayer_times` Preferences anahtarı (telefon tarafı senkron)

### Wear OS notu
Telefon, Capacitor Preferences’a `wear_prayer_times` JSON yazar:
`{ location, updatedAt, times: [{ label, time, at }] }`.
Ayrı Wear uygulaması bu anahtarı Data Layer ile okuyacak şekilde eklenebilir; bu pakette telefon/companion veri sözleşmesi hazırdır. iOS hedefi bilerek dışarıda bırakılmıştır.