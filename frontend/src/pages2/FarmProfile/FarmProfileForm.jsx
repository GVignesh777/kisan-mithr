import React, { useState, useEffect } from 'react';
import useUserStore from '../../store/useUserStore';

const FarmProfileForm = () => {
    const { user } = useUserStore();
    const userId = user?._id || user?.id;
    const [profile, setProfile] = useState({
        soilType: 'Unknown',
        irrigationMethod: 'Unknown',
        landSize: 'Unknown',
        cropType: 'Unknown',
        farmLocation: 'Unknown'
    });

    useEffect(() => {
        // Fetch existing profile on mount
        if (!userId) return;
        fetch(`${process.env.REACT_APP_API_URL}/api/users/${userId}/farmProfile`)
            .then(res => res.json())
            .then(data => {
                if(data.farmProfile) setProfile(data.farmProfile);
            })
            .catch(e => console.error("Error fetching profile", e));
    }, []);

    const handleChange = (e) => {
        setProfile({ ...profile, [e.target.name]: e.target.value });
    };

    const handleSave = async (e) => {
        e.preventDefault();
        if (!userId) {
            alert("No user ID found. Please log in.");
            return;
        }
        try {
            await fetch(`${process.env.REACT_APP_API_URL}/api/users/${userId}/farmProfile`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(profile)
            });
            alert('Farm Profile Saved successfully!');
        } catch (error) {
            console.error('Error saving:', error);
            alert('Failed to save profile');
        }
    };

    return (
        <div className="flex-1 p-8 text-white h-screen bg-zinc-950 overflow-y-auto w-full flex justify-center">
            <div className="max-w-xl w-full">
                <h1 className="text-3xl font-bold text-green-400 mb-6">My Farm Profile</h1>
                <p className="text-zinc-400 mb-8">
                    By filling out these details, the Smart Assistant will give you perfectly tailored advice for your exact land conditions instead of general answers.
                </p>

                <form onSubmit={handleSave} className="bg-zinc-900 border border-green-500/20 p-6 rounded-xl shadow-lg space-y-5">
                    
                    <div>
                        <label className="block text-sm font-medium text-zinc-300 mb-1">State & District / Location</label>
                        <input type="text" name="farmLocation" value={profile.farmLocation} onChange={handleChange} 
                               className="w-full bg-zinc-950 border border-zinc-700 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-green-500 transition-colors" placeholder="e.g. Warangal, Telangana" />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-zinc-300 mb-1">Primary Soil Type</label>
                            <select name="soilType" value={profile.soilType} onChange={handleChange} className="w-full bg-zinc-950 border border-zinc-700 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-green-500 appearance-none">
                                <option>Unknown</option>
                                <option>Red Soil</option>
                                <option>Black Cotton Soil</option>
                                <option>Alluvial Soil</option>
                                <option>Laterite Soil</option>
                                <option>Sandy Soil</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-zinc-300 mb-1">Irrigation Method</label>
                            <select name="irrigationMethod" value={profile.irrigationMethod} onChange={handleChange} className="w-full bg-zinc-950 border border-zinc-700 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-green-500 appearance-none">
                                <option>Unknown</option>
                                <option>Rainfed / Dryland</option>
                                <option>Drip Irrigation</option>
                                <option>Sprinkler</option>
                                <option>Flood / Canal</option>
                                <option>Borewell</option>
                            </select>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-zinc-300 mb-1">Total Land Size</label>
                            <input type="text" name="landSize" value={profile.landSize} onChange={handleChange} className="w-full bg-zinc-950 border border-zinc-700 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-green-500" placeholder="e.g. 5 Acres" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-zinc-300 mb-1">Current Major Crop</label>
                            <input type="text" name="cropType" value={profile.cropType} onChange={handleChange} className="w-full bg-zinc-950 border border-zinc-700 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-green-500" placeholder="e.g. Cotton, Paddy" />
                        </div>
                    </div>

                    <button type="submit" className="w-full bg-green-600 hover:bg-green-500 text-white font-medium py-3 rounded-lg mt-4 transition-colors">
                        Save Farm Profile to Database
                    </button>
                </form>
            </div>
        </div>
    );
};

export default FarmProfileForm;
