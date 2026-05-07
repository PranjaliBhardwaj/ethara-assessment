import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Projects = () => {
  const { api, user } = useAuth();
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({ title: '', description: '', color: '#6366f1' });

  useEffect(() => {
    fetchProjects();
  }, [api]);

  const fetchProjects = async () => {
    try {
      const response = await api.get('/projects');
      setProjects(response.data.data);
    } catch (err) {
      console.error('Failed to fetch projects');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateProject = async (e) => {
    e.preventDefault();
    try {
      await api.post('/projects', formData);
      fetchProjects();
      setShowModal(false);
      setFormData({ title: '', description: '', color: '#6366f1' });
    } catch (err) {
      alert('Failed to create project');
    }
  };

  if (loading) return <div className="container">Loading projects...</div>;

  return (
    <div className="container">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <h1>Projects</h1>
        {user.role === 'admin' && (
          <button className="btn" onClick={() => setShowModal(true)}>+ New Project</button>
        )}
      </div>

      <div className="grid grid-2">
        {projects.map(project => (
          <Link key={project._id} to={`/projects/${project._id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
            <div className="card" style={{ borderTop: `6px solid ${project.color}` }}>
              <h2 style={{ marginBottom: '0.5rem', fontSize: '1.2rem' }}>{project.title}</h2>
              <p style={{ fontSize: '0.9rem', color: 'var(--color-muted)', marginBottom: '1rem', minHeight: '3em' }}>
                {project.description || 'No description provided.'}
              </p>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', gap: '0.25rem' }}>
                  {project.members.slice(0, 3).map(m => (
                    <div key={m._id} style={{ 
                      width: '24px', height: '24px', borderRadius: '50%', background: 'var(--color-primary)', 
                      color: '#fff', fontSize: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center',
                      border: '2px solid #fff'
                    }}>
                      {m.name.charAt(0)}
                    </div>
                  ))}
                  {project.members.length > 3 && <span style={{ fontSize: '10px' }}>+{project.members.length - 3}</span>}
                </div>
                <span className="badge" style={{ background: '#f3f4f6', color: 'var(--color-muted)' }}>
                  {project.taskCounts.total} Tasks
                </span>
              </div>
            </div>
          </Link>
        ))}
      </div>

      {showModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000 }}>
          <div className="card" style={{ width: '400px', padding: '2rem' }}>
            <h2>New Project</h2>
            <form onSubmit={handleCreateProject} style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginTop: '1rem' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '0.25rem' }}>Title</label>
                <input type="text" className="input" value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} required />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '0.25rem' }}>Description</label>
                <textarea className="input" style={{ height: '80px' }} value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '0.25rem' }}>Accent Color</label>
                <input type="color" className="input" style={{ height: '40px', padding: '2px' }} value={formData.color} onChange={e => setFormData({...formData, color: e.target.value})} />
              </div>
              <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
                <button type="submit" className="btn" style={{ flex: 1 }}>Create</button>
                <button type="button" className="btn" style={{ flex: 1, background: 'var(--color-muted)' }} onClick={() => setShowModal(false)}>Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Projects;
