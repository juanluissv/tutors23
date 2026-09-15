import { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useDispatch } from 'react-redux'
import { toast } from 'react-toastify'
import { useLoginTeacherMutation } from '../../slices/teachers/teacherApiSlice'
import { setTeacherCredentials } from '../../slices/teachers/authTeacherSlice'
import TeacherSidebar from '../../components/TeacherSidebar'
import TeacherHeader from '../../components/TeacherHeader'
import { localizeApiError } from '../../utils/localizeApiMessage'
import '../../App.css'

function TeacherLoginScreen () {
	const isSidebarOpen = false

	const handleToggleSidebar = () => {}

	const navigate = useNavigate()
	const dispatch = useDispatch()

	const [email, setEmail] = useState("marco@gmail.com");
    const [password, setPassword] = useState("marco326");

	const [loginTeacher, { isLoading }] = useLoginTeacherMutation()

	const { search } = useLocation()
	const sp = new URLSearchParams(search)
	const redirect = sp.get('redirect') || 'teachers/newquestions'

	const handleSubmit = async (e) => {
		e.preventDefault()
		if (email === '') {
			toast.error('Por favor ingresa tu correo electrónico')
			return
		}
		if (password === '') {
			toast.error('Por favor ingresa tu contraseña')
			return
		}
		try {
			const res = await loginTeacher({ email, password }).unwrap()
			dispatch(setTeacherCredentials({ ...res }))
			toast.success('Inicio de sesión exitoso')
			navigate('/teachers/newquestions')
		} catch (err) {
			toast.error(
				localizeApiError(
					err,
					'No se pudo iniciar sesión. Intenta de nuevo.',
				),
			)
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
									<h1 className='login-card__title'>Bienvenido de nuevo</h1>
									<p className='login-card__subtitle'>
										Inicia sesión en tu cuenta de profesor para continuar
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
											Correo electrónico
										</label>
										<input
											type='email'
											id='teacher-email'
											name='email'
											className='login-input'
											placeholder='tucorreo@ejemplo.com'
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
											Contraseña
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
											{/* <input
												type='checkbox'
												id='teacher-remember'
												name='remember'
												className='login-checkbox'
												disabled={isLoading}
											/> */}
											<span className='login-remember__text'>
												Haz clic en Iniciar sesión para entrar a la demo
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
										{isLoading ? 'Iniciando sesión…' : 'Iniciar sesión'}
									</button>
								</form>
								<p className='login-card__footer'>
									¿No tienes una cuenta de profesor?{' '}
									<Link
										to='/teachers/register'
										className='login-card__link'
									>
										Regístrate
									</Link>
								</p>
								<div
									className='login-card__teacher-gateway'
									role='navigation'
									aria-label='Inicio de sesión de profesor'
								>
									<div
										className='login-card__teacher-gateway-accent'
										aria-hidden
									/>{' '}
									<br />
									<p className='login-card__teacher-gateway-lead'>
										¿Eres administrador escolar?
									</p>
									<Link
										to='/schooladmins/login'
										className='login-card__teacher-gateway-btn'
									>
										<span className='login-card__teacher-gateway-btn-icon'>
											<svg
												xmlns='http://www.w3.org/2000/svg'
												width='18'
												height='18'
												viewBox='0 0 24 24'
												fill='none'
												stroke='currentColor'
												strokeWidth='2'
												strokeLinecap='round'
												strokeLinejoin='round'
												aria-hidden
											>
												<path d='M3 21h18' />
												<path d='M5 21V7l8-4v18' />
												<path d='M19 21V11l-6-4' />
												<path d='M9 9v.01' />
												<path d='M9 12v.01' />
												<path d='M9 15v.01' />
												<path d='M9 18v.01' />
											</svg>
										</span>
										<span className='login-card__teacher-gateway-btn-label'>
											Acceso para administradores escolares
										</span>
										<span
											className='login-card__teacher-gateway-btn-arrow'
											aria-hidden
										>
											→
										</span>
									</Link>
								</div>
							</div>
						</div>
					</div>
				</div>
			</div>
		</div>
	)
}

export default TeacherLoginScreen
