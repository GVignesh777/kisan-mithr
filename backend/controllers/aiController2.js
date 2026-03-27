const Groq = require('groq-sdk');
const {  ElevenLabsClient  } = require('elevenlabs');
const dotenv = require('dotenv');
const User = require('../models/User');
const axios = require('axios');
const { EdgeTTS } = require('edge-tts-universal');
const fs = require('fs');
const path = require('path');
const mongoose = require('mongoose');

dotenv.config();

const groq = new Groq({
    apiKey: process.env.GROQ_API_KEY
});

const Conversation = require('../models/Conversation');

exports.askAI = async (req, res) => {
    try {
        const { userMessage, message, language, userId, chatId } = req.body;
        const finalMessage = message || userMessage;

        if (!finalMessage) {
            return res.status(400).json({ error: 'message or userMessage is required' });
        }

        // Determine language context
        let langContext = "English";
        if (language === "te-IN" || language === "Telugu") langContext = "Telugu";
        else if (language === "hi-IN" || language === "Hindi") langContext = "Hindi";

        // 1. Fetch History Memory (Gemini-style session persistence)
        let history = [];
        if (chatId && mongoose.Types.ObjectId.isValid(chatId)) {
            try {
                const conv = await Conversation.findById(chatId);
                if (conv && conv.messages) {
                    // Map history to OpenAI/Groq format (user/assistant)
                    history = conv.messages.slice(-6).map(m => ({
                        role: m.role === 'ai' ? 'assistant' : m.role,
                        content: m.content
                    }));
                }
            } catch (e) { console.log("History fetch failed:", e); }
        }

        // 2. Fetch Farm Context
        let farmContextString = "No farm profile available for this user.";
        let userLocation = "Unknown";
        if (userId) {
            try {
                const user = await User.findById(userId);
                const profile = user?.farmProfile;
                if (profile && (profile.cropType !== 'Unknown' || profile.soilType !== 'Unknown')) {
                    userLocation = profile.farmLocation || "Unknown";
                    farmContextString = `USER'S FARM PROFILE:
                    - Soil Type: ${profile.soilType}
                    - Irrigation: ${profile.irrigationMethod}
                    - Land Size: ${profile.landSize}
                    - Current Crops: ${profile.cropType}
                    - Location: ${userLocation}`;
                }
            } catch(e) { console.log('Error fetching user for AI context:', e); }
        }

        // 3. Live Context (Weather & Market)
        let weatherContextString = `Weather data unavailable.`;
        try {
            const loc = userLocation !== "Unknown" ? userLocation : "Warangal";
            const wRes = await axios.get(`http://localhost:5001/api/weather/${loc}`);
            const wData = wRes.data;
            if (wData.current && wData.forecast) {
                weatherContextString = `CURRENT WEATHER CONTEXT FOR ${wData.location}:
                - Today: ${wData.current.temp}°C, Condition: ${wData.current.condition}, ${wData.current.rainProb}% Rain Prob, Wind ${wData.current.windSpeed} km/h.
                - Tomorrow: ${wData.forecast[1].temp}°C, Condition: ${wData.forecast[1].condition}, ${wData.forecast[1].rainProb}% Rain Prob.`;
            }
        } catch (e) {}

        let marketContextString = `Market data unavailable.`;
        try {
            const mRes = await axios.get(`http://localhost:5001/api/market`);
            const mData = mRes.data;
            if (mData.data && mData.data.length > 0) {
                const pricesLines = mData.data.map(item => `- ${item.name} (${item.variety}) in ${item.market}: ₹${item.modalPrice}/Quintal`).join('\n                ');
                marketContextString = `CURRENT LIVE MARKET PRICES:
                ${pricesLines}`;
            }
        } catch (e) {}

        // 4. NEW USER-SPECIFIC MEMORY SYSTEM (Gemini Voice Style)
        let userName = "User";
        let userBio = "No additional bio available.";
        if (userId) {
            try {
                const user = await User.findById(userId);
                userName = user?.username || user?.googleName || "Valued Farmer";
                userBio = user?.about || "No additional bio available.";
            } catch (e) {}
        }

        const historyString = history.length > 0 
            ? history.map(h => `${h.role === 'user' ? 'User' : 'Assistant'}: ${h.content}`).join('\n')
            : "No previous relevant messages in this session.";

        const systemPrompt = `You are an advanced AI voice assistant for "Kisan Mithr", designed ONLY to help with agriculture and farming-related topics, while maintaining strict private memory for each user.

--------------------------------------------------
🌾 DOMAIN RESTRICTION (STRICT)
--------------------------------------------------
You must ONLY respond to queries related to:
- Farming and agriculture (crops, plants, trees, soil, fertilizers, irrigation).
- Pest control, crop diseases, and weather impact on farming.
- Government schemes for farmers and agricultural market prices.

If the user asks anything outside these topics (e.g., general chat, non-farming news, etc.):
→ Politely refuse and guide them back.
Example: "I'm here to help with farming and agriculture-related questions. Please ask something related to that."

--------------------------------------------------
🔐 USER MEMORY & ISOLATION (STRICT)
--------------------------------------------------
User ID: ${userId || 'Unknown'}
Location: ${userLocation}

Use ONLY this user's data and history. NEVER mix data between users.
- Persistent Context: ${userBio !== "No additional bio available." ? userBio : "No bio provided."}
- Farm Profile: ${farmContextString}
- Recent Weather: ${weatherContextString}
- Market Prices: ${marketContextString}

Recent Conversation History:
${historyString}

--------------------------------------------------
🎯 BEHAVIOR & STYLE (Gemini Style)
--------------------------------------------------
- Act as a practical agriculture expert. Use simple, clear, and useful explanations.
- Understand intent even if input is messy. Maintain continuity naturally if relevant to agriculture.
- NO MARKDOWN: Never use #, *, or ** symbols. Use spoken words for structure.
- NO SYSTEM TALK: Never mention "memory", "database", or "user ID".
- VOICE FIRST: Use short, clear sentences optimized for speech synthesis.

--------------------------------------------------
⚠️ SAFETY
--------------------------------------------------
- Do not give harmful or unsafe farming advice.
- For chemicals/diseases, add: "I’m not completely sure, but I suggest consulting a local plant doctor before taking action."

Your goal is to act as a secure, personalized, agriculture-only voice assistant. Provide a professional Gemini-style spoken response.`;

        const chatCompletion = await groq.chat.completions.create({
            messages: [
                { role: 'system', content: systemPrompt },
                ...history,
                { role: 'user', content: finalMessage }
            ],
            model: 'llama-3.3-70b-versatile',
            temperature: 0.65,
            max_tokens: 600,
        });

        const responseText = chatCompletion.choices[0]?.message?.content || "I am currently unable to process your request. Please try again.";

        res.json({ response: responseText });
    } catch (error) {
        console.error('Groq AI Error:', error);
        res.status(500).json({ error: 'Failed to generate AI response' });
    }
};

