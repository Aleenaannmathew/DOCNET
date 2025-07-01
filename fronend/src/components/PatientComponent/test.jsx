import React, { useRef, useEffect, useState } from 'react';
import { FiVideo, FiMic } from 'react-icons/fi';
import { MdMicOff, MdPhoneDisabled, MdVideocamOff } from 'react-icons/md';
import { AlertTriangle, Clock, User } from 'lucide-react';

const EmergencyVideoCall = ({ emergencyId, token, onEndCall }) => {
  const localVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);
  const pcRef = useRef(null);
  const wsRef = useRef(null);
  const pendingCandidates = useRef([]);
  const isRemoteDescSet = useRef(false);
  const offerRetryRef = useRef(null);
  const localStreamRef = useRef(null);
  const reconnectRef = useRef(null);

  const [status, setStatus] = useState('Initializing emergency call...');
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);
  const [error, setError] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const [hasRemoteStream, setHasRemoteStream] = useState(false);
  const [remotePeerConnected, setRemotePeerConnected] = useState(false);
  const [callDuration, setCallDuration] = useState(0);
  const [emergencyInfo, setEmergencyInfo] = useState(null);
  const [retryCount, setRetryCount] = useState(0);
  const [refsReady, setRefsReady] = useState(false); // NEW - Same as normal VideoCall

  // Get WebSocket URL from environment or use default
  const getWebSocketUrl = () => {
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const host = process.env.REACT_APP_WS_HOST || window.location.host;
    return `${protocol}//${host}/ws/emergency/emergency_${emergencyId}/?token=${encodeURIComponent(token)}`;
  };

  const currentUser = (() => {
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      return payload.user_id || payload.userId || payload.id;
    } catch (e) {
      console.error('Error decoding token:', e);
      return Math.random().toString(36).substr(2, 9);
    }
  })();

  const addDebug = (message) => {
    const timestamp = new Date().toLocaleTimeString();
  };

  // Check for refs after mount - Same as normal VideoCall
  useEffect(() => {
    if (localVideoRef.current && remoteVideoRef.current) {
      setRefsReady(true);
    }
  }, []);

  // Call duration timer
  useEffect(() => {
    let interval;
    if (isConnected && hasRemoteStream) {
      interval = setInterval(() => {
        setCallDuration(prev => prev + 1);
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isConnected, hasRemoteStream]);

  // Format call duration
  const formatDuration = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Main effect - only run when refs are ready
  useEffect(() => {
    if (!refsReady) return;

    // Enhanced STUN/TURN servers for emergency calls
    const pc = new RTCPeerConnection({
      iceServers: [
        { urls: 'stun:stun.l.google.com:19302' },
        { urls: 'stun:stun1.l.google.com:19302' },
        { urls: 'stun:global.stun.twilio.com:3478' },
        { urls: 'stun:stun.relay.metered.ca:80' },
        { urls: 'stun:stun.cloudflare.com:3478' }
      ],
      iceCandidatePoolSize: 10 // Increase for better connectivity
    });
    pcRef.current = pc;

    const startCall = async () => {
      try {
        addDebug('Starting emergency video call...');
        setStatus('Requesting camera access for emergency call...');

        // Higher priority media constraints for emergency calls
        const localStream = await navigator.mediaDevices.getUserMedia({
          video: { 
            width: { ideal: 1280 }, 
            height: { ideal: 720 }, 
            facingMode: 'user',
            frameRate: { ideal: 30 }
          },
          audio: { 
            echoCancellation: true, 
            noiseSuppression: true, 
            autoGainControl: true,
            sampleRate: 48000
          }
        });

        localStreamRef.current = localStream;
        if (localVideoRef.current) {
          localVideoRef.current.srcObject = localStream;
          localVideoRef.current.play().catch(e => addDebug(`Local video play error: ${e.message}`));
        }

        localStream.getTracks().forEach(track => {
          // Set higher priority for emergency calls
          if (track.kind === 'video') {
            track.contentHint = 'motion';
          } else if (track.kind === 'audio') {
            track.contentHint = 'speech';
          }
          pc.addTrack(track, localStream);
        });

        const wsUrl = getWebSocketUrl();
        const ws = new WebSocket(wsUrl);
        wsRef.current = ws;

        ws.onopen = () => {
          addDebug('Emergency WebSocket connected');
          setStatus('Connected to emergency service');
          setRetryCount(0); // Reset retry count on successful connection
        };

        ws.onerror = (error) => {
          addDebug(`WebSocket error: ${error}`);
          setError('Failed to connect to emergency video service');
          setStatus('Emergency connection failed');
        };

        ws.onclose = (event) => {
          addDebug(`Emergency WebSocket closed: ${event.code}`);
          if (event.code === 4004) {
            setError('Emergency consultation access denied');
          } else if (event.code === 4003) {
            setError('Authentication failed');
          } else if (event.code !== 1000) { // 1000 is normal closure
            // Attempt to reconnect
            if (retryCount < 3) {
              setRetryCount(prev => prev + 1);
              setStatus(`Reconnecting... (Attempt ${retryCount + 1}/3)`);
              reconnectRef.current = setTimeout(() => {
                // Restart the entire connection process
                startCall();
              }, 2000 * retryCount);
            } else {
              setStatus('Emergency call disconnected');
              setError('Failed to reconnect after multiple attempts');
            }
          } else {
            setStatus('Emergency call ended');
          }
        };

        pc.onicecandidate = (e) => {
          if (e.candidate && ws.readyState === WebSocket.OPEN) {
            addDebug(`ICE candidate: ${e.candidate.type}`);
            if (isRemoteDescSet.current) {
              // Use same message format as normal VideoCall
              ws.send(JSON.stringify({ type: 'ice', candidate: e.candidate }));
            } else {
              pendingCandidates.current.push(e.candidate);
            }
          }
        };

        pc.ontrack = (e) => {
          addDebug(`Remote track received: ${e.track.kind}`);
          const remoteStream = e.streams?.[0];
          if (!remoteStream) return;

          setRemotePeerConnected(true);
          if (remoteVideoRef.current) {
            remoteVideoRef.current.srcObject = remoteStream;
            remoteVideoRef.current.play()
              .then(() => {
                setHasRemoteStream(true);
                setStatus('Emergency call active');
                addDebug('Emergency call established successfully');
              })
              .catch(e => {
                setStatus('Click video to start emergency call');
                addDebug(`Remote video play error: ${e.message}`);
              });
          }
        };

        pc.oniceconnectionstatechange = () => {
          const state = pc.iceConnectionState;
          addDebug(`ICE connection state: ${state}`);
          
          if (state === 'connected' || state === 'completed') {
            setIsConnected(true);
            setStatus('Emergency call connected');
          } else if (state === 'disconnected') {
            setStatus('Reconnecting emergency call...');
            setIsConnected(false);
          } else if (state === 'failed') {
            setStatus('Emergency connection failed');
            setError('Emergency call connection failed - please try again');
          } else if (state === 'closed') {
            setStatus('Emergency call ended');
          }
        };

        ws.onmessage = async (event) => {
          const msg = JSON.parse(event.data);
          addDebug(`Received message: ${msg.type}`);

          if (msg.type === 'joined') {
            setStatus(msg.isOfferer ? 'Initiating emergency call...' : 'Waiting for emergency response...');
            setEmergencyInfo({
              isOfferer: msg.isOfferer,
              userId: msg.userId,
              room: msg.room,
              isEmergency: msg.isEmergency
            });

            if (msg.isOfferer) {
              const sendOffer = async () => {
                try {
                  const offer = await pc.createOffer({ 
                    offerToReceiveAudio: true, 
                    offerToReceiveVideo: true 
                  });
                  await pc.setLocalDescription(offer);
                  ws.send(JSON.stringify({ type: 'offer', sdp: offer.sdp }));
                  addDebug('Emergency call offer sent');
                } catch (error) {
                  addDebug(`Error creating offer: ${error.message}`);
                }
              };

              await sendOffer();
              
              // Retry mechanism for emergency calls (faster than normal)
              offerRetryRef.current = setInterval(() => {
                if (pc.signalingState === 'have-local-offer') {
                  addDebug('Retrying emergency call offer...');
                  sendOffer();
                } else {
                  clearInterval(offerRetryRef.current);
                  offerRetryRef.current = null;
                }
              }, 2000); // Faster retry for emergency
            }
          }

          if (msg.type === 'offer') {
            try {
              await pc.setRemoteDescription(new RTCSessionDescription({ type: 'offer', sdp: msg.sdp }));
              isRemoteDescSet.current = true;

              const answer = await pc.createAnswer();
              await pc.setLocalDescription(answer);
              ws.send(JSON.stringify({ type: 'answer', sdp: answer.sdp }));
              addDebug('Emergency call answer sent');

              // Process pending ICE candidates - use same format as normal VideoCall
              pendingCandidates.current.forEach(candidate => {
                ws.send(JSON.stringify({ type: 'ice', candidate }));
              });
              pendingCandidates.current = [];
            } catch (error) {
              addDebug(`Error handling offer: ${error.message}`);
            }
          }

          if (msg.type === 'answer') {
            try {
              await pc.setRemoteDescription(new RTCSessionDescription({ type: 'answer', sdp: msg.sdp }));
              isRemoteDescSet.current = true;
              addDebug('Emergency call answer received');
              
              if (offerRetryRef.current) {
                clearInterval(offerRetryRef.current);
                offerRetryRef.current = null;
              }
              
              // Process pending ICE candidates - use same format as normal VideoCall
              pendingCandidates.current.forEach(candidate => {
                ws.send(JSON.stringify({ type: 'ice', candidate }));
              });
              pendingCandidates.current = [];
            } catch (error) {
              addDebug(`Error handling answer: ${error.message}`);
            }
          }

          // Use same message type as normal VideoCall ('ice' instead of 'ice-candidate')
          if (msg.type === 'ice' && msg.candidate) {
            try {
              const candidate = new RTCIceCandidate(msg.candidate);
              if (pc.remoteDescription) {
                await pc.addIceCandidate(candidate);
                addDebug(`Added ICE candidate: ${candidate.type}`);
              } else {
                pendingCandidates.current.push(candidate);
                addDebug('Queued ICE candidate for later');
              }
            } catch (error) {
              addDebug(`Error adding ICE candidate: ${error.message}`);
            }
          }

          if (msg.type === 'user_joined') {
            addDebug(`User ${msg.userId} joined emergency call`);
            setStatus('Participant joined emergency call');
          }

          if (msg.type === 'user_left') {
            addDebug(`User ${msg.userId} left emergency call`);
            setStatus('Participant left emergency call');
            setHasRemoteStream(false);
            setRemotePeerConnected(false);
          }
        };
      } catch (err) {
        addDebug(`Emergency call start error: ${err.message}`);
        setError('Could not access camera/microphone for emergency call');
        setStatus('Emergency call failed to start');
        
        if (err.name === 'NotAllowedError') {
          setError('Please enable camera and microphone permissions');
        } else if (err.name === 'NotFoundError') {
          setError('No media devices found');
        } else if (err.name === 'NotReadableError') {
          setError('Could not access media devices (are they in use by another application?)');
        }
      }
    };

    startCall();

    // Cleanup function - same pattern as normal VideoCall
    return () => {
      if (offerRetryRef.current) {
        clearInterval(offerRetryRef.current);
        offerRetryRef.current = null;
      }
      
      if (reconnectRef.current) {
        clearTimeout(reconnectRef.current);
        reconnectRef.current = null;
      }
      
      if (pcRef.current) {
        pcRef.current.close();
        pcRef.current = null;
      }
      
      if (wsRef.current) {
        wsRef.current.close();
        wsRef.current = null;
      }
      
      if (localStreamRef.current) {
        localStreamRef.current.getTracks().forEach(track => track.stop());
        localStreamRef.current = null;
      }
    };
  }, [refsReady, emergencyId, token, retryCount]);

  const toggleMute = () => {
    const tracks = localStreamRef.current?.getAudioTracks();
    if (tracks) {
      tracks.forEach(track => (track.enabled = !track.enabled));
      setIsMuted(!isMuted);
      addDebug(`Audio ${isMuted ? 'unmuted' : 'muted'}`);
    }
  };

  const toggleVideo = () => {
    const tracks = localStreamRef.current?.getVideoTracks();
    if (tracks) {
      tracks.forEach(track => (track.enabled = !track.enabled));
      setIsVideoOff(!isVideoOff);
      addDebug(`Video ${isVideoOff ? 'enabled' : 'disabled'}`);
    }
  };

  const endCall = () => {
    addDebug('Ending emergency call');
    // Clean up in the same order as normal VideoCall
    if (wsRef.current) wsRef.current.close();
    if (localStreamRef.current) localStreamRef.current.getTracks().forEach(track => track.stop());
    if (pcRef.current) pcRef.current.close();
    if (onEndCall) {
      onEndCall();
    }
  };

  const tryPlayRemoteVideo = () => {
    remoteVideoRef.current?.play().catch(e => addDebug(`Manual play failed: ${e.message}`));
  };

  return (
    <div className="fixed inset-0 bg-gray-900 text-white z-50 flex flex-col">
      {/* Emergency Header */}
      <div className="bg-red-800 p-3 text-center relative">
        <div className="flex items-center justify-center space-x-2 mb-1">
          <AlertTriangle className="w-5 h-5 text-yellow-400 animate-pulse" />
          <span className="font-bold text-lg">EMERGENCY CONSULTATION</span>
          <AlertTriangle className="w-5 h-5 text-yellow-400 animate-pulse" />
        </div>
        
        <div className="text-sm mb-1">Status: {status}</div>
        
        {isConnected && hasRemoteStream && (
          <div className="flex items-center justify-center space-x-1 text-sm">
            <Clock className="w-4 h-4" />
            <span>Duration: {formatDuration(callDuration)}</span>
          </div>
        )}
        
        {error && (
          <div className="bg-red-700 text-red-100 p-2 rounded mt-2 text-sm">
            {error}
          </div>
        )}
      </div>

      {/* Debug Info */}
      <div className="bg-gray-800 p-2 text-xs text-gray-400">
        <div className="flex flex-wrap gap-4 justify-center">
          <span>Room: emergency_{emergencyId}</span>
          <span>User: {currentUser}</span>
          <span>ICE: {isConnected ? '✅ Connected' : '❌ Not Connected'}</span>
          <span>Remote: {hasRemoteStream ? '✅ Active' : '❌ Waiting'}</span>
          <span>Peer: {remotePeerConnected ? '✅ Connected' : '❌ Waiting'}</span>
        </div>
      </div>

      {/* Main Video Area */}
      <div className="flex-1 relative bg-black">
        {/* Remote Video */}
        <video
          ref={remoteVideoRef}
          className="w-full h-full object-cover"
          autoPlay
          playsInline
          onClick={tryPlayRemoteVideo}
          style={{ display: hasRemoteStream ? 'block' : 'none' }}
        />

        {/* Waiting State */}
        {!hasRemoteStream && (
          <div className="flex items-center justify-center h-full text-center">
            <div className="max-w-md">
              <div className="flex justify-center mb-4">
                <div className="relative">
                  <User className="w-24 h-24 text-gray-600" />
                  <div className="absolute -top-2 -right-2">
                    <AlertTriangle className="w-8 h-8 text-red-500 animate-pulse" />
                  </div>
                </div>
              </div>
              <p className="text-xl mb-2">{status}</p>
              <p className="text-sm text-gray-400">
                {remotePeerConnected 
                  ? "Establishing video connection..." 
                  : "Waiting for the other participant to join..."
                }
              </p>
            </div>
          </div>
        )}

        {/* Local Video (Picture-in-Picture) */}
        <div className="absolute bottom-20 right-4 w-1/4 max-w-xs min-w-[200px] border-2 border-red-500 rounded-lg overflow-hidden shadow-lg">
          <video
            ref={localVideoRef}
            autoPlay
            muted
            playsInline
            className={`w-full h-full object-cover ${isVideoOff ? 'opacity-30' : ''}`}
          />
          {isVideoOff && (
            <div className="absolute inset-0 flex items-center justify-center bg-gray-800 bg-opacity-75">
              <MdVideocamOff className="w-8 h-8 text-gray-400" />
            </div>
          )}
        </div>

        {/* Emergency Indicator Overlay */}
        <div className="absolute top-4 left-4 bg-red-600 bg-opacity-90 px-3 py-1 rounded-full text-sm font-medium flex items-center space-x-1">
          <AlertTriangle className="w-4 h-4" />
          <span>EMERGENCY</span>
        </div>
      </div>

      {/* Control Panel */}
      <div className="bg-gray-800 p-4 flex justify-center space-x-6">
        <button 
          onClick={toggleMute} 
          className={`p-4 rounded-full transition-all duration-200 ${
            isMuted ? 'bg-red-500 hover:bg-red-600' : 'bg-gray-700 hover:bg-gray-600'
          }`}
          title={isMuted ? 'Unmute' : 'Mute'}
        >
          {isMuted ? <MdMicOff size={24} /> : <FiMic size={24} />}
        </button>
        
        <button 
          onClick={toggleVideo} 
          className={`p-4 rounded-full transition-all duration-200 ${
            isVideoOff ? 'bg-red-500 hover:bg-red-600' : 'bg-gray-700 hover:bg-gray-600'
          }`}
          title={isVideoOff ? 'Turn on camera' : 'Turn off camera'}
        >
          {isVideoOff ? <MdVideocamOff size={24} /> : <FiVideo size={24} />}
        </button>
        
        <button 
          onClick={endCall} 
          className="p-4 rounded-full bg-red-600 hover:bg-red-700 transition-all duration-200"
          title="End emergency call"
        >
          <MdPhoneDisabled size={24} />
        </button>
      </div>
    </div>
  );
};

export default EmergencyVideoCall;