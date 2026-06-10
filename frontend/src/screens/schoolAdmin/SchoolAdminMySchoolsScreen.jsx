import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useSelector } from 'react-redux'
import { toast } from 'react-toastify'
import {
	useGetSchoolByIdQuery,
	useUpdateSchoolMutation,
} from '../../slices/admin/schoolAdminApiSlice'
import AdminSidebar from '../../components/AdminSidebar'
import AdminHeader from '../../components/AdminHeader'
import {
	gradeLevelNamesFromApi,
	normalizeGradeLevels,
} from '../../utils/gradeLevel'
import '../../App.css'

const SCHOOL_TYPE_OPTIONS = [
	{ value: 'high school', label: 'High school' },
	{ value: 'university', label: 'University' },
]

function resolveSchoolId (school) {
	if (!school) {
		return null
	}
	if (typeof school === 'string') {
		return school
	}
	if (typeof school === 'object' && school._id) {
		return String(school._id)
	}
	return null
}

function SchoolAdminMySchoolsScreen () {
	const navigate = useNavigate()
	const { schoolAdminInfo } = useSelector((state) => state.authSchoolAdmin)
	const schoolId = schoolAdminInfo
		? resolveSchoolId(schoolAdminInfo.school)
		: null

	const [isSidebarOpen, setIsSidebarOpen] = useState(
		window.innerWidth > 768,
	)
	const [name, setName] = useState('')
	const [schoolType, setSchoolType] = useState('')
	const [gradesLevels, setGradesLevels] = useState([])
	const [newGradeLevel, setNewGradeLevel] = useState('')
	const [country, setCountry] = useState('')
	const [city, setCity] = useState('')
	const [address, setAddress] = useState('')

	const {
		data: schoolData,
		isLoading: isLoadingSchool,
		isError: isSchoolQueryError,
		refetch: refetchSchool,
	} = useGetSchoolByIdQuery(schoolId, {
		skip: !schoolId,
	})

	const [updateSchool, { isLoading: isUpdating }] = useUpdateSchoolMutation()
	const isBusy = isLoadingSchool || isUpdating

	const toggleSidebar = () => {
		setIsSidebarOpen(!isSidebarOpen)
	}

	useEffect(() => {
		if (!schoolAdminInfo) {
			navigate('/schooladmins/login', { replace: true })
		}
	}, [schoolAdminInfo, navigate])

	useEffect(() => {
		if (schoolData) {
			setName(schoolData.name ?? '')
			setSchoolType(schoolData.schoolType ?? '')
			setGradesLevels(normalizeGradeLevels(schoolData.gradesLevels))
			setCountry(schoolData.country ?? '')
			setCity(schoolData.city ?? '')
			setAddress(schoolData.address ?? '')
		}
	}, [schoolData])

	const handleAddGradeLevel = () => {
		const trimmed = newGradeLevel.trim()
		if (trimmed === '') {
			return
		}
		if (gradesLevels.some((level) => level.name === trimmed)) {
			toast.error('That grade level is already in the list')
			return
		}
		setGradesLevels([...gradesLevels, { name: trimmed }])
		setNewGradeLevel('')
	}

	const handleRemoveGradeLevel = (level) => {
		setGradesLevels(
			gradesLevels.filter((item) => item._id !== level._id
				&& item.name !== level.name),
		)
	}

	const handleSubmit = async (e) => {
		e.preventDefault()
		if (name.trim() === '') {
			toast.error('Please enter the school name')
			return
		}
		if (schoolType.trim() === '') {
			toast.error('Please select a school type')
			return
		}
		if (gradesLevels.length === 0) {
			toast.error('Please add at least one grade level')
			return
		}
		if (country.trim() === '') {
			toast.error('Please enter the country')
			return
		}
		if (city.trim() === '') {
			toast.error('Please enter the city')
			return
		}
		if (!schoolId) {
			return
		}
		try {
			await updateSchool({
				id: schoolId,
				name: name.trim(),
				schoolType,
				gradesLevels: gradeLevelNamesFromApi(gradesLevels),
				country: country.trim(),
				city: city.trim(),
				address: address.trim(),
			}).unwrap()
			toast.success('School updated')
		} catch (err) {
			toast.error(
				err?.data?.message || err?.error?.message || 'Could not update school',
			)
		}
	}

	if (!schoolAdminInfo) {
		return null
	}

	if (!schoolId) {
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
											No school yet
										</h1>
										<p className='login-card__subtitle login-card__subtitle--wide'>
											Register your school first, then you can
											view and edit its details here.
										</p>
									</div>
									<p className='login-card__subtitle login-card__subtitle--wide'>
										<Link to='/schooladmins/registerschool'>
											Register your school
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

	const signInLabel = schoolData?.signInDate
		? new Date(schoolData.signInDate).toLocaleString(undefined, {
			dateStyle: 'medium',
			timeStyle: 'short',
		})
		: '—'

	return (
		<div className='chat-app chat-app--teacher-login ask-screen'>
			<div className='main-container'>
				<AdminSidebar isOpen={isSidebarOpen} toggleSidebar={toggleSidebar} />
				<div className='main-content'>
					<AdminHeader
						isSidebarOpen={isSidebarOpen}
						toggleSidebar={toggleSidebar}
					/>
					<div className='content-area content-area--login content-area--login-scroll'>
					<div className='center-content2 login-screen login-screen--wide'>
					<div className='login-card'>
					<div className='login-card__accent' aria-hidden />
					<div className='login-card__header'>
					<h1 className='login-card__title'>
										<br />
										My school
									</h1>
									<p className='login-card__subtitle login-card__subtitle--wide'>
										View and update your school&apos;s public
										details. Changes apply to this institution
										only.
									</p>
								</div>
								{isLoadingSchool && !schoolData ? (
									<p className='login-card__subtitle login-card__subtitle--wide'>
										Loading school…
									</p>
								) : isSchoolQueryError && !schoolData ? (
									<div className='login-form'>
										<p className='login-card__subtitle login-card__subtitle--wide'>
											We couldn&apos;t load your school. Check
											that you are signed in, then try again.
										</p>
										<button
											type='button'
											className='login-submit'
											onClick={() => void refetchSchool()}
										>
											Try again
										</button>
									</div>
								) : (
									<form
										className='login-form'
										id='schooladmin-myschool-form'
										name='schooladmin-myschool-form'
										onSubmit={handleSubmit}
									>
										<div className='login-field school-grades-levels'>
											<label
												className='login-label'
												htmlFor='schooladmin-myschool-grade-new'
											>
												First step: add your school grade levels
											</label>
											<p className='school-grades-levels__hint'>
												Start here by entering each grade or year
												your school offers, then click Add. You
												need at least one grade level before you
												can save (e.g. 9, 10, 11, 12 or Year 1).
											</p>
											<div className='school-grades-levels__add-row'>
												<div className='login-field'>
													<input
														type='text'
														id='schooladmin-myschool-grade-new'
														name='newGradeLevel'
														className='login-input'
														placeholder='e.g. 10 or Year 2'
														autoComplete='off'
														value={newGradeLevel}
														disabled={isBusy}
														onChange={(e) =>
															setNewGradeLevel(e.target.value)}
														onKeyDown={(e) => {
															if (e.key === 'Enter') {
																e.preventDefault()
																handleAddGradeLevel()
															}
														}}
													/>
												</div>
												<button
													type='button'
													className='school-grades-levels__add-btn'
													disabled={isBusy}
													onClick={handleAddGradeLevel}
												>
													Add
												</button>
											</div>
											{gradesLevels.length > 0 ? (
												<ul
													className='school-grades-levels__chips'
													aria-label='Current grade levels'
												>
													{gradesLevels.map((level) => (
														<li
															key={level._id ?? level.name}
															className='school-grades-levels__chip'
														>
															<span className='school-grades-levels__chip-label'>
																{level.name}
															</span>
															<button
																type='button'
																className='school-grades-levels__chip-remove'
																aria-label={`Remove ${level.name}`}
																disabled={isBusy}
																onClick={() =>
																	handleRemoveGradeLevel(level)}
															>
																×
															</button>
														</li>
													))}
												</ul>
											) : (
												<p className='school-grades-levels__empty'>
													No grade levels added yet — enter your
													first grade level above, then click Add.
												</p>
											)}
										</div>
										<div className='login-field'>
											<label
												className='login-label'
												htmlFor='schooladmin-myschool-signin'
											>
												Registered on
											</label>
											<input
												type='text'
												id='schooladmin-myschool-signin'
												className='login-input'
												value={signInLabel}
												readOnly
												tabIndex={-1}
												aria-readonly='true'
											/>
										</div>
										<div className='login-field'>
											<label
												className='login-label'
												htmlFor='schooladmin-myschool-name'
											>
												School name
											</label>
											<input
												type='text'
												id='schooladmin-myschool-name'
												name='name'
												className='login-input'
												placeholder='School name'
												autoComplete='organization'
												value={name}
												required
												disabled={isBusy}
												onChange={(e) => setName(e.target.value)}
											/>
										</div>
										<div className='login-field'>
											<label
												className='login-label'
												htmlFor='schooladmin-myschool-type'
											>
												School type
											</label>
											<select
												id='schooladmin-myschool-type'
												name='schoolType'
												className='login-input'
												value={schoolType}
												required
												disabled={isBusy}
												onChange={(e) =>
													setSchoolType(e.target.value)}
											>
												<option value=''>
													Select school type
												</option>
												{SCHOOL_TYPE_OPTIONS.map((opt) => (
													<option
														key={opt.value}
														value={opt.value}
													>
														{opt.label}
													</option>
												))}
											</select>
										</div>
										<div className='tp-row'>
											<div className='login-field'>
												<label
													className='login-label'
													htmlFor='schooladmin-myschool-country'
												>
													Country
												</label>
												<input
													type='text'
													id='schooladmin-myschool-country'
													name='country'
													className='login-input'
													placeholder='Country'
													autoComplete='country-name'
													value={country}
													required
													disabled={isBusy}
													onChange={(e) =>
														setCountry(e.target.value)}
												/>
											</div>
											<div className='login-field'>
												<label
													className='login-label'
													htmlFor='schooladmin-myschool-city'
												>
													City
												</label>
												<input
													type='text'
													id='schooladmin-myschool-city'
													name='city'
													className='login-input'
													placeholder='City'
													autoComplete='address-level2'
													value={city}
													required
													disabled={isBusy}
													onChange={(e) =>
														setCity(e.target.value)}
												/>
											</div>
										</div>
										<div className='login-field'>
											<label
												className='login-label'
												htmlFor='schooladmin-myschool-address'
											>
												Address
											</label>
											<input
												type='text'
												id='schooladmin-myschool-address'
												name='address'
												className='login-input'
												placeholder='Street, number, district…'
												autoComplete='street-address'
												value={address}
												disabled={isBusy}
												onChange={(e) =>
													setAddress(e.target.value)}
											/>
										</div>
										<button
											type='submit'
											id='schooladmin-myschool-save'
											className='login-submit'
											disabled={isBusy}
										>
											{isUpdating
												? 'Updating…'
												: isLoadingSchool
													? 'Loading…'
													: 'Update school'}
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

export default SchoolAdminMySchoolsScreen
