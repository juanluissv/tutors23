import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { toast } from 'react-toastify'
import { useUpdateSchoolAdminProfileMutation } from '../../slices/admin/schoolAdminApiSlice'
import { setSchoolAdminCredentials } from '../../slices/admin/authSchoolAdminSlice'
import AdminSidebar from '../../components/AdminSidebar'
import AdminHeader from '../../components/AdminHeader'
import '../../App.css'

function SchoolAdminProfileScreen () {
	const navigate = useNavigate()
	const dispatch = useDispatch()
	const { schoolAdminInfo } = useSelector((state) => state.authSchoolAdmin)

	const [isSidebarOpen, setIsSidebarOpen] = useState(
		window.innerWidth > 768,
	)
	const [firstname, setFirstname] = useState('')
	const [lastname, setLastname] = useState('')
	const [email, setEmail] = useState('')
	const [jobtitle, setJobtitle] = useState('')
	const [about, setAbout] = useState('')
	const [newPassword, setNewPassword] = useState('')
	const [confirmPassword, setConfirmPassword] = useState('')

	const [updateSchoolAdminProfile, { isLoading }] =
		useUpdateSchoolAdminProfileMutation()

	const toggleSidebar = () => {
		setIsSidebarOpen(!isSidebarOpen)
	}

	useEffect(() => {
		if (!schoolAdminInfo) {
			navigate('/schooladmins/login', { replace: true })
		}
	}, [schoolAdminInfo, navigate])

	useEffect(() => {
		if (!schoolAdminInfo) {
			return
		}
		setFirstname(schoolAdminInfo.firstname ?? '')
		setLastname(schoolAdminInfo.lastname ?? '')
		setEmail(schoolAdminInfo.email ?? '')
		setJobtitle(schoolAdminInfo.jobtitle ?? '')
		setAbout(schoolAdminInfo.about ?? '')
		setNewPassword('')
		setConfirmPassword('')
	}, [schoolAdminInfo])

	const handleSubmit = async (e) => {
		e.preventDefault()
		if (firstname.trim() === '') {
			toast.error('Ingresa tu nombre')
			return
		}
		if (lastname.trim() === '') {
			toast.error('Ingresa tu apellido')
			return
		}
		if (email.trim() === '') {
			toast.error('Ingresa tu correo electrónico')
			return
		}
		if (newPassword !== '' || confirmPassword !== '') {
			if (newPassword !== confirmPassword) {
				toast.error('Las contraseñas no coinciden')
				return
			}
			if (newPassword.length < 6) {
				toast.error(
					'La nueva contraseña debe tener al menos 6 caracteres',
				)
				return
			}
		}

		const body = {
			firstname: firstname.trim(),
			lastname: lastname.trim(),
			email: email.trim(),
			jobtitle: jobtitle.trim(),
			about: about.trim(),
		}
		if (newPassword.trim() !== '') {
			body.password = newPassword
		}

		try {
			const res = await updateSchoolAdminProfile(body).unwrap()
			dispatch(
				setSchoolAdminCredentials({
					...schoolAdminInfo,
					...res,
				}),
			)
			setNewPassword('')
			setConfirmPassword('')
			toast.success('Perfil actualizado correctamente')
		} catch (err) {
			toast.error(
				err?.data?.message
					|| err?.error?.message
					|| 'No se pudo actualizar',
			)
		}
	}

	if (!schoolAdminInfo) {
		return null
	}

	return (
		// <div className='chat-app chat-app--login chat-app--teacher-login ask-screen'>
		<div className='chat-app chat-app--teacher-login ask-screen'>

			<div className='main-container'>
			<AdminSidebar isOpen={isSidebarOpen} toggleSidebar={toggleSidebar} />

				<div className='main-content'>
					<AdminHeader
						isSidebarOpen={isSidebarOpen}
						toggleSidebar={toggleSidebar}
					/>
					<div className='content-area content-area--login content-area--login-scroll'>
						<div className='center-content2 login-screen login-screen--wide login-screen--subject-form'>
							<div className='login-card'>
								<div className='login-card__accent' aria-hidden />
								<div className='login-card__header'>
									<h1 className='login-card__title'>
										Tu perfil
									</h1>
									<p className='login-card__subtitle login-card__subtitle--wide'>
										Consulta y actualiza los datos de tu
										cuenta de administrador escolar. Deja los
										campos de contraseña en blanco para
										mantener la actual.
									</p>
								</div>
								<form
									className='login-form'
									id='schooladmin-profile-form'
									name='schooladmin-profile-form'
									onSubmit={handleSubmit}
								>
									<div className='tp-row'>
										<div className='login-field'>
											<label
												className='login-label'
												htmlFor='schooladmin-profile-firstname'
											>
												Nombre
											</label>
											<input
												type='text'
												id='schooladmin-profile-firstname'
												name='firstname'
												className='login-input'
												placeholder='Nombre'
												autoComplete='given-name'
												value={firstname}
												disabled={isLoading}
												onChange={(e) =>
													setFirstname(e.target.value)}
											/>
										</div>
										<div className='login-field'>
											<label
												className='login-label'
												htmlFor='schooladmin-profile-lastname'
											>
												Apellido
											</label>
											<input
												type='text'
												id='schooladmin-profile-lastname'
												name='lastname'
												className='login-input'
												placeholder='Apellido'
												autoComplete='family-name'
												value={lastname}
												disabled={isLoading}
												onChange={(e) =>
													setLastname(e.target.value)}
											/>
										</div>
									</div>
									<div className='login-field'>
										<label
											className='login-label'
											htmlFor='schooladmin-profile-email'
										>
											Correo electrónico
										</label>
										<input
											type='email'
											id='schooladmin-profile-email'
											name='email'
											className='login-input'
											placeholder='tu@escuela.edu'
											autoComplete='email'
											value={email}
											disabled={isLoading}
											onChange={(e) =>
												setEmail(e.target.value)}
										/>
									</div>
									<div className='login-field'>
										<label
											className='login-label'
											htmlFor='schooladmin-profile-jobtitle'
										>
											Cargo
										</label>
										<input
											type='text'
											id='schooladmin-profile-jobtitle'
											name='jobtitle'
											className='login-input'
											placeholder='p. ej. Director, Registrador'
											autoComplete='organization-title'
											value={jobtitle}
											disabled={isLoading}
											onChange={(e) =>
												setJobtitle(e.target.value)}
										/>
									</div>
									<div className='login-field'>
										<label
											className='login-label'
											htmlFor='schooladmin-profile-about'
										>
											Acerca de
										</label>
										<textarea
											id='schooladmin-profile-about'
											name='about'
											className='login-input login-textarea'
											placeholder='Una breve descripción de tu rol o escuela…'
											rows={5}
											value={about}
											disabled={isLoading}
											onChange={(e) =>
												setAbout(e.target.value)}
										/>
									</div>
									<div className='tp-row'>
										<div className='login-field'>
											<label
												className='login-label'
												htmlFor='schooladmin-profile-new-password'
											>
												Nueva contraseña (opcional)
											</label>
											<input
												type='password'
												id='schooladmin-profile-new-password'
												name='newPassword'
												className='login-input'
												placeholder='Déjalo en blanco para mantener la actual'
												autoComplete='new-password'
												value={newPassword}
												disabled={isLoading}
												onChange={(e) =>
													setNewPassword(e.target.value)}
											/>
										</div>
										<div className='login-field'>
											<label
												className='login-label'
												htmlFor='schooladmin-profile-confirm-password'
											>
												Confirmar nueva contraseña
											</label>
											<input
												type='password'
												id='schooladmin-profile-confirm-password'
												name='confirmPassword'
												className='login-input'
												placeholder='Confirmar'
												autoComplete='new-password'
												value={confirmPassword}
												disabled={isLoading}
												onChange={(e) =>
													setConfirmPassword(
														e.target.value,
													)}
											/>
										</div>
									</div>
									<button
										type='submit'
										id='schooladmin-profile-save'
										className='login-submit'
										disabled={isLoading}
									>
										{isLoading ? 'Guardando…' : 'Guardar cambios'}
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

export default SchoolAdminProfileScreen
