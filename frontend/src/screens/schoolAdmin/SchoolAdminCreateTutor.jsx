import { useEffect, useMemo, useRef, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { useSelector } from 'react-redux'
import AdminSidebar from '../../components/AdminSidebar'
import AdminHeader from '../../components/AdminHeader'
import {
	useGenerateChapterTutorTxtFromLessonMutation,
	useGetBookLessonsBySubjectQuery,
	useGetSubjectsBySchoolQuery,
	useUploadChapterTutorVideoMutation,
	useUploadChapterTutorTranscribeMutation,
} from '../../slices/admin/schoolAdminApiSlice'
import { buildBookIndex } from '../../utils/buildBookIndex'
import '../../App.css'

const OBJECT_ID_RE = /^[a-fA-F0-9]{24}$/

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

const TutorGenerateGlyph = () => (
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
			d='M12 3l1.5 4.5L18 9l-4.5 1.5L12 15l-1.5-4.5L6 9l4.5-1.5L12 3z'
			strokeLinecap='round'
			strokeLinejoin='round'
		/>
		<path
			d='M5 19l1 3 1-3 3-1-3-1-1-3-1 3-3 1 3 1zM19 13l.75 2.25L22 16l-2.25.75L19 19l-.75-2.25L16 16l2.25-.75L19 13z'
			strokeLinecap='round'
			strokeLinejoin='round'
		/>
	</svg>
)

const TutorVideoUploadGlyph = () => (
	<svg
		width='22'
		height='22'
		viewBox='0 0 24 24'
		fill='none'
		stroke='currentColor'
		strokeWidth='1.75'
		aria-hidden
	>
		<rect
			x='3'
			y='6'
			width='18'
			height='12'
			rx='2'
			strokeLinecap='round'
			strokeLinejoin='round'
		/>
		<path
			d='M10 10.5l3 2.25L16 10.5'
			strokeLinecap='round'
			strokeLinejoin='round'
		/>
		<path
			d='M12 3v5M9.5 5.5L12 3l2.5 2.5'
			strokeLinecap='round'
			strokeLinejoin='round'
		/>
	</svg>
)

const TutorTranscribeUploadGlyph = () => (
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
			d='M4 6h16M4 10h10M4 14h14M4 18h8'
			strokeLinecap='round'
			strokeLinejoin='round'
		/>
		<path
			d='M18 16v4M16 18h4'
			strokeLinecap='round'
			strokeLinejoin='round'
		/>
	</svg>
)

function SchoolAdminCreateTutor () {
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
	const [uploadingChapterId, setUploadingChapterId] = useState(null)
	const [uploadingTranscribeChapterId, setUploadingTranscribeChapterId] =
		useState(null)
	const [pendingUploadChapterId, setPendingUploadChapterId] = useState(null)
	const [pendingTranscribeChapterId, setPendingTranscribeChapterId] =
		useState(null)
	const [chapterErrors, setChapterErrors] = useState({})
	const [videoErrors, setVideoErrors] = useState({})
	const [transcribeErrors, setTranscribeErrors] = useState({})
	const videoInputRef = useRef(null)
	const transcribeInputRef = useRef(null)

	const [generateTutorTxt] = useGenerateChapterTutorTxtFromLessonMutation()
	const [uploadChapterTutorVideo] = useUploadChapterTutorVideoMutation()
	const [uploadChapterTutorTranscribe] =
		useUploadChapterTutorTranscribeMutation()

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
		isError: isLessonsError,
		refetch: refetchLessons,
	} = useGetBookLessonsBySubjectQuery(subjectId, {
		skip: !isValidSubjectParam,
	})

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

	const { rows, groups } = useMemo(
		() => buildBookIndex(bookChapters, lessonsByChapterId),
		[bookChapters, lessonsByChapterId],
	)

	const readyCount = rows.filter((row) => row.hasWebVersion).length
	const availableGroups = useMemo(
		() => groups.map((group) => ({
			...group,
			items: group.items.filter((item) => item.hasWebVersion),
		})).filter((group) => group.items.length > 0),
		[groups],
	)

	const chapterTxtByChapterId = useMemo(() => {
		const map = new Map()
		for (const chapter of bookChapters) {
			if (!chapter?._id) {
				continue
			}
			const txtFileId = chapter.ChapterTxtFileId
				&& String(chapter.ChapterTxtFileId).trim() !== ''
				? String(chapter.ChapterTxtFileId).trim()
				: null
			if (txtFileId) {
				map.set(String(chapter._id), {
					chapterTxtFileId: txtFileId,
					chapterTxtFileUrl: chapter.chapterTxtFileUrl || '',
				})
			}
		}
		return map
	}, [bookChapters])

	const tutorTxtReadyCount = chapterTxtByChapterId.size

	const chapterVideoByChapterId = useMemo(() => {
		const map = new Map()
		for (const lesson of bookLessons) {
			const chapterId = lesson?.bookChapter?.chapterId
			if (!chapterId) {
				continue
			}
			const videoFileId = lesson?.chapterVideoFileId
				&& String(lesson.chapterVideoFileId).trim() !== ''
				? String(lesson.chapterVideoFileId).trim()
				: null
			if (videoFileId) {
				map.set(String(chapterId), {
					chapterVideoFileId: videoFileId,
					chapterVideoFileUrl: lesson.chapterVideoFileUrl || '',
				})
			}
		}
		return map
	}, [bookLessons])

	const tutorVideoReadyCount = chapterVideoByChapterId.size

	const chapterTranscribeByChapterId = useMemo(() => {
		const map = new Map()
		for (const lesson of bookLessons) {
			const chapterId = lesson?.bookChapter?.chapterId
			if (!chapterId) {
				continue
			}
			const transcribeFileId = lesson?.chapterTranscribeFileId
				&& String(lesson.chapterTranscribeFileId).trim() !== ''
				? String(lesson.chapterTranscribeFileId).trim()
				: null
			if (transcribeFileId) {
				map.set(String(chapterId), {
					chapterTranscribeFileId: transcribeFileId,
					chapterTranscribeFileUrl: lesson.chapterTranscribeFileUrl || '',
				})
			}
		}
		return map
	}, [bookLessons])

	const tutorTranscribeReadyCount = chapterTranscribeByChapterId.size

	useEffect(() => {
		if (!schoolAdminInfo) {
			navigate('/schooladmins/login', { replace: true })
		}
	}, [schoolAdminInfo, navigate])

	const toggleSidebar = () => {
		setIsSidebarOpen(!isSidebarOpen)
	}

	const handleGenerateTutorTxt = async (chapterId) => {
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
			await generateTutorTxt({
				id: subjectId,
				chapterId: String(chapterId),
				schoolId,
			}).unwrap()
			await refetchSubjects()
		} catch (err) {
			const message = err?.data?.message
				|| err?.message
				|| 'Could not generate the tutor text file. Please try again.'
			setChapterErrors((prev) => ({
				...prev,
				[String(chapterId)]: message,
			}))
		} finally {
			setGeneratingChapterId(null)
		}
	}

	const handleUploadVideoClick = (chapterId) => {
		if (
			!subjectId
			|| !chapterId
			|| uploadingChapterId
			|| uploadingTranscribeChapterId
			|| generatingChapterId
		) {
			return
		}
		setPendingUploadChapterId(String(chapterId))
		videoInputRef.current?.click()
	}

	const handleUploadTranscribeClick = (chapterId) => {
		if (
			!subjectId
			|| !chapterId
			|| uploadingChapterId
			|| uploadingTranscribeChapterId
			|| generatingChapterId
		) {
			return
		}
		setPendingTranscribeChapterId(String(chapterId))
		transcribeInputRef.current?.click()
	}

	const handleVideoFileChange = async (event) => {
		const file = event.target.files?.[0]
		const chapterId = pendingUploadChapterId
		event.target.value = ''

		if (!file || !chapterId || !subjectId) {
			setPendingUploadChapterId(null)
			return
		}

		setUploadingChapterId(chapterId)
		setPendingUploadChapterId(null)
		setVideoErrors((prev) => {
			const next = { ...prev }
			delete next[chapterId]
			return next
		})

		try {
			await uploadChapterTutorVideo({
				id: subjectId,
				chapterId,
				video: file,
			}).unwrap()
			await refetchLessons()
		} catch (err) {
			const message = err?.data?.message
				|| err?.message
				|| 'Could not upload the tutor video. Please try again.'
			setVideoErrors((prev) => ({
				...prev,
				[chapterId]: message,
			}))
		} finally {
			setUploadingChapterId(null)
		}
	}

	const handleTranscribeFileChange = async (event) => {
		const file = event.target.files?.[0]
		const chapterId = pendingTranscribeChapterId
		event.target.value = ''

		if (!file || !chapterId || !subjectId) {
			setPendingTranscribeChapterId(null)
			return
		}

		setUploadingTranscribeChapterId(chapterId)
		setPendingTranscribeChapterId(null)
		setTranscribeErrors((prev) => {
			const next = { ...prev }
			delete next[chapterId]
			return next
		})

		try {
			await uploadChapterTutorTranscribe({
				id: subjectId,
				chapterId,
				transcribe: file,
			}).unwrap()
			await refetchLessons()
		} catch (err) {
			const message = err?.data?.message
				|| err?.message
				|| 'Could not upload the video captions. Please try again.'
			setTranscribeErrors((prev) => ({
				...prev,
				[chapterId]: message,
			}))
		} finally {
			setUploadingTranscribeChapterId(null)
		}
	}

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
							<div className={
								'login-card book-chapters view-book create-tutor'
							}
							>
								<div className='login-card__accent' aria-hidden />
								<div className='login-card__header'>
									<p className='login-card__back'>
										<Link
											to='/schooladmins/mysubjects'
											className='login-card__link'
										>
											← Back to subjects
										</Link>
									</p>
									<h1 className='login-card__title'>
										Create AI tutor
									</h1>
									<p className={
										'login-card__subtitle ' +
										'login-card__subtitle--wide'
									}
									>
										Generate an AI tutor for each web lesson
										in{' '}
										<strong>{subjectTitle}</strong>. Pick a
										chapter below to start.
									</p>
									<p className='create-tutor__book-link-wrap'>
										<Link
											to={`/schooladmins/viewbook/${subjectId}`}
											className='create-tutor__book-link'
										>
											Open web book index →
										</Link>
									</p>
								</div>

								{isSubjectsError || isLessonsError ? (
									<div className='book-chapters__alert'>
										<p className='book-chapters__alert-text'>
											We could not load the lessons.
											Please try again.
										</p>
										<button
											type='button'
											className='login-submit'
											onClick={() => {
												void refetchSubjects()
												void refetchLessons()
											}}
										>
											Try again
										</button>
									</div>
								) : null}

								<section
									className='view-book__summary create-tutor__summary'
									aria-label='Lessons ready for AI tutor'
								>
									<div className='view-book__summary-card create-tutor__summary-card'>
										<p className='view-book__summary-label'>
											Web lessons ready
										</p>
										<p className='view-book__summary-value'>
											{readyCount}/{rows.length}
										</p>
										<p className='view-book__summary-hint'>
											{readyCount === 0
												? 'Generate web lessons first, then create AI tutors from them.'
												: `${tutorTxtReadyCount} of ${readyCount} lessons have tutor text files ready · ${tutorVideoReadyCount} have tutor videos uploaded · ${tutorTranscribeReadyCount} have captions.`}
										</p>
									</div>
									<Link
										to={`/schooladmins/generatelessons/${subjectId}`}
										className='view-book__summary-link'
									>
										Manage lessons →
									</Link>
								</section>

								{isLoadingSubjects || isLoadingLessons ? (
									<p className='book-chapters__loading'>
										Loading lessons…
									</p>
								) : readyCount === 0 ? (
									<div className='book-chapters__empty-chapters'>
										<p className='book-chapters__empty-chapters-title'>
											No web lessons yet
										</p>
										<p className='book-chapters__empty-chapters-text'>
											Generate web versions from chapter
											PDFs before creating AI tutors.
										</p>
										<Link
											to={`/schooladmins/generatelessons/${subjectId}`}
											className='book-chapters__empty-chapters-link'
										>
											Go to generate lessons
										</Link>
									</div>
								) : (
									<>
										<input
											ref={videoInputRef}
											type='file'
											accept='video/mp4,video/webm,video/quicktime,.mp4,.webm,.mov'
											className='create-tutor__video-input'
											onChange={(event) => {
												void handleVideoFileChange(event)
											}}
										/>
										<input
											ref={transcribeInputRef}
											type='file'
											accept='.srt,text/plain,application/x-subrip'
											className='create-tutor__video-input'
											onChange={(event) => {
												void handleTranscribeFileChange(event)
											}}
										/>
										<div className='view-book__groups'>
										{availableGroups.map((group) => (
											<section
												key={
													group.unitNumber == null
														? 'other'
														: `unit-${group.unitNumber}`
												}
												className='view-book__group'
												aria-labelledby={
													`create-tutor-unit-${group.unitNumber ?? 'other'}`
												}
											>
												<h2
													id={
														`create-tutor-unit-${group.unitNumber ?? 'other'}`
													}
													className='view-book__group-title'
												>
													{group.label}
												</h2>
												<ol className='view-book__list'>
													{group.items.map((row) => {
														const chapterKey = String(
															row.chapterId,
														)
														const txtMeta = chapterTxtByChapterId.get(
															chapterKey,
														)
														const videoMeta = chapterVideoByChapterId.get(
															chapterKey,
														)
														const transcribeMeta = chapterTranscribeByChapterId.get(
															chapterKey,
														)
														const hasTutorTxt = Boolean(
															txtMeta?.chapterTxtFileId
															|| txtMeta?.chapterTxtFileUrl,
														)
														const hasTutorVideo = Boolean(
															videoMeta?.chapterVideoFileId
															|| videoMeta?.chapterVideoFileUrl,
														)
														const hasTutorTranscribe = Boolean(
															transcribeMeta?.chapterTranscribeFileId
															|| transcribeMeta?.chapterTranscribeFileUrl,
														)
														const isGeneratingThis = generatingChapterId
															=== chapterKey
														const isUploadingThis = uploadingChapterId
															=== chapterKey
														const isUploadingTranscribeThis =
															uploadingTranscribeChapterId === chapterKey
														const chapterError = chapterErrors[chapterKey]
														const videoError = videoErrors[chapterKey]
														const transcribeError = transcribeErrors[chapterKey]
														const actionDisabled = Boolean(
															generatingChapterId
															|| uploadingChapterId
															|| uploadingTranscribeChapterId,
														)
														const uploadDisabled = actionDisabled
															|| !hasTutorTxt
														const transcribeUploadDisabled = actionDisabled
															|| !hasTutorVideo

														return (
														<li
															key={
																row.chapterId
																|| `chapter-${row.chapterNumber}`
															}
															className='view-book__item create-tutor__item'
														>
															<div className='view-book__item-main'>
																<span className='view-book__item-num'>
																	{row.chapterNumber}
																</span>
																<div className='view-book__item-copy'>
																	<h3 className='view-book__item-title'>
																		{row.title}
																	</h3>
																	{row.heroSubtitle ? (
																		<p className='view-book__item-subtitle'>
																			{row.heroSubtitle}
																		</p>
																	) : null}
																	{row.pageLabel ? (
																		<p className='view-book__item-meta'>
																			{row.pageLabel}
																		</p>
																	) : null}
																	<Link
																		to={
																			'/schooladmins/lessonpage/' +
																			`${subjectId}/${row.lesson._id}`
																		}
																		className='create-tutor__lesson-link'
																		target='_blank'
																		rel='noopener noreferrer'
																	>
																		Preview web lesson
																		<span
																			className='teacher-book-upload__open-link-icon'
																			aria-hidden
																		>
																			↗
																		</span>
																	</Link>
																	{hasTutorTxt && txtMeta?.chapterTxtFileUrl ? (
																		<p className='create-tutor__txt-status'>
																			<a
																				href={txtMeta.chapterTxtFileUrl}
																				className='create-tutor__txt-link'
																				target='_blank'
																				rel='noopener noreferrer'
																			>
																				Open tutor text file
																				<span
																					className='teacher-book-upload__open-link-icon'
																					aria-hidden
																				>
																					↗
																				</span>
																			</a>
																		</p>
																	) : null}
																	{hasTutorVideo && videoMeta?.chapterVideoFileUrl ? (
																		<p className='create-tutor__video-status'>
																			<a
																				href={videoMeta.chapterVideoFileUrl}
																				className='create-tutor__video-link'
																				target='_blank'
																				rel='noopener noreferrer'
																			>
																				Open tutor video
																				<span
																					className='teacher-book-upload__open-link-icon'
																					aria-hidden
																				>
																					↗
																				</span>
																			</a>
																		</p>
																	) : null}
																	{hasTutorTranscribe
																		&& transcribeMeta?.chapterTranscribeFileUrl ? (
																		<p className='create-tutor__transcribe-status'>
																			<a
																				href={
																					transcribeMeta.chapterTranscribeFileUrl
																				}
																				className='create-tutor__transcribe-link'
																				target='_blank'
																				rel='noopener noreferrer'
																			>
																				Open video captions
																				<span
																					className='teacher-book-upload__open-link-icon'
																					aria-hidden
																				>
																					↗
																				</span>
																			</a>
																		</p>
																	) : null}
																	{chapterError ? (
																		<p className='create-tutor__error'>
																			{chapterError}
																		</p>
																	) : null}
																	{videoError ? (
																		<p className='create-tutor__error'>
																			{videoError}
																		</p>
																	) : null}
																	{transcribeError ? (
																		<p className='create-tutor__error'>
																			{transcribeError}
																		</p>
																	) : null}
																</div>
															</div>
															<div className={
																'view-book__item-actions ' +
																'create-tutor__item-actions'
															}
															>
																<button
																	type='button'
																	className={
																		'create-tutor__generate-btn' +
																		(actionDisabled
																			? ' create-tutor__generate-btn--disabled'
																			: '')
																	}
																	disabled={actionDisabled}
																	onClick={() =>
																		void handleGenerateTutorTxt(
																			chapterKey,
																		)}
																>
																	<span className='create-tutor__generate-btn-icon'>
																		<TutorGenerateGlyph />
																	</span>
																	<span className='create-tutor__generate-btn-title'>
																		{isGeneratingThis
																			? 'Extracting lesson text…'
																			: hasTutorTxt
																				? 'Regenerate AI tutor for this lesson'
																				: 'Generate AI tutor for this lesson'}
																	</span>
																</button>
																<button
																	type='button'
																	className={
																		'create-tutor__upload-video-btn' +
																		(uploadDisabled
																			? ' create-tutor__upload-video-btn--disabled'
																			: '')
																	}
																	disabled={uploadDisabled}
																	title={
																		!hasTutorTxt
																			? 'Generate the tutor text file first'
																			: undefined
																	}
																	onClick={() =>
																		handleUploadVideoClick(chapterKey)}
																>
																	<span className='create-tutor__upload-video-btn-icon'>
																		<TutorVideoUploadGlyph />
																	</span>
																	<span className='create-tutor__upload-video-btn-title'>
																		{isUploadingThis
																			? 'Uploading video…'
																			: hasTutorVideo
																				? 'Replace tutor video'
																				: 'Upload HeyGen video'}
																	</span>
																	<span className='create-tutor__upload-video-btn-hint'>
																		MP4, WebM or MOV · up to 500 MB
																	</span>
																</button>
																<button
																	type='button'
																	className={
																		'create-tutor__upload-transcribe-btn' +
																		(transcribeUploadDisabled
																			? ' create-tutor__upload-transcribe-btn--disabled'
																			: '')
																	}
																	disabled={transcribeUploadDisabled}
																	title={
																		!hasTutorVideo
																			? 'Upload the tutor video first'
																			: undefined
																	}
																	onClick={() =>
																		handleUploadTranscribeClick(chapterKey)}
																>
																	<span className='create-tutor__upload-transcribe-btn-icon'>
																		<TutorTranscribeUploadGlyph />
																	</span>
																	<span className='create-tutor__upload-transcribe-btn-title'>
																		{isUploadingTranscribeThis
																			? 'Uploading captions…'
																			: hasTutorTranscribe
																				? 'Replace video captions'
																				: 'Upload video captions'}
																	</span>
																	<span className='create-tutor__upload-transcribe-btn-hint'>
																		SRT from HeyGen · converted to VTT
																	</span>
																</button>
															</div>
														</li>
														)
													})}
												</ol>
											</section>
										))}
										</div>
									</>
								)}
							</div>
						</div>
					</div>
				</div>
			</div>
		</div>
	)
}

export default SchoolAdminCreateTutor
