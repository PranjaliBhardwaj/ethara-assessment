import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';

const Dashboard = () => {
  const { api } = useAuth();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await api.get('/tasks/stats');
        setStats(response.data.data);
      } catch (err) {
        setError('Failed to fetch dashboard statistics.');
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, [api]);

  if (loading) return <div>Loading dashboard...</div>;
  if (error) return <div className="badge danger">{error}</div>;

  const { stats: s, recentTasks } = stats;

  return (
    <div className="container">
      <h1 style={{ marginBottom: '2rem' }}>Dashboard Overview</h1>
      
      <div className="grid grid-2" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', marginBottom: '2rem' }}>
        <div className="card" style={{ borderLeft: '4px solid var(--color-primary)' }}>
          <h3 style={{ fontSize: '0.9rem', color: 'var(--color-muted)' }}>Total Tasks</h3>
          <p style={{ fontSize: '2rem', fontWeight: 'bold', margin: '0.5rem 0' }}>{s.total}</p>
        </div>
        <div className="card" style={{ borderLeft: '4px solid #fbbf24' }}>
          <h3 style={{ fontSize: '0.9rem', color: 'var(--color-muted)' }}>In Progress</h3>
          <p style={{ fontSize: '2rem', fontWeight: 'bold', margin: '0.5rem 0' }}>{s['in-progress']}</p>
        </div>
        <div className="card" style={{ borderLeft: '4px solid var(--color-success)' }}>
          <h3 style={{ fontSize: '0.9rem', color: 'var(--color-muted)' }}>Completed</h3>
          <p style={{ fontSize: '2rem', fontWeight: 'bold', margin: '0.5rem 0' }}>{s.done}</p>
        </div>
        <div className="card" style={{ borderLeft: '4px solid var(--color-danger)' }}>
          <h3 style={{ fontSize: '0.9rem', color: 'var(--color-muted)' }}>Overdue</h3>
          <p style={{ fontSize: '2rem', fontWeight: 'bold', margin: '0.5rem 0' }}>{s.overdue}</p>
        </div>
      </div>

      <div className="grid grid-2">
        <div className="card">
          <h2 style={{ marginBottom: '1rem', fontSize: '1.25rem' }}>Recent Activity</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {recentTasks.length > 0 ? recentTasks.map(task => (
              <div key={task._id} style={{ padding: '0.5rem', borderBottom: '1px solid #f3f4f6', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <p style={{ fontWeight: '500', marginBottom: '0.25rem' }}>{task.title}</p>
                  <span style={{ fontSize: '0.75rem', color: 'var(--color-muted)' }}>In {task.projectId?.title}</span>
                </div>
                <span className={`badge ${task.status === 'done' ? 'success' : ''}`} style={{ textTransform: 'capitalize' }}>
                  {task.status}
                </span>
              </div>
            )) : <p>No recent tasks found.</p>}
          </div>
        </div>
        
        <div className="card">
          <h2 style={{ marginBottom: '1rem', fontSize: '1.25rem' }}>Tasks by Project</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {stats.tasksByProject.map(p => (
              <div key={p._id}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.25rem' }}>
                  <span style={{ fontSize: '0.9rem' }}>{p.projectTitle}</span>
                  <span style={{ fontSize: '0.9rem', fontWeight: 'bold' }}>{p.count}</span>
                </div>
                <div style={{ width: '100%', height: '8px', background: '#e5e7eb', borderRadius: '4px', overflow: 'hidden' }}>
                  <div style={{ 
                    width: `${(p.count / s.total) * 100}%`, 
                    height: '100%', 
                    background: p.projectColor || 'var(--color-primary)' 
                  }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
