import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";

const MAPBOX_TOKEN = import.meta.env.VITE_MAPBOX_ACCESS_TOKEN ?? "";

export const Route = createFileRoute("./routes/top/route")({
  component: TopPage
});

function TopPage() {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<mapboxgl.Map | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!containerRef.current) {
      return;
    }

    if (!MAPBOX_TOKEN) {
      setError("Mapbox access token is missing. Please set VITE_MAPBOX_ACCESS_TOKEN.");
      return;
    }

    mapboxgl.accessToken = MAPBOX_TOKEN;

    mapRef.current = new mapboxgl.Map({
      container: containerRef.current,
      style: "mapbox://styles/mapbox/streets-v12",
      center: [139.767125, 35.681236],
      zoom: 12,
      pitchWithRotate: true,
      attributionControl: true
    });

    mapRef.current.addControl(new mapboxgl.NavigationControl({ visualizePitch: true }), "top-right");
    mapRef.current.addControl(
      new mapboxgl.GeolocateControl({
        trackUserLocation: true,
        showAccuracyCircle: false,
        positionOptions: { enableHighAccuracy: true }
      }),
      "top-right"
    );
    mapRef.current.addControl(new mapboxgl.ScaleControl({ unit: "metric" }));

    return () => {
      mapRef.current?.remove();
      mapRef.current = null;
    };
  }, []);

  return (
    <div className="top-map">
      {error ? <div className="top-map__fallback">{error}</div> : null}
      <div ref={containerRef} className="top-map__canvas" aria-label="Top page map" />
    </div>
  );
}
