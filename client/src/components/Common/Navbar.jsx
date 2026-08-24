import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Building2, ClipboardList, Bell, LayoutDashboard, LogOut } from 'lucide-react';

const Navbar = () => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  if (!user) return null;

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <header className="navbar">
      <div className="navbar-inner">
        <Link to="/" className="brand-logo">
          <div className="brand-icon">
            <Building2 size={20} />
          </div>
          <span>SocietyOps</span>
        </Link>

        <nav className="nav-links">
          {user.role === 'admin' ? (
            <Link
              to="/admin"
              className={`nav-link ${location.pathname === '/admin' ? 'active' : ''}`}
            >
              <LayoutDashboard size={18} />
              <span>Dashboard</span>
            </Link>
          ) : (
            <Link
              to="/complaints"
              className={`nav-link ${location.pathname === '/complaints' ? 'active' : ''}`}
            >
              <ClipboardList size={18} />
              <span>My Complaints</span>
            </Link>
          )}

          <Link
            to="/notices"
            className={`nav-link ${location.pathname === '/notices' ? 'active' : ''}`}
          >
            <Bell size={18} />
            <span>Notice Board</span>
          </Link>
        </nav>

        <div className="user-profile-badge">
          <div className="user-avatar">
            {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
          </div>
          <div className="user-details">
            <span className="user-name">{user.name}</span>
            <span className="user-role-tag">
              {user.role === 'resident' ? `Flat ${user.flatNumber || ''}` : 'Admin'}
            </span>
          </div>
          <button onClick={handleLogout} className="btn-logout" title="Sign Out">
            <LogOut size={18} />
          </button>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
