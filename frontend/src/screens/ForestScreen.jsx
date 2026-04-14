import React, { useState, useRef, useEffect } from 'react';
import Sidebar from '../components/Sidebar';
import Header from '../components/Header';
import '../App.css';
import { Link } from 'react-router-dom';




function ForestScreen() {

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

    const toggleSidebar = () => {
        setIsSidebarOpen(!isSidebarOpen);
    };


    useEffect(() => {
        const loadVTT = async () => {
            try {
                const response = await fetch('/class4.vtt');
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
        <div className="chat-app chat-app--valores-semana1">
            <div className="main-container">     

                <Sidebar isOpen={isSidebarOpen} toggleSidebar={toggleSidebar} />
                <div className="main-content">
                    <Header isSidebarOpen={isSidebarOpen} toggleSidebar={toggleSidebar} />
                    <div className="content-area content-area--valores-semana1" ref={contentRef}>
                        <div className="center-content2 valores-semana1-center">
                            <div className="valores-semana1-lang-row">
                                <div className="valores-semana1-lang-pill">
                                    <Link
                                        to="/9/valores/unidad1/semana1"
                                        className="valores-semana1-lang-link"
                                    >
                                        Spanish Version
                                    </Link>
                                </div>
                                <div className="valores-semana1-lang-pill">
                                    <Link
                                        to="/french"
                                        className="valores-semana1-lang-link"
                                    >
                                        French Version
                                    </Link>
                                </div>
                                {/* <div className='valores-semana1-lang-pill'>
									<Link
										to='/chinese'
										className='valores-semana1-lang-link'
									>
										Chinese Version
									</Link>
								</div> */}
                            </div>
                            <article className="valores-semana1-article-card">
                                <div
                                    className="valores-semana1-article-accent"
                                    aria-hidden
                                />
                                <div className="unidad-wrapper valores-semana1-unidad-inner">
                                <div className="unidad-header valores-semana1-hero">
                                    <p className="valores-semana1-eyebrow">
                                        Citizenship & values · Grade 9
                                    </p>
                                    <h1 className="unidad-title valores-semana1-title heading-gradient">
                                        Unidad 1 · Semana 1
                                    </h1>
                                    <h2 className="unidad-subtitle valores-semana1-subtitle">
                                        Los bosques tropicales en el mundo
                                    </h2>
                                </div>

                                {/* Deepening */}
                                <div style={{ marginBottom: '60px' }}>

                                    <h3 style={{ fontSize: '26px', fontWeight: 'bold', color: '#1a1a1a', marginBottom: '20px' }}>Forests: importance and classification</h3>
                                    <p style={{ fontSize: '16px', lineHeight: '1.8', color: '#333', marginBottom: '16px' }}>
                                        Forests are complex ecosystems that play a vital role in human life. They cover about 31% of the world's land surface and perform various functions,
                                        including oxygen production, air purification, water supply and other natural resources, making them very important for maintaining the health and balance of the planet.
                                    </p>
                                    <p style={{ fontSize: '16px', lineHeight: '1.8', color: '#333', marginBottom: '24px' }}>
                                        The classification of forests is based on different criteria, such as the climatic zone in which they are located, the type of vegetation that makes them up, or their ecological function. In relation to the climatic zone,
                                        forests are divided into: tropical, subtropical, temperate and boreal. Of these, tropical zones stand out for having the largest proportion of forests worldwide, reaching 45%, while the rest is distributed among the other climatic zones.
                                    </p>

                                    {/* World distribution */}
                                    <div style={{ backgroundColor: '#f5f5f5', padding: '32px', borderRadius: '12px', marginBottom: '24px' }}>
                                        <h4 style={{ fontSize: '20px', fontWeight: '600', color: '#1a1a1a', marginBottom: '24px', textAlign: 'center' }}>
                                            World distribution of forests by climatic zone
                                        </h4>
                                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '20px', maxWidth: '600px', margin: '0 auto' }}>
                                            <div style={{ textAlign: 'center' }}>
                                                <div style={{ fontSize: '48px', fontWeight: 'bold', color: '#2e7d32', marginBottom: '8px' }}>45%</div>
                                                <div style={{ fontSize: '16px', color: '#555' }}>Tropical</div>
                                            </div>
                                            <div style={{ textAlign: 'center' }}>
                                                <div style={{ fontSize: '48px', fontWeight: 'bold', color: '#1976d2', marginBottom: '8px' }}>27%</div>
                                                <div style={{ fontSize: '16px', color: '#555' }}>Boreal</div>
                                            </div>
                                            <div style={{ textAlign: 'center' }}>
                                                <div style={{ fontSize: '48px', fontWeight: 'bold', color: '#f57c00', marginBottom: '8px' }}>16%</div>
                                                <div style={{ fontSize: '16px', color: '#555' }}>Temperate</div>
                                            </div>
                                            <div style={{ textAlign: 'center' }}>
                                                <div style={{ fontSize: '48px', fontWeight: 'bold', color: '#c62828', marginBottom: '8px' }}>11%</div>
                                                <div style={{ fontSize: '16px', color: '#555' }}>Subtropical</div>
                                            </div>
                                        </div>
                                        <p style={{ fontSize: '13px', color: '#777', marginTop: '24px', textAlign: 'center' }}>
                                            Source: FAO (2020). Global Forest Resources Assessment.
                                        </p>
                                    </div>

                                    {/* Geographic connection */}
                                    <div style={{ backgroundColor: '#e3f2fd', border: '2px solid #1976d2', borderRadius: '12px', padding: '20px', marginBottom: '40px' }}>
                                        <p style={{ fontSize: '15px', fontWeight: '600', color: '#1976d2', marginBottom: '8px' }}>Geographic connection</p>
                                        <p style={{ fontSize: '15px', color: '#333', marginBottom: 0 }}>
                                            About 54% of the world's forests are concentrated in five nations: Russia, Brazil, Canada, the United States and China.
                                        </p>
                                    </div>

                                    {/* Characteristics of tropical forests */}
                                    <h3 style={{ fontSize: '26px', fontWeight: 'bold', color: '#1a1a1a', marginBottom: '20px' }}>Characteristics of tropical forests</h3>
                                    <p style={{ fontSize: '16px', lineHeight: '1.8', color: '#333', marginBottom: '16px' }}>
                                        Tropical forests are located in the intertropical zone and constitute one of the most important ecosystems worldwide. They are characterized by their warm and humid climate
                                        and experience abundant rainfall throughout the year, creating favourable conditions for plant and animal life.
                                    </p>
                                    <p style={{ fontSize: '16px', lineHeight: '1.8', color: '#333', marginBottom: '16px' }}>
                                        In addition, they stand out for harbouring an astonishing biological diversity, with approximately 60% of the known species of fauna and flora worldwide. However, in recent decades,
                                        deforestation has seriously threatened the health and stability of these forests, affecting entire regions.
                                    </p>

                                    {/* Main issues */}
                                    <h3 style={{ fontSize: '26px', fontWeight: 'bold', color: '#1a1a1a', marginTop: '32px', marginBottom: '24px' }}>Main issues facing tropical forests</h3>
                                    <p style={{ fontSize: '16px', lineHeight: '1.8', color: '#333', marginBottom: '24px' }}>
                                        Tropical forests, despite their ecological importance, face various issues that put their existence at risk:
                                    </p>

                                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '20px', marginBottom: '40px' }}>
                                        <div style={{ backgroundColor: '#fff', border: '2px solid #e0e0e0', borderRadius: '12px', padding: '24px' }}>
                                            <div style={{ fontSize: '40px', marginBottom: '12px' }}>🪓</div>
                                            <h4 style={{ fontSize: '20px', fontWeight: '600', color: '#1a1a1a', marginBottom: '12px' }}>Deforestation</h4>
                                            <p style={{ fontSize: '15px', lineHeight: '1.6', color: '#555', marginBottom: 0 }}>
                                                The process by which forest cover is removed or reduced on a large scale in a given area. It can be caused by human or natural activities.
                                            </p>
                                        </div>

                                        <div style={{ backgroundColor: '#fff', border: '2px solid #e0e0e0', borderRadius: '12px', padding: '24px' }}>
                                            <div style={{ fontSize: '40px', marginBottom: '12px' }}>🏭</div>
                                            <h4 style={{ fontSize: '20px', fontWeight: '600', color: '#1a1a1a', marginBottom: '12px' }}>Pollution</h4>
                                            <p style={{ fontSize: '15px', lineHeight: '1.6', color: '#555', marginBottom: 0 }}>
                                                Occurs when chemical agents that alter the forest ecosystem are introduced, such as waste dumping and industrial emissions.
                                            </p>
                                        </div>

                                        <div style={{ backgroundColor: '#fff', border: '2px solid #e0e0e0', borderRadius: '12px', padding: '24px' }}>
                                            <div style={{ fontSize: '40px', marginBottom: '12px' }}>🌡️</div>
                                            <h4 style={{ fontSize: '20px', fontWeight: '600', color: '#1a1a1a', marginBottom: '12px' }}>Climate change</h4>
                                            <p style={{ fontSize: '15px', lineHeight: '1.6', color: '#555', marginBottom: 0 }}>
                                                Significant variation in climate patterns that affects tropical forests, causing droughts, fires and floods.
                                            </p>
                                        </div>

                                        <div style={{ backgroundColor: '#fff', border: '2px solid #e0e0e0', borderRadius: '12px', padding: '24px' }}>
                                            <div style={{ fontSize: '40px', marginBottom: '12px' }}>🪵</div>
                                            <h4 style={{ fontSize: '20px', fontWeight: '600', color: '#1a1a1a', marginBottom: '12px' }}>Overexploitation</h4>
                                            <p style={{ fontSize: '15px', lineHeight: '1.6', color: '#555', marginBottom: 0 }}>
                                                Excessive logging and exploitation of forest resources without sustainable practices deplete resources and threaten natural regeneration.
                                            </p>
                                        </div>
                                    </div>

                                    {/* Doc. 2 */}
                                    <div style={{ backgroundColor: '#fff3e0', border: '2px solid #f57c00', borderRadius: '12px', padding: '24px', marginBottom: '40px' }}>
                                        <p style={{ fontSize: '14px', fontWeight: '600', color: '#e65100', marginBottom: '12px' }}>Doc. 2 — The impact of productive activities</p>
                                        <h4 style={{ fontSize: '20px', fontWeight: '600', color: '#1a1a1a', marginBottom: '16px' }}>The impact of productive activities on deforestation</h4>
                                        <p style={{ fontSize: '15px', lineHeight: '1.7', color: '#333', marginBottom: 0 }}>
                                            In a recent study, the FAO concluded that between 2000 and 2018, almost 90% of deforestation in tropical areas was related to agriculture (52.3% was due to the expansion of cropland and 37.5%
                                            to the expansion of livestock grazing land). Cropland caused more than 75% of deforestation in Africa and Asia. The most important cause in South America and Oceania was livestock grazing.
                                        </p>
                                        <p style={{ fontSize: '13px', color: '#777', marginTop: '16px', marginBottom: 0 }}>
                                            Source: FAO (2022). The State of the World's Forests.
                                        </p>
                                    </div>
                                </div>

                                {/* Regions affected */}
                                <div style={{ marginBottom: '60px' }}>
                                    <h2 style={{ fontSize: '30px', fontWeight: 'bold', color: '#1a1a1a', marginBottom: '24px' }}>Regions affected by deforestation</h2>
                                    <p style={{ fontSize: '16px', lineHeight: '1.8', color: '#333', marginBottom: '16px' }}>
                                        The regions most affected by deforestation in tropical areas are located in South America, central Africa and Southeast Asia. In South America, deforestation is concentrated in the Amazon,
                                        which is the largest tropical forest in the world. In Africa, the Congo rainforest is threatened by the expansion of agriculture, livestock and mining.
                                    </p>
                                    <p style={{ fontSize: '16px', lineHeight: '1.8', color: '#333', marginBottom: '24px' }}>
                                        In Asia, deforestation occurs mainly in Indonesia, Malaysia and Myanmar, due to oil palm cultivation and overexploitation of wood for the paper industry.
                                        The conversion of tropical forests into agricultural plantations for the production of commercial crops, such as soy and oil palm, remains the most significant cause of deforestation worldwide.
                                    </p>
                                    <p style={{ fontSize: '16px', lineHeight: '1.8', color: '#333', marginBottom: '30px' }}>
                                        Soy is mainly used as feed for cattle, pigs and poultry, and as an ingredient in processed products. African or oil palm is cultivated to obtain palm oil,
                                        which is a common compound in many foods and cosmetic products. The expansion of land for grazing and livestock, as well as the paper industry and illegal timber extraction,
                                        which is often destined for international markets, also increases forest degradation and, ultimately, the risk of their disappearance.
                                    </p>

                                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px', marginBottom: '40px' }}>
                                        <div style={{ backgroundColor: '#e8f5e9', border: '2px solid #2e7d32', borderRadius: '12px', padding: '24px' }}>
                                            <h4 style={{ fontSize: '20px', fontWeight: '600', color: '#1b5e20', marginBottom: '12px' }}>South America</h4>
                                            <p style={{ fontSize: '15px', lineHeight: '1.7', color: '#333', marginBottom: 0 }}>
                                                Deforestation is concentrated in the Amazon, the largest tropical forest in the world. According to WWF, 18% of Amazonian forests have been completely lost and another 17% is degraded
                                                due to large-scale soy cultivation and the expansion of land for grazing.
                                            </p>
                                        </div>

                                        <div style={{ backgroundColor: '#fff3e0', border: '2px solid #f57c00', borderRadius: '12px', padding: '24px' }}>
                                            <h4 style={{ fontSize: '20px', fontWeight: '600', color: '#e65100', marginBottom: '12px' }}>Central Africa</h4>
                                            <p style={{ fontSize: '15px', lineHeight: '1.7', color: '#333', marginBottom: 0 }}>
                                                The Congo River basin (3.7 million km²) is the second largest tropical zone. The main cause is subsistence agriculture, followed by forestry and mining operations.
                                            </p>
                                        </div>

                                        <div style={{ backgroundColor: '#e3f2fd', border: '2px solid #1976d2', borderRadius: '12px', padding: '24px' }}>
                                            <h4 style={{ fontSize: '20px', fontWeight: '600', color: '#0d47a1', marginBottom: '12px' }}>Southeast Asia</h4>
                                            <p style={{ fontSize: '15px', lineHeight: '1.7', color: '#333', marginBottom: 0 }}>
                                                Palm oil production is the main cause, especially in Indonesia and Malaysia, which together produce 84% of the world's palm oil.
                                                Timber activities for the paper industry also have a significant impact.
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                </div>
                            </article>

                        <div className="fixed-video-bottom-right valores-semana1-fixed-video">

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
                            <div className="valores-semana1-circle-shell">
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
                                        src="https://res.cloudinary.com/dutglmj02/video/upload/v1775580777/forest_fnhwrz.mp4"
                                        controls={false}
                                        onLoadedData={() => setVideoLoading(false)}
                                        onLoadStart={() => setVideoLoading(true)}
                                        onError={() => setVideoLoading(false)}
                                        onPlay={() => setIsClassVideoPlaying(true)}
                                        onPause={() => setIsClassVideoPlaying(false)}
                                        onTimeUpdate={(e) => handleTimeUpdate(e.target.currentTime)}
                                    />
                                    <div className="fixed-video-question-wrap valores-semana1-question-wrap">
                                        <textarea
                                            ref={questionTextareaRef}
                                            rows={2}
                                            className="fixed-video-question-input valores-semana1-question-input"
                                            placeholder="Ask me a question"
                                            value={questionText}
                                            onChange={handleQuestionChange}
                                        />
                                        <button
                                            type="button"
                                            className="fixed-video-question-send valores-semana1-question-send"
                                            onClick={handleSendQuestion}
                                            aria-label="Send question"
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

                            {/* <button
                                type="button"
                                className="valores-semana1-exam-btn"
                            >
                                <Link
                                    to="/examen"
                                    className="valores-semana1-exam-btn-link"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                >
                                    Practice <br /> exam
                                </Link>
                            </button> */}
                        </div>
                        <div className="valores-semana1-feature-wrap">
                            <video
                                className="valores-semana1-feature-video unidad-video"
                                src="https://res.cloudinary.com/dutglmj02/video/upload/v1775672380/EnglishLesson_j7x8zl.mp4"
                                controls
                                onLoadedData={() => setVideoLoading(false)}
                                onLoadStart={() => setVideoLoading(true)}
                                onError={() => setVideoLoading(false)}
                                style={{
                                    width: '100%',
                                    height: 'auto',
                                    borderRadius: '12px',
                                    display: videoLoading ? 'none' : 'block'
                                }}
                            />
                        </div>
                        </div>
                    </div>        
                </div>
            </div>
        </div>
    );
}

export default ForestScreen;