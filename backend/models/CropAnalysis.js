const mongoose = require('mongoose');

const cropAnalysisSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: false // Allow anonymous scans if desired, but recommended logged in
  },
  imageURL: {
    type: String, // Store Cloudinary URL or Base64 string if local
    required: false
  },
  cropName: {
    type: String,
    required: true
  },
  disease: {
    type: String,
    required: true
  },
  confidence: {
    type: String,
    enum: ['Low', 'Medium', 'High'],
    default: 'Medium'
  },
  symptoms: { type: String },
  cause: { type: String },
  treatment: { type: String },
  prevention: { type: String },
  organic_solution: { type: String },
  chemical_solution: { type: String },
  safety_advice: { type: String },
  disclaimer: { type: String },
  location: { type: String },
  status: {
    type: String,
    enum: ['pending', 'verified', 'incorrect'],
    default: 'pending'
  },
  date: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('CropAnalysis', cropAnalysisSchema);
