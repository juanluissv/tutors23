import React, { useState, useRef, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom';
import Sidebar from '../../../../components/Sidebar'
import Header from '../../../../components/Header'
import '../../../../App.css'

function Semana3Screen () {
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
                const response = await fetch('/unidad1Semana3.vtt');
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
		<div className='chat-app'>
			<div className='main-container'>
				<Sidebar isOpen={isSidebarOpen} toggleSidebar={toggleSidebar} />
				<div className='main-content'>
					<Header
						isSidebarOpen={isSidebarOpen}
						toggleSidebar={toggleSidebar}
					/>
					<div className='content-area' ref={contentRef}>
						<div className='center-content2'>
							<div className='semana1-text-shift'>
							<div className='unidad-wrapper'>
								<div className='unidad-header'>
									<div className='unidad-pill'>
										<span className='unidad-pill-text'>
											Libro convertido a web by AI
										</span>
									</div>
									<h1 className='unidad-title'>
										Unidad 1 · Semana 3
									</h1>
									<h2 className='unidad-subtitle'>
										Recursos hídricos: rol de los Gobiernos
										locales, nacionales y regionales
									</h2>
								</div>

								<section>
									<h3 className='unidad-section-title'>
										Los recursos hídricos
									</h3>
									<p className='unidad-paragraph'>
										El agua es un recurso fundamental para
										la vida y es esencial para mantener la
										salud y el bienestar de las personas.
										A pesar de que el planeta Tierra está
										compuesto en su mayoría de agua, solo
										el 3 % de este recurso es agua dulce,
										es decir, apta para el consumo humano
										y para la actividad agrícola e
										industrial.
									</p>
									<p className='unidad-paragraph'>
										Las principales fuentes de
										abastecimiento del recurso hídrico se
										encuentran en las aguas superficiales
										que tienen los países o regiones
										(ríos, lagos y lagunas) y en aguas
										subterráneas (acuíferos).
									</p>
								</section>

								<section>
									<h3 className='unidad-section-title'>
										Situación actual de los recursos
										hídricos
									</h3>
									<p className='unidad-paragraph'>
										La Organización de las Naciones Unidas
										expresa que, a pesar de los avances,
										en 2022 existen millones de personas
										que todavía carecen de servicios de
										agua potable gestionados de forma
										segura. Además, en muchos países, la
										contaminación del agua plantea un
										considerable desafío para la salud
										humana y el medioambiente.
									</p>
									<p className='unidad-paragraph'>
										Se prevé que la población urbana
										mundial que se enfrenta a la escasez
										de agua se duplique, pasando de 930
										millones en 2016 a 1700/2400 millones
										de personas en 2050.
									</p>

									<div className='unidad-info-box'>
										<p className='unidad-info-title'>
											Conexión geográfica
										</p>
										<p className='unidad-info-text'>
											La seguridad hídrica es la
											capacidad de salvaguardar el acceso
											sostenible a cantidades adecuadas
											de agua de calidad aceptable para
											sostener los medios de vida, el
											bienestar humano y el desarrollo
											socioeconómico.
										</p>
									</div>
								</section>

								<section>
									<h3 className='unidad-section-title'>
										Protección y conservación de los
										recursos hídricos
									</h3>
									<p className='unidad-paragraph'>
										La protección del recurso hídrico
										incluye acciones que permiten mantener
										su disponibilidad y calidad. Para
										efectos de garantizar la
										sostenibilidad, es recomendable iniciar
										acciones de protección y conservación
										a escalas local, nacional y regional.
									</p>
									<p className='unidad-paragraph'>
										Los llamados a proteger y conservar el
										agua son todas las personas, es decir,
										el que hace uso del recurso, ya sea
										para satisfacer las necesidades
										básicas o para el desarrollo
										económico del país; sobre todo,
										proteger y conservar el agua es
										competencia de autoridades
										gubernamentales y finalmente de la
										población en general.
									</p>
									<p className='unidad-paragraph'>
										En El Salvador existen diferentes
										instituciones responsables de velar
										por la protección y conservación del
										recurso hídrico mediante normativas,
										programas de educación ambiental,
										implementación de proyectos
										encaminados a la conservación y
										protección del recurso, entre otras.
									</p>
								</section>

								<section>
									<h3 className='unidad-section-title'>
										Rol de los gobiernos locales en el
										manejo de los recursos hídricos
									</h3>
									<p className='unidad-paragraph'>
										Según la Comisión Económica para
										América Latina y el Caribe (CEPAL),
										los municipios son promotores y
										administradores de desarrollo
										socioeconómico a nivel local, cuyas
										decisiones tienen efectos
										significativos sobre los sistemas
										natural y social, y por este medio
										sobre el agua, sus usos y usuarios.
									</p>
									<p className='unidad-paragraph'>
										Las atribuciones de los gobiernos
										locales en materia de agua se
										relacionan principalmente con su
										aprovechamiento, como el
										abastecimiento de agua potable, el
										saneamiento, la promoción del
										desarrollo económico en el territorio,
										el drenaje urbano, el control de aguas
										lluvias, entre otras.
									</p>
									<p className='unidad-paragraph'>
										En El Salvador, en el año 2022 entró
										en vigencia La Ley General de Recursos
										Hídricos, que tiene por objetivo
										regular la gestión integral de las
										aguas, su sostenibilidad, y garantizar
										el derecho humano al agua. Una de sus
										finalidades es involucrar a la sociedad
										salvadoreña en los procesos de
										gestión, administración y toma de
										decisiones sobre el agua del país a
										través de espacios participativos para
										toda la población. Es por eso que en
										esta ley se han tomado en cuenta las
										juntas de agua (Doc. 2).
									</p>

									<div className='unidad-info-box'>
										<p className='unidad-info-title'>
											Glosario
										</p>
										<p className='unidad-info-text'>
											Juntas de agua. Son organizaciones
											sociales sin fines de lucro, con
											personería jurídica, cuyo objetivo
											es proveer a su comunidad de agua
											potable y opciones para su
											tratamiento.
										</p>
									</div>

									<div className='unidad-doc-box'>
										<p className='unidad-doc-kicker'>
											Doc. 2 — Las juntas de agua
										</p>
										<p className='unidad-doc-text'>
											Las juntas de agua son esenciales
											en El Salvador porque permiten el
											acceso al agua potable a las
											comunidades que no cuentan con ese
											servicio, promueven la
											participación comunitaria y
											contribuyen a la protección del
											medioambiente. La Ley General de
											Recursos Hídricos establece que
											estas deben ser incluidas en los
											procesos de planificación y gestión
											del agua a nivel local,
											departamental y nacional como, por
											ejemplo, la elaboración de El Plan
											Nacional de Gestión Integrada de
											los Recursos Hídricos. Además, les
											asigna un papel importante en la
											toma de decisiones relacionadas con
											el uso y conservación del agua.
										</p>
										<p className='unidad-doc-footer'>
											Fuente: Autoridad Salvadoreña del
											Agua (ASA). Conozcamos la ley
											General de Recursos Hídricos.
										</p>
									</div>

									
								</section>

								<section>
									<h3 className='unidad-section-title'>
										Rol de la Autoridad Salvadoreña del
										Agua (ASA)
									</h3>
									<p className='unidad-paragraph'>
										Como ya se mencionó, en El Salvador
										existen diferentes instituciones
										responsables de velar por la
										protección y conservación del recurso
										hídrico mediante normativas, programas
										de educación ambiental, implementación
										de proyectos encaminados a la
										conservación y protección del recurso,
										entre otras.
									</p>
									<p className='unidad-paragraph'>
										Entre estas instituciones se encuentran
										las municipalidades, el Ministerio de
										Medio Ambiente y Recursos Naturales
										(MARN), el Ministerio de Agricultura y
										Ganadería (MAG), la Administración
										Nacional de Acueductos y
										Alcantarillados (ANDA), las juntas
										administradoras de agua, entre otras,
										así como de la sociedad civil,
										representada por las Asociaciones de
										Desarrollo Comunal (ADESCO), los
										organismos de cuencas, entre otros.
									</p>
									<p className='unidad-paragraph'>
										En la Ley General de Recursos Hídricos
										se establece (artículo 11) que la
										Autoridad Salvadoreña del Agua (ASA)
										será el ente rector de la gestión
										integral de los recursos hídricos y
										demás bienes que forman parte del
										dominio público, a través del uso
										racional, aprovechamiento eficiente,
										manejo, protección, recuperación,
										conservación, mejoramiento y
										restauración del recurso hídrico para
										garantizar su sustentabilidad.
									</p>
									<p className='unidad-paragraph unidad-paragraph-bottom'>
										Algunas de las atribuciones de la
										Autoridad Salvadoreña del Agua son:
									</p>

									<div className='unidad-problem-grid'>
										<div className='unidad-problem-card'>
											<p className='unidad-problem-text'>
												Elaborar las directrices sobre
												el uso eficiente y sustentable
												del agua, que garantice su
												preservación, conservación y
												protección.
											</p>
										</div>
										<div className='unidad-problem-card'>
											<p className='unidad-problem-text'>
												Emitir los programas y
												actividades de promoción
												relacionados con el uso y
												aprovechamiento sustentable de
												los recursos hídricos.
											</p>
										</div>
										<div className='unidad-problem-card'>
											<p className='unidad-problem-text'>
												Emitir las directrices y
												lineamientos técnicos y jurídicos
												que tengan por finalidad
												incentivar el uso, reciclaje y
												reúso de aguas residuales y
												manejo de lodos.
											</p>
										</div>
										<div className='unidad-problem-card'>
											<p className='unidad-problem-text'>
												Elaborar la Política Nacional de
												Gestión Integrada del Recurso
												Hídrico y velar por su
												cumplimiento.
											</p>
										</div>
										<div className='unidad-problem-card'>
											<p className='unidad-problem-text'>
												Promover estrategias y programas
												de educación y cultura
												relacionados con el
												aprovechamiento sostenible de
												los recursos hídricos.
											</p>
										</div>
										<div className='unidad-problem-card'>
											<p className='unidad-problem-text'>
												Emitir las asignaciones públicas
												a entes centralizados y
												descentralizados para aprovechar
												los recursos hídricos.
											</p>
										</div>
										<div className='unidad-problem-card'>
											<p className='unidad-problem-text'>
												Elaborar y aprobar el Plan
												Nacional de Gestión Integrada de
												los Recursos Hídricos.
											</p>
										</div>
										<div className='unidad-problem-card'>
											<p className='unidad-problem-text'>
												Emitir las autorizaciones sobre
												el uso y aprovechamiento de los
												recursos hídricos y los permisos
												para la exploración.
											</p>
										</div>
									</div>
								</section>

								<section>
									<h3 className='unidad-section-title'>
										Sostenibilidad de los recursos
										hídricos a nivel regional
									</h3>
									<p className='unidad-paragraph'>
										Según la Comisión Económica para
										América Latina y el Caribe (CEPAL), a
										pesar de que en la región los
										conflictos relacionados con el agua se
										han incrementado considerablemente en
										los últimos años, los países de
										América Latina y el Caribe han
										experimentado en las últimas décadas
										un fuerte cambio en su relación con
										los recursos hídricos.
									</p>
									<p className='unidad-paragraph'>
										Entre 2000 y 2017, la proporción de la
										población mundial que utilizaba agua
										potable gestionada de manera segura
										(el nivel de servicio más alto)
										aumentó del 61 % al 71 %. América
										Latina y el Caribe son las regiones en
										que se registró el mayor progreso.
										Entre algunas iniciativas y proyectos
										que en la región se están llevando a
										cabo se pueden mencionar:
									</p>

									<ul className='unidad-consolidation-list'>
										<li>
											Acuerdo sobre el Acuífero Guaraní,
											de 2010, suscrito por Argentina,
											Brasil, Paraguay y Uruguay,
											ratificado por todos los Estados
											ribereños en 2018. Es uno de los
											acuíferos más grandes del mundo en
											extensión y volumen de agua, que
											tiene la particularidad de ser
											transfronterizo.
										</li>
										<li>
											El Proyecto Ganadería Colombiana
											Sostenible ha mejorado la calidad
											del agua que fluye cerca de los
											predios, con un 72.7 % menos de
											demanda bioquímica de oxígeno,
											además de elevar la productividad e
											incrementar la prestación de
											servicios ambientales.
										</li>
										<li>
											Brasil, Chile, Argentina y Colombia
											cuentan con una legislación y un
											sistema nacional de administración
											de los recursos hídricos. Entre los
											países con procesos de discusión o
											actualización en la legislación de
											aguas están Bolivia, Perú, Ecuador,
											Paraguay y Venezuela.
										</li>
										<li>
											En Centroamérica, Honduras,
											Nicaragua y Costa Rica cuentan con
											leyes para la administración de
											aguas y el saneamiento. En Panamá,
											la Autoridad Nacional del Ambiente
											reglamenta la participación de las
											Juntas de Agua Rurales. Mientras
											que en El Salvador y Guatemala la
											población se organiza para
											administrar sistemas de agua y
											saneamiento.
										</li>
									</ul>

									
								</section>								

							</div>
						</div>

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
											src="https://res.cloudinary.com/dutglmj02/video/upload/v1775580615/unidad1Semana3_x6m5ob.mp4"                                          
											// src="/unidad1Semana3.mp4"     
											                                     
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

						</div>
					</div>
				</div>
			</div>
		</div>
	)
}

export default Semana3Screen

