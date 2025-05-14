import React, { useState } from 'react';
import { Mail, ArrowRight, Key } from 'lucide-react';

export default function SendOtpPage() {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  
  const handleSendOtp = () => {
    if (!email) {
      setMessage('Please enter an email address');
      return;
    }
    
    // In a real implementation, this would call your API
    setMessage('OTP sent successfully! Please check your email.');
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-blue-50 to-blue-100 p-4">
      <div className="w-full max-w-md overflow-hidden rounded-2xl bg-white shadow-xl">
        {/* Header */}
        <div className="bg-blue-600 px-6 py-8 text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-white/20 text-white">
            <Key size={32} />
          </div>
          <h1 className="mt-4 text-2xl font-bold text-white">OTP VERIFICATION</h1>
        </div>

        {/* Content */}
        <div className="p-6">
          <div className="mb-6 space-y-2 text-center">
            <h2 className="text-lg font-medium text-gray-800">🖊️ Verify Yourself</h2>
            <p className="text-sm text-gray-600">
              📧 Please enter your email address to receive a verification code.
            </p>
            <p className="text-sm text-gray-600">
              📯 You will receive an OTP (One-Time Password) to verify your identity.
            </p>
          </div>

          <div className="space-y-4">
            <div className="relative">
              <label htmlFor="email" className="mb-1 block text-sm font-medium text-gray-700">
                Email Address*
              </label>
              <div className="relative">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                  <Mail className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email"
                  className="block w-full rounded-lg border border-gray-300 bg-gray-50 p-3 pl-10 text-sm text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  required
                />
              </div>
            </div>

            <button
              onClick={handleSendOtp}
              className="flex w-full items-center justify-center rounded-lg bg-blue-600 px-5 py-3 text-center text-sm font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-4 focus:ring-blue-300"
            >
              SEND OTP
              <ArrowRight className="ml-2 h-4 w-4" />
            </button>
          </div>

          {message && (
            <div className={`mt-4 rounded-lg p-3 text-sm ${message.includes('Error') ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
              {message}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}