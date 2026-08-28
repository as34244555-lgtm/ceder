import { Star, X } from 'lucide-react';
import type { FavoriteCity } from '../types';

interface FavoriteCitiesBarProps {
  favorites: FavoriteCity[];
  activeCity: string;
  isCurrentFavorite: boolean;
  onSelect: (city: string, country: string) => void;
  onToggleCurrent: () => void;
  onRemove: (id: string) => void;
}

export function FavoriteCitiesBar({
  favorites,
  activeCity,
  isCurrentFavorite,
  onSelect,
  onToggleCurrent,
  onRemove,
}: FavoriteCitiesBarProps) {
  return (
    <div className="flex items-center gap-2 w-full overflow-x-auto pb-1 -mb-1">
      <button
        type="button"
        onClick={onToggleCurrent}
        className={`flex items-center gap-1.5 shrink-0 rounded-full px-3 py-1.5 text-xs font-medium border transition ${
          isCurrentFavorite
            ? 'bg-gold-400/20 border-gold-400/40 text-gold-300'
            : 'bg-[var(--surface-soft)] border-[var(--border-soft)] text-[var(--text-muted)] hover:text-[var(--text-secondary)]'
        }`}
      >
        <Star className="h-3.5 w-3.5" fill={isCurrentFavorite ? 'currentColor' : 'none'} />
        {isCurrentFavorite ? 'Favorilerde' : 'Favorilere ekle'}
      </button>

      {favorites.map((fav) => (
        <button
          key={fav.id}
          type="button"
          onClick={() => onSelect(fav.city, fav.country)}
          className={`group flex items-center gap-1.5 shrink-0 rounded-full pl-3 pr-1.5 py-1.5 text-xs font-medium border transition ${
            fav.city === activeCity
              ? 'bg-gold-400/90 border-gold-400/90 text-night-950'
              : 'bg-[var(--surface-soft)] border-[var(--border-soft)] text-[var(--text-secondary)] hover:bg-[var(--surface-soft-strong)]'
          }`}
        >
          {fav.label}
          <span
            role="button"
            tabIndex={-1}
            onClick={(e) => {
              e.stopPropagation();
              onRemove(fav.id);
            }}
            className="rounded-full p-0.5 opacity-60 hover:opacity-100"
            aria-label={`${fav.label} favorilerden kaldır`}
          >
            <X className="h-3 w-3" />
          </span>
        </button>
      ))}
    </div>
  );
}
