const express = require("express");
const router = express.Router();
const User = require("../models/User");
const verifyToken = require("../middleware/auth");

//Add to bucket list
router.post("/bucket/:facilityId", verifyToken, async (req, res) => {

    try{
        const user = await User.findById(req.user.id);
        
        if(!user) {
            return res.status(404).json({message: "User not found"});
        }
        
        //prevent duplicates
        const exists = user.bucketList.some(
            id => id.toString() === req.params.facilityId
        );
        
        if (!exists) {
            user.bucketList.push(req.params.facilityId);
            await user.save();
        }
        
        res.json({message: "Added to Bucket List", bucketList: user.bucketList});
    
    }catch(err){
        res.status(500).json({message: err.message});
    }
});

//Remove from bucket list
router.delete("/bucket/:facilityId", verifyToken, async (req, res) => {
    try{
        const user = await User.findById(req.user.id);

        if (!user) {
            return res.status(404).json({message: "User not found"});
        }

        user.bucketList = user.bucketList.filter(
            id => id.toString() !== req.params.facilityId
        );

        await user.save();
        
        res.json({message: "Removed from Bucket List", bucketList: user.bucketList});

    } catch (err) {
        res.status(500).json({message: err.message});
    }
});

// Add visited (with image)
router.post("/visited/:facilityId", verifyToken, async (req, res) => {
    try{
        const {image} = req.body;
        const user = await User.findById(req.user.id);

        if (!user){
            return res.status(404).json({message: "User not found"});
        }
        
        const exists = user.visited.find(
            v => v.facility.toString() === req.params.facilityId
        );
        
        if (!exists){
            user.visited.push({
                facility: req.params.facilityId,
                image,
                visitedAt: new Date()
        });
        await user.save();
    }

    res.json({message: "Marked as Visited", visited: user.visited});

} catch (err){
    res.status(500).json({message: err.message});
}

});

//remove from visited
router.delete("/visited/:facilityId", verifyToken, async(req, res) => {
    try{
        const user = await User.findById(req.user.id);

        user.visited = user.visited.filter(
            v => v.facility.toString() !== req.params.facilityId
        );

        await user.save();

        res.json({message: "Removed from Visited", visited: user.visited});
    } catch (err) {
        res.status(500).json({message: err.message});
    }
});

//get user data and stats
router.get("/me", verifyToken, async (req, res) => {
    try{
        const user = await User.findById(req.user.id)
        .populate("bucketList")
        .populate("visited.facility");

        if(!user) {
            return res.status(404).json({message: "User not found"});
        }
        
        const stats = {
            visitedCount: user.visited.length,
            bucketCount: user.bucketList.length
        };

        res.json({user, stats});

    } catch (err) {
        res.status(500).json({message: err.message});
    }

});

module.exports = router;