const express = require("express");
const router = express.Router();
const Review = require("../models/Reviews");
const Facility = require("../models/Facility");
const verifyToken = require("../middleware/auth");

const multer = require("multer");
const path = require("path");
const fs = require("fs");

const uploadDir = "uploads/";
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir);
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + "-" + file.originalname);
  },
});

const upload = multer({
  storage,
  limits: {
    fileSize: 50 * 1024 * 1024,
  },
  fileFilter: (req, file, cb) => {
    if (!file.mimetype.startsWith("image/")) {
      return cb(new Error("Only image files are accepted"));
    }
    cb(null, true);
  },
});

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
router.post("/", verifyToken, upload.single("image"), async (req, res) => {

  try {
    const review = new Review({
        facility: req.body.facility,
        rating: req.body.rating,
        comment: req.body.comment,
        user: req.user.id,
        image: req.file ? `/uploads/${req.file.filename}` : null,
        
    });
    await review.save();
    const populateReview = await review.populate("user", "username");

    if (req.file) {
      await Facility.findByIdAndUpdate(req.body.facility, {
        lastReviewImage: `/${uploadDir}/${req.file.filename}`,
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
    const review =  await Review.findById(req.params.id);

    if (!review) {
      return res.status(404).json({message: "Review not found"});
    }

   if (review.user.toString() !== req.user.id) {
         return res.status(403).json({
           message: "Forbidden: You do not have permission to delete this review.",
         });
       }

       if (review.image) {
        const imagePath = path.join(__dirname, "..", review.image);
        if (fs.existsSync(imagePath)) {
          fs.unlinkSync(imagePath);
        }
       }
   
       await Review.findByIdAndDelete(req.params.id);
       res.json({ message: "Review successfully deleted" });
     } catch (err) {
       res.status(500).json({ message: err.message });
     }
   });

module.exports = router;
