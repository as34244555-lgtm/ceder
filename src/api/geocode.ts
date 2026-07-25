export interface GeocodedCoords {
  latitude: number;
  longitude: number;
}

/**
 * Şehir + ülke adını yaklaşık koordinata çevirir (kıble hesaplaması gibi konum
 * bazlı ama hassas GPS gerektirmeyen ihtiyaçlar için). Kıble açısı, birkaç
 * kilometrelik farklardan pratikte etkilenmediği için en iyi eşleşen sonuç
 * (nüfusa göre sıralanan ilk sonuç) yeterlidir.
 */
export async function geocodeCity(city: string, country?: string): Promise<GeocodedCoords | null> {
  try {
    const url = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(
      city,
    )}&count=8&language=tr&format=json`;
    const res = await fetch(url);
    if (!res.ok) return null;
    const json = await res.json();
    const results: Array<{ latitude: number; longitude: number; country?: string; country_code?: string }> =
      json.results ?? [];
    if (results.length === 0) return null;

    if (country) {
      const normalizedCountry = country.trim().toLowerCase();
      const match = results.find((r) => {
        const rCountry = r.country?.toLowerCase() ?? '';
        const rCode = r.country_code?.toLowerCase() ?? '';
        return (
          rCountry.includes(normalizedCountry) ||
          normalizedCountry.includes(rCountry) ||
          rCode === normalizedCountry.slice(0, 2) ||
          (normalizedCountry === 'turkey' && rCode === 'tr')
        );
      });
      if (match) return { latitude: match.latitude, longitude: match.longitude };
    }

    return { latitude: results[0].latitude, longitude: results[0].longitude };
  } catch {
    return null;
  }
}

export async function reverseGeocodeLabel(latitude: number, longitude: number): Promise<string> {
  try {
    const url = `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${latitude}&longitude=${longitude}&localityLanguage=tr`;
    const res = await fetch(url);
    if (!res.ok) throw new Error('geocode failed');
    const json = await res.json();
    const city: string | undefined = json.city || json.locality || json.principalSubdivision;
    return city ?? 'Konumunuz';
  } catch {
    return 'Konumunuz';
  }
}
