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
