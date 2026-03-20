const Groq = require('groq-sdk');
const {  ElevenLabsClient  } = require('elevenlabs');
const dotenv = require('dotenv');
const User = require('../models/User');
const axios = require('axios');
const { EdgeTTS } = require('edge-tts-universal');
const fs = require('fs');
const path = require('path');

dotenv.config();

const groq = new Groq({
    apiKey: process.env.GROQ_API_KEY
});

exports.askAI = async (req, res) => {
    try {
        const { userMessage, language, userId } = req.body;

        if (!userMessage) {
            return res.status(400).json({ error: 'userMessage is required' });
        }

        // Determine the target language context for the prompt
        let langContext = "English";
        if (language === "te-IN" || language === "Telugu") langContext = "Telugu";
        else if (language === "hi-IN" || language === "Hindi") langContext = "Hindi";

        // Fetch Farm Context if User is present
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

        // Live Weather Context Injection
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
        } catch (e) {
            console.log("Failed to fetch weather for AI:", e.message);
        }

        // Live Market Prices Context Injection
        let marketContextString = `Market data unavailable.`;
        try {
            const mRes = await axios.get(`http://localhost:5001/api/market`);
            const mData = mRes.data;
            if (mData.data && mData.data.length > 0) {
                const pricesLines = mData.data.map(item => `- ${item.name} (${item.variety}) in ${item.market}: ₹${item.modalPrice}/Quintal`).join('\n                ');
                marketContextString = `CURRENT LIVE MARKET PRICES:
                ${pricesLines}`;
            }
        } catch (e) {
            console.log("Failed to fetch market data for AI:", e.message);
        }

        const systemPrompt = `You are "Kisan Mithr", an intelligent AI Voice Assistant designed to help farmers in India, especially in Telangana and Andhra Pradesh.
Your goal is to assist farmers with clear, practical, and easy-to-understand information related to agriculture.

--------------------------------------------------
CONTEXT (Weather, Market, Farm Profile)
--------------------------------------------------
${farmContextString}
${weatherContextString}
${marketContextString}

IMPORTANT BEHAVIOR RULES:
1. Speak like a friendly human helper, not like a robot.
2. Use simple language that farmers can easily understand.
3. Keep answers short, practical, and helpful.
4. If possible, speak in conversational style like talking to a farmer.
5. Avoid complicated scientific terms.
6. If you are not fully sure, politely say that the farmer should consult a local agriculture officer or plant doctor.

VOICE STYLE:
- Talk naturally like a human assistant. Sound supportive and respectful.
- Use short sentences suitable for voice output. Do not give very long paragraphs.

LANGUAGE HANDLING:
- If the farmer asks in English, reply in simple English.
- If the farmer asks in Telugu, reply in simple Telugu.
- If the farmer asks in Hindi, reply in Hindi.
- If the farmer uses a mix of languages (e.g., English-Telugu, English-Hindi, or Telugu-Hindi), identify the primary language they are most comfortable with and reply in that language, or use a natural "Hinglish" or "Tenglish" blend that sounds like a friendly human conversion.
- Always match the farmer's tone and level of comfort. Current detected language target: ${langContext}.

CROP PLANNING & COSTS:
- If a farmer asks about growing a specific crop or plant, provide a breakdown of maintenance costs (seeds, labor, fertilizer), potential profit, and risks.

IMPORTANT SAFETY MESSAGE:
When giving pest or disease treatment advice, always include: "AI advice may not always be perfect. Please consult a local agriculture officer or plant doctor before using chemicals."

Do not sound robotic. Respond in a natural conversational way. Focus on helping farmers quickly.`;

        const chatCompletion = await groq.chat.completions.create({
            messages: [
                { role: 'system', content: systemPrompt },
                { role: 'user', content: userMessage }
            ],
            model: 'llama-3.3-70b-versatile',
            temperature: 0.6,
            max_tokens: 500,
        });

        const responseText = chatCompletion.choices[0]?.message?.content || "I'm sorry, I couldn't process your request at the moment.";

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
