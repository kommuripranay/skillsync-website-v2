import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import './TestSummary.css'; // We'll create this next
import { IonIcon } from '@ionic/react';
import { checkmarkCircle, alertCircle, arrowForward } from 'ionicons/icons';
import ThemeToggle from '../components/ThemeToggle/ThemeToggle';

const TestSummary = () => {
  const navigate = useNavigate();
  const location = useLocation();
  
  // Get status passed from TestPage ('completed' or 'forfeited')
  const status = location.state?.status || 'completed';
  
  const [countdown, setCountdown] = useState(5);

  // --- 5 Second Auto-Redirect ---
  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          navigate('/dashboard');
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [navigate]);

  const handleManualRedirect = () => {
    navigate('/dashboard');
  };

  const isSuccess = status === 'completed';

  return (
    <div className="summary-page-container">
      <div className="theme-toggle-wrapper">
        <ThemeToggle />
      </div>

      <div className="summary-card">
        <div className={`icon-wrapper ${isSuccess ? 'success' : 'warning'}`}>
          <IonIcon icon={isSuccess ? checkmarkCircle : alertCircle} />
        </div>

        <h1>{isSuccess ? 'Test Complete!' : 'Test Forfeited'}</h1>
        
        <p className="summary-message">
          {isSuccess 
            ? "Your answers have been submitted and your score has been recorded." 
            : "You chose to exit the assessment early. No score was recorded."}
        </p>

        <p className="redirect-text">
          Redirecting to dashboard in <strong>{countdown}</strong> seconds...
        </p>

        <button onClick={handleManualRedirect} className="dashboard-btn">
          Go to Dashboard Now <IonIcon icon={arrowForward} />
        </button>
      </div>
    </div>
  );
};

export default TestSummary;