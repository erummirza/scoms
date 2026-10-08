const express = require("express");
const router = express.Router();
const { protect, requireRole } = require("../middleware/auth");
const {
  listOrders, getOrder, createOrder, updateOrderStatus,
} = require("../controllers/orderController");

router.use(protect);

router.get("/", listOrders);
router.get("/:id", getOrder);
router.post("/", createOrder);
router.patch("/:id/status", requireRole("admin"), updateOrderStatus);

module.exports = router;
