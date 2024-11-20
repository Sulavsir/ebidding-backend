const express = require("express");
const upload = require("../middleware/file-uploads.middleware");
const { checkAuth } = require("../middleware/check-auth.middleware");

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
router.post(
  "/add",
  checkAuth(["Sales", "Admin"]),
  upload.single("image"),
  addAuctionItem
);
router.patch(
  "/:productId",
  checkAuth(["Sales", "Admin", "Super Admin"]),
  upload.single("image"),
  updateAuctionItem
);
router.delete(
  "/:productId",
  checkAuth(["Admin", "Super Admin"]),
  deleteAuctionItem
);

module.exports = router;
