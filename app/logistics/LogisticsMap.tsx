"use client";

import L from "leaflet";
import { MapContainer, Marker, Polyline, Popup, TileLayer } from "react-leaflet";

import { osmTileAttribution } from "@/lib/services/attribution";
import { LogisticsLocation } from "./logisticsData";

type LogisticsMapProps = {
  locations: LogisticsLocation[];
  selectedLocationIds: string[];
  origin?: {
    label: string;
    latitude: number;
    longitude: number;
    type: "business" | "current";
  } | null;
  routePath?: Array<[number, number]>;
  isRoadRoute?: boolean;
  onToggleLocation: (locationId: string) => void;
};

const defaultCenter: [number, number] = [42.68, -83.15];

function colorMarkerIcon(color: "blue" | "green" | "orange" | "red") {
  return new L.Icon({
    iconUrl:
      color === "blue"
        ? "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png"
        : `https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-${color}.png`,
    iconRetinaUrl:
      color === "blue"
        ? "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png"
        : `https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-${color}.png`,
    shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41],
  });
}

const availableMarkerIcon = colorMarkerIcon("green");
const selectedMarkerIcon = colorMarkerIcon("blue");
const temporaryMarkerIcon = colorMarkerIcon("orange");
const originMarkerIcon = colorMarkerIcon("red");

function LegendItem({
  className,
  label,
}: {
  className: string;
  label: string;
}) {
  return (
    <div className="flex items-center gap-2">
      <span className={className} />
      <span>{label}</span>
    </div>
  );
}

export default function LogisticsMap({
  locations,
  selectedLocationIds,
  origin = null,
  routePath = [],
  isRoadRoute = false,
  onToggleLocation,
}: LogisticsMapProps) {
  const center: [number, number] =
    origin ? [origin.latitude, origin.longitude] : locations.length > 0
      ? [locations[0].latitude, locations[0].longitude]
      : defaultCenter;

  return (
    <div className="relative">
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

      {origin && (
        <Marker
          position={[origin.latitude, origin.longitude]}
          icon={originMarkerIcon}
        >
          <Popup>
            <div className="space-y-1">
              <div className="font-semibold">{origin.label}</div>
              <div className="text-sm">
                {origin.type === "current"
                  ? "Current route start/end"
                  : "Business route start/end"}
              </div>
            </div>
          </Popup>
        </Marker>
      )}

      {locations.map((location) => {
        const isSelected = selectedLocationIds.includes(location.id);
        const icon = isSelected
          ? selectedMarkerIcon
          : location.coordinateSource === "temporary"
            ? temporaryMarkerIcon
            : availableMarkerIcon;

        return (
          <Marker
            key={location.id}
            position={[location.latitude, location.longitude]}
            icon={icon}
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
                      ? "bg-blue-600 hover:bg-blue-700"
                      : "bg-green-600 hover:bg-green-700"
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
      <div className="pointer-events-none absolute bottom-3 left-3 z-[500] max-w-[calc(100%-1.5rem)] rounded-lg border border-gray-200 bg-white/95 px-3 py-2 text-xs font-semibold text-gray-700 shadow dark:border-gray-700 dark:bg-gray-900/95 dark:text-gray-200">
        <div className="grid gap-2">
          <LegendItem
            className="h-3 w-3 rounded-full bg-red-600"
            label="Route start/end"
          />
          <LegendItem
            className="h-3 w-3 rounded-full bg-green-600"
            label="Available location"
          />
          <LegendItem
            className="h-3 w-3 rounded-full bg-blue-600"
            label="Selected route stop"
          />
          <LegendItem
            className="h-3 w-3 rounded-full bg-orange-500"
            label="Approximate position"
          />
          <LegendItem
            className="h-1 w-6 rounded-full bg-blue-600"
            label={isRoadRoute ? "Road-following route" : "Simple route preview"}
          />
        </div>
      </div>
    </div>
  );
}
