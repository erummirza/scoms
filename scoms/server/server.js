require("dotenv").config();
const path = require("path");
const express = require("express");
const cors = require("cors");
const connectDB = require("./config/db");

const authRoutes = require("./routes/auth");
const orderRoutes = require("./routes/orders");
const supplierRoutes = require("./routes/suppliers");
const reportRoutes = require("./routes/reports");
const productRoutes = require("./routes/products");
const userRoutes = require("./routes/users");
const marketplaceRoutes = require("./routes/marketplaces");

const app = express();

app.use(cors({ origin: process.env.CLIENT_ORIGIN || "http://localhost:5173" }));
app.use(express.json());

app.get("/api/health", (req, res) => res.json({ status: "ok" }));

app.use("/api/auth", authRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/suppliers", supplierRoutes);
app.use("/api/reports", reportRoutes);
app.use("/api/products", productRoutes);
app.use("/api/users", userRoutes);
app.use("/api/marketplaces", marketplaceRoutes);

// Serve the built React app (client/dist copied into server/public - see deploy notes).
// This lets one Node process serve both the API and the frontend, which is the
// simplest setup on shared/cPanel hosting.
const clientBuildPath = path.join(__dirname, "public");
app.use(express.static(clientBuildPath));

app.use((req, res, next) => {
  if (req.path.startsWith("/api/")) {
    return res.status(404).json({ message: "Route not found." });
  }
  res.sendFile(path.join(clientBuildPath, "index.html"), (err) => {
    if (err) {
      console.error("sendFile failed:", err.message);
      res.status(500).json({ message: "Could not load the app.", error: err.message });
    }
  });
});

app.use((err, req, res, next) => {
  console.error(err);
  res.status(err.status || 500).json({ message: err.message || "Something went wrong on the server." });
});

const PORT = process.env.PORT || 5000;

connectDB().then(() => {
  app.listen(PORT, () => console.log(`SCOMS running on port ${PORT}`));
});
