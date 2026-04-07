import React, { useState, useRef, useEffect } from 'react'
import Sidebar from '../../../../components/Sidebar'
import Header from '../../../../components/Header'
import '../../../../App.css'

function Semana4Unidad4Screen () {
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
                const response = await fetch('/unidad4Semana4.vtt');
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
										Unidad 4 · Semana 4
									</h1>
									<h2 className='unidad-subtitle'>
										Muros, límites y fronteras: el Muro de
										Berlín
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
										El muro que dividió a Berlín
									</h3>
								</section>

								<div className='unidad-doc-box'>
									<p className='unidad-doc-kicker'>Doc. 1</p>
									<p className='unidad-doc-text'>
										Desde la madrugada del 13 de agosto de 1961 se
										comenzó a construir un muro de cuatro metros de
										alto y 45 kilómetros de largo, que dividió
										definitivamente a la ciudad y al mundo en dos
										bloques antagónicos. En el paso fronterizo de
										Check Point Charlie, tanques americanos y
										soviéticos se apostaron uno frente al otro, en
										plena línea divisoria y listos para atacarse.
										Los soldados se veían a los ojos. En la acera de
										enfrente, cruzando la calle, estaba el enemigo
										de Estado o el enemigo de clase social, así es
										como se decían unos a otros, respectivamente.
									</p>
									<p className='unidad-doc-text'>
										Las personas se acercaban al muro atónitos, no
										lo podían creer, con lágrimas se despedían de los
										amigos, hijos, abuelos, padres, sobrinos, nietos,
										en fin… Las familias quedaron mutiladas. En la
										República Democrática de Alemania (RDA) no había
										permisos de visita, ni visados, nadie que fuera
										alemán podía pasar por esta ciudad de cualquier
										lado al otro, el muro era inexpugnable legalmente
										hablando, pero por túneles hubo fugas, escondidos
										en autos o maletas, bajo el agua o sobre las
										nubes, la creatividad hizo su aparición para que
										occidente se pudiera alcanzar. Chocaron entre sí
										el mundo occidental y el oriental, precisamente
										ahí tan directa y violentamente como en ningún
										otro lugar.
									</p>
									<p className='unidad-doc-footer'>
										El muro que dividió a Berlín
									</p>
									<p className='unidad-doc-footer'>
										Fuente: Zarazúa, E. (2018). Berlín: antes,
										durante y después del Muro.
									</p>
								</div>

								<section>
									<h3 className='unidad-section-title'>
										División de Alemania entre las potencias
										vencedoras
									</h3>
									<p className='unidad-paragraph'>
										En 1945, las fuerzas aliadas dividieron
										Alemania entre Gran Bretaña, Estados Unidos,
										Francia y la URSS. Berlín, la capital, quedó en
										la zona soviética, siendo dividida en cuatro
										sectores.
									</p>
									<p className='unidad-paragraph'>
										Tres años más tarde, EE. UU., Francia y Gran
										Bretaña unieron sus sectores, formando la
										República Federal de Alemania (RFA), en mayo de
										1949. La URSS, por su parte, estableció la
										República Democrática Alemana (RDA), en octubre
										del mismo año. El territorio alemán quedó
										dividido de la siguiente manera:
									</p>
									<p className='unidad-paragraph'>
										Después de la división de Berlín se estableció un
										paso militarizado que conectaba los sectores
										oriental y occidental de la ciudad. Este
										permanecía abierto para permitir la circulación de
										personas entre ambos lados de la ciudad.
									</p>
									<p className='unidad-paragraph unidad-paragraph-bottom'>
										Con el tiempo, las disparidades entre ambas zonas
										se intensificaron. Mientras que la RFA tenía
										altos estándares de vida y progreso, su
										contraparte en la Alemania oriental veía
										estancadas sus oportunidades de desarrollo. Esta
										brecha provocó que, para 1960, muchos ciudadanos
										de la RDA escaparan hacia el lado occidental
										buscando mejorar sus condiciones de vida.
									</p>
								</section>

								<div className='unidad-info-box'>
									<p className='unidad-info-title'>
										Profundización
									</p>
									<p className='unidad-info-text'>
										El Muro de Berlín, una frontera casi
										inexpugnable (inquebrantable)
									</p>
								</div>

								<p className='unidad-paragraph'>
									En la web En la web En la web
								</p>

								<div className='unidad-info-box'>
									<p className='unidad-info-title'>Glosario</p>
									<p className='unidad-info-text'>
										<strong>Disparidad.</strong> Diferencia o
										desigualdad notable entre dos o más elementos.
									</p>
								</div>

								<section>
									<h3 className='unidad-section-title'>
										La construcción del Muro de Berlín
									</h3>
									<p className='unidad-paragraph unidad-paragraph-bottom'>
										En junio de 1961, el líder comunista de Berlín
										oriental, Walter Ulbricht, negó en conferencia de
										prensa cualquier intención de levantar un muro
										fronterizo. Sin embargo, días después, se
										informaba sobre la colocación de bloques de
										hormigón en la frontera por parte de las
										autoridades de la RDA. Algunos de los aspectos más
										destacados acerca del Muro de Berlín son los
										siguientes.
									</p>
								</section>

								<div className='unidad-problem-grid'>
									<div className='unidad-problem-card'>
										<h4 className='unidad-problem-title'>
											Durante los 28 años de existencia del muro
										</h4>
										<p className='unidad-problem-text'>
											muchos lo cruzaron utilizando distintos
											métodos como la creación de túneles, la
											falsificación de documentos, escondites en
											vehículos, etc.
										</p>
									</div>
									<div className='unidad-problem-card'>
										<h4 className='unidad-problem-title'>
											En los días posteriores
										</h4>
										<p className='unidad-problem-text'>
											los berlineses se enfrentaron a la triste
											realidad de una barrera de ladrillos que los
											separaba de sus seres queridos al otrolado.
											Algunos lograron huir clandestinamente.
										</p>
									</div>
									<div className='unidad-problem-card'>
										<h4 className='unidad-problem-title'>
											En la noche del 13 de agosto de 1961
										</h4>
										<p className='unidad-problem-text'>
											se erigieron barricadas y se interrumpieron
											las comunicaciones entre las secciones
											oriental y occidental de Alemania. Desde el 18
											de agosto, más de 40 000 soldados de la RDA
											comenzaron la construcción del muro.
										</p>
									</div>
									<div className='unidad-problem-card'>
										<h4 className='unidad-problem-title'>
											La construcción de un muro de hormigón
										</h4>
										<p className='unidad-problem-text'>
											de 47 km y cuatro metros de altura dividió las
											vidas y las comunidades vecinas,
											extendiéndose eventualmente a 169 km en total.
										</p>
									</div>
								</div>

								<section>
									<h3 className='unidad-section-title'>
										La República Democrática Alemana (RDA) y sus
										características
									</h3>
									<p className='unidad-paragraph unidad-paragraph-bottom'>
										La República Democrática Alemana (RDA), fundada
										en 1949, representó un experimento social y
										político único en la historia europea (Doc. 2).
										Durante sus 41 años de existencia, la RDA se
										caracterizó por un sistema socialista que moldeó
										profundamente la vida cotidiana de sus
										ciudadanos. Los principios socialistas de gobierno
										de la RDA, como los de todos los países bajo el
										bloque soviético, se basaron en una serie de ideas
										que pretendían establecer una sociedad más
										igualitaria y justa, con un enfoque en el
										bienestar colectivo sobre el individual, las
										cuales fueron:
									</p>
									<p className='unidad-paragraph unidad-paragraph-bottom'>
										En la práctica, la implementación del socialismo
										como forma de gobierno en la RDA se enfrentó a
										numerosas contradicciones, pues si bien la
										sociedad se estructuraba en torno a los principios
										comunistas de igualdad y solidaridad, en la
										realidad existían diferencias en cuanto al acceso
										a la educación, la vivienda y los bienes de
										consumo. Sumado a esto, la élite del partido y sus
										allegados disfrutaban de privilegios que no
										estaban al alcance del resto de la población.
									</p>
								</section>

								<div className='unidad-doc-box'>
									<p className='unidad-doc-kicker'>Doc. 2</p>
									<p className='unidad-doc-text'>
										El nuevo país se definía como un Estado obrero y
										campesino, y el poder político estaba en manos de
										la clase trabajadora y su partido principal, el
										Partido Socialista Unificado (SED). La formación
										del «Frente Nacional», una plataforma de partidos
										y organizaciones de masas, garantizaba la
										participación de todos los grupos sociales en los
										procesos políticos. La primera constitución de la
										RDA puso en manos de la clase obrera y sus aliados
										el ejercicio del poder público, suprimió los
										monopolios y los latifundios, creó las bases de una
										economía colectivizada, declaró el derecho de todos
										los ciudadanos al trabajo y a la educación y la
										igualdad de la mujer. El compromiso con la paz y la
										amistad entre los pueblos se convirtió en el
										principio fundamental de la política estatal. El
										himno nacional del nuevo país rezaba así:
										Resurgidos de entre las ruinas / con la vista
										puesta en el futuro / … Todo el mundo anhela la paz
										/ tendedle vuestra mano a los pueblos.
									</p>
									<p className='unidad-doc-footer'>
										El establecimiento de la RDA
									</p>
									<p className='unidad-doc-footer'>
										Fuente: Instituto Tricontinental de Investigación
										Social (2021). Estudios sobre la RDA.
									</p>
								</div>

								<div className='unidad-problem-grid'>
									<div className='unidad-problem-card'>
										<h4 className='unidad-problem-title'>
											Bienestar social garantizado
										</h4>
										<p className='unidad-problem-text'>
											Se buscaba la construcción de una sociedad que
											se comprometiera con el bienestar social de sus
											ciudadanos, proporcionando acceso universal a
											servicios básicos como educación, salud y
											vivienda.
										</p>
									</div>
									<div className='unidad-problem-card'>
										<h4 className='unidad-problem-title'>
											Propiedad colectiva de los medios de
											producción
										</h4>
										<p className='unidad-problem-text'>
											Los recursos y los medios de producción, como
											fábricas, tierras y empresas, pasaron a ser
											propiedad del Estado o de la comunidad en su
											conjunto, para distribuir de manera más
											equitativa la riqueza.
										</p>
									</div>
									<div className='unidad-problem-card'>
										<h4 className='unidad-problem-title'>
											Planificación económica centralizada
										</h4>
										<p className='unidad-problem-text'>
											La producción y la distribución de los bienes y
											los servicios eran actividades planificadas por
											el Estado para garantizar que las necesidades
											básicas de todos los ciudadanos fueran
											atendidas.
										</p>
									</div>
								</div>

								<p className='unidad-paragraph'>
									Por otra parte, la libertad de expresión y otros
									derechos individuales estaban restringidos, y la
									vigilancia estatal era omnipresente. Las actividades
									culturales y de ocio estaban controladas por el
									Estado, y la propaganda comunista permeaba muchos
									aspectos de la vida cotidiana. La Stasi, la policía
									secreta de la RDA, ejercía control y vigilancia
									constante para impedir cualquier situación que
									pusiera en riesgo la estabilidad del sistema
									soviético.
								</p>
								<p className='unidad-paragraph unidad-paragraph-bottom'>
									Al no poder cumplir con la promesa de una vida mejor,
									el régimen de la RDA comenzó a perder la confianza de
									su población, por lo que cientos de residentes de la
									RDA buscaron salir hacia la RFA, lo que llevó a las
									autoridades a desplegar tropas del Ejército Nacional
									Popular (Doc. 3).
								</p>

								<div className='unidad-doc-box'>
									<p className='unidad-doc-kicker'>
										Doc. 3 La vida en la Republica Democrática de
										Alemania
									</p>
									<p className='unidad-doc-text'>
										La Alexanderplatz (Plaza Alexander) fue uno de los
										espacios públicos más importantes de Berlín
										Oriental.
									</p>
									<p className='unidad-doc-text'>
										Para los fugitivos de la RDA, la primera oleada de
										alivio había pasado ya. Ahora tenían que contemplar
										un futuro incierto, sin trabajo y sin apenas
										familia cercana al otro lado del muro. A pesar de
										todas sus quejas del sistema comunista, este
										atendía sus necesidades médicas básicas y les
										ofrecía cuidados infantiles gratuitos. En el este,
										la comida era escasa pero barata. También los
										alojamientos. ¿Y ahora, bajo el capitalismo? Era
										difícil decirlo.
									</p>
									<p className='unidad-doc-footer'>
										Fuente: Mitchell, G. (2017). Los túneles.
									</p>
									<p className='unidad-doc-text'>
										Luis Mazuze, originario de Mozambique, llegó a
										Alemania en 1986 en calidad de trabajador gracias a
										un convenio que existía entre la RDA y otros Estados
										socialistas, como Cuba, Vietnam y Argelia. «Yo viví
										15 años de capitalismo en Mozambique y cuando llegué
										aquí, nunca me hizo falta. En Alemania oriental vi
										muchas cosas buenas; en aquel sistema comunista, la
										gente le daba mucha más prioridad a tener una
										identidad y había mucha más solidaridad, también
										había menos racismo.»
									</p>
									<p className='unidad-doc-footer'>
										Fuente: Paredes, R. (2019). Los tiempos
										socialistas en la antigua RDA.
									</p>
								</div>

								<section>
									<h3 className='unidad-section-title'>
										La República Federal Alemana (RFA) y sus
										características
									</h3>
									<p className='unidad-paragraph'>
										La economía de la República Federal de Alemania
										(RFA) experimentó una rápida recuperación luego de
										los estragos de la Segunda Guerra Mundial,
										impulsada por la entrada de capitales gracias al
										Plan Marshall, el programa de inversiones
										estadounidense destinado a la reconstrucción de
										Europa. Este flujo de recursos permitió a la RFA
										convertirse en una ciudad próspera en poco tiempo.
									</p>
									<p className='unidad-paragraph'>
										Además de la reconstrucción económica, la RFA
										también se rearmó y reconstruyó sus fuerzas armadas.
										En 1955, se unió a la Organización del Tratado del
										Atlántico Norte (OTAN), lo que la posicionó como una
										avanzada estratégica para respaldar la hegemonía de
										Estados Unidos en Europa.
									</p>
									<p className='unidad-paragraph'>
										La rápida recuperación económica y la mejora en los
										estándares de vida en la RFA durante el período de
										reconstrucción no solo condujeron a una mayor
										estabilidad y prosperidad para la población, sino
										que también tuvieron un impacto significativo en los
										movimientos migratorios. El auge económico, la
										creación de empleo y el aumento de la producción
										industrial en sectores como la manufactura, el
										comercio y los servicios generaron una amplia oferta
										de oportunidades laborales y bienes de consumo.
										Como resultado, se observaron altos índices de
										migración, especialmente de personas provenientes de
										la RDA, donde las condiciones económicas y sociales
										eran menos favorables.
									</p>
									<p className='unidad-paragraph unidad-paragraph-bottom'>
										La construcción del muro de Berlín en agosto de 1961
										causó conmoción e indignación entre las potencias
										occidentales, lideradas por Estados Unidos, que
										condenaron enérgicamente este accionar y
										responsabilizaron a la Unión Soviética y al Gobierno
										de la República Democrática Alemana (RDA) de la
										violación de los derechos humanos (Doc. 4). También
										se llevaron a cabo protestas y manifestaciones frente
										a las embajadas soviéticas en todo el mundo.
									</p>
								</section>

								<div className='unidad-problem-grid'>
									<div className='unidad-problem-card'>
										<h4 className='unidad-problem-title'>
											Conexión histórica
										</h4>
										<p className='unidad-problem-text'>
											En 1949, Estados Unidos buscó fortalecer su
											seguridad mediante la creación de la Organización
											del Tratado del Atlántico Norte (OTAN). Esta
											agrupó en un bloque militar a naciones
											occidentales con el fin de defenderse en caso de
											un ataque por parte de la Unión Soviética o sus
											aliados.
										</p>
									</div>
								</div>

								<div className='unidad-doc-box'>
									<p className='unidad-doc-kicker'>Doc. 4</p>
									<p className='unidad-doc-text'>
										Hay mucha gente en el mundo que realmente no
										comprende o dice que no comprende cuál es la gran
										diferencia entre el mundo libre y el mundo
										comunista. Decidles que vengan a Berlín. Y hay
										algunos pocos que dicen que es verdad que el
										comunismo es un sistema diabólico pero que permite
										un progreso económico. Decidles que vengan a Berlín.
										La libertad tiene muchas dificultades y la democracia
										no es perfecta. Pero nosotros no tenemos que poner
										un muro para mantener a nuestro pueblo, para
										prevenir que ellos nos dejen […]. Mientras el muro
										es la más obvia y viva demostración del fracaso del
										sistema comunista, todo el mundo puede ver que no
										tenemos ninguna satisfacción en ello; para nosotros,
										como ha dicho el alcalde, es una ofensa no solo
										contra la historia, sino también una ofensa contra la
										humanidad, separando familias, dividiendo maridos y
										esposas y hermanos y hermanas y dividiendo a la
										gente que quiere vivir unida. ¿Cuál es la verdad de
										esta ciudad de Alemania? La paz real en Europa nunca
										puede estar asegurada mientras a un alemán de cada
										cuatro se le niega el elemental derecho de ser un
										hombre libre, y que pueda elegir un camino libre […].
									</p>
									<p className='unidad-doc-footer'>
										Discurso de Kennedy en su visita a Berlín occidental
									</p>
									<p className='unidad-doc-footer'>
										Fuente: Berlín, 11 de junio de 1963.
									</p>
								</div>

								<section>
									<h3 className='unidad-section-title'>
										Panorama socioeconómico de Berlín occidental
									</h3>
									<p className='unidad-paragraph'>
										El crecimiento económico, junto con las políticas
										sociales implementadas, aumentó la accesibilidad al
										consumo. En Estados Unidos, esta tendencia se
										promovió mediante la difusión del «estilo de vida
										americano», que se basaba en el acceso generalizado a
										una amplia gama de productos y en la expansión de los
										medios de comunicación de masas, especialmente
										enfocados en las nuevas tecnologías y la vida
										familiar. Los países bajo la autoridad de EE. UU.
										fueron en especial influenciados por el nuevo modelo
										a seguir, impulsado por las empresas multinacionales
										que buscaban aumentar la cantidad de consumidores de
										sus productos para incrementar sus márgenes de
										ganancia (Doc. 5).
									</p>
									<p className='unidad-paragraph unidad-paragraph-bottom'>
										En Berlín occidental, la mayor libertad política y
										económica se reflejaba en la posibilidad de
										participar en elecciones democráticas y en la
										existencia de un sistema de libre mercado. También
										contaba con servicios de salud y educación de mejor
										calidad que Berlín oriental, sin embargo, no toda la
										población podía acceder a ellos de forma gratuita.
										Por otro lado, la población se mantenía en un estado
										de alerta debido a la amenaza constante de
										intervención por parte de la Unión Soviética y la
										RDA, generando un clima de incertidumbre. Como la
										ciudad se encontraba aislada dentro de la Alemania
										oriental comunista, en varios momentos se presentaron
										dificultades en el comercio, el abastecimiento de
										productos, la comunicación y el libre tránsito de
										personas y bienes.
									</p>
								</section>

								<div className='unidad-doc-box'>
									<p className='unidad-doc-kicker'>
										Doc. 5 La economía capitalista
									</p>
									<p className='unidad-doc-footer'>
										Fuente: deuchlan.de. La economía capitalista.
									</p>
									<p className='unidad-doc-text'>
										El lema «You&apos;ve never had it so good!» (¡Nunca
										les fue mejor!), con el cual el primer ministro
										británico Harold Macmillan exhortó a sus compatriotas
										en 1957, era válido para gran parte de Europa
										occidental. A partir de los años cincuenta, el
										«milagro económico» trajo consigo una creciente
										prosperidad, pleno empleo y aumento de los salarios.
										La sociedad de consumo y el estado social se
										convirtieron en elementos estabilizadores no solo de
										la democracia de Alemania occidental.
									</p>
									<p className='unidad-doc-footer'>
										Berlín occidental (1960).
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

export default Semana4Unidad4Screen