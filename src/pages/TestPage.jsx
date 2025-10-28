import React, { useState, useEffect, useRef } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import './TestPage.css';
import ThemeToggle from '../components/ThemeToggle/ThemeToggle';
import { IonIcon } from '@ionic/react';
import { timeOutline, checkmarkCircle, warning } from 'ionicons/icons';
import { questionBank } from '../data/questionBank';

const TOTAL_TEST_TIME = 30 * 60; // 30 minutes in seconds

// 1. --- ADD { onResume } ---
// The component needs to receive the 'onResume' function as a prop
const VisibilityWarning = ({ onResume }) => (
  <div className="warning-overlay">
    <div className="warning-box">
      <IonIcon icon={warning} className="warning-icon" />
      <h2>Test Paused</h2>
      <p>
        Leaving the test tab or exiting fullscreen is not allowed. Further
        actions may result in disqualification or penalties.
      </p>
      {/* This button will now correctly call the onResume prop */}
      <button onClick={onResume} className="resume-button">
        OK, Resume Test
      </button>
    </div>
  </div>
);

function TestPage() {
  const { skillName } = useParams();
  const navigate = useNavigate();

  const questionSet = questionBank[skillName] || [];
  const totalQuestions = questionSet.length;

  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState(null);
  const [timeLeft, setTimeLeft] = useState(TOTAL_TEST_TIME);
  const [showWarning, setShowWarning] = useState(false);

  // Error check (this part was correct)
  if (totalQuestions === 0) {
    return (
      <div className="test-page-container">
        <div className="test-box" style={{ textAlign: 'center', padding: '3rem' }}>
          <h2 style={{ marginBottom: '1rem', color: 'var(--text-color)' }}>Error</h2>
          <p style={{ marginBottom: '2rem', color: 'var(--text-light)' }}>
            Sorry, no questions were found for the subject: <strong>{skillName}</strong>.
          </p>
          <Link to="/dashboard" className="submit-button" style={{ textDecoration: 'none' }}>
            Back to Dashboard
          </Link>
        </div>
      </div>
    );
  }

  const currentQuestion = questionSet[currentQuestionIndex];
  const isLastQuestion = currentQuestionIndex === totalQuestions - 1;

  // 2. --- ADD HELPER FUNCTIONS ---
  // Reusable function to request fullscreen
  const requestFullscreen = () => {
    const element = document.documentElement;
    if (element.requestFullscreen) {
      element.requestFullscreen().catch((err) => {
        console.warn('Could not enter fullscreen mode:', err.message);
      });
    }
  };

  // Handler for the "OK" button in the warning
  const handleResumeTest = () => {
    setShowWarning(false);
    requestFullscreen(); // Re-enter fullscreen
  };

  // 3. --- FIX THE useEffect HOOK ---
  // This hook now contains the timer, blur, and fullscreen logic
  useEffect(() => {
    requestFullscreen(); // Request fullscreen on mount

    const handleBlur = () => {
      setShowWarning(true);
    };

    // Checks if the user has exited fullscreen
    const handleFullscreenChange = () => {
      if (!document.fullscreenElement) {
        setShowWarning(true);
      }
    };

    // --- Timer Logic ---
    const timer = setInterval(() => {
      // Don't count down if the warning is visible
      if (showWarning) return;

      setTimeLeft((prevTime) => {
        if (prevTime <= 1) {
          clearInterval(timer);
          navigate('/dashboard');
          return 0;
        }
        return prevTime - 1;
      });
    }, 1000);

    // --- Add Listeners ---
    window.addEventListener('blur', handleBlur);
    document.addEventListener('fullscreenchange', handleFullscreenChange);

    // --- Cleanup Function ---
    return () => {
      if (document.exitFullscreen && document.fullscreenElement) {
        document.exitFullscreen();
      }
      window.removeEventListener('blur', handleBlur);
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
      clearInterval(timer);
    };
    // Add showWarning to dependencies
  }, [navigate, showWarning]); 

  // --- (All other functions were correct) ---

  // Helper function to format time
  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${secs
      .toString()
      .padStart(2, '0')}`;
  };

  // Event Handlers
  const handleOptionSelect = (optionId) => {
    setSelectedOption(optionId);
  };

  const handleClearSelection = () => {
    setSelectedOption(null);
  };

  const handleSubmit = () => {
    if (selectedOption === null) {
      alert('Please select an answer');
      return;
    }

    if (isLastQuestion) {
      navigate('/dashboard');
    } else {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
      setSelectedOption(null);
    }
  };

  // Progress Bar
  const progressPercent = ((currentQuestionIndex + 1) / totalQuestions) * 100;

  return (
    <div className="test-page-container">
      {/* 4. --- PASS THE PROP to the component --- */}
      {showWarning && <VisibilityWarning onResume={handleResumeTest} />}

      <div className="theme-toggle-wrapper">
        <ThemeToggle />
      </div>

      <div
        className="test-box"
        style={{ filter: showWarning ? 'blur(5px)' : 'none' }}
      >
        {/* --- (Header, Body, and Footer JSX were all correct) --- */}
        <div className="test-header">
          <div className="progress-info">
            <span className="progress-text">
              Question {currentQuestionIndex + 1} of {totalQuestions}
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
            <span className="timer-text">{formatTime(timeLeft)} left</span>
          </div>
        </div>

        <div className="question-body">
          <h2 className="question-text">{currentQuestion.text}</h2>
          <ul className="options-list">
            {currentQuestion.options.map((option) => (
              <li
                key={option.id}
                className={`option-item ${
                  selectedOption === option.id ? 'selected' : ''
                }`}
                onClick={() => handleOptionSelect(option.id)}
              >
                <span className="radio-button">
                  {selectedOption === option.id && (
                    <span className="radio-button-inner"></span>
                  )}
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
            {isLastQuestion ? 'Finish Test' : 'Submit Answer'}
          </button>
        </div>
      </div>
    </div>
  );
}

export default TestPage;