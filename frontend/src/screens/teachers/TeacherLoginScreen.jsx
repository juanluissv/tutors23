import { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useDispatch } from 'react-redux'
import { toast } from 'react-toastify'
import { useLoginTeacherMutation } from '../../slices/teachers/teacherApiSlice'
import { setTeacherCredentials } from '../../slices/teachers/authTeacherSlice'
import TeacherSidebar from '../../components/TeacherSidebar'
import TeacherHeader from '../../components/TeacherHeader'
import '../../App.css'

function TeacherLoginScreen () {
	const isSidebarOpen = false

	const handleToggleSidebar = () => {}

	const navigate = useNavigate()
	const dispatch = useDispatch()

	const [email, setEmail] = useState("ana22@gmail.com");
    const [password, setPassword] = useState("anaSmith22");

	const [loginTeacher, { isLoading }] = useLoginTeacherMutation()

	const { search } = useLocation()
	const sp = new URLSearchParams(search)
	const redirect = sp.get('redirect') || 'teachers/newquestions'

	const handleSubmit = async (e) => {
		e.preventDefault()
		if (email === '') {
			toast.error('Please enter email')
			return
		}
		if (password === '') {
			toast.error('Please enter password')
			return
		}
		try {
			const res = await loginTeacher({ email, password }).unwrap()
			dispatch(setTeacherCredentials({ ...res }))
			toast.success('Login successful')
			navigate('/teachers/newquestions')
		} catch (err) {
			toast.error(err?.data?.message || err?.error?.message)
		}
	}

	return (
		<div className='chat-app chat-app--login chat-app--teacher-login ask-screen'>
			<div className='main-container'>
				<TeacherSidebar
					isOpen={isSidebarOpen}
					toggleSidebar={handleToggleSidebar}
				/>
				<div className='main-content'>
					<TeacherHeader
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
										Sign in to your teacher account to continue
									</p>
								</div>
								<form
									className='login-form'
									id='teacher-login-form'
									name='teacher-login-form'
									onSubmit={handleSubmit}
								>
									<div className='login-field'>
										<label className='login-label' htmlFor='teacher-email'>
											Email
										</label>
										<input
											type='email'
											id='teacher-email'
											name='email'
											className='login-input'
											placeholder='you@example.com'
											autoComplete='email'
											onChange={(e) => setEmail(e.target.value)}
											value={email}
											disabled={isLoading}
										/>
									</div>
									<div className='login-field'>
										<label
											className='login-label'
											htmlFor='teacher-password'
										>
											Password
										</label>
										<input
											type='password'
											id='teacher-password'
											name='password'
											className='login-input'
											placeholder='••••••••'
											autoComplete='current-password'
											onChange={(e) => setPassword(e.target.value)}
											value={password}
											disabled={isLoading}
										/>
									</div>
									<div className='login-field login-field--row'>
										<label
											className='login-remember'
											htmlFor='teacher-remember'
										>
											<input
												type='checkbox'
												id='teacher-remember'
												name='remember'
												className='login-checkbox'
												disabled={isLoading}
											/>
											<span className='login-remember__text'>
												Remember me on this device
											</span>
										</label>
									</div>
									<button
										type='submit'
										id='teacher-login-button'
										name='login-button'
										className='login-submit'
										disabled={isLoading}
									>
										{isLoading ? 'Signing in…' : 'Sign in'}
									</button>
								</form>
								<p className='login-card__footer'>
									Don&apos;t have a teacher account?{' '}
									<Link
										to='/teachers/register'
										className='login-card__link'
									>
										Register
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

export default TeacherLoginScreen
