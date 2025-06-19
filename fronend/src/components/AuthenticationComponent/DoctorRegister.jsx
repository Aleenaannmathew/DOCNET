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
  FileText
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

const CustomField = ({ icon: Icon, name, type, placeholder, error, touched }) => (
  <div className="mb-4">
    <div className="relative">
      <div className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-500">
        <Icon size={18} />
      </div>
      <Field
        name={name}
        type={type}
        placeholder={placeholder}
        className={`w-full pl-12 pr-4 py-3 rounded-xl border ${error && touched
          ? 'border-red-400 focus:ring-red-400'
          : 'border-gray-200 focus:ring-blue-500'
          } focus:ring-2 focus:border-transparent outline-none shadow-sm transition-all duration-200`}
      />
    </div>
    <ErrorMessage
      name={name}
      component="p"
      className="text-red-500 text-sm mt-1 ml-1"
    />
  </div>
);

const CustomFieldNoIcon = ({ name, type, placeholder, error, touched, min, max }) => (
  <div className="mb-4">
    <Field
      name={name}
      type={type}
      placeholder={placeholder}
      min={min}
      max={max}
      className={`w-full px-4 py-3 rounded-xl border ${error && touched
        ? 'border-red-400 focus:ring-red-400'
        : 'border-gray-200 focus:ring-blue-500'
        } focus:ring-2 focus:border-transparent outline-none shadow-sm transition-all duration-200`}
    />
    <ErrorMessage
      name={name}
      component="p"
      className="text-red-500 text-sm mt-1 ml-1"
    />
  </div>
);

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

  prefer_24hr_consultation: Yup.boolean(),

  agreeToTerms: Yup.boolean()
    .oneOf([true], 'You must agree to the terms and conditions')
    .required('You must agree to the terms and conditions'),

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

export default function DoctorRegister() {
  const [isLoading, setIsLoading] = useState(false);
  const [generalError, setGeneralError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (values, { setErrors }) => {
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
      data.append('languages', values.languages.join(', '));
      data.append('age', values.age);
      data.append('gender', values.gender);
      data.append('experience', values.experience);
      data.append('prefer_24hr_consultation', values.prefer_24hr_consultation);
      data.append('agreeToTerms', values.agreeToTerms);
      data.append('medicalEthics', values.medicalEthics);

      console.log("Sending doctor registration request...");
      const response = await doctorAxios.post('/doctor-register/', data);
      console.log("Registration response", response.data);

      if (response.data && response.data.user_id) {
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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      <div className="flex flex-col lg:flex-row min-h-screen">
        {/* Left Section - Professional Medical Branding */}
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

            {/* Professional Features */}
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

        {/* Right Section - Registration Form */}
        <div className="w-full lg:w-3/5 p-6 md:p-12 flex justify-center items-center">
          <div className="w-full max-w-2xl">
            {/* Mobile Header */}
            <div className="block lg:hidden mb-8 text-center">
              <div className="flex items-center justify-center mb-4">
                <Stethoscope className="mr-3 text-blue-600" size={32} />
                <h1 className="font-bold text-3xl text-blue-600">DOCNET</h1>
              </div>
              <h2 className="font-semibold text-xl text-gray-800">
                Join Our Medical Professional Network
              </h2>
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
                <Form className="space-y-6">
                  {/* Personal Information Section */}
                  <div className="bg-white p-6 rounded-2xl shadow-lg border border-gray-100">
                    <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                      <User className="mr-2 text-blue-600" size={20} />
                      Personal Information
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                      <CustomFieldNoIcon
                        name="age"
                        type="number"
                        placeholder="Age"
                        min="21"
                        max="80"
                        error={errors.age}
                        touched={touched.age}
                      />
                      <div className="mb-4">
                        <Field
                          as="select"
                          name="gender"
                          className={`w-full px-4 py-3 rounded-lg border ${errors.gender && touched.gender
                            ? 'border-red-500 focus:ring-red-500'
                            : 'border-gray-300 focus:ring-teal-500'
                            } focus:ring-2 focus:border-transparent outline-none`}
                        >
                          <option value="">Select Gender</option>
                          {genderOptions.map(option => (
                            <option key={option} value={option.toLowerCase()}>{option}</option>
                          ))}
                        </Field>
                        <ErrorMessage
                          name="gender"
                          component="p"
                          className="text-red-500 text-sm mt-1"
                        />
                      </div>
                      <CustomField
                        icon={Building}
                        name="hospital"
                        type="text"
                        placeholder="Hospital Name (Optional)"
                        error={errors.hospital}
                        touched={touched.hospital}
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
                          <div className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-500">
                            <GraduationCap size={18} />
                          </div>
                          <Field
                            as="select"
                            name="specialization"
                            className={`w-full pl-12 pr-4 py-3 rounded-lg border ${errors.specialization && touched.specialization
                              ? 'border-red-500 focus:ring-red-500'
                              : 'border-gray-300 focus:ring-teal-500'
                              } focus:ring-2 focus:border-transparent outline-none`}
                          >
                            <option value="">Select Specialization</option>
                            {specializations.map(spec => (
                              <option key={spec} value={spec}>{spec}</option>
                            ))}
                          </Field>
                        </div>
                        <ErrorMessage
                          name="specialization"
                          component="p"
                          className="text-red-500 text-sm mt-1"
                        />
                      </div>
                      <CustomFieldNoIcon
                        name="experience"
                        type="number"
                        placeholder="Years of Experience"
                        min="0"
                        error={errors.experience}
                        touched={touched.experience}
                      />
                      <CustomField
                        icon={FileText}
                        name="registration_id"
                        type="text"
                        placeholder="Registration ID"
                        error={errors.registration_id}
                        touched={touched.registration_id}
                      />
                      <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-1">Languages Spoken</label>
                        <Field name="languages" component={LanguageSelect} />
                        <ErrorMessage name="languages" component="p" className="text-red-500 text-sm mt-1" />
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
                  </div>



                  {/* Agreement Section */}
                  <div className="bg-gray-50 p-6 rounded-2xl border border-gray-200">
                    <div className="space-y-4">
                      <div className="flex items-start">

                        <Field
                          type="checkbox"
                          name="prefer_24hr_consultation"
                          id="prefer_24hr_consultation"
                          className="mt-1 mr-2"
                        />
                        <div className="flex flex-col">
                          <label htmlFor="prefer_24hr_consultation" className="text-sm text-red-700">
                            I offer 24-hour consultation services (OPTIONAL)
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
                          name="agreeToTerms"
                          id="agreeToTerms"
                          className="mt-1 mr-2"
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
                          className="mt-1 mr-2"
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

                  {/* Submit Button */}
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full bg-gradient-to-r from-blue-600 to-blue-700 text-white font-semibold py-4 px-6 rounded-xl hover:from-blue-700 hover:to-blue-800 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg transform hover:scale-[1.02] focus:outline-none focus:ring-4 focus:ring-blue-300"
                  >
                    {isSubmitting ? (
                      <div className="flex items-center justify-center">
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                        Creating Professional Account...
                      </div>
                    ) : (
                      'Create Doctor Account'
                    )}
                  </button>

                  {/* Sign In Link */}
                  <div className="text-center text-gray-600 pt-4">
                    Already have an account?{' '}
                    <span
                      className="text-blue-600 font-medium cursor-pointer hover:underline transition-colors duration-200"
                      onClick={() => navigate('/login')}
                    >
                      Sign In Here
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