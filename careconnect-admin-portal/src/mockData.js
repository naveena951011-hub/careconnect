export const SEED_ALERTS = [
  {
    id: 1041, resident: "Meera Iyer", flat: "B-302", block: "Tower B", category: "Fall / Medical",
    status: "TRIGGERED", address: "Near Tower B, Green Valley", lat: 18.5245, lng: 73.8523, createdAgoSec: 42,
    updates: [
      { id: 1, author: "Meera Iyer", type: "TEXT", message: "Fell near the kitchen, can't stand up.", agoSec: 42 },
    ],
  },
  {
    id: 1040, resident: "Arjun Rao", flat: "A-104", block: "Tower A", category: "Security Concern",
    status: "TRIGGERED", address: "Gate 2, Green Valley", lat: 18.5231, lng: 73.8541, createdAgoSec: 210,
    updates: [
      { id: 2, author: "Arjun Rao", type: "TEXT", message: "Unknown person loitering near Gate 2 for 10+ minutes.", agoSec: 210 },
      { id: 3, author: "Security — Ramesh", type: "TEXT", message: "On my way, checking gate now.", agoSec: 90 },
    ],
  },
  {
    id: 1037, resident: "Kavita Nair", flat: "C-501", block: "Tower C", category: "Fire",
    status: "RESOLVED", address: "Tower C, 5th Floor", lat: 18.5219, lng: 73.8558, createdAgoSec: 5400,
    updates: [
      { id: 4, author: "Kavita Nair", type: "TEXT", message: "Smoke detector went off, checking now.", agoSec: 5400 },
      { id: 5, author: "Kavita Nair", type: "TEXT", message: "False alarm — burnt toast. All clear.", agoSec: 5100 },
    ],
  },
  {
    id: 1032, resident: "Farhan Sheikh", flat: "D-118", block: "Tower D", category: "Medical",
    status: "RESOLVED", address: "Tower D, Ground Floor", lat: 18.5203, lng: 73.8512, createdAgoSec: 30600,
    updates: [{ id: 6, author: "Farhan Sheikh", type: "TEXT", message: "Chest pain, called ambulance myself.", agoSec: 30600 }],
  },
];

export const SEED_APPROVALS = [
  { id: 1, resident: "Rohit Sen", email: "rohit.sen@example.com", flat: "A-207", block: "Tower A", requestedAgoMin: 14, status: "PENDING" },
  { id: 2, resident: "Priya Sharma", email: "priya.sharma@example.com", flat: "B-302", block: "Tower B", requestedAgoMin: 48, status: "PENDING" },
  { id: 3, resident: "Naveen K", email: "naveen.k@example.com", flat: "D-118", block: "Tower D", requestedAgoMin: 130, status: "PENDING" },
];

export const SEED_DIRECTORY = [
  { id: 101, resident: "Meera Iyer", flat: "B-302", block: "Tower B", phone: "9876500001", guardians: 2, status: "APPROVED" },
  { id: 102, resident: "Arjun Rao", flat: "A-104", block: "Tower A", phone: "9876500002", guardians: 1, status: "APPROVED" },
  { id: 103, resident: "Kavita Nair", flat: "C-501", block: "Tower C", phone: "9876500003", guardians: 2, status: "APPROVED" },
  { id: 104, resident: "Farhan Sheikh", flat: "D-118", block: "Tower D", phone: "9876500004", guardians: 1, status: "APPROVED" },
  { id: 105, resident: "Leela Menon", flat: "A-210", block: "Tower A", phone: "9876500005", guardians: 0, status: "APPROVED" },
];

export const SEED_STATS = { societies: 3, blocks: 11, flats: 214, residents: 168, volunteers: 22, security: 9 };

export const SEED_SOCIETIES = [
  {
    id: 1, name: "Green Valley", city: "Pune",
    blocks: [
      { id: 11, name: "Tower A", floors: 8, flats: 32, occupied: 27 },
      { id: 12, name: "Tower B", floors: 10, flats: 40, occupied: 34 },
      { id: 13, name: "Tower C", floors: 6, flats: 24, occupied: 20 },
      { id: 14, name: "Tower D", floors: 5, flats: 20, occupied: 12 },
    ],
  },
  {
    id: 2, name: "Sunrise Meadows", city: "Pune",
    blocks: [
      { id: 21, name: "Block 1", floors: 4, flats: 16, occupied: 15 },
      { id: 22, name: "Block 2", floors: 4, flats: 16, occupied: 9 },
    ],
  },
  {
    id: 3, name: "Lakeview Residency", city: "Mumbai",
    blocks: [
      { id: 31, name: "Wing East", floors: 12, flats: 48, occupied: 40 },
      { id: 32, name: "Wing West", floors: 12, flats: 48, occupied: 33 },
    ],
  },
];
