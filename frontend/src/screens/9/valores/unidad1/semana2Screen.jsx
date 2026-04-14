import React, { useState, useRef, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom';
import Sidebar from '../../../../components/Sidebar'
import Header from '../../../../components/Header'
import '../../../../App.css'

function Semana2Screen () {
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
                const response = await fetch('/unidad1Semana2.vtt');
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
							<div className='valores-semana1-article-card'>
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
										Unidad 1 · Semana 2
									</h1>
									<h2 className='unidad-subtitle valores-semana1-subtitle'>
										La tenencia de la tierra y los
										conflictos regionales
									</h2>
								</div>

								<section>
									<h3 className='unidad-section-title'>
										La tenencia de la tierra y sus
										características
									</h3>
									<p className='unidad-paragraph'>
										El concepto de tenencia de la tierra
										se refiere al conjunto de derechos y
										relaciones legales que una persona,
										comunidad o entidad tiene sobre la
										tierra. Estos derechos determinan
										quién tiene el control, el uso y los
										beneficios relacionados con una
										parcela o terreno específico.
									</p>
									<p className='unidad-paragraph'>
										Existen diversas formas de tenencia de
										la tierra, y los sistemas varían según
										las leyes y las prácticas culturales
										en diferentes regiones y países. La
										tenencia de la tierra es crucial para
										la sostenibilidad, la justicia social
										y la estabilidad de las comunidades,
										especialmente en zonas rurales donde
										la subsistencia depende de la
										agricultura.
									</p>
									<p className='unidad-paragraph unidad-paragraph-bottom'>
										Los derechos de tenencia determinan el
										acceso a recursos, oportunidades
										económicas y seguridad alimentaria. A
										nivel mundial, muchos conflictos
										surgen por derechos de tenencia no
										definidos o disputas sobre la
										distribución equitativa de la tierra.
									</p>

									<div className='unidad-problem-grid'>
										<div className='unidad-problem-card'>
											<h4 className='unidad-problem-title'>
												Propiedad privada
											</h4>
											<p className='unidad-problem-text'>
												Un individuo o entidad posee la
												tierra de manera exclusiva y
												tiene derechos legales para
												usar, vender o arrendar la
												propiedad.
											</p>
										</div>
										<div className='unidad-problem-card'>
											<h4 className='unidad-problem-title'>
												Propiedad comunal
											</h4>
											<p className='unidad-problem-text'>
												La tierra pertenece a una
												comunidad. Los derechos de uso y
												gestión son compartidos y las
												decisiones se toman de manera
												colectiva.
											</p>
										</div>
										<div className='unidad-problem-card'>
											<h4 className='unidad-problem-title'>
												Propiedad estatal
											</h4>
											<p className='unidad-problem-text'>
												El Gobierno posee y controla
												grandes extensiones de tierra y
												puede asignar derechos de uso a
												individuos, entidades privadas o
												comunidades.
											</p>
										</div>
										<div className='unidad-problem-card'>
											<h4 className='unidad-problem-title'>
												Propiedad mixta
											</h4>
											<p className='unidad-problem-text'>
												Dos o más entidades comparten la
												posesión y administración de la
												tierra, ya sean individuos,
												comunidades, gobiernos o
												empresas privadas.
											</p>
										</div>
										<div className='unidad-problem-card'>
											<h4 className='unidad-problem-title'>
												Tierras de arrendamiento y
												concesiones
											</h4>
											<p className='unidad-problem-text'>
												En lugar de poseer la tierra,
												algunas personas o entidades
												tienen derechos de alquiler o
												concesiones otorgadas por el
												Gobierno por un período
												específico.
											</p>
										</div>
									</div>

									<div className='unidad-info-box'>
										<p className='unidad-info-title'>
											Conexión geográfica
										</p>
										<p className='unidad-info-text'>
											En muchas sociedades indígenas, los
											derechos sobre la tierra se basan
											en tradiciones y prácticas
											culturales. Aunque estos sistemas
											no siempre están formalizados
											legalmente, son esenciales para la
											identidad y el sustento de las
											comunidades.
										</p>
									</div>
								</section>

								<section>
									<h3 className='unidad-section-title'>
										Los orígenes de los conflictos por la
										tenencia de la tierra
									</h3>
									<p className='unidad-paragraph'>
										La tenencia de la tierra fue
										radicalmente transformada por la
										colonización europea en África, Asia y
										América Latina. Los pueblos nativos,
										propietarios tradicionales de la
										tierra, fueron despojados y
										desplazados a zonas marginales,
										mientras las potencias europeas
										otorgaban grandes extensiones a sus
										empresas coloniales.
									</p>
									<p className='unidad-paragraph'>
										Estos procesos se intensificaron con
										la Revolución Industrial. La
										explotación de la mano de obra, la
										imposición de sistemas comerciales
										desfavorables y la apropiación de
										territorios ricos en recursos
										consolidaron el poder económico de los
										países colonizadores, limitando el
										desarrollo industrial de los países
										dependientes.
									</p>
									<p className='unidad-paragraph unidad-paragraph-bottom'>
										Hoy, los conflictos por la tenencia de
										la tierra reflejan la persistente
										herencia colonial: concentración de
										tierras, desigualdades económicas y
										sociales, y control de territorios por
										industrias extractivistas. La lucha
										por la justicia agraria y la
										redistribución equitativa de la tierra
										sigue siendo un gran desafío.
									</p>

									<div className='unidad-doc-box'>
										<p className='unidad-doc-kicker'>
											Doc. 1 — Desigualdad de la tierra:
											la impactante realidad
										</p>
										<p className='unidad-doc-text'>
											Históricamente, la desigualdad de
											la tierra está relacionada con los
											legados del colonialismo, la
											conquista y la división, y en
											muchas partes del mundo la
											acumulación de tierras transfiere
											poder político.
										</p>
										<p className='unidad-doc-text'>
											Desde la década de 1980, la
											desigualdad en materia de tierras
											ha aumentado, mientras que el uso
											insostenible de la tierra impone
											una enorme carga a los menos
											capaces de soportarla: pequeños
											agricultores, pueblos indígenas,
											mujeres rurales, jóvenes y
											comunidades sin tierra.
										</p>
										<p className='unidad-doc-text'>
											Cada vez más terrenos se
											concentran en menos manos, al
											servicio de intereses
											agroindustriales e inversores
											lejanos, con modelos productivos
											que emplean a menos personas y
											generan problemas ambientales.
										</p>
										<p className='unidad-doc-footer'>
											Fuente: Oxfam (2020). El terreno
											irregular.
										</p>
									</div>
								</section>

								<section>
									<h3 className='unidad-section-title'>
										Causas de los conflictos por la
										tenencia de la tierra
									</h3>
									<p className='unidad-paragraph unidad-paragraph-bottom'>
										Los conflictos por la tenencia de la
										tierra tienen raíces históricas
										profundas y están influenciados por
										dinámicas económicas desiguales, el
										crecimiento poblacional y los cambios
										ambientales.
									</p>

									<div className='unidad-regions-grid'>
										<div className='unidad-region-card orange'>
											<h4 className='unidad-region-title orange'>
												Causas históricas
											</h4>
											<ul className='unidad-consolidation-list'>
												<li>
													Despojo y concentración de
													tierras durante la
													colonización, que favoreció
													a los colonizadores y creó
													grandes desigualdades.
												</li>
												<li>
													Relaciones comerciales
													asimétricas y modelos
													agrarios impuestos que
													marginalizaron a las
													comunidades locales.
												</li>
												<li>
													Procesos de privatización de
													tierras comunales en los
													siglos XIX y XX, que
													expulsaron a comunidades y
													concentraron la tierra en
													pocas manos.
												</li>
											</ul>
										</div>

										<div className='unidad-region-card blue'>
											<h4 className='unidad-region-title blue'>
												Causas actuales
											</h4>
											<ul className='unidad-consolidation-list'>
												<li>
													Cambios ambientales como la
													desertificación y la pérdida
													de tierras agrícolas, que
													aumentan la competencia por
													territorios fértiles.
												</li>
												<li>
													Crecimiento poblacional y
													mayor demanda de tierras para
													agricultura, urbanización e
													industria.
												</li>
												<li>
													Explotación de recursos
													naturales por compañías
													extranjeras que buscan
													controlar tierras ricas en
													recursos, generando
													conflictos con las
													poblaciones locales.
												</li>
											</ul>
										</div>
									</div>
								</section>

								<section>
									<h3 className='unidad-section-title'>
										Conflictos por tenencia de la tierra
										en América Latina
									</h3>
									<p className='unidad-paragraph'>
										Durante la Guerra Fría, la tenencia de
										la tierra en América Latina fue clave
										por la concentración de tierras en
										manos de terratenientes y la pobreza
										de campesinos, lo que originó
										protestas y conflictos armados.
									</p>
									<p className='unidad-paragraph'>
										Para contener el comunismo, Estados
										Unidos impulsó reformas agrarias que
										buscaban mejorar las condiciones de
										vida de los campesinos y frenar la
										influencia soviética. Sin embargo,
										actualmente la región sigue
										enfrentando problemas relacionados con
										el uso y la tenencia de la tierra.
									</p>

									<div className='unidad-regions-grid'>
										<div className='unidad-region-card green'>
											<h4 className='unidad-region-title green'>
												Brasil
											</h4>
											<p className='unidad-region-text'>
												En 1964 se estableció una Ley de
												Reforma Agraria con aplicación
												limitada. En los años ochenta
												surgió el Movimiento de los
												Trabajadores Rurales Sin Tierra,
												que buscó redistribuir tierras y
												mejorar las condiciones
												laborales. A pesar de avances,
												persisten conflictos entre
												terratenientes, agricultores e
												pueblos indígenas.
											</p>
										</div>
										<div className='unidad-region-card blue'>
											<h4 className='unidad-region-title blue'>
												México
											</h4>
											<p className='unidad-region-text'>
												En Chiapas, campesinos han
												perdido tierras ante
												propietarios extranjeros y
												empresas madereras. El Ejército
												Zapatista de Liberación
												Nacional inició una rebelión en
												1994, logrando el reconocimiento
												de derechos indígenas sobre la
												tierra, aunque la violencia y
												las tensiones persisten.
											</p>
										</div>
									</div>
								</section>

								<section>
									<h3 className='unidad-section-title'>
										El legado colonial de África y los
										efectos de la Guerra Fría
									</h3>
									<p className='unidad-paragraph'>
										Tras la Segunda Guerra Mundial, los
										Gobiernos europeos pusieron fin a su
										dominio en África, pero dejaron
										fronteras artificiales que dividieron
										grupos étnicos y generaron conflictos
										por la tierra.
									</p>
									<p className='unidad-paragraph'>
										Durante la Guerra Fría, Estados Unidos
										y la Unión Soviética apoyaron
										diferentes movimientos
										independentistas, intensificando
										conflictos internos y dificultando la
										construcción de Estados estables. La
										disolución de la URSS dejó a muchos
										países africanos en situación de
										vulnerabilidad e inestabilidad
										política.
									</p>

									<div className='unidad-info-box'>
										<p className='unidad-info-title'>
											Conexión geográfica
										</p>
										<p className='unidad-info-text'>
											El continente africano enfrenta
											grandes desafíos en relación con el
											uso y la tenencia de la tierra: dos
											de cada tres habitantes viven en
											zonas rurales y dependen de la
											agricultura para sobrevivir, lo que
											se traduce en altos niveles de
											hambre, desnutrición y pobreza.
										</p>
									</div>

									<div className='unidad-regions-grid'>
										<div className='unidad-region-card green'>
											<h4 className='unidad-region-title green'>
												Costa de Marfil
											</h4>
											<p className='unidad-region-text'>
												La promoción de la inmigración
												para trabajar en plantaciones de
												cacao y café y cambios legales
												sobre la tierra generaron
												tensiones étnicas y una guerra
												civil de siete años. La cuestión
												agraria sigue siendo un reto.
											</p>
										</div>
										<div className='unidad-region-card orange'>
											<h4 className='unidad-region-title orange'>
												Sudán
											</h4>
											<p className='unidad-region-text'>
												Desde 1983, las disputas
												territoriales están en el centro
												de los conflictos armados, como
												en Darfur, donde la población
												africana se ha enfrentado a
												desplazamientos y violencia por
												el acceso a la tierra.
											</p>
										</div>
										<div className='unidad-region-card blue'>
											<h4 className='unidad-region-title blue'>
												Zimbabue y Angola
											</h4>
											<p className='unidad-region-text'>
												En Zimbabue, la redistribución
												forzada de tierras a partir del
												año 2000 generó crisis
												económica y apropiación de
												tierras por parte de
												funcionarios. En Angola, las
												reformas agrarias y la
												corrupción han dificultado la
												resolución de los conflictos por
												la tierra.
											</p>
										</div>
									</div>
								</section>

								<section>
									<h3 className='unidad-section-title'>
										Antecedentes históricos y políticos
										de Asia
									</h3>
									<p className='unidad-paragraph'>
										Asia es el continente más extenso y
										poblado del planeta. De acuerdo con
										criterios culturales, políticos e
										históricos, se distinguen varias
										regiones, como Asia Oriental, Asia
										Central, el Sudeste Asiático y Medio
										Oriente, cada una con trayectorias
										históricas particulares.
									</p>
									<p className='unidad-paragraph'>
										La Guerra Fría dividió el continente
										en bloques prooccidentales y
										procomunistas, generando disputas por
										el control territorial y la expansión
										de las potencias. Hoy en día, muchas
										comunidades rurales se enfrentan al
										acaparamiento de sus tierras por
										grandes empresas y multinacionales.
									</p>

									<div className='unidad-regions-grid'>
										<div className='unidad-region-card green'>
											<h4 className='unidad-region-title green'>
												Asia Oriental
											</h4>
											<p className='unidad-region-text'>
												Aunque no estuvo
												mayoritariamente bajo dominio
												europeo, fue escenario de la
												división de Corea en dos zonas
												de influencia (Norte y Sur) tras
												la Guerra Fría.
											</p>
										</div>
										<div className='unidad-region-card orange'>
											<h4 className='unidad-region-title orange'>
												Asia Central
											</h4>
											<p className='unidad-region-text'>
												Estuvo dominada por potencias
												extranjeras como Gran Bretaña y
												la URSS, que influyeron en
												países como India, Pakistán,
												Afganistán, Kazajistán y otros.
											</p>
										</div>
										<div className='unidad-region-card blue'>
											<h4 className='unidad-region-title blue'>
												Sudeste Asiático y Medio Oriente
											</h4>
											<p className='unidad-region-text'>
												Fueron sometidos al colonialismo
												europeo y luego se
												convirtieron en escenarios de
												conflictos como la Guerra de
												Vietnam y disputas por los
												territorios tras la desintegración
												del Imperio Otomano.
											</p>
										</div>
									</div>
								</section>
								</div>
							</div>

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
										src="https://res.cloudinary.com/dutglmj02/video/upload/v1775580618/unidad1Semana2_bxnaec.mp4"
										controls={false}
										onLoadedData={() => setVideoLoading(false)}
										onLoadStart={() => setVideoLoading(true)}
										onError={() => setVideoLoading(false)}
										onPlay={() => setIsClassVideoPlaying(true)}
										onPause={() => setIsClassVideoPlaying(false)}
										onTimeUpdate={(e) => handleTimeUpdate(e.target.currentTime)}
									/>
								</div>
							</div>
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
					</div>
				</div>
			</div>
		</div>
	)
}

export default Semana2Screen

