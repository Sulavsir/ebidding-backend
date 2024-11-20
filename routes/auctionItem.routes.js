const express = require("express");
const upload = require("../middleware/file-uploads.middleware");

const router = express.Router();
const {
  addAuctionItem,
  getAuctionItems,
  getAuctionItemById,
  updateAuctionItem,
  deleteAuctionItem,
} = require("../controllers/auctionItem.controller");

router.get("/", getAuctionItems);
router.get("/:productId", getAuctionItemById);
router.post("/add", upload.single("image"), addAuctionItem);
router.patch("/:productId", upload.single("image"), updateAuctionItem);
router.delete("/:productId", deleteAuctionItem);

module.exports = router;
