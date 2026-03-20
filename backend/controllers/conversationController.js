const Conversation = require("../models/Conversation");
const response = require("../utils/responseHandler");


// to create new conversation
const createNewConversation = async (req, res) => {
    try {
        const { userId } = req.body;
        console.log("userId is conv:", userId);

        const conversation = await Conversation.create({
            userId,
            messages: []
        });
        console.log("conversation is conv:", conversation);

        res.json(conversation);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
}

// to add message to conversation

const addMessageToConversation = async (req, res) => {
    try {
        const { conversationId, role, content } = req.body;

        if (!conversationId || !role || !content) {
            if(!conversationId) {
                res.status(400).json({ error: "Missing conversationId" });
            } else if(!role) {
                res.status(400).json({ error: "Missing role" });
            } else if(!content) {
                res.status(400).json({ error: "Missing content" });
            }
            return res.status(400).json({ error: "Missing required fields" });
        }

        console.log("conversationId is conv:", conversationId);
        console.log("role is conv:", role);
        console.log("content is conv:", content);

        const conversation = await Conversation.findById(conversationId);
        console.log("conversation is conv:", conversation);


        if (!conversation) {
            return res.status(404).json({ error: "Conversation not found" });
        }

        // Push new message
        conversation.messages.push({
            role,
            content,
            timestamp: new Date()
        });

        // 🟢 AUTO TITLE LOGIC
        // If this is the FIRST user message → set title
        if (
            role === "user" &&
            conversation.messages.filter(msg => msg.role === "user").length === 1
        ) {
            conversation.title = content
                .replace(/\n/g, " ")
                .trim()
                .slice(0, 40);
        }

        await conversation.save();

        res.status(200).json({
            success: true,
            conversation
        });

    } catch (error) {
        console.error("Add message error:", error);
        res.status(500).json({ error: "Server error" });
    }
}

// to get all conversations

const getAllConversations = async (req, res) => {
    try {

        const conversations = await Conversation.find({
            userId: req.params.userId
        }).sort({ updatedAt: -1 });

        res.json(conversations);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
}

module.exports = {
    createNewConversation,
    addMessageToConversation,
    getAllConversations
}