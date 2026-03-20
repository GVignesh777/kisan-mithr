const mongoose = require('mongoose');

const cropReportSchema = new mongoose.Schema({
  farmerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: false, // For now, allow anonymous if user not logged in
  },
  imageUrl: {
    type: String,
    required: true,
  },
  cropName: {
    type: String,
    required: true,
  },
  detectedDisease: {
    type: String,
    required: true,
  },
  confidenceScore: {
    type: Number,
  },
  treatmentSuggested: {
    type: String,
  },
  location: {
    type: String,
  },
  status: {
    type: String,
    enum: ['pending', 'verified', 'incorrect'],
    default: 'pending',
  }
}, { timestamps: true });

module.exports = mongoose.model('CropReport', cropReportSchema);
