import { storage } from "../services/storageService";
const av = (n) =>
  `https://api.dicebear.com/9.x/initials/svg?seed=${encodeURIComponent(n)}`;
const mk = (id, name, rating, trips, bio) => ({
  id,
  name,
  email: `${name.split(" ")[0].toLowerCase()}@example.com`,
  avatar: av(name),
  phone: "+91 98xxxxxx" + id.slice(1).padStart(2, "0"),
  rating,
  totalJourneys: trips,
  verified: true,
  memberSince: "2023",
  bio,
});
export const users = [
  mk(
    "u1",
    "Ramesh",
    4.8,
    18,
    "Weekend traveller between Hyderabad and Vijayawada.",
  ),
  mk(
    "u2",
    "Mahesh ",
    4.8,
    42,
    "Drive to Vijayawada every week. Happy to share seats.",
  ),
  mk(
    "u3",
    "Anitha Reddy",
    4.9,
    31,
    "Software engineer commuting to Bengaluru.",
  ),
  mk("u4", "Kiran Varma", 4.6, 12, "Frequent Chennai–Bengaluru traveller."),
  mk("u5", "Priya Nair", 4.7, 25, "Love good conversation on long drives."),
];
const R = [
  [
    "Hyderabad",
    "Vijayawada",
    "LB Nagar",
    "Benz Circle",
    "5h 30m",
    450,
    "Maruti Baleno",
  ],
  [
    "Hyderabad",
    "Bengaluru",
    "Gachibowli",
    "Majestic",
    "10h 00m",
    900,
    "Hyundai Creta",
  ],
  ["Hyderabad", "Warangal", "Uppal", "Hanamkonda", "3h 00m", 350, "Honda City"],
  [
    "Bengaluru",
    "Chennai",
    "Silk Board",
    "Koyambedu",
    "6h 30m",
    600,
    "Toyota Innova",
  ],
  [
    "Chennai",
    "Bengaluru",
    "Guindy",
    "Madiwala",
    "6h 30m",
    600,
    "Maruti Ertiga",
  ],
  [
    "Vijayawada",
    "Visakhapatnam",
    "Governorpet",
    "MVP Colony",
    "6h 30m",
    550,
    "Kia Seltos",
  ],
  ["Guntur", "Hyderabad", "Brodipet", "Miyapur", "5h 00m", 400, "Tata Nexon"],
  ["Tirupati", "Chennai", "Alipiri", "T Nagar", "3h 30m", 350, "Hyundai i20"],
  [
    "Nellore",
    "Bengaluru",
    "Stonehousepet",
    "Hebbal",
    "7h 00m",
    700,
    "Honda Amaze",
  ],
  [
    "Hyderabad",
    "Vijayawada",
    "Kukatpally",
    "Governorpet",
    "5h 15m",
    420,
    "Maruti Swift",
  ],
];
const day = (d) => new Date(Date.now() + d * 864e5).toISOString().slice(0, 10);
export const journeys = R.map((r, i) => ({
  id: `j${i + 1}`,
  hostId: ["u2", "u3", "u5", "u4", "u4", "u5", "u3", "u2", "u3", "u1"][i],
  from: r[0],
  to: r[1],
  pickup: r[2],
  drop: r[3],
  date: day(i % 4),
  departureTime: [
    "08:00",
    "07:00",
    "06:30",
    "09:00",
    "14:00",
    "05:30",
    "10:00",
    "07:30",
    "20:00",
    "06:00",
  ][i],
  duration: r[4],
  vehicle: {
    model: r[6],
    type: "Hatchback",
    color: "White",
    number: "TS 09 AB 12" + i,
  },
  seatsTotal: 3,
  seatsAvailable: i === 5 ? 0 : 2 + (i % 2),
  contribution: r[5],
  status: i === 5 ? "FULL" : "UPCOMING",
  verified: true,
  passengers: [],
  createdAt: new Date().toISOString(),
}));
export function initSeed() {
  if (storage.get("users")) return;
  storage.set("users", users);
  storage.set("journeys", journeys);
  storage.set("conversations", []);
  storage.set("notifications", []);
}
