import React, { useState, useMemo } from "react";
import { Building2, Layers, MapPin } from "lucide-react";
import { COLORS, FONT_SANS } from "../theme";
import { PageHeader, IconBadge, GlassPanel } from "../components/shared";
import { SEED_SOCIETIES } from "../mockData";

export default function Society() {
  const [societyId, setSocietyId] = useState(SEED_SOCIETIES[0].id);
  const [blockId, setBlockId] = useState(SEED_SOCIETIES[0].blocks[0].id);

  const society = SEED_SOCIETIES.find((s) => s.id === societyId);
  const block = society.blocks.find((b) => b.id === blockId) || society.blocks[0];

  function selectSociety(id) {
    setSocietyId(id);
    setBlockId(SEED_SOCIETIES.find((s) => s.id === id).blocks[0].id);
  }

  const flatCells = useMemo(() => {
    const cells = [];
    for (let i = 0; i < block.flats; i++) cells.push(i < block.occupied);
    return [...cells].sort((a, b) => (a === b ? 0 : a ? -1 : 1) * (((block.id * 7) % 3) - 1 || 1));
  }, [block]);

  return (
    <div>
      <PageHeader tag="Community Structure" title="Society & Flat Registry" subtitle="Drill from society down to individual flats and see live occupancy at a glance." />

      <div className="grid grid-cols-12 gap-5">
        <GlassPanel className="col-span-3 overflow-hidden p-2">
          <div className="text-[11px] font-bold uppercase px-2 py-2" style={{ color: COLORS.inkFaint, fontFamily: FONT_SANS }}>Societies</div>
          {SEED_SOCIETIES.map((s) => {
            const totalFlats = s.blocks.reduce((sum, b) => sum + b.flats, 0);
            const isSel = s.id === societyId;
            return (
              <button key={s.id} onClick={() => selectSociety(s.id)} className="w-full text-left px-3 py-2.5 rounded-xl flex items-center gap-3" style={{ background: isSel ? "rgba(124,106,232,0.12)" : "transparent" }}>
                <IconBadge Icon={Building2} tone="purple" size={34} />
                <div>
                  <div className="text-sm font-bold" style={{ color: COLORS.ink, fontFamily: FONT_SANS }}>{s.name}</div>
                  <div className="text-xs font-semibold" style={{ color: COLORS.inkFaint, fontFamily: FONT_SANS }}>{s.city} · {totalFlats} flats</div>
                </div>
              </button>
            );
          })}
        </GlassPanel>

        <GlassPanel className="col-span-3 overflow-hidden p-2">
          <div className="text-[11px] font-bold uppercase px-2 py-2" style={{ color: COLORS.inkFaint, fontFamily: FONT_SANS }}>Blocks in {society.name}</div>
          {society.blocks.map((b) => {
            const isSel = b.id === blockId;
            const pct = Math.round((b.occupied / b.flats) * 100);
            return (
              <button key={b.id} onClick={() => setBlockId(b.id)} className="w-full text-left px-3 py-2.5 rounded-xl flex items-center gap-3" style={{ background: isSel ? "rgba(47,166,201,0.12)" : "transparent" }}>
                <IconBadge Icon={Layers} tone="blue" size={34} />
                <div className="flex-1">
                  <div className="text-sm font-bold" style={{ color: COLORS.ink, fontFamily: FONT_SANS }}>{b.name}</div>
                  <div className="text-xs font-semibold" style={{ color: COLORS.inkFaint, fontFamily: FONT_SANS }}>{b.floors} floors · {b.flats} flats</div>
                </div>
                <div className="text-xs font-bold tabular-nums" style={{ color: pct > 85 ? COLORS.green : COLORS.orange, fontFamily: FONT_SANS }}>{pct}%</div>
              </button>
            );
          })}
        </GlassPanel>

        <div className="col-span-6">
          <div className="flex items-center justify-between mb-2 px-1">
            <div className="text-[11px] font-bold uppercase" style={{ color: "#fff", fontFamily: FONT_SANS }}>{block.name} — flat occupancy</div>
            <div className="flex items-center gap-3 text-[11px] font-bold" style={{ fontFamily: FONT_SANS }}>
              <span className="flex items-center gap-1.5 text-white"><span className="w-2.5 h-2.5 rounded-full inline-block" style={{ background: COLORS.green }} /> Occupied</span>
              <span className="flex items-center gap-1.5 text-white/80"><span className="w-2.5 h-2.5 rounded-full inline-block" style={{ background: "rgba(255,255,255,0.3)" }} /> Vacant</span>
            </div>
          </div>
          <GlassPanel className="p-4">
            <div className="grid grid-cols-8 gap-2">
              {flatCells.map((occupied, i) => (
                <div
                  key={i}
                  title={occupied ? "Occupied" : "Vacant"}
                  className="aspect-square rounded-lg flex items-center justify-center transition-transform duration-150 hover:scale-110 cursor-default opacity-0"
                  style={{ background: occupied ? "#D8F5E3" : COLORS.hairline, animation: `riseIn 0.3s ease-out ${i * 0.01}s forwards` }}
                >
                  <MapPin size={11} color={occupied ? COLORS.green : COLORS.inkFaint} />
                </div>
              ))}
            </div>
          </GlassPanel>
          <div className="flex items-center gap-4 mt-3 px-1 text-xs font-bold text-white">
            <span>{block.occupied} occupied</span><span>·</span><span>{block.flats - block.occupied} vacant</span><span>·</span><span>{block.flats} total</span>
          </div>
        </div>
      </div>
    </div>
  );
}
