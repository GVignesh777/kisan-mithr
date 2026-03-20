import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { LineChart, Search, Edit2, Loader2, RefreshCw, X, PlusCircle, Trash2, ArrowUpToLine, ArrowDownToLine } from 'lucide-react';
import { toast } from 'react-toastify';

const AdminMarketPrices = () => {
  const [prices, setPrices] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSyncing, setIsSyncing] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const tableRef = useRef(null);
  
  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentEdit, setCurrentEdit] = useState(null);
  const [formData, setFormData] = useState({
    commodity: '', state: '', district: '', market: '', min_price: '', max_price: '', modal_price: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchPrices = async () => {
    setIsLoading(true);
    try {
      const token = localStorage.getItem('adminToken');
      const res = await axios.get(`${process.env.REACT_APP_API_URL}/api/admin/market-prices`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setPrices(res.data);
    } catch (err) {
      toast.error('Failed to fetch market prices');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchPrices();
  }, []);

  const handleLiveSync = async () => {
    setIsSyncing(true);
    try {
      const token = localStorage.getItem('adminToken');
      const res = await axios.post(`${process.env.REACT_APP_API_URL}/api/admin/market-prices/sync`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success(res.data.message || 'Market synchronized via API');
      await fetchPrices(); // Refresh data immediately
    } catch (err) {
      toast.error('Failed to sync market prices');
    } finally {
      setIsSyncing(false);
    }
  };

  const handleDelete = async (id) => {
    if(!window.confirm("Delete this market record?")) return;
    try {
      const token = localStorage.getItem('adminToken');
      await axios.delete(`${process.env.REACT_APP_API_URL}/api/admin/market-prices/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success('Record deleted');
      setPrices(prices.filter(p => p._id !== id));
    } catch (err) {
      toast.error('Failed to delete record');
    }
  };

  const openModal = (price = null) => {
    if (price) {
      setCurrentEdit(price._id);
      setFormData({
        commodity: price.commodity || '',
        state: price.state || '',
        district: price.district || '',
        market: price.market || '',
        min_price: price.min_price || '',
        max_price: price.max_price || '',
        modal_price: price.modal_price || ''
      });
    } else {
      setCurrentEdit(null);
      setFormData({ commodity: '', state: '', district: '', market: '', min_price: '', max_price: '', modal_price: '' });
    }
    setIsModalOpen(true);
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const token = localStorage.getItem('adminToken');
      
      // Convert price strings to numbers safely
      const payload = {
         ...formData,
         min_price: Number(formData.min_price),
         max_price: Number(formData.max_price),
         modal_price: Number(formData.modal_price)
      };

      if (currentEdit) {
        await axios.put(`${process.env.REACT_APP_API_URL}/api/admin/market-prices/${currentEdit}`, payload, {
          headers: { Authorization: `Bearer ${token}` }
        });
        toast.success('Market Record Updated successfully');
      } else {
        await axios.post(`${process.env.REACT_APP_API_URL}/api/admin/market-prices`, payload, {
          headers: { Authorization: `Bearer ${token}` }
        });
        toast.success('Market Record Added successfully');
      }
      setIsModalOpen(false);
      fetchPrices();
    } catch (err) {
      toast.error('Failed to process market record');
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredPrices = prices.filter(p => {
    const term = searchTerm.toLowerCase();
    return (
      (p.commodity && p.commodity.toLowerCase().includes(term)) ||
      (p.state && p.state.toLowerCase().includes(term)) ||
      (p.market && p.market.toLowerCase().includes(term))
    );
  });

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
         <div>
           <div className="flex items-center gap-3">
             <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
               <LineChart className="text-emerald-500 w-6 h-6"/>
               Live Market Prices
             </h2>
             <span className="px-3 py-1 bg-emerald-100 text-emerald-800 text-xs font-bold rounded-full border border-emerald-200 shadow-sm">
                Total Records: {prices.length.toLocaleString()}
             </span>
           </div>
           <p className="text-gray-500 text-sm mt-1">Manage commodity mandates automatically via API Sync or manual overrides.</p>
        </div>
        
        <div className="flex flex-col sm:flex-row items-center gap-3 w-full md:w-auto">
          <div className="relative w-full sm:w-64">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              className="block w-full pl-10 pr-3 py-2.5 border border-gray-200 rounded-xl text-sm bg-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all shadow-sm"
              placeholder="Search commodity or state..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          <div className="flex items-center gap-2 w-full sm:w-auto">
             <button 
               onClick={handleLiveSync}
               disabled={isSyncing}
               className="flex-1 sm:flex-none flex items-center justify-center gap-2 bg-blue-50 text-blue-700 hover:bg-blue-100 border border-blue-200 px-4 py-2.5 rounded-xl font-bold text-sm transition-all whitespace-nowrap"
             >
                <RefreshCw className={`w-4 h-4 ${isSyncing ? 'animate-spin' : ''}`}/>
                {isSyncing ? 'Syncing...' : 'Live Sync'}
             </button>
             
             <button 
                onClick={() => openModal()}
               className="flex-1 sm:flex-none flex items-center justify-center gap-2 bg-gray-900 text-white hover:bg-gray-800 px-4 py-2.5 rounded-xl font-bold text-sm shadow-md transition-all whitespace-nowrap"
             >
                <PlusCircle className="w-4 h-4"/>
                Add Override
             </button>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden relative">
        <div className="overflow-x-auto overflow-y-auto max-h-[65vh] custom-scrollbar min-h-[400px]" ref={tableRef}>
          <table className="min-w-full divide-y divide-gray-200 relative">
            <thead className="sticky top-0 z-10 bg-gray-50/95 backdrop-blur border-b border-gray-200 shadow-sm">
              <tr>
                <th scope="col" className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-widest">Commodity / Market</th>
                <th scope="col" className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-widest">Region</th>
                <th scope="col" className="px-6 py-4 text-right text-xs font-bold text-gray-500 uppercase tracking-widest">Modal Price</th>
                <th scope="col" className="px-6 py-4 text-center text-xs font-bold text-gray-500 uppercase tracking-widest">Range (Min-Max)</th>
                <th scope="col" className="px-6 py-4 text-right text-xs font-bold text-gray-500 uppercase tracking-widest">Updated</th>
                <th scope="col" className="px-6 py-4 text-right text-xs font-bold text-gray-500 uppercase tracking-widest">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-100">
              {isLoading ? (
                <tr>
                  <td colSpan="6" className="px-6 py-16 text-center">
                    <Loader2 className="h-8 w-8 animate-spin text-emerald-500 mx-auto" />
                    <p className="mt-3 text-gray-500 text-sm font-medium">Fetching market matrix...</p>
                  </td>
                </tr>
              ) : filteredPrices.length === 0 ? (
                <tr>
                  <td colSpan="6" className="px-6 py-16 text-center text-gray-500 bg-gray-50/50">
                    <div className="mx-auto w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mb-3">
                       <Search className="w-6 h-6 text-gray-400"/>
                    </div>
                    No market data matches your criteria.
                  </td>
                </tr>
              ) : (
                filteredPrices.map((price) => (
                  <tr key={price._id} className="hover:bg-gray-50/80 transition-colors group">
                    <td className="px-6 py-4 whitespace-nowrap">
                       <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl bg-orange-50 text-orange-600 flex items-center justify-center font-bold shadow-sm border border-orange-100 uppercase text-xs">
                             {price.commodity ? price.commodity.substring(0,2) : '--'}
                          </div>
                          <div>
                            <div className="font-bold text-gray-900">{price.commodity}</div>
                            <div className="text-xs text-gray-500">{price.variety || 'Standard'} • {price.market}</div>
                          </div>
                       </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-semibold text-gray-800">{price.state}</div>
                      <div className="text-xs text-gray-500">{price.district}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                       <span className="text-lg font-black text-emerald-600">
                          ₹{price.modal_price?.toLocaleString('en-IN') || '0'}
                       </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                       <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800 border border-gray-200">
                          ₹{price.min_price || 0} - ₹{price.max_price || 0}
                       </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm text-gray-500">
                      {price.arrival_date || new Date().toISOString().split('T')[0]}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                       <div className="flex justify-end items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                         <button 
                            onClick={() => openModal(price)}
                            className="p-1.5 text-blue-600 hover:bg-blue-50 bg-white border border-gray-200 hover:border-blue-200 rounded-lg transition-colors shadow-sm"
                            title="Edit Record"
                          >
                           <Edit2 className="w-4 h-4"/>
                         </button>
                         <button 
                            onClick={() => handleDelete(price._id)}
                            className="p-1.5 text-red-600 hover:bg-red-50 bg-white border border-gray-200 hover:border-red-200 rounded-lg transition-colors shadow-sm"
                            title="Delete Record"
                          >
                           <Trash2 className="w-4 h-4"/>
                         </button>
                       </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        
        {/* Scroll Controls */}
        <div className="absolute right-6 bottom-6 flex flex-col gap-3 z-20">
            <button 
                onClick={() => tableRef.current?.scrollTo({ top: 0, behavior: 'smooth' })} 
                className="p-2.5 bg-white hover:bg-emerald-50 rounded-full text-gray-600 hover:text-emerald-600 shadow-xl border border-gray-200 transition-all"
                title="Scroll to Top"
            >
                <ArrowUpToLine size={20} />
            </button>
            <button 
                onClick={() => tableRef.current?.scrollTo({ top: tableRef.current.scrollHeight, behavior: 'smooth' })} 
                className="p-2.5 bg-white hover:bg-emerald-50 rounded-full text-gray-600 hover:text-emerald-600 shadow-xl border border-gray-200 transition-all"
                title="Scroll to Bottom"
            >
                <ArrowDownToLine size={20} />
            </button>
        </div>
      </div>

      {/* Editor Modal */}
      <AnimatePresence>
         {isModalOpen && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-0">
               <motion.div 
                  initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                  className="absolute inset-0 bg-gray-900/60 backdrop-blur-sm"
                  onClick={() => setIsModalOpen(false)}
               />
               
               <motion.div 
                  initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }}
                  className="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden border border-gray-100"
               >
                  <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
                     <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                        {currentEdit ? <Edit2 className="w-5 h-5 text-blue-500" /> : <PlusCircle className="w-5 h-5 text-emerald-500" />}
                        {currentEdit ? 'Edit Market Override' : 'Add Market Record'}
                     </h3>
                     <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:bg-gray-200 hover:text-gray-600 p-1 rounded-full transition-colors">
                        <X className="w-5 h-5" />
                     </button>
                  </div>
                  
                  <form onSubmit={handleFormSubmit} className="p-6">
                     <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="block text-xs font-bold text-gray-600 uppercase tracking-wider mb-1">Commodity</label>
                            <input required type="text" value={formData.commodity} onChange={e => setFormData({...formData, commodity: e.target.value})} className="w-full border-gray-300 rounded-xl text-sm focus:ring-emerald-500 focus:border-emerald-500 py-2.5 px-3 border shadow-sm outline-none bg-gray-50/50" placeholder="e.g. Wheat" />
                          </div>
                          <div>
                            <label className="block text-xs font-bold text-gray-600 uppercase tracking-wider mb-1">State</label>
                            <input required type="text" value={formData.state} onChange={e => setFormData({...formData, state: e.target.value})} className="w-full border-gray-300 rounded-xl text-sm focus:ring-emerald-500 focus:border-emerald-500 py-2.5 px-3 border shadow-sm outline-none bg-gray-50/50" placeholder="e.g. Punjab" />
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="block text-xs font-bold text-gray-600 uppercase tracking-wider mb-1">District</label>
                            <input type="text" value={formData.district} onChange={e => setFormData({...formData, district: e.target.value})} className="w-full border-gray-300 rounded-xl text-sm focus:ring-emerald-500 focus:border-emerald-500 py-2.5 px-3 border shadow-sm outline-none bg-gray-50/50" placeholder="e.g. Amritsar" />
                          </div>
                          <div>
                            <label className="block text-xs font-bold text-gray-600 uppercase tracking-wider mb-1">Market (Mandi)</label>
                            <input required type="text" value={formData.market} onChange={e => setFormData({...formData, market: e.target.value})} className="w-full border-gray-300 rounded-xl text-sm focus:ring-emerald-500 focus:border-emerald-500 py-2.5 px-3 border shadow-sm outline-none bg-gray-50/50" placeholder="e.g. Amritsar Mandi" />
                          </div>
                        </div>

                        <div className="pt-4 border-t border-gray-100">
                           <h4 className="text-sm font-bold text-gray-800 mb-3">Rate Configuration (₹/Quintal)</h4>
                           <div className="grid grid-cols-3 gap-4">
                             <div>
                               <label className="block text-xs font-bold text-gray-600 uppercase tracking-wider mb-1">Min Price</label>
                               <input required type="number" value={formData.min_price} onChange={e => setFormData({...formData, min_price: e.target.value})} className="w-full font-mono font-bold text-emerald-700 border-gray-300 rounded-xl text-sm focus:ring-emerald-500 focus:border-emerald-500 py-2.5 px-3 border shadow-sm outline-none bg-white" placeholder="0" />
                             </div>
                             <div>
                               <label className="block text-xs font-bold text-gray-600 uppercase tracking-wider mb-1">Max Price</label>
                               <input required type="number" value={formData.max_price} onChange={e => setFormData({...formData, max_price: e.target.value})} className="w-full font-mono font-bold text-emerald-700 border-gray-300 rounded-xl text-sm focus:ring-emerald-500 focus:border-emerald-500 py-2.5 px-3 border shadow-sm outline-none bg-white" placeholder="0" />
                             </div>
                             <div>
                               <label className="block text-xs font-bold text-gray-600 uppercase tracking-wider mb-1">Modal Price</label>
                               <input required type="number" value={formData.modal_price} onChange={e => setFormData({...formData, modal_price: e.target.value})} className="w-full font-mono font-black text-emerald-700 border-emerald-300 rounded-xl text-sm focus:ring-emerald-500 focus:border-emerald-500 py-2.5 px-3 border shadow-sm outline-none bg-emerald-50" placeholder="0" />
                             </div>
                           </div>
                        </div>
                     </div>

                     <div className="mt-8 flex justify-end gap-3">
                        <button type="button" onClick={() => setIsModalOpen(false)} className="px-5 py-2.5 text-sm font-bold text-gray-600 bg-white border border-gray-300 rounded-xl hover:bg-gray-50 transition-colors">
                           Cancel
                        </button>
                        <button type="submit" disabled={isSubmitting} className="px-5 py-2.5 text-sm font-bold text-white bg-gray-900 border border-transparent rounded-xl hover:bg-gray-800 shadow-md transition-colors flex items-center justify-center min-w-[120px]">
                           {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin"/> : currentEdit ? 'Save Changes' : 'Create Record'}
                        </button>
                     </div>
                  </form>
               </motion.div>
            </div>
         )}
      </AnimatePresence>
    </div>
  );
};

export default AdminMarketPrices;
