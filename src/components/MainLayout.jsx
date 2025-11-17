import React from 'react';
import { Link, Outlet, useNavigate } from 'react-router-dom'; // 1. Import useNavigate
import logoImage from '../assets/logo.png';
import './MainLayout.css';
import { useAuth } from '../context/AuthContext'; // 2. Import the useAuth hook
import { supabase } from '../supabaseClient'; // 3. Import supabase
import ThemeToggle from './ThemeToggle/ThemeToggle'; // 1. Import ThemeToggle

function MainLayout() {
  // 4. Get the user from our auth context
  const { user } = useAuth();
  const navigate = useNavigate();

  // 5. Create a sign-out handler
  const handleSignOut = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      // Redirect to home page after sign out
      navigate('/');
    } catch (error) {
      console.error('Error signing out:', error.message);
    }
  };

  return (
    <div className="app-container">
      <header className="navbar-container">
        <nav className="navbar">
          <div className="navbar-left">
            <Link to="/" className="navbar-logo">
              <img src={logoImage} alt="SkillSync Logo" height="40" />
            </Link>
            <div className="navbar-links">
              <Link to="/" className="navbar-link">Home</Link>
              <Link to="/about" className="navbar-link">About</Link>
              <Link to="/contact" className="navbar-link">Contact</Link>
              {/* 6. Show Dashboard link only if logged in */}
              {user && (
                <Link to="/dashboard" className="navbar-link">Dashboard</Link>
              )}
            </div>
          </div>
          <div className="navbar-right">
            {/* 2. Add the ThemeToggle component here */}
            <ThemeToggle />

            {/* --- Auth Buttons (unchanged) --- */}
            {user ? (
              <button onClick={handleSignOut} className="navbar-button secondary">
                Sign Out
              </button>
            ) : (
              <>
                <Link to="/signin" className="navbar-link">Sign In</Link>
                <Link to="/signup" className="navbar-button primary">
                  Sign Up
                </Link>
              </>
            )}
          </div>
        </nav>
      </header>
      <main className="main-content">
        <Outlet />
      </main>
    </div>
  );
}

export default MainLayout;