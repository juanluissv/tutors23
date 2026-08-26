import { useEffect, useMemo, useRef, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { useSelector } from 'react-redux'
import TeacherSidebar from '../../components/TeacherSidebar'
import TeacherHeader from '../../components/TeacherHeader'
import {
	useGenerateChapterTutorTxtFromLessonByTeacherMutation,
	useGenerateSuggestedQuestionsFromLessonByTeacherMutation,
	useGenerateVideoScriptFromLessonByTeacherMutation,
	useGenerateVideoScriptAudioFromLessonByTeacherMutation,
	useGenerateSceneIllustrationsFromLessonByTeacherMutation,
	useGenerateAnimatedVideoFromLessonByTeacherMutation,
	useCheckAnimatedVideoStatusFromLessonByTeacherMutation,
	useGetBookLessonsBySubjectForTeacherQuery,
	useGetSubjectsByTeacherIdQuery,
	useUploadChapterTutorVideoByTeacherMutation,
	useUploadChapterTutorTranscribeByTeacherMutation,
} from '../../slices/teachers/teacherApiSlice'
import { buildBookIndex } from '../../utils/buildBookIndex'
import '../../App.css'

const OBJECT_ID_RE = /^[a-fA-F0-9]{24}$/

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

function TeacherCreateTutorScreen () {
	const navigate = useNavigate()
	const { subjectId } = useParams()
	const { teacherInfo } = useSelector((state) => state.authTeacher)
	const teacherId = teacherInfo?._id
		? String(teacherInfo._id)
		: null

	const [isSidebarOpen, setIsSidebarOpen] = useState(
		window.innerWidth > 768,
	)
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

	const [generateTutorTxt] = useGenerateChapterTutorTxtFromLessonByTeacherMutation()
	const [generateSuggestedQuestions] =
		useGenerateSuggestedQuestionsFromLessonByTeacherMutation()
	const [generateVideoScript] =
		useGenerateVideoScriptFromLessonByTeacherMutation()
	const [generateVideoScriptAudio] =
		useGenerateVideoScriptAudioFromLessonByTeacherMutation()
	const [generateSceneIllustrations] =
		useGenerateSceneIllustrationsFromLessonByTeacherMutation()
	const [generateAnimatedVideo] =
		useGenerateAnimatedVideoFromLessonByTeacherMutation()
	const [checkAnimatedVideoStatus] =
		useCheckAnimatedVideoStatusFromLessonByTeacherMutation()
	const [uploadChapterTutorVideo] = useUploadChapterTutorVideoByTeacherMutation()
	const [uploadChapterTutorTranscribe] =
		useUploadChapterTutorTranscribeByTeacherMutation()

	const isValidSubjectParam =
		subjectId != null && OBJECT_ID_RE.test(String(subjectId))

	const {
		data: subjects = [],
		isLoading: isLoadingSubjects,
		isError: isSubjectsError,
		refetch: refetchSubjects,
	} = useGetSubjectsByTeacherIdQuery(teacherId, {
		skip: !teacherId,
	})

	const {
		data: bookLessons = [],
		isLoading: isLoadingLessons,
		isError: isLessonsError,
		refetch: refetchLessons,
	} = useGetBookLessonsBySubjectForTeacherQuery(subjectId, {
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
		() => buildBookIndex(bookChapters, lessonsByChapterId),
		[bookChapters, lessonsByChapterId],
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

	const tutorTxtReadyCount = chapterTxtByChapterId.size

	const suggestedQuestionsByChapterId = useMemo(() => {
		const map = new Map()
		for (const lesson of bookLessons) {
			const chapterId = lesson?.bookChapter?.chapterId
			if (!chapterId) {
				continue
			}
			const count = Array.isArray(lesson?.suggestedQuestions)
				? lesson.suggestedQuestions.length
				: 0
			if (count > 0 || lesson?.hasSuggestedQuestions) {
				map.set(String(chapterId), {
					count: count || 10,
				})
			}
		}
		return map
	}, [bookLessons])

	const suggestedQuestionsReadyCount = suggestedQuestionsByChapterId.size

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

	const videoScriptReadyCount = videoScriptByChapterId.size

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

	const videoAudioReadyCount = videoAudioByChapterId.size

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

	const sceneIllustrationsReadyCount = sceneIllustrationsByChapterId.size

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

	const tutorVideoReadyCount = chapterVideoByChapterId.size

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

	const tutorTranscribeReadyCount = chapterTranscribeByChapterId.size

	useEffect(() => {
		if (!teacherInfo) {
			navigate('/teachers/login', { replace: true })
		}
	}, [teacherInfo, navigate])

	const toggleSidebar = () => {
		setIsSidebarOpen(!isSidebarOpen)
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
				teacherId,
			}).unwrap()
			await refetchSubjects()
		} catch (err) {
			const message = err?.data?.message
				|| err?.message
				|| 'Could not generate the tutor text file. Please try again.'
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
		} catch (err) {
			const message = err?.data?.message
				|| err?.message
				|| 'Could not generate suggested questions. Please try again.'
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
				|| 'Could not generate video script. Please try again.'
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
				|| 'Could not generate video narration audio. Please try again.'
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
				|| 'Could not generate scene illustrations. Please try again.'
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
				|| 'Creatomate render started. Use Check video status when ready.'
			setAnimatedVideoStatusMessages((prev) => ({
				...prev,
				[String(chapterId)]: message,
			}))
		} catch (err) {
			const message = err?.data?.message
				|| err?.message
				|| 'Could not generate animated video. Please try again.'
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
					? 'Video is ready and added to the lesson.'
					: 'Video is still processing on Creatomate.')
			setAnimatedVideoStatusMessages((prev) => ({
				...prev,
				[String(chapterId)]: message,
			}))
		} catch (err) {
			const message = err?.data?.message
				|| err?.message
				|| 'Could not check video status. Please try again.'
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
				|| 'Could not upload the tutor video. Please try again.'
			setVideoErrors((prev) => ({
				...prev,
				[chapterId]: message,
			}))
		} finally {
			setUploadingChapterId(null)
		}
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
				|| 'Could not upload the video captions. Please try again.'
			setTranscribeErrors((prev) => ({
				...prev,
				[chapterId]: message,
			}))
		} finally {
			setUploadingTranscribeChapterId(null)
		}
	}

	if (!teacherInfo) {
		return null
	}

	if (!isValidSubjectParam) {
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
						<div className='content-area content-area--login'>
							<div className='center-content2 login-screen login-screen--wide'>
								<div className='login-card'>
									<div className='login-card__accent' aria-hidden />
									<div className='login-card__header'>
										<h1 className='login-card__title'>
											Invalid subject
										</h1>
										<p className='login-card__back'>
											<Link
												to='/teachers/subjects'
												className='login-card__link'
											>
												← Back to subjects
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
								<div className='login-card'>
									<div className='login-card__accent' aria-hidden />
									<div className='login-card__header'>
										<h1 className='login-card__title'>
											Subject not found
										</h1>
										<p className='login-card__back'>
											<Link
												to='/teachers/subjects'
												className='login-card__link'
											>
												← Back to subjects
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
		: 'Subject'

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
					<div className={
						'content-area content-area--login ' +
						'content-area--login-scroll'
					}
					>
						<div className='center-content2 login-screen login-screen--wide'>
							<div className={
								'login-card book-chapters view-book create-tutor'
							}
							>
								<div className='login-card__accent' aria-hidden />
								<div className='login-card__header'>
									<p className='login-card__back'>
										<Link
											to='/teachers/subjects'
											className='login-card__link'
										>
											← Back to subjects
										</Link>
									</p>
									<h1 className='login-card__title'>
										Create AI tutor
									</h1>
									<p className={
										'login-card__subtitle ' +
										'login-card__subtitle--wide'
									}
									>
										Generate an AI tutor for each web lesson
										in{' '}
										<strong>{subjectTitle}</strong>. Pick a
										chapter below to start.
									</p>
									<p className='create-tutor__book-link-wrap'>
										<Link
											to={`/teachers/generatelessons/${subjectId}`}
											className='create-tutor__book-link'
										>
											Manage web lessons →
										</Link>
									</p>
								</div>

								{isSubjectsError || isLessonsError ? (
									<div className='book-chapters__alert'>
										<p className='book-chapters__alert-text'>
											We could not load the lessons.
											Please try again.
										</p>
										<button
											type='button'
											className='login-submit'
											onClick={() => {
												void refetchSubjects()
												void refetchLessons()
											}}
										>
											Try again
										</button>
									</div>
								) : null}

								<section
									className='view-book__summary create-tutor__summary'
									aria-label='Lessons ready for AI tutor'
								>
									<div className='view-book__summary-card create-tutor__summary-card'>
										<p className='view-book__summary-label'>
											Web lessons ready
										</p>
										<p className='view-book__summary-value'>
											{readyCount}/{rows.length}
										</p>
										<p className='view-book__summary-hint'>
											{readyCount === 0
												? 'Generate web lessons first, then create AI tutors from them.'
												: `${tutorTxtReadyCount} of ${readyCount} lessons have tutor text files ready · ${suggestedQuestionsReadyCount} have suggested questions · ${videoScriptReadyCount} have video scripts · ${videoAudioReadyCount} have video narration audio · ${sceneIllustrationsReadyCount} have scene illustrations · ${tutorVideoReadyCount} have tutor videos uploaded · ${tutorTranscribeReadyCount} have captions.`}
										</p>
									</div>
									<Link
										to={`/teachers/generatelessons/${subjectId}`}
										className='view-book__summary-link'
									>
										Manage lessons →
									</Link>
								</section>

								{isLoadingSubjects || isLoadingLessons ? (
									<p className='book-chapters__loading'>
										Loading lessons…
									</p>
								) : readyCount === 0 ? (
									<div className='book-chapters__empty-chapters'>
										<p className='book-chapters__empty-chapters-title'>
											No web lessons yet
										</p>
										<p className='book-chapters__empty-chapters-text'>
											Generate web versions from chapter
											PDFs before creating AI tutors.
										</p>
										<Link
											to={`/teachers/generatelessons/${subjectId}`}
											className='book-chapters__empty-chapters-link'
										>
											Go to generate lessons
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
															className='view-book__item create-tutor__item'
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
																			'/teachers/lessonpage/' +
																			`${subjectId}/${row.lesson._id}`
																		}
																		className='create-tutor__lesson-link'
																		target='_blank'
																		rel='noopener noreferrer'
																	>
																		Preview web lesson
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
																				Open tutor text file
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
																				Open tutor video
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
																				Open video captions
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
																			{questionsMeta.count} suggested
																			{' '}
																			questions ready for students
																		</p>
																	) : null}
																	{videoScriptError ? (
																		<p className='create-tutor__error'>
																			{videoScriptError}
																		</p>
																	) : null}
																	{hasVideoScript ? (
																		<p className='create-tutor__video-script-status'>
																			Video script ready
																			{' '}
																			({videoScriptMeta.sceneCount} scenes
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
																			Video narration audio ready
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
																						listen
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
																			Scene illustrations ready
																			{' '}
																			({illustrationsMeta.count}
																			{illustrationsMeta.total > 0
																				? ` of ${illustrationsMeta.total}`
																				: ''}
																			{' '}
																			scenes
																			{hasSceneIllustrations
																				? ''
																				: ' · incomplete'}
																			)
																		</p>
																	) : null}
																	{hasCreatomatePending ? (
																		<p className='create-tutor__creatomate-pending-status'>
																			Creatomate render in progress
																			{creatomatePendingMeta?.creatomateRenderStatus
																				? ` (${creatomatePendingMeta.creatomateRenderStatus})`
																				: ''}
																			{' '}
																			— use Check video status.
																		</p>
																	) : null}
																	{animatedVideoStatusMessage ? (
																		<p className={
																			animatedVideoStatusMessage
																				.toLowerCase()
																				.includes('added to the lesson')
																				? 'create-tutor__animated-video-success'
																				: 'create-tutor__creatomate-pending-status'
																		}
																		>
																			{animatedVideoStatusMessage}
																			{animatedVideoStatusMessage
																				.toLowerCase()
																				.includes('added to the lesson')
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
																							watch
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
																			? 'Extracting lesson text…'
																			: hasTutorTxt
																				? 'Regenerate AI tutor for this lesson'
																				: 'Generate AI tutor for this lesson'}
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
																			? 'Generating questions…'
																			: hasSuggestedQuestions
																				? 'Regenerate 10 suggested questions'
																				: 'Generate 10 suggested questions'}
																	</span>
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
																			? 'Generating video script…'
																			: hasVideoScript
																				? 'Regenerate video script'
																				: 'Generate video script'}
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
																			? 'Generate the video script first'
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
																			? 'Generating video audio…'
																			: hasVideoAudio
																				? 'Regenerate video narration audio'
																				: 'Generate video narration audio'}
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
																			? 'Generate the video script first'
																			: 'Uses OpenAI gpt-image-1-mini (~$0.10–0.20 per chapter)'
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
																			? 'Generating scene illustrations…'
																			: hasSceneIllustrations
																				? 'Regenerate scene illustrations'
																				: hasAnySceneIllustrations
																					? 'Finish remaining illustrations'
																					: 'Generate scene illustrations'}
																	</span>
																	<span className='create-tutor__generate-btn-hint'>
																		OpenAI images · one illustration per scene
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
																			? 'Generate the video narration audio first'
																			: !hasSceneIllustrations
																				? 'Tip: generate scene illustrations first for richer visuals'
																				: 'Renders with Creatomate (may take several minutes)'
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
																			? 'Starting Creatomate render…'
																			: hasCreatomatePending
																				? 'Start new Creatomate render'
																				: hasTutorVideo
																					? 'Regenerate Creatomate video'
																					: 'Generate Creatomate video'}
																	</span>
																	<span className='create-tutor__generate-btn-hint'>
																		Starts render on Creatomate · then Check video status
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
																			? 'Start a Creatomate render first'
																			: 'Check if Creatomate finished and add video to lesson'
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
																			? 'Checking video status…'
																			: 'Check video status'}
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
																			? 'Generate the tutor text file first'
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
																			? 'Uploading video…'
																			: hasTutorVideo
																				? 'Replace tutor video'
																				: 'Upload HeyGen video'}
																	</span>
																	<span className='create-tutor__upload-video-btn-hint'>
																		MP4, WebM or MOV · up to 500 MB
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
																			? 'Upload the tutor video first'
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
																			? 'Uploading captions…'
																			: hasTutorTranscribe
																				? 'Replace video captions'
																				: 'Upload video captions'}
																	</span>
																	<span className='create-tutor__upload-transcribe-btn-hint'>
																		SRT from HeyGen · converted to VTT
																	</span>
																</button>
															</div>
														</li>
														)
													})}
												</ol>
											</section>
										))}
										</div>
									</>
								)}
							</div>
						</div>
					</div>
				</div>
			</div>
		</div>
	)
}

export default TeacherCreateTutorScreen
