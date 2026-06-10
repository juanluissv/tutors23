import React, { useMemo } from 'react'
import { NavLink, useLocation } from 'react-router-dom'
import { useSelector } from 'react-redux'
import { useGetQuestionsByTeacherIdQuery } from '../slices/teachers/teacherQuestionsSlice'

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
				<stop stopColor="#FBBF24" />
				<stop offset="0.5" stopColor="#FB7185" />
				<stop offset="1" stopColor="#A855F7" />
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
				<stop stopColor="#6366F1" />
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
				<stop stopColor="#4F46E5" />
				<stop offset="0.55" stopColor="#0EA5E9" />
				<stop offset="1" stopColor="#06B6D4" />
			</linearGradient>
		</defs>
	</svg>
)

/* My students: cyan → sky duo silhouette (matches admin student styling) */
const IconMyStudents = () => (
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
			stroke="url(#tch-students-ring)"
			strokeWidth="1.8"
			fill="url(#tch-students-bg)"
		/>
		<circle
			cx="8.25"
			cy="10.25"
			r="2.15"
			fill="white"
			fillOpacity="0.55"
		/>
		<path
			d="M5.25 17.25c.55-1.85 1.95-3.1 3.75-3.1"
			stroke="white"
			strokeOpacity="0.55"
			strokeWidth="1.45"
			strokeLinecap="round"
		/>
		<circle
			cx="13.25"
			cy="9.5"
			r="2.85"
			fill="white"
			fillOpacity="0.95"
		/>
		<path
			d="M8.5 18.75c.7-2.35 2.55-3.9 4.75-3.9s4.05 1.55 4.75 3.9"
			stroke="white"
			strokeWidth="1.75"
			strokeLinecap="round"
		/>
		<defs>
			<linearGradient
				id="tch-students-ring"
				x1="2"
				y1="2"
				x2="22"
				y2="22"
				gradientUnits="userSpaceOnUse"
			>
				<stop stopColor="#F43F5E" />
				<stop offset="0.55" stopColor="#EC4899" />
				<stop offset="1" stopColor="#A855F7" />
			</linearGradient>
			<linearGradient
				id="tch-students-bg"
				x1="2"
				y1="2"
				x2="22"
				y2="22"
				gradientUnits="userSpaceOnUse"
			>
				<stop stopColor="#FB7185" stopOpacity="0.55" />
				<stop offset="1" stopColor="#C084FC" stopOpacity="0.6" />
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
				<stop offset="0.5" stopColor="#14B8A6" />
				<stop offset="1" stopColor="#F59E0B" />
			</linearGradient>
			<linearGradient
				id="ts-book-fill"
				x1="4"
				y1="6"
				x2="20"
				y2="18"
				gradientUnits="userSpaceOnUse"
			>
				<stop stopColor="#34D399" stopOpacity="0.45" />
				<stop offset="1" stopColor="#FCD34D" stopOpacity="0.5" />
			</linearGradient>
		</defs>
	</svg>
)

