import '../App.css';
import { useState, useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import Header from '../components/Header';
import { useGetChatMutation } from '../slices/chatSlice';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';


// Send button icon from Figma design (node 1-67)
const SendButtonIcon = () => (
  <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg" className="send-button-icon">
    <path d="M10 4v12M4 10l6-6 6 6" stroke="#374151" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

function HomeScreen() {

  const { id } = useParams();



    const [question, setQuestion] = useState("");
    const [messages, setMessages] = useState([]);
    const [isSidebarOpen, setIsSidebarOpen] = useState(window.innerWidth > 768);
    const [showSubheading, setShowSubheading] = useState(false);
    const [playingAudio, setPlayingAudio] = useState(null); // Track which message is playing audio
    const [loadingAudio, setLoadingAudio] = useState(null); // Track which message is loading audio
    const messagesEndRef = useRef(null);
    const audioRef = useRef(null);
    const abortControllerRef = useRef(null);
    const audioUrlRef = useRef(null);
    const audioEventHandlersRef = useRef({ onended: null, onerror: null });
    const [predefinedQuestion, setPredefinedQuestion] = useState("");
    const [learningMaterial, setLearningMaterial] = useState("");

    const [getChat, { isLoading }] = useGetChatMutation();

    const cleanupAudio = () => {
        if (abortControllerRef.current) {
            abortControllerRef.current.abort();
            abortControllerRef.current = null;
        }

        if (audioRef.current) {
            const audio = audioRef.current;
            audio.pause();
            
            if (audioEventHandlersRef.current.onended) {
                audio.removeEventListener('ended', audioEventHandlersRef.current.onended);
            }
            if (audioEventHandlersRef.current.onerror) {
                audio.removeEventListener('error', audioEventHandlersRef.current.onerror);
            }
            audioEventHandlersRef.current = { onended: null, onerror: null };
            
            audio.src = '';
            audio.load();
            audioRef.current = null;
        }

        if (audioUrlRef.current) {
            URL.revokeObjectURL(audioUrlRef.current);
            audioUrlRef.current = null;
        }

        setPlayingAudio(null);
        setLoadingAudio(null);
    };

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
            cleanupAudio();
        };
    }, []);
   

    useEffect(() => {
      if (id == 'ciencias1') {
        setPredefinedQuestion("sugiereme algo para preguntar sobre el libro de texto de ciencias 1");
        setLearningMaterial("Que vas a aprender hoy?")
      } else {
        setPredefinedQuestion("suggest me some questions to ask about Warren Buffett Shareholder Report");
        setLearningMaterial("What would you like to learn today?")
      }

    }, [id]);





    // Clear chat history and cleanup audio when switching subjects
    useEffect(() => {
      cleanupAudio();
      setMessages([]);
      setShowSubheading(false);
      
      // Reset subheading timer
      const timer = setTimeout(() => {
        setShowSubheading(true);
      }, 3000);

      return () => clearTimeout(timer);
    }, [id]);

    const submitHandler = async (e) => {
        e.preventDefault();
        if (!question.trim()) return;

        // Add the question to messages immediately
        const userMessage = { type: 'question', content: question };
        setMessages(prev => [...prev, userMessage]);
        
        const currentQuestion = question;
        setQuestion(""); // Clear input
        let res;
        try {
          if(id == undefined){
             res = await getChat({ question: currentQuestion, 'id': 'langchain-docs' });
          }
          if (id != undefined){
             res = await getChat({ question: currentQuestion, id });
          }
            // const res = await getChat({ question: currentQuestion, id });
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
     


        
        // Add the question to messages immediately
        const userMessage = { type: 'question', content: predefinedQuestion };
        setMessages(prev => [...prev, userMessage]);

        try {
          if(id == undefined){
            const res = await getChat({ question: predefinedQuestion, 'id': 'langchain-docs' });
            // Add the answer to messages
            const aiMessage = { type: 'answer', content: res.data.message };
            setMessages(prev => [...prev, aiMessage]);
          }

          if (id != undefined){
            const res = await getChat({ question: predefinedQuestion, id });
            // Add the answer to messages
            const aiMessage = { type: 'answer', content: res.data.message };
            setMessages(prev => [...prev, aiMessage]);
          }
        } catch (error) {
            console.error(error);
            const errorMessage = { type: 'answer', content: 'Sorry, there was an error processing your question.' };
            setMessages(prev => [...prev, errorMessage]);
        }
    }

    const playAudio = async (text, messageIndex) => {
        try {
            // If clicking the same message that's playing or loading, just stop it
            if (playingAudio === messageIndex || loadingAudio === messageIndex) {
                cleanupAudio();
                return;
            }

            // Clean up any previous audio before starting new one
            cleanupAudio();

            // Set loading state
            setLoadingAudio(messageIndex);

            // Create new abort controller for this request
            abortControllerRef.current = new AbortController();

            const response = await fetch('/api/tts', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ text }),
                signal: abortControllerRef.current.signal,
            });

            if (!response.ok) {
                throw new Error('Failed to generate speech');
            }

            // Get the blob directly (MP3 format for better streaming)
            const audioBlob = await response.blob();
            const audioUrl = URL.createObjectURL(audioBlob);
            audioUrlRef.current = audioUrl;
            
            const audio = new Audio(audioUrl);
            audioRef.current = audio;

            const handleEnded = () => {
                cleanupAudio();
            };

            const handleError = () => {
                console.error('Error playing audio');
                cleanupAudio();
            };

            audioEventHandlersRef.current = { onended: handleEnded, onerror: handleError };
            audio.addEventListener('ended', handleEnded);
            audio.addEventListener('error', handleError);

            // Audio is ready, switch from loading to playing
            setLoadingAudio(null);
            setPlayingAudio(messageIndex);
            await audio.play();
        } catch (error) {
            if (error.name === 'AbortError') {
                return;
            }
            console.error('Error generating speech:', error);
            cleanupAudio();
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
                <h1 className="main-heading">{learningMaterial}</h1>
                {showSubheading && (
                  <small 
                    className="main-subheading animate-fade-in clickable-subheading" 
                    onClick={handleSubheadingClick}
                  >
                    {predefinedQuestion}
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
                        aria-label={loadingAudio === index ? "Loading audio" : playingAudio === index ? "Stop audio" : "Play audio"}
                        title={loadingAudio === index ? "Loading audio..." : playingAudio === index ? "Stop audio" : "Play audio"}
                        disabled={loadingAudio !== null && loadingAudio !== index}
                      >
                        {loadingAudio === index ? (
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="audio-loading-spinner">
                            <circle cx="12" cy="12" r="10" strokeOpacity="0.25" />
                            <path d="M12 2a10 10 0 0 1 10 10" strokeLinecap="round" />
                          </svg>
                        ) : playingAudio === index ? (
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
                <SendButtonIcon />
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

export default HomeScreen;
