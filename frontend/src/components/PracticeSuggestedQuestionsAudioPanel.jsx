import { useState } from 'react'
import Loader from './Loader'

function practiceAudioKey (chapterId, questionIndex, audioKind) {
	return `${chapterId}:${questionIndex}:${audioKind}`
}

function audioCountsFromQuestions (items) {
	const questions = Array.isArray(items) ? items : []
	let clipCount = 0
	let completeCount = 0
	for (const item of questions) {
		const hasQuestion = Boolean(
			String(item?.questionAudioUrl || '').trim(),
		)
		const hasAnswer = Boolean(
			String(item?.answerAudioUrl || '').trim(),
		)
		if (hasQuestion) {
			clipCount += 1
		}
		if (hasAnswer) {
			clipCount += 1
		}
		if (hasQuestion && hasAnswer) {
			completeCount += 1
		}
	}
	return {
		questionCount: questions.length,
		clipCount,
		clipTotal: questions.length * 2,
		completeCount,
	}
}

const PracticeCopyGlyph = () => (
	<svg
		width='13'
		height='13'
		viewBox='0 0 24 24'
		fill='none'
		stroke='currentColor'
		strokeWidth='2'
		strokeLinecap='round'
		strokeLinejoin='round'
		aria-hidden
	>
		<rect x='9' y='9' width='13' height='13' rx='2' />
		<path d='M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1' />
	</svg>
)

function PracticeAudioSlot ({
	label,
	audioUrl,
	isGenerating,
	error,
	disabled,
	variant,
	onGenerateClick,
}) {
	const hasAudio = Boolean(String(audioUrl || '').trim())

	return (
		<div
			className={
				'create-tutor__practice-slot' +
				` create-tutor__practice-slot--${variant}` +
				(hasAudio
					? ' create-tutor__practice-slot--ready'
					: '') +
				(isGenerating
					? ' create-tutor__practice-slot--busy'
					: '')
			}
		>
			<p className='create-tutor__practice-slot-kicker'>
				{label}
			</p>
			{isGenerating ? (
				<div
					className='new-answers__status new-answers__status--loading'
					role='status'
					aria-live='polite'
					aria-busy='true'
				>
					<Loader size='sm' />
					<p className='create-tutor__practice-slot-status'>
						Generando audio con OpenAI…
					</p>
				</div>
			) : hasAudio ? (
				<div className='create-tutor__practice-slot-ready'>
					<audio
						className='create-tutor__practice-audio'
						controls
						preload='metadata'
						src={audioUrl}
					>
						Tu navegador no reproduce audio.
					</audio>
					<button
						type='button'
						className='create-tutor__practice-replace'
						disabled={disabled}
						onClick={onGenerateClick}
					>
						Regenerar
					</button>
				</div>
			) : (
				<button
					type='button'
					className='create-tutor__practice-choose'
					disabled={disabled}
					onClick={onGenerateClick}
				>
					<span className='create-tutor__practice-choose-title'>
						Generar MP3
					</span>
					<span className='create-tutor__practice-choose-hint'>
						OpenAI gpt-4o-mini-tts · se sube a AWS
					</span>
				</button>
			)}
			{error ? (
				<p className='create-tutor__practice-slot-error'>
					{error}
				</p>
			) : null}
		</div>
	)
}

