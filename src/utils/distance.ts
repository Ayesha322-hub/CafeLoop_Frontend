export interface CafeWithLocation {
  latitude?: number | null;
  longitude?: number | null;
  [key: string]: any;
}

// Distance between two lat/lng points in kilometers (Haversine formula)
export function haversineKm(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

// Attaches distanceKm to each cafe, filters by radius, sorts nearest first
export function sortCafesByDistance(
  cafes: CafeWithLocation[],
  userLat: number,
  userLng: number,
  radiusKm: number
): CafeWithLocation[] {
  const result: CafeWithLocation[] = [];

  for (const cafe of cafes) {
    if (cafe.latitude == null || cafe.longitude == null) continue;
    const distanceKm = Math.round(haversineKm(userLat, userLng, cafe.latitude, cafe.longitude) * 10) / 10;
    if (distanceKm <= radiusKm) {
      result.push({ ...cafe, distanceKm });
    }
  }

  result.sort((a, b) => a.distanceKm - b.distanceKm);
  return result;
}