import { Link } from "react-router-dom";
import { Star, BadgeCheck, ArrowRight } from "lucide-react";
export const fmtDate = (d) =>
  new Date(d + "T00:00").toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
  });
export default function JourneyCard({ j }) {
  return (
    <article className="card flex flex-col gap-4 p-5 transition hover:-translate-y-0.5 hover:shadow-lg md:flex-row md:items-center md:justify-between">
      <div className="space-y-2">
        <div className="flex flex-wrap items-center gap-2 text-lg font-bold">
          {j.from}
          <ArrowRight className="h-4 w-4 text-accent" />
          {j.to}
          {j.verified && (
            <span className="pill inline-flex items-center gap-1">
              <BadgeCheck className="h-3 w-3" />
              Verified
            </span>
          )}
        </div>
        <p className="text-sm text-neutral-500">
          {fmtDate(j.date)} · {j.departureTime} · {j.pickup} → {j.drop}
        </p>
        <p className="text-sm">
          Host <b>{j.host?.name}</b>{" "}
          <Star className="inline h-3.5 w-3.5 fill-amber-400 text-amber-400" />{" "}
          {j.host?.rating} · {j.vehicle.model}
        </p>
      </div>
      <div className="flex items-center justify-between gap-6 md:flex-col md:items-end">
        <div className="md:text-right">
          <div className="text-2xl font-extrabold">₹{j.contribution}</div>
          <div className="text-xs text-neutral-500">
            per person ·{" "}
            {j.status === "FULL"
              ? "Full"
              : `${j.seatsAvailable} seats available`}
          </div>
        </div>
        <Link to={`/journey/${j.id}`} className="btn btn-primary">
          View Journey
        </Link>
      </div>
    </article>
  );
}
