import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';

// Layouts
import MainLayout from './components/MainLayout';
import DashboardLayout from './components/DashboardLayout';
import ProtectedRoute from './components/ProtectedRoute';

// Pages
import Home from './pages/Home';
import About from './pages/About';
import Contact from './pages/Contact';
import SignIn from './pages/SignIn';
import SignUp from './pages/SignUp';
import Dashboard from './pages/Dashboard';
import ManageSkills from './pages/ManageSkills';
import TestInstructions from './pages/TestInstructions';
import TestPage from './pages/TestPage';
import TestTerminated from './pages/TestTerminated';
import TestHistory from './pages/TestHistory'; // Imported here
import TestSummary from './pages/TestSummary'; // Import the new page
import JobRecommendations from './pages/JobRecommendations';
import CareerPath from './pages/CareerPath';

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
      <Route element={<ProtectedRoute />}>
        <Route element={<DashboardLayout />}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/manage-skills" element={<ManageSkills />} />
          <Route path="/test-history" element={<TestHistory />} />
        </Route>
        
        {/* Test Routes (No Sidebar) */}
        <Route path="/test/instructions/:skillName" element={<TestInstructions />} />
        <Route path="/test/start/:skillName" element={<TestPage />} />
        <Route path="/test/terminated" element={<TestTerminated />} />
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
      <Route path="/test/summary" element={<TestSummary />} />
      <Route path="/test/result/:resultId" element={<TestSummary />} />
      <Route path="/jobs/recommendations" element={<JobRecommendations />} />
      <Route path="/career-path" element={<CareerPath />} />
    </Routes>
  );
}

export default App;