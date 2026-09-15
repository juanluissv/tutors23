import React, { useEffect, useMemo, useRef, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { useSelector } from 'react-redux'
import { toast } from 'react-toastify'
import TeacherSidebar from '../../components/TeacherSidebar'
import TeacherHeader from '../../components/TeacherHeader'
import {
	useGetSubjectsByTeacherIdQuery,
	useUpdateSubjectByTeacherMutation,
	useUploadSubjectDocumentByTeacherMutation,
	useDeleteSubjectDocumentByTeacherMutation,
} from '../../slices/teachers/teacherApiSlice'
import { SUBJECTS_URL } from '../../constants'
import { getSubjectGradeLevelNames } from '../../utils/gradeLevel'
import {
	getSubjectProgramsLabel,
	normalizeSubjectPrograms,
} from '../../utils/universityProgram'
import { isUniversitySchool } from '../../utils/schoolType'
import { localizeApiError } from '../../utils/localizeApiMessage'
import '../../App.css'

const MAX_BOOK_BYTES = 200 * 1024 * 1024

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
	const [uploadSubjectDocument, { isLoading: isUploadingDocument }] =
		useUploadSubjectDocumentByTeacherMutation()
	const [deleteSubjectDocument, { isLoading: isDeletingDocument }] =
		useDeleteSubjectDocumentByTeacherMutation()

	const [isSidebarOpen, setIsSidebarOpen] = useState(
		window.innerWidth > 768,
	)
	const [title, setTitle] = useState('')
	const [description, setDescription] = useState('')
	const [bookFile, setBookFile] = useState(null)
	const [documentLabel, setDocumentLabel] = useState('')
	const [deletingDocumentId, setDeletingDocumentId] = useState(null)

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
		setDocumentLabel('')
		if (bookInputRef.current) {
			bookInputRef.current.value = ''
		}
	}, [currentSubject])

	const isSaving = isSavingMutation
	const isBusy = isSaving || isUploadingDocument || isDeletingDocument

	const subjectDocuments = useMemo(
		() => getSubjectDocuments(currentSubject),
		[currentSubject],
	)
	const hasDocuments = subjectDocuments.length > 0

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

	const handleClearBook = () => {
		setBookFile(null)
		setDocumentLabel('')
		if (bookInputRef.current) {
			bookInputRef.current.value = ''
		}
	}

	const handleUploadDocument = async () => {
		if (!(bookFile instanceof File)) {
			toast.error('Elige un PDF para subir')
			return
		}
		if (!isValidParam || !teacherId) {
			return
		}

		try {
			await uploadSubjectDocument({
				id: String(subjectId),
				teacherId,
				document: bookFile,
				label: documentLabel.trim() !== ''
					? documentLabel.trim()
					: undefined,
			}).unwrap()
			toast.success('PDF subido')
			handleClearBook()
			await refetch()
		} catch (err) {
			toast.error(
				localizeApiError(err, 'No se pudo subir el PDF'),
			)
		}
	}

	const handleDeleteDocument = async (documentId) => {
		if (!documentId || !isValidParam || !teacherId) {
			return
		}

		setDeletingDocumentId(String(documentId))
		try {
			await deleteSubjectDocument({
				id: String(subjectId),
				teacherId,
				documentId: String(documentId),
			}).unwrap()
			toast.success('PDF eliminado')
			await refetch()
		} catch (err) {
			toast.error(
				localizeApiError(err, 'No se pudo eliminar el PDF'),
			)
		} finally {
			setDeletingDocumentId(null)
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
				toast.error('Elige un archivo PDF')
				return
			}
			if (file.size > MAX_BOOK_BYTES) {
				setBookFile(null)
				if (bookInputRef.current) {
					bookInputRef.current.value = ''
				}
				toast.error('El PDF debe ser de 200 MB o menos')
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
			toast.error('Ingresa el nombre de la materia')
			return
		}
		if (!isValidParam || !teacherId || !subjectId) {
			return
		}

		try {
			await updateSubject({
				id: String(subjectId),
				teacherId,
				title: title.trim(),
				description: description.trim(),
			}).unwrap()
			toast.success('Materia guardada.')
			navigate('/teachers/subjects', { replace: true })
		} catch (err) {
			toast.error(
				localizeApiError(
					err,
					'No se pudo guardar la materia. Intenta de nuevo.',
				),
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
							<div className='center-content2 login-screen login-screen--wide login-screen--subject-form'>
								<div className='login-card'>
									<div className='login-card__accent' aria-hidden />
									<div className='login-card__header'>
										<Link
											to='/teachers/subjects'
											className='login-card__link'
										>
											← Volver a mis materias
										</Link>
										<p className='login-card__subtitle'>
											Este enlace de materia no es válido.
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
							<div className='center-content2 login-screen login-screen--wide login-screen--subject-form'>
								<p className='login-card__subtitle'>Cargando…</p>
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
							<div className='center-content2 login-screen login-screen--wide login-screen--subject-form'>
								<div className='login-card'>
									<div className='login-card__accent' aria-hidden />
									<p className='login-card__subtitle'>
										No pudimos cargar tus materias.
										Intenta de nuevo en un momento.
									</p>
									<button
										type='button'
										className='login-submit'
										onClick={() => void refetch()}
									>
										Intentar de nuevo
									</button>
									<Link
										to='/teachers/subjects'
										className='login-card__link'
									>
										← Volver a mis materias
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
							<div className='center-content2 login-screen login-screen--wide login-screen--subject-form'>
								<div className='login-card'>
									<div className='login-card__accent' aria-hidden />
									<div className='login-card__header'>
										<Link
											to='/teachers/subjects'
											className='login-card__link'
										>
											← Volver a mis materias
										</Link>
										<p className='login-card__subtitle'>
											No se encontró la materia, o no
											tienes acceso a ella.
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
					<div className={
						'content-area content-area--login '
						+ 'content-area--login-scroll'
					}
					>
						<div className='center-content2 login-screen login-screen--wide login-screen--subject-form'>
							<div className='login-card'>
								<div className='login-card__accent' aria-hidden />
								<div className='login-card__header'>
									<div className='login-card__back'>
										<Link
											to='/teachers/subjects'
											className='login-card__link'
										>
											← Volver a mis materias
										</Link>
									</div>
									<h1 className='login-card__title'>
										Editar materia
									</h1>
									<p className='login-card__subtitle login-card__subtitle--wide'>
										Actualiza cómo se muestra esta materia
										a los estudiantes.
										{isUniversity
											? (
												' El programa y el semestre '
												+ 'los define tu escuela y no '
												+ 'se pueden cambiar aquí.'
											)
											: (
												' El nivel de grado lo define '
												+ 'tu escuela y no se puede '
												+ 'cambiar aquí.'
											)}
										{' '}
										Adjunta documentos del curso opcionales —
										PDF, hasta 200 MB cada uno.
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
											Nombre de la materia
										</label>
										<input
											type='text'
											id='edit-subject-name'
											name='title'
											className='login-input'
											placeholder='Ej. Álgebra I'
											autoComplete='off'
											value={title}
											disabled={isBusy}
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
													Programa
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
													Semestre
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
												Nivel de grado
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
											Descripción
										</label>
										<textarea
											id='edit-subject-description'
											name='description'
											className='login-input login-textarea'
											placeholder={
												'¿Qué aprenderán los estudiantes? ¿Para quién es?'
											}
											rows={5}
											value={description}
											disabled={isBusy}
											onChange={(e) => setDescription(
												e.target.value,
											)}
										/>
									</div>
									<div className='login-field'>
										<span className='login-label' id='book-label'>
											Documentos del curso (opcional)
										</span>
										{hasDocuments ? (
											<ul
												className='subject-documents__list'
												aria-label='PDFs subidos'
											>
												{subjectDocuments.map((doc) => {
													const docKey = doc._id
														? String(doc._id)
														: String(doc.fileId)
													const openHref = getDocumentOpenHref(doc)
													const isDeletingThis =
														deletingDocumentId === docKey

													return (
														<li
															key={docKey}
															className='subject-documents__item'
														>
															<div className='subject-documents__info'>
																<p className='subject-documents__name'>
																	{documentDisplayName(doc)}
																</p>
																{openHref ? (
																	<a
																		href={openHref}
																		className='teacher-book-upload__open-link'
																		target='_blank'
																		rel='noopener noreferrer'
																	>
																		Abrir PDF
																	</a>
																) : null}
															</div>
															{doc._id ? (
																<button
																	type='button'
																	className='subject-documents__delete'
																	disabled={isBusy || isDeletingThis}
																	onClick={() =>
																		void handleDeleteDocument(doc._id)}
																>
																	{isDeletingThis
																		? 'Eliminando…'
																		: 'Eliminar'}
																</button>
															) : null}
														</li>
													)
												})}
											</ul>
										) : (
											<p className='teacher-book-upload__status-hint'>
												Aún no hay PDFs. Agrega documentos
												abajo — uno a la vez.
											</p>
										)}
										<div className='login-field'>
											<label
												className='login-label'
												htmlFor='edit-subject-document-label'
											>
												Etiqueta del documento (opcional)
											</label>
											<input
												type='text'
												id='edit-subject-document-label'
												className='login-input'
												placeholder='Ej. Libro unidad 1'
												value={documentLabel}
												disabled={isBusy}
												onChange={(e) =>
													setDocumentLabel(e.target.value)}
											/>
										</div>
										<div className='teacher-book-upload'>
											<input
												ref={bookInputRef}
												type='file'
												id='edit-subject-book'
												name='document'
												className='teacher-book-upload__input'
												accept='application/pdf,.pdf'
												disabled={isBusy}
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
														: 'Subir un archivo'}
												</span>
												<span className='teacher-book-upload__hint'>
													Solo PDF · hasta 200 MB · se agrega
													sin reemplazar los existentes
												</span>
											</label>
											{bookFile ? (
												<div className='subject-documents__actions'>
													<button
														type='button'
														className='login-submit'
														disabled={isBusy}
														onClick={() =>
															void handleUploadDocument()}
													>
														{isUploadingDocument
															? 'Subiendo…'
															: 'Subir PDF'}
													</button>
													<button
														type='button'
														className='teacher-book-upload__clear'
														onClick={handleClearBook}
														disabled={isBusy}
													>
														Quitar selección
													</button>
												</div>
											) : null}
										</div>
									</div>
									<div className='subject-book-tools'>
										<div className='subject-book-tools__header'>
											<span className='subject-book-tools__eyebrow'>
												Documentos del curso
											</span>
											<h3 className='subject-book-tools__title'>
												Cuando tengas PDFs del curso,
												genera los capítulos
											</h3>
											<p className='subject-book-tools__desc'>
												{hasDocuments
													? 'Divide tus PDFs en capítulos con rangos de páginas para cada sección.'
													: 'Sube al menos un PDF arriba para desbloquear la división en capítulos.'}
											</p>
										</div>
										{hasDocuments ? (
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
														Generar capítulos del libro
													</span>
													<span className='subject-book-tools__hint'>
														Define rangos de páginas por capítulo
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
														Generar capítulos del libro
													</span>
													<span className='subject-book-tools__hint'>
														Requiere al menos un PDF del curso
													</span>
												</span>
											</span>
										)}
									</div>
									<button
										type='submit'
										className='login-submit'
										disabled={isBusy}
									>
										{isSaving
											? 'Guardando…'
											: 'Guardar cambios'}
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
