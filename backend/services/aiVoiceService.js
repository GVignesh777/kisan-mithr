const axios = require("axios");
const fs = require("fs");
const path = require("path");

const ELEVENLABS_API_KEY = process.env.ELEVENLABS_API_KEY; // save in .env

async function generateVoice(text, voice = "Rachel") {
  try {
    const response = await axios.post(
      `https://api.elevenlabs.io/v1/text-to-speech/${voice}`,
      {
        text: text,
        voice_settings: {
          stability: 0.5, // controls voice variation
          similarity_boost: 0.7 // closer to human voice
        }
      },
      {
        headers: {
          "xi-api-key": ELEVENLABS_API_KEY,
          "Content-Type": "application/json",
          "Accept": "audio/mpeg"
        },
        responseType: "arraybuffer" // important to get audio
      }
    );

    // Save audio to server
    const audioPath = path.join(__dirname, "voice.mp3");
    fs.writeFileSync(audioPath, response.data);
    return audioPath; // return path to play in frontend
  } catch (err) {
    console.error("TTS Error:", err.response?.data || err.message);
    return null;
  }
}

module.exports = { generateVoice };