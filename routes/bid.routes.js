const express = require("express");
const {
  placeBid,
 
} = require("../controllers/bid.controller");
const { checkAuth } = require("../middleware/check-auth.middleware");

const router = express.Router();


router.post("/", checkAuth(["Sales","Admin", "Super Admin"]), placeBid); // Place a bid

module.exports = router;
