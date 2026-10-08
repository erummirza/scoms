import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Package, Plus } from "lucide-react";
import { COLORS, FONT_IMPORT } from "../theme";
import Logo from "../components/Logo";
import api from "../api/axios";

export default function ProductManagement() {
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");

  const [sku, setSku] = useState("");
  const [name, setName] = useState("");
  const [category, setCategory] = useState("");
  const [unitPrice, setUnitPrice] = useState("");
  const [stockQty, setStockQty] = useState("");
  const [reorderPoint, setReorderPoint] = useState("");
  const [warehouse, setWarehouse] = useState("Main");
  const [formError, setFormError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    loadProducts();
  }, []);

  function loadProducts() {
    setLoading(true);
    api
      .get("/products")
      .then((res) => setProducts(res.data.products || []))
      .catch((err) => setLoadError(err.response?.data?.message || "Couldn't load products."))
      .finally(() => setLoading(false));
  }

  async function submitNewProduct(e) {
    e.preventDefault();
    setFormError("");

    if (!sku.trim()) return setFormError("SKU is required.");
    if (!name.trim()) return setFormError("Product name is required.");
    if (!unitPrice || Number(unitPrice) < 0) return setFormError("Enter a valid unit price.");

    setSubmitting(true);
    try {
      const { data } = await api.post("/products", {
        sku: sku.trim(),
        name: name.trim(),
        category: category.trim(),
        unitPrice: Number(unitPrice),
        stockQty: stockQty ? Number(stockQty) : 0,
        reorderPoint: reorderPoint ? Number(reorderPoint) : 10,
        warehouse: warehouse.trim() || "Main",
      });

      setProducts((prev) => [data.product, ...prev]);
      setSku("");
      setName("");
      setCategory("");
      setUnitPrice("");
      setStockQty("");
      setReorderPoint("");
      setWarehouse("Main");
    } catch (err) {
      setFormError(err.response?.data?.message || "Couldn't add this product. Try again.");
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
            Add new product
          </div>
          <p style={{ color: COLORS.inkMuted, fontSize: 13, marginBottom: 18 }}>
            SKU, name, and unit price are required.
          </p>

          <form onSubmit={submitNewProduct} style={{ background: COLORS.paperCard, border: `1px solid ${COLORS.line}`, borderRadius: 12, padding: 22 }}>
            <label style={labelStyle}>
              SKU <span style={{ color: "#B3261E" }}>*</span>
            </label>
            <input value={sku} onChange={(e) => setSku(e.target.value)} placeholder="e.g. SKU-1003" style={inputStyle} />

            <label style={{ ...labelStyle, marginTop: 14 }}>
              Product name <span style={{ color: "#B3261E" }}>*</span>
            </label>
            <input value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Steel Bracket" style={inputStyle} />

            <label style={{ ...labelStyle, marginTop: 14 }}>Category</label>
            <input value={category} onChange={(e) => setCategory(e.target.value)} placeholder="e.g. Hardware" style={inputStyle} />

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginTop: 14 }}>
              <div>
                <label style={labelStyle}>
                  Unit price ($) <span style={{ color: "#B3261E" }}>*</span>
                </label>
                <input type="number" min="0" step="0.01" value={unitPrice} onChange={(e) => setUnitPrice(e.target.value)} placeholder="0.00" style={inputStyle} />
              </div>
              <div>
                <label style={labelStyle}>Stock quantity</label>
                <input type="number" min="0" value={stockQty} onChange={(e) => setStockQty(e.target.value)} placeholder="0" style={inputStyle} />
              </div>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginTop: 14 }}>
              <div>
                <label style={labelStyle}>Reorder point</label>
                <input type="number" min="0" value={reorderPoint} onChange={(e) => setReorderPoint(e.target.value)} placeholder="10" style={inputStyle} />
              </div>
              <div>
                <label style={labelStyle}>Warehouse</label>
                <input value={warehouse} onChange={(e) => setWarehouse(e.target.value)} placeholder="Main" style={inputStyle} />
              </div>
            </div>

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
              <Plus size={16} /> {submitting ? "Adding..." : "Add product"}
            </button>
          </form>
        </div>

        <div>
          <div style={{ fontFamily: "Oswald", fontSize: 24, fontWeight: 600, color: COLORS.ink, marginBottom: 4 }}>
            Products
          </div>
          <p style={{ color: COLORS.inkMuted, fontSize: 13.5, marginBottom: 20 }}>
            All products currently in the system.
          </p>

          {loading && <p style={{ color: COLORS.inkMuted, fontSize: 13.5 }}>Loading...</p>}
          {loadError && <p style={{ color: "#B3261E", fontSize: 13.5 }}>{loadError}</p>}
          {!loading && !loadError && products.length === 0 && (
            <p style={{ color: COLORS.inkMuted, fontSize: 13.5 }}>No products yet.</p>
          )}

          {!loading && products.length > 0 && (
            <div style={{ background: COLORS.paperCard, border: `1px solid ${COLORS.line}`, borderRadius: 12, overflow: "hidden" }}>
              <div style={{
                display: "grid", gridTemplateColumns: "1fr 1.6fr 1fr 0.8fr 0.8fr 0.8fr 0.9fr",
                padding: "12px 20px", background: COLORS.paper, borderBottom: `1px solid ${COLORS.line}`,
                fontSize: 11.5, fontWeight: 600, color: COLORS.inkMuted, textTransform: "uppercase", letterSpacing: 0.4,
              }}>
                <span>SKU</span>
                <span>Name</span>
                <span>Category</span>
                <span>Price</span>
                <span>Stock</span>
                <span>Reorder At</span>
                <span>Warehouse</span>
              </div>
              {products.map((p) => {
                const lowStock = p.stockQty <= p.reorderPoint;
                return (
                  <div key={p._id} style={{
                    display: "grid", gridTemplateColumns: "1fr 1.6fr 1fr 0.8fr 0.8fr 0.8fr 0.9fr",
                    padding: "13px 20px", borderBottom: `1px solid ${COLORS.line}`,
                    fontSize: 13, color: COLORS.ink, alignItems: "center",
                  }}>
                    <span style={{ fontFamily: "IBM Plex Mono", fontSize: 12, color: COLORS.inkMuted }}>{p.sku}</span>
                    <span style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <Package size={14} color={COLORS.amberDeep} /> {p.name}
                    </span>
                    <span style={{ color: COLORS.inkMuted }}>{p.category || "—"}</span>
                    <span>${p.unitPrice.toFixed(2)}</span>
                    <span style={{ color: lowStock ? "#B3261E" : COLORS.ink, fontWeight: lowStock ? 600 : 400 }}>
                      {p.stockQty}
                    </span>
                    <span style={{ color: COLORS.inkMuted }}>{p.reorderPoint}</span>
                    <span style={{ color: COLORS.inkMuted }}>{p.warehouse}</span>
                  </div>
                );
              })}
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
