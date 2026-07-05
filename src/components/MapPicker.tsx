"use client";

import "leaflet/dist/leaflet.css";
import { MapContainer, TileLayer, Marker, useMapEvents } from "react-leaflet";
import L from "leaflet";
import { useState } from "react";

const pin = new L.Icon({
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});

function ClickHandler({ onPick }: { onPick: (lat: number, lng: number) => void }) {
  useMapEvents({
    click(e) {
      onPick(e.latlng.lat, e.latlng.lng);
    },
  });
  return null;
}

export default function MapPicker({
  defaultLat = 14.7167,
  defaultLng = -17.4677,
  onChange,
}: {
  defaultLat?: number;
  defaultLng?: number;
  onChange: (lat: number, lng: number) => void;
}) {
  const [pos, setPos] = useState<[number, number] | null>(null);

  return (
    <div className="overflow-hidden rounded-2xl border border-border">
      <MapContainer
        center={[defaultLat, defaultLng]}
        zoom={12}
        style={{ height: "280px", width: "100%" }}
      >
        <TileLayer
          attribution='&copy; OpenStreetMap'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <ClickHandler
          onPick={(lat, lng) => {
            setPos([lat, lng]);
            onChange(lat, lng);
          }}
        />
        {pos && <Marker position={pos} icon={pin} />}
      </MapContainer>
      <p className="bg-paper-2 px-3 py-1.5 text-xs text-text-muted">
        Cliquez sur la carte pour indiquer l&apos;emplacement précis (facultatif).
      </p>
    </div>
  );
}
