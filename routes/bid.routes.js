const express = require("express");
const {
  placeBid,
 
} = require("../controllers/bid.controller");
const { checkAuth } = require("../middleware/check-auth.middleware");

const router = express.Router();


router.post("/", checkAuth(), placeBid); // Place a bid

module.exports = router;
