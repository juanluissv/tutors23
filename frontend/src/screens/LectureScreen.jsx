import React, { useState, useRef, useEffect } from 'react';
import Sidebar from '../components/Sidebar';
import Header from '../components/Header';
import { Link, useNavigate } from 'react-router-dom';
import '../App.css';



// Mock lecture data
const mockLecture = {
    id: 1,
    title: "Introduction to Rainforest Ecosystems",
    h1: "Los bosques: importancia y clasificación",
    p1: "Los bosques son ecosistemas complejos que desempeñan un papel vital para la vida humana. Cubren alrededor del 31 % de la superficie terrestre del mundo y cumplen diversas funciones La clasificación de los bosques se basa en distintos criterios, como la zona climática en la que se encuentran, el tipo de vegetación que los conforman o su función ecológica. En relación con la zona climática, los bosques se dividen en: tropicales, subtropicales, templados y boreales. De estos, las zonas tropicales destacan por tener la mayor proporción de bosques a nivel mundial, alcanzando el 45 %, mientras que el resto se distribuye entre las otras zonas climáticas.",
    h2: "Los bosques importancia y clasificación",
    p2: "Los bosques son ecosistemas complejos que desempeñan un papel vital para la vida humana. Cubren alrededor del 31 % de la superficie terrestre del mundo y cumplen diversas funciones La clasificación de los bosques se basa en distintos criterios, como la zona climática en la que se encuentran, el tipo de vegetación que los conforman o su función ecológica. En relación con la zona climática, los bosques se dividen en: tropicales, subtropicales, templados y boreales. De estos, las zonas tropicales destacan por tener la mayor proporción de bosques a nivel mundial, alcanzando el 45 %, mientras que el resto se distribuye entre las otras zonas climáticas.",
    
};

