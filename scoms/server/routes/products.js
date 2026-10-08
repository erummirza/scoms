const express = require("express");
const router = express.Router();
const { protect, requireRole } = require("../middleware/auth");
const Product = require("../models/Product");

router.get("/", protect, async (req, res) => {
  const products = await Product.find().populate("supplier").sort({ createdAt: -1 });
  res.json({ products });
});

router.post("/", protect, requireRole("admin"), async (req, res) => {
  const product = await Product.create(req.body);
  res.status(201).json({ product });
});

router.patch("/:id", protect, requireRole("admin"), async (req, res) => {
  const product = await Product.findByIdAndUpdate(req.params.id, req.body, { new: true });
  if (!product) return res.status(404).json({ message: "Product not found." });
  res.json({ product });
});

router.delete("/:id", protect, requireRole("admin"), async (req, res) => {
  const product = await Product.findByIdAndDelete(req.params.id);
  if (!product) return res.status(404).json({ message: "Product not found." });
  res.json({ message: "Product removed." });
});

module.exports = router;
