import React, { useState, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useSelector, useDispatch } from 'react-redux'
import { logoutStudent } from '../slices/student/authStudentSlice'
import { useLogoutMutation } from '../slices/student/studentApiSlice'

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

function Header({
	isSidebarOpen: _isSidebarOpen,
	toggleSidebar: _toggleSidebar,
}) {
	const navigate = useNavigate()
	const dispatch = useDispatch()
	const [isDropdownOpen, setIsDropdownOpen] = useState(false)
	const dropdownRef = useRef(null)

	const [logoutApiCall] = useLogoutMutation()

	const { studentInfo } = useSelector((state) => state.authStudent)

	const handleToggleDropdown = () => {
		if (studentInfo) {
			setIsDropdownOpen((prev) => !prev)
		} else {
			navigate('/login')
		}
	}

	const logoutHandler = async () => {
		try {
			await logoutApiCall().unwrap()
			dispatch(logoutStudent())
			setIsDropdownOpen(false)
			navigate('/login')
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
					onClick={() => navigate('/')}
					aria-label="Ask to Learn — go to home"
				>
					<img
						src="https://app.asktolearn.co/assets/img/log4.png"
						alt=""
						className="logo-image"
						style={{ width: '37px', height: '37px' }}
					/>
						<span className="logo-text" style={{ fontSize: '16px', color: '#6366f1' }}>	
					
						Ask to Learn
						</span> 
				</button>
			</div>

			<div className="user-menu" ref={dropdownRef}>
				<button
					type="button"
					className={`user-button${
						studentInfo ? ' user-button--logged-in' : ''
					}`}
					onClick={handleToggleDropdown}
					aria-haspopup={studentInfo ? 'menu' : undefined}
					aria-expanded={
						studentInfo ? (isDropdownOpen ? 'true' : 'false') : undefined
					}
					aria-label={
						studentInfo
							? isDropdownOpen
								? 'Close account menu'
								: 'Open account menu'
							: 'Sign in'
					}
				>
					<img src={userIconSrc} alt="" width="48" height="48" />
				</button>

				{studentInfo && isDropdownOpen && (
					<div className="user-dropdown" role="menu">
						<div className="user-dropdown__header">
							<span className="user-dropdown__name">
								{studentInfo.name || 'Student'}
							</span>
							<span className="user-dropdown__email">
								{studentInfo.email}
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

export default Header
