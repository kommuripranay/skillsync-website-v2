import React, { useState, useEffect, useRef } from 'react';
import { Link, useParams, useNavigate, useLocation } from 'react-router-dom'; // Added useLocation
import './TestPage.css';
import ThemeToggle from '../components/ThemeToggle/ThemeToggle';
import { IonIcon } from '@ionic/react';
import { timeOutline, checkmarkCircle, warning } from 'ionicons/icons';
import { useAuth } from '../context/AuthContext'; // Added useAuth

const TOTAL_TEST_TIME = 30 * 60; 
const WARNING_TIME = 5 * 60;
const API_URL = 'http://127.0.0.1:8000'; // API Address

const VisibilityWarning = ({ onResume }) => (
  <div className="warning-overlay">
    <div className="warning-box">
      <IonIcon icon={warning} className="warning-icon" />
      <h2>Test Paused</h2>
      <p>
        Leaving the test tab or exiting fullscreen is not allowed. Further
        actions may result in disqualification or penalties.
      </p>
      <button onClick={onResume} className="resume-button">
        OK, Resume Test
      </button>
    </div>
  </div>
);

function TestPage() {
  const { skillName } = useParams(); // This is the ID
  const navigate = useNavigate();
  const location = useLocation(); // To get data from instructions
  const { user } = useAuth();

  // --- Data from Instructions ---
  const initialLevel = location.state?.initialLevel || 20;
  const skillNameText = location.state?.skillNameText || "General Skill";

  // --- State for API Data ---
  const [currentQuestion, setCurrentQuestion] = useState(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState(null);
  const [timeLeft, setTimeLeft] = useState(TOTAL_TEST_TIME);
  const [showWarning, setShowWarning] = useState(false);
  
  // Loading/Error State
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Track time per question for the API
  const questionStartTime = useRef(Date.now());

  // --- 1. API: Start Test on Mount ---
  useEffect(() => {
    const startTest = async () => {
      try {
        const userId = user ? user.id : "test-user-123";
        
        // Call Python API
        const response = await fetch(`${API_URL}/start_test`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            user_id: userId,
            skill: skillNameText, // Send text name (e.g. "Python")
            self_rating: initialLevel
          })
        });

        if (!response.ok) throw new Error('Failed to start test. Is the Python server running?');
        
        const data = await response.json();
        setCurrentQuestion(data);
        questionStartTime.current = Date.now(); // Start timer for Q1
        setLoading(false);

      } catch (err) {
        console.error(err);
        setError(err.message);
        setLoading(false);
      }
    };

    startTest();
  }, [skillNameText, user, initialLevel]);


  // --- 2. API: Submit Answer ---
  const handleSubmit = async () => {
    if (selectedOption === null) {
      alert('Please select an answer');
      return;
    }

    setLoading(true);
    const timeTaken = (Date.now() - questionStartTime.current) / 1000; // Seconds taken

    try {
      const userId = user ? user.id : "test-user-123";

      // CHECK: Should we end the test? (Limit to 10 questions for now)
      if (currentQuestionIndex >= 9) {
        const response = await fetch(`${API_URL}/end_test`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ user_id: userId, skill: skillNameText })
        });
        const result = await response.json();
        console.log("Test Results:", result);
        navigate('/dashboard'); // Or redirect to results page
        return;
      }

      // Fetch NEXT Question
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
      questionStartTime.current = Date.now(); // Reset timer

    } catch (err) {
      console.error(err);
      alert(`Error: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };


  // --- Existing Logic (Fullscreen, Timer, Etc) ---
  const requestFullscreen = () => {
    const element = document.documentElement;
    if (element.requestFullscreen) {
      element.requestFullscreen().catch((err) => {
        console.warn('Could not enter fullscreen:', err.message);
      });
    }
  };

  const handleResumeTest = () => {
    setShowWarning(false);
    requestFullscreen();
  };

  const handleOptionSelect = (optionId) => setSelectedOption(optionId);
  const handleClearSelection = () => setSelectedOption(null);
  const formatTime = (s) => `${Math.floor(s / 60)}:${(s % 60).toString().padStart(2, '0')}`;

  useEffect(() => {
    requestFullscreen();
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
      if (document.exitFullscreen && document.fullscreenElement) document.exitFullscreen();
      window.removeEventListener('blur', handleBlur);
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
      clearInterval(timer);
    };
  }, [navigate, showWarning]);


  // --- Render State ---
  if (loading) return (
    <div className="test-page-container">
      <div className="test-box" style={{textAlign:'center', padding:'3rem'}}>
        <h2 style={{color: 'var(--text-color)'}}>Loading Question...</h2>
      </div>
    </div>
  );

  if (error) return (
    <div className="test-page-container">
      <div className="test-box" style={{textAlign:'center', padding:'3rem'}}>
        <h2 style={{color: 'red'}}>Error</h2>
        <p>{error}</p>
        <Link to="/dashboard" className="submit-button">Dashboard</Link>
      </div>
    </div>
  );

  // Convert options object {opt1: "Val", opt2: "Val"} to array for rendering
  const optionsArray = Object.entries(currentQuestion.options).map(([key, value]) => ({
    id: key,
    text: value
  }));

  const progressPercent = ((currentQuestionIndex + 1) / 10) * 100;

  return (
    <div className="test-page-container">
      {showWarning && <VisibilityWarning onResume={handleResumeTest} />}

      <div className="theme-toggle-wrapper">
        <ThemeToggle />
      </div>

      <div className="test-box" style={{ filter: showWarning ? 'blur(5px)' : 'none' }}>
        <div className="test-header">
          <div className="progress-info">
            <span className="progress-text">
              Question {currentQuestionIndex + 1} of 10
            </span>
            <div className="progress-bar-container">
              <div
                className="progress-bar-fill"
                style={{ width: `${progressPercent}%` }}
              ></div>
            </div>
          </div>
          <div className="timer-container">
            <IonIcon icon={timeOutline} className="timer-icon" />
            <span className={`timer-text ${timeLeft <= WARNING_TIME ? 'warning' : ''}`}>
              {formatTime(timeLeft)} left
            </span>
          </div>
        </div>

        <div className="question-body">
          <h2 className="question-text">{currentQuestion.question_title}</h2>
          <ul className="options-list">
            {optionsArray.map((option) => (
              <li
                key={option.id}
                className={`option-item ${selectedOption === option.id ? 'selected' : ''}`}
                onClick={() => handleOptionSelect(option.id)}
              >
                <span className="radio-button">
                  {selectedOption === option.id && <span className="radio-button-inner"></span>}
                </span>
                <span className="option-text">{option.text}</span>
              </li>
            ))}
          </ul>
        </div>

          <div className="test-footer">
            <button className="clear-button" onClick={handleClearSelection}>
              Clear Selection
            </button>
            <button className="submit-button" onClick={handleSubmit}>
              {currentQuestionIndex >= 9 ? 'Finish Test' : 'Submit Answer'}
            </button>
          </div>
      </div>
    </div>
  );
}

export default TestPage;