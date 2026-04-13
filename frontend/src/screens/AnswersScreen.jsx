import React, { useState } from 'react'
import Sidebar from '../components/Sidebar';
import Header from '../components/Header';
import '../App.css';


function AnswersScreen() {

    const [isSidebarOpen, setIsSidebarOpen] = useState(window.innerWidth > 768);
    const toggleSidebar = () => {
        setIsSidebarOpen(!isSidebarOpen);
    };





    const [currentPage, setCurrentPage] = useState(1);

    const answers = [
        {
            id: 1,
            category: 'Email Marketing',
            categoryColor: 'teal',
            question: 'How do I export emails from Mailchimp',
            thumbnail: '/api/placeholder/340/190'
        },
        {
            id: 2,
            category: 'Linkedin Marketing',
            categoryColor: 'indigo',
            question: 'How do I target corporations ?',
            thumbnail: '/api/placeholder/340/190'
        }
    ];

    return (
        <div className="chat-app ask-screen">
            <div className="main-container">     
  
              <Sidebar isOpen={isSidebarOpen} toggleSidebar={toggleSidebar} />
              <div className="main-content">
                  <Header isSidebarOpen={isSidebarOpen} toggleSidebar={toggleSidebar} />
                  <div className="content-area">
                    <div className="center-content3">
                        <h3 className="main-heading-answers answers-heading heading-gradient">2 new answers from teachers</h3>
                        
                        <div className="answers-container">
                            <div className="answers-cards">
                                {answers.map((answer) => (
                                    <div key={answer.id} className="answer-card-wrapper">
                                        <div
                                            className={`answer-card answer-card--theme-${answer.categoryColor}`}
                                        >
                                            <span className={`answer-category answer-category-${answer.categoryColor}`}>
                                                {answer.category}
                                            </span>
                                            
                                            <div className="answer-thumbnail">
                                                <div className="thumbnail-placeholder">
                                                    <div className="thumbnail-lines">
                                                        <div className="line"></div>
                                                        <div className="line short"></div>
                                                        <div className="line"></div>
                                                        <div className="line short"></div>
                                                    </div>
                                                </div>
                                                <div className="play-overlay">
                                                    <div className="play-button">
                                                        <svg width="24" height="24" viewBox="0 0 24 24" fill="#6b7280">
                                                            <path d="M8 5v14l11-7z"/>
                                                        </svg>
                                                    </div>
                                                </div>
                                            </div>
                                            
                                            <h3 className="answer-question">{answer.question}</h3>
                                            
                                            <button className={`watch-answer-btn watch-answer-${answer.categoryColor}`}>
                                                Watch Answer
                                                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                                                    <path d="M8 5v14l11-7z"/>
                                                </svg>
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                            
                        </div>
                        
                        <div className="pagination pagination--answers">
                            <button 
                                className={`pagination-btn ${currentPage === 1 ? 'active' : ''}`}
                                onClick={() => setCurrentPage(1)}
                            >
                                1
                            </button>
                            <button 
                                className={`pagination-btn ${currentPage === 2 ? 'active' : ''}`}
                                onClick={() => setCurrentPage(2)}
                            >
                                2
                            </button>
                            <button 
                                className={`pagination-btn ${currentPage === 3 ? 'active' : ''}`}
                                onClick={() => setCurrentPage(3)}
                            >
                                3
                            </button>
                        </div>
                    </div>
                  </div>
              </div>
          </div>
      </div>
    )
}

export default AnswersScreen;