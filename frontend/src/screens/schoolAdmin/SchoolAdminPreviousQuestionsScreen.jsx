import React, { useEffect, useState } from 'react'
import {
	Link,
	useNavigate,
	useParams,
} from 'react-router-dom'
import { useSelector } from 'react-redux'
import AdminSidebar from '../../components/AdminSidebar'
import AdminHeader from '../../components/AdminHeader'
import {
	useGetSchoolAdminPreviousQuestionsQuery,
} from '../../slices/admin/schoolAdminPreviousQuestionsSlice'
import '../../App.css'

const PAGE_SIZE = 1

const PlayIcon = () => (
	<svg
		width='22'
		height='22'
		viewBox='0 0 24 24'
		fill='#64748b'
		aria-hidden
	>
		<path d='M8 5v14l11-7z' />
	</svg>
)

const PlayIconSmall = () => (
	<svg
		width='14'
		height='14'
		viewBox='0 0 24 24'
		fill='currentColor'
		aria-hidden
	>
		<path d='M8 5v14l11-7z' />
	</svg>
)

const QuestionBadge = () => (
	<svg
		width='28'
		height='28'
		viewBox='0 0 28 28'
		fill='none'
		xmlns='http://www.w3.org/2000/svg'
		className='qa-timeline__badge-svg'
	>
		<circle cx='14' cy='14' r='14' fill='url(#qa-badge-q-sadm)' />
		<text
			x='14'
			y='18.5'
			textAnchor='middle'
			fill='white'
			fontSize='14'
			fontWeight='700'
			fontFamily='Inter, sans-serif'
		>
			?
		</text>
		<defs>
			<linearGradient
				id='qa-badge-q-sadm'
				x1='0'
				y1='0'
				x2='28'
				y2='28'
				gradientUnits='userSpaceOnUse'
			>
				<stop stopColor='#6366f1' />
				<stop offset='1' stopColor='#818cf8' />
			</linearGradient>
		</defs>
	</svg>
)

const AnswerBadge = () => (
	<svg
		width='28'
		height='28'
		viewBox='0 0 28 28'
		fill='none'
		xmlns='http://www.w3.org/2000/svg'
		className='qa-timeline__badge-svg'
	>
		<circle cx='14' cy='14' r='14' fill='url(#qa-badge-a-sadm)' />
		<path
			d='M9 14.5l3.5 3.5L19.5 11'
			stroke='white'
			strokeWidth='2.4'
			strokeLinecap='round'
			strokeLinejoin='round'
		/>
		<defs>
			<linearGradient
				id='qa-badge-a-sadm'
				x1='0'
				y1='0'
				x2='28'
				y2='28'
				gradientUnits='userSpaceOnUse'
			>
				<stop stopColor='#0ea5e9' />
				<stop offset='1' stopColor='#38bdf8' />
			</linearGradient>
		</defs>
	</svg>
)

function isLikelyMongoId (value) {
	return typeof value === 'string' && /^[a-f\d]{24}$/i.test(value)
}

function studentDisplayName (student) {
	if (!student || typeof student !== 'object') {
		return 'Estudiante'
	}
	const parts = [student.firstname, student.lastname].filter(Boolean)
	return parts.length > 0 ? parts.join(' ') : 'Estudiante'
}

function teacherDisplayName (teacher) {
	if (!teacher || typeof teacher !== 'object') {
		return 'Profesor'
	}
	const parts = [teacher.firstname, teacher.lastname].filter(Boolean)
	return parts.length > 0 ? parts.join(' ') : 'Profesor'
}

function formatQaDate (value) {
	if (value == null) {
		return ''
	}
	const d = value instanceof Date ? value : new Date(value)
	if (Number.isNaN(d.getTime())) {
		return ''
	}
	return d.toLocaleDateString('es', {
		year: 'numeric',
		month: 'short',
		day: 'numeric',
	})
}

function questionHasVideo (q) {
	return q?.mediaId != null && String(q.mediaId).trim() !== ''
}

function answerHasVideo (a) {
	return a?.mediaId != null && String(a.mediaId).trim() !== ''
}

