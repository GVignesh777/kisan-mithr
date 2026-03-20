import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { AnimatePresence, motion } from 'framer-motion';
import { Trash2, AlertTriangle, CheckCircle, Search, Eye, X, Loader2, MapPin, Calendar, Users } from 'lucide-react';
import { toast } from 'react-toastify';

const AdminDiseaseReports = () => {
  const [reports, setReports] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState('all'); 
  const [selectedImage, setSelectedImage] = useState(null);

  const fetchReports = async () => {
    setIsLoading(true);
    try {
      const token = localStorage.getItem('adminToken');
      const res = await axios.get(`${process.env.REACT_APP_API_URL}/api/admin/crop-reports`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setReports(res.data);
    } catch (err) {
      toast.error('Failed to fetch disease reports');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchReports();
  }, []);

  const updateStatus = async (id, status) => {
    try {
      const token = localStorage.getItem('adminToken');
      await axios.put(`${process.env.REACT_APP_API_URL}/api/admin/crop-reports/${id}`, { status }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success(`Report marked as ${status}`);
      setReports(reports.map(r => r._id === id ? { ...r, status } : r));
    } catch (err) {
      toast.error('Failed to update report status');
    }
  };

  const deleteReport = async (id) => {
    if(!window.confirm("Delete this report forever?")) return;
    try {
      const token = localStorage.getItem('adminToken');
      await axios.delete(`${process.env.REACT_APP_API_URL}/api/admin/crop-reports/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success('Report deleted');
      setReports(reports.filter(r => r._id !== id));
    } catch (err) {
      toast.error('Failed to delete report');
    }
  };

  const filteredReports = reports.filter(r => filter === 'all' || r.status === filter);

  return (
    <div className="space-y-10 max-w-[1600px] mx-auto pb-12">
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-6">
        <div>
           <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-amber-500/10 rounded-lg">
                <AlertTriangle className="text-amber-500 w-5 h-5"/>
              </div>
              <span className="text-[10px] font-black text-amber-600 uppercase tracking-widest">Surveillance Hub</span>
           </div>
           <h2 className="text-4xl font-black text-slate-900 tracking-tighter">Pest Detection Logs</h2>
           <p className="text-slate-500 font-bold mt-2">Verify AI-powered disease diagnostics from across the fields.</p>
        </div>
        
        <div className="flex bg-white p-2 rounded-[1.5rem] border border-slate-100 shadow-sm gap-1 self-stretch lg:self-auto">
          {['all', 'pending', 'verified', 'incorrect'].map(f => (
            <button
               key={f}
               onClick={() => setFilter(f)}
               className={`px-6 py-2.5 rounded-2xl text-[10px] uppercase font-black tracking-widest transition-all ${
                 filter === f 
                   ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-500/20' 
                   : 'text-slate-400 hover:text-slate-900 hover:bg-slate-50'
               }`}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-8">
        {isLoading ? (
          <div className="col-span-full py-24 text-center">
             <Loader2 className="w-10 h-10 text-emerald-500 animate-spin mx-auto mb-4" />
             <p className="text-slate-500 font-black text-xs uppercase tracking-widest">Scanning Databases...</p>
          </div>
        ) : filteredReports.length === 0 ? (
          <div className="col-span-full py-24 text-center bg-white rounded-[3rem] border border-slate-100">
            <div className="w-20 h-20 bg-slate-50 rounded-3xl flex items-center justify-center mx-auto mb-6">
                <CheckCircle className="w-8 h-8 text-slate-200" />
            </div>
            <p className="text-slate-900 font-black text-xl mb-2">All reports processed</p>
            <p className="text-slate-400 font-bold">No findings match the current filter.</p>
          </div>
        ) : (
          filteredReports.map((report, index) => (
            <motion.div 
               initial={{ opacity: 0, y: 30 }}
               animate={{ opacity: 1, y: 0 }}
               transition={{ delay: index * 0.05 }}
               key={report._id} 
               className="bg-white rounded-[2.5rem] border border-slate-100/60 overflow-hidden shadow-sm hover:shadow-2xl hover:shadow-slate-200/50 transition-all duration-500 group flex flex-col h-full"
            >
               <div className="relative h-64 bg-slate-100 overflow-hidden cursor-pointer" onClick={() => setSelectedImage(report.imageURL)}>
                  <img src={report.imageURL} alt={report.cropName} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center backdrop-blur-[2px]">
                     <div className="p-4 bg-white/20 rounded-full backdrop-blur-xl border border-white/30 scale-90 group-hover:scale-100 transition-transform">
                        <Eye className="text-white w-6 h-6" />
                     </div>
                  </div>
                  <div className="absolute top-4 right-4 flex flex-col gap-2 items-end">
                     <span className={`px-4 py-2 text-[10px] font-black uppercase tracking-widest rounded-xl shadow-lg backdrop-blur-xl border border-white/20 ${
                        report.status === 'verified' ? 'bg-emerald-500/90 text-white' :
                        report.status === 'incorrect' ? 'bg-red-500/90 text-white' :
                        'bg-amber-500/90 text-white'
                     }`}>
                        {report.status}
                     </span>
                     {report.confidence && (
                        <span className="px-3 py-1.5 text-[9px] font-black bg-white/95 text-slate-900 rounded-lg shadow-sm border border-slate-100 uppercase tracking-tighter">
                          {report.confidence} Reliability
                        </span>
                     )}
                  </div>
               </div>
               
               <div className="p-8 flex flex-col flex-1">
                  <div className="flex justify-between items-start mb-6">
                     <div>
                        <p className="text-[10px] font-black text-emerald-600 uppercase tracking-widest mb-1">{report.cropName}</p>
                        <h3 className="text-2xl font-black text-slate-900 tracking-tighter leading-tight">{report.disease}</h3>
                     </div>
                  </div>

                  <div className="flex-1 space-y-4 mb-8">
                     <div className="flex items-center gap-4 p-3 bg-slate-50 rounded-2xl border border-slate-100/50">
                        <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center shadow-sm">
                           <MapPin className="w-4 h-4 text-slate-400" />
                        </div>
                        <div className="overflow-hidden">
                           <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Location</p>
                           <p className="text-xs font-bold text-slate-700 truncate">{report.location || 'Remote Field'}</p>
                        </div>
                     </div>
                     <div className="flex items-center gap-4 p-3 bg-slate-50 rounded-2xl border border-slate-100/50">
                        <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center shadow-sm">
                           <Calendar className="w-4 h-4 text-slate-400" />
                        </div>
                        <div>
                           <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Detection Date</p>
                           <p className="text-xs font-bold text-slate-700">{new Date(report.date || report.createdAt).toLocaleDateString([], { dateStyle: 'medium' })}</p>
                        </div>
                     </div>
                     <div className="flex items-center gap-4 p-3 bg-slate-50 rounded-2xl border border-slate-100/50">
                        <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center shadow-sm">
                           <Users className="w-4 h-4 text-slate-400" />
                        </div>
                        <div>
                           <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Reported By</p>
                           <p className="text-xs font-bold text-slate-700">{report.userId?.name || 'Anonymous'}</p>
                        </div>
                     </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-3 mb-3">
                     <button 
                        onClick={() => updateStatus(report._id, 'verified')}
                        className={`flex items-center justify-center gap-2 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all ${
                          report.status === 'verified' ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-500/20' : 'bg-slate-50 text-slate-400 hover:bg-emerald-50 hover:text-emerald-600'
                        }`}
                     >
                        <CheckCircle className="w-4 h-4"/> Verify
                     </button>
                     <button 
                        onClick={() => updateStatus(report._id, 'incorrect')}
                        className={`flex items-center justify-center gap-2 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all ${
                          report.status === 'incorrect' ? 'bg-red-600 text-white shadow-lg shadow-red-500/20' : 'bg-slate-50 text-slate-400 hover:bg-red-50 hover:text-red-600'
                        }`}
                     >
                        <AlertTriangle className="w-4 h-4"/> Reject
                     </button>
                  </div>
                  <button 
                     onClick={() => deleteReport(report._id)}
                     className="w-full flex items-center justify-center gap-2 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest bg-white border border-slate-100 text-slate-300 hover:border-red-500 hover:text-red-500 transition-all group/del"
                  >
                     <Trash2 className="w-4 h-4 group-hover/del:scale-110 transition-transform"/> Archive Record
                  </button>
               </div>
            </motion.div>
          ))
        )}
      </div>

      {/* Report Details Modal */}
      <AnimatePresence>
        {selectedImage && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/90 backdrop-blur-xl p-4 md:p-8 overflow-y-auto overflow-x-hidden custom-scrollbar">
             <motion.div 
               initial={{ opacity: 0, scale: 0.9, y: 20 }}
               animate={{ opacity: 1, scale: 1, y: 0 }}
               exit={{ opacity: 0, scale: 0.95, y: 10 }}
               className="relative bg-white max-w-7xl w-full h-auto min-h-[85vh] rounded-[4rem] overflow-hidden shadow-[0_50px_100px_-20px_rgba(0,0,0,0.5)] flex flex-col lg:flex-row"
             >
                <button 
                  onClick={() => setSelectedImage(null)}
                  className="absolute top-8 right-8 z-[110] bg-white/10 hover:bg-white text-white hover:text-slate-900 p-4 rounded-3xl transition-all backdrop-blur-xl border border-white/20 ring-4 ring-black/10"
                >
                   <X className="w-6 h-6" />
                </button>

                {/* Image Section */}
                <div className="w-full lg:w-3/5 bg-slate-950 flex items-center justify-center relative min-h-[400px]">
                   <img src={selectedImage} alt="Analysis context" className="w-full h-full object-contain p-4" />
                   <div className="absolute bottom-10 left-10 p-6 bg-white/5 backdrop-blur-md rounded-3xl border border-white/10 max-w-xs">
                      <p className="text-[10px] font-black text-white/50 uppercase tracking-[0.2em] mb-2">Metadata</p>
                      {reports.find(r => r.imageURL === selectedImage) && (() => {
                         const r = reports.find(r => r.imageURL === selectedImage);
                         return (
                            <div className="space-y-3">
                               <div className="flex justify-between">
                                  <span className="text-xs font-bold text-white/40">ID:</span>
                                  <span className="text-xs font-mono text-white/80">{r._id.substring(18)}</span>
                               </div>
                               <div className="flex justify-between">
                                  <span className="text-xs font-bold text-white/40">Timestamp:</span>
                                  <span className="text-xs font-bold text-white/80">{new Date(r.date || r.createdAt).toLocaleTimeString()}</span>
                               </div>
                            </div>
                         )
                      })()}
                   </div>
                </div>

                {/* Analysis Section */}
                <div className="w-full lg:w-2/5 p-8 lg:p-16 overflow-y-auto bg-white flex flex-col max-h-[85vh] custom-scrollbar">
                   {reports.find(r => r.imageURL === selectedImage) && (() => {
                      const report = reports.find(r => r.imageURL === selectedImage);
                      return (
                         <div className="space-y-12">
                            <div>
                               <div className="flex flex-wrap items-center gap-3 mb-6">
                                  <span className="bg-emerald-50 text-emerald-600 px-5 py-2 rounded-2xl text-[10px] font-black uppercase tracking-widest border border-emerald-100">{report.cropName}</span>
                                  <span className={`px-5 py-2 rounded-2xl text-[10px] font-black uppercase tracking-widest border border-slate-100 ${
                                     report.confidence === 'High' ? 'bg-blue-50 text-blue-600' : 'bg-amber-50 text-amber-600'
                                  }`}>{report.confidence} Reliability</span>
                               </div>
                               <h2 className="text-5xl font-black text-slate-900 tracking-tighter leading-[0.9]">{report.disease}</h2>
                               <p className="text-slate-400 font-bold mt-4 text-lg">Detailed AI Diagnostic Report</p>
                            </div>

                            <div className="grid grid-cols-1 gap-10">
                               <DetailSection icon={AlertTriangle} title="Visual Symptoms" content={report.symptoms} color="text-amber-600" bgColor="bg-amber-50" />
                               <DetailSection icon={Search} title="Biological Cause" content={report.cause} color="text-blue-600" bgColor="bg-blue-50" />
                               <DetailSection icon={CheckCircle} title="Treatment Protocol" content={report.treatment} color="text-emerald-600" bgColor="bg-emerald-50" />
                               
                               <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                  <div className="p-8 rounded-[2rem] bg-slate-50 border border-slate-100/60 shadow-inner">
                                     <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Organic Solution</p>
                                     <p className="text-sm font-bold text-slate-700 leading-relaxed">{report.organic_solution || 'Information Unavailable'}</p>
                                  </div>
                                  <div className="p-8 rounded-[2rem] bg-slate-50 border border-slate-100/60 shadow-inner">
                                     <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Pesticide Opt.</p>
                                     <p className="text-sm font-bold text-slate-700 leading-relaxed">{report.chemical_solution || 'Information Unavailable'}</p>
                                  </div>
                               </div>

                               <div className="p-10 rounded-[2.5rem] bg-gradient-to-br from-emerald-600 to-teal-700 text-white shadow-2xl shadow-emerald-500/20 relative overflow-hidden group/alert">
                                  <div className="absolute -right-10 -top-10 w-40 h-40 bg-white/10 rounded-full group-hover:scale-110 transition-transform duration-700"></div>
                                  <div className="relative z-10">
                                     <p className="text-[10px] font-black opacity-60 uppercase tracking-widest mb-4">Long-term Prevention Strategy</p>
                                     <p className="text-lg font-bold leading-relaxed">{report.prevention || 'Maintain optimal plant hygiene and regular monitoring cycles.'}</p>
                                  </div>
                               </div>
                               
                               <div className="rounded-[2rem] bg-red-50 p-6 border border-red-100">
                                  <p className="text-[9px] font-black text-red-500 uppercase tracking-widest mb-2 flex items-center gap-2"><div className="w-1.5 h-1.5 bg-red-500 rounded-full animate-pulse"></div> Disclaimer</p>
                                  <p className="text-[11px] font-bold text-red-900/60 leading-tight italic">{report.disclaimer || 'AI analysis is for guidance. Consult experts before critical field actions.'}</p>
                               </div>
                            </div>
                         </div>
                      );
                   })()}
                </div>
             </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

const DetailSection = ({ icon: Icon, title, content, color, bgColor }) => (
  <div className={`p-5 rounded-2xl ${bgColor} border border-transparent hover:border-white transition-all`}>
     <div className="flex items-center gap-2 mb-2">
        <Icon className={`w-5 h-5 ${color}`} />
        <h4 className={`font-bold ${color} text-sm uppercase`}>{title}</h4>
     </div>
     <p className="text-gray-700 text-sm leading-relaxed">{content || 'Information not available.'}</p>
  </div>
);

export default AdminDiseaseReports;
