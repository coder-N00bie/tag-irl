import { createClient } from "https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2.45.4/+esm";

/* Realtime only (broadcast + presence) on the Cooliomatic Supabase project; no tables used. */
const SUPABASE_URL = "https://nzklfdjsdtemtzrfslfa.supabase.co";
const SUPABASE_KEY = "sb_publishable_VuaPlhuHvgs3bM0diIKZ_Q_InkSXHT5";
const sb = createClient(SUPABASE_URL, SUPABASE_KEY, { realtime: { params: { eventsPerSecond: 20 } } });

/* ---------- tuning ---------- */
const TAG_RANGE = 18;      // metres: close enough to tag
const SEE_RANGE = 70;      // other players show up in your photo within this
const ITEM_SEE = 110;      // items show up in your photo within this
const PICK_RANGE = 22;     // walk this close to grab an item
const STEP_MS = 1000;      // starting value for the step bar (real cooldown scales with step length)
const INV_MAX = 3;
const MAX_PLAYERS = 10;

const LOCATIONS = [   // checked for Panoramax coverage; flat = no 360° photos, few = sparse
  { id: "marais", group: "Paris", label: "Le Marais", lat: 48.8575, lng: 2.358 },
  { id: "montmartre", group: "Paris", label: "Montmartre", lat: 48.8867, lng: 2.3431 },
  { id: "bastille", group: "Paris", label: "Bastille", lat: 48.853, lng: 2.37 },
  { id: "champs", group: "Paris", label: "Champs-Élysées", lat: 48.871, lng: 2.303 },
  { id: "eiffel", group: "Paris", label: "Eiffel Tower", lat: 48.857, lng: 2.298, kind: "flat" },
  { id: "latin", group: "Paris", label: "Latin Quarter & Notre-Dame", lat: 48.851, lng: 2.347, kind: "flat" },
  { id: "canal", group: "Paris", label: "Canal Saint-Martin", lat: 48.872, lng: 2.364 },
  { id: "saintgermainde", group: "Paris", label: "Saint-Germain-des-Prés", lat: 48.854, lng: 2.333 },
  { id: "opera", group: "Paris", label: "Opéra", lat: 48.871, lng: 2.332, kind: "flat" },
  { id: "montparnasse", group: "Paris", label: "Montparnasse", lat: 48.842, lng: 2.321 },
  { id: "republique", group: "Paris", label: "République", lat: 48.8675, lng: 2.363 },
  { id: "pigalle", group: "Paris", label: "Pigalle", lat: 48.882, lng: 2.337, kind: "flat" },
  { id: "louvreleshalle", group: "Paris", label: "Louvre & Les Halles", lat: 48.861, lng: 2.342 },
  { id: "batignolles", group: "Paris", label: "Batignolles", lat: 48.884, lng: 2.32 },
  { id: "ladefense", group: "Paris", label: "La Défense", lat: 48.892, lng: 2.238 },
  { id: "camden", group: "UK & Ireland", label: "Camden, London", lat: 51.539, lng: -0.143, kind: "flat" },
  { id: "soho", group: "UK & Ireland", label: "Soho, London", lat: 51.5136, lng: -0.134, kind: "flat" },
  { id: "westminster", group: "UK & Ireland", label: "Westminster, London", lat: 51.5007, lng: -0.127, kind: "few" },
  { id: "dublin", group: "UK & Ireland", label: "Dublin city centre", lat: 53.3498, lng: -6.2603 },
  { id: "oxford", group: "UK & Ireland", label: "Oxford", lat: 51.752, lng: -1.2577, kind: "few" },
  { id: "cork", group: "UK & Ireland", label: "Cork", lat: 51.8985, lng: -8.4756 },
  { id: "galway", group: "UK & Ireland", label: "Galway", lat: 53.2707, lng: -9.0568 },
  { id: "lyon", group: "France", label: "Presqu'île, Lyon", lat: 45.764, lng: 4.8357 },
  { id: "marseille", group: "France", label: "Vieux-Port, Marseille", lat: 43.2965, lng: 5.3698 },
  { id: "nice", group: "France", label: "Vieux Nice, Nice", lat: 43.696, lng: 7.27 },
  { id: "bordeaux", group: "France", label: "Old town, Bordeaux", lat: 44.8412, lng: -0.58 },
  { id: "toulouse", group: "France", label: "Capitole, Toulouse", lat: 43.6045, lng: 1.444 },
  { id: "strasbourg", group: "France", label: "Grande Île, Strasbourg", lat: 48.5818, lng: 7.7505 },
  { id: "montpellier", group: "France", label: "L'Écusson, Montpellier", lat: 43.6108, lng: 3.8767 },
  { id: "nantes", group: "France", label: "Bouffay, Nantes", lat: 47.2184, lng: -1.5536 },
  { id: "lille", group: "France", label: "Vieux-Lille, Lille", lat: 50.64, lng: 3.063 },
  { id: "grenoble", group: "France", label: "City centre, Grenoble", lat: 45.1885, lng: 5.7245 },
  { id: "rennes", group: "France", label: "City centre, Rennes", lat: 48.1113, lng: -1.68, kind: "flat" },
  { id: "dijon", group: "France", label: "Dijon", lat: 47.322, lng: 5.0415 },
  { id: "rochelle", group: "France", label: "Old Port, La Rochelle", lat: 46.1591, lng: -1.152 },
  { id: "rouen", group: "France", label: "Old town, Rouen", lat: 49.4431, lng: 1.0993 },
  { id: "tours", group: "France", label: "Tours", lat: 47.3941, lng: 0.6848 },
  { id: "nancy", group: "France", label: "Place Stanislas, Nancy", lat: 48.6921, lng: 6.1844 },
  { id: "metz", group: "France", label: "Metz", lat: 49.1193, lng: 6.1757 },
  { id: "havre", group: "France", label: "Le Havre", lat: 49.4944, lng: 0.1079 },
  { id: "caen", group: "France", label: "Caen", lat: 49.1829, lng: -0.3707 },
  { id: "angers", group: "France", label: "Angers", lat: 47.4784, lng: -0.5632 },
  { id: "limoges", group: "France", label: "Limoges", lat: 45.8336, lng: 1.2611 },
  { id: "brest", group: "France", label: "Brest", lat: 48.3904, lng: -4.4861 },
  { id: "toulon", group: "France", label: "Toulon", lat: 43.1242, lng: 5.928 },
  { id: "orleans", group: "France", label: "Orléans", lat: 47.903, lng: 1.9093 },
  { id: "lemans", group: "France", label: "Le Mans", lat: 48.0061, lng: 0.1996 },
  { id: "besancon", group: "France", label: "Besançon", lat: 47.2378, lng: 6.0241 },
  { id: "poitiers", group: "France", label: "Poitiers", lat: 46.5802, lng: 0.3404 },
  { id: "pau", group: "France", label: "Pau", lat: 43.2951, lng: -0.3708 },
  { id: "bayonne", group: "France", label: "Bayonne", lat: 43.4929, lng: -1.4748 },
  { id: "mulhouse", group: "France", label: "Mulhouse", lat: 47.7508, lng: 7.3359 },
  { id: "nimes", group: "France", label: "Nîmes", lat: 43.8367, lng: 4.3601 },
  { id: "avignon", group: "France", label: "Avignon", lat: 43.9493, lng: 4.8055 },
  { id: "annecy", group: "France", label: "Annecy", lat: 45.8992, lng: 6.1294, kind: "flat" },
  { id: "aix", group: "France", label: "Aix-en-Provence", lat: 43.5297, lng: 5.4474, kind: "flat" },
  { id: "ajaccio", group: "France", label: "Ajaccio, Corsica", lat: 41.9192, lng: 8.7386 },
  { id: "vieuxlyonlyon", group: "France", label: "Vieux Lyon, Lyon", lat: 45.762, lng: 4.827 },
  { id: "croixrousselyo", group: "France", label: "Croix-Rousse, Lyon", lat: 45.774, lng: 4.832 },
  { id: "lepaniermarsei", group: "France", label: "Le Panier, Marseille", lat: 43.299, lng: 5.368 },
  { id: "chartronsborde", group: "France", label: "Chartrons, Bordeaux", lat: 44.855, lng: -0.57 },
  { id: "promenadedesan", group: "France", label: "Promenade des Anglais, Nice", lat: 43.695, lng: 7.26 },
  { id: "saintmalo", group: "France", label: "Saint-Malo", lat: 48.649, lng: -2.026 },
  { id: "cannes", group: "France", label: "Cannes", lat: 43.5513, lng: 7.0128 },
  { id: "biarritz", group: "France", label: "Biarritz", lat: 43.4832, lng: -1.5586 },
  { id: "chambery", group: "France", label: "Chambéry", lat: 45.5646, lng: 5.9178 },
  { id: "saintetienne", group: "France", label: "Saint-Étienne", lat: 45.4397, lng: 4.3872 },
  { id: "amiens", group: "France", label: "Amiens", lat: 49.8941, lng: 2.2958 },
  { id: "troyes", group: "France", label: "Troyes", lat: 48.2973, lng: 4.0744, kind: "flat" },
  { id: "valence", group: "France", label: "Valence", lat: 44.9334, lng: 4.8924, kind: "flat" },
  { id: "lorient", group: "France", label: "Lorient", lat: 47.7482, lng: -3.3702, kind: "few" },
  { id: "vannes", group: "France", label: "Vannes", lat: 47.6582, lng: -2.7608 },
  { id: "quimper", group: "France", label: "Quimper", lat: 47.996, lng: -4.102 },
  { id: "saintnazaire", group: "France", label: "Saint-Nazaire", lat: 47.2735, lng: -2.2138 },
  { id: "arles", group: "France", label: "Arles", lat: 43.6766, lng: 4.6278 },
  { id: "carcassonne", group: "France", label: "Carcassonne", lat: 43.213, lng: 2.3491 },
  { id: "albi", group: "France", label: "Albi", lat: 43.9289, lng: 2.1464, kind: "flat" },
  { id: "montauban", group: "France", label: "Montauban", lat: 44.0176, lng: 1.355 },
  { id: "chartres", group: "France", label: "Chartres", lat: 48.4469, lng: 1.489 },
  { id: "calais", group: "France", label: "Calais", lat: 50.9513, lng: 1.8587 },
  { id: "dunkirk", group: "France", label: "Dunkirk", lat: 51.0344, lng: 2.3768, kind: "flat" },
  { id: "valenciennes", group: "France", label: "Valenciennes", lat: 50.357, lng: 3.5235 },
  { id: "bourges", group: "France", label: "Bourges", lat: 47.081, lng: 2.3988 },
  { id: "vichy", group: "France", label: "Vichy", lat: 46.1278, lng: 3.4258, kind: "flat" },
  { id: "bastia", group: "France", label: "Bastia", lat: 42.697, lng: 9.45 },
  { id: "cherbourg", group: "France", label: "Cherbourg", lat: 49.6386, lng: -1.6163 },
  { id: "saintbrieuc", group: "France", label: "Saint-Brieuc", lat: 48.5141, lng: -2.76, kind: "flat" },
  { id: "brussels", group: "Europe", label: "Grand-Place, Brussels", lat: 50.8467, lng: 4.3525 },
  { id: "ghent", group: "Europe", label: "Ghent", lat: 51.0543, lng: 3.7174 },
  { id: "antwerp", group: "Europe", label: "Antwerp", lat: 51.2194, lng: 4.4025 },
  { id: "liege", group: "Europe", label: "Liège", lat: 50.6326, lng: 5.5797 },
  { id: "amsterdam", group: "Europe", label: "Jordaan, Amsterdam", lat: 52.3745, lng: 4.882 },
  { id: "utrecht", group: "Europe", label: "Utrecht", lat: 52.0907, lng: 5.1214 },
  { id: "luxembourg", group: "Europe", label: "Luxembourg City", lat: 49.6116, lng: 6.1319, kind: "flat" },
  { id: "geneva", group: "Europe", label: "Geneva", lat: 46.2044, lng: 6.1432, kind: "flat" },
  { id: "lausanne", group: "Europe", label: "Lausanne", lat: 46.5197, lng: 6.6323, kind: "flat" },
  { id: "hamburg", group: "Europe", label: "Hamburg", lat: 53.5503, lng: 9.993, kind: "flat" },
  { id: "prague", group: "Europe", label: "Old Town, Prague", lat: 50.0875, lng: 14.4213, kind: "flat" },
  { id: "milan", group: "Europe", label: "Milan", lat: 45.4642, lng: 9.19, kind: "flat" },
  { id: "rome", group: "Europe", label: "Rome centro", lat: 41.8986, lng: 12.4769, kind: "few" },
  { id: "barcelona", group: "Europe", label: "Gothic Quarter, Barcelona", lat: 41.383, lng: 2.177, kind: "few" },
  { id: "bruges", group: "Europe", label: "Bruges", lat: 51.2093, lng: 3.2247, kind: "flat" },
  { id: "namur", group: "Europe", label: "Namur", lat: 50.4674, lng: 4.872, kind: "few" },
  { id: "leuven", group: "Europe", label: "Leuven", lat: 50.8798, lng: 4.7005 },
  { id: "charleroi", group: "Europe", label: "Charleroi", lat: 50.4108, lng: 4.4446, kind: "few" },
  { id: "leiden", group: "Europe", label: "Leiden", lat: 52.1601, lng: 4.497 },
  { id: "delft", group: "Europe", label: "Delft", lat: 52.0116, lng: 4.3571, kind: "flat" },
  { id: "eindhoven", group: "Europe", label: "Eindhoven", lat: 51.4416, lng: 5.4697 },
  { id: "basel", group: "Europe", label: "Basel", lat: 47.5596, lng: 7.5886 },
  { id: "zurich", group: "Europe", label: "Zurich", lat: 47.3769, lng: 8.5417 },
  { id: "cologne", group: "Europe", label: "Cologne", lat: 50.9375, lng: 6.9603, kind: "flat" },
  { id: "frankfurt", group: "Europe", label: "Frankfurt", lat: 50.1109, lng: 8.6821 },
  { id: "turin", group: "Europe", label: "Turin", lat: 45.0703, lng: 7.6869 },
  { id: "venice", group: "Europe", label: "Venice", lat: 45.4371, lng: 12.3326, kind: "few" },
  { id: "monaco", group: "Europe", label: "Monaco", lat: 43.7384, lng: 7.4246, kind: "flat" },
  { id: "reunion", group: "Further away", label: "Saint-Denis, Réunion", lat: -20.8823, lng: 55.4504 },
  { id: "nyc", group: "Further away", label: "Times Square, New York", lat: 40.758, lng: -73.9855, kind: "few" },
  { id: "fortdefrancema", group: "Further away", label: "Fort-de-France, Martinique", lat: 14.6037, lng: -61.073, kind: "flat" },
  { id: "pointeapitregu", group: "Further away", label: "Pointe-à-Pitre, Guadeloupe", lat: 16.2411, lng: -61.5331 },
  { id: "papeetetahiti", group: "Further away", label: "Papeete, Tahiti", lat: -17.535, lng: -149.5696, kind: "few" },
  { id: "cayennefrenchg", group: "Further away", label: "Cayenne, French Guiana", lat: 4.9372, lng: -52.326 },
  { id: "saintpierrereu", group: "Further away", label: "Saint-Pierre, Réunion", lat: -21.3393, lng: 55.4781 },
  { id: "mamoudzoumayot", group: "Further away", label: "Mamoudzou, Mayotte", lat: -12.7806, lng: 45.2279 },
];

