import React, { useState, useEffect, useMemo, useRef } from "react";
import Sidebar from "./components/Sidebar";
import Topbar from "./components/Topbar";
import Dashboard from "./pages/Dashboard";
import Alerts from "./pages/Alerts";
import Residents from "./pages/Residents";
import Society from "./pages/Society";
import Login from "./pages/Login";
import { COLORS, FONT_SANS } from "./theme";
import { SEED_ALERTS, SEED_APPROVALS, SEED_DIRECTORY } from "./mockData";

const SEARCH_PLACEHOLDER = {
  dashboard: "Search residents, flats, incidents…",
  alerts: "Search incidents…",
  residents: "Search residents…",
  society: "Search societies, blocks, flats…",
};

export default function App() {
  const [user, setUser] = useState(() => {
    const cached = localStorage.getItem("cc_role") || sessionStorage.getItem("cc_role");
    return cached ? { username: "Naveena", role: cached } : null;
  });
  const [active, setActive] = useState("dashboard");
  const [alerts, setAlerts] = useState(SEED_ALERTS);
  const [approvals, setApprovals] = useState(SEED_APPROVALS);
  const [selectedAlertId, setSelectedAlertId] = useState(null);
  const [toast, setToast] = useState(null);
  const [clock, setClock] = useState(new Date());
  const toastTimer = useRef(null);

  useEffect(() => {
    const t = setInterval(() => {
      setClock(new Date());
      setAlerts((prev) => prev.map((a) => ({ ...a, createdAgoSec: a.createdAgoSec + 1 })));
    }, 1000);
    return () => clearInterval(t);
  }, []);

  const liveCount = useMemo(() => alerts.filter((a) => a.status === "TRIGGERED").length, [alerts]);

  function showToast(msg, color) {
    setToast({ msg, color });
    clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToast(null), 2400);
  }

  function resolveAlert(id) {
    setAlerts((prev) => prev.map((a) => (a.id === id ? { ...a, status: "RESOLVED" } : a)));
    showToast("Incident marked resolved", COLORS.green);
  }

  function addUpdate(alertId, message) {
    setAlerts((prev) =>
      prev.map((a) => (a.id === alertId ? { ...a, updates: [...a.updates, { id: Date.now(), author: "Naveena (Admin)", type: "TEXT", message, agoSec: 0 }] } : a))
    );
  }

  function decideApproval(id, decision) {
    setApprovals((prev) => prev.filter((a) => a.id !== id));
    showToast(decision === "APPROVED" ? "Resident approved" : "Resident request rejected", decision === "APPROVED" ? COLORS.green : COLORS.red);
  }

  function triggerDemoSOS() {
    const id = Math.floor(Math.random() * 9000) + 1000;
    const newAlert = {
      id, resident: "Demo Resident", flat: "E-410", block: "Tower E", category: "Fall / Medical",
      status: "TRIGGERED", address: "Tower E, Green Valley", lat: 18.5227, lng: 73.853, createdAgoSec: 0,
      updates: [{ id: Date.now(), author: "Demo Resident", type: "TEXT", message: "Triggered via one-tap SOS button.", agoSec: 0 }],
    };
    setAlerts((prev) => [newAlert, ...prev]);
    setSelectedAlertId(id);
    showToast("New SOS received", COLORS.red);
  }

  function goTo(page, alertId) {
    setActive(page);
    if (alertId) setSelectedAlertId(alertId);
  }

  function logout() {
    localStorage.removeItem("cc_access"); localStorage.removeItem("cc_refresh"); localStorage.removeItem("cc_role");
    sessionStorage.removeItem("cc_access"); sessionStorage.removeItem("cc_refresh"); sessionStorage.removeItem("cc_role");
    setUser(null);
  }

  if (!user) return <Login onLogin={setUser} />;

  return (
    <div
      className="relative w-full h-full flex overflow-hidden"
      style={{ fontFamily: FONT_SANS, minHeight: 640, background: `linear-gradient(135deg, ${COLORS.gradientA} 0%, ${COLORS.gradientB} 38%, ${COLORS.gradientC} 70%, ${COLORS.gradientD} 100%)` }}
    >
      <style>{`
        @keyframes riseIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes toastIn { from { opacity: 0; transform: translate(-50%, 8px); } to { opacity: 1; transform: translate(-50%, 0); } }
        ::-webkit-scrollbar { width: 8px; height: 8px; }
        ::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.25); border-radius: 8px; }
        ::-webkit-scrollbar-track { background: transparent; }
        input::placeholder { color: rgba(255,255,255,0.6); }
      `}</style>
      <Sidebar active={active} setActive={setActive} liveCount={liveCount} pendingCount={approvals.length} user={user} onLogout={logout} />

      <div className="flex-1 flex flex-col min-w-0 relative z-10">
        <Topbar liveClock={clock.toLocaleTimeString()} searchPlaceholder={SEARCH_PLACEHOLDER[active]} notifCount={liveCount} />

        <div key={active} className="flex-1 overflow-y-auto px-8 pb-8" style={{ animation: "riseIn 0.35s ease-out forwards" }}>
          {active === "dashboard" && <Dashboard alerts={alerts} approvals={approvals} goTo={goTo} onTriggerDemo={triggerDemoSOS} />}
          {active === "alerts" && (
            <Alerts alerts={alerts} onResolve={resolveAlert} onAddUpdate={addUpdate} selectedId={selectedAlertId} setSelectedId={setSelectedAlertId} />
          )}
          {active === "residents" && <Residents approvals={approvals} directory={SEED_DIRECTORY} onDecision={decideApproval} />}
          {active === "society" && <Society />}
        </div>
      </div>

      {toast && (
        <div
          className="fixed bottom-6 left-1/2 px-4 py-2.5 rounded-2xl text-xs font-bold shadow-2xl z-50"
          style={{ background: "rgba(10,14,28,0.85)", color: "#fff", borderLeft: `4px solid ${toast.color}`, fontFamily: FONT_SANS, animation: "toastIn 0.25s ease-out forwards" }}
        >
          {toast.msg}
        </div>
      )}
    </div>
  );
}