import React, { useState, useEffect, useRef } from 'react';
import Sidebar from './Sidebar';
import ChatWindow from '../../components/ChatWindow';
import InputArea from './InputArea';
import LanguageSelector from './LanguageSelector';
import useLanguageStore from '../../store/useLanguageStore';
import useUserStore from '../../store/useUserStore';
import { toast } from 'react-toastify';

const VoiceAssistant = () => {
  const [assistantState, setAssistantState] = useState('idle'); // idle, listening, thinking, speaking
  const { language: globalLanguage, setLanguage: setGlobalLanguage } = useLanguageStore();
  
  // VoiceAssistant uses 'en-IN', 'hi-IN', 'te-IN' format for the Web Speech API and ElevenLabs. 
  // We compute it from the global 'en', 'hi', 'te' state.
  const languageMap = { 'en': 'en-IN', 'te': 'te-IN', 'hi': 'hi-IN' };
  const language = languageMap[globalLanguage] || 'en-IN';

  const setLanguage = (newLangCode) => {
      // Used by the local LanguageSelector if they select it directly from the Voice Assistant top bar
      const reverseMap = { 'en-IN': 'en', 'te-IN': 'te', 'hi-IN': 'hi' };
      setGlobalLanguage(reverseMap[newLangCode] || 'en');
  };

  const [inputMode, setInputMode] = useState('voice'); // 'voice' or 'text'
  const [transcript, setTranscript] = useState('');
  const [audioUnlocked, setAudioUnlocked] = useState(false);

  // Chat Data State
  const [chats, setChats] = useState([]);
  const [activeChatId, setActiveChatId] = useState(null);

  const recognitionRef = useRef(null);
  const synthRef = useRef(window.speechSynthesis);
  const audioRef = useRef(null);
  const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);

  // Whisper & Audio Recording Refs
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const isStartedRef = useRef(false);
  const assistantStateRef = useRef(assistantState);

  // Audio Queue Management
  const audioQueueRef = useRef([]);
  const isPlayingQueueRef = useRef(false);
  const audioCacheRef = useRef(new Map()); // text -> Blob URL

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

  useEffect(() => {
    assistantStateRef.current = assistantState;
  }, [assistantState]);

  const { user } = useUserStore();
  const userId = user?._id || user?.id;

  // Load from MongoDB initially
  useEffect(() => {
     if (!userId) return;
     fetch(`${process.env.REACT_APP_API_URL}/api/chats/${userId}`)
        .then(res => res.json())
        .then(data => {
            if (data.chats && data.chats.length > 0) {
                // The backend uses native `_id` now, map it so the frontend expects `id`
                const formattedChats = data.chats.map(c => ({
                    ...c,
                    id: c._id // map mongo _id to standard component prop id
                }));
                setChats(formattedChats);
                setActiveChatId(formattedChats[0].id); // since db sorts by updatedAt -1, the first is highest
            }
        })
        .catch(e => console.error("Failed to load chats from Mongoose db", e));
  }, []);

  // Init Speech Recognition & Background Wake Word Listener
  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) return;

    // Safe Start/Stop helpers for SpeechRecognition
    const safeStart = () => {
        if (!recognitionRef.current || isStartedRef.current || !audioUnlocked) return;
        
        // On mobile, only start native STT if we are IDLE (waiting for wake-word)
        if (isMobile && assistantStateRef.current === 'listening') return;

        try {
            recognitionRef.current.start();
        } catch (e) {
            if (e.message?.includes('already started')) isStartedRef.current = true;
        }
    };

    const safeStop = () => {
        if (recognitionRef.current) {
            try {
                recognitionRef.current.stop();
            } catch (e) {
                if (e.message?.includes('not started')) isStartedRef.current = false;
            }
        }
    };

    // 1. Setup the Main Command Listener
    const recognition = new SpeechRecognition();
    recognition.continuous = !isMobile;
    recognition.interimResults = true;
    recognition.lang = language;
    recognitionRef.current = recognition;

    recognition.onstart = () => {
      console.log("Native STT STARTED. State:", assistantStateRef.current);
      isStartedRef.current = true;
    };

    recognition.onresult = (event) => {
      let finalTrans = '';
      let interimTrans = '';
      for (let i = event.resultIndex; i < event.results.length; ++i) {
        if (event.results[i].isFinal) finalTrans += event.results[i][0].transcript;
        else interimTrans += event.results[i][0].transcript;
      }
      setTranscript(finalTrans || interimTrans);
    };

    recognition.onend = () => {
      isStartedRef.current = false;
      const currentState = assistantStateRef.current;
      
      setAssistantState((prev) => {
          if (prev === 'listening') return 'thinking';
          if (prev === 'idle') startWakeWordListener();
          return prev;
      });
    };
    
    recognition.onerror = (e) => {
      if (e.error !== 'no-speech') console.error("Speech recognition error", e);
      setAssistantState('idle');
      startWakeWordListener();
    };

    // 2. Setup the Background Wake Word Listener
    const wakeWordListener = new SpeechRecognition();
    wakeWordListener.continuous = true;
    wakeWordListener.interimResults = true;
    let wakeWordActive = true;

    wakeWordListener.onresult = (event) => {
       if (!wakeWordActive) return;
       const currentResultStr = event.results[event.results.length - 1][0].transcript.toLowerCase();
       if (currentResultStr.includes('hey kisan') || currentResultStr.includes('kisan')) {
           wakeWordActive = false;
           wakeWordListener.stop();
           
           const beep = new Audio('https://actions.google.com/sounds/v1/alarms/beep_short.ogg');
           beep.volume = 0.2;
           beep.play().catch(() => {});
           
           setInputMode('voice');
           setTranscript('');
           setAssistantState('listening');
       }
    };

    wakeWordListener.onend = () => {
        if (wakeWordActive) {
            setTimeout(() => { try { wakeWordListener.start(); } catch(e){} }, 1000);
        }
    };

    const startWakeWordListener = () => {
        wakeWordActive = true;
        try { wakeWordListener.start(); } catch (e) {}
    };

    if (audioUnlocked) {
        startWakeWordListener();
    }

    return () => {
        wakeWordActive = false;
        try { wakeWordListener.stop(); } catch(e) {}
        try { recognitionRef.current.stop(); } catch(e) {}
    }

  }, [audioUnlocked]);

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
      silentAudio.play().catch(() => {});
      
      setAudioUnlocked(true);
  };

  useEffect(() => {
      if (recognitionRef.current) recognitionRef.current.lang = language;
  }, [language]);

    // State Machine Observer: Reacts to state changes with safe microphone transitions
    useEffect(() => {
        if (!audioUnlocked) return;

        const currentState = assistantState;
        console.log("State Machine transition to:", currentState);

        if (currentState === 'idle') {
            // Wake word listening (Native STT)
            setTimeout(safeStart, 500);
        } else if (currentState === 'listening') {
            // Direct Mic Capture (Whisper Pipeline)
            const startMicCapture = async () => {
                audioChunksRef.current = [];
                try {
                    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
                    mediaRecorderRef.current = new MediaRecorder(stream, { mimeType: mimeTypeRef.current });
                    mediaRecorderRef.current.ondataavailable = (e) => {
                        if (e.data.size > 0) audioChunksRef.current.push(e.data);
                    };
                    mediaRecorderRef.current.start();
                    console.log("Direct Mic Capture (MediaRecorder) active.");
                } catch (err) {
                    console.error("Direct Mic Capture failed:", err);
                }
            };
            
            startMicCapture();

            // Native STT for real-time feedback (Desktop ONLY)
            if (!isMobile) {
                setTimeout(safeStart, 100); 
            }
        } else if (currentState === 'thinking' || currentState === 'speaking') {
            // Kill everything to reset hardware and avoid resonance
            safeStop();
            if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
                try { mediaRecorderRef.current.stop(); } catch (e) {}
            }
        }
    }, [assistantState, audioUnlocked, isMobile]);

    // Handle Voice Search Execution Trigger
    useEffect(() => {
        if (assistantState === 'thinking') {
            const processVoiceInput = async () => {
                // Whisper Fallback (Primary for Mobile, Secondary/Mixed for Desktop)
                if (audioChunksRef.current.length > 0) {
                    const audioBlob = new Blob(audioChunksRef.current, { type: mimeTypeRef.current });
                    const formData = new FormData();
                    formData.append('audio', audioBlob, `recording.${audioExtRef.current}`);

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

                // Native STT Fallback if Whisper fails or no audio recorded
                if (transcript.trim() !== '') {
                    handleSendMessage(transcript.trim());
                    setTranscript('');
                } else {
                    setAssistantState('idle');
                }
            };

            processVoiceInput();
        }
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

  const syncChatToMongo = (chatIdToSync, currentChatsState) => {
      const chatData = currentChatsState.find(c => c.id === chatIdToSync);
      if (!chatData) return;
      
      // We pass the chatId to the backend (mapped logically from _id or explicitly passed)
      // The backend will create a new doc if _id isn't found, or update if it exists.
      if (!userId || userId.length !== 24) return;
      fetch(`${process.env.REACT_APP_API_URL}/api/chats/save`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
              userId: userId,
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
          const langMap = { 'en-IN': 'English', 'te-IN': 'Telugu', 'hi-IN': 'Hindi' };
          const syncId = chatIdMapRef.current[currentChatId] || currentChatId;
          
          const response = await fetch(`${process.env.REACT_APP_API_URL}/api/ask-ai`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ 
                  message: userText, 
                  language: langMap[language], 
                  userId: userId, 
                  chatId: syncId.length === 24 ? syncId : null 
              })
          });

          if (!response.ok) throw new Error("Failed to connect");
          
          const reader = response.body.getReader();
          const decoder = new TextDecoder();
          let fullAiText = '';
          let sentenceBuffer = '';
          const aiTimestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
          const aiMessageObj = { role: 'ai', content: '', timestamp: aiTimestamp };

          // Reset Audio Queue
          audioQueueRef.current = [];
          isPlayingQueueRef.current = false;

          while (true) {
              const { done, value } = await reader.read();
              if (done) break;

              const chunk = decoder.decode(value, { stream: true });
              fullAiText += chunk;
              sentenceBuffer += chunk;

              // Real-time Text UI Sync
              setChats(prev => {
                  const targetId = chatIdMapRef.current[currentChatId] || currentChatId;
                  return prev.map(chat => {
                      if (chat.id === targetId) {
                          const msgIndex = chat.messages.findIndex(m => m.timestamp === aiTimestamp && m.role === 'ai');
                          if (msgIndex === -1) return { ...chat, messages: [...chat.messages, { ...aiMessageObj, content: fullAiText }] };
                          const newMessages = [...chat.messages];
                          newMessages[msgIndex] = { ...newMessages[msgIndex], content: fullAiText };
                          return { ...chat, messages: newMessages };
                      }
                      return chat;
                  });
              });

              // Sentence-based Triggering
              const sentenceEndRegex = /[.!?](\s+|$)/;
              if (sentenceEndRegex.test(sentenceBuffer)) {
                  const parts = sentenceBuffer.split(/([.!?](\s+|$))/);
                  let completeSentences = "";
                  let lastIndex = 0;
                  for(let i=1; i<parts.length; i+=2) {
                       completeSentences += parts[i-1] + parts[i];
                       lastIndex = i + 1;
                  }
                  const remaining = parts.slice(lastIndex).join('');
                  if (completeSentences.trim()) {
                      speakText(completeSentences.trim(), language, aiMessageObj, currentChatId);
                  }
                  sentenceBuffer = remaining;
              }
          }

          if (sentenceBuffer.trim()) {
              speakText(sentenceBuffer.trim(), language, aiMessageObj, currentChatId);
          }

          // Final MongoDB Sync
          const finalSyncId = chatIdMapRef.current[currentChatId] || currentChatId;
          setChats(prev => {
              setTimeout(() => syncChatToMongo(finalSyncId, prev), 200);
              return prev;
          });

      } catch (error) {
          console.error("AI Fetch Error:", error);
          setAssistantState('idle');
      }
  };

  const speakText = async (text, lang, messageToAppend = null, chatId = null) => {
      const detectLang = (input) => {
          if (/[\u0C00-\u0C7F]/.test(input)) return 'te-IN';
          if (/[\u0900-\u097F]/.test(input)) return 'hi-IN';
          return null;
      };

      const effectiveLang = detectLang(text) || lang;

      const appendMessageToChat = () => {
          if (messageToAppend && chatId) {
              setChats(prevChats => {
                  const chatIndex = prevChats.findIndex(c => c.id === chatId);
                  if (chatIndex === -1) return prevChats;
                  const chat = prevChats[chatIndex];
                  const msgKey = messageToAppend.timestamp + messageToAppend.content;
                  if (chat.messages.some(m => (m.timestamp + m.content) === msgKey)) return prevChats;

                  const newChats = [...prevChats];
                  newChats[chatIndex] = { ...chat, messages: [...chat.messages, messageToAppend] };
                  setTimeout(() => syncChatToMongo(chatId, newChats), 100);
                  return newChats;
              });
          }
      };

      const playNextInQueue = () => {
          if (audioQueueRef.current.length === 0) {
              isPlayingQueueRef.current = false;
              setAssistantState('idle');
              return;
          }

          isPlayingQueueRef.current = true;
          const { audio, text: segmentText, isFirst } = audioQueueRef.current.shift();

          audio.onplay = () => {
              setAssistantState('speaking');
              if (isFirst) appendMessageToChat();
          };

          audio.onended = () => {
              playNextInQueue();
          };

          audio.onerror = () => {
              playNextInQueue();
          };

          audio.play().catch(err => {
              playNextInQueue();
          });
      };

      const addToQueue = (audioBlob, segmentText, isFirst) => {
          const url = URL.createObjectURL(audioBlob);
          const audio = new Audio(url);
          audioQueueRef.current.push({ audio, text: segmentText, isFirst });
          if (!isPlayingQueueRef.current) {
              playNextInQueue();
          }
      };

      if (audioCacheRef.current.has(text)) {
          const blob = audioCacheRef.current.get(text);
          addToQueue(blob, text, messageToAppend !== null);
          return;
      }

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 1200);

      try {
          const response = await fetch(`${process.env.REACT_APP_API_URL}/api/speak`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                  text: text,
                  language: effectiveLang,
                  voice: 'sunny'
              }),
              signal: controller.signal
          });

          clearTimeout(timeoutId);

          if (!response.ok) throw new Error("Sarvam Error");
          const blob = await response.blob();
          audioCacheRef.current.set(text, blob);
          addToQueue(blob, text, messageToAppend !== null);

      } catch (err) {
          console.warn(`TTS Fallback for: "${text.substring(0, 20)}..."`);
          const utterance = new SpeechSynthesisUtterance(text);
          utterance.lang = effectiveLang;
          utterance.rate = 1.0;
          utterance.onstart = () => {
              setAssistantState('speaking');
              if (messageToAppend !== null) appendMessageToChat();
          };
          utterance.onend = () => {
              if (!isPlayingQueueRef.current && audioQueueRef.current.length === 0) {
                  setAssistantState('idle');
              }
          };
          window.speechSynthesis.speak(utterance);
      }
  };

  const handleStopSpeaking = () => {
      synthRef.current.cancel();
      if (audioRef.current) { audioRef.current.pause(); audioRef.current = null; }
      audioQueueRef.current = [];
      isPlayingQueueRef.current = false;
      setAssistantState('idle');
  };

  const handleMicClick = () => {
    if (assistantState === 'listening') {
        recognitionRef.current?.stop();
        setAssistantState('idle');
    } else {
        handleStopSpeaking();
        setAssistantState('listening');
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
    <div className="flex h-screen w-full overflow-hidden text-zinc-100 font-sans antialiased bg-zinc-950 bg-[radial-gradient(circle_at_top_right,#0f361d,#091a0e_40%,#000000_100%)] bg-fixed">
      
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
          onSelectChat={setActiveChatId} 
          onNewChat={handleNewChat}
          onDeleteChat={handleDeleteChat}
          onEditChat={handleEditChat}
      />

      {/* Main Feature Area */}
      <div className="flex-1 flex flex-col h-full relative z-10 transition-all">
         {/* Top Glass Header */}
         <header className="w-full flex justify-between items-center p-4 border-b border-white/5 bg-black/20 backdrop-blur-md z-40">
            <h1 className="text-xl md:text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-green-400 via-emerald-400 to-teal-400 tracking-widest">Kisan Mithr AI</h1>
            <LanguageSelector language={language} setLanguage={setLanguage} />
         </header>

         {/* Chat Window Body */}
         <ChatWindow messages={displayMessages} assistantState={assistantState} />

         {/* Footer Input Area */}
         <footer className="w-full p-4 md:px-8 pb-6 bg-gradient-to-t from-zinc-950 via-zinc-950/90 to-transparent z-40 shrink-0">
             <InputArea 
                 onSendMessage={handleSendMessage}
                 handleMicClick={handleMicClick}
                 assistantState={assistantState}
                 inputMode={inputMode}
                 setInputMode={setInputMode}
             />
             <div className="text-center mt-3 text-xs text-zinc-500">
                 Kisan Mithr AI specializes in Indian agriculture. Answers are generated by AI.
             </div>
         </footer>
      </div>

    </div>
  );
};

export default VoiceAssistant;
