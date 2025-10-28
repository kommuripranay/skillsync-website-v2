import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import ThemeToggle from '../components/ThemeToggle/ThemeToggle';
import './TestTerminated.css';
import { IonIcon } from '@ionic/react';
import { warningOutline } from 'ionicons/icons';

const REDIRECT_TIME = 59; // Countdown seconds

function TestTerminated() {
  const [countdown, setCountdown] = useState(REDIRECT_TIME);
  const navigate = useNavigate();

  useEffect(() => {
    // Timer to redirect to dashboard
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          navigate('/dashboard'); // Time's up, go to dashboard
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    // Cleanup timer on unmount
    return () => clearInterval(timer);
  }, [navigate]);

  return (
    <div className="terminated-page-container">
      <div className="theme-toggle-wrapper">
        <ThemeToggle />
      </div>

      <div className="terminated-box">
        <IonIcon icon={warningOutline} className="terminated-icon" />
        <h1 className="terminated-title">The Test Has Terminated</h1>
        <p className="terminated-text">
          Your time has run out.
        </p>
        
        <Link to="/dashboard" className="terminated-link-button">
          Go Back to Dashboard
        </Link>
        
        <p className="terminated-redirect-text">
          You will be redirected in {countdown} seconds...
        </p>
      </div>
    </div>
  );
}

export default TestTerminated;