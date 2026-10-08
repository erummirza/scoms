const Supplier = require("../models/Supplier");

exports.listSuppliers = async (req, res) => {
  const suppliers = await Supplier.find().sort({ createdAt: -1 });
  res.json({ suppliers });
};

exports.createSupplier = async (req, res) => {
  const supplier = await Supplier.create(req.body);
  res.status(201).json({ supplier });
};

exports.updateSupplier = async (req, res) => {
  const supplier = await Supplier.findByIdAndUpdate(req.params.id, req.body, { new: true });
  if (!supplier) return res.status(404).json({ message: "Supplier not found." });
  res.json({ supplier });
};

exports.deleteSupplier = async (req, res) => {
  const supplier = await Supplier.findByIdAndDelete(req.params.id);
  if (!supplier) return res.status(404).json({ message: "Supplier not found." });
  res.json({ message: "Supplier removed." });
};
