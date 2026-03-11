import React, { useState, useRef, useEffect } from 'react';
import Sidebar from '../components/Sidebar';
import Header from '../components/Header';
import { Link } from 'react-router-dom';
import '../App.css';

function BosquesScreen() {
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
                const response = await fetch('/class1.vtt');
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

    return (
        <div className="chat-app">
            <div className="main-container">
                <Sidebar isOpen={isSidebarOpen} toggleSidebar={toggleSidebar} />
                <div className="main-content">
                    <Header isSidebarOpen={isSidebarOpen} toggleSidebar={toggleSidebar} />
                    <div className="content-area" ref={contentRef}>
                        <div className="center-content2">
                            <div style={{ maxWidth: '900px', margin: '0 auto', padding: '20px' }}>

                                <div style={{ textAlign: 'center', marginBottom: '40px' }}>
                                    <div style={{ display: 'inline-block', backgroundColor: '#e8f5e9', padding: '8px 24px', borderRadius: '20px', marginBottom: '16px' }}>
                                        <span style={{ color: '#2e7d32', fontSize: '14px', fontWeight: '500' }}>Libro convertido a web, video and audio by AI</span>
                                    </div>
                                    <br />
                                    <a 
                                        href="https://www.mined.gob.sv/materiales/2026/CIUDADANIA_Y_VALORES/2.%20Libros%20de%20texto/Libro%20de%20texto%209.%C2%B0%20grado.pdf" 
                                        target="_blank" 
                                        rel="noreferrer"
                                        className="navButton23"
                                    >
                                        Link del libro
                                    </a>
                                    <br />  <br />    
                                    <Link to="/forest" className='link25' >English Version</Link>

                                                                                                      
                                </div>                                
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
                                                src="classm1.mp4"                                          
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

                                        <h3 style={{ fontSize: '28px', fontWeight: 'bold', color: '#1a1a1a', marginBottom: '20px' }}>Los bosques: importancia y clasificación</h3>
                                        <p style={{ fontSize: '16px', lineHeight: '1.8', color: '#333', marginBottom: '16px' }}>
                                            Los bosques son ecosistemas complejos que desempeñan un papel vital para la vida humana. Cubren alrededor del 31 % de la superficie terrestre del mundo y cumplen diversas funciones 
                                        </p>

                                        {/* <p style={{ fontSize: '16px', lineHeight: '1.8', color: '#333', marginBottom: '16px' }}>
                                            Entre las que se incluyen producción de oxígeno, purificación del aire, provisión de agua y de otros recursos naturales, por lo que son muy importantes para el mantenimiento de la salud y el equilibrio del planeta.
                                        </p> */}
                                        <p style={{ fontSize: '16px', lineHeight: '1.8', color: '#333', marginBottom: '30px' }}>
                                            La clasificación de los bosques se basa en distintos criterios, como la zona climática en la que se encuentran, el tipo de vegetación que los conforman o su función ecológica. 
                                        </p>
                                        <p style={{ fontSize: '16px', lineHeight: '1.8', color: '#333', marginBottom: '30px' }}>
                                        En relación con la zona climática, los bosques se dividen en: tropicales, subtropicales, templados y boreales. De estos, las zonas tropicales destacan por tener la mayor proporción de bosques a nivel mundial, alcanzando el 45 %, mientras que el resto se distribuye entre las otras zonas climáticas.
                                        </p>


                                        {/* Chart */}
                                        <div style={{ backgroundColor: '#f5f5f5', padding: '32px', borderRadius: '12px', marginBottom: '24px' }}>
                                            <h4 style={{ fontSize: '20px', fontWeight: '600', color: '#1a1a1a', marginBottom: '24px', textAlign: 'center' }}>Distribución mundial de los bosques por zona climática</h4>
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
                                                    <div style={{ fontSize: '16px', color: '#555' }}>Templada</div>
                                                </div>
                                                <div style={{ textAlign: 'center' }}>
                                                    <div style={{ fontSize: '48px', fontWeight: 'bold', color: '#c62828', marginBottom: '8px' }}>11%</div>
                                                    <div style={{ fontSize: '16px', color: '#555' }}>Subtropical</div>
                                                </div>
                                            </div>
                                            <p style={{ fontSize: '13px', color: '#777', marginTop: '24px', textAlign: 'center' }}>Fuente: FAO (2020). Evaluación de los recursos forestales mundiales.</p>
                                        </div>

                                        {/* Conexión geográfica */}
                                        <div style={{ backgroundColor: '#e3f2fd', border: '2px solid #1976d2', borderRadius: '12px', padding: '20px', marginBottom: '40px' }}>
                                            <p style={{ fontSize: '15px', fontWeight: '600', color: '#1976d2', marginBottom: '8px' }}>Conexión geográfica</p>
                                            <p style={{ fontSize: '15px', color: '#333', marginBottom: 0 }}>Cerca del 54 % de los bosques del mundo se concentran en cinco naciones: Rusia, Brasil, Canadá, Estados Unidos y China.</p>
                                        </div>
                                    </div>

                                    {/* Características de los bosques tropicales */}
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

                                    {/* Principales problemáticas */}
                                    <div style={{ marginBottom: '40px' }}>
                                        <h3 style={{ fontSize: '28px', fontWeight: 'bold', color: '#1a1a1a', marginBottom: '30px' }}>Principales problemáticas de los bosques tropicales</h3>
                                        <p style={{ fontSize: '16px', lineHeight: '1.8', color: '#333', marginBottom: '30px' }}>
                                            Los bosques tropicales, a pesar de su importancia ecológica, se enfrentan a diversas problemáticas que ponen en riesgo su existencia:
                                        </p>

                                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '20px', marginBottom: '40px' }}>
                                            <div style={{ backgroundColor: '#fff', border: '2px solid #e0e0e0', borderRadius: '12px', padding: '24px' }}>
                                                <div style={{ fontSize: '48px', marginBottom: '12px' }}>🪓</div>
                                                <h4 style={{ fontSize: '20px', fontWeight: '600', color: '#1a1a1a', marginBottom: '12px' }}>La deforestación</h4>
                                                <p style={{ fontSize: '15px', lineHeight: '1.6', color: '#555', marginBottom: 0 }}>
                                                    Proceso mediante el cual se elimina o reduce, a gran escala, la cobertura forestal de un área determinada. Puede ser causada por actividades humanas o naturales.
                                                </p>
                                            </div>

                                            <div style={{ backgroundColor: '#fff', border: '2px solid #e0e0e0', borderRadius: '12px', padding: '24px' }}>
                                                <div style={{ fontSize: '48px', marginBottom: '12px' }}>🏭</div>
                                                <h4 style={{ fontSize: '20px', fontWeight: '600', color: '#1a1a1a', marginBottom: '12px' }}>La contaminación</h4>
                                                <p style={{ fontSize: '15px', lineHeight: '1.6', color: '#555', marginBottom: 0 }}>
                                                    Se produce al introducir agentes químicos que alteran el ecosistema forestal, como el vertido de residuos y las emisiones industriales.
                                                </p>
                                            </div>

                                            <div style={{ backgroundColor: '#fff', border: '2px solid #e0e0e0', borderRadius: '12px', padding: '24px' }}>
                                                <div style={{ fontSize: '48px', marginBottom: '12px' }}>🌡️</div>
                                                <h4 style={{ fontSize: '20px', fontWeight: '600', color: '#1a1a1a', marginBottom: '12px' }}>El cambio climático</h4>
                                                <p style={{ fontSize: '15px', lineHeight: '1.6', color: '#555', marginBottom: 0 }}>
                                                    Variación significativa de los patrones climáticos que afecta a los bosques tropicales causando sequías, incendios e inundaciones.
                                                </p>
                                            </div>

                                            <div style={{ backgroundColor: '#fff', border: '2px solid #e0e0e0', borderRadius: '12px', padding: '24px' }}>
                                                <div style={{ fontSize: '48px', marginBottom: '12px' }}>🪵</div>
                                                <h4 style={{ fontSize: '20px', fontWeight: '600', color: '#1a1a1a', marginBottom: '12px' }}>La sobreexplotación</h4>
                                                <p style={{ fontSize: '15px', lineHeight: '1.6', color: '#555', marginBottom: 0 }}>
                                                    La tala excesiva y la explotación de recursos forestales sin prácticas sostenibles agotan los recursos y amenazan la regeneración natural.
                                                </p>
                                            </div>
                                        </div>

                                        {/* Doc. 2 */}
                                        <div style={{ backgroundColor: '#fff3e0', border: '2px solid #f57c00', borderRadius: '12px', padding: '24px', marginBottom: '40px' }}>
                                            <p style={{ fontSize: '14px', fontWeight: '600', color: '#e65100', marginBottom: '12px' }}>Doc. 2 — El impacto de las actividades productivas</p>
                                            <h4 style={{ fontSize: '20px', fontWeight: '600', color: '#1a1a1a', marginBottom: '16px' }}>El impacto de las actividades productivas en la deforestación</h4>
                                            <p style={{ fontSize: '15px', lineHeight: '1.7', color: '#333', marginBottom: 0 }}>
                                                En un estudio reciente, la FAO concluyó que, entre 2000 y 2018, casi el 90 % de la deforestación en zonas tropicales guarda relación con la agricultura (el 52.3 % se derivaba de la ampliación de las tierras de cultivo y el 37.5 %
                                                </p>
                                                <p style={{ fontSize: '15px', lineHeight: '1.7', color: '#333', marginBottom: 0 }}>
                                                De la ampliación de las tierras de pastoreo de ganado). Las tierras de cultivo provocaron más del 75 % de la deforestación de África y Asia. La causa más importante en América del Sur y Oceanía fue el pastoreo de ganado.
                                            </p>
                                            <p style={{ fontSize: '13px', color: '#777', marginTop: '16px', marginBottom: 0 }}>Fuente: FAO (2022). El estado de los bosques del mundo.</p>
                                        </div>
                                    </div>

                                    {/* Regiones afectadas */}
                                    <div style={{ marginBottom: '40px' }}>
                                        <h3 style={{ fontSize: '28px', fontWeight: 'bold', color: '#1a1a1a', marginBottom: '20px' }}>Regiones afectadas por la deforestación</h3>
                                        <p style={{ fontSize: '16px', lineHeight: '1.8', color: '#333', marginBottom: '16px' }}>
                                            Las regiones más afectadas por la deforestación en las zonas tropicales se localizan en América del Sur, el centro de África y el sudeste de Asia.
                                        </p>
                                            <p style={{ fontSize: '16px', lineHeight: '1.8', color: '#333', marginBottom: '16px' }}>
                                            En América del Sur, la deforestación se concentra en la Amazonía, que es el bosque tropical más grande del mundo. En África, la Selva del Congo se encuentra amenazada por la expansión de la agricultura, la ganadería y la minería.
                                            </p>
                                            <p style={{ fontSize: '16px', lineHeight: '1.8', color: '#333', marginBottom: '16px' }}>
                                            En Asia, la deforestación se produce principalmente en Indonesia, Malasia y Birmania, a causa del cultivo de palma aceitera y la sobreexplotación de madera para la industria de papel.
                                            </p>
                                        
                                        <p style={{ fontSize: '16px', lineHeight: '1.8', color: '#333', marginBottom: '30px' }}>
                                            La conversión de bosques tropicales en plantaciones agrícolas para la producción de cultivos comerciales, como la soya y la palma aceitera, sigue siendo la causa más significativa de deforestación en todo el mundo. 
                                            </p>
                                            <p style={{ fontSize: '16px', lineHeight: '1.8', color: '#333', marginBottom: '30px' }}>
                                            La soya se utiliza principalmente como alimento para ganado, cerdos y aves de corral, y como ingrediente en productos procesados. La palma africana o aceitera se cultiva para obtener aceite de palma, que es un compuesto común en muchos alimentos y productos cosméticos. 
                                            </p>
                                            <p style={{ fontSize: '16px', lineHeight: '1.8', color: '#333', marginBottom: '30px' }}>
                                            La expansión de tierras para el pastoreo y la ganadería, así como la industria del papel y la extracción ilegal de madera, que a menudo se destina a los mercados internacionales, también aumenta la degradación de los bosques y, en última instancia, su riesgo de desaparición.
                                        </p>

                                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px', marginBottom: '40px' }}>
                                            <div style={{ backgroundColor: '#e8f5e9', border: '2px solid #2e7d32', borderRadius: '12px', padding: '24px' }}>
                                                <h4 style={{ fontSize: '20px', fontWeight: '600', color: '#1b5e20', marginBottom: '12px' }}>América del Sur</h4>
                                                <p style={{ fontSize: '15px', lineHeight: '1.7', color: '#333', marginBottom: 0 }}>
                                                    La deforestación se concentra en la Amazonía, el bosque tropical más grande del mundo. Según WWF, el 18 % de los bosques amazónicos se ha perdido completamente y otro 17 % está degradado debido al cultivo a gran escala de soya y la expansión de tierras para pastoreo.
                                                </p>
                                            </div>

                                            <div style={{ backgroundColor: '#fff3e0', border: '2px solid #f57c00', borderRadius: '12px', padding: '24px' }}>
                                                <h4 style={{ fontSize: '20px', fontWeight: '600', color: '#e65100', marginBottom: '12px' }}>Centro de África</h4>
                                                <p style={{ fontSize: '15px', lineHeight: '1.7', color: '#333', marginBottom: 0 }}>
                                                    La cuenca del río Congo (3.7 millones de km²) es la segunda zona tropical más grande. La causa principal es la agricultura de subsistencia, seguida por la explotación forestal y las operaciones mineras.
                                                </p>
                                            </div>

                                            <div style={{ backgroundColor: '#e3f2fd', border: '2px solid #1976d2', borderRadius: '12px', padding: '24px' }}>
                                                <h4 style={{ fontSize: '20px', fontWeight: '600', color: '#0d47a1', marginBottom: '12px' }}>Sudeste asiático</h4>
                                                <p style={{ fontSize: '15px', lineHeight: '1.7', color: '#333', marginBottom: 0 }}>
                                                    La producción de aceite de palma es la principal causa, especialmente en Indonesia y Malasia, que juntas producen el 84 % del aceite de palma del mundo. Las actividades madereras para la industria del papel también tienen un impacto significativo.
                                                </p>
                                            </div>
                                        </div>
                                    </div>


                                    {videoLoading && (
                                        <div style={{ 
                                            display: 'flex', 
                                            alignItems: 'center', 
                                            justifyContent: 'center', 
                                            padding: '40px', 
                                            marginBottom: '20px',
                                            backgroundColor: '#f5f7fa',
                                            borderRadius: '12px',
                                            border: '2px solid #e5e7eb',
                                            minHeight: '200px'
                                        }}>
                                            <div style={{ textAlign: 'center' }}>
                                                <svg 
                                                    width="32" 
                                                    height="32" 
                                                    viewBox="0 0 24 24" 
                                                    fill="none" 
                                                    stroke="#3b82f6" 
                                                    strokeWidth="2" 
                                                    className="audio-loading-spinner"
                                                    style={{ marginBottom: '12px' }}
                                                >
                                                    <circle cx="12" cy="12" r="10" strokeOpacity="0.25" />
                                                    <path d="M12 2a10 10 0 0 1 10 10" strokeLinecap="round" />
                                                </svg>
                                                <div style={{ color: '#374151', fontSize: '15px', fontWeight: '500' }}>
                                                    Cargando video...
                                                </div>
                                            </div>
                                        </div>
                                    )}                     
                                    <video 
                                        src="/bosques1.mp4"                                          
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

                                <div style={{ marginBottom: '60px' }}>
                                    {/* <h2 style={{ fontSize: '36px', fontWeight: 'bold', color: '#1a1a1a', marginBottom: '40px' }}>Consolidación</h2> */}

                                    {/* <div style={{ backgroundColor: '#fff', border: '2px solid #e0e0e0', borderRadius: '16px', padding: '32px', marginBottom: '24px' }}>
                                        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '20px' }}>
                                            <div style={{ backgroundColor: '#1976d2', color: 'white', width: '48px', height: '48px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '24px', fontWeight: 'bold', flexShrink: 0 }}>6</div>
                                            <div style={{ flex: 1 }}>
                                                <h4 style={{ fontSize: '18px', fontWeight: '600', color: '#1a1a1a', marginBottom: '12px' }}>Actividad en pares</h4>
                                                <p style={{ fontSize: '16px', fontWeight: '600', color: '#333', marginBottom: '16px' }}>Propuestas de conservación</p>
                                                <p style={{ color: '#555', fontSize: '15px', marginBottom: 0 }}>
                                                    Establezcan tres acciones que se pueden realizar desde diferentes entidades para la conservación de los bosques tropicales en el mundo considerando las principales problemáticas.
                                                </p>
                                            </div>
                                        </div>
                                    </div> */}

                                    {/* <div style={{ backgroundColor: '#fff', border: '2px solid #e0e0e0', borderRadius: '16px', padding: '32px', marginBottom: '24px' }}>
                                        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '20px' }}>
                                            <div style={{ backgroundColor: '#1976d2', color: 'white', width: '48px', height: '48px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '24px', fontWeight: 'bold', flexShrink: 0 }}>8</div>
                                            <div style={{ flex: 1 }}>
                                                <h4 style={{ fontSize: '18px', fontWeight: '600', color: '#1a1a1a', marginBottom: '12px' }}>Actividad en equipo</h4>
                                                <p style={{ fontSize: '16px', fontWeight: '600', color: '#333', marginBottom: '16px' }}>Investigación y presentación</p>
                                                <p style={{ color: '#555', fontSize: '15px', marginBottom: '16px' }}>
                                                    Identifiquen y expliquen las problemáticas de los bosques tropicales. Seleccionen uno de los siguientes bosques:
                                                </p>
                                                
                                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
                                                    <div style={{ backgroundColor: '#f5f5f5', padding: '16px', borderRadius: '8px' }}>
                                                        <h5 style={{ fontSize: '16px', fontWeight: '600', color: '#1a1a1a', marginBottom: '8px' }}>Amazonas</h5>
                                                        <p style={{ fontSize: '14px', color: '#555', marginBottom: 0 }}>El bosque tropical más grande del mundo.</p>
                                                    </div>
                                                    <div style={{ backgroundColor: '#f5f5f5', padding: '16px', borderRadius: '8px' }}>
                                                        <h5 style={{ fontSize: '16px', fontWeight: '600', color: '#1a1a1a', marginBottom: '8px' }}>El Congo</h5>
                                                        <p style={{ fontSize: '14px', color: '#555', marginBottom: 0 }}>Segunda zona tropical más grande.</p>
                                                    </div>
                                                    <div style={{ backgroundColor: '#f5f5f5', padding: '16px', borderRadius: '8px' }}>
                                                        <h5 style={{ fontSize: '16px', fontWeight: '600', color: '#1a1a1a', marginBottom: '8px' }}>El Daintree</h5>
                                                        <p style={{ fontSize: '14px', color: '#555', marginBottom: 0 }}>Selva tropical de Australia.</p>
                                                    </div>
                                                    <div style={{ backgroundColor: '#f5f5f5', padding: '16px', borderRadius: '8px' }}>
                                                        <h5 style={{ fontSize: '16px', fontWeight: '600', color: '#1a1a1a', marginBottom: '8px' }}>Monteverde</h5>
                                                        <p style={{ fontSize: '14px', color: '#555', marginBottom: 0 }}>Bosque nuboso de Costa Rica.</p>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div> */}

                                </div>                                
                            </div>
                        </div>
                    </div>
                </div>
            </div>

        </div>
    );
}

export default BosquesScreen;
