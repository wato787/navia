import MapComponent, {
  GeolocateControl,
  NavigationControl,
  ScaleControl,
} from "react-map-gl/mapbox";
import "mapbox-gl/dist/mapbox-gl.css";

const MAPBOX_TOKEN = import.meta.env.VITE_MAPBOX_ACCESS_TOKEN ?? "";
const INITIAL_VIEW_STATE = {
  longitude: 139.767125,
  latitude: 35.681236,
  zoom: 12,
};

export function RouteComponent() {
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
        style={{ width: "100%", height: "100%" }}
        mapStyle="mapbox://styles/mapbox/streets-v12"
        pitchWithRotate={true}
        attributionControl={true}
      >
        <NavigationControl position="top-right" visualizePitch={true} />
        <GeolocateControl
          position="top-right"
          trackUserLocation={true}
          showAccuracyCircle={false}
          positionOptions={{ enableHighAccuracy: true }}
        />
        <ScaleControl unit="metric" />
      </MapComponent>
    </div>
  );
}
