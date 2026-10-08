const crypto = require("crypto");
const User = require("../models/User");

// Admin-only: list every registered client account (name, email, company).
exports.listClients = async (req, res) => {
  const clients = await User.find({ role: "client" })
    .select("name email company isActive createdAt")
    .sort({ createdAt: -1 });
  res.json({ clients });
};

// Admin-only: create a new client account. Email is mandatory and must be unique.
// If no password is supplied, a temporary one is generated and returned once
// so the admin can share it with the client.
exports.createClient = async (req, res) => {
  const { name, email, company, password } = req.body;

  if (!name || !name.trim()) {
    return res.status(400).json({ message: "Client name is required." });
  }
  if (!email || !email.trim()) {
    return res.status(400).json({ message: "Email is required." });
  }

  const existing = await User.findOne({ email: email.toLowerCase().trim() });
  if (existing) {
    return res.status(409).json({ message: "A client with this email already exists." });
  }

  const generatedPassword = password && password.trim()
    ? password.trim()
    : crypto.randomBytes(6).toString("base64url"); // e.g. "aB3xQ9zK" - shown once below

  const client = await User.create({
    name: name.trim(),
    email: email.toLowerCase().trim(),
    password: generatedPassword,
    role: "client",
    company: (company || "").trim(),
  });

  res.status(201).json({
    client: {
      id: client._id,
      name: client.name,
      email: client.email,
      company: client.company,
      isActive: client.isActive,
      createdAt: client.createdAt,
    },
    // Only returned on creation - never stored or retrievable again.
    temporaryPassword: password && password.trim() ? null : generatedPassword,
  });
};
