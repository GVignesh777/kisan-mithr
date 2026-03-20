// backend/controllers/geminiTTSController.js


const { GoogleGenAI } = require("@google/genai");

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
});

// Maximum characters per chunk for Gemini TTS
const MAX_CHUNK_LENGTH = 1000;

// Split long text into smaller chunks for TTS
function splitTextIntoChunks(text, maxLength = MAX_CHUNK_LENGTH) {
  const chunks = [];
  let start = 0;
  while (start < text.length) {
    let end = start + maxLength;
    if (end < text.length) {
      const lastSpace = text.lastIndexOf(" ", end);
      if (lastSpace > start) end = lastSpace;
    }
    chunks.push(text.slice(start, end));
    start = end;
  }
  return chunks;
}

// Select voice based on language
function getVoiceByLanguage(language) {
  switch ((language || "telugu").toLowerCase()) {
    case "english":
      return "Alloy";
    case "hindi":
      return "Surya";
    case "telugu":
    default:
      return "Leda"; // default Telugu voice
  }
}

const generateSpeech = async (req, res) => {
  try {
    const { text, language } = req.body;
    if (!text) return res.status(400).json({ error: "Text is required" });

    const voiceName = getVoiceByLanguage(language);
    const model = "gemini-2.5-flash-preview-tts";
    const chunks = splitTextIntoChunks(text);
    let audioParts = [];

    for (const chunk of chunks) {
      const config = {
        responseModalities: ["audio"],
        speechConfig: {
          voiceConfig: {
            prebuiltVoiceConfig: { voiceName },
          },
        },
      };

      const contents = [{ role: "user", parts: [{ text: chunk }] }];

      const responseStream = await ai.models.generateContentStream({
        model,
        config,
        contents,
      });

      for await (const data of responseStream) {
        const inlineData = data?.candidates?.[0]?.content?.parts?.[0]?.inlineData;
        if (inlineData && inlineData.data) {
          audioParts.push({ data: inlineData.data, mimeType: inlineData.mimeType });
        }
      }
    }

    if (audioParts.length === 0)
      return res.status(500).json({ error: "No audio generated" });

    // Convert all chunks to WAV and concatenate
    const buffers = audioParts.map((part) => convertToWav(part.data, part.mimeType));
    const finalBuffer = Buffer.concat(buffers);

    res.setHeader("Content-Type", "audio/wav");
    return res.send(finalBuffer);
  } catch (error) {
      if (error.status === 429) {
        return res.status(429).json({
          error: "Gemini TTS quota exceeded. Please wait for quota reset or upgrade your plan."
        });
      }
      console.error("Gemini TTS Error:", error);
      return res.status(500).json({ error: "Gemini TTS failed" });
    }
  };

  // Helper functions
  function convertToWav(rawData, mimeType) {
    const options = parseMimeType(mimeType);
    const wavHeader = createWavHeader(rawData.length, options);
    const buffer = Buffer.from(rawData, "base64");
    return Buffer.concat([wavHeader, buffer]);
  }

  function parseMimeType(mimeType) {
    const [fileType, ...params] = mimeType.split(";").map((s) => s.trim());
    const [, format] = fileType.split("/");
    const options = { numChannels: 1, sampleRate: 24000, bitsPerSample: 16 };
    for (const param of params) {
      const [key, value] = param.split("=");
      if (key === "rate") options.sampleRate = parseInt(value);
    }
    return options;
  }

  function createWavHeader(dataLength, options) {
    const { numChannels, sampleRate, bitsPerSample } = options;
    const byteRate = sampleRate * numChannels * bitsPerSample / 8;
    const blockAlign = numChannels * bitsPerSample / 8;
    const buffer = Buffer.alloc(44);

    buffer.write("RIFF", 0);
    buffer.writeUInt32LE(36 + dataLength, 4);
    buffer.write("WAVE", 8);
    buffer.write("fmt ", 12);
    buffer.writeUInt32LE(16, 16);
    buffer.writeUInt16LE(1, 20);
    buffer.writeUInt16LE(numChannels, 22);
    buffer.writeUInt32LE(sampleRate, 24);
    buffer.writeUInt32LE(byteRate, 28);
    buffer.writeUInt16LE(blockAlign, 32);
    buffer.writeUInt16LE(bitsPerSample, 34);
    buffer.write("data", 36);
    buffer.writeUInt32LE(dataLength, 40);

    return buffer;
  }

  module.exports = generateSpeech;