const WHO_COLOR = { all: "#ffc93c", tagger: "#ff5a47", runner: "#2fd3a6" };
const ITEMS = {
  radar:  { name: "Radar",        who: "all",    dur: 12000, w: 3,   desc: "Shows where every rival is for 12 s" },
  map:    { name: "Map",          who: "all",    dur: 10000, w: 3,   desc: "Rivals appear on your minimap for 10 s" },
  speed:  { name: "Speed potion", who: "all",    dur: 15000, w: 3,   desc: "Step 3x faster for 15 s" },
  freeze: { name: "Freeze bomb",  who: "tagger",             w: 1.6, desc: "Freezes runners within 120 m for 5 s" },
  pounce: { name: "Pounce",       who: "tagger",             w: 1,   desc: "Leap to a street near the closest runner" },
  cloak:  { name: "Cloak",        who: "runner", dur: 15000, w: 2,   desc: "Invisible on radar, maps and street for 15 s" },
  shield: { name: "Shield",       who: "runner", dur: 10000, w: 2,   desc: "Can't be tagged or frozen for 10 s" },
  warp:   { name: "Warp",         who: "runner",             w: 1.4, desc: "Teleport to a random street ~250 m away" },
  ink:    { name: "Ink bomb",     who: "runner",             w: 1.4, desc: "Blinds taggers within 150 m for 5 s" },
};
const GLYPH = {
  radar: "<circle cx='12' cy='12' r='9'/><circle cx='12' cy='12' r='4.5'/><path d='M12 12 L18.5 5.5'/>",
  map: "<path d='M3 6 L9 4 L15 6 L21 4 V18 L15 20 L9 18 L3 20 Z M9 4 V18 M15 6 V20'/>",
  speed: "<path d='M10 3 H14 M10.5 3 V9 L5 19 Q4.5 21 7 21 H17 Q19.5 21 19 19 L13.5 9 V3'/><path d='M7.5 15 H16.5'/>",
  freeze: "<path d='M12 2 V22 M3.3 7 L20.7 17 M3.3 17 L20.7 7 M9.5 3.5 L12 6 L14.5 3.5 M9.5 20.5 L12 18 L14.5 20.5'/>",
  pounce: "<path d='M13 2 L4 14 H11 L10 22 L20 9 H13 Z'/>",
  cloak: "<path d='M2 12 Q12 3 22 12 Q12 21 2 12 Z'/><circle cx='12' cy='12' r='3'/><path d='M4 4 L20 20'/>",
  shield: "<path d='M12 2 L20 5 V11 Q20 18 12 22 Q4 18 4 11 V5 Z'/><path d='M8.5 12 L11 14.5 L15.5 9.5'/>",
  warp: "<path d='M12 12 m-1 0 a1 1 0 1 1 2 0 a3 3 0 1 1 -5 -1 a6 6 0 1 1 9 6'/><path d='M19 2 L22 5 M2 19 L5 22'/>",
  ink: "<path d='M12 2 Q19 11 19 15 A7 7 0 0 1 5 15 Q5 11 12 2 Z'/><path d='M9 15 A3 3 0 0 0 12 18'/>",
};

/* ---------- utils ---------- */
const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const store = {
  get(k, d = null) { try { const v = localStorage.getItem("tagirl." + k); return v === null ? d : JSON.parse(v); } catch { return d; } },
  set(k, v) { try { localStorage.setItem("tagirl." + k, JSON.stringify(v)); } catch {} },
};
const uid = (n = 10) => Array.from(crypto.getRandomValues(new Uint8Array(n)), b => "abcdefghijklmnopqrstuvwxyz0123456789"[b % 36]).join("");
let tabId;
try { tabId = sessionStorage.getItem("tagirl.tab") || uid(12); sessionStorage.setItem("tagirl.tab", tabId); } catch { tabId = uid(12); }
const esc = s => String(s ?? "").replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
const pick = a => a[Math.floor(Math.random() * a.length)];
const fmt = ms => { const s = Math.max(0, Math.ceil(ms / 1000)); return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`; };
const clone = o => JSON.parse(JSON.stringify(o));

const toRad = d => d * Math.PI / 180, toDeg = r => r * 180 / Math.PI;
function dist(a, b) {
  const dLat = toRad(b.lat - a.lat), dLng = toRad(b.lng - a.lng);
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(toRad(a.lat)) * Math.cos(toRad(b.lat)) * Math.sin(dLng / 2) ** 2;
  return 2 * 6371000 * Math.asin(Math.min(1, Math.sqrt(h)));
}
function bearing(a, b) {
  const y = Math.sin(toRad(b.lng - a.lng)) * Math.cos(toRad(b.lat));
  const x = Math.cos(toRad(a.lat)) * Math.sin(toRad(b.lat)) - Math.sin(toRad(a.lat)) * Math.cos(toRad(b.lat)) * Math.cos(toRad(b.lng - a.lng));
  return (toDeg(Math.atan2(y, x)) + 360) % 360;
}
function offset(p, m, brg) {
  const d = m / 6371000, t = toRad(brg), la = toRad(p.lat), lo = toRad(p.lng);
  const la2 = Math.asin(Math.sin(la) * Math.cos(d) + Math.cos(la) * Math.sin(d) * Math.cos(t));
  const lo2 = lo + Math.atan2(Math.sin(t) * Math.sin(d) * Math.cos(la), Math.cos(d) - Math.sin(la) * Math.sin(la2));
  return { lat: toDeg(la2), lng: toDeg(lo2) };
}
const randIn = (c, r) => offset(c, r * Math.sqrt(Math.random()), Math.random() * 360);
function parseLatLng(s) {
  const m = String(s || "").match(/(-?\d{1,2}\.\d+)\s*,\s*(-?\d{1,3}\.\d+)/);
  if (!m) return null;
  const lat = +m[1], lng = +m[2];
  return Math.abs(lat) <= 90 && Math.abs(lng) <= 180 ? { lat, lng, label: "Map pick" } : null;
}

function itemSvg(type, size = 32) {
  const c = WHO_COLOR[ITEMS[type].who];
  return `<svg xmlns='http://www.w3.org/2000/svg' width='${size}' height='${size}' viewBox='0 0 32 32'><circle cx='16' cy='16' r='14.5' fill='#14161c' stroke='${c}' stroke-width='2.5'/><g transform='translate(4 4)' fill='none' stroke='${c}' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'>${GLYPH[type]}</g></svg>`;
}

