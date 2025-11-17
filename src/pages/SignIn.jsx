import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './SignIn.css';
import logoImage from '../assets/logo.png'; // Make sure this path is correct
import { supabase } from '../supabaseClient'; // Import Supabase
import { useAuth } from '../context/AuthContext'; // Import the auth hook


// --- Dummy Icon Components (from your original file) ---
// (We'll replace these with real icons later)
const GoogleIcon = () => (
  <svg viewBox="0 0 24 24" width="20" height="20" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-.97 2.53-1.94 3.3v2.76h3.57c2.08-1.92 3.28-4.74 3.28-8.07z" fill="#4285F4"/>
    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.76c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"/>
    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
  </svg>
);

const LinkedInIcon = () => (
  <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
    <path d="M19.02 0H4.98C2.23 0 0 2.23 0 4.98v14.04C0 21.77 2.23 24 4.98 24h14.04C21.77 24 24 21.77 24 19.02V4.98C24 2.23 21.77 0 19.02 0zM8.03 19.24H5.03V8.77h3.00v10.47zM6.53 7.56c-.97 0-1.75-.78-1.75-1.75S5.56 4.06 6.53 4.06c.97 0 1.75.78 1.75 1.75s-.78 1.75-1.75 1.75zM19.24 19.24h-3.00v-5.17c0-1.23-.02-2.81-1.71-2.81-1.71 0-1.98 1.34-1.98 2.72v5.26h-3.00V8.77h2.88v1.31h.04c.4-.76 1.37-1.55 2.84-1.55 3.04 0 3.60 2.00 3.60 4.60v5.11z"/>
  </svg>
);
// --- End of Icon Components ---

function SignIn() {
  // --- 1. Add state for inputs, loading, and errors ---
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const { user } = useAuth(); // Get user from our auth context

  // --- 2. Redirect if already logged in ---
  useEffect(() => {
    if (user) {
      navigate('/dashboard');
    }
  }, [user, navigate]);

  // --- 3. Handle the login logic ---
  const handleLogin = async (e) => {
    e.preventDefault(); // Stop the form from refreshing the page
    setLoading(true);
    setError('');

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email: email,
        password: password,
      });

      if (error) throw error;

      // Login is successful. The AuthContext will pick up
      // the new session, and the useEffect above will
      // trigger the redirect to /dashboard.
      // We can also navigate manually just in case.
      navigate('/dashboard');

    } catch (error) {
      setError(error.message || 'An unknown error occurred.');
    } finally {
      setLoading(false); // Stop loading spinner
    }
  };

  return (
    <div className="signin-container">
      <div className="signin-content">
        {/* Logo (your image was a bit big, reduced to 80) */}
        <Link to="/" className="signin-logo">
          <img src={logoImage} alt="SkillSync Logo" height="80" />
        </Link>

        <h1 className="signin-heading">Sign in to SkillSync</h1>

        {/* --- 4. Show error message if one exists --- */}
        {error && <p className="auth-error">{error}</p>}

        {/* --- 5. Hook up the form and inputs --- */}
        <form className="signin-form" onSubmit={handleLogin}>
          <div className="input-group">
            <label htmlFor="email">Email</label> {/* Removed "or Username" for clarity */}
            <input
              type="email"
              id="email"
              name="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div className="input-group">
            <div className="password-label-group">
              <label htmlFor="password">Password</label>
              <a href="#" className="forgot-password">Forgot password?</a>
            </div>
            <input
              type="password"
              id="password"
              name="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          {/* --- 6. Update button to show loading state --- */}
          <button type="submit" className="signin-button-primary" disabled={loading}>
            {loading ? 'Signing In...' : 'Sign In'}
          </button>
        </form>

        {/* --- All the sections below are unchanged --- */}
        <div className="separator">
          <span className="separator-line"></span>
          <span className="separator-text">OR</span>
          <span className="separator-line"></span>
        </div>

        <div className="social-logins">
          <button className="social-button google">
            <GoogleIcon />
            Continue with Google
          </button>
          <button className="social-button linkedin">
            <LinkedInIcon />
            Continue with LinkedIn
          </button>
        </div>

        <div className="signup-link">
          <p>New to SkillSync? <Link to="/signup">Create an account</Link></p>
        </div>
      </div>
    </div>
  );
}

export default SignIn;