import React, { useState } from 'react'
import Sidebar from '../../../../components/Sidebar'
import Header from '../../../../components/Header'
import '../../../../App.css'

function Semana1Unidad5Screen () {
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
										Unidad 5 · Semana 1
									</h1>
									<h2 className='unidad-subtitle'>
										Las emociones: importancia y gestión
										en la vida pública
									</h2>
								</div>

								<section>
									<h3 className='unidad-section-title'>
										La importancia de las emociones
									</h3>
									<p className='unidad-paragraph'>
										Las emociones juegan un papel decisivo
										en el desempeño de las personas en los
										diferentes espacios de actuación, ya
										que determinan el comportamiento, las
										reacciones ante diversas circunstancias
										y hasta la forma de establecer las
										relaciones interpersonales.
									</p>
									<p className='unidad-paragraph unidad-paragraph-bottom'>
										Por lo anterior, las emociones influyen
										en el ser humano en todos los ámbitos de
										la vida. Por ejemplo:
									</p>

									<div className='unidad-activities-grid'>
										<div className='unidad-activity-card'>
											<div
												className='unidad-activity-badge blue'
											>
												1
											</div>
											<h4 className='unidad-activity-title'>
												Ámbito laboral
											</h4>
											<p className='unidad-activity-text'>
												Inciden en la productividad,
												así como en la manera de
												afrontar las presiones y
												demandas del entorno laboral.
											</p>
										</div>
										<div className='unidad-activity-card'>
											<div
												className='unidad-activity-badge green'
											>
												2
											</div>
											<h4 className='unidad-activity-title'>
												Ámbito educativo
											</h4>
											<p className='unidad-activity-text'>
												Influyen en el rendimiento y en
												el establecimiento de metas.
											</p>
										</div>
										<div className='unidad-activity-card'>
											<div
												className='unidad-activity-badge orange'
											>
												3
											</div>
											<h4 className='unidad-activity-title'>
												Ámbito personal
											</h4>
											<p className='unidad-activity-text'>
												Conducen a la toma de decisiones
												y permiten expresarse ante
												diferentes circunstancias.
											</p>
										</div>
										<div className='unidad-activity-card'>
											<div
												className='unidad-activity-badge blue'
											>
												4
											</div>
											<h4 className='unidad-activity-title'>
												Ámbito social
											</h4>
											<p className='unidad-activity-text'>
												Posibilitan la comunicación
												efectiva y la capacidad de
												empatizar con las demás
												personas.
											</p>
										</div>
									</div>

									<p className='unidad-paragraph unidad-paragraph-bottom'>
										Las emociones son parte de la vida y
										como tal no están separadas de las
										manifestaciones de la persona en la
										sociedad. Por lo anterior, es importante
										que las personas puedan reconocer las
										emociones que les generan diferentes
										circunstancias y las reacciones que
										tienen ante estas, ya que estas
										emociones tienen tres componentes que
										permiten comprender la forma de actuar:
									</p>

									<h4 className='unidad-subheading'>
										Profundización
									</h4>
									<div className='unidad-problem-grid'>
										<div className='unidad-problem-card'>
											<h4 className='unidad-problem-title'>
												Físico
											</h4>
											<p className='unidad-problem-text'>
												Se refieren a las respuestas
												corporales que acompañan a las
												experiencias emocionales. Por
												ejemplo, una sonrisa ante una
												situación de alegría, o
												sudoración como reacción ante el
												miedo.
											</p>
										</div>
										<div className='unidad-problem-card'>
											<h4 className='unidad-problem-title'>
												Cognitivo
											</h4>
											<p className='unidad-problem-text'>
												Se refiere a los procesos
												mentales que interpretan,
												evalúan y asignan significado a
												las experiencias emocionales. Por
												ejemplo, mayor concentración al
												sentirse feliz, o pensamiento
												reflexivo al sentirse triste.
											</p>
										</div>
										<div className='unidad-problem-card'>
											<h4 className='unidad-problem-title'>
												Conductual
											</h4>
											<p className='unidad-problem-text'>
												Son las manifestaciones,
												expresiones y acciones externas
												que resultan de las emociones. Por
												ejemplo, mayor interacción con
												los demás al estar alegre, o
												gritar ante una situación que
												produce enojo.
											</p>
										</div>
									</div>

									<div className='unidad-web-note'>
										<p className='unidad-web-note-title'>
											En la web
										</p>
										<p className='unidad-web-note-text'>
											Cómo reconocer las emociones
										</p>
									</div>
								</section>

								<section>
									<h3 className='unidad-section-title'>
										La expresión de las emociones
									</h3>
									<p className='unidad-paragraph'>
										El ser humano no puede controlar las
										situaciones con las que se enfrenta cada
										día; por ejemplo, no puede evitar
										encontrarse en un tráfico lento. Tampoco
										es posible controlar la ansiedad, el
										enojo o la tristeza que dicha situación
										le genera.
									</p>
									<p className='unidad-paragraph'>
										Lo que la persona puede mediar y controlar
										(a partir de diferentes estrategias) es
										la forma en la que expresa la emoción que
										la situación provoca.
									</p>
									<p className='unidad-paragraph unidad-paragraph-bottom'>
										Compartir las emociones con los demás
										fortalece las relaciones y fomenta la
										conexión y la empatía. Cuando la persona
										se expresa permite que las personas que
										están alrededor la conozcan mejor y
										respondan de manera adecuada a las
										necesidades emocionales. Esto no solo
										enriquece las relaciones existentes,
										también facilita la formación de nuevas
										conexiones basadas en la comprensión y el
										apoyo mutuo.
									</p>

									<p className='unidad-table-caption'>
										Situación hipotética / Emociones
										involucradas / Formas adecuadas de
										expresión
									</p>
									<div className='unidad-table-wrap'>
										<table className='unidad-table'>
											<thead>
												<tr>
													<th>
														Situación hipotética
													</th>
													<th>
														Emociones involucradas
													</th>
													<th>
														Formas adecuadas de
														expresión
													</th>
												</tr>
											</thead>
											<tbody>
												<tr>
													<td>
														En una asamblea
														comunitaria, su equipo
														debe presentar una
														propuesta de proyecto
														para ejecutar en la
														localidad, la cual
														competirá con otras
														propuestas. Hay mucha
														expectativa entre los
														asistentes.
													</td>
													<td />
													<td />
												</tr>
												<tr>
													<td>
														En la carretera se
														encuentran con un
														accidente de tránsito
														en el que hay
														personas lesionadas.
														El conductor
														responsable del
														accidente huyó del
														lugar.
													</td>
													<td />
													<td />
												</tr>
												<tr>
													<td>
														En un encuentro
														deportivo, el equipo
														que fue derrotado se
														molestó con el equipo
														del que ustedes forman
														parte por no estar de
														acuerdo con los
														resultados. Esto
														generó un ambiente de
														tensión.
													</td>
													<td />
													<td />
												</tr>
											</tbody>
										</table>
									</div>

									<div className='unidad-web-note'>
										<p className='unidad-web-note-title'>
											En la web
										</p>
										<p className='unidad-web-note-text'>
											¿Por qué es importante expresar las
											emociones?
										</p>
									</div>

									<div className='unidad-info-box'>
										<p className='unidad-info-title'>
											Conexión ciudadana
										</p>
										<p className='unidad-info-text'>
											La capacidad de reconocer,
											comprender y gestionar las emociones
											propias y de los demás es crucial
											para el desarrollo de habilidades
											socioemocionales que permiten una
											mejor adaptación a los retos de la
											vida cotidiana.
										</p>
									</div>
								</section>

								<section>
									<h3 className='unidad-section-title'>
										La gestión de las emociones en la vida
										pública
									</h3>
									<p className='unidad-paragraph'>
										La gestión de las emociones es un
										elemento fundamental para el bienestar y
										la salud a lo largo de la vida; permite
										a las personas enfrentar, resolver,
										responder y adaptarse de manera adecuada
										a diversas situaciones, así como
										establecer relaciones interpersonales.
									</p>
									<p className='unidad-paragraph'>
										Para la gestión de las emociones es
										importante el desarrollo de la
										inteligencia emocional (Doc. 2), que
										permite desenvolverse en las relaciones
										humanas, tomar decisiones informadas y
										responder adecuadamente a diversas
										situaciones.
									</p>
									<p className='unidad-paragraph'>
										En la vida pública se viven situaciones
										que abarcan una diversidad de eventos y
										circunstancias que requieren una gestión
										y respuesta efectivas para promover el
										bienestar y el progreso de la sociedad.
									</p>
									<p className='unidad-paragraph'>
										La capacidad para enfrentar los desafíos
										de manera coordinada y eficiente es
										parte de la inteligencia emocional;
										además, es crucial para el desarrollo y
										la estabilidad de cualquier comunidad o
										nación. Por lo anterior, la gestión de
										las emociones no puede verse de manera
										aislada o personal, sino como parte de
										las realidades a las que las personas,
										grupos y sociedades se enfrentan
										cotidianamente.
									</p>
									<p className='unidad-paragraph unidad-paragraph-bottom'>
										Las emociones son un componente vital de
										la vida pública, ya que afectan la toma
										de decisiones, la comunicación, la
										cohesión social, el liderazgo y el
										bienestar general de la comunidad. La
										capacidad de gestionar y utilizar las
										emociones de manera efectiva es esencial
										para el funcionamiento armonioso y el
										desarrollo de la sociedad.
									</p>

									<div className='unidad-doc-box'>
										<p className='unidad-doc-kicker'>
											Doc. 2 Inteligencia emocional
										</p>
										<p className='unidad-doc-text'>
											La inteligencia se define como la
											capacidad de resolver problemas y de
											crear conductas que tienen un valor
											cultural, por lo tanto, la
											inteligencia emocional será la
											capacidad de resolver problemas de
											carácter emocional, que involucra el
											control de los impulsos que sentimos
											ante determinada situación.
										</p>
										<p className='unidad-doc-text'>
											La inteligencia emocional […]
											consiste en saber reconocer lo que se
											siente, controlar las respuestas
											emocionales, aprender a automotivarse
											y a entusiasmarse con lo que se
											quiere. Definir y conseguir metas,
											afrontar la vida con confianza y
											optimismo, comprender los sentimientos
											de los demás y relacionarse
											armoniosamente con ellos.
										</p>
										<p className='unidad-doc-footer'>
											Fuente: López, M. E. y Arango, M. T.
											(2002). Inteligencia emocional.
											Aprendiendo y creciendo juntos.
											Bogotá: Gamma.
										</p>
										<p className='unidad-doc-footer'>
											Fuente: Goleman, D. (1995).
											Inteligencia emocional. Por qué es
											más importante que el cociente
											intelectual. Barcelona: Kairós.
										</p>
									</div>

									<div className='unidad-info-box'>
										<p className='unidad-info-title'>
											Glosario
										</p>
										<p className='unidad-info-text'>
											<strong>Vida pública.</strong> Es el
											ámbito donde se desarrollan las
											relaciones sociales, se llevan a cabo
											actividades cívicas y políticas, y se
											promueven los intereses y el
											bienestar colectivos.
										</p>
									</div>
								</section>

								<section>
									<div className='unidad-doc-box'>
										<p className='unidad-doc-kicker'>
											Doc. 3 Tormenta tropical Amanda deja
											destrucción y desconsuelo a su paso
											por El Salvador
										</p>
										<p className='unidad-doc-text'>
											Fuertes lluvias, inundaciones y
											deslizamientos ha dejado a su paso
											por El Salvador la tormenta tropical
											Amanda provocando pérdidas humanas,
											entre ellas un niño, y poniendo en
											riesgo a miles de familias en todo el
											territorio. Las autoridades han
											realizado una evaluación de daños
											preliminar y estiman que tan solo en
											San Salvador 900 viviendas se han
											visto afectadas.
										</p>
										<p className='unidad-doc-footer'>
											Fuente: UNICEF- 01 Junio
											2020-Tormenta tropical Amanda deja
											destrucción.
										</p>
									</div>

									<h4 className='unidad-subheading'>
										La gestión de emociones en situaciones
										sociales complejas
									</h4>
									<p className='unidad-paragraph'>
										Gestionar las emociones de manera
										adecuada puede tener un impacto
										significativo en las relaciones y el
										bienestar general de una persona.
									</p>
									<p className='unidad-paragraph'>
										En situaciones sociales complejas,
										gestionar las emociones efectivamente
										requiere de varias técnicas que pueden
										ayudar a mantener el equilibrio
										emocional y mejorar las interacciones
										interpersonales. A continuación se
										describen algunas estrategias clave:
									</p>
									<p className='unidad-paragraph unidad-paragraph-bottom'>
										La práctica de técnicas para gestionar
										las emociones es determinante en la
										resolución o en las medidas que se tomen
										en situaciones complejas, como desastres
										naturales (Doc. 3), accidentes u otros.
									</p>

									<div className='unidad-problem-grid'>
										<div className='unidad-problem-card'>
											<h4 className='unidad-problem-title'>
												Autoconciencia emocional
											</h4>
											<p className='unidad-problem-text'>
												Tomarse un momento para
												identificar las emociones permite
												a la persona ganar perspectiva
												sobre su estado emocional antes de
												reaccionar.
											</p>
										</div>
										<div className='unidad-problem-card'>
											<h4 className='unidad-problem-title'>
												Regulación emocional
											</h4>
											<p className='unidad-problem-text'>
												Una vez identificadas las emociones
												es importante gestionarlas de
												manera adecuada utilizando
												técnicas como la respiración
												profunda, la meditación y otras.
											</p>
										</div>
										<div className='unidad-problem-card'>
											<h4 className='unidad-problem-title'>
												Comunicación efectiva
											</h4>
											<p className='unidad-problem-text'>
												Expresar los sentimientos de
												manera clara y asertiva,
												utilizando declaraciones como «Yo
												siento que...», en lugar de
												acusaciones, puede facilitar la
												comunicación.
											</p>
										</div>
										<div className='unidad-problem-card'>
											<h4 className='unidad-problem-title'>
												Empatía
											</h4>
											<p className='unidad-problem-text'>
												Intentar comprender las emociones
												y puntos de vista de los demás
												puede transformar una situación
												difícil en una oportunidad para
												fortalecer las relaciones.
											</p>
										</div>
										<div className='unidad-problem-card'>
											<h4 className='unidad-problem-title'>
												Preparación anticipada
											</h4>
											<p className='unidad-problem-text'>
												Planificar cómo abordar
												conversaciones difíciles o
												situaciones estresantes puede
												aumentar la confianza y reducir la
												ansiedad.
											</p>
										</div>
									</div>

									<div className='unidad-doc-box'>
										<p className='unidad-doc-kicker'>
											Doc. 4 Justicia social restaurativa
										</p>
										<p className='unidad-doc-text'>
											Los procesos regulatorios que prevén
											la expresión de emociones, como es el
											caso de la justicia social
											restaurativa, que pone en diálogo la
											expresión de emociones de personas
											víctimas y victimarias, son una parte
											importante para el desarrollo de
											prácticas emocionales compartidas en
											la justicia según la autora, ya que
											operan controlando e inhibiendo la
											manifestación de emociones reactivas
											dentro de un espacio público.
										</p>
										<p className='unidad-doc-footer'>
											Fuente: Revista Latinoamericana de
											Derechos Humanos, 23(1), I Semestre
											2012 (ISSN: 1659-4304).
										</p>
									</div>

									<h4 className='unidad-subheading'>
										Respuesta asertiva en situaciones
										sociales
									</h4>
									<p className='unidad-paragraph'>
										Una de las estrategias socioemocionales
										para el manejo y gestión de las emociones
										en contextos sociales es la habilidad de
										respuesta asertiva, que consiste en la
										capacidad de expresar lo que se piensa y
										se siente en el momento oportuno, de
										forma adecuada y sin perjudicar o
										transgredir los derechos de los demás.
									</p>
									<p className='unidad-paragraph'>
										Uno de los aspectos fundamentales para
										lograr resolver un conflicto radica en la
										claridad con que se comunican y se
										escuchan las expectativas de resolución
										entre las partes (asertividad). Suele ser
										común entre dos o más personas que están
										en conflicto que una malinterprete lo
										que otra ha dicho y reaccione
										defendiéndose ante lo que ha considerado
										una ofensa; por lo general, esto produce
										un aumento en la tensión y aleja el
										horizonte de resolución. Por tanto, una
										conducta asertiva contribuye a entender
										mejor el fondo y la forma de la disputa;
										una conducta no asertiva obstruye el
										proceso de resolución y puede llegar a
										ser en sí misma la causa del conflicto.
									</p>
									<p className='unidad-paragraph'>
										En los diferentes contextos de la vida
										pública, los conflictos son inevitables,
										a veces impredecibles, pero la gran
										mayoría de ellos se pueden resolver.
										Frente a una situación de conflicto,
										existen también otras habilidades que
										complementen la conducta asertiva, como la
										autorregulación, el control, el diálogo,
										la escucha, el silencio activo, la
										reciprocidad, la creatividad en la
										resolución de problemas, la empatía,
										entre otras.
									</p>
									<p className='unidad-paragraph unidad-paragraph-bottom'>
										Es importante destacar que la respuesta
										asertiva en el entorno social tiene como
										base la gestión adecuada de las
										emociones ante diferentes situaciones de
										la realidad social. Lo anterior, a
										veces, ante circunstancias adversas, como
										en casos de vulneraciones a los derechos
										de las poblaciones.
									</p>
									<p className='unidad-paragraph unidad-paragraph-bottom'>
										Para promover la conducta asertiva en las
										situaciones sociales adversas es preciso
										que los países implementen los procesos
										de justicia restaurativa en las
										poblaciones afectadas (Doc. 4).
									</p>

									<div className='unidad-info-box'>
										<p className='unidad-info-title'>
											Glosario
										</p>
										<p className='unidad-info-text'>
											<strong>
												Justicia restaurativa.
											</strong>{' '}
											Es el proceso para resolver un
											problema de impacto social que se
											enfoca en la compensación del daño a
											las víctimas haciendo a los
											delincuentes responsables, así como
											involucrando de forma activa al
											Estado y a la comunidad en la
											resolución de la situación.
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

export default Semana1Unidad5Screen
