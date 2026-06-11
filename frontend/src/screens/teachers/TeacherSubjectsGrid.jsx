import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { subjectGradeLabel } from '../../utils/gradeLevel'
import '../../App.css'

const ChevronLeftIcon = () => (
	<svg
		width='16'
		height='16'
		viewBox='0 0 24 24'
		fill='none'
		stroke='currentColor'
		strokeWidth='2.5'
		strokeLinecap='round'
		strokeLinejoin='round'
		aria-hidden
	>
		<path d='M15 18l-6-6 6-6' />
	</svg>
)

const ChevronRightIcon = () => (
	<svg
		width='16'
		height='16'
		viewBox='0 0 24 24'
		fill='none'
		stroke='currentColor'
		strokeWidth='2.5'
		strokeLinecap='round'
		strokeLinejoin='round'
		aria-hidden
	>
		<path d='M9 18l6-6-6-6' />
	</svg>
)

function SubjectsPagination ({
	currentPage,
	totalPages,
	pageSize,
	totalCount,
	onPageChange,
}) {
	const start = (currentPage - 1) * pageSize + 1
	const end = Math.min(currentPage * pageSize, totalCount)

	return (
		<nav
			className='subjects-pagination'
			aria-label='Subject pages'
		>
			<p className='subjects-pagination__summary'>
				Showing{' '}
				<strong>{start}–{end}</strong>
				{' '}of{' '}
				<strong>{totalCount}</strong>
				{' '}subjects
			</p>
			<div className='subjects-pagination__controls'>
				<button
					type='button'
					className='subjects-pagination__nav'
					onClick={() => onPageChange(currentPage - 1)}
					disabled={currentPage <= 1}
					aria-label='Previous page'
				>
					<ChevronLeftIcon />
					<span>Prev</span>
				</button>
				<div className='subjects-pagination__pages'>
					{Array.from({ length: totalPages }, (_, i) => i + 1).map(
						(page) => (
							<button
								key={page}
								type='button'
								className={
									'subjects-pagination__page' +
									(currentPage === page
										? ' subjects-pagination__page--active'
										: '')
								}
								onClick={() => onPageChange(page)}
								aria-label={`Page ${page}`}
								aria-current={
									currentPage === page ? 'page' : undefined
								}
							>
								{page}
							</button>
						),
					)}
				</div>
				<button
					type='button'
					className='subjects-pagination__nav'
					onClick={() => onPageChange(currentPage + 1)}
					disabled={currentPage >= totalPages}
					aria-label='Next page'
				>
					<span>Next</span>
					<ChevronRightIcon />
				</button>
			</div>
		</nav>
	)
}

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
 * @param {import('react').ReactNode} [props.afterSubtitle]
 * @param {number} [props.pageSize] — when set, paginate the grid
 */
export function TeacherSubjectsGrid ({
	pageTitle,
	pageSubtitle,
	afterSubtitle,
	emptyMessage,
	subjects = [],
	isLoading,
	isError,
	refetch,
	renderCardActions,
	pageSize,
}) {
	const [currentPage, setCurrentPage] = useState(1)

	const shouldPaginate = Boolean(
		pageSize && pageSize > 0 && subjects.length > pageSize,
	)

	const totalPages = shouldPaginate
		? Math.ceil(subjects.length / pageSize)
		: 1

	useEffect(() => {
		if (currentPage > totalPages) {
			setCurrentPage(totalPages)
		}
	}, [currentPage, totalPages])

	useEffect(() => {
		setCurrentPage(1)
	}, [subjects.length, pageSize])

	const displayedSubjects = useMemo(() => {
		if (!shouldPaginate) {
			return subjects
		}
		const start = (currentPage - 1) * pageSize
		return subjects.slice(start, start + pageSize)
	}, [subjects, currentPage, pageSize, shouldPaginate])

	const handlePageChange = (page) => {
		setCurrentPage(page)
		window.scrollTo({ top: 0, behavior: 'smooth' })
	}

	return (
		<div className='teacher-subjects-page'>
			<h1 className='teacher-subjects-page__title heading-gradient'>
				{pageTitle}
			</h1>
			<p className='teacher-subjects-page__subtitle'>
				{pageSubtitle}
			</p>
			{afterSubtitle ? afterSubtitle : null}

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
				<>
				<div className='teacher-subjects-grid'>
					{displayedSubjects.map((subject, index) => {
						const id = String(subject._id)
						const globalIndex = shouldPaginate
							? (currentPage - 1) * pageSize + index
							: index
						const variant = (globalIndex % 5) + 1
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
									{renderCardActions(subject, globalIndex)}
								</div>
							</article>
						)
					})}
				</div>
				{shouldPaginate ? (
					<SubjectsPagination
						currentPage={currentPage}
						totalPages={totalPages}
						pageSize={pageSize}
						totalCount={subjects.length}
						onPageChange={handlePageChange}
					/>
				) : null}
				</>
			)}
		</div>
	)
}

/** Default action row for My Subjects screen */
export function SubjectCardActionsDefault ({ subjectId }) {
	return (
		<div className='teacher-subject-card__row'>
			<Link
				to={`/teachers/courses/${subjectId}`}
				className='teacher-subject-card__btn'
			>
				Courses
			</Link>
			<Link
				to={`/teachers/subjects/${subjectId}/edit`}
				className='teacher-subject-card__btn'
			>
				Edit Subject
			</Link>
			<Link
				to={`/teachers/previousquestions/${subjectId}`}
				className='teacher-subject-card__btn'
			>
				Previous Questions
			</Link>
		</div>
	)
}

/** Action row for Students by subject picker */
export function SubjectCardActionsStudents ({ subjectId }) {
	return (
		<div className={
			'teacher-subject-card__row '
			+ 'teacher-subject-card__row--center'
		}
		>
			<Link
				to={`/teachers/students/${subjectId}`}
				className={
					'teacher-subject-card__btn '
					+ 'teacher-subject-card__btn--wide'
				}
			>
				View students
			</Link>
		</div>
	)
}

/** Action row for school admin Students by subject picker */
export function SubjectCardActionsStudentsSchoolAdmin ({ subjectId }) {
	return (
		<div className={
			'teacher-subject-card__row '
			+ 'teacher-subject-card__row--center'
		}
		>
			<Link
				to={`/schooladmins/students/${subjectId}`}
				className={
					'teacher-subject-card__btn '
					+ 'teacher-subject-card__btn--wide'
				}
			>
				View students
			</Link>
		</div>
	)
}