/* ---------- toasts ---------- */
const recentToasts = new Map();
function toast(msg, kind = "", ms = 2600) {
  if (!msg) return;
  const last = recentToasts.get(msg);
  if (last && Date.now() - last < 1500) return;
  recentToasts.set(msg, Date.now());
  const el = document.createElement("div");
  el.className = "toast " + kind;
  el.textContent = msg;
  $("#toasts").append(el);
  setTimeout(() => el.remove(), ms);
}
function feed(msg, hot = false) {
  const el = document.createElement("div");
  if (hot) el.className = "hot";
  el.textContent = msg;
  $("#feed").prepend(el);
  setTimeout(() => el.remove(), 6000);
  while ($("#feed").children.length > 5) $("#feed").lastChild.remove();
}

/* ---------- screens ---------- */
function show(id) { $$(".screen").forEach(s => s.classList.toggle("active", s.id === "s-" + id)); }

/* ---------- street photos (Panoramax: free, open, no key) ---------- */
const PX = "https://api.panoramax.xyz/api";
const nodeCache = new Map();
async function pxGet(path) {
  const ctl = new AbortController();
  const t = setTimeout(() => ctl.abort(), 15000);
  try { const r = await fetch(PX + path, { signal: ctl.signal }); if (!r.ok) throw new Error(r.status); return await r.json(); }
  finally { clearTimeout(t); }
}
function toNode(f) {
  if (nodeCache.has(f.id)) return nodeCache.get(f.id);
  const p = f.properties || {}, io = p["pers:interior_orientation"] || {};
  const [w, h] = io.sensor_array_dimensions || [4, 3];
  const fov = io.field_of_view || 70;
  const n = {
    id: f.id, lat: f.geometry.coordinates[1], lng: f.geometry.coordinates[0],
    az: p["view:azimuth"] || 0, is360: fov >= 360, fov, aspect: h / w,
    img: f.assets?.sd?.href || f.assets?.hd?.href, by: p["geovisio:producer"] || "",
    seq: (f.links || []).filter(l => (l.rel === "prev" || l.rel === "next") && l.id && l.geometry)
      .map(l => ({ id: l.id, lat: l.geometry.coordinates[1], lng: l.geometry.coordinates[0] })),
  };
  if (n.img) nodeCache.set(n.id, n);
  return n;
}
async function searchAround(pos, radius, limit = 100) {
  const dLat = radius / 111320, dLng = radius / (111320 * Math.cos(toRad(pos.lat)));
  try {
    const d = await pxGet(`/search?bbox=${pos.lng - dLng},${pos.lat - dLat},${pos.lng + dLng},${pos.lat + dLat}&limit=${limit}`);
    return (d.features || []).map(toNode).filter(n => n.img);
  } catch { return []; }
}
async function getNode(id) {
  if (nodeCache.has(id)) return nodeCache.get(id);
  try { const d = await pxGet(`/search?ids=${encodeURIComponent(id)}`); const f = d.features?.[0]; return f ? toNode(f) : null; }
  catch { return null; }
}
// nearest photo to a point (like "snap to street")
async function snap(pos, radius) {
  const list = await searchAround(pos, radius);
  let best = null;
  for (const n of list) { const d = dist(pos, n); if (d <= radius && (!best || d < best.d)) best = { n, d }; }
  return best ? best.n : null;
}
// walkable neighbours: photos ~10 m away in distinct directions
async function findLinks(node) {
  const cands = (await searchAround(node, 24)).map(n => ({ n, d: dist(node, n), b: bearing(node, n) }))
    .filter(c => c.n.id !== node.id && c.d >= 2.5 && c.d <= 24);
  for (const s of node.seq) {   // sequence neighbours always count, even if further away
    if (!cands.some(c => c.n.id === s.id)) cands.push({ n: s, d: dist(node, s), b: bearing(node, s), seq: true });
  }
  cands.sort((a, b) => Math.abs(a.d - 10) - Math.abs(b.d - 10));
  const out = [];
  for (const c of cands) {
    if (out.length >= 6) break;
    if (out.some(o => Math.abs(((c.b - o.b + 540) % 360) - 180) < 32)) continue;
    out.push(c);
  }
  return out;
}

/* ---------- home ---------- */
$("#name").value = store.get("name", "");
$("#item-legend").innerHTML = Object.entries(ITEMS).map(([t, d]) =>
  `<div class="legend-item">${itemSvg(t, 34)}<div>${esc(d.name)}<span class="who" style="color:${WHO_COLOR[d.who]};border:1px solid ${WHO_COLOR[d.who]}">${d.who === "all" ? "anyone" : d.who}</span><small>${esc(d.desc)}</small></div></div>`).join("");
const hashCode = location.hash.replace("#", "").toUpperCase();
if (/^[A-Z]{4}$/.test(hashCode)) $("#join-code").value = hashCode;

function myName() {
  const n = $("#name").value.trim().slice(0, 16);
  if (!n) { toast("Pick a name first", "bad"); $("#name").focus(); return null; }
  store.set("name", n);
  return n;
}
$("#btn-create").onclick = () => {
  const n = myName(); if (!n) return;
  const letters = "ABCDEFGHJKLMNPQRSTUVWXYZ";
  joinRoom(Array.from({ length: 4 }, () => pick(letters)).join(""), n, true);
};
$("#join-form").onsubmit = e => {
  e.preventDefault();
  const n = myName(); if (!n) return;
  const code = $("#join-code").value.trim().toUpperCase();
  if (!/^[A-Z]{4}$/.test(code)) { toast("Room codes are 4 letters", "bad"); return; }
  joinRoom(code, n, false);
};
$("#join-code").addEventListener("input", e => { e.target.value = e.target.value.toUpperCase().replace(/[^A-Z]/g, ""); });

/* ---------- room / realtime ---------- */
let ch = null, room = null, joinedAt = 0, myNm = "";
let members = {};       // id -> { name, joined }
let hostId = null;
let game = null;        // shared state, all times in THIS device's clock
const positions = {};   // id -> { lat, lng, h, cloak, shield, t }
const isHost = () => hostId === tabId;

function joinRoom(code, name, creating) {
  room = code; myNm = name; joinedAt = Date.now(); game = null; members = {}; hostId = null;
  history.replaceState(null, "", "#" + code);
  $("#room-code").textContent = code;
  show("room");
  renderRoom();
  let gotSync = false;
  ch = sb.channel("tagirl-" + code, { config: { presence: { key: tabId }, broadcast: { self: false } } });
  ch.on("presence", { event: "sync" }, () => { gotSync = true; onSync(); })
    .on("presence", { event: "join" }, ({ key }) => { if (key !== tabId && isHost() && game) broadcastGame(); })
    .on("broadcast", { event: "game" }, ({ payload }) => onGame(payload))
    .on("broadcast", { event: "pos" }, ({ payload }) => onPos(payload))
    .on("broadcast", { event: "req" }, ({ payload }) => { if (isHost()) onReq(payload); })
    .on("broadcast", { event: "grant" }, ({ payload }) => onGrant(payload))
    .on("broadcast", { event: "fx" }, ({ payload }) => onFx(payload))
    .subscribe(async status => {
      if (status !== "SUBSCRIBED") return;
      const others = Object.keys(ch.presenceState()).filter(k => k !== tabId).length;
      if (others >= MAX_PLAYERS) { toast("That room is full", "bad"); leaveRoom(); return; }
      if (!creating && gotSync && others === 0) toast("Nobody's in that room yet — you're the host now");
      await ch.track({ name, joined: joinedAt });
      setTimeout(() => { if (ch && !game && isHost()) initGame(); }, 1500);
    });
}

function onSync() {
  if (!ch) return;
  const st = ch.presenceState();
  members = {};
  for (const [id, metas] of Object.entries(st)) { const m = metas[0]; if (m) members[id] = { name: m.name, joined: m.joined }; }
  const sorted = Object.entries(members).sort((a, b) => a[1].joined - b[1].joined || (a[0] < b[0] ? -1 : 1));
  const prevHost = hostId;
  hostId = sorted[0]?.[0] || null;
  if (hostId === tabId && prevHost && prevHost !== tabId && game) toast("You're the host now");
  renderRoom();
}

function leaveRoom() {
  try { ch?.unsubscribe(); } catch {}
  ch = null; room = null; game = null; members = {}; hostId = null;
  leaveGameView();
  history.replaceState(null, "", location.pathname + location.search);
  show("home");
}
$("#btn-leave-room").onclick = leaveRoom;
$("#btn-leave-game").onclick = () => { if (game?.phase !== "play" || confirm("Leave this round?")) leaveRoom(); };
$("#btn-leave-over").onclick = leaveRoom;
$("#btn-invite").onclick = async () => {
  const url = location.href.split("#")[0] + "#" + room;
  try { await navigator.clipboard.writeText(url); toast("Invite link copied", "good"); }
  catch { toast("Room code: " + room); }
};

/* ---------- shared game state ---------- */
function defaultSettings() { return { loc: "lyon", custom: "", dur: 5, head: 30, zone: 500, tagger: "random", caught: "join" }; }
function initGame() { game = null; hostUpdate(g => { Object.assign(g, { phase: "lobby", settings: defaultSettings(), roster: {}, items: [], round: null }); }); }

function broadcastGame() {
  if (!ch || !game) return;
  ch.send({ type: "broadcast", event: "game", payload: { ...game, sentAt: Date.now() } });
}
function hostUpdate(fn) {
  if (!isHost()) return;
  const prev = game;
  const next = prev ? clone(prev) : { v: 0 };
  fn(next);
  next.v = (prev?.v || 0) + 1;
  game = next;
  broadcastGame();
  onGameChanged(prev, next);
}
function shiftTimes(g, d) {
  for (const k of ["startAt", "playAt", "endsAt", "endedAt"]) if (g[k]) g[k] += d;
  for (const r of Object.values(g.roster || {})) if (r.caughtAt) r.caughtAt += d;
}
function onGame(p) {
  if (game && p.v <= game.v) return;
  const next = clone(p);
  shiftTimes(next, Date.now() - p.sentAt);   // convert host clock -> my clock
  delete next.sentAt;
  const prev = game;
  game = next;
  onGameChanged(prev, next);
}

