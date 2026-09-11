import type { BankInfo, Biller } from "./types";

/** Format a number into PHP currency display */
export function formatCurrency(amount: number, opts: { showSign?: boolean; compact?: boolean } = {}): string {
  const sign = opts.showSign ? (amount > 0 ? "+" : amount < 0 ? "−" : "") : "";
  const abs = Math.abs(amount);
  const formatter = new Intl.NumberFormat("en-PH", {
    style: "currency",
    currency: "PHP",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
    notation: opts.compact ? "compact" : "standard",
  });
  return `${sign}${formatter.format(abs)}`;
}

/** Short peso format without decimals, e.g. ₱1,250 */
export function formatCurrencyShort(amount: number): string {
  return new Intl.NumberFormat("en-PH", {
    style: "currency",
    currency: "PHP",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

/** Format ISO date for transaction lists */
export function formatDateTime(iso: string, withTime = true): string {
  const d = new Date(iso);
  const datePart = d.toLocaleDateString("en-PH", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
  if (!withTime) return datePart;
  const timePart = d.toLocaleTimeString("en-PH", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
  return `${datePart} · ${timePart}`;
}

/** Group key for transaction lists: Today / Yesterday / weekday / month */
export function dateGroupKey(iso: string): string {
  const d = new Date(iso);
  const now = new Date();
  const todayMidnight = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const thatMidnight = new Date(d.getFullYear(), d.getMonth(), d.getDate());
  const diffDays = Math.round((todayMidnight.getTime() - thatMidnight.getTime()) / 86400000);
  if (diffDays === 0) return "Today";
  if (diffDays === 1) return "Yesterday";
  if (diffDays < 7) return d.toLocaleDateString("en-PH", { weekday: "long" });
  return d.toLocaleDateString("en-PH", { month: "long", year: "numeric" });
}

/** Pretty phone mask: 0917 123 4567 */
export function maskPhone(phone: string): string {
  const digits = phone.replace(/\D/g, "");
  if (digits.length === 11 && digits.startsWith("0")) {
    return `${digits.slice(0, 4)} ${digits.slice(4, 7)} ${digits.slice(7)}`;
  }
  return phone;
}

/** Mask an account number, keeping last 4 digits */
export function maskAccount(acc: string): string {
  const trimmed = acc.replace(/\s/g, "");
  if (trimmed.length <= 4) return trimmed;
  const last4 = trimmed.slice(-4);
  const masked = "•".repeat(Math.min(8, trimmed.length - 4));
  return `${masked} ${last4}`;
}

/** Generate a reference number like P8-240911-AB12CD */
export function generateReference(prefix = "P8"): string {
  const now = new Date();
  const yymmdd = `${String(now.getFullYear()).slice(2)}${String(now.getMonth() + 1).padStart(2, "0")}${String(now.getDate()).padStart(2, "0")}`;
  const rand = Math.random().toString(36).slice(2, 8).toUpperCase();
  return `${prefix}-${yymmdd}-${rand}`;
}

/** Simple unique id */
export function generateId(prefix = "id"): string {
  return `${prefix}_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;
}

/** Compute initials from a name */
export function initials(name: string): string {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((s) => s[0]?.toUpperCase() ?? "")
    .join("");
}

/** Time-ago style label */
export function timeAgo(iso: string): string {
  const diffMs = Date.now() - new Date(iso).getTime();
  const sec = Math.floor(diffMs / 1000);
  if (sec < 60) return "just now";
  const min = Math.floor(sec / 60);
  if (min < 60) return `${min}m ago`;
  const hr = Math.floor(min / 60);
  if (hr < 24) return `${hr}h ago`;
  const day = Math.floor(hr / 24);
  if (day < 7) return `${day}d ago`;
  return formatDateTime(iso, false);
}

export const BANKS: BankInfo[] = [
  { code: "BPI", name: "Bank of the Philippine Islands", shortName: "BPI", color: "#D31145", instapay: true, pesonet: true },
  { code: "BDO", name: "Banco de Oro", shortName: "BDO", color: "#005BA2", instapay: true, pesonet: true },
  { code: "MBT", name: "Metropolitan Bank & Trust Co.", shortName: "Metrobank", color: "#1B5E20", instapay: true, pesonet: true },
  { code: "SBN", name: "Security Bank Corporation", shortName: "Security Bank", color: "#00833F", instapay: true, pesonet: true },
  { code: "UCPB", name: "United Coconut Planters Bank", shortName: "UCPB", color: "#003D7A", instapay: true, pesonet: true },
  { code: "PNB", name: "Philippine National Bank", shortName: "PNB", color: "#C8102E", instapay: true, pesonet: true },
  { code: "RBC", name: "Robinsons Bank Corporation", shortName: "Robinsons Bank", color: "#F57C00", instapay: true, pesonet: true },
  { code: "CBC", name: "China Banking Corporation", shortName: "China Bank", color: "#1B4B8C", instapay: true, pesonet: true },
  { code: "UBP", name: "Union Bank of the Philippines", shortName: "UnionBank", color: "#E2231A", instapay: true, pesonet: true },
  { code: "CTBC", name: "CTBC Bank Philippines", shortName: "CTBC", color: "#0067A0", instapay: true, pesonet: false },
  { code: "EWRB", name: "East West Banking Corporation", shortName: "EastWest Bank", color: "#0F4C81", instapay: true, pesonet: true },
  { code: "PBC", name: "Philippine Bank of Commerce", shortName: "PBCOM", color: "#FFC72C", instapay: true, pesonet: false },
  { code: "PSB", name: "Philippine Savings Bank", shortName: "PSBank", color: "#003DA5", instapay: true, pesonet: true },
  { code: "AUB", name: "Asia United Bank", shortName: "AUB", color: "#003B5C", instapay: true, pesonet: true },
  { code: "GXB", name: "G-Xchange, Inc. (GCash)", shortName: "GCash", color: "#007AFF", instapay: true, pesonet: false },
  { code: "MAY", name: "Maya Bank, Inc.", shortName: "Maya", color: "#14B8A6", instapay: true, pesonet: false },
  { code: "SBC", name: "Sun Savings Bank", shortName: "Sun Savings", color: "#F59E0B", instapay: true, pesonet: false },
  { code: "DMB", name: "Dragonpay Wallet", shortName: "Dragonpay", color: "#7C3AED", instapay: true, pesonet: false },
];

export const BILLERS: Biller[] = [
  { code: "MERALCO", name: "Manila Electric Company", category: "Electricity", color: "#E2231A" },
  { code: "MAYNILAD", name: "Maynilad Water Services", category: "Water", color: "#005BA2" },
  { code: "MANILAWATER", name: "Manila Water Company", category: "Water", color: "#0E7AC1" },
  { code: "PLDT", name: "PLDT Home Fibr", category: "Internet", color: "#E2231A" },
  { code: "GLOBEHOME", name: "Globe At Home", category: "Internet", color: "#0067B1" },
  { code: "SMARTBRO", name: "Smart Bro", category: "Internet", color: "#FFC107" },
  { code: "SKY", name: "Sky Cable", category: "Cable", color: "#F57C00" },
  { code: "CIGNAL", name: "Cignal TV", category: "Cable", color: "#1B4B8C" },
  { code: "GLOBEPOST", name: "Globe Postpaid", category: "Telecom", color: "#0067B1" },
  { code: "SMARTPOST", name: "Smart Postpaid", category: "Telecom", color: "#E2231A" },
  { code: "SUNPOST", name: "Sun Postpaid", category: "Telecom", color: "#FFC107" },
  { code: "SSS", name: "SSS Contribution", category: "Government", color: "#0B6E4F" },
  { code: "PHILHEALTH", name: "PhilHealth", category: "Government", color: "#005BA2" },
  { code: "PAGIBIG", name: "Pag-IBIG Fund", category: "Government", color: "#E2231A" },
  { code: "BIR", name: "Bureau of Internal Revenue", category: "Government", color: "#1B5E20" },
];

export const CASHIN_PARTNERS = [
  { code: "7ELEVEN", name: "7-Eleven (CLiQQ)", color: "#00833F", fee: 0 },
  { code: "CEBUANA", name: "Cebuana Lhuillier", color: "#FFD200", fee: 0 },
  { code: "PALAWAN", name: "Palawan Express", color: "#005BA2", fee: 0 },
  { code: "M LHUILLIER", name: "M Lhuillier", color: "#E2231A", fee: 0 },
  { code: "RD", name: "RD Pawnshop", color: "#F57C00", fee: 0 },
  { code: "SM", name: "SM Business Center", color: "#E2231A", fee: 0 },
  { code: "ROBINSONS", name: "Robinsons Business Center", color: "#9C27B0", fee: 0 },
  { code: "LAZADA", name: "Lazada Wallet", color: "#0059B3", fee: 0 },
];

export const PROMOS = [
  {
    id: "p1",
    title: "Get 5% cashback on PAY8 Card top-ups",
    subtitle: "Until September 30, 2026",
    color: "from-violet-500/30 to-amber-500/30",
  },
  {
    id: "p2",
    title: "Win ₱88,888 this lucky payday",
    subtitle: "Send money to enter · weekly draw",
    color: "from-amber-500/30 to-pink-500/30",
  },
  {
    id: "p3",
    title: "Free MRT-3 ride on your first PAY8 Card tap",
    subtitle: "Limited to first 8,888 new cardholders",
    color: "from-emerald-500/30 to-violet-500/30",
  },
];

/** Luhn-valid-looking 16-digit PAN for the PAY8 card mock */
export function generatePan(): { full: string; last4: string } {
  const prefix = "8"; // PAY8 BIN starts with 8
  let pan = prefix;
  for (let i = 1; i < 16; i++) {
    pan += Math.floor(Math.random() * 10).toString();
  }
  return { full: pan, last4: pan.slice(-4) };
}
