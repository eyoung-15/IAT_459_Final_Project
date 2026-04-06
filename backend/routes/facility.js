const express = require("express");
const router = express.Router();
const Facility = require("../models/Facility");
const Review = require("../models/Reviews");
const User = require("../models/User");
const verifyToken = require("../middleware/auth");

//Get my own added facilities
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
    //destructure query parameters from req
    const {
      Category,
      Province,
      City,
      searchTerm,
      page = 1,
      limit = 40,
      north,
      south,
      east,
      west,
    } = req.query;

    //convert page and limit to numbers and calculate skip for pagination
    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const skip = (pageNum - 1) * limitNum;

    //use MongoDB match filter
    let matchStage = {};

    //add filters to matchStage
    if (Category) matchStage.Category = Category;
    if (Province) matchStage.Province = Province;
    if (City) {
      matchStage.City = { $regex: City, $options: "i" };
    }

    if (searchTerm) {
      matchStage.Name = { $regex: searchTerm, $options: "i" };
    }

    // Boundary box definition for viewable map display markers
    if (north && south && east && west) {
      matchStage.Latitude = {
        $gte: parseFloat(south),
        $lte: parseFloat(north),
      };

      matchStage.Longitude = {
        $gte: parseFloat(west),
        $lte: parseFloat(east),
      };
    }

    //combine facilities with review data
    const facility = await Facility.aggregate([
      { $match: matchStage }, //filter based on matchStage

      //join review collection to get all reviews for each facility
      {
        $lookup: {
          from: "reviews", //collection to join
          localField: "_id", //field from facility
          foreignField: "facility", //field from review
          as: "reviews", //output array
        },
      },
      //calculate average rating + review count
      {
        $addFields: {
          avgRating: { $avg: "$reviews.rating" },
          reviewCount: { $size: "$reviews" },
        },
      },

      //exclude review array from output
      {
        $project: {
          reviews: 0,
        },
      },

      //sort facilities newest first
      { $sort: { _id: -1 } },

      //pagination
      { $skip: skip },
      { $limit: limitNum },
    ]);

    //get total documents for UI
    const total = await Facility.countDocuments(matchStage);

    res.json({
      data: facility,
      currentPage: pageNum,
      totalPages: Math.ceil(total / limitNum),
      totalItems: total,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

//Get by ID
router.get("/:id", async (req, res) => {
  try {
    const facility = await Facility.findById(req.params.id);

    if (!facility) {
      return res.status(404).json({ message: "Facility not found" });
    }

    const reviews = await Review.find({ facility: facility._id });

    //calculate average rating
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

    //remove deleted facility from all user bucketList and visited arrays
    // Delete all reviews associated with the facility as well
    await Review.deleteMany({ facility: req.params.id });

    await User.updateMany(
      {},
      {
        $pull: {
          bucketList: req.params.id,
          visited: { facility: req.params.id },
        },
      },
    );
    res.json({ message: "Facility successfully deleted" });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

// PUT ROUTE for editing facility data after they have been created
router.put("/:id", verifyToken, async (req, res) => {
  try {
    const updatedFacility = await Facility.findByIdAndUpdate(
      req.params.id,
      req.body,
      // Enable the new facility, not old one
      { new: true },
    );
    if (!updatedFacility) {
      return res.status(404).json({ error: "Facility not found" });
    }
    res.json(updatedFacility);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

module.exports = router;
