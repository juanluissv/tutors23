import React, { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useDispatch } from 'react-redux'
import { toast } from 'react-toastify'
import { setStudentCredentials } from '../slices/student/authStudentSlice'
import { useRegisterMutation } from '../slices/student/studentApiSlice'
import Sidebar from '../components/Sidebar'
import Header from '../components/Header'
import '../App.css'

function RegisterScreen () {
	const navigate = useNavigate()
	const dispatch = useDispatch()

	const isSidebarOpen = false
	const [firstname, setFirstname] = useState('')
	const [lastname, setLastname] = useState('')
	const [email, setEmail] = useState('')
	const [password, setPassword] = useState('')
	const [confirmPassword, setConfirmPassword] = useState('')
	const [register, { isLoading }] = useRegisterMutation()

	const handleToggleSidebar = () => {}

	const { search } = useLocation()
	const sp = new URLSearchParams(search)
	const redirect = sp.get('redirect') || '/'

	const handleSubmit = async (e) => {
		e.preventDefault()
		const fn = firstname.trim()
		const ln = lastname.trim()
		if (fn === '') {
			toast.error('Please enter your first name')
			return
		}
		if (ln === '') {
			toast.error('Please enter your last name')
			return
		}
		if (email.trim() === '') {
			toast.error('Please enter email')
			return
		}
		if (password === '') {
			toast.error('Please enter password')
			return
		}
		if (confirmPassword === '') {
			toast.error('Please enter confirm password')
			return
		}
		if (password !== confirmPassword) {
			toast.error('Passwords do not match')
			return
		}
		try {
			const res = await register({
				firstname: fn,
				lastname: ln,
				email: email.trim(),
				password,
			}).unwrap()
			dispatch(setStudentCredentials({ ...res }))
			toast.success('Account created')
			navigate(redirect)
		} catch (err) {
			toast.error(err?.data?.message || err?.error || 'Registration failed')
		}
	}

	return (
		<div className='chat-app chat-app--login ask-screen'>
			<div className='main-container'>
				<Sidebar isOpen={isSidebarOpen} toggleSidebar={handleToggleSidebar} />
				<div className='main-content'>
					<Header
						isSidebarOpen={isSidebarOpen}
						toggleSidebar={handleToggleSidebar}
					/>
					<div className='content-area content-area--login'>
						<div className='center-content2 login-screen'>
							<div className='login-card'>
								<div className='login-card__accent' aria-hidden />
								<div className='login-card__header'>
									<h1 className='login-card__title'>Create an account</h1>
									<p className='login-card__subtitle'>
										Sign up to start learning
									</p>
								</div>
								<form
									className='login-form'
									id='register-form'
									name='register-form'
									onSubmit={handleSubmit}
								>
									<div className='login-field'>
										<label className='login-label' htmlFor='register-firstname'>
											First name
										</label>
										<input
											type='text'
											id='register-firstname'
											name='firstname'
											className='login-input'
											placeholder='First name'
											autoComplete='given-name'
											value={firstname}
											disabled={isLoading}
											onChange={(e) => setFirstname(e.target.value)}
										/>
									</div>
									<div className='login-field'>
										<label className='login-label' htmlFor='register-lastname'>
											Last name
										</label>
										<input
											type='text'
											id='register-lastname'
											name='lastname'
											className='login-input'
											placeholder='Last name'
											autoComplete='family-name'
											value={lastname}
											disabled={isLoading}
											onChange={(e) => setLastname(e.target.value)}
										/>
									</div>
									<div className='login-field'>
										<label className='login-label' htmlFor='email'>
											Email
										</label>
										<input
											type='email'
											id='email'
											name='email'
											className='login-input'
											placeholder='you@example.com'
											autoComplete='email'
											value={email}
											disabled={isLoading}
											onChange={(e) => setEmail(e.target.value)}
										/>
									</div>
									<div className='login-field'>
										<label className='login-label' htmlFor='password'>
											Password
										</label>
										<input
											type='password'
											id='password'
											name='password'
											className='login-input'
											placeholder='••••••••'
											autoComplete='new-password'
											value={password}
											disabled={isLoading}
											onChange={(e) => setPassword(e.target.value)}
										/>
									</div>
									<div className='login-field'>
										<label
											className='login-label'
											htmlFor='confirm-password'
										>
											Confirm password
										</label>
										<input
											type='password'
											id='confirm-password'
											name='confirm-password'
											className='login-input'
											placeholder='••••••••'
											autoComplete='new-password'
											value={confirmPassword}
											disabled={isLoading}
											onChange={(e) =>
												setConfirmPassword(e.target.value)}
										/>
									</div>

									<button
										type='submit'
										id='register-button'
										name='register-button'
										className='login-submit'
										disabled={isLoading}
									>
										{isLoading ? 'Signing up…' : 'Sign up'}
									</button>
								</form>
								<p className='login-card__footer'>
									Already have an account?{' '}
									<Link to='/login' className='login-card__link'>
										Sign in
									</Link>
								</p>
							</div>
						</div>
					</div>
				</div>
			</div>
		</div>
	)
}

export default RegisterScreen
