import React, { useRef, useEffect, useState } from 'react';
import { FiVideo, FiMic } from 'react-icons/fi';
import { MdMicOff, MdPhoneDisabled, MdVideocamOff } from 'react-icons/md';

const VideoCall = ({ slotId, token, onEndCall }) => {
  const localVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);
  const pcRef = useRef(null);
  const wsRef = useRef(null);
  const pendingCandidates = useRef([]);
  const isRemoteDescSet = useRef(false);
  const offerRetryRef = useRef(null);
  const localStreamRef = useRef(null);

  const [status, setStatus] = useState('Initializing...');
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);
  const [error, setError] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const [hasRemoteStream, setHasRemoteStream] = useState(false);
  const [remotePeerConnected, setRemotePeerConnected] = useState(false);
  const [refsReady, setRefsReady] = useState(false); // NEW

  // Decode token to get current user
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

  useEffect(() => {
    // Check for refs after mount
    if (localVideoRef.current && remoteVideoRef.current) {
      setRefsReady(true);
    }
  }, []);

  useEffect(() => {
    if (!refsReady) return;

    const pc = new RTCPeerConnection({
      iceServers: [
        { urls: 'stun:stun.l.google.com:19302' },
        { urls: 'stun:stun1.l.google.com:19302' },
        { urls: 'stun:global.stun.twilio.com:3478' },
        { urls: 'stun:stun.relay.metered.ca:80' }
      ]
    });
    pcRef.current = pc;

    const start = async () => {
      try {
        addDebug('Requesting media access...');
        setStatus('Requesting camera access...');

        const localStream = await navigator.mediaDevices.getUserMedia({
          video: { width: { ideal: 1280 }, height: { ideal: 720 }, facingMode: 'user' },
          audio: { echoCancellation: true, noiseSuppression: true, autoGainControl: true }
        });

        localStreamRef.current = localStream;
        if (localVideoRef.current) {
          localVideoRef.current.srcObject = localStream;
          localVideoRef.current.play().catch(e => addDebug(`Local video play error: ${e.message}`));
        }

        localStream.getTracks().forEach(track => pc.addTrack(track, localStream));

        const wsUrl = `ws://127.0.0.1:8000/ws/videocall/${slotId}/?token=${encodeURIComponent(token)}`;
        const ws = new WebSocket(wsUrl);
        wsRef.current = ws;

        ws.onopen = () => {
          addDebug('WebSocket connected');
          setStatus('Connected to server');
        };

        ws.onerror = () => {
          setError('Failed to connect to video call service');
          setStatus('Connection failed');
        };

        ws.onclose = (event) => {
          addDebug(`WebSocket closed: ${event.code}`);
          setStatus('Disconnected');
        };

        pc.onicecandidate = (e) => {
          if (e.candidate && ws.readyState === WebSocket.OPEN) {
            if (isRemoteDescSet.current) {
              ws.send(JSON.stringify({ type: 'ice', candidate: e.candidate }));
            } else {
              pendingCandidates.current.push(e.candidate);
            }
          }
        };

        pc.ontrack = (e) => {
          addDebug(`Remote track: ${e.track.kind}`);
          const remoteStream = e.streams?.[0];
          if (!remoteStream) return;

          setRemotePeerConnected(true);
          if (remoteVideoRef.current) {
            remoteVideoRef.current.srcObject = remoteStream;
            remoteVideoRef.current.play()
              .then(() => {
                setHasRemoteStream(true);
                setStatus('Call Active');
              })
              .catch(e => {
                setStatus('Click video to play');
                addDebug(`Remote video play error: ${e.message}`);
              });
          }
        };

        pc.oniceconnectionstatechange = () => {
          const state = pc.iceConnectionState;
          addDebug(`ICE connection state: ${state}`);
          if (state === 'connected' || state === 'completed') {
            setIsConnected(true);
            setStatus('Call Active');
          } else if (state === 'disconnected') {
            setStatus('Reconnecting...');
            setIsConnected(false);
          } else if (state === 'failed') {
            setStatus('Connection failed');
            setError('Connection failed');
          } else if (state === 'closed') {
            setStatus('Call ended');
          }
        };

        ws.onmessage = async (event) => {
          const msg = JSON.parse(event.data);
          addDebug(`Received: ${msg.type}`);

          if (msg.type === 'joined') {
            setStatus(msg.isOfferer ? 'Initiating call...' : 'Waiting for call...');
            if (msg.isOfferer) {
              const sendOffer = async () => {
                const offer = await pc.createOffer({ offerToReceiveAudio: true, offerToReceiveVideo: true });
                await pc.setLocalDescription(offer);
                ws.send(JSON.stringify({ type: 'offer', sdp: offer.sdp }));
              };

              await sendOffer();
              offerRetryRef.current = setInterval(() => {
                if (pc.signalingState === 'have-local-offer') {
                  sendOffer();
                } else {
                  clearInterval(offerRetryRef.current);
                  offerRetryRef.current = null;
                }
              }, 3000);
            }
          }

          if (msg.type === 'offer') {
            await pc.setRemoteDescription(new RTCSessionDescription({ type: 'offer', sdp: msg.sdp }));
            isRemoteDescSet.current = true;

            const answer = await pc.createAnswer();
            await pc.setLocalDescription(answer);
            ws.send(JSON.stringify({ type: 'answer', sdp: answer.sdp }));

            pendingCandidates.current.forEach(c => ws.send(JSON.stringify({ type: 'ice', candidate: c })));
            pendingCandidates.current = [];
          }

          if (msg.type === 'answer') {
            await pc.setRemoteDescription(new RTCSessionDescription({ type: 'answer', sdp: msg.sdp }));
            isRemoteDescSet.current = true;
            if (offerRetryRef.current) {
              clearInterval(offerRetryRef.current);
              offerRetryRef.current = null;
            }
            pendingCandidates.current.forEach(c => ws.send(JSON.stringify({ type: 'ice', candidate: c })));
            pendingCandidates.current = [];
          }

          if (msg.type === 'ice' && msg.candidate) {
            const candidate = new RTCIceCandidate(msg.candidate);
            if (pc.remoteDescription) {
              await pc.addIceCandidate(candidate);
            } else {
              pendingCandidates.current.push(candidate);
            }
          }
        };
      } catch (err) {
        addDebug(`Start error: ${err.message}`);
        setError('Could not access media devices');
        setStatus('Error');
      }
    };

    start();

    return () => {
      if (offerRetryRef.current) clearInterval(offerRetryRef.current);
      if (pcRef.current) pcRef.current.close();
      if (wsRef.current) wsRef.current.close();
      if (localStreamRef.current) {
        localStreamRef.current.getTracks().forEach(track => track.stop());
      }
    };
  }, [refsReady, slotId, token]);

  const toggleMute = () => {
    const tracks = localStreamRef.current?.getAudioTracks();
    if (tracks) {
      tracks.forEach(t => (t.enabled = !t.enabled));
      setIsMuted(!isMuted);
    }
  };

  const toggleVideo = () => {
    const tracks = localStreamRef.current?.getVideoTracks();
    if (tracks) {
      tracks.forEach(t => (t.enabled = !t.enabled));
      setIsVideoOff(!isVideoOff);
    }
  };

  const endCall = () => {
    if (wsRef.current) wsRef.current.close();
    if (localStreamRef.current) localStreamRef.current.getTracks().forEach(t => t.stop());
    if (pcRef.current) pcRef.current.close();
    if (onEndCall) onEndCall();
  };

  const tryPlayRemoteVideo = () => {
    remoteVideoRef.current?.play().catch(e => addDebug(`Manual play failed: ${e.message}`));
  };

  return (
    <div className="fixed inset-0 bg-gray-900 text-white z-50 flex flex-col">
      <div className="bg-gray-800 p-2 text-center text-sm">
        <div>Status: {status}</div>
        <div className="text-xs text-gray-400 mt-1">
          Room: {slotId} | User: {currentUser} | ICE: {isConnected ? 'Connected' : 'Not Connected'} |
          Remote Video: {hasRemoteStream ? 'Yes' : 'No'} | Peer: {remotePeerConnected ? 'Yes' : 'No'}
        </div>
      </div>

      <div className="flex-1 relative bg-black">
        <video
          ref={remoteVideoRef}
          className="w-full h-full object-cover"
          autoPlay
          playsInline
          onClick={tryPlayRemoteVideo}
          style={{ display: hasRemoteStream ? 'block' : 'none' }}
        />

        {!hasRemoteStream && (
          <div className="flex items-center justify-center h-full text-center">
            <p className="text-xl">{status}</p>
          </div>
        )}

        <div className="absolute bottom-20 right-4 w-1/4 max-w-xs border-2 border-gray-600 rounded overflow-hidden">
          <video
            ref={localVideoRef}
            autoPlay
            muted
            playsInline
            className={`w-full h-full object-cover ${isVideoOff ? 'opacity-30' : ''}`}
          />
        </div>
      </div>

      <div className="bg-gray-800 p-4 flex justify-center space-x-6">
        <button onClick={toggleMute} className={`p-4 rounded-full ${isMuted ? 'bg-red-500' : 'bg-gray-700'}`}>
          {isMuted ? <MdMicOff size={24} /> : <FiMic size={24} />}
        </button>
        <button onClick={toggleVideo} className={`p-4 rounded-full ${isVideoOff ? 'bg-red-500' : 'bg-gray-700'}`}>
          {isVideoOff ? <MdVideocamOff size={24} /> : <FiVideo size={24} />}
        </button>
        <button onClick={endCall} className="p-4 rounded-full bg-red-600">
          <MdPhoneDisabled size={24} />
        </button>
      </div>
    </div>
  );
};

export default VideoCall;
