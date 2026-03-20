const mongoose = require('mongoose');

const imageSchema = new mongoose.Schema({
  farmerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
  imageUrl: {
    type: String,
    required: true,
  },
  purpose: {
    type: String, // e.g., 'disease_detection', 'profile_picture'
    default: 'disease_detection',
  },
  status: {
    type: String,
    enum: ['active', 'inappropriate', 'deleted'],
    default: 'active',
  }
}, { timestamps: true });

module.exports = mongoose.model('Image', imageSchema);
