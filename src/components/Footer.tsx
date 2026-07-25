export function Footer() {
  return (
    <footer className="mt-auto pt-8 pb-6 text-center text-xs text-[var(--text-faint)] px-4">
      <p>
        Vakitler{' '}
        <a
          href="https://aladhan.com/prayer-times-api"
          target="_blank"
          rel="noreferrer"
          className="underline hover:text-[var(--text-secondary)]"
        >
          Aladhan API
        </a>{' '}
        (Diyanet İşleri Başkanlığı hesaplama yöntemi) kullanılarak hesaplanır.
      </p>
      <p className="mt-1">Vaktin hayırlı olsun 🤲</p>
    </footer>
  );
}
