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
import {
	normalizeUniversityPrograms,
	programsForApi,
	getProgramTypeLabel,
	UNIVERSITY_PROGRAM_TYPES,
} from '../../utils/universityProgram'
import { isUniversitySchool } from '../../utils/schoolType'
import '../../App.css'

const SCHOOL_TYPE_OPTIONS = [
	{ value: 'primary', label: 'Primary' },
	{ value: 'secondary', label: 'Secondary' },
	{ value: 'high_school', label: 'High school' },
	{ value: 'university', label: 'University' },
]

function normalizeSchoolType (schoolType) {
	if (schoolType === 'high school') {
		return 'high_school'
	}
	return schoolType ?? ''
}

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
	const [programs, setPrograms] = useState([])
	const [newProgram, setNewProgram] = useState('')
	const [newProgramDepartment, setNewProgramDepartment] = useState('')
	const [newProgramType, setNewProgramType] = useState('')
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
	const isUniversity = isUniversitySchool(schoolType)
	const savedIsUniversity = isUniversitySchool(
		normalizeSchoolType(schoolData?.schoolType),
	)
	const canChangeSchoolType = schoolData?.canChangeSchoolType !== false

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
			setSchoolType(normalizeSchoolType(schoolData.schoolType))
			setGradesLevels(normalizeGradeLevels(schoolData.gradesLevels))
			setPrograms(normalizeUniversityPrograms(schoolData.programs))
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

	const handleAddProgram = () => {
		const trimmed = newProgram.trim()
		if (trimmed === '') {
			return
		}
		if (programs.some((item) => item.name === trimmed)) {
			toast.error('That program is already in the list')
			return
		}
		const department = newProgramDepartment.trim()
		const programType = newProgramType.trim()
		const nextProgram = { name: trimmed }
		if (department !== '') {
			nextProgram.department = department
		}
		if (programType !== '') {
			nextProgram.programType = programType
		}
		setPrograms([...programs, nextProgram])
		setNewProgram('')
		setNewProgramDepartment('')
		setNewProgramType('')
	}

	const handleRemoveProgram = (program) => {
		setPrograms(
			programs.filter((item) => item._id !== program._id
				&& item.name !== program.name),
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
		if (isUniversity) {
			if (programs.length === 0) {
				toast.error('Please add at least one program')
				return
			}
		} else if (gradesLevels.length === 0) {
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
		if (
			isUniversity !== savedIsUniversity
			&& canChangeSchoolType === false
		) {
			toast.error(
				'Cannot change school type because this institution '
				+ 'already has subjects, plans, or students',
			)
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
				gradesLevels: isUniversity
					? []
					: gradeLevelNamesFromApi(gradesLevels),
				programs: isUniversity
					? programsForApi(programs)
					: [],
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
											{isUniversity ? (
												<>
													<label
														className='login-label'
														htmlFor='schooladmin-myschool-program-new'
													>
														First step: add your university programs
													</label>
													<p className='school-grades-levels__hint'>
														Enter each degree program your institution
														offers, then click Add. You need at least
														one program before you can save (e.g.
														Computer Science, Business Administration).
														Remove a program only if no subjects,
														plans, or students still use it.
													</p>
													<div className='school-grades-levels__add-row'>
														<div className='login-field'>
															<input
																type='text'
																id='schooladmin-myschool-program-new'
																name='newProgram'
																className='login-input'
																placeholder='e.g. Computer Science'
																autoComplete='off'
																value={newProgram}
																disabled={isBusy}
																onChange={(e) =>
																	setNewProgram(e.target.value)}
																onKeyDown={(e) => {
																	if (e.key === 'Enter') {
																		e.preventDefault()
																		handleAddProgram()
																	}
																}}
															/>
														</div>
														<div className='login-field'>
															<input
																type='text'
																id='schooladmin-myschool-program-dept'
																name='newProgramDepartment'
																className='login-input'
																placeholder='Department '
																autoComplete='off'
																value={newProgramDepartment}
																disabled={isBusy}
																onChange={(e) =>
																	setNewProgramDepartment(
																		e.target.value,
																	)}
															/>
														</div>
														<div className='login-field'>
															<select
																id='schooladmin-myschool-program-type'
																name='newProgramType'
																className='login-input'
																value={newProgramType}
																disabled={isBusy}
																onChange={(e) =>
																	setNewProgramType(e.target.value)}
															>
																<option value=''>
																	Program type 
																</option>
																{UNIVERSITY_PROGRAM_TYPES.map(
																	(type) => (
																		<option
																			key={type}
																			value={type}
																		>
																			{getProgramTypeLabel(type)}
																		</option>
																	),
																)}
															</select>
														</div>
														<button
															type='button'
															className='school-grades-levels__add-btn'
															disabled={isBusy}
															onClick={handleAddProgram}
														>
															Add
														</button>
													</div>
													{programs.length > 0 ? (
														<ul
															className='school-grades-levels__chips'
															aria-label='Current programs'
														>
															{programs.map((program) => (
																<li
																	key={program._id ?? program.name}
																	className='school-grades-levels__chip'
																>
																	<span className='school-grades-levels__chip-label'>
																		{program.name}
																		{program.programType
																			? ` · ${getProgramTypeLabel(
																				program.programType,
																			)}`
																			: ''}
																		{program.department
																			? ` (${program.department})`
																			: ''}
																	</span>
																	<button
																		type='button'
																		className='school-grades-levels__chip-remove'
																		aria-label={`Remove ${program.name}`}
																		disabled={isBusy}
																		onClick={() =>
																			handleRemoveProgram(program)}
																	>
																		×
																	</button>
																</li>
															))}
														</ul>
													) : (
														<p className='school-grades-levels__empty'>
															No programs added yet — enter your first
															program above, then click Add.
														</p>
													)}
												</>
											) : (
												<>
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
														Remove a grade only if no subjects, plans,
														or students still use it.
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
												</>
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
												disabled={isBusy || !canChangeSchoolType}
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
											<p className='school-grades-levels__hint'>
												{canChangeSchoolType
													? (
														'You can switch between university '
														+ 'and school types only before '
														+ 'adding subjects, plans, or students.'
													)
													: (
														'School type is locked because this '
														+ 'institution already has subjects, '
														+ 'plans, or students.'
													)}
											</p>
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
