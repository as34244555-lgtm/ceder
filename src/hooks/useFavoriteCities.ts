import { useCallback, useState } from 'react';
import { loadFavoriteCities, saveFavoriteCities } from '../utils/storage';
import type { FavoriteCity } from '../types';

export function useFavoriteCities() {
  const [favorites, setFavorites] = useState<FavoriteCity[]>(() => loadFavoriteCities());

  const isFavorite = useCallback(
    (city: string, country: string) =>
      favorites.some((f) => f.city === city && f.country === country),
    [favorites],
  );

  const addFavorite = useCallback((city: string, country: string, label: string) => {
    setFavorites((prev) => {
      if (prev.some((f) => f.city === city && f.country === country)) return prev;
      const next = [...prev, { id: `${city}-${country}-${Date.now()}`, city, country, label }];
      saveFavoriteCities(next);
      return next;
    });
  }, []);

  const removeFavorite = useCallback((id: string) => {
    setFavorites((prev) => {
      const next = prev.filter((f) => f.id !== id);
      saveFavoriteCities(next);
      return next;
    });
  }, []);

  const toggleFavorite = useCallback(
    (city: string, country: string, label: string) => {
      const existing = favorites.find((f) => f.city === city && f.country === country);
      if (existing) removeFavorite(existing.id);
      else addFavorite(city, country, label);
    },
    [favorites, addFavorite, removeFavorite],
  );

  return { favorites, isFavorite, addFavorite, removeFavorite, toggleFavorite };
}
