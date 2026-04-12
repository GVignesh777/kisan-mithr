import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Send, Leaf, Landmark, CreditCard, Sprout } from 'lucide-react';
import axiosInstance from '../../../services/url.service';
import { toast } from 'react-toastify';

const DataFormModal = ({ isOpen, onClose, type, onSuccess }) => {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({});

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      let endpoint = '';
      if (type === 'farm') endpoint = '/analytics/farm';
      else if (type === 'crop') endpoint = '/analytics/crop';
      else if (type === 'expense') endpoint = '/analytics/expense';

      await axiosInstance.post(endpoint, formData);
      toast.success(`${type.charAt(0).toUpperCase() + type.slice(1)} data saved successfully!`);
      onSuccess?.();
      onClose();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Error saving data');
    } finally {
      setLoading(false);
    }
  };

  const renderFormFields = () => {
    switch (type) {
      case 'farm':
        return (
          <>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-zinc-400 mb-1.5">Land Size</label>
                <div className="flex gap-2">
                  <input
                    type="number"
                    required
                    className="flex-grow bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 text-white focus:border-green-500 outline-none"
                    placeholder="Enter size"
                    onChange={(e) => setFormData({ ...formData, landSize: e.target.value })}
                  />
                  <select 
                    className="bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 text-white outline-none"
                    onChange={(e) => setFormData({ ...formData, landUnit: e.target.value })}
                  >
                    <option value="Acres">Acres</option>
                    <option value="Hectares">Hectares</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-zinc-400 mb-1.5">Location</label>
                <input
                  type="text"
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 text-white focus:border-green-500 outline-none"
                  placeholder="Village/Region"
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-zinc-400 mb-1.5">Soil Type</label>
                <select 
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 text-white outline-none"
                  onChange={(e) => setFormData({ ...formData, soilType: e.target.value })}
                >
                  <option value="">Select Soil Type</option>
                  <option value="Black">Black Soil</option>
                  <option value="Red">Red Soil</option>
                  <option value="Alluvial">Alluvial Soil</option>
                </select>
              </div>
            </div>
          </>
        );
      case 'crop':
        return (
          <>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-zinc-400 mb-1.5">Crop Name</label>
                <input
                  type="text"
                  required
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 text-white focus:border-green-500 outline-none"
                  placeholder="e.g. Wheat"
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-zinc-400 mb-1.5">Acreage</label>
                <input
                  type="number"
                  required
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 text-white focus:border-green-500 outline-none"
                  placeholder="Area under this crop"
                  onChange={(e) => setFormData({ ...formData, plantedAcreage: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-zinc-400 mb-1.5">Planting Date</label>
                <input
                  type="date"
                  required
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 text-white focus:border-green-500 outline-none"
                  onChange={(e) => setFormData({ ...formData, plantingDate: e.target.value })}
                />
              </div>
            </div>
          </>
        );
      case 'expense':
        return (
          <>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-zinc-400 mb-1.5">Category</label>
                <select 
                  required
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 text-white outline-none"
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                >
                  <option value="">Select Category</option>
                  <option value="Seeds">Seeds</option>
                  <option value="Fertilizers">Fertilizers</option>
                  <option value="Labor">Labor</option>
                  <option value="Pesticides">Pesticides</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-zinc-400 mb-1.5">Amount (₹)</label>
                <input
                  type="number"
                  required
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 text-white focus:border-green-500 outline-none"
                  placeholder="Amount spent"
                  onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-zinc-400 mb-1.5">Description</label>
                <input
                  type="text"
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 text-white focus:border-green-500 outline-none"
                  placeholder="What was this for?"
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                />
              </div>
            </div>
          </>
        );
      default: return null;
    }
  };

  const icons = {
    farm: Landmark,
    crop: Sprout,
    expense: CreditCard
  };
  const Icon = icons[type] || Leaf;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="bg-zinc-900 border border-zinc-800 w-full max-w-lg rounded-[2.5rem] overflow-hidden shadow-2xl"
      >
        <div className="p-8">
          <div className="flex justify-between items-center mb-8">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-green-500/10 rounded-2xl border border-green-500/20">
                <Icon className="w-6 h-6 text-green-400" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-white">Add {type.charAt(0).toUpperCase() + type.slice(1)} Data</h2>
                <p className="text-sm text-zinc-500">Provide accurate details for precise analytics</p>
              </div>
            </div>
            <button onClick={onClose} className="p-2 hover:bg-zinc-800 rounded-full transition-colors">
              <X className="w-6 h-6 text-zinc-400" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-8">
            {renderFormFields()}
            
            <button
              disabled={loading}
              type="submit"
              className="w-full bg-green-500 hover:bg-green-600 disabled:bg-zinc-700 text-black font-bold py-4 rounded-2xl flex items-center justify-center gap-2 transition-all shadow-lg shadow-green-500/10"
            >
              {loading ? (
                <div className="w-6 h-6 border-4 border-black/20 border-t-black rounded-full animate-spin"></div>
              ) : (
                <>
                  <Send className="w-5 h-5" />
                  Save Data
                </>
              )}
            </button>
          </form>
        </div>
      </motion.div>
    </div>
  );
};

export default DataFormModal;
