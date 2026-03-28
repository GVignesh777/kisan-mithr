import React, { useState, useRef, useEffect } from 'react';
import { MessageSquare, Plus, MoreHorizontal, Edit2, Trash2, X, Check } from 'lucide-react';
import { useLocation } from 'react-router-dom';

const ChatItem = ({ chat, isActive, onSelect, onDelete, onEdit }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState(chat.title);
  const [showMenu, setShowMenu] = useState(false);
  
  const menuRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setShowMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSave = (e) => {
    e.stopPropagation();
    if (editTitle.trim() && editTitle !== chat.title) {
        onEdit(chat.id, editTitle.trim());
    } else {
        setEditTitle(chat.title);
    }
    setIsEditing(false);
    setShowMenu(false);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') handleSave(e);
    if (e.key === 'Escape') {
        setEditTitle(chat.title);
        setIsEditing(false);
        setShowMenu(false);
    }
  };

  return (
    <div 
        onClick={() => !isEditing && onSelect(chat.id)}
        className={`group relative flex items-center justify-between w-full p-2.5 rounded-xl mb-1.5 cursor-pointer transition-all duration-300 border
            ${isActive 
                ? 'bg-green-600/20 border-green-500/30 text-white shadow-[0_0_15px_rgba(34,197,94,0.1)]' 
                : 'bg-transparent border-transparent hover:bg-white/5 text-zinc-400 hover:text-white'
            }
        `}
    >
      <div className="flex items-center gap-3 overflow-hidden w-full">
        <MessageSquare size={16} className={`shrink-0 transition-colors ${isActive ? 'text-green-400' : 'text-zinc-500 group-hover:text-zinc-400'}`} />
        
        {isEditing ? (
            <input
                autoFocus
                value={editTitle}
                onChange={(e) => setEditTitle(e.target.value)}
                onKeyDown={handleKeyDown}
                onClick={(e) => e.stopPropagation()}
                className="w-full bg-black/40 border border-green-500/50 rounded-lg px-2 py-1 text-sm text-white focus:outline-none"
            />
        ) : (
            <div className={`text-[13px] truncate w-full pr-6 tracking-wide ${isActive ? 'font-bold' : 'font-medium'}`}>
                {chat.title || "New Consultation"}
            </div>
        )}
      </div>

      {isActive && !isEditing && (
        <div className="absolute right-2 flex items-center">
            <button 
                onClick={(e) => { e.stopPropagation(); setShowMenu(!showMenu); }}
                className="p-1.5 rounded-lg hover:bg-white/10 text-zinc-500 hover:text-white transition-all focus:outline-none"
            >
                <MoreHorizontal size={14} />
            </button>
            
            {showMenu && (
                <div ref={menuRef} className="absolute right-0 top-9 w-36 bg-green-950/95 backdrop-blur-3xl border border-white/10 rounded-xl shadow-2xl z-[70] overflow-hidden p-1">
                    <button 
                        onClick={(e) => { e.stopPropagation(); setIsEditing(true); setShowMenu(false); }}
                        className="flex items-center gap-2.5 w-full px-3 py-2 text-xs font-bold text-zinc-300 hover:bg-white/5 hover:text-white transition-colors rounded-lg"
                    >
                        <Edit2 size={14} className="text-green-500" /> Rename
                    </button>
                    <button 
                        onClick={(e) => { e.stopPropagation(); onDelete(chat.id); setShowMenu(false); }}
                        className="flex items-center gap-2.5 w-full px-3 py-2 text-xs font-bold text-red-400 hover:bg-red-500/10 hover:text-red-400 transition-colors rounded-lg"
                    >
                        <Trash2 size={14} /> Delete
                    </button>
                </div>
            )}
        </div>
      )}

      {isEditing && (
        <div className="absolute right-2 flex gap-1 z-10 p-1">
            <button onClick={handleSave} className="p-1 text-green-400 hover:text-green-300 transition-colors"><Check size={14} /></button>
            <button onClick={(e) => { e.stopPropagation(); setIsEditing(false); setEditTitle(chat.title); }} className="p-1 text-red-400 hover:text-red-300 transition-colors"><X size={14} /></button>
        </div>
      )}
    </div>
  );
};


