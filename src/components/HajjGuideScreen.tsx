const STEPS = [
  {
    title: 'Umre — genel akış',
    body: 'İhrama gir → Kâbe’de tavaf (7 şavt) → Sa’y (Safa–Merve) → tıraş/kısaltma ile ihramdan çık. Niyet ve dualar önemli; rehber hocaya danışın.',
  },
  {
    title: 'Hac — ana menasik',
    body: 'Terviye (8 Zilhicce) Mina, Arefe (9) Arafat vakfe, Müzdelife geceleme, bayram günü şeytan taşlama + kurban + tıraş, tavaf-ı ifaza, Mina’da şeytan taşlama, veda tavafı.',
  },
  {
    title: 'İhram yasakları (özet)',
    body: 'Dikişli elbise (erkek), koku, tırnak/saç kesme, av, cinsel ilişki vb. Mezhebe göre ayrıntı değişir.',
  },
  {
    title: 'Sağlık & hazırlık',
    body: 'Aşı, ilaç, rahat ayakkabı, güneş koruması, grupla buluşma noktası, pasaport/vize ve Diyanet/acente bilgilendirmelerini takip edin.',
  },
  {
    title: 'Not',
    body: 'Bu rehber özet bilgilendirmedir; fetva veya resmi hac organizasyonu yerine geçmez.',
  },
];

export function HajjGuideScreen() {
  return (
    <div className="w-full flex flex-col gap-3 fade-in-up">
      <div className="glass-card rounded-2xl px-4 py-3">
        <p className="text-sm font-semibold text-[var(--text-primary)]">Hac & Umre Rehberi</p>
        <p className="text-xs text-[var(--text-muted)] mt-1">
          Kısa özet menasik — ayrıntı için güvenilir ilmihal / Diyanet kaynaklarına bakın.
        </p>
      </div>
      {STEPS.map((s) => (
        <div key={s.title} className="glass-card rounded-2xl px-4 py-3 flex flex-col gap-1.5">
          <p className="text-sm font-medium text-gold-300">{s.title}</p>
          <p className="text-sm text-[var(--text-secondary)] leading-relaxed">{s.body}</p>
        </div>
      ))}
    </div>
  );
}
