import React, { useState } from 'react'
import TeacherSidebar from '../../components/TeacherSidebar'
import TeacherHeader from '../../components/TeacherHeader'
import '../../App.css'

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

const students = [
	{
		id: 1,
		name: 'Mark Amstrong',
		email: 'mark.amstrong@email.com',
		subject: 'LinkedIn Marketing',
		questionsAsked: 8,
		isActive: true,
		joinedDate: '2025-08-12',
	},
	{
		id: 2,
		name: 'Sara Lopez',
		email: 'sara.lopez@email.com',
		subject: 'LinkedIn Marketing',
		questionsAsked: 5,
		isActive: true,
		joinedDate: '2025-09-03',
	},
	{
		id: 3,
		name: 'James Chen',
		email: 'james.chen@email.com',
		subject: 'Email Marketing',
		questionsAsked: 12,
		isActive: true,
		joinedDate: '2025-07-20',
	},
	{
		id: 4,
		name: 'Emily Watson',
		email: 'emily.w@email.com',
		subject: 'Algebra I',
		questionsAsked: 3,
		isActive: false,
		joinedDate: '2025-10-01',
	},
	{
		id: 5,
		name: 'Carlos Rivera',
		email: 'carlos.r@email.com',
		subject: 'Biology',
		questionsAsked: 7,
		isActive: true,
		joinedDate: '2025-08-28',
	},
	{
		id: 6,
		name: 'Priya Patel',
		email: 'priya.patel@email.com',
		subject: 'Spanish Conversation',
		questionsAsked: 2,
		isActive: false,
		joinedDate: '2025-11-05',
	},
]

function TeacherStudentsScreen () {
	const [isSidebarOpen, setIsSidebarOpen] = useState(
		window.innerWidth > 768,
	)
	const [searchTerm, setSearchTerm] = useState('')

	const toggleSidebar = () => {
		setIsSidebarOpen(!isSidebarOpen)
	}

	const filteredStudents = students.filter((s) =>
		s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
		s.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
		s.subject.toLowerCase().includes(searchTerm.toLowerCase()),
	)

	const activeCount = students.filter((s) => s.isActive).length

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
								{students.length} students enrolled &middot; {activeCount} active
							</p>

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
									placeholder='Search by name, email, or subject...'
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
											<tr key={student.id}>
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
														{student.subject}
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
														{student.joinedDate}
													</span>
												</td>
											</tr>
										))}
										{filteredStudents.length === 0 && (
											<tr>
												<td colSpan='5' className='ts-empty'>
													No students match your search
												</td>
											</tr>
										)}
									</tbody>
								</table>
							</div>
						</div>
					</div>
				</div>
			</div>
		</div>
	)
}

export default TeacherStudentsScreen
