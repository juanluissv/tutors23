import { createPortal } from 'react-dom'
import '../screens/students/StudentLessonPageScreen.css'

export const SparklesIcon = ({ size = 18 }) => (
	<svg
		width={size}
		height={size}
		viewBox='0 0 24 24'
		fill='none'
		stroke='currentColor'
		strokeWidth='2'
		strokeLinecap='round'
		strokeLinejoin='round'
		aria-hidden
	>
		<path d='M12 3l1.4 4.2L18 8.6l-4.6 1.4L12 14.2l-1.4-4.2L6 8.6l4.6-1.4L12 3z' />
		<path d='M19 14l.7 2 2 .7-2 .7-.7 2-.7-2-2-.7 2-.7.7-2z' />
		<path d='M5 15l.6 1.6L7.2 17.2l-1.6.6L5 19.4l-.6-1.6L2.8 17.2l1.6-.6L5 15z' />
	</svg>
)

function SuggestedQuestionsPanel ({
	lessonTitle,
	questions,
	expandedIndex,
	onToggle,
	onClose,
}) {
	return createPortal(
		<div
			className='lesson-doc-questions-overlay'
			onClick={onClose}
			role='presentation'
		>
			<div
				className='lesson-doc-questions-modal'
				role='dialog'
				aria-modal='true'
				aria-labelledby='lesson-doc-questions-title'
				onClick={(event) => event.stopPropagation()}
			>
				<div className='lesson-doc-questions-modal__hero'>
					<div className='lesson-doc-questions-modal__glow' aria-hidden />
					<button
						type='button'
						className='lesson-doc-questions-modal__close'
						onClick={onClose}
						aria-label='Cerrar preguntas sugeridas'
					>
						<svg
							width='18'
							height='18'
							viewBox='0 0 24 24'
							fill='none'
							stroke='currentColor'
							strokeWidth='2.2'
							strokeLinecap='round'
						>
							<line x1='18' y1='6' x2='6' y2='18' />
							<line x1='6' y1='6' x2='18' y2='18' />
						</svg>
					</button>
					<span className='lesson-doc-questions-modal__icon'>
						<SparklesIcon size={22} />
					</span>
					<p className='lesson-doc-questions-modal__kicker'>
						Para practicar esta lección
					</p>
					<h2
						id='lesson-doc-questions-title'
						className='lesson-doc-questions-modal__title'
					>
						Preguntas sugeridas
					</h2>
					{lessonTitle ? (
						<p className='lesson-doc-questions-modal__subtitle'>
							{lessonTitle}
						</p>
					) : null}
					<span className='lesson-doc-questions-modal__count'>
						{questions.length}{' '}
						{questions.length === 1
							? 'pregunta'
							: 'preguntas'}
					</span>
				</div>
				<div
					className='lesson-doc-questions-modal__list'
					role='list'
					aria-label='Preguntas sugeridas de la lección'
				>
					{questions.map((item, index) => {
						const isOpen = expandedIndex === index
						return (
							<div
								key={`${index}-${item.question.slice(0, 24)}`}
								className={
									'lesson-doc-questions-card'
									+ (isOpen
										? ' lesson-doc-questions-card--open'
										: '')
								}
								role='listitem'
							>
								<button
									type='button'
									className='lesson-doc-questions-card__head'
									onClick={() => onToggle(index)}
									aria-expanded={isOpen}
								>
									<span
										className='lesson-doc-questions-card__index'
										aria-hidden
									>
										{index + 1}
									</span>
									<span className='lesson-doc-questions-card__question'>
										{item.question}
									</span>
									<span
										className={
											'lesson-doc-questions-card__chevron'
											+ (isOpen
												? ' lesson-doc-questions-card__chevron--open'
												: '')
										}
										aria-hidden
									>
										<svg
											width='16'
											height='16'
											viewBox='0 0 24 24'
											fill='none'
											stroke='currentColor'
											strokeWidth='2.2'
											strokeLinecap='round'
											strokeLinejoin='round'
										>
											<polyline points='6 9 12 15 18 9' />
										</svg>
									</span>
								</button>
								{isOpen ? (
									<div className='lesson-doc-questions-card__body'>
										{item.answer ? (
											<div className='lesson-doc-questions-answer'>
												<p className='lesson-doc-questions-answer__label'>
													Respuesta
												</p>
												<p className='lesson-doc-questions-answer__text'>
													{item.answer}
												</p>
											</div>
										) : (
											<p className='lesson-doc-questions-answer__empty'>
												Esta pregunta aún no tiene
												respuesta.
											</p>
										)}
									</div>
								) : null}
							</div>
						)
					})}
				</div>
			</div>
		</div>,
		document.body,
	)
}

export default SuggestedQuestionsPanel
