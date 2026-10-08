import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Mail, Lock, ArrowRight, User, Building2 } from "lucide-react";
import { COLORS, FONT_IMPORT } from "../theme";
import Logo from "../components/Logo";
import RouteLine from "../components/RouteLine";
import api from "../api/axios";

export default function LoginPage({ role }) {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const isAdmin = role === "admin";
  const accent = isAdmin ? COLORS.amber : COLORS.teal;
  const accentDeep = isAdmin ? COLORS.amberDeep : COLORS.tealDeep;

  async function submit(e) {
    e.preventDefault();
    if (!email || !password) {
      setError("Enter your email and password to continue.");
      return;
    }
    setError("");
    setLoading(true);
    try {
      const endpoint = isAdmin ? "/auth/admin-login" : "/auth/client-login";
      const { data } = await api.post(endpoint, { email, password });
      localStorage.setItem("scoms_token", data.token);
      localStorage.setItem("scoms_user", JSON.stringify(data.user));
      navigate("/dashboard");
    } catch (err) {
      setError(err.response?.data?.message || "Couldn't sign in. Try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{ minHeight: "100vh", display: "flex", fontFamily: "Inter", background: COLORS.paper }}>
      <style>{FONT_IMPORT}</style>

      <div
        style={{
          flex: "0 0 42%",
          background: `linear-gradient(180deg, ${COLORS.navy} 0%, ${COLORS.navyDeep} 100%)`,
          padding: "56px 48px",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          color: "#F6F5F1",
        }}
      >
        <Logo dark />
        <div>
          <div style={{ fontFamily: "Oswald", fontWeight: 600, fontSize: 34, lineHeight: 1.15, letterSpacing: 0.5, marginBottom: 14 }}>
            SUPPLY CHAIN &<br />ORDER MANAGEMENT<br />SYSTEM
          </div>
          <p style={{ color: "rgba(246,245,241,0.65)", fontSize: 14, lineHeight: 1.6, maxWidth: 320, marginBottom: 28 }}>
            One route from supplier to shelf to customer &mdash; sourcing, inventory,
            and order fulfillment tracked end to end.
          </p>
          <RouteLine accent={accent} dark />
        </div>
        <div style={{ fontSize: 12, color: "rgba(246,245,241,0.4)", fontFamily: "IBM Plex Mono" }}>
          {isAdmin ? "ADMIN CONSOLE" : "CLIENT PORTAL"} &middot; v1.0
        </div>
      </div>

      <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", padding: 32 }}>
        <div style={{ width: 360 }}>
          <div style={{ display: "flex", gap: 6, marginBottom: 32 }}>
            <a href="/admin-login" style={{
              flex: 1, padding: "9px 0", fontSize: 13, fontWeight: 500, borderRadius: 6,
              textAlign: "center", textDecoration: "none",
              border: `1px solid ${isAdmin ? COLORS.amberDeep : COLORS.line}`,
              background: isAdmin ? COLORS.amber : "transparent",
              color: isAdmin ? "#3A2705" : COLORS.inkMuted,
            }}>Admin</a>
            <a href="/client-login" style={{
              flex: 1, padding: "9px 0", fontSize: 13, fontWeight: 500, borderRadius: 6,
              textAlign: "center", textDecoration: "none",
              border: `1px solid ${!isAdmin ? COLORS.tealDeep : COLORS.line}`,
              background: !isAdmin ? COLORS.teal : "transparent",
              color: !isAdmin ? "#04211D" : COLORS.inkMuted,
            }}>Client</a>
          </div>

          <h1 style={{ fontFamily: "Oswald", fontSize: 24, fontWeight: 600, color: COLORS.ink, marginBottom: 6 }}>
            {isAdmin ? "Admin sign in" : "Client sign in"}
          </h1>
          <p style={{ fontSize: 13.5, color: COLORS.inkMuted, marginBottom: 28 }}>
            {isAdmin ? "Manage sourcing, inventory, and fulfillment." : "Track your orders and shipments."}
          </p>

          <form onSubmit={submit}>
            <label style={{ fontSize: 12.5, fontWeight: 500, color: COLORS.ink, display: "block", marginBottom: 6 }}>Email</label>
            <div style={{ position: "relative", marginBottom: 18 }}>
              <Mail size={16} color={COLORS.inkMuted} style={{ position: "absolute", left: 12, top: 12 }} />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder={isAdmin ? "name@company.com" : "name@client.com"}
                style={{
                  width: "100%", padding: "10px 12px 10px 36px", borderRadius: 7,
                  border: `1px solid ${COLORS.line}`, fontSize: 14, boxSizing: "border-box", fontFamily: "Inter",
                }}
              />
            </div>

            <label style={{ fontSize: 12.5, fontWeight: 500, color: COLORS.ink, display: "block", marginBottom: 6 }}>Password</label>
            <div style={{ position: "relative", marginBottom: 8 }}>
              <Lock size={16} color={COLORS.inkMuted} style={{ position: "absolute", left: 12, top: 12 }} />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                style={{
                  width: "100%", padding: "10px 12px 10px 36px", borderRadius: 7,
                  border: `1px solid ${COLORS.line}`, fontSize: 14, boxSizing: "border-box", fontFamily: "Inter",
                }}
              />
            </div>

            {error && <p style={{ color: "#B3261E", fontSize: 12.5, margin: "8px 0 0" }}>{error}</p>}

            <div style={{ display: "flex", justifyContent: "flex-end", margin: "10px 0 22px" }}>
              <a href="#" style={{ fontSize: 12.5, color: accentDeep, textDecoration: "none" }}>Forgot password?</a>
            </div>

            <button
              type="submit"
              disabled={loading}
              style={{
                width: "100%", padding: "12px 0", borderRadius: 7, border: "none", cursor: "pointer",
                background: COLORS.navy, color: "#F6F5F1", fontSize: 14, fontWeight: 500,
                display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
                opacity: loading ? 0.7 : 1,
              }}
            >
              {loading ? "Signing in..." : "Sign in"} <ArrowRight size={16} />
            </button>
          </form>

          <div style={{ marginTop: 24, paddingTop: 18, borderTop: `1px solid ${COLORS.line}`, fontSize: 12, color: COLORS.inkMuted, display: "flex", alignItems: "center", gap: 6 }}>
            {isAdmin ? <User size={13} /> : <Building2 size={13} />}
            {isAdmin ? "Internal staff access only." : "Partner and customer access."}
          </div>
        </div>
      </div>
    </div>
  );
}
