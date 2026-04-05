import { useState, useEffect } from 'react';

export default function ResumeHub({ onClose }) {
  const [resume, setResume] = useState('');

  useEffect(() => {
    const saved = localStorage.getItem('masterResume');
    if (saved) setResume(saved);

    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = '';
    };
  }, []);

  const handleSave = () => {
    localStorage.setItem('masterResume', resume);
    alert("Master Resume Saved successfully to LocalStorage!");
    onClose();
  };

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100, padding: '1rem' }}>
      <div className="glass-panel animate-fade-in-up" style={{ width: '100%', maxWidth: '800px', padding: '2rem', background: 'var(--bg-secondary)', maxHeight: '90vh', display: 'flex', flexDirection: 'column' }}>
        <h2 style={{ marginBottom: '0.5rem', color: 'var(--text-primary)', flexShrink: 0 }}>Master Resume Hub</h2>
        <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem', fontSize: '0.9rem', flexShrink: 0 }}>Paste your base plain-text or markdown resume here. The AI will use this as the source truth to tailor your applications.</p>
        
        <textarea 
          className="input-field" 
          value={resume} 
          onChange={(e) => setResume(e.target.value)}
          rows="15" 
          placeholder="Experience\n- Software Engineer at Acme Corp...\n\nEducation\n- B.S in Computer Science..."
          style={{ width: '100%', flex: 1, resize: 'none', fontFamily: 'monospace', fontSize: '0.85rem' }}
        />

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '1.5rem', flexShrink: 0 }}>
          <button onClick={onClose} className="btn btn-secondary">Close / Cancel</button>
          <button onClick={handleSave} className="btn">Save Master Resume</button>
        </div>
      </div>
    </div>
  );
}
