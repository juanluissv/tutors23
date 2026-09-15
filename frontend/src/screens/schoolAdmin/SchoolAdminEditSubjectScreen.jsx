import { useEffect, useMemo, useRef, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { useSelector } from 'react-redux'
import { toast } from 'react-toastify'
import {
	useGetSchoolByIdQuery,
	useGetSubjectsBySchoolQuery,
	useGetTeachersBySchoolQuery,
	useUpdateSubjectMutation,
	useUploadSubjectDocumentMutation,
	useDeleteSubjectDocumentMutation,
} from '../../slices/admin/schoolAdminApiSlice'
import AdminSidebar from '../../components/AdminSidebar'
import AdminHeader from '../../components/AdminHeader'
import { SUBJECTS_URL } from '../../constants'
import { getSubjectGradeLevelNames } from '../../utils/gradeLevel'
import {
	getProgramTypeLabel,
	normalizeSubjectPrograms,
	normalizeUniversityPrograms,
} from '../../utils/universityProgram'
import { isUniversitySchool } from '../../utils/schoolType'
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
	const [documentLabel, setDocumentLabel] = useState('')
	const [deletingDocumentId, setDeletingDocumentId] = useState(null)
	const [selectedTeacherId, setSelectedTeacherId] = useState('')
	const [selectedProgramIds, setSelectedProgramIds] = useState([])
	const [semester, setSemester] = useState('')
	const initializedTeacherForSubjectRef = useRef(null)
	const initializedCohortForSubjectRef = useRef(null)

	const {
		data: schoolData,
		isLoading: isLoadingSchool,
	} = useGetSchoolByIdQuery(schoolId, {
		skip: !schoolId,
	})

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
	const [uploadSubjectDocument, { isLoading: isUploadingDocument }] =
		useUploadSubjectDocumentMutation()
	const [deleteSubjectDocument, { isLoading: isDeletingDocument }] =
		useDeleteSubjectDocumentMutation()

	const isUniversity = isUniversitySchool(schoolData?.schoolType)
	const programs = normalizeUniversityPrograms(schoolData?.programs)
	const isBusy = isLoadingList || isLoadingTeachers || isLoadingSchool
		|| isSaving || isUploadingDocument || isDeletingDocument

	const isValidSubjectParam =
		subjectId != null && OBJECT_ID_RE.test(String(subjectId))

	const currentSubject = useMemo(() => {
		if (!isValidSubjectParam || !subjects?.length) {
			return undefined
		}
		return subjects.find((s) => String(s._id) === String(subjectId))
	}, [subjects, subjectId, isValidSubjectParam])

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
		initializedCohortForSubjectRef.current = null
	}, [subjectId])

	const handleToggleProgram = (programId) => {
		const id = String(programId)
		setSelectedProgramIds((prev) =>
			prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
		)
	}

	useEffect(() => {
		if (!currentSubject || !isUniversity) {
			return
		}

		const subjectKey = String(currentSubject._id)

		if (initializedCohortForSubjectRef.current === subjectKey) {
			return
		}

		setSelectedProgramIds(
			normalizeSubjectPrograms(currentSubject.program).map(
				(item) => String(item._id),
			),
		)
		setSemester(
			currentSubject.semester != null
				? String(currentSubject.semester)
				: '',
		)
		initializedCohortForSubjectRef.current = subjectKey
	}, [currentSubject, isUniversity])

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

	const subjectDocuments = useMemo(
		() => getSubjectDocuments(currentSubject),
		[currentSubject],
	)
	const hasDocuments = subjectDocuments.length > 0

	const getDocumentOpenHref = (doc) => {
		if (doc?.fileUrl) {
			return String(doc.fileUrl)
		}
		if (doc?._id && subjectId) {
			return `${SUBJECTS_URL}/${subjectId}/school-admin/documents/${doc._id}`
		}
		if (hasDocuments && subjectId) {
			return `${SUBJECTS_URL}/${subjectId}/school-admin/book`
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
		if (!isValidSubjectParam) {
			return
		}

		try {
			await uploadSubjectDocument({
				id: String(subjectId),
				document: bookFile,
				label: documentLabel.trim() !== '' ? documentLabel.trim() : undefined,
			}).unwrap()
			toast.success('PDF subido')
			handleClearBook()
			await refetchSubjects()
		} catch (err) {
			toast.error(
				err?.data?.message
					|| err?.error?.message
					|| 'No se pudo subir el PDF',
			)
		}
	}

	const handleDeleteDocument = async (documentId) => {
		if (!documentId || !isValidSubjectParam) {
			return
		}

		setDeletingDocumentId(String(documentId))
		try {
			await deleteSubjectDocument({
				id: String(subjectId),
				documentId: String(documentId),
			}).unwrap()
			toast.success('PDF eliminado')
			await refetchSubjects()
		} catch (err) {
			toast.error(
				err?.data?.message
					|| err?.error?.message
					|| 'No se pudo eliminar el PDF',
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
		if (!isValidSubjectParam) {
			return
		}
		if (!selectedTeacher?.email) {
			toast.error('Selecciona un profesor para esta materia')
			return
		}
		if (isUniversity && selectedProgramIds.length === 0) {
			toast.error('Selecciona al menos un programa para esta materia')
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
		if (isUniversity) {
			body.program = selectedProgramIds
			if (semester.trim() !== '') {
				const semesterNum = Number(semester)
				if (!Number.isInteger(semesterNum) || semesterNum < 1) {
					toast.error('El semestre debe ser un número entero positivo')
					return
				}
				body.semester = semesterNum
			} else {
				body.semester = ''
			}
		}

		try {
			await updateSubject(body).unwrap()
			toast.success('Materia actualizada')
			navigate('/schooladmins/mysubjects', { replace: true })
		} catch (err) {
			toast.error(
				err?.data?.message
					|| err?.error?.message
					|| 'No se pudo actualizar la materia',
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
							<div className='center-content2 login-screen login-screen--wide login-screen--subject-form'>
								<div className='login-card'>
									<div className='login-card__accent' aria-hidden />
									<div className='login-card__header'>
										<h1 className='login-card__title'>
											<br />
											Aún no hay escuela
										</h1>
										<p className='login-card__subtitle login-card__subtitle--wide'>
											Registra tu escuela primero; después
											podrás editar materias.
										</p>
									</div>
									<p className='login-card__subtitle login-card__subtitle--wide'>
										<Link to='/schooladmins/registerschool'>
											Registra tu escuela
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
							<div className='center-content2 login-screen login-screen--wide login-screen--subject-form'>
								<div className='login-card'>
									<div className='login-card__accent' aria-hidden />
									<div className='login-card__header'>
										<div className='login-card__back'>
											<Link
												to='/schooladmins/mysubjects'
												className='login-card__link'
											>
												← Volver a las materias
											</Link>
										</div>
										<h1 className='login-card__title'>Enlace no válido</h1>
										<p className='login-card__subtitle login-card__subtitle--wide'>
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
							<div className='center-content2 login-screen login-screen--wide login-screen--subject-form'>
								<div className='login-card'>
									<div className='login-card__accent' aria-hidden />
									<div className='login-card__header'>
										<div className='login-card__back'>
											<Link
												to='/schooladmins/mysubjects'
												className='login-card__link'
											>
												← Volver a las materias
											</Link>
										</div>
										<p className='login-card__subtitle login-card__subtitle--wide'>
											No pudimos cargar las materias.
										</p>
									</div>
									<button
										type='button'
										className='login-submit'
										onClick={() => void refetchSubjects()}
									>
										Intentar de nuevo
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
							<div className='center-content2 login-screen login-screen--wide login-screen--subject-form'>
								<div className='login-card'>
									<div className='login-card__accent' aria-hidden />
									<div className='login-card__header'>
										<div className='login-card__back'>
											<Link
												to='/schooladmins/mysubjects'
												className='login-card__link'
											>
												← Volver a las materias
											</Link>
										</div>
										<h1 className='login-card__title'>Materia no encontrada</h1>
										<p className='login-card__subtitle login-card__subtitle--wide'>
											No hay una materia con este id en tu
											escuela, o pudo haber sido eliminada.
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
					<div className='center-content2 login-screen login-screen--wide login-screen--subject-form'>
					<div className='login-card'> 
								<div className='login-card__accent' aria-hidden />
								<div className='login-card__header'>
									
									<h1 className='login-card__title'>
										Editar materia
									</h1>
									<p className='login-card__subtitle login-card__subtitle--wide'>
										Actualiza cómo se muestra esta materia en tu
										{isUniversity ? ' institución' : ' escuela'}.
										Cambia el título, la descripción o el profesor
										asignado; {isUniversity
											? 'los programas y el semestre'
											: 'el nivel de grado'} se pueden
										actualizar abajo. Adjunta un documento del
										curso opcional — PDF, hasta 200 MB.
									</p>
								</div>
								{isLoadingList && !currentSubject ? (
									<p className='login-card__subtitle login-card__subtitle--wide'>
										Cargando…
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
												Nombre de la materia
											</label>
											<input
												type='text'
												id='schooladmin-edit-subject-title'
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
											<div className='login-field subject-grade-picker'>
												<div className='subject-grade-picker__header'>
													<label
														className='login-label subject-grade-picker__title'
														htmlFor='schooladmin-edit-subject-program'
													>
														Programas
													</label>
													{selectedProgramIds.length > 0 && (
														<span className='subject-grade-picker__count'>
															{selectedProgramIds.length}{' '}
															seleccionados
														</span>
													)}
												</div>
												{isLoadingSchool ? (
													<p className='subject-grade-picker__hint'>
														Cargando programas…
													</p>
												) : programs.length === 0 ? (
													<p className='subject-grade-picker__hint'>
														Aún no hay programas en tu institución.{' '}
														<Link to='/schooladmins/myschools'>
															Agrégalos en Mi escuela
														</Link>
													</p>
												) : (
													<>
														<p
															className='subject-grade-picker__hint'
															id='schooladmin-edit-subject-program'
														>
															Elige al menos un programa al
															que aplique esta materia.
														</p>
														<div
															className='subject-grade-picker__grid'
															role='group'
															aria-label='Programas de esta materia'
														>
															{programs.map((item) => {
																const programId = String(item._id)
																const checked = selectedProgramIds
																	.includes(programId)
																return (
																	<label
																		key={programId}
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
																			name='program'
																			value={programId}
																			checked={checked}
																			disabled={isBusy}
																			onChange={() =>
																				handleToggleProgram(
																					programId,
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
																			{item.name}
																			{item.programType
																				? ` · ${getProgramTypeLabel(
																					item.programType,
																				)}`
																				: ''}
																			{item.department
																				? ` (${item.department})`
																				: ''}
																		</span>
																	</label>
																)
															})}
														</div>
													</>
												)}
											</div>
										) : (
											<div className='login-field'>
												<label
													className='login-label'
													htmlFor='schooladmin-edit-subject-grade'
												>
													Nivel de grado
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
										)}
										{isUniversity && (
											<div className='login-field'>
												<label
													className='login-label'
													htmlFor='schooladmin-edit-subject-semester'
												>
													Semestre
													<span className='subject-grade-picker__optional'>
														(opcional)
													</span>
												</label>
												<input
													type='number'
													id='schooladmin-edit-subject-semester'
													name='semester'
													className='login-input'
													min='1'
													step='1'
													placeholder='Ej. 1'
													autoComplete='off'
													value={semester}
													disabled={isBusy}
													onChange={(e) =>
														setSemester(e.target.value)}
												/>
											</div>
										)}
										<div className='login-field subject-teacher-picker'>
											<div className='subject-teacher-picker__header'>
												<label
													className='login-label subject-teacher-picker__title'
													id='schooladmin-edit-subject-teacher-label'
												>
													Asignar profesor
												</label>
												{assignedTeacher ? (
													<span className='subject-teacher-picker__badge subject-teacher-picker__badge--current'>
														Actual:{' '}
														{formatTeacherName(
															assignedTeacher.firstname,
															assignedTeacher.lastname,
														)}
													</span>
												) : selectedTeacher ? (
													<span className='subject-teacher-picker__badge'>
														Seleccionado
													</span>
												) : null}
											</div>
											{isLoadingTeachers ? (
												<p className='subject-teacher-picker__hint'>
													Cargando profesores…
												</p>
											) : teachersList.length === 0 ? (
												<p className='subject-teacher-picker__hint'>
													Aún no hay profesores.{' '}
													<Link to='/schooladmins/addteacher'>
														Agrega un profesor
													</Link>{' '}
													primero y luego asígnalo aquí.
												</p>
											) : (
												<>
													<p
														className='subject-teacher-picker__hint'
														id='schooladmin-edit-subject-teacher'
													>
														Elige quién impartirá esta materia.
														El profesor actual aparece marcado
														abajo.
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
																			Actual
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
												Descripción (opcional)
											</label>
											<textarea
												id='schooladmin-edit-subject-description'
												name='description'
												className='login-input login-textarea'
												placeholder='De qué trata esta materia…'
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
													htmlFor='schooladmin-edit-document-label'
												>
													Etiqueta del documento (opcional)
												</label>
												<input
													type='text'
													id='schooladmin-edit-document-label'
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
													id='schooladmin-edit-subject-book'
													name='document'
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
													to={`/schooladmins/bookchapters/${subjectId}`}
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
											id='schooladmin-edit-subject-save'
											className='login-submit'
											disabled={
												isBusy
												|| !selectedTeacherId
												|| (isUniversity
													&& selectedProgramIds.length === 0)
											}
										>
											{isSaving ? 'Guardando…' : 'Guardar cambios'}
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
