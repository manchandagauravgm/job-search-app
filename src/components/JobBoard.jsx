export default function JobBoard({ jobs, onEdit, onDelete, handleStatusUpdate }) {
  const statuses = ['Wishlist', 'Applied', 'Interviewing', 'Offer', 'Rejected'];

  const handleStatusChange = (e, job) => {
    const newStatus = e.target.value;
    handleStatusUpdate(job.id, newStatus);
  };

  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem' }}>
      {statuses.map((status, index) => {
        const columnJobs = jobs.filter(j => j.status === status);
        
        return (
          <div key={status} className={`glass-panel delay-${index * 100} animate-fade-in-up`} style={{ padding: '1.5rem', minHeight: '400px' }}>
            <h3 style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', paddingBottom: '0.5rem', borderBottom: '1px solid var(--glass-border)' }}>
              {status}
              <span style={{ fontSize: '0.8rem', background: 'rgba(255,255,255,0.1)', padding: '0.2rem 0.6rem', borderRadius: '12px' }}>
                {columnJobs.length}
              </span>
            </h3>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {columnJobs.map(job => (
                <div key={job.id} className="glass-panel" style={{ padding: '1.25rem', background: 'rgba(0,0,0,0.2)', transition: 'transform 0.2s', borderLeft: `4px solid ${status === 'Offer' ? 'var(--success)' : status === 'Interviewing' ? 'var(--warning)' : status === 'Rejected' ? 'var(--danger)' : 'var(--accent-primary)'}` }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.5rem' }}>
                    <h4 style={{ fontSize: '1.1rem', margin: 0 }}>{job.role}</h4>
                  </div>
                  <div style={{ color: 'var(--accent-secondary)', fontWeight: '600', marginBottom: '0.75rem' }}>{job.company}</div>
                  
                  <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '1rem', display: 'flex', justifyContent: 'space-between' }}>
                    <span>{job.date}</span>
                    <select 
                      value={job.status} 
                      onChange={(e) => handleStatusChange(e, job)}
                      style={{ background: 'transparent', color: 'var(--text-primary)', border: 'none', cursor: 'pointer', outline: 'none', padding: 0 }}
                    >
                      {statuses.map(s => <option key={s} value={s} style={{ background: 'var(--bg-secondary)' }}>{s}</option>)}
                    </select>
                  </div>

                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <button onClick={() => onEdit(job)} className="btn btn-secondary" style={{ padding: '0.4rem 0.8rem', fontSize: '0.8rem', flex: 1 }}>Edit</button>
                    <button onClick={() => onDelete(job.id)} className="btn btn-secondary" style={{ padding: '0.4rem 0.8rem', fontSize: '0.8rem', color: 'var(--danger)', borderColor: 'rgba(239, 68, 68, 0.3)' }}>Drop</button>
                  </div>
                </div>
              ))}
              {columnJobs.length === 0 && (
                <div style={{ textAlign: 'center', color: 'var(--text-secondary)', fontSize: '0.9rem', padding: '2rem 0', fontStyle: 'italic' }}>
                  No jobs in {status}
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