const Sidebar = ({ chats, activeChatId, onSelectChat, onNewChat, onDeleteChat, onEditChat, isOpen, setIsOpen }) => {
  const [width, setWidth] = useState(260);
  const sidebarRef = useRef(null);
  const isDragging = useRef(false);
  const location = useLocation();
  const [isMobile, setIsMobile] = useState(window.innerWidth < 1024);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 1024);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    const handleMouseMove = (e) => {
      if (!isDragging.current) return;
      let newWidth = e.clientX;
      if (newWidth < 240) newWidth = 240;
      if (newWidth > 450) newWidth = 450;
      setWidth(newWidth);
    };

    const handleMouseUp = () => {
      isDragging.current = false;
      document.body.style.cursor = 'default';
      localStorage.setItem('kisan_sidebar_width', width.toString());
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [width]);

  useEffect(() => {
    const savedWidth = localStorage.getItem('kisan_sidebar_width');
    if (savedWidth) setWidth(parseInt(savedWidth, 10));
  }, []);

  return (
    <>
      {/* Mobile Backdrop */}
      {isMobile && isOpen && (
          <div 
              className="fixed inset-0 bg-black/80 backdrop-blur-md z-[55] lg:hidden animate-in fade-in duration-500"
              onClick={() => setIsOpen(false)}
          />
      )}

      <div 
          ref={sidebarRef}
          style={{ width: isMobile ? '300px' : `${width}px` }}
          className={`
              h-screen shrink-0 bg-green-950/95 lg:bg-green-950/40 backdrop-blur-[40px] shadow-2xl
              flex flex-col border-r border-white/5 z-[60] transition-all duration-500 ease-in-out
              ${isMobile ? 'fixed inset-y-0 left-0' : 'relative'}
              ${isMobile && !isOpen ? '-translate-x-full' : 'translate-x-0'}
          `}
      >
        {/* New Chat Button */}
        <div className="px-6 py-8">
            <button 
              onClick={onNewChat}
              className="group w-full flex items-center justify-center gap-2.5 px-4 py-3.5 bg-gradient-to-br from-green-500 to-green-600 rounded-2xl text-[13px] font-black tracking-widest uppercase transition-all duration-300 hover:shadow-[0_8px_30px_rgb(34,197,94,0.3)] hover:scale-[1.02] active:scale-95 text-white"
            >
              <Plus size={20} strokeWidth={3} className="group-hover:rotate-90 transition-transform duration-300" />
              New Consultation
            </button>
        </div>

        {/* Chat History List */}
        <div className="flex-1 overflow-y-auto custom-scrollbar px-3 pb-8 mt-2">
            <div className="text-[10px] font-black text-zinc-600 mb-4 px-3 uppercase tracking-[3px] flex items-center justify-between opacity-70">
                <span>Recent History</span>
                <span className="bg-white/5 px-2 py-0.5 rounded text-[8px]">{chats.length}</span>
            </div>
            <div className="space-y-0.5">
                {chats.slice().reverse().map(chat => (
                    <ChatItem 
                        key={chat.id}
                        chat={chat}
                        isActive={chat.id === activeChatId}
                        onSelect={onSelectChat}
                        onDelete={onDeleteChat}
                        onEdit={onEditChat}
                    />
                ))}
            </div>
            {chats.length === 0 && (
                <div className="flex flex-col items-center justify-center py-12 px-4 text-center opacity-20">
                    <MessageSquare size={32} className="text-zinc-600 mb-3" />
                    <p className="text-[10px] font-black text-zinc-500 tracking-[0.2em]">NO CONVERSATIONS</p>
                </div>
            )}
        </div>

        {/* Sidebar Footer */}
        <div className="p-6 border-t border-white/5 bg-black/10">
            <div className="flex items-center gap-3">
                 <div className="w-8 h-8 rounded-full bg-green-950 border border-green-500/30 flex items-center justify-center text-[10px] font-black text-green-400">
                    KM
                 </div>
                 <div className="flex-1 min-w-0">
                    <p className="text-xs font-bold text-white truncate uppercase tracking-tighter">System Ready</p>
                    <p className="text-[10px] text-green-500 font-bold flex items-center gap-1.5 leading-none mt-1 uppercase tracking-widest">
                        <span className="w-1 h-1 bg-green-500 rounded-full animate-ping" />
                        Online
                    </p>
                 </div>
            </div>
        </div>
      </div>
    </>
  );
};

export default Sidebar;

