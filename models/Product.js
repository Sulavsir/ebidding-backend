const mongoose = require("mongoose");

const productSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    description: { type: String },
    startPrice: { type: Number, required: true },
    currentBid: { type: Number, default: 0 },
    highestBidder: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    startTime: { type: Date, required: true },
    endTime: { type: Date, required: true },
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true }, // Seller
    image: { type: String },
    isFeatured: String,
    status: { type: String, default: "active" }, // active, ended, canceled
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Product", productSchema);
