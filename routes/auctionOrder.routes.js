const express = require("express");
const {
  createAuctionOrder,
  getAuctionOrderById,
  deleteAuctionOrder,
  processPayment,
} = require("../controllers/auctionOrder.controller");
const { checkAuth } = require("../middleware/check-auth.middleware");

const router = express.Router();

router.post("/create/:productId", checkAuth(["Sales"]), createAuctionOrder);

router.get(
  "/:orderId",
  checkAuth(["Sales", "Admin", "Super Admin"]),
  getAuctionOrderById
);

router.delete("/:orderId", checkAuth(["Admin"]), deleteAuctionOrder);

router.post("/payment/:orderId", checkAuth(["Sales"]), processPayment);

module.exports = router;
