import React, { useState, useEffect, useCallback, useRef } from "react";
import {
  MapPin, Star, Search, Filter, TrendingUp, TrendingDown,
  Package, ShoppingCart, Heart, Phone, ChevronDown, X,
  BarChart3, Loader2, AlertCircle, RefreshCw, Navigation,
  ArrowUpDown, SlidersHorizontal, Leaf, Wheat, Info,
  ExternalLink, Tag, Clock
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import axios from "axios";

// ─── Haversine distance (km) ──────────────────────────────────────────────────
const haversineDistance = (lat1, lon1, lat2, lon2) => {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) ** 2;
  return (R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))).toFixed(1);
};

// ─── Approx coords for major cities/districts  ───────────────────────────────
const cityCoords = {
  hyderabad: [17.385, 78.4867], delhi: [28.6139, 77.209], mumbai: [19.076, 72.8777],
  chennai: [13.0827, 80.2707], bangalore: [12.9716, 77.5946], kolkata: [22.5726, 88.3639],
  pune: [18.5204, 73.8567], ahmedabad: [23.0225, 72.5714], jaipur: [26.9124, 75.7873],
  lucknow: [26.8467, 80.9462], nagpur: [21.1458, 79.0882], indore: [22.7196, 75.8577],
  patna: [25.5941, 85.1376], bhopal: [23.2599, 77.4126], ludhiana: [30.901, 75.8573],
  visakhapatnam: [17.6868, 83.2185], coimbatore: [11.0168, 76.9558], surat: [21.1702, 72.8311],
  agra: [27.1767, 78.0081], varanasi: [25.3176, 82.9739], warangal: [17.9689, 79.5941],
  amritsar: [31.634, 74.8723], rajkot: [22.3039, 70.8022], meerut: [28.9845, 77.7064],
};

const getApproxCoords = (market, district) => {
  const key = (market || district || "").toLowerCase().replace(/\s+/g, "");
  for (const city of Object.keys(cityCoords)) {
    if (key.includes(city)) return cityCoords[city];
  }
  // random spread near India center as fallback
  return [20 + Math.random() * 8, 76 + Math.random() * 10];
};

// ─── Star Rating Component ────────────────────────────────────────────────────
const StarRating = ({ rating = 4.2, size = 12 }) => (
  <div className="flex items-center gap-0.5">
    {[1, 2, 3, 4, 5].map((s) => (
      <Star
        key={s}
        size={size}
        className={s <= Math.round(rating) ? "text-amber-400 fill-amber-400" : "text-zinc-600"}
      />
    ))}
    <span className="text-[10px] font-bold text-zinc-400 ml-1">{rating}</span>
  </div>
);

// ─── Skeleton Card ────────────────────────────────────────────────────────────
const SkeletonCard = () => (
  <div className="rounded-3xl bg-white/5 border border-white/5 p-6 animate-pulse space-y-4">
    <div className="h-4 bg-white/10 rounded-full w-3/4" />
    <div className="h-3 bg-white/5 rounded-full w-1/2" />
    <div className="h-10 bg-white/10 rounded-2xl" />
    <div className="h-8 bg-white/5 rounded-xl" />
  </div>
);

