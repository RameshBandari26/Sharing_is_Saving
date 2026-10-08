import { useEffect, useState } from "react";
import LazyMap from "./LazyMap";
import { mapService, fmtDur } from "../../services/mapService";
export default function JourneyMapCard({ j }) {
  const ok = j.fromLat != null && j.toLat != null;
  const from = ok ? { lat: j.fromLat, lng: j.fromLng, name: j.from } : null;
  const to = ok ? { lat: j.toLat, lng: j.toLng, name: j.to } : null;
  const [route, setRoute] = useState(null);
  useEffect(() => {
    if (ok)
      mapService
        .route(from, to)
        .then(setRoute)
        .catch(() => {});
  }, [j.id]); // eslint-disable-line
  if (!ok)
    return (
      <div className="card p-6 text-sm text-neutral-500">
        Location coordinates unavailable
      </div>
    );
  return (
    <div className="space-y-2">
      <LazyMap from={from} to={to} route={route} />
      {route && (
        <p className="text-sm font-semibold">
          {route.distanceKm} km · {fmtDur(route.durationMinutes)}
        </p>
      )}
    </div>
  );
}
