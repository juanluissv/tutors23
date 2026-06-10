import React from 'react'
import { useSelector } from 'react-redux'
import { NavLink, useLocation } from 'react-router-dom'

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

/* Subscription plans: violet → fuchsia → amber (premium tier stack) */
const IconPlans = () => (
	<svg
		width="20"
		height="20"
		viewBox="0 0 24 24"
		fill="none"
		xmlns="http://www.w3.org/2000/svg"
		className="sidebar-nav-icon"
	>
		<rect
			x="5"
			y="3"
			width="14"
			height="16"
			rx="2.5"
			stroke="url(#ts-plan-back-stroke)"
			strokeWidth="1.6"
			fill="url(#ts-plan-back-fill)"
			transform="rotate(-6 12 11)"
		/>
		<rect
			x="4"
			y="5"
			width="14"
			height="16"
			rx="2.5"
			stroke="url(#ts-plan-mid-stroke)"
			strokeWidth="1.6"
			fill="url(#ts-plan-mid-fill)"
			transform="rotate(3 11 13)"
		/>
		<rect
			x="3"
			y="7"
			width="14"
			height="16"
			rx="2.5"
			stroke="url(#ts-plan-front-stroke)"
			strokeWidth="2"
			fill="url(#ts-plan-front-fill)"
		/>
		<path
			d="M7 12h8M7 15.5h5.5"
			stroke="white"
			strokeWidth="1.6"
			strokeLinecap="round"
		/>
		<circle
			cx="16.5"
			cy="10"
			r="3.25"
			fill="url(#ts-plan-badge)"
			stroke="white"
			strokeWidth="1.2"
		/>
		<path
			d="M15.2 10.2l.9.9 1.9-1.9"
			stroke="white"
			strokeWidth="1.35"
			strokeLinecap="round"
			strokeLinejoin="round"
		/>
		<defs>
			<linearGradient
				id="ts-plan-back-stroke"
				x1="5"
				y1="3"
				x2="19"
				y2="19"
				gradientUnits="userSpaceOnUse"
			>
				<stop stopColor="#A78BFA" />
				<stop offset="1" stopColor="#C084FC" />
			</linearGradient>
			<linearGradient
				id="ts-plan-back-fill"
				x1="5"
				y1="3"
				x2="19"
				y2="19"
				gradientUnits="userSpaceOnUse"
			>
				<stop stopColor="#8B5CF6" stopOpacity="0.22" />
				<stop offset="1" stopColor="#D946EF" stopOpacity="0.28" />
			</linearGradient>
			<linearGradient
				id="ts-plan-mid-stroke"
				x1="4"
				y1="5"
				x2="18"
				y2="21"
				gradientUnits="userSpaceOnUse"
			>
				<stop stopColor="#C084FC" />
				<stop offset="1" stopColor="#E879F9" />
			</linearGradient>
			<linearGradient
				id="ts-plan-mid-fill"
				x1="4"
				y1="5"
				x2="18"
				y2="21"
				gradientUnits="userSpaceOnUse"
			>
				<stop stopColor="#A855F7" stopOpacity="0.32" />
				<stop offset="1" stopColor="#F472B6" stopOpacity="0.36" />
			</linearGradient>
			<linearGradient
				id="ts-plan-front-stroke"
				x1="3"
				y1="7"
				x2="17"
				y2="23"
				gradientUnits="userSpaceOnUse"
			>
				<stop stopColor="#8B5CF6" />
				<stop offset="0.45" stopColor="#D946EF" />
				<stop offset="1" stopColor="#F59E0B" />
			</linearGradient>
			<linearGradient
				id="ts-plan-front-fill"
				x1="3"
				y1="7"
				x2="17"
				y2="23"
				gradientUnits="userSpaceOnUse"
			>
				<stop stopColor="#A78BFA" stopOpacity="0.55" />
				<stop offset="0.5" stopColor="#E879F9" stopOpacity="0.5" />
				<stop offset="1" stopColor="#FBBF24" stopOpacity="0.45" />
			</linearGradient>
			<linearGradient
				id="ts-plan-badge"
				x1="13"
				y1="7"
				x2="20"
				y2="13"
				gradientUnits="userSpaceOnUse"
			>
				<stop stopColor="#F59E0B" />
				<stop offset="1" stopColor="#F97316" />
			</linearGradient>
		</defs>
	</svg>
)

