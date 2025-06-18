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
  const [connectionStatus, setConnectionStatus] = useState('Initializing...');
  const [debugInfo, setDebugInfo] = useState('');
  const [connectedUsers, setConnectedUsers] = useState(new Set());

  const socketRef = useRef(null);
  const peersRef = useRef({});
  const localVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);
  const reconnectAttemptsRef = useRef(0);
  const maxReconnectAttempts = 5;
  const currentUser = jwtDecode(token).user_id;
  const roomName = slotId;
  const isInitializedRef = useRef(false);
  const pendingSignalsRef = useRef({});

  const addDebug = (message) => {
    console.log(message);
    setDebugInfo(prev => `${prev}\n${new Date().toLocaleTimeString()}: ${message}`);
  };

  const connectWebSocket = () => {
    if (socketRef.current && socketRef.current.readyState === WebSocket.OPEN) {
      return;
    }

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
    };

    socketRef.current.onmessage = (messageEvent) => {
  const data = JSON.parse(messageEvent.data);

  if (data.type === 'signal') {
    const { callerId, signal } = data;

    // Validate signal object
    if (!signal || typeof signal !== 'object') {
      addDebug(`Invalid signal from ${callerId}, skipping`);
      return;
    }

    let peer = peersRef.current[callerId];

    if (!peer) {
      addDebug(`No existing peer for ${callerId}, creating`);
      peer = createPeer(callerId, localStream, false); // Responder
      peersRef.current[callerId] = peer;
    }

    try {
      peer.signal(signal);
    } catch (err) {
      addDebug(`Error processing signal from ${callerId}: ${err.message}`);
    }
  }
};

    socketRef.current.onerror = (error) => {
      addDebug(`WebSocket error: ${error.message || 'Unknown error'}`);
      setConnectionStatus('Connection Error');
      setError('Failed to connect to video call service. Please try again.');
    };

    socketRef.current.onclose = (event) => {
      addDebug(`WebSocket closed: ${event.code} ${event.reason || 'No reason provided'}`);
      setConnectionStatus('Disconnected');

      if (event.code === 4004) {
        setError('Invalid appointment or access denied.');
        return;
      }

      if (event.code !== 1000 && reconnectAttemptsRef.current < maxReconnectAttempts) {
        const delay = Math.min(5000, 1000 * Math.pow(2, reconnectAttemptsRef.current));
        reconnectAttemptsRef.current++;
        addDebug(`Reconnecting in ${delay}ms (attempt ${reconnectAttemptsRef.current})`);
        setTimeout(connectWebSocket, delay);
      } else if (event.code !== 1000) {
        setError('Connection failed. Please refresh the page and try again.');
      }
    };
  };

  // Check WebRTC support
  const checkWebRTCSupport = () => {
    if (!window.RTCPeerConnection) {
      addDebug('WebRTC not supported in this browser');
      setError('WebRTC is not supported in this browser. Please use a modern browser like Chrome, Firefox, or Safari.');
      return false;
    }
    return true;
  };

  useEffect(() => {
    if (isInitializedRef.current) return;
    isInitializedRef.current = true;

    // Check WebRTC support first
    if (!checkWebRTCSupport()) {
      return;
    }

    const getMediaStream = async () => {
      try {
        addDebug('Requesting media permissions...');
        setConnectionStatus('Requesting camera access...');

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
        setLocalStream(stream);

        if (localVideoRef.current) {
          localVideoRef.current.srcObject = stream;
          addDebug('Set local video stream');
        }

        connectWebSocket();

      } catch (err) {
        addDebug(`Failed to get media: ${err.name} - ${err.message}`);
        setError(`Could not access camera/microphone: ${err.message}`);
        setConnectionStatus('Media Access Failed');
      }
    };

    getMediaStream();

    return () => {
      addDebug('Cleaning up resources...');
      if (socketRef.current) {
        socketRef.current.close(1000, 'Component unmounting');
      }
      if (localStream) {
        localStream.getTracks().forEach(track => {
          track.stop();
          addDebug(`Stopped ${track.kind} track`);
        });
      }
      Object.values(peersRef.current).forEach(peer => {
        if (peer && typeof peer.destroy === 'function') {
          peer.destroy();
        }
      });
      peersRef.current = {};
    };
  }, []);

  useEffect(() => {
    if (localStream && connectedUsers.size > 0) {
      addDebug(`Local stream available, checking ${connectedUsers.size} connected users`);
      connectedUsers.forEach(userId => {
        if (!peersRef.current[userId]) {
          addDebug(`Creating delayed connection to existing user ${userId}`);
          setTimeout(() => {
            if (!peersRef.current[userId] && localStream) {
              handleUserConnected(userId);
            }
          }, 1000);
        }
      });
    }
  }, [localStream, connectedUsers]);

  useEffect(() => {
    if (localStream && localVideoRef.current) {
      localVideoRef.current.srcObject = localStream;
    }
  }, [localStream]);

  useEffect(() => {
    if (remoteStream && remoteVideoRef.current) {
      remoteVideoRef.current.srcObject = remoteStream;
      remoteVideoRef.current.play().catch(err => {
        addDebug(`Error playing remote video: ${err.message}`);
      });
    }
  }, [remoteStream]);

  const createPeer = (userId, stream, initiator = false) => {
  addDebug(`Creating peer for ${userId}, initiator: ${initiator}`);

  try {
    const peer = new Peer({
      initiator,
      trickle: true,
      stream,
      config: {
        iceServers: [
          { urls: 'stun:stun.l.google.com:19302' },
          { urls: 'stun:stun1.l.google.com:19302' },
          { urls: 'stun:stun2.l.google.com:19302' },
        ],
      },
    });

    setupPeerEvents(peer, userId);
    return peer;
  } catch (err) {
    addDebug(`Error creating peer for ${userId}: ${err.message}`);
    throw err;
  }
};

  const handleUserConnected = (userId) => {
  addDebug(`Handling user connected: ${userId}`);

  // Avoid duplicate peer creation
  if (peersRef.current[userId]) {
    addDebug(`Peer already exists for ${userId}, skipping creation`);
    return;
  }

  // Make sure we have the local stream
  if (!localStream) {
    addDebug(`Cannot create peer for ${userId} - no local stream`);
    return;
  }

  // Make sure WebSocket is ready
  if (socketRef.current?.readyState !== WebSocket.OPEN) {
    addDebug(`Cannot create peer for ${userId} - WebSocket not ready`);
    return;
  }

  // Decide who should initiate the connection
  const shouldInitiate = currentUser < userId;
  addDebug(`Creating peer connection to ${userId} as ${shouldInitiate ? 'initiator' : 'receiver'}`);

  try {
    const peer = createPeer(userId, localStream, shouldInitiate);

    if (!peer) throw new Error('Peer is undefined or invalid');

    // Store the peer
    peersRef.current[userId] = peer;

    // If we received signals for this user before peer was created
    const pendingSignals = pendingSignalsRef.current[userId];
    if (pendingSignals && Array.isArray(pendingSignals)) {
      addDebug(`Processing ${pendingSignals.length} pending signals for ${userId}`);
      pendingSignals.forEach((signal, i) => {
        try {
          if (!signal || typeof signal !== 'object' || (!signal.type && !signal.candidate)) {
            addDebug(`Skipping invalid signal at index ${i} for ${userId}: ${JSON.stringify(signal)}`);
            return;
          }
          peer.signal(signal);
        } catch (err) {
          addDebug(`Error processing pending signal for ${userId}: ${err.message}`);
        }
      });
      delete pendingSignalsRef.current[userId]; // Clean up after processing
    }
  } catch (err) {
    addDebug(`Error creating peer for ${userId}: ${err.message}`);
    setError(`Failed to create connection with participant: ${err.message}`);
  }
};

  const handleSignal = ({ callerId, signal }) => {
    addDebug(`Received signal from ${callerId}, signal type: ${signal.type || 'unknown'}`);

    if (callerId === currentUser) {
      addDebug(`Ignoring signal from self`);
      return;
    }

    if (!localStream) {
      addDebug(`Cannot handle signal - no local stream available`);
      return;
    }

    if (!peersRef.current[callerId]) {
      addDebug(`No peer exists for ${callerId}, storing signal for later`);

      if (!pendingSignalsRef.current[callerId]) {
        pendingSignalsRef.current[callerId] = [];
      }
      pendingSignalsRef.current[callerId].push(signal);

      const shouldInitiate = currentUser < callerId;
      if (!shouldInitiate) {
        addDebug(`Creating peer for ${callerId} as receiver`);

        try {
          // Fixed: Remove .default access - SimplePeer is already the default export
          const peer = createPeer(callerId, localStream, false);
          peersRef.current[callerId] = peer;

          // Process all pending signals
          pendingSignalsRef.current[callerId].forEach(pendingSignal => {
            try {
              if (peer && typeof peer.signal === 'function') {
                peer.signal(pendingSignal);
              }
            } catch (err) {
              addDebug(`Error processing stored signal: ${err.message}`);
            }
          });
          delete pendingSignalsRef.current[callerId];
        } catch (err) {
          addDebug(`Error creating receiver peer for ${callerId}: ${err.message}`);
        }
      }
      return;
    }

    try {
      const peer = peersRef.current[callerId];
      if (peer && typeof peer.signal === 'function') {
        peer.signal(signal);
        addDebug(`Successfully signaled peer ${callerId}`);
      } else {
        addDebug(`Peer ${callerId} is not valid or doesn't have signal method`);
      }
    } catch (err) {
      addDebug(`Error signaling peer ${callerId}: ${err.message}`);
    }
  };

  const setupPeerEvents = (peer, userId) => {
  if (!peer) {
    addDebug(`Cannot setup events for null peer ${userId}`);
    return;
  }

  peer.on('signal', signal => {
    if (socketRef.current?.readyState === WebSocket.OPEN) {
      addDebug(`Sending signal to ${userId}, type: ${signal.type || 'candidate'}`);
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
    addDebug(`Received remote stream from ${userId}`);
    setRemoteStream(stream);
    setCallStarted(true);
    setConnectionStatus('Call Active');
  });

  peer.on('connect', () => {
    addDebug(`Peer data channel connected with ${userId}`);
  });

  peer.on('error', err => {
    addDebug(`Peer error with ${userId}: ${err.message}`);
    delete peersRef.current[userId];
    setError(`Connection error with participant: ${err.message}`);
  });

  peer.on('close', () => {
    addDebug(`Peer connection closed with ${userId}`);
    delete peersRef.current[userId];
    if (Object.keys(peersRef.current).length === 0) {
      setRemoteStream(null);
      setCallStarted(false);
      setConnectionStatus('Participant disconnected');
    }
  });
};

  const handleUserDisconnected = (userId) => {
    addDebug(`User disconnected: ${userId}`);
    if (peersRef.current[userId]) {
      const peer = peersRef.current[userId];
      if (peer && typeof peer.destroy === 'function') {
        peer.destroy();
      }
      delete peersRef.current[userId];
    }

    delete pendingSignalsRef.current[userId];

    if (Object.keys(peersRef.current).length === 0) {
      setRemoteStream(null);
      setCallStarted(false);
      setConnectionStatus('Waiting for participant...');
    }
  };

  const toggleMic = () => {
    if (localStream) {
      const enabled = !micMuted;
      localStream.getAudioTracks().forEach(track => {
        track.enabled = enabled;
        addDebug(`${enabled ? 'Enabled' : 'Disabled'} microphone`);
      });
      setMicMuted(!enabled);
    }
  };

  const toggleVideo = () => {
    if (localStream) {
      const enabled = !videoOff;
      localStream.getVideoTracks().forEach(track => {
        track.enabled = enabled;
        addDebug(`${enabled ? 'Enabled' : 'Disabled'} video`);
      });
      setVideoOff(!enabled);
    }
  };

  const endCall = () => {
    addDebug('Ending call...');

    if (socketRef.current) {
      socketRef.current.close(1000, 'Call ended by user');
    }

    if (localStream) {
      localStream.getTracks().forEach(track => {
        track.stop();
        addDebug(`Stopped ${track.kind} track`);
      });
    }

    Object.values(peersRef.current).forEach(peer => {
      if (peer && typeof peer.destroy === 'function') {
        peer.destroy();
      }
    });
    peersRef.current = {};

    if (onEndCall) {
      onEndCall();
    }
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
        Status: {connectionStatus} | Room: {roomName} | User: {currentUser} | Connected: {connectedUsers.size}
      </div>

      <div className="flex-1 relative">
        <div className="absolute inset-0 bg-black">
          {remoteStream ? (
            <video
              ref={remoteVideoRef}
              autoPlay
              playsInline
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="flex items-center justify-center h-full">
              <div className="text-center">
                <p className="text-xl mb-4">
                  {connectionStatus === 'Call Active' ? 'Connected' : connectionStatus}
                </p>
                {connectionStatus === 'Waiting for participant...' && (
                  <p className="text-sm text-gray-400">
                    {connectedUsers.size > 0 ? 'Connecting to participant...' : 'Share the room ID with the other participant'}
                  </p>
                )}
              </div>
            </div>
          )}
        </div>

        <div className="absolute bottom-20 right-4 w-1/4 max-w-xs bg-black rounded-lg overflow-hidden shadow-lg">
          {localStream ? (
            <video
              ref={localVideoRef}
              autoPlay
              playsInline
              muted
              className={`w-full h-full object-cover ${videoOff ? 'opacity-20' : ''}`}
            />
          ) : (
            <div className="aspect-video bg-gray-700 flex items-center justify-center">
              <span className="text-sm">No camera</span>
            </div>
          )}
        </div>
      </div>

      <div className="bg-gray-800 p-4 flex justify-center space-x-6">
        <button
          onClick={toggleMic}
          className={`p-3 rounded-full transition-colors ${micMuted ? 'bg-red-500 hover:bg-red-600' : 'bg-gray-700 hover:bg-gray-600'}`}
          title={micMuted ? 'Unmute microphone' : 'Mute microphone'}
        >
          {micMuted ? <MdMicOff size={24} /> : <FiMic size={24} />}
        </button>

        <button
          onClick={toggleVideo}
          className={`p-3 rounded-full transition-colors ${videoOff ? 'bg-red-500 hover:bg-red-600' : 'bg-gray-700 hover:bg-gray-600'}`}
          title={videoOff ? 'Turn on camera' : 'Turn off camera'}
        >
          {videoOff ? <MdVideocamOff size={24} /> : <FiVideo size={24} />}
        </button>

        <button
          onClick={endCall}
          className="p-3 rounded-full bg-red-600 hover:bg-red-700 transition-colors"
          title="End call"
        >
          <MdPhoneDisabled size={24} />
        </button>
      </div>

      {process.env.NODE_ENV === 'development' && (
        <div className="absolute top-16 left-4 max-w-md max-h-40 overflow-auto bg-black bg-opacity-75 p-2 text-xs">
          <pre className="whitespace-pre-wrap">{debugInfo}</pre>
        </div>
      )}
    </div>
  );
};

export default VideoCall;