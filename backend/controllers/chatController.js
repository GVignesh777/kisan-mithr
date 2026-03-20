const Conversation = require('../models/Conversation');

const mongoose = require('mongoose');

// Get all chats for a specific user
exports.getUserChats = async (req, res) => {
    try {
        const userId = req.params.userId;
        // if the userId isn't a valid ObjectId format, mongoose might throw. We can safely ignore or return empty
        if (!mongoose.Types.ObjectId.isValid(userId)) {
             return res.json({ chats: [] });
        }
        const chats = await Conversation.find({ userId }).sort({ updatedAt: -1 });
        res.json({ chats });
    } catch (error) {
        console.error('Error fetching user chats:', error);
        res.status(500).json({ error: 'Server error fetching chats' });
    }
};

// Create or update a specific chat
exports.saveChat = async (req, res) => {
    try {
        const { userId, chatId, title, messages } = req.body;

        // Clean frontend messages (frontend sends `timestamp: "10:30 AM"`, Mongoose expects a valid Date object)
        const sanitizedMessages = (messages || []).map(m => {
            return {
               role: m.role,
               content: m.content,
               // Omit timestamp string so mongoose uses the default Date.now, preventing validation crashes
            };
        });

        if (chatId && mongoose.Types.ObjectId.isValid(chatId)) {
            // Update existing chat
            const chat = await Conversation.findById(chatId);
            if (!chat) return res.status(404).json({ error: 'Chat not found' });
            
            chat.messages = sanitizedMessages;
            if (title) chat.title = title;
            await chat.save();
            return res.json({ message: 'Chat updated successfully', chat });
        } else {
            // Create brand new chat document
            if (!mongoose.Types.ObjectId.isValid(userId)) {
                 return res.status(400).json({ error: 'Invalid user ID' });
            }
            const chat = new Conversation({
                userId,
                title: title || 'New Conversation',
                messages: sanitizedMessages
            });
            await chat.save();
            return res.json({ message: 'Chat created successfully', chat });
        }
    } catch (error) {
        console.error('Error saving chat:', error);
        res.status(500).json({ error: 'Failed to save chat', details: error.message });
    }
};

// Delete a specific chat
exports.deleteChat = async (req, res) => {
    try {
        const { chatId } = req.params;
        await Conversation.findByIdAndDelete(chatId);
        res.json({ message: 'Chat deleted correctly' });
    } catch (error) {
        console.error('Error deleting chat:', error);
        res.status(500).json({ error: 'Failed to delete chat' });
    }
};
