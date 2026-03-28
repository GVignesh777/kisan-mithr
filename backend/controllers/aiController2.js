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

        const systemPrompt = `You are an advanced AI voice assistant for "Kisan Mithr", designed ONLY to help with agriculture and farming-related topics.

Your responses must adapt dynamically based on the user's question.

Rules:
- If the question is simple, factual, or yes/no → respond in ONE SHORT sentence.
- If the question needs explanation → respond in 2–4 short sentences.
- If the question is complex → respond in multiple short sentences, clearly broken into separate lines.
- Always prefer SHORT, NATURAL, SPOKEN language.
- Avoid long paragraphs.
- Use line breaks to create natural pauses for speech.
- Do NOT over-explain.
- Do NOT include unnecessary details unless asked.
- Make responses sound like a human speaking, not writing.

Voice Optimization Rules:
- Each sentence should be easy to convert into speech.
- Keep sentences under 12–15 words.
- Use simple and clear words.
- Add natural conversational starters when appropriate (like “Okay,” “So,” “Here’s the thing,”).

Output Formatting:
- Each sentence MUST be on a new line.
- Ensure responses can be split easily for text-to-speech chunking.
- NO MARKDOWN: Never use #, *, or ** symbols. Use spoken words for structure.
- TEXT-ONLY: Do not include formatting symbols that are not meant to be spoken.

--------------------------------------------------
🌾 DOMAIN RESTRICTION (STRICT)
--------------------------------------------------
You must ONLY respond to queries related to:
- Farming and agriculture (crops, plants, trees, soil, fertilizers, irrigation).
- Pest control, crop diseases, and weather impact on farming.
- Government schemes for farmers and agricultural market prices.

If the user asks anything outside these topics or if the input seems disconnected from farming:
→ Politely refuse and guide them back.
Example: "I'm here to help with farming and agriculture-related questions. Please ask something related to that."

--------------------------------------------------
🔐 USER CONTEXT (HISTORY & DATA)
--------------------------------------------------
User ID: ${userId || 'Unknown'}
Location: ${userLocation}
Farm Profile: ${farmContextString}
Recent Weather: ${weatherContextString}
Market Prices: ${marketContextString}

Recent Conversation History:
${historyString}

Always prioritize SPEED, CLARITY, and VOICE-FRIENDLY output.`;

        const chatCompletion = await groq.chat.completions.create({
            messages: [
                { role: 'system', content: systemPrompt },
                ...history,
                { role: 'user', content: finalMessage }
            ],
            model: 'llama-3.1-8b-instant',
            temperature: 0.65,
            stream: true,
            max_tokens: 600,
        });

        res.setHeader('Content-Type', 'text/plain; charset=utf-8');
        res.setHeader('Transfer-Encoding', 'chunked');

        for await (const chunk of chatCompletion) {
            const content = chunk.choices[0]?.delta?.content || "";
            if (content) {
                res.write(content);
            }
        }
        res.end();
    } catch (error) {
        console.error('Groq AI Error:', error);
        if (!res.headersSent) {
            res.status(500).json({ error: 'Failed to generate AI response' });
        } else {
            res.end();
        }
    }
};

// Instantiate clients outside so they aren't recreated
let elevenlabs = null;
let edgeTtsClient = null;

// Helper to create a valid WAV header for raw PCM data
const createWavHeader = (dataLength, sampleRate = 16000) => {
    const header = Buffer.alloc(44);
    header.write("RIFF", 0);
    header.writeUInt32LE(dataLength + 36, 4); // Total file size - 8
    header.write("WAVE", 8);
    header.write("fmt ", 12);
    header.writeUInt32LE(16, 16); // Header size
    header.writeUInt16LE(1, 20); // PCM format
    header.writeUInt16LE(1, 22); // Mono
    header.writeUInt32LE(sampleRate, 24);
    header.writeUInt32LE(sampleRate * 2, 28); // Byte rate
    header.writeUInt16LE(2, 32); // Block align
    header.writeUInt16LE(16, 34); // Bits per sample
    header.write("data", 36);
    header.writeUInt32LE(dataLength, 40);
    return header;
};

