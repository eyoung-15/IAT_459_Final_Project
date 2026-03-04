const express = require("express");
const router = express.Router();
const Review = require("../models/Reviews");
const verifyToken = require("../middleware/auth");

// // GET ROUTE (Public anyone can see reviews)
router.get("/", async (req, res) => {
  try {
    const reviews = await Review.find();
    res.json(reviews);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST ROUTE (create review - protected for only logged in users)
router.post("/", verifyToken, async (req, res) => {
//   const plant = new Plant({
//     commonName: req.body.commonName,
//     family: req.body.family,
//     category: req.body.category,
//     origin: req.body.origin,
//     climate: req.body.climate,
//     imgUrl: req.body.imgUrl,
//   });

  try {
    const review = await Review.create({
        ...req.body,
        userId: req.user.id,
        username: req.user.username
        
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
