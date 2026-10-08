import { useState, useEffect } from "react";
import { Link, NavLink, useNavigate, useLocation } from "react-router-dom";
import { Moon, Sun, Route } from "lucide-react";
import { useApp } from "../context/AppContext";
import { notificationService } from "../services/journeyService";
export default function Navbar() {
  const { user, theme, toggleTheme, logout } = useApp();
  const nav = useNavigate();
  const [n, setN] = useState(0);
  const loc = useLocation();
  useEffect(() => {
    if (user)
      notificationService
        .unread()
        .then(setN)
        .catch(() => {});
    else setN(0);
  }, [user, loc.pathname]);
  const l = ({ isActive }) =>
    `text-sm font-medium ${isActive ? "text-accent" : "text-neutral-600 dark:text-neutral-300 hover:text-accent"}`;
  return (
    <header className="sticky top-0 z-40 border-b border-neutral-200/70 bg-stone-50/80 backdrop-blur dark:border-neutral-800 dark:bg-neutral-950/80">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-4">
        {/* <Link to="/" className="flex items-center gap-2 text-lg font-extrabold"> */}
          <Link
            to="/"
            aria-label="Sharing is Saving home"
            className="flex items-center"
          >
            <img
              src="/logo.svg"
              alt="Sharing is Saving"
              className="h-9 dark:hidden"
            />
            <img
              src="/logo-dark.svg"
              alt="Sharing is Saving"
              className="hidden h-9 dark:block"
            />
          </Link>
        {/* </Link> */}
        <nav className="flex items-center gap-4 sm:gap-6">
          <NavLink to="/find" className={l}>
            Find a Journey
          </NavLink>
          {user && (
            <>
              <NavLink to="/dashboard" className={l}>
                Dashboard
              </NavLink>
              <NavLink to="/messages" className={l}>
                Messages
              </NavLink>
              <NavLink to="/notifications" className={l}>
                Alerts
                {n > 0 && (
                  <span className="ml-1 rounded-full bg-accent px-1.5 text-xs text-white">
                    {n}
                  </span>
                )}
              </NavLink>
              <NavLink to="/profile" className={l}>
                Profile
              </NavLink>
            </>
          )}
        </nav>
        <div className="flex items-center gap-2">
          <button
            onClick={toggleTheme}
            aria-label="Toggle theme"
            className="btn btn-ghost !px-3"
          >
            {theme === "dark" ? (
              <Sun className="h-4 w-4" />
            ) : (
              <Moon className="h-4 w-4" />
            )}
          </button>
          {user ? (
            <button
              className="btn btn-ghost"
              onClick={() => {
                logout();
                nav("/");
              }}
            >
              Logout
            </button>
          ) : (
            <Link to="/login" className="btn btn-ghost">
              Login
            </Link>
          )}
          <Link to="/share" className="btn btn-primary hidden sm:inline-flex">
            Share Your Journey
          </Link>
        </div>
      </div>
    </header>
  );
}
