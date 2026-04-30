import React, { useState, useEffect } from 'react'
import { NavLink, Link, useLocation } from 'react-router-dom'
import { VALORES_SECTIONS } from '../screens/9/valores/valoresNavData'

const imgIcon = `${process.env.PUBLIC_URL}/burg.svg`

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
  const location = useLocation()
  const [expandedValoresUnit, setExpandedValoresUnit] = useState(1)

  useEffect(() => {
    const active = getActiveValoresUnit(location.pathname)
    if (active !== null) {
      setExpandedValoresUnit(active)
    } else if (location.pathname === '/9/valores') {
      setExpandedValoresUnit(1)
    }
  }, [location.pathname])

  const handleValoresUnitToggle = (unit) => {
    setExpandedValoresUnit((prev) => (prev === unit ? null : unit))
  }

  const navClass = ({ isActive }) =>
    `sidebar-nav-link${isActive ? ' sidebar-nav-link--active' : ''}`

  const isAskTeacherRecording =
    location.pathname === '/studentscreen' ||
    location.pathname === '/studentcamera'

  const askTeacherNavClass = ({ isActive }) =>
    `sidebar-nav-link${
      isActive || isAskTeacherRecording ? ' sidebar-nav-link--active' : ''
    }`

  return (
    <aside
      className={`sidebar ${isOpen ? 'sidebar-open' : 'sidebar-closed'}`}
      aria-label="Main navigation"
    >
      <div className="sidebar-header">
        <button
          type="button"
          className="menu-button"
          onClick={toggleSidebar}
          aria-expanded={isOpen}
          aria-label={isOpen ? 'Collapse sidebar' : 'Expand sidebar'}
        >
          <img src={imgIcon} alt="" className="icon" />
        </button>
      </div>

      <div className="sidebar-content">
        <nav className="navigation" aria-label="Primary">
          <NavLink to="/" end className={navClass}>
            <span className="sidebar-nav-link__icon-well" aria-hidden="true">
              <IconNewTutor />
            </span>
            <span className="sidebar-nav-link__label">AI Tutor</span>
          </NavLink>
          <NavLink to="/ask" className={askTeacherNavClass}>
            <span className="sidebar-nav-link__icon-well" aria-hidden="true">
              <IconAskTeacher />
            </span>
            <span className="sidebar-nav-link__label">
              Ask Your Class Teacher
            </span>
          </NavLink>
          <NavLink to="/answers" className={navClass}>
            <span className="sidebar-nav-link__icon-well" aria-hidden="true">
              <IconTeacherAnswers />
            </span>
            <span className="sidebar-nav-link__label">Teacher Answers</span>
          </NavLink>
          <NavLink
            to="/students/mysubjects"
            className={navClass}
          >
            <span className="sidebar-nav-link__icon-well" aria-hidden="true">
              <IconSubjects />
            </span>
            <span className="sidebar-nav-link__label">Your Subjects</span>
          </NavLink>
        </nav>

        <NavLink
          to="/9/valores/unidad1/semana1"
          className={({ isActive }) =>
            `sidebar-nav-link sidebar-nav-link--valores-hub${
              isActive
                ? ' sidebar-nav-link--active sidebar-nav-link--subject'
                : ''
            }`
          }
        >
          <span className="sidebar-nav-link__icon-well" aria-hidden="true">
            <IconNewTutor2 />
          </span>
          <span className="sidebar-nav-link__body">
            <span className="sidebar-nav-link__title">
              Ciudadania y Valores
            </span>
            <span className="sidebar-nav-link__meta">
              9 grado El Salvador
            </span>
          </span>
        </NavLink>

        <div
          className="sidebar-valores-accordion"
          aria-label="Ciudadanía y Valores — unidades y semanas"
        >
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

      </div>
    </aside>
  )
}

export default Sidebar;
