import React, { useState, useRef, useEffect } from 'react'
import Sidebar from '../../../../components/Sidebar'
import Header from '../../../../components/Header'
import '../../../../App.css'

function Semana6Unidad4Screen () {
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
                const response = await fetch('/unidad4Semana6.vtt');
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
										Unidad 4 · Semana 6
									</h1>
									<h2 className='unidad-subtitle'>
										Muros, límites y fronteras: el muro
										fronterizo entre Estados Unidos y México
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

								<div className='unidad-info-box'>
									<p className='unidad-info-text'>
										Algunas personas consideran que los
										muros fronterizos son símbolos de
										división, discriminación y xenofobia,
										elementos que separan a las personas y
										obstaculizan la libertad de movimiento,
										fomentando la desconfianza y el
										aislamiento. Otros creen que los muros
										protegen al ofrecer seguridad y control
										frente a amenazas externas, preservando
										la estabilidad territorial.
									</p>
								</div>

								<section>
									<h3 className='unidad-section-title'>
										Vallas, muros y fronteras (Doc. 1)
									</h3>
								</section>

								<div className='unidad-doc-box'>
									<p className='unidad-doc-kicker'>Doc. 1</p>
									<p className='unidad-doc-footer'>
										Fuente: Bowden, C. (2007). Nuestro muro.
									</p>
									<p className='unidad-doc-text'>
										Vallas que se convierten en muros
									</p>
									<p className='unidad-doc-text'>
										La mayoría de fronteras atraen conflictos
										y violencia, que generan vallas, y
										eventualmente, las vallas pueden
										convertirse en muros. Parecemos amar los
										muros, pero nos avergüenzan porque dicen
										algo desagradable sobre los vecinos y
										sobre nosotros mismos. Los muros surgen
										de dos fuentes: el miedo y el deseo de
										control. Así como nuestras casas tienen
										puertas y cerraduras, las fronteras
										tienen guarniciones, oficiales de aduanas
										y, de vez en cuando, grandes muros.
									</p>
									<p className='unidad-doc-footer'>
										Muro fronterizo entre las ciudades de
										Arizona (Estados Unidos) y Sonora
										(México).
									</p>
								</div>

								<p className='unidad-paragraph'>
									Valla fronteriza entre Arizona (EE. UU.) y
									Sonora (México), en el desierto de Sonora
									(2019).
								</p>
								<p className='unidad-paragraph'>
									El río Bravo funciona de frontera natural
									entre México y EE. UU.
								</p>

								<section>
									<h3 className='unidad-section-title'>
										La frontera entre Estados Unidos y México
									</h3>
									<p className='unidad-paragraph unidad-paragraph-bottom'>
										La frontera entre Estados Unidos y
										México, una de las más extensas y
										transitadas del mundo, se extiende a lo
										largo de 3144 kilómetros, desde las
										playas del Pacífico hasta las aguas del
										golfo de México. Su recorrido atraviesa
										el árido desierto de Sonora, sigue el
										curso del río Bravo, también llamado río
										Grande, y se adentra en las montañas de
										California. Esta delimitación actual
										tiene su origen en el siglo XIX, cuando
										Estados Unidos se encontraba en plena
										expansión territorial. En 1845, tras la
										anexión de Texas, la frontera entre ambos
										países se ubicó en el río Bravo.
										Posteriormente, el país continuó
										expandiéndose a expensas de México, al
										conquistar Alta California y Nuevo México
										en 1948, imponiendo una frontera
										artificial que dividía una zona desértica,
										árida y poco poblada.
									</p>
									<p className='unidad-paragraph unidad-paragraph-bottom'>
										Con el paso del tiempo, algunas de las
										fronteras administrativas y localidades
										fronterizas se fueron convirtiendo en
										puntos estratégicos de contrabando y
										tráfico de drogas (Doc. 2), pero también
										en importantes centros económicos y una
										ruta para cientos de miles de migrantes
										que buscaban entrar a Estados Unidos.
									</p>
								</section>

								<div className='unidad-info-box'>
									<p className='unidad-info-title'>
										Profundización
									</p>
								</div>

								<div className='unidad-doc-box'>
									<p className='unidad-doc-kicker'>
										Doc. 2 La frontera de Nogales
									</p>
									<p className='unidad-doc-text'>
										La frontera entre Arizona y Sonora es una
										de las mayores puertas de entrada de droga
										a Estados Unidos. El sector Tucson de la
										patrulla fronteriza es uno de los que
										tienen más actividad policial, ya que
										cubre la mayor parte del Estado de Arizona
										a través de ocho estaciones que van desde
										Nuevo México hasta el condado de Yuma.
										Ahí, en esas 262 millas de frontera, los
										agentes han incautado históricamente el
										50 % de la droga que entra a EE. UU.,
										explica Vicente Paco, vocero de la
										patrulla fronteriza en ese sector. Las
										bandas criminales hoy en día son
										organizaciones transnacionales, destaca,
										porque no solo se encargan del contrabando
										de drogas, sino que también controlan las
										rutas de tráfico de personas y de armas.
										«Cualquier persona que quiere entrar
										ilegalmente a los Estados Unidos tiene que
										entrar al crimen organizado. Tienen que
										pagar una cuota a las organizaciones y si
										no tienen dinero son usados como burreros
										o mulas», menciona.
									</p>
									<p className='unidad-doc-footer'>
										Fuente: Gallegos, Z. (2016). Viaje al
										túnel de la droga a Estados Unidos.
									</p>
								</div>

								<section>
									<h3 className='unidad-section-title'>
										Antecedentes del muro fronterizo
									</h3>
									<p className='unidad-paragraph unidad-paragraph-bottom'>
										Si bien la construcción de pasos
										fronterizos y vallas ya era habitual a
										principios del siglo XX, fue a mediados de
										la década de 1990, bajo la administración
										Bill Clinton, que la política migratoria
										estadounidense experimentó un
										endurecimiento significativo. La
										construcción de muros, obstáculos y
										barreras físicas se convirtió en la
										estrategia central para controlar el flujo
										migratorio creciente provocado por las
										siguientes causas:
									</p>
								</section>

								<p className='unidad-paragraph'>
									En los años siguientes, el recrudecimiento de
									la violencia, particularmente en México y
									algunos países de Centroamérica, sumado a
									otras problemáticas a lo largo de la región,
									provocaron un aumento en los índices
									migratorios.
								</p>

								<div className='unidad-problem-grid'>
									<div className='unidad-problem-card'>
										<h4 className='unidad-problem-title'>
											Conflictos políticos y armados
										</h4>
										<p className='unidad-problem-text'>
											Algunos países de Latinoamérica
											enfrentaron conflictos políticos y
											armados en la década de 1980. Esto
											generó condiciones adversas que
											propiciaron la migración de muchas
											personas hacia Estados Unidos.
										</p>
									</div>
									<div className='unidad-problem-card'>
										<h4 className='unidad-problem-title'>
											Desigualdad económica
										</h4>
										<p className='unidad-problem-text'>
											La falta de inversión en programas que
											mejoraran las condiciones de vida de la
											población en las naciones de la región
											provocó un aumento de la pobreza y el
											desempleo, ampliando la brecha entre
											ricos y pobres.
										</p>
									</div>
									<div className='unidad-problem-card'>
										<h4 className='unidad-problem-title'>
											Demandas laborales en Estados Unidos
										</h4>
										<p className='unidad-problem-text'>
											Durante este período, la economía
											estadounidense experimentó una demanda
											continua de mano de obra barata,
											especialmente en sectores como la
											agricultura, la construcción y el
											servicio doméstico.
										</p>
									</div>
								</div>

								<section>
									<h3 className='unidad-section-title'>
										El muro fronterizo entre México y Estados
										Unidos
									</h3>
									<p className='unidad-paragraph'>
										El muro fronterizo entre México y Estados
										Unidos es una barrera física, establecida
										desde mediados de la década de 1990, que
										se extiende a lo largo de gran parte de la
										frontera terrestre entre ambos países y
										está compuesto por una variedad de
										estructuras, que incluyen paredes de
										concreto, vallas metálicas y otras
										barreras, que abarcan 1136 km de la
										longitud total de los límites fronterizos.
									</p>
									<p className='unidad-paragraph'>
										Existen tramos donde el terreno o la
										geografía no permiten la construcción de
										una barrera física, como áreas
										montañosas, desiertos, ríos y otros
										obstáculos naturales, por lo que no es
										continua, sino que en algunos lugares la
										frontera está abierta o no está
										físicamente delimitada. Su ubicación se
										puede observar en el siguiente mapa:
									</p>
									<p className='unidad-paragraph'>
										Con la llegada del republicano Donald Trump
										al poder, en 2017, se intensificaron las
										leyes migratorias restrictivas y se realizó
										la ampliación de un muro fronterizo como
										medida para reducir la inmigración
										irregular y reforzar la seguridad nacional,
										según las declaraciones del mandatario. A
										pesar de la promesa de campaña del
										presidente Trump, con el financiamiento
										conseguido para dicho proyecto solo se
										lograron hacer reparaciones o
										sustituciones de estructuras preexistentes
										que se encontraban deterioradas y ampliar
										un total de 76 km más la longitud del
										muro. Asimismo, Trump llevó a cabo una
										serie de acciones ejecutivas, órdenes
										administrativas y acuerdos con otros países
										para reducir la migración y de esta forma
										justificar la efectividad del muro
										fronterizo.
									</p>
								</section>

								<p className='unidad-paragraph'>
									El muro de Trump
								</p>
								<p className='unidad-paragraph'>
									En la web En la web En la web
								</p>
								<p className='unidad-doc-footer'>
									Tomado de:
									https://elordenmundial.com/mapas-y-graficos/mapa-muro-mexico-estados-unidos/
								</p>

								<section>
									<h3 className='unidad-section-title'>
										Perspectivas actuales y futuras sobre el
										muro fronterizo
									</h3>
									<p className='unidad-paragraph unidad-paragraph-bottom'>
										El cambio de gobierno de Donald Trump al
										demócrata Joe Biden marcó un giro en la
										política migratoria de Estados Unidos.
										Inmediatamente después de asumir el
										cargo, Biden anunció la interrupción de la
										construcción del muro fronterizo en 2021.
										Esta medida fue parte de un cambio de
										enfoque hacia políticas migratorias más
										centradas en la defensa de los derechos
										humanos y la reunificación familiar. Sin
										embargo, la decisión de ampliar el muro en
										la frontera con México, anunciada el 5 de
										octubre de 2023, sorprendió a muchos. El
										gobierno de Biden justificó esta decisión
										argumentando que es una necesidad
										inmediata evitar las entradas ilegales.
									</p>
									<p className='unidad-paragraph unidad-paragraph-bottom'>
										En ese sentido, el debate en torno al muro
										fronterizo entre Estados Unidos y México ha
										generado opiniones y perspectivas variadas.
										Si bien algunos argumentan que el muro es
										necesario para proteger la seguridad
										nacional y controlar la migración, otros
										sostienen que su impacto negativo en el
										medioambiente y en el bienestar de las
										personas que intentan cruzar la frontera
										supera cualquier beneficio político (Doc.
										3).
									</p>
								</section>

								<div className='unidad-doc-box'>
									<p className='unidad-doc-kicker'>
										Doc. 3 Puntos de vista sobre el muro
										fronterizo
									</p>
									<p className='unidad-doc-footer'>
										Fuente: Armstrong, K. (2023). Una crisis
										en aumento.
									</p>
									<p className='unidad-doc-text'>
										El secretario de Seguridad Nacional de
										Estados Unidos, Alejandro Mayorkas, habló
										de la «necesidad aguda e inmediata» de
										construir la nueva sección del muro y
										evitar entradas de indocumentados. El
										nuevo muro consistirá en grandes bolardos
										incrustados en una base de hormigón, así
										como puertas, cámaras y equipos de
										videovigilancia.
									</p>
									<p className='unidad-doc-text'>
										Construir el muro implica dejar de aplicar
										decenas de leyes federales, incluida la
										Ley de Aire Limpio y la Ley de Agua Potable
										Segura: «Es desalentador ver al presidente
										Biden rebajarse a este nivel, dejando de
										lado las leyes ambientales fundamentales
										de nuestra nación para construir muros
										fronterizos ineficaces que matan la vida
										silvestre», dice Laiken Jordahl, del Centro
										para la Diversidad Biológica. Además de
										las críticas por los posibles daños al
										medioambiente, otros analistas han alertado
										de varias ciudades estadounidenses que
										están enfrentando graves problemas por la
										afluencia de migrantes. Por su parte, el
										congresista demócrata Henry Cuéllar, de un
										distrito fronterizo de Texas, dijo en sus
										redes sociales: «Un muro fronterizo es una
										solución del siglo XIV a un problema del
										siglo XXI».
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

export default Semana6Unidad4Screen