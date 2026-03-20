import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  LayoutDashboard,
  Users,
  ShoppingCart,
  FileText,
  Settings,
  Bell,
  Search,
  LogOut,
  ChevronDown,
  LineChart,
  RefreshCw,
  Edit2,
  Check,
  X,
  MapPin
} from "lucide-react";

const BASE_URL = `${process.env.REACT_APP_API_URL}/api`;

const AdminDashboard = () => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [profileOpen, setProfileOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("Dashboard");

  // Market Prices States
  const [marketPrices, setMarketPrices] = useState([]);
  const [locations, setLocations] = useState({ states: [], districts: [], markets: [] });
  const [filters, setFilters] = useState({ state: "", district: "", market: "" });
  const [loading, setLoading] = useState(false);
  
  // Editing state
  const [editingPriceId, setEditingPriceId] = useState(null);
  const [editFormData, setEditFormData] = useState({ min_price: "", max_price: "", modal_price: "" });

  const stats = [
    { title: "Total Farmers", value: "1,248", change: "+12%" },
    { title: "Total Buyers", value: "842", change: "+8%" },
    { title: "Active Listings", value: "312", change: "+5%" },
    { title: "Total Revenue", value: "₹2,48,000", change: "+18%" },
  ];

  const recentActivities = [
    { id: 1, user: "Ramesh Kumar", action: "Added new crop listing", date: "03 Mar 2026" },
    { id: 2, user: "Sita Devi", action: "Registered as Farmer", date: "02 Mar 2026" },
    { id: 3, user: "Mahesh Traders", action: "Purchased 200kg Rice", date: "01 Mar 2026" },
  ];

  // Fetch Locations on Mount
  useEffect(() => {
    fetchLocations();
  }, []);

  // Fetch Prices when filters change or active tab is Market Prices
  useEffect(() => {
    if (activeTab === "Market Prices") {
      fetchPrices();
    }
  }, [filters, activeTab]);

  const fetchLocations = async () => {
    try {
      const res = await axios.get(`${BASE_URL}/market/locations`);
      if (res.data.success) {
        setLocations(res.data.data);
      }
    } catch (error) {
      console.error("Error fetching locations:", error);
    }
  };

  const fetchPrices = async () => {
    setLoading(true);
    try {
      const queryParams = new URLSearchParams();
      if (filters.state) queryParams.append("state", filters.state);
      if (filters.district) queryParams.append("district", filters.district);
      if (filters.market) queryParams.append("market", filters.market);

      const res = await axios.get(`${BASE_URL}/market?${queryParams.toString()}`);
      if (res.data.success) {
        setMarketPrices(res.data.data);
      }
    } catch (error) {
      console.error("Error fetching prices:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleAutoSync = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${BASE_URL}/market/update-auto`);
      if (res.data.success) {
        alert("Market prices synced successfully!");
        fetchPrices();
        fetchLocations();
      }
    } catch (error) {
      console.error("Error auto-syncing prices:", error);
      alert("Failed to sync prices.");
    } finally {
      setLoading(false);
    }
  };

  const startEditing = (price) => {
    setEditingPriceId(price._id);
    setEditFormData({
      min_price: price.min_price,
      max_price: price.max_price,
      modal_price: price.modal_price
    });
  };

  const cancelEditing = () => {
    setEditingPriceId(null);
  };

  const saveEditing = async (id) => {
    try {
      const res = await axios.put(`${BASE_URL}/market/update-manual/${id}`, editFormData);
      if (res.data.success) {
        alert("Price updated successfully!");
        setEditingPriceId(null);
        fetchPrices();
      }
    } catch (error) {
      console.error("Error updating price:", error);
      alert("Failed to update price.");
    }
  };

  const handleFilterChange = (e) => {
    setFilters({ ...filters, [e.target.name]: e.target.value });
  };

  return (
    <div className="flex h-screen bg-gray-50 font-sans text-gray-800 selection:bg-green-200">
      {/* Sidebar */}
      <div
        className={`${
          sidebarOpen ? "w-64" : "w-20"
        } bg-gradient-to-b from-green-900 to-green-800 text-white transition-all duration-300 flex flex-col shadow-2xl z-20`}
      >
        <div className="p-5 text-xl font-extrabold border-b border-green-700/50 flex items-center justify-center tracking-tight">
          {sidebarOpen ? "KISAN MITHR" : "KM"}
        </div>

        <nav className="flex-1 p-4 space-y-2 mt-4">
          <SidebarItem icon={<LayoutDashboard />} text="Dashboard" open={sidebarOpen} active={activeTab === "Dashboard"} onClick={() => setActiveTab("Dashboard")} />
          <SidebarItem icon={<LineChart />} text="Market Prices" open={sidebarOpen} active={activeTab === "Market Prices"} onClick={() => setActiveTab("Market Prices")} />
          <SidebarItem icon={<Users />} text="Users" open={sidebarOpen} active={activeTab === "Users"} onClick={() => setActiveTab("Users")} />
          <SidebarItem icon={<ShoppingCart />} text="Orders" open={sidebarOpen} active={activeTab === "Orders"} onClick={() => setActiveTab("Orders")} />
          <SidebarItem icon={<FileText />} text="Listings" open={sidebarOpen} active={activeTab === "Listings"} onClick={() => setActiveTab("Listings")} />
        </nav>

        <div className="p-4 border-t border-green-700/50">
          <SidebarItem icon={<Settings className="w-5 h-5"/>} text="Settings" open={sidebarOpen} />
          <SidebarItem icon={<LogOut className="w-5 h-5"/>} text="Logout" open={sidebarOpen} />
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Navbar */}
        <header className="bg-white/80 backdrop-blur-md shadow-sm border-b border-gray-100 px-8 py-4 flex justify-between items-center z-10 sticky top-0">
          <div className="flex items-center gap-6">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="text-gray-500 hover:text-green-700 transition-colors p-2 rounded-full hover:bg-green-50"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" /></svg>
            </button>

            <div className="relative group">
              <Search className="absolute top-2.5 left-3 text-gray-400 w-4 h-4 group-focus-within:text-green-600 transition-colors" />
              <input
                type="text"
                placeholder="Search anything..."
                className="pl-10 pr-4 py-2 w-64 border border-gray-200 rounded-full focus:outline-none focus:ring-2 focus:ring-green-500/50 focus:border-green-500 transition-all shadow-sm text-sm"
              />
            </div>
          </div>

          <div className="flex items-center gap-6">
            <button className="relative p-2 text-gray-400 hover:text-green-600 transition-colors rounded-full hover:bg-green-50">
              <Bell className="w-5 h-5" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border border-white"></span>
            </button>

            <div
              className="relative cursor-pointer"
              onClick={() => setProfileOpen(!profileOpen)}
            >
              <div className="flex items-center gap-3 bg-gray-50 hover:bg-gray-100 py-1.5 px-3 rounded-full border border-gray-200 transition-colors">
                <img
                  src="https://i.pravatar.cc/150?u=admin"
                  alt="Admin"
                  className="rounded-full w-8 h-8 object-cover border-2 border-white shadow-sm"
                />
                <span className="text-sm font-medium text-gray-700 hidden sm:block">Admin</span>
                <ChevronDown className="text-gray-400 w-4 h-4" />
              </div>

              {profileOpen && (
                <div className="absolute right-0 mt-3 bg-white shadow-xl border border-gray-100 rounded-xl w-48 py-2 z-50 transform origin-top-right transition-all">
                  <div className="px-4 py-2 border-b border-gray-50 mb-1">
                    <p className="text-sm font-semibold text-gray-800">Admin User</p>
                    <p className="text-xs text-gray-500">admin@kisanmithr.com</p>
                  </div>
                  <button className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-green-50 hover:text-green-700 transition">Profile Settings</button>
                  <button className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition mt-1">Logout</button>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Dashboard Content */}
        <main className="p-8 overflow-y-auto flex-1 bg-gray-50/50">
          
          <div className="mb-8 flex justify-between items-end">
             <div>
               <h1 className="text-3xl font-bold text-gray-800 tracking-tight">{activeTab}</h1>
               <p className="text-gray-500 text-sm mt-1">Manage and monitor your agricultural platform data.</p>
             </div>
          </div>

          {activeTab === "Dashboard" && (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
              {/* Stats Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {stats.map((item, index) => (
                  <div
                    key={index}
                    className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 hover:shadow-md hover:-translate-y-1 transition-all duration-300 relative overflow-hidden group"
                  >
                    <div className="absolute -right-6 -top-6 w-24 h-24 bg-green-50 rounded-full group-hover:scale-150 transition-transform duration-500 ease-out z-0"></div>
                    <div className="relative z-10">
                      <h3 className="text-gray-500 text-sm font-medium">{item.title}</h3>
                      <p className="text-3xl font-extrabold text-gray-800 mt-2 tracking-tight">{item.value}</p>
                      <div className="flex items-center gap-1 mt-2">
                        <span className="text-green-600 text-xs font-bold bg-green-100 px-2 py-0.5 rounded-full">{item.change}</span>
                        <span className="text-gray-400 text-xs text-medium">vs last month</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Recent Activity */}
              <div className="mt-8 bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                <h2 className="text-lg font-bold text-gray-800 mb-6 flex items-center gap-2">
                  <span className="w-1.5 h-6 bg-green-500 rounded-full"></span>
                  Recent Activity
                </h2>
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-gray-50/50 text-gray-500 text-xs uppercase tracking-wider">
                        <th className="py-3 px-4 rounded-tl-lg rounded-bl-lg font-medium">User</th>
                        <th className="py-3 px-4 font-medium">Action</th>
                        <th className="py-3 px-4 rounded-tr-lg rounded-br-lg font-medium">Date</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                      {recentActivities.map((activity) => (
                        <tr key={activity.id} className="hover:bg-gray-50/80 transition-colors group">
                          <td className="py-4 px-4 text-sm font-medium text-gray-800 flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-green-100 text-green-700 flex items-center justify-center text-xs font-bold">
                              {activity.user.charAt(0)}
                            </div>
                            {activity.user}
                          </td>
                          <td className="py-4 px-4 text-sm text-gray-600">{activity.action}</td>
                          <td className="py-4 px-4 text-sm text-gray-500">{activity.date}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {activeTab === "Market Prices" && (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
              
              <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 mb-8">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 mb-6">
                  <div className="flex-1 w-full flex flex-wrap gap-4">
                    <div className="space-y-1.5 flex-1 min-w-[200px]">
                      <label className="text-xs font-bold text-gray-500 uppercase flex items-center gap-1.5">
                        <MapPin className="w-3 h-3"/> State
                      </label>
                      <select 
                        name="state" 
                        value={filters.state} 
                        onChange={handleFilterChange}
                        className="w-full border-gray-200 border rounded-lg px-4 py-2.5 text-sm focus:ring-2 focus:ring-green-500/50 focus:border-green-500 outline-none bg-gray-50 hover:bg-white transition-colors"
                      >
                        <option value="">All States</option>
                        {locations.states.map(s => <option key={s} value={s}>{s}</option>)}
                      </select>
                    </div>
                    <div className="space-y-1.5 flex-1 min-w-[200px]">
                      <label className="text-xs font-bold text-gray-500 uppercase flex items-center gap-1.5">
                        <MapPin className="w-3 h-3"/> District
                      </label>
                      <select 
                        name="district" 
                        value={filters.district} 
                        onChange={handleFilterChange}
                        className="w-full border-gray-200 border rounded-lg px-4 py-2.5 text-sm focus:ring-2 focus:ring-green-500/50 focus:border-green-500 outline-none bg-gray-50 hover:bg-white transition-colors"
                      >
                        <option value="">All Districts</option>
                        {locations.districts.map(d => <option key={d} value={d}>{d}</option>)}
                      </select>
                    </div>
                    <div className="space-y-1.5 flex-1 min-w-[200px]">
                      <label className="text-xs font-bold text-gray-500 uppercase flex items-center gap-1.5">
                        <MapPin className="w-3 h-3"/> Market
                      </label>
                      <select 
                        name="market" 
                        value={filters.market} 
                        onChange={handleFilterChange}
                        className="w-full border-gray-200 border rounded-lg px-4 py-2.5 text-sm focus:ring-2 focus:ring-green-500/50 focus:border-green-500 outline-none bg-gray-50 hover:bg-white transition-colors"
                      >
                        <option value="">All Markets</option>
                        {locations.markets.map(m => <option key={m} value={m}>{m}</option>)}
                      </select>
                    </div>
                  </div>
                  
                  <button 
                    onClick={handleAutoSync}
                    disabled={loading}
                    className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-6 py-2.5 rounded-lg text-sm font-semibold transition-all shadow-sm hover:shadow-md active:scale-95 disabled:opacity-70"
                  >
                    <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                    {loading ? 'Syncing Data...' : 'Auto Sync API'}
                  </button>
                </div>

                {/* Data Table */}
                <div className="rounded-xl border border-gray-100 overflow-hidden bg-white shadow-sm">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left">
                      <thead>
                        <tr className="bg-gray-50 border-b border-gray-100 text-gray-500 text-xs uppercase tracking-wider">
                          <th className="py-4 px-6 font-medium">Commodity</th>
                          <th className="py-4 px-6 font-medium">Location</th>
                          <th className="py-4 px-6 font-medium text-right">Min (₹)</th>
                          <th className="py-4 px-6 font-medium text-right">Max (₹)</th>
                          <th className="py-4 px-6 font-medium text-right">Modal (₹)</th>
                          <th className="py-4 px-6 font-medium text-center">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100">
                        {loading && marketPrices.length === 0 ? (
                           <tr>
                              <td colSpan="6" className="py-12 text-center text-gray-400">
                                <div className="flex flex-col items-center gap-3">
                                   <RefreshCw className="w-8 h-8 animate-spin text-green-500/50" />
                                   <p>Loading market data...</p>
                                </div>
                              </td>
                           </tr>
                        ) : marketPrices.length === 0 ? (
                          <tr><td colSpan="6" className="py-8 text-center text-gray-500 text-sm">No market prices found for selected filters.</td></tr>
                        ) : (
                          marketPrices.map((price) => (
                            <tr key={price._id} className="hover:bg-green-50/30 transition-colors group">
                              <td className="py-3 px-6 text-sm font-semibold text-gray-800">
                                {price.commodity}
                                <div className="text-[10px] text-gray-400 font-normal mt-0.5">{price.arrival_date}</div>
                              </td>
                              <td className="py-3 px-6">
                                <div className="text-sm text-gray-700">{price.market}</div>
                                <div className="text-xs text-gray-500">{price.district}, {price.state}</div>
                              </td>
                              
                              {editingPriceId === price._id ? (
                                <>
                                  <td className="py-3 px-6 text-right">
                                    <input 
                                      type="number" 
                                      value={editFormData.min_price}
                                      onChange={(e) => setEditFormData({...editFormData, min_price: e.target.value})}
                                      className="w-20 text-right border border-green-300 rounded px-2 py-1 focus:ring-2 focus:ring-green-500 outline-none text-sm font-medium"
                                    />
                                  </td>
                                  <td className="py-3 px-6 text-right">
                                    <input 
                                      type="number" 
                                      value={editFormData.max_price}
                                      onChange={(e) => setEditFormData({...editFormData, max_price: e.target.value})}
                                      className="w-20 text-right border border-green-300 rounded px-2 py-1 focus:ring-2 focus:ring-green-500 outline-none text-sm font-medium"
                                    />
                                  </td>
                                  <td className="py-3 px-6 text-right">
                                    <input 
                                      type="number" 
                                      value={editFormData.modal_price}
                                      onChange={(e) => setEditFormData({...editFormData, modal_price: e.target.value})}
                                      className="w-20 text-right border border-green-300 rounded px-2 py-1 focus:ring-2 focus:ring-green-500 outline-none text-sm font-medium"
                                    />
                                  </td>
                                  <td className="py-3 px-6 text-center">
                                    <div className="flex items-center justify-center gap-2">
                                      <button 
                                        onClick={() => saveEditing(price._id)}
                                        className="p-1.5 bg-green-100 text-green-700 hover:bg-green-200 rounded-md transition" title="Save"
                                      >
                                        <Check className="w-4 h-4"/>
                                      </button>
                                      <button 
                                        onClick={cancelEditing}
                                        className="p-1.5 bg-red-100 text-red-700 hover:bg-red-200 rounded-md transition" title="Cancel"
                                      >
                                        <X className="w-4 h-4"/>
                                      </button>
                                    </div>
                                  </td>
                                </>
                              ) : (
                                <>
                                  <td className="py-3 px-6 text-right text-sm text-gray-600 font-medium">{price.min_price}</td>
                                  <td className="py-3 px-6 text-right text-sm text-gray-600 font-medium">{price.max_price}</td>
                                  <td className="py-3 px-6 text-right text-sm font-bold text-green-700 bg-green-50/50">{price.modal_price}</td>
                                  <td className="py-3 px-6 text-center">
                                    <button 
                                      onClick={() => startEditing(price)}
                                      className="p-1.5 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded-md transition opacity-0 group-hover:opacity-100 focus:opacity-100 inline-flex items-center justify-center"
                                    >
                                      <Edit2 className="w-4 h-4" />
                                    </button>
                                  </td>
                                </>
                              )}
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>

              </div>
            </div>
          )}

        </main>
      </div>
    </div>
  );
};

const SidebarItem = ({ icon, text, open, active, onClick }) => {
  return (
    <div 
      onClick={onClick}
      className={`flex items-center gap-3 p-3 rounded-xl cursor-pointer transition-all duration-200 ${
        active 
          ? "bg-white/15 text-white shadow-inner font-semibold border-l-4 border-white" 
          : "text-green-100 hover:bg-white/10 hover:text-white border-l-4 border-transparent"
      }`}
    >
      <div className={`transition-transform duration-200 ${active ? 'scale-110' : ''}`}>
        {icon}
      </div>
      {open && <span className="whitespace-nowrap text-sm tracking-wide">{text}</span>}
    </div>
  );
};

export default AdminDashboard;