let lastSpokenText = "";
let currentRate = 1;
let currentVoiceName = "";

export function splitIntoSentences(text: string): string[] {
  return text.split(/(?<=[.!?])\s+/).filter((s) => s.trim().length > 0);
}

const TTS_PROGRESS_EVENT = "tts-progress";

export interface TTSProgressDetail {
  text: string;
  sentenceIndex: number;
  totalSentences: number;
}

function emitProgress(text: string, sentenceIndex: number, totalSentences: number): void {
  if (typeof window === "undefined") return;
  window.dispatchEvent(
    new CustomEvent<TTSProgressDetail>(TTS_PROGRESS_EVENT, {
      detail: { text, sentenceIndex, totalSentences },
    })
  );
}

function findVoiceByName(name: string): SpeechSynthesisVoice | null {
  if (!isTTSSupported() || !name) return null;
  const voices = window.speechSynthesis.getVoices();
  return voices.find((v) => v.name === name) ?? null;
}

export function isTTSSupported(): boolean {
  return typeof window !== "undefined" && "speechSynthesis" in window;
}

export function getAvailableVoices(): SpeechSynthesisVoice[] {
  if (!isTTSSupported()) return [];
  const voices = window.speechSynthesis.getVoices();
  return voices.filter((v) => v.lang.startsWith("en"));
}

export function setVoice(voiceName: string): void {
  currentVoiceName = voiceName ?? "";
}

export function getVoice(): string {
  return currentVoiceName;
}

export function speak(text: string, options: { interrupt?: boolean } = {}): void {
  const { interrupt = true } = options;
  if (!isTTSSupported()) return;

  if (interrupt) {
    window.speechSynthesis.cancel();
  }

  lastSpokenText = text;
  const sentences = splitIntoSentences(text);
  const voice = currentVoiceName ? findVoiceByName(currentVoiceName) : null;
  const total = sentences.length;

  if (total === 0) {
    emitProgress("", -1, 0);
    return;
  }

  sentences.forEach((sentence, i) => {
    const u = new SpeechSynthesisUtterance(sentence);
    u.rate = currentRate;
    u.lang = "en-US";
    if (voice) u.voice = voice;
    u.onstart = () => emitProgress(text, i, total);
    u.onend = () => {
      if (i === total - 1) emitProgress("", -1, total);
    };
    u.onerror = () => {
      emitProgress("", -1, total);
    };
    window.speechSynthesis.speak(u);
  });
}

export function pause(): void {
  if (isTTSSupported()) {
    window.speechSynthesis.pause();
  }
}

export function resume(): void {
  if (isTTSSupported()) {
    window.speechSynthesis.resume();
  }
}

export function cancel(): void {
  if (isTTSSupported()) {
    window.speechSynthesis.cancel();
    emitProgress("", -1, 0);
  }
}

export function onTTSProgress(callback: (detail: TTSProgressDetail) => void): () => void {
  if (typeof window === "undefined") return () => {};
  const handler = (e: Event) => callback((e as CustomEvent<TTSProgressDetail>).detail);
  window.addEventListener(TTS_PROGRESS_EVENT, handler);
  return () => window.removeEventListener(TTS_PROGRESS_EVENT, handler);
}

export function setRate(rate: number): void {
  currentRate = Math.max(0.8, Math.min(1.4, rate));
}

export function getRate(): number {
  return currentRate;
}

export function repeatLast(): void {
  if (lastSpokenText) {
    speak(lastSpokenText, { interrupt: true });
  }
}

export function isSpeaking(): boolean {
  return isTTSSupported() && window.speechSynthesis.speaking;
}

export function isPaused(): boolean {
  return isTTSSupported() && window.speechSynthesis.paused;
}
