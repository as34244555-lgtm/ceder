/**
 * Namaz vakti sesleri: sentetik nağme veya yüksek kaliteli ezan kayıtları.
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

export function playPrayerChime() {
  try {
    const ctx = getAudioContext();
    if (ctx.state === 'suspended') void ctx.resume();
    const now = ctx.currentTime;
    const notes = [523.25, 659.25, 783.99, 1046.5];
    notes.forEach((freq, i) => tone(ctx, freq, now + i * 0.22, 0.9));
  } catch {
    // yoksay
  }
}

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

/** Mobil tarayıcılarda otomatik oynatma kilidini kullanıcı dokunuşunda açar. */
export function unlockAdhanAudio() {
  if (adhanUnlocked) return;
  adhanUnlocked = true;
  try {
    const audio = ensureAdhanAudio();
    const sound = getAdhanSound('makkah');
    audio.src = sound.previewSrc;
    audio.muted = true;
    audio.volume = 0;
    const p = audio.play();
    if (p && typeof p.then === 'function') {
      void p
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
    // yoksay
  }
}

/** Gerçek ezan kaydını çalar; başarısız olursa kısa nağmeye düşer. */
export function playFullAdhan(
  preview = false,
  title = 'Ezan',
  soundId: AdhanSoundId = 'makkah',
) {
  try {
    const audio = ensureAdhanAudio();
    const sound = getAdhanSound(soundId);
    const src = preview ? sound.previewSrc : sound.fullSrc;
    const absolute = new URL(src, window.location.href).href;
    if (audio.src !== absolute) audio.src = src;
    audio.muted = false;
    audio.volume = 1;
    audio.currentTime = 0;
    setMediaSessionMetadata(title);

    const playPromise = audio.play();
    if (playPromise && typeof playPromise.catch === 'function') {
      playPromise.catch(() => {
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
