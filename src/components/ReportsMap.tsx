"use client";

import "leaflet/dist/leaflet.css";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import L from "leaflet";
import Link from "next/link";
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

export default function ReportsMap({ reports }: { reports: MapReport[] }) {
  const withCoords = reports.filter((r) => r.latitude != null && r.longitude != null);

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
      {withCoords.map((r) => (
        <Marker key={r.id} position={[r.latitude as number, r.longitude as number]} icon={markerIcon(r.type)}>
          <Popup>
            <p className="text-xs font-semibold">{REPORT_TYPES[r.type as ReportTypeKey]?.label}</p>
            <Link href={`/annonces/${r.id}`} className="text-sm font-semibold text-blue-600 underline">
              {r.title}
            </Link>
            <p className="text-xs text-gray-500">{r.city}</p>
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  );
}
