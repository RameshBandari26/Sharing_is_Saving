import { useSearchParams, Link } from "react-router-dom";
import { journeyService } from "../services/journeyService";
import JourneyCard from "../components/JourneyCard";
import { SearchBar } from "./Home";
import useAsync from "../hooks/useAsync";
export default function Find() {
  const [sp, setSp] = useSearchParams();
  const q = Object.fromEntries(sp);
  const { data, loading, error } = useAsync(
    () =>
      journeyService.getJourneys({
        ...q,
        seats: +q.seats || 1,
        maxPrice: +q.maxPrice || 0,
      }),
    [sp.toString()],
  );
  const res = data || [];
  const set = (k, v) => {
    const n = new URLSearchParams(sp);
    v ? n.set(k, v) : n.delete(k);
    setSp(n);
  };
  return (
    <div className="mx-auto max-w-6xl space-y-6 px-4 py-8">
      <SearchBar
        key={sp.toString()}
        init={{
          from: q.from || "",
          to: q.to || "",
          date: q.date || "",
          seats: q.seats || 1,
        }}
        onSearch={(f) =>
          setSp(new URLSearchParams(Object.entries(f).filter(([, v]) => v)))
        }
      />
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="font-semibold">
          {loading ? "Searching…" : `${res.length} journeys found`}
        </p>
        <div className="flex gap-2">
          <select
            aria-label="Max contribution"
            className="input !w-auto"
            value={q.maxPrice || ""}
            onChange={(e) => set("maxPrice", e.target.value)}
          >
            <option value="">Any contribution</option>
            <option value="400">Up to ₹400</option>
            <option value="600">Up to ₹600</option>
            <option value="900">Up to ₹900</option>
          </select>
          <select
            aria-label="Sort"
            className="input !w-auto"
            value={q.sort || "recommended"}
            onChange={(e) => set("sort", e.target.value)}
          >
            <option value="recommended">Recommended</option>
            <option value="earliest">Earliest departure</option>
            <option value="lowest">Lowest contribution</option>
            <option value="rated">Highest rated</option>
          </select>
        </div>
      </div>
      {error ? (
        <div className="card p-6 text-red-600">{error}</div>
      ) : loading ? (
        <div className="card p-6 text-neutral-500">Loading journeys…</div>
      ) : res.length ? (
        <div className="space-y-4">
          {res.map((j) => (
            <JourneyCard key={j.id} j={j} />
          ))}
        </div>
      ) : (
        <div className="card p-12 text-center">
          <h2 className="text-xl font-bold">No journeys found</h2>
          <p className="mb-4 text-neutral-500">Try another route or date.</p>
          <button className="btn btn-primary" onClick={() => setSp({})}>
            Change Search
          </button>
        </div>
      )}
      <Link to="/share" className="btn btn-ghost">
        Can't find one? Share Your Journey
      </Link>
    </div>
  );
}
