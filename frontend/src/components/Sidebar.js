import React, { useState, useEffect, useMemo } from 'react'
import { NavLink, Link, useLocation } from 'react-router-dom'
import { useSelector } from 'react-redux'
import { useGetStudentNewAnswersQuery } from '../slices/student/studentAnswersSlice'
import {
  resolveCurrentSubscription,
  canViewQuestions,
} from '../utils/subscriptionAccess'

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
    <path
      d="M12 2.7c4.7 1.35 7.55 2.15 7.55 2.15C19.55 13.4 16.2 18.85 12 21.3 7.8 18.85 4.45 13.4 4.45 4.85 4.45 4.85 7.3 4.05 12 2.7Z"
      fill="url(#valores-fill)"
      stroke="url(#valores-stroke)"
      strokeWidth="1.3"
      strokeLinejoin="round"
    />
    <path
      d="M12 4.15c3.85 1.1 6.15 1.75 6.15 1.75C18.15 12.7 15.45 17.15 12 19.3 8.55 17.15 5.85 12.7 5.85 5.9c0 0 2.3-.65 6.15-1.75Z"
      fill="url(#valores-sheen)"
    />
    <path
      d="M12 16.05c-3.15-2.35-3.7-4.55-2.35-5.85C10.4 9.45 11.25 9.3 12 10.05c.75-.75 1.6-.6 2.35.15 1.35 1.3.8 3.5-2.35 5.85Z"
      fill="white"
    />
    <circle
      cx="16.85"
      cy="6.15"
      r="1.15"
      fill="url(#valores-spark)"
      stroke="white"
      strokeWidth="0.4"
    />
    <defs>
      <linearGradient
        id="valores-fill"
        x1="4.45"
        y1="2.7"
        x2="19.55"
        y2="21.3"
        gradientUnits="userSpaceOnUse"
      >
        <stop stopColor="#FCD34D" />
        <stop offset="1" stopColor="#D97706" />
      </linearGradient>
      <linearGradient
        id="valores-stroke"
        x1="4.45"
        y1="2.7"
        x2="19.55"
        y2="21.3"
        gradientUnits="userSpaceOnUse"
      >
        <stop stopColor="#F59E0B" />
        <stop offset="1" stopColor="#B45309" />
      </linearGradient>
      <linearGradient
        id="valores-sheen"
        x1="8"
        y1="4.2"
        x2="16"
        y2="18"
        gradientUnits="userSpaceOnUse"
      >
        <stop stopColor="white" stopOpacity="0.22" />
        <stop offset="1" stopColor="white" stopOpacity="0" />
      </linearGradient>
      <linearGradient
        id="valores-spark"
        x1="15.7"
        y1="5.1"
        x2="18.1"
        y2="7.4"
        gradientUnits="userSpaceOnUse"
      >
        <stop stopColor="#FEF3C7" />
        <stop offset="1" stopColor="#F59E0B" />
      </linearGradient>
    </defs>
  </svg>
);

const IconMath = () => (
  <svg
    width="20"
    height="20"
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className="sidebar-nav-icon"
  >
    <path
      d="M12 2.6L20.4 7.45v9.1L12 21.4 3.6 16.55v-9.1L12 2.6Z"
      fill="url(#math-fill)"
      stroke="url(#math-stroke)"
      strokeWidth="1.35"
      strokeLinejoin="round"
    />
    <path
      d="M12 4.35L18.7 8.2v7.6L12 19.65 5.3 15.8V8.2L12 4.35Z"
      fill="url(#math-sheen)"
    />
    <path
      d="M7.55 9.55h8.9"
      stroke="white"
      strokeWidth="1.9"
      strokeLinecap="round"
    />
    <path
      d="M10.05 9.55v6.85"
      stroke="white"
      strokeWidth="1.9"
      strokeLinecap="round"
    />
    <path
      d="M14.35 9.55v5.15c0 1.4 1.2 2 2.45 1.4"
      stroke="white"
      strokeWidth="1.9"
      strokeLinecap="round"
    />
    <circle
      cx="17.55"
      cy="6.35"
      r="1.2"
      fill="url(#math-spark)"
      stroke="white"
      strokeWidth="0.45"
    />
    <defs>
      <linearGradient
        id="math-fill"
        x1="3.6"
        y1="2.6"
        x2="20.4"
        y2="21.4"
        gradientUnits="userSpaceOnUse"
      >
        <stop stopColor="#FB7185" />
        <stop offset="1" stopColor="#E11D48" />
      </linearGradient>
      <linearGradient
        id="math-stroke"
        x1="3.6"
        y1="2.6"
        x2="20.4"
        y2="21.4"
        gradientUnits="userSpaceOnUse"
      >
        <stop stopColor="#F43F5E" />
        <stop offset="1" stopColor="#BE123C" />
      </linearGradient>
      <linearGradient
        id="math-sheen"
        x1="8"
        y1="4.5"
        x2="16"
        y2="18"
        gradientUnits="userSpaceOnUse"
      >
        <stop stopColor="white" stopOpacity="0.22" />
        <stop offset="1" stopColor="white" stopOpacity="0" />
      </linearGradient>
      <linearGradient
        id="math-spark"
        x1="16.4"
        y1="5.2"
        x2="18.7"
        y2="7.6"
        gradientUnits="userSpaceOnUse"
      >
        <stop stopColor="#FDE68A" />
        <stop offset="1" stopColor="#F59E0B" />
      </linearGradient>
    </defs>
  </svg>
);

