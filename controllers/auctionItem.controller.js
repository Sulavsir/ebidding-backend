const Product = require("../models/Product");

// Add a product for auction
const addAuctionItem = async (req, res) => {
  const { name, description, startPrice, startTime, endTime } = req.body;

  if (!name || !startPrice || !startTime || !endTime) {
    return res.status(400).json({ message: "Missing required fields." });
  }


  try {
    const now = new Date();

    const isStarted = now >= new Date(startTime);

    // Convert startTime and endTime to Date objects
    const start = new Date(startTime);
    const end = new Date(endTime);

    // Check if endTime is greater than startTime
    if (end <= start) {
      return res
        .status(400)
        .json({ message: "End time must be greater than start time." });
    }

    const newAuctionItem = await Product.create({
      name,
      description,
      startPrice,
      startTime,
      endTime,
      user: req.authUser._id,
      image: req?.file?.filename,
      status: isStarted ? "started" : "not-started", // Set initial status based on time
    });

    res.status(201).json({
      message: "Auction item added successfully.",
      data: newAuctionItem,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error while adding auction item." });
  }
};



// Get all auction items
const getAuctionItems = async (req, res) => {
  const { page = 1, limit = 10, search = "", order } = req.query;
  const sortBy = order ? { currentBid: order } : {};

  try {
    const auctionItems = await Product.find({ name: new RegExp(search, "i") })
      .sort(sortBy)
      .limit(limit)
      .skip((page - 1) * limit);

    const totalItems = await Product.countDocuments();

    res.status(200).json({
      message: "Auction items fetched successfully.",
      data: {
        page,
        total: totalItems,
        data: auctionItems,
      },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error while fetching auction items." });
  }
};

// Get an auction item by its ID
const getAuctionItemById = async (req, res) => {
  try {
    const auctionItem = await Product.findById(req.params.productId);
    if (!auctionItem) {
      return res.status(404).json({ message: "Auction item not found." });
    }

    res.status(200).json({
      message: "Auction item fetched successfully.",
      data: auctionItem,
    });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error while fetching auction item.", error });
  }
};

// Update an auction item
const updateAuctionItem = async (req, res) => {
  const { name, description, startPrice, startTime, endTime } = req.body;

  try {
    const auctionItem = await Product.findById(req.params.productId);
    if (!auctionItem) {
      return res.status(404).json({ message: "Auction item not found." });
    }

    // Ensure the auction is not started before updating
    const now = new Date();
    if (auctionItem.status === "started" && now < new Date(auctionItem.startTime)) {
      return res.status(400).json({
        message: "Cannot update an auction that has already started.",
      });
    }

    // If the times are being updated, validate them
    if (startTime && endTime) {
      const start = new Date(startTime);
      const end = new Date(endTime);
      if (end <= start) {
        return res.status(400).json({ message: "End time must be greater than start time." });
      }
    }

    auctionItem.name = name || auctionItem.name;
    auctionItem.description = description || auctionItem.description;
    auctionItem.startPrice = startPrice || auctionItem.startPrice;
    auctionItem.startTime = startTime || auctionItem.startTime;
    auctionItem.endTime = endTime || auctionItem.endTime;

    // Save updated auction item
    await auctionItem.save();

    res.status(200).json({
      message: "Auction item updated successfully.",
      data: auctionItem,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error while updating auction item." });
  }
};

// Delete an auction item
const deleteAuctionItem = async (req, res) => {
  try {
    const auctionItem = await Product.findById(req.params.productId);
    if (!auctionItem) {
      return res.status(404).json({ message: "Auction item not found." });
    }

    // Ensure the auction is not started before deleting
    const now = new Date();
    if (auctionItem.status === "started" && now < new Date(auctionItem.startTime)) {
      return res.status(400).json({
        message: "Cannot delete an auction that has already started.",
      });
    }

    // Delete auction item
    await auctionItem.remove();

    res.status(200).json({ message: "Auction item deleted successfully." });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error while deleting auction item." });
  }
};



module.exports = {
  addAuctionItem,
  getAuctionItems,
  getAuctionItemById,
  updateAuctionItem,
  deleteAuctionItem,
};
