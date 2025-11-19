import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './SignUp.css';
import { IonIcon } from '@ionic/react';
import { 
  mailOutline, 
  lockClosedOutline, 
  personOutline, 
  atOutline,
  logoGoogle, 
  logoLinkedin 
} from 'ionicons/icons';
import { supabase } from '../supabaseClient';
import ThemeToggle from '../components/ThemeToggle/ThemeToggle';

function SignUp() {
  const navigate = useNavigate();
  
  // Form State
  const [fullName, setFullName] = useState('');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Auto-Generate Username from Full Name
  useEffect(() => {
    if (fullName) {
      // removes spaces, special chars, and adds a random number
      const cleanName = fullName.toLowerCase().replace(/\s+/g, '_').replace(/[^a-z0-9_]/g, '');
      const randomSuffix = Math.floor(Math.random() * 1000);
      setUsername(`${cleanName}_${randomSuffix}`);
    } else {
      setUsername('');
    }
  }, [fullName]);

  const handleSignUp = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // Create User Account with Metadata
      const { data, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
            username: username,
            // Auto-generate a nice avatar with their initials
            avatar_url: `https://ui-avatars.com/api/?name=${fullName}&background=random&color=fff`
          }
        }
      });

      if (signUpError) throw signUpError;

      alert('Registration Successful! Check your email for verification.');
      navigate('/signin');

    } catch (err) {
      console.error(err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="signup-page-container">
      <div className="page-theme-toggle">
        <ThemeToggle />
      </div>

      {/* --- Left Half: The Form --- */}
      <div className="signup-left-half">
        <div className="signup-content-box">
          <div className="signup-header">
            <h1>Create Account</h1>
            <p>Join SkillSync to assess and improve your skills.</p>
          </div>

          <form onSubmit={handleSignUp} className="signup-form">
            
            {/* Full Name */}
            <div className="input-group">
              <div className="input-icon"><IonIcon icon={personOutline} /></div>
              <input 
                type="text" 
                placeholder="Full Name" 
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                required 
              />
            </div>

            {/* Username */}
            <div className="input-group">
              <div className="input-icon"><IonIcon icon={atOutline} /></div>
              <input 
                type="text" 
                placeholder="Username" 
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required 
              />
            </div>

            {/* Email */}
            <div className="input-group">
              <div className="input-icon"><IonIcon icon={mailOutline} /></div>
              <input 
                type="email" 
                placeholder="Email Address" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required 
              />
            </div>

            {/* Password */}
            <div className="input-group">
              <div className="input-icon"><IonIcon icon={lockClosedOutline} /></div>
              <input 
                type="password" 
                placeholder="Password" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required 
              />
            </div>

            {error && <p className="error-message">{error}</p>}

            <button type="submit" className="signup-button" disabled={loading}>
              {loading ? 'Creating Account...' : 'Sign Up'}
            </button>
          </form>

          <div className="divider"><span>or continue with</span></div>

          <div className="social-buttons">
            <button className="social-btn google"><IonIcon icon={logoGoogle} /> Google</button>
            <button className="social-btn linkedin"><IonIcon icon={logoLinkedin} /> LinkedIn</button>
          </div>

          <p className="signin-link">
            Already have an account? <Link to="/signin">Sign In</Link>
          </p>
        </div>
      </div>

      {/* --- Right Half: Branding --- */}
      <div className="signup-right-half">
        <div className="overlay-content">
          <h2>Master Your Skills.</h2>
          <p>Join a community of learners and professionals tracking their growth every day.</p>
        </div>
      </div>
    </div>
  );
}

export default SignUp;