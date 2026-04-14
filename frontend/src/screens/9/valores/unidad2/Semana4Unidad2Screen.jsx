import React, { useState, useRef, useEffect } from 'react'
import Sidebar from '../../../../components/Sidebar'
import Header from '../../../../components/Header'
import '../../../../App.css'

function Semana4Unidad2Screen () {
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
				const response = await fetch('/unidad2Semana4.vtt')
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
										Unidad 2 · Semana 4
									</h1>
									<h2 className='unidad-subtitle valores-semana1-subtitle'>
										Migraciones: conflictos en los
										territorios
									</h2>
								</div>

								<section>
									<h3 className='unidad-section-title'>
										Causas de la migración en los
										países de origen
									</h3>
									<p className='unidad-paragraph'>
										El estado actual de la migración a
										escala mundial está impulsado por
										una compleja combinación de
										factores en los países de origen,
										entre los que destacan:
									</p>
									<p className='unidad-paragraph'>
										Si bien las causas que motivan la
										migración son múltiples, en
										términos generales predominan las
										de carácter económico, que inducen a
										ciertos sectores de la población a
										migrar por las condiciones de
										desigualdad en las que se
										encuentran.
										También destacan las problemáticas
										relacionadas con los conflictos
										bélicos, la inestabilidad y la
										persecución política al interior de
										los países de origen (Doc. 1).
									</p>
								</section>

								<section>
									<h3 className='unidad-section-title'>
										Profundización
									</h3>

									<div className='unidad-problem-grid'>
										<div className='unidad-problem-card'>
											<h4 className='unidad-problem-title'>
												Causas sociopolíticas
											</h4>
											<p className='unidad-problem-text'>
												Las guerras civiles, la violencia
												social, el terrorismo, la
												discriminación por motivos étnicos,
												religiosos y políticos, los
												conflictos, entre otros factores,
												obligan a las personas a migrar de
												sus hogares y buscar refugio en
												otros países a causa de
												violaciones a sus derechos
												básicos.
											</p>
										</div>

										<div className='unidad-problem-card'>
											<h4 className='unidad-problem-title'>
												Causas económicas
											</h4>
											<p className='unidad-problem-text'>
												La falta de empleo, la pobreza
												extrema y la desigualdad económica
												son los motivos más frecuentes para
												tomar la decisión de migrar. Los
												habitantes de países en vías de
												desarrollo a menudo migran buscando
												mejores oportunidades económicas.
											</p>
										</div>

										<div className='unidad-problem-card'>
											<h4 className='unidad-problem-title'>
												Causas ambientales
											</h4>
											<p className='unidad-problem-text'>
												Los desastres naturales y el cambio
												climático, que está provocando
												eventos meteorológicos extremos
												(el aumento del nivel del mar, la
												sequía y la desertificación),
												desplazan a las personas de sus
												hogares y las conducen a migrar
												en busca de seguridad y mejores
												medios de vida.
											</p>
										</div>
									</div>

									<div className='unidad-doc-box'>
										<p className='unidad-doc-kicker'>
											Doc. 1 — Factores que influyen en la
											decisión de migrar
										</p>
										<p className='unidad-doc-text'>
											Las explicaciones que dan cuenta de
											los motivos de este fenómeno se
											vinculan con la falta de trabajo, la
											persecución político-ideológica, la
											inseguridad por la violencia, las
											guerras, la persecución étnico-
											religiosa, los problemas
											socioeconómicos, el mejoramiento de
											la calidad de vida, la búsqueda de
											desarrollo individual o familiar,
											oportunidades de empleo y educación,
											acceso a bienes y servicios, entre
											otras.
										</p>
										<p className='unidad-doc-footer'>
											Fuente: Aruj, V. (2008). Causas,
											consecuencias, efectos e impacto de
											las migraciones en Latinoamérica.
										</p>
									</div>
								</section>

								<section>
									<h3 className='unidad-section-title'>
										Migración: traslado regulado e
										irregulado
									</h3>

									<p className='unidad-paragraph'>
										Se estima que a escala mundial hay
										aproximadamente 280 millones de
										migrantes internacionales que poseen un
										estatus migratorio regular, lo que
										significa que han ingresado a otro país
										o permanecen en él siguiendo los canales
										legales establecidos.
									</p>
									<p className='unidad-paragraph'>
										Sin embargo, entre el 15 % y el 20 % de
										la población migrante, es decir, entre
										42 y 56 millones de personas, se
										encuentran en situación irregular.
									</p>
									<p className='unidad-paragraph'>
										Esta situación irregular se produce cuando
										una persona reside en un país del cual no
										es ciudadano infringiendo las leyes y
										regulaciones migratorias. Esto incluye:
									</p>

									<div className='unidad-info-box'>
										<p className='unidad-info-title'>En la web</p>
										<ul className='unidad-consolidation-list'>
											<li>
												Cruzar fronteras sin permisos legales
												ni autorizaciones migratorias previas.
											</li>
											<li>
												Utilizar métodos fraudulentos para obtener
												visas o permisos de residencia.
											</li>
											<li>
												Permanecer en un país después de que la
												autorización de entrada haya expirado.
											</li>
											<li>
												Carecer de la documentación necesaria para
												permanecer en el país de destino.
											</li>
										</ul>
									</div>
								</section>

								<section>
									<h3 className='unidad-section-title'>
										Desafíos migratorios que enfrentan los
										países de destino
									</h3>

									<p className='unidad-paragraph'>
										En términos generales, los migrantes
										eligen como país de destino un lugar que
										ofrezca mejores condiciones de vida o
										donde ya tengan establecidas redes de
										apoyo que les faciliten la integración
										social a su llegada.
									</p>
									<p className='unidad-paragraph'>
										Las naciones que encabezan la lista de
										principales destinos están enfrentando
										diversos desafíos para gestionar de manera
										adecuada el ingreso de migrantes, de forma
										particular para los que se encuentran en
										estatus irregular o indocumentado.
										Entre los principales problemas se incluyen:
									</p>
									<p className='unidad-paragraph'>
										La percepción de los migrantes como una
										amenaza es un fenómeno complejo y
										multifacético. Ante estas percepciones
										negativas, a menudo amplificadas por
										ideas discriminatorias que causan constantes
										problemas entre la población local y los
										inmigrantes en los países receptores, los
										Gobiernos deben incentivar programas de
										integración social (Doc. 2) para asegurar
										el bienestar de la población local y, a la
										vez, brindar acompañamiento a las
										poblaciones migrantes.
									</p>

									<div className='unidad-info-box'>
										<p className='unidad-info-title'>Glosario</p>
										<p className='unidad-info-text'>
											Xenofobia. Odio o rechazo a las personas
											extranjeras.
										</p>
									</div>

									<div className='unidad-doc-box'>
										<p className='unidad-doc-kicker'>Doc. 2</p>
										<p className='unidad-doc-text'>
											El estudio del SICA, la OIM y el ACNUR
											propone una serie de iniciativas específicas
											para la inclusión educativa. En primer lugar,
											la creación de unidades técnicas
											especializadas en los Ministerios de
											Educación para desarrollar mecanismos que
											respondan a las necesidades específicas
											(culturales, lingüísticas, etc.) de los
											estudiantes migrantes. En segundo lugar, la
											implementación de programas de enseñanza
											que contrarresten los prejuicios contra los
											inmigrantes, así como programas de
											transición, correctivos y de recuperación
											que evitan el abandono escolar. Los
											encargados de la toma de decisiones
											ministeriales, los encargados de formular
											políticas, el personal administrativo y los
											docentes también deben recibir
											capacitación sobre cómo ser inclusivos con
											los estudiantes inmigrantes y cómo
											establecer modelos de protección para los
											niños y adolescentes migrantes.
										</p>
										<p className='unidad-doc-footer'>
											Propuestas para la integración de los
											migrantes en Centroamérica. Fuente: OIM (s.f.)
										</p>
									</div>

									<div className='unidad-problem-grid'>
										<div className='unidad-problem-card'>
											<h4 className='unidad-problem-title'>Los conflictos sociales</h4>
											<p className='unidad-problem-text'>
												La llegada masiva de migrantes ejerce presión en
												sistemas públicos, especialmente en salud, educación
												y empleo, generando tensiones sociales y económicas
												debido al temor a la competencia por recursos y
												empleos.
											</p>
										</div>

										<div className='unidad-problem-card'>
											<h4 className='unidad-problem-title'>El acceso a servicios básicos</h4>
											<p className='unidad-problem-text'>
												Los migrantes en situación irregular se encuentran
												excluidos de servicios esenciales como atención
												médica, educación y vivienda adecuadas, situación
												que los vuelve vulnerables a la explotación, el
												abuso y la marginación social.
											</p>
										</div>

										<div className='unidad-problem-card'>
											<h4 className='unidad-problem-title'>Las prácticas y acciones discriminatorias</h4>
											<p className='unidad-problem-text'>
												En la mayoría de los países de destino, los migrantes
												enfrentan actitudes xenófobas y discriminatorias, lo
												que complica su integración en la sociedad y restringe
												sus oportunidades de crecimiento personal y
												profesional.
											</p>
										</div>

										<div className='unidad-problem-card'>
											<h4 className='unidad-problem-title'>
												La gestión adecuada de deportaciones y detenciones
											</h4>
											<p className='unidad-problem-text'>
												Los migrantes irregulares corren el riesgo de ser
												víctimas de detenciones arbitrarias y deportaciones
												forzosas, medidas que los exponen a muchos peligros
												y que, además, usualmente violentan sus derechos
												fundamentales.
											</p>
										</div>
									</div>
								</section>

								<section>
									<h3 className='unidad-section-title'>
										Conflictos generados por las migraciones en diferentes
										regiones
									</h3>

									<p className='unidad-paragraph'>
										Los conflictos a causa de las migraciones masivas están
										afectando a diversas regiones a nivel mundial. En América, la
										migración especialmente hacia Norteamérica ha aumentado
										significativamente en 2023. La Organización Internacional para
										las Migraciones (OIM) reportó un incremento del 62 % en la
										migración irregular en México durante los primeros ocho meses
										del año, comparado con el mismo período en 2022. Otras
										regiones de África y Medio Oriente experimentan desde hace
										años conflictos internos e inestabilidad política, causando
										situaciones de desplazamiento.
									</p>

									<p className='unidad-paragraph'>
										Los habitantes de varias naciones en estas zonas migran tanto al
										interior de sus países como hacia otros del mismo continente o
										de Europa en busca de seguridad. Otras regiones de África y
										Medio Oriente, desde hace varios años experimentan conflictos
										internos y e inestabilidad política lo que ha generado graves
										situaciones de desplazamiento. Los habitantes de varias naciones
										en estas zonas migran tanto al interior de sus países como hacia
										otros del mismo continente o Europa en busca de seguridad.
									</p>

									<p className='unidad-paragraph unidad-paragraph-bottom'>
										La migración irregular y el desplazamiento involuntario son
										fenómenos complejos con múltiples causas. Atenderlos
										efectivamente requiere de un enfoque integral que incluya
										medidas políticas, económicas, sociales y humanitarias, desde
										diferentes sectores sociales a nivel nacional. Adicionalmente,
										la cooperación internacional y la solidaridad entre los países son
										fundamentales para encontrar soluciones duraderas a estos
										desafíos.
									</p>

									<p className='unidad-paragraph'>
										A continuación, se presentan algunas de las problemáticas
										relacionadas con la migración a diferentes escalas (nacional y
										regional):
									</p>
									<ul className='unidad-consolidation-list'>
										<li>1. México</li>
										<li>2. Chile</li>
										<li>3. Venezuela</li>
										<li>4. España</li>
										<li>5. Italia y Alemania</li>
									</ul>

									<div className='unidad-info-box'>
										<p className='unidad-info-title'>
											Conexión geográfica
										</p>
										<p className='unidad-info-text'>
											En Centroamérica, el número de migrantes en tránsito se ha
											triplicado entre 2022 y 2023. Además, la duración promedio de
											su estadía en los países de paso ha aumentado, generando una
											significativa presión sobre Gobiernos, recursos y comunidades
											locales.
										</p>
									</div>

									<p className='unidad-paragraph'>
										Casos relacionados con la migración en diferentes países o
										regiones
									</p>
								</section>

								<section>
									<div className='unidad-info-box'>
										<p className='unidad-info-title'>Glosario</p>
										<p className='unidad-info-text'>
											Asilo político. Estatus legal concedido por un país a una
											persona que ha huido de su país de origen por persecución
											política o por una situación que atenta contra su vida.
										</p>
									</div>

									<p className='unidad-paragraph'>
										En México, la localidad de Tapachula, cerca de la frontera con
										Guatemala, enfrenta violencia debido al descontento de la
										población por la llegada masiva de inmigrantes. Además, la
										violencia por parte de las organizaciones criminales hacia los
										inmigrantes ha aumentado de forma considerable en los últimos
										años.
									</p>
									<p className='unidad-paragraph'>
										Desde 2017, la continua salida de migrantes y refugiados de
										Venezuela se ha convertido en el segundo mayor desplazamiento
										externo global, con más de 7.7 millones de personas que han
										abandonado el país.
									</p>
									<p className='unidad-paragraph'>
										En 2022, la ciudad chilena de Iquique fue el escenario de
										violentas protestas antiinmigrantes a causa del incremento de la
										inmigración irregular como consecuencia de la crisis económica y
										política en Venezuela. Estas llevaron incluso a la quema de un
										campamento de migrantes e intentos de agresión.
									</p>
									<p className='unidad-paragraph'>
										En España, la llegada masiva de inmigrantes, principalmente de
										Marruecos, ha desencadenado tensiones en varias ciudades,
										donde los residentes expresan preocupaciones por su seguridad por
										el aumento de crímenes y actividades delictivas, en su mayoría
										atribuidos a inmigrantes.
									</p>
									<p className='unidad-paragraph'>
										Italia y Alemania son algunas de las naciones que han brindado asilo
										político a miles de afganos, iraquíes, libaneses y sirios que escapan
										de las difíciles condiciones de vida en sus países de origen.
									</p>									
								</section>

								<section>
									<h3 className='unidad-section-title'>
										Gobernanza local, nacional y regional para prevenir la
										migración irregular
									</h3>

									<p className='unidad-paragraph'>
										A nivel regional existen proyectos como «Alternativas», que tiene como
										principal objetivo la disminución de la migración irregular. El proyecto
										busca que los jóvenes puedan acceder a herramientas de prevención de la
										violencia y brinda formación que les permita mejores oportunidades
										laborales.
									</p>
									<p className='unidad-paragraph'>
										Esta iniciativa agrupa a diferentes organismos e instituciones, como la
										Cooperación Técnica Alemana, el Sistema de la Integración
										Centroamericana (SICA), la Secretaría de la Integración Social Centroamericana
										na (SISCA), entre otros. Asimismo, involucra a tres países de la región:
										Guatemala, El Salvador y Honduras. Para el caso de El Salvador, se ha
										focalizado en los departamentos de Ahuachapán, La Paz (Zacatecoluca),
										San Miguel y San Salvador.
									</p>
									<p className='unidad-paragraph unidad-paragraph-bottom'>
										Este proyecto implementa y apoya diferentes iniciativas locales para que la
										migración no sea la única alternativa para los jóvenes que pertenecen a
										sectores vulnerables de la población. A nivel local, la iniciativa busca la
										articulación de los siguientes sectores:
									</p>

									<ul className='unidad-consolidation-list'>
										<li>Empresa privada</li>
										<li>Centros de formación profesional</li>
										<li>Escuela</li>
										<li>Familia</li>
										<li>Gobiernos locales</li>
									</ul>
								</section>

								<section>
									<h3 className='unidad-section-title'>Consolidación</h3>

									<div className='unidad-doc-box'>
										<p className='unidad-doc-kicker'>Doc. 3 — Estudio de casos sobre la situación de los migrantes en diferentes contextos</p>
										<p className='unidad-doc-text'>
											Los recientes recrudecimientos de los conflictos y la creciente inseguridad en Libia
											han disparado el número de migrantes subsaharianos que llega a Túnez. El Gobierno tunecino
											respondió con una ofensiva contra los inmigrantes ilegales.
										</p>
										<p className='unidad-doc-text'>
											En febrero, el presidente Kaïs Saïed pronunció un discurso en el que afirmaba que los «migrantes
											amenazaban la identidad del país». Sus palabras desencadenaron una oleada xenófoba contra los
											«extranjeros», que hizo la vida casi imposible a la mayoría de los migrantes.
										</p>
										<p className='unidad-doc-text'>
											Ante la proximidad del crudo invierno de Chicago (EE.UU.), las autoridades locales luchan para
											proveer de alojamiento a miles de migrantes, albergados precariamente, quienes han sido atendidos
											de forma temporal. Pero unas dos mil personas no consiguieron alojarse e iban a ser ubicadas en un
											campamento construido específicamente para ellos.
										</p>
										<p className='unidad-doc-text'>
											Ante la noticia, los vecinos del barrio hicieron una protesta que terminó con intervención policial
											para rescatar a una concejal y su ayudante de una multitud enardecida.
										</p>
										<p className='unidad-doc-footer'>
											Fuente: Pinna, M. (2023). Crisis migratoria en el Mediterráneo. Fuente: García, E. (2023). Chicago y crisis migratoria.
										</p>
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
										src="https://res.cloudinary.com/dutglmj02/video/upload/v1775580915/unidad2Semana4_himwtk.mp4"
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

export default Semana4Unidad2Screen