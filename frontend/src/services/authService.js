import { storage } from "./storageService";
import { api } from "./api";
const save = (r) => {
  storage.set("token", r.token);
  storage.set("currentUser", r.user);
  return r.user;
};
export const authService = {
  current: () => storage.get("currentUser"),
  login: async (email, password) =>
    save(
      await api("/auth/login", { method: "POST", body: { email, password } }),
    ),
  register: async ({ name, email, password }) =>
    save(
      await api("/auth/register", {
        method: "POST",
        body: { name, email, password },
      }),
    ),
  async updateProfile(d) {
    const u = await api("/users/me", {
      method: "PUT",
      body: {
        name: d.name,
        phone: d.phone,
        bio: d.bio,
        preferences: d.preferences,
      },
    });
    storage.set("currentUser", u);
    return u;
  },
  logout() {
    storage.remove("token");
    storage.remove("currentUser");
  },
};
