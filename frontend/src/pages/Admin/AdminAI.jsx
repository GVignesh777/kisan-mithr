import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Bot, Send, Loader2, Sparkles, RefreshCw, Copy, Check,
  ChevronDown, BarChart2, Leaf, Users, AlertCircle, Zap,
  MessageSquare, FileText, TrendingUp, Lightbulb
} from 'lucide-react';
import axios from 'axios';

// ─── Quick Prompt Templates ───────────────────────────────────────────────────
const QUICK_PROMPTS = [
  { icon: BarChart2,   label: "Market Summary",      q: "Give me a summary of current market price trends in the platform." },
  { icon: Users,       label: "User Insights",       q: "How are users engaging with the platform? Any key patterns?" },
  { icon: Leaf,        label: "Crop Disease Trends",  q: "Summarize the common crop diseases reported by farmers recently." },
  { icon: AlertCircle, label: "System Alerts",       q: "What are the most critical issues on the platform right now?" },
  { icon: TrendingUp,  label: "Revenue Analysis",    q: "Analyze the buyer procurement trends and potential revenue areas." },
  { icon: Lightbulb,   label: "Recommendations",     q: "What are your AI recommendations to improve farmer outcomes?" },
];

// ─── Message Bubble ───────────────────────────────────────────────────────────
const MessageBubble = ({ msg }) => {
  const [copied, setCopied] = useState(false);
  const isUser = msg.role === 'user';

  const handleCopy = () => {
    navigator.clipboard.writeText(msg.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={`flex gap-4 ${isUser ? 'flex-row-reverse' : 'flex-row'}`}
    >
      {/* Avatar */}
      <div className={`w-9 h-9 rounded-2xl shrink-0 flex items-center justify-center shadow-lg ${
        isUser ? 'bg-green-500 text-black' : 'bg-zinc-800 border border-white/10 text-green-400'
      }`}>
        {isUser ? <span className="text-xs font-black">A</span> : <Bot size={16} />}
      </div>

      {/* Bubble */}
      <div className={`group max-w-[75%] relative ${isUser ? 'items-end' : 'items-start'} flex flex-col gap-1`}>
        <div className={`rounded-3xl px-5 py-4 text-sm leading-relaxed font-medium shadow-xl ${
          isUser
            ? 'bg-green-500 text-black rounded-tr-none'
            : 'bg-zinc-900 border border-white/5 text-zinc-200 rounded-tl-none'
        }`}>
          <pre className="whitespace-pre-wrap font-sans">{msg.content}</pre>
        </div>

        <div className="flex items-center gap-2 px-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <span className="text-[9px] font-bold text-zinc-600">{msg.time}</span>
          {!isUser && (
            <button onClick={handleCopy} className="text-[9px] font-black text-zinc-600 hover:text-zinc-300 flex items-center gap-1 transition-colors">
              {copied ? <Check size={10} /> : <Copy size={10} />}
              {copied ? 'Copied' : 'Copy'}
            </button>
          )}
        </div>
      </div>
    </motion.div>
  );
};

// ─── MAIN COMPONENT ───────────────────────────────────────────────────────────
const AdminAI = () => {
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content: `👋 Hello, Admin! I'm the **Kisan Mithr AI Command Center**.\n\nI have access to platform insights and can help you:\n• Analyze market price trends\n• Summarize disease reports & farmer issues\n• Review user engagement patterns\n• Generate strategic recommendations\n\nAsk me anything about your platform!`,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [model, setModel] = useState('llama-3.3-70b-versatile');
  const endRef = useRef(null);
  const textareaRef = useRef(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 160)}px`;
    }
  }, [input]);

  const sendMessage = async (text) => {
    const content = text || input.trim();
    if (!content || isLoading) return;

    const userMsg = { role: 'user', content, time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsLoading(true);

    try {
      const res = await axios.post(`${process.env.REACT_APP_API_URL}/api/admin/ai-chat`, {
        message: content,
        history: messages.slice(-10).map(m => ({ role: m.role, content: m.content })),
        model
      });

      setMessages(prev => [...prev, {
        role: 'assistant',
        content: res.data.response || 'No response received.',
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }]);
    } catch {
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: '⚠️ AI service unavailable. Check that the backend is running and GROQ_API_KEY is set in your `.env` file.',
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const clearChat = () => setMessages([{
    role: 'assistant',
    content: 'Chat cleared. How can I help you analyze the platform today?',
    time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  }]);

  return (
    <div className="flex flex-col h-full min-h-0">

      {/* Header */}
      <div className="flex items-center justify-between mb-6 shrink-0">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center shadow-lg shadow-green-500/30">
            <Bot size={24} className="text-black" />
          </div>
          <div>
            <h1 className="text-2xl font-black text-white tracking-tight">AI Command Center</h1>
            <div className="flex items-center gap-2 mt-0.5">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
              <span className="text-xs font-bold text-zinc-500">Groq Llama • Online</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="relative">
            <select
              value={model}
              onChange={(e) => setModel(e.target.value)}
              className="appearance-none bg-zinc-900 border border-white/5 rounded-2xl py-2.5 pl-4 pr-10 text-xs font-bold text-zinc-400 focus:outline-none focus:ring-1 focus:ring-green-500/30 cursor-pointer"
            >
              <option value="llama-3.3-70b-versatile">Llama 3.3 70B</option>
              <option value="llama3-8b-8192">Llama 3 8B (Fast)</option>
              <option value="mixtral-8x7b-32768">Mixtral 8x7B</option>
            </select>
            <ChevronDown size={12} className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-600 pointer-events-none" />
          </div>

          <button onClick={clearChat} className="p-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/5 transition-all text-zinc-400 hover:text-white">
            <RefreshCw size={16} />
          </button>
        </div>
      </div>

      {/* Quick Prompts */}
      <div className="grid grid-cols-3 lg:grid-cols-6 gap-3 mb-6 shrink-0">
        {QUICK_PROMPTS.map((p, i) => (
          <button
            key={i}
            onClick={() => sendMessage(p.q)}
            disabled={isLoading}
            className="flex flex-col items-center gap-2 p-3 bg-zinc-900/60 border border-white/5 rounded-2xl hover:bg-zinc-800/60 hover:border-green-500/20 hover:text-green-400 transition-all text-zinc-500 group disabled:opacity-40"
          >
            <p.icon size={18} className="group-hover:scale-110 transition-transform" />
            <span className="text-[9px] font-black uppercase tracking-wider text-center leading-tight">{p.label}</span>
          </button>
        ))}
      </div>

      {/* Chat Window */}
      <div className="flex-1 min-h-0 bg-zinc-950/50 border border-white/5 rounded-3xl overflow-hidden flex flex-col shadow-2xl">
        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar">
          <AnimatePresence initial={false}>
            {messages.map((msg, i) => (
              <MessageBubble key={i} msg={msg} />
            ))}
          </AnimatePresence>

          {isLoading && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex gap-4"
            >
              <div className="w-9 h-9 rounded-2xl bg-zinc-800 border border-white/10 flex items-center justify-center text-green-400 shrink-0">
                <Bot size={16} />
              </div>
              <div className="bg-zinc-900 border border-white/5 rounded-3xl rounded-tl-none px-5 py-4 flex items-center gap-3">
                <Loader2 size={16} className="animate-spin text-green-400" />
                <span className="text-xs text-zinc-500 font-medium">Analyzing platform data...</span>
              </div>
            </motion.div>
          )}
          <div ref={endRef} />
        </div>

        {/* Input */}
        <div className="p-4 border-t border-white/5 bg-zinc-900/50">
          <div className="flex gap-3 items-end">
            <div className="flex-1 bg-zinc-950 border border-white/5 rounded-2xl flex items-end gap-2 p-3 focus-within:border-green-500/30 focus-within:ring-1 focus-within:ring-green-500/10 transition-all">
              <MessageSquare size={16} className="text-zinc-600 shrink-0 mb-0.5" />
              <textarea
                ref={textareaRef}
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Ask about market trends, user activity, disease reports… (Shift+Enter for new line)"
                rows={1}
                className="flex-1 bg-transparent text-sm text-zinc-200 placeholder-zinc-600 resize-none focus:outline-none leading-relaxed"
              />
            </div>
            <button
              onClick={() => sendMessage()}
              disabled={!input.trim() || isLoading}
              className="w-12 h-12 rounded-2xl bg-green-500 flex items-center justify-center text-black shrink-0 hover:bg-green-400 active:scale-95 transition-all disabled:opacity-30 shadow-lg shadow-green-500/20"
            >
              {isLoading ? <Loader2 size={18} className="animate-spin" /> : <Send size={18} />}
            </button>
          </div>
          <p className="text-[9px] text-zinc-700 mt-2 text-center font-bold uppercase tracking-widest">
            Powered by Groq Llama 3.3 • Context-aware • Admin-only
          </p>
        </div>
      </div>

    </div>
  );
};

export default AdminAI;
