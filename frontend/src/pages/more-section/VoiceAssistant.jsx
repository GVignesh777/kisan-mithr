import React, { useState, useEffect, useRef } from 'react';
import Sidebar from './Sidebar';
import ChatWindow from '../../components/ChatWindow';
import InputArea from './InputArea';
import VoiceCharacterSelector from './VoiceCharacterSelector';
import { Menu, Mic, Sparkles } from 'lucide-react';
import useUserStore from '../../store/useUserStore';

const VoiceAssistant = () => {
    const [assistantState, setAssistantState] = useState('idle'); // idle, listening, thinking, speaking
    const [language, setLanguage] = useState('en-IN');
    const [selectedVoice, setSelectedVoice] = useState('George');
    const [inputMode, setInputMode] = useState('voice'); // 'voice' or 'text'
    const [transcript, setTranscript] = useState('');
    const [audioUnlocked, setAudioUnlocked] = useState(false);
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    // Chat Data State
    const [chats, setChats] = useState([]);
    // Dynamic Microphone Format Detection for Cross-Platform Stability
    const getSupportedMimeType = () => {
        if (typeof MediaRecorder === 'undefined') return 'audio/webm';
        if (MediaRecorder.isTypeSupported('audio/webm')) return 'audio/webm';
        if (MediaRecorder.isTypeSupported('audio/mp4')) return 'audio/mp4';
        return 'audio/wav';
    };
    const mimeTypeRef = useRef(getSupportedMimeType());
    const audioExtRef = useRef(
        mimeTypeRef.current.includes('mp4') ? 'mp4' : 
        mimeTypeRef.current.includes('wav') ? 'wav' : 'webm'
    );

    const [activeChatId, setActiveChatId] = useState(null);

    const recognitionRef = useRef(null);
    const synthRef = useRef(window.speechSynthesis);
    const audioRef = useRef(null);

    const mediaRecorderRef = useRef(null);
    const audioChunksRef = useRef([]);
    
    // Audio Queue Management
    const audioQueueRef = useRef([]);
    const isPlayingQueueRef = useRef(false);
    const expectedPlaybackIndexRef = useRef(0); // Tracks the strict chronological sequence of playback
    const audioCacheRef = useRef(new Map()); // text -> Blob URL

    const { user } = useUserStore();
    const userId = user?._id || user?.id;

    // Dynamic Refs for SpeechRecognition handlers to avoid closure staleness and re-renders
    const assistantStateRef = useRef(assistantState);
    const languageRef = useRef(language);
    const audioUnlockedRef = useRef(audioUnlocked);
    const silenceTimeoutRef = useRef(null);
    const isStartedRef = useRef(false); // New: Prevent InvalidStateError
    const lastWakeWordTimeRef = useRef(0);
    const isProcessingRef = useRef(false); // Track if a turn is currently being processed

    // Update refs whenever state changes
    useEffect(() => { assistantStateRef.current = assistantState; }, [assistantState]);
    useEffect(() => { languageRef.current = language; }, [language]);
    useEffect(() => { audioUnlockedRef.current = audioUnlocked; }, [audioUnlocked]);

    // Safe Start/Stop helpers for SpeechRecognition
    const safeStart = () => {
        if (!recognitionRef.current || isStartedRef.current || !audioUnlockedRef.current) return;
        
        // On mobile, only start native STT if we are IDLE (waiting for wake-word)
        // If we are LISTENING, we use direct Mic capture (MediaRecorder) only
        if (isMobile && assistantStateRef.current === 'listening') return;

        try {
            recognitionRef.current.start();
        } catch (e) {
            if (e.message?.includes('already started')) isStartedRef.current = true;
        }
    };

    const safeStop = () => {
        if (recognitionRef.current && isStartedRef.current) {
            try {
                recognitionRef.current.stop();
                // Note: isStartedRef will be set to false in onend event for accuracy
            } catch (e) {
                console.error("SafeStop Trigger Error:", e);
                if (e.message?.includes('not started')) isStartedRef.current = false;
            }
        }
    };

    // Simple Mobile Detection to resolve mic occupancy conflicts
    const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);

    // Load from MongoDB initially
    useEffect(() => {
        if (!userId) return;
        fetch(`${process.env.REACT_APP_API_URL}/api/user/${userId}`)
            .then(res => res.json())
            .then(data => {
                if (data && data.length > 0) {
                    const formattedChats = data.map(c => ({
                        ...c,
                        id: c._id
                    }));
                    setChats(formattedChats);
                    setActiveChatId(formattedChats[0].id);
                }
            })
            .catch(e => console.error("Failed to load chats from Mongoose db", e));
    }, [userId]); // Fixed missing dependency for profile fetch

    // Cleanup speech/audio on unmount to prevent ghost speaking
    useEffect(() => {
        const currentSynth = synthRef.current;
        return () => {
            currentSynth?.cancel();
            if (audioRef.current) {
                audioRef.current.pause();
                audioRef.current.src = "";
                audioRef.current = null;
            }
        };
    }, []);

    // Unified Speech Recognition Logic (Fresh Refactor: Safe & Sequential)
    useEffect(() => {
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        if (!SpeechRecognition || !audioUnlocked) return;

        // Initialize ONE persistent instance
        const recognition = new SpeechRecognition();
        recognition.continuous = !isMobile; // Mobile browsers (Safari) are more stable in non-continuous mode
        recognition.interimResults = true;
        recognition.lang = language;
        recognitionRef.current = recognition;

        const stopAndProcess = () => {
            if (assistantStateRef.current === 'listening' && !isProcessingRef.current) {
                isProcessingRef.current = true;
                console.log("Silence detected. Stopping for processing...");
                setAssistantState('thinking');
            }
        };

        recognition.onresult = (event) => {
            const results = event.results;
            const lastIndex = results.length - 1;
            const currentResult = results[lastIndex][0].transcript.toLowerCase();
            const currentState = assistantStateRef.current;

            if (silenceTimeoutRef.current) clearTimeout(silenceTimeoutRef.current);

            // 1. INTERRUPTION LOGIC: If AI is speaking and user starts talking, STOP AI immediately.
            if (currentState === 'speaking' || currentState === 'thinking') {
                if (currentResult.trim().length > 2) {
                    console.log("Interruption detected! Stopping AI...");
                    handleStopSpeaking(); // This stops TTS and resets state
                    setAssistantState('listening');
                    return;
                }
            }

            // 2. Wake Word Handling
            if (currentState === 'idle') {
                if (currentResult.includes('hey kisan') || currentResult.includes('kisan')) {
                    console.log("Wake word detected:", currentResult);
                    lastWakeWordTimeRef.current = Date.now();
                    setAssistantState('listening');
                    setTranscript('');
                }
            }
            // 3. Command Capture 
            else if (currentState === 'listening') {
                let finalTrans = '';
                let interimTrans = '';
                for (let i = event.resultIndex; i < results.length; ++i) {
                    if (results[i].isFinal) finalTrans += results[i][0].transcript;
                    else interimTrans += results[i][0].transcript;
                }
                
                const liveText = finalTrans || interimTrans;
                setTranscript(liveText);

                // 2.5s Silence for more natural speaking pace (prevents premature cutoffs)
                const timeoutDelay = 2500;
                silenceTimeoutRef.current = setTimeout(stopAndProcess, timeoutDelay);

                // PARALLEL OPTIMIZATION: If we have a long enough final sentence, 
                // we can start pre-processing immediately.
                if (finalTrans.trim().split(' ').length >= 6) {
                    console.log("Early trigger: Meaningful sentence detected.");
                    stopAndProcess();
                }
            }
        };

        recognition.onstart = () => {
            console.log("Native STT STARTED. State:", assistantStateRef.current);
            isStartedRef.current = true;
        };

        recognition.onend = () => {
            console.log("Recognition ENDED. State:", assistantStateRef.current);
            isStartedRef.current = false;
            if (silenceTimeoutRef.current) clearTimeout(silenceTimeoutRef.current);

            const currentState = assistantStateRef.current;
            if (currentState === 'listening' && !isProcessingRef.current) {
                // IMPORTANT: Browsers often stop the STT engine immediately after a short wake-word.
                // We must IGNORE this onend if it happens within the first 1.5 seconds of listening,
                // otherwise the assistant jumps to 'thinking' before the user can speak the command.
                const timeSinceWake = Date.now() - lastWakeWordTimeRef.current;
                if (timeSinceWake < 1500) {
                    console.log("Ignoring premature onend after wake word. Restarting native STT for feedback.");
                    setTimeout(safeStart, 200);
                    return;
                }

                if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
                    mediaRecorderRef.current.stop();
                }
                isProcessingRef.current = true;
                setAssistantState('thinking');
            }
            
            // Auto-restart if we are idle and audio is still unlocked
            if (audioUnlockedRef.current && currentState === 'idle') {
                setTimeout(safeStart, 400);
            }
        };

        recognition.onerror = (e) => {
            const errorMsg = e.error || "unknown";
            if (errorMsg !== 'no-speech' && errorMsg !== 'aborted') {
                console.error(`Recognition Error (${errorMsg})`, e);
            }
            if (assistantStateRef.current === 'listening') {
                if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
                    mediaRecorderRef.current.stop();
                }
                setAssistantState('idle');
            }
        };

        safeStart();

        return () => {
            if (silenceTimeoutRef.current) clearTimeout(silenceTimeoutRef.current);
            try { 
                recognition.onend = null; 
                recognition.abort(); 
                isStartedRef.current = false; 
            } catch (e) { }
        }

    }, [audioUnlocked, language, isMobile]);

    // State Machine Observer: Reacts to state changes with safe microphone transitions
    useEffect(() => {
        if (!audioUnlocked) return;

        const currentState = assistantState;
        console.log("State Machine transition to:", currentState);

        if (currentState === 'idle') {
            // Wake word listening (Native STT)
            setTimeout(safeStart, 500);
        } else if (currentState === 'listening') {
            // Direct Mic Capture (Whisper Pipeline) - Standard for Mobile, Optional for Desktop
            const startMicCapture = async () => {
                audioChunksRef.current = [];
                try {
                    const stream = await navigator.mediaDevices.getUserMedia({ 
                        audio: {
                            echoCancellation: true,
                            noiseSuppression: true,
                            autoGainControl: true
                        } 
                    });
                    
                    const recorder = new MediaRecorder(stream, { mimeType: mimeTypeRef.current });
                    mediaRecorderRef.current = recorder;
                    
                    recorder.ondataavailable = (e) => {
                        if (e.data.size > 0) audioChunksRef.current.push(e.data);
                    };

                    recorder.onstart = () => {
                        // BEEP ONLY WHEN RECORDING ACTUALLY STARTS
                        const beep = new Audio('https://actions.google.com/sounds/v1/alarms/beep_short.ogg');
                        beep.volume = 0.4;
                        beep.play().catch(() => { });
                        console.log("MediaRecorder started successfully.");
                    };

                    recorder.start();
                    
                    if (!isMobile) {
                        setTimeout(safeStart, 100); 
                    }
                } catch (err) {
                    console.error("Direct Mic Capture failed:", err);
                    setAssistantState('idle'); // Fallback to idle if mic fails
                }
            };
            
            startMicCapture();
        } else if (currentState === 'thinking' || currentState === 'speaking') {
            // Kill everything to reset hardware and avoid resonance
            safeStop();
            if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
                try { mediaRecorderRef.current.stop(); } catch (e) {}
            }
        }
    }, [assistantState, audioUnlocked, isMobile]);

    // Browser Audio & TTS Unlock Mechanism
    // Browsers block autoplaying Audio and SpeechSynthesis until the user interacts with the document.
    const unlockAudioContext = () => {
        // Unlock native TTS
        if (synthRef.current && synthRef.current.getVoices().length > 0) {
            const silentUtterance = new SpeechSynthesisUtterance('');
            silentUtterance.volume = 0;
            synthRef.current.speak(silentUtterance);
        }
        // Unlock HTML5 Audio
        const silentAudio = new Audio('data:audio/mp3;base64,//OExAAAAANIAAAAAExBTUUzLjEwMKqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqq');
        silentAudio.volume = 0;
        silentAudio.play().catch(() => { });

        setAudioUnlocked(true);
    };

    useEffect(() => {
        if (recognitionRef.current) recognitionRef.current.lang = language;
    }, [language]);

    // Handle Voice Search Execution Trigger
    useEffect(() => {
        if (assistantState === 'thinking') {
            const processVoiceInput = async () => {
                // Wait for any pending recording to definitely stop and flush
                if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
                    await new Promise((resolve) => {
                        mediaRecorderRef.current.onstop = resolve;
                        try { mediaRecorderRef.current.stop(); } catch(e) { resolve(); }
                    });
                }

                // Reset processing flag for NEXT turn
                const finalizeTurn = () => {
                    isProcessingRef.current = false;
                };

                // If we have recorded chunks, send to Sarvam (as authority)
                if (audioChunksRef.current.length > 0) {
                    const audioBlob = new Blob(audioChunksRef.current, { type: mimeTypeRef.current });
                    audioChunksRef.current = []; // Clear immediately after blob creation
                    
                    const formData = new FormData();
                    formData.append('audio', audioBlob, `recording.${audioExtRef.current}`);
                    formData.append('language', language); 

                    try {
                        console.log("Sending audio to Sarvam STT (The Authority)...");
                        const res = await fetch(`${process.env.REACT_APP_API_URL}/api/transcript`, {
                            method: 'POST',
                            body: formData
                        });

                        if (!res.ok) throw new Error("Sarvam Fetch Failed");
                        
                        const data = await res.json();
                        const sarvamText = data.text?.trim() || "";
                        const browserText = transcript.trim();

                        // HYBRID MERGE: Use Sarvam if it has content, fallback to Browser if Sarvam hallucinated/failed
                        const finalText = (sarvamText.split(' ').length > 1) ? sarvamText : browserText;

                        if (finalText.length > 1) {
                            handleSendMessage(finalText);
                            setTranscript('');
                            finalizeTurn();
                            return;
                        }
                    } catch (err) {
                        console.error("Sarvam STT Error, falling back to native:", err);
                    }
                }

                // Fallback to native transcript if Sarvam failed or no chunks
                if (transcript.trim() !== '') {
                    handleSendMessage(transcript.trim());
                    setTranscript('');
                } else {
                    setAssistantState('idle');
                }
                finalizeTurn();
            };
            processVoiceInput();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [assistantState]);

    const handleNewChat = () => {
        const newChat = { id: Date.now().toString(), title: '', messages: [] };
        setChats([...chats, newChat]);
        setActiveChatId(newChat.id);

        // Stop any active speech processing
        handleStopSpeaking();
    };

    const handleEditChat = async (id, newTitle) => {
        // Optimistic update
        setChats(chats.map(c => c.id === id ? { ...c, title: newTitle } : c));
        // Sync to DB
        const chatToUpdate = chats.find(c => c.id === id);
        if (chatToUpdate) {
            fetch(`${process.env.REACT_APP_API_URL}/api/chats/save`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userId: userId, chatId: id, title: newTitle, messages: chatToUpdate.messages })
            }).catch(e => console.log('Error updating title:', e));
        }
    };

    const handleDeleteChat = async (id) => {
        // Optimistically delete
        const remaining = chats.filter(c => c.id !== id);
        setChats(remaining);
        if (activeChatId === id) {
            setActiveChatId(remaining.length > 0 ? remaining[0].id : null);
        }

        // Inform backend
        try {
            await fetch(`${process.env.REACT_APP_API_URL}/api/chats/${id}`, { method: 'DELETE' });
        } catch (e) { console.error('Error deleting chat from DB', e); }
    };

    const syncChatToMongo = async (chatIdToSync, currentChatsState) => {
        console.error(`[Sync] ENTERED syncChatToMongo. UserID=${userId}, ChatIDToSync=${chatIdToSync}`);
        const chatData = currentChatsState?.find(c => c.id === chatIdToSync);
        
        if (!chatData) {
            console.error(`[Sync] ChatData not found for ID: ${chatIdToSync}`);
            return null;
        }
        if (!chatData.messages || chatData.messages.length === 0) {
            console.warn("[Sync] ChatData has no messages.");
            return null;
        }

        if (!userId) {
            console.error("[Sync] ABORTING: UserID is null or undefined in frontend store");
            return null;
        }

        let syncId = chatIdMapRef.current[chatIdToSync] || chatIdToSync;
        console.log(`[Sync] Using SyncID: ${syncId}`);

        // 1. Create a new conversation doc if it doesn't exist yet
        if (syncId.length !== 24) {
            try {
                const res = await fetch(`${process.env.REACT_APP_API_URL}/api/create`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ userId })
                });
                const newConv = await res.json();
                if (newConv && newConv._id) {
                    syncId = newConv._id;
                    chatIdMapRef.current[chatIdToSync] = syncId;
                    setChats(prev => prev.map(c => c.id === chatIdToSync ? { ...c, id: syncId } : c));
                    if (activeChatId === chatIdToSync) setActiveChatId(syncId);
                }
            } catch (e) {
                console.error("Failed to create conversation:", e);
                return null;
            }
        }

        // 2. Append the latest message safely to prevent overwriting AI responses
        const latestMessage = chatData.messages[chatData.messages.length - 1];
        
        try {
            await fetch(`${process.env.REACT_APP_API_URL}/api/addMessage`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    conversationId: syncId,
                    role: latestMessage.role === 'ai' ? 'assistant' : latestMessage.role,
                    content: latestMessage.content
                })
            });
            // Return proxy data structure expected by awaiters
            return { chat: { _id: syncId } };
        } catch (e) {
            console.error("Failed to append message:", e);
            return null;
        }
    };

    // Track temporary frontend timestamp IDs to real MongoDB ObjectIds asynchronously
    const chatIdMapRef = useRef({});

    const appendMessageToChat = (chatId, messageObj) => {
        setChats(prevChats => {
            const chatIdx = prevChats.findIndex(c => c.id === chatId);
            if (chatIdx === -1) return prevChats;
            
            const chat = prevChats[chatIdx];
            // Check existence by unique ID only to ensure turn-persistence
            const exists = chat.messages.some(m => messageObj.id && m.id === messageObj.id);
            if (exists) return prevChats;

            const newChats = [...prevChats];
            newChats[chatIdx] = { ...chat, messages: [...chat.messages, messageObj] };
            return newChats;
        });
    };

    const updateMessageInChat = (chatId, messageObj, updatedText) => {
        if (!messageObj || !chatId) return;
        
        setChats(prevChats => {
            const chatIdx = prevChats.findIndex(c => c.id === chatId);
            if (chatIdx === -1) return prevChats;

            const chat = prevChats[chatIdx];
            // Match specifically by ID to prevent overwriting same-minute messages
            const msgIndex = chat.messages.findIndex(m => messageObj.id && m.id === messageObj.id);
            
            const updatedMessages = [...chat.messages];
            if (msgIndex === -1) {
                // UPSERT: If not found yet (race condition), append now
                updatedMessages.push({ ...messageObj, content: updatedText });
            } else {
                updatedMessages[msgIndex] = { ...updatedMessages[msgIndex], content: updatedText };
            }
            
            const newChats = [...prevChats];
            newChats[chatIdx] = { ...chat, messages: updatedMessages };
            return newChats;
        });
    };

    const handleSendMessage = async (userText) => {
        console.error(`[HandleSend] HIT: User=${userId}, Chat=${activeChatId}, Msg=${userText?.substring(0, 20)}...`);
        // Strip out any accidental wake word triggers from the actual command
        const cleanUserText = userText.replace(/^(hey\s+kisan|kisan)\b[,.\s]*/i, '').trim();
        
        if (!cleanUserText) {
            console.log("Empty message after wake word stripping. Returning to idle.");
            setAssistantState('idle');
            return;
        }

        let currentChatId = activeChatId;
        const isNewChat = !currentChatId || chats.length === 0;
        const newTempId = Date.now().toString();
        
        const timestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        const userMessageObj = { id: 'u-' + Date.now(), role: 'user', content: cleanUserText, timestamp };

        let updatedChatsPostUser = [];
        if (isNewChat) {
            currentChatId = newTempId;
            const newChat = { 
                id: newTempId, 
                title: cleanUserText.length > 30 ? cleanUserText.substring(0, 30) + '...' : cleanUserText, 
                messages: [userMessageObj] 
            };
            updatedChatsPostUser = [...chats, newChat];
            setActiveChatId(newTempId);
        } else {
            updatedChatsPostUser = chats.map(chat => {
                if (chat.id === currentChatId) {
                    return { ...chat, messages: [...chat.messages, userMessageObj] };
                }
                return chat;
            });
        }

        setChats(updatedChatsPostUser);

        // Sync user message to MongoDB
        // Use the explicitly calculated state to avoid React batching race conditions
        await syncChatToMongo(currentChatId, updatedChatsPostUser);

        const syncId = chatIdMapRef.current[currentChatId] || currentChatId;
        setAssistantState('thinking');

        try {
            const langMap = { 'en-IN': 'English', 'te-IN': 'Telugu', 'hi-IN': 'Hindi' };

            const response = await fetch(`${process.env.REACT_APP_API_URL}/api/ask-ai`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    message: cleanUserText,
                    language: langMap[language],
                    userId: userId,
                    chatId: syncId.length === 24 ? syncId : null
                })
            });

            if (!response.ok) throw new Error(`HTTP Error ${response.status}`);

            const reader = response.body.getReader();
            const decoder = new TextDecoder();
            let fullAiText = '';
            let sentenceBuffer = '';
            const aiTimestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
            const aiMessageObj = { id: 'ai-' + Date.now(), role: 'ai', content: '', timestamp: aiTimestamp };

            // Reset Audio Queue for new interaction
            audioQueueRef.current = [];
            isPlayingQueueRef.current = false;
            expectedPlaybackIndexRef.current = 0; // Reset expectation
            let segmentIndexCounter = 0;

            // PRE-APPEND Empty AI Message so it appears immediately in UI
            setChats(prevChats => {
                const chat = prevChats.find(c => c.id === currentChatId);
                if (!chat) return prevChats;
                // Avoid double append if already exists by checking the unique ID
                if (chat.messages.some(m => m.id === aiMessageObj.id)) return prevChats;
                return prevChats.map(c => c.id === currentChatId ? { ...c, messages: [...c.messages, aiMessageObj] } : c);
            });

            while (true) {
                const { done, value } = await reader.read();
                if (done) break;

                const chunk = decoder.decode(value, { stream: true });
                fullAiText += chunk;
                sentenceBuffer += chunk; // Fixed: Missing this line caused audio silence
                
                // Update the pre-appended message in real-time
                updateMessageInChat(currentChatId, aiMessageObj, fullAiText);

                const sentenceEndRegex = /[.!?](?:\s+|$)/;
                if (sentenceEndRegex.test(sentenceBuffer)) {
                    // Split sentences but keep delimiters using a non-capturing group for whitespace
                    const parts = sentenceBuffer.split(/([.!?](?:\s+|$))/);
                    // parts looks like: ["Hello", ". ", "How are you", "?", ""]
                    
                    let completeSentences = "";
                    let lastIndex = 0;
                    for(let i=1; i<parts.length; i+=2) {
                         completeSentences += parts[i-1] + parts[i];
                         lastIndex = i + 1;
                    }
                    
                    const remaining = parts.slice(lastIndex).join('');
                    
                    if (completeSentences.trim()) {
                        console.log("Triggering segment TTS:", completeSentences.trim(), "Index:", segmentIndexCounter);
                        speakText(completeSentences.trim(), language, aiMessageObj, currentChatId, segmentIndexCounter++);
                    }
                    sentenceBuffer = remaining;
                }
            }

            // Final flush for any remaining text without punctuation
            if (sentenceBuffer.trim()) {
                console.log("Triggering final segment TTS:", sentenceBuffer.trim(), "Index:", segmentIndexCounter);
                speakText(sentenceBuffer.trim(), language, aiMessageObj, currentChatId, segmentIndexCounter++);
            }

        } catch (error) {
            console.error("AI Fetch Error:", error);
            const fallbackText = language.includes('te')
                ? "క్షమించండి, నా సిస్టమ్‌లో నెట్‌వర్క్ సమస్య ఉంది. దయచేసి మళ్ళీ ప్రయత్నిచండి."
                : language.includes('hi')
                    ? "क्षमा करें, मेरे नेटवर्क में समस्या है। कृपया पुनः प्रयास करें。"
                    : "I am having trouble connecting to the knowledge base right now. Please try again.";

            speakText(fallbackText, language);
            setAssistantState('idle');
        }
    };

    const speakText = async (text, lang, messageToAppend = null, chatId = null, segmentIndex = 0) => {
        const detectLang = (input) => {
            if (/[\u0C00-\u0C7F]/.test(input)) return 'te-IN';
            if (/[\u0900-\u097F]/.test(input)) return 'hi-IN';
            return null;
        };

        const effectiveLang = detectLang(text) || lang;



        const playNextInQueue = () => {
            if (audioQueueRef.current.length === 0) {
                isPlayingQueueRef.current = false;
                setAssistantState('idle');
                return;
            }

            // Check indexing for sequential discipline
            const nextItem = audioQueueRef.current[0];
            if (nextItem.segmentIndex !== expectedPlaybackIndexRef.current) {
                 isPlayingQueueRef.current = false;
                 return;
            }

            isPlayingQueueRef.current = true;
            audioQueueRef.current.shift();
            expectedPlaybackIndexRef.current++;

            setAssistantState('speaking');
            const { type, payload, isFirst } = nextItem;

            if (type === 'sarvam') {
                const audio = payload;
                audioRef.current = audio;
                if (isFirst) appendMessageToChat(chatId, messageToAppend);
                
                audio.onended = () => playNextInQueue();
                audio.onerror = () => playNextInQueue();
                audio.play().catch(() => playNextInQueue());
            } else {
                // Fallback SpeechSynthesis
                const utterance = payload;
                if (isFirst) appendMessageToChat(chatId, messageToAppend);
                
                utterance.onend = () => playNextInQueue();
                utterance.onerror = () => playNextInQueue();
                window.speechSynthesis.speak(utterance);
            }
        };

        const addToQueue = (type, payload, segmentText, isFirst) => {
            audioQueueRef.current.push({ type, payload, segmentText, isFirst, segmentIndex });
            audioQueueRef.current.sort((a, b) => a.segmentIndex - b.segmentIndex);

            if (!isPlayingQueueRef.current) {
                playNextInQueue();
            }
        };

        if (audioCacheRef.current.has(text)) {
            const blob = audioCacheRef.current.get(text);
            const url = URL.createObjectURL(blob);
            addToQueue('sarvam', new Audio(url), text, messageToAppend !== null);
            return;
        }

        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 15000); // 15s for stability

        try {
            const response = await fetch(`${process.env.REACT_APP_API_URL}/api/speak`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ text, language: effectiveLang, voice: selectedVoice }),
                signal: controller.signal
            });

            clearTimeout(timeoutId);
            if (!response.ok) throw new Error("Sarvam Error");
            
            const blob = await response.blob();
            audioCacheRef.current.set(text, blob);
            const url = URL.createObjectURL(blob);
            addToQueue('sarvam', new Audio(url), text, messageToAppend !== null);

        } catch (err) {
            console.warn(`TTS Fallback for: "${text.substring(0, 20)}..." | ${err.message}`);
            const cleanText = text.replace(/[#*`~_|>\[\]()-]/g, "");
            const utterance = new SpeechSynthesisUtterance(cleanText);
            utterance.lang = effectiveLang;
            utterance.rate = 1.0;
            
            // Sync fallback to a female voice if possible
            const voices = window.speechSynthesis.getVoices();
            const femaleVoice = voices.find(v => 
                (v.lang.startsWith(effectiveLang.split('-')[0])) && 
                (v.name.toLowerCase().includes('female') || v.name.toLowerCase().includes('zira') || 
                 v.name.toLowerCase().includes('heera') || v.name.toLowerCase().includes('samantha') || 
                 v.name.toLowerCase().includes('google hindi') || v.name.toLowerCase().includes('online'))
            );
            if (femaleVoice) utterance.voice = femaleVoice;

            addToQueue('fallback', utterance, text, messageToAppend !== null);
        }
    };

    const handleStopSpeaking = () => {
        synthRef.current.cancel();
        if (audioRef.current) { audioRef.current.pause(); audioRef.current = null; }
        audioQueueRef.current = [];
        isPlayingQueueRef.current = false;
        expectedPlaybackIndexRef.current = 0; // Reset expectation on stop
        setAssistantState('idle');
    };

    const handleMicClick = () => {
        if (assistantState === 'listening') {
            safeStop();
        } else {
            handleStopSpeaking();
            setAssistantState('listening');
            safeStart();
        }
    };

    const currentChat = activeChatId ? chats.find(c => c.id === activeChatId) : null;

    // Gemini-style status mapping
    const stateLabels = {
        idle: 'Hey Kisan',
        listening: 'Listening...',
        thinking: 'Understanding...',
        speaking: 'Speaking...'
    };

    // Combine historical messages with the live voice transcript bubble (if active)
    const displayMessages = currentChat ? [...currentChat.messages] : [];
    if (transcript) {
        if (transcript.trim()) {
            displayMessages.push({ role: 'user', content: transcript.trim(), timestamp: stateLabels[assistantState] || 'Active' });
        }
    }

    return (
        <div className="flex h-[100dvh] w-full overflow-hidden text-zinc-100 font-sans antialiased bg-zinc-950 bg-[radial-gradient(circle_at_top_right,#0f361d,#091a0e_40%,#000000_100%)] bg-fixed relative">
            
            {/* Subtle Noise Overlay for Texture */}
            <div className="absolute inset-0 z-0 opacity-[0.02] pointer-events-none mix-blend-overlay bg-[url('https://grainy-gradients.vercel.app/noise.svg')]" />

            {/* INITIALIZATION OVERLAY */}
            {!audioUnlocked && (
                <div onClick={unlockAudioContext} className="fixed inset-0 z-[9999] flex items-center justify-center bg-zinc-950/90 backdrop-blur-xl cursor-pointer">
                    <div className="bg-green-900/20 border border-green-500/30 p-10 rounded-[32px] shadow-[0_0_100px_rgba(34,197,94,0.1)] text-center max-w-sm transition-all hover:scale-105 duration-700">
                        <div className="w-20 h-20 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-8 border border-green-500/30 animate-pulse">
                            <Mic className="w-10 h-10 text-green-400" />
                        </div>
                        <h2 className="text-3xl font-black text-white mb-3 tracking-widest uppercase">Kisan Mithr AI</h2>
                        <p className="text-zinc-400 font-medium leading-relaxed mb-8">Empowering Indian Farmers with Intelligent Voice Assistance.</p>
                        <div className="px-8 py-3.5 bg-green-600 text-white font-bold rounded-2xl shadow-lg shadow-green-500/20 uppercase tracking-widest text-sm">
                            Tap to Begin
                        </div>
                    </div>
                </div>
            )}

            {/* Sidebar */}
            <Sidebar
                chats={chats}
                activeChatId={activeChatId}
                onSelectChat={(id) => { setActiveChatId(id); setIsSidebarOpen(false); }}
                onNewChat={() => { handleNewChat(); setIsSidebarOpen(false); }}
                onDeleteChat={handleDeleteChat}
                onEditChat={handleEditChat}
                isOpen={isSidebarOpen}
                setIsOpen={setIsSidebarOpen}
            />

            {/* Main Feature Area */}
            <div className="flex-1 flex flex-col h-full relative z-10">
                
                {/* Top Glass Header */}
                <header className="absolute top-0 left-0 w-full px-4 sm:px-8 py-4 border-b border-white/[0.05] bg-black/40 backdrop-blur-2xl z-[60] flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <button
                            onClick={() => setIsSidebarOpen(true)}
                            className="p-2.5 rounded-xl bg-white/5 hover:bg-white/10 lg:hidden text-zinc-100 transition-colors border border-white/10"
                        >
                            <Menu className="w-5 h-5" />
                        </button>
                        <h1 className="hidden lg:block text-2xl font-black bg-clip-text text-transparent bg-gradient-to-r from-green-400 via-emerald-400 to-teal-400 tracking-widest uppercase drop-shadow-md">
                            Kisan Mithr <span className="text-green-500">AI</span>
                        </h1>
                    </div>

                    {/* Mobile Center Title */}
                    <div className="absolute left-1/2 -translate-x-1/2 pointer-events-none lg:hidden w-max">
                        <h1 className="text-lg font-black bg-clip-text text-transparent bg-gradient-to-r from-green-400 via-emerald-400 to-teal-400 tracking-widest uppercase">
                            Kisan Mithr
                        </h1>
                    </div>

                    {/* Right Controls */}
                    <div className="flex items-center gap-2 sm:gap-4">
                        <VoiceCharacterSelector 
                            language={language} 
                            setLanguage={setLanguage} 
                            setSelectedVoice={setSelectedVoice} 
                        />
                    </div>
                </header>

                {/* Centered Body */}
                <div className="flex-1 flex flex-col w-full relative h-full pt-16">
                    <div className="flex-1 w-full overflow-hidden flex flex-col justify-center">
                        <ChatWindow messages={displayMessages} assistantState={assistantState} />
                    </div>

                    {/* Input Area (Upgraded Classic Style) */}
                    <div className="w-full max-w-4xl mx-auto px-4 sm:px-8 pb-6 sm:pb-8 shrink-0 z-40">
                        <InputArea
                            onSendMessage={handleSendMessage}
                            handleMicClick={handleMicClick}
                            handleStopSpeaking={handleStopSpeaking}
                            assistantState={assistantState}
                            inputMode={inputMode}
                            setInputMode={setInputMode}
                        />
                        <div className="text-center mt-4 text-[10px] font-bold text-zinc-500 uppercase tracking-[0.2em] leading-none opacity-50">
                            Professional Agritech Intelligence &bull; AI Powered
                        </div>
                    </div>
                </div>
            </div>

        </div>
    );
};

export default VoiceAssistant;
