const express = require('express');
const {  askAI, generateAudio, transcribeAudio, overviewChat  } = require('../controllers/aiController2');
const multer = require('multer');
const upload = multer({ dest: 'uploads/' });

const router = express.Router();

router.post('/ask-ai', askAI);
router.post('/overview-chat', overviewChat);
router.post('/speak', generateAudio);
router.post('/transcript', upload.single('audio'), transcribeAudio);

module.exports = router;
