import '../App.css';
import { useState, useEffect, useRef } from 'react';
import Sidebar from '../components/Sidebar';
import Header from '../components/Header';
import { useGetChatMutation } from '../slices/chatSlice';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';


// Icon URLs from Figma
const imgVector = "https://www.figma.com/api/mcp/asset/723162b6-de90-4133-b1f8-eede50d70e47";
const imgVector2 = "https://www.figma.com/api/mcp/asset/233ff404-949d-499e-b272-47afd90ec4c7";
const imgIcon9 = "https://www.figma.com/api/mcp/asset/f97f23f3-6aa1-4800-886e-0d66f48f67ed";

function App() {
    const [question, setQuestion] = useState("");
    const [messages, setMessages] = useState([]);
    // Sidebar closed by default on mobile, open on desktop
    const [isSidebarOpen, setIsSidebarOpen] = useState(window.innerWidth > 768);
    const [showSubheading, setShowSubheading] = useState(false);
    const [playingAudio, setPlayingAudio] = useState(null); // Track which message is playing audio
    const messagesEndRef = useRef(null);
    const audioRef = useRef(null);

    const [getChat, { isLoading }] = useGetChatMutation();

    const toggleSidebar = () => {
        setIsSidebarOpen(!isSidebarOpen);
    };

    // Close sidebar when clicking outside on mobile
    const closeSidebarOnMobile = () => {
        if (window.innerWidth <= 768 && isSidebarOpen) {
            setIsSidebarOpen(false);
        }
    };

    // Auto-scroll to bottom when messages change
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages, isLoading]);

    // Handle window resize for responsive sidebar behavior
    useEffect(() => {
        const handleResize = () => {
            // On desktop, keep sidebar open; on mobile, close it
            if (window.innerWidth > 768 && !isSidebarOpen) {
                setIsSidebarOpen(true);
            }
        };

        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, [isSidebarOpen]);

    // Show subheading after 3 seconds
    useEffect(() => {
        const timer = setTimeout(() => {
            setShowSubheading(true);
        }, 3000); // 3000ms = 3 seconds

        return () => clearTimeout(timer); // Cleanup on unmount
    }, []);

    // Cleanup audio on component unmount
    useEffect(() => {
        return () => {
            if (audioRef.current) {
                audioRef.current.pause();
                audioRef.current = null;
            }
        };
    }, []);

    const submitHandler = async (e) => {
        e.preventDefault();
        if (!question.trim()) return;

        // Add the question to messages immediately
        const userMessage = { type: 'question', content: question };
        setMessages(prev => [...prev, userMessage]);
        
        const currentQuestion = question;
        setQuestion(""); // Clear input

        try {
            const res = await getChat({ question: currentQuestion });
            console.log(res);
            
            // Add the answer to messages
            const aiMessage = { type: 'answer', content: res.data.message };
            setMessages(prev => [...prev, aiMessage]);
        } catch (error) {
            console.error(error);
            const errorMessage = { type: 'answer', content: 'Sorry, there was an error processing your question.' };
            setMessages(prev => [...prev, errorMessage]);
        }
    }

    const handleSubheadingClick = async () => {
        const predefinedQuestion = "suggest me some questions to ask";
        
        // Add the question to messages immediately
        const userMessage = { type: 'question', content: predefinedQuestion };
        setMessages(prev => [...prev, userMessage]);

        try {
            const res = await getChat({ question: predefinedQuestion });
            console.log(res);
            
            // Add the answer to messages
            const aiMessage = { type: 'answer', content: res.data.message };
            setMessages(prev => [...prev, aiMessage]);
        } catch (error) {
            console.error(error);
            const errorMessage = { type: 'answer', content: 'Sorry, there was an error processing your question.' };
            setMessages(prev => [...prev, errorMessage]);
        }
    }

    const playAudio = async (text, messageIndex) => {
        try {
            // Stop current audio if playing
            if (audioRef.current) {
                audioRef.current.pause();
                audioRef.current = null;
            }

            // If clicking the same message that's playing, just stop it
            if (playingAudio === messageIndex) {
                setPlayingAudio(null);
                return;
            }

            setPlayingAudio(messageIndex);

            const response = await fetch('/api/tts', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ text }),
            });

            if (!response.ok) {
                throw new Error('Failed to generate speech');
            }

            const audioBlob = await response.blob();
            const audioUrl = URL.createObjectURL(audioBlob);
            
            const audio = new Audio(audioUrl);
            audioRef.current = audio;

            audio.onended = () => {
                setPlayingAudio(null);
                URL.revokeObjectURL(audioUrl);
            };

            audio.onerror = () => {
                setPlayingAudio(null);
                URL.revokeObjectURL(audioUrl);
                console.error('Error playing audio');
            };

            await audio.play();
        } catch (error) {
            console.error('Error generating speech:', error);
            setPlayingAudio(null);
        }
    };





  return (
    <div className="chat-app">
      {/* Get Plus Button */}
      {/* <button className="get-plus-button">
        <img src={imgIcon10} alt="" />
        <span>Get Plus</span>
      </button> */}

      <div className="main-container">
        <Sidebar isOpen={isSidebarOpen} toggleSidebar={toggleSidebar} />
        
        {/* Overlay for mobile - click to close sidebar */}
        {isSidebarOpen && window.innerWidth <= 768 && (
          <div className="sidebar-overlay" onClick={closeSidebarOnMobile}></div>
        )}

        {/* Main Content */}
        <div className="main-content">
          <Header isSidebarOpen={isSidebarOpen} toggleSidebar={toggleSidebar} />

          <div className="content-area">
            {messages.length === 0 ? (
              <div className="center-content">
                <h1 className="main-heading">What would you like to learn today?</h1>
                {showSubheading && (
                  <small 
                    className="main-subheading animate-fade-in clickable-subheading" 
                    onClick={handleSubheadingClick}
                  >
                    suggest me some questions to ask
                  </small>
                )}
              </div>
            ) : (
              <div className="chat-messages">
                {messages.map((message, index) => (
                  <div 
                    key={index} 
                    className={message.type === 'question' ? 'message-question' : 'message-answer'}
                  >
                    <div className="message-wrapper">
                      <div className="message-content">
                        {message.type === 'answer' ? (
                          <ReactMarkdown 
                            remarkPlugins={[remarkGfm]}
                            components={{
                              code: ({node, inline, className, children, ...props}) => {
                                return inline ? (
                                  <code className="inline-code" {...props}>
                                    {children}
                                  </code>
                                ) : (
                                  <code className="code-block" {...props}>
                                    {children}
                                  </code>
                                );
                              }
                            }}
                          >
                            {message.content}
                          </ReactMarkdown>
                        ) : (
                          message.content
                        )}
                      </div>
                      <button 
                        className="voice-button"
                        onClick={() => playAudio(message.content, index)}
                        aria-label="Play audio"
                        title="Play audio"
                      >
                        {playingAudio === index ? (
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <rect x="6" y="4" width="4" height="16" />
                            <rect x="14" y="4" width="4" height="16" />
                          </svg>
                        ) : (
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
                            <path d="M15.54 8.46a5 5 0 0 1 0 7.07" />
                            <path d="M19.07 4.93a10 10 0 0 1 0 14.14" />
                          </svg>
                        )}
                      </button>
                    </div>
                  </div>
                ))}
                {isLoading && (
                  <div className="message-answer">
                    <div className="message-content">
                      <div className="typing-indicator">
                        <span></span>
                        <span></span>
                        <span></span>
                      </div>
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>
            )}
          </div>

          <div className="input-area">
            <div className="input-container">
              <button className="icon-button">
                {/* <img src={imgVector} alt="Add" /> */}
              </button>
              <input
                type="text"
                className="input-field"
                placeholder="Ask anything"
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && submitHandler(e)}
              />
              {/* <button className="icon-button">
                <img src={imgVector2} alt="Attach" />
              </button> */}
              <button 
                className="send-button" 
                onClick={submitHandler}
                disabled={isLoading || !question.trim()}
              >
                <img src={imgIcon9} alt="Send" />
              </button>
            </div>
            <p className="footer-text">
              {/* AI can make mistakes. Check important info. */}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
