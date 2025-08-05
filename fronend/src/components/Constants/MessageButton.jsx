import React, { useState, useEffect } from 'react';
import { FiMessageSquare } from 'react-icons/fi';
import { userAxios } from '../../axios/UserAxios';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';

const ChatAccessButton = ({ slotId }) => {
  const [roomId, setRoomId] = useState(null);
  const [loading, setLoading] = useState(false);
  const { user } = useSelector((state) => state.auth);
  const navigate = useNavigate();

  const handleChatAccess = async () => {
    setLoading(true);
    try {
      const response = await userAxios.get(`/validate-chat/${slotId}/`);
      if (response.data.valid) {
        setRoomId(response.data.room_id);
      } else {
        toast.error(response.data.error || 'Chat not available');
      }
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to validate chat');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (roomId) {
      if (user?.role === 'patient') {
        navigate(`/chat-room/${roomId}`);
      } else if (user?.role === 'doctor') {
        navigate(`/doctor/chat-room/${roomId}`);
      } else {
        toast.error('Unknown user role');
      }
    }
  }, [roomId, user, navigate]);

  return (
    <>
      <button
        onClick={handleChatAccess}
        disabled={loading}
        className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-xl hover:shadow-lg transition-all duration-200 font-medium disabled:opacity-50"
      >
        <FiMessageSquare className="w-4 h-4" />
        <span>{loading ? 'Checking...' : 'Open Chat'}</span>
      </button>

      <ToastContainer position="top-right" autoClose={3000} />
    </>
  );
};

export default ChatAccessButton;
