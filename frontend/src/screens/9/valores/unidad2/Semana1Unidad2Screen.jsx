import React, { useState, useRef, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom';
import Sidebar from '../../../../components/Sidebar'
import Header from '../../../../components/Header'
import '../../../../App.css'

function Semana1Unidad2Screen () {
	const [isSidebarOpen, setIsSidebarOpen] = useState(window.innerWidth > 768);
    const [activeText, setActiveText] = useState('');
    const [allCues, setAllCues] = useState([]);
    const [audioLoading, setAudioLoading] = useState(true);
    const [videoLoading, setVideoLoading] = useState(true);
    const [isClassVideoPlaying, setIsClassVideoPlaying] = useState(false);
    const [questionText, setQuestionText] = useState('');
    
    const audioRef = useRef(null);
    const contentRef = useRef(null);
    const classVideoRef = useRef(null);
    const questionTextareaRef = useRef(null);
    const navigate = useNavigate();

    const toggleSidebar = () => {
        setIsSidebarOpen(!isSidebarOpen);
    };

    useEffect(() => {
        const loadVTT = async () => {
            try {
                const response = await fetch('/unidad2Semana1.vtt');
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

    const adjustQuestionTextareaHeight = (el) => {
        if (!el) return;
        el.style.height = 'auto';
        const minH = 52;
        const maxH = 200;
        el.style.height = Math.min(Math.max(el.scrollHeight, minH), maxH) + 'px';
    };

    const handleQuestionChange = (e) => {
        setQuestionText(e.target.value);
        adjustQuestionTextareaHeight(e.target);
    };

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
        setQuestionText('');
        if (questionTextareaRef.current) {
            questionTextareaRef.current.style.height = '52px';
        }
    };

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
										Unidad 2 · Semana 1
									</h1>
									<h2 className='unidad-subtitle'>
										Bono demográfico en el mundo
									</h2>
									
								</div>

								<section>
									<h3 className='unidad-section-title'>
										Información demográfica de las
										poblaciones
									</h3>
									<p className='unidad-paragraph'>
										Al describir una población se
										consideran diversos aspectos, como la
										estructura por edad y se detallan la
										cantidad de hombres y mujeres en
										distintas franjas etarias y los
										patrones de nacimientos, defunciones y
										movimientos migratorios,
										especialmente cuando se trata de una
										población específica, como la de un
										país.
									</p>
									<p className='unidad-paragraph'>
										Asimismo, la descripción de los grupos
										poblacionales se complementa con el
										análisis de sus condiciones de vida,
										en el que se abordan aspectos como la
										distribución entre población urbana y
										rural, la incidencia de la pobreza, el
										acceso a servicios como educación y
										salud, así como las oportunidades de
										empleo, entre otros.
									</p>
									<p className='unidad-paragraph unidad-paragraph-bottom'>
										Esta información demográfica es
										esencial para que los Estados
										formulen políticas sociales y
										económicas que sean efectivas y
										adecuadas a las necesidades de la
										población, ya que permiten a los
										Gobiernos conocer la estructura y las
										características de una comunidad
										específica, lo que les ayuda a
										identificar los problemas y las
										oportunidades que deben abordar.
									</p>
								</section>

								<section>
									<h3 className='unidad-section-title'>
										Tendencias demográficas actuales
									</h3>
									<p className='unidad-paragraph'>
										A escala mundial, las tendencias
										demográficas están cambiando
										rápidamente. A pesar de que la tasa de
										natalidad ha disminuido, la población
										está creciendo ya que la esperanza de
										vida está aumentando y la tasa de
										mortalidad también ha descendido.
									</p>
									<p className='unidad-paragraph unidad-paragraph-bottom'>
										Estos cambios están teniendo impactos
										significativos en las estructuras de
										las sociedades actuales.
									</p>

									<div className='unidad-info-box'>
										<p className='unidad-info-title'>
											Glosario
										</p>
										<p className='unidad-info-text'>
											Etario. Perteneciente o relacionado
											con un rango de edad específico.
										</p>
									</div>

									<div className='unidad-info-box'>
										<p className='unidad-info-title'>
											Conexión geográfica
										</p>
										<p className='unidad-info-text'>
											Las regiones en vías de desarrollo
											suelen tener tasas de natalidad más
											altas que las regiones
											desarrolladas. Esto se debe a una
											combinación de factores culturales,
											religiosos, económicos y
											demográficos.
										</p>
									</div>
								</section>

								<section>
									<h3 className='unidad-section-title'>
										Desafíos demográficos a escala global
									</h3>
									<p className='unidad-paragraph'>
										La Organización de las Naciones Unidas
										(ONU) destaca dos tendencias
										demográficas que presentan desafíos
										para los Gobiernos.
									</p>

									<div className='unidad-problem-grid'>
										<div className='unidad-problem-card'>
											<h4 className='unidad-problem-title'>
												Condiciones de vida de los
												adultos mayores en distintas
												regiones
											</h4>
											<p className='unidad-problem-text'>
												La preocupación por el
												envejecimiento poblacional es un
												tema central para organismos
												internacionales y autoridades
												nacionales, especialmente en
												países desarrollados. Esto
												presenta desafíos como:
											</p>
											<ul className='unidad-consolidation-list'>
												<li>
													Adaptar los sistemas de
													salud y pensiones.
												</li>
												<li>
													Generar oportunidades de
													empleo y fomentar la
													participación social de los
													mayores.
												</li>
												<li>
													Promover una cultura de
													envejecimiento activo y
													saludable.
												</li>
											</ul>
										</div>
									</div>

									<div className='unidad-problem-grid'>
										<div className='unidad-problem-card'>
											<h4 className='unidad-problem-title'>
												El envejecimiento poblacional
											</h4>
											<p className='unidad-problem-text'>
												El cambio en la distribución de
												edades, con un aumento de
												adultos mayores, se relaciona
												con la transición demográfica en
												la mayoría de los países,
												determinado por la disminución
												de las tasas de fecundidad y el
												aumento de la esperanza de vida.
											</p>
										</div>

										<div className='unidad-problem-card'>
											<h4 className='unidad-problem-title'>
												El aumento de la población joven
											</h4>
											<p className='unidad-problem-text'>
												En varias regiones del mundo,
												la proporción de jóvenes está
												aumentando significativamente.
												Por ello, organismos
												internacionales han advertido
												que se debe prestar atención a
												las necesidades y desafíos de
												este grupo etario.
											</p>
										</div>
									</div>

									<div className='unidad-doc-box'>
										<p className='unidad-doc-kicker'>
											Doc. 1 — Acceso a atención de salud
											y seguridad en el ingreso para una
											vejez digna
										</p>
										<p className='unidad-doc-text'>
											La crisis económica mundial ha
											exacerbado la presión financiera
											para que se proteja tanto la
											seguridad económica en la vejez
											como el acceso de las personas de
											edad a la atención de la salud. Las
											inversiones en sistemas de pensión
											se consideran uno de los medios más
											importantes de asegurar la
											independencia económica y reducir
											la pobreza en la vejez.
										</p>
										<p className='unidad-doc-text'>
											Pero es motivo de especial
											preocupación la sostenibilidad de
											esos sistemas, particularmente en
											los países desarrollados, mientras
											que la protección social y la
											cobertura de pensiones en edades
											avanzadas sigue siendo un desafío
											para los países en desarrollo,
											donde una gran proporción de la
											mano de obra se ubica en el sector
											parallel o no estructurado de la
											economía (sector informal).
										</p>
										<p className='unidad-doc-footer'>
											Fuente: ONU DAES (2012).
											Envejecimiento en el siglo XXI:
											Una celebración y un desafío.
										</p>
									</div>

									<div className='unidad-info-box'>
										<p className='unidad-info-title'>
											Glosario
										</p>
										<p className='unidad-info-text'>
											Transición demográfica. Proceso
											evolutivo en el que una sociedad
											experimenta cambios en sus tasas de
											natalidad, mortalidad y crecimiento
											de la población a lo largo del
											tiempo.
										</p>
									</div>
								</section>

								<section>
									<h3 className='unidad-section-title'>
										Condiciones de vida de los adultos
										mayores en distintas regiones
									</h3>
									<p className='unidad-paragraph'>
										En naciones más desarrolladas se
										observa un considerable porcentaje de
										población mayor de 65 años, como en
										Japón, Finlandia, Alemania y
										Bulgaria, a diferencia de países como
										Afganistán o Arabia Saudita, donde la
										proporción de adultos mayores es
										menor.
									</p>
									<p className='unidad-paragraph'>
										Las condiciones de vida de personas
										mayores difieren notablemente entre
										los países desarrollados y los que
										están en proceso de desarrollo.
									</p>

									<div className='unidad-regions-grid'>
										<div className='unidad-region-card blue'>
											<h4 className='unidad-region-title blue'>
												Regiones desarrolladas
											</h4>
											<p className='unidad-region-text'>
												Las personas mayores tienden a
												tener una mayor esperanza de
												vida, un mejor acceso a la
												atención médica, una mayor
												seguridad económica y más
												oportunidades de participación
												social.
											</p>
										</div>
										<div className='unidad-region-card orange'>
											<h4 className='unidad-region-title orange'>
												Regiones en vías de desarrollo
											</h4>
											<p className='unidad-region-text'>
												Las condiciones de vida de las
												personas mayores son más
												difíciles. La esperanza de vida
												es menor, la salud es más
												precaria y el acceso a recursos
												es más limitado.
											</p>
										</div>
									</div>

									<div className='unidad-doc-box'>
										<p className='unidad-doc-kicker'>
											Doc. 2 — Población mundial de 65
											años o más (2023)
										</p>
										<p className='unidad-doc-text'>
											Mapa que muestra la proporción de
											población mundial de 65 años o más,
											con categorías mayores al 30 %, de
											25–30 %, 15–25 %, 10–15 %, 5–10 %
											y menor al 5 %, según el Fondo de
											población de las Naciones Unidas.
										</p>
									</div>

									<div className='unidad-doc-box'>
										<p className='unidad-doc-kicker'>
											Doc. 3 — Los adultos mayores en
											Suiza
										</p>
										<p className='unidad-doc-text'>
											La mayoría de los jubilados de
											Suiza goza de una buena situación
											financiera, solo un 6 % de los
											ancianos es considerado pobre. En
											el grupo de edades entre los 80 y
											los 84 años, ya una quinta parte
											necesita ayuda, y más de un tercio
											a partir de los 85 años. La
											institución principal encargada del
											cuidado de los ancianos es la
											familia. Tres cuartas partes de
											los ancianos son cuidados por su
											familia.
										</p>
									</div>

									<div className='unidad-doc-box'>
										<p className='unidad-doc-kicker'>
											Doc. 4 — Guatemala y las
											condiciones de vida de los adultos
											mayores
										</p>
										<p className='unidad-doc-text'>
											En Guatemala, más del 40 % de la
											población adulta mayor se encuentra
											bajo la línea de la pobreza. El 88
											% vive sin acceso a una pensión o
											jubilación y el 12 % que tienen
											acceso a estas no les permite
											cubrir sus necesidades por los
											bajos montos que reciben,
											impidiéndoles vivir de una manera
											digna.
										</p>
										<p className='unidad-doc-text'>
											Otra forma grave de violación a sus
											derechos lo constituye el maltrato
											y la violencia generalizada,
											sufrida en un 33 %.
										</p>
										<p className='unidad-doc-footer'>
											Fuente: Quevedo, Y. (2023). Adultos
											mayores en situación de
											vulnerabilidad.
										</p>
									</div>
								</section>

								<section>
									<h3 className='unidad-section-title'>
										Bono demográfico
									</h3>
									<p className='unidad-paragraph'>
										Se conoce con el nombre de «bono
										demográfico» o «dividendo
										demográfico» al fenómeno que se
										produce cuando la proporción de la
										población económicamente activa (15 a
										64 años), es decir, en edad de
										trabajar, es mayor que la cantidad de
										personas en edad dependiente (la que
										no trabaja), es decir, los niños
										entre 0 y 14 años y los adultos
										mayores de 65 años o más.
									</p>
									<p className='unidad-paragraph'>
										Este proceso hace que el potencial
										productivo de un país sea superior,
										por eso se lo considera una ventana
										de oportunidades para el desarrollo,
										y quienes saben capitalizarlo
										obtienen enormes beneficios.
									</p>

									<div className='unidad-info-box'>
										<p className='unidad-info-title'>
											En la web
										</p>
										<p className='unidad-info-text'>
											Atlas del Dividendo Demográfico –
											UNFPA. Bono demográfico.
										</p>
									</div>

									<p className='unidad-paragraph'>
										Los beneficios del bono demográfico no
										se materializan automáticamente y
										requieren de políticas viables y
										sostenibles que fomenten la
										producción, creen oportunidades de
										empleo y fomenten un entorno propicio
										para el desarrollo.
									</p>
									<p className='unidad-paragraph unidad-paragraph-bottom'>
										El bono demográfico puede generar
										desafíos para un país. Estos incluyen
										la necesidad de proporcionar educación
										y capacitación a la población joven,
										así como de crear empleos suficientes
										para absorber la fuerza laboral
										creciente.
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
											// src="/unidad2Semana1.mp4"     
											src="https://res.cloudinary.com/dutglmj02/video/upload/v1775580913/unidad2Semana1_zztkfy.mp4"     
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

export default Semana1Unidad2Screen

