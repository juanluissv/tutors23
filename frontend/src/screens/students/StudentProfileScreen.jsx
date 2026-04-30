import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { toast } from 'react-toastify'
import Sidebar from '../../components/Sidebar'
import Header from '../../components/Header'
import {
	useGetProfileQuery,
	useUpdateProfileMutation,
} from '../../slices/student/studentApiSlice'
import { setStudentCredentials } from '../../slices/student/authStudentSlice'
import '../../App.css'

function StudentProfileScreen () {
	const dispatch = useDispatch()
	const { studentInfo } = useSelector((state) => state.authStudent)

	const [isSidebarOpen, setIsSidebarOpen] = useState(
		window.innerWidth > 768,
	)
	const [firstname, setFirstname] = useState('')
	const [lastname, setLastname] = useState('')
	const [email, setEmail] = useState('')
	const [city, setCity] = useState('')
	const [country, setCountry] = useState('')
	const [birthDate, setBirthDate] = useState('')
	const [newPassword, setNewPassword] = useState('')
	const [confirmPassword, setConfirmPassword] = useState('')

	const {
		data: profile,
		isLoading,
		isError,
		error,
	} = useGetProfileQuery(undefined, {
		skip: !studentInfo,
	})

	const [updateProfile, { isLoading: isSaving }] = useUpdateProfileMutation()

	useEffect(() => {
		if (!profile) {
			return
		}
		setFirstname(profile.firstname ?? '')
		setLastname(profile.lastname ?? '')
		setEmail(profile.email ?? '')
		setCity(profile.city ?? '')
		setCountry(profile.country ?? '')
		setBirthDate(profile.birthDate ?? '')
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
			city: city.trim(),
			country: country.trim(),
			birthDate: birthDate.trim() === '' ? '' : birthDate.trim(),
		}
		if (newPassword.trim() !== '') {
			body.password = newPassword
		}

		try {
			const updated = await updateProfile(body).unwrap()
			dispatch(
				setStudentCredentials({
					...studentInfo,
					_id: updated._id,
					firstname: updated.firstname,
					lastname: updated.lastname,
					email: updated.email,
					country: updated.country,
					city: updated.city,
					subscriptions: updated.subscriptions,
					subjects: updated.subjects ?? studentInfo?.subjects ?? [],
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
		<div className='chat-app chat-app--login ask-screen'>
			<div className='main-container'>
				<Sidebar isOpen={isSidebarOpen} toggleSidebar={toggleSidebar} />
				<div className='main-content'>
					<Header
						isSidebarOpen={isSidebarOpen}
						toggleSidebar={toggleSidebar}
					/>
					<div className='content-area content-area--login'>
						<div
							className={
								'center-content2 login-screen login-screen--wide'
							}
						>
							<br /><br /><br />
							<div className='login-card'>
								<br /><br /><br />
								<div
									className='login-card__accent'
									aria-hidden
								/>
								<div className='login-card__header'>
									<div className='tp-avatar-wrapper'>
										<div className='tp-avatar'>
											{initials}
										</div>
									</div>
									<h1 className='login-card__title'>
										My profile
									</h1>
									<p
										className={
											'login-card__subtitle ' +
											'login-card__subtitle--wide'
										}
									>
										View and update your account details.
									</p>
								</div>

								{!studentInfo && (
									<p className='login-card__subtitle'>
										<Link to='/login'>Sign in</Link>
										{' '}
										to manage your profile.
									</p>
								)}

								{studentInfo && isLoading && (
									<p className='login-card__subtitle'>
										Loading profile…
									</p>
								)}

								{studentInfo && isError && (
									<p
										className='login-card__subtitle'
										role='alert'
									>
										{error?.data?.message
											|| error?.error
											|| 'Could not load profile.'}
									</p>
								)}

								{showForm && (
								<form
									className='login-form'
									id='student-profile-form'
									name='student-profile-form'
									onSubmit={handleSubmit}
								>
									<div className='tp-row'>
										<div className='login-field'>
											<label
												className='login-label'
												htmlFor='sp-first-name'
											>
												First name
											</label>
											<input
												type='text'
												id='sp-first-name'
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
												htmlFor='sp-last-name'
											>
												Last name
											</label>
											<input
												type='text'
												id='sp-last-name'
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
											htmlFor='sp-email'
										>
											Email address
										</label>
										<input
											type='email'
											id='sp-email'
											name='email'
											className='login-input'
											placeholder='you@example.com'
											autoComplete='email'
											value={email}
											disabled={isBusy}
											onChange={(e) =>
												setEmail(e.target.value)}
										/>
									</div>

									<div className='tp-row'>
										<div className='login-field'>
											<label
												className='login-label'
												htmlFor='sp-city'
											>
												City
											</label>
											<input
												type='text'
												id='sp-city'
												name='city'
												className='login-input'
												placeholder='City'
												autoComplete='address-level2'
												value={city}
												disabled={isBusy}
												onChange={(e) =>
													setCity(e.target.value)}
											/>
										</div>
										<div className='login-field'>
											<label
												className='login-label'
												htmlFor='sp-country'
											>
												Country
											</label>
											<input
												type='text'
												id='sp-country'
												name='country'
												className='login-input'
												placeholder='Country'
												autoComplete='country-name'
												value={country}
												disabled={isBusy}
												onChange={(e) =>
													setCountry(e.target.value)}
											/>
										</div>
									</div>

									<div className='login-field'>
										<label
											className='login-label'
											htmlFor='sp-birth-date'
										>
											Birth date (optional)
										</label>
										<input
											type='date'
											id='sp-birth-date'
											name='birthDate'
											className='login-input'
											autoComplete='bday'
											value={birthDate}
											disabled={isBusy}
											onChange={(e) =>
												setBirthDate(e.target.value)}
										/>
									</div>

									<div className='tp-row'>
										<div className='login-field'>
											<label
												className='login-label'
												htmlFor='sp-new-password'
											>
												New password
											</label>
											<input
												type='password'
												id='sp-new-password'
												name='newPassword'
												className='login-input'
												placeholder={
													'Leave blank to keep current'
												}
												autoComplete='new-password'
												value={newPassword}
												disabled={isBusy}
												onChange={(e) =>
													setNewPassword(
														e.target.value,
													)}
											/>
										</div>
										<div className='login-field'>
											<label
												className='login-label'
												htmlFor='sp-confirm-password'
											>
												Confirm new password
											</label>
											<input
												type='password'
												id='sp-confirm-password'
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

export default StudentProfileScreen
