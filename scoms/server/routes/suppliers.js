const express = require("express");
const router = express.Router();
const { protect, requireRole } = require("../middleware/auth");
const {
  listSuppliers, createSupplier, updateSupplier, deleteSupplier,
} = require("../controllers/supplierController");

router.use(protect, requireRole("admin"));

router.get("/", listSuppliers);
router.post("/", createSupplier);
router.patch("/:id", updateSupplier);
router.delete("/:id", deleteSupplier);

module.exports = router;