const IconLengua = () => (
  <svg
    width="20"
    height="20"
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className="sidebar-nav-icon"
  >
    <path
      d="M4.1 6.15C6.9 5.1 9.5 5.55 12 7.45V19.7C9.2 17.95 6.55 17.5 4.1 18.5V6.15Z"
      fill="url(#lengua-left)"
      stroke="url(#lengua-stroke)"
      strokeWidth="1.3"
      strokeLinejoin="round"
    />
    <path
      d="M19.9 6.15C17.1 5.1 14.5 5.55 12 7.45V19.7C14.8 17.95 17.45 17.5 19.9 18.5V6.15Z"
      fill="url(#lengua-right)"
      stroke="url(#lengua-stroke)"
      strokeWidth="1.3"
      strokeLinejoin="round"
    />
    <path
      d="M6.15 9.7c1.55-.5 3.15-.3 4.55.7M6.15 12.35c1.55-.5 3.15-.3 4.55.7"
      stroke="white"
      strokeWidth="1.15"
      strokeLinecap="round"
      opacity="0.9"
    />
    <path
      d="M17.85 9.7c-1.55-.5-3.15-.3-4.55.7M17.85 12.35c-1.55-.5-3.15-.3-4.55.7"
      stroke="white"
      strokeWidth="1.15"
      strokeLinecap="round"
      opacity="0.9"
    />
    <path
      d="M12 7.45v8.35l1.4 1.15L12 17.85l-1.4-1.05V7.45"
      fill="url(#lengua-ribbon)"
    />
    <circle
      cx="18.35"
      cy="6.2"
      r="1.15"
      fill="url(#lengua-spark)"
      stroke="white"
      strokeWidth="0.4"
    />
    <defs>
      <linearGradient
        id="lengua-left"
        x1="4.1"
        y1="5.2"
        x2="12"
        y2="19.7"
        gradientUnits="userSpaceOnUse"
      >
        <stop stopColor="#7DD3FC" />
        <stop offset="1" stopColor="#2563EB" />
      </linearGradient>
      <linearGradient
        id="lengua-right"
        x1="19.9"
        y1="5.2"
        x2="12"
        y2="19.7"
        gradientUnits="userSpaceOnUse"
      >
        <stop stopColor="#38BDF8" />
        <stop offset="1" stopColor="#1D4ED8" />
      </linearGradient>
      <linearGradient
        id="lengua-stroke"
        x1="4"
        y1="5"
        x2="20"
        y2="20"
        gradientUnits="userSpaceOnUse"
      >
        <stop stopColor="#0EA5E9" />
        <stop offset="1" stopColor="#1E40AF" />
      </linearGradient>
      <linearGradient
        id="lengua-ribbon"
        x1="10.6"
        y1="7.45"
        x2="13.4"
        y2="18.2"
        gradientUnits="userSpaceOnUse"
      >
        <stop stopColor="#FDE68A" />
        <stop offset="1" stopColor="#F59E0B" />
      </linearGradient>
      <linearGradient
        id="lengua-spark"
        x1="17.2"
        y1="5.1"
        x2="19.5"
        y2="7.4"
        gradientUnits="userSpaceOnUse"
      >
        <stop stopColor="#FDE68A" />
        <stop offset="1" stopColor="#F59E0B" />
      </linearGradient>
    </defs>
  </svg>
);

