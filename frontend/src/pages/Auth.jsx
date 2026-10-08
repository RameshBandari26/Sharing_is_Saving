import { useState } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { useApp } from "../context/AppContext";
export default function Auth({ mode = "login" }) {
  const { login, register, notify } = useApp();
  const nav = useNavigate();
  const loc = useLocation();
  const [f, setF] = useState({
    name: "",
    email: mode === "login" ? "ramesh@example.com" : "",
    password: mode === "login" ? "password123" : "",
  });
  const [err, setErr] = useState("");
  const [busy, setBusy] = useState(false);
  const s = (k) => (e) => setF({ ...f, [k]: e.target.value });
  const submit = async (e) => {
    e.preventDefault();
    setErr("");
    if (!f.email.includes("@")) return setErr("Enter a valid email");
    if (f.password.length < 8)
      return setErr("Password must be at least 8 characters");
    if (mode === "register" && !f.name.trim())
      return setErr("Name is required");
    setBusy(true);
    try {
      mode === "login" ? await login(f.email, f.password) : await register(f);
      notify("Welcome to ShareRide");
      nav(loc.state?.from || "/dashboard", { replace: true });
    } catch (x) {
      setErr(x.message);
      setBusy(false);
    }
  };
  return (
    <div className="mx-auto max-w-md px-4 py-16">
      <form onSubmit={submit} className="card space-y-4 p-6">
        <h1 className="text-2xl font-bold">
          {mode === "login" ? "Welcome back" : "Join the community"}
        </h1>
        {mode === "register" && (
          <div>
            <label className="label" htmlFor="n">
              Name
            </label>
            <input
              id="n"
              className="input"
              value={f.name}
              onChange={s("name")}
            />
          </div>
        )}
        <div>
          <label className="label" htmlFor="e">
            Email
          </label>
          <input
            id="e"
            className="input"
            value={f.email}
            onChange={s("email")}
          />
        </div>
        <div>
          <label className="label" htmlFor="pw">
            Password
          </label>
          <input
            id="pw"
            type="password"
            className="input"
            value={f.password}
            onChange={s("password")}
          />
        </div>
        {err && (
          <p role="alert" className="text-sm text-red-600">
            {err}
          </p>
        )}
        <button className="btn btn-primary w-full" disabled={busy}>
          {busy
            ? "Please wait…"
            : mode === "login"
              ? "Login"
              : "Create account"}
        </button>
        {mode === "login" ? (
          <p className="text-sm text-neutral-500">
            Demo: ramesh@example.com / password123 ·{" "}
            <Link className="text-accent" to="/register">
              Register
            </Link>
          </p>
        ) : (
          <p className="text-sm text-neutral-500">
            Demo auth only.{" "}
            <Link className="text-accent" to="/login">
              Login
            </Link>
          </p>
        )}
      </form>
    </div>
  );
}
