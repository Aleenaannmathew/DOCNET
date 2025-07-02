import { Bell, Heart, Search, Stethoscope } from 'lucide-react'
import React, { useState } from 'react'
import { useSelector } from 'react-redux'

function DocNav() {
    const { user } = useSelector(state => state.auth)
    const [previewImage, setPreviewImage] = useState(null);
    const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

    const getProfileImageUrl = () => {
        if (previewImage) return previewImage;
        if (user?.profile_image) return user.profile_image;
        return `https://ui-avatars.com/api/?name=${user ? 'Dr+' + user.username?.split(' ').join('+') : 'User'}&background=random&color=fff&size=128`;
    };

    return (
        <div>
            <header className="bg-white border-b border-gray-200 sticky top-0 z-40">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
                    <div className="flex items-center space-x-4">
                        <button 
                            className="lg:hidden text-gray-500 hover:text-gray-700 transition-colors"
                            onClick={() => setMobileSidebarOpen(!mobileSidebarOpen)}
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                            </svg>
                        </button>
                        <div className="flex items-center space-x-2">
                            <div className="w-8 h-8 bg-emerald-500 rounded-lg flex items-center justify-center">
                                <Heart className="w-5 h-5 text-white" />
                            </div>
                            <div>
                                <h1 className="text-xl font-bold text-slate-800">DOCNET</h1>
                                {user && (
                                    <span className="text-xs text-emerald-600 font-medium bg-emerald-100 px-2 py-0.5 rounded-full">PROFESSIONAL</span>
                                )}
                            </div>
                        </div>
                    </div>
                    
                    <div className="flex items-center space-x-4">
                        {user ? (
                            <>
                                <div className="hidden md:flex items-center bg-gray-100 rounded-xl px-4 py-2">
                                    <Search className="w-4 h-4 text-gray-400 mr-2" />
                                    <input 
                                        type="text" 
                                        placeholder="Search patients, appointments..."
                                        className="bg-transparent border-none outline-none text-sm text-gray-600 placeholder-gray-400 w-64"
                                    />
                                </div>
                                <div className="flex items-center space-x-3">
                                    <div className="hidden md:block text-right">
                                        <p className="text-sm font-semibold text-gray-900">Dr. {user.username}</p>
                                        <p className="text-xs text-gray-500">{user?.doctor_profile?.specialization || 'Medical Professional'}</p>
                                    </div>
                                    <div className="relative">
                                        <img 
                                            src={getProfileImageUrl()} 
                                            alt={user.username} 
                                            className="w-10 h-10 rounded-full object-cover border-2 border-emerald-200"
                                        />
                                        <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-emerald-500 rounded-full border-2 border-white"></div>
                                    </div>
                                </div>
                            </>
                        ) : (
                            <div className="flex items-center space-x-4">
                                <button className="text-sm font-medium text-gray-600 hover:text-emerald-600 transition-colors">
                                    Sign In
                                </button>
                                <button className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors">
                                    Register
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </header>
        </div>
    )
}

export default DocNav