// ─── Crop Card ───────────────────────────────────────────────────────────────
const CropCard = ({ crop, saved, onSave, userLocation }) => {
  const [coords] = useState(() => getApproxCoords(crop.market, crop.district));
  const distance = userLocation
    ? haversineDistance(userLocation[0], userLocation[1], coords[0], coords[1])
    : null;

  const modalP = parseFloat(crop.modal_price || 0);
  const minP   = parseFloat(crop.min_price   || 0);
  const maxP   = parseFloat(crop.max_price   || 0);
  const rating = (3.5 + Math.random() * 1.4).toFixed(1);

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      whileHover={{ y: -4, scale: 1.01 }}
      className="bg-zinc-900/70 backdrop-blur-md border border-white/5 rounded-3xl overflow-hidden shadow-xl hover:shadow-green-500/5 hover:border-green-500/20 transition-all duration-300 group flex flex-col"
    >
      {/* Card Header */}
      <div className="relative h-20 bg-gradient-to-r from-green-900/30 to-emerald-900/20 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-green-500/10 border border-green-500/20 flex items-center justify-center text-green-400">
            <Leaf size={18} />
          </div>
          <div>
            <h3 className="text-base font-black text-white tracking-tight leading-none">{crop.commodity}</h3>
            <p className="text-[10px] font-bold text-zinc-500 mt-0.5 uppercase tracking-wider">{crop.variety || "General"}</p>
          </div>
        </div>
        <button
          onClick={() => onSave(crop._id || crop.commodity)}
          className="p-2 rounded-xl bg-white/5 hover:bg-red-500/10 border border-white/5 transition-all"
        >
          <Heart size={14} className={saved ? "text-red-400 fill-red-400" : "text-zinc-500"} />
        </button>
      </div>

      {/* Price HUD */}
      <div className="px-6 py-4 border-t border-white/5 flex-1">
        <div className="flex items-center justify-between mb-4">
          <div>
            <p className="text-[9px] font-black text-zinc-600 uppercase tracking-widest">Modal Price</p>
            <p className="text-2xl font-black text-white tracking-tight">₹{modalP.toLocaleString()}</p>
            <p className="text-[9px] text-zinc-500 font-bold">per quintal</p>
          </div>
          <div className="text-right space-y-1">
            <div className="text-xs text-zinc-500 font-bold flex items-center gap-1 justify-end">
              <TrendingDown size={10} className="text-green-400" /> Min: <span className="text-green-400">₹{minP.toLocaleString()}</span>
            </div>
            <div className="text-xs text-zinc-500 font-bold flex items-center gap-1 justify-end">
              <TrendingUp size={10} className="text-red-400" /> Max: <span className="text-red-400">₹{maxP.toLocaleString()}</span>
            </div>
          </div>
        </div>

        {/* Market Info */}
        <div className="space-y-2 mb-4">
          <div className="flex items-center gap-2 text-xs text-zinc-400 font-medium">
            <MapPin size={11} className="text-blue-400 shrink-0" />
            <span className="truncate">{crop.market}, {crop.district}</span>
          </div>
          <div className="flex items-center gap-2 text-xs text-zinc-500 font-medium">
            <Tag size={11} className="text-purple-400 shrink-0" />
            <span>{crop.state}</span>
          </div>
          {distance && (
            <div className="flex items-center gap-2 text-xs font-bold text-amber-400">
              <Navigation size={11} className="shrink-0" />
              <span>{distance} km from your location</span>
            </div>
          )}
        </div>

        {/* Rating */}
        <StarRating rating={parseFloat(rating)} />
      </div>

      {/* Actions */}
      <div className="px-6 pb-5 grid grid-cols-2 gap-3 mt-auto">
        <button className="py-2.5 bg-green-500 text-black rounded-2xl font-black text-[10px] uppercase tracking-widest flex items-center justify-center gap-1.5 hover:bg-green-400 active:scale-95 transition-all shadow-lg shadow-green-500/20">
          <ShoppingCart size={12} /> Buy Now
        </button>
        <button className="py-2.5 bg-white/5 border border-white/5 rounded-2xl font-black text-[10px] uppercase tracking-widest flex items-center justify-center gap-1.5 text-zinc-400 hover:text-white hover:bg-white/10 transition-all">
          <Phone size={12} /> Contact
        </button>
      </div>
    </motion.div>
  );
};

