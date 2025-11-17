import React, { useState, useEffect } from 'react'; // 1. Import useEffect
import { Link, useNavigate } from 'react-router-dom'; // 2. Import useNavigate
import './SignUp.css';
import { IonIcon } from '@ionic/react';
import {
  chevronDownOutline,
  chevronUpOutline,
  arrowForwardOutline,
  checkmarkSharp,
} from 'ionicons/icons';
import { supabase } from '../supabaseClient'; // 3. Import Supabase
import { useAuth } from '../context/AuthContext'; // 4. Import useAuth

// --- Icon Components (Google/LinkedIn) ---
const GoogleIcon = () => (
  <svg viewBox="0 0 24 24" width="20" height="20" fill="none" xmlns="http://www.w3.org/2000/svg">
    {/* ... (svg paths) ... */}
    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-.97 2.53-1.94 3.3v2.76h3.57c2.08-1.92 3.28-4.74 3.28-8.07z" fill="#4285F4"/>
    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.76c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"/>
    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
  </svg>
);

const LinkedInIcon = () => (
  <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
    {/* ... (svg paths) ... */}
    <path d="M19.02 0H4.98C2.23 0 0 2.23 0 4.98v14.04C0 21.77 2.23 24 4.98 24h14.04C21.77 24 24 21.77 24 19.02V4.98C24 2.23 21.77 0 19.02 0zM8.03 19.24H5.03V8.77h3.00v10.47zM6.53 7.56c-.97 0-1.75-.78-1.75-1.75S5.56 4.06 6.53 4.06c.97 0 1.75.78 1.75 1.75s-.78 1.75-1.75 1.75zM19.24 19.24h-3.00v-5.17c0-1.23-.02-2.81-1.71-2.81-1.71 0-1.98 1.34-1.98 2.72v5.26h-3.00V8.77h2.88v1.31h.04c.4-.76 1.37-1.55 2.84-1.55 3.04 0 3.60 2.00 3.60 4.60v5.11z"/>
  </svg>
);
// --- End Icon Components ---

function SignUp() {
  const [showIncluded, setShowIncluded] = useState(false);
  
  // --- 5. Add Auth State ---
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const { user } = useAuth();

  // --- 6. Add Redirect Effect ---
  useEffect(() => {
    if (user) {
      navigate('/dashboard');
    }
  }, [user, navigate]);

  // --- 7. Add Sign-Up Handler ---
  const handleSignUp = async (e) => {
    e.preventDefault();
    setError('');

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);

    try {
      // Create the user account
      const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
        email: email,
        password: password,
      });

      if (signUpError) throw signUpError;

      // Sign the user in immediately
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: email,
        password: password,
      });

      if (signInError) throw signInError;

      // Success! Navigate to the dashboard.
      navigate('/dashboard');

    } catch (error) {
      setError(error.message || 'An unknown error occurred.');
    } finally {
      setLoading(false);
    }
  };


  const includedItems = [
    // ... (your includedItems array is unchanged) ...
    {
      heading: 'Personal Skill Tracking',
      description: 'Monitor your growth and visualize your skill development journey.',
    },
    {
      heading: 'Team Gap Analysis',
      description: "Get a clear overview of skill gaps affecting your team's performance.",
    },
    {
      heading: 'Tailored Learning',
      description: 'Receive personalized recommendations for courses to fill your specific gaps.',
    },
    {
      heading: 'Collaborative Goals',
      description: 'Set and track skill-building objectives alongside your peers and managers.',
    },
    {
      heading: 'Performance Insights',
      description: 'Understand your strengths and weaknesses with AI-driven performance analytics.',
    },
  ];

  return (
    <div className="signup-page-container">
      {/* --- Left Half (Unchanged) --- */}
      <div className="signup-left-half">
        <div className="left-content">
          <h1 className="left-heading">Create your free account</h1>
          <p className="left-subheading">
            Explore SkillSync's features and see what's included.
          </p>
          <div className="dropdown-container">
            <button
              className="dropdown-toggle"
              onClick={() => setShowIncluded(!showIncluded)}
            >
              See what's included
              <IonIcon
                icon={showIncluded ? chevronUpOutline : chevronDownOutline}
                className="dropdown-arrow-icon"
              />
            </button>
            <ul className={`dropdown-list ${showIncluded ? 'show' : ''}`}>
              {includedItems.map((item, index) => (
                <li key={index}>
                  <IonIcon
                    icon={checkmarkSharp}
                    className="dropdown-list-icon"
                  />
                  <div className="list-item-content">
                    <strong className="list-item-heading">{item.heading}</strong>
                    <span className="list-item-description">{item.description}</span>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* --- Right Half (MODIFIED) --- */}
      <div className="signup-right-half">
        <div className="signin-prompt top-right">
          <p>
            Already have an account?{' '}
            <Link to="/signin">
              Sign In{' '}
              <IonIcon
                icon={arrowForwardOutline}
                className="signin-arrow-icon"
              />
            </Link>
          </p>
        </div>

        <div className="right-content-wrapper">
          <h2 className="right-heading">Create Account</h2>

          <div className="social-logins">
            {/* ... (social buttons unchanged) ... */}
            <button className="social-button google">
              <GoogleIcon />
              Continue with Google
            </button>
            <button className="social-button linkedin">
              <LinkedInIcon />
              Continue with LinkedIn
            </button>
          </div>

          <div className="separator">
            {/* ... (separator unchanged) ... */}
            <span className="separator-line"></span>
            <span className="separator-text">OR</span>
            <span className="separator-line"></span>
          </div>

          {/* --- 8. Hook up the form --- */}
          <form className="signup-form" onSubmit={handleSignUp}>
            
            {/* Display Auth Error */}
            {error && <p className="auth-error">{error}</p>}
            
            {/* Removed Username input */}
            <div className="input-group">
              <label htmlFor="email">Email</label>
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
              <label htmlFor="password">Password</label>
              <input
                type="password"
                id="password"
                name="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            <div className="input-group">
              <label htmlFor="confirmPassword">Confirm Password</label>
              <input
                type="password"
                id="confirmPassword"
                name="confirmPassword"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
              />
            </div>

            {/* 9. Update the button for loading state */}
            <button
              type="submit"
              className="create-account-button"
              disabled={loading}
            >
              {loading ? 'Creating Account...' : 'Create account'}
              <IonIcon
                icon={arrowForwardOutline}
                className="button-arrow-icon"
              />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default SignUp;