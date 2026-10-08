const express = require("express");
const router = express.Router();
const { protect, requireRole } = require("../middleware/auth");
const Order = require("../models/Order");
const Product = require("../models/Product");
const Supplier = require("../models/Supplier");

router.use(protect, requireRole("admin"));

router.get("/summary", async (req, res) => {
  const [totalOrders, pendingOrders, lowStock, supplierCount] = await Promise.all([
    Order.countDocuments(),
    Order.countDocuments({ status: { $in: ["pending", "confirmed", "processing"] } }),
    Product.countDocuments({ $expr: { $lte: ["$stockQty", "$reorderPoint"] } }),
    Supplier.countDocuments({ status: "active" }),
  ]);

  const revenueAgg = await Order.aggregate([
    { $match: { status: { $ne: "cancelled" } } },
    { $group: { _id: null, total: { $sum: "$total" } } },
  ]);

  res.json({
    totalOrders,
    pendingOrders,
    lowStockItems: lowStock,
    activeSuppliers: supplierCount,
    totalRevenue: revenueAgg[0]?.total || 0,
  });
});

module.exports = router;