// ─── MAIN COMPONENT ───────────────────────────────────────────────────────────
const BuyerOverview = () => {
  const [crops, setCrops]             = useState([]);
  const [filtered, setFiltered]       = useState([]);
  const [loading, setLoading]         = useState(true);
  const [error, setError]             = useState(null);
  const [userLocation, setUserLocation] = useState(null);
  const [locationName, setLocationName] = useState("Detecting...");
  const [savedCrops, setSavedCrops]   = useState(new Set());
  const [showFilters, setShowFilters] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [locations, setLocations]     = useState({ states: [], districts: [], markets: [] });
  const [commodities, setCommodities] = useState([]);
  const [page, setPage]               = useState(1);
  const PER_PAGE = 12;

  const [filters, setFilters] = useState({
    state: "", district: "", market: "", commodity: "",
    minPrice: "", maxPrice: "", sort: "default"
  });

  // ── Geolocation ────────────────────────────────────────────────────────────
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setUserLocation([pos.coords.latitude, pos.coords.longitude]);
          setLocationName(`${pos.coords.latitude.toFixed(2)}°N, ${pos.coords.longitude.toFixed(2)}°E`);
          // Reverse geocode via free API
          axios.get(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${pos.coords.latitude}&lon=${pos.coords.longitude}`)
            .then(r => {
              const addr = r.data.address;
              setLocationName(`${addr.city || addr.town || addr.county || "Your City"}, ${addr.state || ""}`);
            }).catch(() => {});
        },
        () => { setLocationName("Location unavailable"); }
      );
    } else {
      setLocationName("Geolocation not supported");
    }
  }, []);

  // ── Fetch locations for dropdowns ─────────────────────────────────────────
  useEffect(() => {
    axios.get(`${process.env.REACT_APP_API_URL}/api/market/locations`)
      .then(r => {
        if (r.data.success) setLocations(r.data.data);
      }).catch(() => {});
  }, []);

  // ── Fetch crop data ────────────────────────────────────────────────────────
  const fetchCrops = useCallback(async () => {
    setLoading(true); setError(null);
    try {
      const params = {};
      if (filters.state)     params.state     = filters.state;
      if (filters.district)  params.district  = filters.district;
      if (filters.market)    params.market    = filters.market;
      if (filters.commodity) params.commodity = filters.commodity;

      const res = await axios.get(`${process.env.REACT_APP_API_URL}/api/market/prices`, { params });
      if (res.data.success) {
        const data = res.data.data || [];
        setCrops(data);
        setCommodities([...new Set(data.map(c => c.commodity).filter(Boolean))].sort());
        setPage(1);
      } else throw new Error("No data");
    } catch {
      setError("Could not fetch market prices. Ensure AGMARKNET data is loaded in the database.");
      setCrops([]);
    } finally {
      setLoading(false);
    }
  }, [filters.state, filters.district, filters.market, filters.commodity]);

  useEffect(() => { fetchCrops(); }, [fetchCrops]);

  // ── Client-side filter + sort ─────────────────────────────────────────────
  useEffect(() => {
    let result = [...crops];

    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      result = result.filter(c =>
        c.commodity?.toLowerCase().includes(q) ||
        c.market?.toLowerCase().includes(q) ||
        c.district?.toLowerCase().includes(q)
      );
    }
    if (filters.minPrice) result = result.filter(c => parseFloat(c.modal_price) >= parseFloat(filters.minPrice));
    if (filters.maxPrice) result = result.filter(c => parseFloat(c.modal_price) <= parseFloat(filters.maxPrice));

    if (filters.sort === "low-price")  result.sort((a, b) => parseFloat(a.modal_price) - parseFloat(b.modal_price));
    if (filters.sort === "high-price") result.sort((a, b) => parseFloat(b.modal_price) - parseFloat(a.modal_price));
    if (filters.sort === "nearest" && userLocation) {
      result.sort((a, b) => {
        const [la, lo] = getApproxCoords(a.market, a.district);
        const [lb, co] = getApproxCoords(b.market, b.district);
        return haversineDistance(userLocation[0], userLocation[1], la, lo) -
               haversineDistance(userLocation[0], userLocation[1], lb, co);
      });
    }
    setFiltered(result);
    setPage(1);
  }, [crops, searchQuery, filters.minPrice, filters.maxPrice, filters.sort, userLocation]);

  // ── Stats ─────────────────────────────────────────────────────────────────
  const stats = {
    markets:     [...new Set(crops.map(c => c.market))].length,
    commodities: [...new Set(crops.map(c => c.commodity))].length,
    lowestPrice: crops.length ? Math.min(...crops.map(c => parseFloat(c.modal_price) || Infinity)).toLocaleString() : "--",
    lowestCrop:  crops.reduce((a, b) => parseFloat(a.modal_price) < parseFloat(b.modal_price) ? a : b, { commodity: "--", modal_price: Infinity }).commodity,
  };

  const statCards = [
    { label: "Nearby Markets", value: stats.markets, icon: MapPin, color: "text-blue-400", bg: "bg-blue-500/10" },
    { label: "Commodities", value: stats.commodities, icon: Package, color: "text-purple-400", bg: "bg-purple-500/10" },
    { label: "Lowest Price Today", value: `₹${stats.lowestPrice}/q`, icon: TrendingDown, color: "text-green-400", bg: "bg-green-500/10" },
    { label: "Best Deal Crop", value: stats.lowestCrop, icon: Leaf, color: "text-amber-400", bg: "bg-amber-500/10" },
  ];

  // ── Pagination ─────────────────────────────────────────────────────────────
  const totalPages = Math.ceil(filtered.length / PER_PAGE);
  const paginated  = filtered.slice((page - 1) * PER_PAGE, page * PER_PAGE);

  const setFilter = (key, val) => setFilters(f => ({ ...f, [key]: val }));

  // ─────────────────────────────────────────────────────────────────────────────
  return (
    <div className="w-full space-y-8 pb-12">

      {/* ── Hero: Location + Quick Stats ─────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-white tracking-tight">Market Explorer</h1>
          <div className="flex items-center gap-2 mt-1 text-zinc-500 text-sm font-medium">
            <Navigation size={14} className="text-green-400" />
            <span>{locationName}</span>
          </div>
        </div>
        <button
          onClick={fetchCrops}
          disabled={loading}
          className="flex items-center gap-2 px-5 py-2.5 bg-white/5 border border-white/5 rounded-2xl text-xs font-black uppercase tracking-widest hover:bg-white/10 transition-all disabled:opacity-50"
        >
          <RefreshCw size={14} className={loading ? "animate-spin" : ""} /> Refresh Data
        </button>
      </div>

      {/* ── Stats Grid ──────────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-5">
        {statCards.map((s, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.07 }}
            className="bg-zinc-900/60 border border-white/5 rounded-3xl p-5 flex items-center gap-4 shadow-xl hover:bg-zinc-800/60 transition-all group"
          >
            <div className={`w-12 h-12 rounded-2xl ${s.bg} ${s.color} flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform`}>
              <s.icon size={22} />
            </div>
            <div className="min-w-0">
              <p className="text-[9px] font-black text-zinc-600 uppercase tracking-widest">{s.label}</p>
              <p className="text-base font-black text-white truncate mt-0.5">{loading ? <Loader2 size={16} className="animate-spin text-zinc-500" /> : s.value}</p>
            </div>
          </motion.div>
        ))}
      </div>

      {/* ── Search + Filter Bar ──────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1 group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500 group-focus-within:text-green-400 transition-colors" size={18} />
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Search by crop, market, or district..."
            className="w-full bg-zinc-900/60 border border-white/5 rounded-2xl py-3.5 pl-12 pr-5 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-500/30 transition-all text-zinc-200 placeholder-zinc-600"
          />
          {searchQuery && (
            <button onClick={() => setSearchQuery("")} className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-white">
              <X size={16} />
            </button>
          )}
        </div>

        {/* Sort dropdown */}
        <div className="relative">
          <select
            value={filters.sort}
            onChange={e => setFilter("sort", e.target.value)}
            className="appearance-none bg-zinc-900/60 border border-white/5 rounded-2xl py-3.5 pl-4 pr-10 text-sm font-bold text-zinc-400 focus:outline-none focus:ring-2 focus:ring-green-500/20 cursor-pointer"
          >
            <option value="default">Default Sort</option>
            <option value="low-price">Lowest Price</option>
            <option value="high-price">Highest Price</option>
            <option value="nearest">Nearest Market</option>
          </select>
          <ArrowUpDown size={14} className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-500 pointer-events-none" />
        </div>

        <button
          onClick={() => setShowFilters(!showFilters)}
          className={`flex items-center gap-2 px-5 py-3.5 rounded-2xl text-sm font-black uppercase tracking-widest border transition-all ${showFilters ? "bg-green-500 text-black border-green-500" : "bg-white/5 border-white/5 text-zinc-400 hover:text-white hover:bg-white/10"}`}
        >
          <SlidersHorizontal size={16} /> Filters {showFilters && <X size={14} />}
        </button>
      </div>

      {/* ── Expandable Filters ───────────────────────────────────────────── */}
      <AnimatePresence>
        {showFilters && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <div className="bg-zinc-900/60 border border-white/5 rounded-3xl p-6 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-5">
              {[
                { label: "State",     key: "state",     options: locations.states },
                { label: "District",  key: "district",  options: locations.districts },
                { label: "Market",    key: "market",    options: locations.markets },
                { label: "Commodity", key: "commodity", options: commodities },
              ].map(({ label, key, options }) => (
                <div key={key} className="space-y-1.5">
                  <label className="text-[9px] font-black text-zinc-600 uppercase tracking-widest">{label}</label>
                  <div className="relative">
                    <select
                      value={filters[key]}
                      onChange={e => setFilter(key, e.target.value)}
                      className="w-full appearance-none bg-zinc-950/60 border border-white/5 rounded-xl py-2.5 pl-3 pr-8 text-sm font-medium text-zinc-400 focus:outline-none focus:ring-1 focus:ring-green-500/30 cursor-pointer"
                    >
                      <option value="">All {label}s</option>
                      {options.slice(0, 50).map(o => (
                        <option key={o} value={o}>{o}</option>
                      ))}
                    </select>
                    <ChevronDown size={12} className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-600 pointer-events-none" />
                  </div>
                </div>
              ))}

              {/* Price Range */}
              <div className="space-y-1.5 col-span-2 md:col-span-1">
                <label className="text-[9px] font-black text-zinc-600 uppercase tracking-widest">Price Range (₹/q)</label>
                <div className="flex gap-2">
                  <input type="number" placeholder="Min" value={filters.minPrice} onChange={e => setFilter("minPrice", e.target.value)}
                    className="w-full bg-zinc-950/60 border border-white/5 rounded-xl py-2.5 px-3 text-sm font-medium text-zinc-400 focus:outline-none focus:ring-1 focus:ring-green-500/30" />
                  <input type="number" placeholder="Max" value={filters.maxPrice} onChange={e => setFilter("maxPrice", e.target.value)}
                    className="w-full bg-zinc-950/60 border border-white/5 rounded-xl py-2.5 px-3 text-sm font-medium text-zinc-400 focus:outline-none focus:ring-1 focus:ring-green-500/30" />
                </div>
              </div>

              {/* Clear */}
              <div className="flex items-end">
                <button
                  onClick={() => setFilters({ state: "", district: "", market: "", commodity: "", minPrice: "", maxPrice: "", sort: "default" })}
                  className="w-full py-2.5 bg-red-500/10 border border-red-500/10 rounded-xl text-red-400 font-black text-[10px] uppercase tracking-widest hover:bg-red-500/20 transition-all"
                >
                  Clear All
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Results Count ─────────────────────────────────────────────────── */}
      <div className="flex items-center justify-between">
        <p className="text-sm font-bold text-zinc-500">
          {loading ? "Loading..." : `${filtered.length} listings found`}
          {searchQuery && <span className="text-zinc-600"> for "<span className="text-green-400">{searchQuery}</span>"</span>}
        </p>
        {filtered.length > 0 && (
          <p className="text-xs font-bold text-zinc-600">
            Page {page} of {totalPages}
          </p>
        )}
      </div>

      {/* ── Crop Cards Grid ───────────────────────────────────────────────── */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {Array.from({ length: 8 }).map((_, i) => <SkeletonCard key={i} />)}
        </div>
      ) : error ? (
        <div className="flex flex-col items-center justify-center py-20 gap-6 text-center">
          <div className="w-20 h-20 rounded-3xl bg-red-500/10 border border-red-500/10 flex items-center justify-center text-red-400">
            <AlertCircle size={36} />
          </div>
          <div>
            <h3 className="text-xl font-black text-white mb-2">Data Unavailable</h3>
            <p className="text-zinc-500 text-sm max-w-md">{error}</p>
          </div>
          <button onClick={fetchCrops} className="px-6 py-3 bg-green-500 text-black rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-green-400 transition-all">
            Try Again
          </button>
        </div>
      ) : paginated.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 gap-4 text-center">
          <div className="w-20 h-20 rounded-3xl bg-zinc-800 flex items-center justify-center text-zinc-600">
            <Wheat size={36} />
          </div>
          <h3 className="text-xl font-black text-white">No Crops Found</h3>
          <p className="text-zinc-500 text-sm">Try adjusting your filters or search query.</p>
        </div>
      ) : (
        <AnimatePresence mode="popLayout">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {paginated.map((crop, i) => (
              <CropCard
                key={`${crop._id || crop.commodity}-${i}`}
                crop={crop}
                saved={savedCrops.has(crop._id || crop.commodity)}
                onSave={(id) => setSavedCrops(prev => {
                  const next = new Set(prev);
                  next.has(id) ? next.delete(id) : next.add(id);
                  return next;
                })}
                userLocation={userLocation}
              />
            ))}
          </div>
        </AnimatePresence>
      )}

      {/* ── Pagination ───────────────────────────────────────────────────── */}
      {totalPages > 1 && !loading && (
        <div className="flex items-center justify-center gap-3 pt-4">
          <button
            onClick={() => setPage(p => Math.max(1, p - 1))}
            disabled={page === 1}
            className="px-5 py-2.5 bg-white/5 border border-white/5 rounded-2xl text-xs font-black uppercase tracking-widest disabled:opacity-30 hover:bg-white/10 transition-all"
          >
            Prev
          </button>
          {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
            const p = Math.max(1, page - 2) + i;
            if (p > totalPages) return null;
            return (
              <button
                key={p}
                onClick={() => setPage(p)}
                className={`w-10 h-10 rounded-xl text-xs font-black transition-all ${p === page ? "bg-green-500 text-black" : "bg-white/5 border border-white/5 text-zinc-400 hover:text-white"}`}
              >
                {p}
              </button>
            );
          })}
          <button
            onClick={() => setPage(p => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
            className="px-5 py-2.5 bg-white/5 border border-white/5 rounded-2xl text-xs font-black uppercase tracking-widest disabled:opacity-30 hover:bg-white/10 transition-all"
          >
            Next
          </button>
        </div>
      )}

      {/* ── No DB data hint ──────────────────────────────────────────────── */}
      {!loading && !error && crops.length === 0 && (
        <div className="flex items-start gap-3 p-5 bg-amber-500/5 border border-amber-500/10 rounded-2xl text-amber-400">
          <Info size={18} className="shrink-0 mt-0.5" />
          <p className="text-xs font-bold leading-relaxed">
            The AGMARKNET database appears empty. Trigger an auto-refresh from the admin panel (<strong>Market Prices → Update from API</strong>) to populate real crop data.
          </p>
        </div>
      )}

    </div>
  );
};

export default BuyerOverview;
