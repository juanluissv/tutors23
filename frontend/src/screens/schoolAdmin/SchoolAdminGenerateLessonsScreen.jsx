import { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { useSelector } from 'react-redux'
import AdminSidebar from '../../components/AdminSidebar'
import AdminHeader from '../../components/AdminHeader'
import {
	useGenerateBookLessonsFromChapterMutation,
	useGetBookLessonsBySubjectQuery,
	useGetSubjectsBySchoolQuery,
} from '../../slices/admin/schoolAdminApiSlice'
import { SUBJECTS_URL } from '../../constants'
import '../../App.css'

const OBJECT_ID_RE = /^[a-fA-F0-9]{24}$/

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

const BookGlyph = () => (
	<svg
		width='40'
		height='40'
		viewBox='0 0 24 24'
		fill='none'
		xmlns='http://www.w3.org/2000/svg'
		className='book-chapters__book-glyph'
		aria-hidden
	>
		<path
			d='M4 6a2 2 0 012-2h5v16H6a2 2 0 01-2-2V6z'
			fill='url(#generate-lessons-book-fill-a)'
		/>
		<path
			d='M13 4h5a2 2 0 012 2v10a2 2 0 01-2 2h-5V4z'
			fill='url(#generate-lessons-book-fill-b)'
		/>
		<path
			d='M12 4v16'
			stroke='url(#generate-lessons-book-stroke)'
			strokeWidth='1.5'
			strokeLinecap='round'
		/>
		<defs>
			<linearGradient
				id='generate-lessons-book-fill-a'
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
				id='generate-lessons-book-fill-b'
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
				id='generate-lessons-book-stroke'
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

const SparkGlyph = () => (
	<svg
		width='22'
		height='22'
		viewBox='0 0 24 24'
		fill='none'
		stroke='currentColor'
		strokeWidth='1.75'
		aria-hidden
	>
		<path
			d='M12 3l1.6 5.4L19 10l-5.4 1.6L12 17l-1.6-5.4L5 10l5.4-1.6L12 3z'
			strokeLinecap='round'
			strokeLinejoin='round'
		/>
		<path
			d='M19 15l.8 2.6L22 18l-2.2.4L19 21l-.8-2.6L16 18l2.2-.4L19 15z'
			strokeLinecap='round'
			strokeLinejoin='round'
		/>
	</svg>
)

function chapterTitle (chapter, index) {
	const title = chapter?.ChapterTitle
		? String(chapter.ChapterTitle).trim()
		: ''
	if (title) {
		return title
	}
	return `Chapter ${chapter?.ChapterNumber ?? index + 1}`
}

function chapterPageLabel (chapter) {
	const start = chapter?.ChapterBeginPage
	const end = chapter?.ChapterEndPage
	if (start != null && end != null) {
		return `Pages ${start}–${end}`
	}
	if (start != null) {
		return `From page ${start}`
	}
	if (end != null) {
		return `Through page ${end}`
	}
	return 'Page range not set'
}

function SchoolAdminGenerateLessonsScreen () {
	const navigate = useNavigate()
	const { subjectId } = useParams()
	const { schoolAdminInfo } = useSelector((state) => state.authSchoolAdmin)
	const schoolId = schoolAdminInfo
		? resolveSchoolId(schoolAdminInfo.school)
		: null

	const [isSidebarOpen, setIsSidebarOpen] = useState(
		window.innerWidth > 768,
	)
	const [generatingChapterId, setGeneratingChapterId] = useState(null)
	const [chapterErrors, setChapterErrors] = useState({})

	const isValidSubjectParam =
		subjectId != null && OBJECT_ID_RE.test(String(subjectId))

	const {
		data: subjects = [],
		isLoading: isLoadingSubjects,
		isError: isSubjectsError,
		refetch: refetchSubjects,
	} = useGetSubjectsBySchoolQuery(schoolId, {
		skip: !schoolId,
	})

	const {
		data: bookLessons = [],
		isLoading: isLoadingLessons,
		refetch: refetchLessons,
	} = useGetBookLessonsBySubjectQuery(subjectId, {
		skip: !isValidSubjectParam,
	})

	const [generateLessons, { isLoading: isGenerating }] =
		useGenerateBookLessonsFromChapterMutation()

	const lessonsByChapterId = useMemo(() => {
		const map = new Map()
		for (const lesson of bookLessons) {
			const chapterId = lesson?.bookChapter?.chapterId
			if (chapterId) {
				map.set(String(chapterId), lesson)
			}
		}
		return map
	}, [bookLessons])

	const currentSubject = useMemo(() => {
		if (!isValidSubjectParam || !subjects?.length) {
			return undefined
		}
		return subjects.find((s) => String(s._id) === String(subjectId))
	}, [subjects, subjectId, isValidSubjectParam])

	const bookChapters = useMemo(() => {
		if (!Array.isArray(currentSubject?.bookChapters)) {
			return []
		}
		return currentSubject.bookChapters
	}, [currentSubject])

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

	const chaptersWithPdf = bookChapters.filter(
		(chapter) => chapter.ChapterFileId || chapter.chapterFileUrl,
	).length

	const toggleSidebar = () => {
		setIsSidebarOpen(!isSidebarOpen)
	}

	const handleGenerateLessons = async (chapterId) => {
		if (!subjectId || !chapterId) {
			return
		}

		setGeneratingChapterId(String(chapterId))
		setChapterErrors((prev) => {
			const next = { ...prev }
			delete next[String(chapterId)]
			return next
		})

		try {
			await generateLessons({
				id: subjectId,
				chapterId: String(chapterId),
			}).unwrap()
			await refetchLessons()
		} catch (err) {
			const message = err?.data?.message
				|| err?.message
				|| 'Could not generate lessons. Please try again.'
			setChapterErrors((prev) => ({
				...prev,
				[String(chapterId)]: message,
			}))
		} finally {
			setGeneratingChapterId(null)
		}
	}

	useEffect(() => {
		if (!schoolAdminInfo) {
			navigate('/schooladmins/login', { replace: true })
		}
	}, [schoolAdminInfo, navigate])

	if (!schoolAdminInfo) {
		return null
	}

	if (!isValidSubjectParam) {
		return (
			<div className='chat-app chat-app--teacher-login ask-screen'>
				<div className='main-container'>
					<AdminSidebar
						isOpen={isSidebarOpen}
						toggleSidebar={toggleSidebar}
					/>
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
											Invalid subject
										</h1>
										<p className={
											'login-card__subtitle ' +
											'login-card__subtitle--wide'
										}
										>
											This link does not point to a valid
											subject.
										</p>
										<p className='login-card__back'>
											<Link
												to='/schooladmins/mysubjects'
												className='login-card__link'
											>
												← Back to subjects
											</Link>
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

	if (!isLoadingSubjects && !currentSubject) {
		return (
			<div className='chat-app chat-app--teacher-login ask-screen'>
				<div className='main-container'>
					<AdminSidebar
						isOpen={isSidebarOpen}
						toggleSidebar={toggleSidebar}
					/>
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
											Subject not found
										</h1>
										<p className={
											'login-card__subtitle ' +
											'login-card__subtitle--wide'
										}
										>
											There is no subject with this id in
											your school.
										</p>
										<p className='login-card__back'>
											<Link
												to='/schooladmins/mysubjects'
												className='login-card__link'
											>
												← Back to subjects
											</Link>
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

	const subjectTitle = currentSubject?.title
		? String(currentSubject.title)
		: 'Subject'

	return (
		<div className='chat-app chat-app--teacher-login ask-screen'>
			<div className='main-container'>
				<AdminSidebar
					isOpen={isSidebarOpen}
					toggleSidebar={toggleSidebar}
				/>
				<div className='main-content'>
					<AdminHeader
						isSidebarOpen={isSidebarOpen}
						toggleSidebar={toggleSidebar}
					/>
					<div className={
						'content-area content-area--login ' +
						'content-area--login-scroll'
					}
					>
						<div className='center-content2 login-screen login-screen--wide'>
							<div className='login-card book-chapters generate-lessons'>
								<div className='login-card__accent' aria-hidden />
								<div className='login-card__header'>
									<p className='login-card__back'>
										<Link
											to={`/schooladmins/editsubject/${subjectId}`}
											className='login-card__link'
										>
											← Back to edit subject
										</Link>
									</p>
									<h1 className='login-card__title'>
										Generate lessons
									</h1>
									<p className={
										'login-card__subtitle ' +
										'login-card__subtitle--wide'
									}
									>
										Use the full course book and chapter PDFs
										for{' '}
										<strong>{subjectTitle}</strong> to build
										lessons chapter by chapter.
									</p>
								</div>

								{isSubjectsError ? (
									<div className='book-chapters__alert'>
										<p className='book-chapters__alert-text'>
											We could not load this subject.
											Please try again.
										</p>
										<button
											type='button'
											className='login-submit'
											onClick={() => void refetchSubjects()}
										>
											Try again
										</button>
									</div>
								) : null}

								<section
									className='book-chapters__book-section'
									aria-labelledby='generate-lessons-book-heading'
								>
									<h2
										id='generate-lessons-book-heading'
										className='book-chapters__section-title'
									>
										Full course book
									</h2>

									{isLoadingSubjects && !currentSubject ? (
										<p className='book-chapters__loading'>
											Loading book…
										</p>
									) : hasStoredBook ? (
										<div className='book-chapters__book-card'>
											<div className='book-chapters__book-visual'>
												<BookGlyph />
											</div>
											<div
												className={
													'teacher-book-upload__status ' +
													'book-chapters__book-status'
												}
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
														PDF saved for this subject
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
																	className={
																		'teacher-book-upload__open-link-icon'
																	}
																	aria-hidden
																>
																	↗
																</span>
															</a>
														</p>
													) : null}
													<p className='teacher-book-upload__status-hint'>
														Chapter PDFs below were
														extracted from this full
														book.
													</p>
												</div>
											</div>
										</div>
									) : (
										<div
											className='book-chapters__empty-book'
											role='status'
										>
											<div className='book-chapters__empty-book-icon'>
												<BookGlyph />
											</div>
											<p className='book-chapters__empty-book-title'>
												No course book uploaded yet
											</p>
											<p className='book-chapters__empty-book-text'>
												Upload the full PDF on the edit
												subject page before generating
												lessons.
											</p>
											<Link
												to={`/schooladmins/editsubject/${subjectId}`}
												className='book-chapters__empty-book-link'
											>
												Go to edit subject
											</Link>
										</div>
									)}
								</section>

								<section
									className='book-chapters__list-section'
									aria-labelledby='generate-lessons-chapters-heading'
								>
									<div className='book-chapters__list-header'>
										<div>
											<h2
												id='generate-lessons-chapters-heading'
												className='book-chapters__section-title'
											>
												Book chapters
											</h2>
											<p className='book-chapters__section-desc'>
												Each chapter needs a generated PDF
												before you can create lessons from
												it.
											</p>
										</div>
										{bookChapters.length > 0 ? (
											<span className='book-chapters__count'>
												{chaptersWithPdf}/{bookChapters.length}{' '}
												ready
											</span>
										) : null}
									</div>

									{isLoadingSubjects || isLoadingLessons ? (
										<p className='book-chapters__loading'>
											Loading chapters…
										</p>
									) : bookChapters.length === 0 ? (
										<div className='book-chapters__empty-chapters'>
											<p className='book-chapters__empty-chapters-title'>
												No chapters yet
											</p>
											<p className='book-chapters__empty-chapters-text'>
												Define chapter page ranges and
												generate PDFs on the book chapters
												page first.
											</p>
											<Link
												to={`/schooladmins/bookchapters/${subjectId}`}
												className='book-chapters__empty-chapters-link'
											>
												Go to book chapters
											</Link>
										</div>
									) : (
										<ol className='generate-lessons__chapter-list'>
											{bookChapters.map((chapter, index) => {
												const chapterKey = chapter._id
													? String(chapter._id)
													: `chapter-${index}`
												const hasChapterFile = Boolean(
													chapter.ChapterFileId
													|| chapter.chapterFileUrl,
												)
												const chapterFileLabel = chapter.ChapterFileId
													? bookDisplayName(
														String(chapter.ChapterFileId),
													)
													: ''
												const title = chapterTitle(chapter, index)
												const pageLabel = chapterPageLabel(chapter)
												const lesson = chapter._id
													? lessonsByChapterId.get(
														String(chapter._id),
													)
													: undefined
												const hasGeneratedLesson = Boolean(
													lesson?.hasContent,
												)
												const isThisGenerating =
													generatingChapterId === String(chapter._id)
													&& isGenerating
												const chapterError = chapter._id
													? chapterErrors[String(chapter._id)]
													: undefined

												return (
													<li
														key={chapterKey}
														className='generate-lessons__chapter'
													>
														<div className='generate-lessons__chapter-accent' />
														<div className='generate-lessons__chapter-inner'>
															<div className='generate-lessons__chapter-head'>
																<span className='book-chapters__item-num'>
																	{chapter.ChapterNumber
																		?? index + 1}
																</span>
																<div className='generate-lessons__chapter-meta'>
																	<h3 className='generate-lessons__chapter-title'>
																		{title}
																	</h3>
																	<p className='generate-lessons__chapter-pages'>
																		{pageLabel}
																	</p>
																</div>
															</div>

															{hasChapterFile ? (
																<div
																	className='book-chapters__upload-status'
																	role='status'
																>
																	<span
																		className='book-chapters__upload-status-icon'
																		aria-hidden
																	>
																		✓
																	</span>
																	<div className='book-chapters__upload-status-body'>
																		<p className='book-chapters__upload-status-title'>
																			Chapter PDF generated
																		</p>
																		{chapterFileLabel ? (
																			<p className='book-chapters__upload-status-file'>
																				{chapterFileLabel}
																			</p>
																		) : null}
																		{chapter.chapterFileUrl ? (
																			<a
																				href={chapter.chapterFileUrl}
																				className='teacher-book-upload__open-link'
																				target='_blank'
																				rel='noopener noreferrer'
																			>
																				Open chapter PDF
																				<span
																					className='teacher-book-upload__open-link-icon'
																					aria-hidden
																				>
																					↗
																				</span>
																			</a>
																		) : null}
																	</div>
																</div>
															) : (
																<div
																	className='generate-lessons__chapter-missing'
																	role='status'
																>
																	<span
																		className='generate-lessons__chapter-missing-icon'
																		aria-hidden
																	>
																		!
																	</span>
																	<div className='generate-lessons__chapter-missing-body'>
																		<p className='generate-lessons__chapter-missing-title'>
																			Chapter PDF not ready
																		</p>
																		<p className='generate-lessons__chapter-missing-text'>
																			Generate this chapter PDF
																			on the book chapters page
																			before creating lessons.
																		</p>
																		<Link
																			to={`/schooladmins/bookchapters/${subjectId}`}
																			className='teacher-book-upload__open-link'
																		>
																			Go to book chapters
																			<span
																				className='teacher-book-upload__open-link-icon'
																				aria-hidden
																			>
																				↗
																			</span>
																		</Link>
																	</div>
																</div>
															)}

															{hasGeneratedLesson ? (
																<div
																	className='generate-lessons__lesson-ready'
																	role='status'
																>
																	<p className='generate-lessons__lesson-ready-title'>
																		Lessons generated
																	</p>
																	<p className='generate-lessons__lesson-ready-meta'>
																		{lesson.content?.length ?? 0}{' '}
																		elements extracted from PDF
																	</p>
																	<Link
																		to={`/schooladmins/lessonpage/${subjectId}/${lesson._id}`}
																		className='teacher-book-upload__open-link'
																		target='_blank'
																		rel='noopener noreferrer'
																	>
																		Preview student lesson
																		<span
																			className='teacher-book-upload__open-link-icon'
																			aria-hidden
																		>
																			↗
																		</span>
																	</Link>
																</div>
															) : null}

															{chapterError ? (
																<p className='generate-lessons__chapter-error'>
																	{chapterError}
																</p>
															) : null}

															<button
																type='button'
																className={
																	'generate-lessons__action-btn' +
																	((!hasChapterFile || isThisGenerating)
																		? ' generate-lessons__action-btn--disabled'
																		: '')
																}
																disabled={
																	!hasChapterFile
																	|| isThisGenerating
																}
																onClick={() => {
																	if (!chapter._id) {
																		return
																	}
																	void handleGenerateLessons(
																		chapter._id,
																	)
																}}
															>
																<span className='generate-lessons__action-btn-icon'>
																	<SparkGlyph />
																</span>
																<span className='generate-lessons__action-btn-title'>
																	{isThisGenerating
																		? 'Generating…'
																		: (hasGeneratedLesson
																			? 'Regenerate lessons'
																			: 'Generate lessons')}
																</span>
																<span className='generate-lessons__action-btn-hint'>
																	{!hasChapterFile
																		? 'Chapter PDF required first'
																		: (isThisGenerating
																			? 'Reading text, tables & charts with AI…'
																			: (hasGeneratedLesson
																				? 'Rebuild lesson (text, tables & charts)'
																				: 'AI reads text, tables & charts from the PDF'))}
																</span>
															</button>
														</div>
													</li>
												)
											})}
										</ol>
									)}
								</section>
							</div>
						</div>
					</div>
				</div>
			</div>
		</div>
	)
}

export default SchoolAdminGenerateLessonsScreen
