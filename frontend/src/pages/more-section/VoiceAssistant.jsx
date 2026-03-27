import React, { useState, useEffect, useRef } from 'react';
import Sidebar from './Sidebar';
import ChatWindow from '../../components/ChatWindow';
import InputArea from './InputArea';
import LanguageSelector from './LanguageSelector';
import VoiceCharacterSelector from './VoiceCharacterSelector';
import { Menu, LayoutDashboard } from 'lucide-react';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';

const VoiceAssistant = () => {
    const [assistantState, setAssistantState] = useState('idle'); // idle, listening, thinking, speaking
    const [language, setLanguage] = useState('en-IN');
    const [selectedVoice, setSelectedVoice] = useState('default');
    const [inputMode, setInputMode] = useState('voice'); // 'voice' or 'text'
    const [transcript, setTranscript] = useState('');
    const [audioUnlocked, setAudioUnlocked] = useState(false);
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    // Chat Data State
    const [chats, setChats] = useState([]);
    const [activeChatId, setActiveChatId] = useState(null);

    const recognitionRef = useRef(null);
    const synthRef = useRef(window.speechSynthesis);
    const audioRef = useRef(null);

    const mediaRecorderRef = useRef(null);
    const audioChunksRef = useRef([]);
    const TEMP_USER_ID = "69a682c84987830f3e21ef14";

    // Dynamic Refs for SpeechRecognition handlers to avoid closure staleness and re-renders
    const assistantStateRef = useRef(assistantState);
    const languageRef = useRef(language);
    const audioUnlockedRef = useRef(audioUnlocked);
    const silenceTimeoutRef = useRef(null);

    // Update refs whenever state changes
    useEffect(() => { assistantStateRef.current = assistantState; }, [assistantState]);
    useEffect(() => { languageRef.current = language; }, [language]);
    useEffect(() => { audioUnlockedRef.current = audioUnlocked; }, [audioUnlocked]);

    // Simple Mobile Detection to resolve mic occupancy conflicts
    const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);

    const handleStopSpeaking = () => {
        console.log("Stopping assistant speech...");
        synthRef.current.cancel();
        if (audioRef.current) {
            audioRef.current.pause();
            audioRef.current = null;
        }
        setAssistantState('idle');
    };

    // Load from MongoDB initially
    useEffect(() => {
        fetch(`${process.env.REACT_APP_API_URL}/api/chats/${TEMP_USER_ID}`)
            .then(res => res.json())
            .then(data => {
                if (data.chats && data.chats.length > 0) {
                    const formattedChats = data.chats.map(c => ({
                        ...c,
                        id: c._id
                    }));
                    setChats(formattedChats);
                    setActiveChatId(formattedChats[0].id);
                }
            })
            .catch(e => console.error("Failed to load chats from Mongoose db", e));
    }, []);

    // Cleanup speech/audio on unmount to prevent ghost speaking
    useEffect(() => {
        return () => {
            synthRef.current?.cancel();
            if (audioRef.current) {
                audioRef.current.pause();
                audioRef.current.src = "";
                audioRef.current = null;
            }
        };
    }, []);

    // Unified Speech Recognition Logic (Stabilized & Silence-Aware)
    useEffect(() => {
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        if (!SpeechRecognition || !audioUnlocked) return;

        // One Single Instance, started ONCE
        const recognition = new SpeechRecognition();
        recognition.continuous = true;
        recognition.interimResults = true;
        recognition.lang = languageRef.current;
        recognitionRef.current = recognition;

        const stopAndProcess = () => {
            console.log("Silence detected. Stopping recognition for processing...");
            if (recognitionRef.current) {
                try { recognitionRef.current.stop(); } catch(e) {}
            }
        };

        recognition.onresult = (event) => {
            const results = event.results;
            const lastIndex = results.length - 1;
            const currentResult = results[lastIndex][0].transcript.toLowerCase();
            const currentState = assistantStateRef.current;

            // Clear any pending silence timer
            if (silenceTimeoutRef.current) clearTimeout(silenceTimeoutRef.current);

            // STATE A: IDLE (Wake Word Detection)
            if (currentState === 'idle') {
                if (currentResult.includes('hey kisan') || currentResult.includes('kisan')) {
                    console.log("Wake word detected:", currentResult);
                    const beep = new Audio('https://actions.google.com/sounds/v1/alarms/beep_short.ogg');
                    beep.volume = 0.2;
                    beep.play().catch(() => { });

                    setInputMode('voice');
                    setTranscript('');
                    setAssistantState('listening');
                }
            }
            // STATE B: LISTENING (Command Transcript)
            else if (currentState === 'listening') {
                let finalTrans = '';
                let interimTrans = '';
                for (let i = event.resultIndex; i < results.length; ++i) {
                    if (results[i].isFinal) finalTrans += results[i][0].transcript;
                    else interimTrans += results[i][0].transcript;
                }
                setTranscript(finalTrans || interimTrans);

                // Start silence timer: if no new result for 2.5s, auto-stop to trigger thinking
                silenceTimeoutRef.current = setTimeout(stopAndProcess, 2500);
            }
        };

        recognition.onstart = async () => {
            console.log("Unified Recognition ONSTART. State:", assistantStateRef.current);
            // Only use MediaRecorder (Whisper) on Desktop to avoid mobile mic conflicts
            if (assistantStateRef.current === 'listening' && !isMobile) {
                audioChunksRef.current = [];
                try {
                    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
                    mediaRecorderRef.current = new MediaRecorder(stream);
                    mediaRecorderRef.current.ondataavailable = (e) => {
                        if (e.data.size > 0) audioChunksRef.current.push(e.data);
                    };
                    mediaRecorderRef.current.start();
                    console.log("MediaRecorder started for Whisper fallback.");
                } catch (err) {
                    console.error("Error starting MediaRecorder:", err);
                }
            }
        };

        recognition.onend = () => {
            const currentState = assistantStateRef.current;
            console.log("Unified Recognition ONEND. State:", currentState);

            // Clear timer on end
            if (silenceTimeoutRef.current) clearTimeout(silenceTimeoutRef.current);

            // If we were listening, transition to thinking
            if (currentState === 'listening') {
                if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
                    mediaRecorderRef.current.stop();
                }
                setAssistantState('thinking');
            }
            
            // Auto-restart logic IF session ended unexpectedly and we are not busy
            if (audioUnlockedRef.current && currentState !== 'speaking' && currentState !== 'thinking') {
                setTimeout(() => {
                    try { 
                        if (assistantStateRef.current !== 'speaking' && assistantStateRef.current !== 'thinking') {
                            recognition.start(); 
                        }
                    } catch (e) { }
                }, 400);
            }
        };

        recognition.onerror = (e) => {
            const errorMsg = e.error || "unknown";
            if (errorMsg !== 'no-speech' && errorMsg !== 'aborted') {
                console.error(`Unified Recognition Error (${errorMsg})`, e);
            }

            if (assistantStateRef.current === 'listening') {
                if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
                    mediaRecorderRef.current.stop();
                }
                setAssistantState('idle');
            }
        };

        try { recognition.start(); } catch (e) { }

        return () => {
            if (silenceTimeoutRef.current) clearTimeout(silenceTimeoutRef.current);
            try { recognition.abort(); } catch (e) { }
        }

    }, [audioUnlocked]); // ONLY re-run when global audio unlock occurs

    // Auto-Restart Observer: Ensures mic reactivates for wake-word after AI finishes speaking
    useEffect(() => {
        if (assistantState === 'idle' && audioUnlocked) {
            console.log("Assistant is idle. Re-activating unified listener...");
            try {
                // We use a small delay to ensure any previous processes have fully released the mic
                setTimeout(() => {
                    if (assistantStateRef.current === 'idle') {
                        recognitionRef.current?.start();
                    }
                }, 500);
            } catch (e) {
                // Already started or busy, ignore
            }
        }
    }, [assistantState, audioUnlocked]);

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
                // If we have recorded chunks, send to Whisper for robust multi-mixed language support
                if (audioChunksRef.current.length > 0) {
                    const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
                    const formData = new FormData();
                    formData.append('audio', audioBlob, 'recording.webm');

                    try {
                        console.log("Sending audio to Whisper for multi-mixed transcript...");
                        const res = await fetch(`${process.env.REACT_APP_API_URL}/api/transcript`, {
                            method: 'POST',
                            body: formData
                        });
                        const data = await res.json();
                        if (data.text) {
                            console.log("Whisper Transcript:", data.text);
                            handleSendMessage(data.text);
                            setTranscript('');
                            return;
                        }
                    } catch (err) {
                        console.error("Whisper fallback failed:", err);
                    }
                }

                // Fallback to browser transcript if Whisper fails or no audio recorded
                if (transcript.trim() !== '') {
                    handleSendMessage(transcript.trim());
                    setTranscript('');
                } else {
                    setAssistantState('idle');
                }
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
        synthRef.current.cancel();
        if (audioRef.current) { audioRef.current.pause(); audioRef.current = null; }
        setAssistantState('idle');
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
                body: JSON.stringify({ userId: TEMP_USER_ID, chatId: id, title: newTitle, messages: chatToUpdate.messages })
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

    const syncChatToMongo = (chatIdToSync, currentChatsState) => {
        const chatData = currentChatsState.find(c => c.id === chatIdToSync);
        if (!chatData) return;

        // Ensure the temp user id is 24 hex characters so Mongoose ObjectId casting doesn't fail
        // "69a682c84987830f3e21ef14" is 24 chars, which is fine, but in case it changes:
        const safeUserId = TEMP_USER_ID.length === 24 ? TEMP_USER_ID : "000000000000000000000000";

        // We pass the chatId to the backend (mapped logically from _id or explicitly passed)
        // The backend will create a new doc if _id isn't found, or update if it exists.
        fetch(`${process.env.REACT_APP_API_URL}/api/chats/save`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                userId: safeUserId,
                chatId: chatIdToSync.length === 24 ? chatIdToSync : null, // only send _id proxy if it's a valid 24 hex char Mongo ID 
                title: chatData.title || userTextPreviewRef.current,
                messages: chatData.messages
            })
        })
            .then(res => res.json())
            .then(data => {
                // If the backend generated a new MongoDB _id for this new chat, we need to update our frontend state to use that real _id instead of our temporary timestamp ID
                if (data.chat && data.chat._id && chatIdToSync !== data.chat._id) {
                    chatIdMapRef.current[chatIdToSync] = data.chat._id;
                    setChats(prev => prev.map(c => c.id === chatIdToSync ? { ...c, id: data.chat._id } : c));
                    if (activeChatId === chatIdToSync) setActiveChatId(data.chat._id);
                }
            })
            .catch(e => console.error("Full mongo sync error:", e));
    };

    // Track temporary frontend timestamp IDs to real MongoDB ObjectIds asynchronously
    const chatIdMapRef = useRef({});
    // Ref strictly for title preview usage to avoid stale state in closure
    const userTextPreviewRef = useRef('');

    const handleSendMessage = async (userText) => {
        let currentChatId = activeChatId;
        userTextPreviewRef.current = userText.length > 30 ? userText.substring(0, 30) + '...' : userText;

        // Create a brand new chat if none exists (Temporary ID before Mongo Sync generates real one)
        if (!currentChatId || chats.length === 0) {
            const newId = Date.now().toString();
            currentChatId = newId;
            const newChat = { id: newId, title: '', messages: [] };
            setChats(prev => [...prev, newChat]);
            setActiveChatId(newId);
        }

        const timestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        const userMessageObj = { role: 'user', content: userText, timestamp };

        // Update Messages State locally first
        let updatedChatsPostUser = [];
        setChats(prevChats => {
            const newChatsState = prevChats.map(chat => {
                if (chat.id === currentChatId) {
                    // Generate Title if it's the very first message
                    let newTitle = chat.title;
                    if (!newTitle) {
                        newTitle = userText.length > 30 ? userText.substring(0, 30) + '...' : userText;
                    }
                    return { ...chat, title: newTitle, messages: [...chat.messages, userMessageObj] };
                }
                return chat;
            });
            updatedChatsPostUser = newChatsState;
            return newChatsState;
        });

        // Sync user message to MongoDB
        setTimeout(() => syncChatToMongo(currentChatId, updatedChatsPostUser), 100);

        setAssistantState('thinking');

        try {
            synthRef.current.cancel();
            if (audioRef.current) { audioRef.current.pause(); audioRef.current = null; }

            const langMap = { 'en-IN': 'English', 'te-IN': 'Telugu', 'hi-IN': 'Hindi' };

            // Resolve the correct ID for history context
            const syncId = chatIdMapRef.current[currentChatId] || currentChatId;
            const isMongoId = syncId.length === 24;

            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 15000);

            const response = await fetch(`${process.env.REACT_APP_API_URL}/api/ask-ai`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    message: userText,
                    language: langMap[language],
                    userId: TEMP_USER_ID,
                    chatId: isMongoId ? syncId : null // Only pass if it's a real MongoDB ID
                }),
                signal: controller.signal
            });

            clearTimeout(timeoutId);

            if (!response.ok) {
                const errData = await response.json().catch(() => ({}));
                throw new Error(errData.error || `HTTP Error ${response.status}`);
            }

            const data = await response.json();

            const aiResponseText = data.response || data.reply || "I am currently unable to process your request. Please try again.";
            const aiTimestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
            const aiMessageObj = { role: 'ai', content: aiResponseText, timestamp: aiTimestamp };

            // Append AI message to the chat
            let updatedChatsPostAI = [];
            setChats(prevChats => {
                // Resolve the target ID in case it was mutated to a Mongo ID by a background sync
                const targetChatId = chatIdMapRef.current[currentChatId] || currentChatId;

                const newState = prevChats.map(chat => {
                    if (chat.id === targetChatId) {
                        return { ...chat, messages: [...chat.messages, aiMessageObj] };
                    }
                    return chat;
                });
                updatedChatsPostAI = newState;
                return newState;
            });

            // Sync AI response to MongoDB using the correct dynamically resolved ID
            const finalSyncId = chatIdMapRef.current[currentChatId] || currentChatId;
            setTimeout(() => syncChatToMongo(finalSyncId, updatedChatsPostAI), 100);

            setAssistantState('speaking');
            // Simplified call to stop any overlapping listening if necessary
            try { recognitionRef.current?.stop(); } catch (e) { }

            speakText(aiResponseText, language);

        } catch (error) {
            console.error("AI Fetch Error:", error);
            const fallbackText = language.includes('te')
                ? "క్షమించండి, నా సిస్టమ్‌లో నెట్‌వర్క్ సమస్య ఉంది. దయచేసి మళ్ళీ ప్రయత్నించండి."
                : language.includes('hi')
                    ? "क्षमा करें, मेरे नेटवर्क में समस्या है। कृपया पुनः प्रयास करें।"
                    : "I am having trouble connecting to the knowledge base right now. Please try again.";

            speakText(fallbackText, language);
            setAssistantState('idle');
        }
    };

    const speakText = async (text, lang) => {
        // Script Detection to ensure correct voice even if UI is in a different language
        const detectLang = (input) => {
            if (/[\u0C00-\u0C7F]/.test(input)) return 'te-IN';
            if (/[\u0900-\u097F]/.test(input)) return 'hi-IN';
            return null;
        };

        const effectiveLang = detectLang(text) || lang;

        try {
            const response = await fetch(`${process.env.REACT_APP_API_URL}/api/speak`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    text: text,
                    language: effectiveLang,
                    voice: selectedVoice
                })
            });

            if (!response.ok) throw new Error("ElevenLabs 402/500");
            const blob = await response.blob();
            const audioUrl = URL.createObjectURL(blob);
            const audio = new Audio(audioUrl);
            audioRef.current = audio;

            // Play the high quality audio
            audio.onended = () => {
                setAssistantState('idle');
                URL.revokeObjectURL(audioUrl);
            };
            audio.onerror = () => {
                setAssistantState('idle');
            };
            // We must catch the play promise strictly
            audio.play().catch(err => {
                console.log("Audio play blocked by browser:", err);
                setAssistantState('idle');
            });

        } catch (error) {
            console.log("ElevenLabs quota exceeded or failed. Falling back to native browser TTS.", error);

            try {
                const utterance = new SpeechSynthesisUtterance(text);
                utterance.lang = effectiveLang;

                const voices = window.speechSynthesis.getVoices();

                if (voices.length === 0) {
                    console.warn("No TTS voices found, waiting for voiceschanged event...");
                    window.speechSynthesis.onvoiceschanged = () => {
                        speakText(text, effectiveLang); // Retry once voices load
                    };
                    return;
                }

                let matchedVoice = voices.find(v => v.lang.includes(effectiveLang) && v.name.includes('Google'));
                if (!matchedVoice) matchedVoice = voices.find(v => v.lang === effectiveLang || v.lang.replace('_', '-') === effectiveLang);
                if (!matchedVoice && effectiveLang === 'te-IN') matchedVoice = voices.find(v => v.lang.toLowerCase().includes('te') || v.name.toLowerCase().includes('telugu'));
                else if (!matchedVoice && effectiveLang === 'hi-IN') matchedVoice = voices.find(v => v.lang.toLowerCase().includes('hi') || v.name.toLowerCase().includes('hindi'));

                if (matchedVoice) utterance.voice = matchedVoice;

                utterance.onend = () => {
                    setAssistantState('idle');
                };
                utterance.onerror = (e) => {
                    console.log("SpeechSynthesis error:", e);
                    setAssistantState('idle');
                };

                synthRef.current.speak(utterance);
            } catch (fallbackErr) {
                console.log("Native TTS fallback also failed:", fallbackErr);
                setAssistantState('idle');
            }
        }
    };

    const handleMicClick = () => {
        if (assistantState === 'listening') {
            recognitionRef.current?.stop();
        } else {
            setAssistantState('listening');
            synthRef.current.cancel();
            if (audioRef.current) { audioRef.current.pause(); audioRef.current = null; }
            recognitionRef.current?.start();
        }
    };

    const currentChat = activeChatId ? chats.find(c => c.id === activeChatId) : null;

    // Combine historical messages with the live voice transcript bubble (if active)
    const displayMessages = currentChat ? [...currentChat.messages] : [];
    if (transcript) {
        displayMessages.push({ role: 'user', content: transcript, timestamp: 'Listening...' });
    }

    return (
        <div className="flex h-[100dvh] w-full overflow-hidden text-zinc-100 font-sans antialiased bg-zinc-950 bg-[radial-gradient(circle_at_top_right,#0f361d,#091a0e_40%,#000000_100%)] bg-fixed">

            {/* INITIALIZATION OVERLAY (Mandatory Click to Unlock Browser Autoplay) */}
            {!audioUnlocked && (
                <div onClick={unlockAudioContext} className="fixed inset-0 z-[9999] flex items-center justify-center bg-zinc-950/80 backdrop-blur-md cursor-pointer">
                    <div className="bg-zinc-900 border border-green-500/50 p-8 rounded-2xl shadow-[0_0_50px_rgba(74,222,128,0.2)] text-center max-w-sm animate-pulse">
                        <span className="text-6xl mb-6 block">🎙️</span>
                        <h2 className="text-2xl font-bold text-white mb-2">Click to Start</h2>
                        <p className="text-zinc-400">Click anywhere to enable Kisan Mithr AI's Voice Assistant.</p>
                    </div>
                </div>
            )}

            {/* Sidebar - Resizable container implemented inside */}
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
            <div className="flex-1 flex flex-col h-full relative z-10 transition-all">
                {/* Top Glass Header */}
                <header className="absolute top-0 left-0 w-full px-2 sm:px-4 py-3 border-b border-white/5 bg-black/20 backdrop-blur-md z-[60] flex items-center justify-between">
                    {/* Left Controls */}
                    <div className="flex items-center gap-3 z-10">
                        <button
                            onClick={() => setIsSidebarOpen(true)}
                            className="p-2 rounded-lg bg-white/5 hover:bg-white/10 lg:hidden text-zinc-100"
                        >
                            <Menu className="w-5 h-5" />
                        </button>
                        <h1 className="hidden lg:block text-2xl font-black bg-clip-text text-transparent bg-gradient-to-r from-green-400 via-emerald-400 to-teal-400 tracking-widest drop-shadow-md">Kisan Mithr AI</h1>
                    </div>

                    {/* Mobile Dead-Center Title */}
                    <div className="absolute left-1/2 -translate-x-1/2 pointer-events-none lg:hidden z-0 w-max">
                        <h1 className="text-base sm:text-xl font-black bg-clip-text text-transparent bg-gradient-to-r from-green-400 via-emerald-400 to-teal-400 tracking-wider sm:tracking-widest drop-shadow-md">Kisan Mithr AI</h1>
                    </div>

                    {/* Right Controls */}
                    <div className="flex items-center gap-1.5 sm:gap-3 z-10">
                        <VoiceCharacterSelector selectedVoice={selectedVoice} setSelectedVoice={setSelectedVoice} />
                        <LanguageSelector language={language} setLanguage={setLanguage} />
                    </div>
                </header>

                {/* Centered Body */}
                <div className="flex-1 flex flex-col justify-center items-center w-full pt-20 pb-4 relative h-full">
                    <div className="w-full flex-1 overflow-hidden flex flex-col justify-center">
                        <ChatWindow messages={displayMessages} assistantState={assistantState} />
                    </div>

                    {/* Input Area */}
                    <div className="w-full max-w-3xl px-4 md:px-8 mt-4 shrink-0 z-40">
                        <InputArea
                            onSendMessage={handleSendMessage}
                            handleMicClick={handleMicClick}
                            handleStopSpeaking={handleStopSpeaking}
                            assistantState={assistantState}
                            inputMode={inputMode}
                            setInputMode={setInputMode}
                        />
                        <div className="text-center mt-4 text-xs text-zinc-500">
                            Kisan Mithr AI specializes in Indian agriculture. Answers are generated by AI.
                        </div>
                    </div>
                </div>
            </div>

        </div>
    );
};

export default VoiceAssistant;
