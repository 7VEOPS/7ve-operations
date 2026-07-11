import { useState, useEffect } from "react";

// ── palette ──────────────────────────────────────────────
// Deep touring-black bg, amber/gold accent (stage lighting), slate panels
const C = {
  bg: "#0d0d0f",
  panel: "#141417",
  border: "#222228",
  gold: "#d4a017",
  goldDim: "#8a6a10",
  text: "#e8e6e0",
  muted: "#6b6a65",
  red: "#c0392b",
  green: "#27ae60",
  blue: "#2980b9",
};

const css = `
  @import url('https://fonts.googleapis.com/css2?family=Barlow+Condensed:wght@400;600;700;900&family=Inter:wght@400;500;600&display=swap');
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body { background: ${C.bg}; color: ${C.text}; font-family: 'Inter', sans-serif; }
  ::-webkit-scrollbar { width: 4px; } ::-webkit-scrollbar-track { background: ${C.bg}; }
  ::-webkit-scrollbar-thumb { background: ${C.border}; border-radius: 2px; }
  input, select, textarea {
    background: ${C.bg}; border: 1px solid ${C.border}; color: ${C.text};
    padding: 8px 12px; border-radius: 6px; font-size: 13px; font-family: 'Inter', sans-serif;
    width: 100%; outline: none; transition: border 0.15s;
  }
  input:focus, select:focus, textarea:focus { border-color: ${C.gold}; }
  button { cursor: pointer; font-family: 'Inter', sans-serif; }
  textarea { resize: vertical; min-height: 80px; }
  select option { background: #1a1a1e; }
`;

// ── shared components ─────────────────────────────────────
const Badge = ({ color, children }) => (
  <span style={{
    background: color + "22", color, border: `1px solid ${color}44`,
    borderRadius: 4, padding: "2px 8px", fontSize: 11, fontWeight: 600, letterSpacing: "0.05em"
  }}>{children}</span>
);

const Btn = ({ onClick, variant = "primary", children, style = {}, disabled }) => {
  const base = {
    padding: "8px 18px", borderRadius: 6, fontSize: 13, fontWeight: 600,
    border: "none", transition: "all 0.15s", letterSpacing: "0.03em", ...style,
  };
  const variants = {
    primary: { background: C.gold, color: "#000" },
    ghost: { background: "transparent", color: C.muted, border: `1px solid ${C.border}` },
    danger: { background: C.red + "22", color: C.red, border: `1px solid ${C.red}44` },
    success: { background: C.green + "22", color: C.green, border: `1px solid ${C.green}44` },
  };
  return <button onClick={onClick} disabled={disabled} style={{ ...base, ...variants[variant], opacity: disabled ? 0.5 : 1 }}>{children}</button>;
};

const Card = ({ children, style = {} }) => (
  <div style={{ background: C.panel, border: `1px solid ${C.border}`, borderRadius: 10, padding: 20, ...style }}>{children}</div>
);

const Label = ({ children }) => (
  <div style={{ fontSize: 11, fontWeight: 600, color: C.muted, letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 6 }}>{children}</div>
);

const Field = ({ label, children }) => (
  <div style={{ marginBottom: 14 }}>
    {label && <Label>{label}</Label>}
    {children}
  </div>
);

const SectionTitle = ({ icon, children }) => (
  <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 26, fontWeight: 900, letterSpacing: "0.04em", color: C.text, marginBottom: 20, display: "flex", alignItems: "center", gap: 10 }}>
    <span style={{ color: C.gold }}>{icon}</span> {children}
  </div>
);

const Divider = () => <div style={{ borderTop: `1px solid ${C.border}`, margin: "20px 0" }} />;

const AIBox = ({ loading, result, error }) => {
  if (!loading && !result && !error) return null;
  return (
    <div style={{ marginTop: 16, background: "#0a0a0c", border: `1px solid ${C.gold}44`, borderRadius: 8, padding: 16 }}>
      <div style={{ fontSize: 10, fontWeight: 700, color: C.gold, letterSpacing: "0.1em", marginBottom: 8 }}>◈ 7VE AI OUTPUT</div>
      {loading && <div style={{ color: C.muted, fontSize: 13 }}>Generating…</div>}
      {error && <div style={{ color: C.red, fontSize: 13 }}>{error}</div>}
      {result && <pre style={{ color: C.text, fontSize: 12.5, whiteSpace: "pre-wrap", lineHeight: 1.65, fontFamily: "'Inter', sans-serif" }}>{result}</pre>}
    </div>
  );
};

// ── Claude API call ───────────────────────────────────────
async function askClaude(prompt) {
  const res = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      model: "claude-sonnet-4-6",
      max_tokens: 1000,
      messages: [{ role: "user", content: prompt }],
    }),
  });
  const data = await res.json();
  if (data.error) throw new Error(data.error.message);
  return data.content.map(b => b.text || "").join("\n");
}

// ── SEED DATA ─────────────────────────────────────────────
const seedTechs = [
  // ── Core team ──────────────────────────────────────────
  { id: 1, name: "Roberto Rodriguez", role: "A1 / Technical Director", rate: 350, phone: "202-306-4375", email: "rr@example.com", certs: "RF Coord", address: "", pay: "Check", available: true },
  { id: 2, name: "Matt Wimpelberg", role: "L1 / LD", rate: 400, phone: "202-555-0102", email: "mw@example.com", certs: "MA3, ChamSys", address: "", pay: "Check", available: true },
  { id: 3, name: "Willie Williams", role: "V1 / Video + LED", rate: 375, phone: "202-555-0103", email: "ww@example.com", certs: "Resolume, vMix", address: "", pay: "Check", available: false },
  { id: 4, name: "Luis Figueroa", role: "Tour Manager / Ops", rate: 500, phone: "240-641-3635", email: "lf@example.com", certs: "CDL", address: "", pay: "Check", available: true },
  { id: 5, name: "Jefferoy Wolfe", role: "Crew Lead / Stage Hand", rate: 40, phone: "571-426-5824", email: "Jeffwolfe1976@icloud.com", certs: "Crew Lead", address: "6312 S Kings HWY, APT T4, Alexandria, VA 22306", pay: "Check", available: true },
  { id: 6, name: "Doug Cry", role: "A1 / FOH", rate: 40, phone: "", email: "", certs: "", address: "", pay: "Check", available: true },
  { id: 7, name: "Terrance Christian Phipps", role: "Breakout", rate: 40, phone: "540-207-7628", email: "Bookingthephipps@gmail.com", certs: "", address: "", pay: "Check", available: true },
  { id: 8, name: "Christian Lumsden", role: "A2 / Monitors", rate: 40, phone: "", email: "", certs: "", address: "", pay: "Check", available: true },
  { id: 9, name: "Dulton Swearingen", role: "A1 / FOH", rate: 40, phone: "918-438-9262", email: "Dultoneswearingen@gmail.com", certs: "", address: "", pay: "Check", available: true },
  { id: 10, name: "Deaundre Dominique", role: "Stagehand", rate: 40, phone: "202-251-5826", email: "", certs: "", address: "2609 Somerton CT, Bowie, MD 20721", pay: "Check", available: true },
  { id: 11, name: "Kevin Redmond", role: "Stagehand", rate: 40, phone: "202-999-5618", email: "demarcoredmond@icloud.com", certs: "", address: "3342 Toledo Terrace Apt 303, Hyattsville, MD 20782", pay: "Check", available: true },
  // ── Bertha crew (added from 3/16/2026 call sheet) ──────
  { id: 12, name: "Samuel Toney", role: "Stagehand", rate: 40, phone: "443-404-1537", email: "Samueltoney51@gmail.com", certs: "", address: "52 Glen Ridge APT C3, Glen Burnie, MD 21061", pay: "Check", available: true },
  { id: 13, name: "Houston Rockwood", role: "Stagehand", rate: 40, phone: "404-463-5873", email: "HoustonRproductions@gmail.com", certs: "", address: "1724 New Jersey Ave NW, Washington DC 20001", pay: "Check", available: true },
  { id: 14, name: "Karen Culi", role: "Stagehand", rate: 40, phone: "240-559-8243", email: "karenculimusic@gmail.com", certs: "", address: "1310 VAN Buren Dr, Fort Washington, MD 20744", pay: "Zelle", available: true },
  { id: 15, name: "John Matesic", role: "Stagehand", rate: 40, phone: "724-732-7422", email: "johnmatesicoffical@gmail.com", certs: "", address: "222 Station St, McDonald, PA 15057", pay: "Check", available: true },
  { id: 16, name: "Nia Robertson", role: "Stagehand", rate: 40, phone: "510-260-7991", email: "nia.portis.r@gmail.com", certs: "", address: "222 Station St, McDonald, PA 15057", pay: "Check", available: true },
  { id: 17, name: "Damon Davis", role: "Stagehand", rate: 40, phone: "808-375-8894", email: "nomaddavis@gmail.com", certs: "", address: "4400 Spruce Street APT D5, Philadelphia, PA 19104", pay: "Check", available: true },
  { id: 18, name: "Brendan Sullivan", role: "Stagehand / Media", rate: 840, phone: "724-732-7422", email: "brendansullivanmedia@gmail.com", certs: "Media", address: "2120 Forest Ridge Rd, Timonium, MD 21093", pay: "Zelle", available: true },
  // ── Other roles noted in Bertha lead sheet ─────────────
  { id: 19, name: "Darius Malone", role: "Fork + Structure", rate: 40, phone: "", email: "", certs: "", address: "", pay: "Check", available: true },
  { id: 20, name: "Kevin Morris", role: "Lasers", rate: 40, phone: "", email: "", certs: "", address: "", pay: "Check", available: true },
  { id: 21, name: "Trevor Herndon", role: "Lasers", rate: 40, phone: "", email: "", certs: "", address: "", pay: "Check", available: true },
  { id: 22, name: "Gerardo Sampson Jr", role: "Stagehand", rate: 40, phone: "667-646-1984", email: "Nightchild26@gmail.com", certs: "", address: "2532 Edgecombe Circle N, Baltimore, MD 21215", pay: "Check", available: true },
  { id: 23, name: "Christian Phipps", role: "Stagehand", rate: 40, phone: "540-207-7628", email: "Bookingthephipps@gmail.com", certs: "", address: "8736 Whites Lane, Spotsylvania, VA", pay: "Check", available: true },
  { id: 1, name: "Roberto Rodriguez", role: "A1 / FOH", rate: 350, phone: "202-555-0101", email: "rr@example.com", certs: "RF Coord", address: "", pay: "Check", available: true },
  { id: 2, name: "Matt Wimpelberg", role: "L1 / LD", rate: 400, phone: "202-555-0102", email: "mw@example.com", certs: "MA3, ChamSys", address: "", pay: "Check", available: true },
  { id: 3, name: "Willie Williams", role: "V1 / Stream", rate: 375, phone: "202-555-0103", email: "ww@example.com", certs: "Resolume, vMix", address: "", pay: "Check", available: false },
  { id: 4, name: "Luis Figueroa", role: "Tour Manager", rate: 500, phone: "202-555-0104", email: "lf@example.com", certs: "CDL", address: "", pay: "Check", available: true },
  { id: 5, name: "Jefferoy Wolfe", role: "Crew Lead / Stage Hand", rate: 40, phone: "571-426-5824", email: "Jeffwolfe1976@icloud.com", certs: "Crew Lead", address: "6312 S Kings HWY, APT T4, Alexandria, VA 22306", pay: "Check", available: true },
  { id: 6, name: "Doug Cry", role: "A1 / FOH", rate: 40, phone: "", email: "", certs: "", address: "", pay: "Check", available: true },
  { id: 7, name: "Terrance Christian Phipps", role: "Breakout", rate: 40, phone: "540-207-7628", email: "Bookingthephipps@gmail.com", certs: "", address: "", pay: "Check", available: true },
  { id: 8, name: "Christian Lumsden", role: "A1 / FOH", rate: 40, phone: "", email: "", certs: "", address: "", pay: "Check", available: true },
  { id: 9, name: "Dulton Swearingen", role: "A1 / FOH", rate: 40, phone: "918-438-9262", email: "Dultoneswearingen@gmail.com", certs: "", address: "", pay: "Check", available: true },
  { id: 10, name: "Deaundre Dominique", role: "Stagehand", rate: 40, phone: "202-251-5826", email: "", certs: "", address: "2609 Somerton CT, Bowie, MD 20721", pay: "Check", available: true },
  { id: 11, name: "Kevin Redmond", role: "Stagehand", rate: 40, phone: "202-999-5618", email: "demarcoredmond@icloud.com", certs: "", address: "3342 Toledo Terrace Apt 303, Hyattsville, MD 20782", pay: "Check", available: true },
];

const seedGear = [
  { id: 1, name: "Midas M32 Live", category: "Audio", qty: 1, rate: 350, weight: 30, power: 500 },
  { id: 2, name: "8.2kW PA Package (PreSonus CDL12P)", category: "Audio", qty: 1, rate: 800, weight: 200, power: 8200 },
  { id: 3, name: "Moving Lights Package", category: "Lighting", qty: 12, rate: 120, weight: 180, power: 3600 },
  { id: 4, name: "LED Wall Tiles (per tile)", category: "Video", qty: 20, rate: 45, weight: 10, power: 150 },
  { id: 5, name: "Laser/HD Projector Package", category: "Video", qty: 1, rate: 600, weight: 25, power: 1200 },
  { id: 6, name: "Power Distro 200A", category: "Power", qty: 2, rate: 250, weight: 40, power: 0 },
  { id: 7, name: "Modular Staging (4x4 section)", category: "Staging", qty: 8, rate: 75, weight: 60, power: 0 },
  { id: 8, name: "DJ Booth Package", category: "DJ", qty: 1, rate: 400, weight: 50, power: 800 },
];

const seedClients = [
  { id: 1, company: "Paramount Events", contact: "Sarah Chen", phone: "703-555-0201", email: "sarah@paramount.com", city: "Arlington, VA" },
  { id: 2, company: "DMV Festival Group", contact: "Marcus Bell", phone: "202-555-0202", email: "marcus@dmvfest.com", city: "Washington, DC" },
  { id: 3, company: "GAV / Fluffy Cloud (Bertha)", contact: "", phone: "", email: "", city: "Washington, DC" },
  { id: 4, company: "DNVR Sports", contact: "", phone: "", email: "", city: "Denver, CO" },
  { id: 5, company: "Groundswell One LLC (Outside Days)", contact: "Renee Wright", phone: "616-322-5173", email: "renee.wrightttt@gmail.com", city: "Denver, CO" },

  { id: 7, company: "Inspire Solutions", contact: "Danny Garton", phone: "", email: "Danny.garton@inspiresolutions.com", city: "Arlington, VA" },
  { id: 8, company: "SNS Staging", contact: "Nishant (Location Manager)", phone: "", email: "", city: "Arlington, VA" },
  { id: 9, company: "Eth Denver LLC", contact: "Eth Denver Ops", phone: "", email: "", city: "Denver, CO", address: "1624 Market St Suite 226 #93720, Denver CO 80202" },
];


// ── Seed: Job-coded bookings ─────────────────────────────
const seedBookings = [
  {
    id: 1001,
    jobCode: "7VE-BCH-0316",
    salesRep: "Roberto Rodriguez",
    category: "Cloud",
    client: "GAV / Fluffy Cloud (Bertha)",
    venue: "GAV — Washington, DC",
    date: "2026-03-16",
    loadIn: "10:00",
    showTime: "10:00",
    endTime: "20:00",
    notes: "Bertha / Fluffy Cloud show. 10-hour call. Check payments. Houston Rockwood W9 pending. Elizabeth Oduda W9 sent. Jorge paying out Colin Rappa separately. Brendan Sullivan 24hr/840 payout via Zelle.",
    crew: ["Jefferoy Wolfe","Deaundre Dominique","Samuel Toney","Houston Rockwood","Karen Culi","John Matesic","Nia Robertson","Kevin Redmond","Damon Davis","Brendan Sullivan"],
    crewFull: [
      { id:5,  name:"Jefferoy Wolfe",   role:"Crew Lead / Stage Hand", rate:40,  phone:"571-426-5824", email:"Jeffwolfe1976@icloud.com" },
      { id:10, name:"Deaundre Dominique",role:"Stagehand",             rate:40,  phone:"202-251-5826", email:"" },
      { id:12, name:"Samuel Toney",      role:"Stagehand",             rate:40,  phone:"443-404-1537", email:"Samueltoney51@gmail.com" },
      { id:13, name:"Houston Rockwood",  role:"Stagehand",             rate:40,  phone:"404-463-5873", email:"HoustonRproductions@gmail.com" },
      { id:14, name:"Karen Culi",        role:"Stagehand",             rate:40,  phone:"240-559-8243", email:"karenculimusic@gmail.com" },
      { id:15, name:"John Matesic",      role:"Stagehand",             rate:40,  phone:"724-732-7422", email:"johnmatesicoffical@gmail.com" },
      { id:16, name:"Nia Robertson",     role:"Stagehand",             rate:40,  phone:"510-260-7991", email:"nia.portis.r@gmail.com" },
      { id:11, name:"Kevin Redmond",     role:"Stagehand",             rate:40,  phone:"202-999-5618", email:"demarcoredmond@icloud.com" },
      { id:17, name:"Damon Davis",       role:"Stagehand",             rate:40,  phone:"808-375-8894", email:"nomaddavis@gmail.com" },
      { id:18, name:"Brendan Sullivan",  role:"Stagehand / Media",     rate:840, phone:"724-732-7422", email:"brendansullivanmedia@gmail.com" },
    ],
    total: 1240,
    status: "Completed",
  },
  {
    id: 1002,
    jobCode: "7VE-DNVR-0423",
    salesRep: "Roberto Rodriguez",
    category: "Rentals",
    client: "DNVR Sports",
    venue: "DNVR Draft Party — Denver, CO",
    date: "2026-04-23",
    loadIn: "",
    showTime: "",
    endTime: "",
    notes: "4-Point Sound for DNVR Podcast at Draft Party. x2 JBL w/ tripod stands, all-in-one controller/mixer, onsite staff. Family & friends discount applied. Invoice #001. $400 deposit requested.",
    crew: ["Roberto Rodriguez"],
    crewFull: [
      { id:1, name:"Roberto Rodriguez", role:"A1 / Technical Director", rate:350, phone:"202-306-4375", email:"rr@example.com" },
    ],
    total: 800,
    status: "Confirmed",
  },
  {
    id: 1003,
    jobCode: "7VE-OSD-0529",
    salesRep: "Roberto Rodriguez",
    category: "Festival",
    client: "Groundswell One LLC (Outside Days)",
    venue: "Outside Days Festival — Denver, CO",
    date: "2026-05-29",
    loadIn: "",
    showTime: "",
    endTime: "",
    notes: "Lighting Vendor — VIP & GA+ ambient lighting. On-site dates May 27–June 1, 2026. Report to: Renee Wright. Invoice #OSD901. Deposit $3,900 due NET 15 from 4/21/2026. Balance $3,900 due NET 15 after final invoice. ACH payment. W9 required. COI required (add Groundswell One LLC as additional insured). Green Disco sustainability compliance form required — send signed copy to data@greendisco.earth.",
    crew: ["Roberto Rodriguez","Luis Figueroa"],
    crewFull: [
      { id:1, name:"Roberto Rodriguez", role:"A1 / Technical Director", rate:350, phone:"202-306-4375", email:"rr@example.com" },
      { id:4, name:"Luis Figueroa",     role:"Tour Manager / Ops",      rate:500, phone:"240-641-3635", email:"lf@example.com" },
    ],
    total: 7800,
    amountPaid: 3993,
    amountDue: 3807,
    paymentNotes: "Deposit $3,993 received. Balance $3,807 outstanding — due NET 15 after final invoice submission.",
    status: "Confirmed",
  },
  {
    id: 1004,
    jobCode: "7VE-ARL-0520",
    salesRep: "Roberto Rodriguez",
    category: "Inspire",
    client: "Inspire Solutions",
    venue: "Crystal Gateway — 1700 Richmond Hwy, Arlington, VA 22202",
    date: "2026-05-20",
    loadIn: "22:00",
    showTime: "22:00",
    endTime: "06:00",
    notes: "Overnight hands call. 8-hour shift 10PM-6AM. Invoice #514202026. Client contact: Danny.garton@inspiresolutions.com. 6 techs at $45/hr. Tax included in invoice total.",
    crew: ["Jefferoy Wolfe","Deaundre Dominique","Samuel Toney","Houston Rockwood","Gerardo Sampson Jr","Christian Phipps"],
    crewFull: [
      { id:5,  name:"Jefferoy Wolfe",     role:"Crew Lead / Stage Hand", rate:45, phone:"571-426-5824", email:"Jeffwolfe1976@icloud.com" },
      { id:10, name:"Deaundre Dominique", role:"Stagehand",              rate:45, phone:"202-251-5826", email:"Deaundre.dominique@gmail.com" },
      { id:12, name:"Samuel Toney",       role:"Stagehand",              rate:45, phone:"443-404-1537", email:"Samueltoney51@gmail.com" },
      { id:13, name:"Houston Rockwood",   role:"Stagehand",              rate:45, phone:"404-463-5873", email:"HoustonRproductions@gmail.com" },
      { id:22, name:"Gerardo Sampson Jr", role:"Stagehand",              rate:45, phone:"667-646-1984", email:"Nightchild26@gmail.com" },
      { id:23, name:"Christian Phipps",   role:"Stagehand",              rate:45, phone:"540-207-7628", email:"Bookingthephipps@gmail.com" },
    ],
    total: 2274.48,
    status: "Completed",
  },
  {
    id: 1005,
    jobCode: "7VE-INS-0508",
    salesRep: "Roberto Rodriguez",
    category: "Inspire",
    client: "Inspire Solutions",
    venue: "Crystal Gateway — 1700 Richmond Hwy, Arlington, VA 22202",
    date: "2026-05-08",
    loadIn: "12:00",
    showTime: "12:00",
    endTime: "22:30",
    notes: "May 8 add-on shift. Noon-10:30PM. Invoice #514202026. 2 techs x 10.5hrs at $45/hr. Substitute hand on call. Crew Lead: Jeff Wolfe.",
    crew: ["Jefferoy Wolfe","Gerardo Sampson Jr"],
    crewFull: [
      { id:5,  name:"Jefferoy Wolfe",     role:"Crew Lead / Stage Hand", rate:45, phone:"571-426-5824", email:"Jeffwolfe1976@icloud.com" },
      { id:22, name:"Gerardo Sampson Jr", role:"Stagehand",              rate:45, phone:"667-646-1984", email:"Nightchild26@gmail.com" },
    ],
    total: 995.01,
    status: "Completed",
  },
  {
    id: 1006,
    jobCode: "7VE-SNS-0505",
    salesRep: "Roberto Rodriguez",
    category: "SNS",
    client: "SNS Staging",
    venue: "801 N Glebe, Arlington — Weston",
    date: "2026-05-05",
    loadIn: "09:00",
    showTime: "09:00",
    endTime: "22:00",
    notes: "IJM Band / Sara Grooves. 2-day in-room op. May 5: 9AM-4:30PM (7.5hrs). May 6: 10AM-10PM (12hrs). Location manager: Nishant. Invoice SNS IJM.",
    crew: ["Doug Cry"],
    crewFull: [
      { id:6, name:"Doug Cry", role:"A1 / In-Room Op", rate:50, phone:"", email:"" },
    ],
    total: 975.00,
    status: "Completed",
  },
  {
    id: 1008,
    jobCode: "7VE-ETH-0216",
    salesRep: "Roberto Rodriguez",
    category: "Other",
    client: "Eth Denver LLC",
    venue: "Eth Denver 2026 — Denver, CO",
    date: "2026-02-16",
    loadIn: "12:00",
    showTime: "12:00",
    endTime: "20:00",
    notes: "Construction team. Multi-day: Mon 2/16 (7hrs), Tue 2/17 (8hrs reg + 3.25hrs OT), Sat 2/21 (6hrs), Sun 2/22 (10hrs — Teen Division). Invoice #EthDen26-22326, PO: EDEN26. Roberto Rodriguez (alt: Tito Rodriguez). Full amount $1,184.75 received.",
    crew: ["Roberto Rodriguez"],
    crewFull: [
      { id:1, name:"Roberto Rodriguez", role:"A1 / Technical Director", rate:33.50, phone:"202-306-4375", email:"Admin@7virtuesentertainment.com" },
    ],
    total: 1184.75,
    status: "Completed",
  },
  {
    id: 1009,
    jobCode: "7VE-SNS-0324",
    salesRep: "Roberto Rodriguez",
    category: "SNS",
    client: "SNS Staging",
    venue: "801 N Glebe St, Arlington — DO DAY / SOMA",
    date: "2026-03-24",
    loadIn: "09:00",
    showTime: "09:00",
    endTime: "14:00",
    notes: "6-day run. DO DAY (Tue Mar 24 – Wed Mar 25) + SOMA (Thu Mar 26 – Sun Mar 29). In-Room Show A1. Invoice #33026. NET Deposit. Roberto Rodriguez. Billed $50/hr, paid $45/hr.",
    crew: ["Roberto Rodriguez"],
    crewFull: [
      { id:1, name:"Roberto Rodriguez", role:"A1 / Technical Director", rate:45, phone:"202-306-4375", email:"Admin@7virtuesentertainment.com" },
    ],
    total: 2425.00,
    status: "Completed",
  },

];

