import React, { useEffect, useRef } from 'react';
import MessageBubble from '../pages/more-section/MessageBubble';
import VoiceOrb from '../pages/more-section/VoiceOrb';

const ChatWindow = ({ messages, assistantState }) => {
  const bottomRef = useRef(null);

  useEffect(() => {
     // Smooth scroll to bottom on new messages
     bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, assistantState]);

  // When there are no messages, show the Orb and welcome screen
  if (!messages || messages.length === 0) {
      return (
          <div className="flex-1 flex flex-col items-center justify-center p-8 w-full h-full relative z-10 transition-all">
              <div className="mb-10 scale-125">
                 <VoiceOrb state={assistantState} />
              </div>
              <h2 className="text-3xl font-bold text-white mb-4 text-center">
                  Welcome to <span className="bg-clip-text text-transparent bg-gradient-to-r from-green-400 via-emerald-400 to-teal-400 tracking-widest">Kisan Mithr AI</span>
              </h2>
              <p className="text-zinc-400 max-w-md text-center text-lg leading-relaxed">
                  Your smart agriculture assistant. Ask me about crop protection, healthy fertilizers, weather expectations, or modern farming methodologies.
              </p>
          </div>
      );
  }

  // Active chat view
  return (
    <div className="flex-1 flex flex-col w-full h-full overflow-y-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none] scroll-smooth relative z-10">
      <div className="max-w-4xl w-full mx-auto p-4 md:px-8 py-10 space-y-6 md:space-y-8 flex-1">
          {messages.map((msg, idx) => (
             <MessageBubble key={idx} message={msg} />
          ))}
          
          {/* Thinking indicator when awaiting response */}
          {assistantState === 'thinking' && (
              <MessageBubble 
                 message={{ role: 'ai', timestamp: new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) }} 
                 isTypingIndicator={true} 
              />
          )}
          
          <div ref={bottomRef} className="h-4" /> {/* Scroll anchor */}
      </div>
    </div>
  );
};

export default ChatWindow;
