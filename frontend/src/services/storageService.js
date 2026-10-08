const P = "shareride:";
export const storage = {
  get(k, f = null) {
    try {
      const v = localStorage.getItem(P + k);
      return v ? JSON.parse(v) : f;
    } catch {
      return f;
    }
  },
  set(k, v) {
    try {
      localStorage.setItem(P + k, JSON.stringify(v));
    } catch {
      /* ignore */
    }
  },
  remove(k) {
    try {
      localStorage.removeItem(P + k);
    } catch {
      /* ignore */
    }
  },
};
