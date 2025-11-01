import Map, {
  NavigationControl,
  GeolocateControl,
  ScaleControl,
} from "react-map-gl/mapbox";
import "mapbox-gl/dist/mapbox-gl.css";
import styles from "./top.module.css";

const MAPBOX_TOKEN = import.meta.env.VITE_MAPBOX_ACCESS_TOKEN ?? "";

const TopPage = () => {
  if (!MAPBOX_TOKEN) {
    return (
      <div className={styles.map}>
        <div className={styles.fallback}>
          Mapboxアクセストークンが必要です。VITE_MAPBOX_ACCESS_TOKENを設定してください。
        </div>
      </div>
    );
  }

  return (
    <div className={styles.map}>
      <Map
        mapboxAccessToken={MAPBOX_TOKEN}
        initialViewState={{
          longitude: 139.767125,
          latitude: 35.681236,
          zoom: 12,
        }}
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
      </Map>
    </div>
  );
};

export default TopPage;
