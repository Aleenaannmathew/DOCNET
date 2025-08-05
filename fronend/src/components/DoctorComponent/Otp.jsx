import React, { useState, useEffect, useRef } from 'react';
import { Key, ArrowRight, RefreshCw, AlertTriangle, CheckCircle } from 'lucide-react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { login } from '../../store/authSlice';
import DocnetLoading from '../Constants/Loading';
import { doctorAxios } from '../../axios/DoctorAxios';
import { userAxios } from '../../axios/UserAxios';

export default function DoctorOtpVerificationPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const { userId, email, isPasswordReset } = location.state || {};

  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [remainingTime, setRemainingTime] = useState(120);
  const inputRefs = useRef([]);
  const timerRef = useRef(null);

  useEffect(() => {
    startTimer();

    if (!email) {
      navigate(isPasswordReset ? '/doctor/doctor-reset-password' : '/doctor/register');
    }

    if (inputRefs.current[0]) {
      inputRefs.current[0].focus();
    }

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [email, isPasswordReset, navigate]);

  const startTimer = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }

    timerRef.current = setInterval(() => {
      setRemainingTime(prev => {
        if (prev <= 1) {
          clearInterval(timerRef.current);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const handleChange = (index, value) => {
    if (!/^\d?$/.test(value)) return;

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    if (value && index < 5) {
      inputRefs.current[index + 1].focus();
    }
  };

  const handleKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1].focus();
    }
  };

  const handleVerify = async () => {
    const otpValue = otp.join('');
    if (otpValue.length !== 6) {
      setError('Please enter a complete 6-digit OTP');
      return;
    }

    setIsLoading(true);
    try {
      if (isPasswordReset) {
        const response = await doctorAxios.post('/verify-password-reset-otp/', {
          email,
          otp: otpValue,
        });
        console.log('OTP Verification Response:', response.data);

        if (response.data.success) {
          const resetToken = response.data.reset_token;

          console.log("Navigating to reset password with token:", resetToken);

          navigate('/doctor/doctor-reset-password', {
            state: {
              email,
              resetToken,
              verified: true
            },
            replace: true
          });
        } else {
          throw new Error(response.data.message || 'OTP verification failed');
        }
      } else {
        const response = await doctorAxios.post('/verify-otp/', {
          user_id: userId,
          otp: otpValue
        });

        if (response.data.success) {
          navigate('/doctor/doctor-login?verified=true', {
            replace: true
          });
        } else {
          throw new Error(response.data.message || 'OTP verification failed');
        }
      }
    } catch (error) {
      setOtp(['', '', '', '', '', '']);
      if (inputRefs.current[0]) {
        inputRefs.current[0].focus();
      }

      setError(error.response?.data?.error || error.message || 'OTP verification failed');
      setMessage('');
    } finally {
      setIsLoading(false);
    }
  };

  const handleResend = async () => {
    setIsLoading(true);
    try {
      let response;
      if (isPasswordReset) {
        response = await doctorAxios.post('/send-password-reset-otp/', { email });
      } else {
        response = await doctorAxios.post('/resend-otp/', { user_id: userId });
      }

      if (response.data.success) {
        setMessage('OTP resent successfully');
        setError('');
        setRemainingTime(120);
        startTimer();
      } else {
        throw new Error(response.data.message || 'Failed to resend OTP');
      }
    } catch (error) {
      setError(error.response?.data?.error || error.message || 'Failed to resend OTP');
      setMessage('');
    } finally {
      setIsLoading(false);
    }
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  if (isLoading) {
    return <DocnetLoading />;
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-teal-50 to-teal-100 p-4">
      <div className="w-full max-w-md overflow-hidden rounded-2xl bg-white shadow-xl">
        <div className="bg-teal-700 px-6 py-8 text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-white/20 text-white">
            <Key size={32} />
          </div>
          <h1 className="mt-4 text-2xl font-bold text-white">
            {isPasswordReset ? 'PASSWORD RESET VERIFICATION' : 'OTP VERIFICATION'}
          </h1>
        </div>

        <div className="p-6">
          <div className="mb-6 space-y-2 text-center">
            <p className="text-sm text-gray-600">
              📧 OTP sent to your email: <span className="font-medium">{email || "user@example.com"}</span>
            </p>
            <p className="text-sm text-gray-600">
              Enter the 6-digit code below to {isPasswordReset ? 'reset your password' : 'verify your identity'}
            </p>
          </div>

          <div className="mb-8 flex justify-center gap-2 sm:gap-4">
            {otp.map((digit, index) => (
              <input
                key={index}
                ref={(el) => (inputRefs.current[index] = el)}
                type="text"
                inputMode="numeric"
                maxLength="1"
                value={digit}
                onChange={(e) => handleChange(index, e.target.value)}
                onKeyDown={(e) => handleKeyDown(index, e)}
                className="h-12 w-12 rounded-lg border border-gray-300 bg-gray-50 text-center text-xl font-semibold text-gray-900 focus:border-teal-500 focus:outline-none focus:ring-1 focus:ring-teal-500 sm:h-14 sm:w-14"
              />
            ))}
          </div>

          <div className="mb-4 text-center">
            {remainingTime > 0 ? (
              <div className="flex items-center justify-center space-x-2">
                <span className="text-sm font-medium text-teal-700">Code expires in:</span>
                <span className="flex h-8 items-center justify-center rounded-full bg-teal-100 px-3 text-sm font-bold text-teal-800">
                  {formatTime(remainingTime)}
                </span>
              </div>
            ) : (
              <div className="flex items-center justify-center space-x-2 text-teal-700">
                <span className="text-sm font-medium">
                  Didn't receive code? Click 'RESEND OTP'
                </span>
              </div>
            )}
          </div>

          {message && (
            <div className="mt-4 mb-6 flex items-center rounded-lg bg-green-100 p-4 text-left text-sm text-green-800">
              <CheckCircle className="mr-3 h-5 w-5 flex-shrink-0" />
              <span>{message}</span>
            </div>
          )}

          {error && (
            <div className="mt-4 mb-6 flex items-center rounded-lg bg-red-100 p-4 text-left text-sm text-red-800">
              <AlertTriangle className="mr-3 h-5 w-5 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <div className="flex flex-col gap-4 sm:flex-row sm:justify-center">
            <button
              onClick={handleVerify}
              disabled={isLoading}
              className="flex items-center justify-center rounded-lg bg-teal-700 px-5 py-3 text-center text-sm font-medium text-white hover:bg-teal-800 focus:outline-none focus:ring-4 focus:ring-teal-300 sm:w-auto disabled:opacity-70"
            >
              VERIFY
              <ArrowRight className="ml-2 h-4 w-4" />
            </button>
            <button
              onClick={handleResend}
              disabled={remainingTime > 0 || isLoading}
              className="flex items-center justify-center rounded-lg bg-gray-600 px-5 py-3 text-center text-sm font-medium text-white hover:bg-gray-700 focus:outline-none focus:ring-4 focus:ring-gray-300 sm:w-auto disabled:opacity-50"
            >
              RESEND OTP
              <RefreshCw className="ml-2 h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
