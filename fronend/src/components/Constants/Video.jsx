import React, { useEffect, useRef, useState } from 'react';
import { FiVideo, FiMic } from 'react-icons/fi';
import { MdMicOff, MdPhoneDisabled, MdVideocamOff } from 'react-icons/md';
import Peer from 'simple-peer';
import { jwtDecode } from 'jwt-decode';

const VideoCall = ({ slotId, token, onEndCall }) => {
  const [localStream, setLocalStream] = useState(null);
  const [remoteStream, setRemoteStream] = useState(null);
  const [micMuted, setMicMuted] = useState(false);
  const [videoOff, setVideoOff] = useState(false);
  const [callStarted, setCallStarted] = useState(false);
  const [error, setError] = useState(null);
  const [connectionStatus, setConnectionStatus] = useState('Connecting...');
  const [debugInfo, setDebugInfo] = useState('');
  
  const socketRef = useRef(null);
  const peersRef = useRef({});
  const localVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);
  const reconnectAttemptsRef = useRef(0);
  const maxReconnectAttempts = 5;
  const currentUser = jwtDecode(token).user_id;
  const roomName = slotId;

  // Add debug logging
  const addDebug = (message) => {
    console.log(message);
    setDebugInfo(prev => `${prev}\n${new Date().toLocaleTimeString()}: ${message}`);
  };

  // Stable WebSocket connection with exponential backoff
  const connectWebSocket = () => {
    if (socketRef.current) {
      socketRef.current.close();
    }

    const wsUrl = `ws://127.0.0.1:8000/ws/videocall/${roomName}/?token=${encodeURIComponent(token)}`;
    addDebug(`Connecting to WebSocket: ${wsUrl}`);
    
    socketRef.current = new WebSocket(wsUrl);

    socketRef.current.onopen = () => {
      addDebug('WebSocket connected successfully');
      setConnectionStatus('Connected');
      setError(null);
      reconnectAttemptsRef.current = 0;
      
      socketRef.current.send(JSON.stringify({
        type: 'join-room',
        room: roomName,
        userId: currentUser
      }));
    };

    socketRef.current.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        addDebug(`Received message: ${JSON.stringify(data)}`);
        
        switch (data.type) {
          case 'user-connected':
            if (data.userId !== currentUser) {
              handleUserConnected(data.userId);
            }
            break;
          case 'user-disconnected':
            handleUserDisconnected(data.userId);
            break;
          case 'signal':
            handleSignal(data);
            break;
          default:
            addDebug(`Unknown message type: ${data.type}`);
        }
      } catch (err) {
        addDebug(`Error parsing message: ${err.message}`);
      }
    };

    socketRef.current.onerror = (error) => {
      addDebug(`WebSocket error: ${error}`);
      setConnectionStatus('Connection Error');
    };

    socketRef.current.onclose = (event) => {
      addDebug(`WebSocket closed: ${event.code} ${event.reason}`);
      setConnectionStatus('Disconnected');
      
      if (event.code !== 1000 && reconnectAttemptsRef.current < maxReconnectAttempts) {
        const delay = Math.min(5000, 1000 * Math.pow(2, reconnectAttemptsRef.current));
        reconnectAttemptsRef.current++;
        addDebug(`Reconnecting in ${delay}ms (attempt ${reconnectAttemptsRef.current})`);
        setTimeout(connectWebSocket, delay);
      } else {
        setError('Connection failed. Please refresh the page.');
      }
    };
  };

  // Initialize media and connection
  useEffect(() => {
    // Verify token
    try {
      const decoded = jwtDecode(token);
      if (decoded.exp * 1000 < Date.now()) {
        setError('Session expired. Please login again.');
        return;
      }
    } catch (err) {
      setError('Invalid authentication token.');
      return;
    }

    // Get user media with better error handling
    const getMediaStream = async () => {
      try {
        addDebug('Requesting media permissions...');
        const stream = await navigator.mediaDevices.getUserMedia({ 
          video: { 
            width: { ideal: 1280 },
            height: { ideal: 720 },
            facingMode: 'user'
          },
          audio: {
            echoCancellation: true,
            noiseSuppression: true,
            autoGainControl: true
          }
        });
        
        addDebug(`Obtained local stream with ${stream.getTracks().length} tracks`);
        addDebug(`Video tracks: ${stream.getVideoTracks().length}, Audio tracks: ${stream.getAudioTracks().length}`);
        
        setLocalStream(stream);
        
        // Set local video immediately
        if (localVideoRef.current) {
          localVideoRef.current.srcObject = stream;
          addDebug('Set local video stream');
        }
        
        connectWebSocket();
      } catch (err) {
        addDebug(`Failed to get media: ${err.name} - ${err.message}`);
        setError(`Could not access camera/microphone: ${err.message}`);
      }
    };

    getMediaStream();

    return () => {
      addDebug('Cleaning up resources...');
      if (socketRef.current) {
        socketRef.current.close();
      }
      if (localStream) {
        localStream.getTracks().forEach(track => {
          track.stop();
          addDebug(`Stopped ${track.kind} track`);
        });
      }
      Object.values(peersRef.current).forEach(peer => peer.destroy());
    };
  }, []);

  // Update local video when stream changes
  useEffect(() => {
    if (localStream && localVideoRef.current) {
      localVideoRef.current.srcObject = localStream;
      addDebug('Updated local video element with stream');
    }
  }, [localStream]);

  // Update remote video when stream changes
  useEffect(() => {
    if (remoteStream && remoteVideoRef.current) {
      remoteVideoRef.current.srcObject = remoteStream;
      addDebug('Updated remote video element with stream');
      
      // Force video to play
      remoteVideoRef.current.play().catch(err => {
        addDebug(`Error playing remote video: ${err.message}`);
      });
    }
  }, [remoteStream]);

  // Handle new user connection
  const handleUserConnected = (userId) => {
    addDebug(`New user connected: ${userId}`);
    
    if (!peersRef.current[userId] && localStream) {
      addDebug(`Creating peer connection to ${userId} as initiator`);
      const peer = new Peer({
        initiator: true,
        trickle: true,
        stream: localStream,
        config: { 
          iceServers: [
            { urls: 'stun:stun.l.google.com:19302' },
            { urls: 'stun:stun1.l.google.com:19302' },
            { urls: 'stun:stun2.l.google.com:19302' }
          ]
        }
      });

      setupPeerEvents(peer, userId);
      peersRef.current[userId] = peer;
    } else if (!localStream) {
      addDebug(`Cannot create peer - no local stream available`);
    } else {
      addDebug(`Peer already exists for user ${userId}`);
    }
  };

  // Handle incoming signals
  const handleSignal = ({ callerId, signal }) => {
    addDebug(`Received signal from ${callerId}, signal type: ${signal.type || 'unknown'}`);
    
    if (!peersRef.current[callerId] && localStream) {
      addDebug(`Creating peer response to ${callerId} as non-initiator`);
      const peer = new Peer({
        initiator: false,
        trickle: true,
        stream: localStream,
        config: { 
          iceServers: [
            { urls: 'stun:stun.l.google.com:19302' },
            { urls: 'stun:stun1.l.google.com:19302' },
            { urls: 'stun:stun2.l.google.com:19302' }
          ]
        }
      });

      setupPeerEvents(peer, callerId);
      peersRef.current[callerId] = peer;
      
      // Signal the peer after setup
      setTimeout(() => {
        try {
          peer.signal(signal);
          addDebug(`Signaled peer ${callerId} with incoming signal`);
        } catch (err) {
          addDebug(`Error signaling peer ${callerId}: ${err.message}`);
        }
      }, 100);
      
    } else if (peersRef.current[callerId]) {
      try {
        peersRef.current[callerId].signal(signal);
        addDebug(`Forwarded signal to existing peer ${callerId}`);
      } catch (err) {
        addDebug(`Error forwarding signal to ${callerId}: ${err.message}`);
      }
    } else {
      addDebug(`Cannot handle signal from ${callerId} - no local stream`);
    }
  };

  // Setup peer event handlers
  const setupPeerEvents = (peer, userId) => {
    peer.on('signal', signal => {
      addDebug(`Sending signal to ${userId}, type: ${signal.type || 'unknown'}`);
      if (socketRef.current?.readyState === WebSocket.OPEN) {
        socketRef.current.send(JSON.stringify({
          type: 'signal',
          userToSignal: userId,
          callerId: currentUser,
          signal
        }));
      } else {
        addDebug(`Cannot send signal - WebSocket not ready`);
      }
    });

    peer.on('stream', stream => {
      addDebug(`Received remote stream from ${userId} with ${stream.getTracks().length} tracks`);
      addDebug(`Remote stream - Video: ${stream.getVideoTracks().length}, Audio: ${stream.getAudioTracks().length}`);
      
      setRemoteStream(stream);
      setCallStarted(true);
      setConnectionStatus('Call Active');
    });

    peer.on('connect', () => {
      addDebug(`Peer connected to ${userId}`);
    });

    peer.on('data', data => {
      addDebug(`Received data from ${userId}: ${data}`);
    });

    peer.on('error', err => {
      addDebug(`Peer error with ${userId}: ${err.message}`);
      delete peersRef.current[userId];
      
      // Try to recreate connection once
      if (err.message.includes('Connection failed')) {
        setTimeout(() => {
          if (!peersRef.current[userId] && localStream) {
            addDebug(`Attempting to recreate peer connection to ${userId}`);
            // This would need to be triggered by the signaling server
          }
        }, 2000);
      }
    });

    peer.on('close', () => {
      addDebug(`Peer connection closed with ${userId}`);
      delete peersRef.current[userId];
      if (Object.keys(peersRef.current).length === 0) {
        setRemoteStream(null);
        setCallStarted(false);
        setConnectionStatus('Connected');
      }
    });
  };

  // Handle user disconnection
  const handleUserDisconnected = (userId) => {
    addDebug(`User disconnected: ${userId}`);
    if (peersRef.current[userId]) {
      peersRef.current[userId].destroy();
      delete peersRef.current[userId];
    }
    if (Object.keys(peersRef.current).length === 0) {
      setRemoteStream(null);
      setCallStarted(false);
      setConnectionStatus('Connected');
    }
  };

  // Control functions
  const toggleMic = () => {
    if (localStream) {
      const enabled = !micMuted;
      localStream.getAudioTracks().forEach(track => {
        track.enabled = enabled;
        addDebug(`Audio track ${enabled ? 'enabled' : 'disabled'}`);
      });
      setMicMuted(!enabled);
    }
  };

  const toggleVideo = () => {
    if (localStream) {
      const enabled = !videoOff;
      localStream.getVideoTracks().forEach(track => {
        track.enabled = enabled;
        addDebug(`Video track ${enabled ? 'enabled' : 'disabled'}`);
      });
      setVideoOff(!enabled);
    }
  };

  const endCall = () => {
    addDebug('Ending call...');
    if (socketRef.current) socketRef.current.close();
    if (localStream) {
      localStream.getTracks().forEach(track => {
        track.stop();
        addDebug(`Stopped ${track.kind} track`);
      });
    }
    Object.values(peersRef.current).forEach(peer => peer.destroy());
    if (onEndCall) onEndCall();
  };

  return (
    <div className="fixed inset-0 bg-gray-900 text-white z-50 flex flex-col">
      {error && (
        <div className="bg-red-500 p-4 text-center flex justify-between items-center">
          <span>{error}</span>
          <button onClick={() => setError(null)} className="ml-4 text-white hover:text-gray-200">
            ×
          </button>
        </div>
      )}

      <div className="bg-gray-800 p-2 text-center text-sm">
        Status: {connectionStatus} | Room: {roomName} | User: {currentUser} | 
        Peers: {Object.keys(peersRef.current).length}
      </div>

      {/* Debug panel - remove in production */}
      <div className="bg-gray-700 p-2 text-xs max-h-32 overflow-y-auto">
        <div className="flex justify-between items-center mb-1">
          <span>Debug Log:</span>
          <button 
            onClick={() => setDebugInfo('')}
            className="text-red-400 hover:text-red-300"
          >
            Clear
          </button>
        </div>
        <pre className="whitespace-pre-wrap font-mono text-xs">
          {debugInfo.split('\n').slice(-10).join('\n')}
        </pre>
      </div>

      <div className="flex-1 relative">
        {/* Remote Video */}
        <div className="absolute inset-0 bg-black">
          {remoteStream ? (
            <video
              ref={remoteVideoRef}
              autoPlay
              playsInline
              className="w-full h-full object-cover"
              onLoadedMetadata={() => addDebug('Remote video metadata loaded')}
              onCanPlay={() => addDebug('Remote video can play')}
              onError={(e) => addDebug(`Remote video error: ${e.target.error?.message || 'Unknown error'}`)}
            />
          ) : (
            <div className="flex items-center justify-center h-full">
              <div className="text-center">
                <div className="animate-pulse mb-4">
                  <div className="w-16 h-16 bg-gray-600 rounded-full mx-auto mb-4"></div>
                </div>
                <p className="text-xl mb-4">
                  {callStarted ? 'Connected' : 'Waiting for participant...'}
                </p>
                <p className="text-sm text-gray-400">
                  Connected users: {Object.keys(peersRef.current).length}
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Local Video */}
        <div className="absolute bottom-20 right-4 w-1/4 max-w-xs bg-black rounded-lg overflow-hidden shadow-lg">
          {localStream ? (
            <video
              ref={localVideoRef}
              autoPlay
              playsInline
              muted
              className="w-full h-full object-cover"
              onLoadedMetadata={() => addDebug('Local video metadata loaded')}
              onError={(e) => addDebug(`Local video error: ${e.target.error?.message || 'Unknown error'}`)}
            />
          ) : (
            <div className="aspect-video bg-gray-700 flex items-center justify-center">
              <span className="text-sm">No camera</span>
            </div>
          )}
        </div>
      </div>

      {/* Controls */}
      <div className="bg-gray-800 p-4 flex justify-center space-x-6">
        <button
          onClick={toggleMic}
          className={`p-3 rounded-full ${micMuted ? 'bg-red-500' : 'bg-gray-700'} hover:opacity-80`}
          title={micMuted ? 'Unmute' : 'Mute'}
        >
          {micMuted ? <MdMicOff size={24} /> : <FiMic size={24} />}
        </button>
        
        <button
          onClick={toggleVideo}
          className={`p-3 rounded-full ${videoOff ? 'bg-red-500' : 'bg-gray-700'} hover:opacity-80`}
          title={videoOff ? 'Enable video' : 'Disable video'}
        >
          {videoOff ? <MdVideocamOff size={24} /> : <FiVideo size={24} />}
        </button>
        
        <button
          onClick={endCall}
          className="p-3 rounded-full bg-red-600 hover:opacity-80"
          title="End call"
        >
          <MdPhoneDisabled size={24} />
        </button>
      </div>
    </div>
  );
};

export default VideoCall;