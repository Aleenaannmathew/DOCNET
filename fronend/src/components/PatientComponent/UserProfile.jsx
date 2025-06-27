import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useLocation, useNavigate } from 'react-router-dom';
import { Formik, Form, Field, ErrorMessage, prepareDataForValidation } from 'formik';
import * as Yup from 'yup';
import { logout, updateUser } from '../../store/authSlice';
import { userAxios } from '../../axios/UserAxios';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Navbar from './Navbar';
import Footer from './Footer';
import DocnetLoading from '../Constants/Loading';
import { 
  CheckCircle, 
  User, 
  Mail, 
  Phone, 
  Calendar, 
  Heart, 
  Shield, 
  FileText, 
  AlertCircle,
  Camera,
  Edit,
  Save,
  X,
  Lock,
  History,
  Bell,
  HelpCircle,
  LogOut,
  Sidebar
} from 'lucide-react';
import PatientSidebar from './SideBar';

const validationSchema = Yup.object({
  username: Yup.string()
    .trim()
    .required('Username is required')
    .min(3, 'Username must be at least 3 characters')
    .max(50, 'Username must not exceed 50 characters'),
  
  email: Yup.string()
    .trim()
    .required('Email is required')
    .email('Please enter a valid email address'),
  
  phone: Yup.string()
    .matches(/^[0-9+\-\s()]{7,15}$/, 'Please enter a valid phone number')
    .nullable(),
  
  age: Yup.number()
    .positive('Age must be a positive number')
    .integer('Age must be a whole number')
    .min(0, 'Age cannot be negative')
    .max(120, 'Please enter a valid age between 0 and 120')
    .nullable()
    .transform((value, originalValue) => originalValue === '' ? null : value),
  
  height: Yup.number()
    .positive('Height must be a positive number')
    .max(300, 'Please enter a valid height (up to 300 cm)')
    .nullable()
    .transform((value, originalValue) => originalValue === '' ? null : value),
  
  weight: Yup.number()
    .positive('Weight must be a positive number')
    .max(500, 'Please enter a valid weight (up to 500 kg)')
    .nullable()
    .transform((value, originalValue) => originalValue === '' ? null : value),
  
  emergency_contact: Yup.string()
    .matches(/^[0-9+\-\s()]{7,15}$/, 'Please enter a valid emergency contact number')
    .nullable(),
  
  emergency_contact_name: Yup.string()
    .max(100, 'Contact name must not exceed 100 characters')
    .nullable(),
  
  blood_group: Yup.string()
    .oneOf(['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-', ''], 'Please select a valid blood group')
    .nullable(),
  
  allergies: Yup.string()
    .max(500, 'Allergies description must not exceed 500 characters')
    .nullable(),
  
  chronic_conditions: Yup.string()
    .max(500, 'Chronic conditions description must not exceed 500 characters')
    .nullable()
});

const fileValidationSchema = Yup.object({
  profile_image: Yup.mixed()
    .nullable()
    .test('fileSize', 'Image size should be less than 5MB', (value) => {
      if (!value) return true;
      return value.size <= 5 * 1024 * 1024;
    })
    .test('fileType', 'Please select a valid image file (JPEG, PNG, or GIF)', (value) => {
      if (!value) return true;
      const allowedTypes = ['image/jpeg', 'image/png', 'image/gif'];
      return allowedTypes.includes(value.type);
    })
});

