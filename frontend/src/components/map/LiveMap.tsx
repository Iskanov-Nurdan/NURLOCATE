import L from "leaflet";
import { Circle, MapContainer, Marker, Polyline, TileLayer, useMap } from "react-leaflet";
import { useEffect } from "react";
import type { Geofence, Location } from "../../types";
import markerIcon2x from "leaflet/dist/images/marker-icon-2x.png";
import markerIcon from "leaflet/dist/images/marker-icon.png";
import markerShadow from "leaflet/dist/images/marker-shadow.png";

delete (L.Icon.Default.prototype as unknown as { _getIconUrl?: unknown })._getIconUrl;
L.Icon.Default.mergeOptions({ iconUrl: markerIcon, iconRetinaUrl: markerIcon2x, shadowUrl: markerShadow });

function createPin(color: string) {
  return L.divIcon({
    className: "",
    html: `<div style="width:18px;height:18px;border-radius:50%;background:${color};border:2px solid white;box-shadow:0 0 12px ${color}"></div>`,
    iconSize: [18, 18],
    iconAnchor: [9, 9]
  });
}

function MapFocus({ center }: { center: [number, number] }) {
  const map = useMap();
  useEffect(() => {
    map.setView(center, map.getZoom());
  }, [center, map]);
  return null;
}

type Props = {
  locations: Location[];
  geofences?: Geofence[];
  route?: Location[];
  selectedAnimalId?: string | null;
  onSelectAnimal?: (id: string) => void;
  center?: [number, number];
};

const DEFAULT_CENTER: [number, number] = [42.8746, 74.5698];

export function LiveMap({ locations, geofences = [], route = [], selectedAnimalId, onSelectAnimal, center }: Props) {
  const mapCenter = center ?? (locations[0]
    ? [Number(locations[0].lat), Number(locations[0].lng)] as [number, number]
    : DEFAULT_CENTER);

  const routePoints = route.map((p) => [Number(p.lat), Number(p.lng)] as [number, number]);

  return (
    <div className="h-full min-h-[520px] overflow-hidden rounded-card border border-border">
      <MapContainer center={mapCenter} zoom={14} className="h-full w-full" scrollWheelZoom>
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a>'
          url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
        />
        <MapFocus center={mapCenter} />

        {geofences.map((zone) => (
          <Circle
            key={zone.id}
            center={[Number(zone.center_lat), Number(zone.center_lng)]}
            radius={zone.radius_meters}
            pathOptions={{
              color: zone.is_danger_zone ? "#ff6a6a" : "#4de6a8",
              fillColor: zone.is_danger_zone ? "#ff6a6a" : "#4de6a8",
              fillOpacity: 0.08
            }}
          />
        ))}

        {routePoints.length > 1 && (
          <Polyline positions={routePoints} pathOptions={{ color: "#2d78ff", weight: 3, opacity: 0.8 }} />
        )}

        {locations.map((loc) => {
          if (!loc.animal_id) return null;
          const color = loc.online ? "#4de6a8" : "#697480";
          const selected = loc.animal_id === selectedAnimalId;
          return (
            <Marker
              key={loc.id}
              position={[Number(loc.lat), Number(loc.lng)]}
              icon={createPin(selected ? "#2d78ff" : color)}
              eventHandlers={{ click: () => onSelectAnimal?.(loc.animal_id!) }}
            />
          );
        })}
      </MapContainer>
    </div>
  );
}
