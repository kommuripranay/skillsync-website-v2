import React, { useState, useEffect, useRef } from 'react';
import { Link, useParams, useNavigate, useLocation } from 'react-router-dom';
import './TestPage.css';
import ThemeToggle from '../components/ThemeToggle/ThemeToggle';
import { IonIcon } from '@ionic/react';
import { 
  timeOutline, 
  warning, 
  playOutline, 
  alertCircleOutline, 
  logOutOutline, 
  helpCircleOutline 
} from 'ionicons/icons';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../supabaseClient';

const TOTAL_TEST_TIME = 30 * 60;
const WARNING_TIME = 5 * 60;
const API_URL = 'http://127.0.0.1:8000';

// --- COMPONENTS ---

const VisibilityWarning = ({ onResume }) => (
  <div className="warning-overlay">
    <div className="warning-box">
      <IonIcon icon={warning} className="warning-icon" />
      <h2>Test Paused</h2>
      <p>Leaving the test tab or exiting fullscreen is not allowed.</p>
      <button onClick={onResume} className="resume-button">
        OK, Resume Test
      </button>
    </div>
  </div>
);

const StartOverlay = ({ onStart, title }) => (
  <div className="warning-overlay">
    <div className="warning-box" style={{textAlign: 'center'}}>
      <h2 style={{marginBottom: '1rem'}}>Ready to Begin?</h2>
      <p style={{marginBottom: '2rem', color: 'var(--text-light)'}}>
        You are about to start the <strong>{title}</strong> assessment.
        <br/>
        The timer will start and the window will go fullscreen immediately.
      </p>
      <button onClick={onStart} className="resume-button">
        <IonIcon icon={playOutline} style={{marginRight: '8px', verticalAlign: 'middle'}}/>
        Begin Test
      </button>
    </div>
  </div>
);

const ExitConfirmationModal = ({ onConfirm, onCancel }) => (
  <div className="warning-overlay">
    <div className="warning-box">
      <IonIcon icon={helpCircleOutline} className="warning-icon" style={{color: 'var(--accent-color)'}} />
      <h2>Exit Test?</h2>
      <p>Are you sure you want to quit? Your progress will be lost and no score will be recorded.</p>
      <div className="modal-actions" style={{display:'flex', gap:'1rem', justifyContent:'center', marginTop:'1.5rem'}}>
        <button onClick={onCancel} className="modal-btn cancel" style={{padding:'0.8rem 1.5rem', border:'1px solid var(--border-color)', background:'transparent', borderRadius:'8px', cursor:'pointer', color:'var(--text-color)'}}>
          Cancel
        </button>
        <button onClick={onConfirm} className="modal-btn confirm" style={{padding:'0.8rem 1.5rem', border:'none', background:'#d93025', color:'white', borderRadius:'8px', cursor:'pointer', fontWeight:'600'}}>
          Yes, Exit
        </button>
      </div>
    </div>
  </div>
);

// --- MAIN PAGE ---