const UserProfile = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const { user, token } = useSelector(state => state.auth);
  
  const [showSuccess, setShowSuccess] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [activeTab, setActiveTab] = useState('Profile Information');
  const [isEditing, setIsEditing] = useState(false);
  const [profileImage, setProfileImage] = useState(null);
  const [previewImage, setPreviewImage] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showSuccessLoader, setShowSuccessLoader] = useState(false);
  const [profileFetched, setProfileFetched] = useState(false);
  const [imageError, setImageError] = useState('');


  const bloodGroups = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

  const getInitialValues = () => ({
    username: user?.username || '',
    email: user?.email || '',
    phone: user?.phone || '',
    age: user?.age || '',
    blood_group: user?.blood_group || '',
    height: user?.height || '',
    weight: user?.weight || '',
    allergies: user?.allergies || '',
    chronic_conditions: user?.chronic_conditions || '',
    emergency_contact: user?.emergency_contact || '',
    emergency_contact_name: user?.emergency_contact_name || ''
  });

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

  useEffect(() => {
    if (user && token && !profileFetched && !loading) {
      fetchUserDetails();
    }
  }, [user, token, profileFetched, loading]);

  const fetchUserDetails = async () => {
    try {
      setLoading(true);
      
      console.log("using token: ", token);
      console.log("Token type: ", typeof token);
      
      const authToken = token.startsWith('Bearer ') ? token : `Bearer ${token}`;
      
      try {
        const response = await userAxios.get('user-profile/', {
          headers: { Authorization: authToken }
        });
      
        console.log("Profile data received:", response.data);
        
        if (response.data) {
          dispatch(updateUser(response.data));
        }
       
        setProfileFetched(true);
        setLoading(false);
      } catch (apiError) {
        try {
          console.log("First attempt failed, trying without trailing slash");
          const altResponse = await userAxios.get('user-profile', {
            headers: { Authorization: authToken }
          });
          
          console.log("Profile data received from alt URL:", altResponse.data);
          
          if (altResponse.data) {
            dispatch(updateUser(altResponse.data));
          }
          
          setProfileFetched(true);
          setLoading(false);
        } catch (altError) {
          throw altError;
        }
      }
    } catch (err) {
      console.error('Error fetching user details:', err);
      toast.error(`Failed to load profile data: ${err.response?.data?.detail || err.message}`);
      setLoading(false);
      setProfileFetched(true);
    
      if (err.response) {
        console.log('Error Response Data:', err.response.data);
        console.log('Error Response Status:', err.response.status);
        console.log('Error Response Headers:', err.response.headers);
      }
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    setImageError('');
    
    if (file) {
      fileValidationSchema.validate({ profile_image: file })
        .then(() => {
          setProfileImage(file);
          setPreviewImage(URL.createObjectURL(file));
        })
        .catch((error) => {
          setImageError(error.message);
          e.target.value = ''; 
        });
    }
  };

  const handleSubmit = async (values, { setSubmitting, setFieldError }) => {
    try {
      setLoading(true);
      
      const profileFormData = new FormData();
      
      Object.keys(values).forEach(key => {
        if (values[key] !== null && values[key] !== undefined && values[key] !== '') {
          profileFormData.append(key, values[key]);
        }
      });
      
      if (profileImage) {
        profileFormData.append('profile_image', profileImage);
      }
      
      // Debug: Log form data
      for (let pair of profileFormData.entries()) {
        console.log(pair[0] + ': ' + pair[1]);
      }
      
      const response = await userAxios.put('user-profile/update/', profileFormData, {
        headers: { 
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data'
        }
      });
      
      console.log("Update response:", response.data);
      
      if (response.data) {
        dispatch(updateUser(response.data));
        
        setShowSuccessLoader(true);
        toast.success('Profile updated successfully!');
   
        if (previewImage) {
          URL.revokeObjectURL(previewImage);
          setPreviewImage(null);
        }
        setProfileImage(null);
        setImageError('');
        
        setTimeout(() => {
          setShowSuccessLoader(false);
          setIsEditing(false);
        }, 2000);
      }
      
      setLoading(false);
    } catch (err) {
      console.error('Error updating profile:', err);
      
      if (err.response && err.response.data) {
        const serverErrors = err.response.data;
        
        if (typeof serverErrors === 'object') {
          Object.keys(serverErrors).forEach(key => {
            if (serverErrors[key]) {
              const errorMsg = Array.isArray(serverErrors[key]) 
                ? serverErrors[key][0] 
                : serverErrors[key];
              setFieldError(key, errorMsg);
            }
          });
        }
      }
      
      toast.error(`Failed to update profile: ${err.response?.data?.detail || err.message}`);
      setLoading(false);
    } finally {
      setSubmitting(false);
    }
  };


  const toggleEditMode = () => {
    setIsEditing(!isEditing);
    
    if (isEditing) {
      if (previewImage) {
        URL.revokeObjectURL(previewImage);
        setPreviewImage(null);
      }
      setProfileImage(null);
      setImageError('');
    }
  };

  const getProfileImageUrl = () => {
    if (previewImage) return previewImage;
    if (user?.profile_image) return user.profile_image;
    return `https://ui-avatars.com/api/?name=${user?.username?.charAt(0) || 'U'}&background=random&color=fff&size=128`;
  };

  if (!user) {
    return (
      <div className="min-h-screen flex justify-center items-center bg-gradient-to-br from-blue-50 to-purple-50">
        <div className="bg-white p-8 rounded-2xl shadow-xl text-center max-w-md">
          <div className="w-16 h-16 bg-gradient-to-br from-blue-600 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <User className="text-white" size={32} />
          </div>
          <h2 className="text-xl font-bold text-gray-800 mb-2">Access Required</h2>
          <p className="text-gray-600 mb-6">Please log in to view your profile</p>
          <button
            onClick={() => navigate('/login')}
            className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-8 py-3 rounded-full font-medium hover:shadow-lg transition-all duration-200 transform hover:scale-105"
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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50">
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
        className="z-50"
      />
      
      <Navbar/>
      
      {showSuccess && (
        <div className="fixed top-20 left-1/2 transform -translate-x-1/2 z-40 max-w-md w-full mx-4">
          <div className="bg-white/90 backdrop-blur-md border border-green-200 rounded-2xl p-4 shadow-xl">
            <div className="flex items-center">
              <CheckCircle className="h-6 w-6 text-green-500 mr-3" />
              <p className="text-green-800 font-medium">{successMessage}</p>
            </div>
          </div>
        </div>
      )}

      {/* Hero Section */}
      <div className="pt-24 pb-8 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="bg-white/80 backdrop-blur-md rounded-3xl shadow-xl p-8 border border-white/20">
            <div className="flex flex-col lg:flex-row items-center justify-between">
              <div className="flex flex-col sm:flex-row items-center mb-6 lg:mb-0">
                <div className="relative mb-4 sm:mb-0 sm:mr-6">
                  {user?.profile_image || previewImage ? (
                    <img 
                      src={getProfileImageUrl()} 
                      alt={user.username} 
                      className="w-24 h-24 rounded-full object-cover border-4 border-white shadow-lg"
                    />
                  ) : (
                    <div className="w-24 h-24 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center border-4 border-white shadow-lg">
                      <span className="text-2xl font-bold text-white">
                        {user?.username?.charAt(0).toUpperCase() || 'U'}
                      </span>
                    </div>
                  )}
                  <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-green-500 rounded-full border-2 border-white flex items-center justify-center">
                    <div className="w-3 h-3 bg-white rounded-full"></div>
                  </div>
                </div>
                <div className="text-center sm:text-left">
                  <h1 className="text-2xl font-bold text-gray-800 mb-1">{user.username}</h1>
                  <p className="text-gray-600 mb-2">{user.email}</p>
                  <div className="flex items-center justify-center sm:justify-start">
                    <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium capitalize">
                      {user.role}
                    </span>
                  </div>
                </div>
              </div>
              <button 
                onClick={toggleEditMode} 
                className={`flex items-center space-x-2 px-6 py-3 rounded-full font-medium transition-all duration-200 transform hover:scale-105 ${
                  isEditing 
                    ? 'bg-gray-200 text-gray-800 hover:bg-gray-300' 
                    : 'bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:shadow-lg'
                }`}
              >
                {isEditing ? <X size={20} /> : <Edit size={20} />}
                <span>{isEditing ? 'Cancel' : 'Edit Profile'}</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="px-4 pb-8">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            
            <PatientSidebar activeTab={activeTab} setActiveTab={setActiveTab} />

            {/* Profile Form */}
            <div className="lg:col-span-3">
              <div className="bg-white/80 backdrop-blur-md rounded-2xl shadow-lg border border-white/20 p-8">
                <Formik
                  enableReinitialize={true}
                  initialValues={getInitialValues()}
                  validationSchema={validationSchema}
                  onSubmit={handleSubmit}
                >
                  {({ isSubmitting, errors, touched, values, setFieldValue }) => (
                    <Form>
                      {/* Basic Information */}
                      <div className="mb-8">
                        <div className="flex items-center space-x-3 mb-6">
                          <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
                            <User className="text-white" size={20} />
                          </div>
                          <h2 className="text-xl font-bold text-gray-800">Basic Information</h2>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div>
                            <label className="flex items-center space-x-2 mb-3 font-medium text-gray-700">
                              <User size={16} />
                              <span>Username</span>
                            </label>
                            <Field
                              type="text" 
                              name="username"
                              disabled={!isEditing}
                              className={`w-full px-4 py-3 border-2 rounded-xl transition-all duration-200 ${
                                errors.username && touched.username 
                                  ? 'border-red-300 bg-red-50' 
                                  : 'border-gray-200 bg-gray-50'
                              } ${isEditing ? 'focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500' : 'cursor-not-allowed'}`}
                            />
                            <ErrorMessage name="username" component="p" className="text-red-500 text-sm mt-1 flex items-center">
                              <AlertCircle size={14} className="mr-1" />
                            </ErrorMessage>
                          </div>

                          <div>
                            <label className="flex items-center space-x-2 mb-3 font-medium text-gray-700">
                              <Mail size={16} />
                              <span>Email Address</span>
                            </label>
                            <Field
                              type="email" 
                              name="email"
                              disabled={!isEditing}
                              className={`w-full px-4 py-3 border-2 rounded-xl transition-all duration-200 ${
                                errors.email && touched.email 
                                  ? 'border-red-300 bg-red-50' 
                                  : 'border-gray-200 bg-gray-50'
                              } ${isEditing ? 'focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500' : 'cursor-not-allowed'}`}
                            />
                            <ErrorMessage name="email" component="p" className="text-red-500 text-sm mt-1 flex items-center">
                              <AlertCircle size={14} className="mr-1" />
                            </ErrorMessage>
                          </div>

                          <div>
                            <label className="flex items-center space-x-2 mb-3 font-medium text-gray-700">
                              <Phone size={16} />
                              <span>Phone Number</span>
                            </label>
                            <Field
                              type="tel" 
                              name="phone"
                              disabled={!isEditing}
                              className={`w-full px-4 py-3 border-2 rounded-xl transition-all duration-200 ${
                                errors.phone && touched.phone 
                                  ? 'border-red-300 bg-red-50' 
                                  : 'border-gray-200 bg-gray-50'
                              } ${isEditing ? 'focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500' : 'cursor-not-allowed'}`}
                            />
                            <ErrorMessage name="phone" component="p" className="text-red-500 text-sm mt-1 flex items-center">
                              <AlertCircle size={14} className="mr-1" />
                            </ErrorMessage>
                          </div>

                          <div>
                            <label className="flex items-center space-x-2 mb-3 font-medium text-gray-700">
                              <Calendar size={16} />
                              <span>Age</span>
                            </label>
                            <Field
                              type="number" 
                              name="age"
                              disabled={!isEditing}
                              className={`w-full px-4 py-3 border-2 rounded-xl transition-all duration-200 ${
                                errors.age && touched.age 
                                  ? 'border-red-300 bg-red-50' 
                                  : 'border-gray-200 bg-gray-50'
                              } ${isEditing ? 'focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500' : 'cursor-not-allowed'}`}
                            />
                            <ErrorMessage name="age" component="p" className="text-red-500 text-sm mt-1 flex items-center">
                              <AlertCircle size={14} className="mr-1" />
                            </ErrorMessage>
                          </div>
                        </div>
                      </div>

                      {/* Health Information */}
                      <div className="mb-8">
                        <div className="flex items-center space-x-3 mb-6">
                          <div className="w-10 h-10 bg-gradient-to-br from-red-500 to-pink-600 rounded-xl flex items-center justify-center">
                            <Heart className="text-white" size={20} />
                          </div>
                          <h2 className="text-xl font-bold text-gray-800">Health Information</h2>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                          <div>
                            <label className="block mb-3 font-medium text-gray-700">Blood Group</label>
                            <Field
                              as="select"
                              name="blood_group"
                              disabled={!isEditing}
                              className={`w-full px-4 py-3 border-2 rounded-xl transition-all duration-200 ${
                                isEditing ? 'border-gray-200 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500' : 'border-gray-200 bg-gray-50 cursor-not-allowed'
                              }`}
                            >
                              <option value="">Select Blood Group</option>
                              {bloodGroups.map(group => (
                                <option key={group} value={group}>{group}</option>
                              ))}
                            </Field>
                            <ErrorMessage name="blood_group" component="p" className="text-red-500 text-sm mt-1" />
                          </div>

                          <div>
                            <label className="block mb-3 font-medium text-gray-700">Height (cm)</label>
                            <Field
                              type="number" 
                              name="height"
                              disabled={!isEditing}
                              step="0.01"
                              className={`w-full px-4 py-3 border-2 rounded-xl transition-all duration-200 ${
                                errors.height && touched.height 
                                  ? 'border-red-300 bg-red-50' 
                                  : 'border-gray-200 bg-gray-50'
                              } ${isEditing ? 'focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500' : 'cursor-not-allowed'}`}
                            />
                            <ErrorMessage name="height" component="p" className="text-red-500 text-sm mt-1" />
                          </div>

                          <div>
                            <label className="block mb-3 font-medium text-gray-700">Weight (kg)</label>
                            <Field
                              type="number" 
                              name="weight"
                              disabled={!isEditing}
                              step="0.01"
                              className={`w-full px-4 py-3 border-2 rounded-xl transition-all duration-200 ${
                                errors.weight && touched.weight 
                                  ? 'border-red-300 bg-red-50' 
                                  : 'border-gray-200 bg-gray-50'
                              } ${isEditing ? 'focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500' : 'cursor-not-allowed'}`}
                            />
                            <ErrorMessage name="weight" component="p" className="text-red-500 text-sm mt-1" />
                          </div>
                        </div>
                      </div>

                      {/* Medical Information */}
                      <div className="mb-8">
                        <div className="flex items-center space-x-3 mb-6">
                          <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl flex items-center justify-center">
                            <Shield className="text-white" size={20} />
                          </div>
                          <h2 className="text-xl font-bold text-gray-800">Medical Information</h2>
                        </div>
                        
                        <div className="space-y-6">
                          <div>
                            <label className="block mb-3 font-medium text-gray-700">Allergies</label>
                  
                              <Field
                              as="textarea"
                              name="allergies"
                              disabled={!isEditing}
                              rows={3}
                              placeholder="List any allergies you have..."
                              className={`w-full px-4 py-3 border-2 rounded-xl transition-all duration-200 resize-none ${
                                errors.allergies && touched.allergies 
                                  ? 'border-red-300 bg-red-50' 
                                  : 'border-gray-200 bg-gray-50'
                              } ${isEditing ? 'focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500' : 'cursor-not-allowed'}`}
                            />
                            <ErrorMessage name="allergies" component="p" className="text-red-500 text-sm mt-1" />
                          </div>

                          <div>
                            <label className="block mb-3 font-medium text-gray-700">Chronic Conditions</label>
                            <Field
                              as="textarea"
                              name="chronic_conditions"
                              disabled={!isEditing}
                              rows={3}
                              placeholder="List any chronic conditions..."
                              className={`w-full px-4 py-3 border-2 rounded-xl transition-all duration-200 resize-none ${
                                errors.chronic_conditions && touched.chronic_conditions 
                                  ? 'border-red-300 bg-red-50' 
                                  : 'border-gray-200 bg-gray-50'
                              } ${isEditing ? 'focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500' : 'cursor-not-allowed'}`}
                            />
                            <ErrorMessage name="chronic_conditions" component="p" className="text-red-500 text-sm mt-1" />
                          </div>
                        </div>
                      </div>

                      {/* Emergency Contact */}
                      <div className="mb-8">
                        <div className="flex items-center space-x-3 mb-6">
                          <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-red-600 rounded-xl flex items-center justify-center">
                            <AlertCircle className="text-white" size={20} />
                          </div>
                          <h2 className="text-xl font-bold text-gray-800">Emergency Contact</h2>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div>
                            <label className="block mb-3 font-medium text-gray-700">Contact Name</label>
                            <Field
                              type="text" 
                              name="emergency_contact_name"
                              disabled={!isEditing}
                              placeholder="Emergency contact name"
                              className={`w-full px-4 py-3 border-2 rounded-xl transition-all duration-200 ${
                                errors.emergency_contact_name && touched.emergency_contact_name 
                                  ? 'border-red-300 bg-red-50' 
                                  : 'border-gray-200 bg-gray-50'
                              } ${isEditing ? 'focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500' : 'cursor-not-allowed'}`}
                            />
                            <ErrorMessage name="emergency_contact_name" component="p" className="text-red-500 text-sm mt-1" />
                          </div>

                          <div>
                            <label className="block mb-3 font-medium text-gray-700">Contact Number</label>
                            <Field
                              type="tel" 
                              name="emergency_contact"
                              disabled={!isEditing}
                              placeholder="Emergency contact number"
                              className={`w-full px-4 py-3 border-2 rounded-xl transition-all duration-200 ${
                                errors.emergency_contact && touched.emergency_contact 
                                  ? 'border-red-300 bg-red-50' 
                                  : 'border-gray-200 bg-gray-50'
                              } ${isEditing ? 'focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500' : 'cursor-not-allowed'}`}
                            />
                            <ErrorMessage name="emergency_contact" component="p" className="text-red-500 text-sm mt-1" />
                          </div>
                        </div>
                      </div>

                      {/* Profile Image Upload */}
                      {isEditing && (
                        <div className="mb-8">
                          <div className="flex items-center space-x-3 mb-6">
                            <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-600 rounded-xl flex items-center justify-center">
                              <Camera className="text-white" size={20} />
                            </div>
                            <h2 className="text-xl font-bold text-gray-800">Profile Picture</h2>
                          </div>
                          
                          <div className="flex flex-col items-center space-y-4">
                            <div className="relative">
                              <img 
                                src={getProfileImageUrl()} 
                                alt="Profile Preview" 
                                className="w-32 h-32 rounded-full object-cover border-4 border-white shadow-lg"
                              />
                              <label className="absolute bottom-0 right-0 bg-blue-600 hover:bg-blue-700 text-white p-2 rounded-full cursor-pointer transition-colors duration-200">
                                <Camera size={16} />
                                <input
                                  type="file"
                                  accept="image/*"
                                  onChange={handleImageChange}
                                  className="hidden"
                                />
                              </label>
                            </div>
                            
                            {imageError && (
                              <p className="text-red-500 text-sm flex items-center">
                                <AlertCircle size={14} className="mr-1" />
                                {imageError}
                              </p>
                            )}
                            
                            <p className="text-sm text-gray-600 text-center">
                              Click the camera icon to upload a new profile picture
                              <br />
                              <span className="text-xs text-gray-500">
                                Supported formats: JPEG, PNG, GIF (max 5MB)
                              </span>
                            </p>
                          </div>
                        </div>
                      )}

                      {/* Submit Button */}
                      {isEditing && (
                        <div className="flex justify-end space-x-4">
                          <button
                            type="button"
                            onClick={toggleEditMode}
                            className="px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-xl font-medium hover:bg-gray-50 transition-all duration-200"
                          >
                            Cancel
                          </button>
                          <button
                            type="submit"
                            disabled={isSubmitting || loading}
                            className={`flex items-center space-x-2 px-8 py-3 rounded-xl font-medium transition-all duration-200 transform hover:scale-105 ${
                              isSubmitting || loading
                                ? 'bg-gray-400 cursor-not-allowed'
                                : 'bg-gradient-to-r from-blue-600 to-purple-600 hover:shadow-lg'
                            } text-white`}
                          >
                            {isSubmitting || loading ? (
                              <>
                                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                <span>Updating...</span>
                              </>
                            ) : (
                              <>
                                <Save size={20} />
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
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default UserProfile;
