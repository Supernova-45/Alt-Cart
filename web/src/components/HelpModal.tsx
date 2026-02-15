import { useEffect, useRef } from "react";
import { speak, cancel } from "../lib/tts";

const HELP_INSTRUCTIONS = `Welcome to alt+cart. Here's what you can do:

Search for products by entering a search term and store, or paste a product or search URL from Amazon, Walmart, eBay, Target, or Macy's.

Open a product passport to see detailed information including fit analysis, return risk, sustainability, and image descriptions.

Use the text-to-speech controls to hear summaries and sections read aloud. Each section has a "Read this section" button.

On search results, click Compare to enter compare mode, select 2–3 products, then click Compare to view your spoken comparison.

Use the Preferences page to customize font, font size, TTS voice, reduced motion, and more.

Toggle dark mode and low vision mode from the Preferences page.

Keyboard shortcuts: Alt + ? for help. Tab and Shift+Tab to move focus. Enter to activate. Space to stop TTS. P to play or pause TTS. R to repeat. H for home. C for compare when you have items.`;

interface HelpModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function HelpModal({ isOpen, onClose }: HelpModalProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (isOpen) {
      dialog.showModal();
      speak(HELP_INSTRUCTIONS, { interrupt: true });
    } else {
      cancel();
      dialog.close();
    }
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.altKey && (e.key === "?" || e.key === "/" || e.code === "Slash")) {
        e.preventDefault();
        onClose();
      }
      if (e.key === "Escape") {
        e.preventDefault();
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  return (
    <dialog
      ref={dialogRef}
      className="help-modal"
      aria-labelledby="help-title"
      aria-describedby="help-content"
      onCancel={(e) => {
        e.preventDefault();
        onClose();
      }}
    >
      <div className="help-modal__inner">
        <h2 id="help-title" className="help-modal__title">
          Help
        </h2>
        <div id="help-content" className="help-modal__content">
          <p>Here&apos;s what you can do in alt+cart:</p>
          <ul>
            <li>
              <strong>Search</strong> – Enter a search term and store, or paste a product or search URL (from Amazon,
              Walmart, eBay, Target, Macy&apos;s, etc.).
            </li>
            <li>
              <strong>Product passports</strong> – Open a product to see fit analysis, return risk, sustainability, and
              image descriptions.
            </li>
            <li>
              <strong>Text-to-speech</strong> – Use Play, Pause, Repeat, and Stop.
            </li>
            <li>
              <strong>Compare</strong> – On search results, click Compare and select 2–3 products,
then click Compare to view.
            </li>
            <li>
              <strong>Preferences</strong> – Customize font, font size, TTS voice, reduced motion, and more.
            </li>
            <li>
              <strong>Dark mode &amp; low vision</strong> – Toggle from the Preferences page.
            </li>
          </ul>
          <div className="help-modal__shortcuts-box">
            <h3 className="help-modal__shortcuts-title">
              Keyboard shortcuts
            </h3>
            <dl className="help-modal__shortcuts">
            <dt>Tab / ⇧ + Tab</dt>
            <dd>Move focus forward or backward</dd>
            <dt>Enter</dt>
            <dd>Activate focused link or button</dd>
            <dt>⌥ + ?</dt>
            <dd>Open or close help</dd>
            <dt>Space</dt>
            <dd>Stop audio when TTS is playing</dd>
            <dt>P</dt>
            <dd>Play or pause TTS</dd>
            <dt>R</dt>
            <dd>Repeat last spoken text</dd>
            <dt>H</dt>
            <dd>Go home</dd>
            <dt>C</dt>
            <dd>View compared items</dd>
            <dt>⌥</dt>
            <dd>Hover over product and press Alt to hear description</dd>
            <dt>Space</dt>
            <dd>Focus on product and press Space to hear description</dd>
            <dt>Esc</dt>
            <dd>Close help</dd>
          </dl>
          </div>
        </div>
        <div className="help-modal__actions">
          <button
            type="button"
            className="help-modal__close"
            onClick={onClose}
            aria-label="Close help"
          >
            Close (⌥ + ?)
          </button>
        </div>
      </div>
    </dialog>
  );
}