function TestPage() {
  const { skillName } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();

  const initialLevel = location.state?.initialLevel || 20;
  const skillNameText = location.state?.skillNameText || "General Skill";

  const [currentQuestion, setCurrentQuestion] = useState(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState(null);
  const [timeLeft, setTimeLeft] = useState(TOTAL_TEST_TIME);
  
  const [hasStarted, setHasStarted] = useState(false); 
  const [showWarning, setShowWarning] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [submissionError, setSubmissionError] = useState(null);
  const [showExitConfirm, setShowExitConfirm] = useState(false);
  
  const questionStartTime = useRef(null);

  // 1. Fetch First Question
  useEffect(() => {
    const fetchFirstQuestion = async () => {
      try {
        const userId = user ? user.id : "test-user-123";
        const response = await fetch(`${API_URL}/start_test`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            user_id: userId,
            skill: skillNameText,
            self_rating: initialLevel
          })
        });

        if (!response.ok) throw new Error('Failed to start test. Is server running?');
        
        const data = await response.json();
        setCurrentQuestion(data);
        setLoading(false);
      } catch (err) {
        console.error(err);
        setError(err.message);
        setLoading(false);
      }
    };
    fetchFirstQuestion();
  }, [skillNameText, user, initialLevel]);

  // 2. Helpers
  const exitFullscreenMode = () => {
    if (document.fullscreenElement && document.exitFullscreen) {
      document.exitFullscreen().catch(err => console.log(err));
    }
  };

  const handleStartTest = () => {
    const element = document.documentElement;
    if (element.requestFullscreen) {
      element.requestFullscreen().catch(err => console.warn(err.message));
    }
    setHasStarted(true);
    questionStartTime.current = Date.now();
  };

  // 3. Exit Logic
  const handleExitTest = () => {
    setShowExitConfirm(true);
  };

  const confirmExit = () => {
    setHasStarted(false);
    exitFullscreenMode();
    navigate('/test/summary', { state: { status: 'forfeited' } });
  };

  const cancelExit = () => {
    setShowExitConfirm(false);
  };

  // 4. Submit Logic
  const handleSubmit = async () => {
    if (selectedOption === null) {
      setSubmissionError("Please select an option to proceed.");
      return;
    }

    setSubmissionError(null);
    setLoading(true);
    const timeTaken = (Date.now() - questionStartTime.current) / 1000;

    try {
      const userId = user ? user.id : "test-user-123";

      // --- CHECK IF TEST COMPLETE ---
      if (currentQuestionIndex >= 9) {
        const response = await fetch(`${API_URL}/end_test`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ user_id: userId, skill: skillNameText })
        });
        const result = await response.json();
        
        if (user) {
            const finalScore = Math.round(result.final_score * 10); 
            const duration = TOTAL_TEST_TIME - timeLeft;

            await supabase.from('test_results').insert({
                user_id: user.id,
                skill_id: skillName,
                score: finalScore,
                base_score: finalScore,
                fluency_bonus: 0,
                duration_seconds: duration
            });
        }

        // Success! Exit and Redirect to Summary
        exitFullscreenMode();
        navigate('/test/summary', { state: { status: 'completed' } });
        return;
      }

      // --- NEXT QUESTION ---
      const response = await fetch(`${API_URL}/next_question`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: userId,
          question_id: currentQuestion.question_id,
          selected_option: selectedOption,
          time_taken: timeTaken,
          previous_level: currentQuestion.difficulty,
          correct_answer: currentQuestion.correct_answer
        })
      });

      if (!response.ok) throw new Error('Failed to get next question');

      const nextQ = await response.json();
      setCurrentQuestion(nextQ);
      setCurrentQuestionIndex((prev) => prev + 1);
      setSelectedOption(null);
      questionStartTime.current = Date.now(); 

    } catch (err) {
      alert(`Error: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleOptionSelect = (optionId) => {
    setSelectedOption(optionId);
    setSubmissionError(null);
  };
  const handleClearSelection = () => setSelectedOption(null);
  
  const handleResumeTest = () => {
    setShowWarning(false);
    const element = document.documentElement;
    if (element.requestFullscreen) element.requestFullscreen().catch(() => {});
  };
  const formatTime = (s) => `${Math.floor(s / 60)}:${(s % 60).toString().padStart(2, '0')}`;

  // 5. Timer & Focus Effects
  useEffect(() => {
    if (!hasStarted) return;

    const handleBlur = () => setShowWarning(true);
    const handleFullscreenChange = () => {
      if (!document.fullscreenElement) setShowWarning(true);
    };

    const timer = setInterval(() => {
      if (showWarning) return;
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          navigate('/test/terminated');
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    window.addEventListener('blur', handleBlur);
    document.addEventListener('fullscreenchange', handleFullscreenChange);

    return () => {
      window.removeEventListener('blur', handleBlur);
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
      clearInterval(timer);
    };
  }, [hasStarted, navigate, showWarning]);

  if (loading) return <div className="test-page-container"><div className="test-box" style={{textAlign:'center', padding:'3rem'}}><h2>Loading...</h2></div></div>;
  if (error) return <div className="test-page-container"><div className="test-box" style={{textAlign:'center', padding:'3rem', color:'red'}}><p>{error}</p><Link to="/dashboard" className="submit-button">Dashboard</Link></div></div>;

  const optionsArray = Object.entries(currentQuestion.options).map(([key, value]) => ({
    id: key,
    text: value
  }));
  const progressPercent = ((currentQuestionIndex + 1) / 10) * 100;

  return (
    <div className="test-page-container">
      {!hasStarted && <StartOverlay onStart={handleStartTest} title={skillNameText} />}
      
      {hasStarted && showWarning && <VisibilityWarning onResume={handleResumeTest} />}
      
      {showExitConfirm && <ExitConfirmationModal onConfirm={confirmExit} onCancel={cancelExit} />}

      <div className="theme-toggle-wrapper"><ThemeToggle /></div>

      <div className="test-box" style={{ filter: (showWarning || !hasStarted || showExitConfirm) ? 'blur(5px)' : 'none' }}>
        
        <div className="test-header">
          <div className="progress-info">
            <span className="progress-text">Question {currentQuestionIndex + 1} of 10</span>
            <div className="progress-bar-container">
              <div className="progress-bar-fill" style={{ width: `${progressPercent}%` }}></div>
            </div>
          </div>
          <div className="timer-container">
            <IonIcon icon={timeOutline} className="timer-icon" />
            <span className={`timer-text ${timeLeft <= WARNING_TIME ? 'warning' : ''}`}>{formatTime(timeLeft)} left</span>
          </div>
        </div>

        <div className="question-body">
          <h2 className="question-text">{currentQuestion.question_title}</h2>
          <ul className="options-list">
            {optionsArray.map((option) => (
              <li key={option.id} className={`option-item ${selectedOption === option.id ? 'selected' : ''}`} onClick={() => handleOptionSelect(option.id)}>
                <span className="radio-button">{selectedOption === option.id && <span className="radio-button-inner"></span>}</span>
                <span className="option-text">{option.text}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="test-footer">
          {submissionError && (
             <div className="submission-error">
                 <IonIcon icon={alertCircleOutline} style={{marginRight:'6px'}}/>
                 {submissionError}
             </div>
          )}
          
          <div className="footer-buttons">
             <div className="footer-left">
                <button className="exit-test-button" onClick={handleExitTest}>
                    <IonIcon icon={logOutOutline} /> Exit Test
                </button>
             </div>
             
             <div className="footer-right">
                <button className="clear-button" onClick={handleClearSelection}>Clear</button>
                <button className="submit-button" onClick={handleSubmit}>
                  {currentQuestionIndex >= 9 ? 'Finish' : 'Submit'}
                </button>
             </div>
          </div>
        </div>

      </div>
    </div>
  );
}

export default TestPage;