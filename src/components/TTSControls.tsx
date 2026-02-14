import { useState, useEffect } from "react";
import { isTTSSupported, speak, pause, resume, cancel, repeatLast, setRate, getRate, isSpeaking, isPaused } from "../lib/tts";

interface TTSControlsProps {
  summaryText: string;
  disabled?: boolean;
}

export function TTSControls({ summaryText, disabled }: TTSControlsProps) {
  const [supported] = useState(isTTSSupported);
  const [speaking, setSpeaking] = useState(false);
  const [paused, setPaused] = useState(false);
  const [rate, setRateState] = useState(getRate());

  useEffect(() => {
    if (!supported) return;
    const check = () => {
      setSpeaking(isSpeaking());
      setPaused(isPaused());
    };
    const id = setInterval(check, 200);
    return () => clearInterval(id);
  }, [supported]);

  const handlePlay = () => {
    if (!supported || disabled) return;
    speak(summaryText, { interrupt: true });
    setSpeaking(true);
    setPaused(false);
  };

  const handlePauseResume = () => {
    if (!supported || disabled) return;
    if (paused) {
      resume();
      setPaused(false);
    } else {
      pause();
      setPaused(true);
    }
  };

  const handleRepeat = () => {
    if (!supported || disabled) return;
    repeatLast();
  };

  const handleStop = () => {
    if (!supported || disabled) return;
    cancel();
    setSpeaking(false);
    setPaused(false);
  };

  const handleRateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const v = parseFloat(e.target.value);
    setRate(v);
    setRateState(v);
  };

  if (!supported) {
    return (
      <div className="tts-banner" role="alert">
        Text-to-speech is not supported in this browser. TTS controls are disabled.
      </div>
    );
  }

  return (
    <div className="tts-controls" role="group" aria-label="Text-to-speech controls">
      <button
        type="button"
        className="tts-controls__btn"
        onClick={handlePlay}
        disabled={disabled}
        aria-label="Play summary"
      >
        Play summary
      </button>
      <button
        type="button"
        className="tts-controls__btn"
        onClick={handlePauseResume}
        disabled={disabled || !speaking}
        aria-label={paused ? "Resume" : "Pause"}
      >
        {paused ? "Resume" : "Pause"}
      </button>
      <button
        type="button"
        className="tts-controls__btn"
        onClick={handleRepeat}
        disabled={disabled}
        aria-label="Repeat last"
      >
        Repeat last
      </button>
      <button
        type="button"
        className="tts-controls__btn"
        onClick={handleStop}
        disabled={disabled || !speaking}
        aria-label="Stop"
      >
        Stop
      </button>
      <div className="tts-controls__speed">
        <label htmlFor="tts-speed">Speed</label>
        <input
          id="tts-speed"
          type="range"
          min="0.8"
          max="1.4"
          step="0.1"
          value={rate}
          onChange={handleRateChange}
          aria-label="Speech rate"
        />
      </div>
    </div>
  );
}
