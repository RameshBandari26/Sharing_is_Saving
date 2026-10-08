import { useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { Star, BadgeCheck, ArrowDown } from "lucide-react";
import { journeyService } from "../services/journeyService";
import { useApp } from "../context/AppContext";
import JoinModal from "../components/JoinModal";
import JourneyMapCard from "../components/maps/JourneyMapCard";
import useAsync from "../hooks/useAsync";
import { fmtDate } from "../components/JourneyCard";
export default function JourneyDetail() {
  const { id } = useParams();
  const { user, notify } = useApp();
  const nav = useNavigate();
  const [tick, setTick] = useState(0);
  const [open, setOpen] = useState(false);
  const {
    data: j,
    loading,
    reload,
  } = useAsync(() => journeyService.getJourneyById(id), [id]);
  if (loading && !j)
    return (
      <div className="px-4 py-24 text-center text-neutral-500">
        Loading journey…
      </div>
    );
  if (!j)
    return (
      <div className="mx-auto max-w-lg px-4 py-24 text-center">
        <h1 className="mb-2 text-2xl font-bold">Journey not found</h1>
        <p className="mb-6 text-neutral-500">
          This journey seems to have taken a different route.
        </p>
        <Link to="/find" className="btn btn-primary">
          Find a Journey
        </Link>
      </div>
    );
  const joined = user && j.passengers.some((p) => p.userId === user.id);
  const mine = user && j.hostId === user.id;
  const label = mine
    ? "Your journey"
    : joined
      ? "Joined ✓"
      : j.status === "FULL"
        ? "Journey full"
        : "Join Journey";
  const start = async () => {
    try {
      await journeyService.startJourney(id);
      notify("Journey started. Sharing your location.");
      nav("/track/" + id);
    } catch (e) {
      notify(e.message, "err");
    }
  };
  const onJoin = () => {
    if (!user) {
      notify("Please log in to join a journey", "err");
      nav("/login", { state: { from: `/journey/${id}` } });
      return;
    }
    setOpen(true);
  };
  return (
    <div
      data-t={tick}
      className="mx-auto grid max-w-5xl gap-6 px-4 pb-28 pt-8 md:grid-cols-3"
    >
      <div className="space-y-6 md:col-span-2">
        <div className="card space-y-3 p-6">
          <div className="text-3xl font-extrabold">
            {j.from}
            <div className="text-sm font-medium text-neutral-500">
              {j.departureTime} · {fmtDate(j.date)} · {j.pickup}
            </div>
          </div>
          <ArrowDown className="h-5 w-5 text-accent" />
          <div className="text-3xl font-extrabold">
            {j.to}
            <div className="text-sm font-medium text-neutral-500">
              {j.drop} · {j.duration}
            </div>
          </div>
        </div>
        <div className="card flex items-center gap-4 p-6">
          <img
            src={j.host.avatar}
            alt={j.host.name}
            className="h-14 w-14 rounded-full"
          />
          <div>
            <div className="font-bold">{j.host.name}</div>
            <div className="text-sm">
              <Star className="inline h-3.5 w-3.5 fill-amber-400 text-amber-400" />{" "}
              {j.host.rating} · {j.host.totalJourneys} journeys
            </div>
            <div className="text-sm text-neutral-500">
              <BadgeCheck className="inline h-4 w-4 text-accent" /> Phone &
              email verified
            </div>
          </div>
        </div>
        <JourneyMapCard j={j} />
        <div className="card p-6">
          <h2 className="mb-1 font-bold">Vehicle</h2>
          <p className="text-sm text-neutral-500">
            {j.vehicle.model} · {j.vehicle.color} · {j.seatsTotal + 1} seats
          </p>
        </div>
      </div>
      <aside className="fixed inset-x-0 bottom-0 z-30 border-t border-neutral-200 bg-white p-4 dark:border-neutral-800 dark:bg-neutral-900 md:static md:self-start md:rounded-2xl md:border md:p-6">
        <div className="mb-3 flex items-end justify-between">
          <div>
            <span className="text-3xl font-extrabold">₹{j.contribution}</span>
            <span className="text-sm text-neutral-500"> per person</span>
          </div>
          <span className="pill">{j.seatsAvailable} seats available</span>
        </div>
        {mine && j.status !== "STARTED" && (
          <button className="btn btn-primary mb-2 w-full" onClick={start}>
            Start Journey
          </button>
        )}
        {(mine || joined) && j.status === "STARTED" && (
          <Link to={`/track/${j.id}`} className="btn btn-primary mb-2 w-full">
            Track Vehicle
          </Link>
        )}
        <button
          className="btn btn-primary w-full"
          disabled={mine || joined || j.status !== "UPCOMING"}
          onClick={onJoin}
        >
          {label}
        </button>
      </aside>
      {open && (
        <JoinModal j={j} onClose={() => setOpen(false)} onJoined={reload} />
      )}
    </div>
  );
}
