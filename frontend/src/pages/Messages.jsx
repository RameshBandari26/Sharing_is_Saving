import { useState } from "react";
import { Link } from "react-router-dom";
import { useApp } from "../context/AppContext";
import { messageService, journeyService } from "../services/journeyService";
import useAsync from "../hooks/useAsync";
export default function Messages() {
  const { user, notify } = useApp();
  const [sel, setSel] = useState(null);
  const [text, setText] = useState("");
  const { data, loading, error, reload } = useAsync(async () => {
    const cs = await messageService.list();
    const js = await Promise.all(
      cs.map((c) => journeyService.getJourneyById(c.journeyId)),
    );
    return cs.map((c, i) => ({
      ...c,
      title: js[i] ? `${js[i].from} → ${js[i].to}` : "Journey",
    }));
  }, []);
  const convs = data || [];
  const c = convs.find((x) => x.id === sel) || null;
  const send = async (e) => {
    e.preventDefault();
    if (!text.trim()) return;
    try {
      await messageService.send(c.id, text.trim());
      setText("");
      notify("Message sent.");
      reload();
    } catch (x) {
      notify(x.message, "err");
    }
  };
  if (error)
    return (
      <div className="mx-auto max-w-md px-4 py-24 text-center text-red-600">
        {error}
      </div>
    );
  if (loading && !data)
    return (
      <div className="px-4 py-24 text-center text-neutral-500">
        Loading messages…
      </div>
    );
  if (!convs.length)
    return (
      <div className="mx-auto max-w-md px-4 py-24 text-center">
        <h1 className="mb-2 text-2xl font-bold">No conversations yet</h1>
        <p className="mb-6 text-neutral-500">
          Join a journey to start chatting with the host.
        </p>
        <Link to="/find" className="btn btn-primary">
          Find a Journey
        </Link>
      </div>
    );
  return (
    <div className="mx-auto grid max-w-5xl gap-4 px-4 py-8 md:grid-cols-3">
      <ul
        className={`card divide-y divide-neutral-200 dark:divide-neutral-800 ${c ? "hidden md:block" : ""}`}
      >
        {convs.map((x) => (
          <li key={x.id}>
            <button
              className="w-full p-4 text-left hover:bg-neutral-50 dark:hover:bg-neutral-800"
              onClick={() => setSel(x.id)}
            >
              <div className="font-semibold">{x.title}</div>
              <div className="truncate text-sm text-neutral-500">
                {x.messages[x.messages.length - 1]?.text}
              </div>
            </button>
          </li>
        ))}
      </ul>
      <div
        className={`card flex h-[70vh] flex-col md:col-span-2 ${c ? "" : "hidden md:flex"}`}
      >
        {c ? (
          <>
            <div className="flex items-center justify-between border-b border-neutral-200 p-4 dark:border-neutral-800">
              <div>
                <button
                  className="mr-2 text-accent md:hidden"
                  onClick={() => setSel(null)}
                >
                  ← Back
                </button>
                <b>{c.title}</b>
              </div>
              <Link
                className="text-sm text-accent"
                to={`/journey/${c.journeyId}`}
              >
                View Journey
              </Link>
            </div>
            <div className="flex-1 space-y-2 overflow-y-auto p-4">
              {c.messages.map((m) => (
                <div
                  key={m.id}
                  className={`flex ${m.from === user.id ? "justify-end" : ""}`}
                >
                  <div
                    className={`max-w-[75%] rounded-2xl px-4 py-2 text-sm ${m.from === user.id ? "bg-accent text-white" : "bg-neutral-100 dark:bg-neutral-800"}`}
                  >
                    {m.text}
                    <div className="mt-1 text-[10px] opacity-70">
                      {new Date(m.at).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <form
              onSubmit={send}
              className="flex gap-2 border-t border-neutral-200 p-3 dark:border-neutral-800"
            >
              <input
                aria-label="Message"
                className="input"
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder="Type a message"
              />
              <button className="btn btn-primary">Send</button>
            </form>
          </>
        ) : (
          <div className="m-auto text-neutral-500">Select a conversation</div>
        )}
      </div>
    </div>
  );
}
