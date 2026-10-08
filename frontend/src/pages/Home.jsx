import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Map, Armchair, Users, Car, ShieldCheck } from "lucide-react";
import { journeyService } from "../services/journeyService";
import JourneyCard from "../components/JourneyCard";
import useAsync from "../hooks/useAsync";
export function SearchBar({ init = {}, onSearch }) {
  const [f, setF] = useState({
    from: "Hyderabad",
    to: "Vijayawada",
    date: "",
    seats: 1,
    ...init,
  });
  const s = (k) => (e) => setF({ ...f, [k]: e.target.value });
  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        onSearch(f);
      }}
      className="card grid gap-3 p-4 sm:grid-cols-2 lg:grid-cols-5"
    >
      <div>
        <label className="label" htmlFor="f">
          From
        </label>
        <input id="f" className="input" value={f.from} onChange={s("from")} />
      </div>
      <div>
        <label className="label" htmlFor="t">
          To
        </label>
        <input id="t" className="input" value={f.to} onChange={s("to")} />
      </div>
      <div>
        <label className="label" htmlFor="d">
          Date
        </label>
        <input
          id="d"
          type="date"
          className="input"
          value={f.date}
          onChange={s("date")}
        />
      </div>
      <div>
        <label className="label" htmlFor="p">
          Passengers
        </label>
        <input
          id="p"
          type="number"
          min="1"
          max="6"
          className="input"
          value={f.seats}
          onChange={s("seats")}
        />
      </div>
      <button className="btn btn-primary self-end">Find a Journey</button>
    </form>
  );
}
export default function Home() {
  const nav = useNavigate();
  const { data: fd } = useAsync(() => journeyService.getJourneys(), []);
  const feat = (fd || []).slice(0, 3);
  const go = (f) =>
    nav(
      "/find?" +
        new URLSearchParams(
          Object.fromEntries(Object.entries(f).filter(([, v]) => v)),
        ),
    );
  const steps = [
    [Map, "Plan Your Journey"],
    [Armchair, "Share Your Seats"],
    [Users, "Find Passengers"],
    [Car, "Travel Together"],
  ];
  return (
    <div className="mx-auto max-w-6xl space-y-16 px-4 py-12">
      <section className="space-y-6">
        <h1 className="text-4xl font-extrabold leading-tight sm:text-6xl">
          Your journey.
          <br />
          <span className="text-accent">Someone else's way home.</span>
        </h1>
        <p className="max-w-xl text-lg text-neutral-500">
          Already travelling somewhere? Share your empty seats with people
          heading the same way.
        </p>
        <SearchBar onSearch={go} />
        <Link to="/share" className="btn btn-ghost">
          Share Your Journey
        </Link>
      </section>
      <section>
        <h2 className="mb-6 text-2xl font-bold">How it works</h2>
        <div className="grid gap-4 sm:grid-cols-4">
          {steps.map(([I, t], i) => (
            <div key={t} className="card p-5">
              <I className="mb-3 h-6 w-6 text-accent" />
              <div className="text-xs text-neutral-500">Step {i + 1}</div>
              <div className="font-semibold">{t}</div>
            </div>
          ))}
        </div>
      </section>
      <section>
        <h2 className="mb-6 text-2xl font-bold">Featured journeys</h2>
        <div className="space-y-4">
          {feat.map((j) => (
            <JourneyCard key={j.id} j={j} />
          ))}
        </div>
      </section>
      <section className="card flex items-center gap-4 p-6">
        <ShieldCheck className="h-8 w-8 text-accent" />
        <p className="text-sm text-neutral-500">
          <b className="text-neutral-900 dark:text-white">Built on trust.</b>{" "}
          Verified profiles, transparent journey details, in-app chat and
          community ratings.
        </p>
      </section>
    </div>
  );
}
