import { useEffect, useMemo, useRef, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { useSelector } from 'react-redux'
import { toast } from 'react-toastify'
import TeacherSidebar from '../../components/TeacherSidebar'
import TeacherHeader from '../../components/TeacherHeader'
import {
	useGetSubjectsByTeacherIdQuery,
	useUpdateSubjectBookChaptersByTeacherMutation,
	useGenerateSubjectBookChapterPdfByTeacherMutation,
	useDeleteSubjectBookChapterByTeacherMutation,
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

function isPersistedChapterId (chapterId) {
	return chapterId != null && OBJECT_ID_RE.test(String(chapterId))
}

function chapterDraftFromApi (chapter, index) {
	return {
		_id: chapter._id ? String(chapter._id) : `draft-${index}-${Date.now()}`,
		sourceDocumentId: chapter.sourceDocumentId
			? String(chapter.sourceDocumentId)
			: '',
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
		...(draft.sourceDocumentId
			? { sourceDocumentId: draft.sourceDocumentId }
			: {}),
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
			fill='url(#teacher-book-chapters-fill-a)'
		/>
		<path
			d='M13 4h5a2 2 0 012 2v10a2 2 0 01-2 2h-5V4z'
			fill='url(#teacher-book-chapters-fill-b)'
		/>
		<path
			d='M12 4v16'
			stroke='url(#teacher-book-chapters-stroke)'
			strokeWidth='1.5'
			strokeLinecap='round'
		/>
		<defs>
			<linearGradient
				id='teacher-book-chapters-fill-a'
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
				id='teacher-book-chapters-fill-b'
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
				id='teacher-book-chapters-stroke'
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
			fill='url(#teacher-doc-pdf-fill)'
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
				id='teacher-doc-pdf-fill'
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

function TeacherBookChaptersScreen () {
	const navigate = useNavigate()
	const { subjectId } = useParams()
	const { teacherInfo } = useSelector((state) => state.authTeacher)
	const teacherId = teacherInfo?._id
		? String(teacherInfo._id)
		: null

	const [isSidebarOpen, setIsSidebarOpen] = useState(
		window.innerWidth > 768,
	)
	const [chapterDrafts, setChapterDrafts] = useState([])
	const [selectedDocumentId, setSelectedDocumentId] = useState('')
	const [generatingChapterId, setGeneratingChapterId] = useState(null)
	const initializedSubjectRef = useRef(null)

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

	const [
		updateBookChapters,
		{ isLoading: isSavingChapters },
	] = useUpdateSubjectBookChaptersByTeacherMutation()

	const [
		generateChapterPdf,
		{ isLoading: isGeneratingChapter },
	] = useGenerateSubjectBookChapterPdfByTeacherMutation()

	const [
		deleteBookChapter,
		{ isLoading: isDeletingChapter },
	] = useDeleteSubjectBookChapterByTeacherMutation()

	const currentSubject = useMemo(() => {
		if (!isValidSubjectParam || !subjects?.length) {
			return undefined
		}
		return subjects.find((s) => String(s._id) === String(subjectId))
	}, [subjects, subjectId, isValidSubjectParam])

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

	const filteredChapterDrafts = useMemo(() => {
		if (!hasDocuments) {
			return []
		}
		if (!selectedDocumentId && requiresSourceDocument) {
			return []
		}
		return chapterDrafts.filter((chapter) => chapterBelongsToDocument(
			chapter,
			selectedDocumentId,
			requiresSourceDocument,
		))
	}, [
		chapterDrafts,
		hasDocuments,
		requiresSourceDocument,
		selectedDocumentId,
	])

	const getDocumentChapterCount = (documentKey) => chapterDrafts.filter(
		(chapter) => chapterBelongsToDocument(
			chapter,
			documentKey,
			requiresSourceDocument,
		),
	).length

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
		if (!teacherInfo) {
			navigate('/teachers/login', { replace: true })
		}
	}, [teacherInfo, navigate])

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
		const sourceDocumentId = selectedDocumentId
			|| (subjectDocuments.length === 1
				? getDocumentKey(subjectDocuments[0])
				: '')

		if (requiresSourceDocument && !sourceDocumentId) {
			toast.error('Selecciona un documento fuente primero')
			return
		}

		setChapterDrafts((prev) => {
			const docChapterCount = prev.filter((chapter) =>
				chapterBelongsToDocument(
					chapter,
					sourceDocumentId,
					requiresSourceDocument,
				),
			).length

			return [
				...prev,
				{
					_id: `draft-${Date.now()}`,
					sourceDocumentId,
					ChapterNumber: docChapterCount + 1,
					ChapterTitle: '',
					ChapterBeginPage: '',
					ChapterEndPage: '',
					ChapterFileId: '',
					chapterFileUrl: '',
				},
			]
		})
	}

	const handleSelectDocument = (documentKey) => {
		setSelectedDocumentId(String(documentKey))
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
				teacherId,
			}).unwrap()
			setChapterDrafts(chaptersToDrafts(result.bookChapters))
			initializedSubjectRef.current = String(subjectId)
			toast.success('Capítulo eliminado')
			await refetchSubjects()
		} catch (err) {
			const message = localizeApiError(
				err,
				'No se pudo eliminar el capítulo',
			)
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
				teacherId,
			}).unwrap()
			toast.success('Capítulos guardados')
			initializedSubjectRef.current = null
			await refetchSubjects()
		} catch (err) {
			const message = localizeApiError(
				err,
				'No se pudieron guardar los capítulos',
			)
			toast.error(message)
		}
	}

	const handleGenerateChapterPdf = async (chapterKey) => {
		if (!isValidSubjectParam) {
			return
		}

		if (!isPersistedChapterId(chapterKey)) {
			toast.error('Guarda este capítulo antes de generar un PDF')
			return
		}

		if (!hasDocuments) {
			toast.error(
				'Sube al menos un PDF fuente antes de generar capítulos',
			)
			return
		}

		const chapter = chapterDrafts.find(
			(item) => String(item._id) === String(chapterKey),
		)

		if (
			requiresSourceDocument
			&& !chapter?.sourceDocumentId
		) {
			toast.error(
				'Selecciona un documento fuente para este capítulo primero',
			)
			return
		}

		if (!chapter?.ChapterBeginPage || !chapter?.ChapterEndPage) {
			toast.error('Ingresa las páginas de inicio y fin primero')
			return
		}

		setGeneratingChapterId(String(chapterKey))

		try {
			await updateBookChapters({
				id: String(subjectId),
				bookChapters: draftsToPayload(chapterDrafts),
				teacherId,
			}).unwrap()

			await generateChapterPdf({
				id: String(subjectId),
				chapterId: String(chapterKey),
				teacherId,
			}).unwrap()
			toast.success('PDF del capítulo generado')
			initializedSubjectRef.current = null
			await refetchSubjects()
		} catch (err) {
			const message = localizeApiError(
				err,
				'No se pudo generar el PDF del capítulo',
			)
			toast.error(message)
		} finally {
			setGeneratingChapterId(null)
		}
	}

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
							<div className='login-card book-chapters'>
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
										Capítulos del libro
									</h1>
									<p className={
										'login-card__subtitle ' +
										'login-card__subtitle--wide'
									}
									>
										Elige un PDF fuente, define los rangos de
										páginas por capítulo y genera cada archivo
										para{' '}
										<strong>{subjectTitle}</strong>.
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
									aria-labelledby='book-chapters-book-heading'
								>
									<div className='book-chapters__section-intro'>
										<h2
											id='book-chapters-book-heading'
											className='book-chapters__section-title'
										>
											1. Elegir documento fuente
										</h2>
										<p className='book-chapters__section-desc'>
											Selecciona el PDF del que quieres mapear
											capítulos. Cada documento tiene su propia
											lista de capítulos abajo.
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
																	{chapterCount}{' '}
																	{chapterCount === 1
																		? 'capítulo'
																		: 'capítulos'}
																</span>
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
												materia antes de mapear capítulos.
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
									aria-labelledby='book-chapters-list-heading'
								>
									<div className='book-chapters__list-header'>
										<div>
											<h2
												id='book-chapters-list-heading'
												className='book-chapters__section-title'
											>
												2. Rangos de páginas por capítulo
											</h2>
											<p className='book-chapters__section-desc'>
												{selectedDocument
													? (
														<>
															Mapeando capítulos de{' '}
															<strong>
																{documentDisplayName(
																	selectedDocument,
																)}
															</strong>
															. Completa el paso 1 (detalles
															y rango de páginas), luego el
															paso 2 (generar el PDF del capítulo).
														</>
													)
													: 'Selecciona un documento fuente arriba para gestionar sus capítulos.'}
											</p>
										</div>
										{filteredChapterDrafts.length > 0 ? (
											<span className='book-chapters__count'>
												{filteredChapterDrafts.length}{' '}
												{filteredChapterDrafts.length === 1
													? 'capítulo'
													: 'capítulos'}
											</span>
										) : null}
									</div>

									{!hasDocuments ? null : isLoadingSubjects ? (
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
												para agregar o editar rangos de páginas.
											</p>
										</div>
									) : filteredChapterDrafts.length === 0 ? (
										<div className='book-chapters__empty-chapters'>
											<p className='book-chapters__empty-chapters-title'>
												Aún no hay capítulos para este documento
											</p>
											<p className='book-chapters__empty-chapters-text'>
												Agrega capítulos manualmente ahora, o
												ejecuta tu script de detección más tarde
												para completarlos automáticamente.
											</p>
											<button
												type='button'
												className='book-chapters__add-btn'
												disabled={isBusy}
												onClick={handleAddChapter}
											>
												Agregar primer capítulo
											</button>
										</div>
									) : (
										<>
											<ol className='book-chapters__list'>
												{filteredChapterDrafts.map((chapter, index) => {
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
													const hasSourceDocument = Boolean(
														chapter.sourceDocumentId
														|| !requiresSourceDocument,
													)
													const generateDisabled = isBusy
														|| !isPersisted
														|| !hasDocuments
														|| !hasPageRange
														|| !hasSourceDocument
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
																		Eliminar
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
																					Guardar detalles del capítulo
																				</p>
																				<p className='book-chapters__step-desc'>
																					Ingresa el título del capítulo,
																					la página inicial y la final
																					— luego guarda abajo.
																				</p>
																			</div>
																		</div>

																		<div className='book-chapters__step-fields'>
																			<div className='book-chapters__item-meta'>
																				<label
																					className='book-chapters__title-label'
																					htmlFor={`chapter-title-${chapterKey}`}
																				>
																					Título del capítulo
																				</label>
																				<input
																					id={`chapter-title-${chapterKey}`}
																					type='text'
																					className='book-chapters__title-input'
																					placeholder={`Capítulo ${index + 1}`}
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
																						Página inicial
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
																						Página final
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
																					? 'Guardando…'
																					: 'Guardar capítulos'}
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
																					Generar PDF del capítulo
																				</p>
																				<p className='book-chapters__step-desc'>
																					Extrae páginas de{' '}
																					{selectedDocument
																						? documentDisplayName(
																							selectedDocument,
																						)
																						: 'el PDF seleccionado'}{' '}
																					usando el título guardado y el
																					rango de páginas.
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
																						? 'Generando PDF…'
																						: hasChapterFile
																							? 'Regenerar PDF del capítulo'
																							: 'Generar PDF del capítulo'}
																				</span>
																				<span className='book-chapters__generate-btn-hint'>
																					{!isPersisted
																						? 'Completa el paso 1 primero'
																						: !hasDocuments
																							? 'Sube un PDF fuente primero'
																							: !hasSourceDocument
																								? 'Selecciona un documento fuente'
																								: !hasPageRange
																									? 'Ingresa páginas de inicio y fin'
																									: `Páginas ${chapter.ChapterBeginPage}–${chapter.ChapterEndPage} del PDF fuente`}
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

											<div className='book-chapters__actions'>
												<button
													type='button'
													className='book-chapters__add-btn'
													disabled={isBusy}
													onClick={handleAddChapter}
												>
													+ Agregar capítulo
												</button>
											</div>

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
														Generación de lecciones
													</h3>
													<p className='subject-book-tools__desc'>
														{hasChaptersWithPdf
															? 'Convierte tus PDFs de capítulos en lecciones interactivas para estudiantes.'
															: 'Guarda capítulos y genera al menos un PDF de capítulo para desbloquear la generación de lecciones.'}
													</p>
												</div>
												{hasChaptersWithPdf ? (
													<Link
														to={`/teachers/generatelessons/${subjectId}`}
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
																Generar lecciones
															</span>
															<span className='subject-book-tools__hint'>
																Crea lecciones listas para estudiantes
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
																Generar lecciones
															</span>
															<span className='subject-book-tools__hint'>
																Requiere al menos un PDF de capítulo
															</span>
														</span>
													</span>
												)}
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

export default TeacherBookChaptersScreen
