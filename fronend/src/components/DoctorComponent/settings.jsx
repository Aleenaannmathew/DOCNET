import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { doctorAxios } from '../../axios/DoctorAxios';
import { ToastContainer, toast } from 'react-toastify';
import { useLocation, useNavigate } from 'react-router-dom';
import { Camera, Save, X, ChevronDown, ChevronRight, CheckCircle } from 'lucide-react';
import { updateUser } from '../../store/authSlice';
import { logout } from '../../store/authSlice';
import DocnetLoading from '../Constants/Loading';

const Settings = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user, token } = useSelector(state => state.auth);
  const location = useLocation();
  const [activeTab, setActiveTab] = useState('Profile Information');
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    phone: '',
    hospital: '',
    languages: 'English',
    age: '',
    gender: '',
    experience: '',
    profile_image: null
  });
  
  const [formErrors, setFormErrors] = useState({});
  const [profileImage, setProfileImage] = useState(null);
  const [previewImage, setPreviewImage] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [successMessage, setSuccessMessage ] = useState('');
  const [showSuccessLoader, setShowSuccessLoader] = useState(false);
  const [profileFetched, setProfileFetched] = useState(false);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  // Sidebar menu items specific to doctors
  const sidebarItems = [
    { name: 'Profile Information', icon: '👤' },
    { name: 'Change Password', icon: '🔒' },
    { name: 'Availability', icon: '📅' },
    { name: 'Appointments', icon: '🩺' },
    { name: 'Patient Records', icon: '📋' },
    { name: 'Notifications', icon: '🔔' },
    { name: 'Help & Support', icon: '❓' },
    { name: 'Logout', icon: '🚪', color: 'text-red-500' }
  ];

  // Language options
  const languageOptions = ['English', 'Spanish', 'French', 'German', 'Hindi', 'Arabic', 'Chinese'];

  // Gender options
  const genderOptions = ['Male', 'Female', 'Other', 'Prefer not to say'];

  // Initialize form data from user state
  useEffect(() => {
    if (user) {
      setFormData({
        username: user.username || '',
        email: user.email || '',
        phone: user.phone || '',
        hospital: user.doctor_profile?.hospital || '',
        languages: user.doctor_profile?.languages || 'English',
        age: user.doctor_profile?.age || '',
        gender: user.doctor_profile?.gender || '',
        experience: user.doctor_profile?.experience || '',
      });
      setPreviewImage(user.profile_image || null);
    }
  }, [user]);

  // Fetch detailed doctor profile data
  useEffect(() => {
    if (user && token && !profileFetched && !loading) {
      fetchDoctorDetails();
    }
  }, [user, token, profileFetched, loading]);

  const fetchDoctorDetails = async () => {
    try {
      setLoading(true);
      const response = await doctorAxios.get('doctor-profile/');
      
      if (response.data) {
        const mergedData = {
          ...response.data,
          hospital: response.data.hospital || '',
          languages: response.data.languages || 'English',
          age: response.data.age || '',
          gender: response.data.gender || '',
          experience: response.data.experience || '',
        };
        
        setFormData(prevState => ({
          ...prevState,
          ...mergedData,
        }));
        
        dispatch(updateUser({
          ...user,
          ...mergedData,
          doctor_profile: {
            ...user.doctor_profile,
            ...response.data
          }
        }));
      }
      
      setProfileFetched(true);
    } catch (err) {
      console.error('Error fetching doctor details:', err);
      toast.error(`Failed to load profile data: ${err.response?.data?.detail || err.message}`);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
      if (location.state?.successMessage) {
        setSuccessMessage(location.state.successMessage);
        setShowSuccess(true);
        window.history.replaceState({}, document.title);
  
        const timer = setTimeout(() => {
          setShowSuccess(false);
        }, 5000);
  
        return () => clearTimeout(timer)
      }
    }, [location.state]);

  // Form validation function
  const validateForm = () => {
    const errors = {};
    
    if (!formData.username.trim()) {
      errors.username = 'Username is required';
    } else if (formData.username.length < 3) {
      errors.username = 'Username must be at least 3 characters';
    }
    
    if (!formData.email.trim()) {
      errors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      errors.email = 'Please enter a valid email address';
    }
    
    if (formData.phone && !/^[0-9+\-\s()]{7,15}$/.test(formData.phone)) {
      errors.phone = 'Please enter a valid phone number';
    }
    
    if (formData.age) {
      const age = parseInt(formData.age);
      if (isNaN(age) || age < 25 || age > 80) {
        errors.age = 'Please enter a valid age between 25 and 80';
      }
    }
    
    if (formData.experience) {
      const experience = parseInt(formData.experience);
      if (isNaN(experience) || experience < 0 || experience > 60) {
        errors.experience = 'Please enter valid experience years (0-60)';
      }
    }
    
    if (profileImage) {
      const allowedTypes = ['image/jpeg', 'image/png', 'image/gif'];
      if (!allowedTypes.includes(profileImage.type)) {
        errors.profile_image = 'Please select a valid image file (JPEG, PNG, or GIF)';
      } else if (profileImage.size > 5 * 1024 * 1024) {
        errors.profile_image = 'Image size should be less than 5MB';
      }
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
    
    if (formErrors[name]) {
      setFormErrors({
        ...formErrors,
        [name]: ''
      });
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setProfileImage(file);
      setPreviewImage(URL.createObjectURL(file));
      
      if (formErrors.profile_image) {
        setFormErrors({
          ...formErrors,
          profile_image: ''
        });
      }
    }
  };

  const handleRemoveImage = () => {
    setProfileImage(null);
    setPreviewImage(user.profile_image || null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      toast.error('Please correct the errors before submitting');
      return;
    }

    try {
      setLoading(true);
      
      const formDataToSend = new FormData();
      
      // Append all fields
      Object.keys(formData).forEach(key => {
        if (formData[key] !== null && formData[key] !== undefined && key !== 'profile_image') {
          formDataToSend.append(key, formData[key]);
        }
      });
      
      if (profileImage) {
        formDataToSend.append('profile_image', profileImage);
      }
      
      const response = await doctorAxios.put('doctor-profile/update', formDataToSend, {
        headers: { 
          'Content-Type': 'multipart/form-data'
        }
      });
      
      if (response.data) {
        dispatch(updateUser(response.data));
        toast.success('Profile updated successfully!');
        setIsEditing(false);
      }
    } catch (err) {
      console.error('Error updating profile:', err);
      toast.error(`Failed to update profile: ${err.response?.data?.detail || err.message}`);
    } finally {
      setLoading(false);
    }
  };

 const handleTabClick = (tab) => {
  if (tab === 'Logout') {
    handleLogout();
  } else if (tab === 'Change Password'){
    navigate('/doctor/change-password', {
      state: {
        isDoctor: true,
        email: user.email
      },
      replace: true
    });
  } else {
    setActiveTab(tab);
    setMobileSidebarOpen(false);
  }
};

  const handleLogout = () => {
    dispatch(logout());
    navigate('/login');
  };

  const toggleEditMode = () => {
    setIsEditing(!isEditing);
    
    if (isEditing) {
      if (previewImage && previewImage.startsWith('blob:')) {
        URL.revokeObjectURL(previewImage);
      }
      setProfileImage(null);
      setPreviewImage(user.profile_image || null);
      
      if (user) {
        setFormData({
          username: user.username || '',
          email: user.email || '',
          phone: user.phone || '',
          hospital: user.doctor_profile?.hospital || '',
          languages: user.doctor_profile?.languages || 'English',
          age: user.doctor_profile?.age || '',
          gender: user.doctor_profile?.gender || '',
          experience: user.doctor_profile?.experience || '',
        });
      }
      
      setFormErrors({});
    }
  };

  const profileImageUrl = previewImage || (user?.profile_image || "/api/placeholder/80/80");

  if (!user) {
    return (
      <div className="min-h-screen flex justify-center items-center bg-white">
        <div className="text-center">
          <p className="mb-4">Please log in to view your profile</p>
          <button
            onClick={() => navigate('/login')}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium transition"
          >
            Go to Login
          </button>
        </div>
      </div>
    );
  }

  if (showSuccessLoader) {
    return <DocnetLoading />;
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <ToastContainer
        position="top-right"
        autoClose={5000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
      />
      {showSuccess && (
        <div className="mb-4 rounded-md bg-green-50 p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <CheckCircle className="h-5 w-5 text-green-400" />
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-green-800">{successMessage}</p>
            </div>
          </div>
        </div>
      )}
      
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <div className="flex items-center">
            <button 
              className="md:hidden mr-4 text-gray-500"
              onClick={() => setMobileSidebarOpen(!mobileSidebarOpen)}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
            <h1 className="text-xl font-bold text-blue-600">DocNet</h1>
          </div>
          <div className="flex items-center space-x-4">
            <div className="hidden md:flex items-center space-x-2">
              <span className="text-gray-700 font-medium">Dr. {user.username}</span>
              <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center">
                <span className="text-sm font-medium text-blue-600">
                  {user.username.charAt(0).toUpperCase()}
                </span>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex flex-1 overflow-hidden">
        {/* Mobile Sidebar Backdrop */}
        {mobileSidebarOpen && (
          <div 
            className="fixed inset-0 bg-black/50 z-20 md:hidden"
            onClick={() => setMobileSidebarOpen(false)}
          />
        )}

        {/* Sidebar */}
        <aside className={`fixed md:static z-30 w-64 h-full bg-white shadow-md transform transition-transform duration-300 ease-in-out ${
          mobileSidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        }`}>
          <div className="h-full flex flex-col">
            {/* Profile Summary */}
            <div className="p-6 border-b">
              <div className="flex items-center space-x-4">
                <div className="relative">
                  <img 
                    src={profileImageUrl} 
                    alt={user.username} 
                    className="w-12 h-12 rounded-full object-cover border-2 border-blue-100"
                  />
                  <div className="absolute bottom-0 right-0 h-3 w-3 bg-green-500 rounded-full border-2 border-white"></div>
                </div>
                <div>
                  <h3 className="font-medium text-gray-900">Dr. {user.username}</h3>
                  <p className="text-sm text-gray-500">{user.email}</p>
                </div>
              </div>
            </div>

            {/* Navigation */}
            <nav className="flex-1 overflow-y-auto p-4">
              <ul className="space-y-1">
                {sidebarItems.map((item) => (
                  <li key={item.name}>
                    <button
                      onClick={() => handleTabClick(item.name)}
                      className={`w-full flex items-center justify-between px-4 py-3 rounded-lg text-left transition-colors ${
                        activeTab === item.name 
                          ? 'bg-blue-50 text-blue-600' 
                          : 'text-gray-700 hover:bg-gray-100'
                      } ${item.color || ''}`}
                    >
                      <div className="flex items-center">
                        <span className="mr-3">{item.icon}</span>
                        <span>{item.name}</span>
                      </div>
                      {activeTab === item.name ? (
                        <ChevronDown size={16} />
                      ) : (
                        <ChevronRight size={16} />
                      )}
                    </button>
                  </li>
                ))}
              </ul>
            </nav>
          </div>
        </aside>

        {/* Main Content Area */}
        <main className="flex-1 overflow-y-auto bg-gray-50">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            {/* Profile Header */}
            <div className="bg-white rounded-xl shadow-sm p-6 mb-8">
              <div className="flex flex-col sm:flex-row items-center justify-between">
                <div className="flex items-center mb-4 sm:mb-0">
                  <div className="relative mr-4">
                    <img 
                      src={profileImageUrl} 
                      alt={user.username} 
                      className="w-16 h-16 rounded-full object-cover border-2 border-blue-100"
                    />
                    {isEditing && (
                      <label className="absolute bottom-0 right-0 bg-blue-600 text-white p-1 rounded-full cursor-pointer">
                        <Camera size={16} />
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleImageChange}
                          className="hidden"
                        />
                      </label>
                    )}
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-gray-900">Dr. {user.username}</h2>
                    <p className="text-gray-600">{user.email}</p>
                    <div className="flex items-center mt-1">
                      <span className="text-sm text-gray-500">
                        {user.doctor_profile?.hospital && `${user.doctor_profile.hospital} • `}
                        {user.doctor_profile?.experience ? `${user.doctor_profile.experience} years experience` : ''}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="flex space-x-3">
                  {isEditing ? (
                    <>
                      <button
                        onClick={handleSubmit}
                        disabled={loading}
                        className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium text-sm flex items-center space-x-1 transition"
                      >
                        {loading ? (
                          <span>Saving...</span>
                        ) : (
                          <>
                            <Save size={16} />
                            <span>Save</span>
                          </>
                        )}
                      </button>
                      <button
                        onClick={toggleEditMode}
                        className="bg-gray-200 hover:bg-gray-300 text-gray-800 px-4 py-2 rounded-lg font-medium text-sm flex items-center space-x-1 transition"
                      >
                        <X size={16} />
                        <span>Cancel</span>
                      </button>
                    </>
                  ) : (
                    <button
                      onClick={toggleEditMode}
                      className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium text-sm flex items-center space-x-1 transition"
                    >
                      <span>Edit Profile</span>
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* Profile Form */}
            <div className="bg-white rounded-xl shadow-sm overflow-hidden">
              {loading && (
                <div className="absolute inset-0 bg-white bg-opacity-70 flex items-center justify-center z-10">
                  <div className="flex flex-col items-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mb-3"></div>
                    <div className="text-blue-600">Saving changes...</div>
                  </div>
                </div>
              )}

              <form onSubmit={handleSubmit} className="divide-y divide-gray-200">
                {/* Basic Information */}
                <div className="p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Basic Information</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Username</label>
                      <input
                        type="text"
                        name="username"
                        value={formData.username || ''}
                        onChange={handleInputChange}
                        disabled={!isEditing}
                        className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                          formErrors.username ? 'border-red-500' : 'border-gray-300'
                        } ${!isEditing ? 'bg-gray-100 text-gray-500' : ''}`}
                      />
                      {formErrors.username && (
                        <p className="mt-1 text-sm text-red-600">{formErrors.username}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
                      <input
                        type="email"
                        name="email"
                        value={formData.email || ''}
                        onChange={handleInputChange}
                        disabled={!isEditing}
                        className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                          formErrors.email ? 'border-red-500' : 'border-gray-300'
                        } ${!isEditing ? 'bg-gray-100 text-gray-500' : ''}`}
                      />
                      {formErrors.email && (
                        <p className="mt-1 text-sm text-red-600">{formErrors.email}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
                      <input
                        type="tel"
                        name="phone"
                        value={formData.phone || ''}
                        onChange={handleInputChange}
                        disabled={!isEditing}
                        className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                          formErrors.phone ? 'border-red-500' : 'border-gray-300'
                        } ${!isEditing ? 'bg-gray-100 text-gray-500' : ''}`}
                      />
                      {formErrors.phone && (
                        <p className="mt-1 text-sm text-red-600">{formErrors.phone}</p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Professional Information */}
                <div className="p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Professional Information</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Hospital/Clinic</label>
                      <input
                        type="text"
                        name="hospital"
                        value={formData.hospital || ''}
                        onChange={handleInputChange}
                        disabled={!isEditing}
                        className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                          !isEditing ? 'bg-gray-100 text-gray-500' : ''
                        }`}
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Languages</label>
                      {isEditing ? (
                        <select
                          name="languages"
                          value={formData.languages || 'English'}
                          onChange={handleInputChange}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        >
                          {languageOptions.map(lang => (
                            <option key={lang} value={lang}>{lang}</option>
                          ))}
                        </select>
                      ) : (
                        <div className="px-3 py-2 bg-gray-100 rounded-lg text-gray-700">
                          {formData.languages || 'Not specified'}
                        </div>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Experience (years)</label>
                      <input
                        type="number"
                        name="experience"
                        value={formData.experience || ''}
                        onChange={handleInputChange}
                        disabled={!isEditing}
                        min="0"
                        max="60"
                        className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                          formErrors.experience ? 'border-red-500' : 'border-gray-300'
                        } ${!isEditing ? 'bg-gray-100 text-gray-500' : ''}`}
                      />
                      {formErrors.experience && (
                        <p className="mt-1 text-sm text-red-600">{formErrors.experience}</p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Personal Information */}
                <div className="p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Personal Information</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Age</label>
                      <input
                        type="number"
                        name="age"
                        value={formData.age || ''}
                        onChange={handleInputChange}
                        disabled={!isEditing}
                        min="25"
                        max="80"
                        className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                          formErrors.age ? 'border-red-500' : 'border-gray-300'
                        } ${!isEditing ? 'bg-gray-100 text-gray-500' : ''}`}
                      />
                      {formErrors.age && (
                        <p className="mt-1 text-sm text-red-600">{formErrors.age}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Gender</label>
                      {isEditing ? (
                        <select
                          name="gender"
                          value={formData.gender || ''}
                          onChange={handleInputChange}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        >
                          <option value="">Select Gender</option>
                          {genderOptions.map(gender => (
                            <option key={gender} value={gender.toLowerCase()}>{gender}</option>
                          ))}
                        </select>
                      ) : (
                        <div className="px-3 py-2 bg-gray-100 rounded-lg text-gray-700 capitalize">
                          {formData.gender || 'Not specified'}
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Registration Information */}
                <div className="p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Registration Information</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Registration ID</label>
                      <div className="px-3 py-2 bg-gray-100 rounded-lg text-gray-700">
                        {user.doctor_profile?.registration_id || 'Not available'}
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Verification Status</label>
                      <div className="px-3 py-2 rounded-lg">
                        {user.is_verified ? (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                            Verified
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                            Pending Verification
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {isEditing && (
                  <div className="p-6 bg-gray-50 flex justify-end">
                    <button
                      type="submit"
                      className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium flex items-center space-x-2 transition"
                      disabled={loading}
                    >
                      <Save size={18} />
                      <span>Save Changes</span>
                    </button>
                  </div>
                )}
              </form>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default Settings;