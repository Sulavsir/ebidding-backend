const AuctionOrder = require("../models/AuctionOrder");
const Product = require("../models/Product");
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);


const createAuctionOrder = async (req, res) => {
  const { productId } = req.params;

  try {
    const auctionItem = await Product.findById(productId);
    if (!auctionItem) {
      return res.status(404).json({ message: "Auction item not found." });
    }

    const now = new Date();
    if (now < auctionItem.endTime) {
      return res.status(400).json({ message: "Auction not yet ended." });
    }

    const winner = auctionItem.highestBidder;
    if (!winner) {
      return res.status(404).json({ message: "No winner for this auction." });
    }

    const auctionOrder = new AuctionOrder({
      product: productId,
      winner: winner,
      bidAmount: auctionItem.currentBid,
    });

    await auctionOrder.save();

    auctionItem.status = "ended";
    await auctionItem.save();

    res.status(200).json({
      message: "Auction ended successfully.",
      data: auctionOrder,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error while ending auction." });
  }
};

// Get an Auction Order by ID
const getAuctionOrderById = async (req, res) => {
  const { orderId } = req.params;

  try {
    const auctionOrder = await AuctionOrder.findById(orderId)
      .populate("product")
      .populate("winner");

    if (!auctionOrder) {
      return res.status(404).json({ message: "Auction order not found." });
    }

    res.status(200).json({
      message: "Auction order fetched successfully.",
      data: auctionOrder,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error while fetching auction order." });
  }
};

// Delete an Auction Order
const deleteAuctionOrder = async (req, res) => {
  const { orderId } = req.params;

  try {
    const auctionOrder = await AuctionOrder.findByIdAndDelete(orderId);
    if (!auctionOrder) {
      return res.status(404).json({ message: "Auction order not found." });
    }

    res.status(200).json({
      message: "Auction order deleted successfully.",
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error while deleting auction order." });
  }
};

// Process payment for an auction order
const processPayment = async (req, res) => {
  const { orderId } = req.params;

  try {
    const auctionOrder = await AuctionOrder.findById(orderId).populate(
      "winner"
    );
    if (!auctionOrder) {
      return res.status(404).json({ message: "Auction order not found." });
    }

    const paymentIntent = await stripe.paymentIntents.create({
      amount: auctionOrder.bidAmount * 100, // Convert to cents
      currency: "usd",
      payment_method: req.body.paymentMethodId,
      confirmation_method: "manual",
      confirm: true,
    });

    if (paymentIntent.status === "succeeded") {
      auctionOrder.paymentStatus = "paid";
      await auctionOrder.save();
      res.status(200).json({
        message: "Payment successful.",
        data: auctionOrder,
      });
    } else {
      res.status(400).json({ message: "Payment failed." });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error while processing payment." });
  }
};

module.exports = {
  processPayment,
  createAuctionOrder,
  getAuctionOrderById,
  deleteAuctionOrder,
};
