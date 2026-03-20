const Conversation = require('../../models/Conversation');

const getConversations = async (req, res) => {
  try {
    const conversations = await Conversation.find({})
      .populate('userId', 'name phone email')
      .sort({ updatedAt: -1 });
    res.json(conversations);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching conversations', error: error.message });
  }
};

module.exports = {
  getConversations
};
