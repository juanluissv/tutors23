import React, { useState, useRef, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom';
import Sidebar from '../../../../components/Sidebar'
import Header from '../../../../components/Header'
import '../../../../App.css'

function Semana1Screen () {
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
                const response = await fetch('/unidad1Semana1.vtt');
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
		<div className='chat-app chat-app--valores-semana1'>
			<div className='main-container'>
				<Sidebar isOpen={isSidebarOpen} toggleSidebar={toggleSidebar} />
				<div className='main-content'>
					<Header
						isSidebarOpen={isSidebarOpen}
						toggleSidebar={toggleSidebar}
					/>
					<div
						className='content-area content-area--valores-semana1'
						ref={contentRef}
					>
						<div className='center-content2 valores-semana1-center'>
							<div className='valores-semana1-lang-row'>
								<div className='valores-semana1-lang-pill'>
									<Link
										to='/forest'
										className='valores-semana1-lang-link'
									>
										English Version
									</Link>
								</div>
								<div className='valores-semana1-lang-pill'>
									<Link
										to='/french'
										className='valores-semana1-lang-link'
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
							<article className='valores-semana1-article-card'>
								<div
									className='valores-semana1-article-accent'
									aria-hidden
								/>
								<div className='unidad-wrapper valores-semana1-unidad-inner'>
								<div className='unidad-header valores-semana1-hero'>
									<p className='valores-semana1-eyebrow'>
										Ciudadanía y valores · 9.° grado
									</p>
									<h1 className='unidad-title valores-semana1-title heading-gradient'>
										Unidad 1 · Semana 1
									</h1>
									<h2 className='unidad-subtitle valores-semana1-subtitle'>
										Los bosques tropicales en el mundo
									</h2>
								</div>

								<section>
									<h3 className='unidad-section-title'>
										Los bosques: importancia y
										clasificación
									</h3>
									<p className='unidad-paragraph'>
										Los bosques son ecosistemas complejos
										que desempeñan un papel vital para la
										vida humana. Cubren alrededor del 31 %
										de la superficie terrestre del mundo
										y cumplen diversas funciones
									</p>
									<p className='unidad-paragraph'>
										Entre las que se incluyen la producción de
										oxígeno, la purificación del aire, la
										provisión de agua y de otros recursos
										naturales, por lo que son muy
										importantes para el mantenimiento de
										la salud y el equilibrio del planeta.
									</p>
									<p className='unidad-paragraph'>
										La clasificación de los bosques se
										basa en distintos criterios, como la
										zona climática en la que se
										encuentran, el tipo de vegetación que
										los conforma o su función ecológica.
									</p>
									<p className='unidad-paragraph unidad-paragraph-bottom'>
										En relación con la zona climática, los
										bosques se dividen en: tropicales,
										subtropicales, templados y boreales.
										De estos, las zonas tropicales
										destacan por tener la mayor proporción
										de bosques a nivel mundial,
										alcanzando el 45 %, mientras que el
										resto se distribuye entre las otras
										zonas climáticas.
									</p>

									<div className='unidad-chart-box'>
										<h4 className='unidad-chart-title'>
											Distribución mundial de los
											bosques por zona climática
										</h4>
										<div className='unidad-chart-grid'>
											<div className='unidad-chart-item'>
												<div className='unidad-chart-value tropical'>
													45%
												</div>
												<div className='unidad-chart-label'>
													Tropical
												</div>
											</div>
											<div className='unidad-chart-item'>
												<div className='unidad-chart-value boreal'>
													27%
												</div>
												<div className='unidad-chart-label'>
													Boreal
												</div>
											</div>
											<div className='unidad-chart-item'>
												<div className='unidad-chart-value templada'>
													16%
												</div>
												<div className='unidad-chart-label'>
													Templada
												</div>
											</div>
											<div className='unidad-chart-item'>
												<div className='unidad-chart-value subtropical'>
													11%
												</div>
												<div className='unidad-chart-label'>
													Subtropical
												</div>
											</div>
										</div>
										<p className='unidad-chart-footer'>
											Fuente: FAO (2020). Evaluación de
											los recursos forestales mundiales.
										</p>
									</div>

									<div className='unidad-info-box'>
										<p className='unidad-info-title'>
											Conexión geográfica
										</p>
										<p className='unidad-info-text'>
											Cerca del 54 % de los bosques del
											mundo se concentran en cinco
											naciones: Rusia, Brasil, Canadá,
											Estados Unidos y China.
										</p>
									</div>
								</section>

								<section>
									<h3 className='unidad-section-title'>
										Características de los bosques
										tropicales
									</h3>
									<p className='unidad-paragraph'>
										Los bosques tropicales se localizan en
										la zona intertropical y constituyen
										uno de los ecosistemas más
										transcendentales a nivel mundial.
									</p>
									<p className='unidad-paragraph'>
										Se caracterizan por su clima cálido y
										húmedo y experimentan precipitaciones
										abundantes a lo largo de todo el año,
										creando condiciones propicias para la
										vida vegetal y animal.
									</p>
									<p className='unidad-paragraph'>
										Además, destacan por albergar una
										asombrosa diversidad biológica, con
										aproximadamente el 60 % de las
										especies conocidas de fauna y flora a
										nivel mundial.
									</p>
									<p className='unidad-paragraph unidad-paragraph-bottom'>
										Sin embargo, en las últimas décadas,
										la deforestación ha amenazado
										seriamente la salud y la estabilidad
										de estos bosques, afectando a
										regiones enteras.
									</p>
								</section>

								<section>
									<h3 className='unidad-section-title'>
										Principales problemáticas de los
										bosques tropicales
									</h3>
									<p className='unidad-paragraph unidad-paragraph-bottom'>
										Los bosques tropicales, a pesar de su
										importancia ecológica, se enfrentan a
										diversas problemáticas que ponen en
										riesgo su existencia:
									</p>

									<div className='unidad-problem-grid'>
										<div className='unidad-problem-card'>
											<h4 className='unidad-problem-title'>
												La deforestación
											</h4>
											<p className='unidad-problem-text'>
												Es el proceso mediante el cual
												se elimina o reduce, a gran
												escala, la cobertura forestal
												de un área determinada. Puede
												ser causada por actividades
												humanas o naturales.
											</p>
										</div>
										<div className='unidad-problem-card'>
											<h4 className='unidad-problem-title'>
												La contaminación
											</h4>
											<p className='unidad-problem-text'>
												Se produce al introducir
												agentes químicos que alteran el
												ecosistema forestal, como el
												vertido de residuos y las
												emisiones industriales.
											</p>
										</div>
										<div className='unidad-problem-card'>
											<h4 className='unidad-problem-title'>
												El cambio climático
											</h4>
											<p className='unidad-problem-text'>
												Es la variación significativa de
												los patrones climáticos de la
												Tierra que afecta a los bosques
												tropicales, haciéndolos más
												vulnerables a sequías,
												incendios e inundaciones.
											</p>
										</div>
										<div className='unidad-problem-card'>
											<h4 className='unidad-problem-title'>
												La sobreexplotación
											</h4>
											<p className='unidad-problem-text'>
												La tala excesiva y la
												explotación de recursos
												forestales sin prácticas
												sostenibles agotan los recursos
												y amenazan la capacidad de
												regeneración natural de los
												bosques tropicales.
											</p>
										</div>
									</div>

									<div className='unidad-doc-box'>
										<p className='unidad-doc-kicker'>
											Doc. 2 — El impacto de las
											actividades productivas en la
											deforestación
										</p>
										<p className='unidad-doc-text'>
											En un estudio reciente, la FAO
											concluyó que, entre 2000 y 2018,
											casi el 90 % de la deforestación
											en zonas tropicales guarda
											relación con la agricultura (el
											52.3 % se derivaba de la
											ampliación de las tierras de
											cultivo y el 37.5 % de la
											ampliación de las tierras de
											pastoreo de ganado).
										</p>
										<p className='unidad-doc-text'>
											Las tierras de cultivo provocaron
											más del 75 % de la deforestación
											de África y Asia. La causa más
											importante en América del Sur y
											Oceanía fue el pastoreo de ganado.
										</p>
										<p className='unidad-doc-footer'>
											Fuente: FAO (2022). El estado de
											los bosques del mundo.
										</p>
									</div>
								</section>

								<section>
									<h3 className='unidad-section-title'>
										Regiones afectadas por la
										deforestación en bosques tropicales
									</h3>
									<p className='unidad-paragraph'>
										Las regiones más afectadas por la
										deforestación en las zonas tropicales
										se localizan en América del Sur, el
										centro de África y el sudeste de
										Asia.
									</p>
									<p className='unidad-paragraph'>
										En América del Sur, la deforestación
										se concentra en la Amazonía, que es
										el bosque tropical más grande del
										mundo. En África, la Selva del Congo
										se encuentra amenazada por la
										expansión de la agricultura, la
										ganadería y la minería.
									</p>
									<p className='unidad-paragraph unidad-paragraph-bottom'>
										En Asia, la deforestación se produce
										principalmente en Indonesia, Malasia
										y Birmania, a causa del cultivo de
										palma aceitera y la sobreexplotación
										de madera para la industria del
										papel.
									</p>

									<div className='unidad-regions-grid'>
										<div className='unidad-region-card green'>
											<h4 className='unidad-region-title green'>
												América del Sur
											</h4>
											<p className='unidad-region-text'>
												La deforestación se concentra
												en la Amazonía. Según WWF, el
												18 % de los bosques amazónicos
												se ha perdido completamente y
												otro 17 % está degradado debido
												al cultivo a gran escala de
												soya y a la expansión de tierras
												para pastoreo, junto con la
												minería y la sobreexplotación
												de madera.
											</p>
										</div>
										<div className='unidad-region-card orange'>
											<h4 className='unidad-region-title orange'>
												Centro de África
											</h4>
											<p className='unidad-region-text'>
												La cuenca del río Congo, con un
												área de 3.7 millones de km², es
												la segunda zona tropical más
												grande del mundo. La causa
												principal de deforestación es la
												agricultura de subsistencia,
												seguida por la explotación
												forestal, tanto industrial como
												artesanal, y las operaciones
												mineras.
											</p>
										</div>
										<div className='unidad-region-card blue'>
											<h4 className='unidad-region-title blue'>
												Sudeste asiático
											</h4>
											<p className='unidad-region-text'>
												La producción de aceite de palma
												es la principal causa de la
												deforestación, especialmente en
												Indonesia y Malasia, que juntas
												producen el 84 % del aceite de
												palma del mundo. Las actividades
												madereras destinadas a la
												industria del papel y las
												prácticas agrícolas de tala y
												quema también ejercen un impacto
												significativo.
											</p>
										</div>
									</div>
								</section>							
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
									src="https://res.cloudinary.com/dutglmj02/video/upload/v1775580554/unidad1Semana1_z3bi1a.mp4"     
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
										placeholder="Hazme una pregunta"
										value={questionText}
										onChange={handleQuestionChange}
									/>
									<button
										type="button"
										className="fixed-video-question-send valores-semana1-question-send"
										onClick={handleSendQuestion}
										aria-label="Enviar pregunta"
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

							<button
								type="button"
								className='valores-semana1-exam-btn'
							>
							<Link
								to="/examen"
								className="valores-semana1-exam-btn-link"
								target="_blank"
								rel="noopener noreferrer"
							>
								Examen <br /> de práctica
							</Link>
							</button>
						</div>
						<div className="valores-semana1-feature-wrap">
						<video
							className="valores-semana1-feature-video unidad-video"
                            src="https://res.cloudinary.com/dutglmj02/video/upload/v1775596686/bosques1_ne7opd.mp4"
                            controls
                            onLoadedData={() => setVideoLoading(false)}
                            onLoadStart={() => setVideoLoading(true)}
                            onError={() => setVideoLoading(false)}
                            style={{
                            width: '100%',
                            height: 'auto',
                            display: videoLoading ? 'none' : 'block'
                            }}
                        />
						</div>
						</div>
					</div>
				</div>
			</div>
		</div>
	)
}

export default Semana1Screen