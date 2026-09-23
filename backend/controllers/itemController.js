const Item = require("../models/Item");

// CREATE ITEM (already working)
const cloudinary = require("../config/cloudinary");

const createItem = async (req, res) => {
  try {
    const { title, description, category, location, type } = req.body;

    let imageUrl = "";

    if (req.file) {
      const result = await cloudinary.uploader.upload_stream(
        { folder: "lost-found" },
        (error, result) => {
          if (error) throw error;
          imageUrl = result.secure_url;
        }
      );

      result.end(req.file.buffer);
    }

    const item = await Item.create({
      title,
      description,
      category,
      location,
      type,
      image: imageUrl,
      reportedBy: req.user._id,
    });

    res.status(201).json(item);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// GET ALL ITEMS
const getItems = async (req, res) => {
  try {
    const { search, type, page = 1, limit = 5 } = req.query;

    const query = {};

    // 🔍 Search by title or description
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } },
      ];
    }

    // 🎯 Filter by type (lost / found)
    if (type) {
      query.type = type;
    }

    // 📄 Pagination
    const skip = (page - 1) * limit;

    const items = await Item.find(query)
      .populate("reportedBy", "name email")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit));

    const total = await Item.countDocuments(query);

    res.json({
      totalItems: total,
      currentPage: Number(page),
      totalPages: Math.ceil(total / limit),
      items,
    });

  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

// GET SINGLE ITEM
const getItemById = async (req, res) => {
  try {
    const item = await Item.findById(req.params.id)
      .populate("reportedBy", "name email");

    if (!item) {
      return res.status(404).json({ message: "Item not found" });
    }

    res.json(item);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

//updtate item
const updateItem = async (req, res) => {
  try {
    const item = await Item.findById(req.params.id);

    if (!item) {
      return res.status(404).json({
        message: "Item not found",
      });
    }

    // Make sure only owner can update
    if (item.reportedBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        message: "Not authorized to update this item",
      });
    }

    const updatedItem = await Item.findByIdAndUpdate(
      req.params.id,
      req.body,
      {
        new: true,
        runValidators: true,
      }
    );

    res.json(updatedItem);
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

//delete item
const deleteItem = async (req, res) => {
  try {
    const item = await Item.findById(req.params.id);

    if (!item) {
      return res.status(404).json({
        message: "Item not found",
      });
    }

    // Only owner can delete
    if (item.reportedBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        message: "Not authorized to delete this item",
      });
    }

    await item.deleteOne();

    res.json({
      message: "Item deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};


module.exports = {
  createItem,
  getItems,
  getItemById,
  updateItem,
  deleteItem,
};