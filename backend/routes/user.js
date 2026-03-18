const express = require("express");
const router = express.Router();
const User = require("../models/User");
const verifyToken = require("../middleware/auth");

//Add to bucket list
router.post("/bucket/:facilityId", verifyToken, async (req, res) => {
    const user = await User.findById(req.user.id);

    if (!user.bucketList.includes(req.params.facilityId)) {
        user.bucketList.push(req.params.facilityId);
        await user.save();
    }

    res.json({message: "Added to Bucket List"});
});

//Remove from bucket list
router.delete("/bucket/:facilityId", verifyToken, async (req, res) => {
    const user = await User.findById(req.user.id);

    user.bucketList = user.bucketList.filter(
        id => id.toString() !== req.params.facilityId
    );

    await user.save();

    res.json({message: "Removed from Bucket List"});
});

// Add visited (with image)
router.post("/visited/:facilityId", verifyToken, async (req, res) => {
    const {image} = req.body;

    const user = await User.findById(req.user.id);

    const exists = user.visited.find(
        v => v.facility.toString() === req.params.facilityId
    );

    if (!exists){
        user.visited.push({
            facility: req.params.facilityId,
            image
        });
        await user.save();
    }
    res.json({message: "Marked as Visited"});
});

//get user data and stats
router.get("/me", verifyToken, async (req, res) => {
    const user = await User.findById(req.user.id)
    .populate("bucketList")
    .populate("visited.facility");

    const stats = {
        visitedCount: user.visited.length,
        bucketCount: user.bucketList.length
    };
    res.json({user, stats});
});

module.exports = router;