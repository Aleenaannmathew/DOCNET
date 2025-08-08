import React, { useEffect, useState, useRef } from 'react';
import { useSelector } from 'react-redux';
import { useParams } from 'react-router-dom';

const ChatRoom = () => {
  const [socket, setSocket] = useState(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [file, setFile] = useState(null);
  const [filePreview, setFilePreview] = useState(null);
  const [typingUser, setTypingUser] = useState(null);
  const [modalImage, setModalImage] = useState(null);
  const { token, user } = useSelector((state) => state.auth);
  const { id } = useParams();
  const scrollRef = useRef();
  const [recording, setRecording] = useState(false);
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);

  useEffect(() => {
    if (!token || !id) return;
    const scheme = window.location.protocol === "https:" ? "wss" : "ws";
    const host = window.location.host;
    const ws = new WebSocket(`${scheme}://${host}/ws/chat/?room_id=${id}&token=${token}`);
    setSocket(ws);

    ws.onmessage = (e) => {
      const data = JSON.parse(e.data);
      if (data.type === 'typing') {
        setTypingUser(data.is_typing ? data.user : null);
      } else if (data.type === 'history') {
        setMessages(data.messages);
      } else {
        setMessages((prev) => [...prev, data]);
      }
    };

    ws.onclose = () => console.log('WebSocket disconnected');
    return () => ws.close();
  }, [id, token]);

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendTyping = (isTyping) => {
    if (socket?.readyState === WebSocket.OPEN) {
      socket.send(JSON.stringify({ type: 'typing', is_typing: isTyping }));
    }
  };

  const handleFileChange = (e) => {
    const selected = e.target.files[0];
    if (!selected) return;
    if (selected.size > 5 * 1024 * 1024) return alert("Max 5MB file size allowed.");
    const reader = new FileReader();
    reader.onloadend = () => {
      setFile(reader.result);
      setFilePreview(selected.name);
    };
    reader.readAsDataURL(selected);
  };

  const sendMessage = () => {
    if (!input.trim() && !file) return;
    const payload = {
      type: 'message',
      message: input,
      file: file,
    };
    if (socket?.readyState === WebSocket.OPEN) {
      socket.send(JSON.stringify(payload));
      setInput('');
      setFile(null);
      setFilePreview(null);
    }
  };

  const startRecording = async () => {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    const mediaRecorder = new MediaRecorder(stream);
    mediaRecorderRef.current = mediaRecorder;
    audioChunksRef.current = [];

    mediaRecorder.ondataavailable = (e) => {
      audioChunksRef.current.push(e.data);
    };

    mediaRecorder.onstop = () => {
      const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
      const reader = new FileReader();
      reader.onloadend = () => {
        setFile(reader.result);
        setFilePreview("voice_message.webm");
      };
      reader.readAsDataURL(audioBlob);
    };

    mediaRecorder.start();
    setRecording(true);
  };

  const stopRecording = () => {
    mediaRecorderRef.current?.stop();
    setRecording(false);
  };

  return (
    <div className="h-screen flex flex-col bg-gray-100 relative">
      <div className="bg-blue-600 text-white px-4 py-3 font-bold text-lg">Chat Room #{id}</div>

      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {messages.map((msg, i) => {
          const isSender = msg.sender === user?.username;
          return (
            <div key={i} className={`flex ${isSender ? 'justify-end' : 'justify-start'}`}>
              <div className={`rounded-xl px-4 py-2 max-w-[70%] ${isSender ? 'bg-blue-500 text-white' : 'bg-white text-gray-800'} shadow-md`}>
                <div className="text-sm whitespace-pre-wrap">{msg.message}</div>

                {/* === Render PDF === */}
                {msg.file && msg.file.match(/\.pdf(\?.*)?$/i) && (
                  <a href={msg.file} download className="text-xs underline block mt-1">📄 Download PDF</a>
                )}

                {/* === Render Audio === */}
                {msg.file && msg.file.match(/\.(mp3|wav|webm)(\?.*)?$/i) && (
                  <audio controls src={msg.file} className="mt-2 w-full min-w-[200px] max-w-full rounded shadow" />
                )}

                {/* === Render Image with Modal Preview === */}
                {msg.file && msg.file.match(/\.(jpeg|jpg|png|gif)(\?.*)?$/i) && (
                  <img
                    src={msg.file}
                    alt="sent"
                    onClick={() => setModalImage(msg.file)}
                    className="mt-2 max-w-xs rounded cursor-pointer hover:opacity-80"
                  />
                )}

                {/* === Fallback File === */}
                {msg.file && !msg.file.match(/\.(pdf|mp3|wav|webm|jpeg|jpg|png|gif)(\?.*)?$/i) && (
                  <a href={msg.file} download className="text-xs underline block mt-1">📎 Download File</a>
                )}
              </div>
            </div>
          );
        })}
        <div ref={scrollRef} />
      </div>

      {typingUser && typingUser !== user?.username && (
        <div className="px-4 text-sm italic text-gray-600 pb-1">{typingUser} is typing...</div>
      )}

      <div className="border-t bg-white p-4 flex flex-col gap-2">
        <textarea
          className="border rounded p-2 w-full h-20 resize-none focus:outline-blue-400"
          placeholder="Type a message"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onFocus={() => sendTyping(true)}
          onBlur={() => sendTyping(false)}
        />
        <div className="flex flex-wrap justify-between items-center gap-2">
          <input type="file" accept="image/*,application/pdf,audio/*" onChange={handleFileChange} className="text-sm" />
          <button
            onClick={recording ? stopRecording : startRecording}
            className={`text-white px-3 py-1 rounded ${recording ? 'bg-red-500' : 'bg-green-600'}`}
          >
            {recording ? 'Stop Recording' : '🎤 Record Voice'}
          </button>
          {filePreview && <span className="text-xs text-gray-600">📎 {filePreview}</span>}
          <button onClick={sendMessage} className="bg-blue-600 text-white px-4 py-2 rounded">Send</button>
        </div>
      </div>

      {/* === Image Modal === */}
      {modalImage && (
        <div
          className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50"
          onClick={() => setModalImage(null)}
        >
          <img
            src={modalImage}
            alt="Preview"
            className="max-h-[90vh] max-w-[90vw] rounded shadow-lg"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}
    </div>
  );
};

export default ChatRoom;
