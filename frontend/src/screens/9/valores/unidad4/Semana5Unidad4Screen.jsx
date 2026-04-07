import React, { useState, useRef, useEffect } from 'react'
import Sidebar from '../../../../components/Sidebar'
import Header from '../../../../components/Header'
import '../../../../App.css'

function Semana5Unidad4Screen () {
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
                const response = await fetch('/unidad4Semana5.vtt');
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
										Unidad 4 · Semana 5
									</h1>
									<h2 className='unidad-subtitle'>
										Muros, límites y fronteras: Caída del
										Bloque Socialista y el fin de la Guerra
										Fría
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
										El «muro de la vergüenza» y el fin de la
										Guerra Fría
									</h3>
								</section>

								<div className='unidad-doc-box'>
									<p className='unidad-doc-kicker'>Doc. 1</p>
									<p className='unidad-doc-footer'>
										Fuente: Ritchie, C. (2004). Gran Historia
										Universal.
									</p>
									<p className='unidad-doc-text'>
										El muro de la vergüenza
									</p>
									<p className='unidad-doc-text'>
										El 18 de noviembre de 1989, cuando los
										manifestantes de Berlín oriental arremetieron
										a golpes de pico contra el hormigón del Muro
										de Berlín y abrieron la primera brecha, el
										mundo supo que la Guerra Fría había llegado
										a su fin [...].
									</p>
									<p className='unidad-doc-text'>
										El cordón sanitario destinado a preservar a
										los países del Este se convirtió en el «muro
										de la vergüenza» para los occidentales.
									</p>
									<p className='unidad-doc-footer'>
										Parte del Muro de Berlín que se conserva en
										pie (2012).
									</p>
								</div>

								<div className='unidad-info-box'>
									<p className='unidad-info-title'>
										Profundización
									</p>
								</div>

								<div className='unidad-problem-grid'>
									<div className='unidad-problem-card'>
										<h4 className='unidad-problem-title'>
											Conexión histórica
										</h4>
										<p className='unidad-problem-text'>
											Mijaíl Gorbachov (1931-2022) fue el último
											dirigente de la URSS desde 1985 hasta su
											disolución en 1991. Su legado es evaluado
											con distintos matices, por algunos es
											reconocido debido a su valentía
											reformista y a su vez, es criticado por
											otros por considerarlo incapaz de evitar
											colapso del bloque socialista.
										</p>
									</div>
								</div>

								<p className='unidad-paragraph'>
									La década de 1980 representó un momento crítico
									para la Unión Soviética, que enfrentaba una
									profunda crisis económica y social, lo que
									ponía en riesgo la estabilidad del sistema
									socialista. Esta situación fue exacerbada por
									la intensa carrera armamentista con Estados
									Unidos, su principal rival en la Guerra Fría.
									La necesidad de mantener un alto nivel de
									gasto militar derivó en una serie de
									consecuencias negativas para la economía
									soviética, debilitando su capacidad de
									desarrollo en otros sectores cruciales para la
									población, por ejemplo:
								</p>
								<ul className='unidad-consolidation-list'>
									<li>Ineficiencia agrícola</li>
									<li>Baja calidad de los servicios públicos</li>
									<li>Obsolecensia tecnológica</li>
									<li>Pérdida de prestigio internacional</li>
								</ul>

								<p className='unidad-paragraph'>
									Uno de los aspectos más notables de esta
									crisis fue la ineficiencia agrícola. A pesar de
									que la Unión Soviética contaba con vastos
									recursos naturales y tierras fértiles, la falta
									de inversión en maquinaria moderna y técnicas
									agrícolas avanzadas llevó al estancamiento del
									sector. Como resultado, el país no logró
									satisfacer la creciente demanda interna de
									alimentos, lo que derivó en la necesidad de
									importar productos agrícolas, una contradicción
									para una potencia que aspiraba a la
									autosuficiencia.
								</p>
								<p className='unidad-paragraph'>
									Otro aspecto preocupante fue la baja calidad
									de los servicios públicos. Áreas vitales como
									la educación, la salud y la infraestructura
									recibieron poca inversión, lo que afectó
									gravemente la calidad de vida de la población.
									Los hospitales carecían de equipos médicos
									adecuados, las escuelas no contaban con recursos
									suficientes, y las infraestructuras urbanas se
									deterioraban. Este declive en los servicios
									básicos reflejaba la incapacidad del sistema
									para cumplir con los ideales socialistas de
									bienestar social.
								</p>
								<p className='unidad-paragraph'>
									La obsolescencia tecnológica también fue un
									factor clave en la crisis soviética. A lo largo
									de los años, la falta de incentivos para la
									innovación y la mejora de la eficiencia
									industrial llevó al país a un notable rezago en
									comparación con las naciones occidentales, que
									avanzaban rápidamente en sectores como la
									informática y las telecomunicaciones. Esta
									brecha tecnológica limitaba la competitividad de
									la Unión Soviética en el ámbito global.
								</p>
								<p className='unidad-paragraph unidad-paragraph-bottom'>
									Internacionalmente, el prestigio de la Unión
									Soviética se deterioró a raíz de su intervención
									militar en Checoslovaquia en 1968 y su débil
									apoyo a los movimientos de descolonización en
									África y Asia. Estas acciones generaron
									tensiones diplomáticas y afectaron su imagen
									como líder del bloque socialista, acentuando las
									contradicciones entre sus principios y su
									actuación a nivel internacional.
								</p>

								<section>
									<h3 className='unidad-section-title'>
										Gobierno de Mijaíl Gorbachov
									</h3>
									<p className='unidad-paragraph unidad-paragraph-bottom'>
										Este escenario de declive y debilitamiento
										político, tanto en el ámbito interno como
										externo, coincidió con el ascenso de Mijaíl
										Gorbachov a la Secretaría General del
										Partido Comunista de la URSS en 1985. Su
										llegada marcó el inicio de un amplio proceso
										de reformas políticas y económicas (Doc. 2),
										fundamentadas en dos conceptos clave:
									</p>
								</section>

								<div className='unidad-problem-grid'>
									<div className='unidad-problem-card'>
										<h4 className='unidad-problem-title'>
											Perestroika (reestructuración)
										</h4>
										<p className='unidad-problem-text'>
											Buscaba cambiar el modelo económico
											centralmente planificado:
										</p>
									</div>
									<div className='unidad-problem-card'>
										<h4 className='unidad-problem-title'>
											Glasnost (transparencia)
										</h4>
										<p className='unidad-problem-text'>
											Significó el paulatino debilitamiento de
											los estrictos controles policiales y
											políticos que caracterizaban a la
											sociedad soviética, con el objetivo de
											democratizar las decisiones del Gobierno
											frente a la población. Este proceso
											conllevó:
										</p>
										<ul className='unidad-activity-list'>
											<li>
												La implementación de mecanismos
												democráticos destinados a garantizar la
												transparencia.
											</li>
											<li>
												La libertad de prensa, de imprenta y
												de comunicación, la adopción del voto
												secreto para la elección de cargos en
												el partido, la ampliación de la lista de
												candidatos y la legalización de otros
												partidos políticos.
											</li>
											<li>
												Se otorgó mayor autonomía a las
												empresas para que pudieran tomar
												decisiones por sí mismas, sin estar
												sujetas a la planificación estatal.
											</li>
											<li>
												Se impulsó la actividad económica de
												las cooperativas agrícolas con el
												objetivo de incrementar los rendimientos
												en la agricultura y fortalecer así el
												mercado interno, es decir, la capacidad
												de consumo de la población soviética.
											</li>
											<li>
												Se permitió cierto nivel de inversiones
												extranjeras.
											</li>
										</ul>
									</div>
								</div>

								<section>
									<h3 className='unidad-section-title'>
										Las nuevas relaciones diplomáticas y la
										política de desarme
									</h3>
									<p className='unidad-paragraph'>
										Gorbachov comprendió que también era
										necesario integrarse a la economía global.
										Esto implicaba un acercamiento a los Estados
										Unidos, la principal potencia económica de la
										época. También reconoció que la carrera
										armamentista, que había consumido muchos
										recursos durante décadas, era un lastre para
										la economía soviética. Sin embargo, no deseaba
										reducir el arsenal militar de manera
										unilateral, para no quedar en desventaja
										frente a Estados Unidos.
									</p>
									<p className='unidad-paragraph'>
										En respuesta a este dilema, Gorbachov
										propuso una política de desarme, y en 1986
										la URSS y Estados Unidos acordaron, como
										primer paso, desmantelar los misiles de
										alcance medio. De estos acuerdos surgió el
										Tratado sobre Fuerzas Nucleares de Rango
										Intermedio, también conocido como «Tratado
										de Washington», que fue firmado el 8 de
										diciembre de 1987 por los líderes de ambos
										países. En este se comprometieron a eliminar
										todos los misiles terrestres con un alcance
										de entre 500 y 5500 km.
									</p>
									<p className='unidad-paragraph unidad-paragraph-bottom'>
										Por otro lado, la nueva política soviética,
										enfocada en revitalizar su propia economía y
										sociedad, implicó una reducción del apoyo
										económico y militar que brindaba a sus
										aliados. La medida tuvo un efecto inmediato
										en países como Nicaragua, Cuba y Vietnam, que
										habían dependido del respaldo económico y
										militar de la URSS, por lo que se vieron
										obligados a buscar nuevas fuentes de
										financiamiento y apoyo internacional.
									</p>
								</section>

								<div className='unidad-doc-box'>
									<p className='unidad-doc-kicker'>
										Doc. 2 La perestroika es una revolución
									</p>
									<p className='unidad-doc-text'>
										Perestroika es una palabra con muchos
										significados [...] entonces podemos decir
										así: perestroika es una revolución. Una
										decisiva aceleración del desarrollo
										socioeconómico y cultural de la sociedad
										soviética que involucra cambios radicales
										[...] son precisamente las medidas de carácter
										revolucionario las que son necesarias para
										vencer una situación de crisis [...] el
										socialismo es capaz de cambios revolucionarios
										porque es dinámico por su propia naturaleza.
										La perestroika satisface los intereses vitales
										del pueblo soviético. Está planeada para
										llevar a la sociedad hacia nuevas fronteras y
										elevarla a un nuevo nivel cualitativo. La
										desaparición de algo acostumbrado provoca
										protestas.
									</p>
									<p className='unidad-doc-footer'>
										Fuente: Gorbachov, M. (1987). Perestroika,
										Nuevas ideas para nuestro país y el mundo.
									</p>
								</div>

								<div className='unidad-info-box'>
									<p className='unidad-info-title'>Glosario</p>
									<p className='unidad-info-text'>
										<strong>Unilateral.</strong> Es una acción
										que se lleva a cabo por una sola parte o
										individuo, sin la participación o
										consentimiento de otros.
									</p>
								</div>

								<section>
									<h3 className='unidad-section-title'>
										Las trasformaciones políticas de Europa del
										Este
									</h3>
									<p className='unidad-paragraph'>
										Las consecuencias más impactantes de la
										transformación se observaron en los regímenes
										comunistas de Europa del Este. El cambio se
										produjo cuando la Unión Soviética adoptó una
										postura de no intervención frente a los
										movimientos reformistas que emergían en estos
										países, muchos de los cuales enfrentaban
										dificultades económicas similares. Esta nueva
										posición marcó un contraste notable con
										relación a las políticas que la URSS había
										tenido hasta ese momento, como la intervención
										soviética en Hungría (1956) y Checoslovaquia
										(1968), como una estrategia para mantener la
										estabilidad del bloque socialista.
									</p>
									<p className='unidad-paragraph unidad-paragraph-bottom'>
										A partir de 1988, países como Polonia y
										Hungría iniciaron sus propios procesos de
										renovación. Poco a poco, y sin estar exentos
										de conflictos, integraron a antiguos
										disidentes, flexibilizaron el control de los
										medios de comunicación y facilitaron el
										diálogo entre sectores políticos previamente
										reprimidos. También surgieron reacciones
										violentas en algunos países socialistas, que
										expresaron su desacuerdo con el abandono de
										los ideales más tradicionales del socialismo
										(Doc. 3).
									</p>
								</section>

								<section>
									<h3 className='unidad-section-title'>
										Disolución de la República Democrática
										Alemana (RDA) y la caída del Muro de Berlín
									</h3>
									<p className='unidad-paragraph unidad-paragraph-bottom'>
										En la RDA, miles de personas exigieron
										reformas siguiendo el ejemplo de la URSS. El 9
										de noviembre de 1989, Günter Schabowski
										anunció en una conferencia de prensa que se
										permitiría mayor libertad para viajar al
										extranjero, incluyendo Berlín oriental y
										occidental. Con base en esta declaratoria,
										miles de berlineses marcharon hacia el muro
										exigiendo que los dejaran pasar. Ante la
										multitud y la negativa de los líderes alemanes
										a usar la fuerza para detenerlos, los guardias
										finalmente abrieron las puertas. Esa misma
										noche, los ciudadanos de ambas Alemanias
										comenzaron a derribar el muro por sus propios
										medios. Este evento histórico (Doc. 4) marcó
										un punto de inflexión en la Guerra Fría y
										simbolizó el fin del comunismo en Europa del
										Este. Al año siguiente, se celebraron las
										primeras elecciones libres en la RDA, y el
										gobierno electo inició negociaciones con la RFA
										para la reunificación, la cual se concretó en
										octubre de 1990.
									</p>
								</section>

								<div className='unidad-doc-box'>
									<p className='unidad-doc-kicker'>
										Doc. 3 La caída del comunismo en Europa del
										Este
									</p>
									<p className='unidad-doc-text'>
										En 1989, cuando resultó evidente que los días
										de la intervención soviética se habían
										acabado, los regímenes comunistas de Europa
										empezaron a desmoronarse. La mayoría
										entregaron el poder sin violencia. En
										Rumanía, el comunista Nicolac Ceaucescu
										intentó desafiar a la oposición y se aferró al
										poder. Su ejército disparó contra los
										manifestantes en Timisoara en diciembre de
										1989. Pero a los pocos días Ceaucescu fue
										abucheado en un mitin y una multitud
										enfurecida lo expulsó de su palacio. Tras una
										serie de dudas, el ejército se unió a los
										rebeldes. Ceaucescu fue capturado y fusilado
										poco después.
									</p>
									<p className='unidad-doc-footer'>
										Fuente: Swift, J. (2008). Atlas histórico de
										la Guerra Fría.
									</p>
								</div>

								<div className='unidad-problem-grid'>
									<div className='unidad-problem-card'>
										<h4 className='unidad-problem-title'>
											Conexión histórica
										</h4>
										<p className='unidad-problem-text'>
											Europa del Este es una categoría que se
											utiliza para agrupar a países localizados
											en la zona oriental del continente europeo
											que se alinearon con la URSS y adoptaron
											regímenes comunistas. Entre estos se
											encuentran Polonia, Hungría,
											Checoslovaquia, Bulgaria y Rumanía, entre
											otros.
										</p>
									</div>
								</div>

								<p className='unidad-paragraph'>
									La caída del Muro de Berlín
								</p>
								<p className='unidad-paragraph'>
									En la web En la web En la web
								</p>

								<section>
									<h3 className='unidad-section-title'>
										Fragmentación de la URSS
									</h3>
									<p className='unidad-paragraph unidad-paragraph-bottom'>
										La desintegración de la Unión Soviética se
										precipitó con las revoluciones de 1989, que
										ejercieron una creciente presión sobre
										Gorbachov para que ampliara la democracia en
										las repúblicas constituyentes de la URSS, por
										lo que se introdujeron elecciones directas y se
										legalizaron otros partidos políticos de
										oposición. Sin embargo, en agosto de 1991, el
										Partido Comunista y las fuerzas armadas
										intentaron restaurar el régimen autoritario
										mediante un golpe de Estado. La resistencia
										popular liderada por Boris Yeltsin lo
										frustró, llevando a la ilegalización del
										Partido Comunista y la disolución de la URSS.
										El 25 de diciembre de 1991, la URSS dejó de
										existir formalmente.
									</p>
								</section>

								<div className='unidad-doc-box'>
									<p className='unidad-doc-kicker'>
										Doc. 4 Testimonios de berlineses sobre la
										caída del Muro de Berlín
									</p>
									<p className='unidad-doc-footer'>
										Fuente: BBC Mundo. Testimonios berlineses.
									</p>
									<p className='unidad-doc-text'>
										«Era increíble; la gente cruzaba el muro, se
										abrazaba. Una mujer me paró y me tomó la
										mano. Tenía lágrimas en los ojos; yo también
										estaba emocionado; era una sensación surreal.
										Yo conocía a Berlín como una ciudad amurallada,
										solía andar con mi bicicleta y pensaba:
										«Exactamente aquí está dividido el mundo y yo
										estoy de este lado». Entonces, cuando cayó el
										muro, no se veían todas las consecuencias; para
										mí fue como una liberación».
									</p>
									<p className='unidad-doc-footer'>
										Hermann, arquitecto de la RFA
									</p>
									<p className='unidad-doc-text'>
										«Cuando vi la gente en la calle cerca del muro
										con las banderas alemanas me pareció muy
										penoso verlos entusiasmarse así con el
										«occidente dorado» como locos por el consumo.
										Poco después vinieron los del oeste a nuestras
										oficinas, se sentaron y nos aclararon qué
										horribles éramos, los errores que habíamos
										cometido, lo que teníamos que hacer. Ahora he
										relativizado todo un poco. La idea, por
										ejemplo, que viviste tu vida «en falso», la
										manera tan grotesca con que se habla de todo
										lo que pasó en la RDA».
									</p>
									<p className='unidad-doc-footer'>
										Sylvia, fiscal de la RDA
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

export default Semana5Unidad4Screen