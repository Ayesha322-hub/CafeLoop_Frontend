import { useCallback, useEffect, useState } from 'react';
import * as Location from 'expo-location';

export interface UserLocation {
  latitude: number;
  longitude: number;
  /** Short human readable label, e.g. "Gulberg, Lahore" */
  label: string;
}

interface UseLocationResult {
  location: UserLocation | null;
  loading: boolean;
  /** 'granted' | 'denied' | 'undetermined' */
  permissionStatus: Location.PermissionStatus | null;
  error: string | null;
  /** True if the current location came from manual search rather than GPS */
  isManual: boolean;
  refresh: () => Promise<void>;
  setManualLocation: (location: UserLocation) => void;
}

/**
 * Requests foreground location permission, fetches the device's GPS
 * coordinates, and reverse-geocodes them into a short "Area, City" label
 * using Expo's built-in geocoding (no Google Maps API key required).
 * Also allows the location to be overridden manually (e.g. via search).
 */
export function useLocation(): UseLocationResult {
  const [location, setLocation] = useState<UserLocation | null>(null);
  const [loading, setLoading] = useState(true);
  const [permissionStatus, setPermissionStatus] =
    useState<Location.PermissionStatus | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isManual, setIsManual] = useState(false);

  const fetchLocation = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      setPermissionStatus(status);

      if (status !== Location.PermissionStatus.GRANTED) {
        setError('Location permission denied');
        setLocation(null);
        return;
      }

      const position = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });

      const { latitude, longitude } = position.coords;

      let label = 'Current location';
      try {
        const [place] = await Location.reverseGeocodeAsync({ latitude, longitude });
        if (place) {
          const area = place.district || place.subregion || place.street || place.name;
          const city = place.city || place.region;
          label = [area, city].filter(Boolean).join(', ') || label;
        }
      } catch {
        // Reverse geocoding can fail (e.g. offline) — fall back to default label.
      }

      setIsManual(false);
      setLocation({ latitude, longitude, label });
    } catch (err: any) {
      setError(err?.message || 'Could not get location');
      setLocation(null);
    } finally {
      setLoading(false);
    }
  }, []);

  const setManualLocation = useCallback((loc: UserLocation) => {
    setIsManual(true);
    setError(null);
    setLocation(loc);
  }, []);

  useEffect(() => {
    fetchLocation();
  }, [fetchLocation]);

  return {
    location,
    loading,
    permissionStatus,
    error,
    isManual,
    refresh: fetchLocation,
    setManualLocation,
  };
}