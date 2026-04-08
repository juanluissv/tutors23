import React from 'react'
import { Link } from 'react-router-dom'
import Sidebar from '../components/Sidebar'
import Header from '../components/Header'
import '../App.css'

function LoginScreen () {
	const isSidebarOpen = false

	const handleToggleSidebar = () => {}

	const handleSubmit = (e) => {
		e.preventDefault()
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
									<h1 className='login-card__title'>Welcome back</h1>
									<p className='login-card__subtitle'>
										Sign in to your account to continue learning
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
											autoComplete='current-password'
										/>
									</div>
									<div className='login-field login-field--row'>
										<label
											className='login-remember'
											htmlFor='remember'
										>
											<input
												type='checkbox'
												id='remember'
												name='remember'
												className='login-checkbox'
											/>
											<span className='login-remember__text'>
												Remember me on this device
											</span>
										</label>
									</div>
									<button
										type='submit'
										id='login-button'
										name='login-button'
										className='login-submit'
									>
										Sign in
									</button>
								</form>
								<p className='login-card__footer'>
									Don't have an account?{' '}
									<Link to='/register' className='login-card__link'>
										Sign up
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

export default LoginScreen;