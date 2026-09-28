import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useDispatch } from 'react-redux'
import { toast } from 'react-toastify'
import { useRegisterSuperAdminMutation } from '../../slices/admin/schoolAdminApiSlice'
import { setSchoolAdminCredentials } from '../../slices/admin/authSchoolAdminSlice'
import TeacherSidebar from '../../components/TeacherSidebar'
import AdminHeader from '../../components/AdminHeader'
import '../../App.css'

function SchoolAdminSuperRegisterScreen () {
	const isSidebarOpen = false

	const handleToggleSidebar = () => {}

	const navigate = useNavigate()
	const dispatch = useDispatch()

	const [firstname, setFirstname] = useState('')
	const [lastname, setLastname] = useState('')
	const [email, setEmail] = useState('')
	const [password, setPassword] = useState('')
	const [confirmPassword, setConfirmPassword] = useState('')

	const [registerSuperAdmin, { isLoading }] = useRegisterSuperAdminMutation()

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
			const res = await registerSuperAdmin({
				firstname,
				lastname,
				email,
				password,
			}).unwrap()
			dispatch(setSchoolAdminCredentials({ ...res }))
			toast.success('Cuenta de super administrador creada')
			navigate('/schooladmins/superlogin')
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
						<div className='center-content2 login-screen login-screen--register login-screen--offset-20'>
							<div className='login-card'>
								<div className='login-card__accent' aria-hidden />
								<div className='login-card__header'>
									<h1 className='login-card__title'>
										Crea una cuenta de super
										administrador
									</h1>
									<p className='login-card__subtitle'>
										Regístrate para acceder a cualquier
										panel de administración escolar
									</p>
								</div>
								<form
									className='login-form'
									id='superadmin-register-form'
									name='superadmin-register-form'
									onSubmit={handleSubmit}
								>
									<div className='login-field'>
										<label
											className='login-label'
											htmlFor='superadmin-register-firstname'
										>
											Nombre
										</label>
										<input
											type='text'
											id='superadmin-register-firstname'
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
											htmlFor='superadmin-register-lastname'
										>
											Apellido
										</label>
										<input
											type='text'
											id='superadmin-register-lastname'
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
											htmlFor='superadmin-register-email'
										>
											Correo electrónico
										</label>
										<input
											type='email'
											id='superadmin-register-email'
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
											htmlFor='superadmin-register-password'
										>
											Contraseña
										</label>
										<input
											type='password'
											id='superadmin-register-password'
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
											htmlFor='superadmin-register-confirm-password'
										>
											Confirmar contraseña
										</label>
										<input
											type='password'
											id='superadmin-register-confirm-password'
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
										id='superadmin-register-button'
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
										to='/schooladmins/superlogin'
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

export default SchoolAdminSuperRegisterScreen
