const User = require('../../models/User');
const CropAnalysis = require('../../models/CropAnalysis');
const Conversation = require('../../models/Conversation');
const Image = require('../../models/Image');

const getDashboardStats = async (req, res) => {
  try {
    const totalFarmers = await User.countDocuments();
    const totalQueries = await Conversation.countDocuments();
    const totalDiseaseReports = await CropAnalysis.countDocuments();
    const totalImages = await Image.countDocuments();
    
    // Just a sample logic for active users today
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);
    const activeUsersToday = await User.countDocuments({ updatedAt: { $gte: startOfDay } });

    res.json({
      totalFarmers,
      totalQueries,
      totalDiseaseReports,
      totalImages,
      activeUsersToday
    });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching stats', error: error.message });
  }
};

module.exports = {
  getDashboardStats
};
