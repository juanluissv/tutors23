import { useEffect, useMemo, useRef, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { useSelector } from 'react-redux'
import { toast } from 'react-toastify'
import {
	useGetSubjectsBySchoolQuery,
	useGetTeachersBySchoolQuery,
	useUpdateSubjectMutation,
} from '../../slices/admin/schoolAdminApiSlice'
import AdminSidebar from '../../components/AdminSidebar'
import AdminHeader from '../../components/AdminHeader'
import { SUBJECTS_URL } from '../../constants'
import { getSubjectGradeLevelNames } from '../../utils/gradeLevel'
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
			fill='url(#schooladmin-edit-book-fill-a)'
		/>
		<path
			d='M13 4h5a2 2 0 012 2v10a2 2 0 01-2 2h-5V4z'
			fill='url(#schooladmin-edit-book-fill-b)'
		/>
		<path
			d='M12 4v16'
			stroke='url(#schooladmin-edit-book-stroke)'
			strokeWidth='1.5'
			strokeLinecap='round'
		/>
		<defs>
			<linearGradient
				id='schooladmin-edit-book-fill-a'
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
				id='schooladmin-edit-book-fill-b'
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
				id='schooladmin-edit-book-stroke'
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

function bookDisplayName (bookId) {
	if (!bookId || typeof bookId !== 'string') {
		return ''
	}
	const trimmed = bookId.trim()
	const parts = trimmed.split('/')
	const last = parts[parts.length - 1]
	return last && last.length > 0 ? last : trimmed
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

const OBJECT_ID_RE = /^[a-fA-F0-9]{24}$/

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

function normalizeTeacherEmails (teacherEmail) {
	if (teacherEmail == null || teacherEmail === '') {
		return []
	}
	if (Array.isArray(teacherEmail)) {
		return teacherEmail
			.map((email) => String(email).trim())
			.filter((email) => email !== '')
	}
	const single = String(teacherEmail).trim()
	return single !== '' ? [single] : []
}

function SchoolAdminEditSubjectScreen () {
	const { id: subjectId } = useParams()
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
	const [description, setDescription] = useState('')
	const [bookFile, setBookFile] = useState(null)
	const [selectedTeacherId, setSelectedTeacherId] = useState('')
	const initializedTeacherForSubjectRef = useRef(null)

	const {
		data: subjects = [],
		isLoading: isLoadingList,
		isError: isListError,
		refetch: refetchSubjects,
	} = useGetSubjectsBySchoolQuery(schoolId, {
		skip: !schoolId,
	})

	const {
		data: teachers = [],
		isLoading: isLoadingTeachers,
	} = useGetTeachersBySchoolQuery(schoolId, {
		skip: !schoolId,
	})

	const teachersList = useMemo(
		() => (Array.isArray(teachers) ? teachers : []),
		[teachers],
	)

	const [updateSubject, { isLoading: isSaving }] = useUpdateSubjectMutation()

	const isValidSubjectParam =
		subjectId != null && OBJECT_ID_RE.test(String(subjectId))

	const currentSubject = useMemo(() => {
		if (!isValidSubjectParam || !subjects?.length) {
			return undefined
		}
		return subjects.find((s) => String(s._id) === String(subjectId))
	}, [subjects, subjectId, isValidSubjectParam])

	const isBusy = isLoadingList || isLoadingTeachers || isSaving

	const assignedTeacher = useMemo(() => {
		if (!currentSubject || teachersList.length === 0) {
			return undefined
		}
		const assignedEmails = normalizeTeacherEmails(
			currentSubject.teacherEmail,
		).map((email) => email.toLowerCase())
		return teachersList.find((teacher) =>
			assignedEmails.includes(
				String(teacher.email).trim().toLowerCase(),
			),
		)
	}, [currentSubject, teachersList])

	const assignedTeacherId = assignedTeacher
		? String(assignedTeacher._id)
		: ''

	const selectedTeacher = teachersList.find(
		(teacher) => String(teacher._id) === selectedTeacherId,
	)

	const toggleSidebar = () => {
		setIsSidebarOpen(!isSidebarOpen)
	}

	useEffect(() => {
		if (!schoolAdminInfo) {
			navigate('/schooladmins/login', { replace: true })
		}
	}, [schoolAdminInfo, navigate])

	useEffect(() => {
		if (!currentSubject) {
			return
		}
		setTitle(currentSubject.title ?? '')
		setDescription(currentSubject.description ?? '')
		setBookFile(null)
		if (bookInputRef.current) {
			bookInputRef.current.value = ''
		}
	}, [currentSubject])

	useEffect(() => {
		initializedTeacherForSubjectRef.current = null
	}, [subjectId])

	useEffect(() => {
		if (!currentSubject) {
			return
		}

		const subjectKey = String(currentSubject._id)

		if (isLoadingTeachers || teachersList.length === 0) {
			if (!isLoadingTeachers && teachersList.length === 0) {
				setSelectedTeacherId('')
				initializedTeacherForSubjectRef.current = subjectKey
			}
			return
		}

		if (initializedTeacherForSubjectRef.current === subjectKey) {
			return
		}

		const assignedEmails = normalizeTeacherEmails(
			currentSubject.teacherEmail,
		).map((email) => email.toLowerCase())
		const matchedTeacher = teachersList.find((teacher) =>
			assignedEmails.includes(
				String(teacher.email).trim().toLowerCase(),
			),
		)

		setSelectedTeacherId(
			matchedTeacher
				? String(matchedTeacher._id)
				: String(teachersList[0]._id),
		)
		initializedTeacherForSubjectRef.current = subjectKey
	}, [currentSubject, teachersList, isLoadingTeachers])

	const gradeDisplayLabel = getSubjectGradeLevelNames(
		currentSubject?.gradesLevel,
	) || '—'

	const hasStoredBook = Boolean(
		currentSubject
		&& currentSubject.bookId
		&& String(currentSubject.bookId).trim() !== '',
	)
	const storedBookLabel = hasStoredBook
		? bookDisplayName(String(currentSubject.bookId))
		: ''

	const openBookHref = hasStoredBook && currentSubject?.bookUrl
		? String(currentSubject.bookUrl)
		: (hasStoredBook && subjectId
			? `${SUBJECTS_URL}/${subjectId}/school-admin/book`
			: '')

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
			toast.error('Please enter a subject title')
			return
		}
		if (!isValidSubjectParam) {
			return
		}
		if (!selectedTeacher?.email) {
			toast.error('Please select a teacher for this subject')
			return
		}

		const body = {
			id: String(subjectId),
			title: title.trim(),
			teacherEmail: String(selectedTeacher.email).trim().toLowerCase(),
		}
		if (description !== '') {
			body.description = description.trim()
		} else {
			body.description = ''
		}
		if (bookFile instanceof File) {
			body.book = bookFile
		}

		try {
			await updateSubject(body).unwrap()
			toast.success(
				bookFile ? 'Subject and PDF saved.' : 'Subject updated',
			)
			navigate('/schooladmins/mysubjects', { replace: true })
		} catch (err) {
			toast.error(
				err?.data?.message
					|| err?.error?.message
					|| 'Could not update subject',
			)
		}
	}

	if (!schoolAdminInfo) {
		return null
	}

	if (!schoolId) {
		return (
			<div className='chat-app chat-app--login chat-app--teacher-login ask-screen'>
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
											edit subjects.
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

	if (!isValidSubjectParam) {
		return (
			<div className='chat-app chat-app--login chat-app--teacher-login ask-screen'>
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
										<div className='login-card__back'>
											<Link
												to='/schooladmins/mysubjects'
												className='login-card__link'
											>
												← Back to subjects
											</Link>
										</div>
										<h1 className='login-card__title'>Invalid link</h1>
										<p className='login-card__subtitle login-card__subtitle--wide'>
											This subject link is not valid.
										</p>
									</div>
								</div>
							</div>
						</div>
					</div>
				</div>
			</div>
		)
	}

	if (isListError) {
		return (
			<div className='chat-app chat-app--login chat-app--teacher-login ask-screen'>
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
										<div className='login-card__back'>
											<Link
												to='/schooladmins/mysubjects'
												className='login-card__link'
											>
												← Back to subjects
											</Link>
										</div>
										<p className='login-card__subtitle login-card__subtitle--wide'>
											We couldn&apos;t load subjects.
										</p>
									</div>
									<button
										type='button'
										className='login-submit'
										onClick={() => void refetchSubjects()}
									>
										Try again
									</button>
								</div>
							</div>
						</div>
					</div>
				</div>
			</div>
		)
	}

	if (!isLoadingList && !currentSubject) {
		return (
			<div className='chat-app chat-app--login chat-app--teacher-login ask-screen'>
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
										<div className='login-card__back'>
											<Link
												to='/schooladmins/mysubjects'
												className='login-card__link'
											>
												← Back to subjects
											</Link>
										</div>
										<h1 className='login-card__title'>Subject not found</h1>
										<p className='login-card__subtitle login-card__subtitle--wide'>
											There is no subject with this id in your
											school, or it may have been removed.
										</p>
									</div>
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
										Edit subject
									</h1>
									<p className='login-card__subtitle login-card__subtitle--wide'>
										Update how this subject appears in your
										school. Change the title, description, or
										assigned teacher; grade level is set when
										the subject is created. Attach an optional
										course book — PDF, up to 25 MB.
									</p>
								</div>
								{isLoadingList && !currentSubject ? (
									<p className='login-card__subtitle login-card__subtitle--wide'>
										Loading…
									</p>
								) : (
									<form
										className='login-form'
										id='schooladmin-edit-subject-form'
										name='schooladmin-edit-subject-form'
										onSubmit={handleSubmit}
									>
										<div className='login-field'>
											<label
												className='login-label'
												htmlFor='schooladmin-edit-subject-title'
											>
												Subject name
											</label>
											<input
												type='text'
												id='schooladmin-edit-subject-title'
												name='title'
												className='login-input'
												placeholder='e.g. Algebra I'
												autoComplete='off'
												value={title}
												disabled={isBusy}
												onChange={(e) => setTitle(e.target.value)}
											/>
										</div>
										<div className='login-field'>
											<label
												className='login-label'
												htmlFor='schooladmin-edit-subject-grade'
											>
												Grade level
											</label>
											<input
												type='text'
												id='schooladmin-edit-subject-grade'
												className='login-input'
												value={gradeDisplayLabel}
												readOnly
												tabIndex={-1}
												aria-readonly='true'
											/>
										</div>
										<div className='login-field subject-teacher-picker'>
											<div className='subject-teacher-picker__header'>
												<label
													className='login-label subject-teacher-picker__title'
													id='schooladmin-edit-subject-teacher-label'
												>
													Assign teacher
												</label>
												{assignedTeacher ? (
													<span className='subject-teacher-picker__badge subject-teacher-picker__badge--current'>
														Current:{' '}
														{formatTeacherName(
															assignedTeacher.firstname,
															assignedTeacher.lastname,
														)}
													</span>
												) : selectedTeacher ? (
													<span className='subject-teacher-picker__badge'>
														Selected
													</span>
												) : null}
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
													first, then assign one here.
												</p>
											) : (
												<>
													<p
														className='subject-teacher-picker__hint'
														id='schooladmin-edit-subject-teacher'
													>
														Choose who teaches this subject.
														The current teacher is marked below.
													</p>
													<div
														className='subject-teacher-picker__list'
														role='radiogroup'
														aria-labelledby='schooladmin-edit-subject-teacher-label'
													>
														{teachersList.map((teacher) => {
															const teacherId = String(
																teacher._id,
															)
															const isSelected =
																selectedTeacherId === teacherId
															const isCurrent =
																teacherId === assignedTeacherId
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
																		+ (isCurrent
																			&& !isSelected
																			? ' subject-teacher-picker__option--current'
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
																	{isCurrent ? (
																		<span className='subject-teacher-picker__tag'>
																			Current
																		</span>
																	) : null}
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
												htmlFor='schooladmin-edit-subject-description'
											>
												Description (optional)
											</label>
											<textarea
												id='schooladmin-edit-subject-description'
												name='description'
												className='login-input login-textarea'
												placeholder='What will students learn? Who is it for?'
												rows={5}
												value={description}
												disabled={isBusy}
												onChange={(e) =>
													setDescription(e.target.value)}
											/>
										</div>
										<div className='login-field'>
											<span
												className='login-label'
												id='schooladmin-book-label'
											>
												Course book (optional)
											</span>
											{hasStoredBook ? (
												<div
													className='teacher-book-upload__status'
													role='status'
												>
													<span
														className='teacher-book-upload__status-icon'
														aria-hidden
													>
														<svg
															width='20'
															height='20'
															viewBox='0 0 24 24'
															fill='none'
															stroke='currentColor'
															strokeWidth='2'
														>
															<path
																d='M20 6L9 17l-5-5'
																strokeLinecap='round'
																strokeLinejoin='round'
															/>
														</svg>
													</span>
													<div className='teacher-book-upload__status-body'>
														<p className='teacher-book-upload__status-title'>
															PDF already saved
														</p>
														{storedBookLabel ? (
															<p className='teacher-book-upload__status-file'>
																{storedBookLabel}
															</p>
														) : null}
														{openBookHref ? (
															<p className='teacher-book-upload__status-actions'>
																<a
																	href={openBookHref}
																	className='teacher-book-upload__open-link'
																	target='_blank'
																	rel='noopener noreferrer'
																>
																	Open PDF in new tab
																	<span
																		className='teacher-book-upload__open-link-icon'
																		aria-hidden
																	>
																		↗
																	</span>
																</a>
															</p>
														) : null}
														<p className='teacher-book-upload__status-hint'>
															{bookFile
																? `This save will replace it with “${bookFile.name}”.`
																: 'Upload a new PDF below to replace it.'}
														</p>
													</div>
												</div>
											) : null}
											<div className='teacher-book-upload'>
												<input
													ref={bookInputRef}
													type='file'
													id='schooladmin-edit-subject-book'
													name='book'
													className='teacher-book-upload__input'
													accept='application/pdf,.pdf'
													disabled={isBusy}
													onChange={handleBookChange}
													aria-labelledby='schooladmin-book-label'
												/>
												<label
													htmlFor='schooladmin-edit-subject-book'
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
											id='schooladmin-edit-subject-save'
											className='login-submit'
											disabled={isBusy || !selectedTeacherId}
										>
											{isSaving ? 'Saving…' : 'Save changes'}
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

export default SchoolAdminEditSubjectScreen
