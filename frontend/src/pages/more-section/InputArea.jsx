import React, { useEffect, useRef, useState } from 'react';
import { Mic, MicOff, SendHorizontal, Keyboard, Square } from 'lucide-react';
import WaveformVisualizer from './WaveformVisualizer';

const InputArea = ({ 
    onSendMessage, 
    handleMicClick, 
    handleStopSpeaking,
    assistantState, 
    inputMode, 
    setInputMode 
}) => {
  const [text, setText] = useState('');
  const textareaRef = useRef(null);
  
  const isListening = assistantState === 'listening';
  const isSpeaking = assistantState === 'speaking';
  const isThinking = assistantState === 'thinking';
  const isProcessing = isThinking || isSpeaking;

  // Auto resize textarea
  useEffect(() => {
    if (textareaRef.current) {
        textareaRef.current.style.height = 'auto';
        textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 120)}px`;
    }
  }, [text]);

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        submitMessage();
    }
  };

  const submitMessage = () => {
      if (text.trim() && !isProcessing) {
          onSendMessage(text.trim());
          setText('');
          if (textareaRef.current) textareaRef.current.style.height = 'auto';
      }
  };

  return (
    <div className="w-full relative z-20 mx-auto max-w-3xl px-1 sm:px-0 animate-in fade-in slide-in-from-bottom-5 duration-700">
      
      {/* Waveform Visualizer for Audio Feedback */}
      {(isListening || isSpeaking) && (
          <div className="absolute -top-14 sm:-top-16 left-1/2 -translate-x-1/2 pointer-events-none z-50">
              <WaveformVisualizer state={assistantState} />
          </div>
      )}

      {/* Mode Toggles */}
      <div className="flex justify-center mb-4 sm:mb-6 space-x-2 sm:space-x-3">
        <button 
            onClick={() => setInputMode('text')}
            className={`flex items-center space-x-2 px-4 py-2 rounded-full text-[10px] sm:text-xs font-bold tracking-widest uppercase transition-all duration-300 border active:scale-95 hover:scale-105
                ${inputMode === 'text' 
                    ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/50 shadow-[0_0_20px_rgba(16,185,129,0.2)]' 
                    : 'bg-white/5 text-zinc-500 border-white/5 hover:text-zinc-200 hover:bg-white/10'}`}
        >
            <Keyboard size={14} />
            <span className="hidden sm:inline">Type Mode</span>
            <span className="sm:hidden text-[9px]">Type</span>
        </button>
        <button 
            onClick={() => setInputMode('voice')}
            className={`flex items-center space-x-2 px-4 py-2 rounded-full text-[10px] sm:text-xs font-bold tracking-widest uppercase transition-all duration-300 border active:scale-95 hover:scale-105
                ${inputMode === 'voice' 
                    ? 'bg-sky-500/20 text-sky-400 border-sky-500/50 shadow-[0_0_20px_rgba(14,165,233,0.2)]' 
                    : 'bg-white/5 text-zinc-500 border-white/5 hover:text-zinc-200 hover:bg-white/10'}`}
        >
            <Mic size={14} />
            <span className="hidden sm:inline">Voice Mode</span>
            <span className="sm:hidden text-[9px]">Voice</span>
        </button>
      </div>

      {/* Large Center Control Area (Reduced for mobile space) */}
      <div className={`flex justify-center mb-4 sm:mb-6 items-center transition-all duration-500 ${isSpeaking || isListening ? 'h-16 sm:h-20' : 'h-14 sm:h-16'}`}>
          {isSpeaking ? (
              <button
                onClick={handleStopSpeaking}
                className="relative group flex items-center justify-center w-14 h-14 sm:w-20 sm:h-20 rounded-full bg-red-500/10 border-2 border-red-500/30 text-red-500 hover:bg-red-500 hover:text-white transition-all duration-500 shadow-[0_0_40px_rgba(239,68,68,0.2)] animate-pulse shadow-lg outline-none cursor-pointer active:scale-90"
              >
                <Square className="w-5 h-5 sm:w-8 sm:h-8 fill-current" />
              </button>
          ) : inputMode === 'voice' ? (
              <button
                onClick={handleMicClick}
                disabled={isThinking}
                className={`relative group flex items-center justify-center w-14 h-14 sm:w-20 sm:h-20 rounded-full transition-all duration-700 shadow-2xl border-2 outline-none active:scale-90
                  ${isListening 
                    ? 'bg-sky-500 border-sky-400 scale-105 sm:scale-110 shadow-[0_0_60px_rgba(14,165,233,0.5)]' 
                    : 'bg-emerald-900/10 backdrop-blur-xl border-white/10 hover:border-emerald-400/50 hover:bg-white/10 shadow-[0_10px_40px_rgba(0,0,0,0.5)]'
                  }
                  ${isThinking ? 'opacity-30 cursor-not-allowed' : 'cursor-pointer hover:scale-105'}
                `}
              >
                {isListening ? (
                    <Mic className="text-white w-6 h-6 sm:w-9 sm:h-9 animate-pulse" />
                ) : (
                    <Mic className={`text-emerald-400 w-6 h-6 sm:w-9 sm:h-9 group-hover:scale-110 transition-transform duration-500 ${isThinking ? 'animate-spin' : ''}`} />
                )}
                
                {/* Thinking Ripple */}
                {isThinking && (
                    <div className="absolute inset-0 rounded-full border-2 border-amber-500/50 animate-ping" />
                )}
              </button>
          ) : null}
      </div>

      {inputMode === 'text' && (
         <div className="bg-white/[0.03] backdrop-blur-3xl border border-white/10 shadow-[0_10px_40px_rgba(0,0,0,0.3)] p-1.5 sm:p-2 rounded-[24px] sm:rounded-3xl flex items-end relative transition-all duration-500 focus-within:border-emerald-500/40 group overflow-hidden">
            <textarea
                ref={textareaRef}
                value={text}
                onChange={(e) => setText(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Ask Kisan Mithr..."
                disabled={isProcessing}
                className="w-full bg-transparent text-white placeholder-zinc-600 px-4 py-2.5 sm:py-3.5 outline-none resize-none [&::-webkit-scrollbar]:hidden text-sm sm:text-base leading-relaxed overflow-hidden"
                rows={1}
            />
            <button
                onClick={submitMessage}
                disabled={!text.trim() || isProcessing}
                className={`mb-1 mr-1 p-2 sm:p-3 rounded-xl sm:rounded-2xl flex items-center justify-center transition-all duration-300 active:scale-90
                    ${text.trim() && !isProcessing
                        ? 'bg-emerald-600 text-white hover:bg-emerald-500 shadow-[0_0_20px_rgba(16,185,129,0.3)] cursor-pointer' 
                        : 'bg-white/5 text-zinc-700 cursor-not-allowed'
                    }
                `}
            >
                <SendHorizontal size={18} className="sm:size-5" />
            </button>
         </div>
      )}
    </div>
  );
};

export default InputArea;

