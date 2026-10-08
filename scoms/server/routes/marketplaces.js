const express = require("express");
const router = express.Router();
const { protect, requireRole } = require("../middleware/auth");
const {
  listMarketplaces, createMarketplace, updateMarketplace, deleteMarketplace,
} = require("../controllers/marketplaceController");

router.get("/", protect, listMarketplaces);
router.post("/", protect, requireRole("admin"), createMarketplace);
router.patch("/:id", protect, requireRole("admin"), updateMarketplace);
router.delete("/:id", protect, requireRole("admin"), deleteMarketplace);

module.exports = router;