function myRole() { return game?.roster?.[tabId]?.role || null; }
function spectating() { const r = game?.roster?.[tabId]; return !!(r && r.caughtAt && game.caught === "out"); }
function canUse(type) { const w = ITEMS[type].who; return !spectating() && (w === "all" || w === myRole()); }
const isBot = id => typeof id === "string" && id.startsWith("bot-");
function here(id, g = game) { return !!(members[id] || (isBot(id) && (g?.bots?.[id] || g?.roster?.[id]))); }
function runnersLeft(g = game) { return Object.entries(g.roster || {}).filter(([id, r]) => r.role === "runner" && !r.caughtAt && here(id, g)).length; }

function onGameChanged(prev, g) {
  renderRoom();
  if (g.phase === "lobby" || !g.roster?.[tabId]) {
    if (inGame) leaveGameView();
    if (ch) show("room");
    return;
  }
  if (!inGame || prev?.round !== g.round) { enterGame(); return; }
  gameDiff(prev, g);
}

/* ---------- room UI ---------- */
const setEls = { loc: $("#set-loc"), custom: $("#set-custom"), dur: $("#set-dur"), head: $("#set-head"), zone: $("#set-zone"), tagger: $("#set-tagger"), caught: $("#set-caught") };
const KIND_NOTE = { flat: " · flat photos", few: " · few photos" };
setEls.loc.innerHTML =
  `<optgroup label="Anywhere"><option value="custom">Pick on the map / search a place…</option></optgroup>` +
  `<optgroup label="Random"><option value="random360">Surprise me (best 360° places)</option><option value="random">Surprise me (anywhere on the list)</option></optgroup>` +
  [...new Set(LOCATIONS.map(l => l.group))].map(g => `<optgroup label="${esc(g)}">` +
    LOCATIONS.filter(l => l.group === g).map(l => `<option value="${l.id}">${esc(l.label)}${KIND_NOTE[l.kind] || ""}</option>`).join("") + `</optgroup>`).join("") +
``;

function renderRoom() {
  const humans = Object.keys(members).sort((a, b) => members[a].joined - members[b].joined);
  const bots = Object.keys(game?.bots || {});
  const ids = [...humans, ...bots];
  const nameOf = id => members[id]?.name || game?.bots?.[id]?.name || "?";
  $("#player-count").textContent = `${ids.length}/${MAX_PLAYERS}`;
  $("#player-list").innerHTML = ids.map(id => {
    const r = game?.roster?.[id];
    const tag = r ? (r.role === "tagger" ? `<span class="badge" style="color:var(--tag)">tagger</span>` : `<span class="badge" style="color:var(--run)">runner</span>`) : "";
    const bot = isBot(id) ? `<span class="badge">bot</span>` + (isHost() && game.phase === "lobby" ? `<button class="x-bot" data-bot="${id}" title="Remove bot">&times;</button>` : "") : "";
    return `<li><span class="dot${isBot(id) ? " botdot" : ""}"></span><span class="nm">${esc(nameOf(id))}${id === tabId ? ' <span class="muted">(you)</span>' : ""}</span>${tag}${bot}${id === hostId ? '<span class="badge host">host</span>' : ""}</li>`;
  }).join("") || `<li class="muted">Connecting…</li>`;
  $("#btn-add-bot").hidden = !isHost();
  $("#btn-add-bot").disabled = !game || game.phase !== "lobby" || ids.length >= MAX_PLAYERS;

  const s = game?.settings || defaultSettings();
  const host = isHost();
  for (const [k, el] of Object.entries(setEls)) {
    el.disabled = !host;
    if (k === "tagger") continue;
    if (document.activeElement !== el) el.value = String(s[k]);
  }
  setEls.tagger.innerHTML = `<option value="random">Random</option>` + ids.map(id => `<option value="${id}">${esc(nameOf(id))}${isBot(id) ? " (bot)" : ""}</option>`).join("");
  setEls.tagger.value = ids.includes(s.tagger) ? s.tagger : "random";
  $("#custom-wrap").hidden = s.loc !== "custom";
  if (s.loc === "custom") syncPick(s, host);
  $("#host-only").textContent = host ? "(you're the host)" : "(host picks)";

  const running = game && game.phase !== "lobby";
  const btn = $("#btn-start");
  btn.hidden = !host;
  if (!starting) { btn.disabled = running || ids.length < 2; btn.textContent = "Start round"; }
  $("#start-hint").textContent = running ? "" : host ? (ids.length < 2 ? "Share the code, or add a bot to play right now!" : "") : "Waiting for the host to start…";
  const note = $("#room-note");
  note.hidden = !(running && !game.roster?.[tabId]);
  note.textContent = "A round is in progress. You'll be in the next one.";
}
for (const [k, el] of Object.entries(setEls)) {
  el.addEventListener("change", () => {
    if (!isHost() || !game) return;
    hostUpdate(g => { g.settings[k] = ["dur", "head", "zone"].includes(k) ? +el.value : el.value; });
  });
}

/* ---------- map picker: choose any spot ---------- */
let pickMap = null, pickMk = null, pickZone = null, pickDots = null, pickKey = "";
function ensurePickMap() {
  if (pickMap) return;
  pickMap = L.map("pick-map", { zoomControl: true }).setView([47.5, 3], 5);
  L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", { maxZoom: 19, attribution: "&copy; OpenStreetMap" }).addTo(pickMap);
  pickMap.attributionControl.setPrefix(false);
  pickDots = L.layerGroup().addTo(pickMap);
  pickMap.on("click", e => { if (isHost()) setPick(e.latlng.lat, e.latlng.lng, ""); });
}
function setPick(lat, lng, label) {
  if (!isHost() || !game) return;
  hostUpdate(g => { g.settings.loc = "custom"; g.settings.custom = `${lat.toFixed(5)}, ${lng.toFixed(5)}`; g.settings.customLabel = label || ""; });
}
function syncPick(s, host) {
  ensurePickMap();
  setTimeout(() => pickMap.invalidateSize(), 60);
  $("#pick-search").hidden = !host;
  $("#pick-hint").textContent = host ? "Click the map or search a place. Dots show where street photos exist (green = 360°)." : "The host is picking a spot on the map.";
  const p = parseLatLng(s.custom);
  const key = p ? `${s.custom}|${s.zone}` : "";
  if (key === pickKey) return;
  pickKey = key;
  pickMk?.remove(); pickZone?.remove(); pickMk = pickZone = null;
  const st = $("#pick-status");
  if (!p) { pickDots.clearLayers(); st.className = "muted small"; st.textContent = host ? "No spot picked yet." : ""; return; }
  pickZone = L.circle([p.lat, p.lng], { radius: s.zone, color: "#ffc93c", weight: 2, fill: false, interactive: false }).addTo(pickMap);
  pickMk = L.circleMarker([p.lat, p.lng], { radius: 8, color: "#000", weight: 2, fillColor: "#ffc93c", fillOpacity: 1, interactive: false }).addTo(pickMap);
  pickMap.setView([p.lat, p.lng], Math.max(pickMap.getZoom(), 15));
  checkCoverage(p, key, s.zone);
}
async function checkCoverage(p, key, zone) {
  const st = $("#pick-status");
  st.className = "muted small"; st.textContent = "Looking for street photos here…";
  const list = await searchAround(p, Math.min(zone, 500), 500);
  if (key !== pickKey) return;
  pickDots.clearLayers();
  for (const n of list) L.circleMarker([n.lat, n.lng], { radius: 2.5, stroke: false, fillColor: n.is360 ? "#2fd3a6" : "#ffc93c", fillOpacity: .9, interactive: false }).addTo(pickDots);
  const c360 = list.filter(n => n.is360).length;
  if (!list.length) { st.className = "small bad"; st.textContent = "No street photos near here — try another spot (France, Belgium & the Netherlands have the most)."; }
  else if (list.length < 60) { st.className = "small bad"; st.textContent = `Only ${list.length} street photos here — playable, but it'll feel empty. Try a busier area.`; }
  else { st.className = "small ok"; st.textContent = `${list.length >= 500 ? "500+" : list.length} street photos here (${c360} are 360°). Good to go!`; }
}
$("#pick-search").addEventListener("submit", async e => {
  e.preventDefault();
  if (!isHost()) return;
  const q = $("#pick-q").value.trim();
  if (!q) return;
  const ll = parseLatLng(q);
  if (ll) { setPick(ll.lat, ll.lng, ""); return; }
  const st = $("#pick-status");
  st.className = "muted small"; st.textContent = "Searching…";
  try {
    const r = await fetch(`https://nominatim.openstreetmap.org/search?format=jsonv2&limit=1&q=${encodeURIComponent(q)}`);
    const [hit] = await r.json();
    if (!hit) { st.className = "small bad"; st.textContent = `Couldn't find "${q}".`; return; }
    setPick(+hit.lat, +hit.lon, hit.display_name.split(",").slice(0, 2).join(",").trim());
  } catch { st.className = "small bad"; st.textContent = "Search didn't work — click the map instead."; }
});

/* ---------- host: start / spawn / requests ---------- */
let starting = false;
function pickType() {
  const entries = Object.entries(ITEMS);
  let r = Math.random() * entries.reduce((a, [, d]) => a + d.w, 0);
  for (const [t, d] of entries) { r -= d.w; if (r <= 0) return t; }
  return "radar";
}
async function spawnItems(n, center, zone) {
  const out = [];
  await Promise.all(Array.from({ length: n }, async () => {
    for (let k = 0; k < 6; k++) {
      const s = await snap(randIn(center, zone * 0.92), 70);
      if (s && dist(s, center) <= zone && dist(s, center) > 25 && !out.some(o => dist(o, s) < 35)) {
        out.push({ id: uid(6), type: pickType(), lat: s.lat, lng: s.lng });
        return;
      }
    }
  }));
  return out;
}
$("#btn-start").onclick = async () => {
  if (!isHost() || !game || starting) return;
  const ids = [...Object.keys(members), ...Object.keys(game.bots || {})];
  if (ids.length < 2) { toast("You need at least 2 players — add a bot!"); return; }
  const s = game.settings;
  const base = s.loc === "custom" ? parseLatLng(s.custom) : s.loc === "random" ? pick(LOCATIONS) : s.loc === "random360" ? pick(LOCATIONS.filter(l => !l.kind)) : LOCATIONS.find(l => l.id === s.loc);
  if (!base) { toast("Pick a spot on the map first", "bad"); return; }
  if (s.loc === "custom" && s.customLabel) base.label = s.customLabel;
  const btn = $("#btn-start");
  starting = true; btn.disabled = true; btn.textContent = "Scouting the streets…";
  try {
    const start = await snap(base, 300);
    if (!start) { toast("No street photos near that spot — try another (France, Belgium & the Netherlands work best)", "bad", 6000); return; }
    const zone = s.zone;
    const items = await spawnItems(Math.round(zone / 40) + 4, start, zone);
    const present = [...Object.keys(members), ...Object.keys(game.bots || {})];
    const nameOf = id => members[id]?.name || game.bots?.[id]?.name || "?";
    const taggerId = s.tagger !== "random" && present.includes(s.tagger) ? s.tagger : pick(present);
    const now = Date.now();
    for (const k of Object.keys(botState)) delete botState[k];
    hostUpdate(g => {
      g.phase = "play"; g.round = uid(8);
      g.loc = { lat: start.lat, lng: start.lng, id: start.id, label: base.label };
      g.zone = zone; g.caught = s.caught;
      g.roster = Object.fromEntries(present.map(id => [id, { name: nameOf(id), role: id === taggerId ? "tagger" : "runner" }]));
      g.items = items;
      g.startAt = now + 4000; g.playAt = g.startAt + s.head * 1000; g.endsAt = g.playAt + s.dur * 60000;
      g.winner = null; g.reason = ""; g.endedAt = null;
    });
  } finally { starting = false; renderRoom(); }
};
$("#btn-again").onclick = () => hostUpdate(g => { g.phase = "lobby"; g.roster = {}; g.items = []; g.round = null; });

