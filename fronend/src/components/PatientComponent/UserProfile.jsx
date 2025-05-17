import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useLocation, useNavigate } from 'react-router-dom';
import { logout, updateUser } from '../../store/authSlice';
import { userAxios } from '../../axios/UserAxios';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Navbar from './Navbar';
import Footer from './Footer';
import DocnetLoading from '../Constants/Loading';
import { CheckCircle } from 'lucide-react';



const UserProfile = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const { user, token } = useSelector(state => state.auth);
  const [showSuccess, setShowSuccess] = useState(false);
  const [successMessage, setSuccessMessage ] = useState('');
  const [activeTab, setActiveTab] = useState('Profile Information');
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    phone: '',
    age: '',
    blood_group: '',
    height: '',
    weight: '',
    allergies: '',
    chronic_conditions: '',
    emergency_contact: '',
    emergency_contact_name: '',
    profile_image: null
  });
  const [formErrors, setFormErrors] = useState({});
  const [profileImage, setProfileImage] = useState(null);
  const [previewImage, setPreviewImage] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showSuccessLoader, setShowSuccessLoader] = useState(false);

  const [profileFetched, setProfileFetched] = useState(false);

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

  useEffect(() => {
    if (user) {
      setFormData({
        username: user.username || '',
        email: user.email || '',
        phone: user.phone || '',
        age: user.age || '',
        blood_group: user.blood_group || '',
        height: user.height || '',
        weight: user.weight || '',
        allergies: user.allergies || '',
        chronic_conditions: user.chronic_conditions || '',
        emergency_contact: user.emergency_contact || '',
        emergency_contact_name: user.emergency_contact_name || '',
      });
    }
  }, [user]);

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
       
          setFormData(prevState => ({
            ...prevState,
            ...response.data,
          }));
          
          
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
            setFormData(prevState => ({
              ...prevState,
              ...altResponse.data,
            }));
            
            dispatch(updateUser(altResponse.data));
          }
          
          setProfileFetched(true);
          setLoading(false);
        } catch (altError) {
       
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
      if (isNaN(age) || age < 0 || age > 120) {
        errors.age = 'Please enter a valid age between 0 and 120';
      }
    }
  
    if (formData.height) {
      const height = parseFloat(formData.height);
      if (isNaN(height) || height <= 0 || height > 300) {
        errors.height = 'Please enter a valid height (up to 300 cm)';
      }
    }
    
   
    if (formData.weight) {
      const weight = parseFloat(formData.weight);
      if (isNaN(weight) || weight <= 0 || weight > 500) {
        errors.weight = 'Please enter a valid weight (up to 500 kg)';
      }
    }
    
   
    if (formData.emergency_contact && !/^[0-9+\-\s()]{7,15}$/.test(formData.emergency_contact)) {
      errors.emergency_contact = 'Please enter a valid emergency contact number';
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

  
  const handleSubmit = async (e) => {
    e.preventDefault();

    
    if (!validateForm()) {
      toast.error('Please correct the errors before submitting');
      return;
    }

    try {
      setLoading(true);
      
  
      const profileFormData = new FormData();
      
    
      Object.keys(formData).forEach(key => {
        if (formData[key] !== null && formData[key] !== undefined && key !== 'profile_image') {
          profileFormData.append(key, formData[key]);
        }
      });
      
     
      if (profileImage) {
        profileFormData.append('profile_image', profileImage);
      }
      
    
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
        
       
        setTimeout(() => {
          setShowSuccessLoader(false);
          setIsEditing(false);
        }, 2000);
      }
      
      setLoading(false);
    } catch (err) {
      console.error('Error updating profile:', err);
      toast.error(`Failed to update profile: ${err.response?.data?.detail || err.message}`);
      setLoading(false);
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

 
  const handleLogout = () => {
    dispatch(logout());
    navigate('/login');
  };

  const toggleEditMode = () => {
    setIsEditing(!isEditing);
    
    if (isEditing) {
      if (previewImage) {
        URL.revokeObjectURL(previewImage);
        setPreviewImage(null);
      }
      setProfileImage(null);
      
 
      if (user) {
        setFormData({
          username: user.username || '',
          email: user.email || '',
          phone: user.phone || '',
          age: user.age || '',
          blood_group: user.blood_group || '',
          height: user.height || '',
          weight: user.weight || '',
          allergies: user.allergies || '',
          chronic_conditions: user.chronic_conditions || '',
          emergency_contact: user.emergency_contact || '',
          emergency_contact_name: user.emergency_contact_name || '',
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
            <img 
              src={profileImageUrl} 
              alt={user.username} 
              className="w-16 h-16 md:w-20 md:h-20 rounded-full object-cover mr-0 sm:mr-4 mb-2 sm:mb-0"
            />
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
            
            
            <div className="absolute top-0 right-6 transform -translate-y-1/2">
              <img 
                src={profileImageUrl} 
                alt={user.username} 
                className="w-16 h-16 rounded-full border-4 border-white"
              />
            </div>

            <form onSubmit={handleSubmit} className="mt-12">
              {/* Basic Info Section */}
              <h3 className="text-lg font-semibold mb-3 text-navy-800">Basic Information</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <div>
                  <label className="block mb-1 font-bold text-sm">Username</label>
                  <input 
                    type="text" 
                    name="username"
                    value={formData.username || ''}
                    onChange={handleInputChange}
                    disabled={!isEditing}
                    className={`w-full px-3 py-2 border ${formErrors.username ? 'border-red-500' : 'border-gray-300'} rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500 disabled:bg-gray-100 disabled:text-gray-500`}
                  />
                  {formErrors.username && (
                    <p className="text-red-500 text-xs mt-1">{formErrors.username}</p>
                  )}
                </div>

                <div>
                  <label className="block mb-1 font-bold text-sm">Email Address</label>
                  <input 
                    type="email" 
                    name="email"
                    value={formData.email || ''}
                    onChange={handleInputChange}
                    disabled={!isEditing}
                    className={`w-full px-3 py-2 border ${formErrors.email ? 'border-red-500' : 'border-gray-300'} rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500 disabled:bg-gray-100 disabled:text-gray-500`}
                  />
                  {formErrors.email && (
                    <p className="text-red-500 text-xs mt-1">{formErrors.email}</p>
                  )}
                </div>

                <div>
                  <label className="block mb-1 font-bold text-sm">Phone Number</label>
                  <input 
                    type="tel" 
                    name="phone"
                    value={formData.phone || ''}
                    onChange={handleInputChange}
                    disabled={!isEditing}
                    className={`w-full px-3 py-2 border ${formErrors.phone ? 'border-red-500' : 'border-gray-300'} rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500 disabled:bg-gray-100 disabled:text-gray-500`}
                  />
                  {formErrors.phone && (
                    <p className="text-red-500 text-xs mt-1">{formErrors.phone}</p>
                  )}
                </div>

                <div>
                  <label className="block mb-1 font-bold text-sm">Age</label>
                  <input 
                    type="number" 
                    name="age"
                    value={formData.age || ''}
                    onChange={(e) => {
                      const value = e.target.value ? parseInt(e.target.value) : '';
                      setFormData({
                        ...formData,
                        age: value
                      });
                      if (formErrors.age) {
                        setFormErrors({
                          ...formErrors,
                          age: ''
                        });
                      }
                    }}
                    disabled={!isEditing}
                    className={`w-full px-3 py-2 border ${formErrors.age ? 'border-red-500' : 'border-gray-300'} rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500 disabled:bg-gray-100 disabled:text-gray-500`}
                  />
                  {formErrors.age && (
                    <p className="text-red-500 text-xs mt-1">{formErrors.age}</p>
                  )}
                </div>
              </div>

              {/* Health Information Section */}
              <h3 className="text-lg font-semibold mb-3 text-navy-800">Health Information</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <div>
                  <label className="block mb-1 font-bold text-sm">Blood Group</label>
                  <select
                    name="blood_group"
                    value={formData.blood_group || ''}
                    onChange={handleInputChange}
                    disabled={!isEditing}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500 disabled:bg-gray-100 disabled:text-gray-500"
                  >
                    <option value="">Select Blood Group</option>
                    {bloodGroups.map(group => (
                      <option key={group} value={group}>{group}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block mb-1 font-bold text-sm">Height (cm)</label>
                  <input 
                    type="number" 
                    name="height"
                    value={formData.height || ''}
                    onChange={handleInputChange}
                    disabled={!isEditing}
                    step="0.01"
                    className={`w-full px-3 py-2 border ${formErrors.height ? 'border-red-500' : 'border-gray-300'} rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500 disabled:bg-gray-100 disabled:text-gray-500`}
                  />
                  {formErrors.height && (
                    <p className="text-red-500 text-xs mt-1">{formErrors.height}</p>
                  )}
                </div>

                <div>
                  <label className="block mb-1 font-bold text-sm">Weight (kg)</label>
                  <input 
                    type="number" 
                    name="weight"
                    value={formData.weight || ''}
                    onChange={handleInputChange}
                    disabled={!isEditing}
                    step="0.01"
                    className={`w-full px-3 py-2 border ${formErrors.weight ? 'border-red-500' : 'border-gray-300'} rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500 disabled:bg-gray-100 disabled:text-gray-500`}
                  />
                  {formErrors.weight && (
                    <p className="text-red-500 text-xs mt-1">{formErrors.weight}</p>
                  )}
                </div>
              </div>

              {/* Medical Information */}
              <h3 className="text-lg font-semibold mb-3 text-navy-800">Medical Information</h3>
              
              <div className="mb-4">
                <label className="block mb-1 font-bold text-sm">Allergies</label>
                <textarea 
                  name="allergies"
                  value={formData.allergies || ''}
                  onChange={handleInputChange}
                  disabled={!isEditing}
                  rows={3}
                  placeholder="List any allergies here"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500 disabled:bg-gray-100 disabled:text-gray-500"
                />
              </div>

              <div className="mb-6">
                <label className="block mb-1 font-bold text-sm">Chronic Conditions</label>
                <textarea 
                  name="chronic_conditions"
                  value={formData.chronic_conditions || ''}
                  onChange={handleInputChange}
                  disabled={!isEditing}
                  rows={3}
                  placeholder="List any chronic health conditions here"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500 disabled:bg-gray-100 disabled:text-gray-500"
                />
              </div>

              {/* Emergency Contact */}
              <h3 className="text-lg font-semibold mb-3 text-navy-800">Emergency Contact</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <div>
                  <label className="block mb-1 font-bold text-sm">Contact Name</label>
                  <input 
                    type="text" 
                    name="emergency_contact_name"
                    value={formData.emergency_contact_name || ''}
                    onChange={handleInputChange}
                    disabled={!isEditing}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500 disabled:bg-gray-100 disabled:text-gray-500"
                  />
                </div>

                <div>
                  <label className="block mb-1 font-bold text-sm">Contact Number</label>
                  <input 
                    type="tel" 
                    name="emergency_contact"
                    value={formData.emergency_contact || ''}
                    onChange={handleInputChange}
                    disabled={!isEditing}
                    className={`w-full px-3 py-2 border ${formErrors.emergency_contact ? 'border-red-500' : 'border-gray-300'} rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500 disabled:bg-gray-100 disabled:text-gray-500`}
                  />
                  {formErrors.emergency_contact && (
                    <p className="text-red-500 text-xs mt-1">{formErrors.emergency_contact}</p>
                  )}
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
                    className={`w-full px-3 py-2 border ${formErrors.profile_image ? 'border-red-500' : 'border-gray-300'} rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500`}
                  />
                  {formErrors.profile_image && (
                    <p className="text-red-500 text-xs mt-1">{formErrors.profile_image}</p>
                  )}
                  <p className="text-xs text-gray-500 mt-1">Upload a new profile picture (JPEG, PNG, or GIF, max 5MB)</p>
                </div>
              )}

              {isEditing ? (
                <div className="flex justify-center mt-8 space-x-4">
                  <button 
                    type="submit" 
                    className="bg-indigo-800 hover:bg-indigo-800 text-white px-6 py-2 rounded font-medium transition"
                    disabled={loading}
                  >
                    {loading ? 'Saving...' : 'Save Changes'}
                  </button>
                  <button 
                    type="button"
                    onClick={toggleEditMode}
                    className="bg-gray-300 hover:bg-gray-400 text-gray-800 px-6 py-2 rounded font-medium transition"
                  >
                    Cancel
                  </button>
                </div>
              ) : null}
            </form>
          </div>
        </div>
      </div>

      <Footer/>

     
    </div>
  );
};

export default UserProfile;