import React, { useState } from 'react'
import Sidebar from '../../../../components/Sidebar'
import Header from '../../../../components/Header'
import '../../../../App.css'

function Semana4Unidad5Screen () {
	const [isSidebarOpen, setIsSidebarOpen] = useState(
		window.innerWidth > 768,
	)

	const toggleSidebar = () => {
		setIsSidebarOpen(!isSidebarOpen)
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
					<div className='content-area'>
						<div className='center-content2'>
							<div className='unidad-wrapper'>
								<div className='unidad-header'>
									<h1 className='unidad-title'>
										Unidad 5 · Semana 4
									</h1>
									<h2 className='unidad-subtitle'>
										Proyecto de vida: importancia y
										limitantes
									</h2>
								</div>

								<section>
									<div className='unidad-doc-box'>
										<p className='unidad-doc-kicker'>
											Doc. 1
										</p>
										<p className='unidad-doc-text'>
											Fuente: Blumberg, N. (2024). Malala
											Yousafzai.
										</p>
										<p className='unidad-doc-text'>
											<strong>Malala Yousafzai</strong>
										</p>
										<p className='unidad-doc-text'>
											Malala Yousafzai era una excelente
											estudiante. Su padre, que fundó y
											dirigió la escuela a la que asistía
											[…] en la ciudad de Mingora, la
											alentó a seguir su camino. En 2007,
											El Tehrik-e-Taliban Pakistan (TTP)
											comenzó a imponer una estricta ley
											islámica, destruyendo o cerrando
											escuelas para niñas, prohibiendo a
											las mujeres cualquier papel activo en
											la sociedad y llevando a cabo
											atentados. Yousafzai y su familia
											huyeron de la región para
											protegerse, pero regresaron cuando las
											tensiones y la violencia disminuyeron
											[…].
										</p>
										<p className='unidad-doc-text'>
											Bajo el nombre de Gul Makai,
											Yousafzai comenzó a escribir
											entradas regulares para la BBC. Una
											vez que se conoció su identidad,
											comenzó a recibir un amplio
											reconocimiento por su activismo. Pero
											el 9 de octubre de 2012 recibió un
											disparo cuando regresaba a casa desde
											la escuela. […] El incidente provocó
											protestas y su causa fue acogida en
											todo el mundo, incluso por el enviado
											especial de las Naciones Unidas para
											la educación mundial […].
										</p>
									</div>
								</section>

								<section>
									<h3 className='unidad-section-title'>
										Importancia de construir el proyecto de
										vida
									</h3>
									<p className='unidad-paragraph'>
										El proyecto de vida se concibe como un
										proceso que estructura tanto las
										expectativas como las estrategias para
										lograrlas. Se construye a partir de las
										aspiraciones y de las posibilidades
										concretas de realización de acuerdo con
										la realidad social e histórica a la que
										pertenece el individuo.
									</p>
									<p className='unidad-paragraph'>
										El proyecto de vida es importante porque
										está relacionado con el desarrollo
										personal, un proceso que se produce a lo
										largo de la vida. Se vincula con su red
										de relaciones y articula las decisiones
										o acciones con las posibilidades y
										restricciones de un contexto. En este
										sentido, la realización personal debe
										comprenderse en el marco de las
										oportunidades que cada persona tiene a
										lo largo de toda su vida.
									</p>
									<p className='unidad-paragraph unidad-paragraph-bottom'>
										Un proyecto de vida abarca varios
										aspectos fundamentales que ayudan a una
										persona a planificar y alcanzar sus
										objetivos a lo largo de su vida. Estas
										dimensiones pueden variar según las
										prioridades y los valores individuales,
										pero generalmente incluyen:
									</p>

									<h4 className='unidad-subheading'>
										Profundización
									</h4>
									<div className='unidad-problem-grid'>
										<div className='unidad-problem-card'>
											<h4 className='unidad-problem-title'>
												Familiar
											</h4>
											<p className='unidad-problem-text'>
												Cultivar y mantener relaciones
												saludables con la familia.
											</p>
										</div>
										<div className='unidad-problem-card'>
											<h4 className='unidad-problem-title'>
												Social
											</h4>
											<p className='unidad-problem-text'>
												Formar y mantener relaciones
												significativas fuera del ámbito
												familiar.
											</p>
										</div>
										<div className='unidad-problem-card'>
											<h4 className='unidad-problem-title'>
												Económicas
											</h4>
											<p className='unidad-problem-text'>
												Gestionar el dinero de manera
												responsable, incluyendo el ahorro,
												la inversión y la planificación
												para el futuro.
											</p>
										</div>
										<div className='unidad-problem-card'>
											<h4 className='unidad-problem-title'>
												Profesional
											</h4>
											<p className='unidad-problem-text'>
												Aportar positivamente en el
												entorno laboral y en la sociedad a
												través del trabajo.
											</p>
										</div>
										<div className='unidad-problem-card'>
											<h4 className='unidad-problem-title'>
												Recreativa
											</h4>
											<p className='unidad-problem-text'>
												Dedicar tiempo a actividades que
												proporcionen placer y relajación.
											</p>
										</div>
										<div className='unidad-problem-card'>
											<h4 className='unidad-problem-title'>
												Personal
											</h4>
											<p className='unidad-problem-text'>
												Adquirir habilidades,
												conocimientos y experiencias que
												contribuyan al desarrollo y al
												cuidado de la salud.
											</p>
										</div>
										<div className='unidad-problem-card'>
											<h4 className='unidad-problem-title'>
												Realización personal
											</h4>
											<p className='unidad-problem-text'>
												Hace referencia al cumplimiento
												de los objetivos, anhelos y
												motivaciones para alcanzar el
												crecimiento personal.
											</p>
										</div>
									</div>
								</section>

								<section>
									<div className='unidad-info-box'>
										<p className='unidad-info-title'>
											Glosario
										</p>
										<p className='unidad-info-text'>
											<strong>Autoestima.</strong> Es la
											valoración, generalmente positiva, de
											sí mismo.
										</p>
									</div>

									<h3 className='unidad-section-title'>
										Características del proyecto de vida
									</h3>
									<p className='unidad-paragraph'>
										El proyecto de vida comprende aspectos
										intrapersonales e interpersonales de la
										vida humana. Se relaciona con factores
										personales y sociales como el contexto,
										las capacidades, los objetivos, la
										autorreflexión, la autodeterminación
										personal, la autovaloración y la búsqueda
										de la autorrealización, el
										autoconocimiento, la autoestima, la
										visión y el compromiso.
									</p>
									<p className='unidad-paragraph unidad-paragraph-bottom'>
										El proyecto de vida tiene características
										como:
									</p>

									<div className='unidad-problem-grid'>
										<div className='unidad-problem-card'>
											<h4 className='unidad-problem-title'>
												Valoración de uno mismo
											</h4>
											<p className='unidad-problem-text'>
												Es la capacidad para comprender y
												valorar las capacidades
												individuales con el fin de
												potenciar fortalezas y superar
												dificultades. El concepto implica
												también la idea del autocuidado
												como alternativa para el
												crecimiento personal.
											</p>
										</div>
										<div className='unidad-problem-card'>
											<h4 className='unidad-problem-title'>
												Relación con el entorno
											</h4>
											<p className='unidad-problem-text'>
												El entorno influye en el proyecto
												de vida en la medida en que
												determinan el sentido en que
												crecen y se desarrollan las
												personas. De esta manera se puede
												comprender, por ejemplo, la
												ocupación profesional que los
												hijos observan de sus padres.
											</p>
										</div>
										<div className='unidad-problem-card'>
											<h4 className='unidad-problem-title'>
												Proyección futura
											</h4>
											<p className='unidad-problem-text'>
												Hace referencia a la relación que
												establece el individuo con el
												futuro desde el presente a través
												de las estrategias que utiliza y
												las habilidades que desarrolla
												para construir su proyecto de
												vida. Se puede resumir a través de
												visión, objetivos, estrategias y
												habilidades.
											</p>
										</div>
									</div>
								</section>

								<section>
									<h3 className='unidad-section-title'>
										Etapas en la elaboración del proyecto de
										vida
									</h3>
									<p className='unidad-paragraph'>
										Para estructurar un proyecto de vida es
										necesario un proceso reflexivo que
										permita clarificar las metas y
										aspiraciones (Doc. 2). Una vez que se
										tiene claridad sobre ello, se debe
										trazar un plan para alcanzarlas.
									</p>
									<p className='unidad-paragraph unidad-paragraph-bottom'>
										Por lo tanto, el proyecto de vida remite
										a lo que se quiere y el plan a cómo se
										va a lograr, considerando que el plan de
										vida va cambiando y ajustándose según va
										cambiando la vida. Como todo plan, se
										deben considerar ciertas etapas o
										procesos:
									</p>

									<div className='unidad-doc-box'>
										<p className='unidad-doc-kicker'>
											Doc. 2 · Proyecto de vida
										</p>
										<p className='unidad-doc-text'>
											El proyecto de vida, precisamente, es
											la estructura general que encauzaría
											las direcciones de la personalidad en
											las diferentes áreas de la actividad y
											la vida social, de manera flexible y
											consistente, en una perspectiva
											temporal que organizan las principales
											aspiraciones y realizaciones actuales
											y futuras de la persona. En este
											sentido, la construcción del futuro
											personal abarca todas las esferas de
											la vida, desde la sentimental-amorosa,
											lo sociopolílica, la cultural
											recreativa, hasta la profesional.
											Todas estas esferas de vida pueden
											poseer una importancia fundamental en
											la vida del joven y determinan la
											formación de orientaciones o
											direcciones de su personalidad muy
											significativas.
										</p>
										<p className='unidad-doc-footer'>
											Fuente: D´Angelo, O. (2000).
											Proyecto de vida como categoría
											básica de interpretación de la
											identidad individual y social.
										</p>
									</div>

									<h4 className='unidad-subheading'>
										Etapas o procesos en la elaboración del
										proyecto de vida
									</h4>
									<div className='unidad-activities-grid'>
										<div className='unidad-activity-card'>
											<div
												className='unidad-activity-badge blue'
											>
												1
											</div>
											<h4 className='unidad-activity-title'>
												Reconocer valores y aspiraciones
											</h4>
											<p className='unidad-activity-text'>
												Para elaborar un proyecto de vida
												se deben reconocer valores,
												habilidades y posibilidades que
												permitan colocar en un plano más
												realista las metas y las
												aspiraciones que se desean
												alcanzar en la trayectoria vital.
												Esta etapa está marcada por un
												proceso de introspección y
												autorreflexión.
											</p>
										</div>
										<div className='unidad-activity-card'>
											<div
												className='unidad-activity-badge green'
											>
												2
											</div>
											<h4 className='unidad-activity-title'>
												Identificar metas a corto, mediano
												y largo plazo
											</h4>
											<p className='unidad-activity-text'>
												Una vez que se tiene claridad de
												las metas y las aspiraciones, así
												como de las habilidades y los
												valores que se tiene para
												alcanzarlas, es necesario fijar
												plazos. Estos plazos dependen, en
												gran media, del alcance de la
												meta.
											</p>
										</div>
										<div className='unidad-activity-card'>
											<div
												className='unidad-activity-badge orange'
											>
												3
											</div>
											<h4 className='unidad-activity-title'>
												Analizar riesgos y posibilidades de
												las metas
											</h4>
											<p className='unidad-activity-text'>
												Es posible que ciertas metas no se
												ajusten a la realidad, lo que
												podría implicar que se pierda el
												objetivo o se convierta en
												contratiempo para poder alcanzar
												el proyecto final. Si se analizan
												los riesgos, es más probable que se
												alcancen las metas propuestas.
											</p>
										</div>
										<div className='unidad-activity-card'>
											<div
												className='unidad-activity-badge blue'
											>
												4
											</div>
											<h4 className='unidad-activity-title'>
												Establecer acciones para alcanzar
												las metas
											</h4>
											<p className='unidad-activity-text'>
												El proyecto de vida se va
												alimentando de pequeñas acciones
												que en su conjunto concretan las
												metas y aspiraciones que se desea
												alcanzar. Es decir, que las
												acciones son el cómo puedo llegar
												a la meta.
											</p>
										</div>
									</div>

									<div className='unidad-info-box'>
										<p className='unidad-info-title'>
											Glosario
										</p>
										<p className='unidad-info-text'>
											<strong>Introspección.</strong>{' '}
											Consiste en la mirada interior que
											se dirige a los propios actos o
											estados de ánimo.
										</p>
									</div>
								</section>

								<section>
									<h3 className='unidad-section-title'>
										Circunstancias que limitan la
										construcción del proyecto de vida
									</h3>
									<p className='unidad-paragraph'>
										El proyecto de vida se construye
										sincrónicamente en múltiples escenarios.
										Por ello adquiere un carácter
										multidimensional que abarca diferentes
										áreas y dimensiones de la vida.
									</p>
									<p className='unidad-paragraph unidad-paragraph-bottom'>
										En este sentido, algunas de esas
										dimensiones que influyen en el proyecto
										de vida son el contexto histórico,
										social y económico de cada individuo.
									</p>

									<h4 className='unidad-subheading'>
										Contexto histórico
									</h4>
									<p className='unidad-paragraph'>
										El contexto histórico hace referencia a
										los diferentes acontecimientos y
										situaciones que el individuo ha vivido a
										lo largo de su vida. Se refiere a las
										condiciones y situaciones históricas,
										nacionales y locales, en las que se
										inserta el individuo.
									</p>
									<p className='unidad-paragraph unidad-paragraph-bottom'>
										Algunos aspectos históricos que influyen
										en el desarrollo de un proyecto de vida
										son:
									</p>

									<div className='unidad-web-note'>
										<p className='unidad-web-note-title'>
											En la web
										</p>
										<p className='unidad-web-note-text'>
											Mi proyecto de vida
										</p>
									</div>

									<p className='unidad-paragraph'>
										<strong>La familia.</strong> Influencia en
										la toma de decisiones, es en este núcleo
										donde el individuo se ha formado y ha
										adquirido valores, costumbres, etc. Así,
										factores como el clima familiar, las
										rupturas familiares, el cambio de las
										relaciones entre los hermanos o padres y
										la variación de las condiciones
										económicas puede impactar en las
										alternativas o acciones que orienten la
										proyección de vida.
									</p>
									<p className='unidad-paragraph unidad-paragraph-bottom'>
										<strong>El entorno.</strong> Es necesario
										tener en cuenta que más allá de la
										proyección futura, las posibilidades de
										autorrealización también van a depender
										de las oportunidades o limitaciones que
										ofrezca el contexto al cual pertenece el
										individuo. Es decir, las aspiraciones y
										realizaciones personales se van
										constituyendo a partir de las relaciones
										que el individuo establece con el
										territorio o desde las realidades que
										ofrece su entorno.
									</p>

									<h4 className='unidad-subheading'>
										Contexto social
									</h4>
									<p className='unidad-paragraph'>
										El contexto social puede definir las
										posibilidades o limitaciones que tiene el
										individuo y determinar las direcciones
										esenciales del proyecto de vida. La
										construcción del proyecto de vida está
										mediada no solo por las voluntades y las
										habilidades, sino por el logro de
										oportunidades como respuesta a los
										procesos de igualdad o desigualdad
										social.
									</p>
									<p className='unidad-paragraph unidad-paragraph-bottom'>
										Algunos aspectos sociales que influyen en
										la construcción del proyecto de vida son:
									</p>

									<h4 className='unidad-subheading'>
										Contexto económico
									</h4>
									<p className='unidad-paragraph'>
										El contexto del individuo y sus
										condiciones socioeconómicas de existencia
										determinan las posibilidades de acceder a
										procesos laborales o educativos y
										garantizan la inclusión social. En la
										construcción de un proyecto de vida se
										evidencia una interacción permanente
										entre dos aspectos.
									</p>
									<p className='unidad-paragraph'>
										En primer lugar, por factores
										estructurales, como los recursos
										económicos, y en segundo lugar, por
										factores subjetivos que pueden hacer
										variar las condiciones económicas o
										sociales en función de las relaciones
										establecidas con el contexto social,
										familiar o laboral.
									</p>
									<p className='unidad-paragraph'>
										En El Salvador, la Encuesta de Hogares de
										Propósitos Múltiples (EHPM) abarca cinco
										dimensiones esenciales de desarrollo y
										bienestar:
									</p>
									<ul className='unidad-steps-list'>
										<li>Educación</li>
										<li>Condiciones de la vivienda</li>
										<li>Trabajo y seguridad social</li>
										<li>
											Salud, servicios básicos y seguridad
											alimentaria
										</li>
										<li>Calidad del hábitat</li>
									</ul>

									<h4 className='unidad-subheading'>
										Educación
									</h4>
									<p className='unidad-paragraph'>
										La educación es formación de sentido y,
										sobre todo, formación de un sentido
										personal; anticipación y acción meditada y
										responsable sobre el lugar y las tareas
										del individuo en la sociedad y su
										autorrealización personal. Debe
										contribuir, por tanto, a la formación
										coherente de la identidad personal y
										social plena.
									</p>

									<h4 className='unidad-subheading'>
										Migración
									</h4>
									<p className='unidad-paragraph'>
										Se produce frecuentemente un
										desplazamiento de población joven hacia
										puntos de mayores oportunidades. Se
										asocia a la búsqueda de mejores
										oportunidades de desarrollo.
									</p>

									<h4 className='unidad-subheading'>
										Pobreza
									</h4>
									<p className='unidad-paragraph unidad-paragraph-bottom'>
										La pobreza afecta a grandes segmentos de
										la población joven. América Latina es
										una de las regiones con mayor pobreza del
										mundo. Esto advierte una gran diferencia
										en la estructura de oportunidades y los
										espacios para realizarlas.
									</p>

									<p className='unidad-paragraph unidad-paragraph-bottom'>
										Al abordar el entorno en que se
										desarrollan las historias de vida es
										preciso tener en cuenta la influencia de
										las relaciones familiares e
										interpersonales. Este entorno social está
										representado por diversos ámbitos de la
										vida humana. En efecto, la familia, las
										condiciones económicas, los amigos o los
										referentes culturales pueden tener un
										peso en la toma de decisiones o en los
										logros de las dimensiones laboral,
										profesional o social.
									</p>
								</section>

								<section>
									<h4 className='unidad-subheading'>
										Consolidación
									</h4>

									<div className='unidad-doc-box'>
										<p className='unidad-doc-kicker'>
											Doc. 3 · María Julia Hernández
										</p>
										<p className='unidad-doc-text'>
											[...] Ella era meticulosa, tenaz, no
											tenía horario; con una capacidad de
											trabajo tremenda, un empecinamiento en
											las cosas que quería conseguir y un
											gusto de estar con la gente que
											sufría y de expresarle su total
											solidaridad. Así era María Julia.
										</p>
										<p className='unidad-doc-text'>
											Quizá por ello su caso más relevante fue
											El Mozote [...]
										</p>
										<p className='unidad-doc-text'>
											María Julia estuvo al frente de ese
											acontecimiento, segundo a segundo (la
											tengo tan presente vestida de caqui,
											con su sombrero beige y su cámara como
											parte de su atuendo), y realmente es
											una investigación ejemplar. Creo que es
											el hecho más grande que María Julia
											investigó, su mayor victoria en el
											campo de los derechos humanos. Por
											ello, cuando uno va a El Mozote y
											encuentra la tumba de Rufina,
											encuentra todo aquello que nos recuerda
											un momento histórico de nuestro país,
											¡un momento terrible!, y es gracias a
											María Julia que conocemos al detalle
											todo lo que ahí pasó.
										</p>
										<p className='unidad-doc-text'>
											[...] Por todo esto, pues, considero que
											rendirle homenaje a mujer tan valiente
											es algo de justicia.
										</p>
										<p className='unidad-doc-footer'>
											Fuente: Dirección General de Cultura,
											Ministerio de Relaciones Exteriores El
											Salvador. 1810-2010 (2011). Mujeres y
											hombres protagonistas de nuestra
											historia. Págs. 30 y 31.
										</p>
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

export default Semana4Unidad5Screen
