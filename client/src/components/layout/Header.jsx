import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { Link, useNavigate } from 'react-router-dom';

const Header = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <header className="header">
      <div className="header-logo">
        <Link to="/dashboard" style={{ textDecoration: 'none', color: 'var(--color-primary)', fontWeight: 'bold', fontSize: '1.25rem' }}>
          TaskFlow
        </Link>
      </div>
      <div className="header-actions">
        {user ? (
          <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
            <span>Welcome, <strong>{user.name}</strong> ({user.role})</span>
            <button className="btn" onClick={handleLogout} style={{ padding: '0.4rem 0.8rem', background: 'var(--color-danger)' }}>
              Logout
            </button>
          </div>
        ) : (
          <div style={{ display: 'flex', gap: '1rem' }}>
            <Link to="/login" className="btn" style={{ background: 'transparent', color: 'var(--color-primary)', border: '1px solid var(--color-primary)' }}>Login</Link>
            <Link to="/signup" className="btn">Sign Up</Link>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;