function request(r) {
  r.by = tabId;
  if (isHost()) onReq(r);
  else ch?.send({ type: "broadcast", event: "req", payload: r });
}
function grant(to, p) {
  p.to = to;
  if (to === tabId) onGrant(p);
  else ch?.send({ type: "broadcast", event: "grant", payload: p });
}
function onReq(r) {
  if (!game || game.phase !== "play" || r.round !== game.round) return;
  const now = Date.now();
  if (r.kind === "take") {
    const it = game.items.find(i => i.id === r.item);
    const role = game.roster[r.by]?.role;
    if (!it || (ITEMS[it.type].who !== "all" && ITEMS[it.type].who !== role)) return grant(r.by, { kind: "gone", item: r.item });
    hostUpdate(g => { g.items = g.items.filter(i => i.id !== r.item); });
    grant(r.by, { kind: "item", item: r.item, type: it.type });
    const round = game.round;
    setTimeout(() => respawn(round), 15000 + Math.random() * 15000);
  } else if (r.kind === "tag") {
    const a = game.roster[r.by], t = game.roster[r.target];
    if (!a || !t || a.role !== "tagger" || t.role !== "runner" || t.caughtAt || now < game.playAt) return;
    const tp = positions[r.target], ap = positions[r.by];
    if (tp && tp.shield > now) return grant(r.by, { kind: "tagfail", reason: "shield" });
    if (tp && ap && dist(tp, ap) > 60) return grant(r.by, { kind: "tagfail", reason: "far" });
    hostUpdate(g => {
      const x = g.roster[r.target];
      x.caughtAt = Date.now(); x.caughtBy = r.by; x.wasRunner = true;
      if (g.caught === "join") x.role = "tagger";
      endIfDone(g);
    });
  }
}
async function respawn(round) {
  if (!isHost() || game?.round !== round || game.phase !== "play") return;
  const items = await spawnItems(1, game.loc, game.zone);
  if (items.length && isHost() && game?.round === round && game.phase === "play") hostUpdate(g => { g.items.push(...items); });
}
function endIfDone(g) {
  if (g.phase !== "play") return false;
  const now = Date.now();
  const taggers = Object.entries(g.roster).filter(([id, r]) => r.role === "tagger" && here(id, g)).length;
  let winner = null, reason = "";
  if (runnersLeft(g) === 0) { winner = "tagger"; reason = "Every runner got tagged."; }
  else if (taggers === 0) { winner = "runners"; reason = "The tagger left the game."; }
  else if (now >= g.endsAt) { winner = "runners"; reason = `Time's up — ${runnersLeft(g)} runner${runnersLeft(g) === 1 ? "" : "s"} still free.`; }
  if (!winner) return false;
  g.phase = "over"; g.winner = winner; g.reason = reason; g.endedAt = now;
  return true;
}
setInterval(() => {
  if (!isHost() || game?.phase !== "play") return;
  const g = clone(game);
  if (endIfDone(g)) hostUpdate(x => Object.assign(x, g));
}, 500);

/* ---------- game view ---------- */
let inGame = false, gameReady = false, viewer = null, mini = null, curScene = null, loadedScene = null;
let me = { pos: null, node: null, prev: null, links: [] };
let inv = [], fx = {}, nextMoveAt = 0, lastCd = STEP_MS, moving = false, lockT = 0, tagTarget = null, tagCd = 0;
const pending = new Set();
const hs = new Map();                                   // hotspot id -> key, in the current photo
const miniItemMk = new Map(), miniPlayerMk = new Map(); // minimap markers
let meMk = null, zoneCircle = null;
const norm180 = a => ((a % 360) + 540) % 360 - 180;

function clearMarkers() {
  for (const m of [miniItemMk, miniPlayerMk]) { for (const mk of m.values()) mk.remove(); m.clear(); }
  meMk?.remove(); meMk = null;
  zoneCircle?.remove(); zoneCircle = null;
  hs.clear();
}
function destroyViewer() { try { viewer?.destroy(); } catch {} viewer = null; curScene = null; loadedScene = null; hs.clear(); }
function leaveGameView() {
  inGame = false; gameReady = false;
  clearMarkers(); destroyViewer();
  $("#over").hidden = true; $("#blackout").hidden = true;
}

function ensureMini(loc) {
  if (!mini) {
    mini = L.map("minimap", { zoomControl: false, dragging: false, scrollWheelZoom: false, doubleClickZoom: false, boxZoom: false, keyboard: false, touchZoom: false });
    L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", { maxZoom: 19, attribution: "&copy; OpenStreetMap" }).addTo(mini);
    mini.attributionControl.setPrefix(false);
  }
  mini.invalidateSize();
  mini.setView([loc.lat, loc.lng], 17);
}

async function enterGame() {
  inGame = true; gameReady = false;
  show("game");
  clearMarkers(); destroyViewer();
  inv = []; fx = {}; pending.clear(); nextMoveAt = 0; me = { pos: null, node: null, prev: null, links: [] };
  for (const k of Object.keys(positions)) delete positions[k];
  $("#feed").innerHTML = "";
  $("#over").hidden = true;
  renderInv();
  const round = game.round;
  const n = await getNode(game.loc.id);
  if (!inGame || game?.round !== round) return;
  if (!n) { toast("Couldn't load the street photos — check your connection and rejoin", "bad", 8000); return; }
  ensureMini(game.loc);
  zoneCircle = L.circle([game.loc.lat, game.loc.lng], { radius: game.zone, color: "#ffc93c", weight: 2, fill: false, interactive: false }).addTo(mini);
  arrive(n, Math.random() * 360);
  gameReady = true;
  const role = myRole();
  if (role === "tagger") feed("You're the tagger. Catch every runner before time runs out!", true);
  else feed("You're a runner. Get away — the tagger is released after the head start!");
  feed(`Playing in ${game.loc.label}. Stay inside the yellow circle.`);
  refreshWorld();
  if (game.phase === "over") showOver();
}

/* the photo viewer */
function heading() { return me.node && viewer ? (me.node.az + viewer.getYaw() + 360) % 360 : 0; }
function sceneCfg(n, h) {
  const c = { type: "equirectangular", panorama: n.img, crossOrigin: "anonymous", yaw: norm180(h - n.az), pitch: 0, hfov: 100 };   // no hotSpots key: Pannellum links its list on first addHotSpot
  if (!n.is360) {
    const vaov = toDeg(2 * Math.atan(Math.tan(toRad(n.fov / 2)) * n.aspect));
    // flat photo: centre it and zoom so it fills the screen both ways (no black edges)
    const el = $("#pano"), W = el.clientWidth || 800, H = el.clientHeight || 600;
    const hf = Math.min(n.fov, toDeg(2 * Math.atan(Math.tan(toRad(vaov / 2)) * W / H))) * 0.98;
    Object.assign(c, { haov: n.fov, vaov, avoidShowingBackground: true, yaw: 0, pitch: 0, hfov: hf, maxHfov: hf, minHfov: Math.min(30, hf),
      minYaw: -n.fov / 2, maxYaw: n.fov / 2, minPitch: -vaov / 2, maxPitch: vaov / 2 });
  } else Object.assign(c, { minHfov: 40, maxHfov: 120 });
  return c;
}
function arrive(n, h) {
  const cfg = sceneCfg(n, h);
  hs.clear();
  if (!viewer) {
    viewer = pannellum.viewer("pano", {
      default: { firstScene: n.id, sceneFadeDuration: 250, autoLoad: true },
      showControls: false, keyboardZoom: false, disableKeyboardCtrl: true, compass: false, minHfov: 40, maxHfov: 120,
      scenes: { [n.id]: cfg },
    });
    viewer.on("error", () => {
      const back = me.prev;
      toast("That photo didn't load — stepping back", "bad");
      if (back && back !== me.node) { const h0 = heading(); destroyViewer(); me.node = null; arrive(back, h0); }
    });
    // hotspots added before a photo finishes loading get duplicated, so only draw them once it's loaded
    viewer.on("load", () => { loadedScene = viewer.getScene(); hs.clear(); renderNav(); refreshWorld(); });
  } else {
    const old = curScene;
    viewer.addScene(n.id, cfg);
    viewer.loadScene(n.id, cfg.pitch, cfg.yaw, cfg.hfov);
    if (old && old !== n.id) setTimeout(() => { try { viewer?.removeScene(old); } catch {} }, 2000);
  }
  curScene = n.id;
  me.prev = me.node; me.node = n; me.pos = { lat: n.lat, lng: n.lng }; me.links = [];
  $("#photo-credit").textContent = `Photo: ${n.by || "Panoramax contributor"} · Panoramax (CC BY-SA)`;
  mini?.panTo([n.lat, n.lng]);
  renderNav();
  findLinks(n).then(links => { if (me.node === n) { me.links = links; renderNav(); } });
}

