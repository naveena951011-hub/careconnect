import React from "react";
import { Siren, Users2, Building2, Home, UserRound, HeartHandshake, ListChecks, Clock, ArrowRight, HeartPulse, ShieldCheck, Flame } from "lucide-react";
import { COLORS, FONT_SANS, timeAgo, CATEGORY_STYLE } from "../theme";
import { StatusPill, Avatar, IconBadge, GradientPill, GlassPanel } from "../components/shared";
import { SEED_STATS } from "../mockData";

const CATEGORY_ICON = { "Fall / Medical": HeartPulse, Medical: HeartPulse, "Security Concern": ShieldCheck, Fire: Flame };

function StatCard({ label, value, icon, tone, index }) {
  return (
    <GlassPanel
      className="p-4 flex flex-col gap-4 opacity-0 transition-transform duration-200 hover:-translate-y-1"
      style={{ animation: `riseIn 0.45s ease-out ${index * 0.06}s forwards` }}
    >
      <IconBadge Icon={icon} tone={tone} size={40} shape="circle" />
      <div>
        <div className="text-[11px] font-bold uppercase" style={{ color: COLORS.inkFaint, fontFamily: FONT_SANS, letterSpacing: "0.08em" }}>{label}</div>
        <div className="text-2xl font-extrabold" style={{ color: COLORS.ink, fontFamily: FONT_SANS }}>{value}</div>
      </div>
    </GlassPanel>
  );
}

export default function Dashboard({ alerts, approvals, goTo, onTriggerDemo }) {
  const liveCount = alerts.filter((a) => a.status === "TRIGGERED").length;
  const previewAlerts = alerts.slice(0, 3);
  const previewApprovals = approvals.slice(0, 3);

  return (
    <div>
      <div className="flex items-start justify-between mb-7">
        <div>
          <GradientPill>Operations Overview</GradientPill>
          <h1 className="text-3xl font-extrabold text-white mt-3" style={{ fontFamily: FONT_SANS }}>Green Valley &amp; 2 more</h1>
          <p className="text-sm mt-1.5 font-bold" style={{ color: "#FFE9B0", fontFamily: FONT_SANS }}>
            {liveCount > 0 ? `${liveCount} live incident${liveCount > 1 ? "s" : ""} in progress` : "No active incidents"}
          </p>
        </div>
        <button
          onClick={onTriggerDemo}
          className="flex items-center gap-2 text-sm font-bold px-5 py-3 rounded-2xl text-white transition-transform duration-150 hover:scale-[1.03]"
          style={{ background: "rgba(10,14,28,0.55)", fontFamily: FONT_SANS }}
        >
          <Siren size={15} /> Submit new SOS
        </button>
      </div>

      <div className="grid grid-cols-3 md:grid-cols-6 gap-3 mb-7">
        <StatCard label="Societies" value={SEED_STATS.societies} icon={Users2} tone="purple" index={0} />
        <StatCard label="Blocks" value={SEED_STATS.blocks} icon={Building2} tone="blue" index={1} />
        <StatCard label="Flats" value={SEED_STATS.flats} icon={Home} tone="green" index={2} />
        <StatCard label="Residents" value={SEED_STATS.residents} icon={UserRound} tone="orange" index={3} />
        <StatCard label="Volunteers" value={SEED_STATS.volunteers} icon={HeartHandshake} tone="pink" index={4} />
        <StatCard label="Live Incidents" value={liveCount} icon={Siren} tone="red" index={5} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <GlassPanel className="p-5">
          <div className="flex items-center gap-2 mb-4">
            <ListChecks size={16} color={COLORS.teal} />
            <h2 className="text-sm font-extrabold" style={{ color: COLORS.ink, fontFamily: FONT_SANS }}>RECENT INCIDENTS</h2>
          </div>
          <div className="flex flex-col">
            {previewAlerts.map((a, i) => {
              const style = CATEGORY_STYLE[a.category] || { tone: "purple" };
              return (
                <button
                  key={a.id}
                  onClick={() => goTo("alerts", a.id)}
                  className="w-full flex items-center justify-between py-3 text-left"
                  style={{ borderTop: i > 0 ? `1px solid ${COLORS.hairline}` : "none" }}
                >
                  <div className="flex items-center gap-3">
                    <IconBadge Icon={CATEGORY_ICON[a.category] || Siren} tone={a.status === "RESOLVED" ? "green" : style.tone} size={40} shape="square" />
                    <div>
                      <div className="text-sm font-bold" style={{ color: COLORS.ink, fontFamily: FONT_SANS }}>{a.resident}</div>
                      <div className="text-xs" style={{ color: COLORS.inkFaint, fontFamily: FONT_SANS }}>{a.flat} · {a.category}</div>
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-1.5">
                    <StatusPill status={a.status} category={a.category} />
                    <span className="text-[11px] font-semibold" style={{ color: COLORS.inkFaint, fontFamily: FONT_SANS }}>{timeAgo(a.createdAgoSec)}</span>
                  </div>
                </button>
              );
            })}
          </div>
          <button onClick={() => goTo("alerts")} className="mt-3 text-sm font-bold flex items-center gap-1.5" style={{ color: COLORS.purple, fontFamily: FONT_SANS }}>
            View all incidents <ArrowRight size={13} />
          </button>
        </GlassPanel>

        <GlassPanel className="p-5">
          <div className="flex items-center gap-2 mb-4">
            <Clock size={16} color={COLORS.purple} />
            <h2 className="text-sm font-extrabold" style={{ color: COLORS.ink, fontFamily: FONT_SANS }}>PENDING APPROVALS</h2>
          </div>
          <div className="flex flex-col">
            {previewApprovals.length === 0 ? (
              <div className="py-8 text-center text-xs font-bold" style={{ color: COLORS.inkFaint, fontFamily: FONT_SANS }}>Queue clear</div>
            ) : (
              previewApprovals.map((item, i) => (
                <button
                  key={item.id}
                  onClick={() => goTo("residents")}
                  className="w-full flex items-center justify-between py-3 text-left"
                  style={{ borderTop: i > 0 ? `1px solid ${COLORS.hairline}` : "none" }}
                >
                  <div className="flex items-center gap-3">
                    <Avatar name={item.resident} tone={["purple", "orange", "green"][i % 3]} size={40} shape="square" />
                    <div>
                      <div className="text-sm font-bold" style={{ color: COLORS.ink, fontFamily: FONT_SANS }}>{item.resident}</div>
                      <div className="text-xs" style={{ color: COLORS.inkFaint, fontFamily: FONT_SANS }}>{item.block} · {item.flat}</div>
                    </div>
                  </div>
                  <span className="text-[11px] font-semibold" style={{ color: COLORS.inkFaint, fontFamily: FONT_SANS }}>{item.requestedAgoMin}m ago</span>
                </button>
              ))
            )}
          </div>
          <button onClick={() => goTo("residents")} className="mt-3 text-sm font-bold flex items-center gap-1.5" style={{ color: COLORS.purple, fontFamily: FONT_SANS }}>
            View all approvals <ArrowRight size={13} />
          </button>
        </GlassPanel>
      </div>
    </div>
  );
}