// ── Seed: Payroll entries (Bertha crew, 10hrs @ $40 each) ─
// Rate exception: Brendan Sullivan flat $840 (24hr rate per call sheet)
const seedPayroll = [
  // Bertha — billed direct, no margin split
  { id:2001, tech:"Jefferoy Wolfe",    event:"Bertha / Fluffy Cloud", jobCode:"7VE-BCH-0316", date:"2026-03-16", hours:"10", rate:"40",  billRate:40,  payRate:40,  total:400,  paid:true,  pay:"Check" },
  { id:2002, tech:"Deaundre Dominique",event:"Bertha / Fluffy Cloud", jobCode:"7VE-BCH-0316", date:"2026-03-16", hours:"10", rate:"40",  billRate:40,  payRate:40,  total:400,  paid:true,  pay:"Check" },
  { id:2003, tech:"Samuel Toney",      event:"Bertha / Fluffy Cloud", jobCode:"7VE-BCH-0316", date:"2026-03-16", hours:"10", rate:"40",  billRate:40,  payRate:40,  total:400,  paid:true,  pay:"Check" },
  { id:2004, tech:"Houston Rockwood",  event:"Bertha / Fluffy Cloud", jobCode:"7VE-BCH-0316", date:"2026-03-16", hours:"10", rate:"40",  billRate:40,  payRate:40,  total:400,  paid:true,  pay:"Check", notes:"W9 pending" },
  { id:2005, tech:"Karen Culi",        event:"Bertha / Fluffy Cloud", jobCode:"7VE-BCH-0316", date:"2026-03-16", hours:"10", rate:"40",  billRate:40,  payRate:40,  total:400,  paid:true,  pay:"Zelle" },
  { id:2006, tech:"John Matesic",      event:"Bertha / Fluffy Cloud", jobCode:"7VE-BCH-0316", date:"2026-03-16", hours:"10", rate:"40",  billRate:40,  payRate:40,  total:400,  paid:true,  pay:"Check" },
  { id:2007, tech:"Nia Robertson",     event:"Bertha / Fluffy Cloud", jobCode:"7VE-BCH-0316", date:"2026-03-16", hours:"10", rate:"40",  billRate:40,  payRate:40,  total:400,  paid:true,  pay:"Check" },
  { id:2008, tech:"Kevin Redmond",     event:"Bertha / Fluffy Cloud", jobCode:"7VE-BCH-0316", date:"2026-03-16", hours:"10", rate:"40",  billRate:40,  payRate:40,  total:400,  paid:true,  pay:"Check", notes:"Need email to send check" },
  { id:2009, tech:"Damon Davis",       event:"Bertha / Fluffy Cloud", jobCode:"7VE-BCH-0316", date:"2026-03-16", hours:"10", rate:"40",  billRate:40,  payRate:40,  total:400,  paid:true,  pay:"Check" },
  { id:2010, tech:"Brendan Sullivan",  event:"Bertha / Fluffy Cloud", jobCode:"7VE-BCH-0316", date:"2026-03-16", hours:"24", rate:"840", billRate:840, payRate:840, total:840,  paid:true,  pay:"Zelle", notes:"24hr rate, paid out via Zelle" },
  // Arlington Overnight — billed $45/hr, paid $40/hr → $5/hr margin
  { id:2011, tech:"Jefferoy Wolfe",      event:"Arlington Overnight — Crystal Gateway", jobCode:"7VE-ARL-0520", date:"2026-05-20", hours:"8", rate:"40", billRate:45, payRate:40, total:320, paid:false, pay:"Check", notes:"Check in the mail — not yet received" },
  { id:2012, tech:"Deaundre Dominique",  event:"Arlington Overnight — Crystal Gateway", jobCode:"7VE-ARL-0520", date:"2026-05-20", hours:"8", rate:"40", billRate:45, payRate:40, total:320, paid:false, pay:"Check", notes:"Check in the mail — not yet received" },
  { id:2013, tech:"Samuel Toney",        event:"Arlington Overnight — Crystal Gateway", jobCode:"7VE-ARL-0520", date:"2026-05-20", hours:"8", rate:"40", billRate:45, payRate:40, total:320, paid:false, pay:"Check", notes:"Check in the mail — not yet received" },
  { id:2014, tech:"Houston Rockwood",    event:"Arlington Overnight — Crystal Gateway", jobCode:"7VE-ARL-0520", date:"2026-05-20", hours:"8", rate:"40", billRate:45, payRate:40, total:320, paid:false, pay:"Check", notes:"Check in the mail — not yet received" },
  { id:2015, tech:"Gerardo Sampson Jr",  event:"Arlington Overnight — Crystal Gateway", jobCode:"7VE-ARL-0520", date:"2026-05-20", hours:"8", rate:"40", billRate:45, payRate:40, total:320, paid:false, pay:"Check", notes:"Check in the mail — not yet received" },
  { id:2016, tech:"Christian Phipps",    event:"Arlington Overnight — Crystal Gateway", jobCode:"7VE-ARL-0520", date:"2026-05-20", hours:"8", rate:"40", billRate:45, payRate:40, total:320, paid:false, pay:"Check", notes:"Check in the mail — not yet received" },
  // Inspire May 8 Add-On — billed $45/hr, paid $40/hr
  { id:2017, tech:"Jefferoy Wolfe",      event:"Inspire Add-On Shift (Noon)", jobCode:"7VE-INS-0508", date:"2026-05-08", hours:"10.5", rate:"40", billRate:45, payRate:40, total:420, paid:false, pay:"Check", notes:"Check in the mail — not yet received" },
  { id:2018, tech:"Gerardo Sampson Jr",  event:"Inspire Add-On Shift (Noon)", jobCode:"7VE-INS-0508", date:"2026-05-08", hours:"10.5", rate:"40", billRate:45, payRate:40, total:420, paid:false, pay:"Check", notes:"Check in the mail — not yet received. Sub hand, confirmed on call" },
  // SNS / IJM Band — billed $50/hr, paid $40/hr → $10/hr margin
  { id:2019, tech:"Doug Cry",            event:"SNS IJM Band — Day 1 (May 5)", jobCode:"7VE-SNS-0505", date:"2026-05-05", hours:"7.5", rate:"40", billRate:50, payRate:40, total:300, paid:true, pay:"Check" },
  { id:2020, tech:"Doug Cry",            event:"SNS IJM Band — Day 2 (May 6)", jobCode:"7VE-SNS-0505", date:"2026-05-06", hours:"12",  rate:"40", billRate:50, payRate:40, total:480, paid:true, pay:"Check" },
  // Eth Denver 2026 — 7VE-ETH-0216 (1:1 bill=pay, no margin)
  { id:2021, tech:"Roberto Rodriguez", event:"Eth Denver — Mon 2/16 (Construction)", jobCode:"7VE-ETH-0216", date:"2026-02-16", hours:"7",    rate:"33.50", billRate:33.50, payRate:33.50, total:234.50,  paid:true, pay:"ACH" },
  { id:2022, tech:"Roberto Rodriguez", event:"Eth Denver — Tue 2/17 (Construction)", jobCode:"7VE-ETH-0216", date:"2026-02-17", hours:"8",    rate:"33.50", billRate:33.50, payRate:33.50, total:268.00,  paid:true, pay:"ACH" },
  { id:2023, tech:"Roberto Rodriguez", event:"Eth Denver — Tue 2/17 OT",             jobCode:"7VE-ETH-0216", date:"2026-02-17", hours:"3.25", rate:"45",    billRate:45,    payRate:45,    total:146.25,  paid:true, pay:"ACH", notes:"Overtime rate" },
  { id:2024, tech:"Roberto Rodriguez", event:"Eth Denver — Sat 2/21 (Construction)", jobCode:"7VE-ETH-0216", date:"2026-02-21", hours:"6",    rate:"33.50", billRate:33.50, payRate:33.50, total:201.00,  paid:true, pay:"ACH" },
  { id:2025, tech:"Roberto Rodriguez", event:"Eth Denver — Sun 2/22 (Teen Division)",jobCode:"7VE-ETH-0216", date:"2026-02-22", hours:"10",   rate:"33.50", billRate:33.50, payRate:33.50, total:335.00,  paid:true, pay:"ACH" },
  // DO DAY / SOMA — 7VE-SNS-0324 (Roberto, bill $50/hr, pay $45/hr)
  { id:2026, tech:"Roberto Rodriguez", event:"DO DAY — Tue Mar 24",  jobCode:"7VE-SNS-0324", date:"2026-03-24", hours:"6",    rate:"45", billRate:50, payRate:45, total:270.00, paid:true, pay:"Check" },
  { id:2027, tech:"Roberto Rodriguez", event:"DO DAY — Wed Mar 25",  jobCode:"7VE-SNS-0324", date:"2026-03-25", hours:"8",    rate:"45", billRate:50, payRate:45, total:360.00, paid:true, pay:"Check" },
  { id:2028, tech:"Roberto Rodriguez", event:"SOMA — Thu Mar 26",    jobCode:"7VE-SNS-0324", date:"2026-03-26", hours:"6",    rate:"45", billRate:50, payRate:45, total:270.00, paid:true, pay:"Check" },
  { id:2029, tech:"Roberto Rodriguez", event:"SOMA — Fri Mar 27",    jobCode:"7VE-SNS-0324", date:"2026-03-27", hours:"11.5", rate:"45", billRate:50, payRate:45, total:517.50, paid:true, pay:"Check" },
  { id:2030, tech:"Roberto Rodriguez", event:"SOMA — Sat Mar 28",    jobCode:"7VE-SNS-0324", date:"2026-03-28", hours:"10",   rate:"45", billRate:50, payRate:45, total:450.00, paid:true, pay:"Check" },
  { id:2031, tech:"Roberto Rodriguez", event:"SOMA — Sun Mar 29",    jobCode:"7VE-SNS-0324", date:"2026-03-29", hours:"7",    rate:"45", billRate:50, payRate:45, total:315.00, paid:true, pay:"Check" },
  // ── Accounts Receivable — money owed TO 7VE ──────────
  { id:3001, tech:"7VE (Company)",  event:"Outside Days 2026 — Balance Due", jobCode:"7VE-OSD-0529", date:"2026-06-01", hours:"0", rate:"0", billRate:0, payRate:0, total:3807, paid:false, pay:"ACH", type:"receivable", notes:"Balance $3,807 due NET 15 after final invoice. Deposit $3,993 already received. Client: Groundswell One LLC / Renee Wright." },

  { id:3003, tech:"7VE (Company)",  event:"Inspire Solutions — Checks in Mail", jobCode:"7VE-ARL-0520", date:"2026-05-20", hours:"0", rate:"0", billRate:0, payRate:0, total:2274.48, paid:false, pay:"Check", type:"receivable", notes:"Invoice #514202026. Payment in mail — not yet received. Both invoices (May 8 and May 20) covered by this receivable." },
];

// ── Seed: Outside Days as a vendor ────────────────────────
const seedVendors = [
  {
    id: 3001,
    company: "Groundswell One LLC / Outside Days",
    contact: "Renee Wright",
    phone: "616-322-5173",
    email: "renee.wrightttt@gmail.com",
    website: "https://www.neweraadr.com/rules-and-procedures",
    category: "Venue / Space",
    status: "Preferred",
    city: "Plano",
    state: "TX",
    rate: "$7,800",
    rateType: "Project Rate",
    tags: ["festival","outdoor","lighting","Denver","multi-day","VIP","GA+"],
    notes: "Outside Days 2026 — May 29–31, Denver CO. Lighting vendor contract (7VE provides VIP & GA+ ambient lighting). Contract executed 4/21/2026. Payment via ACH within NET 30. Invoice deadline: 30 days after festival completion. Additional insured COI required. Green Disco sustainability compliance required (data@greendisco.earth). Arbitration in Dallas, TX under New Era ADR rules. Contact for billing/AP: Renee Wright (renee.wrightttt@gmail.com). Mailing: P.O. Box 250407, Plano, TX 75025.",
    contracts: [],
    notes_log: [],
  },
  {
    id: 3004,
    company: "Eth Denver LLC",
    contact: "Eth Denver Ops",
    phone: "",
    email: "",
    website: "https://www.ethdenver.com",
    category: "Venue / Space",
    status: "Approved",
    city: "Denver",
    state: "CO",
    rate: "$33.50/hr",
    rateType: "Hourly",
    tags: ["construction","tech","Denver","crypto","festival","multi-day"],
    notes: "Eth Denver 2026 construction team. PO: EDEN26. Invoice #EthDen26-22326. Address: 1624 Market St Suite 226 #93720, Denver CO 80202. Full payment received upon receipt. Roberto Rodriguez primary contact (alt: Tito Rodriguez, Tito.rodriguez.7ve@gmail.com, 11672 E Baltic Place, Aurora CO 80014). Regular rate $33.50/hr, OT rate $45/hr. No margin — 1:1 invoice.",
    contracts: [],
    notes_log: [],
  },
  {
    id: 3002,
    company: "Inspire Solutions",
    contact: "Danny Garton",
    phone: "",
    email: "Danny.garton@inspiresolutions.com",
    website: "",
    category: "Staffing Agency",
    status: "Preferred",
    city: "Arlington",
    state: "VA",
    rate: "$45/hr",
    rateType: "Hourly",
    tags: ["overnight","stagehand","corporate","DC-metro"],
    notes: "Overnight hands client at Crystal Gateway (1700 Richmond Hwy, Arlington VA 22202). Invoice #514202026. Two jobs completed: May 8 (noon shift) and May 20 (overnight). Payment upon receipt. Roberto Rodriguez is primary contact.",
    contracts: [],
    notes_log: [],
  },
  {
    id: 3003,
    company: "SNS Staging",
    contact: "Nishant (Location Manager)",
    phone: "",
    email: "",
    website: "",
    category: "Staging",
    status: "Approved",
    city: "Arlington",
    state: "VA",
    rate: "$50/hr",
    rateType: "Hourly",
    tags: ["staging","in-room","corporate","band","Arlington"],
    notes: "IJM Band / Sara Grooves event at 801 N Glebe, Arlington — Weston hotel. May 5–6 2026. In-Room Op. Invoice #SNS IJM. Payment upon receipt. Doug Cry assigned as in-room op.",
    contracts: [],
    notes_log: [],
  },
];

// ── Seed: Outside Days contract record ────────────────────
const seedContracts = [
  {
    id: 4001,
    title: "Outside Days 2026 — Independent Contractor Agreement",
    linkedShow: 1003,
    type: "Rider",
    body: "Signed agreement between Groundswell One LLC and 7 Virtues Entertainment. Effective 4/21/2026. Services: Lighting Vendor — VIP & GA+ ambient lighting. Festival dates: May 29–31, 2026, Denver CO. Total fee: $7,800. Payment: $3,900 deposit NET 15 from execution + receipt of paperwork. Balance $3,900 NET 15 after final invoice. ACH payment required. W9 required. COI required naming Groundswell One LLC et al as additional insured ($1M per occurrence / $2M aggregate). Invoice deadline: 30 days post-festival. Late invoices may be rejected. Green Disco sustainability compliance required. Governing law: Texas. Arbitration: Dallas TX, New Era ADR.",
    status: "Signed",
    date: "2026-04-21",
    createdAt: "2026-04-21T00:00:00.000Z",
    updatedAt: "2026-04-21T00:00:00.000Z",
  },
  {
    id: 4002,
    title: "DNVR Draft Party — Service Agreement & Invoice #001",
    linkedShow: 1002,
    type: "Amendment",
    body: "4-Point Sound package for DNVR Podcast Draft Party, April 23 2026. x2 JBL w/ tripod stands, all-in-one controller/mixer, onsite audio management. Original price $1,600. Family & friends discount -$800. Final amount: $800. $400 deposit requested upon signed agreement. Liability clause: outdoor event, equipment remains property of 7VE. Weather clause applies.",
    status: "Signed",
    date: "2026-04-17",
    createdAt: "2026-04-17T00:00:00.000Z",
    updatedAt: "2026-04-17T00:00:00.000Z",
  },
  {
    id: 4007,
    title: "Eth Denver 2026 — Construction Team Invoice #EthDen26-22326",
    linkedShow: 1008,
    type: "Custom",
    body: "Construction team services for Eth Denver 2026. PO: EDEN26. Dates: Mon 2/16 (7hrs), Tue 2/17 (8hrs reg + 3.25hrs OT), Sat 2/21 (6hrs), Sun 2/22 (10hrs — Teen Division). Regular rate: $33.50/hr. OT rate: $45/hr. Total: $1,184.75. Bill rate = pay rate — no margin. Full amount received upon receipt. Roberto Rodriguez (Tito Rodriguez). Client: Eth Denver LLC, 1624 Market St Suite 226, Denver CO 80202.",
    status: "Signed",
    date: "2026-02-23",
    createdAt: "2026-02-23T00:00:00.000Z",
    updatedAt: "2026-02-23T00:00:00.000Z",
  },
  {
    id: 4008,
    title: "SNS Staging — DO DAY / SOMA Invoice #33026",
    linkedShow: 1009,
    type: "Custom",
    body: "6-day In-Room A1 run for SNS Staging at 801 N Glebe St, Arlington. DO DAY: Tue Mar 24 (6hrs), Wed Mar 25 (8hrs). SOMA: Thu Mar 26 (6hrs), Fri Mar 27 (11.5hrs), Sat Mar 28 (10hrs), Sun Mar 29 (7hrs). 40 total hours. Billed at $50/hr = $2,425. Roberto Rodriguez paid $45/hr = $2,182.50. Margin: $242.50. Paid in full.",
    status: "Signed",
    date: "2026-03-30",
    createdAt: "2026-03-30T00:00:00.000Z",
    updatedAt: "2026-03-30T00:00:00.000Z",
  },
  {
    id: 4003,
    title: "Inspire Solutions — Overnight Hands Invoice #514202026 (May 20)",
    linkedShow: 1004,
    type: "Custom",
    body: "Final invoice for overnight stagehand crew at Crystal Gateway, Arlington VA. 6 techs × 8hrs × $45/hr. Crew: Jefferoy Wolfe (Lead), Deaundre Dominique, Samuel Toney, Houston Rockwood, Gerardo Sampson Jr, Christian Phipps. Tax: $114.48. Total: $2,274.48. Payment upon receipt. Client: Danny Garton, Inspire Solutions.",
    status: "Signed",
    date: "2026-05-07",
    createdAt: "2026-05-07T00:00:00.000Z",
    updatedAt: "2026-05-07T00:00:00.000Z",
  },
  {
    id: 4004,
    title: "Inspire Solutions — Add-On Shift Invoice #514202026 (May 8)",
    linkedShow: 1005,
    type: "Addendum",
    body: "Add-on shift invoice. Noon–10:30PM May 8. 2 techs × 10.5hrs × $45/hr. Crew Lead: Jeff Wolfe. Sub hand on call. Tax: $50.01. Total: $995.01. Payment upon receipt.",
    status: "Signed",
    date: "2026-05-08",
    createdAt: "2026-05-08T00:00:00.000Z",
    updatedAt: "2026-05-08T00:00:00.000Z",
  },
  {
    id: 4005,
    title: "SNS Staging — IJM Band / Sara Grooves Invoice",
    linkedShow: 1006,
    type: "Custom",
    body: "In-Room Op for IJM Band at 801 N Glebe, Arlington (Weston). May 5: 9AM–4:30PM (7.5hrs × $50 = $375). May 6: 10AM–10PM (12hrs × $50 = $600). Total: $975. State Tax VA. Operator: Doug Cry. Location manager: Nishant. Payment upon receipt.",
    status: "Signed",
    date: "2026-05-11",
    createdAt: "2026-05-11T00:00:00.000Z",
    updatedAt: "2026-05-11T00:00:00.000Z",
  },

];

// ── Rate helpers ──────────────────────────────────────────
// Rates > $100 are day rates; $100 and under are hourly
function isDay(rate) { return parseFloat(rate) > 100; }
function rateLabel(rate) { return isDay(rate) ? "/day" : "/hr"; }
function rateTag(rate) { return isDay(rate) ? "Day Rate" : "Hourly"; }
function calcLabor(rate, hours) {
  // Day-rate techs get their flat rate regardless of hours logged
  return isDay(rate) ? parseFloat(rate) : parseFloat(rate) * hours;
}

// ── NAV ───────────────────────────────────────────────────
const NAV_GROUPS = [
  { label: "OPERATIONS", items: [
    { id: "dashboard", icon: "⬡", label: "Dashboard" },
    { id: "labor",     icon: "👥", label: "Labor Booking" },
    { id: "payroll",   icon: "💳", label: "Payroll" },
    { id: "rentals",   icon: "🎛", label: "Equipment" },
    { id: "quotes",    icon: "📄", label: "Quote Builder" },
    { id: "offers",    icon: "📣", label: "Show Offers" },
  ]},
  { label: "RELATIONSHIPS", items: [
    { id: "clients",  icon: "🏢", label: "Clients" },
    { id: "vendors",  icon: "🤝", label: "Vendors" },
    { id: "techs",    icon: "🎙", label: "Technicians" },
  ]},
  { label: "CREW", items: [
    { id: "gallery", icon: "📸", label: "Show Gallery" },
    { id: "forum",   icon: "💬", label: "Tech Forum" },
    { id: "portal",  icon: "🔐", label: "Tech Portal" },
  ]},
  { label: "ADMIN", items: [
    { id: "reports", icon: "📊", label: "Event Reports" },
    { id: "admin",   icon: "🔒", label: "Admin Panel" },
  ]},
];
const NAV_ITEMS = NAV_GROUPS.flatMap(g => g.items);

// ── DASHBOARD HOME ────────────────────────────────────────
function DashboardHome({ bookings, payroll, rentals, techs, clients }) {
  const openBookings = bookings.filter(b => b.status !== "Completed").length;
  const techPayroll = payroll.filter(p => !p.paid && p.type !== "receivable");
  const unpaidPayroll = techPayroll.reduce((s, p) => s + p.total, 0);
  const arOwed = payroll.filter(p => !p.paid && p.type === "receivable").reduce((s, p) => s + p.total, 0);
  const activeRentals = rentals.filter(r => r.status === "Out").length;
  const availTechs = techs.filter(t => t.available).length;

  const stats = [
    { label: "Open Bookings", value: openBookings, color: C.gold },
    { label: "Owed to Techs", value: `$${unpaidPayroll.toLocaleString("en-US",{minimumFractionDigits:2,maximumFractionDigits:2})}`, color: C.red },
    { label: "Owed to 7VE", value: `$${arOwed.toLocaleString("en-US",{minimumFractionDigits:2,maximumFractionDigits:2})}`, color: C.green },
    { label: "Available Techs", value: `${availTechs} / ${techs.length}`, color: C.blue },
  ];

  return (
    <div>
      <SectionTitle icon="⬡">7 Virtues Operations</SectionTitle>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 12, marginBottom: 24 }}>
        {stats.map(s => (
          <Card key={s.label}>
            <div style={{ fontSize: 32, fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 900, color: s.color }}>{s.value}</div>
            <div style={{ fontSize: 12, color: C.muted, marginTop: 4 }}>{s.label}</div>
          </Card>
        ))}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
        <Card>
          <div style={{ fontWeight: 600, marginBottom: 14, fontSize: 13 }}>Recent Bookings</div>
          {bookings.length === 0 ? <div style={{ color: C.muted, fontSize: 13 }}>No bookings yet.</div> :
            bookings.slice(-4).reverse().map(b => (
              <div key={b.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "8px 0", borderBottom: `1px solid ${C.border}` }}>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 500 }}>{b.client}</div>
                  <div style={{ fontSize: 11, color: C.muted }}>{b.venue} · {b.date}</div>
                </div>
                <Badge color={b.status === "Confirmed" ? C.green : b.status === "Quoted" ? C.gold : C.muted}>{b.status}</Badge>
              </div>
            ))}
        </Card>

        <Card>
          <div style={{ fontWeight: 600, marginBottom: 14, fontSize: 13 }}>Payroll Pending</div>
          {payroll.filter(p => !p.paid).length === 0 ? <div style={{ color: C.muted, fontSize: 13 }}>All clear — no outstanding payroll.</div> :
            payroll.filter(p => !p.paid).map(p => (
              <div key={p.id} style={{ display: "flex", justifyContent: "space-between", padding: "8px 0", borderBottom: `1px solid ${C.border}` }}>
                <div>
                  <div style={{ fontSize: 13 }}>{p.tech}</div>
                  <div style={{ fontSize: 11, color: C.muted }}>{p.event}</div>
                </div>
                <div style={{ color: C.red, fontWeight: 600, fontSize: 13 }}>${p.total}</div>
              </div>
            ))}
        </Card>
      </div>
    </div>
  );
}

