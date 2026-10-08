import { Link } from "react-router-dom";
import { notificationService } from "../services/journeyService";
import useAsync from "../hooks/useAsync";
export default function Notifications() {
  const { data, loading, error, reload } = useAsync(
    () => notificationService.list(),
    [],
  );
  const list = data || [];
  const markAll = async () => {
    await notificationService.markAllRead();
    reload();
  };
  return (
    <div className="mx-auto max-w-2xl space-y-4 px-4 py-10">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-extrabold">Notifications</h1>
        <button className="btn btn-ghost" onClick={markAll}>
          Mark all read
        </button>
      </div>
      {error ? (
        <div className="card p-6 text-red-600">{error}</div>
      ) : loading && !data ? (
        <div className="card p-6 text-neutral-500">Loading…</div>
      ) : list.length ? (
        <ul className="space-y-3">
          {list.map((n) => (
            <li
              key={n.id}
              className={`card p-4 ${n.read ? "" : "border-accent"}`}
            >
              <p className="text-sm">{n.text}</p>
              <div className="mt-1 flex justify-between text-xs text-neutral-500">
                <span>{new Date(n.at).toLocaleString()}</span>
                {n.link && (
                  <Link className="font-semibold text-accent" to={n.link}>
                    {n.link.startsWith("/track") ? "Track vehicle →" : "View →"}
                  </Link>
                )}
              </div>
            </li>
          ))}
        </ul>
      ) : (
        <div className="card p-8 text-center text-neutral-500">
          You're all caught up.
        </div>
      )}
    </div>
  );
}
