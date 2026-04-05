export default function DashboardStats({ jobs }) {
  const stats = [
    { label: 'Total Tracked', value: jobs.length },
    { label: 'Applied', value: jobs.filter(j => j.status === 'Applied').length },
    { label: 'Interviewing', value: jobs.filter(j => j.status === 'Interviewing').length },
    { label: 'Offers', value: jobs.filter(j => j.status === 'Offer').length },
  ];

  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
      {stats.map((stat, i) => (
        <div key={stat.label} className={`glass-panel delay-${i * 100} animate-fade-in-up`} style={{ padding: '1.5rem', textAlign: 'center' }}>
          <div style={{ fontSize: '2.5rem', fontWeight: '700', color: 'var(--accent-primary)', marginBottom: '0.5rem' }}>
            {stat.value}
          </div>
          <div style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            {stat.label}
          </div>
        </div>
      ))}
    </div>
  );
}
