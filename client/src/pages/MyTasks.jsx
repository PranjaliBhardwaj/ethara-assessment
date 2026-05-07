import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';

const MyTasks = () => {
  const { api } = useAuth();
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMyTasks = async () => {
      try {
        const response = await api.get('/tasks/my-tasks');
        setTasks(response.data.data);
      } catch (err) {
        console.error('Failed to fetch your tasks');
      } finally {
        setLoading(false);
      }
    };
    fetchMyTasks();
  }, [api]);

  const handleUpdateStatus = async (taskId, newStatus) => {
    try {
      await api.patch(`/tasks/${taskId}/status`, { status: newStatus });
      const response = await api.get('/tasks/my-tasks');
      setTasks(response.data.data);
    } catch (err) {
      alert('Failed to update task status');
    }
  };

  if (loading) return <div className="container">Loading your tasks...</div>;

  return (
    <div className="container">
      <h1 style={{ marginBottom: '2rem' }}>My Assigned Tasks</h1>
      
      {tasks.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: '3rem' }}>
          <p>No tasks assigned to you yet.</p>
        </div>
      ) : (
        <div className="grid">
          {tasks.map(task => (
            <div key={task._id} className="card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ borderLeft: `4px solid ${task.projectId?.color || 'var(--color-primary)'}`, paddingLeft: '1rem' }}>
                <h3 style={{ fontSize: '1.1rem', marginBottom: '0.25rem' }}>{task.title}</h3>
                <p style={{ fontSize: '0.85rem', color: 'var(--color-muted)' }}>Project: {task.projectId?.title}</p>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <span className={`badge ${task.status === 'done' ? 'success' : ''}`} style={{ textTransform: 'capitalize' }}>
                  {task.status}
                </span>
                <select 
                  value={task.status} 
                  onChange={(e) => handleUpdateStatus(task._id, e.target.value)}
                  style={{ padding: '0.5rem', borderRadius: 'var(--radius)', border: '1px solid #d1d5db' }}
                >
                  <option value="todo">Todo</option>
                  <option value="in-progress">In Progress</option>
                  <option value="done">Done</option>
                </select>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MyTasks;
