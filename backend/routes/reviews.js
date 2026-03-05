const express = require("express");
const router = express.Router();
const Review = require("../models/Reviews");
const verifyToken = require("../middleware/auth");

// // GET ROUTE (Public anyone can see reviews)
router.get("/:facilityId", async (req, res) => {
  try {
    const reviews = await Review.find({
        facility: req.params.facilityId,
    }).populate("user", "username");
    res.json(reviews);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST ROUTE (create review - protected for only logged in users)
router.post("/", verifyToken, async (req, res) => {

  try {
    const review = await Review.create({
        ...req.body,
        user: req.user.id,
        
    });
    res.status(201).json(review);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// DELETE ROUTE
router.delete("/:id", verifyToken, async (req, res) => {
  try {
    await Review.findByIdAndDelete(req.params.id);
    res.json({ message: "Review deleted" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
