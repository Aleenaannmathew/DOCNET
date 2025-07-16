import React from "react";
import { useGoogleLogin } from "@react-oauth/google";
import { useDispatch } from "react-redux";
import { login } from "../../store/authSlice";
import { useNavigate } from "react-router-dom";
import { GoogleLogo } from "../Constants/GoogleLogo";
import { doctorAxios } from "../../axios/DoctorAxios";

const GoogleAuthButton = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();

    const handleGoogleLoginSuccess = async (codeResponse) => {
        try {
            if (!codeResponse || !codeResponse.code) {
                throw new Error('Authorization code not found in Google response');
            }
            const response = await doctorAxios.post('google-login-doctor/', {
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
                    role: 'doctor',
                    is_profile_complete: data.is_profile_complete || false,
                }
            }));

            navigate('/',{replace: true});
        } catch (error) {
            console.error('Google authentication error: ', error);
        }
    };

    const googleLogin = useGoogleLogin({
            onSuccess: handleGoogleLoginSuccess,
            flow: 'auth-code', 
            
        });

    return(
        <button
        onClick={()=> googleLogin()}
        className="w-full flex items-center justify-center gap-2 bg-white border border-gray-300 text-gray-700 font-medium py-3 px-4 rounded-md hover:bg-gray-50 transition-colors duration-300"
        >
            <GoogleLogo/>
            <span>Google</span>
        </button>
    )
}

export default GoogleAuthButton;