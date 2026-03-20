const Feedback = require('../models/Feedback');
const Notification = require('../models/Notification');

const submitFeedback = async (req, res) => {
  try {
    const { userName, message, userId } = req.body;

    if (!message) {
      return res.status(400).json({ message: 'Message is required' });
    }

    const feedback = new Feedback({
      userId: userId || null,
      userName: userName || 'Anonymous Farmer',
      message: message,
      status: 'pending'
    });

    await feedback.save();

    // Create a notification for the admin
    const notification = new Notification({
      title: 'New Feedback Received',
      message: `Farmer ${userName || 'Anonymous'} has submitted new feedback: "${message.substring(0, 50)}${message.length > 50 ? '...' : ''}"`,
      region: 'General',
      cropType: 'N/A',
      senderName: userName || 'Anonymous Farmer'
    });
    await notification.save();

    res.status(201).json({ 
      success: true, 
      message: 'Feedback submitted successfully! Our admin will review it soon.' 
    });
  } catch (error) {
    console.error('Error submitting feedback:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

module.exports = {
  submitFeedback
};
