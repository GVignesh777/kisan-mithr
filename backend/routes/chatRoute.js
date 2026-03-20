const express = require('express');
const {  getUserChats, saveChat, deleteChat  } = require('../controllers/chatController');

const router = express.Router();

router.get('/:userId', getUserChats);
router.post('/save', saveChat); // Allows both creation and updates
router.delete('/:chatId', deleteChat);

module.exports = router;
