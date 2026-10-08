import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from "react";
import { storage } from "../services/storageService";
import { authService } from "../services/authService";
const Ctx = createContext(null);
export const useApp = () => useContext(Ctx);
export function AppProvider({ children }) {
  const [user, setUser] = useState(() => authService.current());
  const [theme, setTheme] = useState(() => storage.get("theme", "light"));
  const [toast, setToast] = useState(null);
  useEffect(() => {
    document.documentElement.classList.toggle("dark", theme === "dark");
    storage.set("theme", theme);
  }, [theme]);
  const notify = useCallback((msg, type = "ok") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  }, []);
  const value = {
    user,
    theme,
    notify,
    toggleTheme: () => setTheme((t) => (t === "dark" ? "light" : "dark")),
    login: async (e, p) => setUser(await authService.login(e, p)),
    register: async (d) => setUser(await authService.register(d)),
    updateProfile: async (d) => setUser(await authService.updateProfile(d)),
    logout: () => {
      authService.logout();
      setUser(null);
    },
  };
  return (
    <Ctx.Provider value={value}>
      {children}
      {toast && (
        <div
          role="status"
          className={`fixed bottom-20 left-1/2 z-50 -translate-x-1/2 rounded-xl px-5 py-3 text-sm font-medium text-white shadow-lg md:bottom-6 ${toast.type === "ok" ? "bg-neutral-900" : "bg-red-600"}`}
        >
          {toast.type === "ok" ? "✓ " : "⚠ "}
          {toast.msg}
        </div>
      )}
    </Ctx.Provider>
  );
}