/* Create course: layered modules + play + amber plus badge */
const IconCreateCourse = () => (
	<svg
		width="20"
		height="20"
		viewBox="0 0 24 24"
		fill="none"
		xmlns="http://www.w3.org/2000/svg"
		className="sidebar-nav-icon"
	>
		<rect
			x="6"
			y="2"
			width="13"
			height="17"
			rx="2.5"
			stroke="url(#tch-cc-back-stroke)"
			strokeWidth="1.6"
			fill="url(#tch-cc-back-fill)"
			transform="rotate(-8 12.5 10.5)"
		/>
		<rect
			x="5"
			y="4"
			width="13"
			height="17"
			rx="2.5"
			stroke="url(#tch-cc-mid-stroke)"
			strokeWidth="1.6"
			fill="url(#tch-cc-mid-fill)"
			transform="rotate(4 11.5 12.5)"
		/>
		<rect
			x="4"
			y="6"
			width="14"
			height="17"
			rx="2.5"
			stroke="url(#tch-cc-front-stroke)"
			strokeWidth="2"
			fill="url(#tch-cc-front-fill)"
		/>
		<path
			d="M7 13h7M7 16h5"
			stroke="white"
			strokeWidth="1.6"
			strokeLinecap="round"
		/>
		<path d="M14.5 10.5l3.5 2.25-3.5 2.25V10.5z" fill="white" />
		<circle
			cx="17.25"
			cy="17.25"
			r="3.75"
			fill="url(#tch-cc-badge)"
			stroke="white"
			strokeWidth="1.2"
		/>
		<path
			d="M17.25 15.5v3.5M15.5 17.25h3.5"
			stroke="white"
			strokeWidth="1.45"
			strokeLinecap="round"
		/>
		<defs>
			<linearGradient
				id="tch-cc-back-stroke"
				x1="6"
				y1="2"
				x2="19"
				y2="19"
				gradientUnits="userSpaceOnUse"
			>
				<stop stopColor="#38BDF8" />
				<stop offset="1" stopColor="#818CF8" />
			</linearGradient>
			<linearGradient
				id="tch-cc-back-fill"
				x1="6"
				y1="2"
				x2="19"
				y2="19"
				gradientUnits="userSpaceOnUse"
			>
				<stop stopColor="#7DD3FC" stopOpacity="0.22" />
				<stop offset="1" stopColor="#A5B4FC" stopOpacity="0.28" />
			</linearGradient>
			<linearGradient
				id="tch-cc-mid-stroke"
				x1="5"
				y1="4"
				x2="18"
				y2="21"
				gradientUnits="userSpaceOnUse"
			>
				<stop stopColor="#0EA5E9" />
				<stop offset="1" stopColor="#8B5CF6" />
			</linearGradient>
			<linearGradient
				id="tch-cc-mid-fill"
				x1="5"
				y1="4"
				x2="18"
				y2="21"
				gradientUnits="userSpaceOnUse"
			>
				<stop stopColor="#38BDF8" stopOpacity="0.32" />
				<stop offset="1" stopColor="#C084FC" stopOpacity="0.36" />
			</linearGradient>
			<linearGradient
				id="tch-cc-front-stroke"
				x1="4"
				y1="6"
				x2="18"
				y2="23"
				gradientUnits="userSpaceOnUse"
			>
				<stop stopColor="#0284C7" />
				<stop offset="0.45" stopColor="#7C3AED" />
				<stop offset="1" stopColor="#D946EF" />
			</linearGradient>
			<linearGradient
				id="tch-cc-front-fill"
				x1="4"
				y1="6"
				x2="18"
				y2="23"
				gradientUnits="userSpaceOnUse"
			>
				<stop stopColor="#0EA5E9" stopOpacity="0.55" />
				<stop offset="0.5" stopColor="#A78BFA" stopOpacity="0.5" />
				<stop offset="1" stopColor="#E879F9" stopOpacity="0.45" />
			</linearGradient>
			<linearGradient
				id="tch-cc-badge"
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

function questionHasVideo (question) {
	return question?.mediaId != null && String(question.mediaId).trim() !== ''
}

function teacherAnswerHasVideo (question) {
	const ans = question?.answer
	if (ans == null || ans === '') return false
	if (typeof ans === 'object') {
		const mid = ans.mediaId
		return mid != null && String(mid).trim() !== ''
	}
	return false
}

function isAwaitingTeacherAnswerVideo (question) {
	return questionHasVideo(question) && !teacherAnswerHasVideo(question)
}

function TeacherSidebar ({ isOpen, toggleSidebar }) {
	const location = useLocation()
	const { teacherInfo } = useSelector((state) => state.authTeacher)
	const teacherId = teacherInfo?._id ? String(teacherInfo._id) : null

	const { data: questionsFromApi = [] } = useGetQuestionsByTeacherIdQuery(
		teacherId,
		{ skip: !teacherId },
	)

	const newQuestionsCount = useMemo(() => {
		const list = Array.isArray(questionsFromApi) ? questionsFromApi : []
		return list.filter((q) => isAwaitingTeacherAnswerVideo(q)).length
	}, [questionsFromApi])

	const navClass = ({ isActive }) =>
		`sidebar-nav-link${isActive ? ' sidebar-nav-link--active' : ''}`

	const isAnswerDetailsSection =
		location.pathname.startsWith('/teachers/answerdetails')

	const isTeacherAnswerComposeSection =
		location.pathname.startsWith('/teachers/answer/')

	const isTeacherAnswerRecordSection =
		location.pathname.startsWith('/teachers/recordscreen/')
		|| location.pathname.startsWith('/teachers/recordcamera/')

	const newQuestionsNavClass = ({ isActive }) =>
		`sidebar-nav-link${
			isActive
			|| isAnswerDetailsSection
			|| isTeacherAnswerComposeSection
			|| isTeacherAnswerRecordSection
				? ' sidebar-nav-link--active'
				: ''
		}`

	const isOldQuestionsSection =
		location.pathname.startsWith('/teachers/oldquestions')
		|| location.pathname.startsWith('/teachers/previousquestions')

	const isWatchNewSection =
		location.pathname.startsWith('/teachers/watchnew')

	const isWatchAnswerSection =
		location.pathname.startsWith('/teachers/watchanswer')

	const isTeacherCoursesSection =
		location.pathname.startsWith('/teachers/courses')

	const mySubjectsNavClass = ({ isActive }) =>
		`sidebar-nav-link${
			isActive
			|| isOldQuestionsSection
			|| isWatchNewSection
			|| isWatchAnswerSection
			|| isTeacherCoursesSection
				? ' sidebar-nav-link--active'
				: ''
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
					<NavLink to="/teachers/newquestions" className={newQuestionsNavClass}>
						<span className="sidebar-nav-link__icon-well" aria-hidden="true">
							<IconNewTutor />
						</span>
						<span className="sidebar-nav-link__label-wrap">
							<span className="sidebar-nav-link__label">
								New Questions
							</span>
							{newQuestionsCount > 0 ? (
								<span
									className="sidebar-new-answers-badge"
									aria-hidden="true"
								>
									{newQuestionsCount > 99
										? '99+'
										: String(newQuestionsCount)}
								</span>
							) : null}
						</span>
					</NavLink>
					<NavLink to="/teachers/subjects" className={mySubjectsNavClass}>
						<span className="sidebar-nav-link__icon-well" aria-hidden="true">
							<IconAskTeacher />
						</span>
						<span className="sidebar-nav-link__label">My  Subjects</span>
					</NavLink>
					<NavLink to="/teachers/createcourse" className={navClass}>
						<span className="sidebar-nav-link__icon-well" aria-hidden="true">
							<IconCreateCourse />
						</span>
						<span className="sidebar-nav-link__label">Create course</span>
					</NavLink>
					<NavLink to="/teachers/students" className={navClass}>
						<span className="sidebar-nav-link__icon-well" aria-hidden="true">
							<IconMyStudents />
						</span>
						<span className="sidebar-nav-link__label">My  Students</span>
					</NavLink>
					<NavLink to="/teachers/profile" className={navClass}>
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
