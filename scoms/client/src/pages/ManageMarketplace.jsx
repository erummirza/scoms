import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Globe2, Plus, Trash2 } from "lucide-react";
import { COLORS, FONT_IMPORT } from "../theme";
import Logo from "../components/Logo";
import api from "../api/axios";

export default function ManageMarketplace() {
  const navigate = useNavigate();
  const [marketplaces, setMarketplaces] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");

  const [name, setName] = useState("");
  const [formError, setFormError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    loadMarketplaces();
  }, []);

  function loadMarketplaces() {
    setLoading(true);
    api
      .get("/marketplaces")
      .then((res) => setMarketplaces(res.data.marketplaces || []))
      .catch((err) => setLoadError(err.response?.data?.message || "Couldn't load marketplaces."))
      .finally(() => setLoading(false));
  }

  async function submitNewMarketplace(e) {
    e.preventDefault();
    setFormError("");

    if (!name.trim()) {
      setFormError("Marketplace name is required.");
      return;
    }

    setSubmitting(true);
    try {
      const { data } = await api.post("/marketplaces", { name: name.trim() });
      setMarketplaces((prev) => [...prev, data.marketplace].sort((a, b) => a.name.localeCompare(b.name)));
      setName("");
    } catch (err) {
      setFormError(err.response?.data?.message || "Couldn't add this marketplace. Try again.");
    } finally {
      setSubmitting(false);
    }
  }

  async function toggleActive(m) {
    try {
      const { data } = await api.patch(`/marketplaces/${m._id}`, { isActive: !m.isActive });
      setMarketplaces((prev) => prev.map((x) => (x._id === m._id ? data.marketplace : x)));
    } catch (err) {
      setLoadError(err.response?.data?.message || "Couldn't update this marketplace.");
    }
  }

  async function removeMarketplace(m) {
    if (!window.confirm(`Remove "${m.name}"? This won't affect orders already placed with it.`)) return;
    try {
      await api.delete(`/marketplaces/${m._id}`);
      setMarketplaces((prev) => prev.filter((x) => x._id !== m._id));
    } catch (err) {
      setLoadError(err.response?.data?.message || "Couldn't remove this marketplace.");
    }
  }

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

      <div style={{ padding: "36px 40px 60px", display: "grid", gridTemplateColumns: "minmax(0, 360px) 1fr", gap: 32 }}>
        <div>
          <div style={{ fontFamily: "Oswald", fontSize: 22, fontWeight: 600, color: COLORS.ink, marginBottom: 4 }}>
            Add new marketplace
          </div>
          <p style={{ color: COLORS.inkMuted, fontSize: 13, marginBottom: 18 }}>
            This will appear as an option when placing orders.
          </p>

          <form onSubmit={submitNewMarketplace} style={{ background: COLORS.paperCard, border: `1px solid ${COLORS.line}`, borderRadius: 12, padding: 22 }}>
            <label style={labelStyle}>Marketplace name</label>
            <input value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Germany, Japan, Mexico" style={inputStyle} />

            {formError && <p style={{ color: "#B3261E", fontSize: 12.5, marginTop: 10 }}>{formError}</p>}

            <button
              type="submit"
              disabled={submitting}
              style={{
                width: "100%", marginTop: 16, padding: "11px 0", borderRadius: 7, border: "none", cursor: "pointer",
                background: COLORS.navy, color: "#F6F5F1", fontSize: 14, fontWeight: 500,
                display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
                opacity: submitting ? 0.7 : 1,
              }}
            >
              <Plus size={16} /> {submitting ? "Adding..." : "Add marketplace"}
            </button>
          </form>
        </div>

        <div>
          <div style={{ fontFamily: "Oswald", fontSize: 24, fontWeight: 600, color: COLORS.ink, marginBottom: 4 }}>
            Marketplaces
          </div>
          <p style={{ color: COLORS.inkMuted, fontSize: 13.5, marginBottom: 20 }}>
            Inactive marketplaces won't appear as options when placing new orders.
          </p>

          {loading && <p style={{ color: COLORS.inkMuted, fontSize: 13.5 }}>Loading...</p>}
          {loadError && <p style={{ color: "#B3261E", fontSize: 13.5 }}>{loadError}</p>}
          {!loading && !loadError && marketplaces.length === 0 && (
            <p style={{ color: COLORS.inkMuted, fontSize: 13.5 }}>No marketplaces added yet.</p>
          )}

          {!loading && marketplaces.length > 0 && (
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {marketplaces.map((m) => (
                <div key={m._id} style={{
                  display: "flex", alignItems: "center", justifyContent: "space-between",
                  background: COLORS.paperCard, border: `1px solid ${COLORS.line}`, borderRadius: 10,
                  padding: "14px 18px",
                }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <div style={{
                      width: 34, height: 34, borderRadius: 8, background: COLORS.amber + "22",
                      display: "flex", alignItems: "center", justifyContent: "center",
                    }}>
                      <Globe2 size={16} color={COLORS.amberDeep} />
                    </div>
                    <span style={{ fontFamily: "Oswald", fontSize: 15, fontWeight: 600, color: COLORS.ink }}>
                      {m.name}
                    </span>
                    <span style={{
                      fontSize: 11.5, padding: "3px 8px", borderRadius: 999,
                      background: m.isActive ? COLORS.teal + "22" : "#B3261E22",
                      color: m.isActive ? COLORS.tealDeep : "#B3261E",
                    }}>
                      {m.isActive ? "Active" : "Inactive"}
                    </span>
                  </div>

                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <button
                      onClick={() => toggleActive(m)}
                      style={{
                        fontSize: 12.5, background: "transparent", border: `1px solid ${COLORS.line}`,
                        borderRadius: 7, padding: "6px 12px", color: COLORS.ink, cursor: "pointer",
                      }}
                    >
                      {m.isActive ? "Deactivate" : "Activate"}
                    </button>
                    <button
                      onClick={() => removeMarketplace(m)}
                      style={{
                        border: `1px solid ${COLORS.line}`, background: "transparent", borderRadius: 7,
                        padding: "6px 8px", cursor: "pointer", color: "#B3261E",
                      }}
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

const labelStyle = { fontSize: 12.5, fontWeight: 500, color: COLORS.ink, display: "block", marginBottom: 6 };
const inputStyle = {
  width: "100%",
  padding: "10px 12px",
  borderRadius: 7,
  border: "1px solid " + COLORS.line,
  fontSize: 14,
  boxSizing: "border-box",
  fontFamily: "Inter",
};
