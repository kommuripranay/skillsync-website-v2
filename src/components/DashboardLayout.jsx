import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import './DashboardLayout.css';

const DashboardLayout = () => {
  // State to manage whether the sidebar is open or closed
  // Default is true (collapsed/condensed) based on your request
  const [isCollapsed, setIsCollapsed] = useState(true);

  const toggleSidebar = () => {
    setIsCollapsed(!isCollapsed);
  };

  return (
    <div className="dashboard-layout">
      <Sidebar isCollapsed={isCollapsed} toggleSidebar={toggleSidebar} />
      
      {/* Adjust margin based on state */}
      <main className={`dashboard-content ${isCollapsed ? 'content-collapsed' : 'content-expanded'}`}>
        <Outlet />
      </main>
    </div>
  );
};

export default DashboardLayout;