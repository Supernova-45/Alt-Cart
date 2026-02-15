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
      <span className="help-fab__icon" aria-hidden>?</span>
    </button>
  );
}
