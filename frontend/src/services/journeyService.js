import { api } from "./api";
// Maps the backend shape to the shape the UI components use.
const norm = (j) => ({
  ...j,
  vehicle: {
    model: j.vehicleModel,
    type: j.vehicleType,
    number: j.vehicleNumber,
    color: "",
  },
  passengers: (j.passengerIds || []).map((userId) => ({ userId })),
});
const qs = (o) => {
  const p = new URLSearchParams(
    Object.entries(o).filter(([, v]) => v !== "" && v != null && v !== 0),
  );
  return p.toString() ? "?" + p : "";
};
export const journeyService = {
  async getJourneys(f = {}) {
    return (await api("/journeys" + qs(f))).map(norm);
  },
  async getJourneyById(id) {
    try {
      return norm(await api("/journeys/" + id));
    } catch (e) {
      if (e.message.startsWith("Cannot reach")) throw e;
      return null;
    }
  },
  async getByUser() {
    return (await api("/journeys/mine")).map(norm);
  },
  async createJourney(d) {
    return norm(
      await api("/journeys", {
        method: "POST",
        body: {
          from: d.from,
          to: d.to,
          date: d.date,
          time: d.time,
          model: d.model,
          vehicleType: d.vehicleType,
          number: d.number,
          seats: +d.seats,
          contribution: +d.contribution,
          fromLat: d.fromPt.lat,
          fromLng: d.fromPt.lng,
          toLat: d.toPt.lat,
          toLng: d.toPt.lng,
        },
      }),
    );
  },
  async joinJourney(id, body) {
    return norm(await api(`/journeys/${id}/join`, { method: "POST", body }));
  },
  async startJourney(id) {
    return norm(await api(`/journeys/${id}/start`, { method: "POST" }));
  },
};
export const messageService = {
  async list() {
    return (await api("/conversations")).map((c) => ({
      ...c,
      messages: c.messages.map((m) => ({ ...m, from: m.senderId })),
    }));
  },
  send: (cid, text) =>
    api(`/conversations/${cid}/messages`, { method: "POST", body: { text } }),
};
export const notificationService = {
  list: () => api("/notifications"),
  unread: async () => (await api("/notifications/unread-count")).count,
  markAllRead: () => api("/notifications/read-all", { method: "POST" }),
};