// Instantiate clients outside so they aren't recreated
let elevenlabs = null;
let edgeTtsClient = null;

exports.generateAudio = async (req, res) => {
    try {
        if (!elevenlabs) {
            elevenlabs = new ElevenLabsClient({ apiKey: process.env.ELEVENLABS_API_KEY });
        }

        const { text, language, voice } = req.body;
        
        if (!text) {
             return res.status(400).json({ error: 'text is required' });
        }

        // Helper to detect script based on Unicode ranges (Telugu: \u0C00-\u0C7F, Hindi: \u0900-\u097F)
        const detectLanguageFromText = (input) => {
            if (/[\u0C00-\u0C7F]/.test(input)) return 'te-IN';
            if (/[\u0900-\u097F]/.test(input)) return 'hi-IN';
            return null;
        };

        const detectedLang = detectLanguageFromText(text);
        const effectiveLang = detectedLang || language;

        console.log(`[TTS] Text: "${text.substring(0, 50)}..."`);
        console.log(`[TTS] Detected: ${detectedLang}, Requested: ${language}, Effective: ${effectiveLang}, Override: ${voice}`);

        // Clean up text so TTS voice doesn't read markdown symbols
        let cleanTextForTts = text
            .replace(/[#*`~_|>\[\]()\-]/g, "")
            .replace(/•/g, "")
            .replace(/^- /gm, "")
            .replace(/^\d+\.\s/gm, "")
            .replace(/\n\n/g, ". ")
            .replace(/\n/g, " ")
            .replace(/\./g, ". ") 
            .replace(/\bAI\b/g, "A I")
            .replace(/Kisan Mithr AI/g, "Kisan Mithr");

        // Language-specific adjustments
        if (effectiveLang === 'en-IN' || effectiveLang === 'English') {
            cleanTextForTts = cleanTextForTts
                .replace(/(\d+)%/g, "$1 percent") 
                .replace(/(\d+):(\d+):(\d+)/g, "$1 to $2 to $3");
        }

        cleanTextForTts = cleanTextForTts
            .replace(/\s+/g, " ")
            .trim(); 

        // Default Voices
        let voiceId = "NFG5qt843uXKj4pFvR7C"; // Bella (English)
        
        if (effectiveLang === 'hi-IN' || effectiveLang === 'Hindi') {
             voiceId = "pNInz6obbfDQGcgMyIGC"; // Adam (Hindi)
        } else if (effectiveLang === 'te-IN' || effectiveLang === 'Telugu') {
             voiceId = "RXe6OFmxoC0nlSWpuCDy"; // Aman (Telugu)
        }

        // Voice Overrides
        if (voice === 'Tiya Maria') {
            voiceId = "RKj1DIXprh8zdvjllfhJ"; // Tiya Maria - Horror Storyteller
        }

        try {
            if (!elevenlabs) {
                elevenlabs = new ElevenLabsClient({ apiKey: process.env.ELEVENLABS_API_KEY });
            }

            const audioStream = await elevenlabs.generate({
                voice: voiceId,
                text: cleanTextForTts,
                model_id: "eleven_multilingual_v2",
                output_format: "mp3_44100_128",
            });

            // Set headers for audio stream
            res.setHeader('Content-Type', 'audio/mpeg');
            res.setHeader('Transfer-Encoding', 'chunked');

            // Evaluate stream type and pipe correctly
            if (audioStream.pipe) {
                 audioStream.pipe(res);
            } else {
                 for await (const chunk of audioStream) {
                      res.write(chunk);
                 }
                 res.end();
            }
        } catch (elevenError) {
            console.error('ElevenLabs failed or quota reached. Falling back to Edge-TTS:', elevenError.message);
            
            if (!edgeTtsClient) {
                // edge-tts-universal uses a constructor with (text, voice, options)
                // but we can create a minimalist instance and then call synthesize
                console.log(`[TTS] Using Edge-TTS as fallback for ${effectiveLang}`);
            }

            // Map languages to high-quality Microsoft Edge voices
            let edgeVoice = "en-IN-PrabhatNeural"; // Default Indian English
            if (effectiveLang === 'hi-IN' || effectiveLang === 'Hindi') {
                edgeVoice = "hi-IN-MadhurNeural"; // Natural Hindi Male
            } else if (effectiveLang === 'te-IN' || effectiveLang === 'Telugu') {
                edgeVoice = "te-IN-MohanNeural"; // Natural Telugu Male
            }

            const tts = new EdgeTTS(cleanTextForTts, edgeVoice, {
                rate: "+0%",
                pitch: "+0Hz"
            });
            
            const { audio } = await tts.synthesize();
            const arrayBuffer = await audio.arrayBuffer();
            const buffer = Buffer.from(arrayBuffer);

            res.setHeader('Content-Type', 'audio/mpeg');
            res.setHeader('Content-Length', buffer.length);
            res.end(buffer);
        }
        
    } catch (error) {
        console.error('TTS General Error:', error);
        res.status(500).json({ error: 'Failed to generate speech' });
    }
};

exports.transcribeAudio = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: 'No audio file provided' });
        }

        const transcription = await groq.audio.transcriptions.create({
            file: fs.createReadStream(req.file.path),
            model: "whisper-large-v3",
            prompt: "The user is an Indian farmer speaking in a mix of English, Telugu, and Hindi (Hinglish/Tenglish). Accurately capture the code-switching.",
            response_format: "json"
        });

        // Cleanup temporary file
        fs.unlinkSync(req.file.path);

        res.json({ text: transcription.text });
    } catch (error) {
        console.error('Groq Transcription Error:', error);
        if (req.file && fs.existsSync(req.file.path)) fs.unlinkSync(req.file.path);
        res.status(500).json({ error: 'Failed to transcribe audio' });
    }
};