const IconCiencias = () => (
  <svg
    width="20"
    height="20"
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className="sidebar-nav-icon"
  >
    <circle
      cx="12"
      cy="12"
      r="9.15"
      fill="url(#ciencias-fill)"
      stroke="url(#ciencias-stroke)"
      strokeWidth="1.3"
    />
    <circle
      cx="12"
      cy="12"
      r="7.6"
      fill="url(#ciencias-sheen)"
    />
    <ellipse
      cx="12"
      cy="12"
      rx="7.4"
      ry="3.05"
      stroke="white"
      strokeWidth="1.35"
      transform="rotate(-38 12 12)"
    />
    <ellipse
      cx="12"
      cy="12"
      rx="7.4"
      ry="3.05"
      stroke="white"
      strokeWidth="1.35"
      transform="rotate(48 12 12)"
    />
    <circle
      cx="12"
      cy="12"
      r="2.2"
      fill="url(#ciencias-nucleus)"
      stroke="white"
      strokeWidth="0.45"
    />
    <circle
      cx="18.35"
      cy="9.55"
      r="1.15"
      fill="white"
    />
    <circle
      cx="6.35"
      cy="15.15"
      r="1.05"
      fill="white"
    />
    <circle
      cx="17.7"
      cy="16.85"
      r="1.1"
      fill="url(#ciencias-spark)"
      stroke="white"
      strokeWidth="0.35"
    />
    <defs>
      <linearGradient
        id="ciencias-fill"
        x1="3"
        y1="3"
        x2="21"
        y2="21"
        gradientUnits="userSpaceOnUse"
      >
        <stop stopColor="#2DD4BF" />
        <stop offset="1" stopColor="#059669" />
      </linearGradient>
      <linearGradient
        id="ciencias-stroke"
        x1="3"
        y1="3"
        x2="21"
        y2="21"
        gradientUnits="userSpaceOnUse"
      >
        <stop stopColor="#14B8A6" />
        <stop offset="1" stopColor="#047857" />
      </linearGradient>
      <linearGradient
        id="ciencias-sheen"
        x1="8"
        y1="5"
        x2="16"
        y2="18"
        gradientUnits="userSpaceOnUse"
      >
        <stop stopColor="white" stopOpacity="0.2" />
        <stop offset="1" stopColor="white" stopOpacity="0" />
      </linearGradient>
      <linearGradient
        id="ciencias-nucleus"
        x1="10"
        y1="10"
        x2="14.4"
        y2="14.4"
        gradientUnits="userSpaceOnUse"
      >
        <stop stopColor="#FDE68A" />
        <stop offset="1" stopColor="#F59E0B" />
      </linearGradient>
      <linearGradient
        id="ciencias-spark"
        x1="16.6"
        y1="15.8"
        x2="18.9"
        y2="18"
        gradientUnits="userSpaceOnUse"
      >
        <stop stopColor="#FDE68A" />
        <stop offset="1" stopColor="#F59E0B" />
      </linearGradient>
    </defs>
  </svg>
);

