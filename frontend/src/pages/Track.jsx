import { useEffect, useRef, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { journeyService } from "../services/journeyService";
import { mapService, fmtDur } from "../services/mapService";
import { useApp } from "../context/AppContext";
import useAsync from "../hooks/useAsync";
import LazyMap from "../components/maps/LazyMap";
const has = (p) => p && p.lat != null && p.lng != null;
export default function Track() {
  const { id } = useParams();
  const { user, notify } = useApp();
  const { data: j, loading } = useAsync(
    () => journeyService.getJourneyById(id),
    [id],
  );
  const [live, setLive] = useState(null);
  const [me, setMe] = useState(null);
  const [status, setStatus] = useState("");
  const [stops, setStops] = useState([]);
  const [route, setRoute] = useState(null);
  const [msg, setMsg] = useState("");
  const isHost = !!(j && user && j.hostId === user.id);
  const member = !!(
    j &&
    user &&
    (isHost || j.passengers.some((x) => x.userId === user.id))
  );

  // poll host location, journey status and stops every 5s
  useEffect(() => {
    if (!member) return;
    let off = false;
    const pull = async () => {
      try {
        const r = await mapService.live(id);
        if (off) return;
        setStatus(r.status);
        if (r.lat != null) setLive({ lat: r.lat, lng: r.lng, at: r.at });
        const s = await mapService.stops(id);
        if (!off) setStops(s);
        setMsg("");
      } catch (e) {
        if (!off) setMsg(e.message);
      }
    };
    pull();
    const t = setInterval(pull, 5000);
    return () => {
      off = true;
      clearInterval(t);
    };
  }, [member, id]);

  // host shares GPS while the journey is running
  useEffect(() => {
    if (!isHost || j.status !== "STARTED" || status === "COMPLETED") return;
    if (!navigator.geolocation) {
      setMsg("Location is not supported in this browser");
      return;
    }
    let last = 0;
    const w = navigator.geolocation.watchPosition(
      (p) => {
        const c = { lat: p.coords.latitude, lng: p.coords.longitude };
        setMe(c);
        const now = Date.now();
        if (now - last < 5000) return;
        last = now;
        mapService.share(id, c.lat, c.lng).catch((e) => setMsg(e.message));
      },
      (err) =>
        setMsg(
          err.code === 1
            ? "Allow location access so passengers can see where you are"
            : "Could not read your location",
        ),
      { enableHighAccuracy: true, maximumAge: 5000, timeout: 15000 },
    );
    return () => navigator.geolocation.clearWatch(w);
  }, [isHost, id, j?.status, status]);

  // where are we heading next?
  const withPts = stops.filter((s) => has(s.pickup) && has(s.drop));
  let target = null,
    label = "";
  if (isHost) {
    const w = withPts.find((s) => s.status === "WAITING"),
      p = withPts.find((s) => s.status === "PICKED_UP");
    if (w) {
      target = w.pickup;
      label = `Go to pick up ${w.name}`;
    } else if (p) {
      target = p.drop;
      label = `Drop off ${p.name}`;
    } else if (j?.toLat != null) {
      target = { lat: j.toLat, lng: j.toLng, name: j.to };
      label = withPts.length
        ? "All passengers dropped off. Complete the journey when you arrive."
        : "Head to the journey destination";
    }
  } else {
    const m = withPts[0];
    if (m) {
      if (m.status === "WAITING") {
        target = m.pickup;
        label = "The host is on the way to your pickup";
      } else if (m.status === "PICKED_UP") {
        target = m.drop;
        label = "On the way to your drop location";
      } else
        label = "You have been dropped off. Thank you for travelling together!";
    }
  }
  const origin = isHost ? me || live : live;
  const originRef = useRef(null);
  originRef.current = origin;
  const tkey = target ? `${target.lat},${target.lng}` : "";
  const hasOrigin = !!origin;
  useEffect(() => {
    if (!tkey || !hasOrigin) {
      setRoute(null);
      return;
    }
    let off = false;
    const go = () =>
      mapService
        .route(originRef.current, target)
        .then((r) => !off && setRoute(r))
        .catch(() => !off && setRoute(null));
    go();
    const t = setInterval(go, 20000);
    return () => {
      off = true;
      clearInterval(t);
    };
  }, [tkey, hasOrigin]); // eslint-disable-line

  const act = async (fn, okMsg) => {
    try {
      await fn();
      notify(okMsg);
      setStops(await mapService.stops(id));
    } catch (e) {
      notify(e.message, "err");
    }
  };
  const finish = async () => {
    if (!window.confirm("Mark this journey as completed?")) return;
    try {
      await mapService.complete(id);
      notify("Journey completed.");
      setStatus("COMPLETED");
    } catch (e) {
      notify(e.message, "err");
    }
  };

  if (loading && !j)
    return (
      <div className="px-4 py-24 text-center text-neutral-500">Loading…</div>
    );
  if (!member)
    return (
      <div className="mx-auto max-w-md px-4 py-24 text-center">
        <h1 className="mb-4 text-2xl font-bold">Tracking unavailable</h1>
        <p className="mb-6 text-neutral-500">
          Only the host and joined passengers can track this journey.
        </p>
        <Link to="/find" className="btn btn-primary">
          Find a Journey
        </Link>
      </div>
    );
  const cur = status || j.status;
  if (cur === "COMPLETED")
    return (
      <div className="mx-auto max-w-md px-4 py-24 text-center">
        <h1 className="mb-2 text-2xl font-bold">Journey completed 🎉</h1>
        <p className="mb-6 text-neutral-500">
          Thank you for travelling together.
        </p>
        <Link to="/dashboard" className="btn btn-primary">
          Back to dashboard
        </Link>
      </div>
    );
  if (cur !== "STARTED")
    return (
      <div className="mx-auto max-w-md px-4 py-24 text-center">
        <h1 className="mb-4 text-2xl font-bold">Journey hasn't started yet</h1>
        <Link to={`/journey/${id}`} className="btn btn-primary">
          View Journey
        </Link>
      </div>
    );

  return (
    <div className="mx-auto max-w-3xl space-y-4 px-4 py-8">
      <h1 className="text-2xl font-extrabold">
        {j.from} → {j.to}
      </h1>
      <LazyMap to={target} route={route} live={origin} height={420} />
      <div className="card space-y-1 p-5">
        <div className="font-semibold">
          {label ||
            (isHost
              ? "Waiting for passengers to join"
              : "Waiting for the host…")}
        </div>
        {route && (
          <div className="text-sm">
            {route.distanceKm} km · {fmtDur(route.durationMinutes)} away
          </div>
        )}
        {target && (
          <div className="text-sm text-neutral-500">{target.name}</div>
        )}
        {!origin && (
          <div className="text-sm text-neutral-500">
            {isHost
              ? "Detecting your location…"
              : "Waiting for the host to share their location…"}
          </div>
        )}
      </div>
      {isHost && (
        <>
          <div className="card divide-y divide-neutral-200 dark:divide-neutral-800">
            {stops.map((s) => (
              <div
                key={s.userId}
                className="flex items-center justify-between gap-3 p-4"
              >
                <div>
                  <b>{s.name}</b>
                  <div className="text-xs text-neutral-500">
                    Pickup: {s.pickup.name || "—"}
                    <br />
                    Drop: {s.drop.name || "—"}
                  </div>
                </div>
                {s.status === "WAITING" && (
                  <button
                    className="btn btn-primary"
                    onClick={() =>
                      act(
                        () => mapService.pickUp(id, s.userId),
                        "Passenger marked as picked up.",
                      )
                    }
                  >
                    Picked up
                  </button>
                )}
                {s.status === "PICKED_UP" && (
                  <button
                    className="btn btn-primary"
                    onClick={() =>
                      act(
                        () => mapService.dropOff(id, s.userId),
                        "Passenger marked as dropped off.",
                      )
                    }
                  >
                    Dropped off
                  </button>
                )}
                {s.status === "DROPPED_OFF" && (
                  <span className="pill">Dropped off ✓</span>
                )}
              </div>
            ))}
            {!stops.length && (
              <div className="p-4 text-sm text-neutral-500">
                No passengers yet.
              </div>
            )}
          </div>
          <button className="btn btn-ghost w-full" onClick={finish}>
            Complete journey
          </button>
        </>
      )}
      {msg && (
        <p role="alert" className="text-sm text-red-600">
          {msg}
        </p>
      )}
    </div>
  );
}
