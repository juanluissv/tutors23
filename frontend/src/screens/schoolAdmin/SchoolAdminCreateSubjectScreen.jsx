import { useEffect, useRef, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useSelector } from 'react-redux'
import { toast } from 'react-toastify'
import {
	useCreateSubjectMutation,
	useGetSchoolByIdQuery,
	useGetTeachersBySchoolQuery,
	useSetSubjectTeacherEmailMutation,
} from '../../slices/admin/schoolAdminApiSlice'
import AdminSidebar from '../../components/AdminSidebar'
import AdminHeader from '../../components/AdminHeader'
import { normalizeGradeLevels } from '../../utils/gradeLevel'
import '../../App.css'

const BookUploadGlyph = () => (
	<svg
		width='36'
		height='36'
		viewBox='0 0 24 24'
		fill='none'
		xmlns='http://www.w3.org/2000/svg'
		className='teacher-book-upload__svg'
		aria-hidden
	>
		<path
			d='M4 6a2 2 0 012-2h5v16H6a2 2 0 01-2-2V6z'
			fill='url(#create-book-fill-a)'
		/>
		<path
			d='M13 4h5a2 2 0 012 2v10a2 2 0 01-2 2h-5V4z'
			fill='url(#create-book-fill-b)'
		/>
		<path
			d='M12 4v16'
			stroke='url(#create-book-stroke)'
			strokeWidth='1.5'
			strokeLinecap='round'
		/>
		<defs>
			<linearGradient
				id='create-book-fill-a'
				x1='4'
				y1='4'
				x2='11'
				y2='18'
				gradientUnits='userSpaceOnUse'
			>
				<stop stopColor='#e0f2fe' />
				<stop offset='1' stopColor='#bae6fd' />
			</linearGradient>
			<linearGradient
				id='create-book-fill-b'
				x1='13'
				y1='4'
				x2='20'
				y2='18'
				gradientUnits='userSpaceOnUse'
			>
				<stop stopColor='#f0f9ff' />
				<stop offset='1' stopColor='#7dd3fc' />
			</linearGradient>
			<linearGradient
				id='create-book-stroke'
				x1='12'
				y1='4'
				x2='12'
				y2='20'
				gradientUnits='userSpaceOnUse'
			>
				<stop stopColor='#0284c7' />
				<stop offset='1' stopColor='#0ea5e9' />
			</linearGradient>
		</defs>
	</svg>
)

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

function formatNamePart (value) {
	if (!value) {
		return ''
	}
	const trimmed = String(value).trim()
	if (trimmed === '') {
		return ''
	}
	return trimmed.charAt(0).toUpperCase() + trimmed.slice(1)
}

function formatTeacherName (firstname, lastname) {
	return [
		formatNamePart(firstname),
		formatNamePart(lastname),
	].filter(Boolean).join(' ')
}

function teacherInitials (firstname, lastname) {
	const first = formatNamePart(firstname).charAt(0)
	const last = formatNamePart(lastname).charAt(0)
	return (first + last) || '?'
}

