import { COPYRIGHT_PAGE_URL, DEVELOPER_EMAIL, DEVELOPER_NAME, PRIVACY_POLICY_URL } from '../constants/legal';

export function PrivacyScreen() {
  return (
    <div className="w-full flex flex-col gap-3 fade-in-up text-sm text-[var(--text-secondary)] leading-relaxed">
      <div className="glass-card rounded-2xl px-4 py-4 flex flex-col gap-3">
        <p className="font-semibold text-[var(--text-primary)]">Gizlilik Politikası</p>
        <div className="rounded-xl border border-gold-400/30 bg-gold-400/10 px-3 py-2.5">
          <p className="text-xs text-[var(--text-muted)]">Geliştirici</p>
          <p className="text-sm font-semibold text-[var(--text-primary)]">{DEVELOPER_NAME}</p>
          <a className="text-sm text-gold-300 underline break-all" href={`mailto:${DEVELOPER_EMAIL}`}>
            {DEVELOPER_EMAIL}
          </a>
        </div>
        <p>
          <strong className="text-[var(--text-primary)]">Ezan Vakti Ultra</strong> resmî bir kurum
          uygulaması değildir. Hesap açılmaz; namaz takibi ve ayarlar cihazınızda saklanır.
        </p>
        <p>
          Konum, bildirim ve pusula izinleri vakit, kıble, camiler ve ezan uyarısı içindir. GPS
          zorunlu değildir; şehir seçebilirsiniz.
        </p>
        <p>
          Uygulama <strong className="text-[var(--text-primary)]">reklam</strong> gösterebilir
          (ör. AdMob). Reklam ağları reklam kimliği, cihaz bilgisi ve (izin varsa) yaklaşık konum
          işleyebilir. Reklamları cihazın Google / gizlilik ayarlarından sınırlayabilirsiniz.
        </p>
        <p>
          Üçüncü taraf servisler: Aladhan (vakitler), OpenStreetMap (cami/helal), AlQuran.cloud
          (yalnızca Arapça mushaf). Meal ve tilavet yoktur. Bunların kendi politikaları geçerlidir.
        </p>
        <p className="text-xs text-[var(--text-muted)]">
          Tam metin ayrı sitede (HTTPS, kalıcı):{' '}
          <a className="text-gold-300 underline" href={PRIVACY_POLICY_URL} target="_blank" rel="noreferrer">
            Gizlilik politikası
          </a>
          {' · '}
          <a className="text-gold-300 underline" href={COPYRIGHT_PAGE_URL} target="_blank" rel="noreferrer">
            Telif ve lisanslar
          </a>
        </p>
      </div>
    </div>
  );
}
