import React from 'react';
import ReactMarkdown from 'react-markdown';
import { User, Sparkles } from 'lucide-react';

const MessageBubble = ({ message, isTypingIndicator = false }) => {
  const isUser = message.role === 'user';
  
  return (
    <div className={`flex w-full mb-6 px-4 sm:px-6 animate-in fade-in slide-in-from-bottom-2 duration-500 ${isUser ? 'justify-end' : 'justify-start'}`}>
      <div className={`flex max-w-[85%] sm:max-w-[75%] gap-3 ${isUser ? 'flex-row-reverse' : 'flex-row'}`}>
        
        {/* Avatar Section */}
        <div className={`shrink-0 w-8 h-8 sm:w-10 sm:h-10 rounded-2xl flex items-center justify-center border transition-all duration-500 shadow-lg
          ${isUser 
            ? 'bg-green-500/20 border-green-500/30 text-green-400' 
            : 'bg-zinc-800/50 border-white/10 text-green-500 shadow-green-500/10'
          }`}
        >
          {isUser ? <User size={18} /> : <Sparkles size={18} className="animate-pulse" />}
        </div>

        {/* Message Content */}
        <div className="flex flex-col gap-1.5">
          {/* Role Label */}
          <span className={`text-[10px] font-black uppercase tracking-[0.2em] px-1 opacity-50
            ${isUser ? 'text-zinc-500 text-right' : 'text-green-500'}
          `}>
            {isUser ? 'Farmer' : 'Kisan Mithr AI'}
          </span>

          {/* Bubble Card */}
          <div className={`relative px-4 py-3 sm:px-5 sm:py-3.5 rounded-[24px] backdrop-blur-3xl border transition-all duration-500 shadow-xl
            ${isUser 
              ? 'bg-green-600/10 border-green-500/20 text-white rounded-tr-none' 
              : 'bg-white/[0.03] border-white/10 text-zinc-100 rounded-tl-none'
            }`}
          >
            {isTypingIndicator ? (
                <div className="flex space-x-1.5 items-center h-6 px-1">
                    <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-bounce [animation-delay:-0.3s]" />
                    <span className="w-1.5 h-1.5 bg-green-400 rounded-full animate-bounce [animation-delay:-0.15s]" />
                    <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-bounce" />
                </div>
            ) : (
                <div className="text-[15px] sm:text-base leading-relaxed font-medium tracking-wide whitespace-pre-wrap ai-markdown-content break-words">
                    {isUser ? (
                        <p>{message.content}</p>
                    ) : (
                        <ReactMarkdown
                            components={{
                                h1: ({node, ...props}) => <h1 className="text-xl sm:text-2xl font-black text-white mt-4 mb-2 border-l-2 border-green-500 pl-3 uppercase tracking-tighter" {...props} />,
                                h2: ({node, ...props}) => <h2 className="text-lg sm:text-xl font-bold text-green-400 mt-4 mb-2 uppercase tracking-wide" {...props} />,
                                h3: ({node, ...props}) => <h3 className="text-base sm:text-lg font-semibold text-green-300 mt-3 mb-1" {...props} />,
                                p: ({node, ...props}) => <p className="mb-3 last:mb-0 opacity-90" {...props} />,
                                ul: ({node, ...props}) => <ul className="list-disc pl-5 mb-3 space-y-1.5 marker:text-green-400 opacity-90" {...props} />,
                                ol: ({node, ...props}) => <ol className="list-decimal pl-5 mb-3 space-y-1.5 marker:text-green-400 opacity-90" {...props} />,
                                li: ({node, ...props}) => <li className="pl-1" {...props} />,
                                strong: ({node, ...props}) => <strong className="font-bold text-green-300" {...props} />,
                                code: ({node, ...props}) => <code className="bg-green-950/50 text-green-300 px-1.5 py-0.5 rounded text-xs font-mono" {...props} />,
                                blockquote: ({node, ...props}) => <blockquote className="border-l-4 border-green-500/30 bg-green-500/5 p-3 rounded-r-lg italic my-3" {...props} />
                            }}
                        >
                            {message.content}
                        </ReactMarkdown>
                    )}
                </div>
            )}
          </div>
          
          {/* Timestamp */}
          <div className={`text-[9px] font-bold text-zinc-600 px-2 tracking-widest uppercase
            ${isUser ? 'text-right' : 'text-left'}
          `}>
             {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MessageBubble;
