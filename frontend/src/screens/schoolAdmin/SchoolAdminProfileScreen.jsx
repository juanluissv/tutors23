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
			toast.error('Please enter your first name')
			return
		}
		if (lastname.trim() === '') {
			toast.error('Please enter your last name')
			return
		}
		if (email.trim() === '') {
			toast.error('Please enter your email')
			return
		}
		if (newPassword !== '' || confirmPassword !== '') {
			if (newPassword !== confirmPassword) {
				toast.error('New passwords do not match')
				return
			}
			if (newPassword.length < 6) {
				toast.error('New password must be at least 6 characters')
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
			toast.success('Profile updated')
		} catch (err) {
			toast.error(err?.data?.message || err?.error?.message)
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
					<div className='content-area content-area--login'>
						<div className='center-content2 login-screen login-screen--wide'>
							<div className='login-card'>
								<div className='login-card__accent' aria-hidden />
								<div className='login-card__header'>
									<h1 className='login-card__title'><br /><br /><br /><br />
										Your profile
									</h1>
									<p className='login-card__subtitle login-card__subtitle--wide'>
										View and update your school admin details.
										Leave password fields blank to keep your
										current password.
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
												First name
											</label>
											<input
												type='text'
												id='schooladmin-profile-firstname'
												name='firstname'
												className='login-input'
												placeholder='First name'
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
												Last name
											</label>
											<input
												type='text'
												id='schooladmin-profile-lastname'
												name='lastname'
												className='login-input'
												placeholder='Last name'
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
											Email address
										</label>
										<input
											type='email'
											id='schooladmin-profile-email'
											name='email'
											className='login-input'
											placeholder='you@school.edu'
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
											Job title
										</label>
										<input
											type='text'
											id='schooladmin-profile-jobtitle'
											name='jobtitle'
											className='login-input'
											placeholder='e.g. Principal, Registrar'
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
											About
										</label>
										<textarea
											id='schooladmin-profile-about'
											name='about'
											className='login-input login-textarea'
											placeholder='A short note about your role or school…'
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
												New password (optional)
											</label>
											<input
												type='password'
												id='schooladmin-profile-new-password'
												name='newPassword'
												className='login-input'
												placeholder='••••••••'
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
												Confirm new password
											</label>
											<input
												type='password'
												id='schooladmin-profile-confirm-password'
												name='confirmPassword'
												className='login-input'
												placeholder='••••••••'
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
										{isLoading ? 'Saving…' : 'Save changes'}
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