// ── LABOR BOOKING ─────────────────────────────────────────
function LaborBooking({ techs, bookings, setBookings }) {
  const [form, setForm] = useState({ client: "", venue: "", date: "", loadIn: "", showTime: "", endTime: "", positions: [], notes: "", salesRep: "Roberto Rodriguez", category: "Other" });
  const [selectedTechs, setSelectedTechs] = useState([]);
  const [aiResult, setAiResult] = useState("");
  const [aiLoading, setAiLoading] = useState(false);
  const [aiError, setAiError] = useState("");

  const upd = (k, v) => setForm(f => ({ ...f, [k]: v }));
  const toggleTech = (t) => setSelectedTechs(prev => prev.find(x => x.id === t.id) ? prev.filter(x => x.id !== t.id) : [...prev, t]);

  const laborTotal = selectedTechs.reduce((s, t) => {
    const hours = calcHours(form.loadIn, form.endTime);
    return s + calcLabor(t.rate, hours);
  }, 0);

  function calcHours(start, end) {
    if (!start || !end) return 0;
    const [sh, sm] = start.split(":").map(Number);
    const [eh, em] = end.split(":").map(Number);
    const diff = (eh * 60 + em) - (sh * 60 + sm);
    return Math.max(0, diff / 60);
  }

  async function generateQuote() {
    if (!form.client || !form.venue || !form.date) return;
    setAiLoading(true); setAiError(""); setAiResult("");
    try {
      const hours = calcHours(form.loadIn, form.endTime);
      const prompt = `You are the operations assistant for 7 Virtues Entertainment, a touring production company based in Stafford, VA.

Generate a professional labor quote and call sheet for the following booking:

Client: ${form.client}
Venue: ${form.venue}
Date: ${form.date}
Load-In: ${form.loadIn || "TBD"}
Show Time: ${form.showTime || "TBD"}
End / Wrap: ${form.endTime || "TBD"}
Hours: ${hours > 0 ? hours + " hrs" : "TBD"}
Notes: ${form.notes || "None"}

Crew:
${selectedTechs.map(t => `- ${t.name} | ${t.role} | $${t.rate}${isDay(t.rate)?"/day (flat)":"/hr × "+hours+" hrs"} = $${calcLabor(t.rate,hours)}`).join("\n")}

Total Labor Estimate: $${laborTotal.toFixed(2)}

Output:
1. A short, professional quote email (to the client)
2. A crew call sheet with position, name, call time (30 min before load-in), and rate

Keep it concise and professional. Use 7 Virtues Entertainment branding.`;
      const res = await askClaude(prompt);
      setAiResult(res);

      setBookings(prev => [...prev, {
        id: Date.now(),
        client: form.client,
        venue: form.venue,
        date: form.date,
        loadIn: form.loadIn,
        showTime: form.showTime,
        endTime: form.endTime,
        notes: form.notes,
        crew: selectedTechs.map(t => t.name),
        crewFull: selectedTechs.map(t => ({ ...t })),
        total: laborTotal,
        salesRep: form.salesRep,
        category: form.category,
        status: "Quoted",
      }]);
    } catch (e) { setAiError(e.message); }
    setAiLoading(false);
  }

  return (
    <div>
      <SectionTitle icon="👥">Labor Booking</SectionTitle>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
        <div>
          <Card style={{ marginBottom: 16 }}>
            <div style={{ fontWeight: 600, fontSize: 13, marginBottom: 14 }}>Event Details</div>
            <Field label="Client / Organization"><input value={form.client} onChange={e => upd("client", e.target.value)} placeholder="Paramount Events" /></Field>
            <Field label="Venue"><input value={form.venue} onChange={e => upd("venue", e.target.value)} placeholder="The Anthem, DC" /></Field>
            <Field label="Event Date"><input type="date" value={form.date} onChange={e => upd("date", e.target.value)} /></Field>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10 }}>
              <Field label="Load-In"><input type="time" value={form.loadIn} onChange={e => upd("loadIn", e.target.value)} /></Field>
              <Field label="Show Time"><input type="time" value={form.showTime} onChange={e => upd("showTime", e.target.value)} /></Field>
              <Field label="Wrap Time"><input type="time" value={form.endTime} onChange={e => upd("endTime", e.target.value)} /></Field>
            </div>
            <Field label="Notes"><textarea value={form.notes} onChange={e => upd("notes", e.target.value)} placeholder="Parking, load dock access, special requirements…" /></Field>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
            <Field label="Sales Rep">
              <select value={form.salesRep} onChange={e => upd("salesRep", e.target.value)}>
                {["Roberto Rodriguez","Luis Figueroa","Willie Williams","Matt Wimpelberg","Other"].map(r => <option key={r}>{r}</option>)}
              </select>
            </Field>
            <Field label="Category">
              <select value={form.category} onChange={e => upd("category", e.target.value)}>
                {["Cloud","SNS","Inspire","Festival","Rentals","Other"].map(c => <option key={c}>{c}</option>)}
              </select>
            </Field>
          </div>
          </Card>

          <Card>
            <div style={{ fontWeight: 600, fontSize: 13, marginBottom: 14 }}>
              Labor Estimate
              {selectedTechs.length > 0 && <span style={{ color: C.gold, marginLeft: 12 }}>${laborTotal.toFixed(2)}</span>}
            </div>
            {selectedTechs.length === 0 ? <div style={{ color: C.muted, fontSize: 13 }}>Select crew from the roster →</div> :
              selectedTechs.map(t => {
                const hrs = calcHours(form.loadIn, form.endTime);
                return (
                  <div key={t.id} style={{ display: "flex", justifyContent: "space-between", padding: "6px 0", borderBottom: `1px solid ${C.border}`, fontSize: 13 }}>
                    <span>{t.name} <span style={{ color: C.muted }}>({t.role})</span></span>
                    <span>${t.rate}{rateLabel(t.rate)} {!isDay(t.rate) && <>× {hrs > 0 ? hrs + "h" : "?"}</>} = <b style={{ color: C.gold }}>${calcLabor(t.rate, hrs).toFixed(0)}</b></span>
                  </div>
                );
              })}
            <div style={{ marginTop: 16 }}>
              <Btn onClick={generateQuote} disabled={aiLoading || selectedTechs.length === 0 || !form.client}>
                {aiLoading ? "Generating…" : "⚡ Generate Quote + Call Sheet"}
              </Btn>
            </div>
          </Card>
        </div>

        <Card>
          <div style={{ fontWeight: 600, fontSize: 13, marginBottom: 14 }}>Select Crew</div>
          {techs.map(t => {
            const sel = !!selectedTechs.find(x => x.id === t.id);
            return (
              <div key={t.id} onClick={() => toggleTech(t)} style={{
                display: "flex", justifyContent: "space-between", alignItems: "center",
                padding: "10px 12px", borderRadius: 8, marginBottom: 8, cursor: "pointer",
                background: sel ? C.gold + "18" : C.bg,
                border: `1px solid ${sel ? C.gold : C.border}`,
                transition: "all 0.15s"
              }}>
                <div>
                  <div style={{ fontSize: 13, fontWeight: sel ? 600 : 400 }}>{t.name}</div>
                  <div style={{ fontSize: 11, color: C.muted }}>{t.role} · {t.certs}</div>
                </div>
                <div style={{ textAlign: "right" }}>
                  <div style={{ fontSize: 13, color: C.gold }}>${t.rate}{rateLabel(t.rate)}</div>
                  <Badge color={t.available ? C.green : C.red}>{t.available ? "Available" : "Unavailable"}</Badge>
                </div>
              </div>
            );
          })}
        </Card>
      </div>

      <AIBox loading={aiLoading} result={aiResult} error={aiError} />

      {/* Booking Status Manager */}
      {bookings.length > 0 && (
        <Card style={{ marginTop: 20 }}>
          <div style={{ fontWeight: 600, fontSize: 13, marginBottom: 14 }}>📋 Booking Status</div>
          <div style={{ fontSize: 12, color: C.muted, marginBottom: 14 }}>
            Mark bookings Confirmed to make them visible in the crew chief Show Brief.
          </div>
          {bookings.map(b => (
            <div key={b.id} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "10px 0", borderBottom: `1px solid ${C.border}`, gap: 12 }}>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 13, fontWeight: 500 }}>{b.client}</div>
                <div style={{ fontSize: 11, color: C.muted }}>{b.venue} · {b.date}</div>
                {b.crewFull && <div style={{ fontSize: 11, color: C.muted, marginTop: 2 }}>{b.crewFull.length} crew · ${b.total?.toFixed(0)}</div>}
              </div>
              <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
                <Badge color={b.status === "Confirmed" ? C.green : b.status === "Completed" ? C.muted : C.gold}>{b.status}</Badge>
                {["Quoted", "Confirmed", "Completed"].filter(s => s !== b.status).map(s => (
                  <Btn key={s} variant="ghost" style={{ fontSize: 11, padding: "3px 10px" }}
                    onClick={() => setBookings(prev => prev.map(x => x.id === b.id ? { ...x, status: s } : x))}>
                    → {s}
                  </Btn>
                ))}
              </div>
            </div>
          ))}
        </Card>
      )}
    </div>
  );
}

// ── PAYROLL ───────────────────────────────────────────────
function Payroll({ techs, payroll, setPayroll }) {
  const [form, setForm] = useState({ tech: "", event: "", jobCode: "", hours: "", payRate: "", billRate: "", date: "" });
  const [aiResult, setAiResult] = useState(""); const [aiLoading, setAiLoading] = useState(false); const [aiError, setAiError] = useState("");

  const upd = (k, v) => setForm(f => ({ ...f, [k]: v }));

  function addEntry() {
    const pr = parseFloat(form.payRate)||0;
    const br = parseFloat(form.billRate)||pr;
    const total = calcLabor(pr, parseFloat(form.hours)||0);
    if (!form.tech || !form.hours || !form.payRate) return;
    setPayroll(prev => [...prev, { id: Date.now(), ...form, rate: form.payRate, payRate: pr, billRate: br, total: isNaN(total) ? 0 : total, paid: false }]);
    setForm({ tech: "", event: "", jobCode: "", hours: "", payRate: "", billRate: "", date: "" });
  }

  function togglePaid(id) { setPayroll(prev => prev.map(p => p.id === id ? { ...p, paid: !p.paid } : p)); }

  async function generateReport() {
    setAiLoading(true); setAiError(""); setAiResult("");
    try {
      const unpaid = payroll.filter(p => !p.paid && p.type !== "receivable");
      const prompt = `Generate a weekly payroll summary report for 7 Virtues Entertainment.

Unpaid entries:
${unpaid.map(p => `${p.tech} | ${p.event} | ${parseFloat(p.rate)>100?"Day Rate: $"+p.rate:"$"+p.rate+"/hr × "+p.hours+" hrs"} = $${p.total} | Date: ${p.date}`).join("\n")}

Total Owed: $${unpaid.reduce((s, p) => s + p.total, 0).toFixed(2)}

Output a professional payroll summary with:
1. Total owed per technician
2. Total payroll liability
3. Suggested payment priority (oldest first)
4. Short note about any missing info`;
      const res = await askClaude(prompt);
      setAiResult(res);
    } catch (e) { setAiError(e.message); }
    setAiLoading(false);
  }

  const unpaidTotal = payroll.filter(p => !p.paid && p.type !== "receivable").reduce((s, p) => s + p.total, 0);

  return (
    <div>
      <SectionTitle icon="💳">Payroll Tracker</SectionTitle>
      <div style={{ display: "grid", gridTemplateColumns: "380px 1fr", gap: 16 }}>
        <div>
          <Card style={{ marginBottom: 16 }}>
            <div style={{ fontWeight: 600, fontSize: 13, marginBottom: 14 }}>Log Hours</div>
            <Field label="Technician">
              <select value={form.tech} onChange={e => {
                const t = techs.find(x => x.name === e.target.value);
                upd("tech", e.target.value);
                if (t) { upd("payRate", t.rate); upd("billRate", t.rate); }
              }}>
                <option value="">Select tech…</option>
                {techs.map(t => <option key={t.id}>{t.name}</option>)}
              </select>
            </Field>
            <Field label="Event / Show"><input value={form.event} onChange={e => upd("event", e.target.value)} placeholder="The Anthem — 6/20" /></Field>
            <Field label="Job Code"><input value={form.jobCode} onChange={e => upd("jobCode", e.target.value)} placeholder="7VE-XXX-MMDD" style={{ fontFamily: "monospace" }} /></Field>
            <Field label="Date"><input type="date" value={form.date} onChange={e => upd("date", e.target.value)} /></Field>
            <Field label="Hours"><input type="number" value={form.hours} onChange={e => upd("hours", e.target.value)} placeholder="10" /></Field>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
              <Field label="Pay Rate (tech gets)"><input type="number" value={form.payRate} onChange={e => upd("payRate", e.target.value)} placeholder="40" /></Field>
              <Field label="Bill Rate (client billed)"><input type="number" value={form.billRate} onChange={e => upd("billRate", e.target.value)} placeholder="45" /></Field>
            </div>
            {form.hours && form.payRate && (() => {
              const pr = parseFloat(form.payRate)||0;
              const br = parseFloat(form.billRate)||pr;
              const hrs = parseFloat(form.hours)||0;
              const techPay = calcLabor(pr, hrs);
              const clientBill = calcLabor(br, hrs);
              const margin = clientBill - techPay;
              return (
                <div style={{ background: C.bg, borderRadius: 6, padding: "8px 12px", marginBottom: 12, fontSize: 12 }}>
                  <div style={{ display: "flex", justifyContent: "space-between" }}>
                    <span style={{ color: C.muted }}>Tech pay:</span><span style={{ color: C.gold, fontWeight: 600 }}>${techPay.toFixed(2)}</span>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between" }}>
                    <span style={{ color: C.muted }}>Client billed:</span><span style={{ color: C.text, fontWeight: 600 }}>${clientBill.toFixed(2)}</span>
                  </div>
                  {margin > 0 && <div style={{ display: "flex", justifyContent: "space-between", borderTop: `1px solid ${C.border}`, marginTop: 4, paddingTop: 4 }}>
                    <span style={{ color: C.muted }}>Margin:</span><span style={{ color: C.green, fontWeight: 700 }}>${margin.toFixed(2)}</span>
                  </div>}
                </div>
              );
            })()}
            <Btn onClick={addEntry}>Add Entry</Btn>
          </Card>

          <Card>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
              <div style={{ fontWeight: 600, fontSize: 13 }}>Outstanding</div>
              <div style={{ color: C.red, fontWeight: 700 }}>${unpaidTotal.toFixed(2)}</div>
            </div>
            <Btn onClick={generateReport} disabled={aiLoading} variant="ghost" style={{ width: "100%" }}>
              {aiLoading ? "Generating…" : "📊 Generate Payroll Report"}
            </Btn>
          </Card>
        </div>

        <Card>
          <div style={{ fontWeight: 600, fontSize: 13, marginBottom: 14 }}>Payroll Log</div>
          {/* AR section */}
          {payroll.filter(p => p.type === "receivable").length > 0 && (
            <div style={{ marginBottom: 16, background: C.green+"0d", border: `1px solid ${C.green}33`, borderRadius: 8, padding: "12px 14px" }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: C.green, letterSpacing: "0.08em", marginBottom: 10 }}>💰 ACCOUNTS RECEIVABLE — OWED TO 7VE</div>
              {payroll.filter(p => p.type === "receivable").map(p => (
                <div key={p.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "8px 0", borderBottom: `1px solid ${C.green}22` }}>
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 500 }}>{p.event}</div>
                    <div style={{ fontSize: 11, color: C.muted }}>{p.jobCode} · {p.pay} · {p.notes}</div>
                  </div>
                  <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                    <span style={{ fontWeight: 700, color: p.paid ? C.muted : C.green }}>${p.total.toLocaleString("en-US",{minimumFractionDigits:2})}</span>
                    <Badge color={p.paid ? C.green : C.gold}>{p.paid ? "Received" : "Outstanding"}</Badge>
                    <Btn onClick={() => togglePaid(p.id)} variant={p.paid ? "ghost" : "success"} style={{ padding: "3px 10px", fontSize: 11 }}>
                      {p.paid ? "Undo" : "Mark Received"}
                    </Btn>
                  </div>
                </div>
              ))}
              <div style={{ display: "flex", justifyContent: "space-between", marginTop: 10, paddingTop: 8, borderTop: `1px solid ${C.green}33` }}>
                <span style={{ fontSize: 12, color: C.muted }}>Total outstanding</span>
                <span style={{ fontWeight: 700, color: C.green }}>${payroll.filter(p => p.type === "receivable" && !p.paid).reduce((s,p)=>s+p.total,0).toLocaleString("en-US",{minimumFractionDigits:2})}</span>
              </div>
            </div>
          )}
          <div style={{ fontWeight: 600, fontSize: 12, color: C.muted, letterSpacing: "0.08em", marginBottom: 10 }}>TECH PAYROLL</div>
          {payroll.filter(p => p.type !== "receivable").length === 0 ? <div style={{ color: C.muted, fontSize: 13 }}>No entries yet.</div> :
            <div style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12.5 }}>
                <thead>
                  <tr style={{ borderBottom: `1px solid ${C.border}` }}>
                    {["Tech", "Event", "Job Code", "Date", "Hrs", "Pay Rate", "Bill Rate", "Margin", "Tech Pay", "Status", ""].map(h => (
                      <th key={h} style={{ textAlign: "left", padding: "6px 8px", color: C.muted, fontWeight: 600 }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {payroll.filter(p => p.type !== "receivable").map(p => (
                    <tr key={p.id} style={{ borderBottom: `1px solid ${C.border}` }}>
                      <td style={{ padding: "8px 8px" }}>{p.tech}</td>
                      <td style={{ padding: "8px 8px", color: C.muted }}>{p.event}</td>
                      <td style={{ padding: "8px 8px" }}>{p.jobCode ? <span style={{ background: C.gold+"22", color: C.gold, borderRadius: 3, padding: "2px 7px", fontSize: 11, fontFamily: "monospace", fontWeight: 700 }}>{p.jobCode}</span> : <span style={{ color: C.muted }}>—</span>}</td>
                      <td style={{ padding: "8px 8px", color: C.muted }}>{p.date}</td>
                      <td style={{ padding: "8px 8px" }}></td>
                      <td style={{ padding: "8px 8px" }}>{p.hours}</td>
                      <td style={{ padding: "8px 8px", color: C.gold }}>${p.payRate ?? p.rate}</td>
                      <td style={{ padding: "8px 8px" }}>${p.billRate ?? p.rate}</td>
                      <td style={{ padding: "8px 8px", color: C.green, fontWeight: 600 }}>{p.billRate && p.payRate && p.billRate !== p.payRate ? `+$${(calcLabor(p.billRate, parseFloat(p.hours)||0) - calcLabor(p.payRate, parseFloat(p.hours)||0)).toFixed(2)}` : "—"}</td>
                      <td style={{ padding: "8px 8px", fontWeight: 600, color: p.paid ? C.green : C.gold }}>${p.total.toFixed(2)}</td>
                      <td style={{ padding: "8px 8px" }}>
                        {p.notes && p.notes.includes("in the mail")
                          ? <Badge color={C.blue}>In Mail</Badge>
                          : <Badge color={p.paid ? C.green : C.muted}>{p.paid ? "Paid" : "Unpaid"}</Badge>}
                      </td>
                      <td style={{ padding: "8px 8px" }}>
                        <Btn onClick={() => togglePaid(p.id)} variant={p.paid ? "ghost" : "success"} style={{ padding: "3px 10px", fontSize: 11 }}>
                          {p.paid ? "Undo" : "Mark Paid"}
                        </Btn>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>}
        </Card>
      </div>
      <AIBox loading={aiLoading} result={aiResult} error={aiError} />
    </div>
  );
}

// ── EQUIPMENT RENTALS ─────────────────────────────────────
function Equipment({ gear, rentals, setRentals }) {
  const [form, setForm] = useState({ client: "", event: "", date: "", items: [] });
  const [aiResult, setAiResult] = useState(""); const [aiLoading, setAiLoading] = useState(false); const [aiError, setAiError] = useState("");

  const upd = (k, v) => setForm(f => ({ ...f, [k]: v }));

  function toggleItem(g) {
    setForm(f => ({
      ...f,
      items: f.items.find(x => x.id === g.id) ? f.items.filter(x => x.id !== g.id) : [...f.items, { ...g, qtySelected: 1 }]
    }));
  }

  function updateQty(id, qty) {
    setForm(f => ({ ...f, items: f.items.map(x => x.id === id ? { ...x, qtySelected: parseInt(qty) || 1 } : x) }));
  }

  const rentalTotal = form.items.reduce((s, i) => s + i.rate * (i.qtySelected || 1), 0);
  const totalPower = form.items.reduce((s, i) => s + i.power * (i.qtySelected || 1), 0);
  const totalWeight = form.items.reduce((s, i) => s + i.weight * (i.qtySelected || 1), 0);

  async function createPackList() {
    if (!form.client || form.items.length === 0) return;
    setAiLoading(true); setAiError(""); setAiResult("");
    try {
      const prompt = `Generate a professional equipment pack list and checkout form for 7 Virtues Entertainment.

Client: ${form.client}
Event: ${form.event}
Date: ${form.date}

Selected Gear:
${form.items.map(i => `- ${i.name} | Qty: ${i.qtySelected} | $${i.rate}/day × ${i.qtySelected} = $${i.rate * i.qtySelected} | Power: ${i.power * i.qtySelected}W | Weight: ${i.weight * i.qtySelected}lb`).join("\n")}

Totals: $${rentalTotal}/day | ${totalPower}W total power | ${totalWeight}lbs

Output:
1. Equipment manifest (numbered pick list for the warehouse)
2. Power distribution notes (which distro / breaker for each item)
3. Truck pack order (heaviest first, fragile last)
4. Client-facing rental confirmation summary`;
      const res = await askClaude(prompt);
      setAiResult(res);
      setRentals(prev => [...prev, { id: Date.now(), client: form.client, event: form.event, date: form.date, items: form.items, total: rentalTotal, status: "Reserved" }]);
    } catch (e) { setAiError(e.message); }
    setAiLoading(false);
  }

  return (
    <div>
      <SectionTitle icon="🎛">Equipment Rentals</SectionTitle>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
        <div>
          <Card style={{ marginBottom: 16 }}>
            <div style={{ fontWeight: 600, fontSize: 13, marginBottom: 14 }}>Rental Details</div>
            <Field label="Client"><input value={form.client} onChange={e => upd("client", e.target.value)} placeholder="DMV Festival Group" /></Field>
            <Field label="Event"><input value={form.event} onChange={e => upd("event", e.target.value)} placeholder="Summer Block Party" /></Field>
            <Field label="Date"><input type="date" value={form.date} onChange={e => upd("date", e.target.value)} /></Field>
          </Card>

          {form.items.length > 0 && (
            <Card style={{ marginBottom: 16 }}>
              <div style={{ fontWeight: 600, fontSize: 13, marginBottom: 14 }}>Selected Items</div>
              {form.items.map(i => (
                <div key={i.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "8px 0", borderBottom: `1px solid ${C.border}`, gap: 10 }}>
                  <div style={{ flex: 1, fontSize: 12.5 }}>{i.name}</div>
                  <input type="number" min="1" max={i.qty} value={i.qtySelected} onChange={e => updateQty(i.id, e.target.value)} style={{ width: 50, textAlign: "center" }} />
                  <div style={{ color: C.gold, fontSize: 13, minWidth: 70, textAlign: "right" }}>${(i.rate * i.qtySelected).toFixed(0)}/day</div>
                </div>
              ))}
              <Divider />
              <div style={{ display: "flex", gap: 20, fontSize: 12, color: C.muted }}>
                <span>Total: <b style={{ color: C.gold }}>${rentalTotal}/day</b></span>
                <span>Power: <b style={{ color: C.text }}>{totalPower}W</b></span>
                <span>Weight: <b style={{ color: C.text }}>{totalWeight}lb</b></span>
              </div>
              <div style={{ marginTop: 14 }}>
                <Btn onClick={createPackList} disabled={aiLoading || !form.client}>
                  {aiLoading ? "Generating…" : "📦 Generate Pack List + Manifest"}
                </Btn>
              </div>
            </Card>
          )}

          <Card>
            <div style={{ fontWeight: 600, fontSize: 13, marginBottom: 14 }}>Active Rentals</div>
            {rentals.length === 0 ? <div style={{ color: C.muted, fontSize: 13 }}>No active rentals.</div> :
              rentals.map(r => (
                <div key={r.id} style={{ padding: "8px 0", borderBottom: `1px solid ${C.border}` }}>
                  <div style={{ display: "flex", justifyContent: "space-between" }}>
                    <span style={{ fontSize: 13, fontWeight: 500 }}>{r.client}</span>
                    <Badge color={r.status === "Out" ? C.red : r.status === "Reserved" ? C.gold : C.green}>{r.status}</Badge>
                  </div>
                  <div style={{ fontSize: 11, color: C.muted }}>{r.event} · {r.date} · ${r.total}/day</div>
                </div>
              ))}
          </Card>
        </div>

        <Card style={{ maxHeight: "calc(100vh - 140px)", overflowY: "auto" }}>
          <div style={{ fontWeight: 600, fontSize: 13, marginBottom: 14 }}>Inventory</div>
          {["Audio", "Lighting", "Video", "Power", "Staging", "DJ"].map(cat => {
            const catGear = gear.filter(g => g.category === cat);
            if (!catGear.length) return null;
            return (
              <div key={cat} style={{ marginBottom: 16 }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: C.gold, letterSpacing: "0.08em", marginBottom: 8 }}>{cat.toUpperCase()}</div>
                {catGear.map(g => {
                  const sel = !!form.items.find(x => x.id === g.id);
                  return (
                    <div key={g.id} onClick={() => toggleItem(g)} style={{
                      display: "flex", justifyContent: "space-between", alignItems: "center",
                      padding: "8px 10px", borderRadius: 6, marginBottom: 6, cursor: "pointer",
                      background: sel ? C.gold + "18" : C.bg,
                      border: `1px solid ${sel ? C.gold : C.border}`, transition: "all 0.15s"
                    }}>
                      <div style={{ fontSize: 12.5 }}>{g.name} <span style={{ color: C.muted }}>({g.qty} avail)</span></div>
                      <div style={{ color: C.gold, fontSize: 12, fontWeight: 600 }}>${g.rate}/day</div>
                    </div>
                  );
                })}
              </div>
            );
          })}
        </Card>
      </div>
      <AIBox loading={aiLoading} result={aiResult} error={aiError} />
    </div>
  );
}

// ── QUOTE BUILDER ─────────────────────────────────────────
function QuoteBuilder({ techs, gear }) {
  const [form, setForm] = useState({ client: "", eventType: "", venue: "", date: "", days: 1, notes: "" });
  const [selTechs, setSelTechs] = useState([]);
  const [selGear, setSelGear] = useState([]);
  const [aiResult, setAiResult] = useState(""); const [aiLoading, setAiLoading] = useState(false); const [aiError, setAiError] = useState("");

  const upd = (k, v) => setForm(f => ({ ...f, [k]: v }));
  const toggleTech = t => setSelTechs(p => p.find(x => x.id === t.id) ? p.filter(x => x.id !== t.id) : [...p, t]);
  const toggleGear = g => setSelGear(p => p.find(x => x.id === g.id) ? p.filter(x => x.id !== g.id) : [...p, g]);

  const laborEst = selTechs.reduce((s, t) => s + (isDay(t.rate) ? t.rate * form.days : t.rate * 10 * form.days), 0);
  const gearEst = selGear.reduce((s, g) => s + g.rate * form.days, 0);
  const grandTotal = laborEst + gearEst;

  async function generateProposal() {
    setAiLoading(true); setAiError(""); setAiResult("");
    try {
      const prompt = `Create a professional production proposal / quote for 7 Virtues Entertainment.

Client: ${form.client}
Event Type: ${form.eventType}
Venue: ${form.venue}
Date: ${form.date}
Days: ${form.days}
Notes: ${form.notes}

Labor:
${selTechs.map(t => isDay(t.rate) ? `- ${t.name} | ${t.role} | $${t.rate}/day × ${form.days} days = $${t.rate*form.days}` : `- ${t.name} | ${t.role} | $${t.rate}/hr × 10hrs × ${form.days} days = $${t.rate*10*form.days}`).join("\n") || "None selected"}
Labor Subtotal: $${laborEst.toFixed(2)}

Equipment Rentals:
${selGear.map(g => `- ${g.name} | $${g.rate}/day × ${form.days} days = $${g.rate * form.days}`).join("\n") || "None selected"}
Gear Subtotal: $${gearEst.toFixed(2)}

Grand Total: $${grandTotal.toFixed(2)}

Please generate:
1. A professional client-facing proposal with scope of services
2. Line-item budget breakdown
3. Terms & conditions (deposit 50%, final balance due day of show)
4. Next steps / CTA for the client

Tone: professional but approachable, confident.`;
      const res = await askClaude(prompt);
      setAiResult(res);
    } catch (e) { setAiError(e.message); }
    setAiLoading(false);
  }

  return (
    <div>
      <SectionTitle icon="📄">Quote Builder</SectionTitle>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 16 }}>
        <Card>
          <div style={{ fontWeight: 600, fontSize: 13, marginBottom: 14 }}>Event Info</div>
          <Field label="Client"><input value={form.client} onChange={e => upd("client", e.target.value)} placeholder="Client name" /></Field>
          <Field label="Event Type">
            <select value={form.eventType} onChange={e => upd("eventType", e.target.value)}>
              <option value="">Select type…</option>
              {["Festival", "Concert / Club", "Corporate", "Wedding / Private", "Tour Date", "Streaming / Broadcast"].map(t => <option key={t}>{t}</option>)}
            </select>
          </Field>
          <Field label="Venue"><input value={form.venue} onChange={e => upd("venue", e.target.value)} placeholder="Venue name" /></Field>
          <Field label="Date"><input type="date" value={form.date} onChange={e => upd("date", e.target.value)} /></Field>
          <Field label="Show Days"><input type="number" min="1" value={form.days} onChange={e => upd("days", parseInt(e.target.value) || 1)} /></Field>
          <Field label="Notes"><textarea value={form.notes} onChange={e => upd("notes", e.target.value)} placeholder="Artist rider, special requirements…" /></Field>
          <Divider />
          <div style={{ marginBottom: 12 }}>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13, marginBottom: 4 }}><span style={{ color: C.muted }}>Labor</span><span>${laborEst.toFixed(2)}</span></div>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13, marginBottom: 4 }}><span style={{ color: C.muted }}>Gear</span><span>${gearEst.toFixed(2)}</span></div>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: 15, fontWeight: 700, color: C.gold }}><span>Total</span><span>${grandTotal.toFixed(2)}</span></div>
          </div>
          <Btn onClick={generateProposal} disabled={aiLoading || !form.client} style={{ width: "100%" }}>
            {aiLoading ? "Generating…" : "⚡ Generate Proposal PDF"}
          </Btn>
        </Card>

        <Card style={{ maxHeight: "calc(100vh - 140px)", overflowY: "auto" }}>
          <div style={{ fontWeight: 600, fontSize: 13, marginBottom: 14 }}>Add Crew</div>
          {techs.map(t => {
            const sel = !!selTechs.find(x => x.id === t.id);
            return (
              <div key={t.id} onClick={() => toggleTech(t)} style={{
                padding: "10px", borderRadius: 6, marginBottom: 8, cursor: "pointer",
                background: sel ? C.gold + "18" : C.bg, border: `1px solid ${sel ? C.gold : C.border}`, transition: "all 0.15s"
              }}>
                <div style={{ fontSize: 13, fontWeight: sel ? 600 : 400 }}>{t.name}</div>
                <div style={{ fontSize: 11, color: C.muted }}>{t.role} · ${t.rate}{rateLabel(t.rate)}</div>
              </div>
            );
          })}
        </Card>

        <Card style={{ maxHeight: "calc(100vh - 140px)", overflowY: "auto" }}>
          <div style={{ fontWeight: 600, fontSize: 13, marginBottom: 14 }}>Add Gear</div>
          {gear.map(g => {
            const sel = !!selGear.find(x => x.id === g.id);
            return (
              <div key={g.id} onClick={() => toggleGear(g)} style={{
                padding: "10px", borderRadius: 6, marginBottom: 8, cursor: "pointer",
                background: sel ? C.gold + "18" : C.bg, border: `1px solid ${sel ? C.gold : C.border}`, transition: "all 0.15s"
              }}>
                <div style={{ fontSize: 12.5, fontWeight: sel ? 600 : 400 }}>{g.name}</div>
                <div style={{ fontSize: 11, color: C.muted }}>{g.category} · ${g.rate}/day</div>
              </div>
            );
          })}
        </Card>
      </div>
      <AIBox loading={aiLoading} result={aiResult} error={aiError} />
    </div>
  );
}

