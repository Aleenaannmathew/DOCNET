import React, { useState } from 'react';
import {
  Lock,
  Mail,
  Phone,
  User,
  Stethoscope,
  GraduationCap,
  Building,
  Shield,
  Calendar,
  Globe,
  FileText,
  Eye,
  EyeOff,
  CheckCircle,
  AlertTriangle
} from 'lucide-react';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import { doctorAxios } from '../../axios/DoctorAxios';
import { useNavigate } from 'react-router-dom';
import DocnetLoading from '../Constants/Loading';

const languageOptions = [
  'Afrikaans', 'Albanian', 'Amharic', 'Arabic', 'Armenian', 'Azerbaijani',
  'Basque', 'Belarusian', 'Bengali', 'Bosnian', 'Bulgarian', 'Burmese',
  'Catalan', 'Chinese (Mandarin)', 'Chinese (Cantonese)', 'Croatian', 'Czech',
  'Danish', 'Dutch', 'English', 'Estonian', 'Filipino', 'Finnish', 'French',
  'Georgian', 'German', 'Greek', 'Gujarati', 'Haitian Creole', 'Hausa', 'Hebrew', 'Hindi', 'Hungarian',
  'Icelandic', 'Igbo', 'Indonesian', 'Irish', 'Italian',
  'Japanese', 'Javanese', 'Kannada', 'Kazakh', 'Khmer', 'Korean',
  'Lao', 'Latin', 'Latvian', 'Lithuanian', 'Luxembourgish',
  'Macedonian', 'Malagasy', 'Malay', 'Malayalam', 'Maltese', 'Maori', 'Marathi', 'Mongolian',
  'Nepali', 'Norwegian',
  'Pashto', 'Persian', 'Polish', 'Portuguese', 'Punjabi',
  'Romanian', 'Russian',
  'Samoan', 'Serbian', 'Shona', 'Sindhi', 'Sinhala', 'Slovak', 'Slovenian', 'Somali', 'Spanish', 'Sundanese', 'Swahili', 'Swedish',
  'Tamil', 'Telugu', 'Thai', 'Turkish',
  'Ukrainian', 'Urdu', 'Uzbek',
  'Vietnamese',
  'Welsh',
  'Xhosa',
  'Yiddish', 'Yoruba',
  'Zulu'
];

const specializations = [
  'General Practice', 'Cardiology', 'Dermatology', 'Endocrinology', 'Gastroenterology',
  'Neurology', 'Oncology', 'Orthopedics', 'Pediatrics', 'Psychiatry', 'Radiology',
  'Surgery', 'Urology', 'Gynecology', 'Ophthalmology', 'ENT', 'Anesthesiology',
  'Emergency Medicine', 'Internal Medicine', 'Pathology', 'Other'
];

const genderOptions = ['Male', 'Female', 'Other', 'Prefer not to say'];

