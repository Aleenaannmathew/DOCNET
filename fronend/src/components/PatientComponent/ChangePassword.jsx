import React, { useState } from 'react';
import { Lock, Eye, EyeOff, CheckCircle, AlertCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { userAxios } from '../../axios/UserAxios';
import { useDispatch } from 'react-redux';
import { logout } from '../../store/authSlice';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';

// Validation schema using Yup
const passwordChangeSchema = Yup.object().shape({
  oldPassword: Yup.string()
    .required('Current password is required')
    .min(1, 'Current password is required'),
  
  newPassword: Yup.string()
    .required('New password is required')
    .min(8, 'Password must be at least 8 characters long')
    .test('different-from-old', 'New password must be different from current password', function(value) {
      const { oldPassword } = this.parent;
      return value !== oldPassword;
    }),
  
  confirmPassword: Yup.string()
    .required('Please confirm your new password')
    .oneOf([Yup.ref('newPassword')], 'Passwords do not match')
});

const ChangePass = () => {
  const [showPassword, setShowPassword] = useState({
    oldPassword: false,
    newPassword: false,
    confirmPassword: false
  });
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const togglePasswordVisibility = (field) => {
    setShowPassword(prev => ({
      ...prev,
      [field]: !prev[field]
    }));
  };

  const handleSubmit = async (values, { setSubmitting, setFieldError }) => {
    setIsLoading(true);
    setError('');
    setMessage('');
    
    try {
      const response = await userAxios.post('/change-password/', {
        old_password: values.oldPassword,
        new_password: values.newPassword
      });
      
      if (response.data.success) {
        // Navigate to user profile with success message
        navigate('/user-profile', { 
          state: { 
            successMessage: 'Password changed successfully!' 
          } 
        });
      } else {
        throw new Error(response.data.message || 'Failed to change password');
      }
    } catch (error) {
      const errorMessage = error.response?.data?.error || error.message || 'Failed to change password';
      
      // If it's a specific field error (like wrong old password), set field error
      if (error.response?.data?.field) {
        setFieldError(error.response.data.field, errorMessage);
      } else {
        setError(errorMessage);
      }
    } finally {
      setIsLoading(false);
      setSubmitting(false);
    }
  };

  // Custom Field Component for Password Input
  const PasswordField = ({ name, label, placeholder, showPassword, onToggleVisibility, ...props }) => (
    <Field name={name}>
      {({ field, meta }) => (
        <div>
          <label htmlFor={name} className="block text-sm font-medium text-gray-700">
            {label}
          </label>
          <div className="mt-1 relative rounded-md shadow-sm">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Lock className="h-5 w-5 text-gray-400" />
            </div>
            <input
              {...field}
              {...props}
              id={name}
              type={showPassword ? "text" : "password"}
              placeholder={placeholder}
              className={`block w-full pl-10 pr-10 py-2 border ${
                meta.touched && meta.error 
                  ? 'border-red-300 focus:ring-red-500 focus:border-red-500' 
                  : 'border-gray-300 focus:ring-teal-500 focus:border-teal-500'
              } rounded-md shadow-sm focus:outline-none sm:text-sm`}
            />
            <button
              type="button"
              onClick={() => onToggleVisibility(name)}
              className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-500 hover:text-gray-600 focus:outline-none"
            >
              {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
            </button>
          </div>
          <ErrorMessage name={name} component="p" className="mt-2 text-sm text-red-600" />
        </div>
      )}
    </Field>
  );

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
          Change Password
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600">
          Ensure your account security by updating your password regularly
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          {/* Success Message */}
          {message && (
            <div className="mb-4 rounded-md bg-green-50 p-4">
              <div className="flex">
                <div className="flex-shrink-0">
                  <CheckCircle className="h-5 w-5 text-green-400" />
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-green-800">{message}</p>
                </div>
              </div>
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="mb-4 rounded-md bg-red-50 p-4">
              <div className="flex">
                <div className="flex-shrink-0">
                  <AlertCircle className="h-5 w-5 text-red-400" />
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-red-800">{error}</p>
                </div>
              </div>
            </div>
          )}

          <Formik
            initialValues={{
              oldPassword: '',
              newPassword: '',
              confirmPassword: ''
            }}
            validationSchema={passwordChangeSchema}
            onSubmit={handleSubmit}
            validateOnChange={true}
            validateOnBlur={true}
          >
            {({ isSubmitting, isValid, dirty }) => (
              <Form className="space-y-6">
                {/* Current Password */}
                <PasswordField
                  name="oldPassword"
                  label="Current Password"
                  placeholder="Enter your current password"
                  showPassword={showPassword.oldPassword}
                  onToggleVisibility={togglePasswordVisibility}
                />

                {/* New Password */}
                <div>
                  <PasswordField
                    name="newPassword"
                    label="New Password"
                    placeholder="Enter your new password"
                    showPassword={showPassword.newPassword}
                    onToggleVisibility={togglePasswordVisibility}
                  />
                  <p className="mt-2 text-xs text-gray-500">
                    Password must be at least 8 characters long
                  </p>
                </div>

                {/* Confirm New Password */}
                <PasswordField
                  name="confirmPassword"
                  label="Confirm New Password"
                  placeholder="Confirm your new password"
                  showPassword={showPassword.confirmPassword}
                  onToggleVisibility={togglePasswordVisibility}
                />

                <div>
                  <button
                    type="submit"
                    disabled={isLoading || isSubmitting || !isValid || !dirty}
                    className={`w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-teal-600 hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500 ${
                      (isLoading || isSubmitting || !isValid || !dirty) 
                        ? 'opacity-70 cursor-not-allowed' 
                        : ''
                    }`}
                  >
                    {isLoading || isSubmitting ? 'Updating...' : 'Change Password'}
                  </button>
                </div>
              </Form>
            )}
          </Formik>
        </div>
      </div>
    </div>
  );
};

export default ChangePass;