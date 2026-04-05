import { useState, useEffect, useRef } from 'react';
import { LiveAiService } from '../services/liveAiService';

export default function GeminiLiveModal({ onClose }) {
  const [stream, setStream] = useState(null);
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState('');
  const [service, setService] = useState(null);
  
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const captureIntervalRef = useRef(null);
  
  // Clean up streams completely
  const stopMedia = () => {
    if (stream) {
      stream.getTracks().forEach(t => t.stop());
      setStream(null);
    }
  };

  useEffect(() => {
    // Mount: instantiate standard liveAiService
    if (!import.meta.env.VITE_GEMINI_API_KEY) {
       setMessages(prev => [...prev, "[Error]: Missing API Key for Gemini Live. Check .env"]);
       return;
    }
    
    const wsService = new LiveAiService(
      import.meta.env.VITE_GEMINI_API_KEY,
      (text) => setMessages(prev => [...prev, text]),
      (err) => setMessages(prev => [...prev, `[System Error]: ${err}`])
    );
    
    wsService.connect();
    setService(wsService);
    
    document.body.style.overflow = 'hidden';
    
    return () => {
      document.body.style.overflow = '';
      wsService.disconnect();
      stopMedia();
      clearInterval(captureIntervalRef.current);
    };
  }, []);

  // When stream changes, bind to the video element and start capture loop
  useEffect(() => {
    if (stream && videoRef.current) {
      videoRef.current.srcObject = stream;
      
      // Clear previous loop if exists
      if (captureIntervalRef.current) clearInterval(captureIntervalRef.current);
      
      // Start loop hitting 1 Frame Per Second (conserves token limits significantly while testing screen sharing/camera)
      captureIntervalRef.current = setInterval(() => {
        if (!videoRef.current || !canvasRef.current || !service) return;
        
        const video = videoRef.current;
        if (video.videoWidth === 0 || video.videoHeight === 0) return;
        
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        
        // Match aspect ratio dynamically
        canvas.width = 640; 
        canvas.height = 480;
        
        // Draw frame onto a hidden canvas
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        
        // Extract base64 encoded JPG data WITHOUT the "data:image/jpeg;base64," header snippet
        const base64Data = canvas.toDataURL('image/jpeg', 0.8).split(',')[1];
        
        // Feed frame block directly into Bidi Streaming tunnel 
        if (base64Data) {
            service.sendImageChunk(base64Data);
        }
      }, 1000); // 1-second capture delay 
    }
  }, [stream, service]);

  const startCamera = async () => {
    try {
      stopMedia();
      const s = await navigator.mediaDevices.getUserMedia({ video: true, audio: false });
      setStream(s);
    } catch (e) {
      alert("Camera permissions denied or unavailable");
    }
  };

  const startScreenShare = async () => {
    try {
      stopMedia();
      const s = await navigator.mediaDevices.getDisplayMedia({ video: true, audio: false });
      setStream(s);
    } catch (e) {
      alert("Screen capture was canceled or denied.");
    }
  };
  
  const sendMessage = (e) => {
    e.preventDefault();
    if (!inputText.trim() || !service) return;
    
    setMessages(prev => [...prev, `[You]: ${inputText}`]);
    service.sendTextMessage(inputText);
    setInputText('');
  };

  // Rendering Layout 
  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(8px)', zIndex: 1000, display: 'flex', flexDirection: 'column' }}>
       <h2 style={{ padding: '1rem', margin: 0, color: 'white', borderBottom: '1px solid rgba(255,255,255,0.1)', flexShrink: 0 }}>💬 Gemini Multimodal Live Session</h2>
       
       <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>
          {/* LEFT PANEL: Media Box */}
          <div style={{ flex: 1, borderRight: '1px solid rgba(255,255,255,0.1)', display: 'flex', flexDirection: 'column', padding: '1rem', alignItems: 'center', justifyContent: 'center' }}>
             {stream ? (
               <video ref={videoRef} autoPlay playsInline style={{ maxWidth: '100%', maxHeight: '500px', borderRadius: '12px', background: 'black', border: '1px solid rgba(99, 102, 241, 0.4)' }} />
             ) : (
               <div style={{ padding: '3rem', color: 'var(--text-secondary)', textAlign: 'center', background: 'rgba(0,0,0,0.3)', borderRadius: '12px' }}>
                  No active video stream. Click below to natively stream your Camera or Desktop to Gemini Live over a WebSocket.
               </div>
             )}
             
             {/* Hidden canvas used exclusively to capture frame buffers computationally */}
             <canvas ref={canvasRef} style={{ display: 'none' }} />
             
             <div style={{ display: 'flex', gap: '1rem', marginTop: '2rem' }}>
                <button className="btn" onClick={startScreenShare}>🖥 Share Screen</button>
                <button className="btn" onClick={startCamera}>📷 Open Camera</button>
                <button className="btn btn-secondary" onClick={stopMedia}>⏹ Stop Feed</button>
             </div>
          </div>
          
          {/* RIGHT PANEL: Live Chat View */}
          <div style={{ width: '400px', background: 'var(--bg-secondary)', display: 'flex', flexDirection: 'column' }}>
             <div style={{ flex: 1, padding: '1rem', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '0.5rem', fontFamily: 'monospace' }}>
                {messages.map((m, i) => (
                  <div key={i} style={{ padding: '0.5rem', background: m.startsWith('[You]') ? 'rgba(99, 102, 241, 0.2)' : m.startsWith('[Sys') ? 'rgba(245, 158, 11, 0.1)' : 'rgba(16, 185, 129, 0.1)', borderRadius: '8px' }}>
                    {m}
                  </div>
                ))}
             </div>
             
             <form onSubmit={sendMessage} style={{ display: 'flex', borderTop: '1px solid var(--glass-border)', padding: '0.5rem' }}>
                <input type="text" className="input-field" placeholder="Chat with AI..." value={inputText} onChange={e => setInputText(e.target.value)} style={{ flex: 1, marginRight: '0.5rem', borderRadius: '4px' }} />
                <button type="submit" className="btn" style={{ borderRadius: '4px', padding: '0.5rem 1rem' }}>Send</button>
             </form>
          </div>
       </div>

       <div style={{ padding: '1rem', borderTop: '1px solid rgba(255,255,255,0.1)', textAlign: 'right', flexShrink: 0 }}>
         <button className="btn btn-secondary" onClick={onClose}>End Live Session</button>
       </div>
    </div>
  );
}
