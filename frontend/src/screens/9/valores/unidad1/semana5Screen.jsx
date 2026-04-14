import React, { useState, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom';
import Sidebar from '../../../../components/Sidebar'
import Header from '../../../../components/Header'
import '../../../../App.css'

function Semana5Screen () {
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
                const response = await fetch('/unidad1Semana5.vtt');
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
										Unidad 1 · Semana 5
									</h1>
									<h2 className='unidad-subtitle valores-semana1-subtitle'>
										Estado nutricional y sustentabilidad
										para una seguridad alimentaria mundial
									</h2>
								</div>


								<section>
									<h3 className='unidad-section-title'>
										Exploración
									</h3>

									<div className='unidad-doc-box'>
										<p className='unidad-doc-kicker'>
											Doc. 1 — Día Mundial de la
											Alimentación (DMA)
										</p>
										<p className='unidad-doc-text'>
											El 16 de octubre, la Organización
											de las Naciones Unidas para la
											Alimentación y la Agricultura (FAO)
											celebra el Día Mundial de la
											Alimentación (DMA).
										</p>
										<p className='unidad-doc-text'>
											El DMA nos hace ver que la forma de
											producir, consumir y,
											lamentablemente, la manera en que
											desperdiciamos alimentos está
											cobrando precio muy alto a nuestro
											planeta, ejerciendo una presión
											innecesaria en los recursos
											naturales, el medioambiente y el
											clima.
										</p>
										<p className='unidad-doc-text'>
											El DMA pone la mirada en los
											sistemas alimentarios y destaca la
											necesidad de fortalecerlos y
											volverlos más sostenibles. Un
											sistema alimentario sostenible es
											aquel que garantiza la seguridad
											alimentaria y la nutrición de todas
											las personas de tal forma que no se
											pongan en riesgo las bases
											económicas, sociales y ambientales.
										</p>
										<p className='unidad-doc-text'>
											Para gran parte de la población
											mundial, el desperdicio de
											alimentos se ha convertido en
											costumbre: comprar más alimentos de
											los que necesitamos en los
											mercados, dejar que las frutas y
											hortalizas se estropeen en casa o
											servir porciones más grandes de lo
											que podemos comer. Se estima que
											América Latina pierde o desperdicia
											hasta 127 millones de toneladas de
											alimentos al año. Es decir, 348 000
											toneladas cada día.
										</p>
										<p className='unidad-doc-footer'>
											Fuente: FAO El Salvador (2021). FAO
											llama a unir esfuerzos para tener
											una mejor producción, una mejor
											nutrición, un mejor
											medioambiente, para una vida
											mejor.
										</p>
									</div>									
								</section>

								<section>
									<h3 className='unidad-section-title'>
										Panorama global de los recursos
										naturales
									</h3>
									<p className='unidad-paragraph'>
										Recientes investigaciones han
										demostrado que la forma en que se
										utilizan los recursos naturales tiene
										profundas consecuencias para la
										seguridad alimentaria. De la
										sustentabilidad de los recursos
										naturales depende en gran medida la
										seguridad alimentaria a escala
										mundial. Algunos de estos recursos
										son:
									</p>

									<div className='unidad-doc-box'>
										<p className='unidad-doc-kicker'>
											Profundización — Recursos
											naturales
										</p>
										<ul className='unidad-consolidation-list'>
											<li>
												Metales. El crecimiento del 2.7
												% anual en el uso de minerales
												metálicos desde 1970 refleja la
												importancia de los metales en la
												construcción, la
												infraestructura, la
												manufactura y los bienes de
												consumo. La cadena de producción
												mundial de hierro y acero
												ocasiona los mayores impactos en
												términos de cambio climático y
												representa alrededor de una
												cuarta parte de la demanda de
												energía industrial en el mundo.
											</li>
											<li>
												Biomasa. El tonelaje total de la
												demanda de biomasa aumentó de 9
												mil millones a 24 mil millones
												de toneladas entre 1970 y 2017,
												principalmente en las categorías
												de cultivos y pastoreo.
												Actualmente el cultivo de
												biomasa y su procesamiento son
												responsables de casi el 90 % del
												estrés hídrico en el mundo y de
												la pérdida de biodiversidad
												relacionada con el uso del
												suelo.
											</li>
											<li>
												Agua. En la segunda mitad del
												siglo XX la extracción mundial
												de agua para la agricultura, las
												industrias y los municipios
												creció a un ritmo más rápido que
												la población humana. Entre 1970
												y 2010, la tasa de crecimiento
												de extracción de agua disminuyó,
												pero aun así pasó de 2500 km³ a
												3900 km³ por año. Entre 2000 y
												2012, el 70 % del agua extraída
												en el mundo se utilizó para la
												agricultura, principalmente para
												el riego, mientras que las
												industrias extrajeron el 19 % y
												los municipios el 11 %.
											</li>
											<li>
												Tierra. Entre 2000 y 2010, el
												área total de tierras para
												cultivos en el mundo aumentó de
												15.2 millones de km² a 15.4
												millones de km². El área de
												tierras de cultivo disminuyó en
												Europa y Norteamérica, pero
												aumentó en África, Latinoamérica
												y Asia. El área global de
												pastos disminuyó de 31.3
												millones de km² a 30.9 millones
												de km². África y Latinoamérica
												experimentaron una ligera
												pérdida neta de bosques,
												mientras que las otras regiones
												del mundo tuvieron ligeros
												aumentos netos.
											</li>
											<li>
												Combustibles fósiles. El uso de
												carbón, petróleo y gas natural
												aumentó de 6 mil millones de
												toneladas en 1970 a 15 mil
												millones en 2017, pero la
												proporción de la extracción
												mundial total disminuyó del 23 %
												al 16 %. La extracción, el
												procesamiento, la distribución y
												el consumo contribuyen
												considerablemente a la
												contaminación ambiental y
												especialmente a la contaminación
												del aire.
											</li>
											<li>
												Minerales no metálicos. La
												arena, la grava y la arcilla
												representan la mayor parte de
												los minerales no metálicos
												utilizados. El incremento en el
												uso de estos pasó de 9 mil
												millones a 44 mil millones de
												toneladas entre 1970 y 2017, lo
												que representa un gran cambio en
												la extracción global de biomasa
												a minerales.
											</li>
										</ul>
										<p className='unidad-doc-footer'>
											Fuente: PNUMA, informes sobre
											recursos naturales.
										</p>
									</div>

									<div className='unidad-info-box'>
										<p className='unidad-info-title'>
											Conexión geográfica
										</p>
										<p className='unidad-info-text'>
											A nivel global, la agricultura, y
											especialmente el consumo de
											alimentos en los hogares, es el
											principal factor generador de la
											pérdida de biodiversidad y el
											estrés hídrico.
										</p>
									</div>
								</section>

								<section>
									<h3 className='unidad-section-title'>
										Sustentabilidad de los recursos
										naturales
									</h3>
									<p className='unidad-paragraph'>
										Lograr la sustentabilidad de los
										recursos es un desafío urgente, lo que
										consiste en satisfacer las necesidades
										de todas las personas garantizando la
										seguridad alimentaria. Para alcanzar
										este objetivo ambicioso, pero
										fundamental, es preciso que los
										Gobiernos, las empresas, la sociedad
										civil y las personas redefinan lo que
										se entiende por progreso e innoven
										para cambiar las decisiones, los
										estilos de vida y las conductas.
									</p>
									<p className='unidad-paragraph'>
										Si no se emprenden acciones urgentes y
										concertadas, el rápido crecimiento y
										el uso ineficiente de los recursos
										naturales continuarán generando
										presiones insostenibles sobre el
										medioambiente y la alimentación.
									</p>
									<p className='unidad-paragraph'>
										El Programa de las Naciones Unidas
										para el Medio Ambiente (PNUMA)
										presenta una serie de herramientas que
										pueden generar cambios significativos,
										incluido el cambio transformacional a
										escalas local, nacional y mundial,
										para todos los responsables de la
										formulación de políticas. Estas son:
									</p>

									<div className='unidad-doc-box'>
										<p className='unidad-doc-kicker'>
											Herramientas para la
											sustentabilidad
										</p>
										<ul className='unidad-consolidation-list'>
											<li>
												Indicadores y metas. Las metas
												nacionales e internacionales de
												eficiencia de los recursos son
												un primer paso importante para
												llegar a niveles sostenibles de
												consumo de los recursos a nivel
												global.
											</li>
											<li>
												Superar la resistencia al
												cambio. Es probable que el
												progreso hacia la
												sostenibilidad conlleve la
												eliminación gradual de ciertas
												industrias y de los empleos que
												estas proporcionan.
											</li>
											<li>
												Combinación de políticas. La
												eficiencia de los recursos
												depende de una combinación de
												acciones en torno a las
												políticas, por ejemplo,
												integrando la legislación sobre
												recursos naturales con las
												políticas de biodiversidad y
												clima.
											</li>
											<li>
												Financiamiento sostenible. Los
												Gobiernos pueden proporcionar
												incentivos fiscales y bonos para
												los proyectos ambientales, y las
												fuentes privadas de financiación
												pueden proporcionar herramientas
												que sean accesibles a nivel
												local.
											</li>
										</ul>
									</div>
								</section>

								<section>
									<h3 className='unidad-section-title'>
										Situación actual de la seguridad
										alimentaria en el mundo
									</h3>
									<div className='unidad-doc-box'>
										<p className='unidad-doc-kicker'>
											Doc. 2 — Seguridad alimentaria
										</p>
										<p className='unidad-doc-text'>
											La Organización de las Naciones
											Unidas para la Alimentación y la
											Agricultura (FAO) presentó en el año
											2023 una evaluación relativa al
											hambre y la seguridad alimentaria.
											Algunos de los datos más
											significativos fueron los
											siguientes:
										</p>
										<ul className='unidad-consolidation-list'>
											<li>
												Se estima que en 2022
												padecieron hambre en todo el
												mundo de 691 a 783 millones de
												personas.
											</li>
											<li>
												En 2022 existía un total de 735
												millones de personas
												subalimentadas, de las cuales
												Asia albergaba el 55 % (402
												millones) de la población del
												mundo afectada por el hambre,
												mientras que más del 38 % (282
												millones) vivía en África.
											</li>
											<li>
												La relativa ausencia de
												variaciones en el hambre a nivel
												mundial de 2021 a 2022 oculta
												diferencias sustanciales en los
												planos regional y subregional.
											</li>
											<li>
												La recuperación económica tras
												la pandemia observada en 2021 se
												ralentizó en 2022.
											</li>
											<li>
												La inseguridad alimentaria
												afecta más a las mujeres que a
												los hombres en todas las
												regiones del mundo.
											</li>
										</ul>
										<p className='unidad-doc-footer'>
											Fuente: FAO (2023). El estado de la
											seguridad alimentaria y la
											nutrición en el mundo.
										</p>
									</div>

									<div className='unidad-doc-box'>
										<p className='unidad-doc-kicker'>
											Doc. 3 — Distribución de la
											inseguridad alimentaria
										</p>
										<p className='unidad-doc-text'>
											La concentración y la distribución
											de la seguridad alimentaria por
											nivel de gravedad difieren en gran
											medida entre las regiones del
											mundo, como se muestra en la
											gráfica correspondiente.
										</p>
									</div>									
								</section>

								<section>
									<h3 className='unidad-section-title'>
										La industria alimentaria y su relación
										con la malnutrición
									</h3>
									<p className='unidad-paragraph'>
										La industria alimentaria se ocupa de
										la producción, distribución y
										comercialización global de alimentos,
										generando ingresos significativos
										anualmente. Su impacto clave abarca la
										nutrición humana y la salud pública.
									</p>
									<p className='unidad-paragraph'>
										La preocupación central radica en su
										papel en la malnutrición, que incluye
										desequilibrios nutricionales como
										obesidad, desnutrición y enfermedades
										crónicas (anemia, hipertensión,
										diabetes). La industria alimentaria
										contribuye a la malnutrición a través
										de diversos factores, entre los que se
										pueden mencionar:
									</p>

									<ul className='unidad-consolidation-list'>
										<li>
											La producción y comercialización de
											comida ultraprocesada. Estos
											productos son ricos en calorías,
											grasas, azúcares y sal, pero que
											carecen de nutrientes esenciales.
										</li>
										<li>
											La publicidad y la manipulación del
											consumidor. El etiquetado
											engañoso y la creación de productos
											con componentes adictivos son
											algunas técnicas para incrementar
											el consumo de productos poco
											saludables.
										</li>
										<li>
											El control de precios de los
											alimentos. La industria alimentaria
											tiene un gran poder de mercado, lo
											que le permite incidir en los
											precios. Esto dificulta el acceso a
											alimentos saludables que son más
											carros.
										</li>
									</ul>

									<div className='unidad-doc-box'>
										<p className='unidad-doc-kicker'>
											Estado nutricional del mundo
										</p>
										<p className='unidad-doc-text'>
											En las últimas décadas, la
											industria y los sistemas
											alimentarios han abastecido de una
											amplia gama de productos comestibles
											para una población mundial en
											rápido crecimiento y cada vez más
											urbanizada. No obstante, la falta
											de acceso a alimentos nutritivos
											afecta a casi 3 mil millones de
											personas, agravada por el consumo
											creciente de dietas ricas en
											productos altamente procesados con
											elevados contenidos de ingredientes
											químicos y artificiales, que tienen
											efectos secundarios a largo plazo.
										</p>
										<p className='unidad-doc-footer'>
											Fuente: 2022 Global Nutrition
											Report.
										</p>
									</div>

									<div className='unidad-info-box'>
										<p className='unidad-info-title'>
											Conexión geográfica
										</p>
										<p className='unidad-info-text'>
											Las tasas de obesidad infantil
											varían según la región y el país,
											siendo más prevalentes en áreas
											urbanas y en países con ingresos
											más altos.
										</p>
									</div>
								</section>

								<section>
									<h3 className='unidad-section-title'>
										Situación mundial de malnutrición
									</h3>									
									<p className='unidad-paragraph'>
										La importancia de una transformación
										en los sistemas alimentarios
										radica en que existen factores
										determinantes como conflictos, cambios
										climáticos y crisis económicas, que
										han afectado negativamente la
										seguridad alimentaria y nutrición
										global, profundizando la pobreza y la
										desigualdad.
									</p>
									<p className='unidad-paragraph'>
										A pesar de estos retos, si los
										sistemas alimentarios se transforman
										dotándolos de mayores adaptabilidades
										ante los factores identificados y
										estableciendo incentivos para
										proporcionar dietas accesibles y
										saludables de manera sostenible e
										inclusiva, pueden convertirse en una
										poderosa fuerza de cambio. Sin
										embargo, esta transformación requiere
										de diversos cambios estructurales en
										el sistema actual, entre los cuales se
										encuentran:
									</p>
									<ul className='unidad-consolidation-list'>
										<li>
											Generar un entorno propicio de
											instituciones, políticas, leyes,
											reglamentos e inversiones con
											objetivos coherentes y
											complementarios en todos los
											sectores.
										</li>
										<li>
											Ejecutar transiciones graduales en
											pequeña escala y cambios
											estructurales en las
											instituciones, la legislación y las
											normas a mayor escala, de manera
											coordinada e integrada.
										</li>
										<li>
											Adoptar medidas coordinadas por
											parte de todos los actores
											principales de los sectores público
											y privado.
										</li>
									</ul>
								</section>

								<section>
									<h3 className='unidad-section-title'>
										Políticas económicas vinculadas con la
										industria alimentaria
									</h3>
									<p className='unidad-paragraph'>
										El acceso a alimentos saludables no
										solo depende del costo. Muchos
										factores, como la cultura, el idioma y
										las prácticas alimenticias, influyen
										en la manera en que se obtienen y se
										consumen los alimentos. Por ello, para
										establecer entornos alimentarios más
										saludables, se necesitan políticas y
										leyes adaptadas a cada país que
										empoderen a los consumidores para
										adoptar hábitos nutritivos, saludables
										y sostenibles.
									</p>
									<p className='unidad-paragraph'>
										En relación con lo anterior, las
										políticas económicas vinculadas con la
										industria alimentaria son un
										instrumento importante para impulsar
										cambios en los hábitos de alimentación
										y solventar las problemáticas
										nutricionales actuales, que afectan a
										las poblaciones más vulnerables, como
										familias en situación de pobreza. Estas
										políticas pueden orientarse a
										incentivar la producción y el consumo
										de alimentos saludables y a proteger a
										los consumidores de productos carentes
										de nutrientes.
									</p>

									<div className='unidad-doc-box'>
										<p className='unidad-doc-kicker'>
											Glosario
										</p>
										<p className='unidad-doc-text'>
											Subvención. Ayuda económica
											brindada por una entidad, con el
											propósito de respaldar a empresas u
											organizaciones para realizar
											proyectos específicos, alcanzar
											objetivos o fomentar actividades de
											interés público.
										</p>
									</div>

									<div className='unidad-doc-box'>
										<p className='unidad-doc-kicker'>
											Políticas económicas y ejemplos
										</p>
										<table className='unidad-table'>
											<thead>
												<tr>
													<th>Política económica</th>
													<th>Objetivos</th>
													<th>Casos ejemplares</th>
												</tr>
											</thead>
											<tbody>
												<tr>
													<td>
														Aplicación de impuestos a
														los alimentos
														hipercalóricos con
														elevado contenido de
														grasas, azúcares o sal.
													</td>
													<td>
														Reducir el consumo de
														alimentos que repercuten
														negativamente en la
														salud humana.
													</td>
													<td>
														Perú. Desde 2019 se ha
														establecido un sistema
														fiscal escalonado conforme
														al cual corresponden
														impuestos más elevados a
														las bebidas con niveles
														más altos de azúcar.
													</td>
												</tr>
												<tr>
													<td>
														Concesión de subvenciones
														y eliminación de impuestos
														para los alimentos
														nutritivos.
													</td>
													<td>
														Garantizar que los
														alimentos nutritivos sean
														más asequibles que los
														alimentos hipercalóricos.
													</td>
													<td>
														Fiji. Eliminación de los
														aranceles de aduana sobre
														las hortalizas importadas.
														Kenya. Pequeñas y
														medianas empresas de las
														cadenas de suministro de
														frutas y hortalizas han
														recibido apoyo
														gubernamental con el
														objetivo de potenciar su
														función en la promoción de
														dietas saludables.
													</td>
												</tr>
												<tr>
													<td>
														Freno al alza y la
														volatilidad excesiva de
														los precios de los
														alimentos saludables o
														mitigación de sus
														efectos.
													</td>
													<td>
														Estabilizar los ingresos
														y el consumo de alimentos.
													</td>
													<td>
														Brasil. El Gobierno ha
														establecido un sistema de
														estabilización de precios
														para los alimentos
														básicos. India. El
														Gobierno implementó un
														programa de subsidios para
														los fertilizantes, lo que
														ha contribuido a mantener
														bajos los precios de los
														alimentos que se cultivan.
													</td>
												</tr>
												<tr>
													<td>
														Inversión en educación
														nutricional.
													</td>
													<td>
														Ayudar a las personas a
														tomar decisiones
														informadas sobre su
														alimentación.
													</td>
													<td>
														México. Organizaciones no
														gubernamentales y el
														Gobierno han impulsado
														campañas de educación
														nutricional para la
														población infantil.
													</td>
												</tr>
											</tbody>
										</table>
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
										src="https://res.cloudinary.com/dutglmj02/video/upload/v1775580622/unidad1semana5_ywz8da.mp4"
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

export default Semana5Screen

