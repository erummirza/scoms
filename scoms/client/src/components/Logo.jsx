import React from "react";
import { COLORS } from "../theme";

export default function Logo({ dark }) {
  const fg = dark ? "#F6F5F1" : COLORS.navy;
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
      <svg width="34" height="34" viewBox="0 0 34 34">
        <polygon points="17,2 31,10 31,24 17,32 3,24 3,10" fill="none" stroke={COLORS.amber} strokeWidth="2" />
        <circle cx="17" cy="10" r="2.3" fill={COLORS.amber} />
        <circle cx="9" cy="22" r="2.3" fill={COLORS.teal} />
        <circle cx="25" cy="22" r="2.3" fill={COLORS.teal} />
        <line x1="17" y1="10" x2="9" y2="22" stroke={fg} strokeWidth="1.4" />
        <line x1="17" y1="10" x2="25" y2="22" stroke={fg} strokeWidth="1.4" />
        <line x1="9" y1="22" x2="25" y2="22" stroke={fg} strokeWidth="1.4" />
      </svg>
      <span style={{ fontFamily: "Oswald", fontWeight: 600, fontSize: 20, letterSpacing: 1, color: fg }}>
        SCOMS
      </span>
    </div>
  );
}
