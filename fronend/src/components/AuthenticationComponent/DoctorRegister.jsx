import React, { useState } from 'react';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import { Lock, Mail, Phone, User, FileText, Building, Globe } from 'lucide-react';
import docImg from '../../assets/doctor1.png';
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

  const removeLanguage = (languageToRemove) => {
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
        className={`w-full pl-12 pr-4 py-3 rounded-lg border ${
          form.errors.languages && form.touched.languages 
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
                onClick={(e) => {
                  e.stopPropagation();
                  removeLanguage(language);
                }}
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
              className={`px-4 py-2 cursor-pointer hover:bg-gray-100 ${
                selectedLanguages.includes(language) ? 'bg-teal-50 text-teal-700' : ''
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

const validationSchema = Yup.object({
  username: Yup.string()
    .min(3, 'Username must be at least 3 characters')
    .required('Username is required'),
  
  email: Yup.string()
    .email('Please enter a valid email')
    .required('Email is required'),
  
  phone: Yup.string()
    .matches(/^[0-9]{10,15}$/, 'Phone number must be 10-15 digits only')
    .required('Phone number is required'),
  
  password: Yup.string()
    .min(8, 'Password must be at least 8 characters')
    .required('Password is required'),
  
  password2: Yup.string()
    .oneOf([Yup.ref('password')], 'Passwords do not match')
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
  
  agreeToTerms: Yup.boolean()
    .oneOf([true], 'You must agree to the terms and conditions')
    .required('You must agree to the terms and conditions')
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
  agreeToTerms: false
};

const CustomField = ({ icon: Icon, error, touched, ...props }) => (
  <div className="relative mb-4">
    <div className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-500">
      <Icon size={18} />
    </div>
    <Field
      {...props}
      className={`w-full pl-12 pr-4 py-3 rounded-lg border ${
        error && touched 
          ? 'border-red-500 focus:ring-red-500' 
          : 'border-gray-300 focus:ring-teal-500'
      } focus:ring-2 focus:border-transparent outline-none`}
    />
    <ErrorMessage name={props.name} component="p" className="text-red-500 text-sm mt-1" />
  </div>
);

const CustomFieldNoIcon = ({ error, touched, ...props }) => (
  <div className="mb-4">
    <Field
      {...props}
      className={`w-full px-4 py-3 rounded-lg border ${
        error && touched 
          ? 'border-red-500 focus:ring-red-500' 
          : 'border-gray-300 focus:ring-teal-500'
      } focus:ring-2 focus:border-transparent outline-none`}
    />
    <ErrorMessage name={props.name} component="p" className="text-red-500 text-sm mt-1" />
  </div>
);

export default function DoctorRegistration() {
  const [isLoading, setIsLoading] = useState(false);
  const [generalError, setGeneralError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (values, { setErrors, setFieldError }) => {
    setIsLoading(true);
    setGeneralError('');
    
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
      data.append('languages', Array.isArray(values.languages) ? values.languages.join(', ') : values.languages);
      data.append('age', values.age);
      data.append('gender', values.gender);
      data.append('experience', values.experience);
      
      console.log("Sending doctor registration request...");
      const response = await doctorAxios.post('/doctor-register/', data);
      console.log("Registration response", response.data);

      if (response.data && response.data.user_id) {
        console.log("Navigating to OTP page...");
        navigate('/doctor/doctor-verify-otp', { 
          state: {
            userId: response.data.user_id, 
            email: response.data.email,
            userType: 'doctor'
          }
        });
      } else {
        console.error("Unexpected response format - no user_id:", response.data);
        setGeneralError('Registration successful but could not proceed to verification. Please try logging in.');
      }
    } catch (error) {
      console.error('Registration failed:', error);
      
      if (error.response && error.response.data) {
        const serverErrors = error.response.data;
        
        const newErrors = {};
        Object.keys(serverErrors).forEach(key => {
          newErrors[key] = Array.isArray(serverErrors[key]) 
            ? serverErrors[key][0] 
            : serverErrors[key];
        });
        
        setErrors(newErrors);
      } else {
        setGeneralError('Registration failed. Please try again later.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return <DocnetLoading />;
  }

  return (
    <div className="flex flex-col lg:flex-row min-h-screen bg-gray-50">
      <div className="hidden lg:flex lg:w-1/2 bg-white p-8 flex-col">
        <div className="mb-8">
          <h1 className="text-teal-700 font-bold text-3xl">DOCNET</h1>
          <h2 className="text-gray-800 font-medium text-2xl mt-4">
            Join our network of trusted<br />
            healthcare professionals.
          </h2>
          <p className="text-gray-600 mt-2">Your expertise, our platform</p>
        </div>
        <div className="flex-1 flex items-center justify-center">
          <img
            src={docImg}
            alt="Medical professional"
            className="w-4/5 max-w-lg h-auto"
          />
        </div>
      </div>

      <div className="w-full lg:w-1/2 bg-gray-50 p-6 md:p-10 flex justify-center items-center">
        <div className="w-full max-w-md">
          <div className="block lg:hidden mb-8">
            <h1 className="text-teal-700 font-bold text-3xl">DOCNET</h1>
            <h2 className="text-gray-800 font-medium text-xl mt-4">
              Join our network of trusted healthcare professionals.
            </h2>
            <p className="text-gray-600 mt-2">Your expertise, our platform</p>
          </div>

          <h2 className="text-2xl md:text-3xl font-bold text-gray-800 mb-1">Doctor Registration</h2>
          <p className="text-gray-600 mb-8">
            Sign up as a healthcare professional and connect with patients.
          </p>

          {generalError && (
            <div className="mb-4 bg-red-50 border-l-4 border-red-500 text-red-700 p-4 rounded">
              {generalError}
            </div>
          )}

          <Formik
            initialValues={initialValues}
            validationSchema={validationSchema}
            onSubmit={handleSubmit}
          >
            {({ errors, touched, isSubmitting }) => (
              <Form className="flex flex-col space-y-4">
                <div className="border-b border-gray-200 pb-4 mb-2">
                  <h3 className="text-lg font-semibold text-gray-800 mb-4">Personal Information</h3>
                  
                  <CustomField
                    icon={User}
                    name="username"
                    type="text"
                    placeholder="User Name"
                    error={errors.username}
                    touched={touched.username}
                  />

                  <CustomField
                    icon={Mail}
                    name="email"
                    type="email"
                    placeholder="Email Address"
                    error={errors.email}
                    touched={touched.email}
                  />

                  <CustomField
                    icon={Phone}
                    name="phone"
                    type="tel"
                    placeholder="Phone Number"
                    error={errors.phone}
                    touched={touched.phone}
                  />

                  <CustomField
                    icon={Lock}
                    name="password"
                    type="password"
                    placeholder="Password"
                    error={errors.password}
                    touched={touched.password}
                  />

                  <CustomField
                    icon={Lock}
                    name="password2"
                    type="password"
                    placeholder="Confirm Password"
                    error={errors.password2}
                    touched={touched.password2}
                  />
                </div>

                <div className="pb-4">
                  <h3 className="text-lg font-semibold text-gray-800 mb-4">Professional Information</h3>
                  
                  <CustomField
                    icon={FileText}
                    name="registration_id"
                    type="text"
                    placeholder="Registration ID"
                    error={errors.registration_id}
                    touched={touched.registration_id}
                  />

                  <CustomField
                    icon={Building}
                    name="hospital"
                    type="text"
                    placeholder="Hospital Name (Optional)"
                    error={errors.hospital}
                    touched={touched.hospital}
                  />

                  <CustomField
                    icon={User}
                    name="specialization"
                    type="text"
                    placeholder="Specialization"
                    error={errors.specialization}
                    touched={touched.specialization}
                  />

                  <div className="mb-4">
                    <Field name="languages" component={LanguageSelect} />
                    <ErrorMessage name="languages" component="p" className="text-red-500 text-sm mt-1" />
                  </div>

                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div>
                      <CustomFieldNoIcon
                        name="age"
                        type="number"
                        placeholder="Age"
                        min="21"
                        max="80"
                        error={errors.age}
                        touched={touched.age}
                      />
                    </div>
                    <div>
                      <Field
                        as="select"
                        name="gender"
                        className={`w-full px-4 py-3 rounded-lg border ${
                          errors.gender && touched.gender
                            ? 'border-red-500 focus:ring-red-500' 
                            : 'border-gray-300 focus:ring-teal-500'
                        } focus:ring-2 focus:border-transparent outline-none`}
                      >
                        <option value="">Select Gender</option>
                        <option value="male">Male</option>
                        <option value="female">Female</option>
                        <option value="other">Other</option>
                      </Field>
                      <ErrorMessage name="gender" component="p" className="text-red-500 text-sm mt-1" />
                    </div>
                  </div>

                  <CustomFieldNoIcon
                    name="experience"
                    type="number"
                    placeholder="Years of Experience"
                    min="0"
                    error={errors.experience}
                    touched={touched.experience}
                  />
                </div>

                <div className="flex items-center mb-4">
                  <Field
                    type="checkbox"
                    name="agreeToTerms"
                    id="agreeToTerms"
                    className="mr-2"
                  />
                  <label htmlFor="agreeToTerms" className="text-sm text-gray-700">
                    I agree to the <span className="text-teal-500">Terms of Use</span> and <span className="text-teal-500">Privacy Policy</span>
                  </label>
                </div>
                <ErrorMessage name="agreeToTerms" component="p" className="text-red-500 text-sm mt-1" />

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-teal-700 text-white font-medium py-3 px-4 rounded-lg hover:bg-teal-800 transition-colors disabled:opacity-50"
                >
                  {isSubmitting ? 'Creating Account...' : 'Create Doctor Account'}
                </button>

                <div className="text-center text-gray-600">
                  Already have an account?{' '}
                  <span 
                    className="text-teal-500 cursor-pointer"
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
  );
}