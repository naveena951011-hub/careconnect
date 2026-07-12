import React, { useState } from "react";
import { CheckCircle2, XCircle, Phone, Heart } from "lucide-react";
import { COLORS, FONT_SANS } from "../theme";
import { Avatar, PageHeader, StatusPill, GlassPanel } from "../components/shared";

const TABS = [{ key: "pending", label: "Pending Approvals" }, { key: "directory", label: "Resident Directory" }];

function Th({ children, align = "left" }) {
  return (
    <th className={`px-4 py-3 text-[11px] font-bold uppercase text-${align}`} style={{ color: COLORS.inkFaint, fontFamily: FONT_SANS, letterSpacing: "0.06em" }}>
      {children}
    </th>
  );
}

export default function Residents({ approvals, directory, onDecision }) {
  const [tab, setTab] = useState("pending");

  return (
    <div>
      <PageHeader tag="Resident Management" title="Approvals & Directory" subtitle="Review flat-mapping requests and browse the approved resident directory." />

      <div className="flex items-center gap-1 mb-5 p-1 rounded-2xl w-fit" style={{ background: "rgba(255,255,255,0.16)" }}>
        {TABS.map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className="text-xs font-bold px-4 py-2 rounded-xl flex items-center gap-2"
            style={{ fontFamily: FONT_SANS, color: tab === t.key ? COLORS.ink : "#fff", background: tab === t.key ? "#fff" : "transparent" }}
          >
            {t.label}
            {t.key === "pending" && approvals.length > 0 && (
              <span className="text-[10px] px-1.5 py-0.5 rounded-full text-white" style={{ background: COLORS.orange, fontFamily: FONT_SANS }}>{approvals.length}</span>
            )}
          </button>
        ))}
      </div>

      <GlassPanel className="overflow-hidden">
        {tab === "pending" ? (
          <table className="w-full">
            <thead><tr>{["Resident", "Flat", "Requested", ""].map((h, i) => <Th key={i} align={i === 3 ? "right" : "left"}>{h}</Th>)}</tr></thead>
            <tbody>
              {approvals.length === 0 ? (
                <tr><td colSpan={4} className="px-4 py-10 text-center text-xs font-bold" style={{ color: COLORS.inkFaint, fontFamily: FONT_SANS }}>Queue clear — no pending requests</td></tr>
              ) : (
                approvals.map((item) => (
                  <tr key={item.id} style={{ borderTop: `1px solid ${COLORS.hairline}` }}>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <Avatar name={item.resident} tone="orange" size={36} />
                        <div>
                          <div className="text-sm font-bold" style={{ color: COLORS.ink, fontFamily: FONT_SANS }}>{item.resident}</div>
                          <div className="text-xs" style={{ color: COLORS.inkFaint, fontFamily: FONT_SANS }}>{item.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm font-semibold" style={{ color: COLORS.inkMuted, fontFamily: FONT_SANS }}>{item.block} · {item.flat}</td>
                    <td className="px-4 py-3 text-xs font-semibold" style={{ color: COLORS.inkFaint, fontFamily: FONT_SANS }}>{item.requestedAgoMin}m ago</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-2">
                        <button onClick={() => onDecision(item.id, "REJECTED")} className="w-8 h-8 rounded-full flex items-center justify-center" style={{ background: "#FBD8E4", color: "#D6336C" }}><XCircle size={15} /></button>
                        <button onClick={() => onDecision(item.id, "APPROVED")} className="w-8 h-8 rounded-full flex items-center justify-center" style={{ background: "#D8F5E3", color: "#1F9254" }}><CheckCircle2 size={15} /></button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        ) : (
          <table className="w-full">
            <thead><tr>{["Resident", "Flat", "Contact", "Guardians", ""].map((h, i) => <Th key={i} align={i === 4 ? "right" : "left"}>{h}</Th>)}</tr></thead>
            <tbody>
              {directory.map((item) => (
                <tr key={item.id} style={{ borderTop: `1px solid ${COLORS.hairline}` }}>
                  <td className="px-4 py-3"><div className="flex items-center gap-3"><Avatar name={item.resident} tone="blue" size={36} /><div className="text-sm font-bold" style={{ color: COLORS.ink, fontFamily: FONT_SANS }}>{item.resident}</div></div></td>
                  <td className="px-4 py-3 text-sm font-semibold" style={{ color: COLORS.inkMuted, fontFamily: FONT_SANS }}>{item.block} · {item.flat}</td>
                  <td className="px-4 py-3"><div className="flex items-center gap-1.5 text-xs font-semibold" style={{ color: COLORS.inkMuted, fontFamily: FONT_SANS }}><Phone size={11} /> {item.phone}</div></td>
                  <td className="px-4 py-3"><div className="flex items-center gap-1.5 text-xs font-semibold" style={{ color: item.guardians > 0 ? COLORS.green : COLORS.orange, fontFamily: FONT_SANS }}><Heart size={11} /> {item.guardians} configured</div></td>
                  <td className="px-4 py-3 text-right"><StatusPill status={item.status} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </GlassPanel>
    </div>
  );
}
