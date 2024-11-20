const express = require("express");
const {
  createAuctionOrder,
  getAuctionOrderById,
  deleteAuctionOrder,
  processPayment,
} = require("../controllers/auctionOrder.controller");

const router = express.Router();

router.post("/create/:productId", createAuctionOrder);

router.get("/:orderId", getAuctionOrderById);

router.delete("/:orderId", deleteAuctionOrder);

router.post("/payment/:orderId", processPayment);

module.exports = router;
