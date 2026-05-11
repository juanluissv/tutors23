import React, { useState, useEffect, useRef } from 'react'
import { Button } from 'react-bootstrap'
import { Link } from 'react-router-dom'
import { useReactMediaRecorder } from 'react-media-recorder'
import fixWebmDuration from 'webm-duration-fix'
import { useParams, useNavigate } from 'react-router-dom'
import { useSelector } from 'react-redux'
import { toast } from 'react-toastify'
import TeacherSidebar from '../../components/TeacherSidebar'
import TeacherHeader from '../../components/TeacherHeader'
import { useUploadTeacherAnswerVideoMutation } from '../../slices/teachers/teacherAnswersSlice'
import '../../App.css'

const recIconSrc = `${process.env.PUBLIC_URL}/assets/img/rec3.png`
const stopIconSrc = `${process.env.PUBLIC_URL}/assets/img/stop1.png`
const screenHintGifSrc = `${process.env.PUBLIC_URL}/assets/img/rec4.gif`

function TeacherRecordScreen () {
	const navigate = useNavigate()
	const { id } = useParams()
	const { teacherInfo } = useSelector((state) => state.authTeacher)
	const teacherId = teacherInfo?._id ? String(teacherInfo._id) : null

	const [isSidebarOpen, setIsSidebarOpen] = useState(
		window.innerWidth > 768,
	)

	const toggleSidebar = () => {
		setIsSidebarOpen(!isSidebarOpen)
	}

	const mimeType = 'video/webm;codecs=vp9'

	const [showRecordButtons, setshowRecordButtons] = useState(true)
	const [showStopButtons, setshowStopButtons] = useState(false)
	const [showVideo, setshowVideo] = useState(false)
	const [isRecording, setIsRecording] = useState(false)
	const [timeLeft, setTimeLeft] = useState(300)
	const [recordedBlob, setRecordedBlob] = useState(null)

	const [uploadVideo, { isLoading: isUploading }] =
		useUploadTeacherAnswerVideoMutation()

	useEffect(() => {
		if (!teacherInfo) {
			navigate('/teachers/login', { replace: true })
		}
	}, [teacherInfo, navigate])

	const startRec = () => {
		setIsRecording(true)
		//setTimeLeft(300)
	}

	const stopRec = () => {
		setIsRecording(false)
		//setTimeLeft(0)
	}

	// useEffect(() => {
	// 	let timer
	// 	if (isRecording && timeLeft > 0) {
	// 		timer = setTimeout(() => {
	// 			setTimeLeft(timeLeft - 1)
	// 		}, 1000)
	// 	} else if (timeLeft === 0) {
	// 		stopRec()
	// 		stopRecording()
	// 	}
	// 	return () => clearTimeout(timer)
	// }, [isRecording, timeLeft])

	// const formatTimeLeft = () => {
	// 	const minutes = Math.floor(timeLeft / 60)
	// 	const seconds = timeLeft % 60
	// 	return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`
	// }

	const VideoPreview = ({ stream }) => {
		const videoRef = useRef(null)
		useEffect(() => {
			if (videoRef.current && stream) {
				videoRef.current.srcObject = stream
			}
		}, [stream])
		if (!stream) {
			return null
		}
		return (
			<video
				ref={videoRef}
				className='student-camera__preview-video'
				autoPlay
				playsInline
				muted
				loop
			/>
		)
	}

	const {
		startRecording,
		stopRecording,
		mediaBlobUrl,
		previewStream,
	} = useReactMediaRecorder({
		video: true,
		screen: true,
		onStart: () => {
			setRecordedBlob(null)
			setshowStopButtons(true)
			setshowRecordButtons(false)
			startRec()
		},
		onStop: async (blobUrl) => {
			try {
				const mediaBlob = await fetch(blobUrl).then((r) => r.blob())
				const source = new Blob([mediaBlob], { type: mimeType })
				const fixed = await fixWebmDuration(source)
				let normalized = fixed
				if (!(fixed instanceof Blob)) {
					if (fixed instanceof ArrayBuffer) {
						normalized = new Blob([fixed], { type: mimeType })
					} else if (ArrayBuffer.isView(fixed)) {
						normalized = new Blob([fixed], { type: mimeType })
					} else {
						throw new Error('Unexpected recording format')
					}
				}
				setRecordedBlob(normalized)
			} catch (e) {
				console.error(e)
				toast.error('Could not process recording.')
				setRecordedBlob(null)
			}
			setshowVideo(true)
			setshowRecordButtons(false)
			setshowStopButtons(false)
			stopRec()
		},
	})

	const handleSaveVideo = async () => {
		if (!recordedBlob || !id) {
			toast.error('No recording to save.')
			return
		}
		try {
			await uploadVideo({
				answerId: id,
				videoBlob: recordedBlob,
				teacherId,
			}).unwrap()
			toast.success('Video saved')
			setRecordedBlob(null)
			navigate('/teachers/newquestions')
		} catch (err) {
			toast.error(
				err?.data?.message || err?.error || 'Upload failed',
			)
		}
	}

	if (!teacherInfo) {
		return null
	}

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
					<div className='content-area content-area--camera'>
						<div className='center-content2 student-camera'>
							{showRecordButtons ? (
								<div className='student-camera__panel'>
									<div
										className='student-camera__accent'
										aria-hidden
									/>
									<header className='student-camera__header'>
										<h1 className='student-camera__title'>
											Record your answer (screen)
										</h1>
										<p className='student-camera__subtitle'>
											When you continue, your browser will ask
											what to share—pick a tab, a window, or your
											full screen. Recording starts after you
											confirm.
										</p>
										<p className='student-camera__meta'>
											Maximum length: 5 minutes
										</p>
									</header>
									<button
										type='button'
										className='student-camera__cta student-camera__cta--record'
										onClick={startRecording}
									>
										<span className='student-camera__cta-icon-wrap'>
											<img
												src={recIconSrc}
												alt=''
												className='student-camera__cta-icon'
											/>
										</span>
										<span className='student-camera__cta-label'>
											Start screen recording
										</span>
									</button>
								</div>
							) : null}

							{showStopButtons ? (
								<div className='student-camera__panel student-camera__panel--wide'>
									<div
										className='student-camera__accent'
										aria-hidden
									/>
									<div className='student-camera__preview-shell'>
										<div className='student-camera__preview-frame student-camera__preview-frame--live'>
											{previewStream ? (
												<VideoPreview stream={previewStream} />
											) : (
												<div
													className='student-camera__screen-hint'
													role='status'
												>
													<img
														src={screenHintGifSrc}
														alt=''
														className='student-camera__screen-hint-gif'
													/>
													<p>
														Choose what to share in the
														browser dialog. Your capture
														will show here.
													</p>
												</div>
											)}
											<div
												className='student-camera__rec-pill'
												role='status'
												aria-live='polite'
											>
												<span className='student-camera__rec-dot' />
												Recording
											</div>
											{/* <div className='student-camera__timer'>
												{formatTimeLeft()}
											</div> */}
										</div>
									</div>
									<button
										type='button'
										className='student-camera__cta student-camera__cta--stop'
										onClick={stopRecording}
									>
										<span className='student-camera__cta-icon-wrap student-camera__cta-icon-wrap--stop'>
											<img
												src={stopIconSrc}
												alt=''
												className='student-camera__cta-icon student-camera__cta-icon--stop'
											/>
										</span>
										<span className='student-camera__cta-label'>
											Stop and finish
										</span>
									</button>
								</div>
							) : null}

							{showVideo ? (
								<div className='student-camera__panel student-camera__panel--wide'>
									<div
										className='student-camera__accent'
										aria-hidden
									/>
									<header className='student-camera__header student-camera__header--compact'>
										<h1 className='student-camera__title'>
											Preview your recording
										</h1>
										<p className='student-camera__subtitle'>
											Replay it below, then save or record again.
										</p>
									</header>
									<div className='student-camera__preview-shell'>
										<div className='student-camera__preview-frame student-camera__preview-frame--playback'>
											<video
												className='student-camera__preview-video'
												src={mediaBlobUrl}
												controls
												playsInline
												autoPlay
												loop
											/>
										</div>
									</div>
									<div className='student-camera__actions'>
										<Button
											as={Link}
											to={`/teachers/recordscreen/${id}`}
											reloadDocument
											className='student-camera__btn student-camera__btn--secondary student-camera__action-link'
										>
											Record again
										</Button>
										<div className='student-camera__action-link'>
											<Button
												type='button'
												className='student-camera__btn student-camera__btn--primary'
												disabled={
													!recordedBlob || isUploading
												}
												onClick={() => void handleSaveVideo()}
											>
												{isUploading
													? 'Saving…'
													: 'Save video'}
											</Button>
										</div>
									</div>
								</div>
							) : null}
						</div>
					</div>
				</div>
			</div>
		</div>
	)
}

export default TeacherRecordScreen
