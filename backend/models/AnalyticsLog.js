const mongoose = require('mongoose');

const analyticsLogSchema = new mongoose.Schema({
  eventType: {
    type: String,
    required: true, // e.g., 'AI_QUERY', 'IMAGE_UPLOAD', 'LOGIN'
  },
  metadata: {
    type: mongoose.Schema.Types.Mixed, // flexible data
  },
  timestamp: {
    type: Date,
    default: Date.now,
  }
});

module.exports = mongoose.model('AnalyticsLog', analyticsLogSchema);
