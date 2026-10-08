import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { CheckCircle2 } from "lucide-react";
import { journeyService } from "../services/journeyService";
import { useApp } from "../context/AppContext";
import { fmtDate } from "./JourneyCard";
import LocationSearch from "./maps/LocationSearch";
export default function JoinModal({ j, onClose, onJoined }) {
  const { notify } = useApp();
  const nav = useNavigate();
  const [msg, setMsg] = useState("Hi, I'd like to join your journey.");
  const [pickup, setPickup] = useState(null);
  const [drop, setDrop] = useState(null);
  const [errs, setErrs] = useState({});
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);
  const confirm = async () => {
    const e = {};
    if (!pickup) e.pickup = "Choose your pickup location from the results";
    if (!drop) e.drop = "Choose your drop location from the results";
    setErrs(e);
    if (Object.keys(e).length) return;
    setBusy(true);
    try {
      await journeyService.joinJourney(j.id, {
        message: msg,
        pickupName: pickup.name,
        pickupLat: pickup.lat,
        pickupLng: pickup.lng,
        dropName: drop.name,
        dropLat: drop.lat,
        dropLng: drop.lng,
      });
      notify("Journey joined successfully.");
      setDone(true);
      onJoined();
    } catch (x) {
      notify(x.message, "err");
      setBusy(false);
    }
  };
  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Join journey"
      className="fixed inset-0 z-[2000] flex items-end justify-center bg-black/50 p-4 sm:items-center"
      onClick={onClose}
    >
      <div
        className="card max-h-[90vh] w-full max-w-md space-y-4 overflow-y-auto p-6"
        onClick={(e) => e.stopPropagation()}
      >
        {done ? (
          <div className="space-y-4 text-center">
            <CheckCircle2 className="mx-auto h-14 w-14 text-emerald-500" />
            <h2 className="text-xl font-bold">You're joining this journey</h2>
            <div className="flex gap-2">
              <button
                className="btn btn-primary flex-1"
                onClick={() => nav("/messages")}
              >
                Open Chat
              </button>
              <button className="btn btn-ghost flex-1" onClick={onClose}>
                View Journey
              </button>
            </div>
          </div>
        ) : (
          <>
            <h2 className="text-xl font-bold">Join this journey?</h2>
            <p className="text-sm text-neutral-500">
              {j.from} → {j.to}
              <br />
              {fmtDate(j.date)} · {j.departureTime} · 1 seat
            </p>
            <LocationSearch
              id="pickup"
              label="Your pickup location"
              value={pickup}
              error={errs.pickup}
              onSelect={setPickup}
            />
            <LocationSearch
              id="drop"
              label="Your drop location"
              value={drop}
              error={errs.drop}
              onSelect={setDrop}
            />
            <div className="flex justify-between rounded-xl bg-neutral-100 p-3 text-sm dark:bg-neutral-800">
              <span>Sharing contribution</span>
              <b>₹{j.contribution}</b>
            </div>
            <div>
              <label className="label" htmlFor="m">
                Optional message
              </label>
              <textarea
                id="m"
                className="input"
                rows={2}
                value={msg}
                onChange={(e) => setMsg(e.target.value)}
              />
            </div>
            <div className="flex gap-2">
              <button className="btn btn-ghost flex-1" onClick={onClose}>
                Cancel
              </button>
              <button
                className="btn btn-primary flex-1"
                disabled={busy}
                onClick={confirm}
              >
                {busy ? "Joining…" : "Confirm Join"}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
