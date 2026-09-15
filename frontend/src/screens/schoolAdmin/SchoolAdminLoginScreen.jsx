import { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useDispatch } from 'react-redux'
import { toast } from 'react-toastify'
import { useLoginSchoolAdminMutation } from '../../slices/admin/schoolAdminApiSlice'
import { setSchoolAdminCredentials } from '../../slices/admin/authSchoolAdminSlice'
import TeacherSidebar from '../../components/TeacherSidebar'
import AdminHeader from '../../components/AdminHeader'
import '../../App.css'

function SchoolAdminLoginScreen () {
	const isSidebarOpen = false

	const handleToggleSidebar = () => {}

	const navigate = useNavigate()
	const dispatch = useDispatch()

	const [email, setEmail] = useState('jane@gmail.com')
	const [password, setPassword] = useState('jane326')

	const [loginSchoolAdmin, { isLoading }] = useLoginSchoolAdminMutation()

	const { search } = useLocation()
	const sp = new URLSearchParams(search)

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
			const res = await loginSchoolAdmin({ email, password }).unwrap()
			dispatch(setSchoolAdminCredentials({ ...res }))
			toast.success('Inicio de sesión exitoso')
			const redirect = sp.get('redirect')
			if (redirect) {
				navigate(redirect.startsWith('/') ? redirect : `/${redirect}`)
			} else {
				navigate('/schooladmins/mysubjects')
			}
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
					<AdminHeader
						isSidebarOpen={isSidebarOpen}
						toggleSidebar={handleToggleSidebar}
					/>
					<div className='content-area content-area--login'>
						<div className='center-content2 login-screen'>
							<div className='login-card'>
								<div className='login-card__accent' aria-hidden />
								<div className='login-card__header'>
									<h1 className='login-card__title'>
										Bienvenido de nuevo
									</h1>
									<p className='login-card__subtitle'>
										Inicia sesión en tu cuenta de
										administrador escolar para continuar
									</p>
								</div>
								<form
									className='login-form'
									id='schooladmin-login-form'
									name='schooladmin-login-form'
									onSubmit={handleSubmit}
								>
									<div className='login-field'>
										<label className='login-label' htmlFor='schooladmin-email'>
											Correo electrónico
										</label>
										<input
											type='email'
											id='schooladmin-email'
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
											htmlFor='schooladmin-password'
										>
											Contraseña
										</label>
										<input
											type='password'
											id='schooladmin-password'
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
											htmlFor='schooladmin-remember'
										>
											{/* <input
												type='checkbox'
												id='schooladmin-remember'
												name='remember'
												className='login-checkbox'
												disabled={isLoading}
											/> */}
											<span className='login-remember__text'>
												Haz clic en Iniciar sesión para
												entrar a la demo
											</span>
										</label>
									</div>
									<button
										type='submit'
										id='schooladmin-login-button'
										name='login-button'
										className='login-submit'
										disabled={isLoading}
									>
										{isLoading
											? 'Iniciando sesión…'
											: 'Iniciar sesión'}
									</button>
								</form>
								<p className='login-card__footer'>
									¿No tienes una cuenta de administrador
									escolar?{' '}
									<Link
										to='/schooladmins/register'
										className='login-card__link'
									>
										Regístrate
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

export default SchoolAdminLoginScreen
