"use client";

import L from "leaflet";
import { MapContainer, Marker, Polyline, Popup, TileLayer } from "react-leaflet";

import { osmTileAttribution } from "@/lib/services/attribution";
import { LogisticsLocation } from "./logisticsData";

type LogisticsMapProps = {
  locations: LogisticsLocation[];
  selectedLocationIds: string[];
  routePath?: Array<[number, number]>;
  onToggleLocation: (locationId: string) => void;
};

const defaultCenter: [number, number] = [42.68, -83.15];

const defaultMarkerIcon = new L.Icon({
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  iconRetinaUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

const selectedMarkerIcon = new L.Icon({
  iconUrl:
    "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-green.png",
  iconRetinaUrl:
    "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

export default function LogisticsMap({
  locations,
  selectedLocationIds,
  routePath = [],
  onToggleLocation,
}: LogisticsMapProps) {
  const center: [number, number] =
    locations.length > 0
      ? [locations[0].latitude, locations[0].longitude]
      : defaultCenter;

  return (
    <MapContainer
      center={center}
      zoom={13}
      scrollWheelZoom
      className="relative z-0 h-[500px] w-full rounded-xl"
    >
      <TileLayer
        attribution={osmTileAttribution}
        url={
          process.env.NEXT_PUBLIC_OSM_TILE_URL ||
          "https://tile.openstreetmap.org/{z}/{x}/{y}.png"
        }
      />

      {routePath.length >= 2 && (
        <Polyline
          positions={routePath}
          pathOptions={{
            color: "#2563eb",
            weight: 5,
            opacity: 0.85,
          }}
        />
      )}

      {locations.map((location) => {
        const isSelected = selectedLocationIds.includes(location.id);

        return (
          <Marker
            key={location.id}
            position={[location.latitude, location.longitude]}
            icon={isSelected ? selectedMarkerIcon : defaultMarkerIcon}
            eventHandlers={{
              click: () => onToggleLocation(location.id),
            }}
          >
            <Popup>
              <div className="space-y-2">
                <div className="font-semibold">{location.name}</div>

                <div className="text-sm">
                  {location.address}
                  <br />
                  {location.city}, {location.state} {location.zip}
                </div>

                <button
                  type="button"
                  onClick={() => onToggleLocation(location.id)}
                  className={`rounded px-3 py-1 text-sm font-semibold text-white ${
                    isSelected
                      ? "bg-green-600 hover:bg-green-700"
                      : "bg-blue-600 hover:bg-blue-700"
                  }`}
                >
                  {isSelected ? "Remove from Route" : "Add to Route"}
                </button>
              </div>
            </Popup>
          </Marker>
        );
      })}
    </MapContainer>
  );
}
