import React, { useState, useEffect } from 'react';
import {
  Bell, Clock, User, Lock, History
} from 'lucide-react';
import * as Icons from 'lucide-react';
import Navbar from './Navbar';
import PatientSidebar from './SideBar';
import { ToastContainer } from 'react-toastify';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import Footer from './Footer';
import { userAxios } from '../../axios/UserAxios';

const NotificationsPage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user, token } = useSelector(state => state.auth);
  const [notifications, setNotifications] = useState([]);
  const [filter, setFilter] = useState('all');
  const [activeTab, setActiveTab] = useState('notifications');
  const [loading, setLoading] = useState(true);

  const iconMap = {
    appointment: 'Calendar',
    medical: 'FileText',
    system: 'CheckCircle',
    emergency: 'AlertTriangle',
    info: 'Info',
    default: 'Bell'
  };

  const getColorClass = (type) => {
    switch (type) {
      case 'appointment': return 'text-blue-500';
      case 'medical': return 'text-green-500';
      case 'system': return 'text-yellow-500';
      case 'emergency': return 'text-red-500';
      case 'info': return 'text-purple-500';
      default: return 'text-gray-500';
    }
  };

  const getProfileImageUrl = () => {
    if (user?.profile_image) return user.profile_image;
    return `https://ui-avatars.com/api/?name=${user?.username?.charAt(0) || 'U'}&background=random&color=fff&size=128`;
  };

  const fetchNotifications = async () => {
    try {
      const res = await userAxios.get('user-notifications/');
      const mapped = res.data.map(n => ({
        ...n,
        icon: iconMap[n.notification_type] || iconMap.default,
        color: getColorClass(n.notification_type),
        time: new Date(n.created_at).toLocaleString()
      }));
      setNotifications(mapped);
    } catch (err) {
      console.error('Fetch error', err);
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (id) => {
    try {
      await userAxios.post(`user-notifications/${id}/mark-read/`);
      setNotifications(notifications.map(n => n.id === id ? { ...n, is_read: true } : n));
    } catch (err) {
      console.error('Mark read error', err);
    }
  };

  const markAllAsRead = async () => {
    try {
      await userAxios.post('user-notifications/mark-all-read/');
      setNotifications(notifications.map(n => ({ ...n, is_read: true })));
    } catch (err) {
      console.error('Mark all read error', err);
    }
  };

  const deleteNotification = async (id) => {
    try {
      await userAxios.delete(`user-notifications/${id}/delete/`);
      setNotifications(notifications.filter(n => n.id !== id));
    } catch (err) {
      console.error('Delete error', err);
    }
  };

  const filteredNotifications = notifications.filter(n =>
    filter === 'all' ? true : filter === 'read' ? n.is_read : !n.is_read
  );

  const unreadCount = notifications.filter(n => !n.is_read).length;

  useEffect(() => {
    if (!user) return;
    fetchNotifications();
  }, [user]);

  if (!user) {
    return (
      <div className="min-h-screen flex justify-center items-center bg-gradient-to-br from-blue-50 to-purple-50">
        <div className="bg-white p-8 rounded-2xl shadow-xl text-center max-w-md">
          <div className="w-16 h-16 bg-gradient-to-br from-blue-600 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <User className="text-white" size={32} />
          </div>
          <h2 className="text-xl font-bold text-gray-800 mb-2">Access Required</h2>
          <p className="text-gray-600 mb-6">Please log in to view your notifications </p>
          <button
            onClick={() => navigate('/login')}
            className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-8 py-3 rounded-full font-medium hover:shadow-lg transition-all duration-200 transform hover:scale-105"
          >
            Go to Login
          </button>
        </div>
      </div>
    );
  }

  if (user.role !== 'patient') {
    return (
      <div className="min-h-screen flex justify-center items-center bg-gradient-to-br from-blue-50 to-purple-50">
        <div className="bg-white p-8 rounded-2xl shadow-xl text-center max-w-md">
          <div className="w-16 h-16 bg-gradient-to-br from-red-600 to-orange-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <Lock className="text-white" size={32} />
          </div>
          <h2 className="text-xl font-bold text-gray-800 mb-2">Access Denied</h2>
          <p className="text-gray-600 mb-6">This page is only accessible to patients</p>
          <button
            onClick={() => navigate('/')}
            className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-8 py-3 rounded-full font-medium hover:shadow-lg transition-all duration-200 transform hover:scale-105"
          >
            Go to Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50">
      <ToastContainer />
      <Navbar />

      <div className="pt-24 pb-8 px-4 max-w-6xl mx-auto">
        <div className="bg-white/80 backdrop-blur-md rounded-3xl shadow-xl p-8 border border-white/20">
          <div className="flex flex-col lg:flex-row items-center justify-between">
            <div className="flex flex-col sm:flex-row items-center mb-6 lg:mb-0">
              <div className="relative mb-4 sm:mb-0 sm:mr-6">
                <img
                  src={getProfileImageUrl()}
                  alt={user.username}
                  className="w-24 h-24 rounded-full object-cover border-4 border-white shadow-lg"
                />
              </div>
              <div className="text-center sm:text-left">
                <h1 className="text-2xl font-bold text-gray-800 mb-1">{user.username}</h1>
                <p className="text-gray-600 mb-2">{user.email}</p>
                <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium capitalize">
                  {user.role}
                </span>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
                <History className="text-white" size={20} />
              </div>
              <h2 className="text-xl font-bold text-gray-800">Notifications</h2>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 mt-8">
          <PatientSidebar activeTab={activeTab} setActiveTab={setActiveTab} />

          <div className="col-span-3 bg-white rounded-lg shadow-sm border">
            <div className="p-6 border-b">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                    <Bell className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <h1 className="text-2xl font-bold text-gray-900">Notifications</h1>
                    <p className="text-gray-600">Stay updated with your latest activities</p>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-3">
                  {['all', 'unread', 'read'].map(type => (
                    <button
                      key={type}
                      onClick={() => setFilter(type)}
                      className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                        filter === type
                          ? 'bg-blue-600 text-white'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      {type === 'unread'
                        ? `Unread (${unreadCount})`
                        : type.charAt(0).toUpperCase() + type.slice(1)}
                    </button>
                  ))}
                  {unreadCount > 0 && (
                    <button
                      onClick={markAllAsRead}
                      className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
                    >
                      Mark all as read
                    </button>
                  )}
                </div>
              </div>
            </div>

            <div className="divide-y">
              {loading ? (
                <div className="p-8 text-center text-gray-500">Loading...</div>
              ) : filteredNotifications.length === 0 ? (
                <div className="p-8 text-center">
                  <Bell className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No notifications</h3>
                  <p className="text-gray-600">
                    {filter === 'unread'
                      ? 'No unread notifications'
                      : filter === 'read'
                      ? 'No read notifications'
                      : 'No notifications found'}
                  </p>
                </div>
              ) : (
                filteredNotifications.map(notification => {
                  const IconComponent = Icons[notification.icon] || Bell;
                  return (
                    <div
                      key={notification.id}
                      className={`p-4 sm:p-6 hover:bg-gray-50 transition-colors ${
                        !notification.is_read ? 'bg-blue-50 border-l-4 border-blue-600' : ''
                      }`}
                    >
                      <div className="flex items-start space-x-4">
                        <div
                          className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                            !notification.is_read ? 'bg-blue-100' : 'bg-gray-100'
                          }`}
                        >
                          <IconComponent className={`w-5 h-5 ${notification.color}`} />
                        </div>

                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <h3 className={`font-medium ${
                                !notification.is_read ? 'text-gray-900' : 'text-gray-700'
                              }`}>
                                {notification.title || 'New Notification'}
                              </h3>
                              <p className="text-gray-600 mt-1 text-sm leading-relaxed">
                                {notification.message}
                              </p>
                              <div className="flex items-center mt-2 text-xs text-gray-500">
                                <Clock className="w-3 h-3 mr-1" />
                                {notification.time}
                              </div>
                            </div>
                            <div className="flex items-center space-x-2 ml-4">
                              {!notification.is_read && (
                                <button
                                  onClick={() => markAsRead(notification.id)}
                                  className="text-blue-600 hover:text-blue-700 p-1 rounded-full hover:bg-blue-50 transition-colors"
                                  title="Mark as read"
                                >
                                  <Icons.Check className="w-4 h-4" />
                                </button>
                              )}
                              <button
                                onClick={() => deleteNotification(notification.id)}
                                className="text-gray-400 hover:text-red-600 p-1 rounded-full hover:bg-red-50 transition-colors"
                                title="Delete notification"
                              >
                                <Icons.X className="w-4 h-4" />
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default NotificationsPage;
