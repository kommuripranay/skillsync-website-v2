import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom'; // Import hooks
import './TestInstructions.css';
import { IonIcon } from '@ionic/react';
import { arrowForwardOutline, chevronForwardOutline } from 'ionicons/icons';
import ThemeToggle from '../components/ThemeToggle/ThemeToggle'; // 1. Import

// --- Inactivity Modal Component ---
const InactivityModal = ({ countdown, onStay }) => (
  <div className="timeout-modal-overlay">
    <div className="timeout-modal-box">
      <h2>Are you still there?</h2>
      <p>Your session will time out and you will be returned to the dashboard.</p>
      <div className="timeout-countdown">{countdown}</div>
      <button onClick={onStay} className="timeout-stay-button">
        I'm still here
      </button>
    </div>
  </div>
);
// ---------------------------------

// Set timeouts
const INACTIVITY_TIMEOUT_MS = 10000; // 10 seconds (for testing)
const MODAL_COUNTDOWN_S = 5;      // 5 seconds (for testing)


function TestInstructions() {
  const { skillName } = useParams(); // Get skill name from URL
  const navigate = useNavigate();      // Hook for navigation

  const [showModal, setShowModal] = useState(false);
  const [countdown, setCountdown] = useState(MODAL_COUNTDOWN_S);

  // Refs to store timer IDs
  const inactivityTimerRef = useRef(null);
  const modalTimerRef = useRef(null);

  // Capitalize skill name
  const skill = skillName.charAt(0).toUpperCase() + skillName.slice(1);

  // --- Timeout Logic ---
  const resetInactivityTimer = () => {
    // Clear existing timers
    if (inactivityTimerRef.current) clearTimeout(inactivityTimerRef.current);
    if (modalTimerRef.current) clearInterval(modalTimerRef.current);

    // Hide modal and reset countdown
    setShowModal(false);
    setCountdown(MODAL_COUNTDOWN_S);

    // Start new inactivity timer
    inactivityTimerRef.current = setTimeout(() => {
      setShowModal(true); // Show modal when timer fires
    }, INACTIVITY_TIMEOUT_MS);
  };

  // Run when modal visibility changes
  useEffect(() => {
    if (showModal) {
      // Start the modal's 60-second countdown
      modalTimerRef.current = setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 1) {
            clearInterval(modalTimerRef.current);
            navigate('/dashboard'); // Time's up! Go to dashboard
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    // Cleanup interval on unmount or if modal is hidden
    return () => clearInterval(modalTimerRef.current);
  }, [showModal, navigate]);

  // Start the main inactivity timer on component mount
  // and reset it on any user activity
  useEffect(() => {
    resetInactivityTimer();
    
    // Listen for activity
    window.addEventListener('mousemove', resetInactivityTimer);
    window.addEventListener('keydown', resetInactivityTimer);

    // Cleanup timers and listeners on unmount
    return () => {
      clearTimeout(inactivityTimerRef.current);
      clearInterval(modalTimerRef.current);
      window.removeEventListener('mousemove', resetInactivityTimer);
      window.removeEventListener('keydown', resetInactivityTimer);
    };
  }, []);

  const handleStartTest = () => {
    // Navigate to the dummy test page for the specific skill
    navigate(`/test/start/${skillName}`);
  };

  const handleStay = () => {
    resetInactivityTimer();
  };
  // -------------------------

  return (
    <div className="test-instructions-page">
      {/* Show modal if state is true */}
      <div className="theme-toggle-wrapper">
        <ThemeToggle />
      </div>
      {showModal && <InactivityModal countdown={countdown} onStay={handleStay} />}

      <div className="instructions-box">
        <h1 className="instructions-title">Skill Test Instructions</h1>
        <h2 className="instructions-skill-name">
          You are about to start the test for: <strong>{skill}</strong>
        </h2>

        {/* ... (rest of the list items are unchanged) ... */}
        <ul className="instructions-list">
          <li>
            <IonIcon icon={chevronForwardOutline} className="instructions-list-icon" />
            <span>The test has a total time limit of <strong>30 minutes</strong>.</span>
          </li>
          <li>
            <IonIcon icon={chevronForwardOutline} className="instructions-list-icon" />
            <span>You will be presented with approximately <strong>12-15 questions</strong>.</span>
          </li>
          <li>
            <IonIcon icon={chevronForwardOutline} className="instructions-list-icon" />
            <span>This is an <strong>adaptive test</strong>; the difficulty will change based on your answers.</span>
          </li>
          <li>
            <IonIcon icon={chevronForwardOutline} className="instructions-list-icon" />
            <span>You <strong>must answer every question</strong> to proceed. You cannot skip or go back.</span>
          </li>
          <li>
            <IonIcon icon={chevronForwardOutline} className="instructions-list-icon" />
            <span>Your time per question is recorded to measure fluency, so answer as quickly and accurately as possible.</span>
          </li>
          <li>
            <IonIcon icon={chevronForwardOutline} className="instructions-list-icon" />
            <span>Please complete this test on your own, without assistance or external resources.</span>
          </li>
        </ul>

        <button className="start-button" onClick={handleStartTest}>
          Start Test
          <IonIcon icon={arrowForwardOutline} className="button-arrow-icon" />
        </button>
      </div>
    </div>
  );
}

export default TestInstructions;