/* src/components/MainLayout.jsx */

import React from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from './Navbar/Navbar';

function MainLayout() {
  return (
    <>
      <Navbar />
      <main>
        {/* Pages like Home, About, and Contact will render here */}
        <Outlet /> 
      </main>
    </>
  );
}

export default MainLayout;