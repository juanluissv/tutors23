import React, { useState, useRef, useEffect } from 'react'
import { Link } from 'react-router-dom'
import Sidebar from '../components/Sidebar'
import Header from '../components/Header'
import '../App.css'

function FrenchScreen () {
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
				const response = await fetch('/frenchScreen.vtt')
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

	const parseVTT = vttText => {
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

	const parseTime = timeString => {
		const parts = timeString.split(':')
		if (parts.length === 3) {
			const hours = parseFloat(parts[0])
			const minutes = parseFloat(parts[1])
			const seconds = parseFloat(parts[2])
			return hours * 3600 + minutes * 60 + seconds
		}
		return 0
	}

	const handleTimeUpdate = currentTime => {
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

	const highlightMatchingText = cueText => {
		clearHighlights()

		if (!contentRef.current) return

		const textElements = contentRef.current.querySelectorAll('p, h2, h3, h4')
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
		const highlighted = contentRef.current.querySelectorAll('.karaoke-active')
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

	const adjustQuestionTextareaHeight = el => {
		if (!el) return
		el.style.height = 'auto'
		const minH = 52
		const maxH = 200
		el.style.height = Math.min(Math.max(el.scrollHeight, minH), maxH) + 'px'
	}

	const handleQuestionChange = e => {
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
							<div className='valores-english-version-wrap'>
								<div className='valores-english-version-pill'>
									<Link
										to='/9/valores/unidad1/semana1'
										className='valores-english-version-link'
									>
										Version espagnole
									</Link>
								</div>
								<div className='valores-english-version-pill'>
									<Link
										to='/9/valores/unidad1/semana1'
										className='valores-english-version-link'
									>
										English Version
									</Link>
								</div>
							</div>
							<div className='unidad-wrapper'>
								<div className='unidad-header'>
									<h1 className='unidad-title'>
										Unité 1 · Semaine 1
									</h1>
									<h2 className='unidad-subtitle'>
										Les forêts tropicales dans le monde
									</h2>
								</div>

								<div className='fixed-video-bottom-right'>
									<div className='fixed-video-controls'>
										<button
											type='button'
											className='fixed-video-button'
											onClick={handleClassVideoToggle}
											title={
												isClassVideoPlaying
													? 'Mettre la vidéo en pause'
													: 'Lire la vidéo'
											}
										>
											{isClassVideoPlaying ? (
												<svg
													width='20'
													height='20'
													viewBox='0 0 24 24'
													fill='none'
													stroke='currentColor'
													strokeWidth='2'
													strokeLinecap='round'
													strokeLinejoin='round'
												>
													<rect
														x='6'
														y='4'
														width='4'
														height='16'
													/>
													<rect
														x='14'
														y='4'
														width='4'
														height='16'
													/>
												</svg>
											) : (
												<svg
													width='20'
													height='20'
													viewBox='0 0 24 24'
													fill='none'
													stroke='currentColor'
													strokeWidth='2'
													strokeLinecap='round'
													strokeLinejoin='round'
												>
													<polygon points='5 3 19 12 5 21 5 3' />
												</svg>
											)}
										</button>
									</div>
									<div className='fixed-video-wrapper'>
										{videoLoading && (
											<div className='fixed-video-loading-overlay'>
												<svg
													width='28'
													height='28'
													viewBox='0 0 24 24'
													fill='none'
													stroke='#ffffff'
													strokeWidth='2'
													className='audio-loading-spinner'
												>
													<circle
														cx='12'
														cy='12'
														r='10'
														strokeOpacity='0.25'
													/>
													<path
														d='M12 2a10 10 0 0 1 10 10'
														strokeLinecap='round'
													/>
												</svg>
											</div>
										)}
										<video
											ref={classVideoRef}
											// src='/french1.mp4'
											src='https://res.cloudinary.com/dutglmj02/video/upload/v1775580777/french1_qnvkes.mp4'
											controls={false}
											onLoadedData={() => setVideoLoading(false)}
											onLoadStart={() => setVideoLoading(true)}
											onError={() => setVideoLoading(false)}
											onPlay={() => setIsClassVideoPlaying(true)}
											onPause={() => setIsClassVideoPlaying(false)}
											onTimeUpdate={e =>
												handleTimeUpdate(e.target.currentTime)
											}
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
												placeholder='Posez-moi une question'
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
												type='button'
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
													width='16'
													height='16'
													viewBox='0 0 24 24'
													fill='none'
													stroke='currentColor'
													strokeWidth='2'
													strokeLinecap='round'
													strokeLinejoin='round'
												>
													<line x1='22' y1='2' x2='11' y2='13' />
													<polygon points='22 2 15 22 11 13 2 9 22 2' />
												</svg>
											</button>
										</div>
									</div>
								</div>

								<section>
									<h3 className='unidad-section-title'>
										Les forêts : importance et classification
									</h3>
									<p className='unidad-paragraph'>
										Les forêts sont des écosystèmes complexes
										qui jouent un rôle vital pour la vie
										humaine. Elles couvrent environ 31 % de
										la surface terrestre mondiale et
										remplissent diverses fonctions
									</p>
									<p className='unidad-paragraph'>
										Parmi lesquelles la production
										d&apos;oxygène, la purification de
										l&apos;air, la fourniture d&apos;eau et
										d&apos;autres ressources naturelles ; elles
										sont donc très importantes pour le
										maintien de la santé et de
										l&apos;équilibre de la planète.
									</p>
									<p className='unidad-paragraph'>
										La classification des forêts repose sur
										divers critères, tels que la zone
										climatique où elles se trouvent, le type
										de végétation qui les compose ou leur
										fonction écologique.
									</p>
									<p className='unidad-paragraph unidad-paragraph-bottom'>
										Selon la zone climatique, les forêts se
										divisent en : tropicales, subtropicales,
										tempérées et boréales. Parmi elles, les
										zones tropicales se distinguent par la
										plus grande proportion de forêts au
										niveau mondial, atteignant 45 %, tandis
										que le reste se répartit entre les autres
										zones climatiques.
									</p>

									<div className='unidad-chart-box'>
										<h4 className='unidad-chart-title'>
											Répartition mondiale des forêts par
											zone climatique
										</h4>
										<div className='unidad-chart-grid'>
											<div className='unidad-chart-item'>
												<div className='unidad-chart-value tropical'>
													45%
												</div>
												<div className='unidad-chart-label'>
													Tropical
												</div>
											</div>
											<div className='unidad-chart-item'>
												<div className='unidad-chart-value boreal'>
													27%
												</div>
												<div className='unidad-chart-label'>
													Boréal
												</div>
											</div>
											<div className='unidad-chart-item'>
												<div className='unidad-chart-value templada'>
													16%
												</div>
												<div className='unidad-chart-label'>
													Tempéré
												</div>
											</div>
											<div className='unidad-chart-item'>
												<div className='unidad-chart-value subtropical'>
													11%
												</div>
												<div className='unidad-chart-label'>
													Subtropical
												</div>
											</div>
										</div>
										<p className='unidad-chart-footer'>
											Source : FAO (2020). Évaluation des
											ressources forestières mondiales.
										</p>
									</div>

									<div className='unidad-info-box'>
										<p className='unidad-info-title'>
											Connexion géographique
										</p>
										<p className='unidad-info-text'>
											Près de 54 % des forêts du monde se
											concentrent dans cinq pays : la
											Russie, le Brésil, le Canada, les
											États-Unis et la Chine.
										</p>
									</div>
								</section>

								<section>
									<h3 className='unidad-section-title'>
										Caractéristiques des forêts tropicales
									</h3>
									<p className='unidad-paragraph'>
										Les forêts tropicales se situent dans la
										zone intertropicale et constituent
										l&apos;un des écosystèmes les plus
										importants au monde.
									</p>
									<p className='unidad-paragraph'>
										Elles se caractérisent par un climat
										chaud et humide et connaissent des
										précipitations abondantes tout au long de
										l&apos;année, créant des conditions
										favorables à la vie végétale et animale.
									</p>
									<p className='unidad-paragraph'>
										Elles abritent en outre une diversité
										biologique remarquable, avec environ 60
										% des espèces connues de faune et de
										flore au niveau mondial.
									</p>
									<p className='unidad-paragraph unidad-paragraph-bottom'>
										Cependant, au cours des dernières
										décennies, la déforestation a gravement
										menacé la santé et la stabilité de ces
										forêts, touchant des régions entières.
									</p>
								</section>

								<section>
									<h3 className='unidad-section-title'>
										Principaux problèmes des forêts
										tropicales
									</h3>
									<p className='unidad-paragraph unidad-paragraph-bottom'>
										Les forêts tropicales, malgré leur
										importance écologique, sont confrontées à
										divers problèmes qui mettent en danger
										leur existence :
									</p>

									<div className='unidad-problem-grid'>
										<div className='unidad-problem-card'>
											<h4 className='unidad-problem-title'>
												La déforestation
											</h4>
											<p className='unidad-problem-text'>
												C&apos;est le processus par lequel
												la couverture forestière est
												supprimée ou réduite à grande
												échelle dans une zone donnée. Elle
												peut être causée par des activités
												humaines ou naturelles.
											</p>
										</div>
										<div className='unidad-problem-card'>
											<h4 className='unidad-problem-title'>
												La pollution
											</h4>
											<p className='unidad-problem-text'>
												Elle apparaît lorsque des agents
												chimiques altèrent
												l&apos;écosystème forestier, comme
												les déversements de déchets et les
												émissions industrielles.
											</p>
										</div>
										<div className='unidad-problem-card'>
											<h4 className='unidad-problem-title'>
												Le changement climatique
											</h4>
											<p className='unidad-problem-text'>
												C&apos;est la variation
												significative des régimes
												climatiques de la Terre qui affecte
												les forêts tropicales, les rendant
												plus vulnérables aux sécheresses,
												aux incendies et aux inondations.
											</p>
										</div>
										<div className='unidad-problem-card'>
											<h4 className='unidad-problem-title'>
												La surexploitation
											</h4>
											<p className='unidad-problem-text'>
												L&apos;exploitation forestière
												excessive et l&apos;exploitation des
												ressources sans pratiques durables
												épuisent les ressources et menacent
												la capacité de régénération
												naturelle des forêts tropicales.
											</p>
										</div>
									</div>

									<div className='unidad-doc-box'>
										<p className='unidad-doc-kicker'>
											Doc. 2 — L&apos;impact des activités
											productives sur la déforestation
										</p>
										<p className='unidad-doc-text'>
											Dans une étude récente, la FAO a
											conclu qu&apos;entre 2000 et 2018,
											près de 90 % de la déforestation dans
											les zones tropicales était liée à
											l&apos;agriculture (52,3 % provenait
											de l&apos;extension des terres
											cultivées et 37,5 % de
											l&apos;extension des pâturages pour le
											bétail).
										</p>
										<p className='unidad-doc-text'>
											Les terres cultivées ont provoqué plus
											de 75 % de la déforestation en Afrique
											et en Asie. La principale cause en
											Amérique du Sud et en Océanie était le
											pâturage du bétail.
										</p>
										<p className='unidad-doc-footer'>
											Source : FAO (2022). L&apos;état des
											forêts du monde.
										</p>
									</div>
								</section>

								<section>
									<h3 className='unidad-section-title'>
										Régions touchées par la déforestation
										dans les forêts tropicales
									</h3>
									<p className='unidad-paragraph'>
										Les régions les plus touchées par la
										déforestation dans les zones tropicales se
										trouvent en Amérique du Sud, en Afrique
										centrale et en Asie du Sud-Est.
									</p>
									<p className='unidad-paragraph'>
										En Amérique du Sud, la déforestation se
										concentre dans l&apos;Amazonie, la plus
										grande forêt tropicale du monde. En
										Afrique, la forêt du Congo est menacée par
										l&apos;expansion de l&apos;agriculture, de
										l&apos;élevage et de l&apos;exploitation
										minière.
									</p>
									<p className='unidad-paragraph unidad-paragraph-bottom'>
										En Asie, la déforestation touche
										principalement l&apos;Indonésie, la
										Malaisie et le Myanmar, en raison de la
										culture du palmier à huile et de la
										surexploitation du bois pour
										l&apos;industrie du papier.
									</p>

									<div className='unidad-regions-grid'>
										<div className='unidad-region-card green'>
											<h4 className='unidad-region-title green'>
												Amérique du Sud
											</h4>
											<p className='unidad-region-text'>
												La déforestation se concentre dans
												l&apos;Amazonie. Selon le WWF, 18 %
												des forêts amazoniennes ont été
												entièrement perdues et 17 % sont
												dégradées en raison de la culture
												à grande échelle du soja et de
												l&apos;expansion des pâturages,
												ainsi que de l&apos;exploitation
												minière et de la surexploitation du
												bois.
											</p>
										</div>
										<div className='unidad-region-card orange'>
											<h4 className='unidad-region-title orange'>
												Afrique centrale
											</h4>
											<p className='unidad-region-text'>
												Le bassin du fleuve Congo, d&apos;une
												superficie de 3,7 millions de km²,
												est la deuxième plus grande zone
												tropicale au monde. La principale
												cause de déforestation est
												l&apos;agriculture de subsistance,
												suivie par l&apos;exploitation
												forestière, industrielle et
												artisanale, et les activités
												minières.
											</p>
										</div>
										<div className='unidad-region-card blue'>
											<h4 className='unidad-region-title blue'>
												Asie du Sud-Est
											</h4>
											<p className='unidad-region-text'>
												La production d&apos;huile de palme
												est la principale cause de la
												déforestation, notamment en
												Indonésie et en Malaisie, qui
												ensemble produisent 84 % de
												l&apos;huile de palme mondiale. Les
												activités forestières destinées à
												l&apos;industrie du papier et les
												pratiques agricoles par coupe et
												brûlis ont également un impact
												important.
											</p>
										</div>
									</div>
								</section>
							</div>
						</div>
					</div>
				</div>
			</div>
		</div>
	)
}

export default FrenchScreen
