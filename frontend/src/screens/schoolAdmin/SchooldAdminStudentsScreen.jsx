import { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useSelector } from 'react-redux'
import AdminSidebar from '../../components/AdminSidebar'
import AdminHeader from '../../components/AdminHeader'
import {
	useGetSchoolByIdQuery,
	useGetSubjectsBySchoolQuery,
} from '../../slices/admin/schoolAdminApiSlice'
import {
	normalizeGradeLevels,
	subjectIncludesGradeLevel,
} from '../../utils/gradeLevel'
import {
	TeacherSubjectsGrid,
	SubjectCardActionsStudentsSchoolAdmin,
} from '../teachers/TeacherSubjectsGrid'
import '../../App.css'

const GradCapIcon = () => (
	<svg
		width='22'
		height='22'
		viewBox='0 0 24 24'
		fill='none'
		xmlns='http://www.w3.org/2000/svg'
	>
		<path
			d='M3 9L12 4L21 9L12 14L3 9Z'
			fill='#1e293b'
			stroke='#1e293b'
			strokeWidth='1.2'
			strokeLinejoin='round'
		/>
		<path
			d='M7 11.5V15C7 16.657 9.239 18 12 18C14.761 18 17 16.657 17 15V11.5'
			stroke='#1e293b'
			strokeWidth='1.2'
			strokeLinecap='round'
			strokeLinejoin='round'
		/>
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

function SchooldAdminStudentsScreen () {
	const navigate = useNavigate()
	const { schoolAdminInfo } = useSelector((state) => state.authSchoolAdmin)
	const schoolId = schoolAdminInfo
		? resolveSchoolId(schoolAdminInfo.school)
		: null

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

	const [isSidebarOpen, setIsSidebarOpen] = useState(
		window.innerWidth > 768,
	)
	const [selectedGradeLevelId, setSelectedGradeLevelId] = useState('')

	const gradesLevels = normalizeGradeLevels(schoolData?.gradesLevels)
	const hasGradeLevels = gradesLevels.length > 0
	const isPageLoading = isLoading || isLoadingSchool
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
											<br />
											No school yet
										</h1>
										<p className='login-card__subtitle login-card__subtitle--wide'>
											Register your school first, then you can
											view students by subject.
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
				<AdminSidebar
					isOpen={isSidebarOpen}
					toggleSidebar={toggleSidebar}
				/>
				<div className='main-content'>
					<AdminHeader
						isSidebarOpen={isSidebarOpen}
						toggleSidebar={toggleSidebar}
					/>
					<div className='content-area'>
						<TeacherSubjectsGrid
							pageTitle='Students by subject'
							pageSubtitle={
								'Pick a subject to see enrolled students ' +
								'and activity.'
							}
							afterSubtitle={
								!isPageLoading && !isError ? (
									<>
										<div className='teacher-subjects-page__cta'>
											<Link
												to='/schooladmins/addstudents'
												className='teacher-subjects-page__add-btn'
											>
												<span
													className='teacher-subjects-page__add-btn-icon'
													aria-hidden
												>
													+
												</span>
												<span>Add students</span>
											</Link>
										</div>
										{subjectsList.length > 0 && hasGradeLevels ? (
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
										) : null}
									</>
								) : null
							}
							emptyMessage={
								selectedGradeLevelId !== '' && subjectsList.length > 0
									? 'No subjects for this grade level yet.'
									: 'No subjects yet. Create subjects first, then ' +
										'students enrolled in them will appear here.'
							}
							subjects={filteredSubjects}
							isLoading={isPageLoading}
							isError={isError}
							refetch={refetch}
							renderCardActions={(subject) => (
								<SubjectCardActionsStudentsSchoolAdmin
									subjectId={String(subject._id)}
								/>
							)}
						/>
					</div>
				</div>
			</div>
		</div>
	)
}

export default SchooldAdminStudentsScreen
