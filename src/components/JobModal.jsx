import { useState, useEffect } from 'react';
import { getTailoredResume } from '../services/aiService';
import { marked } from 'marked';
import html2pdf from 'html2pdf.js';

export default function JobModal({ job, onSave, onClose }) {
  const [formData, setFormData] = useState({
    company: '',
    role: '',
    status: 'Wishlist',
    date: new Date().toISOString().split('T')[0],
    notes: '',
    jobDescription: '',
    tailoredResume: ''
  });
  
  const [isTailoring, setIsTailoring] = useState(false);
  const [tailorError, setTailorError] = useState(null);

  useEffect(() => {
    if (job) setFormData(prev => ({ ...prev, ...job }));
  }, [job]);

  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = '';
    };
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(formData);
  };

  const handeTailorResume = async () => {
    if (!formData.jobDescription || !formData.jobDescription.trim()) {
      setTailorError("Please paste a Job Description first!");
      return;
    }
    
    setIsTailoring(true);
    setTailorError(null);
    try {
      const masterResume = localStorage.getItem('masterResume');
      if (!masterResume || !masterResume.trim()) {
        throw new Error("Master Resume is empty! Please create one in the Resume Hub first.");
      }
      
      const tailoredContent = await getTailoredResume(masterResume, formData.jobDescription);
      setFormData(prev => ({ ...prev, tailoredResume: tailoredContent }));
    } catch (e) {
      console.error(e);
      setTailorError(e.message);
    } finally {
      setIsTailoring(false);
    }
  };

  const handleDownload = () => {
    const element = document.createElement("a");
    const file = new Blob([formData.tailoredResume], {type: 'text/markdown'});
    element.href = URL.createObjectURL(file);
    const companyName = formData.company ? formData.company.replace(/\s+/g, '_') : 'Tailored';
    element.download = `${companyName}_Resume.md`;
    document.body.appendChild(element);
    element.click();
    element.remove();
  };

  const handleDownloadPDF = () => {
    const htmlContent = marked.parse(formData.tailoredResume);
    const wrapper = document.createElement('div');
    wrapper.style.fontFamily = "'Inter', system-ui, -apple-system, sans-serif";
    wrapper.style.padding = "40px";
    wrapper.style.color = "#1e293b";
    wrapper.style.lineHeight = "1.5";
    wrapper.style.fontSize = "11pt";
    wrapper.innerHTML = htmlContent;

    const style = document.createElement('style');
    style.innerHTML = `
      h1 { font-size: 24pt; border-bottom: 2px solid #cbd5e1; padding-bottom: 5px; margin-bottom: 10px; margin-top: 15px; }
      h2 { font-size: 16pt; margin-top: 15px; margin-bottom: 8px; color: #0f172a; }
      h3 { font-size: 13pt; margin-top: 10px; margin-bottom: 5px; }
      p { margin-bottom: 10px; }
      ul { padding-left: 20px; margin-bottom: 12px; }
      li { margin-bottom: 4px; }
      strong { font-weight: 600; color: #000; }
      hr { border: none; border-top: 1px solid #cbd5e1; margin: 15px 0; }
    `;
    wrapper.appendChild(style);

    const companyName = formData.company ? formData.company.replace(/\s+/g, '_') : 'Tailored';
    const opt = {
      margin:       0,
      filename:     `${companyName}_Resume.pdf`,
      image:        { type: 'jpeg', quality: 0.98 },
      html2canvas:  { scale: 2 },
      jsPDF:        { unit: 'pt', format: 'letter', orientation: 'portrait' }
    };
    html2pdf().set(opt).from(wrapper).save();
  };

  return (
    <div className="modal-overlay">
      <form onSubmit={handleSubmit} className="modal-panel glass-panel animate-fade-in-up">

        {/* Row 1: Header */}
        <div className="modal-header">
          <h2 style={{ margin: 0, color: 'var(--text-primary)', fontSize: '1.5rem' }}>
            {job ? 'Edit Application' : 'Add New Application'}
          </h2>
        </div>

        {/* Row 2: Scrollable body */}
        <div className="modal-body">

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem', color: 'var(--text-secondary)', fontWeight: 500 }}>Company</label>
              <input required type="text" className="input-field" value={formData.company} onChange={e => setFormData({...formData, company: e.target.value})} placeholder="e.g. Acme Corp" />
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem', color: 'var(--text-secondary)', fontWeight: 500 }}>Role / Title</label>
              <input required type="text" className="input-field" value={formData.role} onChange={e => setFormData({...formData, role: e.target.value})} placeholder="e.g. Software Engineer" />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem', color: 'var(--text-secondary)', fontWeight: 500 }}>Status</label>
              <select className="input-field" value={formData.status} onChange={e => setFormData({...formData, status: e.target.value})}>
                <option value="Wishlist">Wishlist</option>
                <option value="Applied">Applied</option>
                <option value="Interviewing">Interviewing</option>
                <option value="Offer">Offer</option>
                <option value="Rejected">Rejected</option>
              </select>
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem', color: 'var(--text-secondary)', fontWeight: 500 }}>Date</label>
              <input required type="date" className="input-field" value={formData.date} onChange={e => setFormData({...formData, date: e.target.value})} />
            </div>
          </div>

          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem', color: 'var(--text-secondary)', fontWeight: 500 }}>Job Description</label>
            <textarea className="input-field" value={formData.jobDescription || ''} onChange={e => setFormData({...formData, jobDescription: e.target.value})} rows="4" placeholder="Paste the job requirements to let the AI tailor your resume." style={{ resize: 'none' }}></textarea>
          </div>

          <div style={{ padding: '1.25rem', background: 'rgba(99, 102, 241, 0.1)', border: '1px solid rgba(99, 102, 241, 0.3)', borderRadius: '12px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <h4 style={{ margin: 0, color: 'var(--accent-secondary)' }}>✨ AI Resume Tailor</h4>
              <button type="button" onClick={handeTailorResume} className="btn" disabled={isTailoring}>
                {isTailoring ? 'Generating...' : 'Auto-Tailor Resume'}
              </button>
            </div>
            {tailorError && <div style={{ color: 'var(--danger)', fontSize: '0.85rem', marginBottom: '1rem' }}>{tailorError}</div>}
            
            {formData.tailoredResume && (
              <div className="animate-fade-in-up">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                  <label style={{ fontSize: '0.9rem', color: 'var(--success)', fontWeight: 600 }}>Tailored Resume Output:</label>
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <button type="button" onClick={handleDownload} className="btn" style={{ padding: '0.4rem 0.8rem', fontSize: '0.8rem', background: 'var(--success)', color: 'var(--bg-primary)' }}>
                      ⬇️ Download .md
                    </button>
                    <button type="button" onClick={handleDownloadPDF} className="btn" style={{ padding: '0.4rem 0.8rem', fontSize: '0.8rem', background: 'var(--accent-primary)', color: 'white' }}>
                       📄 Download .pdf
                    </button>
                  </div>
                </div>
                <textarea 
                  className="input-field" 
                  value={formData.tailoredResume} 
                  onChange={e => setFormData({...formData, tailoredResume: e.target.value})}
                  rows="10" 
                  style={{ width: '100%', resize: 'none', fontFamily: 'monospace', fontSize: '0.82rem', background: 'rgba(0,0,0,0.3)', borderColor: 'var(--success)', color: 'var(--text-primary)' }}
                />
              </div>
            )}
          </div>

          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem', color: 'var(--text-secondary)', fontWeight: 500 }}>Personal Notes</label>
            <textarea className="input-field" value={formData.notes || ''} onChange={e => setFormData({...formData, notes: e.target.value})} rows="2" placeholder="Interview tips, references..." style={{ resize: 'none' }}></textarea>
          </div>
        </div>

        {/* Row 3: Footer */}
        <div className="modal-footer">
          <button type="button" onClick={onClose} className="btn btn-secondary">Cancel</button>
          <button type="submit" className="btn">{job ? 'Update Tracker' : 'Save Application'}</button>
        </div>
      </form>
    </div>
  );
}