function SchoolAdminCreateSubjectScreen () {
	const navigate = useNavigate()
	const bookInputRef = useRef(null)
	const { schoolAdminInfo } = useSelector((state) => state.authSchoolAdmin)
	const schoolId = schoolAdminInfo
		? resolveSchoolId(schoolAdminInfo.school)
		: null

	const [isSidebarOpen, setIsSidebarOpen] = useState(
		window.innerWidth > 768,
	)
	const [title, setTitle] = useState('')
	const [selectedGradeLevelIds, setSelectedGradeLevelIds] = useState([])
	const [selectedTeacherId, setSelectedTeacherId] = useState('')
	const [description, setDescription] = useState('')
	const [bookFile, setBookFile] = useState(null)

	const {
		data: schoolData,
		isLoading: isLoadingSchool,
	} = useGetSchoolByIdQuery(schoolId, {
		skip: !schoolId,
	})

	const {
		data: teachers = [],
		isLoading: isLoadingTeachers,
	} = useGetTeachersBySchoolQuery(schoolId, {
		skip: !schoolId,
	})

	const gradesLevels = normalizeGradeLevels(schoolData?.gradesLevels)
	const teachersList = Array.isArray(teachers) ? teachers : []
	const hasTeachers = teachersList.length > 0

	const [createSubject, { isLoading: isCreating }] = useCreateSubjectMutation()
	const [setSubjectTeacherEmail, { isLoading: isAssigningTeacher }] =
		useSetSubjectTeacherEmailMutation()
	const isBusy = isCreating
		|| isAssigningTeacher
		|| isLoadingSchool
		|| isLoadingTeachers

	const toggleSidebar = () => {
		setIsSidebarOpen(!isSidebarOpen)
	}

	const handleToggleGradeLevel = (gradeLevelId) => {
		const id = String(gradeLevelId)
		setSelectedGradeLevelIds((prev) =>
			prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
		)
	}

	useEffect(() => {
		if (!schoolAdminInfo) {
			navigate('/schooladmins/login', { replace: true })
		}
	}, [schoolAdminInfo, navigate])

	useEffect(() => {
		if (teachersList.length === 0) {
			setSelectedTeacherId('')
			return
		}
		setSelectedTeacherId((prev) => {
			if (prev && teachersList.some((t) => String(t._id) === prev)) {
				return prev
			}
			return String(teachersList[0]._id)
		})
	}, [teachersList])

	const selectedTeacher = teachersList.find(
		(teacher) => String(teacher._id) === selectedTeacherId,
	)

	const handleClearBook = () => {
		setBookFile(null)
		if (bookInputRef.current) {
			bookInputRef.current.value = ''
		}
	}

	const handleBookChange = (e) => {
		const file = e.target.files?.[0] ?? null
		if (file) {
			if (file.type !== 'application/pdf') {
				setBookFile(null)
				if (bookInputRef.current) {
					bookInputRef.current.value = ''
				}
				toast.error('Please choose a PDF file')
				return
			}
			setBookFile(file)
		} else {
			setBookFile(null)
		}
	}

	const handleSubmit = async (e) => {
		e.preventDefault()
		if (title.trim() === '') {
			toast.error('Please enter the subject title')
			return
		}
		if (!schoolId) {
			return
		}
		if (!selectedTeacher?.email) {
			toast.error('Please select a teacher for this subject')
			return
		}

		const body = {
			title: title.trim(),
			school: schoolId,
		}
		if (selectedGradeLevelIds.length > 0) {
			body.gradesLevel = selectedGradeLevelIds
		}
		if (description.trim() !== '') {
			body.description = description.trim()
		}
		if (bookFile instanceof File) {
			body.book = bookFile
		}

		try {
			const created = await createSubject(body).unwrap()
			await setSubjectTeacherEmail({
				id: String(created._id),
				email: String(selectedTeacher.email).trim(),
			}).unwrap()
			toast.success(
				bookFile
					? 'Subject created with PDF and teacher assigned'
					: 'Subject created and teacher assigned',
			)
			navigate('/schooladmins/mysubjects', { replace: true })
		} catch (err) {
			toast.error(
				err?.data?.message
					|| err?.error?.message
					|| 'Could not create subject',
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
											<br />
											No school yet
										</h1>
										<p className='login-card__subtitle login-card__subtitle--wide'>
											Register your school first, then you can
											add subjects.
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

	if (!isLoadingSchool && gradesLevels.length === 0) {
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
											<br />
											Add grade levels first
										</h1>
										<p className='login-card__subtitle login-card__subtitle--wide'>
											Your school needs at least one grade level
											before you can create subjects. Add them in
											My school, then come back here.
										</p>
									</div>
									<p className='login-card__subtitle login-card__subtitle--wide'>
										<Link to='/schooladmins/myschools'>
											Go to My school
										</Link>
										{' · '}
										<Link to='/schooladmins/mysubjects'>
											Back to subjects
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

	if (!isLoadingTeachers && !hasTeachers) {
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
											<br />
											Add a teacher first
										</h1>
										<p className='login-card__subtitle login-card__subtitle--wide'>
											Your school needs at least one teacher
											before you can create subjects. Add a
											teacher, then come back here.
										</p>
									</div>
									<p className='login-card__subtitle login-card__subtitle--wide'>
										<Link to='/schooladmins/addteacher'>
											Add a teacher
										</Link>
										{' · '}
										<Link to='/schooladmins/mysubjects'>
											Back to subjects
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
					<div className='content-area content-area--login content-area--login-scroll'>
						<div className='center-content2 login-screen login-screen--wide'>
							<div className='login-card'>
								<div className='login-card__accent' aria-hidden />
								<div className='login-card__header'>
									<h1 className='login-card__title'>
										Create a subject
									</h1>
									<p className='login-card__subtitle login-card__subtitle--wide'>
										Add a new subject to your school. Choose
										grade levels, assign a teacher, and add
										a short description. Attach an optional
										course book — PDF, up to 25 MB.
									</p>
								</div>
								<form
									className='login-form'
									id='schooladmin-create-subject-form'
									name='schooladmin-create-subject-form'
									onSubmit={handleSubmit}
								>
									<div className='login-field'>
										<label
											className='login-label'
											htmlFor='schooladmin-create-subject-title'
										>
											Subject title
										</label>
										<input
											type='text'
											id='schooladmin-create-subject-title'
											name='title'
											className='login-input'
											placeholder='e.g. Algebra II'
											autoComplete='off'
											value={title}
											disabled={isBusy}
											onChange={(e) => setTitle(e.target.value)}
										/>
									</div>
									<div className='login-field subject-grade-picker'>
										<div className='subject-grade-picker__header'>
											<label
												className='login-label subject-grade-picker__title'
												htmlFor='schooladmin-create-subject-grade'
											>
												Grade levels
												<span className='subject-grade-picker__optional'>
													(optional)
												</span>
											</label>
											{selectedGradeLevelIds.length > 0 && (
												<span className='subject-grade-picker__count'>
													{selectedGradeLevelIds.length} selected
												</span>
											)}
										</div>
										{isLoadingSchool ? (
											<p className='subject-grade-picker__hint'>
												Loading grade levels…
											</p>
										) : gradesLevels.length === 0 ? (
											<p className='subject-grade-picker__hint'>
												No grade levels on your school yet.{' '}
												<Link to='/schooladmins/myschools'>
													Add them in My school
												</Link>{' '}
												first, then create subjects.
											</p>
										) : (
											<>
												<p
													className='subject-grade-picker__hint'
													id='schooladmin-create-subject-grade'
												>
													Choose one or more grades this
													subject applies to.
												</p>
												<div
													className='subject-grade-picker__grid'
													role='group'
													aria-label='Grade levels for this subject'
												>
													{gradesLevels.map((level) => {
														const levelId = String(level._id)
														const checked = selectedGradeLevelIds
															.includes(levelId)
														return (
															<label
																key={levelId}
																className={
																	'subject-grade-picker__option'
																	+ (checked
																		? ' subject-grade-picker__option--selected'
																		: '')
																	+ (isBusy
																		? ' subject-grade-picker__option--disabled'
																		: '')
																}
															>
																<input
																	type='checkbox'
																	className='subject-grade-picker__input'
																	name='gradesLevel'
																	value={levelId}
																	checked={checked}
																	disabled={isBusy}
																	onChange={() =>
																		handleToggleGradeLevel(
																			levelId,
																		)}
																/>
																<span
																	className='subject-grade-picker__check'
																	aria-hidden='true'
																>
																	{checked && (
																		<svg
																			width='12'
																			height='12'
																			viewBox='0 0 12 12'
																			fill='none'
																			xmlns='http://www.w3.org/2000/svg'
																		>
																			<path
																				d='M2.5 6L5 8.5L9.5 3.5'
																				stroke='currentColor'
																				strokeWidth='1.75'
																				strokeLinecap='round'
																				strokeLinejoin='round'
																			/>
																		</svg>
																	)}
																</span>
																<span className='subject-grade-picker__label'>
																	{level.name}
																</span>
															</label>
														)
													})}
												</div>
											</>
										)}
									</div>
									<div className='login-field subject-teacher-picker'>
										<div className='subject-teacher-picker__header'>
											<label
												className='login-label subject-teacher-picker__title'
												id='schooladmin-create-subject-teacher-label'
											>
												Assign teacher
											</label>
											{selectedTeacher && (
												<span className='subject-teacher-picker__badge'>
													Selected
												</span>
											)}
										</div>
										{isLoadingTeachers ? (
											<p className='subject-teacher-picker__hint'>
												Loading teachers…
											</p>
										) : teachersList.length === 0 ? (
											<p className='subject-teacher-picker__hint'>
												No teachers yet.{' '}
												<Link to='/schooladmins/addteacher'>
													Add a teacher
												</Link>{' '}
												first, then create subjects.
											</p>
										) : (
											<>
												<p
													className='subject-teacher-picker__hint'
													id='schooladmin-create-subject-teacher'
												>
													Choose who will teach this subject.
												</p>
												<div
													className='subject-teacher-picker__list'
													role='radiogroup'
													aria-labelledby='schooladmin-create-subject-teacher-label'
												>
													{teachersList.map((teacher) => {
														const teacherId = String(
															teacher._id,
														)
														const isSelected =
															selectedTeacherId === teacherId
														const displayName = formatTeacherName(
															teacher.firstname,
															teacher.lastname,
														)

														return (
															<label
																key={teacherId}
																className={
																	'subject-teacher-picker__option'
																	+ (isSelected
																		? ' subject-teacher-picker__option--selected'
																		: '')
																	+ (isBusy
																		? ' subject-teacher-picker__option--disabled'
																		: '')
																}
															>
																<input
																	type='radio'
																	className='subject-teacher-picker__input'
																	name='assignedTeacher'
																	value={teacherId}
																	checked={isSelected}
																	disabled={isBusy}
																	onChange={() =>
																		setSelectedTeacherId(
																			teacherId,
																		)}
																/>
																<span
																	className='subject-teacher-picker__avatar'
																	aria-hidden='true'
																>
																	{teacherInitials(
																		teacher.firstname,
																		teacher.lastname,
																	)}
																</span>
																<span className='subject-teacher-picker__info'>
																	<span className='subject-teacher-picker__name'>
																		{displayName}
																	</span>
																	<span className='subject-teacher-picker__email'>
																		{teacher.email}
																	</span>
																</span>
																<span
																	className='subject-teacher-picker__radio'
																	aria-hidden='true'
																>
																	{isSelected && (
																		<svg
																			width='12'
																			height='12'
																			viewBox='0 0 12 12'
																			fill='none'
																			xmlns='http://www.w3.org/2000/svg'
																		>
																			<path
																				d='M2.5 6L5 8.5L9.5 3.5'
																				stroke='currentColor'
																				strokeWidth='1.75'
																				strokeLinecap='round'
																				strokeLinejoin='round'
																			/>
																		</svg>
																	)}
																</span>
															</label>
														)
													})}
												</div>
											</>
										)}
									</div>
									<div className='login-field'>
										<label
											className='login-label'
											htmlFor='schooladmin-create-subject-description'
										>
											Description (optional)
										</label>
										<textarea
											id='schooladmin-create-subject-description'
											name='description'
											className='login-input login-textarea'
											placeholder='What this subject covers…'
											rows={4}
											value={description}
											disabled={isBusy}
											onChange={(e) =>
												setDescription(e.target.value)}
										/>
									</div>
									<div className='login-field'>
										<span
											className='login-label'
											id='schooladmin-create-book-label'
										>
											Course book (optional)
										</span>
										<div className='teacher-book-upload'>
											<input
												ref={bookInputRef}
												type='file'
												id='schooladmin-create-subject-book'
												name='book'
												className='teacher-book-upload__input'
												accept='application/pdf,.pdf'
												disabled={isBusy}
												onChange={handleBookChange}
												aria-labelledby='schooladmin-create-book-label'
											/>
											<label
												htmlFor='schooladmin-create-subject-book'
												className='teacher-book-upload__zone'
											>
												<span
													className='teacher-book-upload__icon'
													aria-hidden
												>
													<BookUploadGlyph />
												</span>
												<span className='teacher-book-upload__title'>
													{bookFile
														? bookFile.name
														: 'Drop a file or tap to browse'}
												</span>
												<span className='teacher-book-upload__hint'>
													PDF only · up to 25 MB
												</span>
											</label>
											{bookFile ? (
												<button
													type='button'
													className='teacher-book-upload__clear'
													onClick={handleClearBook}
													disabled={isBusy}
												>
													Remove file
												</button>
											) : null}
										</div>
									</div>
									<button
										type='submit'
										id='schooladmin-create-subject-submit'
										className='login-submit'
										disabled={
											isBusy
											|| gradesLevels.length === 0
											|| !selectedTeacherId
										}
									>
										{isCreating || isAssigningTeacher
											? 'Creating…'
											: isLoadingSchool || isLoadingTeachers
												? 'Loading…'
												: 'Create subject'}
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

export default SchoolAdminCreateSubjectScreen
