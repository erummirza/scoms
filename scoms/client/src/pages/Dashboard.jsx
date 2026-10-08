import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ShoppingCart, Truck, Warehouse, BarChart3, LogOut, ArrowUpRight, Users, Boxes, Globe2 } from "lucide-react";
import { COLORS, FONT_IMPORT } from "../theme";
import Logo from "../components/Logo";
import RouteLine from "../components/RouteLine";
import api from "../api/axios";

const MODULES = [
  { key: "orders", name: "Order Management", desc: "Track orders from intake through delivery.", icon: ShoppingCart, ramp: COLORS.amber, deep: COLORS.amberDeep, path: "/orders" },
  { key: "marketplaces", name: "Manage Marketplace", desc: "Add and manage the marketplaces available for orders.", icon: Globe2, ramp: "#4C8FD0", deep: "#2E5F94", path: "/marketplaces", adminOnly: true },
  { key: "clients", name: "Client Management", desc: "View and manage all client accounts.", icon: Users, ramp: "#4ECDC4", deep: "#2C9C94", path: "/clients", adminOnly: true },
  { key: "products", name: "Product Management", desc: "View all products and add new ones.", icon: Boxes, ramp: "#C77DD2", deep: "#8E4C99", path: "/products", adminOnly: true },
  { key: "sourcing", name: "Sourcing", desc: "Manage suppliers and purchase orders.", icon: Truck, ramp: COLORS.teal, deep: COLORS.tealDeep, path: "/sourcing", adminOnly: true },
  { key: "inventory", name: "Inventory", desc: "Monitor stock across all warehouses.", icon: Warehouse, ramp: "#8C7FD8", deep: "#5B4EA8", path: "/inventory" },
  { key: "reporting", name: "Reporting", desc: "Fulfillment, turnover, and supplier metrics.", icon: BarChart3, ramp: "#D8865B", deep: "#A85A30", path: "/reporting", adminOnly: true },
];

