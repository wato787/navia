import { useMemo, useRef } from "react";
import MapComponent, {
  GeolocateControl,
  NavigationControl,
  ScaleControl,
} from "react-map-gl/mapbox";
import "mapbox-gl/dist/mapbox-gl.css";
import { DestinationSearchBar } from "@/components/DestinationSearchBar";
import type { MapRef } from "react-map-gl/mapbox";
import {
  MAPBOX_TOKEN,
  INITIAL_VIEW_STATE,
  MAP_STYLE,
  MAPBOX_MAP_STYLE,
  NAVIGATION_CONTROL_PROPS,
  GEOLOCATE_CONTROL_PROPS,
} from "./const";
import { useCurrentLocation } from "./useCurrentLocation";
import { useRouteSearch } from "./useRouteSearch";

type MapContentProps = {
  mapRef: React.RefObject<MapRef | null>;
};

function MapContent({ mapRef }: MapContentProps) {
  const { currentLocation } = useCurrentLocation(mapRef);
  const { handleDestinationSearch } = useRouteSearch(mapRef, currentLocation);

  return (
    <>
      <DestinationSearchBar onSearch={handleDestinationSearch} />
      <GeolocateControl {...GEOLOCATE_CONTROL_PROPS} />
    </>
  );
}

export default function IndexPage() {
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

