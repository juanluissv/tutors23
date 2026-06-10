import React, {
	useEffect,
	useMemo,
	useRef,
	useState,
} from 'react'
import {
	Link,
	useNavigate,
	useParams,
} from 'react-router-dom'
import { useSelector } from 'react-redux'
import Sidebar from '../../components/Sidebar'
import Header from '../../components/Header'
import { useGetStudentAnswerByIdQuery } from '../../slices/student/studentAnswersSlice'
import { useGetProfileQuery } from '../../slices/student/studentApiSlice'
import {
	resolveCurrentSubscription,
	canViewQuestions,
	getSubscriptionBlockReason,
} from '../../utils/subscriptionAccess'
import { ANSWERS_URL } from '../../constants'
import '../../App.css'

const SUBJECT_THEME_CYCLE = ['sky', 'teal', 'indigo']

function subjectThemeForAnswerId (id) {
	const s = String(id ?? '')
	let sum = 0
	for (let i = 0; i < s.length; i += 1) {
		sum += s.charCodeAt(i)
	}
	return SUBJECT_THEME_CYCLE[sum % SUBJECT_THEME_CYCLE.length]
}

function formatPlaybackClock (seconds) {
	if (!Number.isFinite(seconds) || seconds < 0) {
		return '0:00'
	}
	const m = Math.floor(seconds / 60)
	const sec = Math.floor(seconds % 60)
	return `${m}:${String(sec).padStart(2, '0')}`
}

function isLikelyMongoId (value) {
	return typeof value === 'string' && /^[a-f\d]{24}$/i.test(value)
}

function teacherDisplayName (teacher) {
	if (!teacher || typeof teacher !== 'object') {
		return 'Teacher'
	}
	const parts = [teacher.firstname, teacher.lastname].filter(Boolean)
	return parts.length > 0 ? parts.join(' ') : 'Teacher'
}

function formatAnswerDate (value) {
	if (value == null) {
		return ''
	}
	const d = value instanceof Date ? value : new Date(value)
	if (Number.isNaN(d.getTime())) {
		return ''
	}
	return d.toLocaleDateString(undefined, {
		year: 'numeric',
		month: 'short',
		day: 'numeric',
	})
}

const PlayIconLarge = () => (
	<svg
		width='48'
		height='48'
		viewBox='0 0 48 48'
		fill='none'
		xmlns='http://www.w3.org/2000/svg'
		aria-hidden
	>
		<circle cx='24' cy='24' r='24' fill='rgba(255,255,255,0.92)' />
		<path d='M19 15l14 9-14 9V15z' fill='url(#sa-play-lg)' />
		<defs>
			<linearGradient
				id='sa-play-lg'
				x1='19'
				y1='15'
				x2='33'
				y2='24'
				gradientUnits='userSpaceOnUse'
			>
				<stop stopColor='#0369a1' />
				<stop offset='1' stopColor='#0ea5e9' />
			</linearGradient>
		</defs>
	</svg>
)

const IconVolumeHigh = () => (
	<svg
		width='16'
		height='16'
		viewBox='0 0 24 24'
		fill='#475569'
		aria-hidden
	>
		<path d='M3 9v6h4l5 5V4L7 9H3zm13.5 3A4.5 4.5 0 0014 8v8a4.5 4.5 0 003.5-4.5zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z' />
	</svg>
)

const IconVolumeMute = () => (
	<svg
		width='16'
		height='16'
		viewBox='0 0 24 24'
		fill='#475569'
		aria-hidden
	>
		<path d='M16.5 12c0-1.77-1.02-3.29-2.5-4.03v2.21l2.45 2.45c.03-.2.05-.41.05-.63zm2.5 0c0 .94-.2 1.82-.54 2.64l1.51 1.51A8.986 8.986 0 0021.5 12c0-4.28-2.99-7.86-7-8.77v2.11c2.28.86 4 3.04 4 5.66zM4.27 3 3 4.27 7.73 9H3v6h4l5 5v-6.73l4.25 4.25c-.67.52-1.42.93-2.25 1.18v2.06c1.38-.31 2.63-.95 3.69-1.81L19.73 21 21 19.73l-9-9L4.27 3zM12 4.09 9.91 6.17 12 8.27V4.09z' />
	</svg>
)

const IconFullscreen = () => (
	<svg
		width='16'
		height='16'
		viewBox='0 0 24 24'
		fill='none'
		stroke='#475569'
		strokeWidth='2'
		strokeLinecap='round'
		aria-hidden
	>
		<path d='M8 3H5a2 2 0 00-2 2v3M21 8V5a2 2 0 00-2-2h-3M3 16v3a2 2 0 002 2h3M16 21h3a2 2 0 002-2v-3' />
	</svg>
)


