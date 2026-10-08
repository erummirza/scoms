const jwt = require("jsonwebtoken");
const User = require("../models/User");

function signToken(user) {
  return jwt.sign(
    { id: user._id, role: user.role, email: user.email },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || "7d" }
  );
}

async function loginWithRole(req, res, expectedRole) {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: "Enter your email and password." });
  }

  const user = await User.findOne({ email: email.toLowerCase(), role: expectedRole });
  if (!user || !user.isActive) {
    return res.status(401).json({ message: "Invalid email or password." });
  }

  const isMatch = await user.comparePassword(password);
  if (!isMatch) {
    return res.status(401).json({ message: "Invalid email or password." });
  }

  const token = signToken(user);
  res.json({ token, user: user.toSafeObject() });
}

exports.adminLogin = (req, res) => loginWithRole(req, res, "admin");
exports.clientLogin = (req, res) => loginWithRole(req, res, "client");

exports.register = async (req, res) => {
  const { name, email, password, role, company } = req.body;

  if (!name || !email || !password || !role) {
    return res.status(400).json({ message: "Name, email, password, and role are required." });
  }
  if (!["admin", "client"].includes(role)) {
    return res.status(400).json({ message: "Role must be admin or client." });
  }

  const existing = await User.findOne({ email: email.toLowerCase() });
  if (existing) {
    return res.status(409).json({ message: "An account with this email already exists." });
  }

  const user = await User.create({ name, email, password, role, company });
  const token = signToken(user);
  res.status(201).json({ token, user: user.toSafeObject() });
};

exports.me = async (req, res) => {
  const user = await User.findById(req.user.id);
  if (!user) return res.status(404).json({ message: "User not found." });
  res.json({ user: user.toSafeObject() });
};