const IconAskTeacher = () => (
  <svg
    width="20"
    height="20"
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className="sidebar-nav-icon"
  >
    <path
      d="M5.1 6.2C5.1 4.85 6.2 3.75 7.55 3.75h8.9c1.35 0 2.45 1.1 2.45 2.45v6.7c0 1.35-1.1 2.45-2.45 2.45h-3.15l-4.55 3.4v-3.4H7.55C6.2 15.35 5.1 14.25 5.1 12.9V6.2Z"
      fill="url(#ask-fill)"
      stroke="url(#ask-stroke)"
      strokeWidth="1.3"
      strokeLinejoin="round"
    />
    <path
      d="M6.35 5.35h9.6c.85 0 1.55.7 1.55 1.55v5.35c0 .85-.7 1.55-1.55 1.55h-8.05c-.85 0-1.55-.7-1.55-1.55V6.9c0-.85.7-1.55 1.55-1.55Z"
      fill="url(#ask-sheen)"
    />
    <path
      d="M10.55 7.15c.55-.45 1.25-.55 1.85-.2.7.4.95 1.2.55 1.85-.25.4-.65.65-1.15.85-.45.2-.7.55-.7 1.05"
      stroke="white"
      strokeWidth="1.7"
      strokeLinecap="round"
    />
    <circle
      cx="11.1"
      cy="12.55"
      r="0.95"
      fill="white"
    />
    <circle
      cx="17.65"
      cy="5.55"
      r="1.15"
      fill="url(#ask-spark)"
      stroke="white"
      strokeWidth="0.4"
    />
    <defs>
      <linearGradient
        id="ask-fill"
        x1="5.1"
        y1="3.75"
        x2="18.9"
        y2="18.6"
        gradientUnits="userSpaceOnUse"
      >
        <stop stopColor="#67E8F9" />
        <stop offset="1" stopColor="#0284C7" />
      </linearGradient>
      <linearGradient
        id="ask-stroke"
        x1="5.1"
        y1="3.75"
        x2="18.9"
        y2="18.6"
        gradientUnits="userSpaceOnUse"
      >
        <stop stopColor="#22D3EE" />
        <stop offset="1" stopColor="#075985" />
      </linearGradient>
      <linearGradient
        id="ask-sheen"
        x1="8"
        y1="5.2"
        x2="15"
        y2="14"
        gradientUnits="userSpaceOnUse"
      >
        <stop stopColor="white" stopOpacity="0.2" />
        <stop offset="1" stopColor="white" stopOpacity="0" />
      </linearGradient>
      <linearGradient
        id="ask-spark"
        x1="16.5"
        y1="4.4"
        x2="18.9"
        y2="6.8"
        gradientUnits="userSpaceOnUse"
      >
        <stop stopColor="#FDE68A" />
        <stop offset="1" stopColor="#F59E0B" />
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
  <svg
    width="20"
    height="20"
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className="sidebar-nav-icon"
  >
    <path
      d="M9.2 4.55h8.6c.7 0 1.25.55 1.25 1.25v10.9c0 .7-.55 1.25-1.25 1.25H9.2V4.55Z"
      fill="url(#subjects-back)"
      stroke="url(#subjects-stroke)"
      strokeWidth="1.15"
      strokeLinejoin="round"
      transform="rotate(14 14.5 11.2)"
    />
    <path
      d="M4.35 6.15h10.15c.75 0 1.35.6 1.35 1.35v11.05c0 .75-.6 1.35-1.35 1.35H4.35V6.15Z"
      fill="url(#subjects-front)"
      stroke="url(#subjects-stroke)"
      strokeWidth="1.2"
      strokeLinejoin="round"
    />
    <path
      d="M4.35 6.15h2.35v13.75H4.35V6.15Z"
      fill="url(#subjects-spine)"
    />
    <path
      d="M9.15 10.35h4.85M9.15 13.2h3.7"
      stroke="white"
      strokeWidth="1.25"
      strokeLinecap="round"
    />
    <circle
      cx="17.55"
      cy="6.2"
      r="1.15"
      fill="url(#subjects-spark)"
      stroke="white"
      strokeWidth="0.4"
    />
    <defs>
      <linearGradient
        id="subjects-back"
        x1="9"
        y1="4.5"
        x2="19.2"
        y2="18"
        gradientUnits="userSpaceOnUse"
      >
        <stop stopColor="#E879F9" />
        <stop offset="1" stopColor="#A21CAF" />
      </linearGradient>
      <linearGradient
        id="subjects-front"
        x1="4.35"
        y1="6.15"
        x2="15.85"
        y2="19.9"
        gradientUnits="userSpaceOnUse"
      >
        <stop stopColor="#D946EF" />
        <stop offset="1" stopColor="#7E22CE" />
      </linearGradient>
      <linearGradient
        id="subjects-spine"
        x1="4.35"
        y1="6.15"
        x2="6.7"
        y2="19.9"
        gradientUnits="userSpaceOnUse"
      >
        <stop stopColor="#F0ABFC" />
        <stop offset="1" stopColor="#A21CAF" />
      </linearGradient>
      <linearGradient
        id="subjects-stroke"
        x1="4.35"
        y1="4.5"
        x2="19.2"
        y2="20"
        gradientUnits="userSpaceOnUse"
      >
        <stop stopColor="#C026D3" />
        <stop offset="1" stopColor="#6B21A8" />
      </linearGradient>
      <linearGradient
        id="subjects-spark"
        x1="16.4"
        y1="5.1"
        x2="18.8"
        y2="7.4"
        gradientUnits="userSpaceOnUse"
      >
        <stop stopColor="#FDE68A" />
        <stop offset="1" stopColor="#F59E0B" />
      </linearGradient>
    </defs>
  </svg>
);

