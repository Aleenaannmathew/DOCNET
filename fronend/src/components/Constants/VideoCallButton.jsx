import React, { useState } from 'react';
import { FiVideo } from 'react-icons/fi';
import axios from 'axios';
import VideoCall from './Video';
import { userAxios } from '../../axios/UserAxios';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const VideoCallButton = ({ slotId, token }) => {
  const [showVideoCall, setShowVideoCall] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleVideoCall = async () => {
    setLoading(true);
    
    try {
      const response = await userAxios.get(`/validate-videocall/${slotId}/`);
      
      if (response.data.valid) {
        setShowVideoCall(true);
      } else {
        toast.error(response.data.error || 'Video call not available');
      }
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to start video call');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <button
        onClick={handleVideoCall}
        disabled={loading}
        className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-xl hover:shadow-lg transition-all duration-200 font-medium disabled:opacity-50"
      >
        <FiVideo className="w-4 h-4" />
        <span>{loading ? 'Checking...' : 'Video Call'}</span>
      </button>

      {showVideoCall && (
        <VideoCall 
          slotId={slotId} 
          token={token} 
          onEndCall={() => setShowVideoCall(false)} 
        />
      )}

      {/* Toast Container */}
      <ToastContainer position="top-right" autoClose={3000} />
    </>
  );
};

export default VideoCallButton;
