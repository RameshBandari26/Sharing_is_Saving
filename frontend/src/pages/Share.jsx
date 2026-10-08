import { useState, useEffect } from "react";
import LocationSearch from "../components/maps/LocationSearch";
import LazyMap from "../components/maps/LazyMap";
import { mapService, fmtDur } from "../services/mapService";
import { useNavigate } from "react-router-dom";
import { journeyService } from "../services/journeyService";
import { useApp } from "../context/AppContext";
const titles = [
  "Where are you going?",
  "When are you travelling?",
  "Your vehicle",
  "Share your empty seats",
  "Sharing contribution",
  "Review",
];
function StepRoute({ d, setD, errs }) {
  const [route, setRoute] = useState(null);
  const [rerr, setRerr] = useState("");
  useEffect(() => {
    setRoute(null);
    setRerr("");
    if (!d.fromPt || !d.toPt) return;
    let off = false;
    mapService
      .route(d.fromPt, d.toPt)
      .then((r) => !off && setRoute(r))
      .catch(
        () => !off && setRerr("Route unavailable. Showing locations only."),
      );
    return () => {
      off = true;
    };
  }, [d.fromPt, d.toPt]);
  const pick = (k) => (p) =>
    setD((x) => ({ ...x, [k + "Pt"]: p, [k]: p ? p.name : "" }));
  return (
    <>
      <LocationSearch
        id="from"
        label="From"
        autoDetect
        value={d.fromPt}
        error={errs.from}
        onSelect={pick("from")}
      />
      <LocationSearch
        id="to"
        label="To"
        value={d.toPt}
        error={errs.to}
        onSelect={pick("to")}
      />
      {(d.fromPt || d.toPt) && (
        <LazyMap from={d.fromPt} to={d.toPt} route={route} height={300} />
      )}
      {route && (
        <p className="text-sm font-semibold">
          {route.distanceKm} km · {fmtDur(route.durationMinutes)}
        </p>
      )}
      {rerr && <p className="text-xs text-neutral-500">{rerr}</p>}
    </>
  );
}
export default function Share() {
  const { user, notify } = useApp();
  const nav = useNavigate();
  const [step, setStep] = useState(0);
  const [errs, setErrs] = useState({});
  const [d, setD] = useState({
    from: "",
    to: "",
    fromPt: null,
    toPt: null,
    date: "",
    time: "",
    vehicleType: "Hatchback",
    model: "",
    number: "",
    seats: 2,
    contribution: "",
  });
  const set = (k) => (e) => setD({ ...d, [k]: e.target.value });
  const req = [
    ["from", "to"],
    ["date", "time"],
    ["model", "number"],
    ["seats"],
    ["contribution"],
  ];
  const next = () => {
    const e = {};
    (req[step] || []).forEach((k) => {
      if (!String(d[k]).trim()) e[k] = "Required";
    });
    if (step === 3 && (+d.seats < 1 || +d.seats > 6))
      e.seats = "Between 1 and 6";
    if (step === 4 && +d.contribution <= 0) e.contribution = "Enter an amount";
    if (
      step === 0 &&
      d.from &&
      d.from.trim().toLowerCase() === d.to.trim().toLowerCase()
    )
      e.to = "Destination must differ";
    if (step === 0 && !d.fromPt)
      e.from = "Select a starting location from the search results";
    if (step === 0 && !d.toPt)
      e.to = "Select a destination from the search results";
    setErrs(e);
    if (!Object.keys(e).length) setStep(step + 1);
  };
  const publish = async () => {
    try {
      const j = await journeyService.createJourney(d);
      notify("Journey published.");
      nav("/journey/" + j.id);
    } catch (e) {
      notify(e.message, "err");
    }
  };
  const F = (k, label, type = "text") => (
    <div key={k}>
      <label className="label" htmlFor={k}>
        {label}
      </label>
      <input
        id={k}
        type={type}
        className="input"
        value={d[k]}
        onChange={set(k)}
        aria-invalid={!!errs[k]}
      />
      {errs[k] && <p className="mt-1 text-xs text-red-600">{errs[k]}</p>}
    </div>
  );
  const body = [
    <StepRoute d={d} setD={setD} errs={errs} />,
    <>
      {F("date", "Date", "date")}
      {F("time", "Departure time", "time")}
    </>,
    <>
      {F("model", "Vehicle model")}
      {F("number", "Vehicle number")}
    </>,
    F("seats", "Seats available", "number"),
    F("contribution", "₹ per person", "number"),
    <div className="space-y-1 text-sm">
      <div className="text-xl font-bold">
        {d.from} → {d.to}
      </div>
      <div>
        {d.date} · {d.time}
      </div>
      <div>
        {d.model} ({d.number})
      </div>
      <div>
        {d.seats} seats · ₹{d.contribution} / person
      </div>
    </div>,
  ][step];
  return (
    <div className="mx-auto max-w-lg px-4 py-10">
      <div className="mb-2 text-xs text-neutral-500">Step {step + 1} of 6</div>
      <div className="mb-6 h-1.5 rounded bg-neutral-200 dark:bg-neutral-800">
        <div
          className="h-full rounded bg-accent transition-all"
          style={{ width: `${((step + 1) / 6) * 100}%` }}
        />
      </div>
      <div className="card space-y-4 p-6">
        <h1 className="text-2xl font-bold">{titles[step]}</h1>
        {body}
        <div className="flex gap-2 pt-2">
          {step > 0 && (
            <button className="btn btn-ghost" onClick={() => setStep(step - 1)}>
              Back
            </button>
          )}
          {step < 5 ? (
            <button className="btn btn-primary flex-1" onClick={next}>
              Continue
            </button>
          ) : (
            <button className="btn btn-primary flex-1" onClick={publish}>
              Publish Journey
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
