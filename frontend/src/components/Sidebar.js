import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom'
import { VALORES_SECTIONS } from '../screens/9/valores/valoresNavData'

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


const IconNewTutor2 = () => (
  <svg
    width="20"
    height="20"
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className="sidebar-nav-icon"
  >
    {/* Graduation cap */}
    <path
      d="M3 9L12 4L21 9L12 14L3 9Z"
      fill="url(#cap-top-gradient)"
      stroke="url(#cap-top-gradient)"
      strokeWidth="1.5"
      strokeLinejoin="round"
    />
    <path
      d="M7 11.5V15C7 16.657 9.239 18 12 18C14.761 18 17 16.657 17 15V11.5"
      fill="url(#cap-base-fill)"
      stroke="url(#cap-base-stroke)"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    {/* Tassel */}
    <path
      d="M18.5 9.5V13"
      stroke="url(#cap-tassel-stroke)"
      strokeWidth="1.4"
      strokeLinecap="round"
    />
    <circle
      cx="18.5"
      cy="13.8"
      r="0.9"
      fill="url(#cap-tassel-stroke)"
    />
    <defs>
      <linearGradient
        id="cap-top-gradient"
        x1="3"
        y1="4"
        x2="21"
        y2="14"
        gradientUnits="userSpaceOnUse"
      >
        <stop stopColor="#4F46E5" />
        <stop offset="1" stopColor="#6366F1" />
      </linearGradient>
      <linearGradient
        id="cap-base-fill"
        x1="7"
        y1="11.5"
        x2="17"
        y2="18"
        gradientUnits="userSpaceOnUse"
      >
        <stop stopColor="#A5B4FC" stopOpacity="0.4" />
        <stop offset="1" stopColor="#C4B5FD" stopOpacity="0.6" />
      </linearGradient>
      <linearGradient
        id="cap-base-stroke"
        x1="7"
        y1="11.5"
        x2="17"
        y2="18"
        gradientUnits="userSpaceOnUse"
      >
        <stop stopColor="#4F46E5" />
        <stop offset="1" stopColor="#7C3AED" />
      </linearGradient>
      <linearGradient
        id="cap-tassel-stroke"
        x1="18"
        y1="9.5"
        x2="19"
        y2="14.7"
        gradientUnits="userSpaceOnUse"
      >
        <stop stopColor="#F59E0B" />
        <stop offset="1" stopColor="#F97316" />
      </linearGradient>
    </defs>
  </svg>
);


