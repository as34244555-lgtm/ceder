export function PrivacyScreen() {
  return (
    <div className="w-full flex flex-col gap-3 fade-in-up text-sm text-[var(--text-secondary)] leading-relaxed">
      <div className="glass-card rounded-2xl px-4 py-4 flex flex-col gap-3">
        <p className="font-semibold text-[var(--text-primary)]">Gizlilik</p>
        <p>
          <strong className="text-[var(--text-primary)]">Ezan Vakti Ultra</strong> resmi bir kurum
          uygulaması değildir. Konum, bildirim ve ses izinleri yalnızca namaz vakti, kıble, camiler
          ve helal mekân özellikleri için istenir.
        </p>
        <p>
          Namaz takibi, kaza, hatim ve ayarlar verileri cihazınızda (localStorage) saklanır. İsterseniz
          Ayarlar’dan JSON yedek alıp geri yükleyebilirsiniz.
        </p>
        <p>
          Üçüncü taraf servisler: Aladhan (vakitler), OpenStreetMap/Overpass (cami/helal), AlQuran.cloud
          / islamic.network (Kur’an metin/tilavet), altın kur API’si. Bu servislerin kendi
          politikaları geçerlidir.
        </p>
        <p>
          Ezan sesleri kamu malı / CC lisanslı kayıtlardan türetilmiştir; atıflar{' '}
          <code className="text-xs">audio/LICENSE.md</code> dosyasındadır.
        </p>
        <p className="text-xs text-[var(--text-muted)]">
          Reklam SDK’sı veya gizli analitik yoktur. Sorularınız için uygulama mağaza sayfasındaki
          iletişim kanalını kullanın.
        </p>
      </div>
    </div>
  );
}
