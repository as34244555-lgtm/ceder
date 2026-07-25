/**
 * Namaz vakti girdiğinde çalınacak nazik bir uyarı melodisi.
 *
 * Telif hakkı içeren gerçek bir ezan kaydı yerleştirmek yerine, Web Audio API
 * ile kısa ve hoş bir "çan/nağme" tonu üretiyoruz. İsterseniz kendi ezan ses
 * dosyanızı `public/adhan.mp3` olarak ekleyip `playCustomAdhan` fonksiyonunu
 * kullanabilirsiniz.
 */

let audioContext: AudioContext | null = null;

function getAudioContext(): AudioContext {
  if (!audioContext) {
    audioContext = new (window.AudioContext ||
      (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
  }
  return audioContext;
}

function tone(
  ctx: AudioContext,
  frequency: number,
  startTime: number,
  duration: number,
  volume = 0.18,
) {
  const oscillator = ctx.createOscillator();
  const gain = ctx.createGain();
  oscillator.type = 'sine';
  oscillator.frequency.value = frequency;

  gain.gain.setValueAtTime(0, startTime);
  gain.gain.linearRampToValueAtTime(volume, startTime + 0.05);
  gain.gain.exponentialRampToValueAtTime(0.0001, startTime + duration);

  oscillator.connect(gain);
  gain.connect(ctx.destination);

  oscillator.start(startTime);
  oscillator.stop(startTime + duration + 0.05);
}

/** Vakit girdiğinde çalınan hoş bir çıngırak melodisi. */
export function playPrayerChime() {
  try {
    const ctx = getAudioContext();
    if (ctx.state === 'suspended') void ctx.resume();
    const now = ctx.currentTime;
    const notes = [523.25, 659.25, 783.99, 1046.5]; // C5 E5 G5 C6
    notes.forEach((freq, i) => tone(ctx, freq, now + i * 0.22, 0.9));
  } catch {
    // Sessizce yoksay: ses çalınamadı (tarayıcı desteği yok gibi durumlar).
  }
}

/** Kısa bir "tık" sesi; hatırlatma bildirimlerinde kullanılır. */
export function playReminderPing() {
  try {
    const ctx = getAudioContext();
    if (ctx.state === 'suspended') void ctx.resume();
    const now = ctx.currentTime;
    tone(ctx, 880, now, 0.35, 0.14);
    tone(ctx, 1320, now + 0.15, 0.4, 0.12);
  } catch {
    // yoksay
  }
}

/** Kullanıcı etkileşimi ile AudioContext'i "unlock" etmek için. */
export function primeAudio() {
  try {
    const ctx = getAudioContext();
    if (ctx.state === 'suspended') void ctx.resume();
  } catch {
    // yoksay
  }
}
