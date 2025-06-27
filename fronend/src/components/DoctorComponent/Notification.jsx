import React, { useState, useEffect } from 'react';
import { AlertCircle, Info, Video, Calendar, Bell, Trash2, Eye, CheckCircle } from 'lucide-react';
import { useSelector } from 'react-redux';
import { doctorAxios } from '../../axios/DoctorAxios';

const DoctorNotifications = () => {
  const [notifications, setNotifications] = useState([]);
  const { token } = useSelector((state) => state.auth);

  const getIcon = (type) => {
    switch (type) {
      case 'emergency': return AlertCircle;
      case 'chat_activated': return Info;
      case 'video_activated': return Video;
      case 'consultation':
      default: return Calendar;
    }
  };

  const getColorClass = (type) => {
    switch (type) {
      case 'emergency': return 'bg-red-100 text-red-700';
      case 'chat_activated': return 'bg-blue-100 text-blue-700';
      case 'video_activated': return 'bg-purple-100 text-purple-700';
      case 'consultation':
      default: return 'bg-emerald-100 text-emerald-700';
    }
  };

  const formatTime = (timeString) => {
    const date = new Date(timeString);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true });
  };

  // Fetch notifications
  useEffect(() => {
    doctorAxios.get('doctor-notifications/')
      .then(res => {
        console.log('Fetched Notifications:', res.data); 
        const updatedNotifications = res.data.map(notification => ({
          ...notification,
          isRead: notification.is_read,
          icon: getIcon(notification.notification_type),
          colorClass: getColorClass(notification.notification_type),
          time: formatTime(notification.created_at)
        }));
        setNotifications(updatedNotifications);
      })
      .catch(err => console.error('Error fetching notifications', err));
  }, []);

  // WebSocket connection
  useEffect(() => {
    const ws = new WebSocket(`ws://localhost:8000/ws/notifications/?token=${token}`);

    ws.onmessage = (e) => {
      const data = JSON.parse(e.data);
      console.log('New Notification:', data);

      const newNotification = {
        id: Date.now(),
        type: data.notification_type,
        title: `New ${data.notification_type} Notification`,
        message: data.message,
        time: 'Just now',
        isRead: false,
        icon: getIcon(data.notification_type),
        colorClass: getColorClass(data.notification_type)
      };

      setNotifications((prev) => [newNotification, ...prev]);
    };

    ws.onclose = () => console.log('WebSocket closed');
    ws.onerror = (err) => console.error('WebSocket error', err);

    return () => {
      ws.close();
    };
  }, [token]);

  const markAsRead = async (index) => {
    const notification = notifications[index];

    try {
      await doctorAxios.post(`doctor-notifications/${notification.id}/mark-read/`);

      const updated = [...notifications];
      updated[index].isRead = true;
      setNotifications(updated);
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const deleteNotification = (index) => {
    const updated = [...notifications];
    updated.splice(index, 1);
    setNotifications(updated);
  };

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-4xl mx-auto p-6">
        <div className="flex items-center mb-6 space-x-4">
          <Bell className="w-8 h-8 text-emerald-600" />
          <h1 className="text-2xl font-bold text-gray-900">Notifications</h1>
        </div>

        {notifications.length === 0 ? (
          <div className="text-center py-12">
            <Bell className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-600 mb-2">No notifications found</h3>
            <p className="text-gray-500">You're all caught up!</p>
          </div>
        ) : (
          <div className="space-y-4">
            {notifications.map((notification, index) => {
              const Icon = notification.icon;

              return (
                <div
                  key={index}
                  className={`flex items-start p-4 rounded-lg border ${notification.isRead ? 'border-gray-300' : 'border-emerald-400 bg-emerald-50'}`}
                >
                  {/* Icon */}
                  <div className={`flex items-center justify-center w-12 h-12 rounded-full ${notification.colorClass} mr-4`}>
                    <Icon className="w-6 h-6" />
                  </div>

                  {/* Notification Content */}
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <h3 className="font-semibold text-gray-800">{notification.title}</h3>
                      <span className="text-xs text-gray-500">{notification.time}</span>
                    </div>
                    <p className="text-gray-600 mt-1">{notification.message}</p>

                    <div className="flex space-x-4 mt-3">
                      {!notification.isRead ? (
                        <>
                          <button
                            onClick={() => markAsRead(index)}
                            className="flex items-center text-emerald-600 hover:text-emerald-700 text-sm"
                          >
                            <Eye className="w-4 h-4 mr-1" /> Mark as Read
                          </button>
                          <button
                            onClick={() => deleteNotification(index)}
                            className="flex items-center text-red-600 hover:text-red-700 text-sm"
                          >
                            <Trash2 className="w-4 h-4 mr-1" /> Delete
                          </button>
                        </>
                      ) : (
                        <div className="flex items-center text-gray-500 text-sm">
                          <CheckCircle className="w-4 h-4 mr-1" /> Read
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default DoctorNotifications;
