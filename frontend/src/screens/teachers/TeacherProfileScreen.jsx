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
			toast.error('First and last name are required')
			return
		}
		if (newPassword !== '' || confirmPassword !== '') {
			if (newPassword.length < 6) {
				toast.error('New password must be at least 6 characters')
				return
			}
			if (newPassword !== confirmPassword) {
				toast.error('Passwords do not match')
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
			toast.success('Profile updated successfully')
		} catch (err) {
			toast.error(err?.data?.message || err?.error || 'Update failed')
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
					<div className='content-area content-area--login'>
						<div className='center-content2 login-screen login-screen--wide'><br /><br /><br />
							<div className='login-card'><br /><br /><br />
								<div className='login-card__accent' aria-hidden />
								<div className='login-card__header'>
									<div className='tp-avatar-wrapper'>
										<div className='tp-avatar'>
											{initials}
										</div>
									</div>
									<h1 className='login-card__title'>
										My Profile
									</h1>
									<p className='login-card__subtitle login-card__subtitle--wide'>
										View and update your account details.
									</p>
								</div>

								{!teacherInfo && (
									<p className='login-card__subtitle'>
										Sign in to manage your profile.
									</p>
								)}

								{teacherInfo && isLoading && (
									<p className='login-card__subtitle'>
										Loading profile…
									</p>
								)}

								{teacherInfo && isError && (
									<p className='login-card__subtitle' role='alert'>
										{error?.data?.message
											|| error?.error
											|| 'Could not load profile.'}
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
												First name
											</label>
											<input
												type='text'
												id='profile-first-name'
												name='firstname'
												className='login-input'
												placeholder='First name'
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
												Last name
											</label>
											<input
												type='text'
												id='profile-last-name'
												name='lastname'
												className='login-input'
												placeholder='Last name'
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
											Email address
										</label>
										<input
											type='email'
											id='profile-email'
											name='email'
											className='login-input'
											placeholder='you@school.edu'
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
											Profile image URL
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
												New password
											</label>
											<input
												type='password'
												id='profile-new-password'
												name='newPassword'
												className='login-input'
												placeholder='Leave blank to keep current'
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
												Confirm new password
											</label>
											<input
												type='password'
												id='profile-confirm-password'
												name='confirmPassword'
												className='login-input'
												placeholder='Confirm'
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
												Your subjects
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
															|| 'Untitled subject'}
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
										{isBusy ? 'Saving…' : 'Save changes'}
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
