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

/**
 * Course list for a subject (same visual language as TeacherSubjectsGrid).
 */
export function TeacherCoursesGrid ({
	pageTitle,
	pageSubtitle,
	backLink,
	emptyMessage,
	courses = [],
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
			{backLink ? (
				<p className='teacher-subjects-page__subtitle'>
					<Link to={backLink.to}>{backLink.label}</Link>
				</p>
			) : null}

			{isLoading ? (
				<p className='teacher-subjects-page__subtitle'>
					Loading courses…
				</p>
			) : isError ? (
				<div>
					<p className='teacher-subjects-page__subtitle'>
						We couldn&apos;t load courses for this subject. You may
						not have access, or there was a network issue.
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
			) : courses.length === 0 ? (
				<p className='teacher-subjects-page__subtitle'>
					{emptyMessage}
				</p>
			) : (
				<div className='teacher-subjects-grid'>
					{courses.map((course, index) => {
						const id = String(course._id)
						const variant = (index % 5) + 1
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
											{course.title}
										</h2>
										<p className='teacher-subject-card__meta'>
											{course.isPublish
												? 'Published'
												: 'Draft'}
										</p>
									</div>
									<div className='teacher-subject-card__badge'>
										<GradCapIcon />
									</div>
								</div>

								{course.description ? (
									<p className='teacher-subject-card__excerpt'>
										{course.description}
									</p>
								) : null}

								{typeof renderCardActions === 'function' ? (
									<>
										<div className='teacher-subject-card__divider' />
										<div className='teacher-subject-card__actions'>
											{renderCardActions(course, index)}
										</div>
									</>
								) : null}
							</article>
						)
					})}
				</div>
			)}
		</div>
	)
}
