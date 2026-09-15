import { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { useSelector } from 'react-redux'
import TeacherSidebar from '../../components/TeacherSidebar'
import TeacherHeader from '../../components/TeacherHeader'
import Loader from '../../components/Loader'
import {
	useGenerateBookLessonsFromChapterByTeacherMutation,
	useGetBookLessonsBySubjectForTeacherQuery,
	useGetSubjectsByTeacherIdQuery,
} from '../../slices/teachers/teacherApiSlice'
import { SUBJECTS_URL } from '../../constants'
import { localizeApiError } from '../../utils/localizeApiMessage'
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

function documentDisplayName (doc) {
	if (doc?.fileName) {
		return String(doc.fileName)
	}
	if (doc?.label) {
		return String(doc.label)
	}
	if (doc?.fileId) {
		return bookDisplayName(String(doc.fileId))
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
			fill='url(#teacher-generate-lessons-book-fill-a)'
		/>
		<path
			d='M13 4h5a2 2 0 012 2v10a2 2 0 01-2 2h-5V4z'
			fill='url(#teacher-generate-lessons-book-fill-b)'
		/>
		<path
			d='M12 4v16'
			stroke='url(#teacher-generate-lessons-book-stroke)'
			strokeWidth='1.5'
			strokeLinecap='round'
		/>
		<defs>
			<linearGradient
				id='teacher-generate-lessons-book-fill-a'
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
				id='teacher-generate-lessons-book-fill-b'
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
				id='teacher-generate-lessons-book-stroke'
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
			fill='url(#teacher-generate-lessons-doc-pdf-fill)'
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
				id='teacher-generate-lessons-doc-pdf-fill'
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
	return `Capítulo ${chapter?.ChapterNumber ?? index + 1}`
}

function chapterPageLabel (chapter) {
	const start = chapter?.ChapterBeginPage
	const end = chapter?.ChapterEndPage
	if (start != null && end != null) {
		return `Páginas ${start}–${end}`
	}
	if (start != null) {
		return `Desde la página ${start}`
	}
	if (end != null) {
		return `Hasta la página ${end}`
	}
	return 'Rango de páginas no definido'
}

function TeacherGenerateLessonsScreen () {
	const navigate = useNavigate()
	const { subjectId } = useParams()
	const { teacherInfo } = useSelector((state) => state.authTeacher)
	const teacherId = teacherInfo?._id
		? String(teacherInfo._id)
		: null

	const [isSidebarOpen, setIsSidebarOpen] = useState(
		window.innerWidth > 768,
	)
	const [selectedDocumentId, setSelectedDocumentId] = useState('')
	const [generatingChapterId, setGeneratingChapterId] = useState(null)
	const [chapterErrors, setChapterErrors] = useState({})

	const isValidSubjectParam =
		subjectId != null && OBJECT_ID_RE.test(String(subjectId))

	const {
		data: subjects = [],
		isLoading: isLoadingSubjects,
		isError: isSubjectsError,
		refetch: refetchSubjects,
	} = useGetSubjectsByTeacherIdQuery(teacherId, {
		skip: !teacherId,
	})

	const {
		data: bookLessons = [],
		isLoading: isLoadingLessons,
		refetch: refetchLessons,
	} = useGetBookLessonsBySubjectForTeacherQuery(subjectId, {
		skip: !isValidSubjectParam,
	})

	const [generateLessons, {
		isLoading: isMutating,
		originalArgs: mutatingArgs,
	}] = useGenerateBookLessonsFromChapterByTeacherMutation()

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

	const filteredChapters = useMemo(() => {
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

	const getDocumentChapters = (documentKey) => bookChapters.filter(
		(chapter) => chapterBelongsToDocument(
			chapter,
			documentKey,
			requiresSourceDocument,
		),
	)

	const getDocumentOpenHref = (doc) => {
		if (doc?.fileUrl) {
			return String(doc.fileUrl)
		}
		if (doc?._id && subjectId) {
			return `${SUBJECTS_URL}/${subjectId}/teacher/documents/${doc._id}`
		}
		if (hasDocuments && subjectId) {
			return `${SUBJECTS_URL}/${subjectId}/teacher/book`
		}
		return ''
	}

	const getDocumentChapterCount = (documentKey) =>
		getDocumentChapters(documentKey).length

	const getDocumentChaptersWithPdf = (documentKey) =>
		getDocumentChapters(documentKey).filter(
			(chapter) => chapter.ChapterFileId || chapter.chapterFileUrl,
		).length

	const getDocumentGeneratedLessonsCount = (documentKey) =>
		getDocumentChapters(documentKey).filter((chapter) => {
			if (!chapter._id) {
				return false
			}
			const lesson = lessonsByChapterId.get(String(chapter._id))
			return Boolean(lesson?.hasContent)
		}).length

	const filteredChaptersWithPdf = filteredChapters.filter(
		(chapter) => chapter.ChapterFileId || chapter.chapterFileUrl,
	).length

	const generatedLessonsCount = bookLessons.filter(
		(lesson) => lesson?.hasContent,
	).length

	const hasGeneratedLessons = generatedLessonsCount > 0

	const toggleSidebar = () => {
		setIsSidebarOpen(!isSidebarOpen)
	}

	const handleSelectDocument = (documentKey) => {
		setSelectedDocumentId(String(documentKey))
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
			const message = localizeApiError(
				err,
				'No se pudieron generar las lecciones. Intenta de nuevo.',
			)
			setChapterErrors((prev) => ({
				...prev,
				[String(chapterId)]: message,
			}))
		} finally {
			setGeneratingChapterId(null)
		}
	}

	useEffect(() => {
		if (!teacherInfo) {
			navigate('/teachers/login', { replace: true })
		}
	}, [teacherInfo, navigate])

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

	if (!teacherInfo) {
		return null
	}

	if (!isValidSubjectParam) {
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
							<div className='center-content2 login-screen login-screen--wide login-screen--subject-form'>
								<div className='login-card'>
									<div className='login-card__accent' aria-hidden />
									<div className='login-card__header'>
										<h1 className='login-card__title'>
											Materia no válida
										</h1>
										<p className={
											'login-card__subtitle ' +
											'login-card__subtitle--wide'
										}
										>
											Este enlace no apunta a una materia
											válida.
										</p>
										<p className='login-card__back'>
											<Link
												to='/teachers/subjects'
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
							<div className='center-content2 login-screen login-screen--wide login-screen--subject-form'>
								<div className='login-card'>
									<div className='login-card__accent' aria-hidden />
									<div className='login-card__header'>
										<h1 className='login-card__title'>
											Materia no encontrada
										</h1>
										<p className={
											'login-card__subtitle ' +
											'login-card__subtitle--wide'
										}
										>
											Esta materia no está asignada a tu
											cuenta.
										</p>
										<p className='login-card__back'>
											<Link
												to='/teachers/subjects'
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
					<div className={
						'content-area content-area--login ' +
						'content-area--login-scroll'
					}
					>
						<div className='center-content2 login-screen login-screen--wide login-screen--subject-form'>
							<div className='login-card book-chapters generate-lessons'>
								<div className='login-card__accent' aria-hidden />
								<div className='login-card__header'>
									<p className='login-card__back'>
										<Link
											to={`/teachers/subjects/${subjectId}/edit`}
											className='login-card__link'
										>
											← Volver a editar materia
										</Link>
									</p>
									<h1 className='login-card__title'>
										Generar lecciones
									</h1>
									<p className={
										'login-card__subtitle ' +
										'login-card__subtitle--wide'
									}
									>
										Elige un PDF fuente y genera lecciones
										interactivas capítulo por capítulo para{' '}
										<strong>{subjectTitle}</strong>.
									</p>
									<p className='generate-lessons__index-link-wrap'>
										<Link
											to={`/teachers/viewbook/${subjectId}`}
											className='generate-lessons__index-link'
										>
											Abrir índice del libro web →
										</Link>
									</p>
								</div>

								{isSubjectsError ? (
									<div className='book-chapters__alert'>
										<p className='book-chapters__alert-text'>
											No pudimos cargar esta materia.
											Intenta de nuevo.
										</p>
										<button
											type='button'
											className='login-submit'
											onClick={() => void refetchSubjects()}
										>
											Intentar de nuevo
										</button>
									</div>
								) : null}

								<section
									className='book-chapters__book-section'
									aria-labelledby='generate-lessons-book-heading'
								>
									<div className='book-chapters__section-intro'>
										<h2
											id='generate-lessons-book-heading'
											className='book-chapters__section-title'
										>
											1. Elegir documento fuente
										</h2>
										<p className='book-chapters__section-desc'>
											Selecciona el PDF cuyos capítulos quieres
											convertir en lecciones. Cada documento
											tiene su propia lista de capítulos abajo.
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
											aria-label='Documentos fuente'
										>
											{subjectDocuments.map((doc) => {
												const docKey = getDocumentKey(doc)
												const openHref = getDocumentOpenHref(doc)
												const isSelected =
													selectedDocumentId === docKey
												const chapterCount =
													getDocumentChapterCount(docKey)
												const readyCount =
													getDocumentChaptersWithPdf(docKey)
												const lessonsCount =
													getDocumentGeneratedLessonsCount(
														docKey,
													)

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
																	{readyCount}/{chapterCount}{' '}
																	listos
																</span>
																{lessonsCount > 0 ? (
																	<span className='generate-lessons__doc-card-lessons'>
																		{lessonsCount}{' '}
																		{lessonsCount === 1
																			? 'lección'
																			: 'lecciones'}
																	</span>
																) : null}
																{openHref ? (
																	<a
																		href={openHref}
																		className='book-chapters__doc-card-link'
																		target='_blank'
																		rel='noopener noreferrer'
																		onClick={(e) =>
																			e.stopPropagation()}
																	>
																		Abrir PDF
																		<span
																			className='teacher-book-upload__open-link-icon'
																			aria-hidden
																		>
																			↗
																		</span>
																	</a>
																) : null}
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
												Aún no hay PDFs fuente subidos
											</p>
											<p className='book-chapters__empty-book-text'>
												Sube PDFs en la página de editar
												materia antes de generar lecciones.
											</p>
											<Link
												to={`/teachers/subjects/${subjectId}/edit`}
												className='book-chapters__empty-book-link'
											>
												Ir a editar materia
											</Link>
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
									aria-labelledby='generate-lessons-chapters-heading'
								>
									<div className='book-chapters__list-header'>
										<div>
											<h2
												id='generate-lessons-chapters-heading'
												className='book-chapters__section-title'
											>
												2. Generar lecciones
											</h2>
											<p className='book-chapters__section-desc'>
												{selectedDocument
													? (
														<>
															Creando lecciones de{' '}
															<strong>
																{documentDisplayName(
																	selectedDocument,
																)}
															</strong>
															. Cada capítulo necesita un
															PDF generado antes de poder
															crear lecciones a partir de él.
														</>
													)
													: 'Selecciona un documento fuente arriba para generar lecciones.'}
											</p>
										</div>
										{filteredChapters.length > 0 ? (
											<span className='book-chapters__count'>
												{filteredChaptersWithPdf}/
												{filteredChapters.length}{' '}
												listos
											</span>
										) : null}
									</div>

									{!hasDocuments ? null : isLoadingSubjects || isLoadingLessons ? (
										<p className='book-chapters__loading'>
											Cargando capítulos…
										</p>
									) : !selectedDocumentId && requiresSourceDocument ? (
										<div className='book-chapters__select-doc-prompt'>
											<p className='book-chapters__select-doc-prompt-title'>
												Elige un documento para continuar
											</p>
											<p className='book-chapters__select-doc-prompt-text'>
												Selecciona uno de tus PDFs fuente arriba
												para generar lecciones de sus capítulos.
											</p>
										</div>
									) : filteredChapters.length === 0 ? (
										<div className='book-chapters__empty-chapters'>
											<p className='book-chapters__empty-chapters-title'>
												Aún no hay capítulos para este documento
											</p>
											<p className='book-chapters__empty-chapters-text'>
												Define rangos de páginas por capítulo y
												genera PDFs en la página de capítulos
												del libro primero.
											</p>
											<Link
												to={`/teachers/bookchapters/${subjectId}`}
												className='book-chapters__empty-chapters-link'
											>
												Ir a capítulos del libro
											</Link>
										</div>
									) : (
										<ol className='generate-lessons__chapter-list'>
											{filteredChapters.map((chapter, index) => {
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
												const chapterId = chapter._id
													? String(chapter._id)
													: ''
												const isThisGenerating = Boolean(
													chapterId
													&& (
														generatingChapterId === chapterId
														|| (
															isMutating
															&& String(
																mutatingArgs?.chapterId,
															) === chapterId
														)
													),
												)
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
																			PDF del capítulo generado
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
																				Abrir PDF del capítulo
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
																			PDF del capítulo no listo
																		</p>
																		<p className='generate-lessons__chapter-missing-text'>
																			Genera el PDF de este capítulo
																			en la página de capítulos del
																			libro antes de crear lecciones.
																		</p>
																		<Link
																			to={`/teachers/bookchapters/${subjectId}`}
																			className='teacher-book-upload__open-link'
																		>
																			Ir a capítulos del libro
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

															{isThisGenerating ? (
																<div
																	className='generate-lessons__generating'
																	role='status'
																	aria-live='polite'
																	aria-busy='true'
																>
																	<Loader size='sm' />
																	<p className='generate-lessons__generating-title'>
																		Generando lección…
																	</p>
																	<p className='generate-lessons__generating-hint'>
																		Leyendo texto, tablas y gráficos
																		del PDF con IA. Esto puede
																		tomar un minuto.
																	</p>
																</div>
															) : hasGeneratedLesson ? (
																<div
																	className='generate-lessons__lesson-ready'
																	role='status'
																>
																	<p className='generate-lessons__lesson-ready-title'>
																		Lecciones generadas
																	</p>
																	<p className='generate-lessons__lesson-ready-meta'>
																		{lesson.content?.length ?? 0}{' '}
																		elementos extraídos del PDF
																	</p>
																	<Link
																		to={`/teachers/lessonpage/${subjectId}/${lesson._id}`}
																		className='teacher-book-upload__open-link'
																		target='_blank'
																		rel='noopener noreferrer'
																	>
																		Vista previa de la lección
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
																		: '') +
																	(isThisGenerating
																		? ' generate-lessons__action-btn--loading'
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
																{isThisGenerating ? (
																	<>
																		<Loader size='sm' />
																		<span className='generate-lessons__action-btn-title'>
																			Generando…
																		</span>
																		<span className='generate-lessons__action-btn-hint'>
																			Espera mientras se crea la
																			lección
																		</span>
																	</>
																) : (
																	<>
																		<span className='generate-lessons__action-btn-icon'>
																			<SparkGlyph />
																		</span>
																		<span className='generate-lessons__action-btn-title'>
																			{hasGeneratedLesson
																				? 'Regenerar lecciones'
																				: 'Generar lecciones'}
																		</span>
																		<span className='generate-lessons__action-btn-hint'>
																			{!hasChapterFile
																				? 'Se requiere el PDF del capítulo primero'
																				: (hasGeneratedLesson
																					? 'Reconstruir lección (texto, tablas y gráficos)'
																					: 'La IA lee texto, tablas y gráficos del PDF')}
																		</span>
																	</>
																)}
															</button>
														</div>
													</li>
												)
											})}
										</ol>
									)}
								</section>

								<div className={
									'subject-book-tools '
									+ 'subject-book-tools--after-list'
								}
								>
									<div className='subject-book-tools__header'>
										<span className='subject-book-tools__eyebrow'>
											Siguiente paso
										</span>
										<h3 className='subject-book-tools__title'>
											Creación de tutor con IA
										</h3>
										<p className='subject-book-tools__desc'>
											{hasGeneratedLessons
												? `Convierte ${generatedLessonsCount === 1 ? 'tu lección generada' : `tus ${generatedLessonsCount} lecciones generadas`} en tutores con IA con video, subtítulos y guiones.`
												: 'Genera al menos una lección web a partir de un PDF de capítulo para desbloquear la creación de tutores con IA.'}
										</p>
									</div>
									{hasGeneratedLessons ? (
										<Link
											to={`/teachers/createtutor/${subjectId}`}
											className={
												'subject-book-tools__card '
												+ 'subject-book-tools__card--tutor'
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
													<circle
														cx='10'
														cy='8.5'
														r='3.25'
													/>
													<path
														d='M4 19.5c0-3 2.75-5 6-5s6 2 6 5'
														strokeLinecap='round'
													/>
													<rect
														x='15'
														y='5'
														width='7'
														height='5'
														rx='1.25'
													/>
													<path
														d='M17.5 7.5l1.25 1 2.25-2'
														strokeLinecap='round'
														strokeLinejoin='round'
													/>
													<path
														d='M19 13.5v2.25a1.25 1.25 0 01-1.25 1.25h-3'
														strokeLinecap='round'
													/>
												</svg>
											</span>
											<span className='subject-book-tools__body'>
												<span className='subject-book-tools__label'>
													Crear tutores con IA
												</span>
												<span className='subject-book-tools__hint'>
													Sube video del tutor y subtítulos por capítulo
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
												+ 'subject-book-tools__card--tutor '
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
													<circle
														cx='10'
														cy='8.5'
														r='3.25'
													/>
													<path
														d='M4 19.5c0-3 2.75-5 6-5s6 2 6 5'
														strokeLinecap='round'
													/>
													<rect
														x='15'
														y='5'
														width='7'
														height='5'
														rx='1.25'
													/>
													<path
														d='M17.5 7.5l1.25 1 2.25-2'
														strokeLinecap='round'
														strokeLinejoin='round'
													/>
													<path
														d='M19 13.5v2.25a1.25 1.25 0 01-1.25 1.25h-3'
														strokeLinecap='round'
													/>
												</svg>
											</span>
											<span className='subject-book-tools__body'>
												<span className='subject-book-tools__label'>
													Crear tutores con IA
												</span>
												<span className='subject-book-tools__hint'>
													Requiere al menos una lección web generada
												</span>
											</span>
										</span>
									)}
								</div>
							</div>
						</div>
					</div>
				</div>
			</div>
		</div>
	)
}

export default TeacherGenerateLessonsScreen
