const Groq = require('groq-sdk');
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
        
        console.error(`[AskAI] HIT: User=${userId}, Chat=${chatId}, MsgLen=${finalMessage?.length}`);        
        console.log(`[AskAI] Received req: User=${userId}, Chat=${chatId}, MessageLen=${finalMessage?.length}`);
        if (!finalMessage) {
            return res.status(400).json({ error: 'message or userMessage is required' });
        }

        // Determine language context
        let langContext = "English";
        if (language === "te-IN" || language === "Telugu") langContext = "Telugu";
        else if (language === "hi-IN" || language === "Hindi") langContext = "Hindi";

        // 1. Fetch History Memory (Gemini-style session persistence)
        let history = [];
        let conversationDoc = null;
        if (chatId && mongoose.Types.ObjectId.isValid(chatId)) {
            try {
                conversationDoc = await Conversation.findById(chatId);
                if (conversationDoc && conversationDoc.messages) {
                    // Map history to OpenAI/Groq format (user/assistant)
                    history = conversationDoc.messages.slice(-6).map(m => ({
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

        // Removed manual history string to prevent LLaMA 3 from hallucinating transcript continuations
        const systemPrompt = `You are "Kisan Mithr", a professional and warm AI Agriculture Assistant. 
Your goal is to provide a "Gemini Voice Call" experience: perfectly conversational, helpful, and human-like.

--------------------------------------------------
🎙️ CONVERSATIONAL STYLE (GEMINI-MODE)
--------------------------------------------------
- Sound like a supportive companion, NOT a cold AI.
- Use natural, friendly, and HUMAN-LIKE language.
- Use conversational markers naturally (e.g., "Oh, that's a great question!", "I see", "Alright, let me help you with that", "Hmm, interesting").
- If the user seems worried about their crops, be empathetic. If they are happy, share their excitement.
- Provide a concise but complete answer (usually 2-5 sentences) so the assistant provides enough detail while staying fast.
- Never use markdown like #, *, or bullet points. Use plain text for voice.

--------------------------------------------------
💬 VOICE OPTIMIZATION (NO MARKDOWN)
--------------------------------------------------
- STRICTOR RULE: Never use #, *, **, or bullet points.
- TEXT-ONLY: Your output is converted directly to speech. Use words, not symbols.
- LINE BREAKS: Use a new line for every sentence to create natural pauses.
- Each sentence should be clear and easy for a human to hear.

--------------------------------------------------
🌐 LANGUAGE MIRRORING (CRITICAL)
--------------------------------------------------
- IMPORTANT: Always respond in the SAME LANGUAGE as the user.
- User spoke: ${langContext}
- If User speaks Telugu -> Response MUST be Telugu.
- If User speaks Hindi -> Response MUST be Hindi.
- If User speaks English -> Response MUST be English.
- Use the user's preferred local terms for crops/tools if they use them.

--------------------------------------------------
🌾 DOMAIN RESTRICT (STRICT)
--------------------------------------------------
- You are an expert in Indian agriculture only.
- If asked about movies, politics, or general trivia, politely guide them back to farming.

--------------------------------------------------
🔐 USER & FARM CONTEXT
--------------------------------------------------
User Name: ${userName}
Location: ${userLocation}
Farm Profile: ${farmContextString}
Weather Context: ${weatherContextString}
Market Context: ${marketContextString}
--------------------------------------------------
Always prioritize SPEED, CLARITY, and VOICE-FRIENDLY output. 
Provide a concise but complete answer (usually 2-6 sentences) so the assistant provides enough detail while staying fast.
STRICT RULE: Never use markdown like #, *, or bullet points. Use plain text for voice.`;

        // Avoid double-appending the current user message if the DB sync already caught it
        let messagesForLLM = history;
        const lastMsg = history.length > 0 ? history[history.length - 1] : null;
        if (!lastMsg || lastMsg.role !== 'user' || lastMsg.content !== finalMessage) {
            messagesForLLM.push({ role: 'user', content: finalMessage });
        }
        
        // LIMIT history to last 6 messages to avoid token limit
        messagesForLLM = messagesForLLM.slice(-6);

        const chatCompletion = await groq.chat.completions.create({
            messages: [
                { role: 'system', content: systemPrompt },
                ...messagesForLLM
            ],
            model: 'llama-3.1-8b-instant',
            temperature: 0.65,
            stream: true,
            max_tokens: 1000,
        });

        res.setHeader('Content-Type', 'text/plain; charset=utf-8');
        res.setHeader('Transfer-Encoding', 'chunked');

        let fullAiResponse = "";
        for await (const chunk of chatCompletion) {
            const content = chunk.choices[0]?.delta?.content || "";
            if (content) {
                res.write(content);
                fullAiResponse += content;
            }
        }
        res.end();

        const { addMessageInternal } = require('./conversationController');
        // 5. Save the complete AI Response to MongoDB
        if (chatId && mongoose.Types.ObjectId.isValid(chatId)) {
            await addMessageInternal({
                conversationId: chatId,
                role: 'assistant',
                content: fullAiResponse
            }).catch(e => console.error("Failed to save AI response via controller:", e));
        }
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
        
        // Using Sarvam AI as primary provider with Edge TTS as fallback
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
        // Case-insensitive voice mapping for stability
        const normalizedVoice = (voice || '').toLowerCase();
        if (normalizedVoice.includes('sarah')) voiceId = "EXAVITQu4vr4xnSDxMaL";
        else if (normalizedVoice.includes('george')) voiceId = "JBFqnCBsd6RMkjVDRZzb";
        else if (normalizedVoice.includes('charlie')) voiceId = "IKne3meq5aSn9XLyUdCD";
        else if (normalizedVoice.includes('hindi')) voiceId = "LEWCqaZJ8aD94fSLZit1";
        else if (normalizedVoice.includes('telugu')) voiceId = "HH8sIQq8WOcER3Nu118i";
        

        // Level 1: Sarvam AI (Primary for all languages)
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
                const sampleRate = 24000; // High-quality requested rate matching user payload

                for (const chunk of textChunks) {
                    console.log(`[TTS] Requesting Sarvam PCM chunk (${chunk.length} chars)`);
                    const sarvamResponse = await axios.post('https://api.sarvam.ai/text-to-speech', {
                        text: chunk,
                        target_language_code: effectiveLang === 'en-IN' ? 'en-IN' : (effectiveLang === 'hi-IN' ? 'hi-IN' : 'te-IN'),
                        speaker: 'shreya', 
                        model: 'bulbul:v3',
                        pace: 1.0,
                        speech_sample_rate: sampleRate,
                        output_audio_codec: 'wav',
                        enable_preprocessing: true
                    }, {
                        headers: { 'api-subscription-key': process.env.SARVAM_API_KEY }
                    });

                    // DEBUG: Log keys to verify V3 API structure
                    console.log(`[TTS] Sarvam Response Status: ${sarvamResponse.status}, Keys: ${Object.keys(sarvamResponse.data)}`);

                    if (sarvamResponse.data && sarvamResponse.data.audio) {
                        const base64Len = sarvamResponse.data.audio.length;
                        console.log(`[TTS] Received audio buffer (base64 length: ${base64Len})`);
                        pcmBuffers.push(Buffer.from(sarvamResponse.data.audio, 'base64'));
                    } else if (sarvamResponse.data && sarvamResponse.data.audios) {
                        // Fallback for different API versions
                        console.log(`[TTS] Using 'audios' fallback...`);
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

        // Level 2: Edge-TTS (Fallback if Sarvam fails or is missing)
        try {
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
        } catch (edgeError) {
            console.error('Edge-TTS Fallback failed:', edgeError);
            res.status(500).json({ error: 'Failed to generate speech using completely all fallback attempts.' });
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

        let finalTranscript = "";

        // 1. Try Sarvam AI STT (Saaras v3 - High accuracy for Indian languages)
        if (process.env.SARVAM_API_KEY) {
            try {
                const formData = new FormData();
                const fileBuffer = fs.readFileSync(req.file.path);
                const fileBlob = new Blob([fileBuffer], { type: req.file.mimetype });
                formData.append('file', fileBlob, req.file.originalname);
                formData.append('language_code', langCode);
                formData.append('model', 'saaras:v3'); // Use the latest v3 model

                const sarvamRes = await axios.post('https://api.sarvam.ai/speech-to-text', formData, {
                    headers: { 'api-subscription-key': process.env.SARVAM_API_KEY }
                });

                if (sarvamRes.data && sarvamRes.data.transcript) {
                    finalTranscript = sarvamRes.data.transcript;
                    console.log("Sarvam v3 Success:", finalTranscript);
                }
            } catch (sarvamErr) {
                console.warn("Sarvam STT Failed, falling back to Whisper:", sarvamErr.response?.data || sarvamErr.message);
            }
        }

        // 2. Fallback to Groq Whisper if Sarvam failed
        if (!finalTranscript) {
            const transcription = await groq.audio.transcriptions.create({
                file: await Groq.toFile(fs.createReadStream(req.file.path), req.file.originalname),
                model: "whisper-large-v3",
                prompt: "The audio is a mix of English, Hindi, and Telugu (Hinglish/Tenglish). Please transcribe exactly what is said. DO NOT TRANSLATE.",
                language: langCode.split('-')[0], // Whisper usually prefers just the language prefix
                response_format: "json"
            });
            finalTranscript = transcription.text;
            console.log("Whisper Fallback Success:", finalTranscript);
        }

        // Cleanup extracted file
        if (fs.existsSync(req.file.path)) fs.unlinkSync(req.file.path);

        res.json({ text: finalTranscript });
    } catch (error) {
        console.error('Transcription Error:', error);
        if (req.file && fs.existsSync(req.file.path)) fs.unlinkSync(req.file.path);
        res.status(500).json({ error: 'Failed to transcribe audio' });
    }
};
