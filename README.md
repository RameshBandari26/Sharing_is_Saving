# Sharing is Saving 🚗

A community journey-sharing web app. If you're already travelling somewhere, share your empty seats. If you're heading the same way, find the journey and join it. Travel together, split the cost, and save.

**🔗 Live app:** https://sharing-is-saving.vercel.app

> The backend runs on a free Render plan, so the first request after a period of inactivity can take up to a minute while the server wakes up.

---

## ✨ Features

- **Share your journey:** a step-by-step flow with place search, an automatic current-location start, a route map, distance and travel time.
- **Find a journey:** search by route and date, with sorting and contribution filters.
- **Join with pickup and drop:** passengers choose their own pickup and drop locations when they join.
- **Start journey and live tracking:** the host starts the journey and shares live GPS, and passengers see the host moving on the map.
- **Pickup and drop-off flow:** directions go to each passenger's pickup point, then their drop location. The journey completes automatically after the last drop-off, or the host can complete it manually.
- **Notifications:** vehicle started, passenger picked up, journey completed and more.
- **In-app chat** between the host and each passenger.
- **Profile management**, **dark mode**, responsive layouts and a Terms & Conditions page.

## 🧰 Tech stack

| Layer | Technology |
|---|---|
| Frontend | React 18, Vite 5, Tailwind CSS 3, React Router 6, Leaflet / React-Leaflet |
| Backend | Java 17, Spring Boot 3, Spring Security (JWT), Spring Data JPA |
| Database | MySQL 8 (hosted on Aiven) |
| Maps | OpenStreetMap tiles, Nominatim (place search), OSRM (routing) |
| Hosting | Vercel (frontend), Render (backend, Docker) |

## 🗂️ Repository structure

```text
Sharing_is_Saving/
├── frontend/   React + Vite web app
└── backend/    Spring Boot REST API (with Dockerfile)
```

## 🚀 Run locally

**Requirements:** Node.js 18+, JDK 17+, Maven, and a MySQL 8 database.

### 1. Backend

```bash
cd backend
mvn spring-boot:run
```

The API starts on http://localhost:9191 and creates its tables automatically.

By default it connects to a local MySQL (`root` / `root`). To use a different database, set these environment variables before starting:

| Variable | Purpose | Default |
|---|---|---|
| `DB_URL` | JDBC URL | local MySQL |
| `DB_USER` | Database user | `root` |
| `DB_PASSWORD` | Database password | `root` |
| `JWT_SECRET` | Token signing key, 32+ characters | development value (change it) |
| `CORS_ORIGIN` | Allowed frontend URL | `http://localhost:5173` |
| `PORT` | Server port | `9191` |

### 2. Frontend

```bash
cd frontend
npm install
```

Create `frontend/.env`:

```env
VITE_API_URL=http://localhost:9191/api
```

Then start it:

```bash
npm run dev
```

Open http://localhost:5173.

> This project needs **Tailwind CSS 3.4.10** and **Vite 5**. Do not run `npm audit fix --force`, because it upgrades them to versions the project doesn't support.

## ☁️ Deployment

**Database: Aiven MySQL**
- Create a MySQL service in Aiven and copy its host, port, database name, user and password.
- JDBC URL format: `jdbc:mysql://HOST:PORT/DBNAME?sslMode=REQUIRED`
- If Aiven has an IP allow-list for your plan, allow Render's outgoing traffic.

**Backend: Render (Docker)**
- Root Directory: `backend`
- Dockerfile Path: `./backend/Dockerfile`
- Health Check Path: `/api/journeys`
- Environment variables: `DB_URL`, `DB_USER`, `DB_PASSWORD`, `JWT_SECRET`, `CORS_ORIGIN` (your Vercel URL, with no trailing slash)

**Frontend: Vercel**
- Root Directory: `frontend`
- Framework preset: Vite
- Environment variable: `VITE_API_URL=https://YOUR-BACKEND.onrender.com/api`
- `frontend/vercel.json` rewrites all routes to `index.html` so page refreshes work.

Vite reads `VITE_API_URL` at build time, so redeploy the frontend after changing it.

## 🔌 Main API endpoints

| Method | Endpoint | Purpose |
|---|---|---|
| POST | `/api/auth/register`, `/api/auth/login` | Sign up and log in |
| GET | `/api/journeys` | Search journeys (public) |
| GET | `/api/journeys/{id}` | Journey details (public) |
| POST | `/api/journeys` | Publish a journey |
| POST | `/api/journeys/{id}/join` | Join with pickup and drop locations |
| POST | `/api/journeys/{id}/start` | Host starts the journey |
| GET / POST | `/api/journeys/{id}/location` | Host's live location |
| GET | `/api/journeys/{id}/stops` | Passenger pickup and drop stops |
| POST | `/api/journeys/{id}/passengers/{userId}/pickup` | Mark passenger picked up |
| POST | `/api/journeys/{id}/passengers/{userId}/dropoff` | Mark passenger dropped off |
| POST | `/api/journeys/{id}/complete` | Complete the journey |
| GET | `/api/locations/search`, `/api/locations/reverse` | Place search and reverse lookup |
| GET | `/api/routes` | Route, distance and time (public) |
| GET / POST | `/api/conversations`, `/api/conversations/{id}/messages` | Chat |
| GET / POST | `/api/notifications`, `/api/notifications/read-all` | Notifications |

All endpoints except the public ones need a `Bearer` token from login.

## ⚠️ Known limitations

- Live location works only while the host keeps the tracking page open. Web apps can't track in the background once the screen locks.
- Maps use the free public OpenStreetMap services (Nominatim, OSRM), which have fair-use limits and aren't meant for heavy production traffic.
- Directions show a route line with distance and time, not turn-by-turn instructions.
- The backend creates demo users on first run if the database is empty. Remove them before real use.

## 🛣️ Roadmap

- Ratings and reviews after completed journeys
- Safety, Help and About pages
- Map previews on search results
- Push notifications

## 👤 Author

Built by **Ramesh Bandari**  
GitHub: [@RameshBandari26](https://github.com/RameshBandari26)

## 📄 License

MIT © Ramesh Bandari
