import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { toast } from 'react-toastify'
import { useCreateSchoolMutation } from '../../slices/admin/schoolAdminApiSlice'
import { setSchoolAdminCredentials } from '../../slices/admin/authSchoolAdminSlice'
import AdminSidebar from '../../components/AdminSidebar'
import AdminHeader from '../../components/AdminHeader'
import '../../App.css'

function SchoolAdminRegisterSchoolScreen () {
	const navigate = useNavigate()
	const dispatch = useDispatch()
	const { schoolAdminInfo } = useSelector((state) => state.authSchoolAdmin)

	const [isSidebarOpen, setIsSidebarOpen] = useState(
		window.innerWidth > 768,
	)
	const [name, setName] = useState('')
	const [country, setCountry] = useState('')
	const [city, setCity] = useState('')
	const [address, setAddress] = useState('')

	const [createSchool, { isLoading }] = useCreateSchoolMutation()

	const toggleSidebar = () => {
		setIsSidebarOpen(!isSidebarOpen)
	}

	useEffect(() => {
		if (!schoolAdminInfo) {
			navigate('/schooladmins/login', { replace: true })
		}
	}, [schoolAdminInfo, navigate])

	const handleSubmit = async (e) => {
		e.preventDefault()
		if (name.trim() === '') {
			toast.error('Please enter the school name')
			return
		}

		const body = {
			name: name.trim(),
			country: country.trim(),
			city: city.trim(),
			address: address.trim(),
		}

		try {
			const res = await createSchool(body).unwrap()
			dispatch(
				setSchoolAdminCredentials({
					...schoolAdminInfo,
					school: res._id,
				}),
			)
			toast.success('School created')
			navigate('/schooladmins/profile', { replace: true })
		} catch (err) {
			toast.error(
				err?.data?.message || err?.error?.message || 'Could not create school',
			)
		}
	}

	if (!schoolAdminInfo) {
		return null
	}

	if (schoolAdminInfo.school) {
		return (
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
										<h1 className='login-card__title'>
											<br /><br /><br /><br />
											School already registered
										</h1>
										<p className='login-card__subtitle login-card__subtitle--wide'>
											Your account is already linked to a school.
											Update your profile or contact support if
											you need to make changes.
										</p>
									</div>
									<p className='login-card__subtitle login-card__subtitle--wide'>
										<Link to='/schooladmins/profile'>
											Go to your profile
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

	return (
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
									<h1 className='login-card__title'>
										<br /><br /><br /><br />
										Register your school
									</h1>
									<p className='login-card__subtitle login-card__subtitle--wide'>
										Add your institution so you can manage teachers,
										students, and subjects from your dashboard.
									</p>
								</div>
								<form
									className='login-form'
									id='schooladmin-register-school-form'
									name='schooladmin-register-school-form'
									onSubmit={handleSubmit}
								>
									<div className='login-field'>
										<label
											className='login-label'
											htmlFor='schooladmin-register-school-name'
										>
											School name
										</label>
										<input
											type='text'
											id='schooladmin-register-school-name'
											name='name'
											className='login-input'
											placeholder='e.g. Lincoln High School'
											autoComplete='organization'
											value={name}
											disabled={isLoading}
											onChange={(e) => setName(e.target.value)}
										/>
									</div>
									<div className='tp-row'>
										<div className='login-field'>
											<label
												className='login-label'
												htmlFor='schooladmin-register-school-country'
											>
												Country
											</label>
											<input
												type='text'
												id='schooladmin-register-school-country'
												name='country'
												className='login-input'
												placeholder='Country'
												autoComplete='country-name'
												value={country}
												disabled={isLoading}
												onChange={(e) =>
													setCountry(e.target.value)}
											/>
										</div>
										<div className='login-field'>
											<label
												className='login-label'
												htmlFor='schooladmin-register-school-city'
											>
												City
											</label>
											<input
												type='text'
												id='schooladmin-register-school-city'
												name='city'
												className='login-input'
												placeholder='City'
												autoComplete='address-level2'
												value={city}
												disabled={isLoading}
												onChange={(e) =>
													setCity(e.target.value)}
											/>
										</div>
									</div>
									<div className='login-field'>
										<label
											className='login-label'
											htmlFor='schooladmin-register-school-address'
										>
											Address
										</label>
										<input
											type='text'
											id='schooladmin-register-school-address'
											name='address'
											className='login-input'
											placeholder='Street, number, district…'
											autoComplete='street-address'
											value={address}
											disabled={isLoading}
											onChange={(e) =>
												setAddress(e.target.value)}
										/>
									</div>
									<button
										type='submit'
										id='schooladmin-register-school-submit'
										className='login-submit'
										disabled={isLoading}
									>
										{isLoading ? 'Creating…' : 'Create school'}
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

export default SchoolAdminRegisterSchoolScreen
