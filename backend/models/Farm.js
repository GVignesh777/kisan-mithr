const mongoose = require("mongoose");

const farmSchema = new mongoose.Schema({
  farmerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  landSize: {
    type: Number,
    required: true,
  },
  landUnit: {
    type: String,
    enum: ["Acres", "Hectares", "Bigha"],
    default: "Acres",
  },
  location: {
    type: String,
  },
  soilType: {
    type: String,
  },
  farmType: {
    type: String,
    enum: ["Organic", "Conventional", "Greenhouse", "Mixed"],
    default: "Conventional",
  }
}, { timestamps: true });

module.exports = mongoose.model("Farm", farmSchema);
