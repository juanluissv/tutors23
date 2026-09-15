import { useEffect, useRef, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useSelector } from 'react-redux'
import { toast } from 'react-toastify'
import {
	useCreateSubjectMutation,
	useGetSchoolByIdQuery,
	useGetTeachersBySchoolQuery,
	useSetSubjectTeacherEmailMutation,
} from '../../slices/admin/schoolAdminApiSlice'
import AdminSidebar from '../../components/AdminSidebar'
import AdminHeader from '../../components/AdminHeader'
import { normalizeGradeLevels } from '../../utils/gradeLevel'
import { normalizeUniversityPrograms } from '../../utils/universityProgram'
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
			fill='url(#create-book-fill-a)'
		/>
		<path
			d='M13 4h5a2 2 0 012 2v10a2 2 0 01-2 2h-5V4z'
			fill='url(#create-book-fill-b)'
		/>
		<path
			d='M12 4v16'
			stroke='url(#create-book-stroke)'
			strokeWidth='1.5'
			strokeLinecap='round'
		/>
		<defs>
			<linearGradient
				id='create-book-fill-a'
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
				id='create-book-fill-b'
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
				id='create-book-stroke'
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

function SchoolAdminCreateSubjectScreen () {
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
	const [selectedGradeLevelIds, setSelectedGradeLevelIds] = useState([])
	const [selectedProgramIds, setSelectedProgramIds] = useState([])
	const [semester, setSemester] = useState('')
	const [selectedTeacherId, setSelectedTeacherId] = useState('')
	const [description, setDescription] = useState('')
	const [bookFile, setBookFile] = useState(null)

	const {
		data: schoolData,
		isLoading: isLoadingSchool,
	} = useGetSchoolByIdQuery(schoolId, {
		skip: !schoolId,
	})

	const {
		data: teachers = [],
		isLoading: isLoadingTeachers,
	} = useGetTeachersBySchoolQuery(schoolId, {
		skip: !schoolId,
	})

	const gradesLevels = normalizeGradeLevels(schoolData?.gradesLevels)
	const programs = normalizeUniversityPrograms(schoolData?.programs)
	const isUniversity = isUniversitySchool(schoolData?.schoolType)
	const cohorts = isUniversity ? programs : gradesLevels
	const selectedCohortIds = isUniversity
		? selectedProgramIds
		: selectedGradeLevelIds
	const teachersList = Array.isArray(teachers) ? teachers : []
	const hasTeachers = teachersList.length > 0

	const [createSubject, { isLoading: isCreating }] = useCreateSubjectMutation()
	const [setSubjectTeacherEmail, { isLoading: isAssigningTeacher }] =
		useSetSubjectTeacherEmailMutation()
	const isBusy = isCreating
		|| isAssigningTeacher
		|| isLoadingSchool
		|| isLoadingTeachers

	const toggleSidebar = () => {
		setIsSidebarOpen(!isSidebarOpen)
	}

	const handleToggleGradeLevel = (gradeLevelId) => {
		const id = String(gradeLevelId)
		setSelectedGradeLevelIds((prev) =>
			prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
		)
	}

	const handleToggleProgram = (programId) => {
		const id = String(programId)
		setSelectedProgramIds((prev) =>
			prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
		)
	}

	const handleToggleCohort = (cohortId) => {
		if (isUniversity) {
			handleToggleProgram(cohortId)
		} else {
			handleToggleGradeLevel(cohortId)
		}
	}

	useEffect(() => {
		if (!schoolAdminInfo) {
			navigate('/schooladmins/login', { replace: true })
		}
	}, [schoolAdminInfo, navigate])

	useEffect(() => {
		if (teachersList.length === 0) {
			setSelectedTeacherId('')
			return
		}
		setSelectedTeacherId((prev) => {
			if (prev && teachersList.some((t) => String(t._id) === prev)) {
				return prev
			}
			return String(teachersList[0]._id)
		})
	}, [teachersList])

	const selectedTeacher = teachersList.find(
		(teacher) => String(teacher._id) === selectedTeacherId,
	)

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
		if (!schoolId) {
			return
		}
		if (!selectedTeacher?.email) {
			toast.error('Selecciona un profesor para esta materia')
			return
		}
		if (isUniversity && selectedCohortIds.length === 0) {
			toast.error(
				'Selecciona al menos un programa para esta materia',
			)
			return
		}

		const body = {
			title: title.trim(),
			school: schoolId,
		}
		if (isUniversity) {
			body.program = selectedCohortIds
		} else if (selectedCohortIds.length > 0) {
			body.gradesLevel = selectedCohortIds
		}
		if (isUniversity && semester.trim() !== '') {
			const semesterNum = Number(semester)
			if (!Number.isInteger(semesterNum) || semesterNum < 1) {
				toast.error(
					'El semestre debe ser un número entero positivo',
				)
				return
			}
			body.semester = semesterNum
		}
		if (description.trim() !== '') {
			body.description = description.trim()
		}
		if (bookFile instanceof File) {
			body.book = bookFile
		}

		try {
			const created = await createSubject(body).unwrap()
			await setSubjectTeacherEmail({
				id: String(created._id),
				email: String(selectedTeacher.email).trim(),
			}).unwrap()
			toast.success(
				bookFile
					? 'Materia creada con PDF y profesor asignado'
					: 'Materia creada y profesor asignado',
			)
			navigate('/schooladmins/mysubjects', { replace: true })
		} catch (err) {
			toast.error(
				err?.data?.message
					|| err?.error?.message
					|| 'No se pudo crear la materia',
			)
		}
	}

	if (!schoolAdminInfo) {
		return null
	}

	if (!schoolId) {
		return (
			<div className='chat-app chat-app--teacher-login ask-screen'>
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
											Primero registra tu escuela; después
											podrás agregar materias.
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

	if (!isLoadingSchool && cohorts.length === 0) {
		return (
			<div className='chat-app chat-app--teacher-login ask-screen'>
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
											{isUniversity
												? 'Agrega los programas primero'
												: 'Agrega los grados primero'}
										</h1>
										<p className='login-card__subtitle login-card__subtitle--wide'>
											{isUniversity
												? 'Tu institución necesita al menos un programa'
												: 'Tu escuela necesita al menos un grado'}
											{' '}antes de crear materias. Agrégalos
											en Mi escuela y luego vuelve aquí.
										</p>
									</div>
									<p className='login-card__subtitle login-card__subtitle--wide'>
										<Link to='/schooladmins/myschools'>
											Ir a Mi escuela
										</Link>
										{' · '}
										<Link to='/schooladmins/mysubjects'>
											Volver a las materias
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

	if (!isLoadingTeachers && !hasTeachers) {
		return (
			<div className='chat-app chat-app--teacher-login ask-screen'>
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
											Agrega un profesor primero
										</h1>
										<p className='login-card__subtitle login-card__subtitle--wide'>
											Tu escuela necesita al menos un
											profesor antes de crear materias.
											Agrega un profesor y luego vuelve
											aquí.
										</p>
									</div>
									<p className='login-card__subtitle login-card__subtitle--wide'>
										<Link to='/schooladmins/addteacher'>
											Agregar un profesor
										</Link>
										{' · '}
										<Link to='/schooladmins/mysubjects'>
											Volver a las materias
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
										Crear una materia
									</h1>
									<p className='login-card__subtitle login-card__subtitle--wide'>
										Agrega una materia nueva a tu
										{isUniversity
											? ' institución'
											: ' escuela'}. Elige
										{isUniversity
											? ' programas'
											: ' grados'},
										asigna un profesor y agrega una
										descripción breve. Adjunta un
										documento del curso opcional: sube tu
										primer PDF. Puedes agregar más después
										desde editar materia.
									</p>
								</div>
								<form
									className='login-form'
									id='schooladmin-create-subject-form'
									name='schooladmin-create-subject-form'
									onSubmit={handleSubmit}
								>
									<div className='login-field'>
										<label
											className='login-label'
											htmlFor='schooladmin-create-subject-title'
										>
											Nombre de la materia
										</label>
										<input
											type='text'
											id='schooladmin-create-subject-title'
											name='title'
											className='login-input'
											placeholder='Ej. Álgebra II'
											autoComplete='off'
											value={title}
											disabled={isBusy}
											onChange={(e) => setTitle(e.target.value)}
										/>
									</div>
									<div className='login-field subject-grade-picker'>
										<div className='subject-grade-picker__header'>
											<label
												className='login-label subject-grade-picker__title'
												htmlFor='schooladmin-create-subject-cohort'
											>
												{isUniversity
													? 'Programas'
													: 'Niveles de grado'}
												{!isUniversity && (
													<span className='subject-grade-picker__optional'>
														(opcional)
													</span>
												)}
											</label>
											{selectedCohortIds.length > 0 && (
												<span className='subject-grade-picker__count'>
													{selectedCohortIds.length}{' '}
													seleccionados
												</span>
											)}
										</div>
										{isLoadingSchool ? (
											<p className='subject-grade-picker__hint'>
												{isUniversity
													? 'Cargando programas…'
													: 'Cargando grados…'}
											</p>
										) : cohorts.length === 0 ? (
											<p className='subject-grade-picker__hint'>
												Aún no hay {isUniversity
													? 'programas'
													: 'grados'} en tu {isUniversity
													? 'institución'
													: 'escuela'}.{' '}
												<Link to='/schooladmins/myschools'>
													Agrégalos en Mi escuela
												</Link>{' '}
												primero y luego crea materias.
											</p>
										) : (
											<>
												<p
													className='subject-grade-picker__hint'
													id='schooladmin-create-subject-cohort'
												>
													{isUniversity
														? (
															'Elige al menos un programa '
															+ 'al que aplique esta materia.'
														)
														: (
															'Elige uno o más grados a '
															+ 'los que aplique esta materia.'
														)}
												</p>
												<div
													className='subject-grade-picker__grid'
													role='group'
													aria-label={isUniversity
														? 'Programas de esta materia'
														: 'Grados de esta materia'}
												>
													{cohorts.map((item) => {
														const levelId = String(item._id)
														const checked = selectedCohortIds
															.includes(levelId)
														return (
															<label
																key={levelId}
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
																	name={isUniversity
																		? 'program'
																		: 'gradesLevel'}
																	value={levelId}
																	checked={checked}
																	disabled={isBusy}
																	onChange={() =>
																		handleToggleCohort(
																			levelId,
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
									{isUniversity && (
										<div className='login-field'>
											<label
												className='login-label'
												htmlFor='schooladmin-create-subject-semester'
											>
												Semestre
												<span className='subject-grade-picker__optional'>
													(opcional)
												</span>
											</label>
											<input
												type='number'
												id='schooladmin-create-subject-semester'
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
											<p className='subject-grade-picker__hint'>
												El semestre del programa al que
												pertenece esta materia.
											</p>
										</div>
									)}
									<div className='login-field subject-teacher-picker'>
										<div className='subject-teacher-picker__header'>
											<label
												className='login-label subject-teacher-picker__title'
												id='schooladmin-create-subject-teacher-label'
											>
												Asignar profesor
											</label>
											{selectedTeacher && (
												<span className='subject-teacher-picker__badge'>
													Seleccionado
												</span>
											)}
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
												primero y luego crea materias.
											</p>
										) : (
											<>
												<p
													className='subject-teacher-picker__hint'
													id='schooladmin-create-subject-teacher'
												>
													Elige quién impartirá esta materia.
												</p>
												<div
													className='subject-teacher-picker__list'
													role='radiogroup'
													aria-labelledby='schooladmin-create-subject-teacher-label'
												>
													{teachersList.map((teacher) => {
														const teacherId = String(
															teacher._id,
														)
														const isSelected =
															selectedTeacherId === teacherId
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
											htmlFor='schooladmin-create-subject-description'
										>
											Descripción (opcional)
										</label>
										<textarea
											id='schooladmin-create-subject-description'
											name='description'
											className='login-input login-textarea'
											placeholder='De qué trata esta materia…'
											rows={4}
											value={description}
											disabled={isBusy}
											onChange={(e) =>
												setDescription(e.target.value)}
										/>
									</div>
									<div className='login-field'>
										<span
											className='login-label'
											id='schooladmin-create-book-label'
										>
											Documento del curso (opcional)
										</span>
										<div className='teacher-book-upload'>
											<input
												ref={bookInputRef}
												type='file'
												id='schooladmin-create-subject-book'
												name='book'
												className='teacher-book-upload__input'
												accept='application/pdf,.pdf'
												disabled={isBusy}
												onChange={handleBookChange}
												aria-labelledby='schooladmin-create-book-label'
											/>
											<label
												htmlFor='schooladmin-create-subject-book'
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
														: (
															'Subir un archivo  '
															
														)}
												</span>
												<span className='teacher-book-upload__hint'>
													Solo PDF · hasta 200 MB
												</span>
											</label>
											{bookFile ? (
												<button
													type='button'
													className='teacher-book-upload__clear'
													onClick={handleClearBook}
													disabled={isBusy}
												>
													Quitar archivo
												</button>
											) : null}
										</div>
									</div>
									<button
										type='submit'
										id='schooladmin-create-subject-submit'
										className='login-submit'
										disabled={
											isBusy
											|| cohorts.length === 0
											|| !selectedTeacherId
											|| (isUniversity
												&& selectedCohortIds.length === 0)
										}
									>
										{isCreating || isAssigningTeacher
											? 'Creando…'
											: isLoadingSchool || isLoadingTeachers
												? 'Cargando…'
												: 'Crear materia'}
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

export default SchoolAdminCreateSubjectScreen
