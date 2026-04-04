const express = require("express");
const router = express.Router();
const User = require("../models/User");
const verifyToken = require("../middleware/auth");

//Add to bucket list
router.post("/bucket/:facilityId", verifyToken, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    //prevent duplicates
    const exists = user.bucketList.some(
      (id) => id.toString() === req.params.facilityId,
    );

    if (!exists) {
      user.bucketList.push(req.params.facilityId);
      await user.save();
    }

    res.json({ message: "Added to Bucket List", bucketList: user.bucketList });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

//Remove from bucket list
router.delete("/bucket/:facilityId", verifyToken, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    user.bucketList = user.bucketList.filter(
      (id) => id.toString() !== req.params.facilityId,
    );

    await user.save();

    res.json({
      message: "Removed from Bucket List",
      bucketList: user.bucketList,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Add visited 
router.post("/visited/:facilityId", verifyToken, async (req, res) => {
  try {
    const { visitedAt } = req.body;
    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const exists = user.visited.find(
      (v) => v.facility.toString() === req.params.facilityId,
    );

    if (!exists) {
      user.visited.push({
        facility: req.params.facilityId,
        visitedAt: visitedAt ? new Date(visitedAt): new Date(), //use provided date or default
      });

      user.bucketList = user.bucketList.filter(id => id.toString() !== req.params.facilityId);
      await user.save();
    }

    res.json({ message: "Marked as Visited", visited: user.visited });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

//remove from visited
router.delete("/visited/:facilityId", verifyToken, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);

    user.visited = user.visited.filter(
      (v) => v.facility.toString() !== req.params.facilityId,
    );

    await user.save();

    res.json({ message: "Removed from Visited", visited: user.visited });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

//get user data and stats
router.get("/me", verifyToken, async (req, res) => {
  try {
    const user = await User.findById(req.user.id)
      .populate("bucketList")
      .populate("visited.facility");

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const stats = {
      visitedCount: user.visited.length,
      bucketCount: user.bucketList.length,
      lastVisited: user.visited.at(-1)?.visitedAt,
    };

    res.json({ user, stats });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// get all users (for admin dashboard)
router.get("/", verifyToken, async (req, res) => {
  try {
    const user = await User.find().sort({ _id: -1 });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json({ user });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// DELETE ROUTE (for admins)
router.delete("/:id", verifyToken, async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    // check if user exists
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // authorization check: assess if their admin
    const admin = req.user.role === "admin";

    // If not a match, reject deletion
    if (!admin) {
      return res.status(403).json({
        message: "Forbidden: You do not have permission to delete this user.",
      });
    }

    await User.findByIdAndDelete(req.params.id);
    res.json({ message: "User successfully deleted" });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

// PUT ROUTE for changing roles between admin/member
router.put("/:id/role", verifyToken, async (req, res) => {
  try {
    // Ensure they are admin first before changing
    if (req.user.role !== "admin") {
      return res.status(403).json({ error: "Not authorized" });
    }

    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ error: "User not found" });

    // Change role depending on which role user is currently
    user.role = user.role === "admin" ? "member" : "admin";

    await user.save();

    res.json({ message: "Role updated", user });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

module.exports = router;
