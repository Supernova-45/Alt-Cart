export function SkipLink({ targetId = "content" }: { targetId?: string }) {
  return (
    <a href={`#${targetId}`} className="skip-link">
      Skip to main content
    </a>
  );
}