// ── CLIENTS ───────────────────────────────────────────────
function Clients({ clients, setClients }) {
  const [form, setForm] = useState({ company: "", contact: "", phone: "", email: "", city: "" });
  const upd = (k, v) => setForm(f => ({ ...f, [k]: v }));

  function add() {
    if (!form.company) return;
    setClients(p => [...p, { id: Date.now(), ...form }]);
    setForm({ company: "", contact: "", phone: "", email: "", city: "" });
  }

  return (
    <div>
      <SectionTitle icon="🏢">Client CRM</SectionTitle>
      <div style={{ display: "grid", gridTemplateColumns: "360px 1fr", gap: 16 }}>
        <Card>
          <div style={{ fontWeight: 600, fontSize: 13, marginBottom: 14 }}>Add Client</div>
          <Field label="Company"><input value={form.company} onChange={e => upd("company", e.target.value)} placeholder="Company name" /></Field>
          <Field label="Contact Name"><input value={form.contact} onChange={e => upd("contact", e.target.value)} placeholder="Full name" /></Field>
          <Field label="Phone"><input value={form.phone} onChange={e => upd("phone", e.target.value)} placeholder="202-555-0100" /></Field>
          <Field label="Email"><input value={form.email} onChange={e => upd("email", e.target.value)} placeholder="email@company.com" /></Field>
          <Field label="City / Market"><input value={form.city} onChange={e => upd("city", e.target.value)} placeholder="Washington, DC" /></Field>
          <Btn onClick={add}>Add Client</Btn>
        </Card>
        <Card>
          <div style={{ fontWeight: 600, fontSize: 13, marginBottom: 14 }}>Client Roster ({clients.length})</div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
            {clients.map(c => (
              <div key={c.id} style={{ background: C.bg, border: `1px solid ${C.border}`, borderRadius: 8, padding: 14 }}>
                <div style={{ fontWeight: 600, fontSize: 13 }}>{c.company}</div>
                <div style={{ fontSize: 12, color: C.muted, marginTop: 4 }}>{c.contact}</div>
                <div style={{ fontSize: 12, color: C.muted }}>{c.phone}</div>
                <div style={{ fontSize: 12, color: C.blue, marginTop: 4 }}>{c.email}</div>
                <div style={{ fontSize: 11, color: C.muted, marginTop: 4 }}>{c.city}</div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}

// ── TECHS ─────────────────────────────────────────────────
function Technicians({ techs, setTechs }) {
  const [form, setForm] = useState({ name: "", role: "", rate: "", phone: "", email: "", certs: "", address: "", pay: "Check", available: true });
  const upd = (k, v) => setForm(f => ({ ...f, [k]: v }));

  function add() {
    if (!form.name) return;
    setTechs(p => [...p, { id: Date.now(), ...form, rate: parseFloat(form.rate) || 0 }]);
    setForm({ name: "", role: "", rate: "", phone: "", email: "", certs: "", available: true });
  }

  function toggle(id) { setTechs(p => p.map(t => t.id === id ? { ...t, available: !t.available } : t)); }

  return (
    <div>
      <SectionTitle icon="🎙">Technician Roster</SectionTitle>
      <div style={{ display: "grid", gridTemplateColumns: "360px 1fr", gap: 16 }}>
        <Card>
          <div style={{ fontWeight: 600, fontSize: 13, marginBottom: 14 }}>Add Technician</div>
          <Field label="Full Name"><input value={form.name} onChange={e => upd("name", e.target.value)} /></Field>
          <Field label="Primary Role">
            <select value={form.role} onChange={e => upd("role", e.target.value)}>
              <option value="">Select…</option>
              {["A1 / FOH", "A2 / Monitors", "L1 / LD", "L2", "V1 / Video", "Stream / Broadcast", "Laser / SFX", "Tour Manager", "PM", "Stagehand"].map(r => <option key={r}>{r}</option>)}
            </select>
          </Field>
          <Field label={`Rate${form.rate && parseFloat(form.rate)>100 ? " — Day Rate (flat)" : " — Hourly ($/hr)"}`}><input type="number" value={form.rate} onChange={e => upd("rate", e.target.value)} placeholder="e.g. 40 (hourly) or 350 (day rate)" /></Field>
          <Field label="Phone"><input value={form.phone} onChange={e => upd("phone", e.target.value)} /></Field>
          <Field label="Email"><input value={form.email} onChange={e => upd("email", e.target.value)} /></Field>
          <Field label="Certifications / Skills"><input value={form.certs} onChange={e => upd("certs", e.target.value)} placeholder="MA3, RF Coord, CDL…" /></Field>
          <Field label="Address"><input value={form.address} onChange={e => upd("address", e.target.value)} placeholder="Street, City, State ZIP" /></Field>
          <Field label="Pay Method">
            <select value={form.pay} onChange={e => upd("pay", e.target.value)}>
              {["Check", "Zelle", "Cash", "Venmo", "Direct Deposit"].map(p => <option key={p}>{p}</option>)}
            </select>
          </Field>
          <Btn onClick={add}>Add to Roster</Btn>
        </Card>

        <Card>
          <div style={{ fontWeight: 600, fontSize: 13, marginBottom: 14 }}>Roster ({techs.length})</div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
            {techs.map(t => (
              <div key={t.id} style={{ background: C.bg, border: `1px solid ${C.border}`, borderRadius: 8, padding: 14 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
                  <div style={{ fontWeight: 600, fontSize: 13 }}>{t.name}</div>
                  <Badge color={t.available ? C.green : C.red}>{t.available ? "Avail" : "Booked"}</Badge>
                </div>
                <div style={{ fontSize: 12, color: C.muted }}>{t.role}</div>
                <div style={{ fontSize: 12, color: C.gold, fontWeight: 600, marginTop: 4 }}>${t.rate}{rateLabel(t.rate)} <span style={{fontSize:10,color:C.muted}}>({rateTag(t.rate)})</span></div>
                <div style={{ fontSize: 11, color: C.muted }}>{t.certs}</div>
                {t.email && <div style={{ fontSize: 11, color: C.blue, marginTop: 4 }}>{t.email}</div>}
                {t.address && <div style={{ fontSize: 10, color: C.muted, marginTop: 3 }}>{t.address}</div>}
                {t.pay && <div style={{ fontSize: 10, color: C.muted, marginTop: 2 }}>Pay: {t.pay}</div>}
                <div style={{ marginTop: 10 }}>
                  <Btn onClick={() => toggle(t.id)} variant={t.available ? "danger" : "success"} style={{ padding: "3px 10px", fontSize: 11 }}>
                    {t.available ? "Mark Booked" : "Mark Available"}
                  </Btn>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}

// ── ROOT ──────────────────────────────────────────────────
export default function App() {
  const [nav, setNav] = useState("dashboard");
  const [techs, setTechs] = useState(seedTechs);
  const [gear] = useState(seedGear);
  const [bookings, setBookings] = useState(seedBookings);
  const [payroll, setPayroll] = useState(seedPayroll);
  const [rentals, setRentals] = useState([]);
  const [clients, setClients] = useState(seedClients);
  const [clockRecords, setClockRecords] = useState([]);
  const [showPhotos, setShowPhotos] = useState([]);
  const [forumPosts, setForumPosts] = useState([]);
  const [vendors, setVendors] = useState(seedVendors);
  const [files, setFiles] = useState([]);
  const [contracts, setContracts] = useState(seedContracts);
  const [showOffers, setShowOffers] = useState([]);

  // Tech portal takes over full screen
  if (nav === "portal") {
    return (
      <>
        <style>{css}</style>
        <div>
          <div style={{ position: "fixed", top: 10, left: 10, zIndex: 999 }}>
            <Btn onClick={() => setNav("dashboard")} variant="ghost" style={{ fontSize: 11, padding: "4px 10px" }}>← Back to Ops</Btn>
          </div>
          <TechPortal
            techs={techs}
            payroll={payroll}
            clockRecords={clockRecords} setClockRecords={setClockRecords}
            showPhotos={showPhotos} setShowPhotos={setShowPhotos}
            bookings={bookings}
            forumPosts={forumPosts} setForumPosts={setForumPosts}
            showOffers={showOffers} setShowOffers={setShowOffers}
          />
        </div>
      </>
    );
  }

  const pages = {
    dashboard: <DashboardHome bookings={bookings} payroll={payroll} rentals={rentals} techs={techs} clients={clients} />,
    labor: <LaborBooking techs={techs} bookings={bookings} setBookings={setBookings} showOffers={showOffers} setShowOffers={setShowOffers} />,
    payroll: <Payroll techs={techs} payroll={payroll} setPayroll={setPayroll} />,
    rentals: <Equipment gear={gear} rentals={rentals} setRentals={setRentals} />,
    quotes: <QuoteBuilder techs={techs} gear={gear} />,
    clients: <Clients clients={clients} setClients={setClients} />,
    techs: <Technicians techs={techs} setTechs={setTechs} />,
    gallery: <ShowGallery showPhotos={showPhotos} setShowPhotos={setShowPhotos} clockRecords={clockRecords} />,
    forum: <ForumPage posts={forumPosts} setPosts={setForumPosts} techs={techs} />,
    offers: <ShowOffersAdmin showOffers={showOffers} setShowOffers={setShowOffers} techs={techs} bookings={bookings} />,
    reports: <EventReports bookings={bookings} payroll={payroll} />,
    vendors: <Vendors vendors={vendors} setVendors={setVendors} />,
    admin: <AdminPanel
      techs={techs} setTechs={setTechs}
      clockRecords={clockRecords} setClockRecords={setClockRecords}
      bookings={bookings} setBookings={setBookings}
      payroll={payroll} setPayroll={setPayroll}
      files={files} setFiles={setFiles}
      contracts={contracts} setContracts={setContracts}
    />,
  };

  const activeOnClock = clockRecords.filter(r => !r.clockOut).length;

  return (
    <>
      <style>{css}</style>
      <div style={{ display: "flex", minHeight: "100vh" }}>
        {/* Sidebar */}
        <div style={{ width: 210, background: C.panel, borderRight: `1px solid ${C.border}`, flexShrink: 0, display: "flex", flexDirection: "column" }}>
          <div style={{ padding: "20px 16px 14px", borderBottom: `1px solid ${C.border}` }}>
            <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 900, fontSize: 22, color: C.gold, letterSpacing: "0.06em" }}>7V</div>
            <div style={{ fontSize: 10, color: C.muted, letterSpacing: "0.08em", fontWeight: 600 }}>OPERATIONS</div>
          </div>
          <nav style={{ padding: "10px 8px", flex: 1, overflowY: "auto" }}>
            {NAV_GROUPS.map(group => (
              <div key={group.label} style={{ marginBottom: 6 }}>
                <div style={{ fontSize: 9, fontWeight: 700, color: C.muted, letterSpacing: "0.12em", padding: "8px 10px 4px" }}>{group.label}</div>
                {group.items.map(n => (
                  <button key={n.id} onClick={() => setNav(n.id)} style={{
                    display: "flex", alignItems: "center", justifyContent: "space-between", width: "100%",
                    padding: "8px 10px", borderRadius: 7, border: "none", cursor: "pointer",
                    background: nav === n.id ? C.gold + "20" : "transparent",
                    color: nav === n.id ? C.gold : C.muted,
                    fontSize: 12.5, fontWeight: nav === n.id ? 600 : 400,
                    marginBottom: 1, transition: "all 0.12s", textAlign: "left"
                  }}>
                    <span style={{ display: "flex", gap: 9, alignItems: "center" }}><span>{n.icon}</span> {n.label}</span>
                    {n.id === "gallery" && activeOnClock > 0 && (
                      <span style={{ background: C.green, color: "#000", borderRadius: 10, fontSize: 10, fontWeight: 700, padding: "1px 6px" }}>{activeOnClock}</span>
                    )}
                    {n.id === "gallery" && showPhotos.length > 0 && activeOnClock === 0 && (
                      <span style={{ background: C.gold, color: "#000", borderRadius: 10, fontSize: 10, fontWeight: 700, padding: "1px 6px" }}>{showPhotos.length}</span>
                    )}
                    {n.id === "forum" && forumPosts.length > 0 && (
                      <span style={{ background: C.blue, color: "#fff", borderRadius: 10, fontSize: 10, fontWeight: 700, padding: "1px 6px" }}>{forumPosts.length}</span>
                    )}
                    {n.id === "vendors" && vendors.length > 0 && (
                      <span style={{ background: C.muted, color: "#000", borderRadius: 10, fontSize: 10, fontWeight: 700, padding: "1px 6px" }}>{vendors.length}</span>
                    )}
                    {n.id === "admin" && (
                      <span style={{ color: C.red, fontSize: 12 }}>🔒</span>
                    )}
                  </button>
                ))}
              </div>
            ))}
          </nav>
          <div style={{ padding: "12px 16px", borderTop: `1px solid ${C.border}`, fontSize: 10, color: C.muted }}>
            7 Virtues Entertainment LLC<br />Stafford, VA
          </div>
        </div>

        {/* Main */}
        <div style={{ flex: 1, overflowY: "auto", padding: 28 }}>
          {pages[nav]}
        </div>
      </div>
    </>
  );
}

// ── TECH PORTAL — Login Screen ────────────────────────────
function TechPortalLogin({ techs, onLogin }) {
  const [selected, setSelected] = useState("");
  const [pin, setPin] = useState("");
  const [error, setError] = useState("");

  function handleLogin() {
    const tech = techs.find(t => t.name === selected);
    if (!tech) { setError("Select your name."); return; }
    // PIN = last 4 digits of phone, or "0000" if no phone
    const expectedPin = tech.phone ? tech.phone.replace(/\D/g, "").slice(-4) : "0000";
    if (pin !== expectedPin) { setError("Incorrect PIN. Use last 4 digits of your phone number."); return; }
    onLogin(tech);
  }

  return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: C.bg }}>
      <div style={{ width: 340 }}>
        <div style={{ textAlign: "center", marginBottom: 32 }}>
          <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 900, fontSize: 52, color: C.gold, letterSpacing: "0.06em" }}>7V</div>
          <div style={{ fontSize: 12, color: C.muted, letterSpacing: "0.12em", fontWeight: 600 }}>TECH PORTAL</div>
        </div>
        <Card>
          <Field label="Select Your Name">
            <select value={selected} onChange={e => { setSelected(e.target.value); setError(""); }}>
              <option value="">Choose name…</option>
              {techs.map(t => <option key={t.id}>{t.name}</option>)}
            </select>
          </Field>
          <Field label="PIN (last 4 digits of your phone)">
            <input
              type="password" maxLength={4} value={pin}
              onChange={e => { setPin(e.target.value); setError(""); }}
              placeholder="••••"
              onKeyDown={e => e.key === "Enter" && handleLogin()}
            />
          </Field>
          {error && <div style={{ color: C.red, fontSize: 12, marginBottom: 12 }}>{error}</div>}
          <Btn onClick={handleLogin} style={{ width: "100%" }}>Clock In / Out</Btn>
          <div style={{ fontSize: 11, color: C.muted, marginTop: 12, textAlign: "center" }}>
            No phone on file? PIN is 0000. Contact your coordinator to update.
          </div>
        </Card>
      </div>
    </div>
  );
}

// ── TECH PORTAL — Clock In/Out + Photo Upload ─────────────
function TechPortalDashboard({ tech, payroll, clockRecords, setClockRecords, showPhotos, setShowPhotos, bookings, techs, forumPosts, setForumPosts, showOffers, setShowOffers, onLogout }) {
  const [view, setView] = useState("clock"); // "clock" | "photo"
  const activeRecord = clockRecords.find(r => r.techId === tech.id && !r.clockOut);

  const [showSel, setShowSel] = useState("");
  const [locationNote, setLocationNote] = useState("");
  const [photoFile, setPhotoFile] = useState(null);
  const [photoPreview, setPhotoPreview] = useState(null);
  const [photoCaption, setPhotoCaption] = useState("");
  const [uploaded, setUploaded] = useState(false);

  const myRecords = clockRecords.filter(r => r.techId === tech.id);
  const isCrewChief = tech.role.toLowerCase().includes("crew lead") || tech.role.toLowerCase().includes("tour manager") || tech.role.toLowerCase().includes("pm");
  const [selectedBookingId, setSelectedBookingId] = useState(bookings.length > 0 ? bookings[0].id : null);
  const selectedBooking = bookings.find(b => b.id === selectedBookingId) || bookings[0] || null;

  function clockIn() {
    if (!showSel) return;
    const record = {
      id: Date.now(), techId: tech.id, techName: tech.name,
      show: showSel, location: locationNote,
      clockIn: new Date().toISOString(), clockOut: null,
    };
    setClockRecords(p => [...p, record]);
    setShowSel(""); setLocationNote("");
  }

  function clockOut() {
    setClockRecords(p => p.map(r =>
      r.id === activeRecord.id ? { ...r, clockOut: new Date().toISOString() } : r
    ));
  }

  function handlePhotoFile(e) {
    const file = e.target.files[0];
    if (!file) return;
    setPhotoFile(file);
    const reader = new FileReader();
    reader.onload = ev => setPhotoPreview(ev.target.result);
    reader.readAsDataURL(file);
  }

  function submitPhoto() {
    if (!photoPreview) return;
    const entry = {
      id: Date.now(), techId: tech.id, techName: tech.name,
      show: activeRecord ? activeRecord.show : "General",
      location: activeRecord ? activeRecord.location : "",
      caption: photoCaption,
      dataUrl: photoPreview,
      timestamp: new Date().toISOString(),
    };
    setShowPhotos(p => [...p, entry]);
    setPhotoFile(null); setPhotoPreview(null); setPhotoCaption(""); setUploaded(true);
    setTimeout(() => setUploaded(false), 3000);
  }

  function fmtTime(iso) {
    if (!iso) return "—";
    return new Date(iso).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  }

  function calcDuration(inIso, outIso) {
    if (!inIso || !outIso) return "—";
    const diff = (new Date(outIso) - new Date(inIso)) / 3600000;
    return diff.toFixed(2) + " hrs";
  }

  return (
    <div style={{ minHeight: "100vh", background: C.bg }}>
      {/* Header */}
      <div style={{ background: C.panel, borderBottom: `1px solid ${C.border}`, padding: "14px 24px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 900, fontSize: 28, color: C.gold }}>7V</div>
          <div>
            <div style={{ fontWeight: 600, fontSize: 14 }}>{tech.name}</div>
            <div style={{ fontSize: 11, color: C.muted }}>{tech.role}</div>
          </div>
        </div>
        <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
          {activeRecord && <Badge color={C.green}>● CLOCKED IN — {activeRecord.show}</Badge>}
          <Btn onClick={onLogout} variant="ghost" style={{ fontSize: 12, padding: "5px 12px" }}>Log Out</Btn>
        </div>
      </div>

      {/* Tab nav */}
      <div style={{ display: "flex", borderBottom: `1px solid ${C.border}`, background: C.panel }}>
        {(() => {
          const myOpenOffers = (showOffers || []).filter(o => {
            if (o.status !== "Open") return false;
            if (!o.targetTechs || o.targetTechs.length === 0) return true;
            return o.targetTechs.includes(tech.name);
          });
          const unread = myOpenOffers.filter(o => !o.responses?.[tech.name]).length;
          const tabs = [
            ["clock", "⏱ Time Clock", 0],
            ["photo", "📸 Upload Photo", 0],
            ["shows", "📣 Shows", unread],
            ["earnings", "📊 My Earnings", 0],
            ["forum", "💬 Tech Forum", 0],
            ...(isCrewChief ? [["brief", "📋 Show Brief", 0]] : []),
          ];
          return tabs.map(([id, label, badge]) => (
            <button key={id} onClick={() => setView(id)} style={{
              padding: "12px 18px", border: "none", background: "transparent",
              color: view === id ? C.gold : C.muted, fontWeight: view === id ? 600 : 400,
              fontSize: 13, borderBottom: view === id ? `2px solid ${C.gold}` : "2px solid transparent",
              cursor: "pointer", transition: "all 0.12s", position: "relative",
            }}>
              {label}
              {badge > 0 && <span style={{ marginLeft: 6, background: C.red, color: "#fff", borderRadius: 10, fontSize: 10, fontWeight: 700, padding: "1px 5px" }}>{badge}</span>}
            </button>
          ));
        })()}
      </div>

      <div style={{ padding: 24, maxWidth: 640, margin: "0 auto" }}>

        {/* ── CLOCK VIEW ── */}
        {view === "clock" && (
          <div>
            {/* Status card */}
            {activeRecord ? (
              <Card style={{ marginBottom: 20, borderColor: C.green + "66" }}>
                <div style={{ display: "flex", justify: "space-between", alignItems: "center", marginBottom: 16 }}>
                  <div>
                    <div style={{ fontSize: 11, color: C.green, fontWeight: 700, letterSpacing: "0.08em" }}>● CURRENTLY CLOCKED IN</div>
                    <div style={{ fontSize: 22, fontWeight: 700, marginTop: 4 }}>{activeRecord.show}</div>
                    {activeRecord.location && <div style={{ fontSize: 13, color: C.muted }}>{activeRecord.location}</div>}
                    <div style={{ fontSize: 13, color: C.muted, marginTop: 4 }}>Since {fmtTime(activeRecord.clockIn)}</div>
                  </div>
                </div>
                <Btn onClick={clockOut} variant="danger" style={{ width: "100%", padding: "12px" }}>
                  ⏹ Clock Out
                </Btn>
                <div style={{ marginTop: 12, textAlign: "center", fontSize: 12, color: C.muted }}>
                  After clocking out, switch to the 📸 tab to upload your mid-show photo.
                </div>
              </Card>
            ) : (
              <Card style={{ marginBottom: 20 }}>
                <div style={{ fontWeight: 600, fontSize: 14, marginBottom: 16 }}>Clock In</div>
                <Field label="Show / Event">
                  <select value={showSel} onChange={e => setShowSel(e.target.value)}>
                    <option value="">Select show…</option>
                    {bookings.length > 0
                      ? bookings.map(b => <option key={b.id}>{b.client} — {b.venue} ({b.date})</option>)
                      : ["General Load-In", "Rehearsal", "Show Day", "Strike", "Warehouse Day"].map(s => <option key={s}>{s}</option>)
                    }
                  </select>
                </Field>
                <Field label="Location / Notes">
                  <input value={locationNote} onChange={e => setLocationNote(e.target.value)} placeholder="Stage left, FOH, backstage…" />
                </Field>
                <Btn onClick={clockIn} disabled={!showSel} style={{ width: "100%", padding: "12px" }}>
                  ▶ Clock In
                </Btn>
              </Card>
            )}

            {/* My time log */}
            <Card>
              <div style={{ fontWeight: 600, fontSize: 13, marginBottom: 14 }}>My Time Log</div>
              {myRecords.length === 0
                ? <div style={{ color: C.muted, fontSize: 13 }}>No records yet.</div>
                : myRecords.slice().reverse().map(r => (
                  <div key={r.id} style={{ padding: "10px 0", borderBottom: `1px solid ${C.border}` }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <div style={{ fontWeight: 500, fontSize: 13 }}>{r.show}</div>
                      <Badge color={r.clockOut ? C.muted : C.green}>{r.clockOut ? calcDuration(r.clockIn, r.clockOut) : "Active"}</Badge>
                    </div>
                    <div style={{ fontSize: 11, color: C.muted, marginTop: 3 }}>
                      In: {fmtTime(r.clockIn)} {r.clockOut ? `· Out: ${fmtTime(r.clockOut)}` : ""} {r.location ? `· ${r.location}` : ""}
                    </div>
                  </div>
                ))}
            </Card>
          </div>
        )}

        {/* ── PHOTO VIEW ── */}
        {view === "photo" && (
          <div>
            <Card style={{ marginBottom: 20 }}>
              <div style={{ fontWeight: 600, fontSize: 14, marginBottom: 6 }}>Mid-Show Photo Upload</div>
              <div style={{ fontSize: 12, color: C.muted, marginBottom: 16 }}>
                This photo will appear in the 7 Virtues show gallery on the website. Make it count — crowd, stage, lighting, moments.
              </div>

              {/* Drop zone */}
              <label style={{
                display: "block", border: `2px dashed ${photoPreview ? C.gold : C.border}`,
                borderRadius: 10, padding: 24, textAlign: "center", cursor: "pointer",
                background: photoPreview ? C.gold + "0a" : "transparent", transition: "all 0.2s", marginBottom: 14
              }}>
                <input type="file" accept="image/*" capture="environment" onChange={handlePhotoFile} style={{ display: "none" }} />
                {photoPreview
                  ? <img src={photoPreview} alt="preview" style={{ maxWidth: "100%", maxHeight: 320, borderRadius: 8, objectFit: "cover" }} />
                  : <div>
                    <div style={{ fontSize: 36, marginBottom: 10 }}>📷</div>
                    <div style={{ fontSize: 14, color: C.muted }}>Tap to take or choose a photo</div>
                    <div style={{ fontSize: 11, color: C.muted, marginTop: 4 }}>On mobile, this opens your camera directly</div>
                  </div>
                }
              </label>

              {photoPreview && (
                <>
                  <Field label="Caption (optional)">
                    <input value={photoCaption} onChange={e => setPhotoCaption(e.target.value)} placeholder="Main stage, sound check, crowd shot…" />
                  </Field>
                  <div style={{ display: "flex", gap: 10 }}>
                    <Btn onClick={submitPhoto} style={{ flex: 1, padding: "11px" }}>
                      ⬆ Submit to Gallery
                    </Btn>
                    <Btn onClick={() => { setPhotoPreview(null); setPhotoFile(null); }} variant="ghost">
                      Retake
                    </Btn>
                  </div>
                </>
              )}

              {uploaded && (
                <div style={{ marginTop: 14, background: C.green + "22", border: `1px solid ${C.green}44`, borderRadius: 8, padding: 14, textAlign: "center", color: C.green, fontSize: 13, fontWeight: 600 }}>
                  ✓ Photo submitted to the show gallery!
                </div>
              )}
            </Card>

            {/* My submitted photos */}
            {showPhotos.filter(p => p.techId === tech.id).length > 0 && (
              <Card>
                <div style={{ fontWeight: 600, fontSize: 13, marginBottom: 14 }}>My Submissions</div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                  {showPhotos.filter(p => p.techId === tech.id).map(p => (
                    <div key={p.id} style={{ borderRadius: 8, overflow: "hidden", border: `1px solid ${C.border}` }}>
                      <img src={p.dataUrl} alt={p.caption} style={{ width: "100%", height: 130, objectFit: "cover" }} />
                      <div style={{ padding: "8px 10px", background: C.panel }}>
                        <div style={{ fontSize: 11, fontWeight: 600 }}>{p.show}</div>
                        {p.caption && <div style={{ fontSize: 10, color: C.muted }}>{p.caption}</div>}
                        <div style={{ fontSize: 10, color: C.muted }}>{new Date(p.timestamp).toLocaleDateString()}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            )}
          </div>
        )}

        {/* ── SHOWS VIEW ── */}
        {view === "shows" && (
          <ShowOffersPortal tech={tech} showOffers={showOffers || []} setShowOffers={setShowOffers} />
        )}

        {/* ── EARNINGS VIEW ── */}
        {view === "earnings" && (
          <EarningsView tech={tech} payroll={payroll} clockRecords={clockRecords} />
        )}

        {/* ── TECH FORUM VIEW ── */}
        {view === "forum" && (
          <TechForum
            posts={forumPosts} setPosts={setForumPosts}
            currentAuthor={tech.name}
            isAdmin={false}
          />
        )}

        {/* ── SHOW BRIEF VIEW (crew chief only) ── */}
        {view === "brief" && isCrewChief && (
          <div>
            {confirmedBookings.length === 0 ? (
              <Card>
                <div style={{ textAlign: "center", padding: 32, color: C.muted }}>
                  <div style={{ fontSize: 28, marginBottom: 10 }}>📋</div>
                  No confirmed shows yet. The coordinator will confirm your booking and it will appear here.
                </div>
              </Card>
            ) : (
              <>
                {/* Show selector */}
                {confirmedBookings.length > 1 && (
                  <div style={{ marginBottom: 16 }}>
                    <Label>Select Show</Label>
                    <select value={selectedBookingId || ""} onChange={e => setSelectedBookingId(parseInt(e.target.value))} style={{ maxWidth: 400 }}>
                      {confirmedBookings.map(b => (
                        <option key={b.id} value={b.id}>{b.client} — {b.venue} ({b.date})</option>
                      ))}
                    </select>
                  </div>
                )}

                {selectedBooking && (
                  <>
                    {/* Show details */}
                    <Card style={{ marginBottom: 16, borderColor: C.gold + "44" }}>
                      <div style={{ fontSize: 11, fontWeight: 700, color: C.gold, letterSpacing: "0.1em", marginBottom: 12 }}>◈ SHOW DETAILS</div>
                      <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 900, fontSize: 28, marginBottom: 4 }}>{selectedBooking.client}</div>
                      <div style={{ fontSize: 16, color: C.muted, marginBottom: 16 }}>{selectedBooking.venue}</div>

                      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                        {[
                          ["📅 Date", selectedBooking.date || "TBD"],
                          ["🚪 Load-In", selectedBooking.loadIn || "TBD"],
                          ["🎤 Show Time", selectedBooking.showTime || "TBD"],
                          ["🏁 Wrap", selectedBooking.endTime || "TBD"],
                        ].map(([label, val]) => (
                          <div key={label} style={{ background: C.bg, borderRadius: 8, padding: "10px 14px", border: `1px solid ${C.border}` }}>
                            <div style={{ fontSize: 11, color: C.muted, marginBottom: 3 }}>{label}</div>
                            <div style={{ fontSize: 15, fontWeight: 600 }}>{val}</div>
                          </div>
                        ))}
                      </div>

                      {selectedBooking.notes && (
                        <div style={{ marginTop: 14, background: C.gold + "0f", border: `1px solid ${C.gold}33`, borderRadius: 8, padding: "10px 14px" }}>
                          <div style={{ fontSize: 11, color: C.gold, fontWeight: 700, marginBottom: 4 }}>NOTES / SPECIAL REQUIREMENTS</div>
                          <div style={{ fontSize: 13 }}>{selectedBooking.notes}</div>
                        </div>
                      )}

                      <div style={{ marginTop: 14, display: "flex", justifyContent: "space-between", paddingTop: 12, borderTop: `1px solid ${C.border}` }}>
                        <span style={{ fontSize: 12, color: C.muted }}>Labor Total</span>
                        <span style={{ fontWeight: 700, color: C.gold }}>${selectedBooking.total?.toFixed(2) || "TBD"}</span>
                      </div>
                    </Card>

                    {/* Crew manifest */}
                    <Card>
                      <div style={{ fontSize: 11, fontWeight: 700, color: C.gold, letterSpacing: "0.1em", marginBottom: 14 }}>
                        ◈ CREW ON SITE — {(selectedBooking.crewFull || []).length} PEOPLE
                      </div>

                      {(!selectedBooking.crewFull || selectedBooking.crewFull.length === 0) ? (
                        <div style={{ color: C.muted, fontSize: 13 }}>No crew assigned yet.</div>
                      ) : (
                        (selectedBooking.crewFull || []).map((t, i) => (
                          <div key={t.id || i} style={{
                            display: "flex", justifyContent: "space-between", alignItems: "flex-start",
                            padding: "14px 0", borderBottom: `1px solid ${C.border}`
                          }}>
                            <div style={{ flex: 1 }}>
                              <div style={{ fontWeight: 600, fontSize: 14 }}>{t.name}</div>
                              <div style={{ fontSize: 12, color: C.gold, marginTop: 2 }}>{t.role}</div>
                              {t.certs && <div style={{ fontSize: 11, color: C.muted, marginTop: 2 }}>{t.certs}</div>}
                            </div>
                            <div style={{ textAlign: "right", flexShrink: 0 }}>
                              {t.phone && (
                                <a href={`tel:${t.phone}`} style={{
                                  display: "block", fontSize: 13, color: C.blue, textDecoration: "none",
                                  fontWeight: 500, marginBottom: 3
                                }}>📞 {t.phone}</a>
                              )}
                              {t.email && (
                                <a href={`mailto:${t.email}`} style={{
                                  display: "block", fontSize: 11, color: C.muted, textDecoration: "none"
                                }}>✉ {t.email}</a>
                              )}
                              <div style={{ marginTop: 6 }}>
                                <Badge color={t.rate > 100 ? C.blue : C.muted}>
                                  ${t.rate}{t.rate > 100 ? "/day" : "/hr"}
                                </Badge>
                              </div>
                            </div>
                          </div>
                        ))
                      )}

                      {/* Call times summary */}
                      {selectedBooking.loadIn && (selectedBooking.crewFull || []).length > 0 && (
                        <div style={{ marginTop: 16, background: C.bg, borderRadius: 8, padding: "12px 14px", border: `1px solid ${C.border}` }}>
                          <div style={{ fontSize: 11, fontWeight: 700, color: C.muted, letterSpacing: "0.08em", marginBottom: 8 }}>CALL TIMES</div>
                          {(selectedBooking.crewFull || []).map((t, i) => {
                            const [h, m] = (selectedBooking.loadIn || "00:00").split(":").map(Number);
                            const callMins = h * 60 + m - 30;
                            const ch = Math.floor(Math.max(0, callMins) / 60) % 24;
                            const cm = Math.max(0, callMins) % 60;
                            const callStr = `${ch % 12 || 12}:${cm.toString().padStart(2, "0")} ${ch >= 12 ? "PM" : "AM"}`;
                            return (
                              <div key={i} style={{ display: "flex", justifyContent: "space-between", fontSize: 12, padding: "4px 0" }}>
                                <span>{t.name} <span style={{ color: C.muted }}>({t.role})</span></span>
                                <span style={{ color: C.gold, fontWeight: 600 }}>{callStr}</span>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </Card>
                  </>
                )}
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

// ── TECH PORTAL — wrapper (login gate) ───────────────────
function TechPortal({ techs, payroll, clockRecords, setClockRecords, showPhotos, setShowPhotos, bookings, forumPosts, setForumPosts, showOffers, setShowOffers }) {
  const [loggedInTech, setLoggedInTech] = useState(null);
  if (!loggedInTech) return <TechPortalLogin techs={techs} onLogin={setLoggedInTech} />;
  return (
    <TechPortalDashboard
      tech={loggedInTech}
      techs={techs}
      payroll={payroll}
      clockRecords={clockRecords} setClockRecords={setClockRecords}
      showPhotos={showPhotos} setShowPhotos={setShowPhotos}
      bookings={bookings}
      forumPosts={forumPosts} setForumPosts={setForumPosts}
      showOffers={showOffers} setShowOffers={setShowOffers}
      onLogout={() => setLoggedInTech(null)}
    />
  );
}


// ── TECH FORUM ────────────────────────────────────────────
// Shared across admin and tech portal; posts/replies stored in prop
function TechForum({ posts, setPosts, currentAuthor, isAdmin = false }) {
  const [view, setView] = useState("list"); // "list" | "thread" | "new"
  const [activePostId, setActivePostId] = useState(null);
  const [newTitle, setNewTitle] = useState("");
  const [newBody, setNewBody] = useState("");
  const [newTag, setNewTag] = useState("General");
  const [replyText, setReplyText] = useState("");
  const [filterTag, setFilterTag] = useState("All");

  const TAGS = ["General", "Audio", "Lighting", "Video", "Power", "Rigging", "Safety", "Gear Review", "Troubleshoot"];
  const TAG_COLORS = { Audio: C.blue, Lighting: C.gold, Video: "#9b59b6", Power: C.red, Rigging: "#e67e22", Safety: C.red, "Gear Review": C.green, Troubleshoot: C.gold, General: C.muted };

  function submitPost() {
    if (!newTitle.trim() || !newBody.trim()) return;
    const post = {
      id: Date.now(),
      title: newTitle.trim(),
      body: newBody.trim(),
      tag: newTag,
      author: currentAuthor,
      timestamp: new Date().toISOString(),
      replies: [],
      pinned: false,
    };
    setPosts(p => [post, ...p]);
    setNewTitle(""); setNewBody(""); setNewTag("General");
    setView("thread"); setActivePostId(post.id);
  }

  function submitReply(postId) {
    if (!replyText.trim()) return;
    const reply = {
      id: Date.now(),
      body: replyText.trim(),
      author: currentAuthor,
      timestamp: new Date().toISOString(),
    };
    setPosts(p => p.map(x => x.id === postId ? { ...x, replies: [...x.replies, reply] } : x));
    setReplyText("");
  }

  function deletePost(id) { setPosts(p => p.filter(x => x.id !== id)); setView("list"); }
  function togglePin(id) { setPosts(p => p.map(x => x.id === id ? { ...x, pinned: !x.pinned } : x)); }

  function fmtAgo(iso) {
    const diff = (Date.now() - new Date(iso)) / 1000;
    if (diff < 60) return "just now";
    if (diff < 3600) return Math.floor(diff/60) + "m ago";
    if (diff < 86400) return Math.floor(diff/3600) + "h ago";
    return Math.floor(diff/86400) + "d ago";
  }

  const activePost = posts.find(p => p.id === activePostId);
  const sorted = [...posts].sort((a, b) => (b.pinned - a.pinned) || new Date(b.timestamp) - new Date(a.timestamp));
  const filtered = filterTag === "All" ? sorted : sorted.filter(p => p.tag === filterTag);

  if (view === "new") return (
    <div>
      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 20 }}>
        <Btn onClick={() => setView("list")} variant="ghost" style={{ fontSize: 12, padding: "4px 10px" }}>← Back</Btn>
        <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 900, fontSize: 22, color: C.text }}>New Discussion</div>
      </div>
      <Card style={{ maxWidth: 640 }}>
        <Field label="Title / Question">
          <input value={newTitle} onChange={e => setNewTitle(e.target.value)} placeholder="e.g. Best RF coordination workflow for festival stages?" />
        </Field>
        <Field label="Category">
          <select value={newTag} onChange={e => setNewTag(e.target.value)}>
            {TAGS.map(t => <option key={t}>{t}</option>)}
          </select>
        </Field>
        <Field label="Details">
          <textarea value={newBody} onChange={e => setNewBody(e.target.value)} placeholder="Describe the problem, gear involved, what you've tried…" style={{ minHeight: 120 }} />
        </Field>
        <div style={{ display: "flex", gap: 10 }}>
          <Btn onClick={submitPost} disabled={!newTitle.trim() || !newBody.trim()}>Post Discussion</Btn>
          <Btn onClick={() => setView("list")} variant="ghost">Cancel</Btn>
        </div>
      </Card>
    </div>
  );

  if (view === "thread" && activePost) return (
    <div>
      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 20 }}>
        <Btn onClick={() => setView("list")} variant="ghost" style={{ fontSize: 12, padding: "4px 10px" }}>← All Discussions</Btn>
        <Badge color={TAG_COLORS[activePost.tag] || C.muted}>{activePost.tag}</Badge>
        {activePost.pinned && <Badge color={C.gold}>📌 Pinned</Badge>}
      </div>

      <Card style={{ marginBottom: 16 }}>
        <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 900, fontSize: 24, marginBottom: 8, lineHeight: 1.2 }}>{activePost.title}</div>
        <div style={{ display: "flex", gap: 12, marginBottom: 14, fontSize: 12, color: C.muted }}>
          <span style={{ color: C.text, fontWeight: 600 }}>{activePost.author}</span>
          <span>{fmtAgo(activePost.timestamp)}</span>
          <span>{activePost.replies.length} {activePost.replies.length === 1 ? "reply" : "replies"}</span>
        </div>
        <div style={{ fontSize: 14, lineHeight: 1.65, color: C.text, whiteSpace: "pre-wrap" }}>{activePost.body}</div>
        {isAdmin && (
          <div style={{ display: "flex", gap: 8, marginTop: 16, paddingTop: 12, borderTop: `1px solid ${C.border}` }}>
            <Btn onClick={() => togglePin(activePost.id)} variant="ghost" style={{ fontSize: 11, padding: "3px 10px" }}>
              {activePost.pinned ? "📌 Unpin" : "📌 Pin"}
            </Btn>
            <Btn onClick={() => deletePost(activePost.id)} variant="danger" style={{ fontSize: 11, padding: "3px 10px" }}>Delete</Btn>
          </div>
        )}
      </Card>

      {/* Replies */}
      {activePost.replies.map((r, i) => (
        <div key={r.id} style={{
          marginBottom: 10, padding: "14px 16px", borderRadius: 8,
          background: r.author === currentAuthor ? C.gold + "0d" : C.panel,
          border: `1px solid ${r.author === currentAuthor ? C.gold + "33" : C.border}`
        }}>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
            <span style={{ fontSize: 12, fontWeight: 600, color: r.author === currentAuthor ? C.gold : C.text }}>{r.author}</span>
            <span style={{ fontSize: 11, color: C.muted }}>{fmtAgo(r.timestamp)}</span>
          </div>
          <div style={{ fontSize: 13, lineHeight: 1.6, whiteSpace: "pre-wrap" }}>{r.body}</div>
        </div>
      ))}

      {/* Reply box */}
      <Card style={{ marginTop: 12 }}>
        <div style={{ fontSize: 12, fontWeight: 600, marginBottom: 10, color: C.muted }}>Reply as {currentAuthor}</div>
        <Field label="">
          <textarea value={replyText} onChange={e => setReplyText(e.target.value)} placeholder="Share your experience, solution, or follow-up question…" style={{ minHeight: 80 }} />
        </Field>
        <Btn onClick={() => submitReply(activePost.id)} disabled={!replyText.trim()}>Post Reply</Btn>
      </Card>
    </div>
  );

  // List view
  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
        <SectionTitle icon="💬">Tech Forum</SectionTitle>
        <Btn onClick={() => setView("new")}>+ New Discussion</Btn>
      </div>

      {/* Tag filter */}
      <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 18 }}>
        {["All", ...TAGS].map(t => (
          <button key={t} onClick={() => setFilterTag(t)} style={{
            padding: "4px 12px", borderRadius: 20, fontSize: 11, fontWeight: 500, border: "none", cursor: "pointer",
            background: filterTag === t ? (TAG_COLORS[t] || C.gold) : C.panel,
            color: filterTag === t ? (t === "All" ? "#000" : "#fff") : C.muted,
            border: `1px solid ${filterTag === t ? (TAG_COLORS[t] || C.gold) : C.border}`,
          }}>{t}</button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <Card>
          <div style={{ textAlign: "center", padding: 40, color: C.muted }}>
            <div style={{ fontSize: 32, marginBottom: 10 }}>💬</div>
            <div style={{ marginBottom: 8 }}>No discussions yet{filterTag !== "All" ? ` in ${filterTag}` : ""}.</div>
            <Btn onClick={() => setView("new")}>Start the first one</Btn>
          </div>
        </Card>
      ) : (
        filtered.map(p => (
          <div key={p.id} onClick={() => { setActivePostId(p.id); setView("thread"); }} style={{
            background: C.panel, border: `1px solid ${p.pinned ? C.gold + "55" : C.border}`,
            borderRadius: 10, padding: "14px 18px", marginBottom: 10, cursor: "pointer",
            transition: "border 0.15s",
          }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 12 }}>
              <div style={{ flex: 1 }}>
                <div style={{ display: "flex", gap: 8, alignItems: "center", marginBottom: 6, flexWrap: "wrap" }}>
                  {p.pinned && <Badge color={C.gold}>📌 Pinned</Badge>}
                  <Badge color={TAG_COLORS[p.tag] || C.muted}>{p.tag}</Badge>
                </div>
                <div style={{ fontWeight: 600, fontSize: 14, marginBottom: 4 }}>{p.title}</div>
                <div style={{ fontSize: 12, color: C.muted, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", maxWidth: 500 }}>{p.body}</div>
              </div>
              <div style={{ textAlign: "right", flexShrink: 0 }}>
                <div style={{ fontSize: 12, color: p.replies.length > 0 ? C.gold : C.muted, fontWeight: p.replies.length > 0 ? 600 : 400 }}>
                  {p.replies.length} {p.replies.length === 1 ? "reply" : "replies"}
                </div>
                <div style={{ fontSize: 11, color: C.muted, marginTop: 2 }}>{fmtAgo(p.timestamp)}</div>
                <div style={{ fontSize: 11, color: C.muted }}>{p.author}</div>
              </div>
            </div>
          </div>
        ))
      )}
    </div>
  );
}

// ── FORUM PAGE (admin wrapper) ────────────────────────────
function ForumPage({ posts, setPosts, techs }) {
  return (
    <TechForum
      posts={posts} setPosts={setPosts}
      currentAuthor="Coordinator (7VE)"
      isAdmin={true}
    />
  );
}

// ── SHOW GALLERY (Admin view) ─────────────────────────────
function ShowGallery({ showPhotos, setShowPhotos, clockRecords }) {
  const [filterShow, setFilterShow] = useState("All");
  const shows = ["All", ...new Set(showPhotos.map(p => p.show))];
  const filtered = filterShow === "All" ? showPhotos : showPhotos.filter(p => p.show === filterShow);
  const activeNow = clockRecords.filter(r => !r.clockOut);

  function removePhoto(id) { setShowPhotos(p => p.filter(x => x.id !== id)); }

  return (
    <div>
      <SectionTitle icon="📸">Show Gallery</SectionTitle>

      {/* Live crew status */}
      {activeNow.length > 0 && (
        <Card style={{ marginBottom: 20, borderColor: C.green + "55" }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: C.green, letterSpacing: "0.08em", marginBottom: 10 }}>● CREW ON CLOCK NOW</div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
            {activeNow.map(r => (
              <div key={r.id} style={{ background: C.green + "15", border: `1px solid ${C.green}44`, borderRadius: 6, padding: "6px 12px", fontSize: 12 }}>
                <span style={{ fontWeight: 600 }}>{r.techName}</span>
                <span style={{ color: C.muted }}> · {r.show} {r.location ? `· ${r.location}` : ""}</span>
              </div>
            ))}
          </div>
        </Card>
      )}

      {showPhotos.length === 0 ? (
        <Card>
          <div style={{ textAlign: "center", padding: 40, color: C.muted }}>
            <div style={{ fontSize: 36, marginBottom: 12 }}>📷</div>
            <div>No photos yet. Techs can upload mid-show photos from the Tech Portal.</div>
          </div>
        </Card>
      ) : (
        <>
          {/* Filter */}
          <div style={{ display: "flex", gap: 8, marginBottom: 18, flexWrap: "wrap" }}>
            {shows.map(s => (
              <button key={s} onClick={() => setFilterShow(s)} style={{
                padding: "5px 14px", borderRadius: 20, fontSize: 12, fontWeight: 500, border: "none", cursor: "pointer",
                background: filterShow === s ? C.gold : C.panel,
                color: filterShow === s ? "#000" : C.muted,
                border: `1px solid ${filterShow === s ? C.gold : C.border}`,
              }}>{s}</button>
            ))}
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))", gap: 14 }}>
            {filtered.slice().reverse().map(p => (
              <div key={p.id} style={{ borderRadius: 10, overflow: "hidden", border: `1px solid ${C.border}`, background: C.panel }}>
                <div style={{ position: "relative" }}>
                  <img src={p.dataUrl} alt={p.caption} style={{ width: "100%", height: 190, objectFit: "cover", display: "block" }} />
                  <button onClick={() => removePhoto(p.id)} style={{
                    position: "absolute", top: 8, right: 8, background: "#000a", border: "none",
                    color: "#fff", borderRadius: 4, padding: "3px 8px", fontSize: 11, cursor: "pointer"
                  }}>✕ Remove</button>
                </div>
                <div style={{ padding: "10px 14px 14px" }}>
                  <div style={{ fontWeight: 600, fontSize: 13 }}>{p.show}</div>
                  {p.caption && <div style={{ fontSize: 12, color: C.muted, marginTop: 2 }}>{p.caption}</div>}
                  <div style={{ display: "flex", justifyContent: "space-between", marginTop: 8 }}>
                    <div style={{ fontSize: 11, color: C.muted }}>{p.techName}</div>
                    <div style={{ fontSize: 11, color: C.muted }}>{new Date(p.timestamp).toLocaleDateString()} {new Date(p.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

// ════════════════════════════════════════════════════════════
// VENDOR DIRECTORY
// ════════════════════════════════════════════════════════════
const VENDOR_CATS = ["Audio", "Lighting", "Video / LED", "Staging", "Power / Distro", "Backline", "Trucking / Logistics", "Dry Hire", "Staffing Agency", "Venue / Space", "Catering", "Security", "Other"];
const VENDOR_STATUSES = ["Preferred", "Approved", "Pending Review", "Do Not Use"];
const VS_COLORS = { Preferred: "#27ae60", Approved: "#2980b9", "Pending Review": "#d4a017", "Do Not Use": "#c0392b" };

function Vendors({ vendors, setVendors }) {
  const [tab, setTab] = useState("list"); // "list" | "add" | "detail"
  const [activeId, setActiveId] = useState(null);
  const [filterCat, setFilterCat] = useState("All");
  const [filterStatus, setFilterStatus] = useState("All");
  const [search, setSearch] = useState("");
  const [form, setForm] = useState({
    company: "", contact: "", phone: "", email: "", website: "",
    category: "Audio", status: "Pending Review", city: "", state: "",
    rate: "", rateType: "Quote", notes: "", tags: "",
  });
  const upd = (k, v) => setForm(f => ({ ...f, [k]: v }));

  function saveVendor() {
    if (!form.company.trim()) return;
    if (activeId) {
      setVendors(p => p.map(v => v.id === activeId ? { ...v, ...form, tags: form.tags.split(",").map(t => t.trim()).filter(Boolean) } : v));
    } else {
      setVendors(p => [...p, { ...form, id: Date.now(), tags: form.tags.split(",").map(t => t.trim()).filter(Boolean), contracts: [], notes_log: [] }]);
    }
    setTab("list"); setActiveId(null);
    setForm({ company: "", contact: "", phone: "", email: "", website: "", category: "Audio", status: "Pending Review", city: "", state: "", rate: "", rateType: "Quote", notes: "", tags: "" });
  }

  function openDetail(v) { setActiveId(v.id); setTab("detail"); }
  function openEdit(v) {
    setActiveId(v.id);
    setForm({ ...v, tags: (v.tags || []).join(", ") });
    setTab("add");
  }
  function removeVendor(id) { setVendors(p => p.filter(v => v.id !== id)); setTab("list"); }

  const filtered = vendors.filter(v => {
    if (filterCat !== "All" && v.category !== filterCat) return false;
    if (filterStatus !== "All" && v.status !== filterStatus) return false;
    if (search && !v.company.toLowerCase().includes(search.toLowerCase()) && !v.contact?.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const activeVendor = vendors.find(v => v.id === activeId);

  if (tab === "add") return (
    <div>
      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 20 }}>
        <Btn onClick={() => { setTab("list"); setActiveId(null); }} variant="ghost" style={{ fontSize: 12, padding: "4px 10px" }}>← Back</Btn>
        <SectionTitle icon="🤝">{activeId ? "Edit Vendor" : "Add Vendor"}</SectionTitle>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, maxWidth: 860 }}>
        <Card>
          <div style={{ fontWeight: 600, fontSize: 13, marginBottom: 14 }}>Company Info</div>
          <Field label="Company Name"><input value={form.company} onChange={e => upd("company", e.target.value)} placeholder="Company or individual name" /></Field>
          <Field label="Primary Contact"><input value={form.contact} onChange={e => upd("contact", e.target.value)} placeholder="Full name" /></Field>
          <Field label="Phone"><input value={form.phone} onChange={e => upd("phone", e.target.value)} placeholder="555-000-0000" /></Field>
          <Field label="Email"><input value={form.email} onChange={e => upd("email", e.target.value)} placeholder="contact@vendor.com" /></Field>
          <Field label="Website"><input value={form.website} onChange={e => upd("website", e.target.value)} placeholder="https://vendor.com" /></Field>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
            <Field label="City"><input value={form.city} onChange={e => upd("city", e.target.value)} placeholder="Washington" /></Field>
            <Field label="State"><input value={form.state} onChange={e => upd("state", e.target.value)} placeholder="DC" /></Field>
          </div>
        </Card>
        <Card>
          <div style={{ fontWeight: 600, fontSize: 13, marginBottom: 14 }}>Classification</div>
          <Field label="Category">
            <select value={form.category} onChange={e => upd("category", e.target.value)}>
              {VENDOR_CATS.map(c => <option key={c}>{c}</option>)}
            </select>
          </Field>
          <Field label="Vendor Status">
            <select value={form.status} onChange={e => upd("status", e.target.value)}>
              {VENDOR_STATUSES.map(s => <option key={s}>{s}</option>)}
            </select>
          </Field>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
            <Field label="Rate / Day Rate">
              <input value={form.rate} onChange={e => upd("rate", e.target.value)} placeholder="e.g. $1200" />
            </Field>
            <Field label="Rate Type">
              <select value={form.rateType} onChange={e => upd("rateType", e.target.value)}>
                {["Quote", "Day Rate", "Project Rate", "Hourly", "Retainer"].map(r => <option key={r}>{r}</option>)}
              </select>
            </Field>
          </div>
          <Field label="Tags (comma-separated)">
            <input value={form.tags} onChange={e => upd("tags", e.target.value)} placeholder="festival, outdoor, touring, union" />
          </Field>
          <Field label="Notes">
            <textarea value={form.notes} onChange={e => upd("notes", e.target.value)} placeholder="Insurance status, lead time, past experience, special requirements…" />
          </Field>
          <div style={{ display: "flex", gap: 10, marginTop: 4 }}>
            <Btn onClick={saveVendor} disabled={!form.company.trim()}>{activeId ? "Save Changes" : "Add Vendor"}</Btn>
            <Btn onClick={() => { setTab("list"); setActiveId(null); }} variant="ghost">Cancel</Btn>
          </div>
        </Card>
      </div>
    </div>
  );

  if (tab === "detail" && activeVendor) return (
    <div>
      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 20 }}>
        <Btn onClick={() => setTab("list")} variant="ghost" style={{ fontSize: 12, padding: "4px 10px" }}>← Vendors</Btn>
        <Badge color={VS_COLORS[activeVendor.status] || C.muted}>{activeVendor.status}</Badge>
        <Badge color={C.muted}>{activeVendor.category}</Badge>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
        <div>
          <Card style={{ marginBottom: 16 }}>
            <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 900, fontSize: 28, marginBottom: 4 }}>{activeVendor.company}</div>
            <div style={{ fontSize: 14, color: C.muted, marginBottom: 16 }}>{activeVendor.category} {activeVendor.city ? `· ${activeVendor.city}${activeVendor.state ? ", " + activeVendor.state : ""}` : ""}</div>
            {activeVendor.contact && <div style={{ fontSize: 13, marginBottom: 6 }}>👤 {activeVendor.contact}</div>}
            {activeVendor.phone && <a href={`tel:${activeVendor.phone}`} style={{ display: "block", fontSize: 13, color: C.blue, textDecoration: "none", marginBottom: 6 }}>📞 {activeVendor.phone}</a>}
            {activeVendor.email && <a href={`mailto:${activeVendor.email}`} style={{ display: "block", fontSize: 13, color: C.blue, textDecoration: "none", marginBottom: 6 }}>✉ {activeVendor.email}</a>}
            {activeVendor.website && <a href={activeVendor.website} target="_blank" rel="noreferrer" style={{ display: "block", fontSize: 12, color: C.muted, textDecoration: "none" }}>🌐 {activeVendor.website}</a>}
            {activeVendor.rate && <div style={{ marginTop: 12, padding: "8px 12px", background: C.bg, borderRadius: 6, border: `1px solid ${C.border}`, fontSize: 13 }}>
              💰 {activeVendor.rate} <span style={{ color: C.muted }}>({activeVendor.rateType})</span>
            </div>}
            {(activeVendor.tags || []).length > 0 && (
              <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginTop: 12 }}>
                {activeVendor.tags.map(t => <Badge key={t} color={C.muted}>{t}</Badge>)}
              </div>
            )}
            {activeVendor.notes && <div style={{ marginTop: 14, fontSize: 13, color: C.muted, lineHeight: 1.6 }}>{activeVendor.notes}</div>}
            <div style={{ display: "flex", gap: 8, marginTop: 16, paddingTop: 12, borderTop: `1px solid ${C.border}` }}>
              <Btn onClick={() => openEdit(activeVendor)} variant="ghost" style={{ fontSize: 12 }}>✏ Edit</Btn>
              <Btn onClick={() => removeVendor(activeVendor.id)} variant="danger" style={{ fontSize: 12 }}>Remove</Btn>
            </div>
          </Card>
        </div>
        <Card>
          <div style={{ fontWeight: 600, fontSize: 13, marginBottom: 14 }}>Contract & Engagement History</div>
          <div style={{ color: C.muted, fontSize: 13 }}>No contracts on file yet. Attach contracts via the Admin → Files section.</div>
        </Card>
      </div>
    </div>
  );

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
        <SectionTitle icon="🤝">Vendor Directory</SectionTitle>
        <Btn onClick={() => { setActiveId(null); setTab("add"); }}>+ Add Vendor</Btn>
      </div>

      {/* Stats row */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 10, marginBottom: 20 }}>
        {VENDOR_STATUSES.map(s => {
          const count = vendors.filter(v => v.status === s).length;
          return (
            <Card key={s} style={{ padding: "12px 16px", cursor: "pointer", border: `1px solid ${filterStatus === s ? VS_COLORS[s] : C.border}` }}
              onClick={() => setFilterStatus(filterStatus === s ? "All" : s)}>
              <div style={{ fontSize: 22, fontWeight: 900, fontFamily: "'Barlow Condensed', sans-serif", color: VS_COLORS[s] }}>{count}</div>
              <div style={{ fontSize: 11, color: C.muted }}>{s}</div>
            </Card>
          );
        })}
      </div>

      {/* Filters */}
      <div style={{ display: "flex", gap: 10, marginBottom: 16, flexWrap: "wrap", alignItems: "center" }}>
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search vendors…" style={{ width: 200 }} />
        <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
          {["All", ...VENDOR_CATS].map(c => (
            <button key={c} onClick={() => setFilterCat(c)} style={{
              padding: "4px 10px", borderRadius: 16, fontSize: 11, border: "none", cursor: "pointer",
              background: filterCat === c ? C.gold : C.panel,
              color: filterCat === c ? "#000" : C.muted,
              border: `1px solid ${filterCat === c ? C.gold : C.border}`,
            }}>{c}</button>
          ))}
        </div>
      </div>

      {/* List */}
      {filtered.length === 0 ? (
        <Card><div style={{ textAlign: "center", padding: 40, color: C.muted }}>
          <div style={{ fontSize: 32, marginBottom: 10 }}>🤝</div>
          <div>No vendors match your filters.</div>
        </div></Card>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: 12 }}>
          {filtered.map(v => (
            <div key={v.id} onClick={() => openDetail(v)} style={{
              background: C.panel, border: `1px solid ${C.border}`, borderRadius: 10,
              padding: "14px 16px", cursor: "pointer", transition: "border 0.15s",
            }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 8 }}>
                <div style={{ fontWeight: 600, fontSize: 14 }}>{v.company}</div>
                <Badge color={VS_COLORS[v.status] || C.muted}>{v.status}</Badge>
              </div>
              <div style={{ fontSize: 12, color: C.muted, marginBottom: 6 }}>{v.category}{v.city ? ` · ${v.city}` : ""}</div>
              {v.contact && <div style={{ fontSize: 12, color: C.muted }}>{v.contact}</div>}
              {v.rate && <div style={{ fontSize: 12, color: C.gold, marginTop: 4 }}>{v.rate} <span style={{ color: C.muted }}>({v.rateType})</span></div>}
              {(v.tags || []).length > 0 && (
                <div style={{ display: "flex", gap: 4, flexWrap: "wrap", marginTop: 8 }}>
                  {v.tags.slice(0, 3).map(t => <Badge key={t} color={C.muted}>{t}</Badge>)}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ════════════════════════════════════════════════════════════
// ADMIN PANEL
// ════════════════════════════════════════════════════════════
const ADMIN_PASSWORD = "7VE2024"; // Change this — in production use env var

function AdminPanel({ techs, setTechs, clockRecords, setClockRecords, bookings, setBookings, payroll, setPayroll, files, setFiles, contracts, setContracts }) {
  const [authed, setAuthed] = useState(false);
  const [pw, setPw] = useState("");
  const [pwError, setPwError] = useState("");
  const [section, setSection] = useState("pins"); // pins | overrides | contracts | files

  function login() {
    if (pw === ADMIN_PASSWORD) { setAuthed(true); setPwError(""); }
    else { setPwError("Incorrect admin password."); }
  }

  if (!authed) return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "60vh" }}>
      <div style={{ width: 320 }}>
        <div style={{ textAlign: "center", marginBottom: 24 }}>
          <div style={{ fontSize: 36, marginBottom: 8 }}>🔒</div>
          <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 900, fontSize: 24 }}>Admin Access</div>
          <div style={{ fontSize: 12, color: C.muted, marginTop: 4 }}>7 Virtues Entertainment</div>
        </div>
        <Card>
          <Field label="Admin Password">
            <input type="password" value={pw} onChange={e => { setPw(e.target.value); setPwError(""); }}
              onKeyDown={e => e.key === "Enter" && login()} placeholder="Enter admin password" />
          </Field>
          {pwError && <div style={{ color: C.red, fontSize: 12, marginBottom: 10 }}>{pwError}</div>}
          <Btn onClick={login} style={{ width: "100%" }}>Unlock Admin Panel</Btn>
          <div style={{ fontSize: 11, color: C.muted, marginTop: 10, textAlign: "center" }}>Default: 7VE2024 — change this before going live.</div>
        </Card>
      </div>
    </div>
  );

  const SECTIONS = [
    { id: "pins", icon: "🔑", label: "PIN Management" },
    { id: "overrides", icon: "⚙️", label: "Clock Overrides" },
    { id: "contracts", icon: "📝", label: "Contract Amendments" },
    { id: "files", icon: "🗂", label: "File Cabinet" },
  ];

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
        <SectionTitle icon="🔒">Admin Panel</SectionTitle>
        <Btn onClick={() => setAuthed(false)} variant="ghost" style={{ fontSize: 12 }}>Lock Panel</Btn>
      </div>

      {/* Sub-nav */}
      <div style={{ display: "flex", gap: 4, marginBottom: 24, background: C.panel, borderRadius: 10, padding: 6, border: `1px solid ${C.border}`, flexWrap: "wrap" }}>
        {SECTIONS.map(s => (
          <button key={s.id} onClick={() => setSection(s.id)} style={{
            flex: 1, padding: "9px 12px", borderRadius: 7, border: "none", cursor: "pointer",
            background: section === s.id ? C.gold + "25" : "transparent",
            color: section === s.id ? C.gold : C.muted,
            fontWeight: section === s.id ? 600 : 400, fontSize: 13,
            borderBottom: section === s.id ? `2px solid ${C.gold}` : "2px solid transparent",
            transition: "all 0.12s", minWidth: 140,
          }}>{s.icon} {s.label}</button>
        ))}
      </div>

      {/* ── PIN MANAGEMENT ── */}
      {section === "pins" && <PinManager techs={techs} setTechs={setTechs} />}

      {/* ── CLOCK OVERRIDES ── */}
      {section === "overrides" && <ClockOverrides clockRecords={clockRecords} setClockRecords={setClockRecords} techs={techs} />}

      {/* ── CONTRACT AMENDMENTS ── */}
      {section === "contracts" && <ContractAmendments contracts={contracts} setContracts={setContracts} bookings={bookings} clients={bookings.map(b => b.client)} />}

      {/* ── FILE CABINET ── */}
      {section === "files" && <FileCabinet files={files} setFiles={setFiles} />}
    </div>
  );
}

// ── PIN MANAGER ───────────────────────────────────────────
function PinManager({ techs, setTechs }) {
  const [resetId, setResetId] = useState(null);
  const [newPin, setNewPin] = useState("");
  const [confirmPin, setConfirmPin] = useState("");
  const [saved, setSaved] = useState(null);
  const [error, setError] = useState("");

  function savePin(techId) {
    if (newPin.length !== 4 || !/^\d{4}$/.test(newPin)) { setError("PIN must be exactly 4 digits."); return; }
    if (newPin !== confirmPin) { setError("PINs do not match."); return; }
    setTechs(p => p.map(t => t.id === techId ? { ...t, customPin: newPin } : t));
    setSaved(techId); setResetId(null); setNewPin(""); setConfirmPin(""); setError("");
    setTimeout(() => setSaved(null), 3000);
  }

  function clearCustomPin(techId) {
    setTechs(p => p.map(t => t.id === techId ? { ...t, customPin: undefined } : t));
  }

  return (
    <div>
      <div style={{ fontSize: 13, color: C.muted, marginBottom: 20, lineHeight: 1.6 }}>
        Default PIN = last 4 digits of the tech's phone number. Set a custom PIN below to override.
        Techs with no phone on file default to <b style={{ color: C.text }}>0000</b>.
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(340px, 1fr))", gap: 12 }}>
        {techs.map(t => {
          const defaultPin = t.phone ? t.phone.replace(/\D/g, "").slice(-4) : "0000";
          const activePin = t.customPin || defaultPin;
          const isCustom = !!t.customPin;
          return (
            <Card key={t.id}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 10 }}>
                <div>
                  <div style={{ fontWeight: 600, fontSize: 13 }}>{t.name}</div>
                  <div style={{ fontSize: 11, color: C.muted }}>{t.role}</div>
                </div>
                <div style={{ textAlign: "right" }}>
                  <div style={{ fontSize: 11, color: C.muted }}>Active PIN</div>
                  <div style={{ fontFamily: "monospace", fontSize: 20, fontWeight: 700, color: isCustom ? C.gold : C.muted, letterSpacing: "0.2em" }}>••••</div>
                  <Badge color={isCustom ? C.gold : C.muted}>{isCustom ? "Custom" : "Default"}</Badge>
                </div>
              </div>

              {saved === t.id && <div style={{ color: C.green, fontSize: 12, marginBottom: 8 }}>✓ PIN updated.</div>}

              {resetId === t.id ? (
                <div style={{ marginTop: 8 }}>
                  {error && <div style={{ color: C.red, fontSize: 12, marginBottom: 8 }}>{error}</div>}
                  <Field label="New PIN (4 digits)">
                    <input type="password" maxLength={4} value={newPin} onChange={e => { setNewPin(e.target.value); setError(""); }} placeholder="••••" />
                  </Field>
                  <Field label="Confirm PIN">
                    <input type="password" maxLength={4} value={confirmPin} onChange={e => { setConfirmPin(e.target.value); setError(""); }} placeholder="••••" />
                  </Field>
                  <div style={{ display: "flex", gap: 8 }}>
                    <Btn onClick={() => savePin(t.id)}>Save PIN</Btn>
                    <Btn onClick={() => { setResetId(null); setNewPin(""); setConfirmPin(""); setError(""); }} variant="ghost">Cancel</Btn>
                  </div>
                </div>
              ) : (
                <div style={{ display: "flex", gap: 8 }}>
                  <Btn onClick={() => { setResetId(t.id); setError(""); }} variant="ghost" style={{ fontSize: 12 }}>
                    {isCustom ? "Change PIN" : "Set Custom PIN"}
                  </Btn>
                  {isCustom && <Btn onClick={() => clearCustomPin(t.id)} variant="danger" style={{ fontSize: 12 }}>Reset to Default</Btn>}
                </div>
              )}
            </Card>
          );
        })}
      </div>
    </div>
  );
}

// ── CLOCK OVERRIDES ───────────────────────────────────────
function ClockOverrides({ clockRecords, setClockRecords, techs }) {
  const [editId, setEditId] = useState(null);
  const [editIn, setEditIn] = useState("");
  const [editOut, setEditOut] = useState("");
  const [note, setNote] = useState("");

  function saveOverride(id) {
    setClockRecords(p => p.map(r => r.id === id ? {
      ...r,
      clockIn: editIn ? new Date(editIn).toISOString() : r.clockIn,
      clockOut: editOut ? new Date(editOut).toISOString() : r.clockOut,
      overrideNote: note,
      overridden: true,
    } : r));
    setEditId(null); setEditIn(""); setEditOut(""); setNote("");
  }

  function deleteRecord(id) { setClockRecords(p => p.filter(r => r.id !== id)); }

  function forceClockOut(id) {
    setClockRecords(p => p.map(r => r.id === id ? { ...r, clockOut: new Date().toISOString(), overrideNote: "Admin forced clock-out", overridden: true } : r));
  }

  function fmtDt(iso) {
    if (!iso) return "—";
    return new Date(iso).toLocaleString([], { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" });
  }

  function calcHrs(a, b) {
    if (!a || !b) return null;
    return ((new Date(b) - new Date(a)) / 3600000).toFixed(2);
  }

  return (
    <div>
      <div style={{ fontSize: 13, color: C.muted, marginBottom: 20 }}>
        Edit, correct, or force-close time clock entries. All overrides are flagged with a note.
      </div>
      {clockRecords.length === 0 ? (
        <Card><div style={{ color: C.muted, fontSize: 13, textAlign: "center", padding: 32 }}>No clock records yet.</div></Card>
      ) : (
        <div>
          {/* Active / open shifts first */}
          {clockRecords.filter(r => !r.clockOut).length > 0 && (
            <div style={{ marginBottom: 20 }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: C.red, letterSpacing: "0.08em", marginBottom: 10 }}>● CURRENTLY CLOCKED IN</div>
              {clockRecords.filter(r => !r.clockOut).map(r => (
                <Card key={r.id} style={{ marginBottom: 10, borderColor: C.red + "44" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <div>
                      <div style={{ fontWeight: 600 }}>{r.techName} <span style={{ color: C.muted, fontWeight: 400 }}>· {r.show}</span></div>
                      <div style={{ fontSize: 12, color: C.muted }}>In: {fmtDt(r.clockIn)} {r.location ? `· ${r.location}` : ""}</div>
                    </div>
                    <Btn onClick={() => forceClockOut(r.id)} variant="danger" style={{ fontSize: 12 }}>Force Clock Out</Btn>
                  </div>
                </Card>
              ))}
            </div>
          )}

          <div style={{ fontSize: 11, fontWeight: 700, color: C.muted, letterSpacing: "0.08em", marginBottom: 10 }}>ALL RECORDS</div>
          {clockRecords.slice().reverse().map(r => (
            <Card key={r.id} style={{ marginBottom: 10 }}>
              {editId === r.id ? (
                <div>
                  <div style={{ fontWeight: 600, marginBottom: 12 }}>{r.techName} — {r.show}</div>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                    <Field label="Clock In (datetime-local)">
                      <input type="datetime-local" value={editIn} onChange={e => setEditIn(e.target.value)} />
                    </Field>
                    <Field label="Clock Out (datetime-local)">
                      <input type="datetime-local" value={editOut} onChange={e => setEditOut(e.target.value)} />
                    </Field>
                  </div>
                  <Field label="Override Note / Reason">
                    <input value={note} onChange={e => setNote(e.target.value)} placeholder="e.g. Tech forgot to clock out, confirmed 10h shift" />
                  </Field>
                  <div style={{ display: "flex", gap: 8 }}>
                    <Btn onClick={() => saveOverride(r.id)}>Save Override</Btn>
                    <Btn onClick={() => setEditId(null)} variant="ghost">Cancel</Btn>
                  </div>
                </div>
              ) : (
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <div>
                    <div style={{ fontWeight: 600, fontSize: 13 }}>
                      {r.techName} <span style={{ color: C.muted, fontWeight: 400 }}>· {r.show}</span>
                      {r.overridden && <Badge color={C.gold} style={{ marginLeft: 8 }}>Admin Edit</Badge>}
                    </div>
                    <div style={{ fontSize: 12, color: C.muted, marginTop: 3 }}>
                      In: {fmtDt(r.clockIn)} · Out: {fmtDt(r.clockOut)}
                      {r.clockOut && <span style={{ color: C.gold, marginLeft: 8 }}>{calcHrs(r.clockIn, r.clockOut)} hrs</span>}
                    </div>
                    {r.overrideNote && <div style={{ fontSize: 11, color: C.gold, marginTop: 2 }}>Note: {r.overrideNote}</div>}
                  </div>
                  <div style={{ display: "flex", gap: 6 }}>
                    <Btn onClick={() => {
                      setEditId(r.id);
                      setEditIn(r.clockIn ? r.clockIn.slice(0, 16) : "");
                      setEditOut(r.clockOut ? r.clockOut.slice(0, 16) : "");
                      setNote(r.overrideNote || "");
                    }} variant="ghost" style={{ fontSize: 11, padding: "3px 10px" }}>Edit</Btn>
                    <Btn onClick={() => deleteRecord(r.id)} variant="danger" style={{ fontSize: 11, padding: "3px 10px" }}>Delete</Btn>
                  </div>
                </div>
              )}
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

// ── CONTRACT AMENDMENTS ───────────────────────────────────
function ContractAmendments({ contracts, setContracts, bookings }) {
  const [form, setForm] = useState({ title: "", linkedShow: "", type: "Amendment", body: "", status: "Draft", date: "" });
  const [editing, setEditing] = useState(null);
  const [expandId, setExpandId] = useState(null);
  const upd = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const TYPES = ["Amendment", "Addendum", "Rider", "Cancellation Notice", "Force Majeure", "Rate Change", "Scope Change", "Custom"];
  const STATUSES = ["Draft", "Pending Signature", "Signed", "Rejected", "Voided"];
  const ST_COLORS = { Draft: C.muted, "Pending Signature": C.gold, Signed: C.green, Rejected: C.red, Voided: C.muted };

  function save() {
    if (!form.title.trim()) return;
    if (editing) {
      setContracts(p => p.map(c => c.id === editing ? { ...c, ...form, updatedAt: new Date().toISOString() } : c));
      setEditing(null);
    } else {
      setContracts(p => [...p, { ...form, id: Date.now(), createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() }]);
    }
    setForm({ title: "", linkedShow: "", type: "Amendment", body: "", status: "Draft", date: "" });
  }

  function startEdit(c) { setEditing(c.id); setForm({ title: c.title, linkedShow: c.linkedShow, type: c.type, body: c.body, status: c.status, date: c.date }); }

  function advanceStatus(id, s) { setContracts(p => p.map(c => c.id === id ? { ...c, status: s } : c)); }

  return (
    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
      <div>
        <Card style={{ marginBottom: 16 }}>
          <div style={{ fontWeight: 600, fontSize: 13, marginBottom: 14 }}>{editing ? "Edit Document" : "New Contract Document"}</div>
          <Field label="Title / Description"><input value={form.title} onChange={e => upd("title", e.target.value)} placeholder="e.g. Scope Change — The Anthem 6/20" /></Field>
          <Field label="Linked Show / Client">
            <select value={form.linkedShow} onChange={e => upd("linkedShow", e.target.value)}>
              <option value="">Not linked to a show</option>
              {bookings.map(b => <option key={b.id} value={b.id}>{b.client} — {b.venue} ({b.date})</option>)}
            </select>
          </Field>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
            <Field label="Document Type">
              <select value={form.type} onChange={e => upd("type", e.target.value)}>
                {TYPES.map(t => <option key={t}>{t}</option>)}
              </select>
            </Field>
            <Field label="Effective Date"><input type="date" value={form.date} onChange={e => upd("date", e.target.value)} /></Field>
          </div>
          <Field label="Status">
            <select value={form.status} onChange={e => upd("status", e.target.value)}>
              {STATUSES.map(s => <option key={s}>{s}</option>)}
            </select>
          </Field>
          <Field label="Document Body / Terms">
            <textarea value={form.body} onChange={e => upd("body", e.target.value)} placeholder="Enter the full text of the amendment, rider, or clause change…" style={{ minHeight: 140 }} />
          </Field>
          <div style={{ display: "flex", gap: 8 }}>
            <Btn onClick={save} disabled={!form.title.trim()}>{editing ? "Save Changes" : "Create Document"}</Btn>
            {editing && <Btn onClick={() => { setEditing(null); setForm({ title: "", linkedShow: "", type: "Amendment", body: "", status: "Draft", date: "" }); }} variant="ghost">Cancel</Btn>}
          </div>
        </Card>
      </div>

      <div>
        <div style={{ fontWeight: 600, fontSize: 13, marginBottom: 14 }}>Documents ({contracts.length})</div>
        {contracts.length === 0 ? (
          <Card><div style={{ color: C.muted, fontSize: 13, padding: 24, textAlign: "center" }}>No contract documents yet.</div></Card>
        ) : contracts.slice().reverse().map(c => (
          <Card key={c.id} style={{ marginBottom: 10 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", cursor: "pointer" }} onClick={() => setExpandId(expandId === c.id ? null : c.id)}>
              <div>
                <div style={{ fontWeight: 600, fontSize: 13, marginBottom: 4 }}>{c.title}</div>
                <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                  <Badge color={C.muted}>{c.type}</Badge>
                  <Badge color={ST_COLORS[c.status] || C.muted}>{c.status}</Badge>
                  {c.date && <span style={{ fontSize: 11, color: C.muted }}>{c.date}</span>}
                </div>
              </div>
              <span style={{ color: C.muted, fontSize: 14 }}>{expandId === c.id ? "▲" : "▼"}</span>
            </div>

            {expandId === c.id && (
              <div style={{ marginTop: 14, paddingTop: 12, borderTop: `1px solid ${C.border}` }}>
                {c.body && <pre style={{ fontSize: 12, color: C.text, whiteSpace: "pre-wrap", lineHeight: 1.65, fontFamily: "'Inter', sans-serif", marginBottom: 12 }}>{c.body}</pre>}
                <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                  <Btn onClick={() => startEdit(c)} variant="ghost" style={{ fontSize: 11, padding: "3px 10px" }}>✏ Edit</Btn>
                  {STATUSES.filter(s => s !== c.status).map(s => (
                    <Btn key={s} onClick={() => advanceStatus(c.id, s)} variant="ghost" style={{ fontSize: 11, padding: "3px 10px" }}>→ {s}</Btn>
                  ))}
                  <Btn onClick={() => setContracts(p => p.filter(x => x.id !== c.id))} variant="danger" style={{ fontSize: 11, padding: "3px 10px" }}>Delete</Btn>
                </div>
              </div>
            )}
          </Card>
        ))}
      </div>
    </div>
  );
}

// ── FILE CABINET ──────────────────────────────────────────
const FILE_CATS = ["Contracts", "Invoices", "Riders", "W9 / Tax", "Insurance", "Show Files", "Input Lists", "Stage Plots", "Crew Docs", "Venue Info", "Other"];

function FileCabinet({ files, setFiles }) {
  const [filterCat, setFilterCat] = useState("All");
  const [search, setSearch] = useState("");
  const [uploading, setUploading] = useState(false);
  const [newMeta, setNewMeta] = useState({ name: "", category: "Other", notes: "", linkedTo: "" });
  const [pendingFile, setPendingFile] = useState(null);
  const upd = (k, v) => setNewMeta(f => ({ ...f, [k]: v }));

  function handleFileSelect(e) {
    const file = e.target.files[0];
    if (!file) return;
    setNewMeta(m => ({ ...m, name: file.name }));
    setPendingFile(file);
    setUploading(true);
  }

  function saveFile() {
    if (!pendingFile && !newMeta.name.trim()) return;
    const reader = new FileReader();
    const processFile = (dataUrl) => {
      setFiles(p => [...p, {
        id: Date.now(),
        name: newMeta.name || pendingFile?.name || "Untitled",
        category: newMeta.category,
        notes: newMeta.notes,
        linkedTo: newMeta.linkedTo,
        type: pendingFile?.type || "text/plain",
        size: pendingFile ? (pendingFile.size / 1024).toFixed(1) + " KB" : "—",
        dataUrl: dataUrl || null,
        uploadedAt: new Date().toISOString(),
      }]);
      setPendingFile(null); setNewMeta({ name: "", category: "Other", notes: "", linkedTo: "" }); setUploading(false);
    };
    if (pendingFile) { reader.onload = e => processFile(e.target.result); reader.readAsDataURL(pendingFile); }
    else processFile(null);
  }

  function deleteFile(id) { setFiles(p => p.filter(f => f.id !== id)); }

  const filtered = files.filter(f => {
    if (filterCat !== "All" && f.category !== filterCat) return false;
    if (search && !f.name.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const byCategory = FILE_CATS.reduce((acc, c) => { acc[c] = files.filter(f => f.category === c).length; return acc; }, {});

  return (
    <div>
      <div style={{ display: "flex", gap: 10, marginBottom: 20, alignItems: "center", flexWrap: "wrap" }}>
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search files…" style={{ width: 200 }} />
        <label style={{ background: C.gold, color: "#000", padding: "8px 16px", borderRadius: 6, fontSize: 13, fontWeight: 600, cursor: "pointer" }}>
          + Upload File <input type="file" onChange={handleFileSelect} style={{ display: "none" }} />
        </label>
      </div>

      {/* Category pills */}
      <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 20 }}>
        {["All", ...FILE_CATS].map(c => (
          <button key={c} onClick={() => setFilterCat(c)} style={{
            padding: "4px 10px", borderRadius: 16, fontSize: 11, border: "none", cursor: "pointer",
            background: filterCat === c ? C.gold : C.panel,
            color: filterCat === c ? "#000" : C.muted,
            border: `1px solid ${filterCat === c ? C.gold : C.border}`,
          }}>
            {c}{c !== "All" && byCategory[c] > 0 ? ` (${byCategory[c]})` : ""}
          </button>
        ))}
      </div>

      {/* Upload form */}
      {uploading && (
        <Card style={{ marginBottom: 20, borderColor: C.gold + "44" }}>
          <div style={{ fontWeight: 600, fontSize: 13, marginBottom: 14 }}>📎 Add File Details</div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
            <Field label="File Name"><input value={newMeta.name} onChange={e => upd("name", e.target.value)} /></Field>
            <Field label="Category">
              <select value={newMeta.category} onChange={e => upd("category", e.target.value)}>
                {FILE_CATS.map(c => <option key={c}>{c}</option>)}
              </select>
            </Field>
          </div>
          <Field label="Linked To (optional)"><input value={newMeta.linkedTo} onChange={e => upd("linkedTo", e.target.value)} placeholder="Client, show, tech name…" /></Field>
          <Field label="Notes"><input value={newMeta.notes} onChange={e => upd("notes", e.target.value)} placeholder="Brief description…" /></Field>
          <div style={{ display: "flex", gap: 8 }}>
            <Btn onClick={saveFile}>Save to Cabinet</Btn>
            <Btn onClick={() => { setUploading(false); setPendingFile(null); }} variant="ghost">Cancel</Btn>
          </div>
        </Card>
      )}

      {/* File grid */}
      {filtered.length === 0 ? (
        <Card><div style={{ color: C.muted, fontSize: 13, textAlign: "center", padding: 32 }}>
          {files.length === 0 ? "No files uploaded yet. Use the button above to add your first file." : "No files match your filters."}
        </div></Card>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))", gap: 12 }}>
          {filtered.map(f => {
            const isImg = f.type?.startsWith("image/");
            const isPdf = f.type === "application/pdf";
            const icon = isPdf ? "📄" : isImg ? "🖼" : f.type?.includes("sheet") ? "📊" : f.type?.includes("word") ? "📝" : "📎";
            return (
              <Card key={f.id} style={{ padding: "12px 14px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 8 }}>
                  <div style={{ fontSize: 24 }}>{icon}</div>
                  <Badge color={C.muted}>{f.category}</Badge>
                </div>
                {isImg && f.dataUrl && <img src={f.dataUrl} alt={f.name} style={{ width: "100%", height: 100, objectFit: "cover", borderRadius: 6, marginBottom: 8 }} />}
                <div style={{ fontWeight: 600, fontSize: 12, wordBreak: "break-word" }}>{f.name}</div>
                {f.linkedTo && <div style={{ fontSize: 11, color: C.muted, marginTop: 2 }}>→ {f.linkedTo}</div>}
                {f.notes && <div style={{ fontSize: 11, color: C.muted, marginTop: 2 }}>{f.notes}</div>}
                <div style={{ fontSize: 10, color: C.muted, marginTop: 6 }}>{f.size} · {new Date(f.uploadedAt).toLocaleDateString()}</div>
                <div style={{ display: "flex", gap: 6, marginTop: 10 }}>
                  {f.dataUrl && (
                    <a href={f.dataUrl} download={f.name} style={{ fontSize: 11, color: C.blue, textDecoration: "none", padding: "3px 8px", border: `1px solid ${C.border}`, borderRadius: 4 }}>⬇ Download</a>
                  )}
                  <Btn onClick={() => deleteFile(f.id)} variant="danger" style={{ fontSize: 11, padding: "3px 8px" }}>Remove</Btn>
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ════════════════════════════════════════════════════════════
// EARNINGS VIEW — Tech Portal
// ════════════════════════════════════════════════════════════
function EarningsView({ tech, payroll, clockRecords }) {
  const { useState: uS } = { useState };
  const [period, setPeriod] = useState("all"); // all | year | month | week

  // ── filter payroll entries for this tech ─────────────────
  const myPay = (payroll || []).filter(p =>
    (p.tech === tech.name || p.techId === tech.id) && p.type !== "receivable"
  );

  // ── filter clock records for this tech ───────────────────
  const myClocks = (clockRecords || []).filter(r =>
    r.techId === tech.id && r.clockIn && r.clockOut
  );

  function calcHrs(r) {
    return Math.max(0, (new Date(r.clockOut) - new Date(r.clockIn)) / 3600000);
  }

  // ── date helpers ─────────────────────────────────────────
  const now = new Date();
  const startOfWeek = new Date(now); startOfWeek.setDate(now.getDate() - now.getDay());
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const startOfYear = new Date(now.getFullYear(), 0, 1);

  function inRange(isoDate, start) {
    return new Date(isoDate) >= start;
  }

  // ── aggregate stats ───────────────────────────────────────
  const totalEarned   = myPay.reduce((s, p) => s + (p.total || 0), 0);
  const totalPaid     = myPay.filter(p => p.paid).reduce((s, p) => s + (p.total || 0), 0);
  const totalUnpaid   = totalEarned - totalPaid;
  const totalShows    = myPay.length;
  const totalHours    = myClocks.reduce((s, r) => s + calcHrs(r), 0);

  // Year / Month / Week totals from clock records
  const yearHours  = myClocks.filter(r => inRange(r.clockIn, startOfYear)).reduce((s, r) => s + calcHrs(r), 0);
  const monthHours = myClocks.filter(r => inRange(r.clockIn, startOfMonth)).reduce((s, r) => s + calcHrs(r), 0);
  const weekHours  = myClocks.filter(r => inRange(r.clockIn, startOfWeek)).reduce((s, r) => s + calcHrs(r), 0);

  // Weekly average (total hours / weeks since first clock-in)
  const firstClock = myClocks.length > 0 ? new Date(Math.min(...myClocks.map(r => new Date(r.clockIn)))) : null;
  const weeksSince = firstClock ? Math.max(1, Math.ceil((now - firstClock) / (7 * 86400000))) : 1;
  const weeklyAvg  = totalHours / weeksSince;

  // Year / Month earnings from payroll
  const yearEarned  = myPay.filter(p => p.date && inRange(p.date, startOfYear)).reduce((s, p) => s + (p.total || 0), 0);
  const monthEarned = myPay.filter(p => p.date && inRange(p.date, startOfMonth)).reduce((s, p) => s + (p.total || 0), 0);

  // ── build bar chart data (last 8 months earnings) ────────
  const monthLabels = [];
  const monthData = [];
  for (let i = 7; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const end = new Date(now.getFullYear(), now.getMonth() - i + 1, 0);
    const label = d.toLocaleString("default", { month: "short" });
    const earned = myPay.filter(p => {
      if (!p.date) return false;
      const pd = new Date(p.date);
      return pd >= d && pd <= end;
    }).reduce((s, p) => s + (p.total || 0), 0);
    monthLabels.push(label);
    monthData.push(earned);
  }
  const maxBar = Math.max(...monthData, 1);

  // ── build hours per month (last 8 months) ────────────────
  const monthHoursData = [];
  for (let i = 7; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const end = new Date(now.getFullYear(), now.getMonth() - i + 1, 0);
    const hrs = myClocks.filter(r => {
      const rd = new Date(r.clockIn);
      return rd >= d && rd <= end;
    }).reduce((s, r) => s + calcHrs(r), 0);
    monthHoursData.push(hrs);
  }
  const maxHrsBar = Math.max(...monthHoursData, 1);

  // ── filtered payroll list ─────────────────────────────────
  const filteredPay = myPay.filter(p => {
    if (period === "all") return true;
    if (!p.date) return false;
    if (period === "year")  return inRange(p.date, startOfYear);
    if (period === "month") return inRange(p.date, startOfMonth);
    if (period === "week")  return inRange(p.date, startOfWeek);
    return true;
  }).slice().reverse();

  // ── simple inline bar ─────────────────────────────────────
  const Bar = ({ value, max, color, label, sublabel }) => (
    <div style={{ marginBottom: 6 }}>
      <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, color: C.muted, marginBottom: 3 }}>
        <span>{label}</span><span style={{ color: C.text, fontWeight: 600 }}>{sublabel}</span>
      </div>
      <div style={{ background: C.border, borderRadius: 4, height: 8, overflow: "hidden" }}>
        <div style={{ width: `${Math.min(100, (value / max) * 100)}%`, height: "100%", background: color, borderRadius: 4, transition: "width 0.4s" }} />
      </div>
    </div>
  );

  return (
    <div style={{ maxWidth: 680, margin: "0 auto" }}>

      {/* ── Hero stats ── */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 20 }}>
        <Card style={{ borderColor: C.gold + "44" }}>
          <div style={{ fontSize: 11, color: C.gold, fontWeight: 700, letterSpacing: "0.08em", marginBottom: 6 }}>TOTAL EARNED</div>
          <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 900, fontSize: 38, color: C.gold }}>${totalEarned.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
          <div style={{ display: "flex", gap: 14, marginTop: 8 }}>
            <div><div style={{ fontSize: 10, color: C.muted }}>Paid</div><div style={{ fontSize: 14, fontWeight: 700, color: C.green }}>${totalPaid.toFixed(2)}</div></div>
            <div><div style={{ fontSize: 10, color: C.muted }}>Pending</div><div style={{ fontSize: 14, fontWeight: 700, color: C.red }}>${totalUnpaid.toFixed(2)}</div></div>
            <div><div style={{ fontSize: 10, color: C.muted }}>Shows</div><div style={{ fontSize: 14, fontWeight: 700, color: C.text }}>{totalShows}</div></div>
          </div>
        </Card>

        <Card>
          <div style={{ fontSize: 11, color: C.muted, fontWeight: 700, letterSpacing: "0.08em", marginBottom: 6 }}>HOURS WORKED</div>
          <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 900, fontSize: 38, color: C.text }}>{totalHours.toFixed(1)}<span style={{ fontSize: 18, color: C.muted }}> hrs</span></div>
          <div style={{ display: "flex", gap: 14, marginTop: 8 }}>
            <div><div style={{ fontSize: 10, color: C.muted }}>This Week</div><div style={{ fontSize: 14, fontWeight: 700 }}>{weekHours.toFixed(1)}h</div></div>
            <div><div style={{ fontSize: 10, color: C.muted }}>This Month</div><div style={{ fontSize: 14, fontWeight: 700 }}>{monthHours.toFixed(1)}h</div></div>
            <div><div style={{ fontSize: 10, color: C.muted }}>Weekly Avg</div><div style={{ fontSize: 14, fontWeight: 700 }}>{weeklyAvg.toFixed(1)}h</div></div>
          </div>
        </Card>
      </div>

      {/* ── Period breakdown ── */}
      <Card style={{ marginBottom: 20 }}>
        <div style={{ fontWeight: 600, fontSize: 13, marginBottom: 14 }}>Period Breakdown</div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10 }}>
          {[
            { label: "This Week", hours: weekHours, earned: myPay.filter(p => p.date && inRange(p.date, startOfWeek)).reduce((s, p) => s + p.total, 0) },
            { label: "This Month", hours: monthHours, earned: monthEarned },
            { label: "This Year", hours: yearHours, earned: yearEarned },
          ].map(({ label, hours, earned }) => (
            <div key={label} style={{ background: C.bg, borderRadius: 8, padding: "12px 14px", border: `1px solid ${C.border}` }}>
              <div style={{ fontSize: 10, color: C.muted, fontWeight: 600, letterSpacing: "0.06em", marginBottom: 8 }}>{label.toUpperCase()}</div>
              <div style={{ fontSize: 20, fontWeight: 700, color: C.gold }}>${earned.toFixed(0)}</div>
              <div style={{ fontSize: 12, color: C.muted, marginTop: 4 }}>{hours.toFixed(1)} hrs</div>
            </div>
          ))}
        </div>
      </Card>

      {/* ── Monthly earnings chart ── */}
      <Card style={{ marginBottom: 20 }}>
        <div style={{ fontWeight: 600, fontSize: 13, marginBottom: 16 }}>Monthly Earnings — Last 8 Months</div>
        {monthData.every(v => v === 0) ? (
          <div style={{ color: C.muted, fontSize: 13, textAlign: "center", padding: "20px 0" }}>
            No payroll data yet. Earnings will appear here once your coordinator logs your hours.
          </div>
        ) : (
          <div style={{ display: "flex", alignItems: "flex-end", gap: 8, height: 120 }}>
            {monthData.map((val, i) => (
              <div key={i} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
                <div style={{ fontSize: 9, color: C.muted, fontWeight: 600 }}>{val > 0 ? `$${val}` : ""}</div>
                <div style={{
                  width: "100%", borderRadius: "4px 4px 0 0",
                  height: `${Math.max(4, (val / maxBar) * 90)}px`,
                  background: i === 7 ? C.gold : C.gold + "55",
                  transition: "height 0.4s",
                }} />
                <div style={{ fontSize: 9, color: C.muted }}>{monthLabels[i]}</div>
              </div>
            ))}
          </div>
        )}
      </Card>

      {/* ── Monthly hours chart ── */}
      <Card style={{ marginBottom: 20 }}>
        <div style={{ fontWeight: 600, fontSize: 13, marginBottom: 16 }}>Monthly Hours — Last 8 Months</div>
        {monthHoursData.every(v => v === 0) ? (
          <div style={{ color: C.muted, fontSize: 13, textAlign: "center", padding: "20px 0" }}>
            No clock data yet. Hours will appear here once you start clocking in on shows.
          </div>
        ) : (
          <>
            <div style={{ display: "flex", alignItems: "flex-end", gap: 8, height: 100 }}>
              {monthHoursData.map((val, i) => (
                <div key={i} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
                  <div style={{ fontSize: 9, color: C.muted }}>{val > 0 ? `${val.toFixed(0)}h` : ""}</div>
                  <div style={{
                    width: "100%", borderRadius: "4px 4px 0 0",
                    height: `${Math.max(4, (val / maxHrsBar) * 76)}px`,
                    background: i === 7 ? C.blue : C.blue + "55",
                    transition: "height 0.4s",
                  }} />
                  <div style={{ fontSize: 9, color: C.muted }}>{monthLabels[i]}</div>
                </div>
              ))}
            </div>
            <div style={{ display: "flex", gap: 20, marginTop: 12, paddingTop: 10, borderTop: `1px solid ${C.border}`, fontSize: 11, color: C.muted }}>
              <span>Weekly avg: <b style={{ color: C.text }}>{weeklyAvg.toFixed(1)} hrs</b></span>
              <span>Year total: <b style={{ color: C.text }}>{yearHours.toFixed(1)} hrs</b></span>
              <span>All-time: <b style={{ color: C.text }}>{totalHours.toFixed(1)} hrs</b></span>
            </div>
          </>
        )}
      </Card>

      {/* ── Pay history list ── */}
      <Card>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
          <div style={{ fontWeight: 600, fontSize: 13 }}>Pay History</div>
          <div style={{ display: "flex", gap: 6 }}>
            {[["all","All"],["year","Year"],["month","Month"],["week","Week"]].map(([id, label]) => (
              <button key={id} onClick={() => setPeriod(id)} style={{
                padding: "3px 10px", borderRadius: 14, fontSize: 11, border: "none", cursor: "pointer",
                background: period === id ? C.gold : C.bg,
                color: period === id ? "#000" : C.muted,
                border: `1px solid ${period === id ? C.gold : C.border}`,
              }}>{label}</button>
            ))}
          </div>
        </div>

        {filteredPay.length === 0 ? (
          <div style={{ color: C.muted, fontSize: 13, padding: "16px 0", textAlign: "center" }}>
            No pay entries for this period.
          </div>
        ) : (
          filteredPay.map(p => (
            <div key={p.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 0", borderBottom: `1px solid ${C.border}` }}>
              <div>
                <div style={{ fontSize: 13, fontWeight: 500 }}>{p.event || "Show"}</div>
                <div style={{ fontSize: 11, color: C.muted, marginTop: 2 }}>
                  {p.date || "—"} · {parseFloat(p.rate) > 100 ? `Day rate` : `${p.hours} hrs × $${p.rate}/hr`}
                  {p.jobCode && <span style={{ marginLeft: 8, background: C.gold+"22", color: C.gold, borderRadius: 3, padding: "1px 6px", fontSize: 10, fontFamily: "monospace", fontWeight: 700 }}>{p.jobCode}</span>}
                </div>
              </div>
              <div style={{ textAlign: "right" }}>
                <div style={{ fontWeight: 700, fontSize: 14, color: p.paid ? C.green : C.gold }}>${(p.total || 0).toFixed(2)}</div>
                <Badge color={p.paid ? C.green : C.muted}>{p.paid ? "Paid" : "Pending"}</Badge>
              </div>
            </div>
          ))
        )}

        {filteredPay.length > 0 && (
          <div style={{ display: "flex", justifyContent: "space-between", paddingTop: 12, marginTop: 4 }}>
            <span style={{ fontSize: 12, color: C.muted }}>Period total</span>
            <span style={{ fontWeight: 700, color: C.gold, fontSize: 14 }}>
              ${filteredPay.reduce((s, p) => s + (p.total || 0), 0).toFixed(2)}
            </span>
          </div>
        )}
      </Card>
    </div>
  );
}

// ════════════════════════════════════════════════════════════
// SHOW OFFERS — Admin + Tech Portal
// ════════════════════════════════════════════════════════════

// ── Admin: post + manage show offers ─────────────────────
function ShowOffersAdmin({ showOffers, setShowOffers, techs, bookings }) {
  const [form, setForm] = useState({
    title: "", jobCode: "", venue: "", date: "", loadIn: "", endTime: "",
    payRate: "", billRate: "", positions: "", notes: "", targetTechs: [],
  });
  const upd = (k, v) => setForm(f => ({ ...f, [k]: v }));

  function toggleTarget(name) {
    setForm(f => ({
      ...f,
      targetTechs: f.targetTechs.includes(name)
        ? f.targetTechs.filter(n => n !== name)
        : [...f.targetTechs, name],
    }));
  }

  function postOffer() {
    if (!form.title || !form.date) return;
    const offer = {
      id: Date.now(),
      ...form,
      postedAt: new Date().toISOString(),
      status: "Open",
      responses: {}, // { techName: "accepted" | "denied" }
    };
    setShowOffers(p => [offer, ...p]);
    setForm({ title: "", jobCode: "", venue: "", date: "", loadIn: "", endTime: "", payRate: "", billRate: "", positions: "", notes: "", targetTechs: [] });
  }

  function closeOffer(id) { setShowOffers(p => p.map(o => o.id === id ? { ...o, status: "Closed" } : o)); }
  function deleteOffer(id) { setShowOffers(p => p.filter(o => o.id !== id)); }

  function fmtAgo(iso) {
    const diff = (Date.now() - new Date(iso)) / 1000;
    if (diff < 60) return "just now";
    if (diff < 3600) return Math.floor(diff / 60) + "m ago";
    if (diff < 86400) return Math.floor(diff / 3600) + "h ago";
    return Math.floor(diff / 86400) + "d ago";
  }

  const pr = parseFloat(form.payRate) || 0;
  const br = parseFloat(form.billRate) || pr;

  return (
    <div>
      <SectionTitle icon="📣">Show Offers</SectionTitle>
      <div style={{ display: "grid", gridTemplateColumns: "420px 1fr", gap: 16 }}>

        {/* ── Post new offer ── */}
        <div>
          <Card style={{ marginBottom: 16 }}>
            <div style={{ fontWeight: 600, fontSize: 13, marginBottom: 14 }}>Post New Show</div>
            <Field label="Show Title"><input value={form.title} onChange={e => upd("title", e.target.value)} placeholder="e.g. Inspire Overnight — Crystal Gateway" /></Field>
            <Field label="Job Code"><input value={form.jobCode} onChange={e => upd("jobCode", e.target.value)} placeholder="7VE-XXX-MMDD" style={{ fontFamily: "monospace" }} /></Field>
            <Field label="Venue / Location"><input value={form.venue} onChange={e => upd("venue", e.target.value)} placeholder="Venue name and address" /></Field>
            <Field label="Date"><input type="date" value={form.date} onChange={e => upd("date", e.target.value)} /></Field>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
              <Field label="Load-In"><input type="time" value={form.loadIn} onChange={e => upd("loadIn", e.target.value)} /></Field>
              <Field label="End / Wrap"><input type="time" value={form.endTime} onChange={e => upd("endTime", e.target.value)} /></Field>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
              <Field label="Tech Pay Rate ($/hr)"><input type="number" value={form.payRate} onChange={e => upd("payRate", e.target.value)} placeholder="40" /></Field>
              <Field label="Client Bill Rate ($/hr)"><input type="number" value={form.billRate} onChange={e => upd("billRate", e.target.value)} placeholder="45" /></Field>
            </div>
            {pr > 0 && br > 0 && br !== pr && (
              <div style={{ fontSize: 11, color: C.green, marginBottom: 10 }}>
                Margin: ${(br - pr).toFixed(2)}/hr per tech
              </div>
            )}
            <Field label="Positions Needed"><input value={form.positions} onChange={e => upd("positions", e.target.value)} placeholder="e.g. 4 Stagehands, 1 Crew Lead" /></Field>
            <Field label="Notes for Crew"><textarea value={form.notes} onChange={e => upd("notes", e.target.value)} placeholder="Parking, attire, special requirements…" style={{ minHeight: 60 }} /></Field>

            {/* Target specific techs or all */}
            <div style={{ marginBottom: 14 }}>
              <Label>Send To (leave blank = all crew)</Label>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginTop: 4 }}>
                {techs.map(t => {
                  const sel = form.targetTechs.includes(t.name);
                  return (
                    <button key={t.id} onClick={() => toggleTarget(t.name)} style={{
                      padding: "3px 10px", borderRadius: 14, fontSize: 11, border: "none", cursor: "pointer",
                      background: sel ? C.gold : C.bg, color: sel ? "#000" : C.muted,
                      border: `1px solid ${sel ? C.gold : C.border}`,
                    }}>{t.name.split(" ")[0]}</button>
                  );
                })}
              </div>
              {form.targetTechs.length === 0 && <div style={{ fontSize: 10, color: C.muted, marginTop: 4 }}>Sending to all crew</div>}
            </div>

            <Btn onClick={postOffer} disabled={!form.title || !form.date} style={{ width: "100%" }}>
              📣 Post Show Offer
            </Btn>
          </Card>
        </div>

        {/* ── Live response board ── */}
        <div>
          {showOffers.length === 0 ? (
            <Card>
              <div style={{ textAlign: "center", padding: 40, color: C.muted }}>
                <div style={{ fontSize: 32, marginBottom: 10 }}>📣</div>
                No show offers posted yet. Post one to the left and techs will see it in their portal.
              </div>
            </Card>
          ) : (
            showOffers.map(offer => {
              const targeted = offer.targetTechs?.length > 0 ? offer.targetTechs : techs.map(t => t.name);
              const accepted = targeted.filter(n => offer.responses[n] === "accepted");
              const denied   = targeted.filter(n => offer.responses[n] === "denied");
              const pending  = targeted.filter(n => !offer.responses[n]);
              const fillPct  = targeted.length > 0 ? Math.round((accepted.length / targeted.length) * 100) : 0;

              return (
                <Card key={offer.id} style={{ marginBottom: 14, borderColor: offer.status === "Closed" ? C.border : C.gold + "33" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 12 }}>
                    <div>
                      <div style={{ fontWeight: 700, fontSize: 15 }}>{offer.title}</div>
                      <div style={{ fontSize: 11, color: C.muted, marginTop: 2 }}>
                        {offer.date} {offer.loadIn ? `· ${offer.loadIn}` : ""} {offer.venue ? `· ${offer.venue}` : ""}
                      </div>
                      <div style={{ display: "flex", gap: 8, marginTop: 6, flexWrap: "wrap" }}>
                        {offer.jobCode && <span style={{ fontFamily: "monospace", fontSize: 10, color: C.gold, background: C.gold + "22", padding: "1px 7px", borderRadius: 3, fontWeight: 700 }}>{offer.jobCode}</span>}
                        <Badge color={offer.status === "Closed" ? C.muted : C.green}>{offer.status}</Badge>
                        <Badge color={C.gold}>Pay: ${offer.payRate}/hr</Badge>
                        {offer.billRate && offer.billRate !== offer.payRate && <Badge color={C.green}>Margin: +${(offer.billRate - offer.payRate).toFixed(2)}/hr</Badge>}
                        <span style={{ fontSize: 11, color: C.muted }}>{fmtAgo(offer.postedAt)}</span>
                      </div>
                    </div>
                    <div style={{ display: "flex", gap: 6 }}>
                      {offer.status === "Open" && <Btn onClick={() => closeOffer(offer.id)} variant="ghost" style={{ fontSize: 11, padding: "3px 10px" }}>Close</Btn>}
                      <Btn onClick={() => deleteOffer(offer.id)} variant="danger" style={{ fontSize: 11, padding: "3px 10px" }}>✕</Btn>
                    </div>
                  </div>

                  {/* Fill bar */}
                  <div style={{ marginBottom: 12 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, color: C.muted, marginBottom: 4 }}>
                      <span>Response rate</span>
                      <span>{accepted.length} accepted · {denied.length} denied · {pending.length} pending</span>
                    </div>
                    <div style={{ background: C.border, borderRadius: 4, height: 6, overflow: "hidden" }}>
                      <div style={{ width: `${fillPct}%`, height: "100%", background: C.green, borderRadius: 4, transition: "width 0.3s" }} />
                    </div>
                  </div>

                  {/* Response breakdown */}
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10 }}>
                    {[
                      { label: "✓ Accepted", names: accepted, color: C.green },
                      { label: "✕ Denied", names: denied, color: C.red },
                      { label: "⏳ Pending", names: pending, color: C.muted },
                    ].map(({ label, names, color }) => (
                      <div key={label} style={{ background: C.bg, borderRadius: 7, padding: "10px 12px", border: `1px solid ${C.border}` }}>
                        <div style={{ fontSize: 11, fontWeight: 700, color, marginBottom: 8 }}>{label} ({names.length})</div>
                        {names.map(n => (
                          <div key={n} style={{ fontSize: 12, color: C.text, padding: "2px 0" }}>{n}</div>
                        ))}
                        {names.length === 0 && <div style={{ fontSize: 11, color: C.muted }}>—</div>}
                      </div>
                    ))}
                  </div>

                  {offer.notes && <div style={{ marginTop: 10, fontSize: 12, color: C.muted, fontStyle: "italic" }}>"{offer.notes}"</div>}
                </Card>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}

// ── Tech Portal: Show Offers inbox ────────────────────────
function ShowOffersPortal({ tech, showOffers, setShowOffers }) {
  // Tech sees offers targeted to them (or all-crew offers)
  const myOffers = showOffers.filter(o => {
    if (o.status === "Closed" && o.responses[tech.name]) return true; // show closed ones they responded to
    if (o.status === "Closed") return false;
    if (!o.targetTechs || o.targetTechs.length === 0) return true; // all crew
    return o.targetTechs.includes(tech.name);
  });

  function respond(offerId, answer) {
    setShowOffers(p => p.map(o =>
      o.id === offerId
        ? { ...o, responses: { ...o.responses, [tech.name]: answer } }
        : o
    ));
  }

  const unresponded = myOffers.filter(o => o.status === "Open" && !o.responses[tech.name]);

  return (
    <div style={{ maxWidth: 560, margin: "0 auto" }}>
      {unresponded.length > 0 && (
        <div style={{ background: C.gold + "18", border: `1px solid ${C.gold}44`, borderRadius: 8, padding: "10px 16px", marginBottom: 20, fontSize: 13, color: C.gold, fontWeight: 600 }}>
          📣 You have {unresponded.length} new show {unresponded.length === 1 ? "offer" : "offers"} waiting for your response.
        </div>
      )}

      {myOffers.length === 0 ? (
        <Card>
          <div style={{ textAlign: "center", padding: 40, color: C.muted }}>
            <div style={{ fontSize: 32, marginBottom: 10 }}>📭</div>
            No show offers right now. Check back soon.
          </div>
        </Card>
      ) : (
        myOffers.map(offer => {
          const myResponse = offer.responses[tech.name];
          const isClosed = offer.status === "Closed";

          return (
            <Card key={offer.id} style={{
              marginBottom: 14,
              borderColor: myResponse === "accepted" ? C.green + "55"
                : myResponse === "denied" ? C.red + "33"
                : isClosed ? C.border
                : C.gold + "44",
            }}>
              {/* Header */}
              <div style={{ marginBottom: 12 }}>
                {offer.jobCode && (
                  <div style={{ fontFamily: "monospace", fontSize: 10, color: C.gold, background: C.gold + "22", display: "inline-block", padding: "1px 7px", borderRadius: 3, fontWeight: 700, marginBottom: 6 }}>
                    {offer.jobCode}
                  </div>
                )}
                <div style={{ fontWeight: 700, fontSize: 16 }}>{offer.title}</div>
                {isClosed && <Badge color={C.muted} style={{ marginTop: 4 }}>Closed</Badge>}
              </div>

              {/* Details grid */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 14 }}>
                {[
                  ["📅 Date", offer.date || "TBD"],
                  ["🚪 Load-In", offer.loadIn || "TBD"],
                  ["🏁 Wrap", offer.endTime || "TBD"],
                  ["💰 Your Rate", offer.payRate ? `$${offer.payRate}/hr` : "TBD"],
                  ["📍 Venue", offer.venue || "TBD"],
                  ["🎯 Positions", offer.positions || "TBD"],
                ].map(([label, val]) => (
                  <div key={label} style={{ background: C.bg, borderRadius: 6, padding: "8px 12px", border: `1px solid ${C.border}` }}>
                    <div style={{ fontSize: 10, color: C.muted, marginBottom: 2 }}>{label}</div>
                    <div style={{ fontSize: 13, fontWeight: 500 }}>{val}</div>
                  </div>
                ))}
              </div>

              {offer.notes && (
                <div style={{ fontSize: 12, color: C.muted, marginBottom: 14, padding: "8px 12px", background: C.bg, borderRadius: 6, border: `1px solid ${C.border}` }}>
                  📋 {offer.notes}
                </div>
              )}

              {/* Response UI */}
              {myResponse ? (
                <div style={{
                  display: "flex", alignItems: "center", gap: 10, padding: "10px 14px",
                  borderRadius: 8, border: `1px solid ${myResponse === "accepted" ? C.green + "44" : C.red + "44"}`,
                  background: myResponse === "accepted" ? C.green + "12" : C.red + "12",
                }}>
                  <span style={{ fontSize: 20 }}>{myResponse === "accepted" ? "✓" : "✕"}</span>
                  <div>
                    <div style={{ fontWeight: 600, fontSize: 13, color: myResponse === "accepted" ? C.green : C.red }}>
                      You {myResponse === "accepted" ? "accepted" : "declined"} this show
                    </div>
                    <div style={{ fontSize: 11, color: C.muted }}>
                      {isClosed ? "This offer is now closed." : "You can change your response below."}
                    </div>
                  </div>
                  {!isClosed && (
                    <Btn
                      onClick={() => respond(offer.id, myResponse === "accepted" ? "denied" : "accepted")}
                      variant="ghost"
                      style={{ marginLeft: "auto", fontSize: 11, padding: "4px 12px" }}
                    >
                      Change to {myResponse === "accepted" ? "Decline" : "Accept"}
                    </Btn>
                  )}
                </div>
              ) : !isClosed ? (
                <div style={{ display: "flex", gap: 10 }}>
                  <Btn
                    onClick={() => respond(offer.id, "accepted")}
                    style={{ flex: 1, padding: "12px", background: C.green, color: "#fff", fontSize: 14, fontWeight: 700 }}
                  >
                    ✓ Accept Show
                  </Btn>
                  <Btn
                    onClick={() => respond(offer.id, "denied")}
                    variant="danger"
                    style={{ flex: 1, padding: "12px", fontSize: 14, fontWeight: 700 }}
                  >
                    ✕ Can't Make It
                  </Btn>
                </div>
              ) : (
                <div style={{ color: C.muted, fontSize: 12, textAlign: "center" }}>This offer closed before you responded.</div>
              )}
            </Card>
          );
        })
      )}
    </div>
  );
}

// ════════════════════════════════════════════════════════════
// EVENT REPORTS — Admin only
// ════════════════════════════════════════════════════════════
const COMMISSION_RATE = 0.07; // 7% of total before tax
const REPORT_CATEGORIES = ["All", "Cloud", "SNS", "Inspire", "Festival", "Rentals", "Other"];
const CAT_COLORS = {
  Cloud: "#9b59b6", SNS: "#2980b9", Inspire: "#27ae60",
  Festival: "#d4a017", Rentals: "#e67e22", Other: "#6b6a65",
};

function EventReports({ bookings, payroll }) {
  const now = new Date();
  const [selYear, setSelYear] = useState(now.getFullYear());
  const [selMonth, setSelMonth] = useState("All");
  const [selCat, setSelCat] = useState("All");
  const [view, setView] = useState("monthly"); // "monthly" | "detail"

  const MONTHS = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
  const years = [...new Set(bookings.map(b => b.date ? new Date(b.date).getFullYear() : null).filter(Boolean))].sort();
  if (!years.includes(selYear)) years.push(selYear);

  // ── filter bookings ───────────────────────────────────────
  const filtered = bookings.filter(b => {
    if (!b.date) return false;
    const d = new Date(b.date);
    if (d.getFullYear() !== selYear) return false;
    if (selMonth !== "All" && d.getMonth() !== MONTHS.indexOf(selMonth)) return false;
    if (selCat !== "All" && b.category !== selCat) return false;
    return true;
  });

  // ── monthly rollup ────────────────────────────────────────
  const monthly = MONTHS.map((month, mi) => {
    const mBookings = bookings.filter(b => {
      if (!b.date) return false;
      const d = new Date(b.date);
      return d.getFullYear() === selYear && d.getMonth() === mi &&
        (selCat === "All" || b.category === selCat);
    });
    const revenue = mBookings.reduce((s, b) => s + (b.total || 0), 0);
    const commission = revenue * COMMISSION_RATE;
    const laborCost = payroll.filter(p => p.type !== "receivable" &&
      mBookings.some(b => b.jobCode === p.jobCode)
    ).reduce((s, p) => s + (p.total || 0), 0);
    const margin = revenue - laborCost;
    return { month, mi, count: mBookings.length, revenue, commission, laborCost, margin, bookings: mBookings };
  });

  // ── category breakdown ────────────────────────────────────
  const byCat = REPORT_CATEGORIES.filter(c => c !== "All").map(cat => {
    const catBooks = filtered.filter(b => b.category === cat);
    const revenue = catBooks.reduce((s, b) => s + (b.total || 0), 0);
    return { cat, count: catBooks.length, revenue, commission: revenue * COMMISSION_RATE };
  }).filter(c => c.count > 0);

  // ── sales rep breakdown ───────────────────────────────────
  const bySalesRep = [...new Set(filtered.map(b => b.salesRep).filter(Boolean))].map(rep => {
    const repBooks = filtered.filter(b => b.salesRep === rep);
    const revenue = repBooks.reduce((s, b) => s + (b.total || 0), 0);
    const commission = revenue * COMMISSION_RATE;
    return { rep, count: repBooks.length, revenue, commission, bookings: repBooks };
  });

  // ── totals ────────────────────────────────────────────────
  const totalRevenue   = filtered.reduce((s, b) => s + (b.total || 0), 0);
  const totalCommission = totalRevenue * COMMISSION_RATE;
  const totalLaborCost = payroll.filter(p =>
    p.type !== "receivable" && filtered.some(b => b.jobCode === p.jobCode)
  ).reduce((s, p) => s + (p.total || 0), 0);
  const totalMargin = totalRevenue - totalLaborCost;
  const maxMonthRev = Math.max(...monthly.map(m => m.revenue), 1);

  function fmt(n) { return n.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 }); }

  return (
    <div>
      <SectionTitle icon="📊">Event Reports</SectionTitle>

      {/* ── Controls ── */}
      <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginBottom: 24, alignItems: "center" }}>
        {/* Year */}
        <div style={{ display: "flex", gap: 4 }}>
          {years.map(y => (
            <button key={y} onClick={() => setSelYear(y)} style={{
              padding: "5px 14px", borderRadius: 6, fontSize: 12, fontWeight: 600, border: "none", cursor: "pointer",
              background: selYear === y ? C.gold : C.panel, color: selYear === y ? "#000" : C.muted,
              border: `1px solid ${selYear === y ? C.gold : C.border}`,
            }}>{y}</button>
          ))}
        </div>

        <div style={{ color: C.border }}>|</div>

        {/* Month */}
        <div style={{ display: "flex", gap: 4, flexWrap: "wrap" }}>
          {["All", ...MONTHS].map(m => (
            <button key={m} onClick={() => setSelMonth(m)} style={{
              padding: "5px 10px", borderRadius: 6, fontSize: 11, fontWeight: selMonth === m ? 700 : 400, border: "none", cursor: "pointer",
              background: selMonth === m ? C.gold : C.panel, color: selMonth === m ? "#000" : C.muted,
              border: `1px solid ${selMonth === m ? C.gold : C.border}`,
            }}>{m}</button>
          ))}
        </div>

        <div style={{ color: C.border }}>|</div>

        {/* Category */}
        <div style={{ display: "flex", gap: 4, flexWrap: "wrap" }}>
          {REPORT_CATEGORIES.map(c => (
            <button key={c} onClick={() => setSelCat(c)} style={{
              padding: "5px 10px", borderRadius: 6, fontSize: 11, fontWeight: selCat === c ? 700 : 400, border: "none", cursor: "pointer",
              background: selCat === c ? (CAT_COLORS[c] || C.gold) : C.panel,
              color: selCat === c ? "#fff" : C.muted,
              border: `1px solid ${selCat === c ? (CAT_COLORS[c] || C.gold) : C.border}`,
            }}>{c}</button>
          ))}
        </div>
      </div>

      {/* ── Hero totals ── */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12, marginBottom: 24 }}>
        {[
          { label: "Total Revenue", value: `$${fmt(totalRevenue)}`, color: C.gold, sub: `${filtered.length} events` },
          { label: "Total Commission (7%)", value: `$${fmt(totalCommission)}`, color: "#9b59b6", sub: "Before tax" },
          { label: "Labor Cost", value: `$${fmt(totalLaborCost)}`, color: C.red, sub: "Tech payouts" },
          { label: "Gross Margin", value: `$${fmt(totalMargin)}`, color: C.green, sub: "Revenue − labor" },
        ].map(({ label, value, color, sub }) => (
          <Card key={label}>
            <div style={{ fontSize: 10, color: C.muted, fontWeight: 700, letterSpacing: "0.08em", marginBottom: 6 }}>{label.toUpperCase()}</div>
            <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 900, fontSize: 28, color }}>{value}</div>
            <div style={{ fontSize: 11, color: C.muted, marginTop: 4 }}>{sub}</div>
          </Card>
        ))}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 20 }}>

        {/* ── Monthly bar chart ── */}
        <Card>
          <div style={{ fontWeight: 600, fontSize: 13, marginBottom: 16 }}>Monthly Revenue — {selYear}</div>
          <div style={{ display: "flex", alignItems: "flex-end", gap: 6, height: 110, marginBottom: 8 }}>
            {monthly.map((m) => (
              <div key={m.month} onClick={() => { setSelMonth(m.month); setView("detail"); }}
                style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 3, cursor: m.revenue > 0 ? "pointer" : "default" }}>
                <div style={{ fontSize: 8, color: C.muted, textAlign: "center" }}>{m.revenue > 0 ? `$${(m.revenue/1000).toFixed(1)}k` : ""}</div>
                <div style={{
                  width: "100%", borderRadius: "3px 3px 0 0",
                  height: `${Math.max(3, (m.revenue / maxMonthRev) * 88)}px`,
                  background: selMonth === m.month ? C.gold : m.revenue > 0 ? C.gold + "66" : C.border,
                  transition: "all 0.3s",
                }} />
                <div style={{ fontSize: 9, color: selMonth === m.month ? C.gold : C.muted, fontWeight: selMonth === m.month ? 700 : 400 }}>{m.month}</div>
                {m.count > 0 && <div style={{ fontSize: 8, color: C.muted }}>{m.count}</div>}
              </div>
            ))}
          </div>
          <div style={{ fontSize: 11, color: C.muted, textAlign: "center" }}>Click a month to drill down</div>
        </Card>

        {/* ── Category breakdown ── */}
        <Card>
          <div style={{ fontWeight: 600, fontSize: 13, marginBottom: 16 }}>By Category</div>
          {byCat.length === 0 ? (
            <div style={{ color: C.muted, fontSize: 13 }}>No events in this period.</div>
          ) : (
            <>
              {byCat.map(({ cat, count, revenue, commission }) => {
                const pct = totalRevenue > 0 ? (revenue / totalRevenue) * 100 : 0;
                return (
                  <div key={cat} style={{ marginBottom: 14 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4, alignItems: "center" }}>
                      <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                        <span style={{ width: 10, height: 10, borderRadius: "50%", background: CAT_COLORS[cat] || C.muted, display: "inline-block" }} />
                        <span style={{ fontSize: 13, fontWeight: 500 }}>{cat}</span>
                        <span style={{ fontSize: 11, color: C.muted }}>{count} event{count !== 1 ? "s" : ""}</span>
                      </div>
                      <div style={{ textAlign: "right" }}>
                        <span style={{ fontSize: 13, fontWeight: 600 }}>${fmt(revenue)}</span>
                        <span style={{ fontSize: 10, color: "#9b59b6", marginLeft: 8 }}>commission ${fmt(commission)}</span>
                      </div>
                    </div>
                    <div style={{ background: C.border, borderRadius: 3, height: 5, overflow: "hidden" }}>
                      <div style={{ width: `${pct}%`, height: "100%", background: CAT_COLORS[cat] || C.gold, borderRadius: 3, transition: "width 0.4s" }} />
                    </div>
                  </div>
                );
              })}
              <Divider />
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12 }}>
                <span style={{ color: C.muted }}>Total commission owed</span>
                <span style={{ fontWeight: 700, color: "#9b59b6" }}>${fmt(totalCommission)}</span>
              </div>
            </>
          )}
        </Card>
      </div>

      {/* ── Sales Rep Commission Table ── */}
      <Card style={{ marginBottom: 20 }}>
        <div style={{ fontWeight: 600, fontSize: 13, marginBottom: 16 }}>💼 Sales Rep Commission — 7% of Pre-Tax Total</div>
        {bySalesRep.length === 0 ? (
          <div style={{ color: C.muted, fontSize: 13 }}>No sales data for this period.</div>
        ) : (
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
            <thead>
              <tr style={{ borderBottom: `1px solid ${C.border}` }}>
                {["Sales Rep", "Events", "Total Revenue", "Commission (7%)", "Paid", "Outstanding"].map(h => (
                  <th key={h} style={{ textAlign: "left", padding: "6px 10px", color: C.muted, fontWeight: 600, fontSize: 11 }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {bySalesRep.map(({ rep, count, revenue, commission }) => (
                <tr key={rep} style={{ borderBottom: `1px solid ${C.border}` }}>
                  <td style={{ padding: "10px 10px", fontWeight: 600 }}>{rep}</td>
                  <td style={{ padding: "10px 10px", color: C.muted }}>{count}</td>
                  <td style={{ padding: "10px 10px", fontWeight: 600, color: C.gold }}>${fmt(revenue)}</td>
                  <td style={{ padding: "10px 10px", fontWeight: 700, color: "#9b59b6" }}>${fmt(commission)}</td>
                  <td style={{ padding: "10px 10px", color: C.green }}>$0.00</td>
                  <td style={{ padding: "10px 10px", color: "#9b59b6", fontWeight: 600 }}>${fmt(commission)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
        <div style={{ fontSize: 11, color: C.muted, marginTop: 12 }}>Commission calculated at 7% of total booking value before tax. Mark paid when disbursed.</div>
      </Card>

      {/* ── Event Detail List ── */}
      <Card>
        <div style={{ fontWeight: 600, fontSize: 13, marginBottom: 16 }}>
          Event Detail — {selMonth === "All" ? selYear : `${selMonth} ${selYear}`}
          {selCat !== "All" && <span style={{ color: CAT_COLORS[selCat], marginLeft: 8 }}>· {selCat}</span>}
          <span style={{ color: C.muted, fontSize: 11, marginLeft: 10 }}>{filtered.length} events · ${fmt(totalRevenue)}</span>
        </div>

        {filtered.length === 0 ? (
          <div style={{ color: C.muted, fontSize: 13, padding: "20px 0", textAlign: "center" }}>No events match the selected filters.</div>
        ) : (
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12.5 }}>
            <thead>
              <tr style={{ borderBottom: `1px solid ${C.border}` }}>
                {["Job Code", "Date", "Client", "Category", "Location / Venue", "Sales Rep", "Total", "Commission", "Status"].map(h => (
                  <th key={h} style={{ textAlign: "left", padding: "6px 8px", color: C.muted, fontWeight: 600, fontSize: 11 }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.slice().sort((a, b) => new Date(a.date) - new Date(b.date)).map(b => {
                const commission = (b.total || 0) * COMMISSION_RATE;
                return (
                  <tr key={b.id} style={{ borderBottom: `1px solid ${C.border}` }}>
                    <td style={{ padding: "10px 8px" }}>
                      {b.jobCode ? <span style={{ fontFamily: "monospace", fontSize: 10, color: C.gold, background: C.gold+"22", padding: "2px 6px", borderRadius: 3, fontWeight: 700 }}>{b.jobCode}</span> : "—"}
                    </td>
                    <td style={{ padding: "10px 8px", color: C.muted, whiteSpace: "nowrap" }}>{b.date}</td>
                    <td style={{ padding: "10px 8px", fontWeight: 500 }}>{b.client}</td>
                    <td style={{ padding: "10px 8px" }}>
                      <span style={{ background: (CAT_COLORS[b.category] || C.muted)+"22", color: CAT_COLORS[b.category] || C.muted, borderRadius: 4, padding: "2px 8px", fontSize: 11, fontWeight: 600 }}>
                        {b.category || "—"}
                      </span>
                    </td>
                    <td style={{ padding: "10px 8px", color: C.muted, maxWidth: 180, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{b.venue}</td>
                    <td style={{ padding: "10px 8px" }}>{b.salesRep || "—"}</td>
                    <td style={{ padding: "10px 8px", fontWeight: 700, color: C.gold }}>${fmt(b.total || 0)}</td>
                    <td style={{ padding: "10px 8px", color: "#9b59b6", fontWeight: 600 }}>${fmt(commission)}</td>
                    <td style={{ padding: "10px 8px" }}>
                      <Badge color={b.status === "Completed" ? C.green : b.status === "Confirmed" ? C.blue : C.gold}>{b.status}</Badge>
                    </td>
                  </tr>
                );
              })}
            </tbody>
            <tfoot>
              <tr style={{ borderTop: `2px solid ${C.border}` }}>
                <td colSpan="6" style={{ padding: "10px 8px", fontWeight: 700, color: C.muted }}>TOTAL</td>
                <td style={{ padding: "10px 8px", fontWeight: 900, color: C.gold, fontSize: 14 }}>${fmt(totalRevenue)}</td>
                <td style={{ padding: "10px 8px", fontWeight: 900, color: "#9b59b6", fontSize: 14 }}>${fmt(totalCommission)}</td>
                <td />
              </tr>
            </tfoot>
          </table>
        )}
      </Card>
    </div>
  );
}
