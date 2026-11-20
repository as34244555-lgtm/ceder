import { ChevronLeft } from 'lucide-react';

interface SubScreenHeaderProps {
  title: string;
  onBack: () => void;
}

export function SubScreenHeader({ title, onBack }: SubScreenHeaderProps) {
  return (
    <div className="w-full flex items-center gap-2 -mb-1">
      <button
        type="button"
        onClick={onBack}
        className="flex items-center gap-1 text-sm text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition"
      >
        <ChevronLeft className="h-4 w-4" />
        Daha
      </button>
      <span className="text-[var(--text-muted)]">/</span>
      <span className="text-sm font-medium text-[var(--text-primary)]">{title}</span>
    </div>
  );
}
