const CropRating = require("../models/CropRating");

// POST /api/market/ratings  – submit or update a rating
const submitRating = async (req, res) => {
  try {
    const { cropId, rating, comment } = req.body;
    const userId = req.user?._id;
    if (!cropId || !rating) return res.status(400).json({ success: false, message: "cropId and rating required" });

    const saved = await CropRating.findOneAndUpdate(
      { cropId, userId },
      { rating, comment, createdAt: new Date() },
      { upsert: true, new: true }
    );
    res.json({ success: true, data: saved });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// GET /api/market/ratings/:cropId – get average rating + all reviews
const getRatings = async (req, res) => {
  try {
    const { cropId } = req.params;
    const ratings = await CropRating.find({ cropId }).lean();
    const avg = ratings.length
      ? (ratings.reduce((s, r) => s + r.rating, 0) / ratings.length).toFixed(2)
      : null;
    res.json({ success: true, average: avg, count: ratings.length, ratings });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

module.exports = { submitRating, getRatings };
