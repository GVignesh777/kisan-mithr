import { Mic, MicOff, SendHorizontal, Keyboard } from 'lucide-react';
import WaveformVisualizer from './WaveformVisualizer';
import { useEffect, useRef, useState } from 'react';

const InputArea = ({ 
    onSendMessage, 
    handleMicClick, 
    assistantState, 
    inputMode, 
    setInputMode 
}) => {
  const [text, setText] = useState('');
  const textareaRef = useRef(null);
  const isListening = assistantState === 'listening';
  const isProcessing = assistantState === 'thinking' || assistantState === 'speaking';

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
      {(assistantState === 'listening' || assistantState === 'speaking') && (
          <div className="absolute -top-20 left-1/2 -translate-x-1/2 pointer-events-none">
              <WaveformVisualizer state={assistantState} />
          </div>
      )}

      {/* Mode Toggles */}
      <div className="flex justify-center mb-3 space-x-2">
        <button 
            onClick={() => setInputMode('text')}
            className={`flex items-center space-x-2 px-3 py-1.5 rounded-full text-xs font-medium transition-all duration-300
                ${inputMode === 'text' ? 'bg-green-500/20 text-green-400 border border-green-500/50' : 'bg-black/20 text-zinc-400 border border-transparent hover:text-zinc-200'}`}
        >
            <Keyboard size={14} />
            <span>Type Mode</span>
        </button>
        <button 
            onClick={() => setInputMode('voice')}
            className={`flex items-center space-x-2 px-3 py-1.5 rounded-full text-xs font-medium transition-all duration-300
                ${inputMode === 'voice' ? 'bg-sky-500/20 text-sky-400 border border-sky-500/50' : 'bg-black/20 text-zinc-400 border border-transparent hover:text-zinc-200'}`}
        >
            <Mic size={14} />
            <span>Voice Mode</span>
        </button>
      </div>

      {inputMode === 'voice' && (
         <div className="flex justify-center mb-4 pb-2">
             <button
                onClick={handleMicClick}
                disabled={isProcessing}
                className={`relative group flex items-center justify-center w-16 h-16 rounded-full transition-all duration-500 shadow-lg border outline-none
                  ${isListening ? 'bg-sky-500 border-sky-400 scale-110 shadow-[0_0_30px_rgba(56,189,248,0.5)]' : 'bg-green-900/40 backdrop-blur-md shadow-[0_4px_30px_rgba(0,0,0,0.3)] border-white/10 hover:border-green-400/50 hover:bg-white/5'}
                  ${isProcessing ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
                `}
             >
                {isListening ? (
                    <Mic className="text-white w-7 h-7 animate-pulse" />
                ) : (
                    <Mic className="text-green-400 w-7 h-7 group-hover:scale-110 transition-transform" />
                )}
             </button>
         </div>
      )}

      {inputMode === 'text' && (
         <div className="bg-green-900/40 backdrop-blur-md border border-white/10 shadow-[0_4px_30px_rgba(0,0,0,0.3)] p-2 rounded-2xl flex items-end relative transition-all duration-300 focus-within:border-green-500/50 focus-within:shadow-[0_0_15px_rgba(74,222,128,0.15)]">
            <textarea
                ref={textareaRef}
                value={text}
                onChange={(e) => setText(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Ask your farming question here..."
                disabled={isProcessing}
                className="w-full bg-transparent text-white placeholder-zinc-500 p-3 outline-none resize-none [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none] min-h-[44px] max-h-[120px] text-sm sm:text-base leading-relaxed"
                rows={1}
            />
            <button
                onClick={submitMessage}
                disabled={!text.trim() || isProcessing}
                className={`mb-1 mr-1 p-2.5 rounded-xl flex items-center justify-center transition-all duration-300
                    ${text.trim() && !isProcessing
                        ? 'bg-green-500 text-white hover:bg-green-400 shadow-[0_0_10px_rgba(74,222,128,0.4)] cursor-pointer' 
                        : 'bg-white/5 text-zinc-500 cursor-not-allowed'
                    }
                `}
            >
                <SendHorizontal size={18} />
            </button>
         </div>
      )}
    </div>
  );
};

export default InputArea;
