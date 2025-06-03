import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import { doctorAxios } from '../../axios/DoctorAxios';
import { ToastContainer, toast } from 'react-toastify';
import { useLocation, useNavigate } from 'react-router-dom';
import { Camera, Save, X, ChevronDown, ChevronRight, CheckCircle, FileText } from 'lucide-react';
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
      
      // Note: Certificate is handled separately from Formik since it's a file
      // You might want to add a separate state or handle it differently
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
      
      // Validate files separately
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
      
      // Append form values
      Object.keys(values).forEach(key => {
        if (values[key] !== null && values[key] !== undefined && values[key] !== '') {
          formDataToSend.append(key, values[key]);
        }
      });
      
      // Append files
      if (profileImage) {
        formDataToSend.append('profile_image', profileImage);
      }

      // Handle certificate if changed
      // You'll need to implement certificate handling based on your requirements
      
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
      
      // Handle validation errors from backend
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
    } else {
      setActiveTab(tab);
      setMobileSidebarOpen(false);
    }
  };

  const handleLogout = async () => {
    try{
      const refreshToken = localStorage.getItem('refreshToken');
      console.log('Refresh token: ', refreshToken);
      await doctorAxios.post('/doctor-logout/', {
        refresh_token: refreshToken
      });
      dispatch(logout());
      navigate('/doctor-login/');
    } catch (error) {
      console.error('Logout error: ', error);
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

  const profileImageUrl = previewImage || (user?.profile_image || "/api/placeholder/80/80");
  const getProfileImageUrl = () => {
  if (previewImage) return previewImage;
  if (user?.profile_image) return user.profile_image;
  return `https://ui-avatars.com/api/?name=Dr+${user?.username?.split(' ').join('+') || 'D'}&background=random&color=fff&size=128`;
};
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
  {user?.profile_image ? (
    <img 
      src={user.profile_image} 
      alt={user.username} 
      className="h-8 w-8 rounded-full object-cover"
    />
  ) : (
    <div className="h-8 w-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
      <span className="text-xs font-medium text-white">
        {user?.username?.charAt(0).toUpperCase() || 'D'}
      </span>
    </div>
  )}
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
  {user?.profile_image ? (
    <img 
      src={user.profile_image} 
      alt={user.username} 
      className="w-12 h-12 rounded-full object-cover border-2 border-blue-100"
    />
  ) : (
    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center border-2 border-blue-100">
      <span className="text-lg font-bold text-white">
        {user?.username?.charAt(0).toUpperCase() || 'D'}
      </span>
    </div>
  )}
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
                    {user?.profile_image || previewImage ? (
    <img 
      src={getProfileImageUrl()} 
      alt={user.username} 
      className="w-16 h-16 rounded-full object-cover border-2 border-blue-100"
    />
  ) : (
    <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center border-2 border-blue-100">
      <span className="text-2xl font-bold text-white">
        {user?.username?.charAt(0).toUpperCase() || 'D'}
      </span>
    </div>
  )}
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
                  {!isEditing && (
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

            {/* Profile Form with Formik */}
            <div className="bg-white rounded-xl shadow-sm overflow-hidden">
              {loading && (
                <div className="absolute inset-0 bg-white bg-opacity-70 flex items-center justify-center z-10">
                  <div className="flex flex-col items-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mb-3"></div>
                    <div className="text-blue-600">Saving changes...</div>
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
                  <Form className="divide-y-gray-200">
                    {/* Basic Information */}
                    <div className="p-6">
                      <h3 className="text-lg font-semibold text-gray-900 mb-4">Basic Information</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Username</label>
                          <Field
                            name="username"
                            type="text"
                            disabled={!isEditing}
                            className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                              errors.username && touched.username ? 'border-red-500' : 'border-gray-300'
                            } ${!isEditing ? 'bg-gray-100 text-gray-500' : ''}`}
                          />
                          <ErrorMessage name="username" component="p" className="mt-1 text-sm text-red-600" />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
                          <Field
                            name="email"
                            type="email"
                            disabled={!isEditing}
                            className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                              errors.email && touched.email ? 'border-red-500' : 'border-gray-300'
                            } ${!isEditing ? 'bg-gray-100 text-gray-500' : ''}`}
                          />
                          <ErrorMessage name="email" component="p" className="mt-1 text-sm text-red-600" />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
                          <Field
                            name="phone"
                            type="tel"
                            disabled={!isEditing}
                            className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                              errors.phone && touched.phone ? 'border-red-500' : 'border-gray-300'
                            } ${!isEditing ? 'bg-gray-100 text-gray-500' : ''}`}
                          />
                          <ErrorMessage name="phone" component="p" className="mt-1 text-sm text-red-600" />
                        </div>
                      </div>
                    </div>

                    {/* Professional Information */}
                    <div className="p-6">
                      <h3 className="text-lg font-semibold text-gray-900 mb-4">Professional Information</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Hospital/Clinic</label>
                          <Field
                            name="hospital"
                            type="text"
                            disabled={!isEditing}
                            className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                              errors.hospital && touched.hospital ? 'border-red-500' : 'border-gray-300'
                            } ${!isEditing ? 'bg-gray-100 text-gray-500' : ''}`}
                          />
                          <ErrorMessage name="hospital" component="p" className="mt-1 text-sm text-red-600" />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Languages</label>
                          {isEditing ? (
                            <Field
                              name="languages"
                              as="select"
                              className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                                errors.languages && touched.languages ? 'border-red-500' : 'border-gray-300'
                              }`}
                            >
                              {languageOptions.map(lang => (
                                <option key={lang} value={lang}>{lang}</option>
                              ))}
                            </Field>
                          ) : (
                            <div className="px-3 py-2 bg-gray-100 rounded-lg text-gray-700">
                              {values.languages || 'Not specified'}
                            </div>
                          )}
                          <ErrorMessage name="languages" component="p" className="mt-1 text-sm text-red-600" />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Experience (years)</label>
                          <Field
                            name="experience"
                            type="number"
                            disabled={!isEditing}
                            min="0"
                            max="60"
                            className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                              errors.experience && touched.experience ? 'border-red-500' : 'border-gray-300'
                            } ${!isEditing ? 'bg-gray-100 text-gray-500' : ''}`}
                          />
                          <ErrorMessage name="experience" component="p" className="mt-1 text-sm text-red-600" />
                        </div>
                      </div>
                    </div>

                    {/* Personal Information */}
                    <div className="p-6">
                      <h3 className="text-lg font-semibold text-gray-900 mb-4">Personal Information</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Age</label>
                          <Field
                            name="age"
                            type="number"
                            disabled={!isEditing}
                            min="21"
                            max="80"
                            className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                              errors.age && touched.age ? 'border-red-500' : 'border-gray-300'
                            } ${!isEditing ? 'bg-gray-100 text-gray-500' : ''}`}
                          />
                          <ErrorMessage name="age" component="p" className="mt-1 text-sm text-red-600" />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Gender</label>
                          {isEditing ? (
                            <Field
                              name="gender"
                              as="select"
                              className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                                errors.gender && touched.gender ? 'border-red-500' : 'border-gray-300'
                              }`}
                            >
                              {genderOptions.map(option => (
                                <option key={option.value} value={option.value}>{option.label}</option>
                              ))}
                            </Field>
                          ) : (
                            <div className="px-3 py-2 bg-gray-100 rounded-lg text-gray-700 capitalize">
                              {values.gender || 'Not specified'}
                            </div>
                          )}
                          <ErrorMessage name="gender" component="p" className="mt-1 text-sm text-red-600" />
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

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Approval Status</label>
                          <div className="px-3 py-2 rounded-lg">
                            {user.doctor_profile?.is_approved === true ? (
                              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                Approved
                              </span>
                            ) : user.doctor_profile?.is_approved === false ? (
                              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                                Rejected
                              </span>
                            ) : (
                              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                                Pending Approval
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="mb-4">
                      <label className="block text-sm font-medium text-gray-700 mb-1">Specialization</label>
                      <div className="px-3 py-2 bg-gray-100 rounded-lg text-gray-700">
                        {user?.doctor_profile?.specialization || 'Not specified'}
                      </div>
                    </div>

                    {/* Certificate Upload */}
                    <div className="p-6">
                      <h3 className="text-lg font-semibold text-gray-900 mb-4">Medical Certificate</h3>
                      <div className="space-y-4">
                        {certificatePreview && (
                          <div className="flex items-center space-x-4">
                            <div className="flex items-center justify-center w-12 h-12 rounded-lg bg-blue-50 text-blue-600">
                              <FileText size={24} />
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
                                className="text-red-600 hover:text-red-800"
                              >
                                <X size={20} />
                              </button>
                            )}
                          </div>
                        )}

                        {isEditing && (
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              {certificatePreview ? 'Replace Certificate' : 'Upload Certificate'}
                            </label>
                            <div className="mt-1 flex items-center">
                              <label className="cursor-pointer bg-white py-2 px-3 border border-gray-300 rounded-md shadow-sm text-sm leading-4 font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
                                <span>Choose File</span>
                                <input
                                  type="file"
                                  accept=".pdf,.jpg,.jpeg,.png"
                                  onChange={handleCertificateChange}
                                  className="hidden"
                                />
                              </label>
                              <span className="ml-2 text-sm text-gray-500">
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
                      <div className="p-6 bg-gray-50 flex justify-end space-x-3">
                        <button
                          type="button"
                          onClick={toggleEditMode}
                          className="bg-gray-200 hover:bg-gray-300 text-gray-800 px-4 py-2 rounded-lg font-medium text-sm flex items-center space-x-1 transition"
                        >
                          <X size={16} />
                          <span>Cancel</span>
                        </button>
                        <button
                          type="submit"
                          disabled={isSubmitting || !isEditing}
                          className={`bg-blue-600 text-white px-6 py-2 rounded-lg font-medium flex items-center space-x-2 transition ${
                            isSubmitting ? 'opacity-70 cursor-not-allowed' : 'hover:bg-blue-700'
                          }`}
                        >
                          {isSubmitting ? (
                            <>
                              <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
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