function stepMs(d = 10) { return Math.round(Math.max(250, Math.min(1600, d * (fx.speed > Date.now() ? 35 : 100)))); }
function moveBlock() {
  // null = free to move; "" = blocked silently; string = blocked with a message
  if (!game || game.phase !== "play") return "The round is over";
  const now = Date.now();
  if (spectating()) return null;
  if (now < game.startAt) return "Get ready…";
  if (fx.frozen > now) return "You're frozen!";
  if (myRole() === "tagger" && now < game.playAt) return "Wait for the head start to end";
  if (now < nextMoveAt) return "";
  return null;
}
async function goTo(target, opts = {}) {
  if (!viewer || moving || !game) return false;
  if (!opts.jump) { const why = moveBlock(); if (why !== null) { if (why) toast(why); return false; } }
  moving = true;
  try {
    const n = target.img ? target : await getNode(target.id);
    if (!n) { toast("Couldn't load that photo", "bad"); return false; }
    if (!inGame || !game) return false;
    if (!opts.jump && dist(n, game.loc) > game.zone) { toast("That's the edge of the play zone"); return false; }
    const d = me.pos ? dist(me.pos, n) : 0;
    const h = heading(), travel = me.pos ? bearing(me.pos, n) : h;
    arrive(n, !opts.jump && Math.abs(norm180(travel - h)) < 90 ? travel : h);
    if (!opts.jump && !spectating()) { lastCd = stepMs(d); nextMoveAt = Date.now() + lastCd; }
    if (opts.msg) toast(opts.msg, "good");
    updateLock(); sendPos(); checkPickups(); refreshWorld();
    return true;
  } finally { moving = false; }
}
function updateLock() {
  $("#pano").classList.toggle("locked", moveBlock() !== null);
  $("#navpad").classList.toggle("locked", moveBlock() !== null);
  clearTimeout(lockT);
  const now = Date.now();
  if (now < nextMoveAt) lockT = setTimeout(updateLock, nextMoveAt - now + 15);
}
function stepToward(rel) {   // rel: 0 = forward, 180 = back
  const h = heading();
  let best = null;
  for (const l of me.links) { const off = Math.abs(norm180(l.b - h - rel)); if (off < 65 && (!best || off < best.off)) best = { l, off }; }
  if (best) goTo(best.l.n); else toast(rel ? "No street behind you" : "No street that way — turn around (A / D)");
}

/* hotspots drawn inside the photo */
function upsertHs(id, show, pitch, yaw, key, build, click) {
  if (!viewer || !curScene || loadedScene !== curScene) return;
  if (show && me.node && !me.node.is360 && Math.abs(yaw) > me.node.fov / 2 - 3) show = false;   // outside a flat photo
  const have = hs.get(id);
  if (show && have === key) return;
  if (have !== undefined) { try { viewer.removeHotSpot(id, curScene); } catch {} hs.delete(id); }
  if (!show) return;
  try {
    viewer.addHotSpot({ id, pitch, yaw, cssClass: build.cls, createTooltipFunc: build.fn, clickHandlerFunc: click }, curScene);
    hs.set(id, key);
  } catch {}
}
const CHEVRON = "<svg viewBox='0 0 24 24' fill='none' stroke='#fff' stroke-width='3' stroke-linecap='round' stroke-linejoin='round'><path d='M5 15 L12 8 L19 15'/></svg>";
function navPitch(n) { return n.is360 ? -30 : -Math.max(5, Math.min(25, toDeg(Math.atan(Math.tan(toRad(n.fov / 2)) * n.aspect)) - 6)); }
function renderNav() {
  const n = me.node;
  for (let i = 0; i < 6; i++) {
    const l = me.links[i];
    upsertHs("nav" + i, !!(l && n), n ? navPitch(n) : 0, l && n ? norm180(l.b - n.az) : 0, l ? l.n.id : "",
      { cls: "hs-nav", fn: div => { div.innerHTML = CHEVRON + `<span>${Math.round(l.d)} m</span>`; } },
      () => goTo(l.n));
  }
  renderNavpad();
}
function renderNavpad() {
  const pad = $("#navpad");
  if (!me.node) { pad.innerHTML = ""; return; }
  const h = heading();
  pad.innerHTML = `<div class="np-me"></div>` + me.links.map((l, i) => {
    const rel = norm180(l.b - h), a = toRad(rel);
    return `<button class="np-btn" data-i="${i}" style="left:${50 + Math.sin(a) * 36}%;top:${50 - Math.cos(a) * 36}%" title="${Math.round(l.d)} m"><span style="transform:rotate(${rel}deg)">&#9650;</span></button>`;
  }).join("");
}

/* world rendering */
const svgUrl = svg => "data:image/svg+xml;charset=UTF-8," + encodeURIComponent(svg);
function personSvg(name, role) {
  const c = WHO_COLOR[role];
  return `<svg xmlns='http://www.w3.org/2000/svg' width='160' height='190' viewBox='0 0 160 190'><rect x='6' y='4' rx='16' width='148' height='38' fill='${c}'/><text x='80' y='31' font-family='Arial, sans-serif' font-weight='700' font-size='22' text-anchor='middle' fill='#111'>${esc(name.slice(0, 12))}</text><circle cx='80' cy='82' r='22' fill='${c}' stroke='#111' stroke-width='5'/><path d='M48 186 L56 118 Q80 100 104 118 L112 186 Z' fill='${c}' stroke='#111' stroke-width='5'/></svg>`;
}
function thingHs(id, show, pos, dropM, w, h, src, label, keyBase) {
  if (!me.node) return;
  const d = show ? Math.max(1.5, dist(me.pos, pos)) : 0;
  const pitch = -toDeg(Math.atan(dropM / Math.max(d, 1)));
  const yaw = norm180(bearing(me.pos, pos) - me.node.az);
  const sc = Math.max(0.35, Math.min(1.3, 14 / Math.max(d, 1)));
  const key = `${keyBase}|${Math.round(yaw)}|${Math.round(pitch)}|${sc.toFixed(1)}`;
  upsertHs(id, show, pitch, yaw, key, { cls: "hs-thing", fn: div => {
    div.innerHTML = `<img src="${src}" width="${Math.round(w * sc)}" height="${Math.round(h * sc)}" alt="">` + (label ? `<span class="lbl">${esc(label)}</span>` : "");
  } });
}
function upsertMini(store, id, show, pos, make, key) {
  let m = store.get(id);
  if (m && (!show || m._key !== key)) { m.remove(); store.delete(id); m = null; }
  if (!show || !mini) return;
  if (!m) { m = make([pos.lat, pos.lng]).addTo(mini); m._key = key; store.set(id, m); }
  else m.setLatLng([pos.lat, pos.lng]);
}
const miniItemIcon = t => L.divIcon({ className: "mini-item", html: itemSvg(t, 20), iconSize: [20, 20] });

let refreshQueued = false;
function refreshWorld() {
  if (refreshQueued) return;
  refreshQueued = true;
  setTimeout(() => {   // not rAF: it pauses in background tabs
    refreshQueued = false;
    if (!gameReady || !game) return;
    renderItems(); renderPlayers(); updateMeMarker(); renderRadar(); renderHeat(); renderTagBtn(); renderNavpad();
  }, 16);
}
function renderItems() {
  const keep = new Set(), seenHs = new Set();
  for (const it of game.items || []) {
    if (!canUse(it.type)) continue;
    keep.add(it.id);
    upsertMini(miniItemMk, it.id, true, it, ll => L.marker(ll, { icon: miniItemIcon(it.type), interactive: false }), it.type);
    const near = !!me.pos && dist(me.pos, it) <= ITEM_SEE;
    if (near) seenHs.add("it" + it.id);
    thingHs("it" + it.id, near, it, 2.2, 72, 72, svgUrl(itemSvg(it.type, 72)), ITEMS[it.type].name, it.type);
  }
  for (const [id, mk] of miniItemMk) if (!keep.has(id)) { mk.remove(); miniItemMk.delete(id); }
  for (const id of [...hs.keys()]) if (id.startsWith("it") && !seenHs.has(id)) upsertHs(id, false);
}
function renderPlayers() {
  const now = Date.now(), role = myRole(), spec = spectating();
  const seen = new Set(), seenHs = new Set();
  for (const [id, r] of Object.entries(game.roster)) {
    if (id === tabId) continue;
    const p = positions[id];
    if (!p || !here(id)) continue;
    if (r.caughtAt && game.caught === "out") continue;
    seen.add(id);
    const mate = r.role === role, cloaked = p.cloak > now;
    const d = me.pos ? dist(me.pos, p) : Infinity;
    const inView = (spec || mate || !cloaked) && d <= SEE_RANGE && d > 1;
    if (inView) seenHs.add("pl" + id);
    thingHs("pl" + id, inView, p, 1.3, 80, 95, svgUrl(personSvg(r.name, r.role)), `${Math.round(d)} m`, r.role + r.name);
    upsertMini(miniPlayerMk, id, spec || mate || (!cloaked && fx.map > now), p,
      ll => L.circleMarker(ll, { radius: 6, color: "#000", weight: 2, fillColor: WHO_COLOR[r.role], fillOpacity: 1, interactive: false }), r.role);
  }
  for (const [id, mk] of miniPlayerMk) if (!seen.has(id)) { mk.remove(); miniPlayerMk.delete(id); }
  for (const id of [...hs.keys()]) if (id.startsWith("pl") && !seenHs.has(id)) upsertHs(id, false);
}
function updateMeMarker() {
  if (!mini || !me.pos) return;
  const role = spectating() ? "all" : myRole() || "runner";
  if (!meMk || meMk._role !== role) {
    meMk?.remove();
    meMk = L.marker([me.pos.lat, me.pos.lng], { icon: L.divIcon({ className: "me-icon", html: `<div class="me-arrow" style="--c:${WHO_COLOR[role]}"></div>`, iconSize: [20, 20] }), interactive: false, zIndexOffset: 1000 }).addTo(mini);
    meMk._role = role;
  } else meMk.setLatLng([me.pos.lat, me.pos.lng]);
  const el = meMk.getElement()?.firstChild;
  if (el) el.style.transform = `rotate(${heading()}deg)`;
}

/* positions */
let lastPosSent = 0;
function sendPos() {
  if (!ch || !me.pos || !game) return;
  const now = Date.now();
  lastPosSent = now;
  const h = Math.round(heading());
  positions[tabId] = { lat: me.pos.lat, lng: me.pos.lng, h, cloak: fx.cloak || 0, shield: fx.shield || 0, t: now };
  ch.send({ type: "broadcast", event: "pos", payload: {
    id: tabId, round: game.round, lat: me.pos.lat, lng: me.pos.lng, h,
    cloak: Math.max(0, (fx.cloak || 0) - now), shield: Math.max(0, (fx.shield || 0) - now),
  } });
}
function onPos(p) {
  if (!game || p.round !== game.round || p.id === tabId) return;
  const now = Date.now();
  positions[p.id] = { lat: p.lat, lng: p.lng, h: p.h, cloak: now + p.cloak, shield: now + p.shield, t: now };
  refreshWorld();
}

