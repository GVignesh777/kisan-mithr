import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { MessageSquare, CheckCircle, Clock } from 'lucide-react';
import { toast } from 'react-toastify';

const AdminFeedback = () => {
  const [feedback, setFeedback] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchFeedback = async () => {
    setIsLoading(true);
    try {
      const token = localStorage.getItem('adminToken');
      // For demo, if backend route is not heavily populated, an empty array handles fine
      const res = await axios.get(`${process.env.REACT_APP_API_URL}/api/admin/feedback`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setFeedback(res.data);
    } catch (err) {
      toast.error('Failed to fetch user feedback');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchFeedback();
  }, []);

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      <div>
         <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
           <MessageSquare className="text-emerald-500 w-6 h-6"/>
           User Feedback
         </h2>
         <p className="text-gray-500 text-sm mt-1">Review feedback, suggestions, and complaints directly from farmers.</p>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        {isLoading ? (
           <p className="text-center py-12 text-gray-500">Loading feedback records...</p>
        ) : feedback.length === 0 ? (
           <div className="text-center py-12">
             <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
                <MessageSquare className="w-8 h-8 text-gray-300" />
             </div>
             <p className="text-gray-500 font-medium">No feedback items found yet!</p>
           </div>
        ) : (
          <div className="divide-y divide-gray-100">
             {feedback.map((item) => (
                <div key={item._id} className="p-6 hover:bg-gray-50/50 transition-colors flex gap-6">
                   <div className="hidden sm:flex flex-col items-center gap-2">
                      <div className="w-12 h-12 bg-gradient-to-tr from-emerald-100 to-teal-50 text-emerald-600 rounded-full flex justify-center items-center text-xl font-bold">
                         {item.userName ? item.userName.charAt(0) : '?'}
                      </div>
                      <span className={`px-2 py-0.5 text-[10px] uppercase font-bold rounded-full ${
                        item.status === 'resolved' ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'
                      }`}>
                         {item.status}
                      </span>
                   </div>
                   
                   <div className="flex-1">
                      <div className="flex justify-between items-start mb-2">
                         <div>
                            <h4 className="font-bold text-gray-800">{item.userName || 'Anonymous Farmer'}</h4>
                            <p className="text-xs text-gray-500">{new Date(item.createdAt).toLocaleString()}</p>
                         </div>
                         {item.status === 'pending' && (
                            <button className="text-xs font-semibold text-emerald-600 bg-emerald-50 hover:bg-emerald-100 px-3 py-1.5 rounded-lg flex items-center gap-1 transition">
                               <CheckCircle className="w-3.5 h-3.5"/> Mark Resolved
                            </button>
                         )}
                      </div>
                      <p className="text-gray-600 text-sm mt-3 leading-relaxed bg-gray-50 p-4 rounded-xl border border-gray-100 border-l-4 border-l-emerald-400">
                         "{item.message}"
                      </p>
                      
                      {item.adminReply && (
                         <div className="mt-4 pl-4 border-l-2 border-gray-200">
                            <span className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1 block">Admin Response</span>
                            <p className="text-sm text-gray-700">{item.adminReply}</p>
                         </div>
                      )}
                      
                      {!item.adminReply && item.status === 'pending' && (
                         <div className="mt-4">
                            <input 
                              type="text" 
                              placeholder="Write a reply..." 
                              className="w-full sm:w-2/3 border border-gray-200 rounded-lg px-4 py-2 text-sm focus:ring-2 focus:ring-emerald-500 outline-none shadow-sm"
                            />
                            <button className="mt-2 text-xs font-semibold text-white bg-gray-800 hover:bg-gray-900 px-4 py-2 rounded-lg transition">Reply</button>
                         </div>
                      )}
                   </div>
                </div>
             ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminFeedback;
