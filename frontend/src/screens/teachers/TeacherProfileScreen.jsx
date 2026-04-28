import React, { useState } from 'react'
import { toast } from 'react-toastify'
import TeacherSidebar from '../../components/TeacherSidebar'
import TeacherHeader from '../../components/TeacherHeader'
import '../../App.css'

const demoProfile = {
	firstName: 'Ana',
	lastName: 'Smith',
	email: 'ana.smith@school.edu',
	phone: '+1 (555) 234-5678',
	subject: 'LinkedIn Marketing',
	bio: 'Passionate educator with 8 years of experience in digital marketing and social media strategy.',
}

function TeacherProfileScreen () {
	const [isSidebarOpen, setIsSidebarOpen] = useState(
		window.innerWidth > 768,
	)
	const [firstName, setFirstName] = useState(demoProfile.firstName)
	const [lastName, setLastName] = useState(demoProfile.lastName)
	const [email, setEmail] = useState(demoProfile.email)
	const [phone, setPhone] = useState(demoProfile.phone)
	const [subject, setSubject] = useState(demoProfile.subject)
	const [bio, setBio] = useState(demoProfile.bio)
	const [isSaving, setIsSaving] = useState(false)

	const toggleSidebar = () => {
		setIsSidebarOpen(!isSidebarOpen)
	}

	const initials = `${firstName[0] ?? ''}${lastName[0] ?? ''}`.toUpperCase()

	const handleSubmit = async (e) => {
		e.preventDefault()
		if (firstName.trim() === '' || lastName.trim() === '') {
			toast.error('First and last name are required')
			return
		}
		setIsSaving(true)
		try {
			await new Promise((r) => setTimeout(r, 500))
			toast.success('Profile updated successfully')
		} finally {
			setIsSaving(false)
		}
	}

	return (
		<div className='chat-app chat-app--login chat-app--teacher-login ask-screen'>
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
						<div className='center-content2 login-screen login-screen--wide'>
							<div className='login-card'>
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
										Update your personal information and
										preferences.
									</p>
								</div>

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
												name='firstName'
												className='login-input'
												placeholder='First name'
												autoComplete='given-name'
												value={firstName}
												disabled={isSaving}
												onChange={(e) =>
													setFirstName(e.target.value)}
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
												name='lastName'
												className='login-input'
												placeholder='Last name'
												autoComplete='family-name'
												value={lastName}
												disabled={isSaving}
												onChange={(e) =>
													setLastName(e.target.value)}
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
											disabled={isSaving}
											onChange={(e) =>
												setEmail(e.target.value)}
										/>
									</div>

									<div className='login-field'>
										<label
											className='login-label'
											htmlFor='profile-phone'
										>
											Phone number
										</label>
										<input
											type='tel'
											id='profile-phone'
											name='phone'
											className='login-input'
											placeholder='+1 (555) 000-0000'
											autoComplete='tel'
											value={phone}
											disabled={isSaving}
											onChange={(e) =>
												setPhone(e.target.value)}
										/>
									</div>

									<div className='login-field'>
										<label
											className='login-label'
											htmlFor='profile-subject'
										>
											Primary subject
										</label>
										<input
											type='text'
											id='profile-subject'
											name='subject'
											className='login-input'
											placeholder='e.g. Algebra I'
											autoComplete='off'
											value={subject}
											disabled={isSaving}
											onChange={(e) =>
												setSubject(e.target.value)}
										/>
									</div>

									<div className='login-field'>
										<label
											className='login-label'
											htmlFor='profile-bio'
										>
											Bio
										</label>
										<textarea
											id='profile-bio'
											name='bio'
											className='login-input login-textarea'
											placeholder='Tell students a bit about yourself...'
											rows={4}
											value={bio}
											disabled={isSaving}
											onChange={(e) =>
												setBio(e.target.value)}
										/>
									</div>

									<button
										type='submit'
										className='login-submit'
										disabled={isSaving}
									>
										{isSaving
											? 'Saving…'
											: 'Save changes'}
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

export default TeacherProfileScreen
