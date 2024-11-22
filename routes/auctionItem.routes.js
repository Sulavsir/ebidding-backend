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
  getFeaturedAuctions,
  setFeaturedAuction,
  removeFeaturedAuction,
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

router.get("/featured", getFeaturedAuctions);

router.post(
  "/featured/set/:id",
  checkAuth(["Admin", "Super Admin"]), 
  setFeaturedAuction
);

router.post(
  "/featured/remove/:id",
  checkAuth(["Admin", "Super Admin"]), 
  removeFeaturedAuction
);


module.exports = router;
