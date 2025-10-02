import React from 'react';
import { NavLink } from 'react-router-dom';
import { FaHome, FaFlag, FaUsers, FaTrophy, FaGift, FaRoute, FaStore } from 'react-icons/fa';
import './Navbar.css';

const Navbar: React.FC = () => {
  return (
    <nav className="navbar">
      <div className="navbar-brand">
        <h1>Star Health</h1>
      </div>
      <div className="navbar-links">
        <NavLink 
          to="/dashboard" 
          className={({ isActive }) => isActive ? 'active' : ''}
        >
          <FaHome /> <span>Dashboard</span>
        </NavLink>
        <NavLink 
          to="/quests" 
          className={({ isActive }) => isActive ? 'active' : ''}
        >
          <FaFlag /> <span>Quests</span>
        </NavLink>
        <NavLink 
          to="/community" 
          className={({ isActive }) => isActive ? 'active' : ''}
        >
          <FaUsers /> <span>Community</span>
        </NavLink>
        <NavLink 
          to="/leaderboards" 
          className={({ isActive }) => isActive ? 'active' : ''}
        >
          <FaTrophy /> <span>Leaderboards</span>
        </NavLink>
        <NavLink 
          to="/journey" 
          className={({ isActive }) => isActive ? 'active' : ''}
        >
          <FaRoute /> <span>Journey</span>
        </NavLink>
        <NavLink 
          to="/store" 
          className={({ isActive }) => isActive ? 'active' : ''}
        >
          <FaStore /> <span>Store</span>
        </NavLink>
        <NavLink 
          to="/rewards" 
          className={({ isActive }) => isActive ? 'active' : ''}
        >
          <FaGift /> <span>Rewards</span>
        </NavLink>
      </div>
    </nav>
  );
};

export default Navbar;
