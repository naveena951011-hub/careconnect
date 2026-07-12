import React, { useState, useMemo, useEffect } from "react";
import { Siren, MapPin, Send, Filter } from "lucide-react";
import { COLORS, FONT_SANS, FONT_DISPLAY, timeAgo } from "../theme";
import { StatusPill, PageHeader, IconBadge, GlassPanel } from "../components/shared";

const CATEGORY_TONE = { "Fall / Medical": "pink", Medical: "pink", "Security Concern": "orange", Fire: "green" };
const FILTERS = ["ALL", "TRIGGERED", "RESOLVED"];

export default function Alerts({ alerts, onResolve, onAddUpdate, selectedId, setSelectedId }) {
  const [filter, setFilter] = useState("ALL");
  const [draft, setDraft] = useState("");

  const filtered = useMemo(() => (filter === "ALL" ? alerts : alerts.filter((a) => a.status === filter)), [alerts, filter]);

  useEffect(() => {
    if (!selectedId && filtered.length > 0) setSelectedId(filtered[0].id);
  }, [filtered, selectedId, setSelectedId]);

  const active = alerts.find((a) => a.id === selectedId) || alerts[0];

  function submitUpdate() {
    if (!draft.trim() || !active) return;
    onAddUpdate(active.id, draft.trim());
    setDraft("");
  }

  return (
    <div className="flex flex-col h-full">
      <PageHeader tag="Live Operations" title="SOS Alert Feed" subtitle="Every triggered SOS across all societies, newest first." />

      <div className="grid grid-cols-12 gap-6 flex-1 min-h-0">
        <GlassPanel className="col-span-4 flex flex-col overflow-hidden">
          <div className="flex items-center gap-1.5 px-4 py-3" style={{ borderBottom: `1px solid ${COLORS.hairline}` }}>
            <Filter size={12} color={COLORS.inkFaint} />
            {FILTERS.map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className="text-[11px] font-bold px-2.5 py-1 rounded-full"
                style={{ fontFamily: FONT_SANS, color: filter === f ? "#fff" : COLORS.inkMuted, background: filter === f ? COLORS.purple : "transparent" }}
              >
                {f}
              </button>
            ))}
          </div>
          <div className="overflow-y-auto flex-1">
            {filtered.map((a) => {
              const isSel = active && a.id === active.id;
              return (
                <button
                  key={a.id}
                  onClick={() => setSelectedId(a.id)}
                  className="w-full text-left px-4 py-3 flex items-center gap-3"
                  style={{ borderBottom: `1px solid ${COLORS.hairline}`, background: isSel ? "rgba(124,106,232,0.08)" : "transparent" }}
                >
                  <IconBadge Icon={Siren} tone={a.status === "TRIGGERED" ? "red" : "green"} size={36} shape="square" />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between">
                      <div className="text-sm font-bold truncate" style={{ color: COLORS.ink, fontFamily: FONT_SANS }}>{a.resident}</div>
                      <span className="text-[10px] font-semibold shrink-0" style={{ color: COLORS.inkFaint, fontFamily: FONT_SANS }}>{timeAgo(a.createdAgoSec)}</span>
                    </div>
                    <div className="text-xs truncate" style={{ color: COLORS.inkFaint, fontFamily: FONT_SANS }}>#{a.id} · {a.flat}</div>
                  </div>
                </button>
              );
            })}
          </div>
        </GlassPanel>

        {active && (
          <GlassPanel className="col-span-8 flex flex-col overflow-hidden">
            <div className="p-5 flex items-start justify-between" style={{ borderBottom: `1px solid ${COLORS.hairline}` }}>
              <div className="flex items-center gap-4">
                <IconBadge Icon={Siren} tone={CATEGORY_TONE[active.category] || "purple"} size={52} shape="square" />
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-xl font-extrabold" style={{ color: COLORS.ink, fontFamily: FONT_DISPLAY }}>{active.resident}</h2>
                    <StatusPill status={active.status} category={active.category} />
                  </div>
                  <div className="text-xs mt-1 font-semibold" style={{ color: COLORS.inkFaint, fontFamily: FONT_SANS }}>
                    #{active.id} · {active.category} · {active.flat}, {active.block}
                  </div>
                </div>
              </div>
              {active.status === "TRIGGERED" && (
                <button onClick={() => onResolve(active.id)} className="text-xs font-bold px-4 py-2.5 rounded-xl text-white" style={{ background: COLORS.green, fontFamily: FONT_SANS }}>
                  Mark resolved
                </button>
              )}
            </div>

            <div className="px-5 py-4 flex items-center gap-4" style={{ borderBottom: `1px solid ${COLORS.hairline}`, background: "rgba(124,106,232,0.05)" }}>
              <IconBadge Icon={MapPin} tone="blue" size={40} />
              <div>
                <div className="text-sm font-bold" style={{ color: COLORS.ink, fontFamily: FONT_SANS }}>{active.address}</div>
                <div className="text-xs mt-0.5 font-semibold tabular-nums" style={{ color: COLORS.inkFaint, fontFamily: FONT_SANS }}>
                  LAT {active.lat.toFixed(4)} · LNG {active.lng.toFixed(4)}
                </div>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-5 flex flex-col gap-3">
              {active.updates.map((u) => (
                <div key={u.id} className="flex gap-3">
                  <div className="w-1.5 h-1.5 rounded-full mt-1.5 shrink-0" style={{ background: COLORS.purple }} />
                  <div>
                    <div className="text-xs font-bold" style={{ color: COLORS.ink, fontFamily: FONT_SANS }}>
                      {u.author} <span className="font-semibold" style={{ color: COLORS.inkFaint }}>· {timeAgo(u.agoSec)}</span>
                    </div>
                    <div className="text-sm mt-0.5" style={{ color: COLORS.inkMuted, fontFamily: FONT_SANS }}>{u.message}</div>
                  </div>
                </div>
              ))}
            </div>

            <div className="p-4 flex items-center gap-2" style={{ borderTop: `1px solid ${COLORS.hairline}` }}>
              <input
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && submitUpdate()}
                placeholder="Post a coordination update…"
                className="flex-1 text-sm px-4 py-2.5 rounded-xl outline-none"
                style={{ background: COLORS.hairline, color: COLORS.ink, fontFamily: FONT_SANS }}
              />
              <button onClick={submitUpdate} className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 text-white" style={{ background: COLORS.purple }}>
                <Send size={14} />
              </button>
            </div>
          </GlassPanel>
        )}
      </div>
    </div>
  );
}
