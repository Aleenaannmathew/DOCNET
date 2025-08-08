import React, { useState } from 'react';
import { Video, Loader2, AlertCircle } from 'lucide-react';
import EmergencyVideoCall from './EmergencyVideo';

const EmergencyVideoCallButton = ({
    emergencyId,
    token,
    isDoctor = false,
    isPatient = false,
    consultationStarted = false,
    consultationEnded = false,
    className = '',
    size = 'default' 
}) => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [showVideoCall, setShowVideoCall] = useState(false);
    const [retryCount, setRetryCount] = useState(0);

    const handleVideoCall = async () => {
        if (!emergencyId || !token) {
            setError('Missing required information for video call');
            return;
        }

        setLoading(true);
        setError(null);

        try {
            const response = await fetch(`/api/validate-emergency-video-call/${emergencyId}/`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
            });

            if (!response.ok) {
                throw new Error(`Request failed with status ${response.status}`);
            }

            // Try to parse as JSON, but don't fail if it's not
            try {
                const data = await response.json();
                if (data?.valid) {
                    setShowVideoCall(true);
                } else {
                    throw new Error(data?.message || 'Video call access denied');
                }
            } catch (e) {
                // If not JSON, but response was ok, assume valid
                setShowVideoCall(true);
            }
        } catch (error) {
            console.error('Error starting emergency video call:', error);
            
            if (retryCount < 2) {
                setRetryCount(prev => prev + 1);
                setTimeout(handleVideoCall, 2000);
                setError(`Connection issue. Retrying... (${retryCount + 1}/3)`);
            } else {
                // Provide more specific error messages
                if (error.message.includes('NetworkError') || error.message.includes('fetch')) {
                    setError('Network error. Please check your connection and try again.');
                } else if (error.message.includes('401')) {
                    setError('Session expired. Please log in again.');
                } else if (error.message.includes('403')) {
                    setError('You do not have permission to access this video call.');
                } else if (error.message.includes('404')) {
                    setError('Video call service not available. Please contact support.');
                } else if (error.message.includes('500')) {
                    setError('Server error. Please try again later.');
                } else {
                    setError(error.message || 'Failed to connect to video call');
                }
            }
        } finally {
            setLoading(false);
        }
    };

    const handleEndCall = () => {
        setShowVideoCall(false);
        setError(null);
        setRetryCount(0);
    };

    const getButtonSize = () => {
        switch (size) {
            case 'small':
                return 'px-3 py-1.5 text-xs';
            case 'large':
                return 'px-6 py-3 text-base';
            default:
                return 'px-4 py-2 text-sm';
        }
    };

    const getIconSize = () => {
        switch (size) {
            case 'small':
                return 'w-3 h-3';
            case 'large':
                return 'w-5 h-5';
            default:
                return 'w-4 h-4';
        }
    };

    // Show video call component if active
    if (showVideoCall) {
        return (
            <EmergencyVideoCall
                emergencyId={emergencyId}
                token={token}
                onEndCall={handleEndCall}
            />
        );
    }

    // Don't show button if consultation has ended
    if (consultationEnded) {
        return null;
    }

    // Show different states based on consultation status and user role
    let buttonText = 'Join Video Call';
    let buttonColor = 'bg-green-600 hover:bg-green-700';
    let disabled = false;

    if (isDoctor && !consultationStarted) {
        buttonText = 'Start Emergency Call';
        buttonColor = 'bg-red-600 hover:bg-red-700';
    } else if (isPatient && !consultationStarted) {
        buttonText = 'Waiting for Doctor';
        buttonColor = 'bg-gray-400';
        disabled = true;
    } else if (consultationStarted) {
        buttonText = 'Join Emergency Call';
        buttonColor = 'bg-green-600 hover:bg-green-700';
    }

    return (
        <div className="flex flex-col">
            <button
                onClick={handleVideoCall}
                disabled={loading || disabled}
                className={`
                    ${buttonColor} 
                    disabled:bg-gray-400 
                    text-white 
                    ${getButtonSize()} 
                    rounded-lg 
                    font-medium 
                    flex 
                    items-center 
                    space-x-2 
                    transition-all 
                    duration-200 
                    shadow-sm 
                    hover:shadow-md 
                    focus:outline-none 
                    focus:ring-2 
                    focus:ring-offset-2 
                    focus:ring-green-500
                    ${className}
                `}
                title={disabled ? "Waiting for doctor to start consultation" : "Join emergency video consultation"}
            >
                {loading ? (
                    <Loader2 className={`${getIconSize()} animate-spin`} />
                ) : (
                    <Video className={getIconSize()} />
                )}
                <span>{loading ? 'Connecting...' : buttonText}</span>
            </button>

            {error && (
                <div className="mt-2 text-xs text-red-600 flex items-center space-x-1">
                    <AlertCircle className="w-3 h-3" />
                    <span>{error}</span>
                </div>
            )}

            {isPatient && !consultationStarted && (
                <div className="mt-1 text-xs text-gray-500">
                    The doctor will start the consultation shortly
                </div>
            )}
        </div>
    );
};

export default EmergencyVideoCallButton;