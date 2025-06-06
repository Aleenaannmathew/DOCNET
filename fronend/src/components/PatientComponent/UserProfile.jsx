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
import { CheckCircle } from 'lucide-react';

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

  const sidebarItems = [
    'Profile Information',
    'Change Password',
    'Booking History',
    'Medical Records',
    'Notifications',
    'Help & Support',
    'Logout'
  ];

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

  const handleTabClick = (tab) => {
    if (tab === 'Logout') {
      handleLogout();
    } else if (tab === 'Change Password') {
      navigate('/new-password');
    } else {
      setActiveTab(tab);
    }
  };

  const handleLogout = async () => {
    try{
      const refreshToken = localStorage.getItem('refreshToken');
      if (refreshToken) {
        await userAxios.post('/logout/', {
          refresh: refreshToken
        });
      }
      dispatch(logout());
      localStorage.removeItem('token');
      localStorage.removeItem('refreshToken');
      navigate('/login');
    } catch (error) {
      console.error('Logout error:', error);

      dispatch(logout());
      localStorage.removeItem('token');
      localStorage.removeItem('refreshToken');
      navigate('/login')
    }
  }

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

  
  const profileImageUrl = previewImage || (user?.profile_image || "/api/placeholder/80/80");
  const getProfileImageUrl = () => {
    if (previewImage) return previewImage;
    if (user?.profile_image) return user.profile_image;
    return `https://ui-avatars.com/api/?name=${user?.username?.charAt(0) || 'U'}&background=random&color=fff&size=128`;
  };

  if (!user) {
    return (
      <div className="min-h-screen flex justify-center items-center bg-white">
        <div className="text-center">
          <p className="mb-4">Please log in to view your profile</p>
          <button
            onClick={() => navigate('/login')}
            className="bg-navy-800 hover:bg-navy-900 text-white px-6 py-2 rounded font-medium transition"
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
    <div className="min-h-screen bg-white flex flex-col">
      {/* Toast container for notifications */}
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
      
      <Navbar/>
      
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

      {/* Profile Top Section */}
      <div className="flex justify-center mt-20 px-4">
        <div className="flex flex-col sm:flex-row items-center justify-between bg-gray-100 p-4 sm:p-6 w-full max-w-5xl rounded-md shadow-sm">
          <div className="flex flex-col sm:flex-row items-center mb-4 sm:mb-0">
            {user?.profile_image || previewImage ? (
    <img 
      src={getProfileImageUrl()} 
      alt={user.username} 
      className="w-16 h-16 md:w-20 md:h-20 rounded-full object-cover mr-0 sm:mr-4 mb-2 sm:mb-0"
    />
  ) : (
    <div className="w-16 h-16 md:w-20 md:h-20 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center mr-0 sm:mr-4 mb-2 sm:mb-0">
      <span className="text-2xl font-bold text-white">
        {user?.username?.charAt(0).toUpperCase() || 'U'}
      </span>
    </div>
  )}
            <div className="text-center sm:text-left">
              <div className="font-bold text-lg">{user.username}</div>
              <div className="text-sm text-gray-800">{user.email}</div>
              <div className="text-xs text-gray-800 mt-1 capitalize">Role: {user.role}</div>
            </div>
          </div>
          <button 
            onClick={toggleEditMode} 
            className="bg-indigo-800 hover:bg-indigo-800 text-white px-4 py-2 rounded font-medium text-sm transition"
          >
            {isEditing ? 'Cancel Editing' : 'Edit Profile'}
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex justify-center px-4 py-8">
        <div className="flex flex-col md:flex-row w-full max-w-5xl gap-6">
          
          {/* Sidebar - Mobile Dropdown & Desktop Sidebar */}
          <div className="w-full md:w-64 mb-6 md:mb-0">
            {/* Mobile Dropdown */}
            <div className="md:hidden mb-6">
              <select 
                className="w-full p-3 bg-gray-100 border border-gray-200 rounded-md"
                value={activeTab}
                onChange={(e) => {
                  if (e.target.value === 'Logout') {
                    handleLogout();
                  } else if (e.target.value === 'Change Password') {
                    navigate('/new-password');
                  } else {
                    setActiveTab(e.target.value);
                  }
                }}
              >
                {sidebarItems.map((item) => (
                  <option key={item} value={item}>{item}</option>
                ))}
              </select>
            </div>
            
            {/* Desktop Sidebar */}
            <div className="hidden md:block bg-gray-100 rounded-md overflow-hidden">
              {sidebarItems.map((item, index) => (
                <div 
                  key={index} 
                  className={`px-4 py-3 border-b border-gray-200 cursor-pointer text-sm hover:bg-gray-200 transition ${
                    activeTab === item ? 'bg-gray-200 font-medium' : ''
                  } ${item === 'Logout' ? 'text-red-600 hover:bg-red-50' : ''}`}
                  onClick={() => handleTabClick(item)}
                >
                  {item}
                </div>
              ))}
            </div>
          </div>

          {/* Profile Form */}
          <div className="flex-1 bg-gray-100 p-6 rounded-md shadow-sm relative">
            {/* Profile Image in Corner */}
            <div className="absolute top-0 right-6 transform -translate-y-1/2">
              {user?.profile_image || previewImage ? (
    <img 
      src={getProfileImageUrl()} 
      alt={user.username} 
      className="w-16 h-16 rounded-full border-4 border-white object-cover"
    />
  ) : (
    <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 border-4 border-white flex items-center justify-center">
      <span className="text-xl font-bold text-white">
        {user?.username?.charAt(0).toUpperCase() || 'U'}
      </span>
    </div>
  )}
            </div>

            {/* Formik Form */}
            <Formik
              enableReinitialize={true}
              initialValues={getInitialValues()}
              validationSchema={validationSchema}
              onSubmit={handleSubmit}
            >
              {({ isSubmitting, errors, touched, values, setFieldValue }) => (
                <Form className="mt-12">
                  {/* Basic Info Section */}
                  <h3 className="text-lg font-semibold mb-3 text-navy-800">Basic Information</h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                    <div>
                      <label className="block mb-1 font-bold text-sm">Username</label>
                      <Field
                        type="text" 
                        name="username"
                        disabled={!isEditing}
                        className={`w-full px-3 py-2 border ${
                          errors.username && touched.username ? 'border-red-500' : 'border-gray-300'
                        } rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500 disabled:bg-gray-100 disabled:text-gray-500`}
                      />
                      <ErrorMessage name="username" component="p" className="text-red-500 text-xs mt-1" />
                    </div>

                    <div>
                      <label className="block mb-1 font-bold text-sm">Email Address</label>
                      <Field
                        type="email" 
                        name="email"
                        disabled={!isEditing}
                        className={`w-full px-3 py-2 border ${
                          errors.email && touched.email ? 'border-red-500' : 'border-gray-300'
                        } rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500 disabled:bg-gray-100 disabled:text-gray-500`}
                      />
                      <ErrorMessage name="email" component="p" className="text-red-500 text-xs mt-1" />
                    </div>

                    <div>
                      <label className="block mb-1 font-bold text-sm">Phone Number</label>
                      <Field
                        type="tel" 
                        name="phone"
                        disabled={!isEditing}
                        className={`w-full px-3 py-2 border ${
                          errors.phone && touched.phone ? 'border-red-500' : 'border-gray-300'
                        } rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500 disabled:bg-gray-100 disabled:text-gray-500`}
                      />
                      <ErrorMessage name="phone" component="p" className="text-red-500 text-xs mt-1" />
                    </div>

                    <div>
                      <label className="block mb-1 font-bold text-sm">Age</label>
                      <Field
                        type="number" 
                        name="age"
                        disabled={!isEditing}
                        className={`w-full px-3 py-2 border ${
                          errors.age && touched.age ? 'border-red-500' : 'border-gray-300'
                        } rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500 disabled:bg-gray-100 disabled:text-gray-500`}
                      />
                      <ErrorMessage name="age" component="p" className="text-red-500 text-xs mt-1" />
                    </div>
                  </div>

                  {/* Health Information Section */}
                  <h3 className="text-lg font-semibold mb-3 text-navy-800">Health Information</h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                    <div>
                      <label className="block mb-1 font-bold text-sm">Blood Group</label>
                      <Field
                        as="select"
                        name="blood_group"
                        disabled={!isEditing}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500 disabled:bg-gray-100 disabled:text-gray-500"
                      >
                        <option value="">Select Blood Group</option>
                        {bloodGroups.map(group => (
                          <option key={group} value={group}>{group}</option>
                        ))}
                      </Field>
                      <ErrorMessage name="blood_group" component="p" className="text-red-500 text-xs mt-1" />
                    </div>

                    <div>
                      <label className="block mb-1 font-bold text-sm">Height (cm)</label>
                      <Field
                        type="number" 
                        name="height"
                        disabled={!isEditing}
                        step="0.01"
                        className={`w-full px-3 py-2 border ${
                          errors.height && touched.height ? 'border-red-500' : 'border-gray-300'
                        } rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500 disabled:bg-gray-100 disabled:text-gray-500`}
                      />
                      <ErrorMessage name="height" component="p" className="text-red-500 text-xs mt-1" />
                    </div>

                    <div>
                      <label className="block mb-1 font-bold text-sm">Weight (kg)</label>
                      <Field
                        type="number" 
                        name="weight"
                        disabled={!isEditing}
                        step="0.01"
                        className={`w-full px-3 py-2 border ${
                          errors.weight && touched.weight ? 'border-red-500' : 'border-gray-300'
                        } rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500 disabled:bg-gray-100 disabled:text-gray-500`}
                      />
                      <ErrorMessage name="weight" component="p" className="text-red-500 text-xs mt-1" />
                    </div>
                  </div>

                  {/* Medical Information */}
                  <h3 className="text-lg font-semibold mb-3 text-navy-800">Medical Information</h3>
                  
                  <div className="mb-4">
                    <label className="block mb-1 font-bold text-sm">Allergies</label>
                    <Field
                      as="textarea"
                      name="allergies"
                      disabled={!isEditing}
                      rows={3}
                      placeholder="List any allergies here"
                      className={`w-full px-3 py-2 border ${
                        errors.allergies && touched.allergies ? 'border-red-500' : 'border-gray-300'
                      } rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500 disabled:bg-gray-100 disabled:text-gray-500`}
                    />
                    <ErrorMessage name="allergies" component="p" className="text-red-500 text-xs mt-1" />
                  </div>

                  <div className="mb-6">
                    <label className="block mb-1 font-bold text-sm">Chronic Conditions</label>
                    <Field
                      as="textarea"
                      name="chronic_conditions"
                      disabled={!isEditing}
                      rows={3}
                      placeholder="List any chronic health conditions here"
                      className={`w-full px-3 py-2 border ${
                        errors.chronic_conditions && touched.chronic_conditions ? 'border-red-500' : 'border-gray-300'
                      } rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500 disabled:bg-gray-100 disabled:text-gray-500`}
                    />
                    <ErrorMessage name="chronic_conditions" component="p" className="text-red-500 text-xs mt-1" />
                  </div>

                  {/* Emergency Contact */}
                  <h3 className="text-lg font-semibold mb-3 text-navy-800">Emergency Contact</h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                    <div>
                      <label className="block mb-1 font-bold text-sm">Contact Name</label>
                      <Field
                        type="text" 
                        name="emergency_contact_name"
                        disabled={!isEditing}
                        className={`w-full px-3 py-2 border ${
                          errors.emergency_contact_name && touched.emergency_contact_name ? 'border-red-500' : 'border-gray-300'
                        } rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500 disabled:bg-gray-100 disabled:text-gray-500`}
                      />
                      <ErrorMessage name="emergency_contact_name" component="p" className="text-red-500 text-xs mt-1" />
                    </div>

                    <div>
                      <label className="block mb-1 font-bold text-sm">Contact Number</label>
                      <Field
                        type="tel" 
                        name="emergency_contact"
                        disabled={!isEditing}
                        className={`w-full px-3 py-2 border ${
                          errors.emergency_contact && touched.emergency_contact ? 'border-red-500' : 'border-gray-300'
                        } rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500 disabled:bg-gray-100 disabled:text-gray-500`}
                      />
                      <ErrorMessage name="emergency_contact" component="p" className="text-red-500 text-xs mt-1" />
                    </div>
                  </div>

                  {/* Profile Picture Upload */}
                  {isEditing && (
                    <div className="mb-6">
                      <label className="block mb-1 font-bold text-sm">Profile Picture</label>
                      <input 
                        type="file" 
                        name="profile_image"
                        accept="image/*"
                        onChange={handleImageChange}
                        className={`w-full px-3 py-2 border ${
                          imageError ? 'border-red-500' : 'border-gray-300'
                        } rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500`}
                      />
                      {imageError && (
                        <p className="text-red-500 text-xs mt-1">{imageError}</p>
                      )}
                      <p className="text-xs text-gray-500 mt-1">Upload a new profile picture (JPEG, PNG, or GIF, max 5MB)</p>
                    </div>
                  )}

                  {isEditing && (
                    <div className="flex justify-center mt-8 space-x-4">
                      <button 
                        type="submit" 
                        className={`px-6 py-2 rounded font-medium transition ${
                          isSubmitting || loading
                            ? 'bg-gray-400 text-gray-700 cursor-not-allowed'
                            : 'bg-indigo-800 hover:bg-indigo-900 text-white'
                        }`}
                        disabled={isSubmitting || loading}
                      >
                        {isSubmitting || loading ? 'Saving...' : 'Save Changes'}
                      </button>
                      <button 
                        type="button"
                        onClick={toggleEditMode}
                        className="bg-gray-300 hover:bg-gray-400 text-gray-800 px-6 py-2 rounded font-medium transition"
                        disabled={isSubmitting || loading}
                      >
                        Cancel
                      </button>
                    </div>
                  )}
                </Form>
              )}
            </Formik>
          </div>
        </div>
      </div>

      <Footer/>
    </div>
  );
};

export default UserProfile;