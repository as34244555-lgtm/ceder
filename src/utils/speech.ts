/** Tarayıcı / WebView Türkçe sesli duyuru (Speech Synthesis). */

export function speakPrayerMessage(text: string) {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;
  try {
    window.speechSynthesis.cancel();
    const utter = new SpeechSynthesisUtterance(text);
    utter.lang = 'tr-TR';
    utter.rate = 0.92;
    utter.pitch = 1;
    utter.volume = 1;

    const voices = window.speechSynthesis.getVoices();
    const tr =
      voices.find((v) => v.lang.toLowerCase().startsWith('tr')) ??
      voices.find((v) => /turk|türk/i.test(v.name));
    if (tr) utter.voice = tr;

    window.speechSynthesis.speak(utter);
  } catch {
    // Sesli duyuru desteklenmiyor olabilir
  }
}

export function stopSpeech() {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;
  try {
    window.speechSynthesis.cancel();
  } catch {
    // yoksay
  }
}

export function prayerEnteredSpeech(label: string): string {
  return `${label} namazı vakti girdi. Allah kabul etsin. Namazınızı kıldınız mı?`;
}

export function prayerReminderSpeech(label: string, minutes: number): string {
  return `${label} namazına ${minutes} dakika kaldı. Hazırlığınızı yapabilirsiniz.`;
}
