export function Footer() {
  return (
    <footer className="mt-auto pt-8 pb-6 text-center text-xs text-emerald-100/40 px-4">
      <p>
        Vakitler{' '}
        <a
          href="https://aladhan.com/prayer-times-api"
          target="_blank"
          rel="noreferrer"
          className="underline hover:text-emerald-100/70"
        >
          Aladhan API
        </a>{' '}
        (Diyanet İşleri Başkanlığı hesaplama yöntemi) kullanılarak hesaplanır.
      </p>
      <p className="mt-1">Vaktin hayırlı olsun 🤲</p>
    </footer>
  );
}
