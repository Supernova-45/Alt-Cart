interface HelpButtonProps {
  onClick: () => void;
}

export function HelpButton({ onClick }: HelpButtonProps) {
  return (
    <button
      type="button"
      className="help-fab"
      onClick={onClick}
      aria-label="Help. Press Alt and question mark to open or close."
      title="Help (Alt + ?)"
    >
      <span className="help-fab__icon" aria-hidden>
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="10" />
          <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
          <line x1="12" y1="17" x2="12.01" y2="17" />
        </svg>
      </span>
    </button>
  );
}
