const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  message: {
    type: String,
    required: true,
  },
  region: {
    type: String,
  },
  cropType: {
    type: String,
  },
  isRead: {
    type: Boolean,
    default: false,
  },
  senderName: {
    type: String,
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Admin',
  }
}, { timestamps: true });

module.exports = mongoose.model('Notification', notificationSchema);
