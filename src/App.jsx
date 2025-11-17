import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';

// Main Site Imports
import Home from './pages/Home';
import About from './pages/About';
import Contact from './pages/Contact';
import SignIn from './pages/SignIn';
import SignUp from './pages/SignUp';
import MainLayout from './components/MainLayout';

// Test App Imports (that we want to protect)
import Dashboard from './pages/Dashboard';
import TestInstructions from './pages/TestInstructions';
import TestPage from './pages/TestPage';
import TestTerminated from './pages/TestTerminated';

// Auth Imports
import ProtectedRoute from './components/ProtectedRoute'; // 1. Import the bouncer
import ManageSkills from './pages/ManageSkills';

function App() {
  return (
    <Routes>
      {/* --- PUBLIC ROUTES --- */}
      <Route element={<MainLayout />}>
        <Route path="/" element={<Home />} />
        <Route path="/about" element={<About />} />
        <Route path="/contact" element={<Contact />} />
      </Route>

      <Route path="/signin" element={<SignIn />} />
      <Route path="/signup" element={<SignUp />} />

      {/* --- PROTECTED ROUTES --- */}
      {/* 2. All routes inside here require login */}
      <Route element={<ProtectedRoute />}>
        {/* We want the dashboard to have the main navbar */}
        <Route element={<MainLayout />}>
          <Route path="/dashboard" element={<Dashboard />} />
        </Route>
        
        {/* These test pages should NOT have the main navbar */}
        <Route path="/test/instructions/:skillName" element={<TestInstructions />} />
        <Route path="/test/start/:skillName" element={<TestPage />} />
        <Route path="/test/terminated" element={<TestTerminated />} />
        <Route path="/manage-skills" element={<ManageSkills />} />
      </Route>

      {/* 3. Fallback route */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;