/* Add teacher: warm rose → violet person with amber plus badge */
const IconAddStudent = () => (
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
			stroke="url(#ts-add-student-ring)"
			strokeWidth="1.8"
			fill="url(#ts-add-student-bg)"
		/>
		<circle
			cx="12"
			cy="9"
			r="3.25"
			fill="white"
			fillOpacity="0.95"
		/>
		<path
			d="M6.5 19.5c.85-2.85 3.05-4.75 5.5-4.75s4.65 1.9 5.5 4.75"
			stroke="white"
			strokeWidth="1.85"
			strokeLinecap="round"
		/>
		<circle
			cx="17.25"
			cy="17.25"
			r="3.75"
			fill="url(#ts-add-student-badge)"
			stroke="white"
			strokeWidth="1.2"
		/>
		<path
			d="M17.25 15.5v3.5M15.5 17.25h3.5"
			stroke="white"
			strokeWidth="1.5"
			strokeLinecap="round"
		/>
		<defs>
			<linearGradient
				id="ts-add-student-ring"
				x1="2"
				y1="2"
				x2="22"
				y2="22"
				gradientUnits="userSpaceOnUse"
			>
				<stop stopColor="#0EA5E9" />
				<stop offset="1" stopColor="#06B6D4" />
			</linearGradient>
			<linearGradient
				id="ts-add-student-bg"
				x1="2"
				y1="2"
				x2="22"
				y2="22"
				gradientUnits="userSpaceOnUse"
			>
				<stop stopColor="#7DD3FC" stopOpacity="0.5" />
				<stop offset="1" stopColor="#22D3EE" stopOpacity="0.55" />
			</linearGradient>
			<linearGradient
				id="ts-add-student-badge"
				x1="14"
				y1="14"
				x2="20.5"
				y2="20.5"
				gradientUnits="userSpaceOnUse"
			>
				<stop stopColor="#38BDF8" />
				<stop offset="1" stopColor="#0891B2" />
			</linearGradient>
		</defs>
	</svg>
)

