import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { getSubjectCohortLabel } from '../../utils/universityProgram'
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
	copy,
}) {
	const start = (currentPage - 1) * pageSize + 1
	const end = Math.min(currentPage * pageSize, totalCount)

	return (
		<nav
			className='subjects-pagination'
			aria-label={copy.paginationAria}
		>
			<p className='subjects-pagination__summary'>
				{copy.showing}{' '}
				<strong>{start}–{end}</strong>
				{' '}{copy.of}{' '}
				<strong>{totalCount}</strong>
				{' '}{copy.subjects}
			</p>
			<div className='subjects-pagination__controls'>
				<button
					type='button'
					className='subjects-pagination__nav'
					onClick={() => onPageChange(currentPage - 1)}
					disabled={currentPage <= 1}
					aria-label={copy.prev}
				>
					<ChevronLeftIcon />
					<span>{copy.prev}</span>
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
								aria-label={`${copy.pageAriaPrefix} ${page}`}
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
					aria-label={copy.next}
				>
					<span>{copy.next}</span>
					<ChevronRightIcon />
				</button>
			</div>
		</nav>
	)
}

const DEFAULT_GRID_COPY = {
	loading: 'Cargando materias…',
	error:
		'No pudimos cargar tus materias. '
		+ 'Intenta de nuevo en un momento.',
	retry: 'Intentar de nuevo',
	students: 'estudiantes',
	published: 'Publicado',
	draft: 'Borrador',
	paginationAria: 'Páginas de materias',
	showing: 'Mostrando',
	of: 'de',
	subjects: 'materias',
	prev: 'Anterior',
	next: 'Siguiente',
	pageAriaPrefix: 'Página',
	noTeacher: 'Sin profesor',
	teacherPrefix: 'profesor  ',
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

const TeacherIcon = () => (
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
		<path d='M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2' />
		<circle cx='12' cy='7' r='4' />
	</svg>
)

function getSubjectTeacherLabel (subject, fallback) {
	const teachers = Array.isArray(subject?.teachers)
		? subject.teachers
		: []
	const names = teachers
		.map((teacher) => {
			if (!teacher || typeof teacher !== 'object') {
				return ''
			}
			return [teacher.firstname, teacher.lastname]
				.filter(Boolean)
				.join(' ')
				.trim()
		})
		.filter(Boolean)

	if (names.length > 0) {
		return names.join(', ')
	}

	return fallback
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
 * @param {import('react').ReactNode} [props.afterSubtitle]
 * @param {function} [props.getSubjectMetaLabel] — card meta line; defaults
 *   to program + semester for university subjects, otherwise grade
 * @param {boolean} [props.isUniversity] — prefer program labels when the
 *   school is a university even if a subject has no program yet
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
	getSubjectMetaLabel,
	isUniversity = false,
	pageSize,
	copy: copyProp,
	showStudentCount = true,
	showSubjectMeta = true,
	showTeacherName = false,
}) {
	const copy = { ...DEFAULT_GRID_COPY, ...copyProp }
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
					{copy.loading}
				</p>
			) : isError ? (
				<div>
					<p className='teacher-subjects-page__subtitle'>
						{copy.error}
					</p>
					<button
						type='button'
						className='login-submit'
						style={{ maxWidth: 200, marginTop: 12 }}
						onClick={() => void refetch()}
					>
						{copy.retry}
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
						const metaLabel = getSubjectMetaLabel
							? getSubjectMetaLabel(subject)
							: getSubjectCohortLabel(subject, {
								isUniversity,
							})
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
										{showStudentCount ? (
											<span className='teacher-subject-card__students'>
												<StudentsIcon />
												{studentsCount} {copy.students}
											</span>
										) : null}
										{showTeacherName ? (
											<span className={
												'teacher-subject-card__teacher '
												+ 'teacher-subject-card__teacher--stacked'
											}
											>
												<span className={
													'teacher-subject-card__teacher-label'
												}
												>
													<TeacherIcon />
													{copy.teacherPrefix}
												</span>
												<span className={
													'teacher-subject-card__teacher-name'
												}
												>
													{getSubjectTeacherLabel(
														subject,
														copy.noTeacher,
													)}
												</span>
											</span>
										) : null}
										{showSubjectMeta ? (
											<p className='teacher-subject-card__meta'>
												{metaLabel}
												{subject.isCoursePublish
													? ` · ${copy.published}`
													: ` · ${copy.draft}`}
											</p>
										) : null}
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
						copy={copy}
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
				Cursos
			</Link>
			<Link
				to={`/teachers/subjects/${subjectId}/edit`}
				className='teacher-subject-card__btn'
			>
				Editar materia
			</Link>
			<Link
				to={`/teachers/previousquestions/${subjectId}`}
				className='teacher-subject-card__btn'
			>
				Preguntas anteriores
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
				Ver estudiantes
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
				Ver estudiantes
			</Link>
		</div>
	)
}
