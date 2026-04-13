const Notification = require('../../models/Notification');
const Feedback = require('../../models/Feedback');

// NOTIFICATIONS
const getNotifications = async (req, res) => {
  try {
    const notifications = await Notification.find({}).sort({ createdAt: -1 });
    res.json(notifications);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching notifications' });
  }
};

const createNotification = async (req, res) => {
  try {
    const { title, message, region, cropType } = req.body;
    const notification = new Notification({
      title, message, region, cropType, createdBy: req.user._id
    });
    await notification.save();

    // Emit real-time notification via Socket.io
    const io = req.app.get('io');
    if (io) {
      if (region && region !== "Global") {
        io.to(region).emit('new-notification', notification);
      } else {
        io.emit('new-notification', notification);
      }
    }

    res.status(201).json(notification);
  } catch (error) {
    res.status(500).json({ message: 'Error creating notification' });
  }
};

const deleteNotification = async (req, res) => {
  try {
    await Notification.findByIdAndDelete(req.params.id);
    res.json({ message: 'Notification deleted' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting notification' });
  }
};


// FEEDBACK
const getFeedback = async (req, res) => {
  try {
    const feedback = await Feedback.find({}).populate('userId', 'name').sort({ createdAt: -1 });
    res.json(feedback);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching feedback' });
  }
};

const getSystemHealth = async (req, res) => {
  try {
    // In a real app, logic to check database health, server uptime, CPU/Memory would go here
    const health = {
      apiStatus: 'Operational',
      mongodbStatus: 'Connected',
      serverUptime: process.uptime(),
      memoryUsage: process.memoryUsage(),
    };
    res.json(health);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching health' });
  }
};

const getUnreadNotificationsCount = async (req, res) => {
  try {
    const count = await Notification.countDocuments({ isRead: false });
    const latest = await Notification.findOne({ isRead: false }).sort({ createdAt: -1 });
    res.json({ 
      count, 
      latestMessage: latest ? latest.message : null,
      latestSender: latest ? latest.senderName : null
    });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching unread count' });
  }
};

const markNotificationAsRead = async (req, res) => {
  try {
    const { id } = req.params;
    if (id === 'all') {
      await Notification.updateMany({ isRead: false }, { isRead: true });
    } else {
      await Notification.findByIdAndUpdate(id, { isRead: true });
    }
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ message: 'Error marking notification as read' });
  }
};

module.exports = {
  getNotifications, createNotification, deleteNotification,
  getFeedback,
  getSystemHealth,
  getUnreadNotificationsCount,
  markNotificationAsRead
};
