import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useSelector } from 'react-redux'
import TeacherSidebar from '../../components/TeacherSidebar'
import TeacherHeader from '../../components/TeacherHeader'
import { useGetSubjectsByTeacherIdQuery } from '../../slices/teachers/teacherApiSlice'
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

function subjectGradeLabel (subject) {
	if (subject.grade != null && !Number.isNaN(Number(subject.grade))) {
		return `Grade ${subject.grade}`
	}
	return 'All grades'
}

function TeacherSubjectsScreen () {
	const navigate = useNavigate()
	const { teacherInfo } = useSelector((state) => state.authTeacher)
	const teacherId = teacherInfo?._id
		? String(teacherInfo._id)
		: null

	const {
		data: subjects = [],
		isLoading,
		isError,
		refetch,
	} = useGetSubjectsByTeacherIdQuery(teacherId, { skip: !teacherId })

	const [isSidebarOpen, setIsSidebarOpen] = useState(
		window.innerWidth > 768,
	)

	const toggleSidebar = () => {
		setIsSidebarOpen(!isSidebarOpen)
	}

	useEffect(() => {
		if (!teacherInfo) {
			navigate('/teachers/login', { replace: true })
		}
	}, [teacherInfo, navigate])

	if (!teacherInfo) {
		return null
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
					<div className='content-area'>
						<div className='teacher-subjects-page'>
							<h1 className='teacher-subjects-page__title heading-gradient'>
								My Subjects
							</h1>
							<p className='teacher-subjects-page__subtitle'>
								Manage your courses, lessons, and past student questions.
							</p>

							{isLoading ? (
								<p className='teacher-subjects-page__subtitle'>
									Loading subjects…
								</p>
							) : isError ? (
								<div>
									<p className='teacher-subjects-page__subtitle'>
										We couldn&apos;t load your subjects. Try
										again in a moment.
									</p>
									<button
										type='button'
										className='login-submit'
										style={{ maxWidth: 200, marginTop: 12 }}
										onClick={() => void refetch()}
									>
										Try again
									</button>
								</div>
							) : subjects.length === 0 ? (
								<p className='teacher-subjects-page__subtitle'>
									You don&apos;t have any subjects yet. When
									a school admin invites you by email, your
									subjects will show up here.
								</p>
							) : (
								<div className='teacher-subjects-grid'>
									{subjects.map((subject, index) => {
										const id = String(subject._id)
										const variant = (index % 5) + 1
										const studentsCount = Number(
											subject.studentCount,
										) || 0
										const gradeLabel = subjectGradeLabel(
											subject,
										)
										return (
											<article
												key={id}
												className={
													'teacher-subject-card ' +
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
															to={`/teachers/subjects/${id}/edit`}
															className='teacher-subject-card__btn'
														>
															Edit Subject
														</Link>
														<Link
															to='/teachers/oldquestions'
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

export default TeacherSubjectsScreen