/**
 * Watch a teacher’s recorded answer (same video pipeline as teacher views of
 * questions: GET answers → redirect / signed S3).
 */
function StudentWatchAnswerScreen () {
	const navigate = useNavigate()
	const { answerId: answerIdParam } = useParams()
	const answerId = answerIdParam ? String(answerIdParam).trim() : ''

	const { studentInfo } = useSelector((state) => state.authStudent)

	const {
		data: profile,
		isLoading: isLoadingProfile,
	} = useGetProfileQuery(undefined, {
		skip: !studentInfo,
	})

	const currentSubscription = resolveCurrentSubscription(
		profile?.subscriptions,
	)
	const canView = canViewQuestions(currentSubscription)
	const viewBlockReason = getSubscriptionBlockReason(
		currentSubscription,
		'view',
	)

	const canFetch = isLikelyMongoId(answerId)
	const {
		data: answer,
		isLoading,
		isError,
		error,
		refetch,
	} = useGetStudentAnswerByIdQuery(answerId, {
		skip: !canFetch || isLoadingProfile || !canView,
	})

	const videoSrc =
		answer?.mediaId && String(answer.mediaId).trim() !== ''
			? `${ANSWERS_URL}/student/${answerId}/video`
			: null

	const subjectTitle =
		answer?.subject && typeof answer.subject === 'object'
			? answer.subject.title
			: 'Subject'
	const subjectColor = answer
		? subjectThemeForAnswerId(answer._id)
		: 'sky'

	const questionTitle = useMemo(() => {
		if (answer?.question && typeof answer.question === 'object') {
			const t = answer.question.title
			if (t != null && String(t).trim() !== '') {
				return String(t).trim()
			}
		}
		const t = answer?.title
		return t != null && String(t).trim() !== ''
			? String(t).trim()
			: 'Your question'
	}, [answer])

	const [isPlaying, setIsPlaying] = useState(false)
	const [progressPct, setProgressPct] = useState(0)
	const [currentTime, setCurrentTime] = useState(0)
	const [duration, setDuration] = useState(0)
	const videoRef = useRef(null)
	const videoAreaRef = useRef(null)

	const [volume, setVolume] = useState(1)
	const [isMuted, setIsMuted] = useState(false)
	const [isFullscreen, setIsFullscreen] = useState(false)

	const [isSidebarOpen, setIsSidebarOpen] = useState(
		window.innerWidth > 768,
	)

	const toggleSidebar = () => {
		setIsSidebarOpen((prev) => !prev)
	}

	useEffect(() => {
		if (!studentInfo) {
			const next = encodeURIComponent(
				answerId !== ''
					? `/students/watchanswer/${answerId}`
					: '/students/newanswers',
			)
			navigate(`/login?redirect=${next}`, { replace: true })
		}
	}, [studentInfo, navigate, answerId])

	useEffect(() => {
		const v = videoRef.current
		if (!v || !videoSrc) {
			return undefined
		}
		const onPlay = () => setIsPlaying(true)
		const onPause = () => setIsPlaying(false)
		const onEnded = () => setIsPlaying(false)
		const onVolumeChange = () => {
			setVolume(v.volume)
			setIsMuted(v.muted)
		}
		v.addEventListener('play', onPlay)
		v.addEventListener('pause', onPause)
		v.addEventListener('ended', onEnded)
		v.addEventListener('volumechange', onVolumeChange)
		onVolumeChange()
		return () => {
			v.removeEventListener('play', onPlay)
			v.removeEventListener('pause', onPause)
			v.removeEventListener('ended', onEnded)
			v.removeEventListener('volumechange', onVolumeChange)
		}
	}, [videoSrc, answerId])

	useEffect(() => {
		const onFsChange = () => {
			const area = videoAreaRef.current
			const doc = document
			const active = area
				&& (
					doc.fullscreenElement === area
					|| doc.webkitFullscreenElement === area
				)
			setIsFullscreen(!!active)
		}
		document.addEventListener('fullscreenchange', onFsChange)
		document.addEventListener('webkitfullscreenchange', onFsChange)
		return () => {
			document.removeEventListener('fullscreenchange', onFsChange)
			document.removeEventListener('webkitfullscreenchange', onFsChange)
		}
	}, [])

	useEffect(() => {
		setIsPlaying(false)
		setProgressPct(0)
		setCurrentTime(0)
		setDuration(0)
		setVolume(1)
		setIsMuted(false)
		const v = videoRef.current
		if (v) {
			v.volume = 1
			v.muted = false
		}
	}, [answerId])

	const handlePlayToggle = () => {
		const v = videoRef.current
		if (!v || !videoSrc) {
			return
		}
		if (v.paused) {
			v.play().catch(() => {})
		} else {
			v.pause()
		}
	}

	const handleTimeUpdate = () => {
		const v = videoRef.current
		if (!v || !Number.isFinite(v.duration) || v.duration <= 0) {
			return
		}
		setDuration(v.duration)
		setCurrentTime(v.currentTime)
		setProgressPct((v.currentTime / v.duration) * 100)
	}

	const handleLoadedMetadata = () => {
		const v = videoRef.current
		if (!v || !Number.isFinite(v.duration)) {
			return
		}
		setDuration(v.duration)
	}

	const handleVideoAreaClick = () => {
		if (videoSrc) {
			handlePlayToggle()
		}
	}

	const handleVolumeChange = (e) => {
		const v = videoRef.current
		if (!v || !videoSrc) {
			return
		}
		const val = parseFloat(e.target.value)
		v.muted = false
		v.volume = val
	}

	const handleMuteToggle = () => {
		const v = videoRef.current
		if (!v || !videoSrc) {
			return
		}
		v.muted = !v.muted
	}

	const handleFullscreenToggle = () => {
		const area = videoAreaRef.current
		if (!area || !videoSrc) {
			return
		}
		const doc = document
		const active = doc.fullscreenElement === area
			|| doc.webkitFullscreenElement === area
		if (active) {
			if (doc.exitFullscreen) {
				void doc.exitFullscreen()
			} else if (doc.webkitExitFullscreen) {
				void doc.webkitExitFullscreen()
			}
		} else if (area.requestFullscreen) {
			void area.requestFullscreen()
		} else if (area.webkitRequestFullscreen) {
			void area.webkitRequestFullscreen()
		}
	}

	const remaining =
		duration > 0 ? Math.max(0, duration - currentTime) : 0
	const timeLabel =
		duration > 0 ? `-${formatPlaybackClock(remaining)}` : '0:00'

	const errorMessage =
		error?.data?.message || error?.error || 'Could not load this answer.'

	if (!studentInfo) {
		return null
	}

	return (
		<div className='chat-app ask-screen'>
			<div className='main-container'>
				<Sidebar isOpen={isSidebarOpen} toggleSidebar={toggleSidebar} />
				<div className='main-content'>
					<Header
						isSidebarOpen={isSidebarOpen}
						toggleSidebar={toggleSidebar}
					/>
					<div className='content-area'>
						<div className='watch-new'>
							{/* <Link
								to='/students/newanswers'
								className='watch-new__back'
							>
								&#8592; Back to new answers
							</Link> */}

							{!canFetch && (
								<>
									<p className='watch-new__description'>
										Missing or invalid answer link. Open an answer from the
										list.
									</p>
									<Link
										to='/students/newanswers'
										className='watch-new__answer-btn'
										style={{ marginTop: '1rem', display: 'inline-block' }}
									>
										Go to new answers
									</Link>
								</>
							)}

							{canFetch && !isLoadingProfile && !canView ? (
								<div className='ask-subscription-notice'>
									<p className='ask-subscription-notice__title'>
										Subscription required
									</p>
									<p className='ask-subscription-notice__text'>
										{viewBlockReason}
									</p>
									<Link
										to='/students/subscription'
										className='ask-subscription-notice__link'
									>
										View plans & subscribe
									</Link>
								</div>
							) : null}

							{canFetch && canView && isLoading && (
								<p className='watch-new__description'>Loading answer…</p>
							)}

							{canFetch && canView && isError && (
								<div style={{ marginBottom: '1rem' }}>
									<p className='watch-new__description'>{errorMessage}</p>
									<button
										type='button'
										className='watch-new__ctrl-btn'
										style={{ marginTop: '0.5rem' }}
										onClick={() => refetch()}
									>
										Try again
									</button>
								</div>
							)}

							{canFetch && canView && answer && (
								<>
									<h1
										className={`watch-new__subject watch-new__subject--${subjectColor}`}
									>
										{subjectTitle}
									</h1>
									<div
										className={`watch-new__subject-line watch-new__subject-line--${subjectColor}`}
									/>

									<div className='watch-new__player'>
										<div
											ref={videoAreaRef}
											className={
												'watch-new__video-area'
												+ (videoSrc
													? ' watch-new__video-area--live'
													: '')
											}
											onClick={handleVideoAreaClick}
											onKeyDown={(e) => {
												if (
													e.key === 'Enter'
													|| e.key === ' '
												) {
													e.preventDefault()
													handleVideoAreaClick()
												}
											}}
											role={videoSrc ? 'button' : undefined}
											tabIndex={videoSrc ? 0 : undefined}
										>
											{videoSrc && isFullscreen ? (
												<button
													type='button'
													className='watch-new__fs-exit'
													onClick={(e) => {
														e.stopPropagation()
														handleFullscreenToggle()
													}}
												>
													Exit full screen
												</button>
											) : null}
											<video
												key={`${answerId}-${videoSrc ? '1' : '0'}`}
												ref={videoRef}
												className='watch-new__video'
												src={videoSrc || undefined}
												playsInline
												preload='metadata'
												onTimeUpdate={handleTimeUpdate}
												onLoadedMetadata={handleLoadedMetadata}
											/>
											{!videoSrc && (
												<div className='watch-new__video-placeholder'>
													<p className='watch-new__description'>
														No video uploaded for this answer yet.
													</p>
													<div className='watch-new__placeholder-lines'>
														<div className='watch-new__ph-line' />
														<div className='watch-new__ph-line watch-new__ph-line--short' />
														<div className='watch-new__ph-line' />
														<div className='watch-new__ph-line watch-new__ph-line--short' />
													</div>
												</div>
											)}
											{videoSrc && (
												<button
													type='button'
													className={
														'watch-new__play-btn'
														+ (isPlaying
															? ' watch-new__play-btn--hidden'
															: '')
													}
													onClick={(e) => {
														e.stopPropagation()
														handlePlayToggle()
													}}
													aria-label={isPlaying ? 'Pause' : 'Play'}
												>
													<PlayIconLarge />
												</button>
											)}
										</div>

										{!isFullscreen ? (
											<div className='watch-new__controls'>
												<button
													type='button'
													className='watch-new__ctrl-btn'
													onClick={handlePlayToggle}
													disabled={!videoSrc}
													aria-label={isPlaying ? 'Pause' : 'Play'}
												>
													{isPlaying ? (
														<svg width='16' height='16' viewBox='0 0 24 24' fill='#475569'>
															<rect x='6' y='4' width='4' height='16' rx='1' />
															<rect x='14' y='4' width='4' height='16' rx='1' />
														</svg>
													) : (
														<svg width='16' height='16' viewBox='0 0 24 24' fill='#475569'>
															<path d='M8 5v14l11-7z' />
														</svg>
													)}
												</button>
												<div className='watch-new__progress'>
													<div className='watch-new__progress-bar'>
														<div
															className='watch-new__progress-fill'
															style={{
																width: `${progressPct}%`,
															}}
														/>
													</div>
												</div>
												<div className='watch-new__volume-wrap'>
													<button
														type='button'
														className='watch-new__ctrl-btn'
														onClick={handleMuteToggle}
														disabled={!videoSrc}
														aria-label={
															isMuted ? 'Unmute' : 'Mute'
														}
													>
														{isMuted || volume === 0
															? <IconVolumeMute />
															: <IconVolumeHigh />}
													</button>
													<input
														type='range'
														className='watch-new__volume'
														min={0}
														max={1}
														step={0.05}
														value={isMuted ? 0 : volume}
														onChange={handleVolumeChange}
														disabled={!videoSrc}
														aria-label='Volume'
													/>
												</div>
												<button
													type='button'
													className='watch-new__ctrl-btn'
													onClick={handleFullscreenToggle}
													disabled={!videoSrc}
													aria-label='Full screen'
												>
													<IconFullscreen />
												</button>
												<span className='watch-new__time'>{timeLabel}</span>
											</div>
										) : null}
									</div>

									<div className='watch-new__info'>
										<h2 className='watch-new__title'>
											{questionTitle}
										</h2>
										<p className='watch-new__description'>
											{answer.description && String(answer.description).trim() !== ''
												? answer.description
												: 'The teacher replied with text and/or video above.'}
										</p>
										<span className='watch-new__meta'>
											{`${teacherDisplayName(answer.teacher)}`}
											{formatAnswerDate(
												answer.dateCreated
													|| answer.createdAt,
											)
												? ` · ${formatAnswerDate(
													answer.dateCreated || answer.createdAt,
												)}`
												: ''}
										</span>
									</div>
								</>
							)}
						</div>
					</div>
				</div>
			</div>
		</div>
	)
}

export default StudentWatchAnswerScreen
