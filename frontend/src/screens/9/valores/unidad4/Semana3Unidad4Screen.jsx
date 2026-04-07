import React, { useState, useRef, useEffect } from 'react'
import Sidebar from '../../../../components/Sidebar'
import Header from '../../../../components/Header'
import '../../../../App.css'

function Semana3Unidad4Screen () {
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
                const response = await fetch('/unidad4Semana3.vtt');
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
										Unidad 4 · Semana 3
									</h1>
									<h2 className='unidad-subtitle'>
										Muros, límites y fronteras: el rol y los
										diferentes momentos históricos del mundo
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
										La frontera oriental de Europa
										(Bulgaria–Turquía)
									</h3>
								</section>

								<div className='unidad-doc-box'>
									<p className='unidad-doc-kicker'>Doc. 1</p>
									<p className='unidad-doc-text'>
										Bulgaria ha sido uno de los últimos
										países en erigir una verja contra la
										inmigración en la frontera oriental de
										Europa. Cuando, en 2012, Grecia
										inauguró su muro en la frontera que le
										une a territorio turco, Bulgaria
										comenzó a recibir un flujo creciente de
										refugiados y migrantes; así pues, las
										autoridades decidieron imitar a su
										vecino y levantar una valla de tres
										metros de altura a lo largo de 33 km.
									</p>
									<p className='unidad-doc-text'>
										Un año más tarde, el Gobierno anunció
										que la extendería otros 190 km (de los
										240 que consta la frontera
										turco-búlgara). El resultado ha sido
										que, en efecto, ha contenido el número
										de refugiados. Eso sí, a costa de que las
										rutas que utilizan quienes intentan
										penetrar en el país se hagan más
										peligrosas. Las últimas víctimas fueron
										dos iraquíes hallados muertos a causa de
										la hipotermia. Unos días antes, una mujer
										somalí había fallecido en la misma zona.
									</p>
									<p className='unidad-doc-footer'>
										La frontera oriental de Europa entre
										Bulgaria y Turquía
									</p>
									<p className='unidad-doc-footer'>
										Fuente: Mourenza, Andrés (2017). La
										frontera oriental de Europa y Turquía.
										El País.
									</p>
								</div>

								<p className='unidad-paragraph'>
									A lo largo de la historia, la humanidad ha
									construido muros, establecido límites y
									definido fronteras para diversos propósitos.
									Estos elementos han servido principalmente
									para proteger territorios, controlar el
									movimiento de personas y bienes, marcar
									divisiones políticas y culturales, e incluso
									simbolizar el poder y la identidad.
								</p>
								<p className='unidad-paragraph unidad-paragraph-bottom'>
									Desde la Antigüedad hasta la Edad
									Contemporánea, la existencia de muros ha sido
									una característica común a nivel mundial.
									Las antiguas civilizaciones, como la
									egipcia, la mesopotámica, la china y la
									romana, recurrieron a la construcción de
									muros para proteger sus ciudades y
									territorios. Estas imponentes estructuras no
									solo cumplían una función defensiva, sino
									que también representaban el poderío, la
									capacidad de control, el establecimiento de
									límites fronterizos y la sofisticación de la
									ingeniería de la época. Algunos de los
									ejemplos más representativos son:
								</p>

								<div className='unidad-info-box'>
									<p className='unidad-info-title'>
										Profundización
									</p>
									<p className='unidad-info-text'>
										<strong>
											La Gran Muralla china.
										</strong>{' '}
										Es una fortificación de más de 21 mil
										kilómetros, edificada para proteger al
										Imperio chino de invasiones. Iniciada por
										Qin Shi Huang en el 220 a. C., su
										construcción se extendió por dos milenios.
										Está compuesta por numerosos muros
										paralelos, integrando barreras naturales
										como montañas. Esta imponente estructura,
										declarada Patrimonio de la Humanidad, ha
										trascendido su función original para
										convertirse en un ícono cultural y
										motivo de orgullo nacional para el pueblo
										chino.
									</p>
									<p className='unidad-info-text'>
										<strong>La ciudad de Jericó.</strong>{' '}
										Está situada en el valle del Jordán, en
										Cisjordania, a unos 25 km al este de
										Jerusalén. Los hallazgos arqueológicos en
										Jericó han proporcionado evidencia
										convincente de que fue un asentamiento
										amurallado y es el más antiguo hasta la
										fecha. Los muros datan del año 8000 a. C.
										Estos fueron reemplazados por otros más
										fuertes y la ciudad continuó siendo
										amurallada hasta el siglo VII d. C.
									</p>
									<p className='unidad-info-text'>
										<strong>El Muro de Adriano.</strong>{' '}
										Construido por el emperador romano
										Adriano en el año 122, fue la mayor
										muralla del Imperio romano, con una
										extensión aproximada de 118 kilómetros.
										Fue una medida defensiva contra los
										posibles ataques de grupos nórdicos y
										sirvió para delimitar el imperio en
										Europa, África y Medio Oriente.
									</p>
								</div>

								<div className='unidad-problem-grid'>
									<div className='unidad-problem-card'>
										<h4 className='unidad-problem-title'>
											Conexión histórica
										</h4>
										<p className='unidad-problem-text'>
											Los límites son las líneas imaginarias
											o físicas que marcan el perímetro de
											un área geográfica específica, como
											una propiedad o un país. Mientras
											que, las fronteras son las zonas o
											regiones que separan dos territorios
											distintos que cuentan con barreras
											físicas (muros, cercas, controles de
											acceso) y naturales (ríos, montañas,
											desiertos).
										</p>
									</div>
								</div>

								<section>
									<h3 className='unidad-section-title'>
										Fronteras en la Edad Media y el
										Renacimiento
									</h3>
									<p className='unidad-paragraph unidad-paragraph-bottom'>
										Durante la Edad Media y el Renacimiento,
										las fronteras en Europa eran mucho menos
										definidas y estables que en los tiempos
										modernos. En lugar de límites
										geográficos claramente delineados, los
										territorios estaban fragmentados en una
										variedad de unidades políticas que
										incluían feudos y reinos. Estos
										territorios estaban sujetos a cambios
										constantes debido a una serie de
										factores:
									</p>
								</section>

								<div className='unidad-problem-grid'>
									<div className='unidad-problem-card'>
										<h4 className='unidad-problem-title'>
											Feudalismo
										</h4>
										<p className='unidad-problem-text'>
											La Alta Edad Media se caracterizó por
											un sistema feudal fragmentado, donde
											los señores feudales controlaban
											territorios y juraban lealtad a un rey
											o a otro señor más poderoso. Los
											conflictos entre señores feudales por
											el control de la tierra eran comunes y
											podían resultar en cambios
											significativos en las fronteras.
										</p>
									</div>
									<div className='unidad-problem-card'>
										<h4 className='unidad-problem-title'>
											Centralización monárquica
										</h4>
										<p className='unidad-problem-text'>
											A partir del siglo XI, existió una
											tendencia hacia la centralización del
											poder en manos de los reyes, quienes
											fortalecieron sus ejércitos,
											imposieron su autoridad sobre la
											nobleza feudal y definieron con mayor
											precisión las fronteras de sus
											reinos.
										</p>
									</div>
									<div className='unidad-problem-card'>
										<h4 className='unidad-problem-title'>
											Guerras, invasiones y conquistas
										</h4>
										<p className='unidad-problem-text'>
											Los conflictos bélicos fueron un factor
											determinante en la redefinición de las
											fronteras. Las victorias o las
											derrotas podían significar la pérdida o
											ganancia de vastas áreas de territorio.
										</p>
									</div>
									<div className='unidad-problem-card'>
										<h4 className='unidad-problem-title'>
											Matrimonios reales
										</h4>
										<p className='unidad-problem-text'>
											Las alianzas matrimoniales entre
											miembros de la nobleza podían unir
											territorios, ampliar las fronteras de un
											reino o redistribuir las tierras dentro
											del mismo.
										</p>
									</div>
									<div className='unidad-problem-card'>
										<h4 className='unidad-problem-title'>
											La diplomacia
										</h4>
										<p className='unidad-problem-text'>
											Fue una herramienta importante para la
											resolución de conflictos y la
											definición de fronteras. Tratados y
											pactos permitieron el establecimiento
											de límites territoriales, reconocieron
											la soberanía de los reinos y
											regularon las relaciones comerciales.
										</p>
									</div>
								</div>

								<section>
									<h3 className='unidad-section-title'>
										Colonización y expansión imperial: las
										fronteras arbitrarias y su impacto
									</h3>
									<p className='unidad-paragraph'>
										El proceso de colonización europea, que se
										extendió desde el siglo XV hasta principios
										del XX, estuvo marcada por la expansión de
										potencias como España, Portugal, Inglaterra
										y Francia. Este proceso no solo implicó la
										conquista y dominio de vastos territorios,
										sino también la imposición de fronteras con
										base en los intereses geopolíticos y
										económicos propios de las potencias, sin
										considerar las realidades locales o las
										estructuras sociales preexistentes. A
										menudo, estos límites se definían por
										accidentes geográficos, ignorando las
										dinámicas de los grupos étnicos
										originarios.
									</p>
									<p className='unidad-paragraph'>
										Los procesos de independencia en América y
										África, si bien marcaron el inicio de la
										autodeterminación y el fin del dominio
										colonial, no dieron lugar a un panorama
										pacífico y estable en las nuevas
										naciones. Numerosos conflictos limítrofes
										surgieron tras la independencia, moldeando
										y redefiniendo las fronteras de estos
										países.
									</p>
									<p className='unidad-paragraph unidad-paragraph-bottom'>
										Las principales fuentes de tensión entre
										países vecinos se relacionan con las
										fronteras establecidas por las potencias
										coloniales, que no coincidían con las
										divisiones étnicas, lingüísticas o
										culturales, lo que generó tensiones
										internas en muchos países recién
										independizados, y con el control de
										recursos naturales como agua, tierra,
										petróleo o minerales. En algunos casos,
										estos conflictos limítrofes llevaron a
										cambios en las fronteras, como resultado
										de acuerdos de paz, victorias militares o
										intervenciones internacionales.
									</p>
								</section>

								<section>
									<h3 className='unidad-section-title'>
										Las guerras mundiales y el surgimiento de
										nuevas fronteras
									</h3>
									<p className='unidad-paragraph unidad-paragraph-bottom'>
										La Primera Guerra Mundial puso de relieve
										las tensiones entre las potencias, en
										parte por su interés de dominar otros
										territorios en África, a pesar de las
										fronteras artificiales previamente
										trazadas. Como consecuencia se
										desintegraron los Imperios austro-húngaro
										y otomano, lo que condujo a la formación
										de nuevas naciones, mientras que las
										fronteras en Europa occidental también se
										redibujaron.
									</p>
									<p className='unidad-paragraph unidad-paragraph-bottom'>
										Estos cambios territoriales buscaban
										redistribuir el poder y prevenir futuras
										guerras, pero al mismo tiempo generaron
										resentimientos y tensiones que
										desembocaron en el estallido de la
										Segunda Guerra Mundial, que finalizó
										provocando una reconfiguración aún más
										significativa de las fronteras en Europa y
										otras partes del mundo con la declaración
										de la Guerra Fría entre Estados Unidos y
										la Unión Soviética.
									</p>
								</section>

								<section>
									<h3 className='unidad-section-title'>
										Muros físicos e ideológicos como símbolos
										de división
									</h3>
									<p className='unidad-paragraph unidad-paragraph-bottom'>
										La Guerra Fría se caracterizó por la
										división del mundo en dos bloques
										antagónicos: el occidental, liderado por
										Estados Unidos y alineado con las ideas
										capitalistas y democráticas, y el
										oriental, encabezado por la Unión
										Soviética y basado en el sistema comunista
										y autoritario.
									</p>
								</section>

								<p className='unidad-paragraph'>
									Para consolidar su dominio y proteger sus
									esferas de influencia, ambos bloques
									erigieron muros físicos e ideológicos que
									separaban a las personas y las naciones.
									Entre los ejemplos más emblemáticos se
									encuentran:
								</p>
								<p className='unidad-paragraph unidad-paragraph-bottom'>
									La Guerra Fría, a pesar de haber finalizado,
									sigue proyectando una sombra sobre la
									geopolítica contemporánea, delineando
									fronteras y alimentando conflictos latentes
									en diversas regiones del mundo.
								</p>
								<p className='unidad-paragraph unidad-paragraph-bottom'>
									En este contexto actual, la globalización,
									caracterizada por la interconexión mundial a
									través del desarrollo comercial y
									tecnológico, ha incrementado la movilidad
									humana, impulsada por factores como la
									búsqueda de oportunidades económicas, la
									reunificación familiar y la huida de
									conflictos o persecución. También, de manera
									contradictoria, ha impulsado la creación de
									nuevas divisiones fronterizas y el
									resurgimiento de muros, ya que el aumento de
									la migración ha ejercido presión sobre los
									países de destino, desafiando su capacidad
									para gestionar los flujos migratorios de
									manera ordenada y segura. En respuesta a
									estas presiones, algunos Gobiernos han
									adoptado medidas proteccionistas, como el
									levantamiento de muros fronterizos, el
									aumento de la vigilancia y el endurecimiento
									de las políticas migratorias.
								</p>

								<p className='unidad-paragraph'>
									Muros famosos en el mundo
								</p>
								<p className='unidad-paragraph'>
									En la web En la web En la web
								</p>

								<div className='unidad-problem-grid'>
									<div className='unidad-problem-card'>
										<h4 className='unidad-problem-title'>
											La cortina de hierro
										</h4>
										<p className='unidad-problem-text'>
											Término utilizado para referirse a la
											frontera imaginaria que separaba a los
											países de Europa oriental, bajo el
											control soviético, de los países de
											Europa occidental, alineados con
											Estados Unidos. Esta división no solo
											era física, sino también ideológica, ya
											que restringía la libertad de
											movimiento, la comunicación y el
											intercambio cultural entre bloques.
										</p>
									</div>
									<div className='unidad-problem-card'>
										<h4 className='unidad-problem-title'>
											El Muro de Berlín (1961-1989)
										</h4>
										<p className='unidad-problem-text'>
											Esta barrera física de 155 kilómetros de
											largo y 3,6 metros de altura dividía la
											ciudad de Berlín en dos: la zona
											occidental, controlada por las potencias
											aliadas, y la zona oriental, bajo el
											dominio de la URSS. El Muro de Berlín
											se convirtió en un símbolo palpable de
											la Guerra Fría y la división política
											entre el capitalismo y el comunismo.
										</p>
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

export default Semana3Unidad4Screen