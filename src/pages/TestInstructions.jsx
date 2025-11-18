import React, { useState, useEffect, useRef } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import './TestInstructions.css';
import { IonIcon } from '@ionic/react';
import { arrowForwardOutline, chevronForwardOutline } from 'ionicons/icons';
import ThemeToggle from '../components/ThemeToggle/ThemeToggle'; // 1. Import
import { supabase } from '../supabaseClient';

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
  const { skillName } = useParams(); // This is the Skill ID
  const navigate = useNavigate();

  const [showModal, setShowModal] = useState(false);
  const [countdown, setCountdown] = useState(MODAL_COUNTDOWN_S);
  
  // --- NEW STATE for API ---
  const [realSkillName, setRealSkillName] = useState(''); // Stores "Python", "Java", etc.
  const [selectedLevel, setSelectedLevel] = useState(20); // Default: Beginner

  const inactivityTimerRef = useRef(null);
  const modalTimerRef = useRef(null);

  // Capitalize skill name
  useEffect(() => {
    const fetchSkillName = async () => {
      if (!skillName) return;
      const { data, error } = await supabase
        .from('skills')
        .select('name')
        .eq('id', skillName)
        .single();
      
      if (data) setRealSkillName(data.name);
    };
    fetchSkillName();
  }, [skillName]);

  // --- Timeout Logic ---
  const resetInactivityTimer = () => {
    if (inactivityTimerRef.current) clearTimeout(inactivityTimerRef.current);
    if (modalTimerRef.current) clearInterval(modalTimerRef.current);
    setShowModal(false);
    setCountdown(MODAL_COUNTDOWN_S);
    inactivityTimerRef.current = setTimeout(() => {
      setShowModal(true);
    }, INACTIVITY_TIMEOUT_MS);
  };

  // Run when modal visibility changes
  useEffect(() => {
    if (showModal) {
      modalTimerRef.current = setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 1) {
            clearInterval(modalTimerRef.current);
            navigate('/dashboard');
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(modalTimerRef.current);
  }, [showModal, navigate]);

  // Start the main inactivity timer on component mount
  // and reset it on any user activity
  useEffect(() => {
    resetInactivityTimer();
    window.addEventListener('mousemove', resetInactivityTimer);
    window.addEventListener('keydown', resetInactivityTimer);
    return () => {
      clearTimeout(inactivityTimerRef.current);
      clearInterval(modalTimerRef.current);
      window.removeEventListener('mousemove', resetInactivityTimer);
      window.removeEventListener('keydown', resetInactivityTimer);
    };
  }, []);

  const handleStay = () => {
    resetInactivityTimer();
  };

  const handleStartTest = () => {
    // Pass the selected level and text name to the test page
    navigate(`/test/start/${skillName}`, {
      state: { 
        initialLevel: selectedLevel,
        skillNameText: realSkillName || skillName 
      }
    });
  };

  return (
    <div className="test-instructions-page">
      <div className="theme-toggle-wrapper">
        <ThemeToggle />
      </div>
      {showModal && <InactivityModal countdown={countdown} onStay={handleStay} />}

      <div className="instructions-box">
        <h1 className="instructions-title">Skill Test Instructions</h1>
        <h2 className="instructions-skill-name">
          You are about to start the test for: <strong>{realSkillName || skillName}</strong>
        </h2>

        <ul className="instructions-list">
          {/* ... (List items unchanged) ... */}
          <li>
            <IonIcon icon={chevronForwardOutline} className="instructions-list-icon" />
            <span>The test has a total time limit of <strong>30 minutes</strong>.</span>
          </li>
          <li>
            <IonIcon icon={chevronForwardOutline} className="instructions-list-icon" />
            <span>You will be presented with approximately <strong>10-15 questions</strong>.</span>
          </li>
          <li>
            <IonIcon icon={chevronForwardOutline} className="instructions-list-icon" />
            <span>This is an <strong>adaptive test</strong>; the difficulty will change based on your answers.</span>
          </li>
          <li>
            <IonIcon icon={chevronForwardOutline} className="instructions-list-icon" />
            <span>You <strong>must answer every question</strong> to proceed.</span>
          </li>
        </ul>

        {/* --- 3. Add Difficulty Selector --- */}
        <div style={{ margin: '1.5rem 0', textAlign: 'left' }}>
          <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600', color: 'var(--text-color)' }}>
            Select your experience level:
          </label>
          <select 
            value={selectedLevel} 
            onChange={(e) => setSelectedLevel(Number(e.target.value))}
            style={{ 
              padding: '0.8rem', 
              borderRadius: '5px', 
              border: '1px solid var(--border-color)', 
              width: '100%', 
              fontSize: '1rem',
              backgroundColor: 'var(--navbar-bg)',
              color: 'var(--text-color)'
            }}
          >
            <option value={20}>Novice (Student / &lt; 1 yr)</option>
            <option value={40}>Beginner (Junior / 1-2 yrs)</option>
            <option value={60}>Intermediate (Mid-level / 2-4 yrs)</option>
            <option value={80}>Advanced (Senior / 5+ yrs)</option>
            <option value={95}>Expert (Principal / Architect)</option>
          </select>
        </div>

        <button className="start-button" onClick={handleStartTest}>
          Start Test
          <IonIcon icon={arrowForwardOutline} className="button-arrow-icon" />
        </button>
      </div>
    </div>
  );
}

export default TestInstructions;