exports.generateAudio = async (req, res) => {
    try {
        // Force reload .env values from absolute path in case server is started from root
        dotenv.config({ path: path.join(__dirname, '../.env'), override: true });
        
        // Re-initialize client each time to ensure the latest API key is used
        const apiKey = process.env.ELEVENLABS_API_KEY?.trim();
        console.log(`[TTS] Initializing ElevenLabs with Key Length: ${apiKey?.length || 0}`);
        elevenlabs = new ElevenLabsClient({ apiKey });

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

        // Default Voices (Verified for Free Tier)
        let voiceId = "EXAVITQu4vr4xnSDxMaL"; // Sarah (English / Generic)
        
        if (effectiveLang === 'hi-IN' || effectiveLang === 'Hindi') {
             voiceId = "LEWCqaZJ8aD94fSLZit1"; // Hindi Expert (User Provided ID)
        } else if (effectiveLang === 'te-IN' || effectiveLang === 'Telugu') {
             voiceId = "HH8sIQq8WOcER3Nu118i"; // Telugu Expert (User Provided ID)
        }

        // Voice Overrides
        if (voice === 'George') voiceId = "JBFqnCBsd6RMkjVDRZzb";
        if (voice === 'Sarah') voiceId = "EXAVITQu4vr4xnSDxMaL";
        if (voice === 'Charlie') voiceId = "IKne3meq5aSn9XLyUdCD";
        if (voice === 'Hindi Expert') voiceId = "LEWCqaZJ8aD94fSLZit1";
        if (voice === 'Telugu Expert') voiceId = "HH8sIQq8WOcER3Nu118i";
        

        // Level 1: Sarvam AI (Primary)
        if (process.env.SARVAM_API_KEY) {
            try {
                console.log(`[TTS] Trying Sarvam AI for ${effectiveLang}...`);
                
                // Chunk text into <= 500 character segments (Sarvam Limit)
                const maxChars = 450; 
                const textChunks = [];
                let remainingText = cleanTextForTts;
                
                while (remainingText.length > 0) {
                    if (remainingText.length <= maxChars) {
                        textChunks.push(remainingText);
                        break;
                    }
                    
                    // Try to find a good break point (period, space)
                    let breakPoint = remainingText.lastIndexOf('. ', maxChars);
                    if (breakPoint === -1) breakPoint = remainingText.lastIndexOf(' ', maxChars);
                    if (breakPoint === -1) breakPoint = maxChars;
                    
                    textChunks.push(remainingText.substring(0, breakPoint).trim());
                    remainingText = remainingText.substring(breakPoint).trim();
                }

                const pcmBuffers = [];
                const sampleRate = 22050; // High-quality requested rate

                for (const chunk of textChunks) {
                    console.log(`[TTS] Requesting Sarvam PCM chunk (${chunk.length} chars)`);
                    const sarvamResponse = await axios.post('https://api.sarvam.ai/text-to-speech', {
                        inputs: [chunk],
                        target_language_code: effectiveLang === 'en-IN' ? 'en-IN' : (effectiveLang === 'hi-IN' ? 'hi-IN' : 'te-IN'),
                        speaker: 'sunny', 
                        model: 'bulbul:v3',
                        audio_format: 'linear16',
                        sample_rate: sampleRate,
                        pace: 1.1,
                        enable_preprocessing: true
                    }, {
                        headers: { 'api-subscription-key': process.env.SARVAM_API_KEY }
                    });

                    if (sarvamResponse.data && sarvamResponse.data.audios && sarvamResponse.data.audios[0]) {
                        pcmBuffers.push(Buffer.from(sarvamResponse.data.audios[0], 'base64'));
                    }
                }

                if (pcmBuffers.length > 0) {
                    const combinedPcm = Buffer.concat(pcmBuffers);
                    const wavHeader = createWavHeader(combinedPcm.length, sampleRate);
                    const finalWav = Buffer.concat([wavHeader, combinedPcm]);
                    
                    console.log(`[TTS] Sarvam Success. Total Audio Size: ${finalWav.length} bytes`);
                    res.setHeader('Content-Type', 'audio/wav');
                    return res.send(finalWav);
                }
            } catch (sarvamError) {
                console.error('Sarvam AI failed:', sarvamError.response?.data || sarvamError.message);
                // Continue to Level 2
            }
        }

        // Level 2: ElevenLabs (Secondary)
        try {
            console.log(`[TTS] Trying ElevenLabs. Voice ID: "${voiceId}" | Model: "eleven_multilingual_v2"`);

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
            console.error('ElevenLabs failed. Status:', elevenError.status, 'Message:', elevenError.message);
            
            // Level 3: Edge-TTS (Tertiary Fallback)
            console.log(`[TTS] Falling back to Edge-TTS for ${effectiveLang}`);
            
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

        const langCode = req.body.language || 'en-IN';
        console.log(`STT Request: File=${req.file.originalname}, Lang=${langCode}`);

        // Try Sarvam AI STT (user's temporary testing request)
        if (process.env.SARVAM_API_KEY) {
            try {
                const formData = new FormData();
                const fileBuffer = fs.readFileSync(req.file.path);
                const fileBlob = new Blob([fileBuffer], { type: req.file.mimetype });
                formData.append('file', fileBlob, req.file.originalname);
                formData.append('language_code', langCode);
                formData.append('model', 'saaras:v1');

                console.log("Attempting Sarvam AI STT (Saaras v1)...");
                const sarvamRes = await axios.post('https://api.sarvam.ai/speech-to-text', formData, {
                    headers: {
                        'api-subscription-key': process.env.SARVAM_API_KEY,
                    }
                });

                if (sarvamRes.data && sarvamRes.data.transcript) {
                    console.log("Sarvam STT Success:", sarvamRes.data.transcript);
                    if (fs.existsSync(req.file.path)) fs.unlinkSync(req.file.path);
                    return res.json({ text: sarvamRes.data.transcript });
                }
            } catch (sarvamErr) {
                console.warn("Sarvam STT Failed, falling back to Whisper:", sarvamErr.response?.data || sarvamErr.message);
            }
        }

        // Fallback to Groq Whisper
        const transcription = await groq.audio.transcriptions.create({
            file: await Groq.toFile(fs.createReadStream(req.file.path), req.file.originalname),
            model: "whisper-large-v3",
            prompt: "The audio is a mix of English, Hindi, and Telugu (Hinglish/Tenglish). Please transcribe exactly what is said, maintaining the language switches.",
            response_format: "json"
        });

        // Cleanup
        if (fs.existsSync(req.file.path)) fs.unlinkSync(req.file.path);

        res.json({ text: transcription.text });
    } catch (error) {
        console.error('Transcription Error:', error);
        if (req.file && fs.existsSync(req.file.path)) fs.unlinkSync(req.file.path);
        res.status(500).json({ error: 'Failed to transcribe audio' });
    }
};
