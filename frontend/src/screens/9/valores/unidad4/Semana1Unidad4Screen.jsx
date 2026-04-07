import React, { useState, useRef, useEffect } from 'react'
import Sidebar from '../../../../components/Sidebar'
import Header from '../../../../components/Header'
import '../../../../App.css'

function Semana1Unidad4Screen () {
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
                const response = await fetch('/unidad4Semana1.vtt');
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
										Unidad 4 · Semana 1
									</h1>
									<h2 className='unidad-subtitle'>
										Lucha por los derechos humanos en el
										siglo XX
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
										Derechos humanos
									</h3>
								</section>

								<div className='unidad-doc-box'>
									<p className='unidad-doc-kicker'>Doc. 1</p>
									<p className='unidad-doc-text'>
										A menudo, los africanos eran
										esclavizados por miembros de otras
										tribus o secuestrados por los europeos
										directamente. Otros eran llevados a los
										mercados de esclavos de la costa y
										vendidos a los traficantes. Allí los
										encarcelaban hasta que los
										inspeccionaban para venderlos. Los que
										se consideraban más valiosos se
										separaban de los viejos, débiles o
										enfermos y se marcaban para que no se
										pudieran devolver o cambiar por una
										“mercancía más débil”; a los que no
										elegían para la venta los mataban,
										para reducir los costos de alimentos y
										hacer más espacio para que llegaran
										otros. Apretados en la bodega del
										barco hacia América, los hombres iban
										encadenados y separados de las mujeres,
										los niños separados del resto. Una vez
										que llegaban, se los descargaban en
										corrales, los limpiaban, los vestían y
										los vendían a los colonos.
									</p>
									<p className='unidad-doc-text'>
										La vida de un esclavo en la América
										colonial difería de una colonia a otra,
										pero tenía un aspecto en común: el
										esclavo no tenía derechos como ser
										humano y era considerado propiedad del
										amo al igual que una carreta, una muela
										de molino o un hacha. El amo blanco
										podía (y por lo general lo hacía)
										tratar al esclavo como una posesión más
										que se utilizaba y de la que se
										deshacía cuando ya no funcionaba como
										se esperaba.
									</p>
									<p className='unidad-doc-footer'>
										Los primeros esclavos africanos en las
										colonias inglesas
									</p>
									<p className='unidad-doc-footer'>
										Fuente: Mark, J. (2021). La vida de los
										esclavos africanos en la América
										colonial británica.
									</p>
								</div>

								<section>
									<h3 className='unidad-section-title'>
										La Guerra de Secesión y los Estados no
										esclavistas
									</h3>
									<p className='unidad-paragraph'>
										Desde su independencia en 1776, Estados
										Unidos creció territorial y
										económicamente, pero las tensiones sobre
										la esclavitud entre el norte y el sur se
										intensificaron en 1860 con la elección
										de Abraham Lincoln como presidente.
										Aunque Lincoln afirmó no intervenir en
										la esclavitud en estados donde era
										legal, algunos estados del sur lo
										vieron como una amenaza y formaron los
										Estados Confederados de América.
									</p>
									<p className='unidad-paragraph'>
										Esto causó la Guerra de Secesión,
										también conocida como Guerra Civil
										estadounidense, que estalló en 1861 y
										duró hasta 1865 enfrentando a los
										estados del norte y del sur. A pesar de
										los esfuerzos de los Estados
										Confederados por establecer su propio
										gobierno y obtener reconocimiento
										internacional, el norte emergió
										victorioso debido a su superioridad
										económica y militar, permitiendo la
										reunificación de la nación.
									</p>
									<p className='unidad-paragraph unidad-paragraph-bottom'>
										Al finalizar la guerra, por medio de la
										Proclamación de Emancipación (1863) y la
										Decimotercera Enmienda a la Constitución
										(1865), se declaró la abolición de la
										esclavitud en todo el país. Esto
										significó que los afroamericanos, que
										antes eran considerados propiedad, ahora
										eran ciudadanos con los mismos derechos
										que los blancos (Doc. 2).
									</p>
								</section>

								<section>
									<h3 className='unidad-section-title'>
										La Reconstrucción
									</h3>
									<p className='unidad-paragraph unidad-paragraph-bottom'>
										La abolición de la esclavitud inició la
										Reconstrucción (1863-1877), un período
										clave para reintegrar el sur, garantizar
										derechos civiles a los afroamericanos
										liberados y reconstruir la economía con
										nuevas enmiendas constitucionales.
									</p>
									<p className='unidad-paragraph unidad-paragraph-bottom'>
										Sin embargo, tras el asesinato de
										Abraham Lincoln en 1865, su sucesor,
										Andrew Johnson, un demócrata sureño,
										adoptó políticas indulgentes hacia los
										estados exconfederados, lo que permitió
										la rápida creación de gobiernos que
										aplicaron medidas de segregación racial
										en los estados del sur.
									</p>
								</section>

								<div className='unidad-info-box'>
									<p className='unidad-info-title'>
										Profundización
									</p>
									<p className='unidad-info-text'>
										<strong>Secesión.</strong> Acto de
										separarse de una organización política
										más grande para formar una entidad
										independiente.
									</p>
									<p className='unidad-info-text'>
										<strong>Indulgente.</strong> Actitud
										tolerante o permisiva hacia ciertas
										acciones, mostrando una falta de rigor
										en la aplicación de normas.
									</p>
								</div>

								<div className='unidad-doc-box'>
									<p className='unidad-doc-kicker'>
										Doc. 2 El fin de la esclavitud en
										Estados Unidos
									</p>
									<p className='unidad-doc-text'>
										Que el primer día de enero del año de
										Nuestro Señor de mil ochocientos sesenta
										y tres, todas las personas mantenidas
										como esclavas dentro de cualquier Estado
										o parte designada de un Estado, cuyo
										pueblo esté entonces en rebelión contra
										los Estados Unidos, serán entonces, en
										adelante y para siempre libres; y el
										Gobierno Ejecutivo de los Estados
										Unidos, incluyendo la autoridad militar
										y naval del mismo, reconocerá y
										mantendrá la libertad de dichas
										personas, y no hará ningún acto o actos
										para reprimir a dichas personas, o a
										cualquiera de ellas, en cualquier
										esfuerzo que puedan hacer para su
										libertad real.
									</p>
									<p className='unidad-doc-footer'>
										Fuente: Lincoln, A. (1863). La
										Proclamación de Emancipación.
									</p>
								</div>

								<p className='unidad-paragraph'>
									El Congreso, que estaba conformado
									principalmente por republicanos, reaccionó
									retomando las riendas de la Reconstrucción
									en 1866 y comenzaron a deshacer las
									políticas de Johnson y a crear otras para
									remodelar la estructura política del sur:
									los hombres que alguna vez habían sido
									esclavizados constituían una mayoría
									política y eran republicanos fervientes, lo
									que dio lugar a que los afroamericanos
									participaran en elecciones democráticas y
									accedieran a cargos públicos.
								</p>
								<p className='unidad-paragraph unidad-paragraph-bottom'>
									La oposición sureña se manifestó a través
									de la creación de grupos defensores de la
									supuesta supremacía blanca, como el Ku Klux
									Klan (KKK), quienes realizaban actos
									violentos contra legisladores, votantes y
									activistas afroamericanos. No obstante, a
									principios de la década de 1870, una
									depresión económica y escándalos políticos
									mancharon la reputación del partido
									republicano, dando a los demócratas la
									oportunidad de recuperar el dominio del
									congreso, lo que puso fin a la
									Reconstrucción.
								</p>

								<section>
									<h3 className='unidad-section-title'>
										Las leyes de Jim Crow
									</h3>
									<p className='unidad-paragraph unidad-paragraph-bottom'>
										Bajo el dominio demócrata, se derogaron
										las protecciones federales de los
										afroamericanos, lo que permitió la
										implementación de las leyes Jim Crow.
										Estas normativas, vigentes de 1876 a
										1965, segregaban a la población
										afroamericana, perpetuando la
										desigualdad y privándolos de los
										derechos fundamentales. Algunas de estas
										medidas fueron:
									</p>
								</section>

								<div className='unidad-problem-grid'>
									<div className='unidad-problem-card'>
										<h4 className='unidad-problem-title'>
											Impedir la participación política
										</h4>
										<p className='unidad-problem-text'>
											Se aplicaron pruebas de
											alfabetización y se exigía el pago de
											un impuesto para votar,
											dificultando el ejercicio del
											derecho al voto de afroamericanos.
										</p>
									</div>
									<div className='unidad-problem-card'>
										<h4 className='unidad-problem-title'>
											Dificultar el acceso a la educación
										</h4>
										<p className='unidad-problem-text'>
											Los afroamericanos asistían a
											escuelas separadas de los blancos.
											Sin embargo, estas tenían estándares
											educativos más bajos y recibían
											menos fondos para su mantenimiento y
											desarrollo.
										</p>
									</div>
									<div className='unidad-problem-card'>
										<h4 className='unidad-problem-title'>
											Aumentar la discriminación laboral
										</h4>
										<p className='unidad-problem-text'>
											Traducida en empleos mal
											remunerados como jornaleros,
											obreros y en el caso de las mujeres,
											como servicio doméstico. Esto
											provocaba mayores tasas de pobreza y
											desempleo, entre otros.
										</p>
									</div>
									<div className='unidad-problem-card'>
										<h4 className='unidad-problem-title'>
											Implementar la segregación racial
										</h4>
										<p className='unidad-problem-text'>
											Esta se evidenció en diferentes
											espacios públicos: los restaurantes
											se negaban a atender afroamericanos o
											los ubicaban en áreas aparte, y en
											autobuses los asientos para blancos y
											para afroamericanos estaban
											separados.
										</p>
									</div>
								</div>

								<div className='unidad-info-box'>
									<p className='unidad-info-title'>
										Glosario
									</p>
									<p className='unidad-info-text'>
										<strong>Supremacía blanca.</strong>{' '}
										Ideología que promueve la creencia en la
										superioridad de las personas blancas
										sobre otros grupos étnicos.
									</p>
									<p className='unidad-info-text'>
										<strong>Segregación.</strong> Práctica
										de separar a las personas por su origen
										étnico.
									</p>
								</div>

								<section>
									<h3 className='unidad-section-title'>
										El inicio de la lucha por los derechos
										civiles y el trabajo de la NAACP
									</h3>
									<p className='unidad-paragraph'>
										El movimiento de derechos civiles en
										los Estados Unidos surgió en un contexto
										de discriminación racial y segregación
										sistémica, especialmente en el sur del
										país. Organizaciones como la Asociación
										Nacional para el Avance de la Gente de
										Color (NAACP, en inglés) y la
										Conferencia de Liderazgo Cristiano del
										Sur (SCLC, en inglés) se formaron para
										abogar por la igualdad racial y el fin
										de la segregación.
									</p>
									<p className='unidad-paragraph unidad-paragraph-bottom'>
										La NAACP, fundada en 1909, se centró en
										demandar en los tribunales para combatir
										las leyes de segregación y promover la
										igualdad de derechos civiles. Algunos de
										los casos emblemáticos en los que
										trabajó esta organización fueron:
									</p>
								</section>

								<div className='unidad-regions-grid'>
									<div className='unidad-region-card green'>
										<h4 className='unidad-region-title green'>
											El asesinato de Emmett Till (1955)
										</h4>
										<p className='unidad-region-text'>
											En agosto, Emmett Till, un
											afroamericano de 14 años, fue víctima
											de un brutal asesinato en Money,
											Mississippi. El crimen se
											desencadenó tras un supuesto
											incidente con una mujer blanca. Su
											madre, Mamie Till, tomó la decisión de
											mostrar públicamente el cuerpo de su
											hijo, exponiendo la crueldad del
											racismo. Este acto generó una
											indignación nacional sin
											precedentes. La NAACP apoyó
											legalmente a la familia de Emmett en
											la búsqueda de justicia; sin
											embargo, los culpables del crimen
											fueron absueltos.
										</p>
									</div>
									<div className='unidad-region-card orange'>
										<h4 className='unidad-region-title orange'>
											Brown contra la junta de educación
											(1951)
										</h4>
										<p className='unidad-region-text'>
											Estudiantes afroamericanos de
											Virginia protestaron por las
											condiciones desiguales en las
											escuelas segregadas del Estado,
											desencadenando una demanda colectiva
											liderada por la NAACP. En mayo de
											1954, la Corte Suprema declaró
											inconstitucional la segregación en
											escuelas públicas. La decisión marcó
											un hito en la lucha por los
											derechos civiles en Estados Unidos.
										</p>
									</div>
									<div className='unidad-region-card blue'>
										<h4 className='unidad-region-title blue'>
											El Boicot a los autobuses de
											Montgomery (1955)
										</h4>
										<p className='unidad-region-text'>
											El 1 de diciembre, en Montgomery,
											Alabama, Rosa Parks desafió la
											segregación al negarse a ceder su
											asiento en el autobús a un pasajero
											blanco, lo que inspiró el boicot de
											autobuses liderado por la NAACP
											durante más de un año. Dicho acto
											desencadenó un desafío legal que
											finalmente declaró inconstitucional
											la segregación en los autobuses.
											Parks se convirtió en un ícono del
											movimiento por los derechos civiles,
											colaborando con líderes como Martin
											Luther King Jr.
										</p>
									</div>
								</div>

								<p className='unidad-paragraph'>
									La escuela primaria de Monroe, en el estado
									de Kansas, era un centro educativo
									segregado.
								</p>
								<p className='unidad-paragraph'>
									Rosa Parks, luego de ser arrestada.
								</p>
								<p className='unidad-paragraph unidad-paragraph-bottom'>
									Fotografía de Emmett Till tomada en 1954.
								</p>

								<section>
									<h3 className='unidad-section-title'>
										Martin Luther King Jr. y sus estrategias
										de protesta pacífica
									</h3>
									<p className='unidad-paragraph unidad-paragraph-bottom'>
										Martin Luther King Jr., un pastor de una
										iglesia bautista de Montgomery,
										Alabama, utilizó su posición para
										promover la igualdad y la justicia en su
										comunidad. Los boicots a los autobuses
										de Montgomery, que sucedieron al
										incidente de Rosa Parks, fueron
										planificados por el presidente de la
										sección de Alabama de la NAACP, Edgar
										Nixon, y dirigidos por King. La gran
										repercusión y el éxito que tuvo la
										protesta pacífica, inspirada en los
										principios de no violencia de Gandhi
										(Doc. 3), convirtió a King en una de las
										figuras más destacadas en la lucha por la
										defensa de los derechos civiles de ese
										momento.
									</p>
								</section>

								<section>
									<h3 className='unidad-section-title'>
										La Conferencia de Liderazgo Cristiano
										del Sur
									</h3>
									<p className='unidad-paragraph unidad-paragraph-bottom'>
										En 1957, King, junto a Ralph Abernathy,
										Fred Shuttlesworth, Joseph Lowery y
										otros dirigentes, fundaron la Conferencia
										de Liderazgo Cristiano del Sur (SCLC).
										La SCLC buscaba aprovechar el nivel de
										organización de las iglesias en las que
										se congregaban afroamericanos para
										llevar a cabo protestas no violentas y
										lograr avances en materia de derechos
										civiles.
									</p>
								</section>

								<div className='unidad-doc-box'>
									<p className='unidad-doc-kicker'>
										Doc. 3 Gandhi: Un modelo de resistencia
										pacífica para los oprimidos
									</p>
									<p className='unidad-doc-footer'>
										Fuente: King, M. (1858). A Decade
										Without Gandhi. Hindustan Times News.
									</p>
									<p className='unidad-doc-text'>
										Mahatma Gandhi ha hecho más que
										cualquier otra persona de la historia
										para revelar que los problemas sociales
										pueden resolverse sin recurrir a métodos
										primitivos de violencia. […] En nuestra
										lucha contra la segregación racial en
										Montgomery, Alabama, llegué a ver en una
										etapa muy temprana que una síntesis del
										método de no violencia de Gandhi y la
										ética del amor es la mejor arma
										disponible para los afroamericanos en
										esta lucha por la libertad y la dignidad
										humana.
									</p>
									<p className='unidad-doc-text'>
										Es muy posible que el enfoque gandhiano
										consiga una solución al problema racial
										en Estados Unidos. Su espíritu es un
										recordatorio continuo a los pueblos
										oprimidos de que es posible resistir el
										mal y, sin embargo, no recurrir a la
										violencia.
									</p>
									<p className='unidad-doc-footer'>
										Martin Luther King Jr. (1929-1968).
									</p>
								</div>

								<section>
									<h3 className='unidad-section-title'>
										La Marcha sobre Washington por el
										Empleo y la Libertad
									</h3>
									<p className='unidad-paragraph unidad-paragraph-bottom'>
										Durante 1956 y 1962, el movimiento por
										los derechos civiles experimentó un auge
										de actividad, con protestas, boicots y
										acciones no violentas para desafiar la
										segregación racial y la discriminación.
										El ascenso de John F. Kennedy a la
										presidencia en 1961, un firme defensor
										de los derechos civiles que propuso
										aprobar una legislación a favor de los
										afroamericanos, junto con esta intensa
										actividad, crearon las condiciones
										propicias para la celebración de la
										Marcha sobre Washington por el Empleo y
										la Libertad, realizada el 28 de agosto
										de 1963, que es considerada uno de los
										eventos más significativos en la
										historia del movimiento por los derechos
										civiles en Estados Unidos. La marcha
										tuvo las siguientes características:
									</p>
									<ul className='unidad-consolidation-list'>
										<li>3. Objetivos.</li>
										<li>4. Participación</li>
										<li>5. Difusión</li>
										<li>6. Consecuencias</li>
										<li>7. Trascendencia</li>
									</ul>
								</section>

								<section>
									<h3 className='unidad-section-title'>
										La Marcha sobre Washington en imágenes
									</h3>
									<p className='unidad-paragraph'>
										En la web En la web En la web
									</p>
								</section>

								<div className='unidad-problem-grid'>
									<div className='unidad-problem-card'>
										<h4 className='unidad-problem-title'>
											1. Planificación
										</h4>
										<p className='unidad-problem-text'>
											Philip Randolph y Bayard Rustin
											propusieron la marcha en 1962. La
											administración de Kennedy
											inicialmente se opuso por temor a lo
											que pudiera ocurrir, pero luego
											decidió apoyarla.
										</p>
									</div>
									<div className='unidad-problem-card'>
										<h4 className='unidad-problem-title'>
											2. Organización
										</h4>
										<p className='unidad-problem-text'>
											La marcha fue un esfuerzo
											colaborativo entre las principales
											organizaciones de derechos civiles, el
											sector más progresista del
											movimiento obrero y otras
											asociaciones no afroamericanas.
										</p>
									</div>
								</div>

								<p className='unidad-paragraph'>
									Las demandas oficiales de la marcha fueron:
									leyes significativas de derechos civiles, un
									programa masivo de obras federales, pleno y
									justo empleo, alojamiento decente, derecho al
									voto y adecuada educación integrada.
								</p>
								<p className='unidad-paragraph'>
									La marcha atrajo a más de 250 000 personas
									de diversas etnias y clases sociales, y
									Martin Luther King pronunció su famoso
									discurso «Tengo un sueño».
								</p>
								<p className='unidad-paragraph'>
									La magnitud del evento recibió una gran
									atención de los medios nacionales. Las
									cadenas de televisión transmitieron los
									discursos de los organizadores y muchas
									personas pudieron tomar conciencia de la
									importancia del movimiento.
								</p>
								<p className='unidad-paragraph unidad-paragraph-bottom'>
									Posteriormente, King y otros líderes se
									reunieron con Kennedy, quien respaldó la
									legislación sobre los derechos civiles. Sin
									embargo, este fue asesinado tres meses
									después. Su sucesor, el presidente Johnson,
									aprovechó su influencia para avanzar con la
									agenda legislativa de Kennedy, logrando así
									la promulgación de la Ley de Derechos
									Civiles (1964) y la Ley de Derecho al Voto
									(1965).
								</p>

								<section>
									<h3 className='unidad-section-title'>
										Los desafíos en la lucha por los
										derechos civiles
									</h3>
									<p className='unidad-paragraph unidad-paragraph-bottom'>
										A pesar de los logros alcanzados con las
										movilizaciones pacíficas y los actos de
										desobediencia civil, los años siguientes
										a la Marcha sobre Washington estuvieron
										marcados por conflictos y hechos
										violentos perpetrados por la oposición y
										por grupos de supremacía blanca. Estos
										enfrentamientos reflejaron la
										resistencia de ciertos sectores de la
										sociedad a los avances en materia de
										derechos civiles y evidenciaron la
										persistencia de la discriminación racial
										en Estados Unidos. Entre algunos casos
										que se pueden citar se encuentran:
									</p>
								</section>

								<section>
									<h3 className='unidad-section-title'>
										La Ley de Derechos Civiles de 1968
									</h3>
									<p className='unidad-paragraph unidad-paragraph-bottom'>
										El asesinato de Martin Luther King Jr.
										impulsó la aprobación de la Ley de
										Derechos Civiles de 1968, que prohíbe la
										discriminación en la vivienda por raza,
										religión y origen, y criminaliza la
										violencia e intimidación por esos
										motivos.
									</p>
									<p className='unidad-paragraph unidad-paragraph-bottom'>
										A diferencia de la Ley de Derechos
										Civiles de 1964, que abordó la
										segregación en lugares públicos y en el
										empleo, la de 1968 se centró en la
										discriminación en el ámbito de la
										vivienda y en la prevención de la
										violencia racial. La lucha por los
										derechos civiles de los afroamericanos en
										Estados Unidos ha sido una larga y ardua
										batalla. Sin embargo, a través de la
										resistencia pacífica, la acción legal y
										el activismo político se han logrado
										avances significativos hacia la
										igualdad.
									</p>
								</section>

								<ul className='unidad-consolidation-list'>
									<li>
										El 21 de febrero de 1965, una figura
										destacada del movimiento, Malcolm X, fue
										asesinado mientras pronunciaba un
										discurso en Manhattan, Nueva York.
									</li>
									<li>
										El 4 de abril de 1968, Martin Luther
										King Jr. fue asesinado de un disparo
										mientras se encontraba en el balcón de un
										hotel en Memphis, Tennessee, donde se
										preparaba para asistir a una
										manifestación del movimiento laboral
										local.
									</li>
									<li>
										El 15 de septiembre de 1963, una iglesia
										bautista en Birmingham, Alabama, fue
										bombardeada durante un servicio
										religioso.
									</li>
									<li>
										El 18 de junio de 1964, la escuela
										primaria Bethel en la misma ciudad fue
										bombardeada. La explosión no causó
										víctimas mortales, pero hirió a varios
										estudiantes.
									</li>
									<li>
										En junio de 1964, tres activistas fueron
										secuestrados y asesinados en la ciudad de
										Filadelfia, Mississippi, por su asociación
										al Congreso de Igualdad Racial (CORE).
									</li>
									<li>
										El 25 de marzo de 1965, la activista
										Viola Liuzzo fue asesinada por miembros
										del KKK luego de participar en una
										marcha en apoyo al derecho al voto de los
										afroamericanos.
									</li>
								</ul>

								<div className='unidad-problem-grid'>
									<div className='unidad-problem-card'>
										<h4 className='unidad-problem-title'>
											Atentados contra líderes del
											movimiento
										</h4>
									</div>
									<div className='unidad-problem-card'>
										<h4 className='unidad-problem-title'>
											Bombardeos a iglesias y escuelas
										</h4>
									</div>
									<div className='unidad-problem-card'>
										<h4 className='unidad-problem-title'>
											Asesinatos de activistas
										</h4>
									</div>
								</div>

								<div className='unidad-doc-box'>
									<p className='unidad-doc-kicker'>
										Doc. 4 La participación de Martin Luther
										King jr. en la Marcha sobre Washington
									</p>
									<p className='unidad-doc-text'>
										Hace un siglo, un gran americano, bajo
										cuya simbólica sombra nos encontramos,
										firmó la Proclamación de Emancipación.
										Este trascendental decreto llegó como un
										gran faro de esperanza para millones de
										esclavos negros y esclavas negras, que
										habían sido quemados en las llamas de
										una injusticia aniquiladora. […] Pero
										cien años después, las personas negras
										todavía no son libres. Cien años
										después, la vida de las personas negras
										sigue todavía tristemente atenazada por
										los grilletes de la segregación y por las
										cadenas de la discriminación […].
									</p>
									<p className='unidad-doc-text'>
										No busquemos saciar nuestra sed de
										libertad bebiendo de la copa del
										encarnizamiento y del odio. Debemos
										conducir siempre nuestra lucha en el
										elevado nivel de la dignidad y la
										disciplina. No debemos permitir que
										nuestra fecunda protesta degenere en
										violencia física. […] La maravillosa
										nueva militancia que ha envuelto a la
										comunidad negra no debe llevarnos a
										desconfiar de todas las personas blancas,
										ya que muchos de nuestros hermanos
										blancos, como su presencia hoy aquí
										evidencia, han llegado a ser conscientes
										de que su destino está atado a nuestro
										destino.
									</p>
									<p className='unidad-doc-footer'>
										Fuente: King, M (1963). Yo tengo un
										sueño.
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

export default Semana1Unidad4Screen