import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import { doctorAxios } from '../../axios/DoctorAxios';
import { ToastContainer, toast } from 'react-toastify';
import { useLocation, useNavigate } from 'react-router-dom';
import { 
  Camera, Save, X, ChevronDown, ChevronRight, CheckCircle, FileText, 
  User, Lock, Calendar, Stethoscope, Clipboard, Bell, HelpCircle, 
  LogOut, Search, Edit3, Shield, Award, MapPin, Globe, Clock, 
  Phone, Mail, Building2, Languages, Users, Heart
} from 'lucide-react';
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
  
  const [profileImage, setProfileImage] = useState(null);
  const [previewImage, setPreviewImage] = useState(null);
  const [certificatePreview, setCertificatePreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [showSuccessLoader, setShowSuccessLoader] = useState(false);
  const [profileFetched, setProfileFetched] = useState(false);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  // Validation Schema using Yup
  const validationSchema = Yup.object().shape({
    username: Yup.string()
      .min(3, 'Username must be at least 3 characters')
      .required('Username is required'),
    
    email: Yup.string()
      .email('Please enter a valid email address')
      .required('Email is required'),
    
    phone: Yup.string()
      .matches(/^[0-9+\-\s()]{7,15}$/, 'Please enter a valid phone number')
      .nullable(),
    
    hospital: Yup.string()
      .max(100, 'Hospital name must be less than 100 characters')
      .nullable(),
    
    languages: Yup.string()
      .required('Please select a language'),
    
    age: Yup.number()
      .integer('Age must be a whole number')
      .min(21, 'Age must be at least 21')
      .max(80, 'Age must be less than 80')
      .nullable()
      .transform((value, originalValue) => {
        return originalValue === '' ? null : value;
      }),
    
    gender: Yup.string()
      .oneOf(['male', 'female', 'other', 'prefer not to say'], 'Please select a valid gender')
      .nullable(),
    
    experience: Yup.number()
      .integer('Experience must be a whole number')
      .min(0, 'Experience cannot be negative')
      .max(60, 'Experience must be less than 60 years')
      .nullable()
      .transform((value, originalValue) => {
        return originalValue === '' ? null : value;
      }),
  });

  // Initial form values
  const initialValues = {
    username: user?.username || '',
    email: user?.email || '',
    phone: user?.phone || '',
    hospital: user?.doctor_profile?.hospital || '',
    languages: user?.doctor_profile?.languages || 'English',
    age: user?.doctor_profile?.age || '',
    gender: user?.doctor_profile?.gender || '',
    experience: user?.doctor_profile?.experience || '',
  };

  // Sidebar menu items with modern icons
  const sidebarItems = [
    { name: 'Profile Information', icon: User, color: 'text-emerald-400', bgColor: 'bg-emerald-500/10' },
    { name: 'Change Password', icon: Lock, color: 'text-blue-400', bgColor: 'bg-blue-500/10' },
    { name: 'Availability', icon: Calendar, color: 'text-purple-400', bgColor: 'bg-purple-500/10' },
    { name: 'Appointments', icon: Stethoscope, color: 'text-pink-400', bgColor: 'bg-pink-500/10' },
    { name: 'Patient Records', icon: Clipboard, color: 'text-orange-400', bgColor: 'bg-orange-500/10' },
    { name: 'Notifications', icon: Bell, color: 'text-yellow-400', bgColor: 'bg-yellow-500/10' },
    { name: 'Help & Support', icon: HelpCircle, color: 'text-indigo-400', bgColor: 'bg-indigo-500/10' },
    { name: 'Logout', icon: LogOut, color: 'text-red-400', bgColor: 'bg-red-500/10' }
  ];

  // Language options
  const languageOptions = ['English', 'Spanish', 'French', 'German', 'Hindi', 'Arabic', 'Chinese'];

  // Gender options
  const genderOptions = [
    { value: '', label: 'Select Gender' },
    { value: 'male', label: 'Male' },
    { value: 'female', label: 'Female' },
    { value: 'other', label: 'Other' },
    { value: 'prefer not to say', label: 'Prefer not to say' }
  ];

  // Initialize preview image
  useEffect(() => {
    if (user) {
      setPreviewImage(user.profile_image || null);
      if (user.doctor_profile?.certificate) {
        setCertificatePreview(user.doctor_profile.certificate);
      }
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
        
        dispatch(updateUser({
          ...user,
          ...mergedData,
          doctor_profile: {
            ...user.doctor_profile,
            ...response.data
          }
        }));

        if (response.data.certificate) {
          setCertificatePreview(response.data.certificate);
        }
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

      return () => clearTimeout(timer);
    }
  }, [location.state]);

  // File validation functions
  const validateProfileImage = (file) => {
    if (!file) return null;
    
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif'];
    if (!allowedTypes.includes(file.type)) {
      return 'Please select a valid image file (JPEG, PNG, or GIF)';
    }
    if (file.size > 5 * 1024 * 1024) {
      return 'Image size should be less than 5MB';
    }
    return null;
  };

  const validateCertificate = (file) => {
    if (!file) return null;
    
    const allowedTypes = ['application/pdf', 'image/jpeg', 'image/png'];
    if (!allowedTypes.includes(file.type)) {
      return 'Please select a valid certificate file (PDF, JPEG, or PNG)';
    }
    if (file.size > 10 * 1024 * 1024) {
      return 'Certificate size should be less than 10MB';
    }
    return null;
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const error = validateProfileImage(file);
      if (error) {
        toast.error(error);
        return;
      }
      
      setProfileImage(file);
      setPreviewImage(URL.createObjectURL(file));
    }
  };

  const handleCertificateChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const error = validateCertificate(file);
      if (error) {
        toast.error(error);
        return;
      }
      
      setCertificatePreview(file.name);
    }
  };

  const handleRemoveImage = () => {
    setProfileImage(null);
    setPreviewImage(user.profile_image || null);
  };

  const handleRemoveCertificate = () => {
    setCertificatePreview(user.doctor_profile?.certificate || null);
  };

  const handleSubmit = async (values, { setSubmitting, setFieldError }) => {
    try {
      setLoading(true);
      
      if (profileImage) {
        const imageError = validateProfileImage(profileImage);
        if (imageError) {
          toast.error(imageError);
          setSubmitting(false);
          setLoading(false);
          return;
        }
      }
      
      const formDataToSend = new FormData();
      
      Object.keys(values).forEach(key => {
        if (values[key] !== null && values[key] !== undefined && values[key] !== '') {
          formDataToSend.append(key, values[key]);
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
        setCertificatePreview(response.data.doctor_profile?.certificate || null);
      }
    } catch (err) {
      console.error('Error updating profile:', err);
      
      if (err.response?.data && typeof err.response.data === 'object') {
        Object.keys(err.response.data).forEach(field => {
          if (err.response.data[field]) {
            setFieldError(field, err.response.data[field][0] || err.response.data[field]);
          }
        });
      } else {
        toast.error(`Failed to update profile: ${err.response?.data?.detail || err.message}`);
      }
    } finally {
      setLoading(false);
      setSubmitting(false);
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
    } else if (tab === 'Availability'){
      navigate('/doctor/slots');
    }
    else {
      setActiveTab(tab);
      setMobileSidebarOpen(false);
    }
  };

  const handleLogout = async () => {
        try{
          const refreshToken = localStorage.getItem('refreshToken');
          if (refreshToken) {
            await doctorAxios.post('/logout/', {
              refresh: refreshToken
            });
          }
          dispatch(logout());
          localStorage.removeItem('token');
          localStorage.removeItem('refreshToken');
          navigate('/doctor-login');
        } catch (error) {
          console.error('Logout error:', error);
    
          dispatch(logout());
          localStorage.removeItem('token');
          localStorage.removeItem('refreshToken');
          navigate('/doctor-login')
        }
      }

  const toggleEditMode = () => {
    setIsEditing(!isEditing);
    
    if (isEditing) {
      if (previewImage && previewImage.startsWith('blob:')) {
        URL.revokeObjectURL(previewImage);
      }
      setProfileImage(null);
      setPreviewImage(user.profile_image || null);
      setCertificatePreview(user.doctor_profile?.certificate || null);
    }
  };

  const getProfileImageUrl = () => {
    if (previewImage) return previewImage;
    if (user?.profile_image) return user.profile_image;
    return `https://ui-avatars.com/api/?name=Dr+${user?.username?.split(' ').join('+') || 'D'}&background=random&color=fff&size=128`;
  };

  if (!user) {
    return (
      <div className="min-h-screen flex justify-center items-center bg-gradient-to-br from-slate-900 to-slate-800">
        <div className="text-center bg-white rounded-2xl p-8 shadow-2xl">
          <p className="mb-4 text-gray-700">Please log in to view your profile</p>
          <button
            onClick={() => navigate('/login')}
            className="bg-emerald-500 hover:bg-emerald-600 text-white px-6 py-3 rounded-xl font-medium transition-all duration-200 shadow-lg hover:shadow-xl"
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
        theme="light"
        className="mt-20"
      />
      
      {showSuccess && (
        <div className="fixed top-4 right-4 z-50 bg-emerald-500 text-white px-6 py-4 rounded-xl shadow-lg flex items-center space-x-3">
          <CheckCircle className="h-5 w-5" />
          <span className="font-medium">{successMessage}</span>
        </div>
      )}
      
      {/* Modern Header */}
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
                <span className="text-xs text-emerald-600 font-medium bg-emerald-100 px-2 py-0.5 rounded-full">PROFESSIONAL</span>
              </div>
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
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
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex flex-1 overflow-hidden">
        {/* Mobile Sidebar Backdrop */}
        {mobileSidebarOpen && (
          <div 
            className="fixed inset-0 bg-black/50 z-30 lg:hidden"
            onClick={() => setMobileSidebarOpen(false)}
          />
        )}

        {/* Modern Dark Sidebar */}
        <aside className={`fixed lg:static z-40 w-72 h-full bg-slate-800 transform transition-transform duration-300 ease-in-out ${
          mobileSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}>
          <div className="h-full flex flex-col">
            {/* Profile Summary */}
            <div className="p-6 border-b border-slate-700">
              <div className="flex items-center space-x-4">
                <div className="relative">
                  <img 
                    src={getProfileImageUrl()} 
                    alt={user.username} 
                    className="w-14 h-14 rounded-xl object-cover border-2 border-emerald-400"
                  />
                  <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-emerald-500 rounded-full border-2 border-slate-800"></div>
                </div>
                <div>
                  <h3 className="font-semibold text-white text-lg">Dr. {user.username}</h3>
                  <p className="text-slate-400 text-sm">{user.email}</p>
                  <div className="flex items-center mt-1">
                    <div className="w-2 h-2 bg-emerald-400 rounded-full mr-2"></div>
                    <span className="text-emerald-400 text-xs font-medium">Online</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Navigation */}
            <nav className="flex-1 overflow-y-auto p-4">
              <ul className="space-y-2">
                {sidebarItems.map((item) => {
                  const IconComponent = item.icon;
                  return (
                    <li key={item.name}>
                      <button
                        onClick={() => handleTabClick(item.name)}
                        className={`w-full flex items-center px-4 py-3 rounded-xl text-left transition-all duration-200 group ${
                          activeTab === item.name 
                            ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/25' 
                            : 'text-slate-300 hover:bg-slate-700 hover:text-white'
                        }`}
                      >
                        <div className={`flex items-center justify-center w-10 h-10 rounded-lg mr-3 ${
                          activeTab === item.name ? 'bg-white/20' : item.bgColor
                        }`}>
                          <IconComponent className={`w-5 h-5 ${
                            activeTab === item.name ? 'text-white' : item.color
                          }`} />
                        </div>
                        <span className="font-medium">{item.name}</span>
                        {activeTab === item.name && (
                          <ChevronRight className="w-4 h-4 ml-auto" />
                        )}
                      </button>
                    </li>
                  );
                })}
              </ul>
            </nav>
          </div>
        </aside>

        {/* Main Content Area */}
        <main className="flex-1 overflow-y-auto bg-gray-50">
          <div className="max-w-6xl mx-auto px-6 py-8">
            {/* Welcome Banner */}
            <div className="bg-gradient-to-r from-emerald-500 to-teal-600 rounded-2xl p-8 mb-8 text-white">
              <div className="flex flex-col lg:flex-row items-center justify-between">
                <div className="flex items-center mb-4 lg:mb-0">
                  <div className="relative mr-6">
                    <img 
                      src={getProfileImageUrl()} 
                      alt={user.username} 
                      className="w-20 h-20 rounded-2xl object-cover border-4 border-white/20"
                    />
                    {isEditing && (
                      <label className="absolute bottom-0 right-0 bg-white text-emerald-600 p-2 rounded-full cursor-pointer shadow-lg hover:shadow-xl transition-all duration-200">
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
                    <h2 className="text-3xl font-bold mb-2">Dr. {user.username}</h2>
                    <p className="text-emerald-100 text-lg">{user?.doctor_profile?.specialization || 'Medical Professional'}</p>
                    <div className="flex items-center mt-2 space-x-4 text-emerald-100">
                      {user.doctor_profile?.hospital && (
                        <div className="flex items-center">
                          <Building2 className="w-4 h-4 mr-1" />
                          <span className="text-sm">{user.doctor_profile.hospital}</span>
                        </div>
                      )}
                      {user.doctor_profile?.experience && (
                        <div className="flex items-center">
                          <Award className="w-4 h-4 mr-1" />
                          <span className="text-sm">{user.doctor_profile.experience} years</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
                <div className="flex space-x-3">
                  {!isEditing ? (
                    <button
                      onClick={toggleEditMode}
                      className="bg-white/20 backdrop-blur-sm hover:bg-white/30 text-white px-6 py-3 rounded-xl font-medium flex items-center space-x-2 transition-all duration-200 border border-white/30"
                    >
                      <Edit3 size={18} />
                      <span>Edit Profile</span>
                    </button>
                  ) : (
                    <button
                      onClick={toggleEditMode}
                      className="bg-white/20 backdrop-blur-sm hover:bg-white/30 text-white px-6 py-3 rounded-xl font-medium flex items-center space-x-2 transition-all duration-200 border border-white/30"
                    >
                      <X size={18} />
                      <span>Cancel</span>
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* Profile Form */}
            <div className="bg-white rounded-2xl shadow-sm overflow-hidden border border-gray-200">
              {loading && (
                <div className="absolute inset-0 bg-white/80 backdrop-blur-sm flex items-center justify-center z-50 rounded-2xl">
                  <div className="flex flex-col items-center">
                    <div className="w-12 h-12 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mb-4"></div>
                    <div className="text-emerald-600 font-medium">Saving changes...</div>
                  </div>
                </div>
              )}

              <Formik
                initialValues={initialValues}
                validationSchema={validationSchema}
                onSubmit={handleSubmit}
                enableReinitialize={true}
              >
                {({ values, errors, touched, isSubmitting, setFieldValue }) => (
                  <Form>
                    {/* Basic Information */}
                    <div className="p-8 border-b border-gray-100">
                      <div className="flex items-center mb-6">
                        <div className="w-12 h-12 bg-emerald-100 rounded-xl flex items-center justify-center mr-4">
                          <User className="w-6 h-6 text-emerald-600" />
                        </div>
                        <div>
                          <h3 className="text-xl font-bold text-gray-900">Basic Information</h3>
                          <p className="text-gray-500">Manage your personal details</p>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <div>
                          <label className="block text-sm font-semibold text-gray-700 mb-2">Username</label>
                          <div className="relative">
                            <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                            <Field
                              name="username"
                              type="text"
                              disabled={!isEditing}
                              className={`w-full pl-12 pr-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all duration-200 ${
                                errors.username && touched.username ? 'border-red-500 bg-red-50' : 'border-gray-300'
                              } ${!isEditing ? 'bg-gray-50 text-gray-500' : 'bg-white'}`}
                            />
                          </div>
                          <ErrorMessage name="username" component="p" className="mt-2 text-sm text-red-600" />
                        </div>

                        <div>
                          <label className="block text-sm font-semibold text-gray-700 mb-2">Email Address</label>
                          <div className="relative">
                            <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                            <Field
                              name="email"
                              type="email"
                              disabled={!isEditing}
                              className={`w-full pl-12 pr-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all duration-200 ${
                                errors.email && touched.email ? 'border-red-500 bg-red-50' : 'border-gray-300'
                              } ${!isEditing ? 'bg-gray-50 text-gray-500' : 'bg-white'}`}
                            />
                          </div>
                          <ErrorMessage name="email" component="p" className="mt-2 text-sm text-red-600" />
                        </div>

                        <div>
                          <label className="block text-sm font-semibold text-gray-700 mb-2">Phone Number</label>
                          <div className="relative">
                            <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                            <Field
                              name="phone"
                              type="tel"
                              disabled={!isEditing}
                              className={`w-full pl-12 pr-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all duration-200 ${
                                errors.phone && touched.phone ? 'border-red-500 bg-red-50' : 'border-gray-300'
                              } ${!isEditing ? 'bg-gray-50 text-gray-500' : 'bg-white'}`}
                            />
                          </div>
                          <ErrorMessage name="phone" component="p" className="mt-2 text-sm text-red-600" />
                        </div>
                      </div>
                    </div>
                    <div className="p-8 border-b border-gray-100">
                      <div className="flex items-center mb-6">
                        <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center mr-4">
                                                   <Stethoscope className="w-6 h-6 text-blue-600" />
                        </div>
                        <div>
                          <h3 className="text-xl font-bold text-gray-900">Professional Information</h3>
                          <p className="text-gray-500">Your medical practice details</p>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <div>
                          <label className="block text-sm font-semibold text-gray-700 mb-2">Hospital/Clinic</label>
                          <div className="relative">
                            <Building2 className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                            <Field
                              name="hospital"
                              type="text"
                              disabled={!isEditing}
                              className={`w-full pl-12 pr-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all duration-200 ${
                                errors.hospital && touched.hospital ? 'border-red-500 bg-red-50' : 'border-gray-300'
                              } ${!isEditing ? 'bg-gray-50 text-gray-500' : 'bg-white'}`}
                            />
                          </div>
                          <ErrorMessage name="hospital" component="p" className="mt-2 text-sm text-red-600" />
                        </div>

                        <div>
                          <label className="block text-sm font-semibold text-gray-700 mb-2">Languages</label>
                          <div className="relative">
                            <Languages className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                            {isEditing ? (
                              <Field
                                name="languages"
                                as="select"
                                className={`w-full pl-12 pr-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent appearance-none ${
                                  errors.languages && touched.languages ? 'border-red-500 bg-red-50' : 'border-gray-300'
                                }`}
                              >
                                {languageOptions.map(lang => (
                                  <option key={lang} value={lang}>{lang}</option>
                                ))}
                              </Field>
                            ) : (
                              <div className="px-4 py-3 bg-gray-50 rounded-xl text-gray-500 pl-12">
                                {values.languages || 'Not specified'}
                              </div>
                            )}
                          </div>
                          <ErrorMessage name="languages" component="p" className="mt-2 text-sm text-red-600" />
                        </div>

                        <div>
                          <label className="block text-sm font-semibold text-gray-700 mb-2">Experience (years)</label>
                          <div className="relative">
                            <Clock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                            <Field
                              name="experience"
                              type="number"
                              disabled={!isEditing}
                              min="0"
                              max="60"
                              className={`w-full pl-12 pr-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all duration-200 ${
                                errors.experience && touched.experience ? 'border-red-500 bg-red-50' : 'border-gray-300'
                              } ${!isEditing ? 'bg-gray-50 text-gray-500' : 'bg-white'}`}
                            />
                          </div>
                          <ErrorMessage name="experience" component="p" className="mt-2 text-sm text-red-600" />
                        </div>
                      </div>
                    </div>

                    {/* Personal Information */}
                    <div className="p-8 border-b border-gray-100">
                      <div className="flex items-center mb-6">
                        <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center mr-4">
                          <Users className="w-6 h-6 text-purple-600" />
                        </div>
                        <div>
                          <h3 className="text-xl font-bold text-gray-900">Personal Information</h3>
                          <p className="text-gray-500">Your personal details</p>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <div>
                          <label className="block text-sm font-semibold text-gray-700 mb-2">Age</label>
                          <div className="relative">
                            <Field
                              name="age"
                              type="number"
                              disabled={!isEditing}
                              min="21"
                              max="80"
                              className={`w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all duration-200 ${
                                errors.age && touched.age ? 'border-red-500 bg-red-50' : 'border-gray-300'
                              } ${!isEditing ? 'bg-gray-50 text-gray-500' : 'bg-white'}`}
                            />
                          </div>
                          <ErrorMessage name="age" component="p" className="mt-2 text-sm text-red-600" />
                        </div>

                        <div>
                          <label className="block text-sm font-semibold text-gray-700 mb-2">Gender</label>
                          <div className="relative">
                            {isEditing ? (
                              <Field
                                name="gender"
                                as="select"
                                className={`w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent appearance-none ${
                                  errors.gender && touched.gender ? 'border-red-500 bg-red-50' : 'border-gray-300'
                                }`}
                              >
                                {genderOptions.map(option => (
                                  <option key={option.value} value={option.value}>{option.label}</option>
                                ))}
                              </Field>
                            ) : (
                              <div className="px-4 py-3 bg-gray-50 rounded-xl text-gray-500 capitalize">
                                {values.gender || 'Not specified'}
                              </div>
                            )}
                          </div>
                          <ErrorMessage name="gender" component="p" className="mt-2 text-sm text-red-600" />
                        </div>
                      </div>
                    </div>

                    {/* Registration Information */}
                    <div className="p-8 border-b border-gray-100">
                      <div className="flex items-center mb-6">
                        <div className="w-12 h-12 bg-amber-100 rounded-xl flex items-center justify-center mr-4">
                          <Shield className="w-6 h-6 text-amber-600" />
                        </div>
                        <div>
                          <h3 className="text-xl font-bold text-gray-900">Registration Information</h3>
                          <p className="text-gray-500">Your professional credentials</p>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        <div>
                          <label className="block text-sm font-semibold text-gray-700 mb-2">Registration ID</label>
                          <div className="px-4 py-3 bg-gray-50 rounded-xl text-gray-700">
                            {user.doctor_profile?.registration_id || 'Not available'}
                          </div>
                        </div>

                        <div>
                          <label className="block text-sm font-semibold text-gray-700 mb-2">Verification Status</label>
                          <div className="px-4 py-3 rounded-xl">
                            {user.is_verified ? (
                              <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800">
                                Verified
                              </span>
                            ) : (
                              <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-amber-100 text-amber-800">
                                Pending Verification
                              </span>
                            )}
                          </div>
                        </div>

                        <div>
                          <label className="block text-sm font-semibold text-gray-700 mb-2">Approval Status</label>
                          <div className="px-4 py-3 rounded-xl">
                            {user.doctor_profile?.is_approved === true ? (
                              <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800">
                                Approved
                              </span>
                            ) : user.doctor_profile?.is_approved === false ? (
                              <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-red-100 text-red-800">
                                Rejected
                              </span>
                            ) : (
                              <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-amber-100 text-amber-800">
                                Pending Approval
                              </span>
                            )}
                          </div>
                        </div>

                        <div className="lg:col-span-3">
                          <label className="block text-sm font-semibold text-gray-700 mb-2">Specialization</label>
                          <div className="px-4 py-3 bg-gray-50 rounded-xl text-gray-700">
                            {user?.doctor_profile?.specialization || 'Not specified'}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Certificate Upload */}
                    <div className="p-8">
                      <div className="flex items-center mb-6">
                        <div className="w-12 h-12 bg-indigo-100 rounded-xl flex items-center justify-center mr-4">
                          <FileText className="w-6 h-6 text-indigo-600" />
                        </div>
                        <div>
                          <h3 className="text-xl font-bold text-gray-900">Medical Certificate</h3>
                          <p className="text-gray-500">Upload your professional license</p>
                        </div>
                      </div>
                      
                      <div className="space-y-4">
                        {certificatePreview && (
                          <div className="flex items-center space-x-4 bg-gray-50 p-4 rounded-xl border border-gray-200">
                            <div className="flex items-center justify-center w-14 h-14 rounded-lg bg-indigo-50 text-indigo-600">
                              <FileText size={28} />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium text-gray-900 truncate">
                                {typeof certificatePreview === 'string' 
                                  ? certificatePreview.split('/').pop() 
                                  : certificatePreview.name}
                              </p>
                              <p className="text-sm text-gray-500">Medical License/Certificate</p>
                            </div>
                            {isEditing && (
                              <button
                                type="button"
                                onClick={handleRemoveCertificate}
                                className="text-red-500 hover:text-red-700 p-2 rounded-full hover:bg-red-50 transition-colors"
                              >
                                <X size={20} />
                              </button>
                            )}
                          </div>
                        )}

                        {isEditing && (
                          <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-3">
                              {certificatePreview ? 'Replace Certificate' : 'Upload Certificate'}
                            </label>
                            <div className="mt-1 flex flex-col sm:flex-row items-start sm:items-center space-y-3 sm:space-y-0 sm:space-x-4">
                              <label className="cursor-pointer bg-white py-3 px-6 border border-gray-300 rounded-xl shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 transition-all duration-200 flex items-center">
                                <span>Choose File</span>
                                <input
                                  type="file"
                                  accept=".pdf,.jpg,.jpeg,.png"
                                  onChange={handleCertificateChange}
                                  className="hidden"
                                />
                              </label>
                              <span className="text-sm text-gray-500">
                                {certificatePreview && typeof certificatePreview === 'object' 
                                  ? certificatePreview.name 
                                  : 'PDF, JPG, or PNG (max 10MB)'}
                              </span>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>

                    {isEditing && (
                      <div className="p-6 bg-gray-50 border-t border-gray-200 flex justify-end space-x-4 rounded-b-2xl">
                        <button
                          type="button"
                          onClick={toggleEditMode}
                          className="bg-gray-200 hover:bg-gray-300 text-gray-800 px-6 py-3 rounded-xl font-medium flex items-center space-x-2 transition-all duration-200"
                        >
                          <X size={18} />
                          <span>Cancel</span>
                        </button>
                        <button
                          type="submit"
                          disabled={isSubmitting}
                          className={`bg-emerald-600 hover:bg-emerald-700 text-white px-8 py-3 rounded-xl font-medium flex items-center space-x-2 transition-all duration-200 ${
                            isSubmitting ? 'opacity-70 cursor-not-allowed' : ''
                          }`}
                        >
                          {isSubmitting ? (
                            <>
                              <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                              </svg>
                              <span>Saving...</span>
                            </>
                          ) : (
                            <>
                              <Save size={18} />
                              <span>Save Changes</span>
                            </>
                          )}
                        </button>
                      </div>
                    )}
                  </Form>
                )}
              </Formik>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default Settings;