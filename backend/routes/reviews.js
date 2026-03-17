const express = require("express");
const router = express.Router();
const Review = require("../models/Reviews");
const verifyToken = require("../middleware/auth");

// // GET ROUTE (Public anyone can see reviews)
router.get("/:facility", async (req, res) => {
  try {
    const reviews = await Review.find({
        facility: req.params.facility,
    }).populate("user", "username")
    .sort({_id: -1});
    res.json(reviews);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST ROUTE (create review - protected for only logged in users)
router.post("/", verifyToken, async (req, res) => {

  try {
    const review = new Review({
        facility: req.body.facility,
        rating: req.body.rating,
        comment: req.body.comment,
        user: req.user.id,
        
    });
    await review.save();
    const populateReview = await review.populate("user", "username");
    res.status(201).json(populateReview);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// DELETE ROUTE
router.delete("/:id", verifyToken, async (req, res) => {
  try {
    const review =  await Review.findById(req.params.id);

    if (!review) {
      return res.status(404).json({message: "Review not found"});
    }

   if (review.user.toString() !== req.user.id) {
         return res.status(403).json({
           message: "Forbidden: You do not have permission to delete this review.",
         });
       }
   
       await Review.findByIdAndDelete(req.params.id);
       res.json({ message: "Review successfully deleted" });
     } catch (err) {
       res.status(500).json({ message: "Server error", error: err.message });
     }
   });

module.exports = router;
