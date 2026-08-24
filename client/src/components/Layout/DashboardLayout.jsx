import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import './DashboardLayout.css';

const DashboardLayout = ({ children, title = "Resident Portal" }) => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [isDarkMode, setIsDarkMode] = useState(() => localStorage.getItem('theme') === 'dark');

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.setAttribute('data-theme', 'dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.removeAttribute('data-theme');
      localStorage.setItem('theme', 'light');
    }
  }, [isDarkMode]);

  if (!user) return null;

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="dashboard-layout">
      <aside className="sidebar">
        <div className="sidebar-header">
          <img alt="Society OS Logo" src="https://lh3.googleusercontent.com/aida-public/AB6AXuA05kiaQCCCn1bOChfkPsr1aS8ENBRad2msO7Vccf6uhGog35Kfm2C6M7V45dse8Eb2lUV1a_8USxZ7cgJgWKadjlhqbfcen-aGz0u7K9mLxJK8Z6TUqcER1D2TODrZ43jkRzrC5Z0IfLVKpkH5ttnXPr8DzYxIo-HJCbox2lzDZOvLwjEvDoMpRf34BPh6Gzy0TQ2sek7o_cFfO16Bg2oM0zMYs3ScG66u-C6uydpl5nEy6mbJKpluJQ" />
          <span>SOCIETY OS</span>
        </div>
        
        <nav className="sidebar-nav">
          <Link to="/dashboard" className={`nav-item ${location.pathname === '/dashboard' ? 'active' : ''}`}>
            <span className="material-symbols-outlined">home</span>
            <span>HOME</span>
          </Link>
          
          <Link to="/directory" className={`nav-item ${location.pathname === '/directory' ? 'active' : ''}`}>
            <span className="material-symbols-outlined">group</span>
            <span>DIRECTORY</span>
          </Link>
          
          {user.role === 'admin' ? (
            <>
              <Link to="/admin" className={`nav-item ${location.pathname === '/admin' ? 'active' : ''}`}>
                <span className="material-symbols-outlined">analytics</span>
                <span>OPERATIONS</span>
              </Link>
              <Link to="/notices" className={`nav-item ${location.pathname === '/notices' ? 'active' : ''}`}>
                <span className="material-symbols-outlined">campaign</span>
                <span>NOTICE BOARD</span>
              </Link>
            </>
          ) : (
            <>
              <Link to="/complaints" className={`nav-item ${location.pathname === '/complaints' ? 'active' : ''}`}>
                <span className="material-symbols-outlined">report_problem</span>
                <span>MY COMPLAINTS</span>
              </Link>
              <Link to="/notices" className={`nav-item ${location.pathname === '/notices' ? 'active' : ''}`}>
                <span className="material-symbols-outlined">campaign</span>
                <span>NOTICE BOARD</span>
              </Link>
            </>
          )}

          <div style={{ marginTop: 'auto' }}>
            <button onClick={handleLogout} className="nav-item" style={{ width: '100%', background: 'none', border: 'none', cursor: 'pointer', textAlign: 'left' }}>
              <span className="material-symbols-outlined">logout</span>
              <span>SIGN OUT</span>
            </button>
          </div>
        </nav>
      </aside>

      <div className="main-wrapper">
        <header className="top-header">
          <div className="header-left">
            <span className="header-title">{title}</span>
            <div className="header-divider"></div>
            <div className="search-input-wrapper">
              <span className="material-symbols-outlined">search</span>
              <input type="text" className="header-search" placeholder="Search records..." />
            </div>
          </div>
          
          <div className="header-right">
            <button className="icon-button" onClick={() => setIsDarkMode(!isDarkMode)} title="Toggle Dark Mode">
              <span className="material-symbols-outlined">{isDarkMode ? 'light_mode' : 'dark_mode'}</span>
            </button>
            <button className="icon-button">
              <span className="material-symbols-outlined">notifications</span>
            </button>
            <div className="user-profile">
              <div className="user-info">
                <p className="user-name">{user.name}</p>
                <p className="user-unit">{user.role === 'resident' ? `Flat ${user.flatNumber || ''}` : 'Administrator'}</p>
              </div>
              <div className="user-avatar">
                {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
              </div>
            </div>
          </div>
        </header>

        <main className="main-content">
          {children}
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