// Enhanced validation schema with better password rules
const validationSchema = Yup.object({
  username: Yup.string()
    .min(3, 'Username must be at least 3 characters')
    .max(30, 'Username must be less than 30 characters')
    .matches(/^[a-zA-Z0-9_]+$/, 'Username can only contain letters, numbers, and underscores')
    .required('Username is required'),
  email: Yup.string()
    .email('Please enter a valid email address')
    .required('Email is required'),
  phone: Yup.string()
    .matches(/^[0-9]{10,15}$/, 'Phone number must be 10-15 digits only')
    .required('Phone number is required'),
  password: Yup.string()
    .min(8, 'Password must be at least 8 characters')
    .matches(/^(?=.*[a-z])/, 'Password must contain at least one lowercase letter')
    .matches(/^(?=.*[A-Z])/, 'Password must contain at least one uppercase letter')
    .matches(/^(?=.*\d)/, 'Password must contain at least one number')
    .matches(/^(?=.*[@$!%*?&])/, 'Password must contain at least one special character (@$!%*?&)')
    .test('not-all-numeric', 'Password cannot be entirely numeric', (value) => {
      return value ? !/^\d+$/.test(value) : true;
    })
    .test('not-too-common', 'Please choose a stronger password', (value) => {
      const commonPasswords = [
        '12345678', '123456789', '1234567890', 'password', 'password123', 
        '11111111', 'qwerty123', 'abc12345', 'admin123', 'welcome123'
      ];
      return value ? !commonPasswords.includes(value.toLowerCase()) : true;
    })
    .required('Password is required'),
  password2: Yup.string()
    .oneOf([Yup.ref('password'), null], 'Passwords do not match')
    .required('Please confirm your password'),
  registration_id: Yup.string()
    .required('Registration ID is required'),
  hospital: Yup.string(),
  specialization: Yup.string()
    .min(3, 'Specialization must be at least 3 characters')
    .required('Specialization is required'),
  languages: Yup.array()
    .min(1, 'At least one language is required')
    .required('Language selection is required'),
  age: Yup.number()
    .min(21, 'Age must be between 21 and 80')
    .max(80, 'Age must be between 21 and 80')
    .required('Age is required'),
  gender: Yup.string()
    .required('Gender is required'),
  experience: Yup.number()
    .min(0, 'Experience cannot be negative')
    .required('Years of experience is required'),
  prefer_24hr_consultation: Yup.boolean(),
  agreeToTerms: Yup.boolean()
    .oneOf([true], 'You must agree to the Terms of Use and Privacy Policy')
    .required('You must agree to the Terms of Use and Privacy Policy'),
  medicalEthics: Yup.boolean()
    .oneOf([true], 'You must commit to medical ethics')
    .required('You must commit to medical ethics')
});

const initialValues = {
  username: '',
  email: '',
  phone: '',
  password: '',
  password2: '',
  registration_id: '',
  hospital: '',
  specialization: '',
  languages: [],
  age: '',
  gender: '',
  experience: '',
  prefer_24hr_consultation: false,
  agreeToTerms: false,
  medicalEthics: false
};

