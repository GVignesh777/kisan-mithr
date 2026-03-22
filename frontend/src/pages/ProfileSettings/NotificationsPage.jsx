import React, { useState, useEffect, useRef } from 'react';
import { Bell, ShieldAlert, Landmark, MessageSquare, Shield, X, Send, CheckCheck } from 'lucide-react';
import useUserStore from '../../store/useUserStore';

const MOCK_NOTIFICATIONS = [
    {
        id: 1,
        type: 'gov',
        title: 'New Subsidy Announced',
        message: 'The Ministry of Agriculture has announced a new 40% subsidy for solar water pumps. Apply before next month.',
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
        read: false,
    },
    {
        id: 2,
        type: 'scheme',
        title: 'PM-Kisan Installment Update',
        message: 'Your upcoming PM-Kisan installment is scheduled to be credited by the 15th of this month.',
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
        read: true,
    },
    {
        id: 3,
        type: 'admin',
        title: 'Account Verification Required',
        message: 'Please upload your latest land ownership documents to verify your farmer status on Kisan Mithr.',
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 48).toISOString(),
        read: true,
    }
];

const NotificationsPage = () => {
    const { user } = useUserStore();
    const [notifications, setNotifications] = useState(MOCK_NOTIFICATIONS);
    const [activeChat, setActiveChat] = useState(null);
    const [chatMessages, setChatMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');
    const chatEndRef = useRef(null);

    // Simulate real-time incoming notification
    useEffect(() => {
        const timer = setTimeout(() => {
            const newNotif = {
                id: Date.now(),
                type: 'admin',
                title: 'Welcome to Kisan Mithr',
                message: 'Hello! If you have any issues navigating the platform, you can reply directly to this message.',
                timestamp: new Date().toISOString(),
                read: false,
            };
            setNotifications(prev => [newNotif, ...prev]);
        }, 5000); // 5 seconds after page load
        return () => clearTimeout(timer);
    }, []);

    const markAsRead = (id) => {
        setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
    };

    const handleReplyClick = (notif) => {
        markAsRead(notif.id);
        setActiveChat(notif);
        // Load mock history or start fresh
        setChatMessages([
            { id: 1, sender: 'admin', text: notif.message, time: new Date(notif.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) }
        ]);
    };

    const sendMessage = (e) => {
        e.preventDefault();
        if (!newMessage.trim()) return;

        const timeStr = new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
        const userMsg = { id: Date.now(), sender: 'user', text: newMessage, time: timeStr };
        setChatMessages(prev => [...prev, userMsg]);
        setNewMessage('');

        // Simulate Admin Response
        setTimeout(() => {
            const adminReply = { id: Date.now() + 1, sender: 'admin', text: 'Thank you for your message. An admin will review this shortly.', time: new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) };
            setChatMessages(prev => [...prev, adminReply]);
        }, 1500);
    };

    useEffect(() => {
        if (chatEndRef.current) {
            chatEndRef.current.scrollIntoView({ behavior: 'smooth' });
        }
    }, [chatMessages, activeChat]);

    const getIcon = (type) => {
        switch(type) {
            case 'gov': return <Landmark className="text-blue-400" size={24} />;
            case 'scheme': return <ShieldAlert className="text-orange-400" size={24} />;
            case 'admin': return <Shield className="text-green-400" size={24} />;
            default: return <Bell className="text-zinc-400" size={24} />;
        }
    };

    const getBadgeStyle = (type) => {
        switch(type) {
            case 'gov': return 'bg-blue-500/10 text-blue-400 border-blue-500/30';
            case 'scheme': return 'bg-orange-500/10 text-orange-400 border-orange-500/30';
            case 'admin': return 'bg-green-500/10 text-green-400 border-green-500/30';
            default: return 'bg-zinc-500/10 text-zinc-400 border-zinc-500/30';
        }
    };

    const formatTime = (isoString) => {
        const date = new Date(isoString);
        return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
    };

    return (
        <div className="min-h-screen bg-zinc-950 text-zinc-100 flex justify-center py-10 px-4 sm:px-6 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-blue-900/10 via-zinc-950 to-zinc-950 pt-24">
            <div className="max-w-4xl w-full flex flex-col md:flex-row gap-6 relative">
                
                {/* Notifications List Panel */}
                <div className={`flex-1 transition-all duration-300 ${activeChat ? 'hidden md:block md:w-1/2 opacity-50 pointer-events-none md:pointer-events-auto md:opacity-100' : 'w-full'}`}>
                    <div className="flex items-center gap-3 mb-6 px-2">
                        <div className="p-3 bg-zinc-800/80 rounded-xl shadow-lg border border-zinc-700/50">
                            <Bell className="text-green-400 w-6 h-6" />
                        </div>
                        <div>
                            <h2 className="text-2xl font-black text-white tracking-wide">Notifications</h2>
                            <p className="text-xs text-zinc-400 uppercase tracking-widest font-bold">Real-time Updates</p>
                        </div>
                    </div>

                    <div className="space-y-4">
                        {notifications.map(notif => (
                            <div 
                                key={notif.id}
                                onClick={() => markAsRead(notif.id)}
                                className={`p-5 rounded-2xl border transition-all duration-300 cursor-pointer ${notif.read ? 'bg-zinc-900/40 border-white/5' : 'bg-zinc-800/60 border-green-500/30 shadow-[0_0_15px_rgba(74,222,128,0.1)]'}`}
                            >
                                <div className="flex gap-4">
                                    <div className="shrink-0 mt-1">
                                        <div className="p-2.5 bg-black/40 rounded-xl border border-zinc-800">
                                            {getIcon(notif.type)}
                                        </div>
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex justify-between items-start mb-1">
                                            <span className={`text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded-md border ${getBadgeStyle(notif.type)}`}>
                                                {notif.type}
                                            </span>
                                            <span className="text-xs text-zinc-500 font-medium whitespace-nowrap ml-2">
                                                {formatTime(notif.timestamp)}
                                            </span>
                                        </div>
                                        <h3 className={`font-bold mb-1 truncate ${notif.read ? 'text-zinc-300' : 'text-white'}`}>{notif.title}</h3>
                                        <p className="text-sm text-zinc-400 line-clamp-2 md:line-clamp-none leading-relaxed">
                                            {notif.message}
                                        </p>
                                        
                                        {/* Admin Reply Action */}
                                        {notif.type === 'admin' && (
                                            <div className="mt-4 flex justify-end">
                                                <button 
                                                    onClick={(e) => { e.stopPropagation(); handleReplyClick(notif); }}
                                                    className="flex items-center gap-2 px-4 py-2 bg-green-500/10 hover:bg-green-500/20 text-green-400 text-sm font-bold border border-green-500/20 rounded-lg transition-colors"
                                                >
                                                    <MessageSquare size={16} /> Reply to Admin
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                    {!notif.read && (
                                        <div className="w-2.5 h-2.5 bg-green-500 rounded-full shrink-0 shadow-[0_0_8px_rgba(74,222,128,0.8)]"></div>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Admin Chat Overlay/Panel */}
                {activeChat && (
                    <div className="fixed inset-0 z-50 md:relative md:inset-auto md:z-auto md:w-1/2 bg-zinc-950 md:bg-transparent flex flex-col h-[100dvh] md:h-[calc(100vh-8rem)]">
                        <div className="flex-1 bg-zinc-900/80 md:bg-zinc-900/50 backdrop-blur-xl md:border border-zinc-800 md:rounded-3xl shadow-2xl overflow-hidden flex flex-col">
                            
                            {/* Chat Header */}
                            <div className="p-4 border-b border-zinc-800 bg-black/40 flex items-center justify-between sticky top-0 z-10">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-green-500/20 rounded-full border border-green-500/30">
                                        <Shield className="text-green-400 w-5 h-5" />
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-white text-sm md:text-base">Kisan Mithr Admin</h3>
                                        <p className="text-xs text-green-400 font-medium">Online • Support</p>
                                    </div>
                                </div>
                                <button 
                                    onClick={() => setActiveChat(null)}
                                    className="p-2 hover:bg-zinc-800 rounded-full transition-colors text-zinc-400 hover:text-white"
                                >
                                    <X size={20} />
                                </button>
                            </div>

                            {/* Chat Body */}
                            <div className="flex-1 overflow-y-auto p-4 space-y-4">
                                <div className="text-center text-xs text-zinc-500 font-medium uppercase tracking-widest my-4">
                                    Regarding: {activeChat.title}
                                </div>
                                
                                {chatMessages.map(msg => (
                                    <div key={msg.id} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                                        <div className={`max-w-[80%] rounded-2xl px-4 py-2.5 shadow-md ${
                                            msg.sender === 'user' 
                                            ? 'bg-green-600 text-white rounded-tr-sm' 
                                            : 'bg-zinc-800 border border-zinc-700 text-zinc-200 rounded-tl-sm'
                                        }`}>
                                            <p className="text-sm">{msg.text}</p>
                                            <div className={`text-[10px] mt-1.5 flex items-center justify-end gap-1 ${msg.sender === 'user' ? 'text-green-200' : 'text-zinc-500'}`}>
                                                {msg.time}
                                                {msg.sender === 'user' && <CheckCheck size={12} />}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                                <div ref={chatEndRef} />
                            </div>

                            {/* Chat Input */}
                            <div className="p-4 bg-zinc-900 border-t border-zinc-800 sticky bottom-0">
                                <form onSubmit={sendMessage} className="relative flex items-center">
                                    <input 
                                        type="text" 
                                        value={newMessage}
                                        onChange={(e) => setNewMessage(e.target.value)}
                                        placeholder="Type your message to admin..."
                                        className="w-full bg-black/50 border border-zinc-700 rounded-full pl-5 pr-12 py-3.5 text-sm text-white focus:outline-none focus:border-green-500 focus:ring-1 focus:ring-green-500/50 transition-all placeholder-zinc-500"
                                    />
                                    <button 
                                        type="submit"
                                        disabled={!newMessage.trim()}
                                        className="absolute right-2 p-2 bg-green-500 text-black rounded-full hover:bg-green-400 hover:scale-105 transition-all disabled:opacity-50 disabled:hover:scale-100 disabled:cursor-not-allowed"
                                    >
                                        <Send size={16} className="ml-0.5" />
                                    </button>
                                </form>
                            </div>

                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default NotificationsPage;