const IconNewTutor3 = () => (
  <svg
    width="20"
    height="20"
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className="sidebar-nav-icon"
  >
    {/* Idea / learning lightbulb */}
    <path
      d="M12 3C9.238 3 7 5.239 7 8C7 9.657 7.803 11.125 9.047 12.047C9.856 12.641 10.25 13.46 10.25 14.31V15C10.25 15.966 11.067 16.75 12 16.75C12.933 16.75 13.75 15.966 13.75 15V14.31C13.75 13.46 14.144 12.641 14.953 12.047C16.197 11.125 17 9.657 17 8C17 5.239 14.762 3 12 3Z"
      fill="url(#bulb-fill)"
      stroke="url(#bulb-stroke)"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    {/* Bulb base */}
    <rect
      x="10"
      y="16.75"
      width="4"
      height="2.3"
      rx="0.9"
      fill="url(#base-fill)"
    />
    <path
      d="M10 19.6H14"
      stroke="url(#base-stroke)"
      strokeWidth="1.2"
      strokeLinecap="round"
    />
    {/* Little rays */}
    <path
      d="M12 1.8V3"
      stroke="url(#ray-stroke)"
      strokeWidth="1.2"
      strokeLinecap="round"
    />
    <path
      d="M5.8 5.2L6.7 6.1"
      stroke="url(#ray-stroke)"
      strokeWidth="1.2"
      strokeLinecap="round"
    />
    <path
      d="M18.2 5.2L17.3 6.1"
      stroke="url(#ray-stroke)"
      strokeWidth="1.2"
      strokeLinecap="round"
    />
    <defs>
      <linearGradient
        id="bulb-fill"
        x1="7"
        y1="3"
        x2="17"
        y2="16"
        gradientUnits="userSpaceOnUse"
      >
        <stop stopColor="#FDE68A" stopOpacity="0.85" />
        <stop offset="1" stopColor="#FDBA74" stopOpacity="0.95" />
      </linearGradient>
      <linearGradient
        id="bulb-stroke"
        x1="7"
        y1="3"
        x2="17"
        y2="16"
        gradientUnits="userSpaceOnUse"
      >
        <stop stopColor="#F59E0B" />
        <stop offset="1" stopColor="#EA580C" />
      </linearGradient>
      <linearGradient
        id="base-fill"
        x1="10"
        y1="16.75"
        x2="14"
        y2="19.05"
        gradientUnits="userSpaceOnUse"
      >
        <stop stopColor="#4B5563" />
        <stop offset="1" stopColor="#111827" />
      </linearGradient>
      <linearGradient
        id="base-stroke"
        x1="10"
        y1="19.6"
        x2="14"
        y2="19.6"
        gradientUnits="userSpaceOnUse"
      >
        <stop stopColor="#9CA3AF" />
        <stop offset="1" stopColor="#E5E7EB" />
      </linearGradient>
      <linearGradient
        id="ray-stroke"
        x1="5.8"
        y1="1.8"
        x2="18.2"
        y2="6.1"
        gradientUnits="userSpaceOnUse"
      >
        <stop stopColor="#FBBF24" />
        <stop offset="1" stopColor="#F97316" />
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

function getActiveValoresUnit (pathname) {
  const section = VALORES_SECTIONS.find((s) =>
    s.weeks.some((w) => w.to === pathname)
  );
  return section ? section.unit : null;
}

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
  const [expandedValoresUnit, setExpandedValoresUnit] = useState(1);

  useEffect(() => {
    const active = getActiveValoresUnit(location.pathname);
    if (active !== null) {
      setExpandedValoresUnit(active);
    } else if (location.pathname === '/9/valores') {
      setExpandedValoresUnit(1);
    }
  }, [location.pathname]);

  const handleValoresUnitToggle = (unit) => {
    setExpandedValoresUnit((prev) => (prev === unit ? null : unit));
  };

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
            <span>Ask Your Class Teacher</span>
          </button>
          </Link>     
          <Link to="/answers" className="nav-button-link">
          <button className="nav-button">
            <IconTeacherAnswers />
            <span>Teacher Answers</span>
          </button>
          </Link>       
          <Link to="/9/valores/unidad1/semana1" className="nav-button-link"> 
          <button className="nav-button">
            <IconSubjects />
            <span>Your Subjects:</span>            
          </button>    
          </Link>      
        </nav>

        <Link to="/9/valores/unidad1/semana1" className="nav-button-link">
        <button className={`nav-button nav23`} type="button">
          <IconNewTutor2 />
          <span>
            Ciudadania y Valores
            <br />
            9 grado El Salvador
          </span>
        </button>    
        </Link>        

          {/* <Link to="/subjects/unidad1" className="nav-button-link">
          <button className={`nav-button ${location.pathname === '/subjects/unidad1' ? 'menu2' : ''}`}>
          <p className='subLink33' >
             <IconNewTutor3  /> Ask AI Tutor
          </p>
          </button>
          </Link> */}



          {/* <Link to="/bosques" className="nav-button-link">
          <button className={`nav-button ${location.pathname === '/bosques' ? 'menu2' : ''}`}>
          <p className='subLink33' >
          <IconNewTutor3 /> Clase Bosques  tropicales
          </p>
          </button>
          </Link> <br /> */}

          <div
            className="sidebar-valores-accordion"
            aria-label="Ciudadanía y Valores — unidades y semanas"
          >
            {/* <p className="sidebar-valores-accordion-title">
              Ciudadanía y Valores
            </p> */}
            {/* <Link
              to="/9/valores"
              className={`sidebar-valores-index-link${
                location.pathname === '/9/valores'
                  ? ' sidebar-valores-link-active'
                  : ''
              }`}
            >
              Índice de lecciones
            </Link> */}
            {VALORES_SECTIONS.map((section) => (
              <div key={section.unit} className="sidebar-valores-unit">
                <button
                  type="button"
                  className="sidebar-valores-toggle"
                  aria-expanded={expandedValoresUnit === section.unit}
                  aria-controls={`sidebar-valores-panel-${section.unit}`}
                  id={`sidebar-valores-head-${section.unit}`}
                  onClick={() => handleValoresUnitToggle(section.unit)}
                >
                  <span className="sidebar-valores-unit-badge">
                    {section.unit}
                  </span>
                  <span className="sidebar-valores-unit-label">
                    {section.label}
                  </span>
                  <span className="sidebar-valores-chevron" aria-hidden="true">
                    <svg
                      width="14"
                      height="14"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2.2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M6 9l6 6 6-6" />
                    </svg>
                  </span>
                </button>
                {expandedValoresUnit === section.unit && (
                  <ul
                    className="sidebar-valores-weeks"
                    id={`sidebar-valores-panel-${section.unit}`}
                    role="region"
                    aria-labelledby={`sidebar-valores-head-${section.unit}`}
                  >
                    {section.weeks.map((w) => (
                      <li key={w.to}>
                        <Link
                          to={w.to}
                          className={`sidebar-valores-week-link${
                            location.pathname === w.to
                              ? ' sidebar-valores-link-active'
                              : ''
                          }`}
                        >
                          {w.label}
                        </Link>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            ))}
          </div>





          






        {/* <Link to="/subjects/langchain-docs" className="nav-button-link">
        <button className={`nav-button ${location.pathname === '/subjects/langchain-docs' ? 'menu2' : ''}`}>
           <IconNewTutor /> Warren Buffett <br />  Shareholder Report
          </button>          
          </Link>

          <a href="https://www.berkshirehathaway.com/letters/2023ltr.pdf" target="_blank" className="navButton22  ">
            Report Link
          </a> <br /><br /> */}

          {/* <Link to="/subjects/ciencias1" className="nav-button-link">
          <button className={`nav-button ${location.pathname === '/subjects/ciencias1' ? 'menu2' : ''}`}>
          &nbsp; - Ciencia y Tecnología <br /> &nbsp; &nbsp;  1 año bachillerato El Salvador
          </button>
          
          </Link>
          <a href="https://www.mined.gob.sv/materiales/2026/CIENCIA_Y_TECNOLOGIA/2.%20Libros%20de%20texto/Libro%20de%20texto%201.%C2%B0%20a%C3%B1o%20de%20bachillerato.pdf" target="_blank" className="navButton22  ">
            Book Link
          </a> */}


      </div>
    </div>
  );
}

export default Sidebar;
