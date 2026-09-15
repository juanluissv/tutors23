import React, { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { toast } from 'react-toastify'
import TeacherSidebar from '../../components/TeacherSidebar'
import TeacherHeader from '../../components/TeacherHeader'
import {
	useGetTeacherProfileQuery,
	useUpdateTeacherProfileMutation,
} from '../../slices/teachers/teacherApiSlice'
import { setTeacherCredentials } from '../../slices/teachers/authTeacherSlice'
import { localizeApiError } from '../../utils/localizeApiMessage'
import '../../App.css'

function TeacherProfileScreen () {
	const dispatch = useDispatch()
	const { teacherInfo } = useSelector((state) => state.authTeacher)

	const [isSidebarOpen, setIsSidebarOpen] = useState(
		window.innerWidth > 768,
	)
	const [firstname, setFirstname] = useState('')
	const [lastname, setLastname] = useState('')
	const [email, setEmail] = useState('')
	const [image, setImage] = useState('')
	const [newPassword, setNewPassword] = useState('')
	const [confirmPassword, setConfirmPassword] = useState('')

	const {
		data: profile,
		isLoading,
		isError,
		error,
	} = useGetTeacherProfileQuery(undefined, {
		skip: !teacherInfo,
	})

	const [updateTeacherProfile, { isLoading: isSaving }] =
		useUpdateTeacherProfileMutation()

	useEffect(() => {
		if (!profile) {
			return
		}
		setFirstname(profile.firstname ?? '')
		setLastname(profile.lastname ?? '')
		setEmail(profile.email ?? '')
		setImage(
			profile.image && profile.image !== 'none' ? profile.image : '',
		)
	}, [profile])

	const toggleSidebar = () => {
		setIsSidebarOpen(!isSidebarOpen)
	}

	const fn = firstname?.trim() || ''
	const ln = lastname?.trim() || ''
	const initials = `${fn[0] ?? ''}${ln[0] ?? ''}`.toUpperCase()

	const handleSubmit = async (e) => {
		e.preventDefault()
		if (fn === '' || ln === '') {
			toast.error('El nombre y el apellido son obligatorios')
			return
		}
		if (newPassword !== '' || confirmPassword !== '') {
			if (newPassword.length < 6) {
				toast.error(
					'La nueva contraseña debe tener al menos 6 caracteres',
				)
				return
			}
			if (newPassword !== confirmPassword) {
				toast.error('Las contraseñas no coinciden')
				return
			}
		}

		const body = {
			firstname: fn,
			lastname: ln,
			email: email.trim(),
		}
		const imageTrim = image.trim()
		body.image = imageTrim === '' ? 'none' : imageTrim
		if (newPassword.trim() !== '') {
			body.password = newPassword
		}

		try {
			const updated = await updateTeacherProfile(body).unwrap()
			dispatch(
				setTeacherCredentials({
					...teacherInfo,
					_id: updated._id,
					firstname: updated.firstname,
					lastname: updated.lastname,
					email: updated.email,
					image: updated.image,
				}),
			)
			setNewPassword('')
			setConfirmPassword('')
			toast.success('Perfil actualizado correctamente')
		} catch (err) {
			toast.error(
				localizeApiError(err, 'No se pudo actualizar'),
			)
		}
	}

	const subjects = profile?.subjects ?? []
	const isBusy = isSaving
	const showForm = !isLoading && !isError && profile

	return (
		<div className='chat-app chat-app--teacher-login ask-screen'>
			<div className='main-container'>
				<TeacherSidebar
					isOpen={isSidebarOpen}
					toggleSidebar={toggleSidebar}
				/>
				<div className='main-content'>
					<TeacherHeader
						isSidebarOpen={isSidebarOpen}
						toggleSidebar={toggleSidebar}
					/>
					<div className='content-area content-area--login content-area--login-scroll'>
						<div className='center-content2 login-screen login-screen--wide login-screen--subject-form login-screen--offset-profile'>
							<div className='login-card'>
								<div className='login-card__accent' aria-hidden />
								<div className='login-card__header'>
									<div className='tp-avatar-wrapper'>
										<div className='tp-avatar'>
											{initials}
										</div>
									</div>
									<h1 className='login-card__title'>
										Mi perfil
									</h1>
									<p className='login-card__subtitle login-card__subtitle--wide'>
										Consulta y actualiza los datos de tu
										cuenta.
									</p>
								</div>

								{!teacherInfo && (
									<p className='login-card__subtitle'>
										Inicia sesión para administrar tu
										perfil.
									</p>
								)}

								{teacherInfo && isLoading && (
									<p className='login-card__subtitle'>
										Cargando perfil…
									</p>
								)}

								{teacherInfo && isError && (
									<p className='login-card__subtitle' role='alert'>
										{localizeApiError(
											error,
											'No se pudo cargar el perfil.',
										)}
									</p>
								)}

								{showForm && (
								<form
									className='login-form'
									id='teacher-profile-form'
									name='teacher-profile-form'
									onSubmit={handleSubmit}
								>
									<div className='tp-row'>
										<div className='login-field'>
											<label
												className='login-label'
												htmlFor='profile-first-name'
											>
												Nombre
											</label>
											<input
												type='text'
												id='profile-first-name'
												name='firstname'
												className='login-input'
												placeholder='Nombre'
												autoComplete='given-name'
												value={firstname}
												disabled={isBusy}
												onChange={(e) =>
													setFirstname(e.target.value)}
											/>
										</div>
										<div className='login-field'>
											<label
												className='login-label'
												htmlFor='profile-last-name'
											>
												Apellido
											</label>
											<input
												type='text'
												id='profile-last-name'
												name='lastname'
												className='login-input'
												placeholder='Apellido'
												autoComplete='family-name'
												value={lastname}
												disabled={isBusy}
												onChange={(e) =>
													setLastname(e.target.value)}
											/>
										</div>
									</div>

									<div className='login-field'>
										<label
											className='login-label'
											htmlFor='profile-email'
										>
											Correo electrónico
										</label>
										<input
											type='email'
											id='profile-email'
											name='email'
											className='login-input'
											placeholder='tu@escuela.edu'
											autoComplete='email'
											value={email}
											disabled={isBusy}
											onChange={(e) =>
												setEmail(e.target.value)}
										/>
									</div>

									<div className='login-field'>
										<label
											className='login-label'
											htmlFor='profile-image'
										>
											Enlace de la imagen de perfil
										</label>
										<input
											type='url'
											id='profile-image'
											name='image'
											className='login-input'
											placeholder='https://…'
											autoComplete='off'
											value={image}
											disabled={isBusy}
											onChange={(e) =>
												setImage(e.target.value)}
										/>
									</div>

									<div className='tp-row'>
										<div className='login-field'>
											<label
												className='login-label'
												htmlFor='profile-new-password'
											>
												Nueva contraseña
											</label>
											<input
												type='password'
												id='profile-new-password'
												name='newPassword'
												className='login-input'
												placeholder={
													'Déjalo en blanco para mantener la actual'
												}
												autoComplete='new-password'
												value={newPassword}
												disabled={isBusy}
												onChange={(e) =>
													setNewPassword(e.target.value)}
											/>
										</div>
										<div className='login-field'>
											<label
												className='login-label'
												htmlFor='profile-confirm-password'
											>
												Confirmar nueva contraseña
											</label>
											<input
												type='password'
												id='profile-confirm-password'
												name='confirmPassword'
												className='login-input'
												placeholder='Confirmar'
												autoComplete='new-password'
												value={confirmPassword}
												disabled={isBusy}
												onChange={(e) =>
													setConfirmPassword(
														e.target.value,
													)}
											/>
										</div>
									</div>

									{subjects.length > 0 && (
										<div className='login-field'>
											<span className='login-label'>
												Tus materias
											</span>
											<ul
												className='login-card__subtitle'
												style={{
													margin: '0.5rem 0 0',
													paddingLeft: '1.25rem',
												}}
											>
												{subjects.map((sub) => (
													<li key={sub._id}>
														{sub.title
															|| 'Materia sin título'}
													</li>
												))}
											</ul>
										</div>
									)}

									<button
										type='submit'
										className='login-submit'
										disabled={isBusy}
									>
										{isBusy
											? 'Guardando…'
											: 'Guardar cambios'}
									</button>
								</form>
								)}
							</div>
						</div>
					</div>
				</div>
			</div>
		</div>
	)
}

export default TeacherProfileScreen
