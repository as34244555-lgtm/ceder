import { PRIVACY_POLICY_URL } from '../constants/legal';

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
        (Diyanet hesaplama yöntemi) · Harita verisi ©{' '}
        <a
          href="https://www.openstreetmap.org/copyright"
          target="_blank"
          rel="noreferrer"
          className="underline hover:text-[var(--text-secondary)]"
        >
          OpenStreetMap
        </a>{' '}
        contributors
      </p>
      <p className="mt-1">
        <a href={PRIVACY_POLICY_URL} target="_blank" rel="noreferrer" className="underline hover:text-[var(--text-secondary)]">
          Gizlilik
        </a>
        {' · '}
        Ezan Vakti Ultra · Vaktin hayırlı olsun 🤲
      </p>
    </footer>
  );
}
