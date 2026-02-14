interface SectionCardProps {
  id: string;
  title: string;
  children: React.ReactNode;
  readText?: string;
  onReadSection?: () => void;
}

export function SectionCard({
  id,
  title,
  children,
  readText,
  onReadSection,
}: SectionCardProps) {
  return (
    <section
      className="section-card"
      aria-labelledby={`${id}-heading`}
    >
      <div className="section-card__header">
        <h2 id={`${id}-heading`} className="section-card__title">
          {title}
        </h2>
        {readText != null && onReadSection != null && (
          <button
            type="button"
            className="read-section-btn"
            onClick={onReadSection}
            aria-label={`Read ${title} section`}
          >
            Read this section
          </button>
        )}
      </div>
      {children}
    </section>
  );
}
