const express = require("express");

const router = express.Router();

const {
  createItem,
  getItems,
  getItemById,
  updateItem,
  deleteItem,
} = require("../controllers/itemController");

const { protect } = require("../middleware/authMiddleware");

// Create
const upload = require("../middleware/upload");

router.post("/", protect, upload.single("image"), createItem);

// Read
router.get("/", getItems);
router.get("/:id", getItemById);

// Update
router.put("/:id", protect, updateItem);

// Delete
router.delete("/:id", protect, deleteItem);

module.exports = router;