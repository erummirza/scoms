import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Plus, Trash2, Package, FileDown, Mail, Sheet } from "lucide-react";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import * as XLSX from "xlsx";
import { COLORS, FONT_IMPORT } from "../theme";
import Logo from "../components/Logo";
import api from "../api/axios";

// Loaded dynamically from /api/marketplaces (managed by the admin's
// "Manage Marketplace" page) instead of a fixed list.

function emptyRow() {
  return { marketplace: "", quantity: "" };
}

export default function OrderPlacement() {
  const navigate = useNavigate();
  const currentUser = JSON.parse(localStorage.getItem("scoms_user") || "null");
  const isAdmin = currentUser?.role === "admin";

  const [orderType, setOrderType] = useState("Product");
  const [productName, setProductName] = useState("");
  const [description, setDescription] = useState("");
  const [unitPrice, setUnitPrice] = useState("");
  const [orderPlacementDate, setOrderPlacementDate] = useState(
    new Date().toISOString().slice(0, 10)
  );
  const [rows, setRows] = useState([emptyRow()]);
  const [clientId, setClientId] = useState("");
  const [clients, setClients] = useState([]);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [orders, setOrders] = useState([]);
  const [availableMarketplaces, setAvailableMarketplaces] = useState([]);
  const [loadingOrders, setLoadingOrders] = useState(true);

  useEffect(() => {
    loadOrders();
    if (isAdmin) loadClients();
  }, []);

  async function loadOrders() {
    setLoadingOrders(true);
    try {
      const { data } = await api.get("/orders");
      setOrders(data.orders || []);
      setAvailableMarketplaces(data.marketplaces || []);
    } catch (e) {
      // non-blocking - the form still works even if the list fails to load
    } finally {
      setLoadingOrders(false);
    }
  }

  // Admin-only: load every client account so one can be picked for this order.
  async function loadClients() {
    try {
      const { data } = await api.get("/users/clients");
      setClients(data.clients || []);
    } catch (e) {
      // non-blocking - admin can still type the order, just without a preset list
    }
  }

  function updateRow(index, field, value) {
    setRows((prev) => prev.map((r, i) => (i === index ? { ...r, [field]: value } : r)));
  }

  function addRow() {
    setRows((prev) => [...prev, emptyRow()]);
  }

  function removeRow(index) {
    setRows((prev) => prev.filter((_, i) => i !== index));
  }

  function usedMarketplaces(excludeIndex) {
    return rows.filter((_, i) => i !== excludeIndex).map((r) => r.marketplace).filter(Boolean);
  }

  async function submit(e) {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (isAdmin && !clientId) {
      setError("Select which client this order is for.");
      return;
    }
    if (!productName.trim()) {
      setError("Enter the product name.");
      return;
    }
    if (!orderPlacementDate) {
      setError("Select the order placement date.");
      return;
    }
    const cleanRows = rows.filter((r) => r.marketplace && r.quantity);
    if (cleanRows.length === 0) {
      setError("Add at least one marketplace with a quantity.");
      return;
    }
    for (const r of cleanRows) {
      if (Number(r.quantity) < 1) {
        setError(`Enter a valid quantity for ${r.marketplace}.`);
        return;
      }
    }

    setSubmitting(true);
    try {
      await api.post("/orders", {
        orderType,
        ...(isAdmin ? { client: clientId } : {}),
        productName: productName.trim(),
        description: description.trim(),
        orderPlacementDate,
        unitPrice: unitPrice ? Number(unitPrice) : 0,
        marketplaceAllocations: cleanRows.map((r) => ({
          marketplace: r.marketplace,
          quantity: Number(r.quantity),
        })),
      });
      setSuccess("Order placed successfully.");
      setOrderType("Product");
      setProductName("");
      setDescription("");
      setUnitPrice("");
      setRows([emptyRow()]);
      if (isAdmin) setClientId("");
      loadOrders();
    } catch (err) {
      setError(err.response?.data?.message || "Couldn't place the order. Try again.");
    } finally {
      setSubmitting(false);
    }
  }

  const totalQty = rows.reduce((sum, r) => sum + (Number(r.quantity) || 0), 0);

  // Builds a PDF listing every order with full product/price/marketplace detail.
  function exportToPdf() {
    const doc = new jsPDF();

    doc.setFontSize(16);
    doc.text("SCOMS — Order Report", 14, 18);
    doc.setFontSize(10);
    doc.setTextColor(90, 98, 112);
    doc.text(`Generated ${new Date().toLocaleString()}`, 14, 25);

    const tableRows = [];
    orders.forEach((o) => {
      const marketplaceText = o.marketplaceAllocations
        .map((a) => `${a.marketplace}: ${a.quantity}`)
        .join(", ");
      tableRows.push([
        o.orderType === "Shipping" ? "L" : "P",
        o.orderNumber,
        o.productName,
        o.description || "-",
        new Date(o.orderPlacementDate).toLocaleDateString(),
        marketplaceText,
        String(o.totalQuantity),
        o.unitPrice ? `$${o.unitPrice.toFixed(2)}` : "-",
        o.totalAmount ? `$${o.totalAmount.toFixed(2)}` : "-",
      ]);
    });

    autoTable(doc, {
      startY: 32,
      head: [["Type", "Order #", "Product", "Description", "Order Date", "Marketplaces (Qty)", "Total Qty", "Unit Price", "Total Amount"]],
      body: tableRows,
      styles: { fontSize: 8, cellPadding: 3 },
      headStyles: { fillColor: [15, 31, 61] },
      columnStyles: { 3: { cellWidth: 32 }, 5: { cellWidth: 36 } },
    });

    const grandTotal = orders.reduce((sum, o) => sum + (o.totalAmount || 0), 0);
    const finalY = doc.lastAutoTable.finalY || 32;
    doc.setFontSize(11);
    doc.setTextColor(26, 29, 35);
    doc.text(`Grand total: $${grandTotal.toFixed(2)}`, 14, finalY + 10);

    doc.save(`scoms-orders-${new Date().toISOString().slice(0, 10)}.pdf`);
  }

  // Builds a real .xlsx workbook with the same order detail as the PDF export.
  function exportToExcel() {
    const rows = orders.map((o) => ({
      Type: o.orderType === "Shipping" ? "L - Shipping" : "P - Product",
      "Order #": o.orderNumber,
      Product: o.productName,
      Description: o.description || "",
      "Order Date": new Date(o.orderPlacementDate).toLocaleDateString(),
      Marketplaces: o.marketplaceAllocations.map((a) => `${a.marketplace}: ${a.quantity}`).join(", "),
      "Total Qty": o.totalQuantity,
      "Unit Price": o.unitPrice || 0,
      "Total Amount": o.totalAmount || 0,
    }));

    const worksheet = XLSX.utils.json_to_sheet(rows);
    worksheet["!cols"] = [
      { wch: 12 }, { wch: 14 }, { wch: 24 }, { wch: 30 },
      { wch: 12 }, { wch: 30 }, { wch: 10 }, { wch: 12 }, { wch: 14 },
    ];

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Orders");
    XLSX.writeFile(workbook, `scoms-orders-${new Date().toISOString().slice(0, 10)}.xlsx`);
  }

  // Opens the default mail client with a plain-text summary of all orders.
  function emailOrders() {
    const lines = orders.map((o) => {
      const marketplaceText = o.marketplaceAllocations
        .map((a) => `${a.marketplace}: ${a.quantity}`)
        .join(", ");
      return `[${o.orderType === "Shipping" ? "L" : "P"}] ${o.orderNumber} — ${o.productName} | Qty: ${o.totalQuantity} (${marketplaceText}) | Unit: $${(o.unitPrice || 0).toFixed(2)} | Total: $${(o.totalAmount || 0).toFixed(2)}`;
    });
    const body = encodeURIComponent(
      `Order summary (${orders.length} orders):\n\n${lines.join("\n")}`
    );
    const subject = encodeURIComponent("SCOMS Order Summary");
    window.location.href = `mailto:?subject=${subject}&body=${body}`;
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

      <div style={{ padding: "36px 40px 60px", display: "grid", gridTemplateColumns: "minmax(0, 480px) 1fr", gap: 32 }}>
        <div>
          <div style={{ fontFamily: "Oswald", fontSize: 24, fontWeight: 600, color: COLORS.ink, marginBottom: 4 }}>
            Place a new order
          </div>
          <p style={{ color: COLORS.inkMuted, fontSize: 13.5, marginBottom: 22 }}>
            One product, split across one or more marketplaces with its own quantity each.
          </p>

          <form onSubmit={submit} style={{ background: COLORS.paperCard, border: `1px solid ${COLORS.line}`, borderRadius: 12, padding: 24 }}>
            <label style={{ fontSize: 12.5, fontWeight: 500, color: COLORS.ink, display: "block", marginBottom: 6 }}>Order type</label>
            <select
              value={orderType}
              onChange={(e) => setOrderType(e.target.value)}
              style={{ ...inputStyle, marginBottom: 16 }}
            >
              <option value="Product">Product (P)</option>
              <option value="Shipping">Shipping / Logistics (L)</option>
            </select>

            {isAdmin && (
              <>
                <label style={{ fontSize: 12.5, fontWeight: 500, color: COLORS.ink, display: "block", marginBottom: 6 }}>Client</label>
                <select
                  value={clientId}
                  onChange={(e) => setClientId(e.target.value)}
                  style={{ ...inputStyle, marginBottom: 16 }}
                >
                  <option value="">Select client</option>
                  {clients.map((c) => (
                    <option key={c._id} value={c._id}>
                      {c.name}{c.company ? ` — ${c.company}` : ""} ({c.email})
                    </option>
                  ))}
                </select>
              </>
            )}

            <label style={{ fontSize: 12.5, fontWeight: 500, color: COLORS.ink, display: "block", marginBottom: 6 }}>Product name</label>
            <input
              value={productName}
              onChange={(e) => setProductName(e.target.value)}
              placeholder="e.g. Ceramic Coffee Mug - 350ml"
              style={inputStyle}
            />

            <label style={{ fontSize: 12.5, fontWeight: 500, color: COLORS.ink, display: "block", margin: "16px 0 6px" }}>Product description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Short description of the product for this order"
              rows={3}
              style={{ ...inputStyle, resize: "vertical", fontFamily: "Inter" }}
            />

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, margin: "16px 0 0" }}>
              <div>
                <label style={{ fontSize: 12.5, fontWeight: 500, color: COLORS.ink, display: "block", marginBottom: 6 }}>Order placement date</label>
                <input
                  type="date"
                  value={orderPlacementDate}
                  onChange={(e) => setOrderPlacementDate(e.target.value)}
                  style={inputStyle}
                />
              </div>
              <div>
                <label style={{ fontSize: 12.5, fontWeight: 500, color: COLORS.ink, display: "block", marginBottom: 6 }}>Unit price ($)</label>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={unitPrice}
                  onChange={(e) => setUnitPrice(e.target.value)}
                  placeholder="0.00"
                  style={inputStyle}
                />
              </div>
            </div>

            <div style={{ margin: "20px 0 8px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <label style={{ fontSize: 12.5, fontWeight: 500, color: COLORS.ink }}>Marketplace quantities</label>
              <span style={{ fontSize: 12, color: COLORS.inkMuted }}>Total: {totalQty}</span>
            </div>

            {rows.map((row, i) => (
              <div key={i} style={{ display: "flex", gap: 8, marginBottom: 8 }}>
                <select
                  value={row.marketplace}
                  onChange={(e) => updateRow(i, "marketplace", e.target.value)}
                  style={{ ...inputStyle, flex: 1.3 }}
                >
                  <option value="">Select marketplace</option>
                  {availableMarketplaces.filter(
                    (m) => m === row.marketplace || !usedMarketplaces(i).includes(m)
                  ).map((m) => (
                    <option key={m} value={m}>{m}</option>
                  ))}
                </select>
                <input
                  type="number"
                  min="1"
                  value={row.quantity}
                  onChange={(e) => updateRow(i, "quantity", e.target.value)}
                  placeholder="Qty"
                  style={{ ...inputStyle, flex: 1 }}
                />
                <button
                  type="button"
                  onClick={() => removeRow(i)}
                  disabled={rows.length === 1}
                  style={{
                    border: `1px solid ${COLORS.line}`, background: "transparent", borderRadius: 7,
                    padding: "0 10px", cursor: rows.length === 1 ? "not-allowed" : "pointer",
                    color: rows.length === 1 ? COLORS.line : "#B3261E",
                  }}
                >
                  <Trash2 size={15} />
                </button>
              </div>
            ))}

            <button
              type="button"
              onClick={addRow}
              disabled={rows.length >= availableMarketplaces.length}
              style={{
                display: "flex", alignItems: "center", gap: 6, background: "transparent",
                border: `1px dashed ${COLORS.line}`, borderRadius: 7, padding: "8px 12px",
                fontSize: 13, color: COLORS.inkMuted, cursor: "pointer", marginBottom: 18,
              }}
            >
              <Plus size={14} /> Add another marketplace
            </button>

            {error && <p style={{ color: "#B3261E", fontSize: 12.5, marginBottom: 12 }}>{error}</p>}
            {success && <p style={{ color: COLORS.tealDeep, fontSize: 12.5, marginBottom: 12 }}>{success}</p>}

            <button
              type="submit"
              disabled={submitting}
              style={{
                width: "100%", padding: "12px 0", borderRadius: 7, border: "none", cursor: "pointer",
                background: COLORS.navy, color: "#F6F5F1", fontSize: 14, fontWeight: 500,
                opacity: submitting ? 0.7 : 1,
              }}
            >
              {submitting ? "Placing order..." : "Place order"}
            </button>
          </form>
        </div>

        <div>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
            <div style={{ fontFamily: "Oswald", fontSize: 20, fontWeight: 600, color: COLORS.ink }}>
              Recent orders
            </div>
            <div style={{ display: "flex", gap: 8 }}>
              <button
                onClick={exportToPdf}
                disabled={orders.length === 0}
                style={{
                  display: "flex", alignItems: "center", gap: 6, fontSize: 12.5,
                  background: "transparent", border: `1px solid ${COLORS.line}`, borderRadius: 7,
                  padding: "7px 12px", color: COLORS.ink,
                  cursor: orders.length === 0 ? "not-allowed" : "pointer",
                  opacity: orders.length === 0 ? 0.5 : 1,
                }}
              >
                <FileDown size={14} /> Export to PDF
              </button>
              <button
                onClick={exportToExcel}
                disabled={orders.length === 0}
                style={{
                  display: "flex", alignItems: "center", gap: 6, fontSize: 12.5,
                  background: "transparent", border: `1px solid ${COLORS.line}`, borderRadius: 7,
                  padding: "7px 12px", color: COLORS.ink,
                  cursor: orders.length === 0 ? "not-allowed" : "pointer",
                  opacity: orders.length === 0 ? 0.5 : 1,
                }}
              >
                <Sheet size={14} /> Export to Excel
              </button>
              <button
                onClick={emailOrders}
                disabled={orders.length === 0}
                style={{
                  display: "flex", alignItems: "center", gap: 6, fontSize: 12.5,
                  background: "transparent", border: `1px solid ${COLORS.line}`, borderRadius: 7,
                  padding: "7px 12px", color: COLORS.ink,
                  cursor: orders.length === 0 ? "not-allowed" : "pointer",
                  opacity: orders.length === 0 ? 0.5 : 1,
                }}
              >
                <Mail size={14} /> Email
              </button>
            </div>
          </div>

          {loadingOrders && <p style={{ color: COLORS.inkMuted, fontSize: 13.5 }}>Loading...</p>}
          {!loadingOrders && orders.length === 0 && (
            <p style={{ color: COLORS.inkMuted, fontSize: 13.5 }}>No orders placed yet.</p>
          )}
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {orders.map((o) => (
              <div key={o._id} style={{ background: COLORS.paperCard, border: `1px solid ${COLORS.line}`, borderRadius: 10, padding: 16 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <Package size={16} color={COLORS.amberDeep} />
                    <span style={{ fontFamily: "Oswald", fontSize: 15, fontWeight: 600, color: COLORS.ink }}>{o.productName}</span>
                  </div>
                  <span style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <span style={{
                      fontSize: 10.5, fontWeight: 700, padding: "3px 7px", borderRadius: 5,
                      background: o.orderType === "Shipping" ? "#2C4C7C22" : COLORS.amber + "22",
                      color: o.orderType === "Shipping" ? "#2C4C7C" : COLORS.amberDeep,
                    }}>
                      {o.orderType === "Shipping" ? "L" : "P"}
                    </span>
                    <span style={{ fontSize: 11, fontFamily: "IBM Plex Mono", color: COLORS.inkMuted }}>{o.orderNumber}</span>
                  </span>
                </div>
                {isAdmin && o.client && (
                  <p style={{ fontSize: 12, color: COLORS.inkMuted, margin: "4px 0 0" }}>
                    Client: <span style={{ color: COLORS.ink, fontWeight: 500 }}>
                      {o.client.name}{o.client.company ? ` — ${o.client.company}` : ""}
                    </span>
                  </p>
                )}
                {o.description && (
                  <p style={{ fontSize: 12.5, color: COLORS.inkMuted, margin: "6px 0" }}>{o.description}</p>
                )}
                <div style={{ display: "flex", flexWrap: "wrap", gap: 6, margin: "8px 0" }}>
                  {o.marketplaceAllocations.map((a) => (
                    <span key={a.marketplace} style={{
                      fontSize: 11.5, padding: "3px 8px", borderRadius: 999,
                      background: COLORS.paper, border: `1px solid ${COLORS.line}`, color: COLORS.ink,
                    }}>
                      {a.marketplace}: {a.quantity}
                    </span>
                  ))}
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, color: COLORS.inkMuted }}>
                  <span>Placed {new Date(o.orderPlacementDate).toLocaleDateString()}</span>
                  <span>Total qty: {o.totalQuantity}</span>
                </div>
                {o.unitPrice > 0 && (
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12.5, color: COLORS.ink, marginTop: 6, fontWeight: 500 }}>
                    <span>Unit price: ${o.unitPrice.toFixed(2)}</span>
                    <span>Total: ${o.totalAmount.toFixed(2)}</span>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

const inputStyle = {
  width: "100%",
  padding: "10px 12px",
  borderRadius: 7,
  border: "1px solid " + COLORS.line,
  fontSize: 14,
  boxSizing: "border-box",
  fontFamily: "Inter",
};