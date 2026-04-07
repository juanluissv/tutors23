import React, { useState } from 'react'
import Sidebar from '../../../../components/Sidebar'
import Header from '../../../../components/Header'
import '../../../../App.css'

function Semana1Unidad6Screen () {
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
										Unidad 6 · Semana 1
									</h1>
									<h2 className='unidad-subtitle'>
										Los tipos de tecnología para la vida
										cotidiana
									</h2>
								</div>

								<section>
									<h3 className='unidad-section-title'>
										Las TIC, las TAC y las TEP
									</h3>
									<p className='unidad-paragraph'>
										Desde su aparición, las tecnologías han
										transformado muchos aspectos de la vida
										cotidiana de las personas, desde la
										forma de comunicarse hasta la manera en
										la que se aprende y se participa en la
										sociedad. En este contexto han emergido
										herramientas tecnológicas clave para
										potenciar el desarrollo individual y
										colectivo de la ciudadanía. Estas, en su
										conjunto, ofrecen un amplio abanico de
										oportunidades para acceder a
										información, mejorar la educación,
										fomentar la colaboración y promover una
										participación más activa en la vida
										democrática. Entre estas se encuentran:
									</p>
									<h4 className='unidad-subheading'>
										Profundización
									</h4>
									<div className='unidad-table-wrap'>
										<table className='unidad-table'>
											<thead>
												<tr>
													<th scope='col'>TIC</th>
													<th scope='col'>TAC</th>
													<th scope='col'>TEP</th>
												</tr>
												<tr>
													<th scope='col'>
														Tecnologías de la
														información y de la
														comunicación
													</th>
													<th scope='col'>
														Tecnologías del
														aprendizaje y del
														conocimiento
													</th>
													<th scope='col'>
														Tecnologías para el
														empoderamiento y la
														participación
													</th>
												</tr>
											</thead>
											<tbody>
												<tr>
													<td>
														<p className='unidad-paragraph'>
															Facilitan los
															procesos de
															comunicación,
															adquisición,
															transmisión e
															intercambio de
															información.
														</p>
														<p className='unidad-paragraph unidad-paragraph-bottom'>
															Abarcan desde
															dispositivos
															electrónicos, como
															computadoras y
															teléfonos
															inteligentes, hasta
															software,
															aplicaciones y
															redes sociales.
														</p>
													</td>
													<td>
														<p className='unidad-paragraph'>
															Potencian los
															procesos de
															enseñanza-aprendizaje
															y generan entornos
															virtuales de
															aprendizaje.
														</p>
														<p className='unidad-paragraph unidad-paragraph-bottom'>
															Algunos ejemplos de
															TAP son las
															plataformas de
															aprendizaje en
															línea, las
															herramientas de
															creación contenido,
															las aplicaciones
															interactivas y los
															recursos educativos
															digitales.
														</p>
													</td>
													<td>
														<p className='unidad-paragraph'>
															Fomentan la
															participación
															ciudadana con el
															fin de compartir
															conocimiento.
														</p>
														<p className='unidad-paragraph unidad-paragraph-bottom'>
															Entre las principales
															TEP se encuentran
															las plataformas de
															democracia digital,
															las redes sociales,
															los foros
															comunitarios y los
															blogs.
														</p>
													</td>
												</tr>
											</tbody>
										</table>
									</div>
								</section>

								<section>
									<h3 className='unidad-section-title'>
										Las TIC y sus ventajas
									</h3>
									<p className='unidad-paragraph'>
										El término tecnologías de la información
										y de la comunicación (TIC) abarca a
										todas las tecnologías utilizadas para la
										gestión y el intercambio de información
										a través de medios electrónicos y
										digitales.
									</p>
									<p className='unidad-paragraph'>
										Las TIC tienen sus raíces en la segunda
										mitad del siglo XX, cuando tecnologías
										de comunicación a distancia (como la
										radio, la televisión y el teléfono)
										comenzaron a integrarse con la
										informática y el desarrollo de internet,
										aumentando exponencialmente las
										posibilidades de comunicación y acceso a
										la información. Entre sus ventajas
										principales se encuentran:
									</p>
									<p className='unidad-paragraph unidad-paragraph-bottom'>
										Asimismo, las TIC tienen un impacto
										significativo en la economía, la
										educación y la vida social, lo que
										transforma la manera en que se realizan
										negocios, se imparte educación y se
										establecen relaciones interpersonales.
									</p>
									<ul className='unidad-activity-list'>
										<li>
											<strong>Instantaneidad.</strong>{' '}
											La comunicación y el intercambio de
											información a través de las TIC se
											realizan de forma casi instantánea,
											lo que supera las barreras
											geográficas y temporales.
										</li>
										<li>
											<strong>Interactividad.</strong>{' '}
											Permiten una comunicación
											bidireccional y en tiempo real, lo
											que fomenta la participación activa
											de los usuarios y la creación de
											contenidos colaborativos.
										</li>
										<li>
											<strong>Interconexión.</strong>{' '}
											Conectan a personas y dispositivos
											de todo el mundo a través de redes
											globales, lo que crea una red de
											conocimiento e información
											compartida.
										</li>
										<li>
											<strong>Innovación.</strong>{' '}
											Se encuentran en constante evolución
											generando nuevas herramientas y
											aplicaciones.
										</li>
										<li>
											<strong>Accesibilidad.</strong>{' '}
											Hacen que la información y los
											servicios sean accesibles desde
											cualquier lugar y en cualquier
											momento.
										</li>
										<li>
											<strong>Automatización.</strong>{' '}
											Brindan la posibilidad de automatizar
											tareas repetitivas y procesos
											complejos, con lo cual mejora la
											eficiencia y la productividad en
											diversos ámbitos.
										</li>
									</ul>
								</section>

								<section>
									<h3 className='unidad-section-title'>
										Los retos en la implementación y uso de
										las TIC
									</h3>
									<p className='unidad-paragraph'>
										Es fundamental comprender que las TIC no
										son neutras, positivas o negativas; su
										impacto depende del uso que se les dé.
										Sin embargo, si no se utilizan de manera
										adecuada, pueden agravar las desigualdades
										sociales. Por ello resulta crucial
										abordarlas con responsabilidad y dirigir
										su uso hacia el beneficio del desarrollo
										integral de las comunidades.
									</p>
									<p className='unidad-paragraph unidad-paragraph-bottom'>
										Aunque las tecnologías de la información
										y la comunicación no son indispensables
										para el desarrollo humano, es evidente
										que han llegado para quedarse. Por tanto,
										se considera urgente guiarlas para que
										desempeñen un rol social que favorezca el
										progreso de las comunidades,
										especialmente de los sectores más
										necesitados. El simple acceso a las TIC
										no resuelve por sí solo los problemas del
										desarrollo humano, es necesario promover
										un acceso equitativo y la apropiación
										social de estos recursos, yendo más allá
										de la mera conectividad. Además, la
										brecha digital amenaza con ampliar las
										desigualdades sociales, lo que obliga a
										reconsiderar el potencial de las TIC como
										herramientas para construir sociedades
										justas y equitativas.
									</p>
								</section>

								<section>
									<h3 className='unidad-section-title'>
										Las TAC y sus características
									</h3>
									<p className='unidad-paragraph'>
										Las tecnologías del aprendizaje y el
										conocimiento (TAC) son un conjunto de
										recursos digitales diseñados para mejorar
										y facilitar el proceso educativo. Estas
										incluyen plataformas en línea, recursos
										multimedia, aplicaciones interactivas y
										software especializado que apoya tanto a
										estudiantes como a educadores y potencia
										el aprendizaje y la adquisición de
										conocimientos. Las TAC surgieron como una
										evolución de las TIC, aplicadas
										específicamente al ámbito educativo
										(Doc. 1). Su desarrollo se ha visto
										impulsado por:
									</p>
									<ul className='unidad-activity-list'>
										<li>
											La creciente integración de
											computadoras y dispositivos móviles
											en las aulas a partir de los años
											1990.
										</li>
										<li>
											El acceso a internet, que permitió la
											creación y distribución de recursos
											educativos digitales.
										</li>
										<li>
											El desarrollo de aplicaciones
											interactivas y plataformas
											específicas para la educación.
										</li>
									</ul>
									<div className='unidad-doc-box'>
										<p className='unidad-doc-kicker'>
											Doc. 1 Las TIC aplicadas a
											situaciones de aprendizaje
										</p>
										<p className='unidad-doc-text'>
											Las tecnologías del aprendizaje y el
											conocimiento (TAC) se definen como
											las TIC orientadas hacia unos usos
											más formativos, tanto para el
											estudiante como para el profesor, con
											el objetivo de aprender más y mejor.
											Inciden especialmente en la
											metodología, en los usos de la
											tecnología y no únicamente en
											asegurar el dominio de una serie de
											herramientas informáticas. En
											definitiva, se trata de conocer y
											explorar los posibles usos didácticos
											que las TIC tienen para el
											aprendizaje y la docencia. Es decir,
											las TAC van más allá de aprender a
											usar las TIC y apuestan por explorar
											estas herramientas tecnológicas al
											servicio del aprendizaje.
										</p>
										<p className='unidad-doc-footer'>
											Fuente: Lozano R, De las TIC a las TAC
											tecnologías del aprendizaje y del
											conocimiento.
										</p>
									</div>
								</section>

								<section>
									<h3 className='unidad-section-title'>
										Ventajas de las TAC
									</h3>
									<p className='unidad-paragraph'>
										Entre las ventajas del uso de las TAC se
										encuentran:
									</p>
									<ul className='unidad-activity-list'>
										<li>
											Proveen a los estudiantes y
											educadores una amplia gama de
											materiales y recursos que facilitan el
											aprendizaje.
										</li>
										<li>
											Dinamizan el proceso educativo al
											mantener a los estudiantes motivados y
											comprometidos con su aprendizaje.
										</li>
										<li>
											Brindan herramientas para la
											colaboración en línea, facilitando la
											comunicación y el trabajo en equipo.
										</li>
										<li>
											Ofrecen la posibilidad de aprender en
											cualquier momento y lugar,
											adaptándose al ritmo, los horarios y
											las necesidades de los estudiantes.
										</li>
										<li>
											Proporcionan recursos y métodos
											innovadores que permiten a los
											educadores mejorar sus prácticas
											pedagógicas.
										</li>
										<li>
											Facilitan la adquisición de
											competencias digitales esenciales para
											el desarrollo personal y profesional
											de los estudiantes.
										</li>
									</ul>
								</section>

								<section>
									<h3 className='unidad-section-title'>
										Las TEP
									</h3>
									<p className='unidad-paragraph'>
										Las tecnologías para el empoderamiento y
										la participación (TEP) son herramientas
										y plataformas digitales diseñadas para
										facilitar la participación ciudadana y la
										colaboración comunitaria en diversos
										contextos sociales, políticos y
										económicos. Estas tecnologías permiten a
										los usuarios expresar sus opiniones,
										colaborar en proyectos comunes, influir
										en decisiones políticas y acceder a
										recursos que les ayuden a mejorar sus
										condiciones de vida.
									</p>
									<p className='unidad-paragraph'>
										Las TEP también emergen de la evolución de
										las tecnologías de la información y las
										comunicaciones (TIC). Mientras que las TAC
										se enfocan principalmente en el ámbito
										educativo, las TEP amplían su alcance a
										otros sectores y se centran en el ámbito
										social y político. Su desarrollo ha sido
										impulsado por:
									</p>
									<ul className='unidad-activity-list'>
										<li>
											Las iniciativas para aumentar la
											transparencia y la participación
											ciudadana en los procesos
											gubernamentales.
										</li>
										<li>
											La masificación del acceso a internet
											y el auge de las redes sociales como
											plataformas para la expresión y la
											organización ciudadana.
										</li>
									</ul>
									<div className='unidad-info-box'>
										<p className='unidad-info-title'>
											Conexión ciudadana
										</p>
										<p className='unidad-info-text'>
											El crowdfunding o financiamiento
											colectivo es una herramienta de las
											TEP que, a través de plataformas en
											línea, permite que proyectos
											innovadores y causas sociales que
											antes no tenían acceso a fuentes de
											financiamiento tradicionales puedan
											obtener los recursos necesarios para
											su realización, generando impactos
											positivos en la sociedad.
										</p>
									</div>
									<p className='unidad-paragraph unidad-paragraph-bottom'>
										El surgimiento de las TEP está
										estrechamente relacionado con el auge de
										las redes sociales y otras plataformas
										digitales que permiten la interacción y
										la colaboración en línea. Estas
										herramientas han demostrado su potencial
										para promover cambios sociales (Doc. 2).
									</p>
									<div className='unidad-doc-box'>
										<p className='unidad-doc-kicker'>
											Doc. 2 La participación ciudadana en
											la era tecnológica
										</p>
										<p className='unidad-doc-text'>
											Las nuevas tecnologías de la
											información han modificado y
											redefinido conceptualmente el sistema
											de los medios de comunicación a través
											de nuevas formas de producción y
											organización de la información. Más
											aún, los cambios que introduce la
											«galaxia internet» en la sociedad han
											dado lugar a perturbaciones en la
											identidad cultural y en la actividad
											social de los espacios públicos.
											Dichas transformaciones permiten al
											sujeto de la posmodernidad permear la
											realidad, personalizar su mundo,
											apropiarse de espacios de interacción,
											y con eso proyectar nuevas lógicas de
											participación en la sociedad. Con la
											aparición de los sistemas digitales y
											su apropiación en la sociedad, la
											ciudadanía cuenta con un amplio
											abanico de recursos de expresión y
											representación informativa dispuestos
											para explorar y vivir la democracia de
											forma creativa.
										</p>
										<p className='unidad-doc-footer'>
											Fuente: Caballero, F. (2007). Nuevas
											tecnologías de la información y
											participación ciudadana.
										</p>
									</div>
								</section>

								<section>
									<h3 className='unidad-section-title'>
										Ventajas de las TEP
									</h3>
									<p className='unidad-paragraph unidad-paragraph-bottom'>
										Las tecnologías para el empoderamiento y
										la participación (TEP) transforman la
										manera en que las personas se involucran
										en la sociedad, fomentando una
										participación más activa y democrática.
										Sus principales ventajas son:
									</p>
								</section>
							</div>
						</div>
					</div>
				</div>
			</div>
		</div>
	)
}

export default Semana1Unidad6Screen
