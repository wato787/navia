import { useCallback, useState } from "react";

/**
 * 現在地を管理するフック
 * GeolocateControlのイベントをリッスンして現在地を更新します
 */
export function useCurrentLocation() {
  const [currentLocation, setCurrentLocation] = useState<{
    lat: number;
    lng: number;
  } | null>(null);

  // geolocateイベントハンドラー（useEffectEventで最新のsetCurrentLocationにアクセス）
  const handleGeolocate = useCallback((e: GeolocationPosition) => {
    const { latitude, longitude } = e.coords;
    setCurrentLocation({ lat: latitude, lng: longitude });
    console.log("現在地:", latitude, longitude);
  }, []);

  return { currentLocation, handleGeolocate };
}