const IconAddTeacher = () => (
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
			stroke="url(#ts-add-teacher-ring)"
			strokeWidth="1.8"
			fill="url(#ts-add-teacher-bg)"
		/>
		<circle
			cx="12"
			cy="9"
			r="3.25"
			fill="white"
			fillOpacity="0.95"
		/>
		<path
			d="M6.5 19.5c.85-2.85 3.05-4.75 5.5-4.75s4.65 1.9 5.5 4.75"
			stroke="white"
			strokeWidth="1.85"
			strokeLinecap="round"
		/>
		<circle
			cx="17.25"
			cy="17.25"
			r="3.75"
			fill="url(#ts-add-teacher-badge)"
			stroke="white"
			strokeWidth="1.25"
		/>
		<path
			d="M17.25 15.5v3.5M15.5 17.25h3.5"
			stroke="white"
			strokeWidth="1.45"
			strokeLinecap="round"
		/>
		<defs>
			<linearGradient
				id="ts-add-teacher-ring"
				x1="2"
				y1="2"
				x2="22"
				y2="22"
				gradientUnits="userSpaceOnUse"
			>
				<stop stopColor="#F472B6" />
				<stop offset="0.45" stopColor="#A855F7" />
				<stop offset="1" stopColor="#38BDF8" />
			</linearGradient>
			<linearGradient
				id="ts-add-teacher-bg"
				x1="2"
				y1="2"
				x2="22"
				y2="22"
				gradientUnits="userSpaceOnUse"
			>
				<stop stopColor="#EC4899" stopOpacity="0.42" />
				<stop offset="0.55" stopColor="#8B5CF6" stopOpacity="0.38" />
				<stop offset="1" stopColor="#0EA5E9" stopOpacity="0.48" />
			</linearGradient>
			<linearGradient
				id="ts-add-teacher-badge"
				x1="13.5"
				y1="13.5"
				x2="21"
				y2="21"
				gradientUnits="userSpaceOnUse"
			>
				<stop stopColor="#FBBF24" />
				<stop offset="1" stopColor="#F97316" />
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

/* Earnings: emerald → teal dollar chart */
const IconEarnings = () => (
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
			stroke="url(#ts-earnings-ring)"
			strokeWidth="1.8"
			fill="url(#ts-earnings-bg)"
		/>
		<path
			d="M12 6v12M9.5 8.5h4a2.5 2.5 0 010 5h-3a2.5 2.5 0 000 5h5"
			stroke="white"
			strokeWidth="1.75"
			strokeLinecap="round"
			strokeLinejoin="round"
		/>
		<defs>
			<linearGradient
				id="ts-earnings-ring"
				x1="2"
				y1="2"
				x2="22"
				y2="22"
				gradientUnits="userSpaceOnUse"
			>
				<stop stopColor="#10B981" />
				<stop offset="0.55" stopColor="#14B8A6" />
				<stop offset="1" stopColor="#0EA5E9" />
			</linearGradient>
			<linearGradient
				id="ts-earnings-bg"
				x1="2"
				y1="2"
				x2="22"
				y2="22"
				gradientUnits="userSpaceOnUse"
			>
				<stop stopColor="#34D399" stopOpacity="0.45" />
				<stop offset="1" stopColor="#22D3EE" stopOpacity="0.5" />
			</linearGradient>
		</defs>
	</svg>
)

function hasLinkedSchool (school) {
	if (school == null || school === '') {
		return false
	}
	if (typeof school === 'string') {
		return school.trim() !== ''
	}
	if (typeof school === 'object' && school._id != null) {
		return true
	}
	return Boolean(school)
}

function AdminSidebar ({ isOpen, toggleSidebar }) {
	const location = useLocation()
	const { schoolAdminInfo } = useSelector((state) => state.authSchoolAdmin)
	const showMySchool = hasLinkedSchool(schoolAdminInfo?.school)

	const navClass = ({ isActive }) =>
		`sidebar-nav-link${isActive ? ' sidebar-nav-link--active' : ''}`

	const isMySubjectsSection =
		location.pathname.startsWith('/schooladmins/createsubject')
		|| location.pathname.startsWith('/schooladmins/editsubject')
		|| location.pathname.startsWith('/schooladmins/courses')
		|| location.pathname.startsWith('/schooladmins/teacherinvite')
		|| location.pathname.startsWith('/schooladmins/previousquestions')
		|| location.pathname.startsWith('/schooladmins/watchquestion')
		|| location.pathname.startsWith('/schooladmins/watchanswer')

	const mySubjectsNavClass = ({ isActive }) =>
		`sidebar-nav-link${
			isActive || isMySubjectsSection ? ' sidebar-nav-link--active' : ''
		}`

	const isPlansSection =
		location.pathname.startsWith('/schooladmins/subscriptions')
		|| location.pathname.startsWith('/schooladmins/createplan')
		|| location.pathname.startsWith('/schooladmins/updateplan')

	const plansNavClass = ({ isActive }) =>
		`sidebar-nav-link${
			isActive || isPlansSection ? ' sidebar-nav-link--active' : ''
		}`

	const isStudentsSection =
		location.pathname.startsWith('/schooladmins/students')
		|| location.pathname.startsWith('/schooladmins/addstudents')

	const studentsNavClass = ({ isActive }) =>
		`sidebar-nav-link${
			isActive || isStudentsSection ? ' sidebar-nav-link--active' : ''
		}`

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
					{/* <NavLink to="/teachers/newquestions"  className={navClass}>
						<span className="sidebar-nav-link__icon-well" aria-hidden="true">
							<IconNewTutor />
						</span>
						<span className="sidebar-nav-link__label">New Questions</span>
					</NavLink> */}
					<NavLink to="/schooladmins/mysubjects" className={mySubjectsNavClass}>
						<span className="sidebar-nav-link__icon-well" aria-hidden="true">
							<IconAskTeacher />
						</span>
						<span className="sidebar-nav-link__label">My  Subjects</span>
					</NavLink>
					{showMySchool && (
						<NavLink to="/schooladmins/plans" className={plansNavClass}>
							<span
								className="sidebar-nav-link__icon-well"
								aria-hidden="true"
							>
								<IconPlans />
							</span>
							<span className="sidebar-nav-link__label">
								School Plans
							</span>
						</NavLink>
					)}
					{!showMySchool && (
						<NavLink to="/schooladmins/registerschool" className={navClass}>
							<span
								className="sidebar-nav-link__icon-well"
								aria-hidden="true"
							>
								<IconTeacherAnswers />
							</span>
							<span className="sidebar-nav-link__label">
								Create New School
							</span>
						</NavLink>
					)}
					{showMySchool && (
						<NavLink to="/schooladmins/myschools" className={navClass}>
							<span
								className="sidebar-nav-link__icon-well"
								aria-hidden="true"
							>
								<IconTeacherAnswers />
							</span>
							<span className="sidebar-nav-link__label">My School</span>
						</NavLink>
					)}
					{showMySchool && (
						<NavLink to="/schooladmins/earnings" className={navClass}>
							<span
								className="sidebar-nav-link__icon-well"
								aria-hidden="true"
							>
								<IconEarnings />
							</span>
							<span className="sidebar-nav-link__label">
								Earnings
							</span>
						</NavLink>
					)}
					{showMySchool && (
						<NavLink to="/schooladmins/addteacher" className={navClass}>
							<span
								className="sidebar-nav-link__icon-well"
								aria-hidden="true"
							>
								<IconAddTeacher />
							</span>
							<span className="sidebar-nav-link__label">
								Add Teachers
							</span>
						</NavLink>
					)}
					{showMySchool && (
						<NavLink to="/schooladmins/students" className={studentsNavClass}>
							<span
								className="sidebar-nav-link__icon-well"
								aria-hidden="true"
							>
								<IconAddStudent />
							</span>
							<span className="sidebar-nav-link__label">
								 Students
							</span>
						</NavLink>
					)}
					<NavLink to="/schooladmins/profile" className={navClass}>
						<span className="sidebar-nav-link__icon-well" aria-hidden="true">
							<IconSubjects />
						</span>
						<span className="sidebar-nav-link__label">My Profile</span>
					</NavLink>
				</nav>
			</div>
		</aside>
	)
}

export default AdminSidebar
