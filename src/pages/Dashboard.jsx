import React from 'react';
import { Link } from 'react-router-dom';
import './Dashboard.css';
import ThemeToggle from '../components/ThemeToggle/ThemeToggle';
import { subjectList } from '../data/questionBank'; // 1. Import the new list

function Dashboard() {
  return (
    <div className="dashboard-container">
      <div className="theme-toggle">
        <ThemeToggle />
      </div>

      <div className="dashboard-header">
        <h1>Welcome to your Dashboard</h1>
        <p>Select a skill below to start your assessment.</p>
      </div>

      {/* 2. Replace the old <div> with this new one */}
      <div className="skill-test-grid">
        {subjectList.map((subject) => (
          <Link
            key={subject.id}
            to={`/test/instructions/${subject.id}`}
            className="skill-test-button"
            // 3. Use inline style for the unique color
            style={{ backgroundColor: subject.color }}
          >
            Attempt Test: {subject.name}
          </Link>
        ))}
      </div>
    </div>
  );
}

export default Dashboard;