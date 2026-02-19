import React from 'react';
import { Link, useLocation } from 'react-router-dom'

// Hamburger menu icon
const imgIcon = "/burg.svg";

// Colorful inline SVG icons
const IconNewTutor = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="sidebar-nav-icon">
    <path d="M12 2L14.5 8.5L21 9L16 13.5L17.5 20L12 17L6.5 20L8 13.5L3 9L9.5 8.5L12 2Z" fill="url(#star-gradient)" stroke="url(#star-gradient)" strokeWidth="1.5" strokeLinejoin="round"/>
    <defs>
      <linearGradient id="star-gradient" x1="3" y1="2" x2="21" y2="20" gradientUnits="userSpaceOnUse">
        <stop stopColor="#F59E0B"/>
        <stop offset="1" stopColor="#EF4444"/>
      </linearGradient>
    </defs>
  </svg>
);

const IconAskTeacher = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="sidebar-nav-icon">
    <circle cx="12" cy="12" r="10" stroke="url(#chat-stroke)" strokeWidth="2" fill="url(#chat-fill)"/>
    <path d="M8 10h8M8 14h5" stroke="white" strokeWidth="1.8" strokeLinecap="round"/>
    <defs>
      <linearGradient id="chat-stroke" x1="2" y1="2" x2="22" y2="22" gradientUnits="userSpaceOnUse">
        <stop stopColor="#6366F1"/>
        <stop offset="1" stopColor="#8B5CF6"/>
      </linearGradient>
      <linearGradient id="chat-fill" x1="2" y1="2" x2="22" y2="22" gradientUnits="userSpaceOnUse">
        <stop stopColor="#6366F1"/>
        <stop offset="1" stopColor="#7C3AED"/>
      </linearGradient>
    </defs>
  </svg>
);

const IconTeacherAnswers = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="sidebar-nav-icon">
    <rect x="2" y="4" width="20" height="14" rx="2" stroke="url(#video-stroke)" strokeWidth="2" fill="url(#video-fill)"/>
    <circle cx="18" cy="6" r="3" fill="url(#badge-gradient)" stroke="white" strokeWidth="1"/>
    <path d="M10 9l5 3-5 3V9z" fill="white"/>
    <defs>
      <linearGradient id="video-stroke" x1="2" y1="4" x2="22" y2="18" gradientUnits="userSpaceOnUse">
        <stop stopColor="#EC4899"/>
        <stop offset="1" stopColor="#F43F5E"/>
      </linearGradient>
      <linearGradient id="video-fill" x1="2" y1="4" x2="22" y2="18" gradientUnits="userSpaceOnUse">
        <stop stopColor="#F472B6" stopOpacity="0.4"/>
        <stop offset="1" stopColor="#FB7185" stopOpacity="0.5"/>
      </linearGradient>
      <linearGradient id="badge-gradient" x1="15" y1="3" x2="21" y2="9" gradientUnits="userSpaceOnUse">
        <stop stopColor="#F59E0B"/>
        <stop offset="1" stopColor="#EF4444"/>
      </linearGradient>
    </defs>
  </svg>
);

const IconSubjects = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="sidebar-nav-icon">
    <path d="M4 6h16v12H4V6z" stroke="url(#book-stroke)" strokeWidth="2" strokeLinejoin="round" fill="url(#book-fill)"/>
    <path d="M4 6h16M9 10h6M9 14h4" stroke="url(#book-stroke)" strokeWidth="1.5" strokeLinecap="round"/>
    <defs>
      <linearGradient id="book-stroke" x1="4" y1="6" x2="20" y2="18" gradientUnits="userSpaceOnUse">
        <stop stopColor="#10B981"/>
        <stop offset="1" stopColor="#06B6D4"/>
      </linearGradient>
      <linearGradient id="book-fill" x1="4" y1="6" x2="20" y2="18" gradientUnits="userSpaceOnUse">
        <stop stopColor="#34D399" stopOpacity="0.4"/>
        <stop offset="1" stopColor="#22D3EE" stopOpacity="0.5"/>
      </linearGradient>
    </defs>
  </svg>
);

function Sidebar({ isOpen, toggleSidebar }) {
  const location = useLocation();
  
  return (
    <div className={`sidebar ${isOpen ? 'sidebar-open' : 'sidebar-closed'}`}>
      <div className="sidebar-header">
        <button className="menu-button" onClick={toggleSidebar}>
          <img src={imgIcon} alt="Menu" className="icon" />
        </button>
      </div>

      <div className="sidebar-content">
        <nav className="navigation">
        <Link to="/" className="nav-button-link">
          <button className="nav-button">
            <IconNewTutor />
            <span>AI Tutor</span>
          </button>
          </Link>
          <Link to="/ask" className="nav-button-link">
          <button className="nav-button">
            <IconAskTeacher />
            <span>Ask your class Teacher</span>
          </button>
          </Link>     
          <Link to="/answers" className="nav-button-link">
          <button className="nav-button">
            <IconTeacherAnswers />
            <span>Teacher Answers</span>
          </button>
          </Link>        
          <button className="nav-button">
            <IconSubjects />
            <span>Subjects</span>            
          </button>                    
        </nav>

        <h3 className="section-heading">Your Subjects</h3>

        <Link to="/subjects/langchain-docs" className="nav-button-link">
        <button className={`nav-button ${location.pathname === '/subjects/langchain-docs' ? 'menu2' : ''}`}>
          &nbsp; - Warren Buffett <br /> &nbsp; &nbsp; Shareholder Report
          </button>
          
          </Link>
          <a href="https://www.berkshirehathaway.com/letters/2023ltr.pdf" target="_blank" className="navButton22  ">
            Report Link
          </a> <br /><br />

          <Link to="/subjects/ciencias1" className="nav-button-link">
          <button className={`nav-button ${location.pathname === '/subjects/ciencias1' ? 'menu2' : ''}`}>
          &nbsp; - Ciencia y Tecnología <br /> &nbsp; &nbsp;  1 año bachillerato El Salvador
          </button>
          
          </Link>
          <a href="https://www.mined.gob.sv/materiales/2026/CIENCIA_Y_TECNOLOGIA/2.%20Libros%20de%20texto/Libro%20de%20texto%201.%C2%B0%20a%C3%B1o%20de%20bachillerato.pdf" target="_blank" className="navButton22  ">
            Book Link
          </a>


      </div>
    </div>
  );
}

export default Sidebar;
