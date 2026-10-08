import { api } from "./api";
export const fmtDur = (m) => `${Math.floor(m / 60)}h ${m % 60}m`;
export const mapService = {
  search: (q) => api("/locations/search?q=" + encodeURIComponent(q)),
  reverse: (lat, lng) => api(`/locations/reverse?lat=${lat}&lng=${lng}`),
  route: (a, b) =>
    api(
      `/routes?fromLat=${a.lat}&fromLng=${a.lng}&toLat=${b.lat}&toLng=${b.lng}`,
    ),
  live: (id) => api(`/journeys/${id}/location`),
  share: (id, lat, lng) =>
    api(`/journeys/${id}/location`, { method: "POST", body: { lat, lng } }),
  stops: (id) => api(`/journeys/${id}/stops`),
  pickUp: (id, uid) =>
    api(`/journeys/${id}/passengers/${uid}/pickup`, { method: "POST" }),
};
