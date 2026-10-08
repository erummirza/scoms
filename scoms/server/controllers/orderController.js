const Order = require("../models/Order");
const Marketplace = require("../models/Marketplace");

exports.listOrders = async (req, res) => {
  const filter = req.user.role === "client" ? { client: req.user.id } : {};
  const orders = await Order.find(filter).populate("client", "name email company").sort({ createdAt: -1 });
  const marketplaces = await Marketplace.find({ isActive: true }).sort({ name: 1 });
  res.json({ orders, marketplaces: marketplaces.map((m) => m.name) });
};

exports.getOrder = async (req, res) => {
  const order = await Order.findById(req.params.id).populate("client", "name email company");
  if (!order) return res.status(404).json({ message: "Order not found." });
  if (req.user.role === "client" && String(order.client._id) !== req.user.id) {
    return res.status(403).json({ message: "You don't have access to this order." });
  }
  res.json({ order });
};

// Create an order for one product, allocated across one or more marketplaces,
// each with its own quantity (e.g. UK: 20, USA: 10).
exports.createOrder = async (req, res) => {
  const { orderType, productName, description, orderPlacementDate, marketplaceAllocations, unitPrice } = req.body;

  if (!["Product", "Shipping"].includes(orderType)) {
    return res.status(400).json({ message: "Select an order type: Product or Shipping." });
  }

  if (!productName || !productName.trim()) {
    return res.status(400).json({ message: "Product name is required." });
  }
  if (!orderPlacementDate) {
    return res.status(400).json({ message: "Order placement date is required." });
  }
  if (!Array.isArray(marketplaceAllocations) || marketplaceAllocations.length === 0) {
    return res.status(400).json({ message: "Add at least one marketplace with a quantity." });
  }

  const activeMarketplaces = await Marketplace.find({ isActive: true });
  const validNames = activeMarketplaces.map((m) => m.name);

  const seen = new Set();
  const cleanAllocations = [];
  for (const alloc of marketplaceAllocations) {
    const marketplace = alloc.marketplace;
    const quantity = Number(alloc.quantity);

    if (!validNames.includes(marketplace)) {
      return res.status(400).json({ message: `"${marketplace}" is not a supported marketplace.` });
    }
    if (!quantity || quantity < 1) {
      return res.status(400).json({ message: `Enter a valid quantity for ${marketplace}.` });
    }
    if (seen.has(marketplace)) {
      return res.status(400).json({ message: `${marketplace} was added more than once — combine into a single quantity.` });
    }
    seen.add(marketplace);
    cleanAllocations.push({ marketplace, quantity });
  }

  const totalQuantity = cleanAllocations.reduce((sum, a) => sum + a.quantity, 0);
  const cleanUnitPrice = Number(unitPrice) > 0 ? Number(unitPrice) : 0;
  const totalAmount = cleanUnitPrice * totalQuantity;
  const typePrefix = orderType === "Shipping" ? "L" : "P";
  const orderNumber = `${typePrefix}-` + Date.now().toString().slice(-8);
  const clientId = req.user.role === "client" ? req.user.id : req.body.client;

  if (!clientId) {
    return res.status(400).json({ message: "A client must be specified for this order." });
  }

  const order = await Order.create({
    orderNumber,
    orderType,
    client: clientId,
    productName: productName.trim(),
    description: (description || "").trim(),
    orderPlacementDate,
    marketplaceAllocations: cleanAllocations,
    totalQuantity,
    unitPrice: cleanUnitPrice,
    totalAmount,
  });

  res.status(201).json({ order });
};

exports.updateOrderStatus = async (req, res) => {
  const { status, trackingNumber } = req.body;
  const order = await Order.findById(req.params.id);
  if (!order) return res.status(404).json({ message: "Order not found." });

  if (status) order.status = status;
  if (trackingNumber) order.trackingNumber = trackingNumber;
  await order.save();

  res.json({ order });
};
