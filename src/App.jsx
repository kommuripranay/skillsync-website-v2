///*
import React from 'react';
// 1. Import Router and components
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Dashboard from './pages/Dashboard';
import TestInstructions from './pages/TestInstructions';
import TestPage from './pages/TestPage'; // Using your file name

function App() {
  return (
    // 2. Set up the simplified router
    <Routes>
      <Route path="/dashboard" element={<Dashboard />} />
      <Route path="/test/instructions/:skillName" element={<TestInstructions />} />
      <Route path="/test/start/:skillName" element={<TestPage />} />
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
}

export default App;
//*/
/*
import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import About from './pages/About';
import Contact from './pages/Contact';
import SignIn from './pages/SignIn';
import SignUp from './pages/SignUp';
import MainLayout from './components/MainLayout';

function App() {
  return (
    <Routes>
      <Route element={<MainLayout />}>
        <Route path="/" element={<Home />} />
        <Route path="/about" element={<About />} />
        <Route path="/contact" element={<Contact />} />
      </Route>

      <Route path="/signin" element={<SignIn />} />
      <Route path="/signup" element={<SignUp />} />
    </Routes>
  );
  
}

export default App;
*/