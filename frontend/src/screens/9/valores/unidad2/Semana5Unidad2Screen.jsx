import React, { useState, useRef, useEffect } from 'react'
import Sidebar from '../../../../components/Sidebar'
import Header from '../../../../components/Header'
import '../../../../App.css'

function Semana5Unidad2Screen () {
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
				const response = await fetch('/unidad2Semana5.vtt')
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
										Unidad 2 · Semana 5
									</h1>
									<h2 className='unidad-subtitle valores-semana1-subtitle'>
										Poblaciones indígenas y afrodescendientes:
										conflictos y resistencias
									</h2>
								</div>

								<section>
									<h3 className='unidad-section-title'>
										La construcción de una cultura de paz y
										los pueblos indígenas
									</h3>

									<div className='unidad-doc-box'>
										<p className='unidad-doc-kicker'>
											Doc. 1 — La construcción de una
											cultura de paz y los pueblos
											indígenas
										</p>
										<p className='unidad-doc-text'>
											Fuente: Palabras de Rigoberta
											Menchú en López A. (2015).
											Rigoberta Menchú: aportaciones a la
											construcción de una cultura de paz.
											Fórum de Recerca 20 (2015): 19-32.
										</p>
										<p className='unidad-doc-text'>
											La construcción de una cultura de
											paz y los pueblos indígenas
										</p>
										<p className='unidad-doc-text'>
											No hay paz sin justicia, no hay justicia
											sin equidad, no hay equidad sin desarrollo,
											no hay desarrollo sin democracia, no hay
											democracia sin respeto a la identidad y
											dignidad de las culturas y los pueblos.
										</p>										
									</div>
								</section>

								<section>
									<h3 className='unidad-section-title'>
										En América Latina: indígenas y
										afrodescendientes
									</h3>

									<p className='unidad-paragraph'>
										En América Latina, las poblaciones
										indígenas y afrodescendientes han vivido
										injusticias y desigualdades a lo largo de
										la historia. Desde los procesos de
										colonización europea, se han visto sometidos
										a la desposesión de sus tierras, a la
										esclavitud y a la negación de sus
										derechos básicos.
									</p>
									<p className='unidad-paragraph'>
										En la actualidad, las desigualdades persisten
										en áreas como el acceso a la educación, la
										salud, la justicia, la vivienda y el trabajo.
										La pobreza, la discriminación y la falta de
										oportunidades para mejorar su calidad de
										vida siguen siendo problemáticas para estos
										grupos étnicos.
									</p>

									<p className='unidad-paragraph'>
										Los afrodescendientes en América Latina:
										particularidades históricas y culturales
									</p>

									<p className='unidad-paragraph'>
										El concepto «afrodescendiente» fue acuñado
										por primera vez a principios de la década del
										2000 por organizaciones regionales defensoras
										de derechos de humanos. Este se refiere a las
										personas que tienen ascendencia africana, es
										decir, que sus ancestros provenían del
										continente africano, y se usa para identificar
										a un grupo poblacional muy diverso: desde
										comunidades garífunas en Centroamérica, hasta
										grandes sectores de la sociedad, como el caso
										de Brasil.
									</p>

									<p className='unidad-paragraph'>
										La historia de los afrodescendientes en América
										comienza con la llegada de los europeos al
										continente. A partir del siglo XVI, millones de
										africanos fueron transportados en condiciones
										inhumanas a América para ser vendidos y
										utilizados como mano de obra esclava en
										plantaciones, minas y otras industrias. Este
										sistema de esclavitud ha tenido profundas
										repercusiones en la cultura y la sociedad de la
										región.
									</p>

									<div className='unidad-info-box'>
										<p className='unidad-info-title'>
											Conexión geográfica
										</p>
										<p className='unidad-info-text'>
											En algunos países del Caribe, como Haití,
											Barbados y Dominica, los afrodescendientes
											constituyen la mayoría de la población. A
											pesar de los desafíos, han surgido
											movimientos y organizaciones que defienden los
											derechos de los afrodescendientes. También
											la creciente conciencia sobre su historia y su
											cultura está conduciendo a un mayor
											reconocimiento y valoración de sus
											contribuciones a la sociedad.
										</p>
										<p className='unidad-info-text'>
											Los afrodescendientes desarrollaron formas de
											resistencia y preservaron una cultura propia que
											se ha integrado a las culturas de los países
											americanos. Este bagaje cultural se expresa en
											la música, la danza, la religión, la gastronomía y
											otras áreas.
										</p>
										<p className='unidad-info-text'>
											En la actualidad, este grupo étnico continúa
											enfrentando conflictos y desafíos. La
											discriminación es una realidad persistente en
											muchos países de América, limitando las
											oportunidades sociales, económicas y políticas
											para las comunidades afrodescendientes.
										</p>
									</div>
								</section>

								<section>
									<h3 className='unidad-section-title'>
										Contexto económico de la población
										afrodescendiente
									</h3>

									<p className='unidad-paragraph'>
										La población afrodescendiente en América Latina
										enfrenta niveles de pobreza más altos en
										comparación con otros grupos étnicos. A pesar de
										constituir una parte significativa de la población en
										muchos países de la región, los afrodescendientes
										suelen tener acceso limitado a oportunidades de
										desarrollo que les permitan mejorar su calidad de
										vida.
									</p>

									<p className='unidad-paragraph'>
										Esta situación es resultado de diversas causas, como
										la discriminación étnica sistémica, la falta de acceso
										a educación de calidad, la exclusión en el mercado
										laboral y la segregación socioespacial. Los
										afrodescendientes a menudo viven en áreas urbanas
										marginales con servicios públicos deficientes y
										enfrentan mayores dificultades para acceder a
										empleos formales, lo que los obliga a depender de
										trabajos informales y mal remunerados. Según el
										Banco Mundial, los afrodescendientes tienen 2.5 veces
										más probabilidades de vivir en condiciones de
										pobreza extrema que la población no
										afrodescendiente. En este sentido, las mujeres
										afrodescendientes son las más afectadas por la pobreza,
										con los niveles más bajos de ingresos y las menores
										oportunidades de empleo.
									</p>

									<p className='unidad-paragraph'>
										Sin embargo, en países como Ecuador esta situación
										está cambiando paulatinamente (Doc. 2).
									</p>

									<div className='unidad-doc-box'>
										<p className='unidad-doc-kicker'>
											Afrodescendientes en Latinoamérica: discriminación
											innegable
										</p>
										<p className='unidad-doc-text'>En la web</p>
										<p className='unidad-doc-text'>Doc. 2</p>
										<p className='unidad-doc-text'>
											Participación de las mujeres afrodescendientes del
											Ecuador
										</p>
										<p className='unidad-doc-text'>
											Fuente: Vizcaino Imaca, I. (2021). Análisis comparativo de
											la participación política de las mujeres indígenas y afrodescendientes
											del Ecuador (2011-2021).
										</p>
										<p className='unidad-doc-text'>
											Un punto fundamental para destacar es la participación de las
											mujeres indígenas y afrodescendientes vinculada con las orga-
											nizaciones comunitarias, donde participan a nivel territorial a
											través de las comunidades y los cabildos. A pesar de que esta
											participación ha aumentado, se siguen manteniendo los roles
											tradicionales […]. El desarrollo de capacidades económicas en
											las mujeres se ha ido impulsado a través de emprendimientos
											productivos de alimentación, consumo saludable y soberanía
											alimentaria, artesanía.
										</p>
										<p className='unidad-doc-text'>
											Mujeres afroecuatorianas participan en actividades culturales
											en Salinas, Ecuador.
										</p>
									</div>
								</section>

								<section>
									<h3 className='unidad-section-title'>
										Los indígenas en América Latina: particularidades
										históricas y culturales
									</h3>

									<p className='unidad-paragraph'>
										Antes del descubrimiento de América, el continente estaba poblado por pueblos indígenas
										con culturas, idiomas y tradiciones únicas. Sin embargo, con los procesos de conquista y
										colonización europeos, estas comunidades fueron sometidas y en consecuencia se perdieron tierras,
										recursos y vidas. Fueron desplazados de sus territorios ancestrales y sometidos a trabajos
										forzados, sufrieron violencia y se vieron diezmados por las enfermedades introducidas con la llegada
										de los europeos.
									</p>

									<p className='unidad-paragraph'>
										Tras la independencia, los proyectos de construcción de las naciones americanas recién formadas
										buscaron homogeneizar e integrar a los pueblos originarios dentro de un marco dominado por los intereses
										de las élites. Se promovió la asimilación cultural forzada y la invisibilización de las identidades indígenas
										en aras de una supuesta unidad nacional.
									</p>

									<p className='unidad-paragraph unidad-paragraph-bottom'>
										Esto condujo a la implementación de políticas de discriminación contra los indígenas, así como al despojo
										continuo de sus tierras y recursos naturales en nombre del progreso y el desarrollo económico. En América Latina
										existen aproximadamente 45 millones de personas que pertenecen a comunidades indígenas. La distribución de estas
										comunidades varía significativamente, con países como Guatemala y Bolivia, donde los grupos étnicos indígenas conforman
										la mayoría de la población, mientras que en países como El Salvador representan menos del 1 % (Doc. 3).
									</p>

									<div className='unidad-info-box'>
										<p className='unidad-info-title'>Glosario</p>
										<p className='unidad-info-text'>
											Asimilación cultural. Proceso mediante el cual un grupo étnico o cultural adopta las normas, valores,
											tradiciones y prácticas de otra cultura dominante, generalmente como resultado de la presión social, política o económica.
										</p>
										<p className='unidad-info-text'>Doc. 3</p>
									</div>

									<div className='unidad-doc-box'>
										<p className='unidad-doc-kicker'>
											Fuente: CEPAL (2015). Pueblos indígenas en América Latina.
										</p>
										<p className='unidad-doc-text'>Los pueblos indígenas en América Latina</p>
										<p className='unidad-doc-text'>
											Situación socioeconómica de las poblaciones indígenas
										</p>
										<p className='unidad-doc-text'>
											La situación de pobreza entre la población indígena en América Latina es preocupante y persistentemente alta, en comparación
											con otros grupos étnicos. Según el Programa de las Naciones Unidas para el Desarrollo (PNUD), a pesar de los avances en la
											reducción de la pobreza en la región, los indígenas continúan siendo uno de los grupos más afectados por esta problemática
											económica. Algunos datos que respaldan esta información incluyen:
										</p>
										<p className='unidad-doc-text'>
											La pobreza entre la población indígena tiene consecuencias multidimensionales que afectan su bienestar y su capacidad para
											desarrollarse plenamente:
										</p>
										<ul className='unidad-activity-list'>
											<li>
												La escasez de recursos económicos impide a muchos acceder a una educación de calidad, limitando sus oportunidades de empleo
												y movilidad social.
											</li>
											<li>
												Las condiciones precarias de vida y la falta de acceso a servicios básicos aumentan la incidencia de enfermedades.
											</li>
											<li>
												La desnutrición infantil es frecuente debido a la carencia de alimentos nutritivos, lo que resulta en retrasos en el crecimiento,
												problemas de salud crónicos y dificultades de aprendizaje.
											</li>
										</ul>
										<p className='unidad-doc-text'>Altas tasas de pobreza</p>
										<p className='unidad-doc-text'>
											De acuerdo con la CEPAL, la pobreza afecta al 43 % de la población indígena en la región, lo cual es más del doble de la proporción
											de personas no indígenas que viven en circunstancias similares.
										</p>
										<p className='unidad-doc-text'>Desigualdad económica</p>
										<p className='unidad-doc-text'>
											Además, la brecha entre los ingresos de los indígenas y de los no indígenas sigue siendo notable en numerosos países de la región,
											lo que refleja una marcada persistencia de la desigualdad económica entre ambos grupos.
										</p>
										<p className='unidad-doc-text'>Pobreza extrema</p>
										<p className='unidad-doc-text'>
											La misma fuente indica que el 24 % de las personas indígenas viven en condiciones de pobreza extrema, una proporción 2.7 veces mayor que
											la de las personas no indígenas en la misma condición.
										</p>
									</div>
								</section>

								<section>
									<h3 className='unidad-section-title'>
										Mecanismos de participación: indígenas y
										afrodescendientes
									</h3>

									<p className='unidad-paragraph'>
										Los conflictos de las poblaciones indígenas y afrodescendientes en América Latina están arraigados en la lucha contra la discriminación étnica y
										la exclusión socioeconómica, así como en la búsqueda de un reconocimiento pleno de su identidad cultural y sus derechos.
									</p>
									<p className='unidad-paragraph'>
										En respuesta a dichos conflictos, estos grupos étnicos ha desarrollado diversas formas de resistencia y organización que no solo buscan abordar las desigualdades,
										sino también promover la construcción de sociedades más inclusivas, equitativas y justas para todos. Entre los mecanismos de resistencia que se encuentran:
									</p>

									<ul className='unidad-activity-list'>
										<li>
											Movimientos sociales y organizaciones civiles. Surgieron para abogar por los derechos y promover el cambio social en áreas como la educación, el empleo y la justicia.
											Algunas de estas son la Organización Negra Centroamericana (ONECA) y el Consejo Coordinador Nacional Indígena Salvadoreño (CCNIS).
										</li>
										<li>
											Litigio estratégico. El uso de acciones legales y demandas judiciales se ha empleado para combatir la violación a sus derechos y buscar reparación ante injusticias históricas y actuales.
										</li>
										<li>
											Activismo cultural. Se utilizan las artes y las manifestaciones culturales, como la música, la danza, la literatura y otras expresiones artísticas, para fortalecer y reafirmar sus identidades.
											Entre estas se encuentran el Festival Afrodescendencias y la Fiesta de Culturas Indígenas, de México.
										</li>
										<li>
											Otras expresiones. Diferentes manifestaciones y marchas de concientización han sido utilizadas por ambas comunidades para llamar la atención sobre la exclusión y la marginación,
											así como para exigir cambios en políticas y prácticas discriminatorias.
										</li>
										<li>
											Activismo político. Tanto afrodescendientes como indígenas han buscado participar activamente en la política para asegurar una representación significativa en los Gobiernos y promover políticas que aborden sus necesidades particulares.
										</li>
										<li>
											Educación y concientización. Los movimientos y organizaciones trabajan para educar a la sociedad sobre la historia de estas poblaciones y también para sensibilizar e informar sobre las problemáticas a las que se enfrentan cotidianamente.
										</li>
									</ul>
								</section>

								<section>
									<h3 className='unidad-consolidation-title'>
										Consolidación
									</h3>

									<div className='unidad-doc-box'>
										<p className='unidad-doc-kicker'>
											Doc. 4 Alianza de Pescadores Indígenas Centroamericanos (APICA)
										</p>

										<p className='unidad-doc-text'>
											Los pueblos indígenas habitan y comparten vínculos vitales con los ecosistemas hídricos, los cuales son parte esencial de su patrimonio cultural,
											respaldan la soberanía alimentaria […] y, en muchos casos, son la principal fuente de ingresos económicos. En Mesoamérica los pueblos indígenas ocupan más del 75 %
											de las zonas marino-costeras en el mar Caribe y extensas áreas que colindan con aguas continentales y el océano Pacífico, aferrándose a la pesca como su principal medio de vida.
											Cabe mencionar que, en la región, los territorios que habitan exhiben los indicadores más altos en pobreza y desnutrición.
											Factores como la débil ordenación territorial, la industrialización, el cambio climático, la ausencia de su vinculación en políticas dentro de un modelo consultivo […], entre otros,
											están amenazando sus prácticas culturales ancestrales, los ecosistemas de sus territorios y sus fuentes de alimento, entre ellos la pesca, dejándolos en una situación de alta vulnerabilidad.
										</p>

										<p className='unidad-doc-text'>
											Como resultado del proceso participativo y colaborativo entre el Consejo Indígena de Centroamérica (CICA), el Fondo para el Desarrollo de los Pueblos Indígenas de América Latina y el Caribe (FILAC),
											la FAO y la Organización del Sector Pesquero y Acuícola del Istmo Centroamericano (SICA-OSPESCA), se creó en agosto del 2019 la Alianza de Pescadores Indígenas Centroamericanos,
											a fin de fortalecer a los pueblos indígenas y promover sus prácticas de pesca y la buena gobernabilidad de los recursos pesqueros y recursos asociados.
											[…] A través de la red, conformada por diversos actores, se busca mejorar la adopción de políticas y programas adaptados a las necesidades y culturas de los pueblos indígenas,
											además de fortalecer la gobernanza de la pesca en pequeña escala en los territorios y comunidades indígenas de la región mesoamericana y fomentar su sostenibilidad.
										</p>

										<p className='unidad-doc-footer'>
											Fuente: FAO (2021). Los pueblos indígenas y afrodescendientes y el cambio climático en América Latina.
										</p>
										<p className='unidad-doc-text'>
											Territorio — Características culturales — Conflictos y resistencias — Oportunidades de desarrollo
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
										src="https://res.cloudinary.com/dutglmj02/video/upload/v1775580915/unidad2Semana5_zedytv.mp4"
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

export default Semana5Unidad2Screen