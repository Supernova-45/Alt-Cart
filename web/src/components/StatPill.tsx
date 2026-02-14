interface StatPillProps {
  label: string;
  value?: string;
}

export function StatPill({ label, value }: StatPillProps) {
  if (!value) return null;
  return (
    <span className="stat-pill">
      {label}: {value}
    </span>
  );
}
