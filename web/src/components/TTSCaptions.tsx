import { useState, useEffect } from "react";
import { onTTSProgress, splitIntoSentences } from "../lib/tts";

interface TTSCaptionsProps {
  enabled: boolean;
}

export function TTSCaptions({ enabled }: TTSCaptionsProps) {
  const [detail, setDetail] = useState<{ text: string; sentenceIndex: number; totalSentences: number } | null>(null);

  useEffect(() => {
    return onTTSProgress((d) => {
      setDetail(d.sentenceIndex >= 0 ? d : null);
    });
  }, []);

  if (!enabled || !detail || !detail.text) return null;

  const sentences = splitIntoSentences(detail.text);

  return (
    <div
      className="tts-captions"
      role="status"
      aria-live="polite"
      aria-atomic="false"
    >
      <div className="tts-captions__content">
        {sentences.map((sentence, i) => (
          <span
            key={i}
            className={
              i === detail.sentenceIndex
                ? "tts-captions__sentence tts-captions__sentence--active"
                : "tts-captions__sentence"
            }
          >
            {sentence}
            {i < sentences.length - 1 ? " " : ""}
          </span>
        ))}
      </div>
    </div>
  );
}
