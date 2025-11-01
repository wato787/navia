import { useMemo } from "react";
import MapComponent, {
  GeolocateControl,
  NavigationControl,
  ScaleControl,
} from "react-map-gl/mapbox";
import "mapbox-gl/dist/mapbox-gl.css";

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

export default function Index() {
  // コントロールコンポーネントをメモ化（再レンダリング時に再作成を防ぐ）
  const navigationControl = useMemo(
    () => <NavigationControl {...NAVIGATION_CONTROL_PROPS} />,
    [],
  );

  const geolocateControl = useMemo(
    () => <GeolocateControl {...GEOLOCATE_CONTROL_PROPS} />,
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
        mapboxAccessToken={MAPBOX_TOKEN}
        initialViewState={INITIAL_VIEW_STATE}
        style={MAP_STYLE}
        mapStyle={MAPBOX_MAP_STYLE}
        pitchWithRotate={true}
        attributionControl={true}
      >
        {navigationControl}
        {geolocateControl}
        {scaleControl}
      </MapComponent>
    </div>
  );
}
