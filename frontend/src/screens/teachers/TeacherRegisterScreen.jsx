import { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useDispatch } from 'react-redux'
import { toast } from 'react-toastify'
import { useRegisterTeacherMutation } from '../../slices/teachers/teacherApiSlice'
import { setTeacherCredentials } from '../../slices/teachers/authTeacherSlice'
import TeacherSidebar from '../../components/TeacherSidebar'
import TeacherHeader from '../../components/TeacherHeader'
import '../../App.css'

function TeacherRegisterScreen () {
	const isSidebarOpen = false

	const handleToggleSidebar = () => {}

	const navigate = useNavigate()
	const dispatch = useDispatch()

	const [firstname, setFirstname] = useState('')
	const [lastname, setLastname] = useState('')
	const [email, setEmail] = useState('')
	const [password, setPassword] = useState('')
	const [confirmPassword, setConfirmPassword] = useState('')

	const [registerTeacher, { isLoading }] = useRegisterTeacherMutation()

	const { search } = useLocation()
	const sp = new URLSearchParams(search)
	const redirect = sp.get('redirect') || '/'

	const handleSubmit = async (e) => {
		e.preventDefault()
		if (firstname === '') {
			toast.error('Please enter your first name')
			return
		}
		if (lastname === '') {
			toast.error('Please enter your last name')
			return
		}
		if (email === '') {
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
			const res = await registerTeacher({
				firstname,
				lastname,
				email,
				password,
			}).unwrap()
			dispatch(setTeacherCredentials({ ...res }))
			toast.success('Registration successful')
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
									<h1 className='login-card__title'>Create a teacher account</h1>
									<p className='login-card__subtitle'>
										Sign up to start teaching on Ask to Learn
									</p>
								</div>
								<form
									className='login-form'
									id='teacher-register-form'
									name='teacher-register-form'
									onSubmit={handleSubmit}
								>
									<div className='login-field'>
										<label
											className='login-label'
											htmlFor='teacher-register-firstname'
										>
											First name
										</label>
										<input
											type='text'
											id='teacher-register-firstname'
											name='firstname'
											className='login-input'
											placeholder='Jane'
											autoComplete='given-name'
											onChange={(e) => setFirstname(e.target.value)}
											value={firstname}
											disabled={isLoading}
										/>
									</div>
									<div className='login-field'>
										<label
											className='login-label'
											htmlFor='teacher-register-lastname'
										>
											Last name
										</label>
										<input
											type='text'
											id='teacher-register-lastname'
											name='lastname'
											className='login-input'
											placeholder='Doe'
											autoComplete='family-name'
											onChange={(e) => setLastname(e.target.value)}
											value={lastname}
											disabled={isLoading}
										/>
									</div>
									<div className='login-field'>
										<label
											className='login-label'
											htmlFor='teacher-register-email'
										>
											Email
										</label>
										<input
											type='email'
											id='teacher-register-email'
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
											htmlFor='teacher-register-password'
										>
											Password
										</label>
										<input
											type='password'
											id='teacher-register-password'
											name='password'
											className='login-input'
											placeholder='••••••••'
											autoComplete='new-password'
											onChange={(e) => setPassword(e.target.value)}
											value={password}
											disabled={isLoading}
										/>
									</div>
									<div className='login-field'>
										<label
											className='login-label'
											htmlFor='teacher-register-confirm-password'
										>
											Confirm password
										</label>
										<input
											type='password'
											id='teacher-register-confirm-password'
											name='confirm-password'
											className='login-input'
											placeholder='••••••••'
											autoComplete='new-password'
											onChange={(e) => setConfirmPassword(e.target.value)}
											value={confirmPassword}
											disabled={isLoading}
										/>
									</div>
									<button
										type='submit'
										id='teacher-register-button'
										name='register-button'
										className='login-submit'
										disabled={isLoading}
									>
										{isLoading ? 'Creating account…' : 'Sign up'}
									</button>
								</form>
								<p className='login-card__footer'>
									Already have an account?{' '}
									<Link
										to='/teachers/login'
										className='login-card__link'
									>
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

export default TeacherRegisterScreen
