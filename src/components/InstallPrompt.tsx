import { useEffect, useState } from 'react';
import { Download, Share } from 'lucide-react';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

function isStandalone(): boolean {
  if (typeof window === 'undefined') return false;
  return (
    window.matchMedia?.('(display-mode: standalone)').matches ||
    (window.navigator as unknown as { standalone?: boolean }).standalone === true
  );
}

function isIOS(): boolean {
  if (typeof navigator === 'undefined') return false;
  return /iphone|ipad|ipod/i.test(navigator.userAgent);
}

export function InstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [installed, setInstalled] = useState(isStandalone());

  useEffect(() => {
    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    };
    window.addEventListener('beforeinstallprompt', handler);
    window.addEventListener('appinstalled', () => setInstalled(true));
    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  if (installed) {
    return (
      <p className="text-sm text-[var(--text-secondary)] flex items-center gap-2">
        ✅ Uygulama ana ekranınıza yüklendi.
      </p>
    );
  }

  if (deferredPrompt) {
    return (
      <button
        type="button"
        onClick={async () => {
          await deferredPrompt.prompt();
          const choice = await deferredPrompt.userChoice;
          if (choice.outcome === 'accepted') setInstalled(true);
          setDeferredPrompt(null);
        }}
        className="flex items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-medium bg-gold-400/90 text-night-950 hover:bg-gold-300 transition self-start"
      >
        <Download className="h-4 w-4" />
        Uygulamayı Yükle
      </button>
    );
  }

  if (isIOS()) {
    return (
      <p className="text-sm text-[var(--text-secondary)] flex items-center gap-1.5 flex-wrap">
        <Share className="h-4 w-4 text-gold-300 shrink-0" /> Safari'de paylaş menüsünden
        <span className="font-medium text-[var(--text-primary)]">"Ana Ekrana Ekle"</span> seçeneğine dokunun.
      </p>
    );
  }

  return (
    <p className="text-sm text-[var(--text-muted)]">
      Tarayıcınızın menüsünden "Ana ekrana ekle" seçeneğini kullanabilirsiniz.
    </p>
  );
}
