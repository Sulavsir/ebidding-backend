const mongoose = require("mongoose");

const bidSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      required: true,
    },
    bidAmount: {
      type: Number,
      required: true,
      min: [0, "Bid amount must be greater than 0"],
    },

    bidTime: { type: Date, default: Date.now },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Bid", bidSchema);
