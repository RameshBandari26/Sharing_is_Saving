import { Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import ProtectedRoute from "./routes/ProtectedRoute";
import Home from "./pages/Home";
import Find from "./pages/Find";
import JourneyDetail from "./pages/JourneyDetail";
import Share from "./pages/Share";
import Auth from "./pages/Auth";
import Dashboard from "./pages/Dashboard";
import Profile from "./pages/Profile";
import Notifications from "./pages/Notifications";
import Track from "./pages/Track";
import Terms from "./pages/Terms";
import { Link } from "react-router-dom";
import Messages from "./pages/Messages";
import NotFound from "./pages/NotFound";
const P = (c) => <ProtectedRoute>{c}</ProtectedRoute>;
export default function App() {
  return (
    <>
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/find" element={<Find />} />
        <Route path="/journey/:id" element={<JourneyDetail />} />
        <Route path="/login" element={<Auth />} />
        <Route path="/register" element={<Auth mode="register" />} />
        <Route path="/share" element={P(<Share />)} />
        <Route path="/dashboard" element={P(<Dashboard />)} />
        <Route path="/my-journeys" element={P(<Dashboard />)} />
        <Route path="/messages" element={P(<Messages />)} />
        <Route path="/profile" element={P(<Profile />)} />
        <Route path="/notifications" element={P(<Notifications />)} />
        <Route path="/track/:id" element={P(<Track />)} />
        <Route path="/terms" element={<Terms />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
      <footer className="mx-auto mt-16 flex max-w-6xl justify-between border-t border-neutral-200 px-4 py-6 text-sm text-neutral-500 dark:border-neutral-800">
        <span>© 2026 SharingIsSaving</span>
        <Link to="/terms" className="hover:text-accent">
          Terms & Conditions
        </Link>
      </footer>
    </>
  );
}
