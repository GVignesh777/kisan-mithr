const mongoose = require("mongoose");

const cropSchema = new mongoose.Schema({
  farmerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  name: {
    type: String,
    required: true,
  },
  variety: {
    type: String,
  },
  plantedAcreage: {
    type: Number,
    required: true,
  },
  plantingDate: {
    type: Date,
    required: true,
  },
  expectedHarvestDate: {
    type: Date,
  },
  status: {
    type: String,
    enum: ["Active", "Harvested", "Failed"],
    default: "Active",
  }
}, { timestamps: true });

module.exports = mongoose.model("Crop", cropSchema);