const LanguageSelect = ({ field, form, ...props }) => {
  const [selectedLanguages, setSelectedLanguages] = useState(field.value || []);
  const [isOpen, setIsOpen] = useState(false);

  const handleLanguageToggle = (language) => {
    let updatedLanguages;
    if (selectedLanguages.includes(language)) {
      updatedLanguages = selectedLanguages.filter(lang => lang !== language);
    } else {
      updatedLanguages = [...selectedLanguages, language];
    }
    setSelectedLanguages(updatedLanguages);
    form.setFieldValue(field.name, updatedLanguages);
  };

  const removeLanguage = (languageToRemove, e) => {
    e.stopPropagation();
    const updatedLanguages = selectedLanguages.filter(lang => lang !== languageToRemove);
    setSelectedLanguages(updatedLanguages);
    form.setFieldValue(field.name, updatedLanguages);
  };

  return (
    <div className="relative mb-4">
      <div className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-500 z-10">
        <Globe size={18} />
      </div>

      <div
        onClick={() => setIsOpen(!isOpen)}
        className={`w-full pl-12 pr-4 py-3 rounded-lg border ${form.errors[field.name] && form.touched[field.name]
          ? 'border-red-500 focus:ring-red-500'
          : 'border-gray-300 focus:ring-teal-500'
          } focus:ring-2 focus:border-transparent outline-none cursor-pointer min-h-[48px] flex flex-wrap items-center gap-2`}
      >
        {selectedLanguages.length === 0 ? (
          <span className="text-gray-400">Select Languages</span>
        ) : (
          selectedLanguages.map((language) => (
            <span
              key={language}
              className="bg-teal-100 text-teal-800 px-2 py-1 rounded-md text-sm flex items-center gap-1"
            >
              {language}
              <button
                type="button"
                onClick={(e) => removeLanguage(language, e)}
                className="text-teal-600 hover:text-teal-800 ml-1"
              >
                ×
              </button>
            </span>
          ))
        )}
      </div>

      {isOpen && (
        <div className="absolute z-20 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto">
          {languageOptions.map((language) => (
            <div
              key={language}
              onClick={() => handleLanguageToggle(language)}
              className={`px-4 py-2 cursor-pointer hover:bg-gray-100 ${selectedLanguages.includes(language) ? 'bg-teal-50 text-teal-700' : ''
                }`}
            >
              <div className="flex items-center justify-between">
                <span>{language}</span>
                {selectedLanguages.includes(language) && (
                  <span className="text-teal-600">✓</span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {isOpen && (
        <div
          className="fixed inset-0 z-10"
          onClick={() => setIsOpen(false)}
        />
      )}
    </div>
  );
};

export default function DoctorRegister() {
  const [isLoading, setIsLoading] = useState(false);
  const [serverError, setServerError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const navigate = useNavigate();

  // Enhanced custom input component with password visibility toggle
  const FormInput = ({ field, form, placeholder, type = "text", icon: Icon, showToggle = false, ...props }) => {
    const hasError = form.errors[field.name] && form.touched[field.name];
    const isPasswordField = type === "password";
    const showPasswordState = field.name === 'password' ? showPassword : showConfirmPassword;
    const togglePassword = field.name === 'password' 
      ? () => setShowPassword(!showPassword)
      : () => setShowConfirmPassword(!showConfirmPassword);
    
    return (
      <div className="relative">
        <div className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-500 z-10">
          <Icon size={18} />
        </div>
        <input
          {...field}
          {...props}
          type={isPasswordField && showToggle ? (showPasswordState ? "text" : "password") : type}
          placeholder={placeholder}
          className={`w-full pl-12 ${showToggle ? 'pr-12' : 'pr-4'} py-3 rounded-xl border ${
            hasError 
              ? 'border-red-400 focus:ring-red-400' 
              : 'border-gray-200 focus:ring-blue-500'
          } focus:ring-2 focus:border-transparent outline-none shadow-sm transition-all duration-200 bg-white`}
        />
        {showToggle && (
          <button
            type="button"
            onClick={togglePassword}
            className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700 z-10"
          >
            {showPasswordState ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        )}
        <ErrorMessage 
          name={field.name} 
          component="div" 
          className="text-red-500 text-sm mt-1 ml-1 flex items-start"
        />
      </div>
    );
  };

  // Password strength indicator
  const getPasswordStrength = (password) => {
    if (!password) return { strength: 0, label: '', color: '' };
    
    let strength = 0;
    const checks = [
      { regex: /.{8,}/, label: 'At least 8 characters' },
      { regex: /[a-z]/, label: 'Lowercase letter' },
      { regex: /[A-Z]/, label: 'Uppercase letter' },
      { regex: /[0-9]/, label: 'Number' },
      { regex: /[@$!%*?&]/, label: 'Special character' }
    ];
    
    checks.forEach(check => {
      if (check.regex.test(password)) strength++;
    });
    
    if (strength < 2) return { strength, label: 'Weak', color: 'bg-red-500' };
    if (strength < 4) return { strength, label: 'Medium', color: 'bg-yellow-500' };
    return { strength, label: 'Strong', color: 'bg-green-500' };
  };

  const handleSubmit = async (values, { setFieldError, setSubmitting, resetForm }) => {
    setIsLoading(true);
    setServerError('');
    setSuccessMessage('');
    
    try {
      const data = new FormData();
      data.append('username', values.username);
      data.append('email', values.email);
      data.append('phone', values.phone);
      data.append('password', values.password);
      data.append('confirm_password', values.password2);
      data.append('role', 'doctor');
      data.append('registration_id', values.registration_id);
      data.append('hospital', values.hospital);
      data.append('specialization', values.specialization);
      data.append('languages', values.languages.join(', '));
      data.append('age', values.age);
      data.append('gender', values.gender);
      data.append('experience', values.experience);
      data.append('prefer_24hr_consultation', values.prefer_24hr_consultation);
      data.append('agreeToTerms', values.agreeToTerms);
      data.append('medicalEthics', values.medicalEthics);

      const response = await doctorAxios.post('/doctor-register/', data);

      if (response.data && response.data.user_id) {
        setSuccessMessage('Registration successful! Redirecting to OTP verification...');
        
        // Small delay to show success message
        setTimeout(() => {
          navigate('/doctor/doctor-verify-otp', {
            state: {
              userId: response.data.user_id,
              email: response.data.email,
              userType: 'doctor'
            }
          });
        }, 1500);
      } else {
        console.error("Unexpected response format - no user id.", response.data);
        setServerError('Registration failed. Please try again.');
      }
      
    } catch (error) {
      console.error('Registration failed:', error);
      
      if (error.response && error.response.data) {
        const serverErrors = error.response.data;
        
        // Handle string error messages
        if (typeof serverErrors === 'string') {
          setServerError(serverErrors);
        } 
        // Handle object error messages
        else if (typeof serverErrors === 'object') {
          let hasFieldErrors = false;
          let generalErrors = [];
          
          Object.keys(serverErrors).forEach(key => {
            // Handle array of error messages
            let errorMessage;
            if (Array.isArray(serverErrors[key])) {
              errorMessage = serverErrors[key].join(' ');
            } else {
              errorMessage = serverErrors[key];
            }
            
            // Map server field names to form field names
            const fieldMap = {
              confirm_password: 'password2'
            };
            
            const fieldName = fieldMap[key] || key;
            
            // Set field error if it's a form field
            if (['username', 'email', 'phone', 'password', 'password2', 'registration_id', 'specialization', 'age', 'gender', 'experience'].includes(fieldName)) {
              setFieldError(fieldName, errorMessage);
              hasFieldErrors = true;
            } else {
              // Collect non-field errors
              generalErrors.push(errorMessage);
            }
          });
          
          // Show general errors or if no field-specific errors were set
          if (generalErrors.length > 0) {
            setServerError(generalErrors.join(' '));
          } else if (!hasFieldErrors && Object.keys(serverErrors).length > 0) {
            const firstError = Object.values(serverErrors)[0];
            const errorMsg = Array.isArray(firstError) ? firstError.join(' ') : firstError;
            setServerError(errorMsg);
          }
        }
      } 
      // Handle network errors
      else if (error.code === 'NETWORK_ERROR' || error.message.includes('Network')) {
        setServerError('Network error. Please check your internet connection and try again.');
      }
      // Handle timeout errors
      else if (error.code === 'ECONNABORTED') {
        setServerError('Request timeout. Please try again.');
      }
      // Handle other errors
      else if (error.message) {
        setServerError(`Error: ${error.message}`);
      } 
      // Handle unknown errors
      else {
        setServerError('Registration failed. Please try again later.');
      }
    } finally {
      setIsLoading(false);
      setSubmitting(false);
    }
  };

  // Loading component
  if (isLoading) {
    return <DocnetLoading/>;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      <div className="flex flex-col lg:flex-row min-h-screen">
        {/* Left Section - Enhanced with professional styling */}
        <div className="hidden lg:flex lg:w-2/5 bg-gradient-to-br from-blue-600 to-blue-800 p-8 flex-col text-white relative overflow-hidden">
          {/* Background Pattern */}
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-10 left-10 w-20 h-20 border-2 border-white rounded-full"></div>
            <div className="absolute top-32 right-16 w-16 h-16 border-2 border-white rounded-full"></div>
            <div className="absolute bottom-32 left-16 w-12 h-12 border-2 border-white rounded-full"></div>
            <div className="absolute bottom-16 right-20 w-24 h-24 border-2 border-white rounded-full"></div>
          </div>
          
          <div className="relative z-10">
            <div className="flex items-center mb-8">
              <Stethoscope className="mr-3" size={32} />
              <h1 className="font-bold text-3xl">DOCNET</h1>
            </div>
            <div className="mb-12">
              <h2 className="font-semibold text-3xl mb-4 leading-tight">
                Join Our Elite Network of<br />
                <span className="text-blue-200">Medical Professionals</span>
              </h2>
              <p className="text-blue-100 text-lg leading-relaxed">
                Connect with patients, collaborate with peers, and advance your medical practice in a trusted digital ecosystem.
              </p>
            </div>
            
            {/* Doctor-focused Features */}
            <div className="space-y-4">
              <div className="flex items-center">
                <Shield className="mr-3 text-blue-200" size={20} />
                <span className="text-blue-100">HIPAA Compliant & Secure</span>
              </div>
              <div className="flex items-center">
                <FileText className="mr-3 text-blue-200" size={20} />
                <span className="text-blue-100">Digital Health Records</span>
              </div>
              <div className="flex items-center">
                <Calendar className="mr-3 text-blue-200" size={20} />
                <span className="text-blue-100">Smart Appointment Management</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Section - Enhanced form styling */}
        <div className="w-full lg:w-3/5 p-6 md:p-12 flex justify-center items-center">
          <div className="w-full max-w-2xl">
            {/* Mobile Header */}
            <div className="block lg:hidden mb-8 text-center">
              <div className="flex items-center justify-center mb-4">
                <Stethoscope className="mr-3 text-blue-600" size={32} />
                <h1 className="font-bold text-3xl text-blue-600">DOCNET</h1>
              </div>
              <h2 className="font-semibold text-xl text-gray-800 mb-2">
                Join Our Medical Professional Network
              </h2>
              <p className="text-gray-600">Connect with patients and grow your practice</p>
            </div>

            {/* Form Header */}
            <div className="text-center lg:text-left mb-8">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mb-2">
                Doctor Registration
              </h2>
              <p className="text-gray-600 text-lg">
                Create your professional profile to start connecting with patients
              </p>
            </div>

            {/* Success Message Display */}
            {successMessage && (
              <div className="mb-6 bg-green-50 border-l-4 border-green-400 text-green-700 p-4 rounded-lg">
                <div className="flex items-center">
                  <CheckCircle className="w-5 h-5 mr-2" />
                  {successMessage}
                </div>
              </div>
            )}

            {/* Server Error Display */}
            {serverError && (
              <div className="mb-6 bg-red-50 border-l-4 border-red-400 text-red-700 p-4 rounded-lg">
                <div className="flex items-start">
                  <AlertTriangle className="w-5 h-5 mr-2 mt-0.5 flex-shrink-0" />
                  <div>
                    <strong>Registration Failed:</strong>
                    <p className="mt-1">{serverError}</p>
                  </div>
                </div>
              </div>
            )}

            <Formik
              initialValues={initialValues}
              validationSchema={validationSchema}
              onSubmit={handleSubmit}
            >
              {({ isSubmitting, errors, touched, values }) => (
                <Form className="space-y-6">
                  {/* Personal Information Section */}
                  <div className="bg-white p-6 rounded-2xl shadow-lg border border-gray-100">
                    <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                      <User className="mr-2 text-blue-600" size={20} />
                      Personal Information
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <Field
                        name="username"
                        component={FormInput}
                        placeholder="Username (letters, numbers, underscore only)"
                        icon={User}
                      />

                      <Field
                        name="email"
                        component={FormInput}
                        type="email"
                        placeholder="Email Address"
                        icon={Mail}
                      />

                      <Field
                        name="phone"
                        component={FormInput}
                        type="tel"
                        placeholder="Phone Number (10-15 digits)"
                        icon={Phone}
                      />

                      <div className="mb-4">
                        <Field
                          as="select"
                          name="gender"
                          className={`w-full px-4 py-3 rounded-xl border ${errors.gender && touched.gender
                            ? 'border-red-400 focus:ring-red-400'
                            : 'border-gray-200 focus:ring-blue-500'
                            } focus:ring-2 focus:border-transparent outline-none shadow-sm`}
                        >
                          <option value="">Select Gender</option>
                          {genderOptions.map(option => (
                            <option key={option} value={option.toLowerCase()}>{option}</option>
                          ))}
                        </Field>
                        <ErrorMessage 
                          name="gender" 
                          component="div" 
                          className="text-red-500 text-sm mt-1 ml-1 flex items-start"
                        />
                      </div>

                      <Field
                        name="age"
                        type="number"
                        placeholder="Age (21-80)"
                        min="21"
                        max="80"
                        component={FormInput}
                        icon={User}
                      />

                      <Field
                        name="hospital"
                        component={FormInput}
                        type="text"
                        placeholder="Hospital Name (Optional)"
                        icon={Building}
                      />
                    </div>
                  </div>

                  {/* Professional Information Section */}
                  <div className="bg-white p-6 rounded-2xl shadow-lg border border-gray-100">
                    <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                      <Stethoscope className="mr-2 text-blue-600" size={20} />
                      Professional Details
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="mb-4">
                        <div className="relative">
                          <div className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-500 z-10">
                            <GraduationCap size={18} />
                          </div>
                          <Field
                            as="select"
                            name="specialization"
                            className={`w-full pl-12 pr-4 py-3 rounded-xl border ${errors.specialization && touched.specialization
                              ? 'border-red-400 focus:ring-red-400'
                              : 'border-gray-200 focus:ring-blue-500'
                              } focus:ring-2 focus:border-transparent outline-none shadow-sm`}
                          >
                            <option value="">Select Specialization</option>
                            {specializations.map(spec => (
                              <option key={spec} value={spec}>{spec}</option>
                            ))}
                          </Field>
                        </div>
                        <ErrorMessage 
                          name="specialization" 
                          component="div" 
                          className="text-red-500 text-sm mt-1 ml-1 flex items-start"
                        />
                      </div>

                      <Field
                        name="experience"
                        type="number"
                        placeholder="Years of Experience"
                        min="0"
                        component={FormInput}
                        icon={GraduationCap}
                      />

                      <Field
                        name="registration_id"
                        component={FormInput}
                        type="text"
                        placeholder="Registration ID"
                        icon={FileText}
                      />

                      <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-1">Languages Spoken</label>
                        <Field name="languages" component={LanguageSelect} />
                        <ErrorMessage 
                          name="languages" 
                          component="div" 
                          className="text-red-500 text-sm mt-1 ml-1 flex items-start"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Security Section */}
                  <div className="bg-white p-6 rounded-2xl shadow-lg border border-gray-100">
                    <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                      <Lock className="mr-2 text-blue-600" size={20} />
                      Account Security
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Field
                          name="password"
                          component={FormInput}
                          type="password"
                          placeholder="Password"
                          icon={Lock}
                          showToggle={true}
                        />
                        {/* Password strength indicator */}
                        {values.password && (
                          <div className="mt-2">
                            <div className="flex items-center justify-between text-sm mb-1">
                              <span className="text-gray-600">Password strength:</span>
                              <span className={`font-medium ${
                                getPasswordStrength(values.password).strength < 2 ? 'text-red-600' :
                                getPasswordStrength(values.password).strength < 4 ? 'text-yellow-600' :
                                'text-green-600'
                              }`}>
                                {getPasswordStrength(values.password).label}
                              </span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-2">
                              <div 
                                className={`h-2 rounded-full transition-all duration-300 ${getPasswordStrength(values.password).color}`}
                                style={{width: `${(getPasswordStrength(values.password).strength / 5) * 100}%`}}
                              ></div>
                            </div>
                          </div>
                        )}
                      </div>

                      <Field
                        name="password2"
                        component={FormInput}
                        type="password"
                        placeholder="Confirm Password"
                        icon={Lock}
                        showToggle={true}
                      />
                    </div>

                    {/* Password requirements */}
                    <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                      <p className="text-sm font-medium text-gray-700 mb-2">Password must contain:</p>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-1 text-xs text-gray-600">
                        <div className="flex items-center">
                          <div className={`w-2 h-2 rounded-full mr-2 ${values.password?.length >= 8 ? 'bg-green-500' : 'bg-gray-300'}`}></div>
                          At least 8 characters
                        </div>
                        <div className="flex items-center">
                          <div className={`w-2 h-2 rounded-full mr-2 ${/[a-z]/.test(values.password) ? 'bg-green-500' : 'bg-gray-300'}`}></div>
                          Lowercase letter
                        </div>
                        <div className="flex items-center">
                          <div className={`w-2 h-2 rounded-full mr-2 ${/[A-Z]/.test(values.password) ? 'bg-green-500' : 'bg-gray-300'}`}></div>
                          Uppercase letter
                        </div>
                        <div className="flex items-center">
                          <div className={`w-2 h-2 rounded-full mr-2 ${/[0-9]/.test(values.password) ? 'bg-green-500' : 'bg-gray-300'}`}></div>
                          Number
                        </div>
                        <div className="flex items-center">
                          <div className={`w-2 h-2 rounded-full mr-2 ${/[@$!%*?&]/.test(values.password) ? 'bg-green-500' : 'bg-gray-300'}`}></div>
                          Special character
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Agreement Section */}
                  <div className="bg-gray-50 p-6 rounded-2xl border border-gray-200">
                    <div className="space-y-4">
                      <div className="flex items-start">
                        <Field
                          type="checkbox"
                          name="prefer_24hr_consultation"
                          id="prefer_24hr_consultation"
                          className="mt-1 mr-3 h-4 w-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                        />
                        <div className="flex flex-col">
                          <label htmlFor="prefer_24hr_consultation" className="text-sm text-red-700">
                            I offer 24-hour consultation services (OPTIONAL)
                          </label>
                        </div>
                      </div>
                      <div className="flex items-start">
                        <Field
                          type="checkbox"
                          name="agreeToTerms"
                          id="agreeToTerms"
                          className="mt-1 mr-3 h-4 w-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                        />
                        <div className="flex flex-col">
                          <label htmlFor="agreeToTerms" className="text-sm text-gray-700 leading-relaxed">
                            I agree to the <span className="text-blue-600 font-medium hover:underline cursor-pointer">Terms of Service</span> and <span className="text-blue-600 font-medium hover:underline cursor-pointer">Privacy Policy</span>
                          </label>
                          <ErrorMessage 
                            name="agreeToTerms" 
                            component="p" 
                            className="text-red-500 text-sm mt-1" 
                          />
                        </div>
                      </div>
                      <div className="flex items-start">
                        <Field
                          type="checkbox"
                          name="medicalEthics"
                          id="medicalEthics"
                          className="mt-1 mr-3 h-4 w-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                        />
                        <div className="flex flex-col">
                          <label htmlFor="medicalEthics" className="text-sm text-gray-700 leading-relaxed">
                            I commit to upholding medical ethics and professional standards
                          </label>
                          <ErrorMessage 
                            name="medicalEthics" 
                            component="p" 
                            className="text-red-500 text-sm mt-1" 
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Submit button */}
                  <button
                    type="submit"
                    disabled={isSubmitting || isLoading}
                    className="w-full bg-gradient-to-r from-blue-600 to-blue-700 text-white font-semibold py-4 px-6 rounded-xl hover:from-blue-700 hover:to-blue-800 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg transform hover:scale-[1.02] focus:outline-none focus:ring-4 focus:ring-blue-300"
                  >
                    {isSubmitting || isLoading ? (
                      <div className="flex items-center justify-center">
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                        Creating Professional Account...
                      </div>
                    ) : (
                      'Create Doctor Account'
                    )}
                  </button>

                  {/* Sign in link */}
                  <div className="text-center text-gray-600 pt-4">
                    Already have an account?{' '}
                    <span 
                      className="text-blue-600 font-medium cursor-pointer hover:underline transition-colors duration-200"
                      onClick={() => navigate('/login')}
                    >
                      Sign In
                    </span>
                  </div>
                </Form>
              )}
            </Formik>
          </div>
        </div>
      </div>
    </div>
  );
}