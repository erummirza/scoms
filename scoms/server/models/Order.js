const mongoose = require("mongoose");

// Default seed list, kept only as a fallback reference - the real list of
// available marketplaces now lives in the Marketplace collection and can be
// managed by an admin via the "Manage Marketplace" page.
const MARKETPLACES = ["UK", "USA", "Australia", "Canada", "UAE"];

// One product order can span several marketplaces, each with its own quantity
// e.g. UK: 20 units, USA: 10 units, in the same order.
const marketplaceAllocationSchema = new mongoose.Schema(
  {
    marketplace: { type: String, required: true, trim: true },
    quantity: { type: Number, required: true, min: 1 },
  },
  { _id: false }
);

// Legacy line-item shape, kept optional so existing data/routes don't break.
const orderItemSchema = new mongoose.Schema(
  {
    product: { type: mongoose.Schema.Types.ObjectId, ref: "Product" },
    quantity: { type: Number, min: 1 },
    unitPrice: { type: Number },
  },
  { _id: false }
);

const orderSchema = new mongoose.Schema(
  {
    orderNumber: { type: String, required: true, unique: true },
    orderType: { type: String, enum: ["Product", "Shipping"], required: true, default: "Product" },
    client: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },

    // New order placement fields
    productName: { type: String, required: true, trim: true },
    description: { type: String, trim: true },
    orderPlacementDate: { type: Date, required: true },
    marketplaceAllocations: {
      type: [marketplaceAllocationSchema],
      required: true,
      validate: {
        validator: (arr) => Array.isArray(arr) && arr.length > 0,
        message: "Select at least one marketplace with a quantity.",
      },
    },
    totalQuantity: { type: Number, required: true, min: 1 },
    unitPrice: { type: Number, default: 0, min: 0 },
    totalAmount: { type: Number, default: 0, min: 0 },

    // Legacy fields (optional, retained for compatibility)
    items: { type: [orderItemSchema], default: [] },
    total: { type: Number, default: 0, min: 0 },
    shippingAddress: { type: String, trim: true },

    status: {
      type: String,
      enum: ["pending", "confirmed", "processing", "shipped", "delivered", "cancelled"],
      default: "pending",
    },
    trackingNumber: { type: String, trim: true },
  },
  { timestamps: true }
);

orderSchema.statics.MARKETPLACES = MARKETPLACES;

module.exports = mongoose.model("Order", orderSchema);
