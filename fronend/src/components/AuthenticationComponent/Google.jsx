import React from "react";
import { useGoogleLogin } from "@react-oauth/google";
import { useDispatch } from "react-redux";
import { login } from "../../store/authSlice";
import { useNavigate } from "react-router-dom";
import { userAxios } from "../../axios/UserAxios";
import { GoogleLogo } from "../Constants/GoogleLogo";

const GoogleAuthButton = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();

    const handleGoogleLoginSuccess = async (codeResponse) => {
        try {
            console.log('Google login response:', codeResponse);
            if (!codeResponse || !codeResponse.code) {
                throw new Error('Authorization code not found in Google response');
            }

            // Send the authorization code to the backend
            const response = await userAxios.post('google/callback/', {
                code: codeResponse.code
            });

            const data = response.data;

            if (!data.access || !data.refresh) {
                throw new Error('Invalid authentication response from server');
            }

            dispatch(login({
                token: data.access,
                refreshToken: data.refresh,
                user: {
                    username: data.username,
                    email: data.email,
                    role: 'patient',
                    is_profile_complete: data.is_profile_complete || false,
                }
            }));

            navigate('/', { replace: true });
        } catch (error) {
            console.error('Google authentication error: ', error);
            console.error('Error details:', error.response?.data);
        }
    };
    
    const handleGoogleLoginError = (error) => {
        console.error('Google OAuth error:', error);
    };

    const googleLogin = useGoogleLogin({
        flow: 'auth-code',
        onSuccess: handleGoogleLoginSuccess,
        onError: handleGoogleLoginError,
        scope: 'openid email profile',
    });

    return (
        <button
            onClick={() => googleLogin()}
            className="w-full flex items-center justify-center gap-2 bg-white border border-gray-300 text-gray-700 font-medium py-3 px-4 rounded-md hover:bg-gray-50 transition-colors duration-300"
        >
            <GoogleLogo />
            <span>Google</span>
        </button>
    );
};

export default GoogleAuthButton;
