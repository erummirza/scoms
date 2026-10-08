import React from "react";
import { COLORS } from "../theme";

export default function RouteLine({ accent, dark }) {
  const nodeColor = dark ? "#EDEDE7" : COLORS.ink;
  const dim = dark ? "rgba(237,237,231,0.35)" : COLORS.line;
  return (
    <svg viewBox="0 0 340 60" width="100%" height="60" style={{ display: "block" }}>
      <line x1="30" y1="30" x2="310" y2="30" stroke={dim} strokeWidth="2" strokeDasharray="1 8" strokeLinecap="round" />
      <circle cx="30" cy="30" r="5" fill={accent} />
      <circle cx="170" cy="30" r="5" fill={accent} />
      <circle cx="310" cy="30" r="5" fill={accent} />
      <text x="30" y="50" textAnchor="middle" fontFamily="Inter" fontSize="10" fill={nodeColor} letterSpacing="0.5">SUPPLIER</text>
      <text x="170" y="50" textAnchor="middle" fontFamily="Inter" fontSize="10" fill={nodeColor} letterSpacing="0.5">WAREHOUSE</text>
      <text x="310" y="50" textAnchor="middle" fontFamily="Inter" fontSize="10" fill={nodeColor} letterSpacing="0.5">CLIENT</text>
      <circle r="3.5" fill={accent}>
        <animateMotion dur="3.5s" repeatCount="indefinite" path="M30,30 L310,30" />
      </circle>
    </svg>
  );
}
