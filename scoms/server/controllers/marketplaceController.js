const Marketplace = require("../models/Marketplace");

// Any authenticated user (admin or client) can view the marketplace list,
// since clients need it when placing orders.
exports.listMarketplaces = async (req, res) => {
  const marketplaces = await Marketplace.find().sort({ name: 1 });
  res.json({ marketplaces });
};

exports.createMarketplace = async (req, res) => {
  const { name } = req.body;
  if (!name || !name.trim()) {
    return res.status(400).json({ message: "Marketplace name is required." });
  }

  const existing = await Marketplace.findOne({ name: name.trim() });
  if (existing) {
    return res.status(409).json({ message: "This marketplace already exists." });
  }

  const marketplace = await Marketplace.create({ name: name.trim() });
  res.status(201).json({ marketplace });
};

exports.updateMarketplace = async (req, res) => {
  const { name, isActive } = req.body;
  const marketplace = await Marketplace.findById(req.params.id);
  if (!marketplace) return res.status(404).json({ message: "Marketplace not found." });

  if (name && name.trim()) marketplace.name = name.trim();
  if (typeof isActive === "boolean") marketplace.isActive = isActive;
  await marketplace.save();

  res.json({ marketplace });
};

exports.deleteMarketplace = async (req, res) => {
  const marketplace = await Marketplace.findByIdAndDelete(req.params.id);
  if (!marketplace) return res.status(404).json({ message: "Marketplace not found." });
  res.json({ message: "Marketplace removed." });
};
