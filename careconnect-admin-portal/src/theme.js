export const COLORS = {
  sidebarBg: "#0A0E1C",
  sidebarBorder: "#FFFFFF14",

  gradientA: "#9C90EE",
  gradientB: "#7CA3E0",
  gradientC: "#5FC2D6",
  gradientD: "#5CDDBB",

  card: "rgba(255,255,255,0.95)",
  cardSolid: "#FFFFFF",
  ink: "#171A2B",
  inkMuted: "#5C6178",
  inkFaint: "#9096AC",
  hairline: "#171A2B14",

  purple: "#7C6AE8", purpleDim: "#7C6AE81C",
  blue: "#2F8FE0", blueDim: "#2F8FE01C",
  green: "#2FAE60", greenDim: "#2FAE601C",
  orange: "#F2A93B", orangeDim: "#F2A93B1C",
  pink: "#F2609C", pinkDim: "#F2609C1C",
  red: "#E14B4B", redDim: "#E14B4B1C",
  teal: "#1FB18F",
};

export const FONT_DISPLAY = "'Poppins', 'Inter', -apple-system, sans-serif";
export const FONT_SANS = "'Inter', 'Poppins', -apple-system, 'Segoe UI', sans-serif";
export const FONT_MONO = "'IBM Plex Mono', ui-monospace, 'SF Mono', Menlo, Consolas, monospace";

export function timeAgo(sec) {
  if (sec < 60) return `${sec}s ago`;
  if (sec < 3600) return `${Math.floor(sec / 60)}m ago`;
  return `${Math.floor(sec / 3600)}h ago`;
}

export function initials(name) {
  return name.split(" ").map((w) => w[0]).join("").slice(0, 2).toUpperCase();
}

/* Category -> visual treatment for SOS alerts, shared by Dashboard + Alerts page */
export const CATEGORY_STYLE = {
  "Fall / Medical": { tone: "pink", label: "MEDICAL" },
  Medical: { tone: "pink", label: "MEDICAL" },
  "Security Concern": { tone: "orange", label: "SECURITY" },
  Fire: { tone: "red", label: "FIRE" },
};
