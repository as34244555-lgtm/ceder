/**
 * Namaz vakti girdiğinde çalınacak sesler: kısa sentetik bir nağme (Web Audio
 * ile üretilir) veya CC0/CC-BY-SA lisanslı gerçek bir ezan kaydı (public/audio).
 */
import { getAdhanSound } from '../data/adhanSounds';
import type { AdhanSoundId } from '../types';

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

let adhanAudio: HTMLAudioElement | null = null;
let adhanUnlocked = false;

function ensureAdhanAudio(): HTMLAudioElement {
  if (!adhanAudio) {
    adhanAudio = new Audio();
    adhanAudio.preload = 'auto';
  }
  return adhanAudio;
}

/**
 * Mobil tarayıcılarda (özellikle iOS Safari) `<audio>` elemanları, kullanıcı
 * etkileşimi olmadan başlatılan oynatmaları engelleyebilir veya bir anlığına
 * başlatıp hemen durdurabilir (bu da "sadece ilk kelimeyi duyma" hissi verir).
 * Bu fonksiyon, kullanıcının uygulamadaki ilk dokunuşunda sessizce çağrılarak
 * ses öğesini "kilidini açar"; böylece daha sonra bir ezan vakti otomatik
 * olarak tetiklendiğinde oynatma güvenilir şekilde çalışır.
 */
export function unlockAdhanAudio() {
  if (adhanUnlocked) return;
  adhanUnlocked = true;
  try {
    const audio = ensureAdhanAudio();
    audio.src = getAdhanSound('ses1').fullSrc;
    audio.muted = true;
    audio.volume = 0;
    const playPromise = audio.play();
    if (playPromise && typeof playPromise.then === 'function') {
      playPromise
        .then(() => {
          audio.pause();
          audio.currentTime = 0;
          audio.muted = false;
          audio.volume = 1;
        })
        .catch(() => {
          adhanUnlocked = false;
        });
    }
  } catch {
    adhanUnlocked = false;
  }
}

function setMediaSessionMetadata(title: string) {
  if (typeof navigator === 'undefined' || !('mediaSession' in navigator)) return;
  try {
    navigator.mediaSession.metadata = new MediaMetadata({
      title,
      artist: 'Ezan Vakti',
      album: 'Namaz Vakitleri',
    });
  } catch {
    // Bazı tarayıcılar MediaMetadata'yı desteklemeyebilir.
  }
}

/** Gerçek ezan kaydını çalar; başarısız olursa kısa nağmeye düşer. */
export function playFullAdhan(preview = false, title = 'Ezan', soundId: AdhanSoundId = 'ses1') {
  try {
    const audio = ensureAdhanAudio();
    const sound = getAdhanSound(soundId);
    const src = preview ? sound.previewSrc : sound.fullSrc;
    if (!audio.src.endsWith(src)) audio.src = src;
    audio.muted = false;
    audio.volume = 1;
    audio.currentTime = 0;
    setMediaSessionMetadata(title);

    const playPromise = audio.play();
    if (playPromise && typeof playPromise.catch === 'function') {
      playPromise.catch(() => {
        // Tarayıcı otomatik oynatmayı engelledi; en azından sentetik bir
        // uyarı sesi çalarak kullanıcıyı vaktin girdiğinden haberdar et.
        playPrayerChime();
      });
    }
  } catch {
    playPrayerChime();
  }
}

export function stopFullAdhan() {
  if (adhanAudio) {
    adhanAudio.pause();
    adhanAudio.currentTime = 0;
  }
}
