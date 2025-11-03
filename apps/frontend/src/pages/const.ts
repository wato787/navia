// IndexPage用のMapbox設定

// Mapbox設定
export const MAPBOX_TOKEN = import.meta.env.VITE_MAPBOX_ACCESS_TOKEN ?? "";

// Backend API設定
export const BACKEND_API_URL =
  import.meta.env.VITE_BACKEND_API_URL ?? "http://localhost:8787";

// 初期ビュー状態（東京駅付近）
export const INITIAL_VIEW_STATE = {
  longitude: 139.767125,
  latitude: 35.681236,
  zoom: 12,
} as const;

// マップのスタイル
export const MAP_STYLE = { width: "100%", height: "100%" } as const;
export const MAPBOX_MAP_STYLE = "mapbox://styles/mapbox/streets-v12" as const;

// コントロールの設定
export const NAVIGATION_CONTROL_PROPS = {
  position: "top-right" as const,
  visualizePitch: true,
} as const;

export const GEOLOCATE_CONTROL_PROPS = {
  position: "top-right" as const,
  trackUserLocation: true,
  showAccuracyCircle: false,
  positionOptions: { enableHighAccuracy: true } as const,
} as const;

// 経路レイヤーの設定
export const ROUTE_LAYER_CONFIG = {
  id: "route",
  type: "line" as const,
  layout: {
    "line-join": "round" as const,
    "line-cap": "round" as const,
  },
  paint: {
    "line-color": "#3887be",
    "line-width": 5,
    "line-opacity": 0.75,
  },
} as const;

// カメラ調整のパディング
export const FIT_BOUNDS_PADDING = {
  top: 100,
  bottom: 100,
  left: 100,
  right: 100,
} as const;
