import React, { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useSelector } from 'react-redux'
import TeacherSidebar from '../../components/TeacherSidebar'
import TeacherHeader from '../../components/TeacherHeader'
import { useGetSubjectStudentsForTeacherQuery } from '../../slices/teachers/teacherApiSlice'
import '../../App.css'

const OBJECT_ID_RE = /^[a-f\d]{24}$/i

const AvatarIcon = ({ name }) => {
	const initials = name
		.split(' ')
		.map((w) => w[0])
		.join('')
		.slice(0, 2)
		.toUpperCase()

	return (
		<div className='ts-avatar' aria-hidden>
			{initials}
		</div>
	)
}

const StatusDot = ({ isActive }) => (
	<span
		className={`ts-status-dot ${isActive ? 'ts-status-dot--active' : 'ts-status-dot--inactive'}`}
	>
		{isActive ? 'Active' : 'Inactive'}
	</span>
)

function TeacherStudentsScreen () {
	const navigate = useNavigate()
	const { id: subjectId } = useParams()
	const { teacherInfo } = useSelector((state) => state.authTeacher)

	const [isSidebarOpen, setIsSidebarOpen] = useState(
		window.innerWidth > 768,
	)
	const [searchTerm, setSearchTerm] = useState('')

	const isValidSubjectId =
		typeof subjectId === 'string' && OBJECT_ID_RE.test(subjectId)

	const {
		data,
		isLoading,
		isError,
		error,
		refetch,
	} = useGetSubjectStudentsForTeacherQuery(subjectId, {
		skip: !isValidSubjectId,
	})

	const studentsList = data?.students ?? []
	const subjectTitle = data?.subject?.title ?? ''

	const toggleSidebar = () => {
		setIsSidebarOpen(!isSidebarOpen)
	}

	useEffect(() => {
		if (!teacherInfo) {
			navigate('/teachers/login', { replace: true })
		}
	}, [teacherInfo, navigate])

	const filteredStudents = studentsList.filter((s) => {
		const q = searchTerm.toLowerCase()
		const name = (s.name || '').toLowerCase()
		const email = (s.email || '').toLowerCase()
		const sub = (subjectTitle || '').toLowerCase()
		return (
			name.includes(q) ||
			email.includes(q) ||
			sub.includes(q)
		)
	})

	const activeCount = studentsList.filter((s) => s.isActive).length

	if (!teacherInfo) {
		return null
	}

	if (!isValidSubjectId) {
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
							<p className='ts-page__subtitle'>Invalid subject link.</p>
						</div>
					</div>
				</div>
			</div>
		)
	}

	const errMessage =
		isError && error?.data?.message
			? String(error.data.message)
			: isError
				? 'Could not load students.'
				: ''

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
						<div className='ts-page'>
							<h1 className='ts-page__title heading-gradient'>
								My Students
							</h1>
							<p className='ts-page__subtitle'>
								{subjectTitle && (
									<>
										<span>{subjectTitle}</span>
										{' · '}
									</>
								)}
								{studentsList.length} students enrolled &middot;{' '}
								{activeCount} active
							</p>

							{isLoading && (
								<p className='ts-page__subtitle'>Loading…</p>
							)}

							{isError && (
								<div className='ts-table-wrapper'>
									<p className='ts-page__subtitle'>{errMessage}</p>
									<button
										type='button'
										className='teacher-subject-card__btn'
										onClick={() => refetch()}
									>
										Retry
									</button>
								</div>
							)}

							{!isLoading && !isError && (
								<>
									<div className='ts-search-bar'>
										<svg
											className='ts-search-bar__icon'
											width='18'
											height='18'
											viewBox='0 0 24 24'
											fill='none'
											stroke='#94a3b8'
											strokeWidth='2'
											strokeLinecap='round'
											strokeLinejoin='round'
										>
											<circle cx='11' cy='11' r='8' />
											<path d='M21 21l-4.35-4.35' />
										</svg>
										<input
											type='text'
											className='ts-search-bar__input'
											placeholder='Search by name, email…'
											value={searchTerm}
											onChange={(e) => setSearchTerm(e.target.value)}
										/>
									</div>

									<div className='ts-table-wrapper'>
										<table className='ts-table'>
											<thead>
												<tr>
													<th>Student</th>
													<th>Subject</th>
													<th>Questions</th>
													<th>Status</th>
													<th>Joined</th>
												</tr>
											</thead>
											<tbody>
												{filteredStudents.map((student) => (
													<tr key={student._id}>
														<td>
															<div className='ts-student-cell'>
																<AvatarIcon name={student.name} />
																<div>
																	<span className='ts-student-name'>
																		{student.name}
																	</span>
																	<span className='ts-student-email'>
																		{student.email}
																	</span>
																</div>
															</div>
														</td>
														<td>
															<span className='ts-subject-tag'>
																{subjectTitle || '—'}
															</span>
														</td>
														<td>
															<span className='ts-questions-count'>
																{student.questionsAsked}
															</span>
														</td>
														<td>
															<StatusDot isActive={student.isActive} />
														</td>
														<td>
															<span className='ts-date'>
																{student.joinedDate || '—'}
															</span>
														</td>
													</tr>
												))}
												{filteredStudents.length === 0 && (
													<tr>
														<td colSpan='5' className='ts-empty'>
															{studentsList.length === 0
																? 'No students enrolled yet.'
																: 'No students match your search'}
														</td>
													</tr>
												)}
											</tbody>
										</table>
									</div>
								</>
							)}
						</div>
					</div>
				</div>
			</div>
		</div>
	)
}

export default TeacherStudentsScreen
