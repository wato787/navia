import { useMemo, useRef, useState, useCallback, useEffect, useEffectEvent } from "react";
import MapComponent, {
  GeolocateControl,
  NavigationControl,
  ScaleControl,
} from "react-map-gl/mapbox";
import "mapbox-gl/dist/mapbox-gl.css";
import { DestinationSearchBar } from "@/components/DestinationSearchBar";
import type { MapRef } from "react-map-gl/mapbox";

// 環境変数と定数はコンポーネント外で一度だけ評価される
const MAPBOX_TOKEN = import.meta.env.VITE_MAPBOX_ACCESS_TOKEN ?? "";
const INITIAL_VIEW_STATE = {
  longitude: 139.767125,
  latitude: 35.681236,
  zoom: 12,
} as const;

// マップのスタイルオブジェクトも定数として定義（毎回新しいオブジェクトを作成しない）
const MAP_STYLE = { width: "100%", height: "100%" } as const;
const MAPBOX_MAP_STYLE = "mapbox://styles/mapbox/streets-v12" as const;

// コントロールの設定も定数として定義
const NAVIGATION_CONTROL_PROPS = {
  position: "top-right" as const,
  visualizePitch: true,
};

const GEOLOCATE_CONTROL_PROPS = {
  position: "top-right" as const,
  trackUserLocation: true,
  showAccuracyCircle: false,
  positionOptions: { enableHighAccuracy: true } as const,
};

// Geocoding APIで住所を座標に変換
async function geocodeAddress(
  address: string,
  accessToken: string,
): Promise<[number, number] | null> {
  try {
    const url = `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(
      address,
    )}.json?access_token=${accessToken}&limit=1&country=JP`;
    const response = await fetch(url);
    const data = await response.json();
    if (data.features && data.features.length > 0) {
      const [lng, lat] = data.features[0].center;
      return [lng, lat];
    }
    return null;
  } catch (error) {
    console.error("Geocoding error:", error);
    return null;
  }
}

// Directions APIで経路を取得
async function getRoute(
  start: [number, number],
  end: [number, number],
  accessToken: string,
): Promise<GeoJSON.FeatureCollection | null> {
  try {
    const coordinates = `${start[0]},${start[1]};${end[0]},${end[1]}`;
    const url = `https://api.mapbox.com/directions/v5/mapbox/driving/${coordinates}?geometries=geojson&steps=true&access_token=${accessToken}`;
    const response = await fetch(url);
    const data = await response.json();
    if (data.routes && data.routes.length > 0) {
      const route = data.routes[0];
      return {
        type: "FeatureCollection",
        features: [
          {
            type: "Feature",
            properties: {},
            geometry: route.geometry,
          },
        ],
      };
    }
    return null;
  } catch (error) {
    console.error("Directions error:", error);
    return null;
  }
}

interface MapContentProps {
  mapRef: React.RefObject<MapRef | null>;
}

