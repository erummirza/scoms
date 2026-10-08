import React from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { COLORS, FONT_IMPORT } from "../theme";
import Logo from "../components/Logo";

export default function ModulePage({ title }) {
  const navigate = useNavigate();
  return (
    <div style={{ minHeight: "100vh", background: COLORS.paper, fontFamily: "Inter" }}>
      <style>{FONT_IMPORT}</style>
      <div style={{
        background: COLORS.navy, color: "#F6F5F1", padding: "18px 40px",
        display: "flex", alignItems: "center", justifyContent: "space-between",
      }}>
        <Logo dark />
        <button onClick={() => navigate("/dashboard")} style={{
          display: "flex", alignItems: "center", gap: 6, background: "transparent",
          border: "1px solid rgba(246,245,241,0.3)", color: "#F6F5F1", padding: "7px 14px",
          borderRadius: 6, fontSize: 13, cursor: "pointer",
        }}>
          <ArrowLeft size={14} /> Back to dashboard
        </button>
      </div>
      <div style={{ padding: 40 }}>
        <div style={{ fontFamily: "Oswald", fontSize: 24, fontWeight: 600, color: COLORS.ink, marginBottom: 8 }}>{title}</div>
        <p style={{ color: COLORS.inkMuted, fontSize: 14 }}>
          Connect this page to the corresponding API route to list and manage records here.
        </p>
      </div>
    </div>
  );
}
