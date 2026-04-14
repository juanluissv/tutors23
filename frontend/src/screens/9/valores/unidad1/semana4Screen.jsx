import React, { useState, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom';
import Sidebar from '../../../../components/Sidebar'
import Header from '../../../../components/Header'
import '../../../../App.css'

function Semana4Screen () {
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
                const response = await fetch('/unidad1Semana4.vtt');
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
										Unidad 1 · Semana 4
									</h1>
									<h2 className='unidad-subtitle valores-semana1-subtitle'>
										Recursos energéticos no renovables
									</h2>
								</div>


								<section>
									<h3 className='unidad-section-title'>
										¿Qué son los recursos energéticos?
									</h3>
									<p className='unidad-paragraph'>
										Los recursos energéticos son fuentes
										naturales que proporcionan energía
										para diversas actividades humanas.
										Estos pueden ser renovables o no
										renovables. La energía que se obtiene
										de estos recursos impulsa los hogares,
										el transporte, la industria y más.
									</p>
									<p className='unidad-paragraph'>
										Es crucial comprender su importancia y
										manejo sostenible para garantizar un
										futuro energético estable y
										respetuoso con el medioambiente.
										Aprender sobre los recursos
										energéticos permite a las personas
										tomar decisiones informadas sobre cómo
										utilizar y conservar la energía.
									</p>
								</section>

								<section>
									<h3 className='unidad-section-title'>
										Recursos energéticos renovables
									</h3>
									<p className='unidad-paragraph'>
										Las energías renovables son un tipo de
										energías derivadas de fuentes
										naturales que llegan a reponerse más
										rápido de lo que pueden consumirse.
										Por ejemplo:
									</p>
									<ul className='unidad-consolidation-list'>
										<li>
											Energía solar. Es la que aprovecha
											el calor del Sol. Las tecnologías
											solares convierten la luz solar en
											energía eléctrica, ya sea mediante
											paneles fotovoltaicos o a través de
											espejos que concentran la radiación
											solar.
										</li>
										<li>
											Energía eólica. Aprovecha la
											energía cinética del aire en
											movimiento gracias al uso de
											enormes turbinas eólicas ubicadas
											en superficies terrestres, en
											altamar o en aguas dulces (sobre la
											superficie acuática).
										</li>
										<li>
											Energía geotérmica. Utiliza la
											energía térmica disponible del
											interior de la Tierra. El calor se
											extrae de unos depósitos
											geotérmicos a través de pozos u
											otros medios.
										</li>
										<li>
											Bioenergía. Se produce a partir de
											diversos materiales orgánicos,
											denominados biomasa, como la
											madera, el carbón, el estiércol y
											otros abonos utilizados para la
											producción de calor y electricidad.
										</li>
									</ul>
								</section>

								<section>
									<h3 className='unidad-section-title'>
										Recursos energéticos no renovables
									</h3>
									<p className='unidad-paragraph'>
										Las fuentes de energía no renovables
										tardan cientos de millones de años en
										formarse, por lo que el suministro de
										recurso es limitado. Por ejemplo:
									</p>
									<ul className='unidad-consolidation-list'>
										<li>
											Petróleo crudo. Se acumula de forma
											líquida entre las capas de la
											corteza terrestre. Al extraerse y
											refinarse, se obtiene combustible,
											como la gasolina y el diésel, entre
											otros productos, como los
											plásticos.
										</li>
										<li>
											Gas natural. Se extrae del interior
											de la corteza de la Tierra. Los
											gases más comunes que se utilizan
											son el metano y el etano. Algunos
											de los países con grandes reservas
											son Catar, Rusia e Irán.
										</li>
										<li>
											Carbón. Es creado por la materia
											orgánica comprimida. Se extrae por
											medio de la minería. Se ocupa para
											calefacción y centrales
											eléctricas. Uno de los países que
											más lo produce en el mundo es
											China.
										</li>
									</ul>
								</section>

								<section>
									<h3 className='unidad-section-title'>
										Situación actual de los recursos
										energéticos
									</h3>
									<p className='unidad-paragraph'>
										El 2022 fue un año complejo para los
										mercados energéticos mundiales, con
										los precios de la energía
										(especialmente del gas natural)
										aumentando, sobre todo en Europa y
										muchas otras partes del mundo.
									</p>
									<p className='unidad-paragraph'>
										A pesar de las fricciones
										geopolíticas, la volatilidad de los
										precios de las materias primas y la
										incertidumbre en torno a los costos,
										se están vislumbrando cambios
										transformadores en partes del sistema
										energético mundial.
									</p>
									<p className='unidad-paragraph'>
										La aceleración de la transición a la
										energía limpia significa que queda muy
										poco margen para el crecimiento de los
										combustibles fósiles. Por primera vez,
										la demanda de petróleo, gas natural y
										carbón alcanza su punto máximo antes
										de la siguiente década. La
										participación de los combustibles
										fósiles en la demanda de energía
										primaria disminuye del 80 % al 73 % en
										las últimas dos décadas.
									</p>
									<p className='unidad-paragraph'>
										La Agencia Internacional de Energía
										(AIE) muestra un panorama actual de
										políticas más sólidas que hacen que se
										vislumbre un pico de los combustibles
										fósiles (Doc. 2). Es decir, que la
										demanda total de combustibles fósiles
										irá disminuyendo de forma constante
										desde mediados de la década de 2020
										hasta 2050.
									</p>

									<div className='unidad-doc-box'>
										<p className='unidad-doc-kicker'>
											Doc. 2 — Panorama actual de los
											combustibles fósiles
										</p>
										<p className='unidad-doc-text'>
											El uso mundial de combustibles
											fósiles ha aumentado a la par que
											el PIB desde el inicio de la
											Revolución Industrial en el siglo
											XVIII; revertir este aumento al
											tiempo que se sigue expandiendo la
											economía mundial supondrá un
											momento crucial en la historia de
											la energía. La participación de los
											combustibles fósiles en el mix
											energético mundial se ha mantenido
											sistemáticamente alta, en torno al
											80 %, durante décadas. Según el
											Escenario de Políticas Declaradas
											(STEPS, por su denominación en
											inglés), esta se reducirá por
											debajo del 75 % y se situará justo
											por encima del 60 % en 2050. Las
											emisiones mundiales de CO2
											relacionadas con la energía
											alcanzan un punto alto en el
											Escenario STEPS en 2025, con 37 000
											millones de toneladas (Gt) al año,
											y descienden a 32 Gt en 2050. Esto
											iría asociado a un aumento de unos
											2.5 °C en la temperatura media
											mundial para 2100.
										</p>
										<p className='unidad-doc-footer'>
											Fuentes: IEA (2022). World Energy
											Outlook.
										</p>
									</div>

									<div className='unidad-info-box'>
										<p className='unidad-info-title'>
											Conexión geográfica
										</p>
										<p className='unidad-info-text'>
											Las nuevas políticas implementadas
											en los principales mercados
											energéticos contribuyen a impulsar
											la inversión anual en energías
											limpias hasta superar los 2
											billones de dólares en los
											próximos diez años.
										</p>
									</div>
								</section>

								<section>
									<h3 className='unidad-section-title'>
										Transiciones energéticas mundiales
									</h3>
									<p className='unidad-paragraph'>
										La transición energética mundial
										consiste en dejar de depender de los
										combustibles físiles y pasar a
										depender de recursos energéticos a
										partir de nuevas tecnologías como la
										eólica, la solar fotovoltaica y las
										baterías, e impulsar la seguridad
										eléctrica y el suministro diversificado
										de tecnologías limpias.
									</p>
									<p className='unidad-paragraph'>
										Las tendencias de despliegue de
										energía solar fotovoltaica, vehículos
										eléctricos, baterías y bombas de calor
										son alentadoras y el equilibrio
										general de la inversión se está
										inclinando hacia la energía limpia.
									</p>
									<p className='unidad-paragraph'>
										Cambio en la generación eléctrica en
										el Escenario de Políticas Declaradas
										entre el 2021 y 2031 (TWh).
									</p>
									<p className='unidad-paragraph'>
										El mundo está inmerso en una década
										decisiva para conseguir un sistema
										energético más seguro y sostenible.
										Las posibilidades de progresar más
										rápidamente son enormes si se toman
										medidas contundentes de inmediato.
									</p>
									<p className='unidad-paragraph'>
										Las inversiones en electricidad de
										bajas emisiones y electrificación,
										junto con la ampliación y
										modernización de las redes, ofrece
										oportunidades claras y rentables para
										reducir las emisiones con mayor
										rapidez, al tiempo que disminuyen los
										costes de la electricidad desde sus
										máximos actuales.
									</p>
									<p className='unidad-paragraph'>
										Si se mantienen las tasas actuales de
										expansión de la energía fotovoltaica,
										la energía eólica, los vehículos
										eléctricos y las baterías se lograría
										una transformación mucho más rápida
										que la prevista, aunque para ello se
										requieren políticas que fomenten dicha
										expansión, no solo en los mercados que
										lideran estas tecnologías, sino en
										todo el mundo.
									</p>

									<div className='unidad-info-box'>
										<p className='unidad-info-title'>
											Glosario
										</p>
										<p className='unidad-info-text'>
											Energía fotovoltaica. Energía
											obtenida a partir de la radiación
											del Sol para generar electricidad
											mediante paneles específicos.
										</p>
									</div>
								</section>

								<section>
									<h3 className='unidad-section-title'>
										Nuevos escenarios energéticos
										mundiales
									</h3>
									<p className='unidad-paragraph'>
										La crisis energética mundial está
										impulsando una serie de nuevas
										iniciativas, especialmente en países
										con economías avanzadas y en China,
										que apuntan a aumentar el ritmo del
										despliegue de energía limpia. Las
										medidas varían de una región a otra,
										pero en general apuntan a aumentar la
										participación de las energías
										renovables.
									</p>
									<p className='unidad-paragraph'>
										Varios países han adoptado políticas
										que fomentan la diversificación de las
										cadenas de suministro de tecnologías
										de energía limpia. Esto incluye
										políticas para promover la fabricación
										de tecnologías, por ejemplo, la Ley de
										Reducción de la Inflación en los
										Estados Unidos, la Ley de Industria
										Neto Cero en la Unión Europea y el
										Plan de Incentivos Vinculados a la
										Producción en la India, en la próxima
										década.
									</p>
									<ul className='unidad-consolidation-list'>
										<li>
											45 % de la electricidad generada en
											los Estados Unidos será renovable,
											arriba del 22 % actual.
										</li>
										<li>
											65 % de todos los autos vendidos en
											la Unión Europea serán eléctricos.
										</li>
										<li>
											55 % de crecimiento para América
											Lana y el Caribe por ingresos
											provenientes de la producción de
											minerales ulizados en tecnologías
											de energía limpia.
										</li>
										<li>
											45 % de los vehículos de dos o tres
											ruedas vendidos en el Sudeste
											Asiáco serán eléctricos.
										</li>
										<li>
											USD 17 mil millones en el gasto si
											se reducen las emisiones por el
											petróleo y las operaciones de gas
											metano en Eurasia en un 75 %.
										</li>
										<li>
											18 % de la electricidad generada en
											la India será de fuentes de energía
											solar al 6 % actual.
										</li>
									</ul>
									<p className='unidad-doc-footer'>
										Fuentes: IEA (2022). World Energy
										Outlook.
									</p>
								</section>

								<section>
									<h3 className='unidad-section-title'>
										Rol de los actores políticos en la
										preservación de los recursos
										energéticos
									</h3>
									<p className='unidad-paragraph'>
										En el 2023 se celebró en Dubái
										(Emiratos Árabes Unidos) la Cumbre de
										Naciones Unidas COP28, en donde se
										acordó un histórico pacto. Los
										representantes de casi 200 países
										acordaron, por primera vez, dar pasos
										para abandonar el uso del petróleo, el
										gas y el carbón (Doc. 3), con el fin
										de frenar el cambio climático.
									</p>
									<p className='unidad-paragraph'>
										El Secretario General de la
										Organización de las Naciones Unidas
										(ONU), António Guterres, hizo una
										mención enfática a que la eliminación
										progresiva de los combustibles fósiles
										es inevitable.
									</p>									
								</section>

								<section>
									<h3 className='unidad-section-title'>
										América Latina y los recursos
										energéticos
									</h3>
									<p className='unidad-paragraph'>
										La Comisión Económica para América
										Latina y el Caribe (CEPAL) indicó que
										países como Argentina, Brasil, Chile,
										Perú, Bolivia, Costa Rica y México
										tienen potencial para desarrollar una
										industria del hidrógeno verde
										competitiva, replicando capacidades de
										otras regiones. Para ello, es esencial
										un marco político, institucional y
										legal adecuado, incluirlo en las
										agendas públicas y apoyar al sector
										privado.
									</p>
									<p className='unidad-paragraph'>
										Un ejemplo destacado es la integración
										energética regional entre México y los
										países del norte de Centroamérica,
										objetivo del Plan de Desarrollo
										Integral (PDI) para El Salvador,
										Guatemala, Honduras y el sureste de
										México. Este plan propone un sistema
										de interconexión eléctrica y un
										gasoducto entre estos países.
									</p>

									<h3 className='unidad-section-title'>
										El Salvador y los recursos
										energéticos
									</h3>
									<p className='unidad-paragraph'>
										Según el Programa de las Naciones
										Unidas para el Desarrollo (PNUD), en
										El Salvador la cobertura de energía
										eléctrica es alta, tanto en la zona
										rural (93 %) como en la zona urbana
										(95 %). La Comisión Ejecutiva
										Hidroeléctrica del Río Lempa (CEL)
										indica que para el año 2021 las
										principales generadoras de energía
										renovables fueron la hidroeléctrica,
										la geotérmica y la solar, que
										suministraron un 83 % de la
										electricidad que llegó a los hogares
										salvadoreños.
									</p>
									<p className='unidad-paragraph'>
										El Salvador se ha logrado posicionar
										con los precios más competitivos de la
										región y reducir el costo de la
										energía eléctrica en todo el país.
										Además, CEL continúa con la
										diversificación de las fuentes de
										energía renovable; por ejemplo, la
										puesta en marcha de la Planta Talnique
										Solar, de Inversiones Energéticas
										(INE) (Doc. 4). Otro proyecto de
										energía renovable ha sido el Proyecto
										Solar Fotovoltaico Bósforo, que surgió
										de la alianza entre AES El Salvador y
										la Corporación Multi Inversiones (CMI)
										de Guatemala, y que está beneficiando
										a 215 000 usuarios.
									</p>

									<div className='unidad-doc-box'>
										<p className='unidad-doc-kicker'>
											Doc. 4 — Existen relaciones
											directas entre el uso energético y
											la calidad de vida
										</p>
										<p className='unidad-doc-text'>
											La energía tiene consecuencias
											tanto positivas como negativas en
											las sociedades. El acceso a una
											energía abundante, económica,
											segura y limpia es beneficioso para
											los seres humanos. Pero la
											extracción de energía, el transporte
											y su uso pueden tener consecuencias
											negativas para la salud, el medio
											ambiente y la economía de una
											sociedad. Además, confiar en la
											energía importada puede crear
											vulnerabilidades en el sistema de
											la seguridad de una nación. Las
											consecuencias de las decisiones
											energéticas no son las mismas para
											todas las personas. Las comunidades
											de bajos ingresos o marginadas
											tienen más probabilidades de sufrir
											las consecuencias negativas de las
											decisiones energéticas, ya que
											tienen una capacidad reducida de
											adaptación y pueden carecer de
											poder de negociación en comparación
											a otras comunidades con más
											recursos monetarios.
										</p>
										<p className='unidad-doc-footer'>
											Fuente:
											https://cleanet.org/clean/literacy/energy/spanish/energy7.html
										</p>
									</div>

									<div className='unidad-info-box'>
										<p className='unidad-info-title'>
											Conexión geográfica
										</p>
										<p className='unidad-info-text'>
											Todas las sociedades necesitan
											energía. Pero el uso de la energía
											está vinculado a muchas
											preocupaciones ambientales y
											sociales. Ninguna forma de energía
											está libre de impacto, pero algunas
											formas son ciertamente mejores que
											otras.
										</p>
									</div>
								</section>

								<section>
									

									<div className='unidad-doc-box'>
										<p className='unidad-doc-kicker'>
											Doc. 5 — Arranca construcción de la
											primera planta fotovoltaica del
											Estado
										</p>
										<p className='unidad-doc-text'>
											La Comisión Ejecutiva
											Hidroeléctrica del Río Lempa (CEL)
											colocó la primera piedra para la
											construcción de la primera planta
											de generación fotovoltaica del
											Estado salvadoreño, que se
											edificará en el municipio de
											Talnique, departamento de La
											Libertad y que tendrá una capacidad
											instalada de 17 MW Pico.
										</p>
										<p className='unidad-doc-text'>
											Se trata del proyecto «Talnique
											Solar», que será ejecutado a través
											de Inversiones Energéticas (INE),
											una de las empresas subsidiarias de
											CEL, y cuya inversión es de $20
											millones, permitiendo generar
											energía renovable para 25 mil
											hogares salvadoreños, que consumen
											en promedio 100 kWh.
										</p>
										<p className='unidad-doc-text'>
											El proyecto estatal tiene un alto
											impacto ambiental, pues evitará la
											emisión de 20 mil toneladas de
											dióxido de carbono (CO2) y como
											parte de su medida social,
											construirá un aula didáctica que
											estará a disposición de toda la
											comunidad estudiantil del país para
											enseñar cómo se genera energía a
											partir de la radiación del sol.
										</p>
										<p className='unidad-doc-text'>
											Talnique Solar, que generará 100
											empleos directos en su fase de
											construcción y 300 indirectos, es
											la puerta para que la empresa
											subsidiaria de CEL migre a
											generación renovable.
										</p>
										<p className='unidad-doc-text'>
											Actualmente, Inversiones
											Energéticas es una empresa que
											genera energía a través de los
											derivados del petróleo, por lo que
											con este proyecto comienza a hacer
											un giro de negocio, mediante la
											generación de energía limpia y no
											contaminante.
										</p>
										<p className='unidad-doc-footer'>
											Fuente: Comisión Ejecutiva del Río
											Lempa.
											https://www.cel.gob.sv/arranca-construccion-de-la-primera-planta-fotovoltai-ca-del-estado/
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
										src="https://res.cloudinary.com/dutglmj02/video/upload/v1775580622/unidad1Semana4_ibph0g.mp4"
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

export default Semana4Screen

