import React, { useEffect, useRef, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { useSelector } from 'react-redux'
import { toast } from 'react-toastify'
import TeacherSidebar from '../../components/TeacherSidebar'
import TeacherHeader from '../../components/TeacherHeader'
import {
	useGetSubjectsByTeacherIdQuery,
	useUpdateSubjectByTeacherMutation,
} from '../../slices/teachers/teacherApiSlice'
import { SUBJECTS_URL } from '../../constants'
import { getSubjectGradeLevelNames } from '../../utils/gradeLevel'
import {
	getSubjectProgramsLabel,
	normalizeSubjectPrograms,
} from '../../utils/universityProgram'
import { isUniversitySchool } from '../../utils/schoolType'
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
			fill='url(#edit-book-fill-a)'
		/>
		<path
			d='M13 4h5a2 2 0 012 2v10a2 2 0 01-2 2h-5V4z'
			fill='url(#edit-book-fill-b)'
		/>
		<path
			d='M12 4v16'
			stroke='url(#edit-book-stroke)'
			strokeWidth='1.5'
			strokeLinecap='round'
		/>
		<defs>
			<linearGradient
				id='edit-book-fill-a'
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
				id='edit-book-fill-b'
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
				id='edit-book-stroke'
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

const OBJECT_ID_RE = /^[a-f\d]{24}$/i

function isValidObjectId (value) {
	return typeof value === 'string' && OBJECT_ID_RE.test(value)
}

function bookDisplayName (bookId) {
	if (!bookId || typeof bookId !== 'string') {
		return ''
	}
	const trimmed = bookId.trim()
	const parts = trimmed.split('/')
	const last = parts[parts.length - 1]
	return last && last.length > 0 ? last : trimmed
}

function TeacherEditSubjectScreen () {
	const { id: subjectId } = useParams()
	const navigate = useNavigate()
	const bookInputRef = useRef(null)

	const { teacherInfo } = useSelector((state) => state.authTeacher)
	const teacherId = teacherInfo?._id
		? String(teacherInfo._id)
		: null

	const isValidParam = isValidObjectId(
		subjectId !== undefined ? String(subjectId) : '',
	)

	const {
		data: subjects = [],
		isLoading: isLoadingList,
		isError: isListError,
		refetch,
	} = useGetSubjectsByTeacherIdQuery(teacherId, {
		skip: !teacherId || !isValidParam,
	})

	const [updateSubject, { isLoading: isSavingMutation }] =
		useUpdateSubjectByTeacherMutation()

	const [isSidebarOpen, setIsSidebarOpen] = useState(
		window.innerWidth > 768,
	)
	const [title, setTitle] = useState('')
	const [description, setDescription] = useState('')
	const [bookFile, setBookFile] = useState(null)

	const toggleSidebar = () => {
		setIsSidebarOpen(!isSidebarOpen)
	}

	const currentSubject = subjects.find(
		(s) => String(s._id) === String(subjectId),
	)

	useEffect(() => {
		if (!teacherInfo) {
			navigate('/teachers/login', { replace: true })
		}
	}, [teacherInfo, navigate])

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

	const isSaving = isSavingMutation

	const hasStoredBook = Boolean(
		currentSubject
		&& currentSubject.bookId
		&& String(currentSubject.bookId).trim() !== '',
	)
	const storedBookLabel = hasStoredBook
		? bookDisplayName(String(currentSubject.bookId))
		: ''

	const isUniversity = isUniversitySchool(teacherInfo?.schoolType)
		|| normalizeSubjectPrograms(currentSubject?.program).length > 0
		|| currentSubject?.semester != null

	const gradeDisplayLabel = getSubjectGradeLevelNames(
		currentSubject?.gradesLevel,
	) || '—'
	const programDisplayLabel = getSubjectProgramsLabel(
		currentSubject?.program,
		'—',
	)
	const semesterDisplayLabel = currentSubject?.semester != null
		&& String(currentSubject.semester).trim() !== ''
		? String(currentSubject.semester)
		: '—'

	const openBookHref = hasStoredBook && currentSubject?.bookUrl
		? String(currentSubject.bookUrl)
		: (hasStoredBook && subjectId
			? `${SUBJECTS_URL}/${subjectId}/teacher/book`
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
			toast.error('Please enter a subject name')
			return
		}
		if (!isValidParam || !teacherId || !subjectId) {
			return
		}

		try {
			const payload = {
				id: String(subjectId),
				teacherId,
				title: title.trim(),
				description: description.trim(),
			}
			if (bookFile instanceof File) {
				payload.book = bookFile
			}
			await updateSubject(payload).unwrap()
			toast.success(
				bookFile ? 'Subject and PDF saved.' : 'Subject saved.',
			)
			navigate('/teachers/subjects', { replace: true })
		} catch (err) {
			toast.error(
				err?.data?.message
					|| err?.error
					|| 'Could not save subject. Try again.',
			)
		}
	}

	if (!teacherInfo) {
		return null
	}

	if (!isValidParam) {
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
										<Link
											to='/teachers/subjects'
											className='login-card__link'
										>
											← Back to subjects
										</Link>
										<p className='login-card__subtitle'>
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

	if (isLoadingList && !currentSubject) {
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
								<p className='login-card__subtitle'>Loading…</p>
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
									<p className='login-card__subtitle'>
										We couldn&apos;t load your subjects. Try
										again in a moment.
									</p>
									<button
										type='button'
										className='login-submit'
										onClick={() => void refetch()}
									>
										Try again
									</button>
									<Link
										to='/teachers/subjects'
										className='login-card__link'
									>
										← Back to subjects
									</Link>
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
										<Link
											to='/teachers/subjects'
											className='login-card__link'
										>
											← Back to subjects
										</Link>
										<p className='login-card__subtitle'>
											Subject not found, or you don&apos;t
											have access to it.
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
						<div className='center-content2 login-screen login-screen--wide'><br /><br /><br /><br /><br /><br />
							<div className='login-card'><br /><br /><br />
								<div className='login-card__accent' aria-hidden />
								<div className='login-card__header'>
									<div className='login-card__back'>
										<Link
											to='/teachers/subjects'
											className='login-card__link'
										>
											← Back to subjects
										</Link>
									</div>
									<h1 className='login-card__title'>
										Edit subject
									</h1>
									<p className='login-card__subtitle login-card__subtitle--wide'>
										Update how this course appears to
										students.
										{isUniversity
											? (
												' Program and semester are set '
												+ 'by your school and cannot '
												+ 'be changed here.'
											)
											: (
												' Grade level is set by your '
												+ 'school and cannot be '
												+ 'changed here.'
											)}
										{' '}
										Attach an optional course book — PDF,
										up to 25 MB.
									</p>
								</div>
								<form
									className='login-form'
									id='teacher-edit-subject-form'
									name='teacher-edit-subject-form'
									onSubmit={handleSubmit}
								>
									<div className='login-field'>
										<label
											className='login-label'
											htmlFor='edit-subject-name'
										>
											Subject name
										</label>
										<input
											type='text'
											id='edit-subject-name'
											name='title'
											className='login-input'
											placeholder='e.g. Algebra I'
											autoComplete='off'
											value={title}
											disabled={isSaving}
											onChange={(e) => setTitle(e.target.value)}
										/>
									</div>
									{isUniversity ? (
										<>
											<div className='login-field'>
												<label
													className='login-label'
													htmlFor='edit-subject-program'
												>
													Program
												</label>
												<input
													type='text'
													id='edit-subject-program'
													className='login-input'
													value={programDisplayLabel}
													readOnly
													tabIndex={-1}
													aria-readonly='true'
												/>
											</div>
											<div className='login-field'>
												<label
													className='login-label'
													htmlFor='edit-subject-semester'
												>
													Semester
												</label>
												<input
													type='text'
													id='edit-subject-semester'
													className='login-input'
													value={semesterDisplayLabel}
													readOnly
													tabIndex={-1}
													aria-readonly='true'
												/>
											</div>
										</>
									) : (
										<div className='login-field'>
											<label
												className='login-label'
												htmlFor='edit-subject-grade'
											>
												Grade level
											</label>
											<input
												type='text'
												id='edit-subject-grade'
												className='login-input'
												value={gradeDisplayLabel}
												readOnly
												tabIndex={-1}
												aria-readonly='true'
											/>
										</div>
									)}
									<div className='login-field'>
										<label
											className='login-label'
											htmlFor='edit-subject-description'
										>
											Description
										</label>
										<textarea
											id='edit-subject-description'
											name='description'
											className='login-input login-textarea'
											placeholder={
												'What will students learn? Who is it for?'
											}
											rows={5}
											value={description}
											disabled={isSaving}
											onChange={(e) => setDescription(
												e.target.value,
											)}
										/>
									</div>
									<div className='login-field'>
										<span className='login-label' id='book-label'>
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
												id='edit-subject-book'
												name='book'
												className='teacher-book-upload__input'
												accept='application/pdf,.pdf'
												disabled={isSaving}
												onChange={handleBookChange}
												aria-labelledby='book-label'
											/>
											<label
												htmlFor='edit-subject-book'
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
													disabled={isSaving}
												>
													Remove file
												</button>
											) : null}
										</div>
									</div>
									<div className='subject-book-tools'>
										<div className='subject-book-tools__header'>
											<span className='subject-book-tools__eyebrow'>
												Course book
											</span>
											<h3 className='subject-book-tools__title'>
												Once you have a course book please generate book chapters
											</h3>
											<p className='subject-book-tools__desc'>
												{hasStoredBook
													? 'Split your PDF into chapters with page ranges for each section.'
													: 'Save a course book above to unlock chapter splitting.'}
											</p>
										</div>
										{hasStoredBook ? (
											<Link
												to={`/teachers/bookchapters/${subjectId}`}
												className={
													'subject-book-tools__card '
													+ 'subject-book-tools__card--chapters'
												}
											>
												<span
													className='subject-book-tools__icon'
													aria-hidden
												>
													<svg
														width='22'
														height='22'
														viewBox='0 0 24 24'
														fill='none'
														stroke='currentColor'
														strokeWidth='1.75'
													>
														<path
															d='M4 6a2 2 0 012-2h5v16H6a2 2 0 01-2-2V6z'
															strokeLinejoin='round'
														/>
														<path
															d='M13 4h5a2 2 0 012 2v10a2 2 0 01-2 2h-5V4z'
															strokeLinejoin='round'
														/>
														<path
															d='M9 8h2M9 12h2M9 16h2'
															strokeLinecap='round'
														/>
													</svg>
												</span>
												<span className='subject-book-tools__body'>
													<span className='subject-book-tools__label'>
														Generate Book chapters
													</span>
													<span className='subject-book-tools__hint'>
														Define page ranges per chapter
													</span>
												</span>
												<span
													className='subject-book-tools__arrow'
													aria-hidden
												>
													→
												</span>
											</Link>
										) : (
											<span
												className={
													'subject-book-tools__card '
													+ 'subject-book-tools__card--chapters '
													+ 'subject-book-tools__card--disabled'
												}
												aria-disabled='true'
											>
												<span
													className='subject-book-tools__icon'
													aria-hidden
												>
													<svg
														width='22'
														height='22'
														viewBox='0 0 24 24'
														fill='none'
														stroke='currentColor'
														strokeWidth='1.75'
													>
														<path
															d='M4 6a2 2 0 012-2h5v16H6a2 2 0 01-2-2V6z'
															strokeLinejoin='round'
														/>
														<path
															d='M13 4h5a2 2 0 012 2v10a2 2 0 01-2 2h-5V4z'
															strokeLinejoin='round'
														/>
														<path
															d='M9 8h2M9 12h2M9 16h2'
															strokeLinecap='round'
														/>
													</svg>
												</span>
												<span className='subject-book-tools__body'>
													<span className='subject-book-tools__label'>
														Generate Book chapters
													</span>
													<span className='subject-book-tools__hint'>
														Requires a saved course book PDF
													</span>
												</span>
											</span>
										)}
									</div>
									<button
										type='submit'
										className='login-submit'
										disabled={isSaving}
									>
										{isSaving ? 'Saving…' : 'Save changes'}
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

export default TeacherEditSubjectScreen
