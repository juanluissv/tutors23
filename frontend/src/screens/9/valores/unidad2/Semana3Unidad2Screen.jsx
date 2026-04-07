import React, { useState, useRef, useEffect } from 'react'
import Sidebar from '../../../../components/Sidebar'
import Header from '../../../../components/Header'
import '../../../../App.css'

function Semana3Unidad2Screen () {
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
		setIsSidebarOpen(!isSidebarOpen)
	}

	useEffect(() => {
		const loadVTT = async () => {
			try {
				const response = await fetch('/unidad2Semana3.vtt')
				const vttText = await response.text()
				const cues = parseVTT(vttText)

				const filteredCues = cues.filter(
					cue =>
						!cue.text.includes('TurboScribe') &&
						!cue.text.includes('Go Unlimited'),
				)

				setAllCues(filteredCues)
				console.log(`Loaded ${filteredCues.length} subtitle cues`)
			} catch (error) {
				console.error('Error loading VTT:', error)
			}
		}

		loadVTT()
	}, [])

	const parseVTT = (vttText) => {
		const lines = vttText.split('\n')
		const cues = []
		let i = 0

		while (i < lines.length) {
			const line = lines[i].trim()

			if (line === 'WEBVTT' || line === '' || /^\d+$/.test(line)) {
				i++
				continue
			}

			if (line.includes('-->')) {
				const [startTime, endTime] = line
					.split('-->')
					.map(t => t.trim())
				const start = parseTime(startTime)
				const end = parseTime(endTime)

				i++
				let text = ''
				while (
					i < lines.length &&
					lines[i].trim() !== '' &&
					!lines[i].includes('-->')
				) {
					text += lines[i].trim() + ' '
					i++
				}

				cues.push({ start, end, text: text.trim() })
			} else {
				i++
			}
		}

		return cues
	}

	const parseTime = (timeString) => {
		const parts = timeString.split(':')
		if (parts.length === 3) {
			const hours = parseFloat(parts[0])
			const minutes = parseFloat(parts[1])
			const seconds = parseFloat(parts[2])
			return hours * 3600 + minutes * 60 + seconds
		}
		return 0
	}

	const handleTimeUpdate = (currentTime) => {
		if (allCues.length === 0) return

		const currentCue = allCues.find(
			cue => currentTime >= cue.start && currentTime < cue.end,
		)

		if (currentCue && currentCue.text !== activeText) {
			setActiveText(currentCue.text)
			highlightMatchingText(currentCue.text)
		} else if (!currentCue && activeText) {
			setActiveText('')
			clearHighlights()
		}
	}

	const highlightMatchingText = (cueText) => {
		clearHighlights()

		if (!contentRef.current) return

		const textElements = contentRef.current.querySelectorAll(
			'p, h2, h3, h4',
		)
		const searchText = cueText.toLowerCase().trim()

		textElements.forEach(element => {
			const elementText = element.textContent.toLowerCase()

			if (
				searchText.length > 20 &&
				elementText.includes(searchText.substring(0, 30))
			) {
				element.classList.add('karaoke-active')
				element.scrollIntoView({ behavior: 'smooth', block: 'center' })
			}
		})
	}

	const clearHighlights = () => {
		if (!contentRef.current) return
		const highlighted = contentRef.current.querySelectorAll(
			'.karaoke-active',
		)
		highlighted.forEach(el => el.classList.remove('karaoke-active'))
	}

	const handleClassVideoToggle = () => {
		if (!classVideoRef.current) return

		if (classVideoRef.current.paused || classVideoRef.current.ended) {
			classVideoRef.current.play()
			setIsClassVideoPlaying(true)
		} else {
			classVideoRef.current.pause()
			setIsClassVideoPlaying(false)
		}
	}

	const adjustQuestionTextareaHeight = (el) => {
		if (!el) return
		el.style.height = 'auto'
		const minH = 52
		const maxH = 200
		el.style.height =
			Math.min(Math.max(el.scrollHeight, minH), maxH) + 'px'
	}

	const handleQuestionChange = (e) => {
		setQuestionText(e.target.value)
		adjustQuestionTextareaHeight(e.target)
	}

	const handleSendQuestion = () => {
		if (!questionText.trim()) {
			return
		}

		if (classVideoRef.current) {
			classVideoRef.current.pause()
			setIsClassVideoPlaying(false)
		}

		const params = new URLSearchParams()
		params.set('query', questionText.trim())

		window.open(`/?${params.toString()}`, '_blank')
		setQuestionText('')
		if (questionTextareaRef.current) {
			questionTextareaRef.current.style.height = '52px'
		}
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
								<div className='semana1-text-shift'>
								<div className='unidad-header'>
									
									<h1 className='unidad-title'>
										Unidad 2 · Semana 3
									</h1>
									<h2 className='unidad-subtitle'>
										Recursos naturales: protección por
										medio de iniciativas sociales
									</h2>
									
								</div>

								<section>
									<h3 className='unidad-section-title'>
										Ambiente y conflictos bélicos
									</h3>

									<div className='unidad-doc-box'>
										<p className='unidad-doc-kicker'>
											Doc. 1 — Ambiente y conflictos
											bélicos
										</p>
										<p className='unidad-doc-text'>
											Al revisar las causas y los
											peligros de la perturbación de los
											ecosistemas, los científicos rara
											vez se refieren a la guerra y a los
											conflictos bélicos. Sin embargo,
											sus efectos pueden ser devastadores
											para las poblaciones silvestres y
											para ambientes ya amenazados, como
											los bosques tropicales.
										</p>
										<p className='unidad-doc-text'>
											Se estima que han ocurrido 160
											guerras en los últimos 60 años, la
											mayoría de las cuales han sido
											conflictos bélicos regionales entre
											varias facciones políticas,
											religiosas, tribales o étnicas,
											más que guerras entre naciones.
										</p>
										<p className='unidad-doc-footer'>
											Fuente: Chivian, E., Bernstein, A.
											(2015). Preservar la vida: De cómo
											nuestra salud depende de la
											biodiversidad. Fondo de Cultura
											Económica.
										</p>
									</div>
								</section>

								<section>
									<h3 className='unidad-section-title'>
										El impacto de los conflictos en el
										ambiente
									</h3>
									<p className='unidad-paragraph'>
										Los conflictos, ya sean guerras,
										disputas territoriales, pugnas por
										recursos naturales o actividades
										productivas como la minería y la
										extracción de recursos, tienen
										consecuencias políticas, económicas y
										sociales innegables. Sin embargo,
										muchas veces las consecuencias
										ambientales que dichos conflictos
										ejercen sobre los diferentes
										ecosistemas pasan desapercibidas.
									</p>
									<p className='unidad-paragraph'>
										Las consecuencias ambientales pueden
										catalogarse como directas e
										indirectas. Entre ellas se pueden
										destacar: la contaminación del agua,
										la generación de residuos
										potencialmente tóxicos, la disminución
										de flora y fauna silvestre, la
										deforestación y la contaminación de
										los suelos, entre otras.
									</p>
									<p className='unidad-paragraph unidad-paragraph-bottom'>
										Es importante analizar estas
										consecuencias para generar acciones
										que garanticen a la población los
										recursos necesarios para una vida
										digna, además de proteger los
										ecosistemas del mundo.
									</p>

									<div className='unidad-doc-box'>
										<p className='unidad-doc-kicker'>
											Casos de impacto ambiental por
											conflictos
										</p>
										<p className='unidad-doc-text'>
											Vietnam: durante la guerra se
											vertieron grandes cantidades de
											químicos tóxicos en bosques y áreas
											de cultivo, afectando también a
											países vecinos.
										</p>
										<p className='unidad-doc-text'>
											República Democrática del Congo:
											las consecuencias ambientales del
											conflicto armado incluyeron la
											contaminación del agua, la
											disminución de la vida silvestre,
											la pérdida de ecosistemas, la
											sobreexplotación de recursos
											naturales y la disminución
											significativa de las poblaciones de
											gorilas, además de la suspensión de
											programas de investigación y
											conservación.
										</p>
									</div>

									<div className='unidad-info-box'>
										<p className='unidad-info-title'>
											Conexión geográfica
										</p>
										<p className='unidad-info-text'>
											El 6 de noviembre se conmemora el
											Día Internacional para la
											Prevención de la Explotación del
											Ambiente en la Guerra y los
											Conflictos Armados.
										</p>
									</div>

									<div className='unidad-info-box'>
										<p className='unidad-info-title'>
											Glosario
										</p>
										<p className='unidad-info-text'>
											Directas: acciones realizadas de
											manera intencionada contra el
											ambiente; algunos especialistas
											usan el término «ecocidio».
										</p>
										<p className='unidad-info-text'>
											Indirectas: acciones no
											intencionadas a causar daño al
											ambiente, pero que tienen
											secuelas.
										</p>
										<p className='unidad-info-text'>
											Ecocidio: destrucción del ambiente
											con objetivos militares o cualquier
											acto ilícito realizado con
											conocimiento del daño que causa al
											ambiente.
										</p>
									</div>
								</section>

								<section>
									<h3 className='unidad-section-title'>
										Relación entre los conflictos y el
										ambiente
									</h3>
									<p className='unidad-paragraph'>
										Para comprender la magnitud y los
										diferentes matices que los conflictos
										infli­gen sobre el ambiente se puede
										tomar como referencia el esquema de
										los bucles de degradación ecológica.
									</p>
									<p className='unidad-paragraph unidad-paragraph-bottom'>
										Este bucle inicia desde el conflicto
										mismo, que puede tener diversas
										causas. Una vez que ha iniciado, es
										muy probable que vaya en escalada,
										incrementando sus consecuencias. Estas
										acciones generan la degradación de los
										recursos, propician la escasez de
										recursos ambientales y ocasionan
										estrés ambiental, con consecuencias
										económicas, sociales, demográficas y
										políticas que se suman a los
										conflictos.
									</p>

									<div className='unidad-doc-box'>
										<p className='unidad-doc-kicker'>
											Doc. 2 — Bucle de la degradación
											ecológica a causa de los conflictos
										</p>
										<p className='unidad-doc-text'>
											Esquema que muestra la relación
											entre conflictos sociales,
											degradación de recursos,
											escasez de recursos ambientales,
											estrés ambiental y sus
											consecuencias económicas, sociales,
											demográficas y políticas.
										</p>
										<p className='unidad-doc-footer'>
											Fuente: López Altamirano, D. E.
											Efectos de los conflictos armados
											en la conservación de los gorilas.
										</p>
									</div>

									<div className='unidad-info-box'>
										<p className='unidad-info-title'>
											Glosario
										</p>
										<p className='unidad-info-text'>
											Bucle: proceso que se repite de
											forma indefinida.
										</p>
										<p className='unidad-info-text'>
											Antropogénico: acción que procede
											de los seres humanos y que tiene
											efectos en el ambiente.
										</p>
									</div>
								</section>

								<section>
									<h3 className='unidad-section-title'>
										Iniciativas sociales para la
										protección del ambiente en contextos
										de conflictos
									</h3>
									<p className='unidad-paragraph'>
										En los contextos de conflicto es
										importante abordar la legislación
										internacional relativa a estas
										problemáticas, porque existen
										mecanismos legales que amparan tanto
										a las personas como al
										medioambiente durante situaciones de
										conflicto.
									</p>
									<p className='unidad-paragraph unidad-paragraph-bottom'>
										Entre los principales instrumentos
										legales de derecho internacional para
										estas situaciones destacan, entre
										otros: la Convención sobre la
										Prohibición de Utilizar Técnicas de
										Modificación con Fines Militares u
										otros Fines Hostiles (ENMOD), las
										convenciones de La Haya de 1907, la
										Convención para la Protección de los
										Bienes Culturales en Caso de
										Conflicto Armado (1954) y el
										Convenio de Ginebra sobre la
										Protección de Personas Civiles en
										Tiempo de Guerra (1949).
									</p>

									<p className='unidad-paragraph'>
										Las normativas muchas veces no
										garantizan la protección total del
										ambiente en situaciones de
										conflictos. Sin embargo, es
										fundamental conocer el respaldo legal
										que ofrecen tanto para el ambiente y
										los recursos como para la población.
									</p>
									<p className='unidad-paragraph unidad-paragraph-bottom'>
										Asimismo, existen iniciativas por
										parte de la población civil afectada
										que buscan contrarrestar el daño al
										ambiente y generar conciencia del
										impacto de los conflictos.
									</p>

									<div className='unidad-doc-box'>
										<p className='unidad-doc-kicker'>
											Iniciativas destacadas
										</p>
										<p className='unidad-doc-text'>
											Colombia: «Siembra tu árbol por la
											paz» visibiliza al medioambiente
											como víctima de los conflictos
											armados, incluye campamentos de
											concientización sobre las causas y
											consecuencias del conflicto, con
											énfasis en el componente
											ambiental.
										</p>
										<p className='unidad-doc-text'>
											Indonesia: durante el conflicto,
											la agricultura fue uno de los
											sectores más afectados por el
											acceso limitado a sembradíos. Las
											mujeres de las regiones afectadas
											empezaron a realizar cultivos de
											subsistencia.
										</p>
										<p className='unidad-doc-text'>
											Sudán: iniciativas locales e
											internacionales involucraron a
											mujeres y jóvenes para la gestión
											de recursos naturales, incluyendo
											capacitaciones sobre resolución de
											conflictos y gobernanza ambiental.
										</p>
									</div>
								</section>

								<section>
									<h3 className='unidad-section-title'>
										La gobernanza para la construcción de
										la paz y procesos de justicia
									</h3>
									<p className='unidad-paragraph'>
										Las iniciativas ciudadanas por la paz
										y el medioambiente deben trascender y
										convertirse en proyectos sostenibles.
										Es crucial enfocarse en prevenir
										conflictos futuros y considerar al
										medioambiente como un tema central en
										la construcción de paz, involucrando
										a más sectores y organismos en la
										toma de decisiones.
									</p>
									<p className='unidad-paragraph'>
										La gobernanza ambiental es clave para
										lograr consensos informados entre la
										población civil, el Estado y
										organizaciones privadas. Involucra la
										construcción de infraestructura,
										actividades sostenibles y una
										distribución equitativa de recursos,
										así como mecanismos legales que
										protejan el medioambiente y los
										derechos humanos.
									</p>
									<p className='unidad-paragraph unidad-paragraph-bottom'>
										Al terminar un conflicto es necesario
										establecer procesos de justicia,
										identificar las causas que originaron
										los conflictos y definir mecanismos
										de reparación a las víctimas,
										vinculando la gobernanza ambiental
										para el desarrollo sostenible de las
										regiones afectadas.
									</p>

									<div className='unidad-doc-box'>
										<p className='unidad-doc-kicker'>
											Doc. 3 — La gobernanza ambiental
										</p>
										<p className='unidad-doc-text'>
											La gobernanza ambiental se refiere
											a los procesos de toma de decisión
											y de ejercicio de autoridad en el
											ámbito de bienes públicos, en los
											cuales intervienen los servicios
											gubernamentales en sus distintos
											niveles e instancias de decisión,
											así como otras partes interesadas
											de la sociedad civil y empresas.
										</p>
										<p className='unidad-doc-text'>
											Este concepto transmite la idea de
											que la gestión ya no es un
											monopolio exclusivo del gobierno,
											sino que incluye a otros actores
											que participan en la fijación de
											marcos regulatorios y límites al
											uso de los recursos naturales y de
											los ecosistemas.
										</p>
										<p className='unidad-doc-footer'>
											Fuente: Delgado, L.; Bachmann, P.;
											Oñate, B. (2007). Gobernanza
											ambiental: una estrategia orientada
											al desarrollo sustentable local.
										</p>
									</div>
								</section>
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
											// src="/unidad2Semana3.mp4"     
											src="https://res.cloudinary.com/dutglmj02/video/upload/v1775580905/unidad2Semana3_thg91t.mp4"     
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
		</div>
	)
}

export default Semana3Unidad2Screen
