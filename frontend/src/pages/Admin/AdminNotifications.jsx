import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Bell, Send, Trash2, Globe2 } from 'lucide-react';
import { toast } from 'react-toastify';

const AdminNotifications = () => {
  const [notifications, setNotifications] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [formData, setFormData] = useState({ title: '', message: '', region: '', cropType: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchNotifications = async () => {
    setIsLoading(true);
    try {
      const token = localStorage.getItem('adminToken');
      const res = await axios.get(`${process.env.REACT_APP_API_URL}/api/admin/notifications`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setNotifications(res.data);
    } catch (err) {
      toast.error('Failed to fetch notifications');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const token = localStorage.getItem('adminToken');
      await axios.post(`${process.env.REACT_APP_API_URL}/api/admin/notifications`, formData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success('Broadcast sent successfully!');
      setFormData({ title: '', message: '', region: '', cropType: '' });
      fetchNotifications();
    } catch (err) {
      toast.error('Failed to send broadcast');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if(!window.confirm("Delete this notification?")) return;
    try {
      const token = localStorage.getItem('adminToken');
      await axios.delete(`${process.env.REACT_APP_API_URL}/api/admin/notifications/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success('Notification deleted');
      setNotifications(notifications.filter(n => n._id !== id));
    } catch (err) {
      toast.error('Failed to delete notification');
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 max-w-7xl mx-auto">
      {/* Broadcast Form */}
      <div className="lg:col-span-1">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 sticky top-24">
          <div className="mb-6 flex items-center gap-3">
             <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center">
                <Send className="text-blue-600 w-5 h-5"/>
             </div>
             <div>
                <h3 className="font-bold text-gray-800">New Broadcast</h3>
                <p className="text-xs text-gray-500">Send an alert to users</p>
             </div>
          </div>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Alert Title</label>
              <input
                type="text"
                required
                value={formData.title}
                onChange={(e) => setFormData({...formData, title: e.target.value})}
                className="w-full border border-gray-300 rounded-xl px-4 py-2 text-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-shadow"
                placeholder="e.g. Pest Warning!"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Message</label>
              <textarea
                required
                rows="4"
                value={formData.message}
                onChange={(e) => setFormData({...formData, message: e.target.value})}
                className="w-full border border-gray-300 rounded-xl px-4 py-2 text-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-shadow resize-none"
                placeholder="Detailed information..."
              ></textarea>
            </div>
            <div className="grid grid-cols-2 gap-4">
               <div>
                 <label className="block text-sm font-medium text-gray-700 mb-1">Region (Optional)</label>
                 <input
                   type="text"
                   value={formData.region}
                   onChange={(e) => setFormData({...formData, region: e.target.value})}
                   className="w-full border border-gray-300 rounded-xl px-4 py-2 text-sm focus:ring-2 focus:ring-emerald-500 outline-none"
                   placeholder="e.g. Punjab"
                 />
               </div>
               <div>
                 <label className="block text-sm font-medium text-gray-700 mb-1">Target Crop</label>
                 <input
                   type="text"
                   value={formData.cropType}
                   onChange={(e) => setFormData({...formData, cropType: e.target.value})}
                   className="w-full border border-gray-300 rounded-xl px-4 py-2 text-sm focus:ring-2 focus:ring-emerald-500 outline-none"
                   placeholder="e.g. Wheat"
                 />
               </div>
            </div>
            
            <button
               type="submit"
               disabled={isSubmitting}
               className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-semibold shadow-md shadow-emerald-600/20 active:scale-95 transition-all flex justify-center items-center mt-4"
            >
               {isSubmitting ? 'Sending...' : 'Broadcast Now'}
            </button>
          </form>
        </div>
      </div>

      {/* History */}
      <div className="lg:col-span-2 space-y-4">
        <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2 mb-6">
          <Bell className="text-emerald-500 w-6 h-6"/>
          Alert History
        </h2>
        
        {isLoading ? (
           <p className="text-gray-500 text-center py-10">Loading broadcast history...</p>
        ) : notifications.length === 0 ? (
           <div className="bg-white border text-center border-gray-100 rounded-2xl p-10 text-gray-500">
             No broadcasts sent yet. Use the form to send an alert.
           </div>
        ) : (
          notifications.map((notif) => (
            <div key={notif._id} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 hover:shadow-md transition-shadow relative group">
               <button 
                  onClick={() => handleDelete(notif._id)}
                  className="absolute top-4 right-4 text-gray-300 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100"
               >
                  <Trash2 className="w-5 h-5"/>
               </button>
               
               <h4 className="text-lg font-bold text-gray-800 pr-8">{notif.title}</h4>
               <p className="text-gray-600 mt-2 text-sm leading-relaxed">{notif.message}</p>
               
               <div className="flex flex-wrap items-center gap-4 mt-4 text-xs font-semibold">
                  <span className="text-gray-400">{new Date(notif.createdAt).toLocaleString()}</span>
                  
                  {(notif.region || notif.cropType) && <span className="w-1 h-1 bg-gray-300 rounded-full"></span>}
                  
                  {notif.region && (
                     <span className="bg-blue-50 text-blue-700 px-2.5 py-1 rounded-md flex items-center gap-1">
                        <Globe2 className="w-3 h-3"/> {notif.region}
                     </span>
                  )}
                  {notif.cropType && (
                     <span className="bg-emerald-50 text-emerald-700 px-2.5 py-1 rounded-md">
                        Crop: {notif.cropType}
                     </span>
                  )}
               </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default AdminNotifications;
