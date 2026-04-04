const express = require("express");
const router = express.Router();
const Review = require("../models/Reviews");
const Facility = require("../models/Facility");
const verifyToken = require("../middleware/auth");
const multer = require("multer");
const fs = require("fs");

const storage = multer.memoryStorage(); //store uploaded files in memory as buffer

const upload = multer({
  storage,
  limits: {fileSize: 50 * 1024 * 1024}, //max file size = 50MB
  fileFilter: (req, file, cb) => {
    //only allow image files
    if (!file.mimetype.startsWith("image/")){
      return cb(new Error("Only image files are accepted"));
    }
    cb(null, true); //accept the file
  },
});

// // GET ROUTE (Public anyone can see reviews)
router.get("/:facility", async (req, res) => {
  try {
    const reviews = await Review.find({
      facility: req.params.facility,
    })
      .populate("user", "username")
      .sort({ _id: -1 });
    res.json(reviews);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST ROUTE (create review - protected for only logged in users)
router.post("/", verifyToken, upload.single("image"), async (req, res) => {
  try {
    let imageBase64 = null;

    //if an image file was uploaded, convert it to base64 for MongoDB storage
    if (req.file) {
      const mimeType = req.file.mimetype; //get mime type (ex. png, jpeg)
      const base64Data = req.file.buffer.toString("base64"); //convert buffer to base 64 string
      imageBase64 = `data:${mimeType};base64,${base64Data}`; //format as data URI
    }


    const review = new Review({
      facility: req.body.facility,
      rating: req.body.rating,
      comment: req.body.comment,
      user: req.user.id,
      image: imageBase64,
    });
    await review.save();
    const populateReview = await review.populate("user", "username");

    //if an image exists, update facility's lastReviewImage
    if (imageBase64) {
      await Facility.findByIdAndUpdate(req.body.facility, {
        lastReviewImage: imageBase64,
      });
    }
    res.status(201).json(populateReview);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// DELETE ROUTE
router.delete("/:id", verifyToken, async (req, res) => {
  try {
    const review = await Review.findById(req.params.id);

    if (!review) {
      return res.status(404).json({ message: "Review not found" });
    }

    // authorization check: compare document user ID to requester's ID AND assess if their admin
    const user = review.user.toString() === req.user.id;
    const admin = req.user.role === "admin";

    // If neither matches, reject deletion
    if (!(user || admin)) {
      return res.status(403).json({
        message:
          "Forbidden: You do not have permission to delete this facility.",
      });
    }
    await Review.findByIdAndDelete(req.params.id);

    //update facility's lastReviewImage if it matches the deleted review's image
    const facility = await Facility.findById(review.facility);
    if (facility?.lastReviewImage === review.image){
      await Facility.findByIdAndUpdate(review.facility, {lastReviewImage: null });
    }
    res.json({ message: "Review successfully deleted" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// get all reviews (for admin dashboard)
router.get("/", verifyToken, async (req, res) => {
  try {
    if (req.user.role !== "admin") return res.status(403).json({message: "Forbidden"});
    const review = await Review.find().sort({ _id: -1 }).populate("facility");

    if (!review) {
      return res.status(404).json({ message: "Reviews not found" });
    }

    res.json({ review });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
