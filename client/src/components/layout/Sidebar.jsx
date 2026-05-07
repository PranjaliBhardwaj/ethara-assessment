import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const Sidebar = () => {
  const { user } = useAuth();

  if (!user) return null;

  return (
    <aside className="sidebar">
      <nav style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', padding: '1rem' }}>
        <NavLink 
          to="/dashboard" 
          className={({ isActive }) => isActive ? 'btn' : 'btn'} 
          style={({ isActive }) => ({
            background: isActive ? 'var(--color-primary)' : 'transparent',
            color: isActive ? '#fff' : 'var(--color-muted)',
            textAlign: 'left',
            padding: '0.75rem 1rem'
          })}
        >
          Dashboard
        </NavLink>
        <NavLink 
          to="/projects" 
          style={({ isActive }) => ({
            background: isActive ? 'var(--color-primary)' : 'transparent',
            color: isActive ? '#fff' : 'var(--color-muted)',
            textAlign: 'left',
            padding: '0.75rem 1rem',
            borderRadius: 'var(--radius)',
            textDecoration: 'none',
            fontWeight: '500'
          })}
        >
          Projects
        </NavLink>
        <NavLink 
          to="/my-tasks" 
          style={({ isActive }) => ({
            background: isActive ? 'var(--color-primary)' : 'transparent',
            color: isActive ? '#fff' : 'var(--color-muted)',
            textAlign: 'left',
            padding: '0.75rem 1rem',
            borderRadius: 'var(--radius)',
            textDecoration: 'none',
            fontWeight: '500'
          })}
        >
          My Tasks
        </NavLink>
      </nav>
    </aside>
  );
};

export default Sidebar;
