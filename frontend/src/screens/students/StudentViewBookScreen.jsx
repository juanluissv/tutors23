import { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { useSelector } from 'react-redux'
import Sidebar from '../../components/Sidebar'
import Header from '../../components/Header'
import {
	useGetBookLessonsBySubjectForStudentQuery,
	useGetMySubjectsQuery,
} from '../../slices/student/studentApiSlice'
import { buildBookIndex } from '../../utils/buildBookIndex'
import '../../App.css'

const OBJECT_ID_RE = /^[a-fA-F0-9]{24}$/

const BOOK_INDEX_LABELS = {
	chapterFallback: (n) => `Capítulo ${n}`,
	pagesRange: (start, end) => `Páginas ${start}–${end}`,
	fromPage: (start) => `Desde la página ${start}`,
	throughPage: (end) => `Hasta la página ${end}`,
	otherChapters: 'Otros capítulos',
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

function stripPdfExtension (name) {
	const trimmed = String(name ?? '').trim()
	if (!trimmed) {
		return trimmed
	}
	return trimmed.replace(/\.pdf$/i, '')
}

function documentDisplayName (doc) {
	if (doc?.fileName) {
		return stripPdfExtension(String(doc.fileName))
	}
	if (doc?.label) {
		return stripPdfExtension(String(doc.label))
	}
	if (doc?.fileId) {
		return stripPdfExtension(bookDisplayName(String(doc.fileId)))
	}
	return 'Documento'
}

function getDocumentKey (doc) {
	if (doc?._id) {
		return String(doc._id)
	}
	if (doc?.fileId) {
		return String(doc.fileId)
	}
	return ''
}

function chapterBelongsToDocument (
	chapter,
	documentKey,
	requiresSourceDocument,
) {
	if (!requiresSourceDocument) {
		return true
	}
	if (!documentKey) {
		return false
	}
	return String(chapter.sourceDocumentId || '') === String(documentKey)
}

function getSubjectDocuments (subject) {
	if (Array.isArray(subject?.documents) && subject.documents.length > 0) {
		return subject.documents
	}
	if (subject?.bookId && String(subject.bookId).trim() !== '') {
		return [{
			_id: null,
			fileId: String(subject.bookId).trim(),
			fileName: bookDisplayName(String(subject.bookId)),
			fileUrl: subject.bookUrl,
		}]
	}
	return []
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
			fill='url(#student-view-book-fill-a)'
		/>
		<path
			d='M13 4h5a2 2 0 012 2v10a2 2 0 01-2 2h-5V4z'
			fill='url(#student-view-book-fill-b)'
		/>
		<path
			d='M12 4v16'
			stroke='url(#student-view-book-stroke)'
			strokeWidth='1.5'
			strokeLinecap='round'
		/>
		<defs>
			<linearGradient
				id='student-view-book-fill-a'
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
				id='student-view-book-fill-b'
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
				id='student-view-book-stroke'
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

const DocumentPdfGlyph = () => (
	<svg
		width='32'
		height='32'
		viewBox='0 0 24 24'
		fill='none'
		xmlns='http://www.w3.org/2000/svg'
		aria-hidden
	>
		<path
			d='M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8l-6-6z'
			fill='url(#student-view-book-doc-pdf-fill)'
		/>
		<path
			d='M14 2v6h6'
			stroke='#0284c7'
			strokeWidth='1.5'
			strokeLinecap='round'
			strokeLinejoin='round'
		/>
		<path
			d='M8 13h8M8 17h5'
			stroke='#0369a1'
			strokeWidth='1.5'
			strokeLinecap='round'
		/>
		<defs>
			<linearGradient
				id='student-view-book-doc-pdf-fill'
				x1='4'
				y1='2'
				x2='20'
				y2='22'
				gradientUnits='userSpaceOnUse'
			>
				<stop stopColor='#e0f2fe' />
				<stop offset='1' stopColor='#7dd3fc' />
			</linearGradient>
		</defs>
	</svg>
)

function StudentViewBookScreen () {
	const navigate = useNavigate()
	const { subjectId } = useParams()
	const { studentInfo } = useSelector((state) => state.authStudent)

	const [isSidebarOpen, setIsSidebarOpen] = useState(
		window.innerWidth > 768,
	)
	const [selectedDocumentId, setSelectedDocumentId] = useState('')

	const isValidSubjectParam =
		subjectId != null && OBJECT_ID_RE.test(String(subjectId))

	const {
		data: subjects = [],
		isLoading: isLoadingSubjects,
		isError: isSubjectsError,
		refetch: refetchSubjects,
	} = useGetMySubjectsQuery(undefined, {
		skip: !studentInfo,
	})

	const {
		data: bookLessons = [],
		isLoading: isLoadingLessons,
		isError: isLessonsError,
		refetch: refetchLessons,
	} = useGetBookLessonsBySubjectForStudentQuery(subjectId, {
		skip: !studentInfo || !isValidSubjectParam,
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

	const subjectDocuments = useMemo(
		() => getSubjectDocuments(currentSubject),
		[currentSubject],
	)
	const hasDocuments = subjectDocuments.length > 0
	const requiresSourceDocument = subjectDocuments.length > 1

	const selectedDocument = useMemo(() => {
		if (!selectedDocumentId) {
			return undefined
		}
		return subjectDocuments.find(
			(doc) => getDocumentKey(doc) === selectedDocumentId,
		)
	}, [subjectDocuments, selectedDocumentId])

	const filteredBookChapters = useMemo(() => {
		if (!hasDocuments) {
			return []
		}
		if (!selectedDocumentId && requiresSourceDocument) {
			return []
		}
		return bookChapters.filter((chapter) => chapterBelongsToDocument(
			chapter,
			selectedDocumentId,
			requiresSourceDocument,
		))
	}, [
		bookChapters,
		hasDocuments,
		requiresSourceDocument,
		selectedDocumentId,
	])

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
		() => buildBookIndex(
			filteredBookChapters,
			lessonsByChapterId,
			BOOK_INDEX_LABELS,
		),
		[filteredBookChapters, lessonsByChapterId],
	)

	const readyCount = rows.filter((row) => row.hasWebVersion).length
	const availableGroups = useMemo(
		() => groups.map((group) => ({
			...group,
			items: group.items.filter((item) => item.hasWebVersion),
		})).filter((group) => group.items.length > 0),
		[groups],
	)

	const getDocumentChapters = (documentKey) => bookChapters.filter(
		(chapter) => chapterBelongsToDocument(
			chapter,
			documentKey,
			requiresSourceDocument,
		),
	)

	const getDocumentChapterCount = (documentKey) =>
		getDocumentChapters(documentKey).length

	const getDocumentWebLessonCount = (documentKey) => {
		const chapters = getDocumentChapters(documentKey)
		const { rows: docRows } = buildBookIndex(
			chapters,
			lessonsByChapterId,
			BOOK_INDEX_LABELS,
		)
		return docRows.filter((row) => row.hasWebVersion).length
	}

	useEffect(() => {
		if (!studentInfo) {
			navigate('/students/login', { replace: true })
		}
	}, [studentInfo, navigate])

	useEffect(() => {
		if (subjectDocuments.length === 0) {
			setSelectedDocumentId('')
			return
		}
		setSelectedDocumentId((prev) => {
			if (
				prev
				&& subjectDocuments.some(
					(doc) => getDocumentKey(doc) === prev,
				)
			) {
				return prev
			}
			return getDocumentKey(subjectDocuments[0])
		})
	}, [subjectDocuments])

	const toggleSidebar = () => {
		setIsSidebarOpen(!isSidebarOpen)
	}

	const handleSelectDocument = (documentKey) => {
		setSelectedDocumentId(String(documentKey))
	}

	if (!studentInfo) {
		return null
	}

	if (!isValidSubjectParam) {
		return (
			<div className='chat-app ask-screen'>
				<div className='main-container'>
					<Sidebar
						isOpen={isSidebarOpen}
						toggleSidebar={toggleSidebar}
					/>
					<div className='main-content'>
						<Header
							isSidebarOpen={isSidebarOpen}
							toggleSidebar={toggleSidebar}
						/>
						<div className='content-area content-area--login'>
							<div className='center-content2 login-screen login-screen--wide'>
								<div className='login-card'>
									<div className='login-card__accent' aria-hidden />
									<div className='login-card__header'>
										<h1 className='login-card__title'>
											Materia no válida
										</h1>
										<p className='login-card__back'>
											<Link
												to='/students/mysubjects'
												className='login-card__link'
											>
												← Volver a mis materias
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
			<div className='chat-app ask-screen'>
				<div className='main-container'>
					<Sidebar
						isOpen={isSidebarOpen}
						toggleSidebar={toggleSidebar}
					/>
					<div className='main-content'>
						<Header
							isSidebarOpen={isSidebarOpen}
							toggleSidebar={toggleSidebar}
						/>
						<div className='content-area content-area--login'>
							<div className='center-content2 login-screen login-screen--wide'>
								<div className='login-card'>
									<div className='login-card__accent' aria-hidden />
									<div className='login-card__header'>
										<h1 className='login-card__title'>
											Materia no encontrada
										</h1>
										<p className='login-card__back'>
											<Link
												to='/students/mysubjects'
												className='login-card__link'
											>
												← Volver a mis materias
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
		: 'Materia'

	return (
		<div className='chat-app ask-screen'>
			<div className='main-container'>
				<Sidebar
					isOpen={isSidebarOpen}
					toggleSidebar={toggleSidebar}
				/>
				<div className='main-content'>
					<Header
						isSidebarOpen={isSidebarOpen}
						toggleSidebar={toggleSidebar}
					/>
					<div className={
						'content-area content-area--login ' +
						'content-area--login-scroll'
					}
					>
						<div className='center-content2 login-screen login-screen--wide'>
							<div className='login-card book-chapters view-book view-book--student'>
								<div className='login-card__accent' aria-hidden />
								<div className='login-card__header'>
									<p className='login-card__back'>
										<Link
											to='/students/mysubjects'
											className='login-card__link'
										>
											← Volver a mis materias
										</Link>
									</p>
									<h1 className='login-card__title'>
										Documentos de la materia
									</h1>
									<p className={
										'login-card__subtitle ' +
										'login-card__subtitle--wide'
									}
									>
										Elige un documento y explora las lecciones
										web de{' '}
										<strong>{subjectTitle}</strong>.
									</p>
								</div>

								{isSubjectsError || isLessonsError ? (
									<div className='book-chapters__alert'>
										<p className='book-chapters__alert-text'>
											No pudimos cargar el documento. Intenta
											de nuevo.
										</p>
										<button
											type='button'
											className='login-submit'
											onClick={() => {
												void refetchSubjects()
												void refetchLessons()
											}}
										>
											Reintentar
										</button>
									</div>
								) : null}

								<section
									className='book-chapters__book-section'
									aria-labelledby='student-view-book-doc-heading'
								>
									<div className='book-chapters__section-intro'>
										<h2
											id='student-view-book-doc-heading'
											className='book-chapters__section-title'
										>
											1. Elige un documento
										</h2>
										<p className='book-chapters__section-desc'>
											Selecciona el documento del que quieres
											leer. Cada documento tiene
											su propia lista de capítulos.
										</p>
									</div>

									{isLoadingSubjects && !currentSubject ? (
										<p className='book-chapters__loading'>
											Cargando documentos…
										</p>
									) : hasDocuments ? (
										<div
											className='book-chapters__doc-picker'
											role='listbox'
											aria-label='Documentos del curso'
										>
											{subjectDocuments.map((doc) => {
												const docKey = getDocumentKey(doc)
												const isSelected =
													selectedDocumentId === docKey
												const chapterCount =
													getDocumentChapterCount(docKey)
												const webLessonCount =
													getDocumentWebLessonCount(docKey)

												return (
													<button
														key={docKey}
														type='button'
														role='option'
														aria-selected={isSelected}
														className={
															'book-chapters__doc-card' +
															(isSelected
																? ' book-chapters__doc-card--selected'
																: '')
														}
														onClick={() =>
															handleSelectDocument(docKey)}
													>
														{isSelected ? (
															<span
																className='book-chapters__doc-card-check'
																aria-hidden
															>
																✓
															</span>
														) : null}
														<span className='book-chapters__doc-card-icon'>
															<DocumentPdfGlyph />
														</span>
														<span className='book-chapters__doc-card-body'>
															<span className='book-chapters__doc-card-name'>
																{documentDisplayName(doc)}
															</span>
															<span className='book-chapters__doc-card-meta'>
																<span className='book-chapters__doc-card-count'>
																	{webLessonCount}/
																	{chapterCount}{' '}
																	lecciones
																</span>
															</span>
														</span>
													</button>
												)
											})}
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
												Aún no hay documentos disponibles
											</p>
											<p className='book-chapters__empty-book-text'>
												Cuando tu docente suba los PDFs del
												curso, podrás elegir un documento y
												leer sus lecciones aquí.
											</p>
										</div>
									)}
								</section>

								<section
									className={
										'book-chapters__list-section' +
										(!hasDocuments
											? ' book-chapters__list-section--hidden'
											: '')
									}
									aria-labelledby='student-view-book-lessons-heading'
								>
									<div className='book-chapters__list-header'>
										<div>
											<h2
												id='student-view-book-lessons-heading'
												className='book-chapters__section-title'
											>
												2. Lecciones
											</h2>
											<p className='book-chapters__section-desc'>
												{selectedDocument
													? (
														<>
															Lecciones de{' '}
															<strong>
																{documentDisplayName(
																	selectedDocument,
																)}
															</strong>
															. Los capítulos tienen el mismo orden 
															que en el documento.
														</>
													)
													: 'Selecciona un documento arriba para ver sus lecciones.'}
											</p>
										</div>
										{rows.length > 0 ? (
											<span className='book-chapters__count'>
												{readyCount}/{rows.length}{' '}
												disponibles
											</span>
										) : null}
									</div>

									<section
										className='view-book__summary'
										aria-label='Progreso del documento'
									>
										<div className='view-book__summary-card'>
											<p className='view-book__summary-label'>
												Lecciones disponibles
											</p>
											<p className='view-book__summary-value'>
												{readyCount}/{rows.length}
											</p>
											<p className='view-book__summary-hint'>
												{readyCount === 0
													? 'Tu docente aún no ha publicado lecciones web para este documento.'
													: 'Abre cualquier capítulo para leer la lección.'}
											</p>
										</div>
									</section>

									{!hasDocuments ? null : isLoadingSubjects || isLoadingLessons ? (
										<p className='book-chapters__loading'>
											Cargando lecciones…
										</p>
									) : !selectedDocumentId && requiresSourceDocument ? (
										<div className='book-chapters__select-doc-prompt'>
											<p className='book-chapters__select-doc-prompt-title'>
												Elige un documento para continuar
											</p>
											<p className='book-chapters__select-doc-prompt-text'>
												Selecciona uno de los documentos de arriba
												para ver sus lecciones publicadas.
											</p>
										</div>
									) : readyCount === 0 ? (
										<div className='book-chapters__empty-chapters'>
											<p className='book-chapters__empty-chapters-title'>
												Aún no hay lecciones para este documento
											</p>
											<p className='book-chapters__empty-chapters-text'>
												Cuando tu docente genere las lecciones
												desde este documento, aparecerán aquí.
											</p>
										</div>
									) : (
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
														`view-book-unit-${group.unitNumber ?? 'other'}`
													}
												>
													<h2
														id={
															`view-book-unit-${group.unitNumber ?? 'other'}`
														}
														className='view-book__group-title'
													>
														{group.label}
													</h2>
													<ol className='view-book__list'>
														{group.items.map((row) => (
															<li
																key={
																	row.chapterId
																	|| `chapter-${row.chapterNumber}`
																}
																className='view-book__item'
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
																	</div>
																</div>
																<div className='view-book__item-actions'>
																	<Link
																		to={
																			'/students/lessonpage/' +
																			`${row.lesson._id}`
																		}
																		className='view-book__lesson-link view-book__lesson-link--primary'
																	>
																		Leer lección
																		<span
																			className='teacher-book-upload__open-link-icon'
																			aria-hidden
																		>
																			→
																		</span>
																	</Link>
																</div>
															</li>
														))}
													</ol>
												</section>
											))}
										</div>
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

export default StudentViewBookScreen
