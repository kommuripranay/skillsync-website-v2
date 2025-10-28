import React, { useState, useEffect, useRef } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import './TestPage.css'; // We will add new styles to this
import ThemeToggle from '../components/ThemeToggle/ThemeToggle';
import { IonIcon } from '@ionic/react';
import { timeOutline, checkmarkCircle } from 'ionicons/icons';
import { questionBank } from '../data/questionBank';

const TOTAL_TEST_TIME = 30 * 60; // 30 minutes in seconds

function TestPage() {
  const { skillName } = useParams();
  const navigate = useNavigate();

  // 3. Get the correct set of questions from the imported bank
  const questionSet = questionBank[skillName] || [];
  const totalQuestions = questionSet.length;

  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState(null);
  const [timeLeft, setTimeLeft] = useState(TOTAL_TEST_TIME);

  // 4. Add an error check for missing questions
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

  // --- Timer Logic ---
  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prevTime) => {
        if (prevTime <= 1) {
          clearInterval(timer);
          // Auto-submit or navigate away when time is up
          navigate('/dashboard');
          return 0;
        }
        return prevTime - 1;
      });
    }, 1000);

    // Cleanup interval on unmount
    return () => clearInterval(timer);
  }, [navigate]);

  // Helper function to format time
  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${secs
      .toString()
      .padStart(2, '0')}`;
  };

  // --- Event Handlers ---
  const handleOptionSelect = (optionId) => {
    setSelectedOption(optionId);
  };

  // --- 👇 ADD THIS FUNCTION ---
  const handleClearSelection = () => {
    setSelectedOption(null);
  };
  // --- 👆 ADD THIS FUNCTION ---

  const handleSubmit = () => {
    if (selectedOption === null) {
      alert('Please select an answer'); // Simple validation
      return;
    }

    // --- This is where the adaptive logic will go ---
    // 1. Record the answer (currentQuestion.id, selectedOption)
    // 2. Check if correct (selectedOption === currentQuestion.correct)
    // 3. Send this Right/Wrong info to the backend/logic
    // 4. Get the *next* question based on the response
    // --------------------------------------------------

    // For now, we just move to the next question in the mock list
    if (isLastQuestion) {
      // Finish the test
      navigate('/dashboard');
    } else {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
      setSelectedOption(null); // Reset selection for the new question
    }
  };

  // --- Progress Bar ---
  const progressPercent = ((currentQuestionIndex + 1) / totalQuestions) * 100;

  return (
    <div className="test-page-container">
      <div className="theme-toggle-wrapper">
        <ThemeToggle />
      </div>

      <div className="test-box">
        {/* --- Header --- */}
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

        {/* --- Question Body --- */}
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

        {/* --- Footer --- */}
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