function answerHasVideo (answer) {
  return answer?.mediaId != null && String(answer.mediaId).trim() !== ''
}

const VALORES_SEMANA1_PATH =
  '/students/lessonpage/6a3979882d6dcf3adc9b6ef4'

const MATEMATICAS_SEMANA1_PATH =
  '/students/lessonpage/6a8f4c617a61127e0b6ead7f'

const LENGUA_SEMANA1_PATH =
  '/students/lessonpage/6a8c6c697a61127e0b6a0d96'

const CIENCIAS_SEMANA1_PATH =
  '/students/lessonpage/6a8cb7c77a61127e0b6acae1'

const LAPTOP_SIDEBAR_HOVER_MIN = 769
const LAPTOP_SIDEBAR_HOVER_MAX = 1449

function canExpandSidebarOnHover () {
  const width = window.innerWidth
  return width >= LAPTOP_SIDEBAR_HOVER_MIN && width <= LAPTOP_SIDEBAR_HOVER_MAX
}

function Sidebar ({ isOpen, toggleSidebar }) {
  const location = useLocation()
  const { studentInfo } = useSelector((state) => state.authStudent)
  const studentId = studentInfo?._id ? String(studentInfo._id) : null

  const canViewNewAnswers = canViewQuestions(
    resolveCurrentSubscription(studentInfo?.subscriptions),
  )

  const { data: studentNewAnswers = [] } = useGetStudentNewAnswersQuery(
    studentId,
    { skip: !studentId || !canViewNewAnswers },
  )

  const newAnswersCount = useMemo(
    () =>
      Array.isArray(studentNewAnswers)
        ? studentNewAnswers.filter(answerHasVideo).length
        : 0,
    [studentNewAnswers],
  )

  const [isValoresAccordionOpen, setIsValoresAccordionOpen] = useState(false)
  const [isMatematicasAccordionOpen, setIsMatematicasAccordionOpen] =
    useState(false)
  const [isLenguaAccordionOpen, setIsLenguaAccordionOpen] = useState(false)
  const [isCienciasAccordionOpen, setIsCienciasAccordionOpen] = useState(false)
  const [isHoverExpanded, setIsHoverExpanded] = useState(false)

  useEffect(() => {
    if (isOpen) {
      setIsHoverExpanded(false)
    }
  }, [isOpen])

  useEffect(() => {
    const handleResize = () => {
      if (!canExpandSidebarOnHover()) {
        setIsHoverExpanded(false)
      }
    }

    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  const handleSidebarMouseEnter = () => {
    if (!isOpen && canExpandSidebarOnHover()) {
      setIsHoverExpanded(true)
    }
  }

  const handleSidebarMouseLeave = () => {
    setIsHoverExpanded(false)
  }

  const handleValoresAccordionToggle = () => {
    setIsValoresAccordionOpen((prev) => !prev)
  }

  const handleMatematicasAccordionToggle = () => {
    setIsMatematicasAccordionOpen((prev) => !prev)
  }

  const handleLenguaAccordionToggle = () => {
    setIsLenguaAccordionOpen((prev) => !prev)
  }

  const handleCienciasAccordionToggle = () => {
    setIsCienciasAccordionOpen((prev) => !prev)
  }

  const isStudentProfileSection =
    location.pathname === '/students/profile'
    || location.pathname.startsWith('/students/profile/')

  const aiTutorNavClass = ({ isActive }) =>
    `sidebar-nav-link${
      isActive || isStudentProfileSection ? ' sidebar-nav-link--active' : ''
    }`

  const isAskTeacherRecording =
    location.pathname === '/studentscreen' ||
    location.pathname === '/studentcamera'

  /** Ask flow: pick subject, compose question, chat, or record question video */
  const isAskTeacherFlow =
    /^\/students\/askteacher\/?$/.test(location.pathname)
    || /^\/students\/asknewquestion\/?$/.test(location.pathname)
    || /^\/students\/ask\/[^/]+\/?$/.test(location.pathname)
    || /^\/students\/recordscreen\/[^/]+\/?$/.test(location.pathname)
    || /^\/students\/recordcamera\/[^/]+\/?$/.test(location.pathname)
    || location.pathname.startsWith('/students/previousquestions')
    || location.pathname.startsWith('/students/watchquestion')

  const isNewAnswersSection =
    location.pathname === '/students/newanswers' ||
    location.pathname.startsWith('/students/watchanswer')

  const askTeacherNavClass = ({ isActive }) =>
    `sidebar-nav-link${
      isActive
      || isAskTeacherRecording
      || isAskTeacherFlow
        ? ' sidebar-nav-link--active'
        : ''
    }`

  const newAnswersNavClass = ({ isActive }) =>
    `sidebar-nav-link${
      isActive || isNewAnswersSection ? ' sidebar-nav-link--active' : ''
    }`

  const isStudentSubjectsSection =
    location.pathname.startsWith('/students/courses/')
    || location.pathname.startsWith('/students/watchcourse/')
    || location.pathname.startsWith('/students/viewbook/')

  const subjectsNavClass = ({ isActive }) =>
    `sidebar-nav-link${
      isActive || isStudentSubjectsSection ? ' sidebar-nav-link--active' : ''
    }`

  const isSidebarExpanded = isOpen || isHoverExpanded

  return (
    <div
      className={`sidebar-slot${
        isOpen ? ' sidebar-slot--open' : ' sidebar-slot--closed'
      }${isHoverExpanded ? ' sidebar-slot--hover-expanded' : ''}`}
    >
      <aside
        className={`sidebar ${isOpen ? 'sidebar-open' : 'sidebar-closed'}${
          isHoverExpanded ? ' sidebar-hover-expanded' : ''
        }`}
        aria-label="Main navigation"
        onMouseEnter={handleSidebarMouseEnter}
        onMouseLeave={handleSidebarMouseLeave}
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
          <NavLink to="/" end className={aiTutorNavClass}>
            <span className="sidebar-nav-link__icon-well" aria-hidden="true">
              <IconNewTutor />
            </span>
            <span className="sidebar-nav-link__label">AI Tutor</span>
          </NavLink>
          <NavLink to="/students/newanswers" className={newAnswersNavClass}>
            <span className="sidebar-nav-link__icon-well" aria-hidden="true">
              <IconTeacherAnswers />
            </span>
            <span className="sidebar-nav-link__label-wrap">
              <span className="sidebar-nav-link__label">
                Respuestas<br />de profesores
              </span>
              {newAnswersCount > 0 ? (
                <span
                  className="sidebar-new-answers-badge"
                  aria-hidden="true"
                >
                  {newAnswersCount > 99 ? '99+' : String(newAnswersCount)}
                </span>
              ) : null}
            </span>
          </NavLink>
          <NavLink to="/students/askteacher" className={askTeacherNavClass}>
            <span className="sidebar-nav-link__icon-well" aria-hidden="true">
              <IconAskTeacher />
            </span>
            <span className="sidebar-nav-link__label">
              Preguntale a <br /> tu profesor
            </span>
          </NavLink>
          
          <NavLink to="/students/mysubjects" className={subjectsNavClass}>
            <span className="sidebar-nav-link__icon-well" aria-hidden="true">
              <IconSubjects />
            </span>
            <span className="sidebar-nav-link__label">
              Tus materias
            </span>
          </NavLink>
        </nav>

        <div className="sidebar-valores-hub-block">
          <div className="sidebar-valores-hub-row">
            <NavLink
              to={VALORES_SEMANA1_PATH}
              className={({ isActive }) =>
                `sidebar-nav-link sidebar-nav-link--valores-hub${isActive
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
              </span>
            </NavLink>
            {isSidebarExpanded ? (
            <button
              type="button"
              className={`sidebar-valores-hub-expand${
                isValoresAccordionOpen
                  ? ' sidebar-valores-hub-expand--open'
                  : ''
              }`}
              aria-expanded={isValoresAccordionOpen}
              aria-controls="sidebar-valores-accordion"
              id="sidebar-valores-hub-expand"
              onClick={handleValoresAccordionToggle}
              aria-label={
                isValoresAccordionOpen
                  ? 'Hide Ciudadanía y Valores units and weeks'
                  : 'Show Ciudadanía y Valores units and weeks'
              }
              title={
                isValoresAccordionOpen
                  ? 'Hide units and weeks'
                  : 'Show units and weeks'
              }
            >
              <span className="sidebar-valores-hub-expand__icon" aria-hidden="true">
                <svg
                  width="18"
                  height="18"
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
            ) : null}
          </div>

          <div
            className="sidebar-valores-accordion"
            id="sidebar-valores-accordion"
            role="region"
            aria-labelledby="sidebar-valores-hub-expand"
            aria-label="Ciudadanía y Valores — semanas"
            hidden={!isValoresAccordionOpen}
          >
            <div className="sidebar-valores-unit">
              <ul className="sidebar-valores-weeks sidebar-valores-weeks--solo">
                <li>
                  <Link
                    to={VALORES_SEMANA1_PATH}
                    className={`sidebar-valores-week-link${
                      location.pathname === VALORES_SEMANA1_PATH
                        ? ' sidebar-valores-link-active'
                        : ''
                    }`}
                  >
                    Semana 1
                  </Link>
                </li>
              </ul>
            </div>
          </div>
        </div>

        <div className="sidebar-valores-hub-block">
          <div className="sidebar-valores-hub-row">
            <NavLink
              to={MATEMATICAS_SEMANA1_PATH}
              className={({ isActive }) =>
                `sidebar-nav-link sidebar-nav-link--valores-hub${isActive
                  ? ' sidebar-nav-link--active sidebar-nav-link--subject'
                  : ''
                }`
              }
            >
              <span className="sidebar-nav-link__icon-well" aria-hidden="true">
                <IconMath />
              </span>
              <span className="sidebar-nav-link__body">
                <span className="sidebar-nav-link__title">
                  Matematicas
                </span>
              </span>
            </NavLink>
            {isSidebarExpanded ? (
            <button
              type="button"
              className={`sidebar-valores-hub-expand${
                isMatematicasAccordionOpen
                  ? ' sidebar-valores-hub-expand--open'
                  : ''
              }`}
              aria-expanded={isMatematicasAccordionOpen}
              aria-controls="sidebar-matematicas-accordion"
              id="sidebar-matematicas-hub-expand"
              onClick={handleMatematicasAccordionToggle}
              aria-label={
                isMatematicasAccordionOpen
                  ? 'Hide Matemáticas weeks'
                  : 'Show Matemáticas weeks'
              }
              title={
                isMatematicasAccordionOpen
                  ? 'Hide weeks'
                  : 'Show weeks'
              }
            >
              <span className="sidebar-valores-hub-expand__icon" aria-hidden="true">
                <svg
                  width="18"
                  height="18"
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
            ) : null}
          </div>

          <div
            className="sidebar-valores-accordion"
            id="sidebar-matematicas-accordion"
            role="region"
            aria-labelledby="sidebar-matematicas-hub-expand"
            aria-label="Matemáticas — semanas"
            hidden={!isMatematicasAccordionOpen}
          >
            <div className="sidebar-valores-unit">
              <ul className="sidebar-valores-weeks sidebar-valores-weeks--solo">
                <li>
                  <Link
                    to={MATEMATICAS_SEMANA1_PATH}
                    className={`sidebar-valores-week-link${
                      location.pathname === MATEMATICAS_SEMANA1_PATH
                        ? ' sidebar-valores-link-active'
                        : ''
                    }`}
                  >
                    Semana 1
                  </Link>
                </li>
              </ul>
            </div>
          </div>
        </div>

        <div className="sidebar-valores-hub-block">
          <div className="sidebar-valores-hub-row">
            <NavLink
              to={LENGUA_SEMANA1_PATH}
              className={({ isActive }) =>
                `sidebar-nav-link sidebar-nav-link--valores-hub${isActive
                  ? ' sidebar-nav-link--active sidebar-nav-link--subject'
                  : ''
                }`
              }
            >
              <span className="sidebar-nav-link__icon-well" aria-hidden="true">
                <IconLengua />
              </span>
              <span className="sidebar-nav-link__body">
                <span className="sidebar-nav-link__title">
                  Lengua y Literatura
                </span>
              </span>
            </NavLink>
            {isSidebarExpanded ? (
            <button
              type="button"
              className={`sidebar-valores-hub-expand${
                isLenguaAccordionOpen
                  ? ' sidebar-valores-hub-expand--open'
                  : ''
              }`}
              aria-expanded={isLenguaAccordionOpen}
              aria-controls="sidebar-lengua-accordion"
              id="sidebar-lengua-hub-expand"
              onClick={handleLenguaAccordionToggle}
              aria-label={
                isLenguaAccordionOpen
                  ? 'Hide Lengua y Literatura weeks'
                  : 'Show Lengua y Literatura weeks'
              }
              title={
                isLenguaAccordionOpen
                  ? 'Hide weeks'
                  : 'Show weeks'
              }
            >
              <span className="sidebar-valores-hub-expand__icon" aria-hidden="true">
                <svg
                  width="18"
                  height="18"
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
            ) : null}
          </div>

          <div
            className="sidebar-valores-accordion"
            id="sidebar-lengua-accordion"
            role="region"
            aria-labelledby="sidebar-lengua-hub-expand"
            aria-label="Lengua y Literatura — semanas"
            hidden={!isLenguaAccordionOpen}
          >
            <div className="sidebar-valores-unit">
              <ul className="sidebar-valores-weeks sidebar-valores-weeks--solo">
                <li>
                  <Link
                    to={LENGUA_SEMANA1_PATH}
                    className={`sidebar-valores-week-link${
                      location.pathname === LENGUA_SEMANA1_PATH
                        ? ' sidebar-valores-link-active'
                        : ''
                    }`}
                  >
                    Semana 1
                  </Link>
                </li>
              </ul>
            </div>
          </div>
        </div>

        <div className="sidebar-valores-hub-block">
          <div className="sidebar-valores-hub-row">
            <NavLink
              to={CIENCIAS_SEMANA1_PATH}
              className={({ isActive }) =>
                `sidebar-nav-link sidebar-nav-link--valores-hub${isActive
                  ? ' sidebar-nav-link--active sidebar-nav-link--subject'
                  : ''
                }`
              }
            >
              <span className="sidebar-nav-link__icon-well" aria-hidden="true">
                <IconCiencias />
              </span>
              <span className="sidebar-nav-link__body">
                <span className="sidebar-nav-link__title">
                  Ciencias
                </span>
              </span>
            </NavLink>
            {isSidebarExpanded ? (
            <button
              type="button"
              className={`sidebar-valores-hub-expand${
                isCienciasAccordionOpen
                  ? ' sidebar-valores-hub-expand--open'
                  : ''
              }`}
              aria-expanded={isCienciasAccordionOpen}
              aria-controls="sidebar-ciencias-accordion"
              id="sidebar-ciencias-hub-expand"
              onClick={handleCienciasAccordionToggle}
              aria-label={
                isCienciasAccordionOpen
                  ? 'Hide Ciencias weeks'
                  : 'Show Ciencias weeks'
              }
              title={
                isCienciasAccordionOpen
                  ? 'Hide weeks'
                  : 'Show weeks'
              }
            >
              <span className="sidebar-valores-hub-expand__icon" aria-hidden="true">
                <svg
                  width="18"
                  height="18"
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
            ) : null}
          </div>

          <div
            className="sidebar-valores-accordion"
            id="sidebar-ciencias-accordion"
            role="region"
            aria-labelledby="sidebar-ciencias-hub-expand"
            aria-label="Ciencias — semanas"
            hidden={!isCienciasAccordionOpen}
          >
            <div className="sidebar-valores-unit">
              <ul className="sidebar-valores-weeks sidebar-valores-weeks--solo">
                <li>
                  <Link
                    to={CIENCIAS_SEMANA1_PATH}
                    className={`sidebar-valores-week-link${
                      location.pathname === CIENCIAS_SEMANA1_PATH
                        ? ' sidebar-valores-link-active'
                        : ''
                    }`}
                  >
                    Semana 1
                  </Link>
                </li>
              </ul>
            </div>
          </div>
        </div>

      </div>
    </aside>
    </div>
  )
}

export default Sidebar;
