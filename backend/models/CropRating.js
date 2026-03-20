const mongoose = require("mongoose");

const cropRatingSchema = new mongoose.Schema({
  cropId:    { type: String, required: true }, // commodity + market combo
  userId:    { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  rating:    { type: Number, min: 1, max: 5, required: true },
  comment:   { type: String, maxlength: 500 },
  createdAt: { type: Date, default: Date.now }
});

cropRatingSchema.index({ cropId: 1, userId: 1 }, { unique: true });

module.exports = mongoose.model("CropRating", cropRatingSchema);
