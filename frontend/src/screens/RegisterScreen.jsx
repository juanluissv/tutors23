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
	const [username, setUsername] = useState('')
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
		const un = username.trim().toLowerCase()
		if (fn === '') {
			toast.error('Por favor ingresa tu nombre')
			return
		}
		if (ln === '') {
			toast.error('Por favor ingresa tu apellido')
			return
		}
		if (un === '') {
			toast.error('Por favor ingresa tu nombre de usuario')
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
			const res = await register({
				firstname: fn,
				lastname: ln,
				username: un,
				password,
			}).unwrap()
			dispatch(setStudentCredentials({ ...res }))
			toast.success(
				res?.accountCompleted
					? 'Cuenta completada — bienvenido a Ask to Learn'
					: 'Cuenta creada',
			)
			navigate(
				redirect === '/' ? '/students/mysubjects' : redirect,
			)
		} catch (err) {
			toast.error(
				err?.data?.message || err?.error || 'No se pudo registrar',
			)
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
									<h1 className='login-card__title'>Crea una cuenta</h1>
									<p className='login-card__subtitle'>
										Primero tu administrador escolar debe
										agregarte a su escuela. Luego usa el
										nombre de usuario que te dieron para
										establecer tu contraseña y completar
										tu cuenta.
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
											Nombre
										</label>
										<input
											type='text'
											id='register-firstname'
											name='firstname'
											className='login-input'
											placeholder='Nombre'
											autoComplete='given-name'
											value={firstname}
											disabled={isLoading}
											onChange={(e) => setFirstname(e.target.value)}
										/>
									</div>
									<div className='login-field'>
										<label className='login-label' htmlFor='register-lastname'>
											Apellido
										</label>
										<input
											type='text'
											id='register-lastname'
											name='lastname'
											className='login-input'
											placeholder='Apellido'
											autoComplete='family-name'
											value={lastname}
											disabled={isLoading}
											onChange={(e) => setLastname(e.target.value)}
										/>
									</div>
									<div className='login-field'>
										<label className='login-label' htmlFor='username'>
											Nombre de usuario
										</label>
										<input
											type='text'
											id='username'
											name='username'
											className='login-input'
											placeholder='ej. alex.rivera.4821'
											autoComplete='username'
											value={username}
											disabled={isLoading}
											onChange={(e) => setUsername(e.target.value)}
										/>
									</div>
									<div className='login-field'>
										<label className='login-label' htmlFor='password'>
											Contraseña
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
											Confirmar contraseña
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
										{isLoading ? 'Registrando…' : 'Registrarse'}
									</button>
								</form>
								<p className='login-card__footer'>
									Already have an account?{' '}
									<Link to='/login' className='login-card__link'>
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

export default RegisterScreen
