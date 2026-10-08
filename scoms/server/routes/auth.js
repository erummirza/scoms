const express = require("express");
const router = express.Router();
const { adminLogin, clientLogin, register, me } = require("../controllers/authController");
const { protect } = require("../middleware/auth");

router.post("/admin-login", adminLogin);
router.post("/client-login", clientLogin);
router.post("/register", register);
router.get("/me", protect, me);

module.exports = router;
