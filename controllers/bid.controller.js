const Product = require("../models/Product");
const Bid = require("../models/Bid");

const placeBid = async (req, res) => {
  const { productId, bidAmount } = req.body;

  if (!bidAmount || bidAmount <= 0) {
    return res
      .status(400)
      .json({ message: "Bid amount must be a positive number." });
  }
  try {
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    // Ensure the bid is higher than the current bid
    if (bidAmount <= product.currentBid) {
      return res
        .status(400)
        .json({ message: "Bid must be higher than the current bid" });
    }

    const newBid = new Bid({
      user: req.authUser._id,
      product: productId,
      bidAmount,
    });

    await newBid.save();

    // Update product with the new bid and highest bidder
    product.currentBid = bidAmount;
    product.highestBidder = req.authUser._id;
    await product.save();

    res.status(200).json({
      message: "Bid placed successfully",
      data: newBid,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error while placing bid" });
  }
};



module.exports = { placeBid };