function MapContent({ mapRef }: MapContentProps) {
  const [currentLocation, setCurrentLocation] = useState<[number, number] | null>(
    null,
  );

  // geolocateイベントハンドラー（useEffectEventで最新のsetCurrentLocationにアクセス）
  const onGeolocate = useEffectEvent(
    (e: { coords: { longitude: number; latitude: number } }) => {
      const coords: [number, number] = [e.coords.longitude, e.coords.latitude];
      setCurrentLocation(coords);
    },
  );

  // mapのloadイベントでgeolocateイベントをリッスン
  const handleMapLoad = useCallback(() => {
    const map = mapRef.current?.getMap();
    if (!map) return;

    map.on("geolocate", onGeolocate);
  }, [mapRef, onGeolocate]);

  const displayRoute = useCallback(
    async (routeGeoJson: GeoJSON.FeatureCollection) => {
      const map = mapRef.current?.getMap();
      if (!map) return;

      // 既存の経路ソースがあれば削除
      if (map.getSource("route")) {
        if (map.getLayer("route")) {
          map.removeLayer("route");
        }
        map.removeSource("route");
      }

      // 新しい経路を追加
      map.addSource("route", {
        type: "geojson",
        data: routeGeoJson,
      });

      map.addLayer({
        id: "route",
        type: "line",
        source: "route",
        layout: {
          "line-join": "round",
          "line-cap": "round",
        },
        paint: {
          "line-color": "#3887be",
          "line-width": 5,
          "line-opacity": 0.75,
        },
      });

      // 経路全体が見えるようにカメラを調整
      const coordinates = routeGeoJson.features[0].geometry as GeoJSON.LineString;
      const bounds = coordinates.coordinates.reduce(
        (bounds, coord) => {
          return [
            [Math.min(bounds[0][0], coord[0]), Math.min(bounds[0][1], coord[1])],
            [Math.max(bounds[1][0], coord[0]), Math.max(bounds[1][1], coord[1])],
          ];
        },
        [
          [Infinity, Infinity],
          [-Infinity, -Infinity],
        ],
      );

      map.fitBounds(bounds as [[number, number], [number, number]], {
        padding: { top: 100, bottom: 100, left: 100, right: 100 },
      });
    },
    [mapRef],
  );

  const handleDestinationSearch = useCallback(
    async (destination: string) => {
      const map = mapRef.current?.getMap();
      if (!MAPBOX_TOKEN || !map) return;

      console.log("目的地:", destination);

      // 目的地を座標に変換
      const destinationCoords = await geocodeAddress(destination, MAPBOX_TOKEN);
      if (!destinationCoords) {
        alert("目的地が見つかりませんでした");
        return;
      }

      // 現在地が取得できていない場合は、初期位置を使用
      const startCoords = currentLocation || [
        INITIAL_VIEW_STATE.longitude,
        INITIAL_VIEW_STATE.latitude,
      ] as [number, number];

      // 経路を取得
      const route = await getRoute(startCoords, destinationCoords, MAPBOX_TOKEN);
      if (!route) {
        alert("経路を取得できませんでした");
        return;
      }

      // 経路を地図上に表示
      await displayRoute(route);
    },
    [currentLocation, mapRef, displayRoute],
  );

  // mapがロードされたときにイベントリスナーを設定
  useEffect(() => {
    const map = mapRef.current?.getMap();
    if (map && map.loaded()) {
      handleMapLoad();
      return () => {
        map.off("geolocate", onGeolocate);
      };
    } else if (map) {
      map.on("load", handleMapLoad);
      return () => {
        map.off("load", handleMapLoad);
        map.off("geolocate", onGeolocate);
      };
    }
  }, [handleMapLoad, onGeolocate, mapRef]);

  return (
    <>
      <DestinationSearchBar onSearch={handleDestinationSearch} />
      <GeolocateControl {...GEOLOCATE_CONTROL_PROPS} />
    </>
  );
}

export default function Index() {
  const mapRef = useRef<MapRef>(null);

  // コントロールコンポーネントをメモ化（再レンダリング時に再作成を防ぐ）
  const navigationControl = useMemo(
    () => <NavigationControl {...NAVIGATION_CONTROL_PROPS} />,
    [],
  );

  const scaleControl = useMemo(
    () => <ScaleControl unit="metric" />,
    [],
  );

  if (!MAPBOX_TOKEN) {
    return (
      <div className="relative w-screen h-screen">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white/92 text-slate-800 px-8 py-6 rounded-xl shadow-[0_20px_45px_rgba(15,23,42,0.18)] max-w-80 text-center leading-relaxed font-medium">
          Mapbox??????????????VITE_MAPBOX_ACCESS_TOKEN??????????
        </div>
      </div>
    );
  }

  return (
    <div className="relative w-screen h-screen">
      <MapComponent
        ref={mapRef}
        mapboxAccessToken={MAPBOX_TOKEN}
        initialViewState={INITIAL_VIEW_STATE}
        style={MAP_STYLE}
        mapStyle={MAPBOX_MAP_STYLE}
        pitchWithRotate={true}
        attributionControl={true}
      >
        {navigationControl}
        <MapContent mapRef={mapRef} />
        {scaleControl}
      </MapComponent>
    </div>
  );
}
