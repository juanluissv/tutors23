import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useSelector } from 'react-redux'
import { toast } from 'react-toastify'
import {
	useGetSchoolByIdQuery,
	useUpdateSchoolMutation,
} from '../../slices/admin/schoolAdminApiSlice'
import AdminSidebar from '../../components/AdminSidebar'
import AdminHeader from '../../components/AdminHeader'
import {
	gradeLevelNamesFromApi,
	normalizeGradeLevels,
} from '../../utils/gradeLevel'
import {
	normalizeUniversityPrograms,
	programsForApi,
	getProgramTypeLabel,
	UNIVERSITY_PROGRAM_TYPES,
} from '../../utils/universityProgram'
import { isUniversitySchool } from '../../utils/schoolType'
import '../../App.css'

const SCHOOL_TYPE_OPTIONS = [
	{ value: 'primary', label: 'Primaria' },
	{ value: 'secondary', label: 'Secundaria' },
	{ value: 'high_school', label: 'Bachillerato' },
	{ value: 'university', label: 'Universidad' },
]

function normalizeSchoolType (schoolType) {
	if (schoolType === 'high school') {
		return 'high_school'
	}
	return schoolType ?? ''
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

function SchoolAdminMySchoolsScreen () {
	const navigate = useNavigate()
	const { schoolAdminInfo } = useSelector((state) => state.authSchoolAdmin)
	const schoolId = schoolAdminInfo
		? resolveSchoolId(schoolAdminInfo.school)
		: null

	const [isSidebarOpen, setIsSidebarOpen] = useState(
		window.innerWidth > 768,
	)
	const [name, setName] = useState('')
	const [schoolType, setSchoolType] = useState('')
	const [gradesLevels, setGradesLevels] = useState([])
	const [newGradeLevel, setNewGradeLevel] = useState('')
	const [programs, setPrograms] = useState([])
	const [newProgram, setNewProgram] = useState('')
	const [newProgramDepartment, setNewProgramDepartment] = useState('')
	const [newProgramType, setNewProgramType] = useState('')
	const [country, setCountry] = useState('')
	const [city, setCity] = useState('')
	const [address, setAddress] = useState('')

	const {
		data: schoolData,
		isLoading: isLoadingSchool,
		isError: isSchoolQueryError,
		refetch: refetchSchool,
	} = useGetSchoolByIdQuery(schoolId, {
		skip: !schoolId,
	})

	const [updateSchool, { isLoading: isUpdating }] = useUpdateSchoolMutation()
	const isBusy = isLoadingSchool || isUpdating
	const isUniversity = isUniversitySchool(schoolType)
	const savedIsUniversity = isUniversitySchool(
		normalizeSchoolType(schoolData?.schoolType),
	)
	const canChangeSchoolType = schoolData?.canChangeSchoolType !== false

	const toggleSidebar = () => {
		setIsSidebarOpen(!isSidebarOpen)
	}

	useEffect(() => {
		if (!schoolAdminInfo) {
			navigate('/schooladmins/login', { replace: true })
		}
	}, [schoolAdminInfo, navigate])

	useEffect(() => {
		if (schoolData) {
			setName(schoolData.name ?? '')
			setSchoolType(normalizeSchoolType(schoolData.schoolType))
			setGradesLevels(normalizeGradeLevels(schoolData.gradesLevels))
			setPrograms(normalizeUniversityPrograms(schoolData.programs))
			setCountry(schoolData.country ?? '')
			setCity(schoolData.city ?? '')
			setAddress(schoolData.address ?? '')
		}
	}, [schoolData])

	const handleAddGradeLevel = () => {
		const trimmed = newGradeLevel.trim()
		if (trimmed === '') {
			return
		}
		if (gradesLevels.some((level) => level.name === trimmed)) {
			toast.error('Ese grado ya está en la lista')
			return
		}
		setGradesLevels([...gradesLevels, { name: trimmed }])
		setNewGradeLevel('')
	}

	const handleRemoveGradeLevel = (level) => {
		setGradesLevels(
			gradesLevels.filter((item) => item._id !== level._id
				&& item.name !== level.name),
		)
	}

	const handleAddProgram = () => {
		const trimmed = newProgram.trim()
		if (trimmed === '') {
			return
		}
		if (programs.some((item) => item.name === trimmed)) {
			toast.error('Ese programa ya está en la lista')
			return
		}
		const department = newProgramDepartment.trim()
		const programType = newProgramType.trim()
		const nextProgram = { name: trimmed }
		if (department !== '') {
			nextProgram.department = department
		}
		if (programType !== '') {
			nextProgram.programType = programType
		}
		setPrograms([...programs, nextProgram])
		setNewProgram('')
		setNewProgramDepartment('')
		setNewProgramType('')
	}

	const handleRemoveProgram = (program) => {
		setPrograms(
			programs.filter((item) => item._id !== program._id
				&& item.name !== program.name),
		)
	}

	const handleSubmit = async (e) => {
		e.preventDefault()
		if (name.trim() === '') {
			toast.error('Ingresa el nombre de la escuela')
			return
		}
		if (schoolType.trim() === '') {
			toast.error('Selecciona el tipo de escuela')
			return
		}
		if (isUniversity) {
			if (programs.length === 0) {
				toast.error('Agrega al menos un programa')
				return
			}
		} else if (gradesLevels.length === 0) {
			toast.error('Agrega al menos un grado')
			return
		}
		if (country.trim() === '') {
			toast.error('Ingresa el país')
			return
		}
		if (city.trim() === '') {
			toast.error('Ingresa la ciudad')
			return
		}
		if (
			isUniversity !== savedIsUniversity
			&& canChangeSchoolType === false
		) {
			toast.error(
				'No se puede cambiar el tipo de escuela porque esta '
				+ 'institución ya tiene materias, planes o estudiantes',
			)
			return
		}
		if (!schoolId) {
			return
		}
		try {
			await updateSchool({
				id: schoolId,
				name: name.trim(),
				schoolType,
				gradesLevels: isUniversity
					? []
					: gradeLevelNamesFromApi(gradesLevels),
				programs: isUniversity
					? programsForApi(programs)
					: [],
				country: country.trim(),
				city: city.trim(),
				address: address.trim(),
			}).unwrap()
			toast.success('Escuela actualizada')
		} catch (err) {
			toast.error(
				err?.data?.message
					|| err?.error?.message
					|| 'No se pudo actualizar la escuela',
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
											<br /><br /><br /><br />
											Aún no hay escuela
										</h1>
										<p className='login-card__subtitle login-card__subtitle--wide'>
											Registra tu escuela primero; después
											podrás ver y editar sus detalles aquí.
										</p>
									</div>
									<p className='login-card__subtitle login-card__subtitle--wide'>
										<Link to='/schooladmins/registerschool'>
											Registrar tu escuela
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

	const signInLabel = schoolData?.signInDate
		? new Date(schoolData.signInDate).toLocaleString('es', {
			dateStyle: 'medium',
			timeStyle: 'short',
		})
		: '—'

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
										<br />
										{savedIsUniversity
											? 'Mi Universidad'
											: 'Mi escuela'}
									</h1>
									<p className='login-card__subtitle login-card__subtitle--wide'>
										Consulta y actualiza los datos públicos de
										tu escuela. Los cambios aplican solo a esta
										institución.
									</p>
								</div>
								{isLoadingSchool && !schoolData ? (
									<p className='login-card__subtitle login-card__subtitle--wide'>
										Cargando escuela…
									</p>
								) : isSchoolQueryError && !schoolData ? (
									<div className='login-form'>
										<p className='login-card__subtitle login-card__subtitle--wide'>
											No pudimos cargar tu escuela. Verifica
											que hayas iniciado sesión e intenta de
											nuevo.
										</p>
										<button
											type='button'
											className='login-submit'
											onClick={() => void refetchSchool()}
										>
											Intentar de nuevo
										</button>
									</div>
								) : (
									<form
										className='login-form'
										id='schooladmin-myschool-form'
										name='schooladmin-myschool-form'
										onSubmit={handleSubmit}
									>
										<div className='login-field school-grades-levels'>
											{isUniversity ? (
												<>
													<label
														className='login-label'
														htmlFor='schooladmin-myschool-program-new'
													>
														Primer paso: agrega los programas de tu universidad
													</label>
													<p className='school-grades-levels__hint'>
														Ingresa cada programa de grado que ofrece
														tu institución y haz clic en Agregar. Necesitas
														al menos un programa antes de guardar (p. ej.
														Ciencias de la Computación, Administración de
														Empresas). Elimina un programa solo si ninguna
														materia, plan o estudiante lo usa aún.
													</p>
													<div className='school-grades-levels__add-row'>
														<div className='login-field'>
															<input
																type='text'
																id='schooladmin-myschool-program-new'
																name='newProgram'
																className='login-input'
																placeholder='p. ej. Ciencias de la Computación'
																autoComplete='off'
																value={newProgram}
																disabled={isBusy}
																onChange={(e) =>
																	setNewProgram(e.target.value)}
																onKeyDown={(e) => {
																	if (e.key === 'Enter') {
																		e.preventDefault()
																		handleAddProgram()
																	}
																}}
															/>
														</div>
														<div className='login-field'>
															<input
																type='text'
																id='schooladmin-myschool-program-dept'
																name='newProgramDepartment'
																className='login-input'
																placeholder='Departamento'
																autoComplete='off'
																value={newProgramDepartment}
																disabled={isBusy}
																onChange={(e) =>
																	setNewProgramDepartment(
																		e.target.value,
																	)}
															/>
														</div>
														<div className='login-field'>
															<select
																id='schooladmin-myschool-program-type'
																name='newProgramType'
																className='login-input'
																value={newProgramType}
																disabled={isBusy}
																onChange={(e) =>
																	setNewProgramType(e.target.value)}
															>
																<option value=''>
																	Tipo de programa
																</option>
																{UNIVERSITY_PROGRAM_TYPES.map(
																	(type) => (
																		<option
																			key={type}
																			value={type}
																		>
																			{getProgramTypeLabel(type)}
																		</option>
																	),
																)}
															</select>
														</div>
														<button
															type='button'
															className='school-grades-levels__add-btn'
															disabled={isBusy}
															onClick={handleAddProgram}
														>
															Agregar
														</button>
													</div>
													{programs.length > 0 ? (
														<ul
															className='school-grades-levels__chips'
															aria-label='Programas actuales'
														>
															{programs.map((program) => (
																<li
																	key={program._id ?? program.name}
																	className='school-grades-levels__chip'
																>
																	<span className='school-grades-levels__chip-label'>
																		{program.name}
																		{program.programType
																			? ` · ${getProgramTypeLabel(
																				program.programType,
																			)}`
																			: ''}
																		{program.department
																			? ` (${program.department})`
																			: ''}
																	</span>
																	<button
																		type='button'
																		className='school-grades-levels__chip-remove'
																		aria-label={`Eliminar ${program.name}`}
																		disabled={isBusy}
																		onClick={() =>
																			handleRemoveProgram(program)}
																	>
																		×
																	</button>
																</li>
															))}
														</ul>
													) : (
														<p className='school-grades-levels__empty'>
															Aún no hay programas — ingresa tu
															primer programa arriba y haz clic en
															Agregar.
														</p>
													)}
												</>
											) : (
												<>
													<label
														className='login-label'
														htmlFor='schooladmin-myschool-grade-new'
													>
														Primer paso: agrega los grados de tu escuela
													</label>
													<p className='school-grades-levels__hint'>
														Empieza aquí ingresando cada grado o año
														que ofrece tu escuela y haz clic en Agregar.
														Necesitas al menos un grado antes de guardar
														(p. ej. 9, 10, 11, 12 o Año 1). Elimina un
														grado solo si ninguna materia, plan o
														estudiante lo usa aún.
													</p>
													<div className='school-grades-levels__add-row'>
														<div className='login-field'>
															<input
																type='text'
																id='schooladmin-myschool-grade-new'
																name='newGradeLevel'
																className='login-input'
																placeholder='p. ej. 10 o Año 2'
																autoComplete='off'
																value={newGradeLevel}
																disabled={isBusy}
																onChange={(e) =>
																	setNewGradeLevel(e.target.value)}
																onKeyDown={(e) => {
																	if (e.key === 'Enter') {
																		e.preventDefault()
																		handleAddGradeLevel()
																	}
																}}
															/>
														</div>
														<button
															type='button'
															className='school-grades-levels__add-btn'
															disabled={isBusy}
															onClick={handleAddGradeLevel}
														>
															Agregar
														</button>
													</div>
													{gradesLevels.length > 0 ? (
														<ul
															className='school-grades-levels__chips'
															aria-label='Grados actuales'
														>
															{gradesLevels.map((level) => (
																<li
																	key={level._id ?? level.name}
																	className='school-grades-levels__chip'
																>
																	<span className='school-grades-levels__chip-label'>
																		{level.name}
																	</span>
																	<button
																		type='button'
																		className='school-grades-levels__chip-remove'
																		aria-label={`Eliminar ${level.name}`}
																		disabled={isBusy}
																		onClick={() =>
																			handleRemoveGradeLevel(level)}
																	>
																		×
																	</button>
																</li>
															))}
														</ul>
													) : (
														<p className='school-grades-levels__empty'>
															Aún no hay grados — ingresa tu primer
															grado arriba y haz clic en Agregar.
														</p>
													)}
												</>
											)}
										</div>
										<div className='login-field'>
											<label
												className='login-label'
												htmlFor='schooladmin-myschool-signin'
											>
												Registrada el
											</label>
											<input
												type='text'
												id='schooladmin-myschool-signin'
												className='login-input'
												value={signInLabel}
												readOnly
												tabIndex={-1}
												aria-readonly='true'
											/>
										</div>
										<div className='login-field'>
											<label
												className='login-label'
												htmlFor='schooladmin-myschool-name'
											>
												Nombre de la escuela
											</label>
											<input
												type='text'
												id='schooladmin-myschool-name'
												name='name'
												className='login-input'
												placeholder='Nombre de la escuela'
												autoComplete='organization'
												value={name}
												required
												disabled={isBusy}
												onChange={(e) => setName(e.target.value)}
											/>
										</div>
										<div className='login-field'>
											<label
												className='login-label'
												htmlFor='schooladmin-myschool-type'
											>
												Tipo de escuela
											</label>
											<select
												id='schooladmin-myschool-type'
												name='schoolType'
												className='login-input'
												value={schoolType}
												required
												disabled={isBusy || !canChangeSchoolType}
												onChange={(e) =>
													setSchoolType(e.target.value)}
											>
												<option value=''>
													Selecciona el tipo de escuela
												</option>
												{SCHOOL_TYPE_OPTIONS.map((opt) => (
													<option
														key={opt.value}
														value={opt.value}
													>
														{opt.label}
													</option>
												))}
											</select>
											<p className='school-grades-levels__hint'>
												{canChangeSchoolType
													? (
														'Solo puedes cambiar entre universidad '
														+ 'y escuela antes de agregar materias, '
														+ 'planes o estudiantes.'
													)
													: (
														'El tipo de escuela está bloqueado '
														+ 'porque esta institución ya tiene '
														+ 'materias, planes o estudiantes.'
													)}
											</p>
										</div>
										<div className='tp-row'>
											<div className='login-field'>
												<label
													className='login-label'
													htmlFor='schooladmin-myschool-country'
												>
													País
												</label>
												<input
													type='text'
													id='schooladmin-myschool-country'
													name='country'
													className='login-input'
													placeholder='País'
													autoComplete='country-name'
													value={country}
													required
													disabled={isBusy}
													onChange={(e) =>
														setCountry(e.target.value)}
												/>
											</div>
											<div className='login-field'>
												<label
													className='login-label'
													htmlFor='schooladmin-myschool-city'
												>
													Ciudad
												</label>
												<input
													type='text'
													id='schooladmin-myschool-city'
													name='city'
													className='login-input'
													placeholder='Ciudad'
													autoComplete='address-level2'
													value={city}
													required
													disabled={isBusy}
													onChange={(e) =>
														setCity(e.target.value)}
												/>
											</div>
										</div>
										<div className='login-field'>
											<label
												className='login-label'
												htmlFor='schooladmin-myschool-address'
											>
												Dirección
											</label>
											<input
												type='text'
												id='schooladmin-myschool-address'
												name='address'
												className='login-input'
												placeholder='Calle, número, colonia…'
												autoComplete='street-address'
												value={address}
												disabled={isBusy}
												onChange={(e) =>
													setAddress(e.target.value)}
											/>
										</div>
										<button
											type='submit'
											id='schooladmin-myschool-save'
											className='login-submit'
											disabled={isBusy}
										>
											{isUpdating
												? 'Actualizando…'
												: isLoadingSchool
													? 'Cargando…'
													: 'Actualizar escuela'}
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

export default SchoolAdminMySchoolsScreen
