import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import './Sidebar.css';
import { IonIcon } from '@ionic/react';
import { 
  gridOutline, 
  listOutline, 
  timeOutline, 
  logOutOutline,
  menuOutline
} from 'ionicons/icons';
import ThemeToggle from './ThemeToggle/ThemeToggle';
import { supabase } from '../supabaseClient';

function Sidebar({ isCollapsed, toggleSidebar }) {
  const navigate = useNavigate();
  const location = useLocation();
  
  const [isDarkMode, setIsDarkMode] = useState(document.body.classList.contains('theme-dark'));

  useEffect(() => {
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.attributeName === 'class') {
          setIsDarkMode(document.body.classList.contains('theme-dark'));
        }
      });
    });

    observer.observe(document.body, { attributes: true });
    return () => observer.disconnect();
  }, []);

  // --- LOGOUT HANDLER ---
  const handleSignOut = async () => {
    // 1. Sign out from Supabase
    await supabase.auth.signOut();
    
    // 2. Redirect directly to the Home Page ('/')
    navigate('/');
  };

  const isActive = (path) => location.pathname === path ? 'active' : '';

  return (
    <aside className={`sidebar ${isCollapsed ? 'collapsed' : 'expanded'}`}>
      
      <div className="sidebar-top">
        <button onClick={toggleSidebar} className="icon-btn menu-btn">
          <IonIcon icon={menuOutline} />
        </button>
      </div>

      <div className="sidebar-nav-scroll">
        <nav className="sidebar-nav">
          <Link to="/dashboard" className={`nav-item ${isActive('/dashboard')}`}>
            <IonIcon icon={gridOutline} />
            <span className="link-text">Dashboard</span>
          </Link>

          <Link to="/manage-skills" className={`nav-item ${isActive('/manage-skills')}`}>
            <IonIcon icon={listOutline} />
            <span className="link-text">My Skills</span>
          </Link>

          <Link to="/test-history" className={`nav-item ${isActive('/test-history')}`}>
            <IonIcon icon={timeOutline} />
            <span className="link-text">Activity</span>
          </Link>
        </nav>
      </div>

      <div className="sidebar-footer">
        
        <div 
          className="nav-item" 
          style={{ 
            cursor: 'pointer', 
            justifyContent: isCollapsed ? 'center' : 'flex-start' 
          }}
        >
            <div style={{ 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center', 
                minWidth: '20px', 
                marginLeft: isCollapsed ? '0' : '-8px', 
                transform: 'scale(0.75)',
            }}>
                <ThemeToggle />
            </div>

            <span className="link-text" style={{ marginLeft: '12px' }}>
               {isDarkMode ? 'Light Mode' : 'Dark Mode'}
            </span>
        </div>

        {/* Clicking this now immediately logs out and goes Home */}
        <div onClick={handleSignOut} className="nav-item pointer-cursor">
            <IonIcon icon={logOutOutline} />
            <span className="link-text">Log out</span>
        </div>
      </div>
    </aside>
  );
}

export default Sidebar;