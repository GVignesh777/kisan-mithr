import React, { useState, useRef, useEffect } from 'react';
import { MessageSquare, Plus, MoreHorizontal, Edit2, Trash2, X, Check } from 'lucide-react';

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
        className={`group relative flex items-center justify-between w-full p-2.5 rounded-lg mb-1 cursor-pointer transition-colors duration-200
            ${isActive ? 'bg-green-800/40 text-white' : 'hover:bg-green-800/20 text-zinc-300 hover:text-white'}
        `}
    >
      <div className="flex items-center gap-3 overflow-hidden w-full">
        <MessageSquare size={16} className={`shrink-0 ${isActive ? 'text-green-400' : 'text-zinc-500'}`} />
        
        {isEditing ? (
            <input
                autoFocus
                value={editTitle}
                onChange={(e) => setEditTitle(e.target.value)}
                onKeyDown={handleKeyDown}
                onClick={(e) => e.stopPropagation()}
                className="w-full bg-black/50 border border-green-500 rounded px-2 py-0.5 text-sm text-white focus:outline-none"
            />
        ) : (
            <div className={`text-sm truncate w-full pr-6 ${isActive ? 'font-medium' : ''}`}>
                {chat.title || "New Conversation"}
            </div>
        )}
      </div>

      {isActive && !isEditing && (
        <div className="absolute right-2 flex items-center bg-gradient-to-l from-emerald-900/90 from-60% pl-4">
            <button 
                onClick={(e) => { e.stopPropagation(); setShowMenu(!showMenu); }}
                className="p-1 hover:text-white text-zinc-400 focus:outline-none"
            >
                <MoreHorizontal size={16} />
            </button>
            
            {showMenu && (
                <div ref={menuRef} className="absolute right-0 top-8 w-32 bg-zinc-800 border border-zinc-700 rounded-md shadow-xl z-50 overflow-hidden text-sm">
                    <button 
                        onClick={(e) => { e.stopPropagation(); setIsEditing(true); setShowMenu(false); }}
                        className="flex items-center gap-2 w-full px-3 py-2 text-left text-zinc-200 hover:bg-zinc-700 hover:text-white transition-colors"
                    >
                        <Edit2 size={14} /> Rename
                    </button>
                    <button 
                        onClick={(e) => { e.stopPropagation(); onDelete(chat.id); setShowMenu(false); }}
                        className="flex items-center gap-2 w-full px-3 py-2 text-left text-red-400 hover:bg-red-500/20 hover:text-red-300 transition-colors"
                    >
                        <Trash2 size={14} /> Delete
                    </button>
                </div>
            )}
        </div>
      )}

      {isEditing && (
        <div className="absolute right-2 flex gap-1 z-10 bg-black/50 px-1 rounded">
            <button onClick={handleSave} className="p-1 hover:text-green-400 text-zinc-400"><Check size={14} /></button>
            <button onClick={(e) => { e.stopPropagation(); setIsEditing(false); setEditTitle(chat.title); }} className="p-1 hover:text-red-400 text-zinc-400"><X size={14} /></button>
        </div>
      )}
    </div>
  );
};

import { Link, useLocation } from 'react-router-dom';

const Sidebar = ({ chats, activeChatId, onSelectChat, onNewChat, onDeleteChat, onEditChat }) => {
  const [width, setWidth] = useState(260); // Default ChatGPT width
  const sidebarRef = useRef(null);
  const isDragging = useRef(false);
  const location = useLocation();

  useEffect(() => {
    const handleMouseMove = (e) => {
      if (!isDragging.current) return;
      
      let newWidth = e.clientX;
      if (newWidth < 220) newWidth = 220; // Min width as per requirements
      if (newWidth > 400) newWidth = 400; // Max width
      
      setWidth(newWidth);
    };

    const handleMouseUp = () => {
      isDragging.current = false;
      document.body.style.cursor = 'default';
      // Optional: Save width to local storage
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

  const NavLink = ({ to, icon, label }) => {
      const isActive = location.pathname === to;
      return (
          <Link to={to} className={`flex items-center gap-3 px-3 py-2 rounded-md mb-1 transition-colors text-sm ${isActive ? 'bg-green-600/30 text-white font-medium shadow-[0_0_10px_rgba(74,222,128,0.2)]' : 'text-zinc-400 hover:text-zinc-200 hover:bg-white/5'}`}>
              <span className={isActive ? 'text-green-400' : 'text-zinc-500'}>{icon}</span>
              {label}
          </Link>
      );
  };

  return (
    <div 
        ref={sidebarRef}
        style={{ width: `${width}px` }}
        className="h-screen shrink-0 bg-green-900/40 backdrop-blur-md shadow-[0_4px_30px_rgba(0,0,0,0.3)] flex flex-col relative border-r border-white/10 z-30 transition-none"
    >
      {/* New Chat & Dashboard Navigation */}
      <div className="p-4 border-b border-white/5 space-y-1">
          <button 
              onClick={onNewChat}
              className="w-full flex items-center justify-center gap-2 px-3 py-2.5 mb-4 border border-green-500/30 bg-green-600/20 rounded-md text-sm font-medium hover:bg-green-600/40 hover:border-green-400/50 transition-all duration-300 text-white shadow-sm"
          >
              <Plus size={18} className="text-green-400" />
              New Chat
          </button>

          <NavLink to="/" icon={<MessageSquare size={16}/>} label="Smart Assistant" />
          <NavLink to="/weather" icon={<span style={{fontSize:'16px'}}>🌤️</span>} label="Weather Dashboard" />
          <NavLink to="/market" icon={<span style={{fontSize:'16px'}}>📈</span>} label="Market Prices" />
          <NavLink to="/crop-health" icon={<span style={{fontSize:'16px'}}>🛰️</span>} label="Crop Health Map" />
          <NavLink to="/pest-detect" icon={<span style={{fontSize:'16px'}}>🐛</span>} label="Pest Detector" />
          <NavLink to="/farm-profile" icon={<span style={{fontSize:'16px'}}>⚙️</span>} label="Farm Profile" />
      </div>

      {/* Chat History List */}
      <div className="flex-1 overflow-y-auto no-scrollbar px-3 pb-4">
          <div className="text-xs font-semibold text-zinc-500 mb-3 px-2 uppercase tracking-wider">
              Recent Chats
          </div>
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
          {chats.length === 0 && (
              <div className="text-zinc-500 text-sm px-2 mt-4 text-center">
                  No previous conversations
              </div>
          )}
      </div>

      {/* Resize Handle */}
      <div 
          className="absolute top-0 right-0 w-1.5 h-full cursor-col-resize hover:bg-green-400/50 active:bg-green-400/80 transition-colors z-50 flex items-center group"
          onMouseDown={() => {
              isDragging.current = true;
              document.body.style.cursor = 'col-resize';
          }}
      >
          {/* Visual indicator for dragger handle */}
          <div className="hidden group-hover:block w-0.5 h-10 bg-green-300/80 mx-auto rounded-full" />
      </div>
    </div>
  );
};

export default Sidebar;
