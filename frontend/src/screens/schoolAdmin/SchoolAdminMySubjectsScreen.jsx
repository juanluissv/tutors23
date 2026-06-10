import { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useSelector } from 'react-redux'
import {
	useGetSubjectsBySchoolQuery,
	useGetSchoolByIdQuery,
	useGetTeachersBySchoolQuery,
} from '../../slices/admin/schoolAdminApiSlice'
import AdminSidebar from '../../components/AdminSidebar'
import AdminHeader from '../../components/AdminHeader'
import {
	getSubjectGradeLevelsLabel,
	normalizeGradeLevels,
	subjectIncludesGradeLevel,
} from '../../utils/gradeLevel'
import '../../App.css'

const GradCapIcon = () => (
	<svg
		width="22"
		height="22"
		viewBox="0 0 24 24"
		fill="none"
		xmlns="http://www.w3.org/2000/svg"
	>
		<path
			d="M3 9L12 4L21 9L12 14L3 9Z"
			fill="#1e293b"
			stroke="#1e293b"
			strokeWidth="1.2"
			strokeLinejoin="round"
		/>
		<path
			d="M7 11.5V15C7 16.657 9.239 18 12 18C14.761 18 17 16.657 17 15V11.5"
			stroke="#1e293b"
			strokeWidth="1.2"
			strokeLinecap="round"
			strokeLinejoin="round"
		/>
	</svg>
)

const StudentsIcon = () => (
	<svg
		width="14"
		height="14"
		viewBox="0 0 24 24"
		fill="none"
		stroke="currentColor"
		strokeWidth="2"
		strokeLinecap="round"
		strokeLinejoin="round"
	>
		<path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
		<circle cx="9" cy="7" r="4" />
		<path d="M23 21v-2a4 4 0 0 0-3-3.87" />
		<path d="M16 3.13a4 4 0 0 1 0 7.75" />
	</svg>
)

const TeacherIcon = () => (
	<svg
		width="14"
		height="14"
		viewBox="0 0 24 24"
		fill="none"
		stroke="currentColor"
		strokeWidth="2"
		strokeLinecap="round"
		strokeLinejoin="round"
	>
		<path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
		<circle cx="12" cy="7" r="4" />
	</svg>
)

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

