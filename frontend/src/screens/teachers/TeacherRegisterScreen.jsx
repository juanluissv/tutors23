import { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useDispatch } from 'react-redux'
import { toast } from 'react-toastify'
import { useRegisterTeacherMutation } from '../../slices/teachers/teacherApiSlice'
import { setTeacherCredentials } from '../../slices/teachers/authTeacherSlice'
import TeacherSidebar from '../../components/TeacherSidebar'
import TeacherHeader from '../../components/TeacherHeader'
import { localizeApiError } from '../../utils/localizeApiMessage'
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
			toast.error('Por favor ingresa tu nombre')
			return
		}
		if (lastname === '') {
			toast.error('Por favor ingresa tu apellido')
			return
		}
		if (email === '') {
			toast.error('Por favor ingresa tu correo electrónico')
			return
		}
		if (password === '') {
			toast.error('Por favor ingresa tu contraseña')
			return
		}
		if (confirmPassword === '') {
			toast.error('Por favor confirma tu contraseña')
			return
		}
		if (password !== confirmPassword) {
			toast.error('Las contraseñas no coinciden')
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
			toast.success(
				res?.accountCompleted
					? 'Cuenta completada — bienvenido a Ask to Learn'
					: 'Cuenta creada',
			)
			navigate(redirect.startsWith('/teachers') ? redirect : '/teachers/newquestions')
		} catch (err) {
			toast.error(
				localizeApiError(
					err,
					'No se pudo crear la cuenta. Intenta de nuevo.',
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
						<div className='center-content2 login-screen login-screen--register login-screen--offset-10'>
							<div className='login-card'>
								<div className='login-card__accent' aria-hidden />
								<div className='login-card__header'>
									<h1 className='login-card__title'>
										Crea una cuenta de profesor
									</h1>
									<p className='login-card__subtitle'>
										Regístrate para empezar a enseñar en
										Ask to Learn. Si tu administrador
										escolar ya te agregó, usa el mismo
										correo para completar tu cuenta.
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
											Nombre
										</label>
										<input
											type='text'
											id='teacher-register-firstname'
											name='firstname'
											className='login-input'
											placeholder='Nombre'
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
											Apellido
										</label>
										<input
											type='text'
											id='teacher-register-lastname'
											name='lastname'
											className='login-input'
											placeholder='Apellido'
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
											Correo electrónico
										</label>
										<input
											type='email'
											id='teacher-register-email'
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
											htmlFor='teacher-register-password'
										>
											Contraseña
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
											Confirmar contraseña
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
										{isLoading
											? 'Creando cuenta…'
											: 'Registrarse'}
									</button>
								</form>
								<p className='login-card__footer'>
									¿Ya tienes una cuenta?{' '}
									<Link
										to='/teachers/login'
										className='login-card__link'
									>
										Iniciar sesión
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
