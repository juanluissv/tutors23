import { useEffect, useMemo, useRef, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { useSelector } from 'react-redux'
import AdminSidebar from '../../components/AdminSidebar'
import AdminHeader from '../../components/AdminHeader'
import {
	useGenerateChapterTutorTxtFromLessonMutation,
	useGenerateSuggestedQuestionsFromLessonMutation,
	useGenerateVideoScriptFromLessonMutation,
	useGenerateVideoScriptAudioFromLessonMutation,
	useGenerateSceneIllustrationsFromLessonMutation,
	useGenerateAnimatedVideoFromLessonMutation,
	useCheckAnimatedVideoStatusFromLessonMutation,
	useGetBookLessonsBySubjectQuery,
	useGetSubjectsBySchoolQuery,
	useUploadChapterTutorVideoMutation,
	useUploadChapterTutorTranscribeMutation,
	useUploadSuggestedQuestionVideoMutation,
} from '../../slices/admin/schoolAdminApiSlice'
import { buildBookIndex } from '../../utils/buildBookIndex'
import { SUBJECTS_URL } from '../../constants'
import '../../App.css'

const OBJECT_ID_RE = /^[a-fA-F0-9]{24}$/

const BOOK_INDEX_LABELS = {
	chapterFallback: (n) => `Capítulo ${n}`,
	pagesRange: (start, end) => `Páginas ${start}–${end}`,
	fromPage: (start) => `Desde la página ${start}`,
	throughPage: (end) => `Hasta la página ${end}`,
	otherChapters: 'Otros capítulos',
}

function resolveSchoolId (school) {
	if (!school) {
		return null
	}
	if (typeof school === 'string') {
		return school
	}
	if (typeof school === 'object' && school._id) {
		return String(school._id)
	}
	return null
}

function bookDisplayName (bookId) {
	if (!bookId || typeof bookId !== 'string') {
		return ''
	}
	const trimmed = bookId.trim()
	const parts = trimmed.split('/')
	const last = parts[parts.length - 1]
	return last && last.length > 0 ? last : trimmed
}

function documentDisplayName (doc) {
	if (doc?.fileName) {
		return String(doc.fileName)
	}
	if (doc?.label) {
		return String(doc.label)
	}
	if (doc?.fileId) {
		return bookDisplayName(String(doc.fileId))
	}
	return 'Documento'
}

function isVideoAddedToLessonMessage (message) {
	const lower = String(message || '').toLowerCase()
	return lower.includes('added to the lesson')
		|| lower.includes('añadió a la lección')
		|| lower.includes('añadido a la lección')
}

function getDocumentKey (doc) {
	if (doc?._id) {
		return String(doc._id)
	}
	if (doc?.fileId) {
		return String(doc.fileId)
	}
	return ''
}

function chapterBelongsToDocument (
	chapter,
	documentKey,
	requiresSourceDocument,
) {
	if (!requiresSourceDocument) {
		return true
	}
	if (!documentKey) {
		return false
	}
	return String(chapter.sourceDocumentId || '') === String(documentKey)
}

function getSubjectDocuments (subject) {
	if (Array.isArray(subject?.documents) && subject.documents.length > 0) {
		return subject.documents
	}
	if (subject?.bookId && String(subject.bookId).trim() !== '') {
		return [{
			_id: null,
			fileId: String(subject.bookId).trim(),
			fileName: bookDisplayName(String(subject.bookId)),
			fileUrl: subject.bookUrl,
		}]
	}
	return []
}

const BookGlyph = () => (
	<svg
		width='40'
		height='40'
		viewBox='0 0 24 24'
		fill='none'
		xmlns='http://www.w3.org/2000/svg'
		className='book-chapters__book-glyph'
		aria-hidden
	>
		<path
			d='M4 6a2 2 0 012-2h5v16H6a2 2 0 01-2-2V6z'
			fill='url(#create-tutor-book-fill-a)'
		/>
		<path
			d='M13 4h5a2 2 0 012 2v10a2 2 0 01-2 2h-5V4z'
			fill='url(#create-tutor-book-fill-b)'
		/>
		<path
			d='M12 4v16'
			stroke='url(#create-tutor-book-stroke)'
			strokeWidth='1.5'
			strokeLinecap='round'
		/>
		<defs>
			<linearGradient
				id='create-tutor-book-fill-a'
				x1='4'
				y1='4'
				x2='11'
				y2='18'
				gradientUnits='userSpaceOnUse'
			>
				<stop stopColor='#e0f2fe' />
				<stop offset='1' stopColor='#bae6fd' />
			</linearGradient>
			<linearGradient
				id='create-tutor-book-fill-b'
				x1='13'
				y1='4'
				x2='20'
				y2='18'
				gradientUnits='userSpaceOnUse'
			>
				<stop stopColor='#f0f9ff' />
				<stop offset='1' stopColor='#7dd3fc' />
			</linearGradient>
			<linearGradient
				id='create-tutor-book-stroke'
				x1='12'
				y1='4'
				x2='12'
				y2='20'
				gradientUnits='userSpaceOnUse'
			>
				<stop stopColor='#0284c7' />
				<stop offset='1' stopColor='#0ea5e9' />
			</linearGradient>
		</defs>
	</svg>
)

const DocumentPdfGlyph = () => (
	<svg
		width='32'
		height='32'
		viewBox='0 0 24 24'
		fill='none'
		xmlns='http://www.w3.org/2000/svg'
		aria-hidden
	>
		<path
			d='M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8l-6-6z'
			fill='url(#create-tutor-doc-pdf-fill)'
		/>
		<path
			d='M14 2v6h6'
			stroke='#0284c7'
			strokeWidth='1.5'
			strokeLinecap='round'
			strokeLinejoin='round'
		/>
		<path
			d='M8 13h8M8 17h5'
			stroke='#0369a1'
			strokeWidth='1.5'
			strokeLinecap='round'
		/>
		<defs>
			<linearGradient
				id='create-tutor-doc-pdf-fill'
				x1='4'
				y1='2'
				x2='20'
				y2='22'
				gradientUnits='userSpaceOnUse'
			>
				<stop stopColor='#e0f2fe' />
				<stop offset='1' stopColor='#7dd3fc' />
			</linearGradient>
		</defs>
	</svg>
)

const TutorGenerateGlyph = () => (
	<svg
		width='22'
		height='22'
		viewBox='0 0 24 24'
		fill='none'
		stroke='currentColor'
		strokeWidth='1.75'
		aria-hidden
	>
		<path
			d='M12 3l1.5 4.5L18 9l-4.5 1.5L12 15l-1.5-4.5L6 9l4.5-1.5L12 3z'
			strokeLinecap='round'
			strokeLinejoin='round'
		/>
		<path
			d='M5 19l1 3 1-3 3-1-3-1-1-3-1 3-3 1 3 1zM19 13l.75 2.25L22 16l-2.25.75L19 19l-.75-2.25L16 16l2.25-.75L19 13z'
			strokeLinecap='round'
			strokeLinejoin='round'
		/>
	</svg>
)

const TutorVideoUploadGlyph = () => (
	<svg
		width='22'
		height='22'
		viewBox='0 0 24 24'
		fill='none'
		stroke='currentColor'
		strokeWidth='1.75'
		aria-hidden
	>
		<rect
			x='3'
			y='6'
			width='18'
			height='12'
			rx='2'
			strokeLinecap='round'
			strokeLinejoin='round'
		/>
		<path
			d='M10 10.5l3 2.25L16 10.5'
			strokeLinecap='round'
			strokeLinejoin='round'
		/>
		<path
			d='M12 3v5M9.5 5.5L12 3l2.5 2.5'
			strokeLinecap='round'
			strokeLinejoin='round'
		/>
	</svg>
)

const TutorTranscribeUploadGlyph = () => (
	<svg
		width='22'
		height='22'
		viewBox='0 0 24 24'
		fill='none'
		stroke='currentColor'
		strokeWidth='1.75'
		aria-hidden
	>
		<path
			d='M4 6h16M4 10h10M4 14h14M4 18h8'
			strokeLinecap='round'
			strokeLinejoin='round'
		/>
		<path
			d='M18 16v4M16 18h4'
			strokeLinecap='round'
			strokeLinejoin='round'
		/>
	</svg>
)

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

function practiceUploadKey (chapterId, questionIndex, videoKind) {
	return `${chapterId}:${questionIndex}:${videoKind}`
}

function clipCountsFromQuestions (items) {
	const questions = Array.isArray(items) ? items : []
	let clipCount = 0
	let completeCount = 0
	for (const item of questions) {
		const hasQuestion = Boolean(
			String(item?.questionVideoUrl || '').trim(),
		)
		const hasAnswer = Boolean(
			String(item?.answerVideoUrl || '').trim(),
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

function PracticeClipSlot ({
	label,
	hint,
	videoUrl,
	isUploading,
	error,
	disabled,
	variant,
	onUploadClick,
	onDropFile,
}) {
	const [isDragOver, setIsDragOver] = useState(false)
	const hasVideo = Boolean(String(videoUrl || '').trim())

	const handleDragOver = (event) => {
		event.preventDefault()
		if (!disabled && !isUploading) {
			setIsDragOver(true)
		}
	}

	const handleDragLeave = () => {
		setIsDragOver(false)
	}

	const handleDrop = (event) => {
		event.preventDefault()
		setIsDragOver(false)
		if (disabled || isUploading) {
			return
		}
		const file = event.dataTransfer.files?.[0]
		if (file) {
			onDropFile(file)
		}
	}

	return (
		<div
			className={
				'create-tutor__practice-slot' +
				` create-tutor__practice-slot--${variant}` +
				(hasVideo
					? ' create-tutor__practice-slot--ready'
					: '') +
				(isDragOver
					? ' create-tutor__practice-slot--drag'
					: '') +
				(isUploading
					? ' create-tutor__practice-slot--busy'
					: '')
			}
			onDragOver={handleDragOver}
			onDragLeave={handleDragLeave}
			onDrop={handleDrop}
		>
			<p className='create-tutor__practice-slot-kicker'>
				{label}
			</p>
			{isUploading ? (
				<p className='create-tutor__practice-slot-status'>
					Subiendo clip de HeyGen…
				</p>
			) : hasVideo ? (
				<div className='create-tutor__practice-slot-ready'>
					<a
						href={videoUrl}
						className='create-tutor__practice-preview'
						target='_blank'
						rel='noopener noreferrer'
					>
						Vista previa
						<span aria-hidden> ↗</span>
					</a>
					<button
						type='button'
						className='create-tutor__practice-replace'
						disabled={disabled}
						onClick={onUploadClick}
					>
						Reemplazar
					</button>
				</div>
			) : (
				<button
					type='button'
					className='create-tutor__practice-choose'
					disabled={disabled}
					onClick={onUploadClick}
				>
					<span className='create-tutor__practice-choose-title'>
						Subir MP4
					</span>
					<span className='create-tutor__practice-choose-hint'>
						{hint}
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

function PracticeVideosPanel ({
	chapterId,
	questions,
	uploadingPracticeKey,
	practiceVideoErrors,
	onUploadClick,
	onDropFile,
}) {
	const [copiedKey, setCopiedKey] = useState('')
	const counts = clipCountsFromQuestions(questions)
	const percent = counts.clipTotal > 0
		? Math.round((counts.clipCount / counts.clipTotal) * 100)
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

	return (
		<div className='create-tutor__practice-panel'>
			<div className='create-tutor__practice-panel-head'>
				<div>
					<p className='create-tutor__practice-panel-title'>
						Videos de práctica de HeyGen
					</p>
					<p className='create-tutor__practice-panel-copy'>
						Graba un clip de pregunta y uno de respuesta en
						HeyGen para cada consigna, luego sube los MP4 aquí.
						Puedes hacer clic o soltar un archivo en cada
						espacio.
					</p>
				</div>
				<p className='create-tutor__practice-panel-count'>
					{counts.clipCount}/{counts.clipTotal} clips
				</p>
			</div>
			<div
				className='create-tutor__practice-progress'
				role='progressbar'
				aria-valuemin={0}
				aria-valuemax={100}
				aria-valuenow={percent}
				aria-label='Progreso de subida de videos de práctica'
			>
				<span
					className='create-tutor__practice-progress-bar'
					style={{ width: `${percent}%` }}
				/>
			</div>
			<p className='create-tutor__practice-panel-meta'>
				{counts.completeCount} de {counts.questionCount} preguntas
				tienen ambos videos
			</p>
			<ol className='create-tutor__practice-list'>
				{questions.map((item, questionIndex) => {
					const questionText = String(item?.question || '').trim()
					const answerText = String(item?.answer || '').trim()
					const questionKind = 'question-video'
					const answerKind = 'answer-video'
					const questionKey = practiceUploadKey(
						chapterId,
						questionIndex,
						questionKind,
					)
					const answerKey = practiceUploadKey(
						chapterId,
						questionIndex,
						answerKind,
					)
					const copyQuestionKey = `${chapterId}:q:${questionIndex}`
					const copyAnswerKey = `${chapterId}:a:${questionIndex}`

					return (
						<li
							key={`${chapterId}-practice-${questionIndex}`}
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
											aria-label='Copiar pregunta para HeyGen'
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
												aria-label='Copiar respuesta para HeyGen'
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
							<div className='create-tutor__practice-slots'>
								<PracticeClipSlot
									label='Video de la pregunta'
									hint='Suelta el MP4 de HeyGen o explora'
									variant='question'
									videoUrl={item?.questionVideoUrl}
									isUploading={
										uploadingPracticeKey === questionKey
									}
									error={practiceVideoErrors[questionKey]}
									disabled={Boolean(uploadingPracticeKey)}
									onUploadClick={() => {
										onUploadClick(
											questionIndex,
											questionKind,
										)
									}}
									onDropFile={(file) => {
										onDropFile(
											questionIndex,
											questionKind,
											file,
										)
									}}
								/>
								<PracticeClipSlot
									label='Video de la respuesta'
									hint='Suelta el MP4 de HeyGen o explora'
									variant='answer'
									videoUrl={item?.answerVideoUrl}
									isUploading={
										uploadingPracticeKey === answerKey
									}
									error={practiceVideoErrors[answerKey]}
									disabled={Boolean(uploadingPracticeKey)}
									onUploadClick={() => {
										onUploadClick(
											questionIndex,
											answerKind,
										)
									}}
									onDropFile={(file) => {
										onDropFile(
											questionIndex,
											answerKind,
											file,
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

function SchoolAdminCreateTutor () {
	const navigate = useNavigate()
	const { subjectId } = useParams()
	const { schoolAdminInfo } = useSelector((state) => state.authSchoolAdmin)
	const schoolId = schoolAdminInfo
		? resolveSchoolId(schoolAdminInfo.school)
		: null

	const [isSidebarOpen, setIsSidebarOpen] = useState(
		window.innerWidth > 768,
	)
	const [selectedDocumentId, setSelectedDocumentId] = useState('')
	const [generatingChapterId, setGeneratingChapterId] = useState(null)
	const [generatingQuestionsChapterId, setGeneratingQuestionsChapterId] =
		useState(null)
	const [generatingVideoScriptChapterId, setGeneratingVideoScriptChapterId] =
		useState(null)
	const [generatingVideoAudioChapterId, setGeneratingVideoAudioChapterId] =
		useState(null)
	const [
		generatingIllustrationsChapterId,
		setGeneratingIllustrationsChapterId,
	] = useState(null)
	const [generatingAnimatedVideoChapterId, setGeneratingAnimatedVideoChapterId] =
		useState(null)
	const [checkingVideoStatusChapterId, setCheckingVideoStatusChapterId] =
		useState(null)
	const [uploadingChapterId, setUploadingChapterId] = useState(null)
	const [uploadingTranscribeChapterId, setUploadingTranscribeChapterId] =
		useState(null)
	const [pendingUploadChapterId, setPendingUploadChapterId] = useState(null)
	const [pendingTranscribeChapterId, setPendingTranscribeChapterId] =
		useState(null)
	const [expandedPracticeChapterId, setExpandedPracticeChapterId] =
		useState(null)
	const [uploadingPracticeKey, setUploadingPracticeKey] = useState(null)
	const [practiceVideoErrors, setPracticeVideoErrors] = useState({})
	const [pendingPracticeUpload, setPendingPracticeUpload] = useState(null)
	const [chapterErrors, setChapterErrors] = useState({})
	const [questionErrors, setQuestionErrors] = useState({})
	const [videoScriptErrors, setVideoScriptErrors] = useState({})
	const [videoAudioErrors, setVideoAudioErrors] = useState({})
	const [illustrationErrors, setIllustrationErrors] = useState({})
	const [animatedVideoErrors, setAnimatedVideoErrors] = useState({})
	const [animatedVideoStatusMessages, setAnimatedVideoStatusMessages] = useState({})
	const [videoErrors, setVideoErrors] = useState({})
	const [transcribeErrors, setTranscribeErrors] = useState({})
	const videoInputRef = useRef(null)
	const transcribeInputRef = useRef(null)
	const practiceVideoInputRef = useRef(null)

	const [generateTutorTxt] = useGenerateChapterTutorTxtFromLessonMutation()
	const [generateSuggestedQuestions] =
		useGenerateSuggestedQuestionsFromLessonMutation()
	const [generateVideoScript] =
		useGenerateVideoScriptFromLessonMutation()
	const [generateVideoScriptAudio] =
		useGenerateVideoScriptAudioFromLessonMutation()
	const [generateSceneIllustrations] =
		useGenerateSceneIllustrationsFromLessonMutation()
	const [generateAnimatedVideo] =
		useGenerateAnimatedVideoFromLessonMutation()
	const [checkAnimatedVideoStatus] =
		useCheckAnimatedVideoStatusFromLessonMutation()
	const [uploadChapterTutorVideo] = useUploadChapterTutorVideoMutation()
	const [uploadChapterTutorTranscribe] =
		useUploadChapterTutorTranscribeMutation()
	const [uploadSuggestedQuestionVideo] =
		useUploadSuggestedQuestionVideoMutation()

	const isValidSubjectParam =
		subjectId != null && OBJECT_ID_RE.test(String(subjectId))

	const {
		data: subjects = [],
		isLoading: isLoadingSubjects,
		isError: isSubjectsError,
		refetch: refetchSubjects,
	} = useGetSubjectsBySchoolQuery(schoolId, {
		skip: !schoolId,
	})

	const {
		data: bookLessons = [],
		isLoading: isLoadingLessons,
		isError: isLessonsError,
		refetch: refetchLessons,
	} = useGetBookLessonsBySubjectQuery(subjectId, {
		skip: !isValidSubjectParam,
	})

	const currentSubject = useMemo(() => {
		if (!isValidSubjectParam || !subjects?.length) {
			return undefined
		}
		return subjects.find((s) => String(s._id) === String(subjectId))
	}, [subjects, subjectId, isValidSubjectParam])

	const bookChapters = useMemo(() => {
		if (!Array.isArray(currentSubject?.bookChapters)) {
			return []
		}
		return currentSubject.bookChapters
	}, [currentSubject])

	const subjectDocuments = useMemo(
		() => getSubjectDocuments(currentSubject),
		[currentSubject],
	)
	const hasDocuments = subjectDocuments.length > 0
	const requiresSourceDocument = subjectDocuments.length > 1

	const selectedDocument = useMemo(() => {
		if (!selectedDocumentId) {
			return undefined
		}
		return subjectDocuments.find(
			(doc) => getDocumentKey(doc) === selectedDocumentId,
		)
	}, [subjectDocuments, selectedDocumentId])

	const filteredBookChapters = useMemo(() => {
		if (!hasDocuments) {
			return []
		}
		if (!selectedDocumentId && requiresSourceDocument) {
			return []
		}
		return bookChapters.filter((chapter) => chapterBelongsToDocument(
			chapter,
			selectedDocumentId,
			requiresSourceDocument,
		))
	}, [
		bookChapters,
		hasDocuments,
		requiresSourceDocument,
		selectedDocumentId,
	])

	const lessonsByChapterId = useMemo(() => {
		const map = new Map()
		for (const lesson of bookLessons) {
			const chapterId = lesson?.bookChapter?.chapterId
			if (chapterId) {
				map.set(String(chapterId), lesson)
			}
		}
		return map
	}, [bookLessons])

	const { rows, groups } = useMemo(
		() => buildBookIndex(
			filteredBookChapters,
			lessonsByChapterId,
			BOOK_INDEX_LABELS,
		),
		[filteredBookChapters, lessonsByChapterId],
	)

	const readyCount = rows.filter((row) => row.hasWebVersion).length
	const availableGroups = useMemo(
		() => groups.map((group) => ({
			...group,
			items: group.items.filter((item) => item.hasWebVersion),
		})).filter((group) => group.items.length > 0),
		[groups],
	)

	const chapterTxtByChapterId = useMemo(() => {
		const map = new Map()
		for (const chapter of bookChapters) {
			if (!chapter?._id) {
				continue
			}
			const txtFileId = chapter.ChapterTxtFileId
				&& String(chapter.ChapterTxtFileId).trim() !== ''
				? String(chapter.ChapterTxtFileId).trim()
				: null
			if (txtFileId) {
				map.set(String(chapter._id), {
					chapterTxtFileId: txtFileId,
					chapterTxtFileUrl: chapter.chapterTxtFileUrl || '',
				})
			}
		}
		return map
	}, [bookChapters])

	const suggestedQuestionsByChapterId = useMemo(() => {
		const map = new Map()
		for (const lesson of bookLessons) {
			const chapterId = lesson?.bookChapter?.chapterId
			if (!chapterId) {
				continue
			}
			const items = Array.isArray(lesson?.suggestedQuestions)
				? lesson.suggestedQuestions
					.map((item) => ({
						question: String(item?.question ?? '').trim(),
						answer: String(item?.answer ?? '').trim(),
						questionVideoUrl: String(
							item?.questionVideoUrl ?? '',
						).trim(),
						answerVideoUrl: String(
							item?.answerVideoUrl ?? '',
						).trim(),
					}))
					.filter((item) => item.question)
				: []
			if (items.length > 0 || lesson?.hasSuggestedQuestions) {
				const counts = clipCountsFromQuestions(items)
				map.set(String(chapterId), {
					count: items.length || counts.questionCount || 10,
					items,
					clipCount: counts.clipCount,
					clipTotal: counts.clipTotal,
					completeCount: counts.completeCount,
				})
			}
		}
		return map
	}, [bookLessons])

	const videoScriptByChapterId = useMemo(() => {
		const map = new Map()
		for (const lesson of bookLessons) {
			const chapterId = lesson?.bookChapter?.chapterId
			if (!chapterId) {
				continue
			}
			const sceneCount = Array.isArray(lesson?.videoScript?.scenes)
				? lesson.videoScript.scenes.length
				: 0
			if (sceneCount > 0 || lesson?.hasVideoScript) {
				map.set(String(chapterId), {
					sceneCount: sceneCount || 0,
					title: lesson?.videoScript?.title
						? String(lesson.videoScript.title).trim()
						: '',
					estimatedDurationSeconds: Number(
						lesson?.videoScript?.estimatedDurationSeconds,
					) || 0,
				})
			}
		}
		return map
	}, [bookLessons])

	const videoAudioByChapterId = useMemo(() => {
		const map = new Map()
		for (const lesson of bookLessons) {
			const chapterId = lesson?.bookChapter?.chapterId
			if (!chapterId) {
				continue
			}
			const audioFileId = lesson?.videoScriptAudioFileId
				&& String(lesson.videoScriptAudioFileId).trim() !== ''
				? String(lesson.videoScriptAudioFileId).trim()
				: null
			if (audioFileId || lesson?.hasVideoScriptAudio) {
				map.set(String(chapterId), {
					videoScriptAudioFileId: audioFileId || '',
					videoScriptAudioFileUrl: lesson?.videoScriptAudioFileUrl || '',
					audioGeneratedAt: lesson?.videoScript?.audioGeneratedAt || null,
				})
			}
		}
		return map
	}, [bookLessons])

	const sceneIllustrationsByChapterId = useMemo(() => {
		const map = new Map()
		for (const lesson of bookLessons) {
			const chapterId = lesson?.bookChapter?.chapterId
			if (!chapterId) {
				continue
			}
			const count = Number(lesson?.sceneIllustrationCount)
				|| Number(lesson?.videoScript?.sceneIllustrationCount)
				|| 0
			const total = Array.isArray(lesson?.videoScript?.scenes)
				? lesson.videoScript.scenes.length
				: 0
			if (count > 0 || lesson?.hasSceneIllustrations) {
				map.set(String(chapterId), {
					count: count || 0,
					total: total || count || 0,
					complete: Boolean(lesson?.hasSceneIllustrations)
						|| (total > 0 && count >= total),
				})
			}
		}
		return map
	}, [bookLessons])

	const creatomatePendingByChapterId = useMemo(() => {
		const map = new Map()
		for (const lesson of bookLessons) {
			const chapterId = lesson?.bookChapter?.chapterId
			if (!chapterId) {
				continue
			}
			if (lesson?.hasCreatomateRenderPending) {
				map.set(String(chapterId), {
					creatomateRenderId: lesson?.creatomateRenderId || '',
					creatomateRenderStatus: lesson?.creatomateRenderStatus || '',
					creatomateRenderRequestedAt:
						lesson?.creatomateRenderRequestedAt || null,
				})
			}
		}
		return map
	}, [bookLessons])

	const chapterVideoByChapterId = useMemo(() => {
		const map = new Map()
		for (const lesson of bookLessons) {
			const chapterId = lesson?.bookChapter?.chapterId
			if (!chapterId) {
				continue
			}
			const videoFileId = lesson?.chapterVideoFileId
				&& String(lesson.chapterVideoFileId).trim() !== ''
				? String(lesson.chapterVideoFileId).trim()
				: null
			if (videoFileId) {
				map.set(String(chapterId), {
					chapterVideoFileId: videoFileId,
					chapterVideoFileUrl: lesson.chapterVideoFileUrl || '',
				})
			}
		}
		return map
	}, [bookLessons])

	const chapterTranscribeByChapterId = useMemo(() => {
		const map = new Map()
		for (const lesson of bookLessons) {
			const chapterId = lesson?.bookChapter?.chapterId
			if (!chapterId) {
				continue
			}
			const transcribeFileId = lesson?.chapterTranscribeFileId
				&& String(lesson.chapterTranscribeFileId).trim() !== ''
				? String(lesson.chapterTranscribeFileId).trim()
				: null
			if (transcribeFileId) {
				map.set(String(chapterId), {
					chapterTranscribeFileId: transcribeFileId,
					chapterTranscribeFileUrl: lesson.chapterTranscribeFileUrl || '',
				})
			}
		}
		return map
	}, [bookLessons])

	const filteredChapterIds = useMemo(
		() => new Set(
			filteredBookChapters
				.filter((chapter) => chapter._id)
				.map((chapter) => String(chapter._id)),
		),
		[filteredBookChapters],
	)

	const countForFilteredChapters = (map) => {
		let count = 0
		for (const chapterId of filteredChapterIds) {
			if (map.has(chapterId)) {
				count += 1
			}
		}
		return count
	}

	const filteredTutorTxtReadyCount = countForFilteredChapters(
		chapterTxtByChapterId,
	)
	const filteredSuggestedQuestionsReadyCount = countForFilteredChapters(
		suggestedQuestionsByChapterId,
	)
	const filteredVideoScriptReadyCount = countForFilteredChapters(
		videoScriptByChapterId,
	)
	const filteredVideoAudioReadyCount = countForFilteredChapters(
		videoAudioByChapterId,
	)
	const filteredSceneIllustrationsReadyCount = countForFilteredChapters(
		sceneIllustrationsByChapterId,
	)
	const filteredTutorVideoReadyCount = countForFilteredChapters(
		chapterVideoByChapterId,
	)
	const filteredTutorTranscribeReadyCount = countForFilteredChapters(
		chapterTranscribeByChapterId,
	)

	const filteredPracticeVideosReadyCount = useMemo(() => {
		let ready = 0
		for (const chapterId of filteredChapterIds) {
			const meta = suggestedQuestionsByChapterId.get(chapterId)
			if (meta?.count > 0 && meta.completeCount === meta.count) {
				ready += 1
			}
		}
		return ready
	}, [filteredChapterIds, suggestedQuestionsByChapterId])

	const getDocumentChapters = (documentKey) => bookChapters.filter(
		(chapter) => chapterBelongsToDocument(
			chapter,
			documentKey,
			requiresSourceDocument,
		),
	)

	const getDocumentOpenHref = (doc) => {
		if (doc?.fileUrl) {
			return String(doc.fileUrl)
		}
		if (doc?._id && subjectId) {
			return `${SUBJECTS_URL}/${subjectId}/school-admin/documents/${doc._id}`
		}
		if (hasDocuments && subjectId) {
			return `${SUBJECTS_URL}/${subjectId}/school-admin/book`
		}
		return ''
	}

	const getDocumentChapterCount = (documentKey) =>
		getDocumentChapters(documentKey).length

	const getDocumentWebLessonCount = (documentKey) => {
		const chapters = getDocumentChapters(documentKey)
		const { rows: docRows } = buildBookIndex(chapters, lessonsByChapterId)
		return docRows.filter((row) => row.hasWebVersion).length
	}

	const getDocumentTutorTxtCount = (documentKey) => {
		const chapters = getDocumentChapters(documentKey)
		return chapters.filter(
			(chapter) => chapter._id
				&& chapterTxtByChapterId.has(String(chapter._id)),
		).length
	}

	useEffect(() => {
		if (!schoolAdminInfo) {
			navigate('/schooladmins/login', { replace: true })
		}
	}, [schoolAdminInfo, navigate])

	useEffect(() => {
		if (subjectDocuments.length === 0) {
			setSelectedDocumentId('')
			return
		}
		setSelectedDocumentId((prev) => {
			if (
				prev
				&& subjectDocuments.some(
					(doc) => getDocumentKey(doc) === prev,
				)
			) {
				return prev
			}
			return getDocumentKey(subjectDocuments[0])
		})
	}, [subjectDocuments])

	const toggleSidebar = () => {
		setIsSidebarOpen(!isSidebarOpen)
	}

	const handleSelectDocument = (documentKey) => {
		setSelectedDocumentId(String(documentKey))
		setExpandedPracticeChapterId(null)
	}

	const handleGenerateTutorTxt = async (chapterId) => {
		if (!subjectId || !chapterId) {
			return
		}

		setGeneratingChapterId(String(chapterId))
		setChapterErrors((prev) => {
			const next = { ...prev }
			delete next[String(chapterId)]
			return next
		})

		try {
			await generateTutorTxt({
				id: subjectId,
				chapterId: String(chapterId),
				schoolId,
			}).unwrap()
			await refetchSubjects()
		} catch (err) {
			const message = err?.data?.message
				|| err?.message
				|| 'No se pudo generar el archivo de texto del tutor. Intenta de nuevo.'
			setChapterErrors((prev) => ({
				...prev,
				[String(chapterId)]: message,
			}))
		} finally {
			setGeneratingChapterId(null)
		}
	}

	const handleGenerateSuggestedQuestions = async (chapterId) => {
		if (!subjectId || !chapterId) {
			return
		}

		setGeneratingQuestionsChapterId(String(chapterId))
		setQuestionErrors((prev) => {
			const next = { ...prev }
			delete next[String(chapterId)]
			return next
		})

		try {
			await generateSuggestedQuestions({
				id: subjectId,
				chapterId: String(chapterId),
			}).unwrap()
			await refetchLessons()
			setExpandedPracticeChapterId(String(chapterId))
		} catch (err) {
			const message = err?.data?.message
				|| err?.message
				|| 'No se pudieron generar las preguntas sugeridas. Intenta de nuevo.'
			setQuestionErrors((prev) => ({
				...prev,
				[String(chapterId)]: message,
			}))
		} finally {
			setGeneratingQuestionsChapterId(null)
		}
	}

	const handleGenerateVideoScript = async (chapterId) => {
		if (!subjectId || !chapterId) {
			return
		}

		setGeneratingVideoScriptChapterId(String(chapterId))
		setVideoScriptErrors((prev) => {
			const next = { ...prev }
			delete next[String(chapterId)]
			return next
		})

		try {
			await generateVideoScript({
				id: subjectId,
				chapterId: String(chapterId),
			}).unwrap()
			await refetchLessons()
		} catch (err) {
			const message = err?.data?.message
				|| err?.message
				|| 'No se pudo generar el guion de video. Intenta de nuevo.'
			setVideoScriptErrors((prev) => ({
				...prev,
				[String(chapterId)]: message,
			}))
		} finally {
			setGeneratingVideoScriptChapterId(null)
		}
	}

	const handleGenerateVideoAudio = async (chapterId) => {
		if (!subjectId || !chapterId) {
			return
		}

		setGeneratingVideoAudioChapterId(String(chapterId))
		setVideoAudioErrors((prev) => {
			const next = { ...prev }
			delete next[String(chapterId)]
			return next
		})

		try {
			await generateVideoScriptAudio({
				id: subjectId,
				chapterId: String(chapterId),
			}).unwrap()
			await refetchLessons()
		} catch (err) {
			const message = err?.data?.message
				|| err?.message
				|| 'No se pudo generar el audio de narración. Intenta de nuevo.'
			setVideoAudioErrors((prev) => ({
				...prev,
				[String(chapterId)]: message,
			}))
		} finally {
			setGeneratingVideoAudioChapterId(null)
		}
	}

	const handleGenerateSceneIllustrations = async (chapterId, force = false) => {
		if (!subjectId || !chapterId) {
			return
		}

		setGeneratingIllustrationsChapterId(String(chapterId))
		setIllustrationErrors((prev) => {
			const next = { ...prev }
			delete next[String(chapterId)]
			return next
		})

		try {
			await generateSceneIllustrations({
				id: subjectId,
				chapterId: String(chapterId),
				force,
			}).unwrap()
			await refetchLessons()
		} catch (err) {
			const message = err?.data?.message
				|| err?.message
				|| 'No se pudieron generar las ilustraciones de escena. Intenta de nuevo.'
			setIllustrationErrors((prev) => ({
				...prev,
				[String(chapterId)]: message,
			}))
		} finally {
			setGeneratingIllustrationsChapterId(null)
		}
	}

	const handleGenerateAnimatedVideo = async (chapterId) => {
		if (!subjectId || !chapterId) {
			return
		}

		setGeneratingAnimatedVideoChapterId(String(chapterId))
		setAnimatedVideoErrors((prev) => {
			const next = { ...prev }
			delete next[String(chapterId)]
			return next
		})

		try {
			const result = await generateAnimatedVideo({
				id: subjectId,
				chapterId: String(chapterId),
			}).unwrap()
			await refetchLessons()
			const message = result?.message
				|| 'El render de Creatomate comenzó. Usa Revisar estado del video cuando esté listo.'
			setAnimatedVideoStatusMessages((prev) => ({
				...prev,
				[String(chapterId)]: message,
			}))
		} catch (err) {
			const message = err?.data?.message
				|| err?.message
				|| 'No se pudo generar el video animado. Intenta de nuevo.'
			setAnimatedVideoErrors((prev) => ({
				...prev,
				[String(chapterId)]: message,
			}))
		} finally {
			setGeneratingAnimatedVideoChapterId(null)
		}
	}

	const handleCheckVideoStatus = async (chapterId) => {
		if (!subjectId || !chapterId) {
			return
		}

		setCheckingVideoStatusChapterId(String(chapterId))
		setAnimatedVideoErrors((prev) => {
			const next = { ...prev }
			delete next[String(chapterId)]
			return next
		})

		try {
			const result = await checkAnimatedVideoStatus({
				id: subjectId,
				chapterId: String(chapterId),
			}).unwrap()
			await refetchLessons()
			const message = result?.message
				|| (result?.addedToLesson
					? 'El video está listo y se añadió a la lección.'
					: 'El video aún se está procesando en Creatomate.')
			setAnimatedVideoStatusMessages((prev) => ({
				...prev,
				[String(chapterId)]: message,
			}))
		} catch (err) {
			const message = err?.data?.message
				|| err?.message
				|| 'No se pudo revisar el estado del video. Intenta de nuevo.'
			setAnimatedVideoErrors((prev) => ({
				...prev,
				[String(chapterId)]: message,
			}))
		} finally {
			setCheckingVideoStatusChapterId(null)
		}
	}

	const handleUploadVideoClick = (chapterId) => {
		if (
			!subjectId
			|| !chapterId
			|| uploadingChapterId
			|| uploadingTranscribeChapterId
			|| generatingChapterId
			|| generatingQuestionsChapterId
			|| generatingVideoScriptChapterId
			|| generatingVideoAudioChapterId
			|| generatingAnimatedVideoChapterId
			|| checkingVideoStatusChapterId
		) {
			return
		}
		setPendingUploadChapterId(String(chapterId))
		videoInputRef.current?.click()
	}

	const handleUploadTranscribeClick = (chapterId) => {
		if (
			!subjectId
			|| !chapterId
			|| uploadingChapterId
			|| uploadingTranscribeChapterId
			|| generatingChapterId
			|| generatingQuestionsChapterId
			|| generatingVideoScriptChapterId
			|| generatingVideoAudioChapterId
			|| generatingAnimatedVideoChapterId
			|| checkingVideoStatusChapterId
		) {
			return
		}
		setPendingTranscribeChapterId(String(chapterId))
		transcribeInputRef.current?.click()
	}

	const handleVideoFileChange = async (event) => {
		const file = event.target.files?.[0]
		const chapterId = pendingUploadChapterId
		event.target.value = ''

		if (!file || !chapterId || !subjectId) {
			setPendingUploadChapterId(null)
			return
		}

		setUploadingChapterId(chapterId)
		setPendingUploadChapterId(null)
		setVideoErrors((prev) => {
			const next = { ...prev }
			delete next[chapterId]
			return next
		})

		try {
			await uploadChapterTutorVideo({
				id: subjectId,
				chapterId,
				video: file,
			}).unwrap()
			await refetchLessons()
		} catch (err) {
			const message = err?.data?.message
				|| err?.message
				|| 'No se pudo subir el video del tutor. Intenta de nuevo.'
			setVideoErrors((prev) => ({
				...prev,
				[chapterId]: message,
			}))
		} finally {
			setUploadingChapterId(null)
		}
	}

	const handleTogglePracticePanel = (chapterId) => {
		const nextId = String(chapterId)
		setExpandedPracticeChapterId((current) => (
			current === nextId ? null : nextId
		))
	}

	const uploadPracticeVideoFile = async (
		chapterId,
		questionIndex,
		videoKind,
		file,
	) => {
		if (!subjectId || !chapterId || !file) {
			return
		}

		const uploadKey = practiceUploadKey(
			chapterId,
			questionIndex,
			videoKind,
		)

		setUploadingPracticeKey(uploadKey)
		setPracticeVideoErrors((prev) => {
			const next = { ...prev }
			delete next[uploadKey]
			return next
		})

		try {
			await uploadSuggestedQuestionVideo({
				id: subjectId,
				chapterId,
				questionIndex,
				videoKind,
				video: file,
			}).unwrap()
			await refetchLessons()
		} catch (err) {
			const message = err?.data?.message
				|| err?.message
				|| 'No se pudo subir el video de HeyGen. Intenta de nuevo.'
			setPracticeVideoErrors((prev) => ({
				...prev,
				[uploadKey]: message,
			}))
		} finally {
			setUploadingPracticeKey(null)
		}
	}

	const handlePracticeUploadClick = (
		chapterId,
		questionIndex,
		videoKind,
	) => {
		if (!subjectId || !chapterId || uploadingPracticeKey) {
			return
		}
		setPendingPracticeUpload({
			chapterId: String(chapterId),
			questionIndex,
			videoKind,
		})
		practiceVideoInputRef.current?.click()
	}

	const handlePracticeVideoFileChange = async (event) => {
		const file = event.target.files?.[0]
		const pending = pendingPracticeUpload
		event.target.value = ''
		setPendingPracticeUpload(null)

		if (!file || !pending) {
			return
		}

		await uploadPracticeVideoFile(
			pending.chapterId,
			pending.questionIndex,
			pending.videoKind,
			file,
		)
	}

	const handleTranscribeFileChange = async (event) => {
		const file = event.target.files?.[0]
		const chapterId = pendingTranscribeChapterId
		event.target.value = ''

		if (!file || !chapterId || !subjectId) {
			setPendingTranscribeChapterId(null)
			return
		}

		setUploadingTranscribeChapterId(chapterId)
		setPendingTranscribeChapterId(null)
		setTranscribeErrors((prev) => {
			const next = { ...prev }
			delete next[chapterId]
			return next
		})

		try {
			await uploadChapterTutorTranscribe({
				id: subjectId,
				chapterId,
				transcribe: file,
			}).unwrap()
			await refetchLessons()
		} catch (err) {
			const message = err?.data?.message
				|| err?.message
				|| 'No se pudieron subir los subtítulos. Intenta de nuevo.'
			setTranscribeErrors((prev) => ({
				...prev,
				[chapterId]: message,
			}))
		} finally {
			setUploadingTranscribeChapterId(null)
		}
	}

	if (!schoolAdminInfo) {
		return null
	}

	if (!isValidSubjectParam) {
		return (
			<div className='chat-app chat-app--teacher-login ask-screen'>
				<div className='main-container'>
					<AdminSidebar
						isOpen={isSidebarOpen}
						toggleSidebar={toggleSidebar}
					/>
					<div className='main-content'>
						<AdminHeader
							isSidebarOpen={isSidebarOpen}
							toggleSidebar={toggleSidebar}
						/>
						<div className='content-area content-area--login'>
							<div className='center-content2 login-screen login-screen--wide login-screen--subject-form'>
								<div className='login-card'>
									<div className='login-card__accent' aria-hidden />
									<div className='login-card__header'>
										<h1 className='login-card__title'>
											Materia no válida
										</h1>
										<p className='login-card__back'>
											<Link
												to='/schooladmins/mysubjects'
												className='login-card__link'
											>
												← Volver a las materias
											</Link>
										</p>
									</div>
								</div>
							</div>
						</div>
					</div>
				</div>
			</div>
		)
	}

	if (!isLoadingSubjects && !currentSubject) {
		return (
			<div className='chat-app chat-app--teacher-login ask-screen'>
				<div className='main-container'>
					<AdminSidebar
						isOpen={isSidebarOpen}
						toggleSidebar={toggleSidebar}
					/>
					<div className='main-content'>
						<AdminHeader
							isSidebarOpen={isSidebarOpen}
							toggleSidebar={toggleSidebar}
						/>
						<div className='content-area content-area--login'>
							<div className='center-content2 login-screen login-screen--wide login-screen--subject-form'>
								<div className='login-card'>
									<div className='login-card__accent' aria-hidden />
									<div className='login-card__header'>
										<h1 className='login-card__title'>
											Materia no encontrada
										</h1>
										<p className='login-card__back'>
											<Link
												to='/schooladmins/mysubjects'
												className='login-card__link'
											>
												← Volver a las materias
											</Link>
										</p>
									</div>
								</div>
							</div>
						</div>
					</div>
				</div>
			</div>
		)
	}

	const subjectTitle = currentSubject?.title
		? String(currentSubject.title)
		: 'Materia'

	return (
		<div className='chat-app chat-app--teacher-login ask-screen'>
			<div className='main-container'>
				<AdminSidebar
					isOpen={isSidebarOpen}
					toggleSidebar={toggleSidebar}
				/>
				<div className='main-content'>
					<AdminHeader
						isSidebarOpen={isSidebarOpen}
						toggleSidebar={toggleSidebar}
					/>
					<div className={
						'content-area content-area--login ' +
						'content-area--login-scroll'
					}
					>
						<div className='center-content2 login-screen login-screen--wide login-screen--subject-form'>
							<div className={
								'login-card book-chapters view-book create-tutor'
							}
							>
								<div className='login-card__accent' aria-hidden />
								<div className='login-card__header'>
									<p className='login-card__back'>
										<Link
											to='/schooladmins/mysubjects'
											className='login-card__link'
										>
											← Volver a las materias
										</Link>
									</p>
									<h1 className='login-card__title'>
										Crear tutor con IA
									</h1>
									<p className={
										'login-card__subtitle ' +
										'login-card__subtitle--wide'
									}
									>
										Elige un PDF fuente y crea tutores con IA
										para cada lección web de{' '}
										<strong>{subjectTitle}</strong>.
									</p>
									<p className='create-tutor__book-link-wrap'>
										<Link
											to={`/schooladmins/viewbook/${subjectId}`}
											className='create-tutor__book-link'
										>
											Abrir índice del libro web →
										</Link>
									</p>
								</div>

								{isSubjectsError || isLessonsError ? (
									<div className='book-chapters__alert'>
										<p className='book-chapters__alert-text'>
											No pudimos cargar las lecciones.
											Intenta de nuevo.
										</p>
										<button
											type='button'
											className='login-submit'
											onClick={() => {
												void refetchSubjects()
												void refetchLessons()
											}}
										>
											Intentar de nuevo
										</button>
									</div>
								) : null}

								<section
									className='book-chapters__book-section'
									aria-labelledby='create-tutor-doc-heading'
								>
									<div className='book-chapters__section-intro'>
										<h2
											id='create-tutor-doc-heading'
											className='book-chapters__section-title'
										>
											1. Elegir documento fuente
										</h2>
										<p className='book-chapters__section-desc'>
											Selecciona el PDF cuyos capítulos quieres
											convertir en tutores con IA. Cada
											documento tiene su propio flujo abajo.
										</p>
									</div>

									{isLoadingSubjects && !currentSubject ? (
										<p className='book-chapters__loading'>
											Cargando documentos…
										</p>
									) : hasDocuments ? (
										<div
											className='book-chapters__doc-picker'
											role='listbox'
											aria-label='Documentos fuente'
										>
											{subjectDocuments.map((doc) => {
												const docKey = getDocumentKey(doc)
												const openHref = getDocumentOpenHref(doc)
												const isSelected =
													selectedDocumentId === docKey
												const chapterCount =
													getDocumentChapterCount(docKey)
												const webLessonCount =
													getDocumentWebLessonCount(docKey)
												const tutorTxtCount =
													getDocumentTutorTxtCount(docKey)

												return (
													<button
														key={docKey}
														type='button'
														role='option'
														aria-selected={isSelected}
														className={
															'book-chapters__doc-card' +
															(isSelected
																? ' book-chapters__doc-card--selected'
																: '')
														}
														onClick={() =>
															handleSelectDocument(docKey)}
													>
														{isSelected ? (
															<span
																className='book-chapters__doc-card-check'
																aria-hidden
															>
																✓
															</span>
														) : null}
														<span className='book-chapters__doc-card-icon'>
															<DocumentPdfGlyph />
														</span>
														<span className='book-chapters__doc-card-body'>
															<span className='book-chapters__doc-card-name'>
																{documentDisplayName(doc)}
															</span>
															<span className='book-chapters__doc-card-meta'>
																<span className='book-chapters__doc-card-count'>
																	{webLessonCount}/
																	{chapterCount}{' '}
																	{chapterCount === 1
																		? 'lección'
																		: 'lecciones'}
																</span>
																{tutorTxtCount > 0 ? (
																	<span className='create-tutor__doc-card-tutors'>
																		{tutorTxtCount}{' '}
																		{tutorTxtCount === 1
																			? 'tutor'
																			: 'tutores'}
																	</span>
																) : null}
																{openHref ? (
																	<a
																		href={openHref}
																		className='book-chapters__doc-card-link'
																		target='_blank'
																		rel='noopener noreferrer'
																		onClick={(e) =>
																			e.stopPropagation()}
																	>
																		Abrir PDF
																		<span
																			className='teacher-book-upload__open-link-icon'
																			aria-hidden
																		>
																			↗
																		</span>
																	</a>
																) : null}
															</span>
														</span>
													</button>
												)
											})}
										</div>
									) : (
										<div
											className='book-chapters__empty-book'
											role='status'
										>
											<div className='book-chapters__empty-book-icon'>
												<BookGlyph />
											</div>
											<p className='book-chapters__empty-book-title'>
												Aún no hay PDFs fuente subidos
											</p>
											<p className='book-chapters__empty-book-text'>
												Sube PDFs en la página de editar
												materia antes de crear tutores con IA.
											</p>
											<Link
												to={`/schooladmins/editsubject/${subjectId}`}
												className='book-chapters__empty-book-link'
											>
												Ir a editar materia
											</Link>
										</div>
									)}
								</section>

								<section
									className={
										'book-chapters__list-section' +
										(!hasDocuments
											? ' book-chapters__list-section--hidden'
											: '')
									}
									aria-labelledby='create-tutor-workflow-heading'
								>
									<div className='book-chapters__list-header'>
										<div>
											<h2
												id='create-tutor-workflow-heading'
												className='book-chapters__section-title'
											>
												2. Crear flujo del tutor con IA
											</h2>
											<p className='book-chapters__section-desc'>
												{selectedDocument
													? (
														<>
															Creando tutores con IA de{' '}
															<strong>
																{documentDisplayName(
																	selectedDocument,
																)}
															</strong>
															. Genera el texto del
															tutor, videos de práctica,
															guiones y archivos por
															capítulo.
														</>
													)
													: 'Selecciona un documento fuente arriba para empezar el flujo del tutor.'}
											</p>
										</div>
										{rows.length > 0 ? (
											<span className='book-chapters__count'>
												{readyCount}/{rows.length}{' '}
												listas
											</span>
										) : null}
									</div>

									<section
										className='view-book__summary create-tutor__summary'
										aria-label='Lecciones listas para el tutor con IA'
									>
										<div className='view-book__summary-card create-tutor__summary-card'>
											<p className='view-book__summary-label'>
												Lecciones web listas
											</p>
											<p className='view-book__summary-value'>
												{readyCount}/{rows.length}
											</p>
											<p className='view-book__summary-hint'>
												{readyCount === 0
													? 'Primero genera lecciones web para este documento y luego crea tutores con IA a partir de ellas.'
													: `${filteredTutorTxtReadyCount} de ${readyCount} lecciones tienen el texto del tutor listo · ${filteredSuggestedQuestionsReadyCount} tienen preguntas sugeridas · ${filteredPracticeVideosReadyCount} tienen todos los videos de práctica de HeyGen · ${filteredVideoScriptReadyCount} tienen guion de video · ${filteredVideoAudioReadyCount} tienen audio de narración · ${filteredSceneIllustrationsReadyCount} tienen ilustraciones de escena · ${filteredTutorVideoReadyCount} tienen video del tutor · ${filteredTutorTranscribeReadyCount} tienen subtítulos.`}
											</p>
										</div>
										<Link
											to={`/schooladmins/generatelessons/${subjectId}`}
											className='view-book__summary-link'
										>
											Gestionar lecciones →
										</Link>
									</section>

									{!hasDocuments ? null : isLoadingSubjects || isLoadingLessons ? (
										<p className='book-chapters__loading'>
											Cargando lecciones…
										</p>
									) : !selectedDocumentId && requiresSourceDocument ? (
										<div className='book-chapters__select-doc-prompt'>
											<p className='book-chapters__select-doc-prompt-title'>
												Elige un documento para continuar
											</p>
											<p className='book-chapters__select-doc-prompt-text'>
												Selecciona uno de tus PDFs fuente
												arriba para empezar el flujo del
												tutor con IA de sus capítulos.
											</p>
										</div>
									) : readyCount === 0 ? (
										<div className='book-chapters__empty-chapters'>
											<p className='book-chapters__empty-chapters-title'>
												Aún no hay lecciones web para este
												documento
											</p>
											<p className='book-chapters__empty-chapters-text'>
												Genera las versiones web a partir
												de los PDF de capítulo antes de
												crear tutores con IA.
											</p>
											<Link
												to={`/schooladmins/generatelessons/${subjectId}`}
												className='book-chapters__empty-chapters-link'
											>
												Ir a generar lecciones
											</Link>
										</div>
									) : (
									<>
										<input
											ref={videoInputRef}
											type='file'
											accept='video/mp4,video/webm,video/quicktime,.mp4,.webm,.mov'
											className='create-tutor__video-input'
											onChange={(event) => {
												void handleVideoFileChange(event)
											}}
										/>
										<input
											ref={transcribeInputRef}
											type='file'
											accept='.srt,text/plain,application/x-subrip'
											className='create-tutor__video-input'
											onChange={(event) => {
												void handleTranscribeFileChange(event)
											}}
										/>
										<input
											ref={practiceVideoInputRef}
											type='file'
											accept='video/mp4,video/webm,video/quicktime,.mp4,.webm,.mov'
											className='create-tutor__video-input'
											onChange={(event) => {
												void handlePracticeVideoFileChange(
													event,
												)
											}}
										/>
										<div className='view-book__groups'>
										{availableGroups.map((group) => (
											<section
												key={
													group.unitNumber == null
														? 'other'
														: `unit-${group.unitNumber}`
												}
												className='view-book__group'
												aria-labelledby={
													`create-tutor-unit-${group.unitNumber ?? 'other'}`
												}
											>
												<h2
													id={
														`create-tutor-unit-${group.unitNumber ?? 'other'}`
													}
													className='view-book__group-title'
												>
													{group.label}
												</h2>
												<ol className='view-book__list'>
													{group.items.map((row) => {
														const chapterKey = String(
															row.chapterId,
														)
														const txtMeta = chapterTxtByChapterId.get(
															chapterKey,
														)
														const videoMeta = chapterVideoByChapterId.get(
															chapterKey,
														)
														const transcribeMeta = chapterTranscribeByChapterId.get(
															chapterKey,
														)
														const questionsMeta = suggestedQuestionsByChapterId.get(
															chapterKey,
														)
														const videoScriptMeta = videoScriptByChapterId.get(
															chapterKey,
														)
														const videoAudioMeta = videoAudioByChapterId.get(
															chapterKey,
														)
														const illustrationsMeta =
															sceneIllustrationsByChapterId.get(
																chapterKey,
															)
														const creatomatePendingMeta = creatomatePendingByChapterId.get(
															chapterKey,
														)
														const hasCreatomatePending = Boolean(
															creatomatePendingMeta?.creatomateRenderId,
														)
														const hasTutorTxt = Boolean(
															txtMeta?.chapterTxtFileId
															|| txtMeta?.chapterTxtFileUrl,
														)
														const hasTutorVideo = Boolean(
															videoMeta?.chapterVideoFileId
															|| videoMeta?.chapterVideoFileUrl,
														)
														const hasTutorTranscribe = Boolean(
															transcribeMeta?.chapterTranscribeFileId
															|| transcribeMeta?.chapterTranscribeFileUrl,
														)
														const hasSuggestedQuestions = Boolean(
															questionsMeta?.count > 0,
														)
														const practiceQuestions = Array.isArray(
															questionsMeta?.items,
														)
															? questionsMeta.items
															: []
														const isPracticePanelOpen =
															expandedPracticeChapterId === chapterKey
														const arePracticeVideosComplete = Boolean(
															questionsMeta?.count > 0
															&& questionsMeta.completeCount
																=== questionsMeta.count,
														)
														const hasVideoScript = Boolean(
															videoScriptMeta?.sceneCount > 0,
														)
														const hasVideoAudio = Boolean(
															videoAudioMeta?.videoScriptAudioFileId
															|| videoAudioMeta?.videoScriptAudioFileUrl,
														)
														const hasSceneIllustrations = Boolean(
															illustrationsMeta?.complete
															|| (
																illustrationsMeta?.count > 0
																&& illustrationsMeta?.total > 0
																&& illustrationsMeta.count
																	>= illustrationsMeta.total
															),
														)
														const hasAnySceneIllustrations = Boolean(
															illustrationsMeta?.count > 0,
														)
														const isGeneratingThis = generatingChapterId
															=== chapterKey
														const isGeneratingQuestionsThis =
															generatingQuestionsChapterId === chapterKey
														const isGeneratingVideoScriptThis =
															generatingVideoScriptChapterId === chapterKey
														const isGeneratingVideoAudioThis =
															generatingVideoAudioChapterId === chapterKey
														const isGeneratingIllustrationsThis =
															generatingIllustrationsChapterId === chapterKey
														const isGeneratingAnimatedVideoThis =
															generatingAnimatedVideoChapterId === chapterKey
														const isCheckingVideoStatusThis =
															checkingVideoStatusChapterId === chapterKey
														const isUploadingThis = uploadingChapterId
															=== chapterKey
														const isUploadingTranscribeThis =
															uploadingTranscribeChapterId === chapterKey
														const chapterError = chapterErrors[chapterKey]
														const questionError = questionErrors[chapterKey]
														const videoScriptError = videoScriptErrors[chapterKey]
														const videoAudioError = videoAudioErrors[chapterKey]
														const illustrationError =
															illustrationErrors[chapterKey]
														const animatedVideoError = animatedVideoErrors[chapterKey]
														const animatedVideoStatusMessage =
															animatedVideoStatusMessages[chapterKey]
														const videoError = videoErrors[chapterKey]
														const transcribeError = transcribeErrors[chapterKey]
														const actionDisabled = Boolean(
															generatingChapterId
															|| generatingQuestionsChapterId
															|| generatingVideoScriptChapterId
															|| generatingVideoAudioChapterId
															|| generatingIllustrationsChapterId
															|| generatingAnimatedVideoChapterId
															|| checkingVideoStatusChapterId
															|| uploadingChapterId
															|| uploadingTranscribeChapterId,
														)
														const videoAudioDisabled = actionDisabled
															|| !hasVideoScript
														const illustrationsDisabled = actionDisabled
															|| !hasVideoScript
														const animatedVideoDisabled = actionDisabled
															|| !hasVideoAudio
														const checkVideoStatusDisabled = actionDisabled
															|| !hasCreatomatePending
														const uploadDisabled = actionDisabled
															|| !hasTutorTxt
														const transcribeUploadDisabled = actionDisabled
															|| !hasTutorVideo

														return (
														<li
															key={
																row.chapterId
																|| `chapter-${row.chapterNumber}`
															}
															className={
																'view-book__item create-tutor__item' +
																(isPracticePanelOpen
																	? ' create-tutor__item--practice-open'
																	: '')
															}
														>
															<div className='view-book__item-main'>
																<span className='view-book__item-num'>
																	{row.chapterNumber}
																</span>
																<div className='view-book__item-copy'>
																	<h3 className='view-book__item-title'>
																		{row.title}
																	</h3>
																	{row.heroSubtitle ? (
																		<p className='view-book__item-subtitle'>
																			{row.heroSubtitle}
																		</p>
																	) : null}
																	{row.pageLabel ? (
																		<p className='view-book__item-meta'>
																			{row.pageLabel}
																		</p>
																	) : null}
																	<Link
																		to={
																			'/schooladmins/lessonpage/' +
																			`${subjectId}/${row.lesson._id}`
																		}
																		className='create-tutor__lesson-link'
																		target='_blank'
																		rel='noopener noreferrer'
																	>
																		Vista previa de la lección web
																		<span
																			className='teacher-book-upload__open-link-icon'
																			aria-hidden
																		>
																			↗
																		</span>
																	</Link>
																	{hasTutorTxt && txtMeta?.chapterTxtFileUrl ? (
																		<p className='create-tutor__txt-status'>
																			<a
																				href={txtMeta.chapterTxtFileUrl}
																				className='create-tutor__txt-link'
																				target='_blank'
																				rel='noopener noreferrer'
																			>
																				Abrir archivo de texto del tutor
																				<span
																					className='teacher-book-upload__open-link-icon'
																					aria-hidden
																				>
																					↗
																				</span>
																			</a>
																		</p>
																	) : null}
																	{hasTutorVideo && videoMeta?.chapterVideoFileUrl ? (
																		<p className='create-tutor__video-status'>
																			<a
																				href={videoMeta.chapterVideoFileUrl}
																				className='create-tutor__video-link'
																				target='_blank'
																				rel='noopener noreferrer'
																			>
																				Abrir video del tutor
																				<span
																					className='teacher-book-upload__open-link-icon'
																					aria-hidden
																				>
																					↗
																				</span>
																			</a>
																		</p>
																	) : null}
																	{hasTutorTranscribe
																		&& transcribeMeta?.chapterTranscribeFileUrl ? (
																		<p className='create-tutor__transcribe-status'>
																			<a
																				href={
																					transcribeMeta.chapterTranscribeFileUrl
																				}
																				className='create-tutor__transcribe-link'
																				target='_blank'
																				rel='noopener noreferrer'
																			>
																				Abrir subtítulos del video
																				<span
																					className='teacher-book-upload__open-link-icon'
																					aria-hidden
																				>
																					↗
																				</span>
																			</a>
																		</p>
																	) : null}
																	{chapterError ? (
																		<p className='create-tutor__error'>
																			{chapterError}
																		</p>
																	) : null}
																	{questionError ? (
																		<p className='create-tutor__error'>
																			{questionError}
																		</p>
																	) : null}
																	{hasSuggestedQuestions ? (
																		<p className='create-tutor__questions-status'>
																			{questionsMeta.count}{' '}
																			preguntas sugeridas listas
																			{questionsMeta.clipTotal > 0
																				? ` · ${questionsMeta.clipCount}/${questionsMeta.clipTotal} clips de HeyGen subidos`
																				: ''}
																		</p>
																	) : null}
																	{videoScriptError ? (
																		<p className='create-tutor__error'>
																			{videoScriptError}
																		</p>
																	) : null}
																	{hasVideoScript ? (
																		<p className='create-tutor__video-script-status'>
																			Guion de video listo
																			{' '}
																			({videoScriptMeta.sceneCount}{' '}
																			{videoScriptMeta.sceneCount === 1
																				? 'escena'
																				: 'escenas'}
																			{videoScriptMeta.estimatedDurationSeconds > 0
																				? ` · ~${Math.round(
																					videoScriptMeta.estimatedDurationSeconds / 60,
																				)} min`
																				: ''}
																			)
																		</p>
																	) : null}
																	{videoAudioError ? (
																		<p className='create-tutor__error'>
																			{videoAudioError}
																		</p>
																	) : null}
																	{hasVideoAudio ? (
																		<p className='create-tutor__video-audio-status'>
																			Audio de narración listo
																			{videoAudioMeta?.videoScriptAudioFileUrl ? (
																				<>
																					{' '}
																					(
																					<a
																						href={
																							videoAudioMeta.videoScriptAudioFileUrl
																						}
																						className='create-tutor__video-audio-link'
																						target='_blank'
																						rel='noopener noreferrer'
																					>
																						escuchar
																					</a>
																					)
																				</>
																			) : null}
																		</p>
																	) : null}
																	{illustrationError ? (
																		<p className='create-tutor__error'>
																			{illustrationError}
																		</p>
																	) : null}
																	{hasAnySceneIllustrations ? (
																		<p className='create-tutor__illustrations-status'>
																			Ilustraciones de escena listas
																			{' '}
																			({illustrationsMeta.count}
																			{illustrationsMeta.total > 0
																				? ` de ${illustrationsMeta.total}`
																				: ''}
																			{' '}
																			{illustrationsMeta.total === 1
																				? 'escena'
																				: 'escenas'}
																			{hasSceneIllustrations
																				? ''
																				: ' · incompleto'}
																			)
																		</p>
																	) : null}
																	{hasCreatomatePending ? (
																		<p className='create-tutor__creatomate-pending-status'>
																			Render de Creatomate en curso
																			{creatomatePendingMeta?.creatomateRenderStatus
																				? ` (${creatomatePendingMeta.creatomateRenderStatus})`
																				: ''}
																			{' '}
																			— usa Revisar estado del video.
																		</p>
																	) : null}
																	{animatedVideoStatusMessage ? (
																		<p className={
																			isVideoAddedToLessonMessage(
																				animatedVideoStatusMessage,
																			)
																				? 'create-tutor__animated-video-success'
																				: 'create-tutor__creatomate-pending-status'
																		}
																		>
																			{animatedVideoStatusMessage}
																			{isVideoAddedToLessonMessage(
																				animatedVideoStatusMessage,
																			)
																				&& videoMeta?.chapterVideoFileUrl ? (
																					<>
																						{' '}
																						(
																						<a
																							href={
																								videoMeta.chapterVideoFileUrl
																							}
																							className='create-tutor__video-audio-link'
																							target='_blank'
																							rel='noopener noreferrer'
																						>
																							ver
																						</a>
																						)
																					</>
																				) : null}
																		</p>
																	) : null}
																	{animatedVideoError ? (
																		<p className='create-tutor__error'>
																			{animatedVideoError}
																		</p>
																	) : null}
																	{videoError ? (
																		<p className='create-tutor__error'>
																			{videoError}
																		</p>
																	) : null}
																	{transcribeError ? (
																		<p className='create-tutor__error'>
																			{transcribeError}
																		</p>
																	) : null}
																</div>
															</div>
															<div className={
																'view-book__item-actions ' +
																'create-tutor__item-actions'
															}
															>
																<button
																	type='button'
																	className={
																		'create-tutor__generate-btn' +
																		(actionDisabled
																			? ' create-tutor__generate-btn--disabled'
																			: '')
																	}
																	disabled={actionDisabled}
																	onClick={() =>
																		void handleGenerateTutorTxt(
																			chapterKey,
																		)}
																>
																	<span className='create-tutor__generate-btn-icon'>
																		<TutorGenerateGlyph />
																	</span>
																	<span className='create-tutor__generate-btn-title'>
																		{isGeneratingThis
																			? 'Extrayendo texto de la lección…'
																			: hasTutorTxt
																				? 'Regenerar tutor con IA para esta lección'
																				: 'Generar tutor con IA para esta lección'}
																	</span>
																</button>
																<button
																	type='button'
																	className={
																		'create-tutor__generate-btn ' +
																		'create-tutor__generate-btn--questions' +
																		(actionDisabled
																			? ' create-tutor__generate-btn--disabled'
																			: '')
																	}
																	disabled={actionDisabled}
																	onClick={() =>
																		void handleGenerateSuggestedQuestions(
																			chapterKey,
																		)}
																>
																	<span className='create-tutor__generate-btn-icon'>
																		<TutorGenerateGlyph />
																	</span>
																	<span className='create-tutor__generate-btn-title'>
																		{isGeneratingQuestionsThis
																			? 'Generando preguntas…'
																			: hasSuggestedQuestions
																				? 'Regenerar 10 preguntas sugeridas'
																				: 'Generar 10 preguntas sugeridas'}
																	</span>
																</button>
																<button
																	type='button'
																	className={
																		'create-tutor__generate-btn ' +
																		'create-tutor__generate-btn--practice' +
																		(!hasSuggestedQuestions
																			? ' create-tutor__generate-btn--disabled'
																			: '')
																	}
																	disabled={!hasSuggestedQuestions}
																	title={
																		!hasSuggestedQuestions
																			? 'Primero genera las 10 preguntas'
																			: undefined
																	}
																	onClick={() => {
																		handleTogglePracticePanel(
																			chapterKey,
																		)
																	}}
																>
																	<span className='create-tutor__generate-btn-icon'>
																		<TutorVideoUploadGlyph />
																	</span>
																	<span className='create-tutor__generate-btn-title'>
																		{isPracticePanelOpen
																			? 'Ocultar videos de práctica de HeyGen'
																			: (arePracticeVideosComplete
																				? 'Revisar videos de práctica de HeyGen'
																				: 'Subir videos de práctica de HeyGen')}
																	</span>
																	{hasSuggestedQuestions ? (
																		<span className='create-tutor__generate-btn-hint'>
																			{questionsMeta.completeCount}/{questionsMeta.count} preguntas completas
																		</span>
																	) : (
																		<span className='create-tutor__generate-btn-hint'>
																			1 video de pregunta + 1 video de respuesta
																		</span>
																	)}
																</button>
																<button
																	type='button'
																	className={
																		'create-tutor__generate-btn ' +
																		'create-tutor__generate-btn--video-script' +
																		(actionDisabled
																			? ' create-tutor__generate-btn--disabled'
																			: '')
																	}
																	disabled={actionDisabled}
																	onClick={() =>
																		void handleGenerateVideoScript(
																			chapterKey,
																		)}
																>
																	<span className='create-tutor__generate-btn-icon'>
																		<TutorGenerateGlyph />
																	</span>
																	<span className='create-tutor__generate-btn-title'>
																		{isGeneratingVideoScriptThis
																			? 'Generando guion de video…'
																			: hasVideoScript
																				? 'Regenerar guion de video'
																				: 'Generar guion de video'}
																	</span>
																</button>
																<button
																	type='button'
																	className={
																		'create-tutor__generate-btn ' +
																		'create-tutor__generate-btn--video-audio' +
																		(videoAudioDisabled
																			? ' create-tutor__generate-btn--disabled'
																			: '')
																	}
																	disabled={videoAudioDisabled}
																	title={
																		!hasVideoScript
																			? 'Primero genera el guion de video'
																			: undefined
																	}
																	onClick={() =>
																		void handleGenerateVideoAudio(
																			chapterKey,
																		)}
																>
																	<span className='create-tutor__generate-btn-icon'>
																		<TutorGenerateGlyph />
																	</span>
																	<span className='create-tutor__generate-btn-title'>
																		{isGeneratingVideoAudioThis
																			? 'Generando audio del video…'
																			: hasVideoAudio
																				? 'Regenerar audio de narración'
																				: 'Generar audio de narración'}
																	</span>
																</button>
																<button
																	type='button'
																	className={
																		'create-tutor__generate-btn ' +
																		'create-tutor__generate-btn--illustrations' +
																		(illustrationsDisabled
																			? ' create-tutor__generate-btn--disabled'
																			: '')
																	}
																	disabled={illustrationsDisabled}
																	title={
																		!hasVideoScript
																			? 'Primero genera el guion de video'
																			: 'Usa OpenAI gpt-image-1-mini (~$0.10–0.20 por capítulo)'
																	}
																	onClick={() =>
																		void handleGenerateSceneIllustrations(
																			chapterKey,
																			hasSceneIllustrations,
																		)}
																>
																	<span className='create-tutor__generate-btn-icon'>
																		<TutorGenerateGlyph />
																	</span>
																	<span className='create-tutor__generate-btn-title'>
																		{isGeneratingIllustrationsThis
																			? 'Generando ilustraciones de escena…'
																			: hasSceneIllustrations
																				? 'Regenerar ilustraciones de escena'
																				: hasAnySceneIllustrations
																					? 'Terminar ilustraciones restantes'
																					: 'Generar ilustraciones de escena'}
																	</span>
																	<span className='create-tutor__generate-btn-hint'>
																		Imágenes de OpenAI · una ilustración por escena
																	</span>
																</button>
																<button
																	type='button'
																	className={
																		'create-tutor__generate-btn ' +
																		'create-tutor__generate-btn--animated-video' +
																		(animatedVideoDisabled
																			? ' create-tutor__generate-btn--disabled'
																			: '')
																	}
																	disabled={animatedVideoDisabled}
																	title={
																		!hasVideoAudio
																			? 'Primero genera el audio de narración'
																			: !hasSceneIllustrations
																				? 'Consejo: genera primero las ilustraciones de escena para un visual más rico'
																				: 'Se renderiza con Creatomate (puede tardar varios minutos)'
																	}
																	onClick={() =>
																		void handleGenerateAnimatedVideo(
																			chapterKey,
																		)}
																>
																	<span className='create-tutor__generate-btn-icon'>
																		<TutorGenerateGlyph />
																	</span>
																	<span className='create-tutor__generate-btn-title'>
																		{isGeneratingAnimatedVideoThis
																			? 'Iniciando render en Creatomate…'
																			: hasCreatomatePending
																				? 'Iniciar un render nuevo en Creatomate'
																				: hasTutorVideo
																					? 'Regenerar video de Creatomate'
																					: 'Generar video de Creatomate'}
																	</span>
																	<span className='create-tutor__generate-btn-hint'>
																		Inicia el render en Creatomate · luego revisa el estado del video
																	</span>
																</button>
																<button
																	type='button'
																	className={
																		'create-tutor__generate-btn ' +
																		'create-tutor__generate-btn--check-video' +
																		(checkVideoStatusDisabled
																			? ' create-tutor__generate-btn--disabled'
																			: '')
																	}
																	disabled={checkVideoStatusDisabled}
																	title={
																		!hasCreatomatePending
																			? 'Primero inicia un render en Creatomate'
																			: 'Revisa si Creatomate terminó y añade el video a la lección'
																	}
																	onClick={() =>
																		void handleCheckVideoStatus(
																			chapterKey,
																		)}
																>
																	<span className='create-tutor__generate-btn-icon'>
																		<TutorGenerateGlyph />
																	</span>
																	<span className='create-tutor__generate-btn-title'>
																		{isCheckingVideoStatusThis
																			? 'Revisando estado del video…'
																			: 'Revisar estado del video'}
																	</span>
																</button>
																<button
																	type='button'
																	className={
																		'create-tutor__upload-video-btn' +
																		(uploadDisabled
																			? ' create-tutor__upload-video-btn--disabled'
																			: '')
																	}
																	disabled={uploadDisabled}
																	title={
																		!hasTutorTxt
																			? 'Primero genera el archivo de texto del tutor'
																			: undefined
																	}
																	onClick={() =>
																		handleUploadVideoClick(chapterKey)}
																>
																	<span className='create-tutor__upload-video-btn-icon'>
																		<TutorVideoUploadGlyph />
																	</span>
																	<span className='create-tutor__upload-video-btn-title'>
																		{isUploadingThis
																			? 'Subiendo video…'
																			: hasTutorVideo
																				? 'Reemplazar video del tutor'
																				: 'Subir video de HeyGen'}
																	</span>
																	<span className='create-tutor__upload-video-btn-hint'>
																		MP4, WebM o MOV · hasta 500 MB
																	</span>
																</button>
																<button
																	type='button'
																	className={
																		'create-tutor__upload-transcribe-btn' +
																		(transcribeUploadDisabled
																			? ' create-tutor__upload-transcribe-btn--disabled'
																			: '')
																	}
																	disabled={transcribeUploadDisabled}
																	title={
																		!hasTutorVideo
																			? 'Primero sube el video del tutor'
																			: undefined
																	}
																	onClick={() =>
																		handleUploadTranscribeClick(chapterKey)}
																>
																	<span className='create-tutor__upload-transcribe-btn-icon'>
																		<TutorTranscribeUploadGlyph />
																	</span>
																	<span className='create-tutor__upload-transcribe-btn-title'>
																		{isUploadingTranscribeThis
																			? 'Subiendo subtítulos…'
																			: hasTutorTranscribe
																				? 'Reemplazar subtítulos'
																				: 'Subir subtítulos del video'}
																	</span>
																	<span className='create-tutor__upload-transcribe-btn-hint'>
																		SRT de HeyGen · se convierte a VTT
																	</span>
																</button>
															</div>
															{isPracticePanelOpen
																&& hasSuggestedQuestions ? (
																<PracticeVideosPanel
																	chapterId={chapterKey}
																	questions={practiceQuestions}
																	uploadingPracticeKey={
																		uploadingPracticeKey
																	}
																	practiceVideoErrors={
																		practiceVideoErrors
																	}
																	onUploadClick={(
																		questionIndex,
																		videoKind,
																	) => {
																		handlePracticeUploadClick(
																			chapterKey,
																			questionIndex,
																			videoKind,
																		)
																	}}
																	onDropFile={(
																		questionIndex,
																		videoKind,
																		file,
																	) => {
																		void uploadPracticeVideoFile(
																			chapterKey,
																			questionIndex,
																			videoKind,
																			file,
																		)
																	}}
																/>
															) : null}
														</li>
														)
													})}
												</ol>
											</section>
										))}
										</div>
									</>
								)}
								</section>
							</div>
						</div>
					</div>
				</div>
			</div>
		</div>
	)
}

export default SchoolAdminCreateTutor