function getSubjectTeacherLabel (subject, teachersByEmail) {
	const emails = normalizeTeacherEmails(subject?.teacherEmail)
		.map((email) => email.toLowerCase())

	if (emails.length === 0) {
		return 'No teacher assigned'
	}

	const names = emails
		.map((email) => {
			const teacher = teachersByEmail.get(email)
			if (!teacher) {
				return null
			}
			return formatTeacherName(teacher.firstname, teacher.lastname)
		})
		.filter(Boolean)

	if (names.length > 0) {
		return names.join(', ')
	}

	return emails[0]
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

function SchoolAdminMySubjectsScreen () {
	const navigate = useNavigate()
	const { schoolAdminInfo } = useSelector((state) => state.authSchoolAdmin)
	const schoolId = schoolAdminInfo
		? resolveSchoolId(schoolAdminInfo.school)
		: null

	const [isSidebarOpen, setIsSidebarOpen] = useState(
		window.innerWidth > 768,
	)
	const [selectedGradeLevelId, setSelectedGradeLevelId] = useState('')

	const {
		data: subjects = [],
		isLoading,
		isError,
		refetch,
	} = useGetSubjectsBySchoolQuery(schoolId, {
		skip: !schoolId,
	})

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
	const hasGradeLevels = gradesLevels.length > 0
	const teachersList = useMemo(
		() => (Array.isArray(teachers) ? teachers : []),
		[teachers],
	)
	const teachersByEmail = useMemo(() => {
		const map = new Map()
		for (const teacher of teachersList) {
			map.set(
				String(teacher.email).trim().toLowerCase(),
				teacher,
			)
		}
		return map
	}, [teachersList])
	const hasTeachers = teachersList.length > 0
	const canAddSubject = hasGradeLevels && hasTeachers
	const isPageLoading = isLoading || isLoadingSchool || isLoadingTeachers
	const subjectsList = useMemo(
		() => (Array.isArray(subjects) ? subjects : []),
		[subjects],
	)
	const filteredSubjects = useMemo(() => {
		if (selectedGradeLevelId === '') {
			return subjectsList
		}
		const selectedLevel = gradesLevels.find(
			(level) => String(level._id) === selectedGradeLevelId,
		)
		if (!selectedLevel) {
			return subjectsList
		}
		return subjectsList.filter(
			(subject) => subjectIncludesGradeLevel(
				subject.gradesLevel,
				selectedLevel,
			),
		)
	}, [subjectsList, selectedGradeLevelId, gradesLevels])
	const subjectCountByGrade = useMemo(() => {
		const counts = new Map()
		for (const level of gradesLevels) {
			const id = String(level._id)
			const count = subjectsList.filter(
				(subject) => subjectIncludesGradeLevel(
					subject.gradesLevel,
					level,
				),
			).length
			counts.set(id, count)
		}
		return counts
	}, [subjectsList, gradesLevels])

	const handleSelectGradeFilter = (gradeLevelId) => {
		setSelectedGradeLevelId(gradeLevelId)
	}

	const toggleSidebar = () => {
		setIsSidebarOpen(!isSidebarOpen)
	}

	useEffect(() => {
		if (!schoolAdminInfo) {
			navigate('/schooladmins/login', { replace: true })
		}
	}, [schoolAdminInfo, navigate])

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
							<div className='center-content2 login-screen login-screen--wide'>
								<div className='login-card'>
									<div className='login-card__accent' aria-hidden />
									<div className='login-card__header'>
										<h1 className='login-card__title'>
											<br />
											No school yet
										</h1>
										<p className='login-card__subtitle login-card__subtitle--wide'>
											Register your school first, then you can
											view and manage subjects.
										</p>
									</div>
									<p className='login-card__subtitle login-card__subtitle--wide'>
										<Link to='/schooladmins/registerschool'>
											Register your school
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
					<div className='content-area'>
						<div className='teacher-subjects-page'>
							<h1 className='teacher-subjects-page__title heading-gradient'>
								School subjects
							</h1>
							<p className='teacher-subjects-page__subtitle'>
								All subjects in your school. Create new ones or
								manage existing subjects below.
							</p>
							{!isPageLoading && !isError && subjectsList.length > 0 && canAddSubject && (
								<div className='teacher-subjects-page__cta'>
									<Link
										to='/schooladmins/createsubject'
										className='teacher-subjects-page__add-btn'
									>
										<span
											className='teacher-subjects-page__add-btn-icon'
											aria-hidden
										>
											+
										</span>
										<span>Add subject</span>
									</Link>
								</div>
							)}

							{!isPageLoading && !isError && subjectsList.length > 0 && hasGradeLevels && (
								<div
									className='teacher-subjects-page__grade-filter'
									role='group'
									aria-label='Filter subjects by grade level'
								>
									<div className='teacher-subjects-page__grade-filter-header'>
										<span
											className='teacher-subjects-page__grade-filter-icon'
											aria-hidden
										>
											<GradCapIcon />
										</span>
										<span className='teacher-subjects-page__grade-filter-label'>
											Filter by grade
										</span>
										{selectedGradeLevelId !== '' && (
											<span className='teacher-subjects-page__grade-filter-count'>
												{filteredSubjects.length} subject
												{filteredSubjects.length === 1 ? '' : 's'}
											</span>
										)}
									</div>
									<div className='teacher-subjects-page__grade-filter-pills'>
										<button
											type='button'
											className={
												'teacher-subjects-page__grade-pill' +
												(selectedGradeLevelId === ''
													? ' teacher-subjects-page__grade-pill--active'
													: '')
											}
											onClick={() => handleSelectGradeFilter('')}
											aria-pressed={selectedGradeLevelId === ''}
										>
											All grades
											<span className='teacher-subjects-page__grade-pill-count'>
												{subjectsList.length}
											</span>
										</button>
										{gradesLevels.map((level) => {
											const levelId = String(level._id)
											const isActive = selectedGradeLevelId === levelId
											const count = subjectCountByGrade.get(levelId) ?? 0

											return (
												<button
													key={levelId}
													type='button'
													className={
														'teacher-subjects-page__grade-pill' +
														(isActive
															? ' teacher-subjects-page__grade-pill--active'
															: '')
													}
													onClick={() => handleSelectGradeFilter(levelId)}
													aria-pressed={isActive}
												>
													Grade {level.name}
													<span className='teacher-subjects-page__grade-pill-count'>
														{count}
													</span>
												</button>
											)
										})}
									</div>
								</div>
							)}

							{isPageLoading && (
								<p className='teacher-subjects-page__subtitle'>
									Loading subjects…
								</p>
							)}

							{isError && !isPageLoading && (
								<div className='teacher-subjects-page__subtitle'>
									<p>We couldn&apos;t load subjects.</p>
									<button
										type='button'
										className='login-submit'
										onClick={() => void refetch()}
									>
										Try again
									</button>
								</div>
							)}

							{!isPageLoading && !isError && subjectsList.length === 0 && (
								<div className='teacher-subjects-page__empty'>
									{!hasGradeLevels ? (
										<>
											<p className='teacher-subjects-page__empty-text'>
												Before you can add subjects, add the grade
												levels your school offers in My school.
											</p>
											<Link
												to='/schooladmins/myschools'
												className='teacher-subjects-page__add-btn'
											>
												<span
													className='teacher-subjects-page__add-btn-icon'
													aria-hidden
												>
													+
												</span>
												<span>Add grade levels first</span>
											</Link>
										</>
									) : !hasTeachers ? (
										<>
											<p className='teacher-subjects-page__empty-text'>
												Before you can add subjects, add at least
												one teacher to your school.
											</p>
											<Link
												to='/schooladmins/addteacher'
												className='teacher-subjects-page__add-btn'
											>
												<span
													className='teacher-subjects-page__add-btn-icon'
													aria-hidden
												>
													+
												</span>
												<span>Add a teacher first</span>
											</Link>
										</>
									) : (
										<>
											<p className='teacher-subjects-page__empty-text'>
												No subjects yet. Start by adding your
												first subject.
											</p>
											<Link
												to='/schooladmins/createsubject'
												className='teacher-subjects-page__add-btn'
											>
												<span
													className='teacher-subjects-page__add-btn-icon'
													aria-hidden
												>
													+
												</span>
												<span>Create your first subject</span>
											</Link>
										</>
									)}
								</div>
							)}

							{!isPageLoading && !isError && subjectsList.length > 0 && filteredSubjects.length === 0 && (
								<div className='teacher-subjects-page__empty'>
									<p className='teacher-subjects-page__empty-text'>
										No subjects for this grade level yet.
									</p>
									<button
										type='button'
										className='teacher-subjects-page__add-btn'
										onClick={() => handleSelectGradeFilter('')}
									>
										<span>Show all subjects</span>
									</button>
								</div>
							)}

							{!isPageLoading && !isError && filteredSubjects.length > 0 && (
								<div className='teacher-subjects-grid'>
								{filteredSubjects.map((subject, index) => {
									const id = String(
										subject._id ?? subject.id ?? index,
									)
									const variant = (index % 5) + 1
									const studentsCount =
										subject.studentCount
										?? (Array.isArray(subject.students)
											? subject.students.length
											: 0)
									const gradeLabel = getSubjectGradeLevelsLabel(
										subject.gradesLevel,
									)
									const teacherLabel = getSubjectTeacherLabel(
										subject,
										teachersByEmail,
									)

									return (
										<article
											key={id}
											className={
												`teacher-subject-card ` +
												`teacher-subject-card--grad-${variant}`
											}
										>
											<div
												className='teacher-subject-card__orb'
												aria-hidden
											/>
											<div
												className={
													'teacher-subject-card__orb ' +
													'teacher-subject-card__orb--sm'
												}
												aria-hidden
											/>

											<div className='teacher-subject-card__top'>
												<div>
													<h2 className='teacher-subject-card__name'>
														{subject.title}
													</h2>
													<span className='teacher-subject-card__students'>
														<StudentsIcon />
														{studentsCount} students
													</span>
													<span className='teacher-subject-card__teacher'>
														<TeacherIcon />
														{teacherLabel}
													</span>
													<p className='teacher-subject-card__meta'>
														{gradeLabel}
														{subject.isCoursePublish
															? ' · Published'
															: ' · Draft'}
													</p>
												</div>
												<div className='teacher-subject-card__badge'>
													<GradCapIcon />
												</div>
											</div>

											{subject.description ? (
												<p className='teacher-subject-card__excerpt'>
													{subject.description}
												</p>
											) : null}

											<div className='teacher-subject-card__divider' />

											<div className='teacher-subject-card__actions'>
												<div className='teacher-subject-card__row'>
													<Link
														to={`/schooladmins/courses/${id}`}
														className='teacher-subject-card__btn'
													>
														Courses
													</Link>
													<Link
														to={`/schooladmins/editsubject/${id}`}
														className='teacher-subject-card__btn'
													>
														Edit subject
													</Link>
													<Link
														to={`/schooladmins/previousquestions/${id}`}
														className='teacher-subject-card__btn'
													>
														Questions
													</Link>
												</div>
											</div>
										</article>
									)
								})}
								</div>
							)}
						</div>
					</div>
				</div>
			</div>
		</div>
	)
}

export default SchoolAdminMySubjectsScreen
