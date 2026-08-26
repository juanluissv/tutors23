import React, { useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import Sidebar from '../../components/Sidebar';
import Header from '../../components/Header';
import '../../App.css';

function StudentAskScreen() {
    const { id: questionId } = useParams()

    const [isSidebarOpen, setIsSidebarOpen] = useState(window.innerWidth > 768);
    const toggleSidebar = () => {
        setIsSidebarOpen(!isSidebarOpen);
    };




  return (
    <div className="chat-app ask-screen">
      <div className="main-container">     

            <Sidebar isOpen={isSidebarOpen} toggleSidebar={toggleSidebar} />
            <div className="main-content">
                <Header isSidebarOpen={isSidebarOpen} toggleSidebar={toggleSidebar} />
                <div className="content-area">
                    <div className="center-content2">
                        <h1 className="main-heading heading-gradient">Pregúntale a tu profesor</h1>
                        
                        <p className="upload-subtitle">Graba tu pantalla o cámara para hacer tu pregunta</p>
                        
                        <div className="upload-cards-container">
                            
                            {/* <div className="upload-card upload-card-orange">
                                <div className="upload-card-header">
                                    <h2>Upload new video</h2>
                                    <div className="upload-card-icon">
                                        <svg
                                            width="24"
                                            height="24"
                                            viewBox="0 0 24 24"
                                            fill="none"
                                            stroke="currentColor"
                                            strokeWidth="2"
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                        >
                                            <path d="M12 3v12" />
                                            <path d="M7 8l5-5 5 5" />
                                            <path d="M5 15h14v4a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2v-4z" />
                                        </svg>
                                    </div>
                                </div>
                                <p className="upload-card-subtitle">↑ Upload up to a 5 minutes question</p>
                            </div> */}
                            
                            <Link
                                to={`/students/recordscreen/${questionId}`}
                                className="upload-card upload-card-purple"
                                aria-label="Grabar la pantalla de tu computadora, hasta 5 minutos"
                            >
                                <div className="upload-card-header">
                                    <h2>Grabar pantalla de tu computadora</h2>
                                    <div className="upload-card-icon">
                                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                            <path d="M23 7l-7 5 7 5V7z"></path>
                                            <rect x="1" y="5" width="15" height="14" rx="2" ry="2"></rect>
                                        </svg>
                                    </div>
                                </div>
                                <p className="upload-card-subtitle">✦ Graba una pregunta de hasta 5 minutos</p>
                            </Link>
                            
                            <Link
                                to={`/students/recordcamera/${questionId}`}
                                className="upload-card upload-card-orange"
                                aria-label="Grabar con la cámara, hasta 5 minutos"
                            >
                                <div className="upload-card-header">
                                    <h2>Grabar <br />cámara</h2>
                                    <div className="upload-card-icon">
                                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                            <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"></path>
                                            <circle cx="12" cy="13" r="4"></circle>
                                        </svg>
                                    </div>
                                </div>
                                <p className="upload-card-subtitle">↑ Graba una pregunta de hasta 5 minutos</p>
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </div>

    </div>
  )
}

export default StudentAskScreen
