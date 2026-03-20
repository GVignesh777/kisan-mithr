// routes/conversation.js
const express = require("express");
const router = express.Router();
const conversationController = require("../controllers/conversationController");

// Create new chat
router.post("/create", conversationController.createNewConversation);

// Add message to chat
router.post("/addMessage", conversationController.addMessageToConversation);

// Get all chats
router.get("/user/:userId", conversationController.getAllConversations);

module.exports = router;