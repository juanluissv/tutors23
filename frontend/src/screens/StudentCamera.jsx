import React, { useState, useEffect, useLayoutEffect, useRef } from 'react'
import { useDispatch } from 'react-redux'
import { useParams } from 'react-router-dom'
import { LinkContainer } from 'react-router-bootstrap'
import { useReactMediaRecorder } from 'react-media-recorder'
import fixWebmDuration from 'webm-duration-fix'
import { callNewRect, callNewRect2 } from '../slices/student/globalSlice'
import { Button } from 'react-bootstrap'
import Sidebar from '../components/Sidebar'
import Header from '../components/Header'
import '../App.css'

const recIconSrc = `${process.env.PUBLIC_URL}/assets/img/rec3.png`
const stopIconSrc = `${process.env.PUBLIC_URL}/assets/img/stop1.png`

const StudentCamera = () => {

    const [isSidebarOpen, setIsSidebarOpen] = useState(
		window.innerWidth > 768,
	)
	
	const toggleSidebar = () => {
		setIsSidebarOpen(!isSidebarOpen);
	};

    const mimeType = 'video/webm;codecs=vp9'

    const dispatch = useDispatch()

    const { id } = useParams()

    const [showRecordButtons, setshowRecordButtons] = useState(true); // initial screen
    const [showStopButtons, setshowStopButtons] = useState(false); //second screen
    const [showVideo, setshowVideo] = useState(false); 
    const [isRecording, setIsRecording] = useState(false);
    const [timeLeft, setTimeLeft] = useState(300); //change it to 300 (5 min)

    

    const startRec = () => { //start timer
        setIsRecording(true);
        setTimeLeft(300); //change it to 300 (5 min)
        dispatch(callNewRect()); // Dispatch the action
   };

    const stopRec = () => {
        setIsRecording(false);
        setTimeLeft(0); 
        dispatch(callNewRect2()); // Dispatch the action
   };
 
    useLayoutEffect(() => {
        let timer;
        if (isRecording && timeLeft > 0) {
        timer = setTimeout(() => {
            setTimeLeft(timeLeft - 300);
        }, 300000);
        } else if (timeLeft === 0) {
            stopRec();
            stopRecording();
        }
        return () => clearTimeout(timer);
    }, [isRecording, timeLeft]);

    const formatTimeLeft = () => {
        const minutes = Math.floor(timeLeft / 60);
        const seconds = timeLeft % 60;
        return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
    };
 
    async function getString(mediaBlobUrl) {
        const mediaBlob = await fetch(mediaBlobUrl)
            .then(response => response.blob());
                const fixBlob = await fixWebmDuration(new Blob([mediaBlob], { type: mimeType }));                
                var fd = new FormData();
                fd.append('upl', fixBlob);
                fd.append('id', id);
                // fetch('/api/upload',
                // {
                //     method: 'post',
                //     body: fd
                // });    
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

      const { startRecording, stopRecording, mediaBlobUrl, previewStream } = useReactMediaRecorder(
        { 
            video: true,
            screen: false, 
            onStart: () => {
                setshowStopButtons(true)
                setshowRecordButtons(false)
                startRec() //start timer
            },
            onStop: (blobUrl, blob) => {
                getString(blobUrl) 
                setshowVideo(true)
                setshowRecordButtons(false)
                setshowStopButtons(false)
                stopRec();
            }            
        });

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
											Record with your camera
										</h1>
										<p className="student-camera__subtitle">
											When you continue, your browser will ask for
											camera permission. Allow it so we can capture
											your response.
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
											Start recording
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
													className="student-camera__preview-placeholder"
													role="status"
												>
													Starting camera…
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
											Preview your clip
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

export default StudentCamera;