function LectureScreen () {
    
    const [isSidebarOpen, setIsSidebarOpen] = useState(window.innerWidth > 768);
    const [activeText, setActiveText] = useState('');
    const [allCues, setAllCues] = useState([]);
    const [audioLoading, setAudioLoading] = useState(true);
    const [videoLoading, setVideoLoading] = useState(true);
    const [isClassVideoPlaying, setIsClassVideoPlaying] = useState(false);
    const [questionText, setQuestionText] = useState('');
    
    const audioRef = useRef(null);
    const contentRef = useRef(null);
    const classVideoRef = useRef(null);
    const questionTextareaRef = useRef(null);
    const navigate = useNavigate();

    const toggleSidebar = () => {
        setIsSidebarOpen(!isSidebarOpen);
    };

    useEffect(() => {
        const loadVTT = async () => {
            try {
                const response = await fetch('/class19.vtt');
                
                const vttText = await response.text();
                const cues = parseVTT(vttText);
                
                const filteredCues = cues.filter(cue => 
                    !cue.text.includes('TurboScribe') && 
                    !cue.text.includes('Go Unlimited')
                );
                
                setAllCues(filteredCues);
                console.log(`Loaded ${filteredCues.length} subtitle cues`);
            } catch (error) {
                console.error('Error loading VTT:', error);
            }
        };

        loadVTT();
    }, []);

    const parseVTT = (vttText) => {
        const lines = vttText.split('\n');
        const cues = [];
        let i = 0;

        while (i < lines.length) {
            const line = lines[i].trim();
            
            if (line === 'WEBVTT' || line === '' || /^\d+$/.test(line)) {
                i++;
                continue;
            }

            if (line.includes('-->')) {
                const [startTime, endTime] = line.split('-->').map(t => t.trim());
                const start = parseTime(startTime);
                const end = parseTime(endTime);
                
                i++;
                let text = '';
                while (i < lines.length && lines[i].trim() !== '' && !lines[i].includes('-->')) {
                    text += lines[i].trim() + ' ';
                    i++;
                }
                
                cues.push({ start, end, text: text.trim() });
            } else {
                i++;
            }
        }

        return cues;
    };

    const parseTime = (timeString) => {
        const parts = timeString.split(':');
        if (parts.length === 3) {
            const hours = parseFloat(parts[0]);
            const minutes = parseFloat(parts[1]);
            const seconds = parseFloat(parts[2]);
            return hours * 3600 + minutes * 60 + seconds;
        }
        return 0;
    };

    const handleTimeUpdate = (currentTime) => {
        if (allCues.length === 0) return;

        const currentCue = allCues.find(
            cue => currentTime >= cue.start && currentTime < cue.end
        );

        if (currentCue && currentCue.text !== activeText) {
            setActiveText(currentCue.text);
            highlightMatchingText(currentCue.text);
        } else if (!currentCue && activeText) {
            setActiveText('');
            clearHighlights();
        }
    };

    const highlightMatchingText = (cueText) => {
        clearHighlights();
        
        if (!contentRef.current) return;
        
        const textElements = contentRef.current.querySelectorAll('p, h2, h3, h4');
        const searchText = cueText.toLowerCase().trim();
        
        textElements.forEach(element => {
            const elementText = element.textContent.toLowerCase();
            
            if (searchText.length > 20 && elementText.includes(searchText.substring(0, 30))) {
                element.classList.add('karaoke-active');
                element.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }
        });
    };

    const clearHighlights = () => {
        if (!contentRef.current) return;
        const highlighted = contentRef.current.querySelectorAll('.karaoke-active');
        highlighted.forEach(el => el.classList.remove('karaoke-active'));
    };

    const handleClassVideoToggle = () => {
        if (!classVideoRef.current) return;

        if (classVideoRef.current.paused || classVideoRef.current.ended) {
            classVideoRef.current.play();
            setIsClassVideoPlaying(true);
        } else {
            classVideoRef.current.pause();
            setIsClassVideoPlaying(false);
        }
    };

    const adjustQuestionTextareaHeight = (el) => {
        if (!el) return;
        el.style.height = 'auto';
        const minH = 52;
        const maxH = 200;
        el.style.height = Math.min(Math.max(el.scrollHeight, minH), maxH) + 'px';
    };

    const handleQuestionChange = (e) => {
        setQuestionText(e.target.value);
        adjustQuestionTextareaHeight(e.target);
    };

    const handleSendQuestion = () => {
        if (!questionText.trim()) {
            return;
        }

        if (classVideoRef.current) {
            classVideoRef.current.pause();
            setIsClassVideoPlaying(false);
        }

        const params = new URLSearchParams();
        params.set('query', questionText.trim());

        window.open(`/?${params.toString()}`, '_blank');
        setQuestionText('');
        if (questionTextareaRef.current) {
            questionTextareaRef.current.style.height = '52px';
        }
    };



    return (
        <div className="chat-app">
            <div className="main-container">
                <Sidebar isOpen={isSidebarOpen} toggleSidebar={toggleSidebar} />
                <div className="main-content">
                    <Header isSidebarOpen={isSidebarOpen} toggleSidebar={toggleSidebar} />
                    <div className="content-area" ref={contentRef}>
                        <div className="center-content2">
                            <div style={{ maxWidth: '900px', margin: '0 auto', padding: '20px' }}>                                                                                
                                <div style={{ marginBottom: '60px' }}>                                    
                                    <h2 style={{ fontSize: '36px', fontWeight: 'bold', color: '#1a1a1a', marginBottom: '40px' }}>Los bosques tropicales en el mundo</h2>
                                    <div style={{ marginBottom: '40px' }}>
                                       

                

                                    <div className="fixed-video-bottom-right">
                                        <div className="fixed-video-controls">
                                            <button 
                                                type="button" 
                                                className="fixed-video-button"
                                                onClick={handleClassVideoToggle}
                                                title={isClassVideoPlaying ? "Pause video" : "Play video"}
                                            >
                                                {isClassVideoPlaying ? (
                                                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                        <rect x="6" y="4" width="4" height="16" />
                                                        <rect x="14" y="4" width="4" height="16" />
                                                    </svg>
                                                ) : (
                                                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                        <polygon points="5 3 19 12 5 21 5 3" />
                                                    </svg>
                                                )}
                                            </button>
                                        </div>
                                        <div className="fixed-video-wrapper">
                                            {videoLoading && (
                                                <div className="fixed-video-loading-overlay">
                                                    <svg 
                                                        width="28" 
                                                        height="28" 
                                                        viewBox="0 0 24 24" 
                                                        fill="none" 
                                                        stroke="#ffffff" 
                                                        strokeWidth="2" 
                                                        className="audio-loading-spinner"
                                                    >
                                                        <circle 
                                                            cx="12" 
                                                            cy="12" 
                                                            r="10" 
                                                            strokeOpacity="0.25" 
                                                        />
                                                        <path 
                                                            d="M12 2a10 10 0 0 1 10 10" 
                                                            strokeLinecap="round" 
                                                        />
                                                    </svg>
                                                </div>
                                            )}
                                            <video 
                                                ref={classVideoRef}
                                                // src="https://res.cloudinary.com/dutglmj02/video/upload/v1773175656/classm1_izjixt.mp4"                                          
                                                src="class19.mp4"                                         
                                                controls={false}
                                                onLoadedData={() => setVideoLoading(false)}
                                                onLoadStart={() => setVideoLoading(true)}
                                                onError={() => setVideoLoading(false)}
                                                onPlay={() => setIsClassVideoPlaying(true)}
                                                onPause={() => setIsClassVideoPlaying(false)}
                                                onTimeUpdate={(e) => handleTimeUpdate(e.target.currentTime)}
                                            />
                                            <div 
                                                style={{ 
                                                    marginTop: '12px',
                                                    position: 'relative',
                                                    width: '100%',
                                                    marginLeft: '-6px',
                                                }}
                                            >
                                                <textarea
                                                    ref={questionTextareaRef}
                                                    rows={2}
                                                    placeholder="hazme una pregunta"
                                                    value={questionText}
                                                    onChange={handleQuestionChange}
                                                    style={{
                                                        width: '100%',
                                                        minWidth: '160px',
                                                        minHeight: '52px',
                                                        maxHeight: '200px',
                                                        padding: '8px 56px 8px 14px',
                                                        borderRadius: '12px',
                                                        border: '1px solid #d1d5db',
                                                        fontSize: '14px',
                                                        outline: 'none',
                                                        resize: 'none',
                                                        overflow: 'hidden',
                                                    }}
                                                />
                                                <button
                                                    type="button"
                                                    onClick={handleSendQuestion}
                                                    style={{
                                                        position: 'absolute',
                                                        right: '-5px',
                                                        bottom: '8px',
                                                        display: 'inline-flex',
                                                        alignItems: 'center',
                                                        justifyContent: 'center',
                                                        width: '32px',
                                                        height: '32px',
                                                        borderRadius: '999px',
                                                        border: 'none',
                                                        backgroundColor: '#3b82f6',
                                                        color: '#ffffff',
                                                        cursor: 'pointer',
                                                    }}
                                                >
                                                    <svg
                                                        width="16"
                                                        height="16"
                                                        viewBox="0 0 24 24"
                                                        fill="none"
                                                        stroke="currentColor"
                                                        strokeWidth="2"
                                                        strokeLinecap="round"
                                                        strokeLinejoin="round"
                                                    >
                                                        <line x1="22" y1="2" x2="11" y2="13" />
                                                        <polygon points="22 2 15 22 11 13 2 9 22 2" />
                                                    </svg>
                                                </button>
                                            </div>
                                        </div>                                        
                                    </div>

                                        <h2 style={{ fontSize: '28px', fontWeight: 'bold', color: '#1a1a1a', marginBottom: '20px' }}>Los bosques: importancia y clasificación</h2>
                                        <p style={{ fontSize: '16px', lineHeight: '1.8', color: '#333', marginBottom: '16px' }}>
                                            Los bosques son ecosistemas complejos que desempeñan un papel vital para la vida humana. Cubren alrededor del 31 % de la superficie terrestre del mundo y cumplen diversas funciones 
                                        </p>                                        
                                        <p style={{ fontSize: '16px', lineHeight: '1.8', color: '#333', marginBottom: '30px' }}>
                                            La clasificación de los bosques se basa en distintos criterios, como la zona climática en la que se encuentran, el tipo de vegetación que los conforman o su función ecológica. 
                                        </p>
                                        <p style={{ fontSize: '16px', lineHeight: '1.8', color: '#333', marginBottom: '30px' }}>
                                        En relación con la zona climática, los bosques se dividen en: tropicales, subtropicales, templados y boreales. De estos, las zonas tropicales destacan por tener la mayor proporción de bosques a nivel mundial, alcanzando el 45 %, mientras que el resto se distribuye entre las otras zonas climáticas.
                                        </p>                                                            
                                    </div>

                                    <div style={{ marginBottom: '40px' }}>
                                        <h3 style={{ fontSize: '28px', fontWeight: 'bold', color: '#1a1a1a', marginBottom: '20px' }}>Características de los bosques tropicales</h3>
                                            <p style={{ fontSize: '16px', lineHeight: '1.8', color: '#333', marginBottom: '16px' }}>
                                            Los bosques tropicales se localizan en la zona intertropical y constituyen uno de los ecosistemas más transcendentales a nivel mundial. 
                                        </p>
                                        <p style={{ fontSize: '16px', lineHeight: '1.8', color: '#333', marginBottom: '16px' }}>
                                            Se caracterizan por su clima cálido y húmedo y experimentan precipitaciones abundantes a lo largo de todo el año, creando condiciones propicias para la vida vegetal y animal.
                                        </p>
                                        <p style={{ fontSize: '16px', lineHeight: '1.8', color: '#333', marginBottom: '16px' }}>
                                            Además, destacan por albergar una asombrosa diversidad biológica, con aproximadamente el 60 % de las especies conocidas de fauna y flora a nivel mundial.
                                        </p>
                                        <p style={{ fontSize: '16px', lineHeight: '1.8', color: '#333', marginBottom: '16px' }}>
                                            Sin embargo, en las últimas décadas, la deforestación ha amenazado seriamente la salud y la estabilidad de estos, afectando a regiones enteras.
                                        </p>
                                    </div>

                                    

                                    


                                                      
                                    
                                </div>                                                      
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default LectureScreen;
