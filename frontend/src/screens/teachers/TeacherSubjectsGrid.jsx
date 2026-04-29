import { Link } from 'react-router-dom'
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

const StudentsIcon = () => (
	<svg
		width='14'
		height='14'
		viewBox='0 0 24 24'
		fill='none'
		stroke='currentColor'
		strokeWidth='2'
		strokeLinecap='round'
		strokeLinejoin='round'
	>
		<path d='M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2' />
		<circle cx='9' cy='7' r='4' />
		<path d='M23 21v-2a4 4 0 0 0-3-3.87' />
		<path d='M16 3.13a4 4 0 0 1 0 7.75' />
	</svg>
)

export function subjectGradeLabel (subject) {
	if (subject.grade != null && !Number.isNaN(Number(subject.grade))) {
		return `Grade ${subject.grade}`
	}
	return 'All grades'
}

/**
 * Shared subject cards grid (loading / error / empty / list).
 * @param {object} props
 * @param {string} props.pageTitle
 * @param {string} props.pageSubtitle
 * @param {string} props.emptyMessage
 * @param {Array} props.subjects
 * @param {boolean} props.isLoading
 * @param {boolean} props.isError
 * @param {() => void} props.refetch
 * @param {(subject: object, index: number) => import('react').ReactNode} props.renderCardActions
 */
export function TeacherSubjectsGrid ({
	pageTitle,
	pageSubtitle,
	emptyMessage,
	subjects = [],
	isLoading,
	isError,
	refetch,
	renderCardActions,
}) {
	return (
		<div className='teacher-subjects-page'>
			<h1 className='teacher-subjects-page__title heading-gradient'>
				{pageTitle}
			</h1>
			<p className='teacher-subjects-page__subtitle'>
				{pageSubtitle}
			</p>

			{isLoading ? (
				<p className='teacher-subjects-page__subtitle'>
					Loading subjects…
				</p>
			) : isError ? (
				<div>
					<p className='teacher-subjects-page__subtitle'>
						We couldn&apos;t load your subjects. Try again in a
						moment.
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
					{emptyMessage}
				</p>
			) : (
				<div className='teacher-subjects-grid'>
					{subjects.map((subject, index) => {
						const id = String(subject._id)
						const variant = (index % 5) + 1
						const studentsCount = Number(subject.studentCount) || 0
						const gradeLabel = subjectGradeLabel(subject)
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
									{renderCardActions(subject, index)}
								</div>
							</article>
						)
					})}
				</div>
			)}
		</div>
	)
}

/** Default action row for My Subjects screen */
export function SubjectCardActionsDefault ({ subjectId }) {
	return (
		<div className='teacher-subject-card__row'>
			<Link
				to={`/teachers/subjects/${subjectId}/edit`}
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
	)
}

/** Action row for Students by subject picker */
export function SubjectCardActionsStudents ({ subjectId }) {
	return (
		<div className='teacher-subject-card__row'>
			<Link
				to={`/teachers/students/${subjectId}`}
				className='teacher-subject-card__btn'
			>
				View students
			</Link>
			<Link
				to={`/teachers/students/${subjectId}/addstudent`}
				className='teacher-subject-card__btn'
			>
				Add Student
			</Link>
		</div>
	)
}
