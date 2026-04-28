import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useSelector } from 'react-redux'
import { useGetSubjectsBySchoolQuery } from '../../slices/admin/schoolAdminApiSlice'
import AdminSidebar from '../../components/AdminSidebar'
import AdminHeader from '../../components/AdminHeader'
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

	const {
		data: subjects = [],
		isLoading,
		isError,
		refetch,
	} = useGetSubjectsBySchoolQuery(schoolId, {
		skip: !schoolId,
	})

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
								All subjects in your school. Add new ones or open
								your school profile.
								{' '}
								<Link to='/schooladmins/createsubject'>
									Add subject
								</Link>
								{' · '}
								<Link to='/schooladmins/myschools'>School profile</Link>
							</p>

							{isLoading && (
								<p className='teacher-subjects-page__subtitle'>
									Loading subjects…
								</p>
							)}

							{isError && !isLoading && (
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

							{!isLoading && !isError && subjects.length === 0 && (
								<div className='teacher-subjects-page__subtitle'>
									<p>No subjects yet.</p>
									<p>
										<Link to='/schooladmins/createsubject'>
											Create your first subject
										</Link>
									</p>
								</div>
							)}

							{!isLoading && !isError && subjects.length > 0 && (
								<div className='teacher-subjects-grid'>
								{subjects.map((subject, index) => {
									const id = String(
										subject._id ?? subject.id ?? index,
									)
									const variant = (index % 5) + 1
									const studentsCount =
										subject.studentCount
										?? (Array.isArray(subject.students)
											? subject.students.length
											: 0)
									const gradeLabel =
										subject.grade != null
											? `Grade ${subject.grade}`
											: 'Grade —'

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
														to={`/schooladmins/editsubject/${id}`}
														className='teacher-subject-card__btn'
													>
														Edit subject
													</Link>
													<Link
														to={`/schooladmins/deletesubject/${id}`}
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
