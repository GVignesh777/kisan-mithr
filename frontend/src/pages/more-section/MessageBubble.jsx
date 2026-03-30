import React from 'react';
import ReactMarkdown from 'react-markdown';
import { User, Sparkles } from 'lucide-react';

const MessageBubble = ({ message, isTypingIndicator = false }) => {
  const isUser = message?.role === 'user';
  
  return (
    <div className={`flex w-full mb-6 animate-in fade-in slide-in-from-bottom-3 zoom-in-95 duration-500 ${isUser ? 'justify-end' : 'justify-start'}`}>
      <div className={`flex max-w-[90%] sm:max-w-[80%] md:max-w-[75%] gap-2.5 sm:gap-4 ${isUser ? 'flex-row-reverse' : 'flex-row'}`}>
        
        {/* Avatar Section */}
        <div className={`shrink-0 w-8 h-8 sm:w-10 sm:h-10 rounded-2xl flex items-center justify-center border transition-all duration-500 shadow-xl self-end mb-4
          ${isUser 
            ? 'bg-green-500/10 border-green-500/30 text-green-400' 
            : 'bg-white/5 border-white/10 text-emerald-400 shadow-[0_0_20px_rgba(16,185,129,0.15)]'
          }`}
        >
          {isUser ? <User size={18} /> : <Sparkles size={18} className="animate-pulse" />}
        </div>

        {/* Message Content Container */}
        <div className="flex flex-col gap-1.5 min-w-0">
          {/* Role & Time Header */}
          <div className={`flex items-center gap-3 px-1.5 mb-0.5 ${isUser ? 'flex-row-reverse text-right' : 'flex-row'}`}>
            <span className={`text-[10px] font-black uppercase tracking-[0.2em] opacity-40
              ${isUser ? 'text-zinc-500' : 'text-emerald-500 font-bold'}
            `}>
              {isUser ? 'Farmer' : 'Kisan Mithr AI'}
            </span>
            <span className="text-[9px] font-medium text-zinc-600 uppercase tracking-widest opacity-60">
                {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </span>
          </div>

          {/* Bubble Card (Glassmorphism Style) */}
          <div className={`relative px-4 py-3 sm:px-6 sm:py-4 rounded-[26px] backdrop-blur-3xl border transition-all duration-500 shadow-2xl
            ${isUser 
              ? 'bg-green-600/10 border-green-500/30 text-white rounded-br-none shadow-emerald-500/5' 
              : 'bg-white/[0.04] border-white/10 text-zinc-50 rounded-bl-none shadow-black/40'
            }`}
          >
            {isTypingIndicator ? (
                <div className="flex space-x-2 items-center h-6 px-1">
                    <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-bounce [animation-delay:-0.3s]" />
                    <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-bounce [animation-delay:-0.15s]" />
                    <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-bounce" />
                </div>
            ) : (
                <div className="text-[14px] sm:text-[15.5px] leading-[1.65] font-normal tracking-wide ai-markdown-content break-words overflow-hidden">
                    {isUser ? (
                        <p className="whitespace-pre-wrap">{message?.content}</p>
                    ) : (
                        <ReactMarkdown
                            components={{
                                h1: ({node, ...props}) => <h1 className="text-xl sm:text-2xl font-black text-white mt-6 mb-4 border-l-4 border-emerald-500 pl-4 uppercase tracking-tighter" {...props} />,
                                h2: ({node, ...props}) => <h2 className="text-lg sm:text-xl font-bold text-emerald-400 mt-6 mb-3 border-b border-white/5 pb-1 uppercase tracking-wide" {...props} />,
                                h3: ({node, ...props}) => <h3 className="text-base sm:text-lg font-semibold text-emerald-300 mt-4 mb-2" {...props} />,
                                p: ({node, ...props}) => <p className="mb-4 last:mb-0 text-zinc-200/90" {...props} />,
                                ul: ({node, ...props}) => <ul className="list-disc pl-5 mb-4 space-y-2 marker:text-emerald-500 text-zinc-200/90" {...props} />,
                                ol: ({node, ...props}) => <ol className="list-decimal pl-5 mb-4 space-y-2 marker:text-emerald-500 text-zinc-200/90" {...props} />,
                                li: ({node, ...props}) => <li className="pl-1" {...props} />,
                                strong: ({node, ...props}) => <strong className="font-bold text-emerald-200" {...props} />,
                                code: ({node, ...props}) => <code className="bg-emerald-950/40 text-emerald-300 px-1.5 py-0.5 rounded text-xs font-mono border border-emerald-500/20" {...props} />,
                                blockquote: ({node, ...props}) => <blockquote className="border-l-4 border-emerald-500/30 bg-emerald-500/5 p-4 rounded-r-2xl italic my-4 text-zinc-300" {...props} />
                            }}
                        >
                            {message?.content}
                        </ReactMarkdown>
                    )}
                </div>
            )}
            
            {/* Glow Effect for AI bubble */}
            {!isUser && (
                <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 blur-[40px] rounded-full -mr-16 -mt-16 pointer-events-none" />
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MessageBubble;
