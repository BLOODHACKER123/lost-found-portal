const mongoose = require("mongoose");
const Claim = require("../models/Claim");
const Item = require("../models/Item");

// POST /api/claims/items/:itemId
const createClaim = async (req, res) => {
  try {
    const { itemId } = req.params;
    const { message } = req.body;

    if (!mongoose.Types.ObjectId.isValid(itemId)) {
      return res.status(400).json({
        message: "Invalid item ID",
      });
    }

    if (!message || message.trim().length < 10) {
      return res.status(400).json({
        message: "Claim message must contain at least 10 characters",
      });
    }

    const item = await Item.findById(itemId);

    if (!item) {
      return res.status(404).json({
        message: "Item not found",
      });
    }

    if (item.status !== "open") {
      return res.status(400).json({
        message: "This item is no longer open for claims",
      });
    }

    if (item.reportedBy.toString() === req.user._id.toString()) {
      return res.status(400).json({
        message: "You cannot claim your own item",
      });
    }

    const existingClaim = await Claim.findOne({
      item: itemId,
      claimant: req.user._id,
    });

    if (existingClaim) {
      return res.status(409).json({
        message: "You have already claimed this item",
      });
    }

    const claim = await Claim.create({
      item: itemId,
      claimant: req.user._id,
      message: message.trim(),
    });

    const populatedClaim = await Claim.findById(claim._id)
      .populate("item", "title type status image reportedBy")
      .populate("claimant", "name email");

    return res.status(201).json(populatedClaim);
  } catch (error) {
    // MongoDB duplicate compound-index error
    if (error.code === 11000) {
      return res.status(409).json({
        message: "You have already claimed this item",
      });
    }

    if (error.name === "ValidationError") {
      return res.status(400).json({
        message: error.message,
      });
    }

    return res.status(500).json({
      message: error.message,
    });
  }
};

// GET /api/claims/mine
const getMyClaims = async (req, res) => {
  try {
    const claims = await Claim.find({
      claimant: req.user._id,
    })
      .populate("item", "title description type status image location")
      .sort({ createdAt: -1 });

    return res.status(200).json(claims);
  } catch (error) {
    return res.status(500).json({
      message: error.message,
    });
  }
};

// GET /api/claims/items/:itemId
const getClaimsForItem = async (req, res) => {
  try {
    const { itemId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(itemId)) {
      return res.status(400).json({
        message: "Invalid item ID",
      });
    }

    const item = await Item.findById(itemId);

    if (!item) {
      return res.status(404).json({
        message: "Item not found",
      });
    }

    if (item.reportedBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        message: "Only the item owner can view these claims",
      });
    }

    const claims = await Claim.find({
      item: itemId,
    })
      .populate("claimant", "name email")
      .sort({ createdAt: -1 });

    return res.status(200).json(claims);
  } catch (error) {
    return res.status(500).json({
      message: error.message,
    });
  }
};

// PATCH /api/claims/:claimId/status
const updateClaimStatus = async (req, res) => {
  try {
    const { claimId } = req.params;
    const { status } = req.body;

    if (!mongoose.Types.ObjectId.isValid(claimId)) {
      return res.status(400).json({
        message: "Invalid claim ID",
      });
    }

    if (!["approved", "rejected"].includes(status)) {
      return res.status(400).json({
        message: "Status must be approved or rejected",
      });
    }

    const claim = await Claim.findById(claimId);

    if (!claim) {
      return res.status(404).json({
        message: "Claim not found",
      });
    }

    const item = await Item.findById(claim.item);

    if (!item) {
      return res.status(404).json({
        message: "Related item not found",
      });
    }

    if (item.reportedBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        message: "Only the item owner can update this claim",
      });
    }

    if (claim.status !== "pending") {
      return res.status(400).json({
        message: "This claim has already been reviewed",
      });
    }

    if (status === "approved") {
      if (item.status !== "open") {
        return res.status(400).json({
          message: "This item has already been claimed",
        });
      }

      claim.status = "approved";
      await claim.save();

      item.status = "claimed";
      await item.save();

      await Claim.updateMany(
        {
          item: item._id,
          _id: { $ne: claim._id },
          status: "pending",
        },
        {
          $set: {
            status: "rejected",
          },
        }
      );
    } else {
      claim.status = "rejected";
      await claim.save();
    }

    const updatedClaim = await Claim.findById(claim._id)
      .populate("item", "title type status image reportedBy")
      .populate("claimant", "name email");

    return res.status(200).json(updatedClaim);
  } catch (error) {
    return res.status(500).json({
      message: error.message,
    });
  }
};

module.exports = {
  createClaim,
  getMyClaims,
  getClaimsForItem,
  updateClaimStatus,
};