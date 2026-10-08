import { useEffect } from "react";
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  Polyline,
  useMap,
} from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
const dot = (c) =>
  L.divIcon({
    className: "",
    html: `<div style="width:18px;height:18px;border-radius:50%;background:${c};border:3px solid #fff;box-shadow:0 1px 4px rgba(0,0,0,.4)"></div>`,
    iconSize: [18, 18],
    iconAnchor: [9, 9],
  });
const ICON = { from: dot("#10b981"), to: dot("#ef4444"), live: dot("#4f46e5") };
function Fit({ pts }) {
  const m = useMap();
  const k = JSON.stringify(pts);
  useEffect(() => {
    if (pts.length > 1) m.fitBounds(pts, { padding: [30, 30] });
    else if (pts.length === 1) m.setView(pts[0], 13);
  }, [k]); // eslint-disable-line
  return null;
}
export default function JourneyMap({ from, to, route, live, height = 350 }) {
  const pts = [from, to].filter(Boolean).map((p) => [p.lat, p.lng]);
  const line = route?.geometry || [];
  const fit = line.length
    ? line
    : pts.length
      ? pts
      : live
        ? [[live.lat, live.lng]]
        : [];
  return (
    <div
      className="relative overflow-hidden rounded-2xl border border-neutral-200 dark:border-neutral-800"
      style={{ height, maxHeight: "70vh", isolation: "isolate", zIndex: 0 }}
    >
      <MapContainer
        center={pts[0] || [17.385, 78.4867]}
        zoom={7}
        style={{ height: "100%", width: "100%" }}
        scrollWheelZoom={false}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {line.length > 0 && (
          <Polyline
            positions={line}
            pathOptions={{ color: "#4f46e5", weight: 4 }}
          />
        )}
        {from && (
          <Marker position={[from.lat, from.lng]} icon={ICON.from}>
            <Popup>Pickup: {from.name}</Popup>
          </Marker>
        )}
        {to && (
          <Marker position={[to.lat, to.lng]} icon={ICON.to}>
            <Popup>Destination: {to.name}</Popup>
          </Marker>
        )}
        {live && (
          <Marker position={[live.lat, live.lng]} icon={ICON.live}>
            <Popup>Host (live location)</Popup>
          </Marker>
        )}
        <Fit pts={fit} />
      </MapContainer>
    </div>
  );
}
