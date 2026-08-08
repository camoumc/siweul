"use client";

import "leaflet/dist/leaflet.css";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet.heat";
import Link from "next/link";
import { useEffect } from "react";
import { REPORT_TYPES, type ReportTypeKey } from "@/lib/reportConfig";

const colorHex: Record<string, string> = {
  OBJET_PERDU: "#f2762e",
  OBJET_TROUVE: "#0e7263",
  PERSONNE_DISPARUE: "#d93636",
  ANIMAL_PERDU: "#c2540e",
  VEHICULE_VOLE: "#3f3f9e",
  DOCUMENT_PERDU: "#0e7263",
};

function markerIcon(type: string) {
  const color = colorHex[type] ?? "#14173a";
  return L.divIcon({
    className: "",
    html: `<div style="background:${color};width:16px;height:16px;border-radius:50%;border:2px solid white;box-shadow:0 1px 4px rgba(0,0,0,0.4)"></div>`,
    iconSize: [16, 16],
    iconAnchor: [8, 8],
  });
}

export interface MapReport {
  id: string;
  type: string;
  title: string;
  city: string;
  latitude: number | null;
  longitude: number | null;
}

// Couche carte thermique : rouge = beaucoup de pertes (objets/personnes/animaux/vehicules
// perdus), vert = beaucoup de restitutions (objets trouves + signalements resolus).
function HeatLayer({
  points,
  gradient,
}: {
  points: [number, number, number][];
  gradient: Record<number, string>;
}) {
  const map = useMap();

  useEffect(() => {
    if (points.length === 0) return;
    const layer = L.heatLayer(points, { radius: 28, blur: 22, maxZoom: 14, gradient });
    layer.addTo(map);
    return () => {
      map.removeLayer(layer);
    };
  }, [map, points, gradient]);

  return null;
}

export default function ReportsMap({
  reports,
  heatmap = false,
}: {
  reports: MapReport[];
  heatmap?: boolean;
}) {
  const withCoords = reports.filter((r) => r.latitude != null && r.longitude != null);

  const LOST_TYPES = ["OBJET_PERDU", "PERSONNE_DISPARUE", "ANIMAL_PERDU", "VEHICULE_VOLE", "DOCUMENT_PERDU"];
  const lostPoints: [number, number, number][] = withCoords
    .filter((r) => LOST_TYPES.includes(r.type))
    .map((r) => [r.latitude as number, r.longitude as number, 0.6]);
  const foundPoints: [number, number, number][] = withCoords
    .filter((r) => r.type === "OBJET_TROUVE")
    .map((r) => [r.latitude as number, r.longitude as number, 0.6]);

  return (
    <MapContainer
      center={[14.7167, -17.4677]}
      zoom={7}
      style={{ height: "100%", width: "100%" }}
      className="z-0"
    >
      <TileLayer
        attribution='&copy; OpenStreetMap'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />

      {heatmap ? (
        <>
          <HeatLayer points={lostPoints} gradient={{ 0.2: "#fbd8bd", 0.5: "#f2762e", 1: "#d93636" }} />
          <HeatLayer points={foundPoints} gradient={{ 0.2: "#c9ece3", 0.5: "#0e7263", 1: "#0a5a4e" }} />
        </>
      ) : (
        withCoords.map((r) => (
          <Marker key={r.id} position={[r.latitude as number, r.longitude as number]} icon={markerIcon(r.type)}>
            <Popup>
              <p className="text-xs font-semibold">{REPORT_TYPES[r.type as ReportTypeKey]?.label}</p>
              <Link href={`/annonces/${r.id}`} className="text-sm font-semibold text-blue-600 underline">
                {r.title}
              </Link>
              <p className="text-xs text-gray-500">{r.city}</p>
            </Popup>
          </Marker>
        ))
      )}
    </MapContainer>
  );
}
