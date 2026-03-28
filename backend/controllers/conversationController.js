const Conversation = require("../models/Conversation");
const response = require("../utils/responseHandler");


// to create new conversation
const createNewConversation = async (req, res) => {
    try {
        const { userId } = req.body;
        console.log(`[DB] Creating conversation for userId: ${userId} (Length: ${userId?.length})`);

        const conversation = await Conversation.create({
            userId,
            messages: []
        });
        console.log(`[DB] Successfully created conversation: ${conversation._id}`);

        res.json(conversation);
    } catch (err) {
        console.error(`[DB] Failed to create conversation: ${err.message}`);
        res.status(500).json({ error: err.message });
    }
}

// to add message to conversation

const addMessageInternal = async ({ conversationId, role, content }) => {
    if (!conversationId || !role || !content) {
        console.error(`[DB] addMessageInternal missing fields: ID=${conversationId}, Role=${role}, ContentLen=${content?.length}`);
        throw new Error("Missing required fields for internal message append");
    }

    console.log(`[DB] Finding conversation: ${conversationId}`);
    const conversation = await Conversation.findById(conversationId);
    if (!conversation) {
        console.error(`[DB] Conversation NOT FOUND: ${conversationId}`);
        throw new Error("Conversation not found");
    }

    // Push new message
    conversation.messages.push({
        role,
        content,
        timestamp: new Date()
    });

    console.log(`[DB] Appending message: Role=${role}, ContentLength=${content?.length}`);

    // 🟢 AUTO TITLE LOGIC
    if (
        role === "user" &&
        conversation.messages.filter(msg => msg.role === "user").length === 1
    ) {
        conversation.title = content
            .replace(/\n/g, " ")
            .trim()
            .slice(0, 40);
        console.log(`[DB] Set auto-title: ${conversation.title}`);
    }

    await conversation.save();
    console.log(`[DB] Successfully saved message to ${conversationId}`);
    return conversation;
};

const addMessageToConversation = async (req, res) => {
    try {
        const { conversationId, role, content } = req.body;
        
        // Use normalized role names
        const normalizedRole = role === 'ai' || role === 'assistant' ? 'assistant' : 'user';
        
        const conversation = await addMessageInternal({ conversationId, role: normalizedRole, content });

        res.status(200).json({
            success: true,
            conversation
        });

    } catch (error) {
        console.error("Add message error:", error);
        res.status(500).json({ error: error.message || "Server error" });
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
    getAllConversations,
    addMessageInternal
}