import L from "leaflet";
import { useEffect } from "react";
import { Circle, MapContainer, Marker, Polyline, Popup, TileLayer, useMap } from "react-leaflet";
import type { Geofence, Location } from "../../types";
import markerIcon2x from "leaflet/dist/images/marker-icon-2x.png";
import markerIcon from "leaflet/dist/images/marker-icon.png";
import markerShadow from "leaflet/dist/images/marker-shadow.png";

delete (L.Icon.Default.prototype as unknown as { _getIconUrl?: unknown })._getIconUrl;
L.Icon.Default.mergeOptions({ iconUrl: markerIcon, iconRetinaUrl: markerIcon2x, shadowUrl: markerShadow });

function createPin(color: string, selected: boolean) {
  const size = selected ? 22 : 16;
  const ring = selected ? `box-shadow:0 0 0 3px ${color}40,0 0 16px ${color};` : `box-shadow:0 0 8px ${color}80;`;
  return L.divIcon({
    className: "",
    html: `<div style="width:${size}px;height:${size}px;border-radius:50%;background:${color};border:2.5px solid white;${ring}transition:all .2s"></div>`,
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2],
  });
}

function MapController({ center }: { center: [number, number] }) {
  const map = useMap();

  useEffect(() => {
    const t1 = setTimeout(() => map.invalidateSize(), 0);
    const t2 = setTimeout(() => map.invalidateSize(), 300);
    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, [map]);

  useEffect(() => {
    map.setView(center, map.getZoom());
    setTimeout(() => map.invalidateSize(), 50);
  }, [center, map]);

  useEffect(() => {
    const handler = () => map.invalidateSize();
    window.addEventListener("resize", handler);
    return () => window.removeEventListener("resize", handler);
  }, [map]);

  return null;
}

type Props = {
  locations: Location[];
  geofences?: Geofence[];
  route?: Location[];
  selectedAnimalId?: string | null;
  onSelectAnimal?: (id: string) => void;
  center?: [number, number];
  className?: string;
};

const DEFAULT_CENTER: [number, number] = [42.8746, 74.5698];

export function LiveMap({
  locations,
  geofences = [],
  route = [],
  selectedAnimalId,
  onSelectAnimal,
  center,
  className = "h-[480px]",
}: Props) {
  const mapCenter =
    center ??
    (locations[0]
      ? ([Number(locations[0].lat), Number(locations[0].lng)] as [number, number])
      : DEFAULT_CENTER);

  const routePoints = route.map((p) => [Number(p.lat), Number(p.lng)] as [number, number]);

  return (
    <div className={`w-full overflow-hidden rounded-card border border-border ${className}`}>
      <MapContainer
        center={mapCenter}
        zoom={14}
        style={{ height: "100%", width: "100%" }}
        scrollWheelZoom
        zoomControl={false}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a>'
          url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
        />

        <MapController center={mapCenter} />

        {geofences.map((zone) => (
          <Circle
            key={zone.id}
            center={[Number(zone.center_lat), Number(zone.center_lng)]}
            radius={zone.radius_meters}
            pathOptions={{
              color: zone.is_danger_zone ? "#ff6a6a" : "#4de6a8",
              fillColor: zone.is_danger_zone ? "#ff6a6a" : "#4de6a8",
              fillOpacity: 0.1,
              weight: 1.5,
            }}
          />
        ))}

        {routePoints.length > 1 && (
          <Polyline
            positions={routePoints}
            pathOptions={{ color: "#2d78ff", weight: 3, opacity: 0.8 }}
          />
        )}

        {locations.map((loc) => {
          if (!loc.animal_id) return null;
          const color = loc.online ? "#4de6a8" : "#697480";
          const selected = loc.animal_id === selectedAnimalId;
          return (
            <Marker
              key={loc.id}
              position={[Number(loc.lat), Number(loc.lng)]}
              icon={createPin(selected ? "#2d78ff" : color, selected)}
              zIndexOffset={selected ? 1000 : 0}
              eventHandlers={{ click: () => onSelectAnimal?.(loc.animal_id!) }}
            >
              {loc.animal_name && (
                <Popup closeButton={false} offset={[0, -8]}>
                  <div style={{ fontFamily: "inherit", fontSize: 12, fontWeight: 600, color: "#eff5f8", background: "transparent", padding: 0 }}>
                    {loc.animal_name}
                    <div style={{ fontSize: 10, fontWeight: 400, color: "#8f9daa", marginTop: 2 }}>
                      {loc.online ? "● онлайн" : "○ оффлайн"} · {loc.battery_level}%
                    </div>
                  </div>
                </Popup>
              )}
            </Marker>
          );
        })}
      </MapContainer>
    </div>
  );
}
