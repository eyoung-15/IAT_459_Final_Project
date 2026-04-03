const express = require("express");
const router = express.Router();
const Facility = require("../models/Facility");
const Review = require("../models/Reviews");
const verifyToken = require("../middleware/auth");

// Get my own added facilities
router.get("/my-facilities", verifyToken, async (req, res) => {
  try {
    // filter database search by owner ID
    const facility = await Facility.find({ owner: req.user.id });
    res.json(facility);
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

// GET ALL ROUTE
router.get("/", async (req, res) => {
  try {
    // .sort({_id: -1}) reverses the id's to ensure that the newest id's are displayed first
    const facility = await Facility.find().sort({ _id: -1 }).limit(100);

    const facilitiesWithRatings = await Promise.all(
      facility.map(async (facility) => {
        const reviews = await Review.find({ facility: facility._id });

        const avgRating =
          reviews.length > 0
            ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
            : 0;

        return {
          ...facility.toObject(),
          avgRating: Number(avgRating.toFixed(1)),
          reviewCount: reviews.length,
        };
      }),
    );
    res.json(facilitiesWithRatings);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

//Get by ID
router.get("/:id", async (req, res) => {
  try {
    // .sort({_id: -1}) reverses the id's to ensure that the newest id's are displayed first
    const facility = await Facility.findById(req.params.id);

    if (!facility) {
      return res.status(404).json({ message: "Facility not found" });
    }

    const reviews = await Review.find({ facility: facility._id });

    const avgRating =
      reviews.length > 0
        ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
        : 0;

    res.json({
      ...facility.toObject(),
      avgRating: Number(avgRating.toFixed(1)),
      reviewCount: reviews.length,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST ROUTE
router.post("/", verifyToken, async (req, res) => {
  try {
    // const facility = await Facility.create(req.body);
    const facility = new Facility({
      Name: req.body.Name,
      Category: req.body.Category,
      Province: req.body.Province,
      City: req.body.City,
      Address: req.body.Address,
      Latitude: req.body.Latitude,
      Longitude: req.body.Longitude,
      PostalCode: req.body.PostalCode,
      owner: req.user.id,
    });

    await facility.save();
    res.status(201).json(facility);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// DELETE ROUTE
router.delete("/:id", verifyToken, async (req, res) => {
  try {
    const facility = await Facility.findById(req.params.id);

    // check if facility exists
    if (!facility) {
      return res.status(404).json({ message: "Facility not found" });
    }

    // authorization check: compare document owner ID to requester's ID AND assess if their admin
    const owner = facility.owner.toString() === req.user.id;
    const admin = req.user.role === "admin";

    // If neither matches, reject deletion
    if (!(owner || admin)) {
      return res.status(403).json({
        message:
          "Forbidden: You do not have permission to delete this facility.",
      });
    }

    await Facility.findByIdAndDelete(req.params.id);
    res.json({ message: "Facility successfully deleted" });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

module.exports = router;
