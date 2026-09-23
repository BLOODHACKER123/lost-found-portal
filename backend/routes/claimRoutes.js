const express = require("express");

const {
  createClaim,
  getMyClaims,
  getClaimsForItem,
  updateClaimStatus,
} = require("../controllers/claimController");

const { protect } = require("../middleware/authMiddleware");

const router = express.Router();

// Submit a claim for an item
router.post("/items/:itemId", protect, createClaim);

// View claims submitted by the logged-in user
router.get("/mine", protect, getMyClaims);

// Item owner views claims received for an item
router.get("/items/:itemId", protect, getClaimsForItem);

// Item owner approves or rejects a claim
router.patch("/:claimId/status", protect, updateClaimStatus);

module.exports = router;