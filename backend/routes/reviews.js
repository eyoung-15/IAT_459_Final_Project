const express = require("express");
const router = express.Router();
const Review = require("../models/Reviews");
const auth = require("../middleware/auth");

// // GET ROUTE (fetch first 3)
// router.get("/", async (req, res) => {
//   try {
//     const plants = await Plant.find().limit(3);
//     res.json(plants);
//   } catch (err) {
//     res.status(500).json({ message: err.message });
//   }
// });

// POST ROUTE (create Plant)
router.post("/", auth, async (req, res) => {
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
        
    });
    res.status(201).json(newPlant);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// DELETE ROUTE
router.delete("/:id", async (req, res) => {
  try {
    await Plant.findByIdAndDelete(req.params.id);
    res.json({ message: "Plant deleted" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
