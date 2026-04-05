import { useState, useEffect } from 'react';

import DashboardStats from './components/DashboardStats';
import JobBoard from './components/JobBoard';
import JobModal from './components/JobModal';
import ResumeHub from './components/ResumeHub';
import GeminiLiveModal from './components/GeminiLiveModal';
import './App.css';

const DEFAULT_JOBS = [
  { id: '1', company: 'Google', role: 'Frontend Engineer', status: 'Interviewing', date: '2026-03-20', notes: 'First round done' },
  { id: '2', company: 'Stripe', role: 'Full Stack Developer', status: 'Applied', date: '2026-03-21', notes: 'Referred by John' },
  { id: '3', company: 'Vercel', role: 'UX Engineer', status: 'Wishlist', date: '2026-03-22', notes: 'Would love to work here' },
];

function App() {
  const [jobs, setJobs] = useState(() => {
    try {
      const saved = localStorage.getItem('jobSearchData');
      return saved ? JSON.parse(saved) : DEFAULT_JOBS;
    } catch {
      return DEFAULT_JOBS;
    }
  });

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isResumeHubOpen, setIsResumeHubOpen] = useState(false);
  const [isLiveOpen, setIsLiveOpen] = useState(false);
  const [editingJob, setEditingJob] = useState(null);

  // Sync to local storage whenever jobs array changes instantly
  useEffect(() => {
    localStorage.setItem('jobSearchData', JSON.stringify(jobs));
  }, [jobs]);

  const handleSaveJob = (jobData) => {
    if (editingJob) {
      setJobs(jobs.map(j => j.id === editingJob.id ? { ...jobData, id: editingJob.id } : j));
    } else {
      setJobs([...jobs, { ...jobData, id: Date.now().toString() }]);
    }
    setIsModalOpen(false);
    setEditingJob(null);
  }

  const handleEdit = (job) => {
    setEditingJob(job);
    setIsModalOpen(true);
  };
  
  const handleDelete = (id) => {
    setJobs(jobs.filter(j => j.id !== id));
  };

  const handleStatusUpdate = (id, newStatus) => {
    setJobs(jobs.map(j => j.id === id ? { ...j, status: newStatus } : j));
  };

  const openNewModal = () => {
    setEditingJob(null);
    setIsModalOpen(true);
  };

  return (
    <>
      <div className="container animate-fade-in-up">
        <header className="header">
          <div>
            <h1 style={{ marginBottom: '0.5rem' }}>Job Search Tracker</h1>
            <p style={{ color: 'var(--text-secondary)' }}>Manage your applications and land your dream job</p>
          </div>
          <div style={{ display: 'flex', gap: '1rem' }}>
            <button className="btn delay-100 animate-fade-in-up" onClick={() => setIsLiveOpen(true)} style={{ background: '#ec4899' }}>
              🎙 Gemini Live
            </button>
            <button className="btn btn-secondary delay-100 animate-fade-in-up" onClick={() => setIsResumeHubOpen(true)}>
              📝 Resume Hub
            </button>
            <button className="btn delay-100 animate-fade-in-up" onClick={openNewModal}>
              + Add New Job
            </button>
          </div>
        </header>

        <DashboardStats jobs={jobs} />
        
        <main style={{ marginTop: '2.5rem' }}>
          <JobBoard jobs={jobs} onEdit={handleEdit} onDelete={handleDelete} handleStatusUpdate={handleStatusUpdate} />
        </main>
      </div>

      {isModalOpen && (
        <JobModal 
          job={editingJob} 
          onSave={handleSaveJob} 
          onClose={() => setIsModalOpen(false)} 
        />
      )}

      {isResumeHubOpen && (
        <ResumeHub onClose={() => setIsResumeHubOpen(false)} />
      )}

      {isLiveOpen && (
        <GeminiLiveModal onClose={() => setIsLiveOpen(false)} />
      )}
    </>
  );
}

export default App;
