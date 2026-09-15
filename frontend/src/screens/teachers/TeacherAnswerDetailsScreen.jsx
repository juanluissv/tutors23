import React, { useEffect, useMemo, useState } from 'react'
import {
	Link,
	useNavigate,
	useSearchParams,
} from 'react-router-dom'
import { useSelector } from 'react-redux'
import { toast } from 'react-toastify'
import TeacherSidebar from '../../components/TeacherSidebar'
import TeacherHeader from '../../components/TeacherHeader'
import { useGetQuestionByIdForTeacherQuery } from '../../slices/teachers/teacherQuestionsSlice'
import { useCreateTeacherAnswerMutation } from '../../slices/teachers/teacherAnswersSlice'
import { localizeApiError } from '../../utils/localizeApiMessage'
import '../../App.css'

const TagIcon = () => (
	<svg
		width='20'
		height='20'
		viewBox='0 0 24 24'
		fill='none'
		xmlns='http://www.w3.org/2000/svg'
		aria-hidden
	>
		<path
			d='M4 4v7.17a2 2 0 00.59 1.42l8.82 8.82a2 2 0 002.83 0l5.17-5.17a2 2 0 000-2.83L12.59 4.59A2 2 0 0011.17 4H4z'
			fill='url(#ans-tag-fill)'
		/>
		<circle cx='8.5' cy='8.5' r='1.5' fill='white' />
		<defs>
			<linearGradient
				id='ans-tag-fill'
				x1='4'
				y1='4'
				x2='22'
				y2='22'
				gradientUnits='userSpaceOnUse'
			>
				<stop stopColor='#818cf8' />
				<stop offset='1' stopColor='#6366f1' />
			</linearGradient>
		</defs>
	</svg>
)

const DescriptionIcon = () => (
	<svg
		width='20'
		height='20'
		viewBox='0 0 24 24'
		fill='none'
		xmlns='http://www.w3.org/2000/svg'
		aria-hidden
	>
		<rect
			x='3'
			y='4'
			width='18'
			height='16'
			rx='3'
			fill='url(#ans-desc-fill)'
		/>
		<path
			d='M7 9h10M7 13h7'
			stroke='white'
			strokeWidth='1.8'
			strokeLinecap='round'
		/>
		<defs>
			<linearGradient
				id='ans-desc-fill'
				x1='3'
				y1='4'
				x2='21'
				y2='20'
				gradientUnits='userSpaceOnUse'
			>
				<stop stopColor='#fb923c' />
				<stop offset='1' stopColor='#f97316' />
			</linearGradient>
		</defs>
	</svg>
)

function isLikelyMongoId (value) {
	return typeof value === 'string' && /^[a-f\d]{24}$/i.test(value)
}

function TeacherAnswerDetailsScreen () {
	const navigate = useNavigate()
	const [searchParams] = useSearchParams()
	const questionIdRaw = searchParams.get('questionId')
	const questionId = questionIdRaw ? String(questionIdRaw).trim() : ''

	const { teacherInfo } = useSelector((state) => state.authTeacher)
	const teacherId = teacherInfo?._id ? String(teacherInfo._id) : null

	const canFetch = isLikelyMongoId(questionId)

	const {
		data: question,
		isLoading: isLoadingQuestion,
		isError: isQuestionError,
		error: questionError,
	} = useGetQuestionByIdForTeacherQuery(questionId, {
		skip: !canFetch,
	})

	const [description, setDescription] = useState('')
	const [createAnswer, { isLoading: isSubmitting }] =
		useCreateTeacherAnswerMutation()

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

	useEffect(() => {
		if (!question) {
			return
		}
		const ans = question.answer
		const text =
			ans && typeof ans === 'object' && typeof ans.description === 'string'
				? ans.description
				: ''
		setDescription(text)
	}, [question])

	const titleDisplay = useMemo(() => {
		if (!question?.title) {
			return ''
		}
		return String(question.title)
	}, [question])

	const watchBackHref = questionId
		? `/teachers/watchnew?questionId=${encodeURIComponent(questionId)}`
		: '/teachers/watchnew'

	const questionErrorMessage = localizeApiError(
		questionError,
		'No se pudo cargar esta pregunta.',
	)

	const handleSubmit = async (e) => {
		e.preventDefault()
		if (!canFetch) {
			toast.error('Falta la pregunta o no es válida.')
			return
		}
		const body = String(description ?? '').trim()
		if (!body) {
			toast.error(
				'Por favor escribe una descripción para tu respuesta.',
			)
			return
		}
		try {
			const saved = await createAnswer({
				questionId,
				description: body,
				teacherId,
			}).unwrap()
			const answerId = saved?._id
			toast.success('Respuesta guardada.')
			if (answerId != null && String(answerId).trim() !== '') {
				navigate(`/teachers/answer/${String(answerId)}`)
			} else {
				navigate('/teachers/newquestions')
			}
		} catch (err) {
			toast.error(
				localizeApiError(err, 'No se pudo guardar la respuesta.'),
			)
		}
	}

	if (!teacherInfo) {
		return null
	}

	return (
		<div className='chat-app chat-app--login chat-app--teacher-login ask-screen'>
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
					<div className='content-area content-area--login'>
						<div className='center-content2 login-screen login-screen--wide'>
							<div className='login-card logg2'>
								<div className='login-card__accent' aria-hidden />
								<div className='login-card__header'>
									<div className='login-card__back'>
										<Link
											to={watchBackHref}
											className='login-card__link'
										>
											&#8592; Volver a la pregunta
										</Link>
									</div>
									<h1 className='login-card__title answer-details__title'>
										Responder nueva pregunta
									</h1>
								</div>

								{!canFetch && (
									<p className='login-card__subtitle'>
										Abre esta página desde una pregunta de tu
										lista (falta el id de la pregunta).
									</p>
								)}

								{canFetch && isLoadingQuestion && (
									<p className='login-card__subtitle'>
										Cargando pregunta…
									</p>
								)}

								{canFetch && isQuestionError && (
									<p className='login-card__subtitle'>
										{questionErrorMessage}
									</p>
								)}

								{canFetch && !isLoadingQuestion && !isQuestionError && (
									<form
										className='login-form'
										id='teacher-answer-form'
										name='teacher-answer-form'
										onSubmit={handleSubmit}
									>
										<div className='answer-details__field'>
											<div className='answer-details__icon answer-details__icon--purple'>
												<TagIcon />
											</div>
											<input
												type='text'
												id='answer-title'
												name='title'
												className='answer-details__input'
												value={titleDisplay}
												readOnly
												aria-readonly='true'
											/>
										</div>

										<div className='answer-details__field'>
											<div className='answer-details__icon answer-details__icon--orange'>
												<DescriptionIcon />
											</div>
											<textarea
												id='answer-description'
												name='description'
												className='answer-details__input answer-details__textarea'
												placeholder='Escribe tu respuesta…'
												rows={4}
												value={description}
												disabled={isSubmitting}
												onChange={(e) =>
													setDescription(e.target.value)}
											/>
										</div>

										<button
											type='submit'
											className='answer-details__submit'
											disabled={isSubmitting || !titleDisplay}
										>
											{isSubmitting
												? 'Guardando…'
												: 'Subir un video'}
										</button>
									</form>
								)}
							</div>
						</div>
					</div>
				</div>
			</div>
		</div>
	)
}

export default TeacherAnswerDetailsScreen
