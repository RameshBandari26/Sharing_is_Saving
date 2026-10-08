import { useEffect, useRef, useState } from "react";
import { mapService } from "../../services/mapService";

export default function LocationSearch({
  id,
  label,
  value,
  onSelect,
  error,
  autoDetect = false,
}) {
  const [q, setQ] = useState(value?.name || "");
  const [res, setRes] = useState([]);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState("");
  const asked = useRef(false);

  const pick = (p) => {
    setQ(p.name);
    setRes([]);
    setMsg("");
    onSelect({ name: p.name, lat: p.lat, lng: p.lng });
  };

  const locate = () => {
    if (!navigator.geolocation) {
      setMsg("Location is not supported in this browser");
      return;
    }
    setBusy(true);
    setMsg("Detecting your current location…");
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const lat = +pos.coords.latitude.toFixed(6),
          lng = +pos.coords.longitude.toFixed(6);
        let name = "My current location";
        try {
          const r = await mapService.reverse(lat, lng);
          if (r?.name) name = r.name;
        } catch {
          /* keep fallback name */
        }
        setBusy(false);
        pick({ name, lat, lng });
      },
      (err) => {
        setBusy(false);
        setMsg(
          err.code === 1
            ? "Location permission denied. Search for your starting place instead."
            : "Could not get your location. Search for your starting place instead.",
        );
      },
      { timeout: 10000, maximumAge: 60000 },
    );
  };

  // auto-detect once when the field first appears and nothing is selected yet
  useEffect(() => {
    if (autoDetect && !value && !asked.current) {
      asked.current = true;
      locate();
    }
  }, []); // eslint-disable-line

  // debounced search
  useEffect(() => {
    const t = q.trim();
    if ((value && q === value.name) || t.length < 3) {
      setRes([]);
      return;
    }
    const h = setTimeout(async () => {
      setBusy(true);
      setMsg("");
      try {
        const r = await mapService.search(t);
        setRes(r);
        if (!r.length) setMsg("No results found");
      } catch (e) {
        setRes([]);
        setMsg(e.message);
      }
      setBusy(false);
    }, 600);
    return () => clearTimeout(h);
  }, [q]); // eslint-disable-line

  return (
    <div className="relative">
      <label className="label" htmlFor={id}>
        {label}
      </label>
      <input
        id={id}
        className="input"
        value={q}
        autoComplete="off"
        placeholder="Search a place"
        onChange={(e) => {
          setQ(e.target.value);
          if (value) onSelect(null);
        }}
      />
      <button
        type="button"
        className="mt-1 text-xs font-semibold text-accent"
        onClick={locate}
      >
        📍 Use my current location
      </button>
      {busy && <p className="text-xs text-neutral-500">Searching…</p>}
      {msg && <p className="text-xs text-neutral-500">{msg}</p>}
      {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
      {res.length > 0 && (
        <ul className="card absolute z-20 mt-1 max-h-60 w-full overflow-auto">
          {res.map((p, i) => (
            <li key={i}>
              <button
                type="button"
                className="w-full px-3 py-2 text-left text-sm hover:bg-neutral-100 dark:hover:bg-neutral-800"
                onClick={() => pick(p)}
              >
                {p.name}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
