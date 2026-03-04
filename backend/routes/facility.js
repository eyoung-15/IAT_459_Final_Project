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
        const facility = await Facility.create(req.body);
        res.status(201).json(facility);
      } catch (err) {
        res.status(500).json({ message: err.message });
      }
    });

// DELETE ROUTE
router.delete("/:id", verifyToken, async (req, res) => {
  try {
    await Facility.findByIdAndDelete(req.params.id);
    res.json({ message: "Deleted" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
