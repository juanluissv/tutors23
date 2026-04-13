import React, { useState, useEffect, useRef } from 'react'
import { Button } from 'react-bootstrap'
import { LinkContainer } from 'react-router-bootstrap'
import { useReactMediaRecorder } from 'react-media-recorder'
import fixWebmDuration from 'webm-duration-fix'
import { useParams } from 'react-router-dom'
import Sidebar from '../components/Sidebar'
import Header from '../components/Header'
import '../App.css'

const recIconSrc = `${process.env.PUBLIC_URL}/assets/img/rec3.png`
const stopIconSrc = `${process.env.PUBLIC_URL}/assets/img/stop1.png`
const screenHintGifSrc = `${process.env.PUBLIC_URL}/assets/img/rec4.gif`

function StudentScreen () {
	const [isSidebarOpen, setIsSidebarOpen] = useState(
		window.innerWidth > 768,
	)

	const toggleSidebar = () => {
		setIsSidebarOpen(!isSidebarOpen)
	}

	const mimeType = 'video/webm;codecs=vp9'

	const { id } = useParams()

	const [showRecordButtons, setshowRecordButtons] = useState(true)
	const [showStopButtons, setshowStopButtons] = useState(false)
	const [showVideo, setshowVideo] = useState(false)
	const [isRecording, setIsRecording] = useState(false)
	const [timeLeft, setTimeLeft] = useState(300)

	const startRec = () => {
		setIsRecording(true)
		setTimeLeft(300)
	}

	const stopRec = () => {
		setIsRecording(false)
		setTimeLeft(0)
	}

	useEffect(() => {
		let timer
		if (isRecording && timeLeft > 0) {
			timer = setTimeout(() => {
				setTimeLeft(timeLeft - 1)
			}, 1000)
		} else if (timeLeft === 0) {
			stopRec()
			stopRecording()
		}
		return () => clearTimeout(timer)
	}, [isRecording, timeLeft])

	const formatTimeLeft = () => {
		const minutes = Math.floor(timeLeft / 60)
		const seconds = timeLeft % 60
		return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`
	}

	async function getString (mediaBlobUrl) {
		const mediaBlob = await fetch(mediaBlobUrl)
			.then((response) => response.blob())
		const fixBlob = await fixWebmDuration(
			new Blob([mediaBlob], { type: mimeType }),
		)
		var fd = new FormData()
		fd.append('upl', fixBlob)
		fd.append('id', id)
		// fetch('/api/upload',
		// {
		//     method: 'post',
		//     body:fd
		// })
	}

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
				className="student-camera__preview-video"
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
			setshowStopButtons(true)
			setshowRecordButtons(false)
			startRec()
		},
		onStop: (blobUrl) => {
			getString(blobUrl)
			setshowVideo(true)
			setshowRecordButtons(false)
			setshowStopButtons(false)
			stopRec()
		},
	})

	return (
		<div className="chat-app chat-app--camera ask-screen">
			<div className="main-container">
				<Sidebar isOpen={isSidebarOpen} toggleSidebar={toggleSidebar} />
				<div className="main-content">
					<Header
						isSidebarOpen={isSidebarOpen}
						toggleSidebar={toggleSidebar}
					/>
					<div className="content-area content-area--camera">
						<div className="center-content2 student-camera">
							{showRecordButtons ? (
								<div className="student-camera__panel">
									<div
										className="student-camera__accent"
										aria-hidden
									/>
									<header className="student-camera__header">
										<h1 className="student-camera__title">
											Record your screen
										</h1>
										<p className="student-camera__subtitle">
											When you continue, your browser will ask
											what to share—pick a tab, a window, or your
											full screen. Recording starts after you
											confirm.
										</p>
										<p className="student-camera__meta">
											Maximum length: 5 minutes
										</p>
									</header>
									<button
										type="button"
										className="student-camera__cta student-camera__cta--record"
										onClick={startRecording}
									>
										<span className="student-camera__cta-icon-wrap">
											<img
												src={recIconSrc}
												alt=""
												className="student-camera__cta-icon"
											/>
										</span>
										<span className="student-camera__cta-label">
											Start screen recording
										</span>
									</button>
								</div>
							) : null}

							{showStopButtons ? (
								<div className="student-camera__panel student-camera__panel--wide">
									<div
										className="student-camera__accent"
										aria-hidden
									/>
									<div className="student-camera__preview-shell">
										<div className="student-camera__preview-frame">
											{previewStream ? (
												<VideoPreview stream={previewStream} />
											) : (
												<div
													className="student-camera__screen-hint"
													role="status"
												>
													<img
														src={screenHintGifSrc}
														alt=""
														className="student-camera__screen-hint-gif"
													/>
													<p>
														Choose what to share in the
														browser dialog. Your capture
														will show here.
													</p>
												</div>
											)}
											<div
												className="student-camera__rec-pill"
												role="status"
												aria-live="polite"
											>
												<span className="student-camera__rec-dot" />
												Recording
											</div>
											<div className="student-camera__timer">
												{formatTimeLeft()}
											</div>
										</div>
									</div>
									<button
										type="button"
										className="student-camera__cta student-camera__cta--stop"
										onClick={stopRecording}
									>
										<span className="student-camera__cta-icon-wrap student-camera__cta-icon-wrap--stop">
											<img
												src={stopIconSrc}
												alt=""
												className="student-camera__cta-icon student-camera__cta-icon--stop"
											/>
										</span>
										<span className="student-camera__cta-label">
											Stop and finish
										</span>
									</button>
								</div>
							) : null}

							{showVideo ? (
								<div className="student-camera__panel student-camera__panel--wide">
									<div
										className="student-camera__accent"
										aria-hidden
									/>
									<header className="student-camera__header student-camera__header--compact">
										<h1 className="student-camera__title">
											Preview your recording
										</h1>
										<p className="student-camera__subtitle">
											Replay it below, then save or record again.
										</p>
									</header>
									<div className="student-camera__preview-shell">
										<div className="student-camera__preview-frame student-camera__preview-frame--playback">
											<video
												className="student-camera__preview-video"
												src={mediaBlobUrl}
												controls
												playsInline
												autoPlay
												loop
											/>
										</div>
									</div>
									<div className="student-camera__actions">
										<LinkContainer
											to={`/studentasktype/${id}`}
											className="student-camera__action-link"
										>
											<Button
												variant="outline-secondary"
												className="student-camera__btn student-camera__btn--secondary"
											>
												Record again
											</Button>
										</LinkContainer>
										<LinkContainer
											to="/studentnewanswer"
											className="student-camera__action-link"
										>
											<Button className="student-camera__btn student-camera__btn--primary">
												Save video
											</Button>
										</LinkContainer>
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

export default StudentScreen