export default function Dashboard() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [summary, setSummary] = useState(null);
  const [clientOrderCount, setClientOrderCount] = useState(null);

  useEffect(() => {
    const stored = localStorage.getItem("scoms_user");
    if (!stored) {
      navigate("/admin-login");
      return;
    }
    const parsed = JSON.parse(stored);
    setUser(parsed);

    if (parsed.role === "admin") {
      api.get("/reports/summary").then((res) => setSummary(res.data)).catch(() => {});
    } else {
      // Client: fetch their own orders so the Order Management card can show
      // how many orders this client has placed.
      api.get("/orders").then((res) => setClientOrderCount((res.data.orders || []).length)).catch(() => {});
    }
  }, [navigate]);

  function logout() {
    localStorage.removeItem("scoms_token");
    localStorage.removeItem("scoms_user");
    navigate(parsedRoleLoginPath(user));
  }

  function parsedRoleLoginPath(u) {
    return u?.role === "admin" ? "/admin-login" : "/client-login";
  }

  if (!user) return null;

  const visibleModules = MODULES.filter((m) => !m.adminOnly || user.role === "admin");

  return (
    <div style={{ minHeight: "100vh", background: COLORS.paper, fontFamily: "Inter" }}>
      <style>{FONT_IMPORT}</style>

      <div style={{
        background: COLORS.navy, color: "#F6F5F1", padding: "18px 40px",
        display: "flex", alignItems: "center", justifyContent: "space-between",
      }}>
        <Logo dark />
        <div style={{ display: "flex", alignItems: "center", gap: 18 }}>
          <span style={{ fontSize: 13, fontFamily: "IBM Plex Mono", color: "rgba(246,245,241,0.7)" }}>
            {user.name} &middot; {user.role.toUpperCase()}
          </span>
          <button onClick={logout} style={{
            display: "flex", alignItems: "center", gap: 6, background: "transparent",
            border: "1px solid rgba(246,245,241,0.3)", color: "#F6F5F1", padding: "7px 14px",
            borderRadius: 6, fontSize: 13, cursor: "pointer",
          }}>
            <LogOut size={14} /> Sign out
          </button>
        </div>
      </div>

      <div style={{ padding: "40px 40px 8px" }}>
        <div style={{ fontFamily: "Oswald", fontSize: 26, fontWeight: 600, color: COLORS.ink, marginBottom: 4 }}>
          {user.role === "admin" ? "Operations overview" : "Your supply chain"}
        </div>
        <p style={{ color: COLORS.inkMuted, fontSize: 14, marginBottom: 24 }}>
          Supplier &rarr; warehouse &rarr; client, tracked in one place.
        </p>
        <div style={{ maxWidth: 420, marginBottom: 8 }}>
          <RouteLine accent={COLORS.amber} dark={false} />
        </div>
      </div>

      {summary && (
        <div style={{ padding: "8px 40px", display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: 12 }}>
          {[
            ["Total orders", summary.totalOrders],
            ["Pending orders", summary.pendingOrders],
            ["Low stock items", summary.lowStockItems],
            ["Active suppliers", summary.activeSuppliers],
          ].map(([label, value]) => (
            <div key={label} style={{ background: COLORS.paperCard, border: `1px solid ${COLORS.line}`, borderRadius: 10, padding: "14px 16px" }}>
              <div style={{ fontSize: 12.5, color: COLORS.inkMuted, marginBottom: 6 }}>{label}</div>
              <div style={{ fontFamily: "Oswald", fontSize: 22, fontWeight: 600, color: COLORS.ink }}>{value}</div>
            </div>
          ))}
        </div>
      )}

      <div style={{
        padding: "24px 40px 48px", display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: 18,
      }}>
        {visibleModules.map((m) => {
          const Icon = m.icon;
          const showOrderBadge = m.key === "orders" && user.role === "client" && clientOrderCount !== null;
          return (
            <div key={m.key} style={{
              background: COLORS.paperCard, border: `1px solid ${COLORS.line}`, borderRadius: 12,
              padding: "22px 20px", display: "flex", flexDirection: "column", gap: 14, position: "relative",
            }}>
              <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between" }}>
                <div style={{
                  width: 40, height: 40, borderRadius: 8, background: m.ramp + "22",
                  display: "flex", alignItems: "center", justifyContent: "center",
                }}>
                  <Icon size={20} color={m.deep} />
                </div>

                {showOrderBadge && (
                  <div
                    title="Orders you've placed"
                    style={{
                      width: 34, height: 34, borderRadius: "50%",
                      background: COLORS.navy, color: "#F6F5F1",
                      display: "flex", alignItems: "center", justifyContent: "center",
                      fontFamily: "Oswald", fontSize: 14, fontWeight: 600,
                    }}
                  >
                    {clientOrderCount}
                  </div>
                )}
              </div>

              <div>
                <div style={{ fontFamily: "Oswald", fontSize: 17, fontWeight: 600, color: COLORS.ink, marginBottom: 4 }}>
                  {m.name}
                </div>
                <div style={{ fontSize: 13, color: COLORS.inkMuted, lineHeight: 1.5 }}>{m.desc}</div>
                {showOrderBadge && (
                  <div style={{ fontSize: 12, color: COLORS.amberDeep, marginTop: 6, fontWeight: 500 }}>
                    {clientOrderCount} order{clientOrderCount === 1 ? "" : "s"} placed so far
                  </div>
                )}
              </div>

              <div style={{ marginTop: "auto", display: "flex", alignItems: "center", gap: 10 }}>
                <button
                  onClick={() => navigate(m.path)}
                  aria-label={`Open ${m.name}`}
                  style={{
                    width: 38, height: 38, borderRadius: "50%", flexShrink: 0,
                    background: m.deep, border: "none", color: "#fff",
                    display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer",
                  }}
                >
                  <ArrowUpRight size={17} />
                </button>
                <button
                  onClick={() => navigate(m.path)}
                  style={{
                    flex: 1, background: "transparent", border: `1px solid ${COLORS.line}`, borderRadius: 7,
                    padding: "9px 12px", fontSize: 13, color: COLORS.ink, cursor: "pointer",
                  }}
                >
                  View Details
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
