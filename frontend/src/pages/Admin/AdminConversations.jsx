import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Loader2, MessageSquare, Calendar, ChevronDown, Eye, X } from 'lucide-react';
import { toast } from 'react-toastify';

const AdminConversations = () => {
  const [conversations, setConversations] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedId, setExpandedId] = useState(null);
  const [selectedImage, setSelectedImage] = useState(null);

  const fetchLogs = async () => {
    setIsLoading(true);
    try {
      const token = localStorage.getItem('adminToken');
      const res = await axios.get(`${process.env.REACT_APP_API_URL}/api/admin/conversations`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setConversations(res.data);
    } catch (err) {
      toast.error('Failed to fetch conversation logs');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, []);

  const filteredConversations = conversations.filter(conv => {
    const term = searchTerm.toLowerCase();
    const userName = conv.userId?.name || 'Anonymous';
    return (
      userName.toLowerCase().includes(term) ||
      (conv.messages && conv.messages.some(m => m.content && m.content.toLowerCase().includes(term))) ||
      (conv.userId?._id?.toString().toLowerCase().includes(term))
    );
  });

  return (
    <div className="space-y-10 max-w-[1400px] mx-auto pb-12">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
        <div>
           <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-emerald-500/10 rounded-lg">
                <MessageSquare className="text-emerald-500 w-5 h-5"/>
              </div>
              <span className="text-[10px] font-black text-emerald-600 uppercase tracking-widest">Support Intelligence</span>
           </div>
           <h2 className="text-4xl font-black text-slate-900 tracking-tighter">AI Conversation Hub</h2>
           <p className="text-slate-500 font-bold mt-2">Monitor real-time interactions between farmers and AI Assistant.</p>
        </div>
        
        <div className="relative w-full md:w-96 group">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-slate-400 group-focus-within:text-emerald-500 transition-colors" />
          </div>
          <input
            type="text"
            className="block w-full pl-12 pr-4 py-4 bg-white border border-slate-200 rounded-[1.5rem] text-sm font-bold placeholder-slate-400 focus:outline-none focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 transition-all shadow-sm"
            placeholder="Search by farmer name, message, or ID..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* Main List Container */}
      <div className="bg-white rounded-[3rem] shadow-sm border border-slate-100 overflow-hidden">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center p-24">
             <div className="relative w-16 h-16 flex items-center justify-center">
                <div className="absolute inset-0 rounded-full border-4 border-emerald-500/20"></div>
                <div className="absolute inset-0 rounded-full border-4 border-t-emerald-500 animate-spin"></div>
                <Loader2 className="w-6 h-6 text-emerald-500 animate-pulse" />
             </div>
             <p className="text-slate-500 font-black text-xs uppercase tracking-widest mt-6">Indexing Conversations...</p>
          </div>
        ) : filteredConversations.length === 0 ? (
          <div className="p-24 text-center">
             <div className="w-20 h-20 bg-slate-50 rounded-3xl flex items-center justify-center mx-auto mb-6">
                <Search className="w-8 h-8 text-slate-300" />
             </div>
             <p className="text-slate-900 font-black text-xl mb-2">No conversations found</p>
             <p className="text-slate-400 font-bold">Try adjusting your search terms or filters.</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-50">
             {filteredConversations.map((conv, index) => (
                <motion.div 
                   initial={{ opacity: 0, x: -20 }}
                   animate={{ opacity: 1, x: 0 }}
                   transition={{ delay: index * 0.05 }}
                   key={conv._id} 
                   className="hover:bg-slate-50/80 transition-all"
                >
                   <div 
                      onClick={() => setExpandedId(expandedId === conv._id ? null : conv._id)}
                      className="px-8 py-6 flex items-center justify-between cursor-pointer group"
                   >
                     <div className="flex items-center gap-8 flex-1 overflow-hidden">
                        <div className="flex items-center gap-4 min-w-[240px]">
                           <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-slate-100 to-slate-200 flex items-center justify-center shadow-inner group-hover:scale-110 transition-transform">
                              <span className="text-sm font-black text-slate-600">
                                {conv.userId?.name ? conv.userId.name.substring(0,2).toUpperCase() : 'AN'}
                              </span>
                           </div>
                           <div className="overflow-hidden">
                              <h4 className="text-sm font-black text-slate-900 truncate tracking-tight">{conv.userId?.name || 'Anonymous Farmer'}</h4>
                              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">
                                {conv.userId?.phone || 'Contact Private'}
                              </p>
                           </div>
                        </div>

                        <div className="hidden lg:flex items-center gap-2 text-xs font-bold text-slate-500 min-w-[120px]">
                           <div className="w-2 h-2 rounded-full bg-blue-400"></div>
                           {conv.title || 'Support Session'}
                        </div>

                        <div className="hidden xl:flex items-center gap-3 text-xs font-bold text-slate-400 min-w-[200px]">
                           <Calendar className="w-4 h-4" />
                           {new Date(conv.updatedAt || conv.createdAt).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' })}
                        </div>

                        <div className="flex-1 overflow-hidden">
                           <p className="text-sm text-slate-600 truncate italic">
                             {conv.messages && conv.messages.length > 0 
                               ? `"${conv.messages[conv.messages.length - 1].content.substring(0, 80)}${conv.messages[conv.messages.length - 1].content.length > 80 ? '...' : ''}"`
                               : 'Interactive session initiated'}
                           </p>
                        </div>
                     </div>
                     <div className={`p-2 rounded-xl transition-all ${expandedId === conv._id ? 'bg-emerald-50 text-emerald-600' : 'text-slate-300'}`}>
                        <ChevronDown className={`w-6 h-6 transition-transform duration-300 ${expandedId === conv._id ? 'rotate-180' : ''}`} />
                     </div>
                   </div>

                   <AnimatePresence>
                     {expandedId === conv._id && (
                       <motion.div 
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: "auto", opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          className="overflow-hidden bg-[#fbfcfd]"
                       >
                         <div className="px-8 py-10 space-y-8 max-h-[600px] overflow-y-auto custom-scrollbar">
                           {conv.messages && conv.messages.map((msg, idx) => {
                             const isBot = msg.role === 'assistant' || msg.role === 'ai';
                             return (
                               <div key={idx} className={`flex flex-col ${isBot ? 'items-start' : 'items-end'} space-y-2`}>
                                 <div className={`flex items-center gap-2 mb-1 px-2 ${isBot ? 'flex-row' : 'flex-row-reverse'}`}>
                                    <div className={`w-1.5 h-1.5 rounded-full ${isBot ? 'bg-emerald-500' : 'bg-blue-500'}`}></div>
                                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">
                                      {isBot ? 'AI Intelligence' : (conv.userId?.name || 'Farmer')}
                                    </span>
                                 </div>
                                 <div className={`max-w-[75%] rounded-[2rem] p-6 shadow-sm border ${
                                   isBot 
                                     ? 'bg-white border-slate-100 text-slate-800 rounded-tl-none' 
                                     : 'bg-emerald-600 border-emerald-600 text-white rounded-tr-none shadow-emerald-900/10'
                                 }`}>
                                    <p className="text-[15px] font-medium leading-relaxed whitespace-pre-wrap">{msg.content}</p>
                                    
                                    {msg.imageUrl && (
                                       <div 
                                          className="mt-4 rounded-2xl overflow-hidden border border-slate-200/20 cursor-pointer relative group/img"
                                          onClick={() => setSelectedImage(msg.imageUrl)}
                                       >
                                          <img src={msg.imageUrl} alt="Uploaded attachment" className="w-full max-h-64 object-cover group-hover:scale-105 transition-transform" />
                                          <div className="absolute inset-0 bg-black/20 opacity-0 group-hover/img:opacity-100 transition-opacity flex items-center justify-center">
                                             <Eye className="text-white w-6 h-6" />
                                          </div>
                                       </div>
                                    )}
                                 </div>
                                 <span className="text-[9px] font-bold text-slate-300 px-4">
                                   {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                 </span>
                               </div>
                             );
                           })}
                         </div>
                         {/* Session Action Bar */}
                         <div className="px-8 py-4 bg-slate-50/50 border-t border-slate-100 flex justify-end gap-3">
                            <button className="px-4 py-2 rounded-xl text-xs font-black text-slate-400 uppercase tracking-widest hover:text-slate-900 transition-colors">Export Log</button>
                            <button className="px-4 py-2 rounded-xl text-xs font-black text-emerald-600 bg-emerald-50 uppercase tracking-widest hover:bg-emerald-100 transition-colors">Review Accuracy</button>
                         </div>
                       </motion.div>
                     )}
                   </AnimatePresence>
                </motion.div>
             ))}
          </div>
        )}
      </div>

      {/* Image Modal for attachments */}
      <AnimatePresence>
        {selectedImage && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-black/95 backdrop-blur-xl flex items-center justify-center p-8"
            onClick={() => setSelectedImage(null)}
          >
            <motion.div 
               initial={{ scale: 0.9, opacity: 0 }}
               animate={{ scale: 1, opacity: 1 }}
               className="relative max-w-5xl w-full h-full flex items-center justify-center"
            >
               <button className="absolute top-0 right-0 p-4 text-white/50 hover:text-white transition-colors">
                  <X className="w-8 h-8" />
               </button>
               <img src={selectedImage} alt="Fullscreen attachment" className="max-w-full max-h-full object-contain rounded-2xl shadow-2xl" />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default AdminConversations;
