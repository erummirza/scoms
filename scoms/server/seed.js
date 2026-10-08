require("dotenv").config();
const connectDB = require("./config/db");
const User = require("./models/User");
const Supplier = require("./models/Supplier");
const Product = require("./models/Product");
const Marketplace = require("./models/Marketplace");

async function seed() {
  await connectDB();

  await User.deleteMany({ email: { $in: ["admin@scoms.com", "client@scoms.com"] } });
  const admin = await User.create({
    name: "Admin User",
    email: "admin@scoms.com",
    password: process.env.SEED_ADMIN_PASSWORD || "ChangeMe-Admin-1",
    role: "admin",
  });
  const client = await User.create({
    name: "Client User",
    email: "client@scoms.com",
    password: process.env.SEED_CLIENT_PASSWORD || "ChangeMe-Client-1",
    role: "client",
    company: "Acme Retail",
  });

  const supplier = await Supplier.create({
    name: "Northline Components",
    contactEmail: "sales@northline.com",
    leadTimeDays: 5,
    rating: 4.5,
  });

  // Idempotent: safe to re-run without crashing on a duplicate SKU.
  for (const p of [
    { sku: "SKU-1001", name: "Steel Bracket", category: "Hardware", unitPrice: 4.5, stockQty: 120, reorderPoint: 30, supplier: supplier._id },
    { sku: "SKU-1002", name: "Packing Crate (Small)", category: "Packaging", unitPrice: 12, stockQty: 18, reorderPoint: 25, supplier: supplier._id },
  ]) {
    await Product.findOneAndUpdate({ sku: p.sku }, p, { upsert: true, new: true, setDefaultsOnInsert: true });
  }

  // Idempotent default marketplaces - an admin can add/remove more later
  // from the "Manage Marketplace" page.
  for (const name of ["UK", "USA", "Australia", "Canada", "UAE"]) {
    await Marketplace.findOneAndUpdate({ name }, { name }, { upsert: true, new: true, setDefaultsOnInsert: true });
  }

  console.log("Seed complete.");
  console.log("Seeded admin@scoms.com and client@scoms.com. Set SEED_ADMIN_PASSWORD / SEED_CLIENT_PASSWORD in server/.env to choose their passwords.");
  process.exit(0);
}

seed().catch((err) => {
  console.error(err);
  process.exit(1);
});
