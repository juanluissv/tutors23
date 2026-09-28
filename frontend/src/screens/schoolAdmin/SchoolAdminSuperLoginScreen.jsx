import { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useDispatch } from 'react-redux'
import { toast } from 'react-toastify'
import {
	useLoginSuperAdminMutation,
	useGetSchoolsForSuperAdminLoginQuery,
} from '../../slices/admin/schoolAdminApiSlice'
import { setSchoolAdminCredentials } from '../../slices/admin/authSchoolAdminSlice'
import TeacherSidebar from '../../components/TeacherSidebar'
import AdminHeader from '../../components/AdminHeader'
import '../../App.css'

function SchoolAdminSuperLoginScreen () {
	const isSidebarOpen = false

	const handleToggleSidebar = () => {}

	const navigate = useNavigate()
	const dispatch = useDispatch()

	const [email, setEmail] = useState('')
	const [password, setPassword] = useState('')
	const [schoolId, setSchoolId] = useState('')

	const [loginSuperAdmin, { isLoading: isLoggingIn }] =
		useLoginSuperAdminMutation()

	const {
		data: schools = [],
		isLoading: isLoadingSchools,
		isError: isSchoolsError,
	} = useGetSchoolsForSuperAdminLoginQuery()

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
		if (schoolId === '') {
			toast.error('Por favor selecciona una escuela')
			return
		}
		try {
			const res = await loginSuperAdmin({
				email,
				password,
				schoolId,
			}).unwrap()
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

	const isLoading = isLoggingIn || isLoadingSchools

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
										Super administrador
									</h1>
									<p className='login-card__subtitle'>
										Inicia sesión y elige el panel de
										administración al que deseas acceder
									</p>
								</div>
								<form
									className='login-form'
									id='superadmin-login-form'
									name='superadmin-login-form'
									onSubmit={handleSubmit}
								>
									<div className='login-field'>
										<label
											className='login-label'
											htmlFor='superadmin-email'
										>
											Correo electrónico
										</label>
										<input
											type='email'
											id='superadmin-email'
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
											htmlFor='superadmin-password'
										>
											Contraseña
										</label>
										<input
											type='password'
											id='superadmin-password'
											name='password'
											className='login-input'
											placeholder='••••••••'
											autoComplete='current-password'
											onChange={(e) => setPassword(e.target.value)}
											value={password}
											disabled={isLoading}
										/>
									</div>
									<div className='login-field'>
										<label
											className='login-label'
											htmlFor='superadmin-school'
										>
											Escuela
										</label>
										<select
											id='superadmin-school'
											name='schoolId'
											className='login-input'
											value={schoolId}
											onChange={(e) => setSchoolId(e.target.value)}
											disabled={isLoading || isSchoolsError}
										>
											<option value=''>
												{isLoadingSchools
													? 'Cargando escuelas…'
													: 'Selecciona una escuela'}
											</option>
											{schools.map((school) => (
												<option
													key={school._id}
													value={school._id}
												>
													{school.name}
													{school.city
														? ` — ${school.city}`
														: ''}
												</option>
											))}
										</select>
									</div>
									<button
										type='submit'
										id='superadmin-login-button'
										name='login-button'
										className='login-submit'
										disabled={isLoading}
									>
										{isLoggingIn
											? 'Iniciando sesión…'
											: 'Iniciar sesión'}
									</button>
								</form>
								
							</div>
						</div>
					</div>
				</div>
			</div>
		</div>
	)
}

export default SchoolAdminSuperLoginScreen
