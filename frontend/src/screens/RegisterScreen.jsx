import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import Sidebar from '../components/Sidebar'
import Header from '../components/Header'
import '../App.css'

function RegisterScreen () {
	const isSidebarOpen = false
	const [passwordMismatchError, setPasswordMismatchError] = useState('')

	const handleToggleSidebar = () => {}

	const handleSubmit = (e) => {
		e.preventDefault()
		const form = e.target
		const password = form.password?.value ?? ''
		const confirmPassword = form['confirm-password']?.value ?? ''
		if (password !== confirmPassword) {
			setPasswordMismatchError('Passwords do not match')
			return
		}
		setPasswordMismatchError('')
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
									id='login-form'
									name='login-form'
									onSubmit={handleSubmit}
								>
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
											onChange={() => setPasswordMismatchError('')}
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
											onChange={() => setPasswordMismatchError('')}
										/>
									</div>
									{passwordMismatchError ? (
										<p
											className='login-field-error'
											role='alert'
										>
											{passwordMismatchError}
										</p>
									) : null}
									<button
										type='submit'
										id='register-button'
										name='register-button'
										className='login-submit'
									>
										Sign up
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

export default RegisterScreen; 