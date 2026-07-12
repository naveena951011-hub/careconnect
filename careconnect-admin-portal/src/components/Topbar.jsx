import React from "react";
import { Search, Bell } from "lucide-react";
import { COLORS, FONT_SANS } from "../theme";

export default function Topbar({ liveClock, searchPlaceholder, notifCount = 2 }) {
  return (
    <div className="h-20 shrink-0 flex items-center justify-between px-8">
      <div className="flex items-center gap-2.5 px-4 py-3 rounded-2xl" style={{ background: "rgba(10,14,28,0.28)", width: 380 }}>
        <Search size={15} color="#E4E6F5" />
        <input
          placeholder={searchPlaceholder || "Search…"}
          className="bg-transparent outline-none text-sm w-full placeholder-white/60"
          style={{ color: "#fff", fontFamily: FONT_SANS }}
        />
      </div>
      <div className="flex items-center gap-6">
        <div className="relative">
          <Bell size={19} color="#fff" />
          {notifCount > 0 && (
            <span className="absolute -top-1.5 -right-1.5 w-4 h-4 rounded-full flex items-center justify-center text-[9px] font-bold text-white" style={{ background: COLORS.red }}>
              {notifCount}
            </span>
          )}
        </div>
        <div className="text-sm font-semibold text-white tabular-nums" style={{ fontFamily: FONT_SANS }}>{liveClock}</div>
        <div className="w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold text-white" style={{ background: `linear-gradient(135deg, ${COLORS.teal}, ${COLORS.blue})` }}>
          NA
        </div>
      </div>
    </div>
  );
}
