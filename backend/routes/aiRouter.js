const express = require("express");
const aiResponse = require("../controllers/aiController");
const generateSpeech = require("../controllers/geminiTTSController");
const router = express.Router();


router.post("/ask-ai", aiResponse);

router.post("/tts", generateSpeech);

module.exports = router;