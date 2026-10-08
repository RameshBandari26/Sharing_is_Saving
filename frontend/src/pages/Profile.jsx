import { useState } from "react";
import { Star, BadgeCheck } from "lucide-react";
import { useApp } from "../context/AppContext";
export default function Profile() {
  const { user, updateProfile, notify } = useApp();
  const [f, setF] = useState({
    name: user.name,
    phone: user.phone || "",
    bio: user.bio || "",
    preferences: user.preferences || "",
  });
  const [err, setErr] = useState({});
  const [busy, setBusy] = useState(false);
  const s = (k) => (e) => setF({ ...f, [k]: e.target.value });
  const save = async (e) => {
    e.preventDefault();
    const x = {};
    if (!f.name.trim()) x.name = "Name is required";
    if (f.phone && !/^[+\d][\d\s-]{7,}$/.test(f.phone))
      x.phone = "Enter a valid phone number";
    setErr(x);
    if (Object.keys(x).length) return;
    setBusy(true);
    await updateProfile({ ...f, name: f.name.trim() });
    setBusy(false);
    notify("Profile updated.");
  };
  const E = (k) =>
    err[k] && <p className="mt-1 text-xs text-red-600">{err[k]}</p>;
  return (
    <div className="mx-auto max-w-3xl space-y-6 px-4 py-10">
      <div className="card flex items-center gap-5 p-6">
        <img
          src={user.avatar}
          alt={user.name}
          className="h-20 w-20 rounded-full"
        />
        <div>
          <h1 className="text-2xl font-extrabold">{user.name}</h1>
          <p className="text-sm">
            <Star className="inline h-4 w-4 fill-amber-400 text-amber-400" />{" "}
            {user.rating} · {user.totalJourneys} journeys · Member since{" "}
            {user.memberSince}
          </p>
          <p className="text-sm text-neutral-500">
            <BadgeCheck className="inline h-4 w-4 text-accent" />{" "}
            {user.verified ? "Verified profile" : "Not verified yet"} ·{" "}
            {user.email}
          </p>
        </div>
      </div>
      <form onSubmit={save} className="card space-y-4 p-6">
        <h2 className="text-lg font-bold">Edit profile details</h2>
        <div>
          <label className="label" htmlFor="pn">
            Name
          </label>
          <input
            id="pn"
            className="input"
            value={f.name}
            onChange={s("name")}
          />
          {E("name")}
        </div>
        <div>
          <label className="label" htmlFor="pp">
            Phone
          </label>
          <input
            id="pp"
            className="input"
            value={f.phone}
            onChange={s("phone")}
            placeholder="+91 98765 43210"
          />
          {E("phone")}
        </div>
        <div>
          <label className="label" htmlFor="pb">
            About
          </label>
          <textarea
            id="pb"
            rows={3}
            className="input"
            value={f.bio}
            onChange={s("bio")}
          />
        </div>
        <div>
          <label className="label" htmlFor="pt">
            Travel preferences
          </label>
          <input
            id="pt"
            className="input"
            value={f.preferences}
            onChange={s("preferences")}
            placeholder="e.g. Quiet rides, no smoking, music OK"
          />
        </div>
        <button className="btn btn-primary" disabled={busy}>
          {busy ? "Saving…" : "Save changes"}
        </button>
      </form>
    </div>
  );
}
