import React from 'react';
import ReactMarkdown from 'react-markdown';

const MessageBubble = ({ message, isTypingIndicator = false }) => {
  const isUser = message.role === 'user';

  return (
    <>
    <style>{`
      @keyframes bubble-fade-in {
        from { opacity: 0; transform: translateY(10px); }
        to { opacity: 1; transform: translateY(0); }
      }
    `}</style>
    <div 
        className={`w-full flex ${isUser ? 'justify-end' : 'justify-start'}`}
        style={{ animation: 'bubble-fade-in 0.3s ease-out forwards' }}
    >
      <div 
        className={`max-w-[85%] md:max-w-[75%] rounded-2xl p-4 shadow-md transition-all
          ${isUser 
            ? 'bg-green-600/20 border border-green-500/30 text-white rounded-tr-none' 
            : 'bg-green-900/40 backdrop-blur-md shadow-[0_4px_30px_rgba(0,0,0,0.3)] text-zinc-100 rounded-tl-none border-l-4 border-green-400 border-y border-r border-green-400/10'
          }`}
      >
        {/* Name / Role Header */}
        <div className="flex items-center justify-between mb-2">
            <span className={`text-xs font-semibold tracking-wider uppercase ${isUser ? 'text-green-300' : 'text-green-400'}`}>
                {isUser ? 'You' : 'Kisan Mithr AI'}
            </span>
            {message.timestamp && (
                <span className="text-[10px] text-zinc-400 ml-4">{message.timestamp}</span>
            )}
        </div>

        {/* Content */}
        {isTypingIndicator ? (
            <div className="flex space-x-1 items-center h-6">
                <span className="w-2 h-2 bg-green-400 rounded-full animate-bounce" />
                <span className="w-2 h-2 bg-green-400 rounded-full animate-bounce" style={{ animationDelay: '0.15s' }} />
                <span className="w-2 h-2 bg-green-400 rounded-full animate-bounce" style={{ animationDelay: '0.3s' }} />
            </div>
        ) : (
            <div className="text-[15px] sm:text-base leading-relaxed whitespace-pre-wrap ai-markdown-content break-words">
                {isUser ? (
                    <p>{message.content}</p>
                ) : (
                    <ReactMarkdown
                        components={{
                            h1: ({node, ...props}) => <h1 className="text-2xl font-bold text-white mt-3 mb-1" {...props} />,
                            h2: ({node, ...props}) => <h2 className="text-xl font-semibold text-green-300 mt-3 mb-1" {...props} />,
                            h3: ({node, ...props}) => <h3 className="text-lg font-medium text-green-200 mt-2 mb-1" {...props} />,
                            p: ({node, ...props}) => <p className="mb-2" {...props} />,
                            ul: ({node, ...props}) => <ul className="list-disc pl-5 mb-2 space-y-1 marker:text-green-400" {...props} />,
                            ol: ({node, ...props}) => <ol className="list-decimal pl-5 mb-2 space-y-1 marker:text-green-400" {...props} />,
                            li: ({node, ...props}) => <li className="pl-1" {...props} />,
                            strong: ({node, ...props}) => <strong className="font-bold text-white" {...props} />,
                        }}
                    >
                        {message.content}
                    </ReactMarkdown>
                )}
            </div>
        )}
      </div>
    </div>
    </>
  );
};

export default MessageBubble;
