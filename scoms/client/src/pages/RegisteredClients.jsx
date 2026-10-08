import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Mail, Building2, User, UserPlus } from "lucide-react";
import { COLORS, FONT_IMPORT } from "../theme";
import Logo from "../components/Logo";
import api from "../api/axios";

export default function RegisteredClients() {
  const navigate = useNavigate();
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [company, setCompany] = useState("");
  const [password, setPassword] = useState("");
  const [formError, setFormError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [tempPasswordNotice, setTempPasswordNotice] = useState(null);

  useEffect(() => {
    loadClients();
  }, []);

  function loadClients() {
    setLoading(true);
    api
      .get("/users/clients")
      .then((res) => setClients(res.data.clients || []))
      .catch((err) => setLoadError(err.response?.data?.message || "Couldn't load registered clients."))
      .finally(() => setLoading(false));
  }

  async function submitNewClient(e) {
    e.preventDefault();
    setFormError("");
    setTempPasswordNotice(null);

    if (!name.trim()) {
      setFormError("Client name is required.");
      return;
    }
    if (!email.trim()) {
      setFormError("Email is required.");
      return;
    }

    setSubmitting(true);
    try {
      const { data } = await api.post("/users/clients", {
        name: name.trim(),
        email: email.trim(),
        company: company.trim(),
        password: password.trim() || undefined,
      });

      setClients((prev) => [
        { ...data.client, _id: data.client.id },
        ...prev,
      ]);

      if (data.temporaryPassword) {
        setTempPasswordNotice({ email: data.client.email, password: data.temporaryPassword });
      }

      setName("");
      setEmail("");
      setCompany("");
      setPassword("");
    } catch (err) {
      setFormError(err.response?.data?.message || "Couldn't add this client. Try again.");
    } finally {
      setSubmitting(false);
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

      <div style={{ padding: "36px 40px 60px", display: "grid", gridTemplateColumns: "minmax(0, 380px) 1fr", gap: 32 }}>
        <div>
          <div style={{ fontFamily: "Oswald", fontSize: 22, fontWeight: 600, color: COLORS.ink, marginBottom: 4 }}>
            Add new client
          </div>
          <p style={{ color: COLORS.inkMuted, fontSize: 13, marginBottom: 18 }}>
            Email is required so the client can sign in later.
          </p>

          <form onSubmit={submitNewClient} style={{ background: COLORS.paperCard, border: `1px solid ${COLORS.line}`, borderRadius: 12, padding: 22 }}>
            <label style={labelStyle}>Client name</label>
            <input value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Acme Retail" style={inputStyle} />

            <label style={{ ...labelStyle, marginTop: 14 }}>
              Email <span style={{ color: "#B3261E" }}>*</span>
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="client@company.com"
              style={inputStyle}
            />

            <label style={{ ...labelStyle, marginTop: 14 }}>Company / Details (optional)</label>
            <input value={company} onChange={(e) => setCompany(e.target.value)} placeholder="Company name or notes" style={inputStyle} />

            <label style={{ ...labelStyle, marginTop: 14 }}>Password (optional)</label>
            <input
              type="text"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Leave blank to auto-generate"
              style={inputStyle}
            />

            {formError && <p style={{ color: "#B3261E", fontSize: 12.5, marginTop: 12 }}>{formError}</p>}

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
              <UserPlus size={16} /> {submitting ? "Adding..." : "Add client"}
            </button>
          </form>

          {tempPasswordNotice && (
            <div style={{
              marginTop: 14, padding: 14, borderRadius: 10, background: COLORS.teal + "15",
              border: `1px solid ${COLORS.teal}55`, fontSize: 12.5, color: COLORS.ink,
            }}>
              Client added. Share these sign-in details:
              <div style={{ fontFamily: "IBM Plex Mono", marginTop: 6 }}>
                {tempPasswordNotice.email}<br />
                {tempPasswordNotice.password}
              </div>
            </div>
          )}
        </div>

        <div>
          <div style={{ fontFamily: "Oswald", fontSize: 24, fontWeight: 600, color: COLORS.ink, marginBottom: 4 }}>
            Registered Clients
          </div>
          <p style={{ color: COLORS.inkMuted, fontSize: 13.5, marginBottom: 20 }}>
            All client accounts registered in the system.
          </p>

          {loading && <p style={{ color: COLORS.inkMuted, fontSize: 13.5 }}>Loading...</p>}
          {loadError && <p style={{ color: "#B3261E", fontSize: 13.5 }}>{loadError}</p>}
          {!loading && !loadError && clients.length === 0 && (
            <p style={{ color: COLORS.inkMuted, fontSize: 13.5 }}>No registered clients yet.</p>
          )}

          {!loading && clients.length > 0 && (
            <div style={{ background: COLORS.paperCard, border: `1px solid ${COLORS.line}`, borderRadius: 12, overflow: "hidden" }}>
              <div style={{
                display: "grid", gridTemplateColumns: "1.2fr 1.6fr 1fr 0.8fr 0.8fr",
                padding: "12px 20px", background: COLORS.paper, borderBottom: `1px solid ${COLORS.line}`,
                fontSize: 12, fontWeight: 600, color: COLORS.inkMuted, textTransform: "uppercase", letterSpacing: 0.4,
              }}>
                <span>Name</span>
                <span>Email</span>
                <span>Company / Details</span>
                <span>Status</span>
                <span>Registered</span>
              </div>
              {clients.map((c) => (
                <div key={c._id} style={{
                  display: "grid", gridTemplateColumns: "1.2fr 1.6fr 1fr 0.8fr 0.8fr",
                  padding: "14px 20px", borderBottom: `1px solid ${COLORS.line}`,
                  fontSize: 13.5, color: COLORS.ink, alignItems: "center",
                }}>
                  <span style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <User size={14} color={COLORS.inkMuted} /> {c.name}
                  </span>
                  <span style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <Mail size={14} color={COLORS.inkMuted} /> {c.email}
                  </span>
                  <span style={{ display: "flex", alignItems: "center", gap: 8, color: COLORS.inkMuted }}>
                    {c.company ? (<><Building2 size={14} /> {c.company}</>) : "—"}
                  </span>
                  <span>
                    <span style={{
                      fontSize: 11.5, padding: "3px 8px", borderRadius: 999,
                      background: c.isActive ? COLORS.teal + "22" : "#B3261E22",
                      color: c.isActive ? COLORS.tealDeep : "#B3261E",
                    }}>
                      {c.isActive ? "Active" : "Inactive"}
                    </span>
                  </span>
                  <span style={{ color: COLORS.inkMuted, fontSize: 12.5 }}>
                    {new Date(c.createdAt).toLocaleDateString()}
                  </span>
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
