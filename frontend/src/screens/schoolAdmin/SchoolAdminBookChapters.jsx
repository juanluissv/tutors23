import { useEffect, useMemo, useRef, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { useSelector } from 'react-redux'
import { toast } from 'react-toastify'
import AdminSidebar from '../../components/AdminSidebar'
import AdminHeader from '../../components/AdminHeader'
import {
	useGetSubjectsBySchoolQuery,
	useUpdateSubjectBookChaptersMutation,
	useGenerateSubjectBookChapterPdfMutation,
	useDeleteSubjectBookChapterMutation,
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

function isPersistedChapterId (chapterId) {
	return chapterId != null && OBJECT_ID_RE.test(String(chapterId))
}

function chapterDraftFromApi (chapter, index) {
	return {
		_id: chapter._id ? String(chapter._id) : `draft-${index}-${Date.now()}`,
		ChapterNumber: chapter.ChapterNumber ?? index + 1,
		ChapterTitle: chapter.ChapterTitle ? String(chapter.ChapterTitle) : '',
		ChapterBeginPage: chapter.ChapterBeginPage ?? '',
		ChapterEndPage: chapter.ChapterEndPage ?? '',
		ChapterFileId: chapter.ChapterFileId || '',
		chapterFileUrl: chapter.chapterFileUrl || '',
	}
}

function chaptersToDrafts (bookChapters) {
	if (!Array.isArray(bookChapters) || bookChapters.length === 0) {
		return []
	}
	return bookChapters.map((chapter, index) => chapterDraftFromApi(chapter, index))
}

function draftsToPayload (drafts) {
	return drafts.map((draft, index) => ({
		...(isPersistedChapterId(draft._id) ? { _id: draft._id } : {}),
		ChapterNumber: draft.ChapterNumber || index + 1,
		ChapterTitle: String(draft.ChapterTitle || '').trim(),
		ChapterBeginPage: draft.ChapterBeginPage === ''
			? undefined
			: Number(draft.ChapterBeginPage),
		ChapterEndPage: draft.ChapterEndPage === ''
			? undefined
			: Number(draft.ChapterEndPage),
	}))
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
			fill='url(#book-chapters-fill-a)'
		/>
		<path
			d='M13 4h5a2 2 0 012 2v10a2 2 0 01-2 2h-5V4z'
			fill='url(#book-chapters-fill-b)'
		/>
		<path
			d='M12 4v16'
			stroke='url(#book-chapters-stroke)'
			strokeWidth='1.5'
			strokeLinecap='round'
		/>
		<defs>
			<linearGradient
				id='book-chapters-fill-a'
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
				id='book-chapters-fill-b'
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
				id='book-chapters-stroke'
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

const ChapterGenerateGlyph = () => (
	<svg
		width='28'
		height='28'
		viewBox='0 0 24 24'
		fill='none'
		stroke='currentColor'
		strokeWidth='1.75'
		aria-hidden
	>
		<path
			d='M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z'
			strokeLinecap='round'
			strokeLinejoin='round'
		/>
		<path
			d='M14 2v6h6M8 13h8M8 17h5'
			strokeLinecap='round'
			strokeLinejoin='round'
		/>
	</svg>
)

function SchoolAdminBookChapters () {
	const navigate = useNavigate()
	const { subjectId } = useParams()
	const { schoolAdminInfo } = useSelector((state) => state.authSchoolAdmin)
	const schoolId = schoolAdminInfo
		? resolveSchoolId(schoolAdminInfo.school)
		: null

	const [isSidebarOpen, setIsSidebarOpen] = useState(
		window.innerWidth > 768,
	)
	const [chapterDrafts, setChapterDrafts] = useState([])
	const [generatingChapterId, setGeneratingChapterId] = useState(null)
	const initializedSubjectRef = useRef(null)

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

	const [
		updateBookChapters,
		{ isLoading: isSavingChapters },
	] = useUpdateSubjectBookChaptersMutation()

	const [
		generateChapterPdf,
		{ isLoading: isGeneratingChapter },
	] = useGenerateSubjectBookChapterPdfMutation()

	const [
		deleteBookChapter,
		{ isLoading: isDeletingChapter },
	] = useDeleteSubjectBookChapterMutation()

	const currentSubject = useMemo(() => {
		if (!isValidSubjectParam || !subjects?.length) {
			return undefined
		}
		return subjects.find((s) => String(s._id) === String(subjectId))
	}, [subjects, subjectId, isValidSubjectParam])

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

	const hasChaptersWithPdf = chapterDrafts.some(
		(chapter) => Boolean(
			chapter.ChapterFileId || chapter.chapterFileUrl,
		),
	)

	const isBusy = isSavingChapters || isGeneratingChapter || isDeletingChapter

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
		const subjectKey = String(currentSubject._id)
		if (initializedSubjectRef.current === subjectKey) {
			return
		}
		setChapterDrafts(chaptersToDrafts(currentSubject.bookChapters))
		initializedSubjectRef.current = subjectKey
	}, [currentSubject])

	const handleChapterFieldChange = (chapterKey, field, value) => {
		if (field === 'ChapterBeginPage' || field === 'ChapterEndPage') {
			setChapterDrafts((prev) => prev.map((chapter) => {
				if (String(chapter._id) !== String(chapterKey)) {
					return chapter
				}
				return {
					...chapter,
					[field]: value.replace(/[^\d]/g, ''),
				}
			}))
			return
		}

		setChapterDrafts((prev) => prev.map((chapter) => {
			if (String(chapter._id) !== String(chapterKey)) {
				return chapter
			}
			return {
				...chapter,
				[field]: value,
			}
		}))
	}

	const handleAddChapter = () => {
		setChapterDrafts((prev) => [
			...prev,
			{
				_id: `draft-${Date.now()}`,
				ChapterNumber: prev.length + 1,
				ChapterTitle: '',
				ChapterBeginPage: '',
				ChapterEndPage: '',
				ChapterFileId: '',
				chapterFileUrl: '',
			},
		])
	}

	const handleRemoveChapter = async (chapterKey) => {
		if (!isPersistedChapterId(chapterKey)) {
			setChapterDrafts((prev) => {
				const next = prev.filter(
					(chapter) => String(chapter._id) !== String(chapterKey),
				)
				return next.map((chapter, index) => ({
					...chapter,
					ChapterNumber: index + 1,
				}))
			})
			return
		}

		if (!isValidSubjectParam) {
			return
		}

		try {
			const result = await deleteBookChapter({
				id: String(subjectId),
				chapterId: String(chapterKey),
			}).unwrap()
			setChapterDrafts(chaptersToDrafts(result.bookChapters))
			initializedSubjectRef.current = String(subjectId)
			toast.success('Chapter removed')
			await refetchSubjects()
		} catch (err) {
			const message = err?.data?.message || 'Could not remove chapter'
			toast.error(message)
		}
	}

	const handleSaveChapters = async () => {
		if (!isValidSubjectParam) {
			return
		}

		try {
			await updateBookChapters({
				id: String(subjectId),
				bookChapters: draftsToPayload(chapterDrafts),
			}).unwrap()
			toast.success('Chapters saved')
			initializedSubjectRef.current = null
			await refetchSubjects()
		} catch (err) {
			const message = err?.data?.message || 'Could not save chapters'
			toast.error(message)
		}
	}

	const handleGenerateChapterPdf = async (chapterKey) => {
		if (!isValidSubjectParam) {
			return
		}

		if (!isPersistedChapterId(chapterKey)) {
			toast.error('Save this chapter before generating a PDF')
			return
		}

		if (!hasStoredBook) {
			toast.error('Upload the full course book before generating chapters')
			return
		}

		const chapter = chapterDrafts.find(
			(item) => String(item._id) === String(chapterKey),
		)

		if (!chapter?.ChapterBeginPage || !chapter?.ChapterEndPage) {
			toast.error('Enter start and end page numbers first')
			return
		}

		setGeneratingChapterId(String(chapterKey))

		try {
			await updateBookChapters({
				id: String(subjectId),
				bookChapters: draftsToPayload(chapterDrafts),
			}).unwrap()

			await generateChapterPdf({
				id: String(subjectId),
				chapterId: String(chapterKey),
			}).unwrap()
			toast.success('Chapter PDF generated')
			initializedSubjectRef.current = null
			await refetchSubjects()
		} catch (err) {
			const message = err?.data?.message || 'Could not generate chapter PDF'
			toast.error(message)
		} finally {
			setGeneratingChapterId(null)
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
							<div className='login-card book-chapters'>
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
										Book chapters
									</h1>
									<p className={
										'login-card__subtitle ' +
										'login-card__subtitle--wide'
									}
									>
										Define chapter page ranges for{' '}
										<strong>{subjectTitle}</strong> and
										generate each chapter PDF from the full
										course book.
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
									aria-labelledby='book-chapters-book-heading'
								>
									<h2
										id='book-chapters-book-heading'
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
												className='teacher-book-upload__status book-chapters__book-status'
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
																	className='teacher-book-upload__open-link-icon'
																	aria-hidden
																>
																	↗
																</span>
															</a>
														</p>
													) : null}
													<p className='teacher-book-upload__status-hint'>
														Use the PDF page numbers
														when setting chapter ranges
														below.
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
												subject page before mapping
												chapters.
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
									aria-labelledby='book-chapters-list-heading'
								>
									<div className='book-chapters__list-header'>
										<div>
											<h2
												id='book-chapters-list-heading'
												className='book-chapters__section-title'
											>
												Chapter page ranges
											</h2>
											<p className='book-chapters__section-desc'>
												For each chapter, complete step 1
												(details and page range), then step
												2 (generate the chapter PDF).
											</p>
										</div>
										{chapterDrafts.length > 0 ? (
											<span className='book-chapters__count'>
												{chapterDrafts.length}{' '}
												{chapterDrafts.length === 1
													? 'chapter'
													: 'chapters'}
											</span>
										) : null}
									</div>

									{isLoadingSubjects ? (
										<p className='book-chapters__loading'>
											Loading chapters…
										</p>
									) : chapterDrafts.length === 0 ? (
										<div className='book-chapters__empty-chapters'>
											<p className='book-chapters__empty-chapters-title'>
												No chapters yet
											</p>
											<p className='book-chapters__empty-chapters-text'>
												Add chapters manually now, or run
												your detection script later to
												populate them automatically.
											</p>
											<button
												type='button'
												className='book-chapters__add-btn'
												disabled={isBusy}
												onClick={handleAddChapter}
											>
												Add first chapter
											</button>
										</div>
									) : (
										<>
											<ol className='book-chapters__list'>
												{chapterDrafts.map((chapter, index) => {
													const chapterKey = String(chapter._id)
													const isPersisted = isPersistedChapterId(
														chapterKey,
													)
													const hasChapterFile = Boolean(
														chapter.ChapterFileId
														|| chapter.chapterFileUrl,
													)
													const chapterFileLabel = chapter.ChapterFileId
														? bookDisplayName(
															String(chapter.ChapterFileId),
														)
														: ''
													const isGeneratingThis = generatingChapterId
														=== chapterKey
													const hasPageRange = Boolean(
														chapter.ChapterBeginPage
														&& chapter.ChapterEndPage,
													)
													const generateDisabled = isBusy
														|| !isPersisted
														|| !hasStoredBook
														|| !hasPageRange
														|| isGeneratingThis

													return (
														<li
															key={chapterKey}
															className='book-chapters__item'
														>
															<div className='book-chapters__item-accent' />
															<div className='book-chapters__item-inner'>
																<div className='book-chapters__item-top'>
																	<span className='book-chapters__item-num'>
																		{chapter.ChapterNumber
																			|| index + 1}
																	</span>
																	<button
																		type='button'
																		className='book-chapters__remove-btn'
																		disabled={isBusy}
																		onClick={() =>
																			void handleRemoveChapter(chapterKey)}
																	>
																		Remove
																	</button>
																</div>

																<div className='book-chapters__steps'>
																	<div className='book-chapters__step book-chapters__step--one'>
																		<div className='book-chapters__step-header'>
																			<span className='book-chapters__step-badge'>
																				1
																			</span>
																			<div className='book-chapters__step-copy'>
																				<p className='book-chapters__step-title'>
																					Save chapter details
																				</p>
																				<p className='book-chapters__step-desc'>
																					First, enter the chapter
																					title, beginning page, and end
																					page — then save below.
																				</p>
																			</div>
																		</div>

																		<div className='book-chapters__step-fields'>
																			<div className='book-chapters__item-meta'>
																				<label
																					className='book-chapters__title-label'
																					htmlFor={`chapter-title-${chapterKey}`}
																				>
																					Chapter title
																				</label>
																				<input
																					id={`chapter-title-${chapterKey}`}
																					type='text'
																					className='book-chapters__title-input'
																					placeholder={`Chapter ${index + 1}`}
																					autoComplete='off'
																					disabled={isBusy}
																					value={chapter.ChapterTitle}
																					onChange={(e) =>
																						handleChapterFieldChange(
																							chapterKey,
																							'ChapterTitle',
																							e.target.value,
																						)}
																				/>
																			</div>

																			<div className='book-chapters__page-fields'>
																				<div className='book-chapters__page-field'>
																					<label
																						className='book-chapters__page-label'
																						htmlFor={`chapter-start-${chapterKey}`}
																					>
																						Start page
																					</label>
																					<div className='book-chapters__page-input-wrap'>
																						<span
																							className='book-chapters__page-prefix'
																							aria-hidden
																						>
																							p.
																						</span>
																						<input
																							id={`chapter-start-${chapterKey}`}
																							type='text'
																							inputMode='numeric'
																							pattern='[0-9]*'
																							className='book-chapters__page-input'
																							placeholder='1'
																							autoComplete='off'
																							disabled={isBusy}
																							value={chapter.ChapterBeginPage}
																							onChange={(e) =>
																								handleChapterFieldChange(
																									chapterKey,
																									'ChapterBeginPage',
																									e.target.value,
																								)}
																						/>
																					</div>
																				</div>

																				<span
																					className='book-chapters__page-separator'
																					aria-hidden
																				>
																					→
																				</span>

																				<div className='book-chapters__page-field'>
																					<label
																						className='book-chapters__page-label'
																						htmlFor={`chapter-end-${chapterKey}`}
																					>
																						End page
																					</label>
																					<div className='book-chapters__page-input-wrap'>
																						<span
																							className='book-chapters__page-prefix'
																							aria-hidden
																						>
																							p.
																						</span>
																						<input
																							id={`chapter-end-${chapterKey}`}
																							type='text'
																							inputMode='numeric'
																							pattern='[0-9]*'
																							className='book-chapters__page-input'
																							placeholder='24'
																							autoComplete='off'
																							disabled={isBusy}
																							value={chapter.ChapterEndPage}
																							onChange={(e) =>
																								handleChapterFieldChange(
																									chapterKey,
																									'ChapterEndPage',
																									e.target.value,
																								)}
																						/>
																					</div>
																				</div>
																			</div>

																			<button
																				type='button'
																				className='login-submit book-chapters__save-btn book-chapters__save-btn--inline'
																				disabled={isBusy}
																				onClick={() => void handleSaveChapters()}
																			>
																				{isSavingChapters
																					? 'Saving…'
																					: 'Save chapters'}
																			</button>
																		</div>
																	</div>

																	<div className={
																		'book-chapters__step book-chapters__step--two' +
																		(!isPersisted
																			? ' book-chapters__step--locked'
																			: '')
																	}
																	>
																		<div className='book-chapters__step-header'>
																			<span className='book-chapters__step-badge book-chapters__step-badge--violet'>
																				2
																			</span>
																			<div className='book-chapters__step-copy'>
																				<p className='book-chapters__step-title'>
																					Generate chapter PDF
																				</p>
																				<p className='book-chapters__step-desc'>
																					Extract pages from the full
																					course book using the saved
																					title and page range.
																				</p>
																			</div>
																		</div>

																		<div className='book-chapters__generate-panel'>
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
																			) : null}

																			<button
																				type='button'
																				className={
																					'book-chapters__generate-btn' +
																					(generateDisabled
																						? ' book-chapters__generate-btn--disabled'
																						: '')
																				}
																				disabled={generateDisabled}
																				onClick={() =>
																					void handleGenerateChapterPdf(
																						chapterKey,
																					)}
																			>
																				<span className='book-chapters__generate-btn-icon'>
																					<ChapterGenerateGlyph />
																				</span>
																				<span className='book-chapters__generate-btn-title'>
																					{isGeneratingThis
																						? 'Generating PDF…'
																						: hasChapterFile
																							? 'Regenerate chapter PDF'
																							: 'Generate chapter PDF'}
																				</span>
																				<span className='book-chapters__generate-btn-hint'>
																					{!isPersisted
																						? 'Complete step 1 first'
																						: !hasStoredBook
																							? 'Upload the full course book first'
																							: !hasPageRange
																								? 'Enter start and end pages'
																								: `Pages ${chapter.ChapterBeginPage}–${chapter.ChapterEndPage} from full book`}
																				</span>
																			</button>
																		</div>
																	</div>
																</div>
															</div>
														</li>
													)
												})}
											</ol>

											<div className={
												'subject-book-tools '
												+ 'subject-book-tools--after-list'
											}
											>
												<div className='subject-book-tools__header'>
													<span className='subject-book-tools__eyebrow'>
														Next step
													</span>
													<h3 className='subject-book-tools__title'>
														Lesson generation
													</h3>
													<p className='subject-book-tools__desc'>
														{hasChaptersWithPdf
															? 'Turn your chapter PDFs into interactive student lesson pages.'
															: 'Save chapters and generate at least one chapter PDF to unlock lesson generation.'}
													</p>
												</div>
												{hasChaptersWithPdf ? (
													<Link
														to={`/schooladmins/generatelessons/${subjectId}`}
														className={
															'subject-book-tools__card '
															+ 'subject-book-tools__card--lessons'
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
																	d='M12 3l1.5 4.5L18 9l-4.5 1.5L12 15l-1.5-4.5L6 9l4.5-1.5L12 3z'
																	strokeLinejoin='round'
																/>
																<path
																	d='M5 19l1 3 1-3 3-1-3-1-1-3-1 3-3 1 3 1z'
																	strokeLinejoin='round'
																/>
															</svg>
														</span>
														<span className='subject-book-tools__body'>
															<span className='subject-book-tools__label'>
																Generate lessons
															</span>
															<span className='subject-book-tools__hint'>
																Build student-ready lesson pages
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
															+ 'subject-book-tools__card--lessons '
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
																	d='M12 3l1.5 4.5L18 9l-4.5 1.5L12 15l-1.5-4.5L6 9l4.5-1.5L12 3z'
																	strokeLinejoin='round'
																/>
																<path
																	d='M5 19l1 3 1-3 3-1-3-1-1-3-1 3-3 1 3 1z'
																	strokeLinejoin='round'
																/>
															</svg>
														</span>
														<span className='subject-book-tools__body'>
															<span className='subject-book-tools__label'>
																Generate lessons
															</span>
															<span className='subject-book-tools__hint'>
																Requires a generated chapter PDF
															</span>
														</span>
													</span>
												)}
											</div>

											<div className='book-chapters__actions'>
												<button
													type='button'
													className='book-chapters__add-btn'
													disabled={isBusy}
													onClick={handleAddChapter}
												>
													+ Add chapter
												</button>
											</div>
										</>
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

export default SchoolAdminBookChapters
