const express = require("express");
const router = express.Router();
const Facility = require("../models/Facility");
const verifyToken = require("../middleware/auth");

// // GET ROUTE
router.get("/", async (req, res) => {
  try {
    const facilities = await Facility.find().limit(100);
    res.json(facilities);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// // POST ROUTE

router.post("/", verifyToken, async (req,res) => {
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

    // authorization check: compare document owner ID to requester's ID
    if (facility.owner.toString() !== req.user.id) {
      return res.status(403).json({
        message: "Forbidden: You do not have permission to delete this facility.",
      });
    }

    await Facility.findByIdAndDelete(req.params.id);
    res.json({ message: "Facility successfully deleted" });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

module.exports = router;
