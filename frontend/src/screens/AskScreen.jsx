import React, { useState } from 'react'
import Sidebar from '../components/Sidebar';
import Header from '../components/Header';
import '../App.css';

function AskScreen() {


    const [isSidebarOpen, setIsSidebarOpen] = useState(window.innerWidth > 768);
    const toggleSidebar = () => {
        setIsSidebarOpen(!isSidebarOpen);
    };




  return (
    <div className="chat-app">
      <div className="main-container">     

            <Sidebar isOpen={isSidebarOpen} toggleSidebar={toggleSidebar} />
            <div className="main-content">
                <Header isSidebarOpen={isSidebarOpen} toggleSidebar={toggleSidebar} />
                <div className="content-area">
                    <div className="center-content2">
                        <h1 className="main-heading">Ask Your Class Teacher</h1>
                        
                        <p className="upload-subtitle">Record your screen or camera to ask your question</p>
                        
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
                            
                            <div className="upload-card upload-card-purple">
                                <div className="upload-card-header">
                                    <h2>Record PC screen</h2>
                                    <div className="upload-card-icon">
                                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                            <path d="M23 7l-7 5 7 5V7z"></path>
                                            <rect x="1" y="5" width="15" height="14" rx="2" ry="2"></rect>
                                        </svg>
                                    </div>
                                </div>
                                <p className="upload-card-subtitle">✦ Record up to a 5 minutes question</p>
                            </div>
                            
                            <div className="upload-card upload-card-orange">
                                <div className="upload-card-header">
                                    <h2>Record Camera</h2>
                                    <div className="upload-card-icon">
                                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                            <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"></path>
                                            <circle cx="12" cy="13" r="4"></circle>
                                        </svg>
                                    </div>
                                </div>
                                <p className="upload-card-subtitle">↑ Record up to a 5 minutes question</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>

    </div>
  )
}

export default AskScreen
