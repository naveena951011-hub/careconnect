import React from "react";
import { COLORS, FONT_SANS, initials, CATEGORY_STYLE } from "../theme";

const TONE_MAP = {
  purple: [COLORS.purple, COLORS.purpleDim],
  blue: [COLORS.blue, COLORS.blueDim],
  green: [COLORS.green, COLORS.greenDim],
  orange: [COLORS.orange, COLORS.orangeDim],
  pink: [COLORS.pink, COLORS.pinkDim],
  red: [COLORS.red, COLORS.redDim],
};

const PILL_TONE = {
  pink: { c: "#D6336C", bg: "#FBD8E4" },
  orange: { c: "#C2760A", bg: "#FDE7C8" },
  red: { c: "#C22F2F", bg: "#FBDADA" },
  green: { c: "#1F9254", bg: "#D8F5E3" },
};

/* Status pill: RESOLVED/APPROVED always show their own tone; a live/pending
   alert shows its *category* label+color (MEDICAL / SECURITY / FIRE) so the
   pill communicates what's happening, not just that something is live. */
export function StatusPill({ status, category }) {
  if (status === "RESOLVED" || status === "APPROVED") {
    const t = PILL_TONE.green;
    return <Pill c={t.c} bg={t.bg} label={status === "RESOLVED" ? "RESOLVED" : "APPROVED"} />;
  }
  if (status === "PENDING") {
    const t = PILL_TONE.orange;
    return <Pill c={t.c} bg={t.bg} label="PENDING" pulse />;
  }
  const style = CATEGORY_STYLE[category] || { tone: "pink", label: "LIVE" };
  const t = PILL_TONE[style.tone] || PILL_TONE.pink;
  return <Pill c={t.c} bg={t.bg} label={style.label} pulse />;
}

function Pill({ c, bg, label, pulse }) {
  return (
    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold" style={{ color: c, background: bg, fontFamily: FONT_SANS }}>
      {pulse && (
        <span className="relative flex h-1.5 w-1.5">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full opacity-75" style={{ background: c }} />
          <span className="relative inline-flex rounded-full h-1.5 w-1.5" style={{ background: c }} />
        </span>
      )}
      {label}
    </span>
  );
}

/* Rounded-square icon badge — used for incident rows */
export function IconBadge({ Icon, tone = "purple", size = 44, shape = "circle" }) {
  const [c, bg] = TONE_MAP[tone] || TONE_MAP.purple;
  return (
    <div
      className={`flex items-center justify-center shrink-0 ${shape === "circle" ? "rounded-full" : "rounded-xl"}`}
      style={{ width: size, height: size, background: bg }}
    >
      <Icon size={size * 0.46} color={c} strokeWidth={2.25} />
    </div>
  );
}

/* Rounded-square initials avatar — matches the reference's approval rows */
export function Avatar({ name, tone = "purple", size = 32, shape = "square" }) {
  const [c, bg] = TONE_MAP[tone] || TONE_MAP.purple;
  return (
    <div
      className={`flex items-center justify-center font-bold shrink-0 ${shape === "circle" ? "rounded-full" : "rounded-xl"}`}
      style={{ width: size, height: size, background: bg, color: c, fontFamily: FONT_SANS, fontSize: size * 0.36 }}
    >
      {initials(name)}
    </div>
  );
}

export function GradientPill({ children }) {
  return (
    <span
      className="inline-block text-xs font-bold uppercase px-3.5 py-1.5 rounded-full text-white"
      style={{ background: `linear-gradient(90deg, ${COLORS.pink}, ${COLORS.orange})`, fontFamily: FONT_SANS, letterSpacing: "0.04em" }}
    >
      {children}
    </span>
  );
}

export function GlassPanel({ children, className = "", style = {} }) {
  return (
    <div className={`rounded-2xl ${className}`} style={{ background: COLORS.card, boxShadow: "0 12px 28px rgba(10,14,28,0.16)", ...style }}>
      {children}
    </div>
  );
}

export function PageHeader({ tag, title, subtitle, action }) {
  return (
    <div className="flex items-start justify-between mb-7">
      <div>
        <GradientPill>{tag}</GradientPill>
        <h1 className="text-3xl font-extrabold text-white mt-3" style={{ fontFamily: FONT_SANS }}>{title}</h1>
        {subtitle && <p className="text-sm mt-1.5 font-semibold" style={{ color: "#FFE9B0", fontFamily: FONT_SANS }}>{subtitle}</p>}
      </div>
      {action}
    </div>
  );
}
