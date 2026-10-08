import { Link } from "react-router-dom";
import { useApp } from "../context/AppContext";
import { journeyService } from "../services/journeyService";
import JourneyCard from "../components/JourneyCard";
import useAsync from "../hooks/useAsync";
export default function Dashboard() {
  const { user } = useApp();
  const { data, error } = useAsync(() => journeyService.getByUser(), []);
  const mine = data || [];
  const joined = mine.filter((j) => j.hostId !== user.id),
    shared = mine.filter((j) => j.hostId === user.id);
  const h = new Date().getHours();
  const g =
    h < 12 ? "Good morning" : h < 18 ? "Good afternoon" : "Good evening";
  return (
    <div className="mx-auto max-w-6xl space-y-8 px-4 py-10">
      <div>
        <h1 className="text-3xl font-extrabold">
          {g}, {user.name.split(" ")[0]} 👋
        </h1>
        <p className="text-neutral-500">Ready for your next journey?</p>
      </div>
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        {[
          ["Joined", joined.length],
          ["Shared", shared.length],
          ["Completed", user.totalJourneys],
          ["Rating", user.rating],
        ].map(([a, b]) => (
          <div key={a} className="card p-5">
            <div className="text-sm text-neutral-500">{a}</div>
            <div className="text-3xl font-extrabold">{b}</div>
          </div>
        ))}
      </div>
      {error && (
        <p role="alert" className="text-red-600">
          {error}
        </p>
      )}
      <div className="flex flex-wrap gap-2">
        <Link to="/find" className="btn btn-primary">
          Find a Journey
        </Link>
        <Link to="/share" className="btn btn-ghost">
          Share Your Journey
        </Link>
        <Link to="/messages" className="btn btn-ghost">
          Messages
        </Link>
      </div>
      {[
        ["Joined journeys", joined],
        ["Shared journeys", shared],
      ].map(([t, l]) => (
        <section key={t}>
          <h2 className="mb-3 text-xl font-bold">{t}</h2>
          {l.length ? (
            <div className="space-y-4">
              {l.map((j) => (
                <JourneyCard key={j.id} j={j} />
              ))}
            </div>
          ) : (
            <div className="card p-6 text-sm text-neutral-500">
              Nothing here yet.
            </div>
          )}
        </section>
      ))}
    </div>
  );
}
