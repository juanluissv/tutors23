import React, { useState, useRef, useEffect } from 'react'
import Sidebar from '../../../../components/Sidebar'
import Header from '../../../../components/Header'
import '../../../../App.css'

function Semana2Unidad4Screen () {
	const [isSidebarOpen, setIsSidebarOpen] = useState(
		window.innerWidth > 768,
	)
	const [activeText, setActiveText] = useState('')
	const [allCues, setAllCues] = useState([])
	const [videoLoading, setVideoLoading] = useState(true)
	const [isClassVideoPlaying, setIsClassVideoPlaying] = useState(false)
	const [questionText, setQuestionText] = useState('')

	const contentRef = useRef(null)
	const classVideoRef = useRef(null)
	const questionTextareaRef = useRef(null)

    const toggleSidebar = () => {
        setIsSidebarOpen(!isSidebarOpen);
    };

    useEffect(() => {
        const loadVTT = async () => {
            try {
                const response = await fetch('/unidad4Semana2.vtt');
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

    const handleQuestionChange = (e) => {
        setQuestionText(e.target.value)
    }

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
        setQuestionText('')
    }

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
						


							
							<div className='unidad-wrapper'>
								<div className='unidad-header'>
									<h1 className='unidad-title'>
										Unidad 4 · Semana 2
									</h1>
									<h2 className='unidad-subtitle'>
										Movimientos juveniles en el siglo XX
									</h2>
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
											src=""     											                                     
											controls={false}
											onLoadedData={() => setVideoLoading(false)}
											onLoadStart={() => setVideoLoading(true)}
											onError={() => setVideoLoading(false)}
											onPlay={() => setIsClassVideoPlaying(true)}
											onPause={() => setIsClassVideoPlaying(false)}
											onTimeUpdate={(e) => handleTimeUpdate(e.target.currentTime)}
										/>
										<div className="fixed-video-question-wrap">
											<textarea
												ref={questionTextareaRef}
												className="fixed-video-question-input"
												rows={2}
												placeholder="hazme una pregunta"
												value={questionText}
												onChange={handleQuestionChange}
											/>
											<button
												type="button"
												className="fixed-video-question-send"
												onClick={handleSendQuestion}
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

								<section>
									<h3 className='unidad-section-title'>
										Movimiento Solidaridad (Polonia)
									</h3>
								</section>

								<div className='unidad-doc-box'>
									<p className='unidad-doc-kicker'>Doc. 1</p>
									<p className='unidad-doc-text'>
										En el verano de 1980, una ola de huelgas recorrió
										toda Polonia. La mirada de toda Polonia estaba puesta
										en Gdańsk, lugar central de la confrontación con las
										autoridades comunistas. El 17 de agosto, el Comité
										Intercentros de Huelga formuló una lista de veintiún
										reivindicaciones, que se referían al reconocimiento de
										los sindicatos independientes y al respeto de los
										derechos y libertades, incluida la libertad de
										expresión. La fuerza de la huelga obligó a las
										autoridades a entablar un diálogo con los trabajadores.
										El 31 de agosto de 1980, se firmaba en el Astillero de
										Gdańsk el acuerdo que marcó un hito en la historia
										contemporánea de Polonia y anunciaba la futura caída
										del sistema comunista en Europa. En la mesa de
										negociación se sentaron el viceprimer ministro de la
										República Popular de Polonia, Mieczysław Jagielski, y
										el líder de la huelga, Lech Wałęsa. En el primer punto
										del acuerdo se afirmaba que la actividad de los
										sindicatos oficiales de la República Popular de Polonia
										no respondía a las expectativas de los trabajadores,
										por lo que era pertinente crear nuevos sindicatos
										independientes. Los nuevos sindicatos se comprometían a
										respetar la Constitución de la República Popular de
										Polonia. La huelga y la posterior firma de los Acuerdos
										de Agosto despertaron grandes emociones en todo el
										mundo.
									</p>
									<p className='unidad-doc-footer'>
										El movimiento Solidaridad
									</p>
									<p className='unidad-doc-footer'>
										Fuente: Ministerio de Relaciones Exteriores de Polonia
										(2020). 40 aniversario del nacimiento de Solidaridad.
									</p>
								</div>

								<p className='unidad-paragraph'>
									El siglo XX se caracterizó por la formación de
									movimientos sociales. Este fenómeno, que tuvo su punto
									clave en 1968, estuvo impulsado por una serie de factores
									que generaron malestar social y una creciente demanda de
									cambio, entre los que se encuentran:
								</p>
								<ul className='unidad-consolidation-list'>
									<li>
										Injusticias sin resolver. Las sociedades se
										enfrentaban a una serie de injusticias sistémicas que
										no se abordaban adecuadamente. El colonialismo, la
										desigualdad económica y la falta de derechos básicos
										para diversos grupos sociales eran algunos de los
										problemas. También la discriminación racial y la
										segregación en Estados Unidos, junto con la
										invisibilización de los derechos de los pueblos
										originarios, avivaron las luchas por la igualdad y la
										justicia social.
									</li>
									<li>
										Asesinatos de figuras representativas. El asesinato de
										líderes progresistas como John F. Kennedy y Martin
										Luther King Jr. conmocionaron a diferentes sectores de
										la población e intensificaron la sensación de
										injusticia y la necesidad de cambio.
									</li>
									<li>
										Abusos de poder. Las violaciones a los derechos humanos
										cometidas durante las intervenciones militares
										estadounidenses y soviéticas en territorios extranjeros
										causaron un descontento generalizado entre la población
										y despertaron un fuerte movimiento pacifista que
										cuestionaba el uso de la fuerza y la imposición de
										intereses geopolíticos.
									</li>
									<li>
										Interconexión global. El desarrollo de las comunicaciones
										y el transporte tejió una red de relaciones a nivel
										mundial. Esto permitió que las ideas y experiencias de
										diferentes pueblos se compartieran con mayor facilidad,
										inspirando la formación de movimientos con objetivos
										comunes.
									</li>
								</ul>

								<p className='unidad-paragraph unidad-paragraph-bottom'>
									Ante este panorama, en la década de 1960 una nueva
									generación comenzó a levantar su voz, desafiando las
									normas sociales, políticas y culturales establecidas.
									Algunos de los principales movimientos sociales más
									destacados de la época son:
								</p>

								<div className='unidad-info-box'>
									<p className='unidad-info-title'>
										Profundización
									</p>
									<p className='unidad-info-text'>
										<strong>El Mayo francés.</strong> En Francia, el
										movimiento estudiantil cuestionó la rigidez de los
										sistemas educativos, la falta de oportunidades y la
										participación limitada en las decisiones políticas.
									</p>
									<p className='unidad-info-text'>
										<strong>Los acontecimientos de Tlatelolco.</strong> En
										México, el movimiento estudiantil surgió en un contexto
										de creciente descontento entre los estudiantes, quienes
										se unieron para demandar una mayor apertura democrática
										y mejores condiciones educativas.
									</p>
									<p className='unidad-info-text'>
										<strong>La Primavera de Praga.</strong> En
										Checoslovaquia se desarrolló el movimiento social a raíz
										de la intervención del ejército de la URSS, que provocó
										una resistencia generalizada entre la población y
										alimentó el deseo de mayor autonomía y libertad.
									</p>
								</div>

								<p className='unidad-paragraph'>
									Acontecimientos que marcaron el mundo en 1968
								</p>
								<p className='unidad-paragraph'>
									En la web En la web En la web
								</p>

								<section>
									<h3 className='unidad-section-title'>
										El Mayo francés
									</h3>
									<p className='unidad-paragraph'>
										En los años previos a 1968, la población estudiantil en
										Francia creció notablemente, reflejando una era de
										cultura juvenil internacional marcada por una tendencia
										a rechazar tanto el comunismo como el capitalismo, ya
										que muchos estudiantes se encontraban en oposición a los
										conflictos bélicos surgidos en los países de influencia
										de la URSS y Estados Unidos, como la guerra de Vietnam,
										y buscaban una sociedad más libre y justa. Esto generó
										una masa crítica de jóvenes con ideas y preocupaciones en
										común, creando un ambiente propicio para las protestas
										ante una sociedad francesa que no respondía a las nuevas
										exigencias.
									</p>
								</section>

								<div className='unidad-problem-grid'>
									<div className='unidad-problem-card'>
										<h4 className='unidad-problem-title'>
											Durante el mes de marzo
										</h4>
										<p className='unidad-problem-text'>
											estudiantes de la facultad de Humanidades de
											Nanterre, en las afueras de París, protestaron debido
											a ciertas medidas con las que no estaban de acuerdo. A
											inicios de mayo, los estudiantes universitarios se
											vieron envueltos en otras controversias, lo que llevó al
											cierre temporal de la institución.
										</p>
									</div>
									<div className='unidad-problem-card'>
										<h4 className='unidad-problem-title'>
											Más de nueve millones de obreros
										</h4>
										<p className='unidad-problem-text'>
											se unieron a la huelga, paralizando casi todas las
											actividades. El presidente De Gaulle convocó a
											elecciones legislativas. Los sectores altos y medios,
											que temían el avance de las izquierdas, votaron por
											mantener la misma estructura social y política.
											Gradualmente, el orden volvió a las calles.
										</p>
									</div>
									<div className='unidad-problem-card'>
										<h4 className='unidad-problem-title'>
											Como respuesta, el 10 de mayo
										</h4>
										<p className='unidad-problem-text'>
											se organizó «la noche de las barricadas», en la que
											estudiantes se reunieron en el Barrio Latino,
											levantando barreras cerca de la Sorbona. Las
											negociaciones fracasaron, causando violentos
											enfrentamientos, lo que resultó en cientos de heridos
											y en la convocatoria a una huelga general en los días
											próximos.
										</p>
									</div>
									<div className='unidad-problem-card'>
										<h4 className='unidad-problem-title'>
											Algunos estudiantes involucrados en los incidentes
										</h4>
										<p className='unidad-problem-text'>
											viajaron a París para declarar, mientras que los
											alumnos de la Universidad de la Sorbona se reunieron en
											las cercanías en muestra de apoyo. La situación
											desembocó en la intervención policial que pretendía
											mantener el orden público, lo que resultó en la
											detención de cientos de estudiantes.
										</p>
									</div>
								</div>

								<p className='unidad-paragraph'>
									Acontecimientos ocurridos en el contexto del Mayo francés
								</p>

								<section>
									<h3 className='unidad-section-title'>
										Checoslovaquia y el contexto previo a la Primavera de
										Praga
									</h3>
									<p className='unidad-paragraph'>
										En 1950, Checoslovaquia permanecía bajo el mando del
										líder comunista checo Antonín Novotný. No obstante, a
										finales de la década de 1960, Novotný tenía la antipatía
										de muchos, ya que su gobierno había fracasado en la
										tarea de mejorar la economía del país y enfrentaba
										graves problemas: la producción industrial había comenzado
										a decaer, como resultado de los altos costos de
										inversión que requería y el ausentismo generalizado de
										los trabajadores, y además la agricultura colectivizada
										generó menos alimentos que en los años previos a la
										Segunda Guerra Mundial.
									</p>
									<p className='unidad-paragraph unidad-paragraph-bottom'>
										Sin embargo, la causa inmediata de la caída de Novotný
										fue el malestar en la esfera pública y cultural de
										Checoslovaquia, especialmente entre estudiantes y
										escritores. La generación joven, educada dentro del
										régimen, se encontraba cansada de las restricciones a la
										libertad personal y estaba frustrada por el bajo nivel
										de vida de su país, por lo que expresaron su
										descontento en el festival estudiantil Majáles, seguido
										por continuas protestas en 1967.
									</p>
									<p className='unidad-paragraph unidad-paragraph-bottom'>
										Mientras tanto, en el mismo año, durante un congreso de
										escritores checoslovacos, muchos rechazaron las normas
										exigidas por el Partido Comunista. Novotný respondió con
										sanciones contra numerosos escritores notables, entre
										ellos Ludvík Vaculík y Jan Procházka. Como resultado,
										Novotný enfrentó aún más oposición y en enero de 1968
										renunció a su cargo de Primer Secretario del Partido
										Comunista de Checoslovaquia, recomendando como sucesor a
										su oponente eslovaco Alexander Dubček.
									</p>
								</section>

								<div className='unidad-problem-grid'>
									<div className='unidad-problem-card'>
										<h4 className='unidad-problem-title'>
											Conexión histórica
										</h4>
										<p className='unidad-problem-text'>
											Checoslovaquia surgió tras la caída del Imperio
											austro-húngaro en 1918, impulsada por la
											autodeterminación de checos y eslovacos. A pesar de su
											éxito inicial, Checoslovaquia enfrentó tensiones entre
											los diferentes grupos étnicos: los checos eran la
											mayoría, pero los eslovacos y otras minorías tenían sus
											propias aspiraciones nacionales.
										</p>
									</div>
								</div>

								<section>
									<h3 className='unidad-section-title'>
										El Programa de Acción de Dubček
									</h3>
									<p className='unidad-paragraph unidad-paragraph-bottom'>
										El mayor logro del nuevo gobierno reformista de Dubček
										fue el Programa de Acción, adoptado por el Comité
										Central del partido en abril de 1968. En este se
										incorporaban ideas desarrolladas durante los años
										anteriores que no sólo incluían reformas económicas, sino
										que también buscaban la democratización de la vida
										política. Entre sus puntos más importantes estaban:
									</p>
								</section>

								<div className='unidad-problem-grid'>
									<div className='unidad-problem-card'>
										<h4 className='unidad-problem-title'>
											Igualdad en la federación checoslovaca
										</h4>
										<p className='unidad-problem-text'>
											Conceder a Eslovaquia un estatus de plena igualdad
											en la nueva federación checoslovaca, respondiendo a
											reivindicaciones históricas de autonomía política y
											cultural.
										</p>
									</div>
									<div className='unidad-problem-card'>
										<h4 className='unidad-problem-title'>
											Reformas en industria y agricultura
										</h4>
										<p className='unidad-problem-text'>
											Implementar reformas en la industria y la agricultura,
											con el objetivo de aumentar la eficiencia y la
											productividad.
										</p>
									</div>
									<div className='unidad-problem-card'>
										<h4 className='unidad-problem-title'>
											Nueva constitución
										</h4>
										<p className='unidad-problem-text'>
											Crear una nueva constitución que garantizara los
											derechos y libertades civiles y políticas, incluida
											la libertad de expresión, religión, asociación,
											reunión y movilidad.
										</p>
									</div>
									<div className='unidad-problem-card'>
										<h4 className='unidad-problem-title'>
											Soberanía y relaciones exteriores
										</h4>
										<p className='unidad-problem-text'>
											Impulsar la soberanía nacional y fortalecer las
											relaciones políticas y económicas con otros países no
											comunistas.
										</p>
									</div>
									<div className='unidad-problem-card'>
										<h4 className='unidad-problem-title'>
											Pluralismo político
										</h4>
										<p className='unidad-problem-text'>
											Permitir la existencia de otras fuerzas políticas,
											ante lo cual el Partido Comunista tendría que demostrar
											su liderazgo compitiendo con estas organizaciones
											emergentes.
										</p>
									</div>
								</div>

								<section>
									<h3 className='unidad-section-title'>
										La Primavera de Praga
									</h3>
									<p className='unidad-paragraph'>
										La liberalización en Checoslovaquia provocó el colapso
										del movimiento juvenil comunista y el surgimiento de
										nuevas organizaciones políticas, religiosas y de derechos
										humanos. Este periodo de entusiasmo, conocido como la
										Primavera de Praga, llevó a demandas de reformas
										profundas y mayor libertad, incluyendo la salida del
										bloque soviético.
									</p>
								</section>

								<section>
									<h3 className='unidad-section-title'>
										El Ejército Rojo en Checoslovaquia
									</h3>
									<p className='unidad-paragraph'>
										Para frenar este fervor reformista, la Unión Soviética
										optó por una intervención militar. El 20 de agosto de
										1968, bajo el liderazgo de Leonid Ilich Brézhnev,
										secretario general del Partido Comunista de la URSS,
										medio millón de soldados y siete mil tanques invadieron
										Checoslovaquia con el objetivo de derrocar al gobierno y
										arrestar a sus principales dirigentes. En respuesta, la
										población implementó una campaña de resistencia pasiva
										(Doc. 2).
									</p>
									<p className='unidad-paragraph unidad-paragraph-bottom'>
										La ocupación soviética brindó la oportunidad perfecta
										para que los comunistas de línea dura, liderados por
										Gustáv Husák, retomaran el control. Husák, que fue
										nombrado primer secretario del Partido Comunista de
										Checoslovaquia en abril de 1969, rápidamente revirtió las
										reformas de Dubček, removió a los reformistas del partido
										y del Gobierno e impuso una política de «normalización»
										que aplastó cualquier disidencia. La Primavera de Praga
										fue sofocada, pero su legado de libertad y democracia
										inspiró a las generaciones posteriores.
									</p>
								</section>

								<div className='unidad-doc-box'>
									<p className='unidad-doc-kicker'>
										Doc. 2 El fin de la Primavera de Praga
									</p>
									<p className='unidad-doc-text'>
										Los checoslovacos discutían con los soldados, rusos la
										mayoría, confraternizaban con ellos y, en una imagen que
										se repetiría después en Portugal tras el golpe de Estado
										de 1974, colocaban claveles en la boca de sus fusiles.
										[…] Brézhnev, que había proclamado en su momento la
										«coexistencia pacífica» con el mundo capitalista,
										enunciaría tras el aplastamiento de la primavera de Praga
										la nueva doctrina con respecto a los países del campo
										socialista bajo su esfera de influencia: la «soberanía
										limitada». Los intereses supremos de la Unión Soviética y
										del socialismo debían prevalecer sobre la independencia
										efectiva de los países de Europa del Este. 										Quedaba así oficializado el sometimiento de los mismos
										a las decisiones de Moscú, que imponía su propia
										política imperialista donde así podía hacerlo.
									</p>
									<p className='unidad-doc-footer'>
										Fuente: Ribera, R. (2005). El año histórico de 1968.
										Diez acontecimientos que cambiaron el mundo.
									</p>
								</div>

								<p className='unidad-paragraph'>
									El final de la Primavera de Praga
								</p>
								<p className='unidad-paragraph'>
									En la web En la web En la web
								</p>

								<section>
									<h3 className='unidad-section-title'>
										Panorama político y social de México en 1968
									</h3>
									<p className='unidad-paragraph unidad-paragraph-bottom'>
										En la década de 1960, México vivía un clima político
										tenso y una creciente agitación social. El gobierno del
										Partido Revolucionario Institucional (PRI), encabezado
										por Gustavo Díaz Ordaz, se enfrentaba a un aumento en las
										demandas de democratización por parte de la sociedad
										civil y el movimiento estudiantil. Esta época estuvo
										marcada por un alto nivel de represión con el objetivo de
										mantener la estabilidad política y evitar influencias de
										la URSS. A continuación, se presentan algunos
										acontecimientos relevantes.
									</p>
								</section>

								<div className='unidad-problem-grid'>
									<div className='unidad-problem-card'>
										<h4 className='unidad-problem-title'>
											22 de julio de 1968
										</h4>
										<p className='unidad-problem-text'>
											Paralelamente, un conflicto entre grupos de
											estudiantes de diferentes instituciones nacionales
											desencadenó una respuesta represiva por parte de la
											policía. Tres días después, la UNAM se declaró en huelga
											indefinida en solidaridad con los estudiantes y los
											maestros afectados.
										</p>
									</div>
									<div className='unidad-problem-card'>
										<h4 className='unidad-problem-title'>
											29 de julio de 1968
										</h4>
										<p className='unidad-problem-text'>
											El descontento y la protesta se propagaron por toda la
											Ciudad de México. A pesar de los esfuerzos de las
											autoridades por calmar la situación, la tensión se
											agudizó con incidentes de autobuses incendiados y la
											paralización del transporte público.
										</p>
									</div>
									<div className='unidad-problem-card'>
										<h4 className='unidad-problem-title'>
											Verano de 1968 — UNAM
										</h4>
										<p className='unidad-problem-text'>
											Durante el verano de 1968, la Universidad Nacional
											Autónoma de México (UNAM) se convirtió en el escenario
											de asambleas donde los estudiantes buscaban reformas
											que mejoraran la institución. La falta de respuesta del
											Gobierno llevó a la politización del movimiento,
											abarcando críticas a la política nacional en general.
										</p>
									</div>
									<div className='unidad-problem-card'>
										<h4 className='unidad-problem-title'>
											1 de agosto de 1968
										</h4>
										<p className='unidad-problem-text'>
											El rector de la UNAM, Javier Barros Sierra, lideró una
											manifestación con unos 80 000 estudiantes
											universitarios y politécnicos, demandando la liberación
											de los detenidos y marcando el inicio del Consejo
											Nacional de Huelga (CNH), el órgano representativo del
											movimiento estudiantil.
										</p>
									</div>
									<div className='unidad-problem-card'>
										<h4 className='unidad-problem-title'>
											Represión y CNH
										</h4>
										<p className='unidad-problem-text'>
											A pesar de la creación del CNH y los esfuerzos por
											encontrar una solución pacífica, hubo un aumento en las
											detenciones arbitrarias, así como en los incidentes de
											violencia entre las fuerzas militares y estudiantes y
											ciudadanos de la sociedad civil.
										</p>
									</div>
								</div>

								<section>
									<h3 className='unidad-section-title'>
										Los acontecimientos de Tlatelolco
									</h3>
									<p className='unidad-paragraph'>
										El 2 de octubre de 1968, miles de personas se
										congregaron en la Plaza de las Tres Culturas en
										Tlatelolco para presionar al Gobierno antes de los Juegos
										Olímpicos. El movimiento estudiantil buscaba negociar,
										pero el Gobierno, preocupado por la imagen del país, tomó
										medidas drásticas.
									</p>
									<p className='unidad-paragraph'>
										Durante la manifestación, un helicóptero lanzó bengalas,
										dando la señal a francotiradores para abrir fuego. Esto
										provocó un caos, y las fuerzas del orden, alegando
										legítima defensa, dispararon contra la multitud. El
										resultado oficial fue de 28 fallecidos y 200 heridos,
										aunque fuentes independientes sugieren una cifra mayor de
										víctimas.
									</p>
									<p className='unidad-paragraph unidad-paragraph-bottom'>
										Con las investigaciones sucesivas se identificó la
										presencia de agentes encubiertos entre los manifestantes,
										quienes iniciaron tiroteos, apresaron a líderes
										estudiantiles y capturaron a cientos de personas, muchas
										de las cuales fueron maltratadas o desaparecieron
										posteriormente (Doc. 3). Las evidencias recabadas
										después de los acontecimientos demostraron que hubo un
										interés del Gobierno mexicano por controlar al movimiento
										opositor con apoyo de la CIA, quienes buscaban frenar la
										«amenaza comunista» en la región latinoamericana, aunque
										ningún país del bloque comunista tuvo conexión directa con
										los eventos desarrollados por el movimiento estudiantil
										mexicano.
									</p>
								</section>

								<div className='unidad-doc-box'>
									<p className='unidad-doc-kicker'>
										Doc. 3 Las manifestaciones estudiantiles y Tlatelolco
									</p>
									<p className='unidad-doc-text'>
										La masacre significó un fin temporal del ambiente agitado
										en Ciudad de México. La XIX Olimpiada se inauguró como
										estaba programada: el 12 de octubre. El resto de los
										Juegos transcurrió sin choques. El entusiasmo por los
										eventos deportivos, así como la llegada de miles de
										extranjeros, calmaron las pasiones, y en diciembre los
										estudiantes regresaron a clases. Sin embargo, los Juegos
										Olímpicos no pudieron cubrir la tragedia de Tlatelolco y
										los problemas constantes del país. Al contrario, después
										de 1968, todo parecía más visible que nunca.
									</p>
									<p className='unidad-doc-footer'>
										Fuente: Perutka, L. (2022). La masacre de Tlatelolco y
										los gobiernos de los Estados Unidos de América y de Reino
										Unido.
									</p>
								</div>

								<div className='unidad-problem-grid'>
									<div className='unidad-problem-card'>
										<h4 className='unidad-problem-title'>
											Conexión histórica
										</h4>
										<p className='unidad-problem-text'>
											La Estela de Tlatelolco conmemora a las víctimas de la
											masacre de 1968.
										</p>
									</div>
								</div>

								<div className='unidad-doc-box'>
									<p className='unidad-doc-kicker'>
										Doc. 4 Un análisis sobre 1968
									</p>
									<p className='unidad-doc-text'>
										París, Praga y México representaron algunos de los
										epicentros de las luchas y protestas de una juventud que
										proyectaba la transformación y justicia social, mejoras
										hacia las masas trabajadoras, destronar el modelo
										económico imperante, modernización y renovación del
										sistema educativo a nivel universitario, denunciar los
										excesos y limitaciones de los gobiernos […].
									</p>
									<p className='unidad-doc-text'>
										Estudiantes y obreros tendrían un papel protagónico en
										las acciones que buscaban cambios radicales dentro de los
										contextos dominantes; su protesta, pacífica o no,
										aspiraba convocar al conjunto social, subvertir lo
										establecido, prefiriendo la espontaneidad que la
										formalidad, desafiando por igual a quienes desde la
										ortodoxia negaban o detenían los cambios que, en su
										criterio, eran inaplazables e inminentes. Pero también
										serán movimientos derrotados por la represión de quienes
										detentaban el poder, lo que conduciría a un largo proceso
										de análisis y reflexión para provocar las trasformaciones
										y reivindicaciones que tanto pregonaron.
									</p>
									<p className='unidad-doc-footer'>
										Fuente: López, I. (2019) Las cenizas de una era.
									</p>
								</div>

							</div>
						</div>
					</div>
				</div>
			</div>
		</div>
	)
}

export default Semana2Unidad4Screen