/* items */
function checkPickups() {
  if (!me.pos || !game || game.phase !== "play" || spectating() || Date.now() < game.startAt) return;
  for (const it of game.items) {
    if (!canUse(it.type) || pending.has(it.id) || dist(me.pos, it) > PICK_RANGE) continue;
    if (inv.length + pending.size >= INV_MAX) { toast("Inventory full — use an item (1, 2, 3)"); continue; }
    pending.add(it.id);
    request({ kind: "take", item: it.id, round: game.round });
    setTimeout(() => pending.delete(it.id), 4000);
  }
}
function onGrant(p) {
  if (p.to !== tabId) return;
  pending.delete(p.item);
  if (p.kind === "item") {
    if (inv.length < INV_MAX) { inv.push(p.type); renderInv(); toast(`Picked up ${ITEMS[p.type].name}`, "good"); }
  } else if (p.kind === "tagfail") {
    toast(p.reason === "shield" ? "They're shielded!" : "Missed — too far away", "bad");
  }
}
function renderInv() {
  const now = Date.now();
  $("#inv").innerHTML = Array.from({ length: INV_MAX }, (_, i) => {
    const t = inv[i];
    if (!t) return `<button class="slot" data-i="${i}" tabindex="-1"><span class="k">${i + 1}</span></button>`;
    const d = ITEMS[t];
    return `<button class="slot full ${canUse(t) ? "" : "cant"}" data-i="${i}" tabindex="-1"><span class="k">${i + 1}</span>${itemSvg(t, 44)}<span class="tip"><b>${esc(d.name)}</b><br>${esc(d.desc)}</span></button>`;
  }).join("");
}
$("#inv").addEventListener("click", e => { const b = e.target.closest(".slot"); if (b) useItem(+b.dataset.i); });

async function useItem(i) {
  const t = inv[i];
  if (!t || !game || game.phase !== "play" || !me.pos) return;
  const now = Date.now();
  if (!canUse(t)) { toast(`Only a ${ITEMS[t].who} can use that`); return; }
  if (now < game.startAt) { toast("Wait for the round to start"); return; }
  if (fx.frozen > now) { toast("You're frozen!"); return; }
  const d = ITEMS[t];
  inv.splice(i, 1); renderInv();
  switch (t) {
    case "radar": case "map": case "speed": case "cloak": case "shield":
      fx[t] = Math.max(fx[t] || 0, now) + d.dur;
      if (t === "speed") { nextMoveAt = Math.min(nextMoveAt, now + 250); updateLock(); }
      if (t === "cloak" || t === "shield") sendPos();
      toast(`${d.name} active!`, "good");
      break;
    case "freeze": throwFx("freeze", 120, 5000, "#9fdcff"); toast("Freeze bomb thrown!", "good"); break;
    case "ink": throwFx("ink", 150, 5000, "#222"); toast("Ink bomb thrown!", "good"); break;
    case "warp": {
      toast("Warping…");
      for (let k = 0; k < 8; k++) {
        const target = offset(me.pos, 180 + Math.random() * 140, Math.random() * 360);
        if (dist(target, game.loc) > game.zone * 0.95) continue;
        const s = await snap(target, 90);
        if (s && dist(s, game.loc) <= game.zone && dist(s, me.pos) > 60) { await goTo(s, { jump: true, msg: "Warped!" }); refreshWorld(); return; }
      }
      toast("Warp fizzled — no street there", "bad"); inv.push(t); renderInv();
      break;
    }
    case "pounce": {
      let best = null;
      for (const [id, r] of Object.entries(game.roster)) {
        const p = positions[id];
        if (r.role !== "runner" || r.caughtAt || !p) continue;
        const dd = dist(me.pos, p);
        if (!best || dd < best.d) best = { p, d: dd };
      }
      if (!best) { toast("No runner to pounce on yet"); inv.push(t); renderInv(); return; }
      for (let k = 0; k < 6; k++) {
        const s = await snap(offset(best.p, 40 + Math.random() * 40, Math.random() * 360), 80);
        if (s && dist(s, game.loc) <= game.zone) { await goTo(s, { jump: true, msg: "Pounce!" }); refreshWorld(); return; }
      }
      toast("Pounce missed — no street there", "bad"); inv.push(t); renderInv();
      break;
    }
  }
  refreshWorld();
}
function throwFx(kind, range, dur, color) {
  const payload = { kind, by: tabId, round: game.round, lat: me.pos.lat, lng: me.pos.lng, range, dur };
  ch?.send({ type: "broadcast", event: "fx", payload });
  botsFeelFx(payload);
  ripple(color);
}
function ripple(color) {
  const r = document.createElement("div");
  r.className = "ripple"; r.style.setProperty("--c", color);
  $("#s-game").append(r);
  setTimeout(() => r.remove(), 1000);
}
function onFx(p) {
  botsFeelFx(p);
  if (!game || p.round !== game.round || !me.pos || spectating()) return;
  const now = Date.now();
  const d = dist(me.pos, p);
  const by = game.roster[p.by]?.name || "Someone";
  if (d > p.range) return;
  if (p.kind === "freeze" && myRole() === "runner") {
    if (fx.shield > now) { toast("Your shield blocked a freeze bomb!", "good"); return; }
    fx.frozen = now + p.dur; ripple("#9fdcff"); toast(`${by} froze you!`, "bad"); updateLock();
  } else if (p.kind === "ink" && myRole() === "tagger") {
    fx.blind = now + p.dur; ripple("#222"); toast(`${by} hit you with an ink bomb!`, "bad");
  }
}