function PracticeSuggestedQuestionsAudioPanel ({
	chapterId,
	questions,
	generatingPracticeAudioKey,
	generatingAllPracticeAudio,
	practiceAudioErrors,
	onGenerateAllAudios,
	onGenerateAudio,
	isExternallyBusy = false,
}) {
	const [copiedKey, setCopiedKey] = useState('')
	const audioCounts = audioCountsFromQuestions(questions)
	const audioPercent = audioCounts.clipTotal > 0
		? Math.round((audioCounts.clipCount / audioCounts.clipTotal) * 100)
		: 0

	const handleCopy = async (key, text) => {
		try {
			await navigator.clipboard.writeText(text)
			setCopiedKey(key)
			window.setTimeout(() => {
				setCopiedKey((current) => (
					current === key ? '' : current
				))
			}, 1600)
		} catch (err) {
			console.error(err)
		}
	}

	const slotBusy = generatingAllPracticeAudio
		|| Boolean(generatingPracticeAudioKey)
		|| isExternallyBusy

	return (
		<div className='create-tutor__practice-panel'>
			<div
				className={
					'create-tutor__practice-audio-block' +
					' create-tutor__practice-audio-block--standalone'
				}
			>
				<div className='create-tutor__practice-audio-head'>
					<div>
						<p className='create-tutor__practice-panel-title'>
							Audios TTS de práctica
						</p>
						<p className='create-tutor__practice-panel-copy'>
							Genera MP3 de la pregunta y la respuesta con OpenAI
							TTS. Se guardan en AWS como questionAudioUrl y
							answerAudioUrl.
						</p>
					</div>
					<button
						type='button'
						className='create-tutor__practice-audio-all-btn'
						disabled={slotBusy}
						onClick={() => {
							onGenerateAllAudios()
						}}
					>
						{generatingAllPracticeAudio
							? 'Generando audios…'
							: (audioCounts.clipCount >= audioCounts.clipTotal
								&& audioCounts.clipTotal > 0
								? 'Regenerar todos los audios'
								: 'Generar audios faltantes')}
					</button>
				</div>
				<div
					className='create-tutor__practice-progress'
					role='progressbar'
					aria-valuemin={0}
					aria-valuemax={100}
					aria-valuenow={audioPercent}
					aria-label='Progreso de audios TTS de práctica'
				>
					<span
						className='create-tutor__practice-progress-bar create-tutor__practice-progress-bar--audio'
						style={{ width: `${audioPercent}%` }}
					/>
				</div>
				<p className='create-tutor__practice-panel-meta'>
					{audioCounts.completeCount} de {audioCounts.questionCount}{' '}
					preguntas tienen ambos audios · {audioCounts.clipCount}/
					{audioCounts.clipTotal} clips
				</p>
				{practiceAudioErrors[`${chapterId}:batch`] ? (
					<p className='create-tutor__practice-slot-error'>
						{practiceAudioErrors[`${chapterId}:batch`]}
					</p>
				) : null}
			</div>
			<ol className='create-tutor__practice-list'>
				{questions.map((item, questionIndex) => {
					const questionText = String(item?.question || '').trim()
					const answerText = String(item?.answer || '').trim()
					const questionAudioKind = 'question-audio'
					const answerAudioKind = 'answer-audio'
					const questionAudioSlotKey = practiceAudioKey(
						chapterId,
						questionIndex,
						questionAudioKind,
					)
					const answerAudioSlotKey = practiceAudioKey(
						chapterId,
						questionIndex,
						answerAudioKind,
					)
					const copyQuestionKey = `${chapterId}:q:${questionIndex}`
					const copyAnswerKey = `${chapterId}:a:${questionIndex}`

					return (
						<li
							key={`${chapterId}-practice-audio-${questionIndex}`}
							className='create-tutor__practice-card'
						>
							<div className='create-tutor__practice-card-top'>
								<span className='create-tutor__practice-num'>
									{String(questionIndex + 1).padStart(2, '0')}
								</span>
								<div className='create-tutor__practice-texts'>
									<div className='create-tutor__practice-text-row'>
										<p className='create-tutor__practice-question'>
											{questionText}
										</p>
										<button
											type='button'
											className='create-tutor__practice-copy'
											onClick={() => {
												void handleCopy(
													copyQuestionKey,
													questionText,
												)
											}}
											aria-label='Copiar pregunta'
										>
											<PracticeCopyGlyph />
											{copiedKey === copyQuestionKey
												? 'Copiado'
												: 'Copiar'}
										</button>
									</div>
									{answerText ? (
										<div className='create-tutor__practice-text-row'>
											<p className='create-tutor__practice-answer'>
												<span className='create-tutor__practice-answer-label'>
													Respuesta
												</span>
												{answerText}
											</p>
											<button
												type='button'
												className='create-tutor__practice-copy'
												onClick={() => {
													void handleCopy(
														copyAnswerKey,
														answerText,
													)
												}}
												aria-label='Copiar respuesta'
											>
												<PracticeCopyGlyph />
												{copiedKey === copyAnswerKey
													? 'Copiado'
													: 'Copiar'}
											</button>
										</div>
									) : null}
								</div>
							</div>
							<div className='create-tutor__practice-audio-slots'>
								<PracticeAudioSlot
									label='Audio de la pregunta'
									variant='question'
									audioUrl={item?.questionAudioUrl}
									isGenerating={
										generatingPracticeAudioKey
											=== questionAudioSlotKey
									}
									error={practiceAudioErrors[questionAudioSlotKey]}
									disabled={slotBusy || !questionText}
									onGenerateClick={() => {
										onGenerateAudio(
											questionIndex,
											questionAudioKind,
										)
									}}
								/>
								<PracticeAudioSlot
									label='Audio de la respuesta'
									variant='answer'
									audioUrl={item?.answerAudioUrl}
									isGenerating={
										generatingPracticeAudioKey
											=== answerAudioSlotKey
									}
									error={practiceAudioErrors[answerAudioSlotKey]}
									disabled={slotBusy || !answerText}
									onGenerateClick={() => {
										onGenerateAudio(
											questionIndex,
											answerAudioKind,
										)
									}}
								/>
							</div>
						</li>
					)
				})}
			</ol>
		</div>
	)
}

export {
	practiceAudioKey,
	audioCountsFromQuestions,
	PracticeSuggestedQuestionsAudioPanel,
}
