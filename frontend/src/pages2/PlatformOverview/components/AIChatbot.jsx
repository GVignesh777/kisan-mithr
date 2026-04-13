import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    MessageCircle, 
    X, 
    Send, 
    Bot, 
    Mic, 
    MicOff, 
    RotateCcw, 
    ChevronDown, 
    Sparkles,
    Trash2
} from 'lucide-react';
import axiosInstance from '../../../services/url.service';
import { toast } from 'react-toastify';

const AIChatbot = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [message, setMessage] = useState('');
    const [history, setHistory] = useState([]);
    const [isTyping, setIsTyping] = useState(false);
    const [isRecording, setIsRecording] = useState(false);
    const chatContainerRef = useRef(null);
    const mediaRecorderRef = useRef(null);
    const audioChunksRef = useRef([]);

    // Persist History
    useEffect(() => {
        const savedHistory = localStorage.getItem('kisan_mithr_ai_chat');
        if (savedHistory) {
            setHistory(JSON.parse(savedHistory));
        } else {
            // Welcome message
            setHistory([{
                id: 'welcome',
                sender: 'ai',
                text: "👋 Hello! I’m your AI Farming Assistant. Ask me anything about crops, soil, pests, or farming.",
                timestamp: new Date().toISOString()
            }]);
        }
    }, []);

    useEffect(() => {
        localStorage.setItem('kisan_mithr_ai_chat', JSON.stringify(history));
        if (chatContainerRef.current) {
            chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
        }
    }, [history]);

    const suggestedQuestions = [
        "Best crop for this season?",
        "How to prevent pests?",
        "Which fertilizer is best for rice?"
    ];

    const handleSend = async (textOverride) => {
        const textToSend = textOverride || message;
        if (!textToSend.trim()) return;

        const userMsg = {
            id: Date.now(),
            sender: 'user',
            text: textToSend,
            timestamp: new Date().toISOString()
        };

        setHistory(prev => [...prev, userMsg]);
        setMessage('');
        setIsTyping(true);

        try {
            const res = await axiosInstance.post('/overview-chat', {
                message: textToSend,
                history: history.slice(-4)
            });

            const aiMsg = {
                id: Date.now() + 1,
                sender: 'ai',
                text: res.data.text,
                timestamp: new Date().toISOString()
            };
            setHistory(prev => [...prev, aiMsg]);
        } catch (error) {
            console.error("AI Error:", error);
            toast.error("Failed to connect to AI assistant.");
        } finally {
            setIsTyping(false);
        }
    };

    const clearHistory = () => {
        if (window.confirm("Clear all chat history?")) {
            const welcome = {
                id: 'welcome',
                sender: 'ai',
                text: "👋 Hello! I’m your AI Farming Assistant. Ask me anything about crops, soil, pests, or farming.",
                timestamp: new Date().toISOString()
            };
            setHistory([welcome]);
            localStorage.removeItem('kisan_mithr_ai_chat');
        }
    };

    // Voice Recording Logic
    const startRecording = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            mediaRecorderRef.current = new MediaRecorder(stream);
            audioChunksRef.current = [];

            mediaRecorderRef.current.ondataavailable = (event) => {
                audioChunksRef.current.push(event.data);
            };

            mediaRecorderRef.current.onstop = async () => {
                const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/wav' });
                const formData = new FormData();
                formData.append('audio', audioBlob, 'voice.wav');
                
                try {
                    toast.info("Transcribing voice...");
                    const res = await axiosInstance.post('/transcript', formData);
                    if (res.data.text) {
                        handleSend(res.data.text);
                    }
                } catch (err) {
                    toast.error("Speech recognition failed.");
                }
            };

            mediaRecorderRef.current.start();
            setIsRecording(true);
        } catch (err) {
            toast.error("Microphone access denied.");
        }
    };

    const stopRecording = () => {
        if (mediaRecorderRef.current && isRecording) {
            mediaRecorderRef.current.stop();
            setIsRecording(false);
        }
    };

    return (
        <div className="fixed bottom-6 right-6 z-[999]">
            {/* Floating Chat Window */}
            <AnimatePresence>
                {isOpen && (
                    <motion.div 
                        initial={{ opacity: 0, y: 20, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 20, scale: 0.95 }}
                        className="absolute bottom-20 right-0 w-[90vw] sm:w-[400px] h-[550px] bg-zinc-900/80 backdrop-blur-2xl border border-zinc-800 rounded-[2.5rem] shadow-2xl flex flex-col overflow-hidden"
                    >
                        {/* Header */}
                        <div className="p-6 bg-green-500/10 border-b border-zinc-800 flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-green-500 text-black rounded-xl">
                                    <Bot size={20} />
                                </div>
                                <div>
                                    <h3 className="font-bold text-white leading-none">AI Farming Assistant 🌾</h3>
                                    <p className="text-[10px] text-green-400 font-bold uppercase tracking-widest mt-1">Specialized Agri-AI</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-2">
                                <button onClick={clearHistory} className="p-2 hover:bg-zinc-800 rounded-lg text-zinc-500 hover:text-red-400 transition-colors">
                                    <Trash2 size={16} />
                                </button>
                                <button onClick={() => setIsOpen(false)} className="p-2 hover:bg-zinc-800 rounded-lg text-zinc-500 hover:text-white transition-colors">
                                    <X size={20} />
                                </button>
                            </div>
                        </div>

                        {/* Messages Body */}
                        <div 
                            ref={chatContainerRef}
                            className="flex-1 overflow-y-auto p-6 space-y-4 scroll-smooth"
                        >
                            {history.map((msg) => (
                                <motion.div 
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    key={msg.id} 
                                    className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                                >
                                    <div className={`max-w-[85%] p-4 rounded-2xl relative ${
                                        msg.sender === 'user' 
                                        ? 'bg-green-600 text-white rounded-tr-sm' 
                                        : 'bg-zinc-800/80 border border-zinc-700/50 text-zinc-200 rounded-tl-sm'
                                    }`}>
                                        <p className="text-sm leading-relaxed whitespace-pre-line">{msg.text}</p>
                                        <div className="mt-2 text-[10px] opacity-40 text-right">
                                            {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                        </div>
                                    </div>
                                </motion.div>
                            ))}

                            {isTyping && (
                                <div className="flex justify-start">
                                    <div className="bg-zinc-800/80 border border-zinc-700/50 p-4 rounded-2xl rounded-tl-sm flex gap-1">
                                        <motion.div animate={{ scale: [1, 1.2, 1] }} transition={{ repeat: Infinity, duration: 1 }} className="w-1.5 h-1.5 bg-green-500 rounded-full" />
                                        <motion.div animate={{ scale: [1, 1.2, 1] }} transition={{ repeat: Infinity, duration: 1, delay: 0.2 }} className="w-1.5 h-1.5 bg-green-500 rounded-full" />
                                        <motion.div animate={{ scale: [1, 1.2, 1] }} transition={{ repeat: Infinity, duration: 1, delay: 0.4 }} className="w-1.5 h-1.5 bg-green-500 rounded-full" />
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Suggestions */}
                        {history.length < 5 && (
                            <div className="px-6 pb-2 flex flex-wrap gap-2">
                                {suggestedQuestions.map((q, i) => (
                                    <button 
                                        key={i}
                                        onClick={() => handleSend(q)}
                                        className="text-[10px] font-bold text-zinc-400 px-3 py-1.5 bg-zinc-800/50 border border-zinc-700 rounded-full hover:bg-green-500/10 hover:text-green-400 hover:border-green-500/30 transition-all"
                                    >
                                        {q}
                                    </button>
                                ))}
                            </div>
                        )}

                        {/* Footer Input */}
                        <div className="p-6 bg-zinc-950/50 border-t border-zinc-800">
                            <form 
                                onSubmit={(e) => { e.preventDefault(); handleSend(); }}
                                className="relative flex items-center gap-2"
                            >
                                <div className="relative flex-1">
                                    <input 
                                        type="text" 
                                        value={message}
                                        onChange={(e) => setMessage(e.target.value)}
                                        placeholder="Ask about crops, pests..."
                                        className="w-full bg-zinc-900 border border-zinc-800 rounded-2xl pl-5 pr-12 py-4 text-sm text-white focus:outline-none focus:border-green-500 transition-all"
                                    />
                                    <button 
                                        type="button"
                                        onClick={isRecording ? stopRecording : startRecording}
                                        className={`absolute right-3 top-1/2 -translate-y-1/2 p-2 rounded-lg transition-colors ${isRecording ? 'bg-red-500 text-white animate-pulse' : 'text-zinc-500 hover:bg-zinc-800 hover:text-white'}`}
                                    >
                                        {isRecording ? <MicOff size={18} /> : <Mic size={18} />}
                                    </button>
                                </div>
                                <button 
                                    type="submit"
                                    disabled={!message.trim() || isTyping}
                                    className="p-4 bg-green-600 text-white rounded-2xl hover:bg-green-500 hover:shadow-[0_0_20px_rgba(16,185,129,0.3)] transition-all disabled:opacity-50 disabled:hover:scale-100"
                                >
                                    <Send size={20} />
                                </button>
                            </form>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Floating Action Button */}
            <motion.div 
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                className="relative group lg:block"
            >
                <button 
                    onClick={() => setIsOpen(!isOpen)}
                    className="flex items-center justify-center w-16 h-16 bg-gradient-to-br from-green-500 to-emerald-600 text-black rounded-full shadow-[0_0_30px_rgba(16,185,129,0.4)] relative z-10 overflow-hidden"
                >
                    <motion.div 
                        animate={!isOpen ? { scale: [1, 1.1, 1] } : {}}
                        transition={{ repeat: Infinity, duration: 2 }}
                    >
                        {isOpen ? <ChevronDown size={28} /> : <Sparkles size={28} />}
                    </motion.div>
                    
                    {/* Tooltip */}
                    <div className="absolute right-full mr-4 top-1/2 -translate-y-1/2 px-3 py-1.5 bg-zinc-900 text-white text-xs font-bold rounded-lg border border-zinc-800 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap hidden sm:block">
                        Ask AI Farming Assistant
                    </div>
                </button>

                {/* Pulse Ring */}
                {!isOpen && (
                    <div className="absolute inset-0 bg-green-500 rounded-full animate-ping opacity-20 pointer-events-none" />
                )}
            </motion.div>
        </div>
    );
};

export default AIChatbot;
