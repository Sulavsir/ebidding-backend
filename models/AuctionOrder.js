const mongoose = require("mongoose");

const auctionOrderSchema = new mongoose.Schema(
  {

    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      required: true,
    },
    
    winner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    }, 

    bidAmount: { type: Number, required: true },
    
    orderDate: { type: Date, default: Date.now },
    
    paymentStatus: {
      type: String,
      enum: ["pending", "paid", "failed"],
      default: "pending",
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("AuctionOrder", auctionOrderSchema);
