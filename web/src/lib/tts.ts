let lastSpokenText = "";
let currentRate = 1;
let currentVoiceName = "";

function splitIntoSentences(text: string): string[] {
  return text.split(/(?<=[.!?])\s+/).filter((s) => s.trim().length > 0);
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

  sentences.forEach((sentence) => {
    const u = new SpeechSynthesisUtterance(sentence);
    u.rate = currentRate;
    u.lang = "en-US";
    if (voice) u.voice = voice;
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
  }
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
