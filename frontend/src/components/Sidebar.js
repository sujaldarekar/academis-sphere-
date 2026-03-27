import React from 'react';
import { useAuth } from '../hooks/useAuth';
import { Link, useNavigate } from 'react-router-dom';
import { useIsMobile } from '../hooks/useIsMobile';

const Sidebar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const isMobile = useIsMobile();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const menuItems = {
    student: [
      { name: 'Dashboard', path: '/dashboard' },
      { name: 'Profile', path: '/profile' },
      { name: 'Documents', path: '/documents' },
      { name: 'Resume', path: '/resume' },
      { name: 'Notifications', path: '/notifications' },
    ],
    teacher: [
      { name: 'Dashboard', path: '/dashboard' },
      { name: 'My Students', path: '/students' },
      { name: 'Pending Approvals', path: '/approvals' },
      { name: 'Notifications', path: '/notifications' },
      { name: 'Profile', path: '/profile' },
    ],
    hod: [
      { name: 'Dashboard', path: '/dashboard' },
      { name: 'Students', path: '/students' },
      { name: 'Teachers', path: '/teachers' },
      { name: 'Notifications', path: '/notifications' },
    ],
  };

  const items = menuItems[user?.role] || [];

  return (
    <div style={isMobile ? styles.mobileShell : styles.sidebar}>
      <nav style={isMobile ? styles.mobileNav : styles.nav}>
        {items.map((item) => (
          <Link
            key={item.path}
            to={item.path}
            style={isMobile ? styles.mobileNavItem : styles.navItem}
          >
            <span style={styles.iconWrapper}>
              {item.name.charAt(0).toUpperCase()}
            </span>
            <span style={styles.navItemText}>
              {item.name}
            </span>
          </Link>
        ))}
      </nav>

      <div style={isMobile ? styles.mobileFooter : styles.footer}>
        {!isMobile && <p style={styles.userInfo}>Signed in</p>}
        <button onClick={handleLogout} style={styles.logoutBtn}>
          Logout
        </button>
      </div>
    </div>
  );
};

const styles = {
  sidebar: {
    width: '250px',
    backgroundColor: 'var(--primary-soft)',
    borderRight: '1px solid var(--border)',
    display: 'flex',
    flexDirection: 'column',
    height: '100vh',
    padding: '20px',
    boxShadow: '6px 0 18px rgba(0, 92, 187, 0.08)',
    transition: 'all 0.3s ease',
    overflow: 'hidden',
  },
  nav: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    gap: '10px',
  },
  navItem: {
    padding: '10px 15px',
    color: 'var(--text)',
    textDecoration: 'none',
    borderRadius: '8px',
    fontSize: '14px',
    cursor: 'pointer',
    transition: 'background-color 0.2s',
    display: 'flex',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.6)',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    minHeight: '42px',
  },
  navItemText: {
    marginLeft: '12px',
  },
  iconWrapper: {
    width: '28px',
    height: '28px',
    borderRadius: '6px',
    backgroundColor: 'var(--primary)',
    color: 'white',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '14px',
    fontWeight: '600',
    flexShrink: 0,
  },
  footer: {
    borderTop: '1px solid var(--border)',
    paddingTop: '15px',
  },
  userInfo: {
    fontSize: '13px',
    marginBottom: '10px',
    color: 'var(--muted)',
  },
  logoutBtn: {
    width: '100%',
    padding: '8px',
    backgroundColor: '#ff8a8a',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    fontSize: '13px',
  },
  mobileShell: {
    width: '100%',
    backgroundColor: 'var(--primary-soft)',
    borderBottom: '1px solid var(--border)',
    display: 'flex',
    flexDirection: 'column',
    gap: '10px',
    padding: '12px',
    position: 'sticky',
    top: 0,
    zIndex: 20,
  },
  mobileNav: {
    display: 'flex',
    gap: '8px',
    overflowX: 'auto',
    paddingBottom: '4px',
  },
  mobileNavItem: {
    padding: '8px 12px',
    color: 'var(--text)',
    textDecoration: 'none',
    borderRadius: '8px',
    fontSize: '13px',
    cursor: 'pointer',
    transition: 'background-color 0.2s',
    display: 'flex',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.75)',
    whiteSpace: 'nowrap',
    minHeight: '38px',
  },
  mobileFooter: {
    display: 'flex',
    justifyContent: 'flex-end',
  },
};

export default Sidebar;
