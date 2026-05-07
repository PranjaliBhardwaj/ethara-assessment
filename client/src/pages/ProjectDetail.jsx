import React, { useEffect, useState, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ProjectDetail = () => {
  const { id } = useParams();
  const { api, user: currentUser } = useAuth();
  const [project, setProject] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [newTask, setNewTask] = useState({ title: '', description: '', status: 'todo', priority: 'medium', assignedTo: '' });
  const [allUsers, setAllUsers] = useState([]);

  const fetchData = useCallback(async () => {
    try {
      const [projRes, tasksRes, usersRes] = await Promise.all([
        api.get(`/projects/${id}`),
        api.get(`/projects/${id}/tasks`),
        api.get('/auth/users')
      ]);
      setProject(projRes.data.data);
      setTasks(tasksRes.data.data);
      setAllUsers(usersRes.data.data);
    } catch (err) {
      console.error('Failed to fetch project data');
    } finally {
      setLoading(false);
    }
  }, [api, id]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleUpdateStatus = async (taskId, newStatus) => {
    try {
      await api.patch(`/tasks/${taskId}/status`, { status: newStatus });
      fetchData();
    } catch (err) {
      alert('Failed to update task status');
    }
  };

  const handleCreateTask = async (e) => {
    e.preventDefault();
    try {
      await api.post(`/projects/${id}/tasks`, newTask);
      fetchData();
      setShowTaskModal(false);
      setNewTask({ title: '', description: '', status: 'todo', priority: 'medium', assignedTo: '' });
    } catch (err) {
      alert('Failed to create task');
    }
  };

  if (loading) return <div className="container">Loading project...</div>;
  if (!project) return <div className="container">Project not found</div>;

  const columns = ['todo', 'in-progress', 'done'];

  return (
    <div className="container">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <div>
          <h1 style={{ borderLeft: `8px solid ${project.color}`, paddingLeft: '1rem' }}>{project.title}</h1>
          <p style={{ color: 'var(--color-muted)', marginTop: '0.5rem' }}>{project.description}</p>
        </div>
        {currentUser.role === 'admin' && (
          <button className="btn" onClick={() => setShowTaskModal(true)}>+ Add Task</button>
        )}
      </div>

      <div style={{ display: 'flex', gap: '1.5rem', overflowX: 'auto', paddingBottom: '1rem' }}>
        {columns.map(col => (
          <div key={col} className="card" style={{ flex: '1', minWidth: '300px', background: '#f9fafb' }}>
            <h3 style={{ textTransform: 'capitalize', marginBottom: '1rem', borderBottom: '2px solid #e5e7eb', paddingBottom: '0.5rem', display: 'flex', justifyContent: 'space-between' }}>
              {col.replace('-', ' ')}
              <span className="badge">{tasks.filter(t => t.status === col).length}</span>
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {tasks.filter(t => t.status === col).map(task => (
                <div key={task._id} className="card" style={{ background: '#fff', borderLeft: `4px solid ${task.priority === 'high' ? 'var(--color-danger)' : task.priority === 'medium' ? '#fbbf24' : 'var(--color-success)'}` }}>
                  <h4 style={{ fontSize: '1rem', marginBottom: '0.5rem' }}>{task.title}</h4>
                  <p style={{ fontSize: '0.85rem', color: 'var(--color-muted)', marginBottom: '1rem' }}>{task.description}</p>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <div style={{ width: '24px', height: '24px', borderRadius: '50%', background: 'var(--color-primary)', color: '#fff', fontSize: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        {task.assignedTo?.name.charAt(0)}
                      </div>
                      <span style={{ fontSize: '0.8rem' }}>{task.assignedTo?.name}</span>
                    </div>
                    <select 
                      value={task.status} 
                      onChange={(e) => handleUpdateStatus(task._id, e.target.value)}
                      style={{ fontSize: '0.75rem', padding: '2px', borderRadius: '4px' }}
                    >
                      {columns.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {showTaskModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000 }}>
          <div className="card" style={{ width: '450px', padding: '2rem' }}>
            <h2>Add New Task</h2>
            <form onSubmit={handleCreateTask} style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginTop: '1rem' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '0.25rem' }}>Title</label>
                <input type="text" className="input" value={newTask.title} onChange={e => setNewTask({...newTask, title: e.target.value})} required />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '0.25rem' }}>Description</label>
                <textarea className="input" value={newTask.description} onChange={e => setNewTask({...newTask, description: e.target.value})} />
              </div>
              <div style={{ display: 'flex', gap: '1rem' }}>
                <div style={{ flex: 1 }}>
                  <label style={{ display: 'block', marginBottom: '0.25rem' }}>Priority</label>
                  <select className="input" value={newTask.priority} onChange={e => setNewTask({...newTask, priority: e.target.value})}>
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                  </select>
                </div>
                <div style={{ flex: 1 }}>
                  <label style={{ display: 'block', marginBottom: '0.25rem' }}>Assign To</label>
                  <select className="input" value={newTask.assignedTo} onChange={e => setNewTask({...newTask, assignedTo: e.target.value})} required>
                    <option value="">Select Member</option>
                    {allUsers.map(u => <option key={u._id} value={u._id}>{u.name}</option>)}
                  </select>
                </div>
              </div>
              <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
                <button type="submit" className="btn" style={{ flex: 1 }}>Create Task</button>
                <button type="button" className="btn" style={{ flex: 1, background: 'var(--color-muted)' }} onClick={() => setShowTaskModal(false)}>Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProjectDetail;
