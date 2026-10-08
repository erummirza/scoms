const mongoose = require("mongoose");

const productSchema = new mongoose.Schema(
  {
    sku: { type: String, required: true, unique: true, trim: true },
    name: { type: String, required: true, trim: true },
    category: { type: String, trim: true },
    unitPrice: { type: Number, required: true, min: 0 },
    stockQty: { type: Number, default: 0, min: 0 },
    reorderPoint: { type: Number, default: 10 },
    warehouse: { type: String, default: "Main" },
    supplier: { type: mongoose.Schema.Types.ObjectId, ref: "Supplier" },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Product", productSchema);
