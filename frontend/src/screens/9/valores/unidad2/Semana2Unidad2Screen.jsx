import React, { useState, useRef, useEffect } from 'react'
import Sidebar from '../../../../components/Sidebar'
import Header from '../../../../components/Header'
import '../../../../App.css'

function Semana2Unidad2Screen () {
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
				const response = await fetch('/unidad2Semana2.vtt')
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
										Unidad 2 · Semana 2
									</h1>
									<h2 className='unidad-subtitle'>
										La población del mundo: factores que
										intervienen en su concentración
									</h2>
									
								</div>

								<section>
									<h3 className='unidad-section-title'>
										Distribución de la población mundial
									</h3>
									<p className='unidad-paragraph'>
										A nivel mundial, las poblaciones se
										distribuyen de manera desigual:
										algunos lugares están densamente
										poblados, mientras que otros se
										encuentran escasamente habitados.
									</p>
									<p className='unidad-paragraph'>
										Las áreas donde se concentra la
										mayoría de población suelen ser las
										zonas costeras, las planicies y los
										valles, donde hay acceso a recursos
										hídricos, el clima es cálido y las
										tierras fértiles.
									</p>
									<p className='unidad-paragraph unidad-paragraph-bottom'>
										Las áreas poco pobladas suelen ser
										desiertos, regiones montañosas,
										tundras y selvas densas, donde las
										condiciones ambientales son menos
										propicias para la vida humana.
									</p>

									<p className='unidad-paragraph'>
										Por lo anterior, los patrones de
										distribución poblacional, que son
										aglomeración, segregación
										socioespacial y dispersión, son
										fundamentales para comprender la
										dinámica y la distribución de la
										población a nivel mundial.
									</p>

									<div className='unidad-info-box'>
										<p className='unidad-info-title'>
											Conexión geográfica
										</p>
										<p className='unidad-info-text'>
											La densidad poblacional indica si
											la población está concentrada o
											dispersa. Se calcula dividiendo la
											población total entre la superficie
											territorial, expresando el
											resultado en habitantes por
											kilómetro cuadrado (hab/km²).
										</p>
									</div>
								</section>

								<section>
									<h3 className='unidad-section-title'>
										Patrones de distribución
										poblacional: aglomeración,
										segregación socioespacial y
										dispersión
									</h3>

									<div className='unidad-regions-grid'>
										<div className='unidad-region-card blue'>
											<h4 className='unidad-region-title blue'>
												Aglomeración
											</h4>
											<p className='unidad-region-text'>
												Se refiere a la alta
												concentración de personas en un
												espacio determinado. Estas áreas
												suelen caracterizarse por una
												gran densidad poblacional y una
												intensa actividad económica, lo
												que a menudo conduce a la
												formación de ciudades o centros
												urbanos.
											</p>
											<p className='unidad-region-text'>
												En las aglomeraciones también
												influye la disponibilidad de
												recursos naturales y de
												servicios de primera necesidad,
												la ubicación estratégica y las
												oportunidades laborales y de
												desarrollo económico.
											</p>
										</div>

										<div className='unidad-region-card orange'>
											<h4 className='unidad-region-title orange'>
												Segregación socioespacial
											</h4>
											<p className='unidad-region-text'>
												Es la separación física y
												espacial de grupos sociales,
												con características
												socioeconómicas, culturales o
												étnicas diferentes, que
												comparten un mismo territorio.
											</p>
											<p className='unidad-region-text'>
												Usualmente se identifica por la
												creación de barrios o zonas
												homogéneas distintivas en
												términos de clase social o
												identidad cultural. Un ejemplo
												son las urbanizaciones privadas
												con acceso restringido,
												habitadas por grupos sociales de
												alto poder adquisitivo, y los
												barrios marginales, donde se
												concentra la población de bajos
												ingresos, vivienda precaria y
												menor acceso a servicios
												básicos de calidad.
											</p>
										</div>

										<div className='unidad-region-card green'>
											<h4 className='unidad-region-title green'>
												Dispersión
											</h4>
											<p className='unidad-region-text'>
												Es la distribución de la
												población en un territorio de
												forma amplia y poco densa. Las
												áreas con baja densidad de
												población y una distribución más
												dispersa suelen ser zonas
												rurales, áreas suburbanas o
												regiones menos desarrolladas.
											</p>
											<p className='unidad-region-text'>
												La dispersión se relaciona
												directamente con aspectos como
												la disponibilidad de recursos
												naturales, la topografía del
												terreno, las políticas de
												desarrollo regional y las
												preferencias individuales de
												vivienda.
											</p>
										</div>
									</div>
								</section>

								<section>
									<h3 className='unidad-section-title'>
										Factores que generan aglomeración,
										segregación y dispersión
										poblacional
									</h3>
									<p className='unidad-paragraph'>
										Al analizar la distribución de la
										población mundial, es importante
										comprender estos patrones de
										distribución poblacional y las
										diferentes variables que los
										producen, como las condiciones
										económicas, las políticas públicas,
										las características geográficas y los
										factores culturales, para identificar
										los desafíos a los que se enfrentan
										las poblaciones actuales y buscar
										soluciones que fomenten un desarrollo
										sostenible e inclusivo.
									</p>

									<div className='unidad-doc-box'>
										<p className='unidad-doc-kicker'>
											Factores que inciden en cada patrón
										</p>
										<p className='unidad-doc-text'>
											Los factores que inciden en la
											forma­ción de aglomeraciones se
											relacionan con el acceso a
											servicios básicos y la variedad de
											oportunidades laborales, que
											conducen a altos índices de
											migración desde las zonas rurales.
										</p>
										<p className='unidad-doc-text'>
											Las problemáticas más comunes son
											la contaminación ambiental, la
											congestión urbana y la
											sobreexplotación de recursos
											naturales.
										</p>
										<p className='unidad-doc-text'>
											La segregación socioespacial está
											vinculada con las desigualdades
											económicas: ingresos altos llevan a
											vecindarios seguros y servicios de
											calidad, mientras que bajos
											ingresos resultan en áreas
											desfavorecidas y servicios
											deficientes. A esto se suma la
											discriminación étnica.
										</p>
										<p className='unidad-doc-text'>
											Algunos factores que inciden en la
											dispersión poblacional son los
											conflictos armados, la persecución
											religiosa o étnica, los desastres
											naturales, el agotamiento de los
											recursos y las crisis económicas,
											que obligan a las personas a
											desplazarse de sus hogares y a
											dispersarse.
										</p>
									</div>
								</section>

								<section>
									<h3 className='unidad-section-title'>
										Patrones de distribución de la
										población a escala mundial y en
										América
									</h3>
									<p className='unidad-paragraph'>
										En las últimas décadas se ha
										incrementado la concentración de
										población en las zonas urbanas; a su
										vez, estas aglomeraciones conducen a
										otras problemáticas relacionadas con
										la segregación socioespacial, que
										aumenta la brecha de desigualdad.
									</p>
									<p className='unidad-paragraph unidad-paragraph-bottom'>
										Por otra parte, situaciones
										multicausales, como conflictos
										bélicos, crisis ambientales y
										agotamiento de recursos, han generado
										la dispersión poblacional en varias
										regiones alrededor del mundo.
									</p>

									<div className='unidad-doc-box'>
										<p className='unidad-doc-kicker'>
											Mapa — Patrones de distribución a
											escala mundial
										</p>
										<p className='unidad-doc-text'>
											Mapa con las mayores áreas urbanas
											del mundo, zonas de concentración
											de la población, ciudades y vacíos
											demográficos.
										</p>
									</div>

									<p className='unidad-paragraph'>
										En América, algunas ciudades
										latinoamericanas, como Ciudad de
										México, São Paulo y Buenos Aires,
										sufren problemas de densidad urbana.
										La alta concentración de población
										genera desafíos en transporte,
										vivienda, servicios públicos e
										infraestructura, lo que impacta
										negativamente en la calidad de vida
										de sus habitantes.
									</p>
									<p className='unidad-paragraph unidad-paragraph-bottom'>
										Por otra parte, la desigualdad en
										Brasil genera segregación espacial,
										que se visibiliza en las favelas. En
										las grandes ciudades de Estados
										Unidos se realizan prácticas
										discriminatorias que contribuyen a la
										segregación espacial de las
										comunidades.
									</p>
								</section>

								<section>
									<h3 className='unidad-section-title'>
										Patrones de distribución poblacional
										en Europa, África y Asia
									</h3>
									<p className='unidad-paragraph'>
										En Europa, más de la mitad de la
										población vive en zonas urbanas,
										mientras que las zonas rurales están
										experimentando un alto porcentaje de
										despoblamiento. Las ciudades están
										segmentadas, ya que los barrios se
										dividen en ricos y pobres, con escasa
										interacción social.
									</p>
									<p className='unidad-paragraph'>
										Las ciudades africanas densamente
										pobladas experimentan dificultades por
										la aglomeración: congestión
										vehicular, escasez de vivienda,
										sobrecarga de servicios públicos y
										deterioro ambiental. A su vez, la
										desigualdad económica, la marginación
										social, la violencia y la falta de
										cohesión social son problemas de
										segregación que impactan
										negativamente en la calidad de vida
										de sus habitantes.
									</p>
									<p className='unidad-paragraph unidad-paragraph-bottom'>
										En el sudeste asiático se presenta una
										distribución poblacional con fuertes
										contrastes: las zonas costeras están
										densamente pobladas, mientras que el
										interior de los países está
										despoblado. En Indonesia, más de la
										mitad de la población vive en Java,
										mientras otras islas permanecen
										deshabitadas.
									</p>
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
											// src="/unidad2Semana2.mp4"   
											src="https://res.cloudinary.com/dutglmj02/video/upload/v1775580901/unidad2Semana2_h8xqev.mp4"     
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

export default Semana2Unidad2Screen
