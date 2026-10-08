import { storage } from "./storageService";
const BASE = import.meta.env.VITE_API_URL || "http://localhost:8080/api";
export async function api(path, { method = "GET", body } = {}) {
  const t = storage.get("token");
  let res;
  try {
    res = await fetch(BASE + path, {
      method,
      headers: {
        "Content-Type": "application/json",
        ...(t ? { Authorization: `Bearer ${t}` } : {}),
      },
      body: body ? JSON.stringify(body) : undefined,
    });
  } catch {
    throw new Error("Cannot reach the server. Is the backend running?");
  }
  const text = await res.text();
  let data = null;
  try {
    data = text ? JSON.parse(text) : null;
  } catch {
    /* non-JSON */
  }
  if (!res.ok) {
    if (res.status === 401 && t) {
      storage.remove("token");
      storage.remove("currentUser");
    }
    throw new Error(
      data?.errors?.[0]?.defaultMessage ||
        data?.message ||
        `Request failed (${res.status})`,
    );
  }
  return data;
}
