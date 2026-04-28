import React from 'react'
import { NavLink } from 'react-router-dom'

const imgIcon = `${process.env.PUBLIC_URL}/burg.svg`

/* Gradient ids prefixed ts- (teacher sidebar) to avoid clashes with student Sidebar */

const IconNewTutor = () => (
	<svg
		width="20"
		height="20"
		viewBox="0 0 24 24"
		fill="none"
		xmlns="http://www.w3.org/2000/svg"
		className="sidebar-nav-icon"
	>
		<path
			d="M12 2L14.5 8.5L21 9L16 13.5L17.5 20L12 17L6.5 20L8 13.5L3 9L9.5 8.5L12 2Z"
			fill="url(#ts-star-gradient)"
			stroke="url(#ts-star-gradient)"
			strokeWidth="1.5"
			strokeLinejoin="round"
		/>
		<defs>
			<linearGradient
				id="ts-star-gradient"
				x1="3"
				y1="2"
				x2="21"
				y2="20"
				gradientUnits="userSpaceOnUse"
			>
				<stop stopColor="#F59E0B" />
				<stop offset="0.55" stopColor="#38BDF8" />
				<stop offset="1" stopColor="#0EA5E9" />
			</linearGradient>
		</defs>
	</svg>
)

const IconAskTeacher = () => (
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
			r="10"
			stroke="url(#ts-chat-stroke)"
			strokeWidth="2"
			fill="url(#ts-chat-fill)"
		/>
		<path
			d="M8 10h8M8 14h5"
			stroke="white"
			strokeWidth="1.8"
			strokeLinecap="round"
		/>
		<defs>
			<linearGradient
				id="ts-chat-stroke"
				x1="2"
				y1="2"
				x2="22"
				y2="22"
				gradientUnits="userSpaceOnUse"
			>
				<stop stopColor="#0284C7" />
				<stop offset="1" stopColor="#38BDF8" />
			</linearGradient>
			<linearGradient
				id="ts-chat-fill"
				x1="2"
				y1="2"
				x2="22"
				y2="22"
				gradientUnits="userSpaceOnUse"
			>
				<stop stopColor="#0369A1" />
				<stop offset="1" stopColor="#0EA5E9" />
			</linearGradient>
		</defs>
	</svg>
)

const IconTeacherAnswers = () => (
	<svg
		width="20"
		height="20"
		viewBox="0 0 24 24"
		fill="none"
		xmlns="http://www.w3.org/2000/svg"
		className="sidebar-nav-icon"
	>
		<rect
			x="2"
			y="4"
			width="20"
			height="14"
			rx="2"
			stroke="url(#ts-video-stroke)"
			strokeWidth="2"
			fill="url(#ts-video-fill)"
		/>
		<circle
			cx="18"
			cy="6"
			r="3"
			fill="url(#ts-video-badge)"
			stroke="white"
			strokeWidth="1"
		/>
		<path d="M10 9l5 3-5 3V9z" fill="white" />
		<defs>
			<linearGradient
				id="ts-video-stroke"
				x1="2"
				y1="4"
				x2="22"
				y2="18"
				gradientUnits="userSpaceOnUse"
			>
				<stop stopColor="#0EA5E9" />
				<stop offset="1" stopColor="#0284C7" />
			</linearGradient>
			<linearGradient
				id="ts-video-fill"
				x1="2"
				y1="4"
				x2="22"
				y2="18"
				gradientUnits="userSpaceOnUse"
			>
				<stop stopColor="#7DD3FC" stopOpacity="0.45" />
				<stop offset="1" stopColor="#38BDF8" stopOpacity="0.55" />
			</linearGradient>
			<linearGradient
				id="ts-video-badge"
				x1="15"
				y1="3"
				x2="21"
				y2="9"
				gradientUnits="userSpaceOnUse"
			>
				<stop stopColor="#38BDF8" />
				<stop offset="1" stopColor="#0284C7" />
			</linearGradient>
		</defs>
	</svg>
)

/* Match student Sidebar book vibe: emerald → cyan/sky (like #06B6D4) */
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
			d="M4 6h16v12H4V6z"
			stroke="url(#ts-book-stroke)"
			strokeWidth="2"
			strokeLinejoin="round"
			fill="url(#ts-book-fill)"
		/>
		<path
			d="M4 6h16M9 10h6M9 14h4"
			stroke="url(#ts-book-stroke)"
			strokeWidth="1.5"
			strokeLinecap="round"
		/>
		<defs>
			<linearGradient
				id="ts-book-stroke"
				x1="4"
				y1="6"
				x2="20"
				y2="18"
				gradientUnits="userSpaceOnUse"
			>
				<stop stopColor="#10B981" />
				<stop offset="0.5" stopColor="#06B6D4" />
				<stop offset="1" stopColor="#38BDF8" />
			</linearGradient>
			<linearGradient
				id="ts-book-fill"
				x1="4"
				y1="6"
				x2="20"
				y2="18"
				gradientUnits="userSpaceOnUse"
			>
				<stop stopColor="#34D399" stopOpacity="0.38" />
				<stop offset="1" stopColor="#7DD3FC" stopOpacity="0.52" />
			</linearGradient>
		</defs>
	</svg>
)

function TeacherSidebar ({ isOpen, toggleSidebar }) {
	const navClass = ({ isActive }) =>
		`sidebar-nav-link${isActive ? ' sidebar-nav-link--active' : ''}`

	return (
		<aside
			className={`sidebar sidebar--teacher ${
				isOpen ? 'sidebar-open' : 'sidebar-closed'
			}`}
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
					<NavLink to="/teachers/newquestions"  className={navClass}>
						<span className="sidebar-nav-link__icon-well" aria-hidden="true">
							<IconNewTutor />
						</span>
						<span className="sidebar-nav-link__label">New Questions</span>
					</NavLink>
					<NavLink to="/teachers/subjects" className={navClass}>
						<span className="sidebar-nav-link__icon-well" aria-hidden="true">
							<IconAskTeacher />
						</span>
						<span className="sidebar-nav-link__label">My  Subjects</span>
					</NavLink>
					<NavLink to="/teachers/students" className={navClass}>
						<span className="sidebar-nav-link__icon-well" aria-hidden="true">
							<IconTeacherAnswers />
						</span>
						<span className="sidebar-nav-link__label">My  Students</span>
					</NavLink>
					<NavLink to="/9/valores/unidad1/semana1" className={navClass}>
						<span className="sidebar-nav-link__icon-well" aria-hidden="true">
							<IconSubjects />
						</span>
						<span className="sidebar-nav-link__label">My  Profile</span>
					</NavLink>
				</nav>
			</div>
		</aside>
	)
}

export default TeacherSidebar
