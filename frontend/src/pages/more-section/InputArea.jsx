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
    <div className="w-full relative z-20 mx-auto max-w-3xl">
      
      {/* Waveform Visualizer for Audio Feedback */}
      {(isListening || isSpeaking) && (
          <div className="absolute -top-16 left-1/2 -translate-x-1/2 pointer-events-none z-50">
              <WaveformVisualizer state={assistantState} />
          </div>
      )}

      {/* Mode Toggles */}
      <div className="flex justify-center mb-6 space-x-3">
        <button 
            onClick={() => setInputMode('text')}
            className={`flex items-center space-x-2 px-4 py-2 rounded-full text-xs font-bold tracking-widest uppercase transition-all duration-300 border
                ${inputMode === 'text' 
                    ? 'bg-green-500/20 text-green-400 border-green-500/50 shadow-[0_0_15px_rgba(34,197,94,0.2)]' 
                    : 'bg-white/5 text-zinc-500 border-white/5 hover:text-zinc-200'}`}
        >
            <Keyboard size={14} />
            <span>Type Mode</span>
        </button>
        <button 
            onClick={() => setInputMode('voice')}
            className={`flex items-center space-x-2 px-4 py-2 rounded-full text-xs font-bold tracking-widest uppercase transition-all duration-300 border
                ${inputMode === 'voice' 
                    ? 'bg-sky-500/20 text-sky-400 border-sky-500/50 shadow-[0_0_15px_rgba(14,165,233,0.2)]' 
                    : 'bg-white/5 text-zinc-500 border-white/5 hover:text-zinc-200'}`}
        >
            <Mic size={14} />
            <span>Voice Mode</span>
        </button>
      </div>

      {/* Large Center Control Area */}
      <div className="flex justify-center mb-6">
          {isSpeaking ? (
              <button
                onClick={handleStopSpeaking}
                className="relative group flex items-center justify-center w-20 h-20 rounded-full bg-red-500/10 border-2 border-red-500/30 text-red-500 hover:bg-red-500 hover:text-white transition-all duration-500 shadow-[0_0_40px_rgba(239,68,68,0.2)] animate-pulse shadow-lg outline-none cursor-pointer"
              >
                <Square className="w-8 h-8 fill-current" />
              </button>
          ) : inputMode === 'voice' ? (
              <button
                onClick={handleMicClick}
                disabled={isThinking}
                className={`relative group flex items-center justify-center w-20 h-20 rounded-full transition-all duration-700 shadow-2xl border-2 outline-none
                  ${isListening 
                    ? 'bg-sky-500 border-sky-400 scale-110 shadow-[0_0_50px_rgba(14,165,233,0.4)]' 
                    : 'bg-green-900/20 backdrop-blur-xl border-white/20 hover:border-green-400/50 hover:bg-white/10 shadow-[0_10px_40px_rgba(0,0,0,0.5)]'
                  }
                  ${isThinking ? 'opacity-30 cursor-not-allowed' : 'cursor-pointer'}
                `}
              >
                {isListening ? (
                    <Mic className="text-white w-9 h-9 animate-pulse" />
                ) : (
                    <Mic className="text-green-400 w-9 h-9 group-hover:scale-110 transition-transform duration-500" />
                )}
                
                {/* Thinking Ripple */}
                {isThinking && (
                    <div className="absolute inset-0 rounded-full border-2 border-amber-500/50 animate-ping" />
                )}
              </button>
          ) : null}
      </div>

      {inputMode === 'text' && (
         <div className="bg-white/5 backdrop-blur-2xl border border-white/10 shadow-[0_10px_40px_rgba(0,0,0,0.3)] p-2 rounded-3xl flex items-end relative transition-all duration-500 focus-within:border-green-500/40 group">
            <textarea
                ref={textareaRef}
                value={text}
                onChange={(e) => setText(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Ask Kisan Mithr anything..."
                disabled={isProcessing}
                className="w-full bg-transparent text-white placeholder-zinc-500 px-4 py-3.5 outline-none resize-none [&::-webkit-scrollbar]:hidden text-[15px] sm:text-base leading-relaxed overflow-hidden"
                rows={1}
            />
            <button
                onClick={submitMessage}
                disabled={!text.trim() || isProcessing}
                className={`mb-1 mr-1 p-3 rounded-2xl flex items-center justify-center transition-all duration-300
                    ${text.trim() && !isProcessing
                        ? 'bg-green-600 text-white hover:bg-green-500 shadow-[0_0_20px_rgba(34,197,94,0.3)] cursor-pointer active:scale-90' 
                        : 'bg-white/5 text-zinc-600 cursor-not-allowed'
                    }
                `}
            >
                <SendHorizontal size={20} />
            </button>
         </div>
      )}
    </div>
  );
};

export default InputArea;

