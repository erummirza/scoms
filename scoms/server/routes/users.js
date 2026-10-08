const express = require("express");
const router = express.Router();
const { protect, requireRole } = require("../middleware/auth");
const { listClients, createClient } = require("../controllers/userController");

router.get("/clients", protect, requireRole("admin"), listClients);
router.post("/clients", protect, requireRole("admin"), createClient);

module.exports = router;
