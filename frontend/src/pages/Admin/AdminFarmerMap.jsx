import React, { useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { MapPin } from 'lucide-react';
import L from 'leaflet';

// Fix for default Leaflet markers in React
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: require('leaflet/dist/images/marker-icon-2x.png'),
  iconUrl: require('leaflet/dist/images/marker-icon.png'),
  shadowUrl: require('leaflet/dist/images/marker-shadow.png'),
});

// Mock farmer coordinates around India setup
const mockFarmers = [
  { id: 1, name: 'Ramesh', lat: 28.7041, lng: 77.1025, crop: 'Wheat' },     // Delhi area
  { id: 2, name: 'Suresh', lat: 17.3850, lng: 78.4867, crop: 'Rice' },      // Hyderabad
  { id: 3, name: 'Anil', lat: 19.0760, lng: 72.8777, crop: 'Cotton' },      // Mumbai area
  { id: 4, name: 'Bhuvan', lat: 26.9124, lng: 75.7873, crop: 'Mustard' },   // Jaipur
  { id: 5, name: 'Chandra', lat: 12.9716, lng: 77.5946, crop: 'Sugarcane' }, // Bangalore
  { id: 6, name: 'Vignesh', lat: 17.321540, lng: 78.527296, crop: 'Mirchi'}
];

const position = [20.5937, 78.9629]; // Center of India

const AdminFarmerMap = () => {
  return (
    <div className="space-y-6 flex flex-col h-[calc(100vh-140px)]">
      <div>
        <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
          <MapPin className="text-emerald-500 w-6 h-6"/>
          Farmer Distribution Map
        </h2>
        <p className="text-gray-500 text-sm mt-1">Geographic overview of registered farmers and crop clusters across the country.</p>
      </div>

      <div className="flex-1 rounded-2xl overflow-hidden border border-gray-200 shadow-sm relative z-0">
         {/* Simple informative overlay */}
         <div className="absolute top-4 right-4 z-[400] bg-white/90 backdrop-blur-md p-4 rounded-xl shadow-lg border border-gray-100 max-w-xs">
            <h4 className="font-bold text-gray-800 mb-2 text-sm uppercase tracking-wide">Crop Clusters Map</h4>
            <p className="text-xs text-gray-600 mb-3">Monitor geographical distribution of your userbase to optimize market connections and localized weather alerts.</p>
            <div className="flex items-center justify-between text-xs font-bold font-mono text-emerald-700 bg-emerald-50 p-2 rounded-lg">
               <span>Active Nodes:</span>
               <span>{mockFarmers.length}</span>
            </div>
         </div>

         {/* Leaflet Map taking full remaining height */}
         <div className="w-full h-full">
            <MapContainer center={position} zoom={5} style={{ height: '100%', width: '100%' }}>
              <TileLayer
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              />
              {mockFarmers.map((farmer) => (
                <Marker key={farmer.id} position={[farmer.lat, farmer.lng]}>
                  <Popup>
                    <div className="p-1">
                      <h4 className="font-bold text-gray-800 mb-1">{farmer.name}'s Farm</h4>
                      <div className="text-xs text-gray-600">
                        <span className="inline-block w-2 h-2 bg-emerald-500 rounded-full mr-1"></span>
                        Primary Crop: <strong className="text-emerald-700">{farmer.crop}</strong>
                      </div>
                    </div>
                  </Popup>
                </Marker>
              ))}
            </MapContainer>
         </div>
      </div>
    </div>
  );
};

export default AdminFarmerMap;