function enemies() {
  const role = myRole(), out = [];
  for (const [id, r] of Object.entries(game.roster)) {
    if (id === tabId || r.role === role || !here(id)) continue;
    if (r.role === "runner" && r.caughtAt) continue;
    if (r.caughtAt && game.caught === "out") continue;
    const p = positions[id];
    if (p && me.pos) out.push({ id, r, p, d: dist(me.pos, p) });
  }
  return out.sort((a, b) => a.d - b.d);
}
function renderRadar() {
  const el = $("#radar");
  const now = Date.now();
  const on = gameReady && game?.phase === "play" && fx.radar > now && !spectating();
  el.hidden = !on;
  if (!on || !me.pos) return;
  const cv = $("canvas", el), ctx = cv.getContext("2d"), W = cv.width, R = W / 2 - 8, RANGE = 500;
  ctx.clearRect(0, 0, W, W);
  ctx.strokeStyle = "rgba(47,211,166,.35)"; ctx.lineWidth = 1;
  for (const f of [1 / 3, 2 / 3, 1]) { ctx.beginPath(); ctx.arc(W / 2, W / 2, R * f, 0, Math.PI * 2); ctx.stroke(); }
  ctx.fillStyle = "#fff"; ctx.beginPath(); ctx.moveTo(W / 2, W / 2 - 8); ctx.lineTo(W / 2 - 6, W / 2 + 6); ctx.lineTo(W / 2 + 6, W / 2 + 6); ctx.fill();
  const hd = heading();
  ctx.font = "bold 12px JetBrains Mono, monospace"; ctx.textAlign = "center";
  for (const e of enemies()) {
    if (e.p.cloak > now) continue;
    const a = toRad(bearing(me.pos, e.p) - hd);
    const rr = Math.min(e.d / RANGE, 1) * R;
    const x = W / 2 + Math.sin(a) * rr, y = W / 2 - Math.cos(a) * rr;
    ctx.fillStyle = WHO_COLOR[e.r.role];
    ctx.beginPath(); ctx.arc(x, y, 6, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = "#fff"; ctx.fillText(`${Math.round(e.d)}m`, x, y - 10);
  }
}
function renderHeat() {
  const heat = $("#heat"), danger = $("#danger");
  if (!gameReady || game.phase !== "play" || spectating() || Date.now() < game.playAt) { heat.hidden = true; danger.style.opacity = 0; danger.classList.remove("pulse"); return; }
  const near = enemies()[0];
  const d = near ? near.d : Infinity;
  if (myRole() === "runner") {
    const o = d < 100 ? Math.min(1, (100 - d) / 70) : 0;
    danger.style.opacity = o; danger.classList.toggle("pulse", d < 50);
    heat.hidden = !(d < 100);
    heat.className = "heat hot"; heat.textContent = d < 45 ? "Tagger is RIGHT here!" : "Tagger nearby…";
  } else {
    danger.style.opacity = 0; danger.classList.remove("pulse");
    heat.hidden = false;
    const [cls, txt] = d < 60 ? ["hot", "Hot! A runner is very close"] : d < 150 ? ["warm", "Warm"] : d < 300 ? ["cool", "Cool"] : ["cold", "Cold"];
    heat.className = "heat " + cls; heat.textContent = (near ? "" : "No signal · ") + txt;
  }
}
function renderTagBtn() {
  const b = $("#tagbtn"), now = Date.now();
  tagTarget = null;
  if (!gameReady || myRole() !== "tagger" || game.phase !== "play" || now < game.playAt || spectating()) { b.hidden = true; return; }
  const best = enemies().find(e => e.d <= TAG_RANGE);
  if (!best) { b.hidden = true; return; }
  b.hidden = false;
  if (best.p.shield > now) { b.disabled = true; b.textContent = "Shielded!"; return; }
  tagTarget = best.id;
  b.disabled = now < tagCd;
  b.innerHTML = `TAG ${best.p.cloak > now ? "???" : esc(best.r.name)} <kbd>Space</kbd>`;
}
function doTag() {
  if (!tagTarget || Date.now() < tagCd) return;
  tagCd = Date.now() + 1200;
  request({ kind: "tag", target: tagTarget, round: game.round });
  renderTagBtn();
}
$("#tagbtn").onclick = doTag;
function toggleMini() { $("#minimap-wrap").classList.toggle("big"); setTimeout(() => { mini?.invalidateSize(); if (me.pos) mini?.panTo([me.pos.lat, me.pos.lng]); }, 250); }
$("#minimap-wrap").onclick = toggleMini;
$("#navpad").addEventListener("click", e => { const b = e.target.closest(".np-btn"); const l = b && me.links[+b.dataset.i]; if (l) goTo(l.n); });

document.addEventListener("keydown", e => {
  if (!inGame || e.target.closest?.("input, select, textarea")) return;
  if (e.code === "Space") { e.preventDefault(); doTag(); }
  else if (["Digit1", "Digit2", "Digit3"].includes(e.code)) useItem(+e.code.slice(-1) - 1);
  else if (e.code === "KeyM") toggleMini();
  else if (e.code === "KeyW" || e.code === "ArrowUp") { e.preventDefault(); stepToward(0); }
  else if (e.code === "KeyS" || e.code === "ArrowDown") { e.preventDefault(); stepToward(180); }
  else if ((e.code === "KeyA" || e.code === "ArrowLeft") && viewer) { e.preventDefault(); viewer.setYaw(viewer.getYaw() - 30); refreshWorld(); }
  else if ((e.code === "KeyD" || e.code === "ArrowRight") && viewer) { e.preventDefault(); viewer.setYaw(viewer.getYaw() + 30); refreshWorld(); }
});

/* diffs from the host */
function gameDiff(prev, g) {
  for (const [id, r] of Object.entries(g.roster)) {
    const was = prev?.roster?.[id];
    if (!r.caughtAt || was?.caughtAt) continue;
    const by = g.roster[r.caughtBy]?.name || "The tagger";
    if (id === tabId) {
      toast(g.caught === "join" ? `${by} tagged you! You're a tagger now — go get them.` : `${by} tagged you. You're out — spectating.`, "bad", 5000);
      fx = { radar: fx.radar, map: fx.map, speed: fx.speed };
      inv = inv.filter(canUse); renderInv(); updateLock();
    } else feed(`${by} tagged ${r.name}!`, true);
  }
  if (prev?.phase === "play" && g.phase === "over") showOver();
  if (g.phase === "play") $("#over").hidden = true;
  refreshWorld();
}
function showOver() {
  const g = game, r = g.roster[tabId];
  const startRole = r?.wasRunner ? "runner" : r?.role;
  const won = g.winner === "tagger" ? startRole === "tagger" : startRole === "runner";
  $("#over-kicker").textContent = won ? "You win!" : "You lose";
  $("#over-title").textContent = g.winner === "tagger" ? "Taggers win!" : "Runners win!";
  $("#over-title").style.color = g.winner === "tagger" ? "var(--tag)" : "var(--run)";
  $("#over-reason").textContent = g.reason || "";
  const rows = Object.entries(g.roster).sort((a, b) => (a[1].caughtAt || Infinity) - (b[1].caughtAt || Infinity));
  $("#over-list").innerHTML = rows.map(([id, x]) => {
    const was = x.wasRunner ? "runner" : x.role;
    const res = was === "tagger" ? "tagger" : x.caughtAt ? `tagged at ${fmt(x.caughtAt - g.playAt)} by ${esc(g.roster[x.caughtBy]?.name || "?")}` : "survived!";
    return `<li><span><span style="color:${WHO_COLOR[was]}">&#9679;</span> ${esc(x.name)}${id === tabId ? " (you)" : ""}</span><span class="r">${res}</span></li>`;
  }).join("");
  $("#btn-again").hidden = !isHost();
  $("#over-wait").textContent = isHost() ? "" : "Waiting for the host to head back to the lobby…";
  $("#over").hidden = false;
}


/* ---------- bots (simulated by whoever is host) ---------- */
const BOT_NAMES = ["Zippy", "Bolt", "Pixel", "Noodle", "Turbo", "Gizmo", "Sprocket", "Biscuit", "Rocket", "Waffles", "Comet", "Pogo"];
const botState = {};          // id -> { node, nextAt, frozen, blind, busy }
const linkCache = new Map();  // photo id -> walkable neighbours
async function cachedLinks(n) {
  if (!linkCache.has(n.id)) linkCache.set(n.id, await findLinks(n));
  return linkCache.get(n.id);
}
$("#btn-add-bot").onclick = () => {
  if (!isHost() || !game || game.phase !== "lobby") return;
  const used = new Set(Object.values(game.bots || {}).map(b => b.name));
  const name = (BOT_NAMES.filter(n => !used.has("Bot " + n))[0] || BOT_NAMES[0] + uid(2));
  hostUpdate(g => { g.bots ||= {}; g.bots["bot-" + uid(6)] = { name: "Bot " + name }; });
};
$("#player-list").addEventListener("click", e => {
  const b = e.target.closest(".x-bot");
  if (b && isHost() && game?.phase === "lobby") hostUpdate(g => { delete g.bots[b.dataset.bot]; if (g.settings.tagger === b.dataset.bot) g.settings.tagger = "random"; });
});
function botsFeelFx(p) {
  if (!isHost() || !game || p.round !== game.round) return;
  const now = Date.now();
  for (const [id, r] of Object.entries(game.roster)) {
    const st = botState[id], pos = positions[id];
    if (!isBot(id) || !st || !pos || dist(pos, p) > p.range) continue;
    if (p.kind === "freeze" && r.role === "runner" && !r.caughtAt) st.frozen = now + p.dur;
    if (p.kind === "ink" && r.role === "tagger") st.blind = now + p.dur;
  }
}
function botSendPos(id, n) {
  const payload = { id, round: game.round, lat: n.lat, lng: n.lng, h: 0, cloak: 0, shield: 0 };
  positions[id] = { lat: n.lat, lng: n.lng, h: 0, cloak: 0, shield: 0, t: Date.now() };
  ch?.send({ type: "broadcast", event: "pos", payload });
  refreshWorld();
}
function botTargets(id, role) {   // who this bot cares about, nearest first
  const mine = positions[id], out = [];
  for (const [oid, r] of Object.entries(game.roster)) {
    if (oid === id || r.role === role || !here(oid) || (r.role === "runner" && r.caughtAt) || (r.caughtAt && game.caught === "out")) continue;
    const p = positions[oid];
    if (p && mine) out.push({ id: oid, p, d: dist(mine, p) });
  }
  return out.sort((a, b) => a.d - b.d);
}
async function botStep(id) {
  const st = (botState[id] ||= { node: null, nextAt: 0 });
  if (st.busy) return;
  const now = Date.now(), r = game.roster[id];
  if (!r || (r.caughtAt && game.caught === "out")) return;
  st.busy = true;
  try {
    if (!st.node) {   // first step, or we just became host: start where the bot was last seen
      const from = positions[id] || game.loc;
      st.node = (from === game.loc ? await getNode(game.loc.id) : await snap(from, 40)) || await getNode(game.loc.id);
      if (st.node) botSendPos(id, st.node);
      return;
    }
    if (game.phase !== "play" || now < game.startAt || now < st.nextAt || st.frozen > now) return;
    if (r.role === "tagger" && now < game.playAt) return;
    // tag anyone in reach first
    if (r.role === "tagger") {
      const t = botTargets(id, "tagger").find(t => t.d <= TAG_RANGE && !(t.p.shield > now));
      if (t) { onReq({ kind: "tag", by: id, target: t.id, round: game.round }); st.nextAt = now + 1500; return; }
    }
    const links = (await cachedLinks(st.node)).filter(l => dist(l.n, game.loc) <= game.zone);
    if (!links.length) { st.nextAt = now + 2000; return; }
    const foes = botTargets(id, r.role);
    const near = foes[0];
    let choice;
    const blind = st.blind > now;
    if (!blind && near && Math.random() < 0.8) {
      // taggers close the gap; runners only bother fleeing once someone is within ~250 m
      if (r.role === "tagger") choice = links.reduce((a, b) => (dist(b.n, near.p) < dist(a.n, near.p) ? b : a));
      else if (near.d < 250) choice = links.reduce((a, b) => (dist(b.n, near.p) > dist(a.n, near.p) ? b : a));
    }
    if (!choice) {   // wander, preferring to keep going roughly the same way
      const keep = links.filter(l => st.lastB === undefined || Math.abs(((l.b - st.lastB + 540) % 360) - 180) < 70);
      choice = pick(keep.length ? keep : links);
    }
    const next = choice.n.img ? choice.n : await getNode(choice.n.id);
    if (!next || game.phase !== "play") return;
    st.lastB = choice.b; st.node = next;
    st.nextAt = Date.now() + Math.max(900, choice.d * 130) + Math.random() * 400;   // a little slower than people
    botSendPos(id, next);
    if (r.role === "tagger") {
      const t = botTargets(id, "tagger").find(t => t.d <= TAG_RANGE && !(t.p.shield > Date.now()));
      if (t) onReq({ kind: "tag", by: id, target: t.id, round: game.round });
    }
  } catch {} finally { st.busy = false; }
}
setInterval(() => {
  if (!isHost() || !game || game.phase !== "play") return;
  for (const id of Object.keys(game.roster)) if (isBot(id)) botStep(id);
}, 300);

/* ---------- HUD tick ---------- */
setInterval(() => {
  if (!inGame || !game || !game.roster?.[tabId]) return;
  const now = Date.now(), role = myRole(), spec = spectating();
  let label, t;
  if (game.phase === "over") { label = "Final"; t = Math.max(0, (game.endedAt || now) - game.playAt); }
  else if (now < game.startAt) { label = "Starting"; t = game.startAt - now; }
  else if (now < game.playAt) { label = "Head start"; t = game.playAt - now; }
  else { label = "Time left"; t = game.endsAt - now; }
  $("#timer-label").textContent = label;
  $("#timer").textContent = fmt(t);
  $(".timer").classList.toggle("urgent", label === "Time left" && t < 30000);

  const chip = $("#role-chip");
  chip.className = "chip " + (spec ? "out" : role);
  chip.textContent = spec ? "OUT" : role === "tagger" ? "TAGGER" : "RUNNER";
  const left = runnersLeft();
  $("#runners-left").textContent = `${left} runner${left === 1 ? "" : "s"} left`;

  // countdown / tagger blindfold
  const bo = $("#blackout");
  if (game.phase === "play" && now < game.startAt) {
    bo.hidden = false; bo.className = "light";
    $("#bo-title").textContent = role === "tagger" ? "You're the TAGGER" : "You're a RUNNER";
    $("#bo-title").style.color = WHO_COLOR[role];
    $("#bo-count").textContent = Math.ceil((game.startAt - now) / 1000);
    $("#bo-sub").textContent = role === "tagger" ? "Close your eyes… (we'll do it for you)" : "Get ready to run!";
  } else if (game.phase === "play" && role === "tagger" && now < game.playAt && !game.roster[tabId].wasRunner) {
    bo.hidden = false; bo.className = "";
    $("#bo-title").textContent = "Runners are hiding…";
    $("#bo-title").style.color = "";
    $("#bo-count").textContent = Math.ceil((game.playAt - now) / 1000);
    $("#bo-sub").textContent = "Items you can use: Radar, Map, Speed potion, Freeze bomb, Pounce";
  } else bo.hidden = true;

  // step cooldown bar
  const frac = spec ? 1 : Math.min(1, 1 - (nextMoveAt - now) / lastCd);
  $("#step-bar").style.width = (frac * 100) + "%";
  $("#step-bar").style.background = fx.frozen > now ? "#9fdcff" : fx.speed > now ? "var(--run)" : "var(--gold)";

  // effects
  $("#ice").hidden = !(fx.frozen > now);
  $("#ink").hidden = !(fx.blind > now);
  $("#mini-blind").hidden = !(fx.blind > now);
  $("#fx-list").innerHTML = ["radar", "map", "speed", "cloak", "shield"].filter(k => fx[k] > now)
    .map(k => `<div class="fx">${itemSvg(k, 24)}${esc(ITEMS[k].name)} <b>${Math.ceil((fx[k] - now) / 1000)}s</b></div>`).join("");

  updateLock();
  refreshWorld();
  if (game.phase === "play" && now - lastPosSent > 2500) sendPos();
  if (game.phase === "over" && $("#over").hidden) showOver();
}, 250);

