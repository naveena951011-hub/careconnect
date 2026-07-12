import React from "react";
import { LayoutGrid, Siren, Users, Map, ShieldPlus, ChevronDown } from "lucide-react";
import { COLORS, FONT_DISPLAY, FONT_SANS } from "../theme";

const ITEMS = [
  { key: "dashboard", label: "Overview", icon: LayoutGrid },
  { key: "alerts", label: "SOS Alerts", icon: Siren, badgeTone: COLORS.red },
  { key: "residents", label: "Residents", icon: Users, badgeTone: COLORS.orange },
  { key: "society", label: "Society Map", icon: Map },
];

function SkylineArt() {
  return (
    <svg viewBox="0 0 240 220" width="100%" height="220" className="block">
      <defs>
        <radialGradient id="sun" cx="35%" cy="55%" r="55%">
          <stop offset="0%" stopColor="#FFC98B" />
          <stop offset="100%" stopColor="#F2609C" />
        </radialGradient>
        <linearGradient id="hill1" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#6E57D8" />
          <stop offset="100%" stopColor="#2FA6C9" />
        </linearGradient>
        <linearGradient id="hill2" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#2FA6C9" />
          <stop offset="100%" stopColor="#2FCBA6" />
        </linearGradient>
      </defs>
      {[...Array(14)].map((_, i) => (
        <circle key={i} cx={(i * 37) % 240} cy={(i * 53) % 130} r={i % 3 === 0 ? 1.4 : 0.8} fill="#FFFFFF" opacity={0.5} />
      ))}
      <circle cx="85" cy="115" r="46" fill="url(#sun)" opacity="0.9" />
      <rect x="150" y="60" width="14" height="90" fill="#0A0E1C" opacity="0.85" />
      <rect x="168" y="80" width="10" height="70" fill="#0A0E1C" opacity="0.85" />
      <rect x="182" y="45" width="16" height="105" fill="#0A0E1C" opacity="0.85" />
      <path d="M0 150 Q 60 120 120 150 T 240 150 V220 H0 Z" fill="url(#hill1)" opacity="0.9" />
      <path d="M0 175 Q 70 150 140 175 T 240 170 V220 H0 Z" fill="url(#hill2)" opacity="0.9" />
    </svg>
  );
}

export default function Sidebar({ active, setActive, liveCount, pendingCount, user, onLogout }) {
  const badges = { alerts: liveCount, residents: pendingCount };

  return (
    <div className="w-64 shrink-0 h-full flex flex-col justify-between" style={{ background: COLORS.sidebarBg }}>
      <div>
        <div className="px-5 py-6 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: `linear-gradient(135deg, ${COLORS.teal}, ${COLORS.blue})` }}>
            <ShieldPlus size={20} color="#fff" strokeWidth={2.4} />
          </div>
          <div>
            <div className="text-base font-extrabold text-white" style={{ fontFamily: FONT_DISPLAY }}>CareConnect</div>
            <div className="text-[10px] font-bold uppercase tracking-widest" style={{ color: COLORS.teal, fontFamily: FONT_SANS, letterSpacing: "0.12em" }}>
              Community Response
            </div>
          </div>
        </div>

        <nav className="px-4 mt-2 flex flex-col gap-1.5">
          {ITEMS.map((it) => {
            const Icon = it.icon;
            const isActive = active === it.key;
            const badge = badges[it.key];
            return (
              <button
                key={it.key}
                onClick={() => setActive(it.key)}
                className="flex items-center justify-between px-3.5 py-3 rounded-xl transition-all duration-200"
                style={{
                  background: isActive ? `linear-gradient(90deg, ${COLORS.teal}, #22D3A8)` : "transparent",
                  color: isActive ? "#052A22" : "#B7BCD6",
                  fontWeight: 700,
                }}
              >
                <span className="flex items-center gap-3 text-sm" style={{ fontFamily: FONT_SANS }}>
                  <Icon size={17} />
                  {it.label}
                </span>
                {badge ? (
                  <span
                    className="text-[10px] font-bold w-5 h-5 rounded-full flex items-center justify-center text-white"
                    style={{ backgroundColor: it.key === "alerts" ? COLORS.red : COLORS.orange, fontFamily: FONT_SANS }}
                  >
                    {badge}
                  </span>
                ) : null}
              </button>
            );
          })}
        </nav>
      </div>

      <div>
        <SkylineArt />
        <button onClick={onLogout} className="w-full px-5 py-4 flex items-center gap-2.5 text-left" style={{ borderTop: `1px solid ${COLORS.sidebarBorder}` }}>
          <div className="w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold text-white" style={{ background: `linear-gradient(135deg, ${COLORS.teal}, ${COLORS.blue})` }}>
            {(user?.username || "NA").slice(0, 2).toUpperCase()}
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-xs font-bold text-white truncate" style={{ fontFamily: FONT_SANS }}>{user?.username || "Admin"} · {user?.role || "Admin"}</div>
          </div>
          <ChevronDown size={14} color="#8A90AC" />
        </button>
      </div>
    </div>
  );
}