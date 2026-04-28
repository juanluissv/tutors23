import React, { useState, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useSelector, useDispatch } from 'react-redux'
import { logoutTeacher } from '../slices/teachers/authTeacherSlice'
import { useLogoutTeacherMutation } from '../slices/teachers/teacherApiSlice'

const userIconSrc = `${process.env.PUBLIC_URL}/user.svg`

const LogoutIcon = () => (
	<svg
		width="18"
		height="18"
		viewBox="0 0 24 24"
		fill="none"
		stroke="currentColor"
		strokeWidth="2"
		strokeLinecap="round"
		strokeLinejoin="round"
		aria-hidden
	>
		<path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
		<polyline points="16 17 21 12 16 7" />
		<line x1="21" y1="12" x2="9" y2="12" />
	</svg>
)

function TeacherHeader({
	isSidebarOpen: _isSidebarOpen,
	toggleSidebar: _toggleSidebar,
}) {
	const navigate = useNavigate()
	const dispatch = useDispatch()
	const [isDropdownOpen, setIsDropdownOpen] = useState(false)
	const dropdownRef = useRef(null)

	const [logoutApiCall] = useLogoutTeacherMutation()

	const { teacherInfo } = useSelector((state) => state.authTeacher)

	const handleToggleDropdown = () => {
		if (teacherInfo) {
			setIsDropdownOpen((prev) => !prev)
		} else {
			navigate('/teachers/login')
		}
	}

	const logoutHandler = async () => {
		try {
			await logoutApiCall().unwrap()
			dispatch(logoutTeacher())
			setIsDropdownOpen(false)
			navigate('/teachers/login')
		} catch (err) {
			console.error(err)
		}
	}

	useEffect(() => {
		const handleClickOutside = (e) => {
			if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
				setIsDropdownOpen(false)
			}
		}
		if (isDropdownOpen) {
			document.addEventListener('mousedown', handleClickOutside)
		}
		return () => document.removeEventListener('mousedown', handleClickOutside)
	}, [isDropdownOpen])

	return (
		<header className="header header-centered">
			<div className="header-left">
				<button
					type="button"
					className="header-logo"
					onClick={() => navigate('/teachers/newquestions')}
					aria-label="Ask to Learn — go to home"
				>
					<img
						src="https://app.asktolearn.co/assets/img/log4.png"
						alt=""
						className="logo-image"
						style={{ width: '37px', height: '37px' }}
					/>
						<span className="teacher-header__logo-label">Ask to Learn</span>
				</button>
			</div>

			<div className="user-menu" ref={dropdownRef}>
				<button
					type="button"
					className={`user-button${
						teacherInfo ? ' user-button--logged-in' : ''
					}`}
					onClick={handleToggleDropdown}
					aria-haspopup={teacherInfo ? 'menu' : undefined}
					aria-expanded={
						teacherInfo ? (isDropdownOpen ? 'true' : 'false') : undefined
					}
					aria-label={
						teacherInfo
							? isDropdownOpen
								? 'Close account menu'
								: 'Open account menu'
							: 'Sign in'
					}
				>
					<img src={userIconSrc} alt="" width="48" height="48" />
				</button>

				{teacherInfo && isDropdownOpen && (
					<div className="user-dropdown" role="menu">
						<div className="user-dropdown__header">
							<span className="user-dropdown__name">
								{teacherInfo?.name || 'Teacher'}
							</span>
							<span className="user-dropdown__email">
								{teacherInfo?.email}
							</span>
						</div>
						<div className="user-dropdown__divider" />
						<button
							type="button"
							className="user-dropdown__item user-dropdown__item--danger"
							onClick={logoutHandler}
							role="menuitem"
						>
							<LogoutIcon />
							<span>Log out</span>
						</button>
					</div>
				)}
			</div>
		</header>
	)
}

export default TeacherHeader
