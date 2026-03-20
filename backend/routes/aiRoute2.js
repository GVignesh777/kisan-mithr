const express = require('express');
const {  askAI, generateAudio, transcribeAudio  } = require('../controllers/aiController2');
const multer = require('multer');
const upload = multer({ dest: 'uploads/' });

const router = express.Router();

router.post('/ask-ai', askAI);
router.post('/speak', generateAudio);
router.post('/transcript', upload.single('audio'), transcribeAudio);

module.exports = router;
