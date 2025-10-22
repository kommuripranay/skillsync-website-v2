import React from 'react';
import logoImage from '../../assets/logo.png';
import { Link, NavLink } from 'react-router-dom';
import './Navbar.css';

function Navbar() {
  return (
    <nav className="navbar">
      {/* Use the imported image in an img tag */}
      <Link to="/" className="navbar-logo">
        <img src={logoImage} alt="SkillSync Logo" height="500" /> {/* Adjust height */}
        <span>SkillSync</span> {/* Wrap the text in a span */}
      </Link>
      <ul className="navbar-links">
        <li>
          <NavLink to="/about">About</NavLink>
        </li>
        <li>
          <NavLink to="/contact">Contact</NavLink>
        </li>
      </ul>
      {/* Container for auth buttons */}
      <div className="navbar-auth-buttons">
        <Link to="/signin" className="navbar-button signin-button">
          Sign In
        </Link>
        <Link to="/signup" className="navbar-button signup-button">
          Sign Up
        </Link>
      </div>
    </nav>
  );
}

export default Navbar;