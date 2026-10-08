const mongoose = require("mongoose");

const supplierSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    contactEmail: { type: String, trim: true },
    contactPhone: { type: String, trim: true },
    leadTimeDays: { type: Number, default: 7 },
    rating: { type: Number, min: 0, max: 5, default: 4 },
    status: { type: String, enum: ["active", "inactive"], default: "active" },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Supplier", supplierSchema);
