import React, { useState, useRef } from 'react';
import { Camera, Save, User, Lock, Briefcase, Mail, Shield, AlertCircle } from 'lucide-react';
import useUserStore from '../../store/useUserStore';
import { updateUserProfile } from '../../services/user.service';
import { toast } from 'react-toastify';
import useTranslation from '../../hooks/useTranslation';

const ProfilePage = () => {
    const { user, setUser } = useUserStore();
    const { t } = useTranslation();
    const [isLoading, setIsLoading] = useState(false);
    
    const [formData, setFormData] = useState({
        username: user?.username || user?.googleName || '',
        email: user?.email || user?.googleEmail || '',
        role: user?.role || 'farmer',
        currentPassword: '',
        newPassword: ''
    });

    const [previewImage, setPreviewImage] = useState(user?.profilePicture || user?.googlePhoto || null);
    const [selectedFile, setSelectedFile] = useState(null); // actual File object for upload
    const fileInputRef = useRef(null);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setSelectedFile(file);
            const reader = new FileReader();
            reader.onloadend = () => {
                setPreviewImage(reader.result);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);

        try {
            // Use FormData so multer (multipart/form-data) can correctly process file uploads
            const formPayload = new FormData();
            formPayload.append('username', formData.username);
            formPayload.append('role', formData.role);
            // Send email as fallback identifier for the backend
            formPayload.append('email', user?.email || user?.googleEmail || user?.googleMail || '');

            if (selectedFile) {
                // New file selected — let multer upload it to Cloudinary
                formPayload.append('media', selectedFile);
            } else if (previewImage && previewImage.startsWith('http')) {
                // No new file, just keep existing Cloudinary URL as plain text
                formPayload.append('profilePicture', previewImage);
            }

            if (formData.newPassword) {
                formPayload.append('password', formData.newPassword);
            }

            const res = await updateUserProfile(formPayload);

            if (res.status === 'success' || res.success) {
                setUser({
                    ...user,
                    username: formData.username,
                    role: formData.role,
                    profilePicture: previewImage
                });

                toast.success("Profile updated successfully!");
                if (user.role !== formData.role) {
                    setTimeout(() => {
                        window.location.href = formData.role === 'buyer' ? '/buyer-dashboard' : formData.role === 'admin' ? '/admin-dashboard' : '/';
                    }, 1000);
                }
            } else {
                toast.error(res.message || "Failed to update profile.");
            }
        } catch (error) {
            console.error("Profile update error:", error);
            toast.error(error.message || "An error occurred while saving.");
        } finally {
            setIsLoading(false);
        }
    };

    if (!user) {
        return <div className="min-h-screen bg-zinc-950 flex items-center justify-center text-white">Loading User Data...</div>;
    }

    return (
        <div className="min-h-screen bg-zinc-950 text-zinc-100 flex justify-center py-12 px-4 sm:px-6 lg:px-8 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-green-900/20 via-zinc-950 to-zinc-950">
            <div className="max-w-3xl w-full space-y-8">
                
                <div className="text-center">
                    <h2 className="text-3xl md:text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-emerald-500 tracking-tight">
                        {t("profilePage.accountSettings")}
                    </h2>
                    <p className="mt-2 text-zinc-400">{t("profilePage.manageProfile")}</p>
                </div>

                <div className="bg-zinc-900/60 backdrop-blur-xl border border-white/5 rounded-[2rem] p-6 md:p-10 shadow-2xl relative overflow-hidden">
                    {/* Decorative Background Blob */}
                    <div className="absolute -top-32 -right-32 w-64 h-64 bg-green-500/10 rounded-full blur-[80px] pointer-events-none"></div>

                    <form onSubmit={handleSubmit} className="space-y-8 relative z-10">
                        {/* Avatar Section */}
                        <div className="flex flex-col items-center sm:flex-row sm:items-center gap-6 pb-8 border-b border-white/5">
                            <div className="relative group">
                                <div className="w-28 h-28 rounded-full border-4 border-zinc-800 overflow-hidden bg-zinc-800 shadow-xl group-hover:border-green-500/50 transition-colors duration-300">
                                    {previewImage ? (
                                        <img src={previewImage} alt="Profile" className="w-full h-full object-cover" />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center text-4xl text-green-500 font-bold">
                                            {formData.username.charAt(0).toUpperCase()}
                                        </div>
                                    )}
                                </div>
                                <button 
                                    type="button"
                                    onClick={() => fileInputRef.current?.click()}
                                    className="absolute bottom-0 right-0 p-2.5 bg-green-500 hover:bg-green-400 text-zinc-950 rounded-full shadow-lg transition-transform hover:scale-110"
                                >
                                    <Camera size={18} />
                                </button>
                                <input 
                                    type="file" 
                                    ref={fileInputRef} 
                                    onChange={handleImageChange} 
                                    accept="image/*" 
                                    className="hidden" 
                                />
                            </div>
                            <div className="text-center sm:text-left">
                                <h3 className="text-xl font-bold text-white">{formData.username || "User"}</h3>
                                <p className="text-zinc-500 text-sm mb-3">{formData.email}</p>
                                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-green-500/10 text-green-400 border border-green-500/20 uppercase tracking-widest">
                                    {formData.role} {t("profilePage.currentRole")}
                                </span>
                            </div>
                        </div>

                        {/* Two Column Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            
                            {/* Personal Info */}
                            <div className="space-y-5">
                                <h4 className="text-sm font-bold text-zinc-400 uppercase tracking-wider mb-4 flex items-center gap-2">
                                    <User size={16} className="text-emerald-500" /> {t("profilePage.personalDetails")}
                                </h4>
                                
                                <div>
                                    <label className="block text-sm font-medium text-zinc-400 mb-2">{t("profilePage.displayName")}</label>
                                    <input 
                                        type="text" 
                                        name="username"
                                        value={formData.username}
                                        onChange={handleChange}
                                        className="w-full bg-black/40 border border-zinc-800 rounded-xl px-4 py-3 text-zinc-200 focus:outline-none focus:border-green-500 focus:ring-1 focus:ring-green-500 transition-all placeholder-zinc-600"
                                        placeholder={t("profilePage.enterYourName")}
                                    />
                                </div>
                                
                                <div>
                                    <label className="block text-sm font-medium text-zinc-400 mb-2">{t("profilePage.emailAddress")}</label>
                                    <div className="relative">
                                        <input 
                                            type="email" 
                                            name="email"
                                            value={formData.email}
                                            disabled // Email typically disabled from direct edit
                                            className="w-full bg-black/40 border border-zinc-800 rounded-xl pl-11 pr-4 py-3 text-zinc-500 cursor-not-allowed"
                                        />
                                        <Mail size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-600" />
                                    </div>
                                    <p className="text-xs text-zinc-600 mt-2 flex items-center gap-1">
                                        <AlertCircle size={12} /> {t("profilePage.contactSupportEmail")}
                                    </p>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-zinc-400 mb-2">{t("profilePage.accountRole")}</label>
                                    <div className="relative">
                                        <select 
                                            name="role"
                                            value={formData.role}
                                            onChange={handleChange}
                                            className="w-full bg-black/40 border border-zinc-800 rounded-xl pl-11 pr-4 py-3 text-zinc-200 focus:outline-none focus:border-green-500 focus:ring-1 focus:ring-green-500 transition-all appearance-none cursor-pointer"
                                        >
                                            <option value="farmer">Farmer</option>
                                            <option value="buyer">Buyer</option>
                                            <option value="admin">Admin</option>
                                        </select>
                                        <Briefcase size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500 pointer-events-none" />
                                    </div>
                                    <p className="text-xs text-zinc-500 mt-2">{t("profilePage.changingRoleRedirect")}</p>
                                </div>
                            </div>

                            {/* Security Box */}
                            <div className="space-y-5">
                                <h4 className="text-sm font-bold text-zinc-400 uppercase tracking-wider mb-4 flex items-center gap-2">
                                    <Shield size={16} className="text-blue-500" /> {t("profilePage.security")}
                                </h4>
                                
                                <div className="p-5 rounded-2xl bg-gradient-to-br from-zinc-800/40 to-black/20 border border-zinc-800/50 space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium text-zinc-400 mb-2">{t("profilePage.currentPassword")}</label>
                                        <div className="relative">
                                            <input 
                                                type="password" 
                                                name="currentPassword"
                                                value={formData.currentPassword}
                                                onChange={handleChange}
                                                className="w-full bg-black/60 border border-zinc-800 rounded-lg pl-10 pr-4 py-2.5 text-zinc-200 focus:outline-none focus:border-blue-500 transition-all placeholder-zinc-700"
                                                placeholder="••••••••"
                                            />
                                            <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-600" />
                                        </div>
                                    </div>
                                    
                                    <div>
                                        <label className="block text-sm font-medium text-zinc-400 mb-2">{t("profilePage.newPassword")}</label>
                                        <div className="relative">
                                            <input 
                                                type="password" 
                                                name="newPassword"
                                                value={formData.newPassword}
                                                onChange={handleChange}
                                                className="w-full bg-black/60 border border-zinc-800 rounded-lg pl-10 pr-4 py-2.5 text-zinc-200 focus:outline-none focus:border-blue-500 transition-all placeholder-zinc-700"
                                                placeholder={t("profilePage.leaveBlank")}
                                            />
                                            <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-600" />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Actions */}
                        <div className="pt-6 border-t border-white/5 flex flex-col-reverse sm:flex-row justify-end gap-3 sm:gap-4">
                            <button 
                                type="button"
                                onClick={() => window.history.back()}
                                className="px-6 py-3 rounded-xl font-bold text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
                            >
                                {t("profilePage.cancel")}
                            </button>
                            <button 
                                type="submit"
                                disabled={isLoading}
                                className="px-8 py-3 rounded-xl font-bold text-zinc-950 bg-gradient-to-r from-green-400 to-emerald-500 hover:opacity-90 transition-opacity flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(52,211,153,0.3)] disabled:opacity-50"
                            >
                                {isLoading ? (
                                    <div className="w-5 h-5 border-2 border-zinc-950 border-t-transparent rounded-full animate-spin"></div>
                                ) : (
                                    <><Save size={18} /> {t("profilePage.saveChanges")}</>
                                )}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default ProfilePage;