function QaTimelineVideoThumb ({ watchTo, ariaLabel }) {
	const inner = (
		<>
			<div className='qa-timeline__video-placeholder'>
				<div className='qa-timeline__video-lines'>
					<div className='qa-timeline__video-line' />
					<div className={
						'qa-timeline__video-line '
						+ 'qa-timeline__video-line--short'
					}
					/>
					<div className='qa-timeline__video-line' />
					<div className={
						'qa-timeline__video-line '
						+ 'qa-timeline__video-line--short'
					}
					/>
				</div>
			</div>
			<div className='qa-timeline__play-overlay'>
				<div className='qa-timeline__play-btn'>
					<PlayIcon />
				</div>
			</div>
		</>
	)
	if (watchTo != null && String(watchTo).trim() !== '') {
		return (
			<Link
				to={watchTo}
				className='qa-timeline__video'
				aria-label={ariaLabel ?? 'Ver video'}
			>
				{inner}
			</Link>
		)
	}
	return (
		<div className='qa-timeline__video'>
			{inner}
		</div>
	)
}

function SchoolAdminPreviousQuestionsScreen () {
	const navigate = useNavigate()
	const { subjectId } = useParams()
	const { schoolAdminInfo } = useSelector((state) => state.authSchoolAdmin)

	const subjectQuery =
		subjectId != null && isLikelyMongoId(String(subjectId))
			? String(subjectId)
			: undefined

	const [currentPage, setCurrentPage] = useState(1)

	const {
		data,
		isLoading,
		isError,
		error,
		refetch,
	} = useGetSchoolAdminPreviousQuestionsQuery(
		{
			page: currentPage,
			limit: PAGE_SIZE,
			subject: subjectQuery,
		},
		{ skip: !schoolAdminInfo || subjectQuery == null },
	)

	const items = Array.isArray(data?.items) ? data.items : []
	const totalPages =
		data?.pages != null && data.pages > 0 ? data.pages : 0
	const total = data?.total ?? 0
	const convo = items[0]
	const answerDoc =
		convo?.answer != null && typeof convo.answer === 'object'
			? convo.answer
			: null
	const showTimeline =
		convo != null && questionHasVideo(convo)
	const hasAnswerVideo =
		answerDoc != null && answerHasVideo(answerDoc)

	useEffect(() => {
		if (!schoolAdminInfo) {
			navigate('/schooladmins/login', { replace: true })
		}
	}, [schoolAdminInfo, navigate])

	useEffect(() => {
		if (totalPages > 0 && currentPage > totalPages) {
			setCurrentPage(totalPages)
		}
	}, [currentPage, totalPages])

	const [isSidebarOpen, setIsSidebarOpen] = useState(
		window.innerWidth > 768,
	)

	const toggleSidebar = () => {
		setIsSidebarOpen(!isSidebarOpen)
	}

	if (!schoolAdminInfo) {
		return null
	}

	const errorMessage =
		error?.data?.message || error?.error
			|| 'No se pudieron cargar las preguntas anteriores.'

	const subjectTitle =
		convo?.subject && typeof convo.subject === 'object'
			? convo.subject.title
			: null

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
						<div className='center-content3'>
							<div className='qa-timeline-page qa-timeline-page--student'>
								<h1 className='qa-timeline-page__title heading-gradient'>
									Preguntas y respuestas
								</h1>
								<p className='qa-timeline-page__subtitle'>
									{subjectTitle != null ? (
										<>
											Preguntas anteriores de{' '}
											<strong>{subjectTitle}</strong>,
											incluyendo las que aún esperan
											una respuesta.
										</>
									) : subjectQuery != null ? (
										'Preguntas anteriores de esta materia, '
										+ 'incluyendo las que aún esperan '
										+ 'una respuesta.'
									) : (
										'Se necesita una materia válida para ver '
										+ 'las preguntas y respuestas.'
									)}
								</p>

								{subjectQuery == null && (
									<p className='answers-heading' style={{
										marginTop: '1rem',
										textAlign: 'center',
										width: '100%',
									}}
									>
										Enlace de materia no válido. Abre esta
										página desde tu{' '}
										<Link to='/schooladmins/mysubjects'>
											lista de materias
										</Link>
										.
									</p>
								)}

								{subjectQuery != null && isLoading && (
									<p className='answers-heading' style={{
										marginTop: '1rem',
										textAlign: 'center',
										width: '100%',
									}}
									>
										Cargando…
									</p>
								)}

								{subjectQuery != null && isError && (
									<div style={{
										marginTop: '1rem',
										textAlign: 'center',
										width: '100%',
									}}
									>
										<p className='answers-heading'>
											{errorMessage}
										</p>
										<button
											type='button'
											className='pagination-btn active'
											style={{ marginTop: '0.75rem' }}
											onClick={() => refetch()}
										>
											Intentar de nuevo
										</button>
									</div>
								)}

								{subjectQuery != null
									&& !isLoading
									&& !isError
									&& total === 0 && (
									<p className='answers-heading' style={{
										marginTop: '1rem',
										textAlign: 'center',
										width: '100%',
									}}
									>
										Aún no hay preguntas grabadas para esta
										materia. Cuando un estudiante haga una
										pregunta con video, aparecerá aquí.
									</p>
								)}

								{subjectQuery != null
									&& !isLoading
									&& !isError
									&& showTimeline && (
									<div className='qa-timeline'>
										<div className='qa-timeline__pair'>
											<div className={
												'qa-timeline__card '
												+ 'qa-timeline__card--question'
											}
											>
												<span className={
													'qa-timeline__tag '
													+ 'qa-timeline__tag--question'
												}
												>
													{subjectTitle ?? 'Materia'}
												</span>
												<h3 className='qa-timeline__card-title'>
													{convo.title}
												</h3>
												<QaTimelineVideoThumb
													watchTo={
														`/schooladmins/watchquestion/${
															String(convo._id)
														}`
													}
													ariaLabel='Ver video de la pregunta'
												/>
												{convo.description != null
													&& String(convo.description)
														.trim() !== '' && (
													<p className={
														'qa-timeline__card-text'
													}
													>
														{convo.description}
													</p>
												)}
												<span className='qa-timeline__meta'>
													{studentDisplayName(
														convo.student,
													)}
													{' · '}
													{formatQaDate(
														convo.dateCreated,
													)}
												</span>
												<Link
													to={
														`/schooladmins/watchquestion/${
															String(convo._id)
														}`
													}
													className={
														'qa-timeline__watch '
														+ 'qa-timeline__watch--question'
													}
												>
													Mira la pregunta
													<PlayIconSmall />
												</Link>
											</div>

											<div className={
												'qa-timeline__connector'
											}
											>
												<div className={
													'qa-timeline__badge'
												}
												>
													<QuestionBadge />
												</div>
												<div className={
													'qa-timeline__line'
												}
												/>
												<div className={
													'qa-timeline__badge'
												}
												>
													<AnswerBadge />
												</div>
											</div>

											<div className={
												'qa-timeline__card '
												+ 'qa-timeline__card--answer'
											}
											>
												<span className={
													'qa-timeline__tag '
													+ 'qa-timeline__tag--answer'
												}
												>
													{hasAnswerVideo
														? 'Respuesta del profesor'
														: 'Esperando respuesta'}
												</span>
												{hasAnswerVideo ? (
													<QaTimelineVideoThumb
														watchTo={
															`/schooladmins/watchanswer/${
																String(
																	answerDoc._id,
																)
															}`
														}
														ariaLabel='Ver video de la respuesta'
													/>
												) : null}
												{hasAnswerVideo ? (
													<>
														{answerDoc.description
															!= null
															&& String(
																answerDoc.description,
															).trim() !== '' && (
															<p className={
																'qa-timeline__card-text'
															}
															>
																{
																	answerDoc.description
																}
															</p>
														)}
														<span className={
															'qa-timeline__meta'
														}
														>
															{teacherDisplayName(
																answerDoc.teacher,
															)}
															{' · '}
															{formatQaDate(
																answerDoc.dateCreated,
															)}
														</span>
														<Link
															to={
																'/schooladmins/watchanswer/'
																+ String(
																	answerDoc._id,
																)
															}
															className={
																'qa-timeline__watch '
																+ 'qa-timeline__watch--answer'
															}
														>
															Mira la respuesta
															<PlayIconSmall />
														</Link>
													</>
												) : (
													<p className={
														'qa-timeline__card-text '
														+ 'qa-timeline__card-text--pending'
													}
													>
														El profesor aún no ha
														publicado una respuesta
														en video. Vuelve a
														consultar aquí cuando
														lo haga.
													</p>
												)}
											</div>
										</div>
									</div>
								)}

								{subjectQuery != null
									&& !isLoading
									&& !isError
									&& totalPages > 1 && (
									<div className={
										'pagination pagination--answers'
									}
									style={{ marginTop: '1.5rem' }}
									>
										{Array.from(
											{ length: totalPages },
											(_, i) => i + 1,
										).map((page) => (
											<button
												key={page}
												type='button'
												className={
													'pagination-btn '
													+ (currentPage === page
														? 'active'
														: '')
												}
												onClick={() => setCurrentPage(
													page,
												)}
											>
												{page}
											</button>
										))}
									</div>
								)}

								{subjectQuery != null && (
									<p style={{
										marginTop: '1.5rem',
										textAlign: 'center',
										width: '100%',
									}}
									>
										
									</p>
								)}
							</div>
						</div>
					</div>
				</div>
			</div>
		</div>
	)
}

export default SchoolAdminPreviousQuestionsScreen
