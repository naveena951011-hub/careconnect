import React, { useState } from "react";
import { ShieldPlus, Mail, Lock, Eye, EyeOff, ArrowRight, Loader2 } from "lucide-react";
import { COLORS, FONT_SANS } from "../theme";

/* Same decorative skyline used in the sidebar — reused here at a larger
   scale so the login screen feels like part of the same product, not a
   bolted-on auth page. */
function SkylineArt() {
  return (
    <svg viewBox="0 0 400 420" width="100%" height="100%" preserveAspectRatio="xMidYMax slice" className="block">
      <defs>
        <radialGradient id="sun2" cx="35%" cy="55%" r="55%">
          <stop offset="0%" stopColor="#FFC98B" />
          <stop offset="100%" stopColor="#F2609C" />
        </radialGradient>
        <linearGradient id="hillA" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#6E57D8" />
          <stop offset="100%" stopColor="#2FA6C9" />
        </linearGradient>
        <linearGradient id="hillB" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#2FA6C9" />
          <stop offset="100%" stopColor="#2FCBA6" />
        </linearGradient>
      </defs>
      {[...Array(26)].map((_, i) => (
        <circle key={i} cx={(i * 53) % 400} cy={(i * 71) % 240} r={i % 4 === 0 ? 1.8 : 1} fill="#FFFFFF" opacity={0.55} />
      ))}
      <circle cx="150" cy="220" r="80" fill="url(#sun2)" opacity="0.9" />
      <rect x="260" y="120" width="24" height="160" fill="#0A0E1C" opacity="0.85" />
      <rect x="296" y="150" width="18" height="130" fill="#0A0E1C" opacity="0.85" />
      <rect x="322" y="90" width="28" height="190" fill="#0A0E1C" opacity="0.85" />
      <path d="M0 270 Q100 220 200 270 T400 265 V420 H0 Z" fill="url(#hillA)" opacity="0.9" />
      <path d="M0 320 Q120 270 240 320 T400 310 V420 H0 Z" fill="url(#hillB)" opacity="0.9" />
    </svg>
  );
}

/* Set VITE_API_URL in a .env file to point this at your real backend.
   Falls back to localhost:8000, which is Django's default dev server. */
const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:8000";

export default function Login({ onLogin }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [remember, setRemember] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    if (!username || !password) {
      setError("Enter both username and password.");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/api/auth/login/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.detail || Object.values(data)[0] || "Login failed. Check your credentials.");
        setLoading(false);
        return;
      }
      const storage = remember ? localStorage : sessionStorage;
      storage.setItem("cc_access", data.access);
      storage.setItem("cc_refresh", data.refresh);
      storage.setItem("cc_role", data.role || "ADMIN");
      onLogin({ username, role: data.role || "ADMIN" });
    } catch (err) {
      setError("Couldn't reach the backend. Is the Django server running on :8000?");
    } finally {
      setLoading(false);
    }
  }

  function continueWithDemoData() {
    onLogin({ username: "naveena77", role: "ADMIN", demo: true });
  }

  return (
    <div
      className="w-full h-full flex items-center justify-center p-6"
      style={{ minHeight: 640, background: `linear-gradient(135deg, ${COLORS.gradientA} 0%, ${COLORS.gradientB} 38%, ${COLORS.gradientC} 70%, ${COLORS.gradientD} 100%)`, fontFamily: FONT_SANS }}
    >
      <div className="w-full max-w-4xl rounded-3xl overflow-hidden flex shadow-2xl" style={{ minHeight: 560 }}>
        {/* left — brand / illustration panel */}
        <div className="hidden md:flex flex-col justify-between w-[42%] relative" style={{ background: COLORS.sidebarBg }}>
          <div className="p-8 relative z-10">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-xl flex items-center justify-center" style={{ background: `linear-gradient(135deg, ${COLORS.teal}, ${COLORS.blue})` }}>
                <ShieldPlus size={22} color="#fff" strokeWidth={2.4} />
              </div>
              <div>
                <div className="text-lg font-extrabold text-white">CareConnect</div>
                <div className="text-[10px] font-bold uppercase tracking-widest" style={{ color: COLORS.teal, letterSpacing: "0.12em" }}>Community Response</div>
              </div>
            </div>
            <p className="text-sm mt-8 leading-relaxed" style={{ color: "#C7CCE6" }}>
              One tap, and help is already on the way — guardians, security,
              and neighbours notified the instant it matters.
            </p>
          </div>
          <div className="absolute inset-0">
            <SkylineArt />
          </div>
        </div>

        {/* right — form */}
        <div className="flex-1 bg-white p-8 md:p-10 flex flex-col justify-center">
          <div className="mb-7">
            <h1 className="text-2xl font-extrabold" style={{ color: COLORS.ink }}>Welcome back</h1>
            <p className="text-sm mt-1.5 font-semibold" style={{ color: COLORS.inkFaint }}>Sign in to the CareConnect dispatch console.</p>
          </div>

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div>
              <label className="text-xs font-bold uppercase tracking-wide" style={{ color: COLORS.inkMuted }}>Username or email</label>
              <div className="flex items-center gap-2.5 mt-1.5 px-3.5 py-3 rounded-xl" style={{ background: COLORS.hairline }}>
                <Mail size={16} color={COLORS.inkFaint} />
                <input
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="naveena77"
                  className="bg-transparent outline-none text-sm w-full font-medium"
                  style={{ color: COLORS.ink }}
                  autoComplete="username"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold uppercase tracking-wide" style={{ color: COLORS.inkMuted }}>Password</label>
                <a href="#" className="text-xs font-bold" style={{ color: COLORS.purple }}>Forgot?</a>
              </div>
              <div className="flex items-center gap-2.5 mt-1.5 px-3.5 py-3 rounded-xl" style={{ background: COLORS.hairline }}>
                <Lock size={16} color={COLORS.inkFaint} />
                <input
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  className="bg-transparent outline-none text-sm w-full font-medium"
                  style={{ color: COLORS.ink }}
                  autoComplete="current-password"
                />
                <button type="button" onClick={() => setShowPassword((s) => !s)}>
                  {showPassword ? <EyeOff size={16} color={COLORS.inkFaint} /> : <Eye size={16} color={COLORS.inkFaint} />}
                </button>
              </div>
            </div>

            <label className="flex items-center gap-2 text-xs font-semibold mt-1" style={{ color: COLORS.inkMuted }}>
              <input type="checkbox" checked={remember} onChange={(e) => setRemember(e.target.checked)} className="rounded" />
              Keep me signed in on this device
            </label>

            {error && (
              <div className="text-xs font-semibold px-3 py-2.5 rounded-lg" style={{ background: "#FBD8E4", color: "#D6336C" }}>
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="mt-1 flex items-center justify-center gap-2 text-sm font-bold text-white py-3.5 rounded-xl transition-transform duration-150 hover:scale-[1.01] disabled:opacity-70"
              style={{ background: `linear-gradient(90deg, ${COLORS.teal}, ${COLORS.blue})` }}
            >
              {loading ? <Loader2 size={16} className="animate-spin" /> : <>Sign in <ArrowRight size={15} /></>}
            </button>

            <button
              type="button"
              onClick={continueWithDemoData}
              className="text-xs font-bold text-center mt-1"
              style={{ color: COLORS.inkFaint }}
            >
              No backend running? Continue with demo data →
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}