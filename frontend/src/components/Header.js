import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Header = () => {
  const { user, login, demoLogin, logout } = useAuth();

  return (
    <header className="header">
      <div className="container">
        <div className="header-content">
          <Link to="/" className="logo">
            Sydney Events
          </Link>
          <nav className="nav-links">
            <Link to="/" className="nav-link">Events</Link>
            {user ? (
              <>
                <Link to="/dashboard" className="nav-link">Dashboard</Link>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                  <span>Hi, {user.name}</span>
                  <button onClick={logout} className="btn btn-secondary">
                    Logout
                  </button>
                </div>
              </>
            ) : (
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <button onClick={login} className="btn btn-primary">
                  Login with Google
                </button>
                <button onClick={demoLogin} className="btn btn-secondary">
                  Demo Login
                </button>
              </div>
            )}
          </nav>
        </div>
      </div>
    </header>
  );
};

export default Header;