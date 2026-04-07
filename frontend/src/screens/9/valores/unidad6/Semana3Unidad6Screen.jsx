import React, { useState } from 'react'
import Sidebar from '../../../../components/Sidebar'
import Header from '../../../../components/Header'
import '../../../../App.css'

function Semana3Unidad6Screen () {
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
										Unidad 6 · Semana 3
									</h1>
									<h2 className='unidad-subtitle'>
										Ciudadanía digital: la ciberseguridad y
										su importancia
									</h2>
								</div>

								<div className='unidad-doc-box'>
									<p className='unidad-doc-kicker'>Doc. 1</p>
									<p className='unidad-doc-text'>
										WannaCry es un ejemplo de ransomware de
										cifrado, un tipo de software malicioso
										(malware) que los ciberdelincuentes
										utilizan a fin de extorsionar a un
										usuario para que pague [...].
									</p>
									<p className='unidad-doc-text'>
										[...] El ataque de ransomware WannaCry
										fue una epidemia global que tuvo lugar en
										mayo de 2017. Este ataque ransomware se
										propagó a través de ordenadores con
										Microsoft Windows. Los archivos del
										usuario se mantuvieron retenidos y se
										solicitó un rescate en bitcoins para su
										devolución [...].
									</p>
									<p className='unidad-doc-text'>
										[...] El ataque de ransomware WannaCry
										afectó aproximadamente a 230 000
										ordenadores en todo el mundo. Una de las
										primeras empresas afectadas fue
										Telefónica, la empresa de telefonía
										española. Para el 12 de mayo, miles de
										hospitales y clínicas del Servicio
										Nacional de Salud (NHS) del Reino Unido
										estaban comprometidos [...].
									</p>
									<p className='unidad-doc-text'>
										[...] El ransomware se extendió más allá
										de Europa, y se paralizaron los sistemas
										informáticos de 150 países. El ataque de
										ransomware WannaCry tuvo un impacto
										financiero significativo en todo el
										mundo. Se estima que este cibercrimen
										provocó pérdidas por valor de 4000
										millones de dólares en todo el mundo
										[...].
									</p>
									<p className='unidad-doc-text'>
										¿Qué es el ransomware WannaCry?
									</p>
									<p className='unidad-doc-footer'>
										Fuente: Kaspersky (2024). ¿Qué es el
										ransomware WannaCry?
									</p>
								</div>

								<div className='unidad-table-wrap'>
									<table className='unidad-table'>
										<tbody>
											<tr>
												<th scope='row'>Software</th>
												<td>Ciberamenaza</td>
											</tr>
											<tr>
												<th scope='row'>Malware</th>
												<td>Ciberseguridad</td>
											</tr>
											<tr>
												<th scope='row'>Hardware</th>
												<td>Cibercrimen</td>
											</tr>
										</tbody>
									</table>
								</div>

								<section>
									<h3 className='unidad-section-title'>
										La ciberseguridad
									</h3>
									<p className='unidad-paragraph'>
										El creciente desarrollo y uso de las
										tecnologías de la información y de la
										comunicación (TIC) tiene un impacto cada
										vez mayor en todas las esferas de la
										sociedad. Las TIC representan un promotor
										del progreso de las sociedades,
										ofreciendo ventajas para el desarrollo
										socioeconómico de los países y creando
										nuevos espacios de cooperación.
									</p>
									<p className='unidad-paragraph'>
										Sin embargo, no se puede desconocer que a
										medida que estas se han desarrollado, las
										amenazas derivadas del uso malicioso de
										las TIC son también crecientes y de
										naturaleza cambiante, lo que se ha
										convertido en una preocupación para los
										Estados y uno de los retos a enfrentar
										debido a las amenazas derivadas para la
										paz y la seguridad internacionales.
									</p>
									<p className='unidad-paragraph unidad-paragraph-bottom'>
										En este sentido, la ciberseguridad es un
										tema que está cobrando mucha importancia
										en el mundo, ya que los ataques
										informáticos son cada vez más frecuentes
										y sofisticados. El siguiente esquema
										plantea los contextos de su aplicación:
									</p>
									<h4 className='unidad-subheading'>
										Profundización · Semana 3
									</h4>
									<div className='unidad-web-note'>
										<p className='unidad-web-note-title'>
											En la web
										</p>
										<p className='unidad-web-note-text'>
											¿Qué es la ciberseguridad?,
											explicación y ejemplos
										</p>
									</div>
									<div className='unidad-skill-grid'>
										<div className='unidad-skill-card'>
											<h4 className='unidad-skill-title'>
												Ciberseguridad
											</h4>
											<p className='unidad-skill-text'>
												Es el conjunto de herramientas,
												políticas, conceptos de seguridad,
												métodos de gestión de riesgos,
												seguros y tecnologías que pueden
												utilizarse para proteger los activos
												de la organización y los usuarios
												en el ciberentorno.
											</p>
										</div>
										<div className='unidad-skill-card'>
											<h4 className='unidad-skill-title'>
												Aplica diferentes contextos
											</h4>
											<p className='unidad-skill-text'>
												Seguridad operativa. Incluye los
												procesos y las decisiones para
												manejar y proteger los recursos de
												datos (por ejemplo, los permisos
												que tienen los usuarios para
												acceder a una red).
											</p>
										</div>
										<div className='unidad-skill-card'>
											<h4 className='unidad-skill-title'>
												Seguridad del usuario
											</h4>
											<p className='unidad-skill-text'>
												Atiende la información de
												identificación personal de los
												usuarios (nombres, direcciones,
												números de identificación, entre
												otros).
											</p>
										</div>
										<div className='unidad-skill-card'>
											<h4 className='unidad-skill-title'>
												Seguridad de red
											</h4>
											<p className='unidad-skill-text'>
												Es la práctica de proteger de
												intrusos una red informática.
											</p>
										</div>
										<div className='unidad-skill-card'>
											<h4 className='unidad-skill-title'>
												Seguridad de la información
											</h4>
											<p className='unidad-skill-text'>
												Protege la integridad y la
												privacidad de los datos, tanto en el
												almacenamiento como en el tránsito.
											</p>
										</div>
										<div className='unidad-skill-card'>
											<h4 className='unidad-skill-title'>
												Seguridad de hardware
											</h4>
											<p className='unidad-skill-text'>
												Se dirige a garantizar la protección
												del dispositivo físico, desde el
												aparato en sí hasta el contenido que
												este almacena.
											</p>
										</div>
										<div className='unidad-skill-card'>
											<h4 className='unidad-skill-title'>
												Seguridad móvil
											</h4>
											<p className='unidad-skill-text'>
												Se refiere a estrategias,
												infraestructuras y software que se
												utilizan para proteger cualquier
												dispositivo móvil (teléfonos
												celulares, computadoras portátiles,
												tabletas, etc.).
											</p>
										</div>
									</div>
								</section>

								<section>
									<h3 className='unidad-section-title'>
										Tipología de ciberataques
									</h3>
									<p className='unidad-paragraph'>
										Los ciberataques cada vez más están
										orientados a destruir, alterar y sustraer
										la información y a quebrantar o
										interrumpir la disponibilidad de los
										servicios, tanto de instituciones
										gubernamentales como de empresas
										privadas. Algunas de esas amenazas, de
										acuerdo con sus motivaciones, son:
									</p>
									<p className='unidad-paragraph'>
										Existen además algunos métodos que
										amenazan la ciberseguridad. Uno de los
										más comunes es el malware, un software
										malicioso que brinda acceso no autorizado
										o causa daños a un sistema informático,
										por ejemplo:
									</p>
									<ul className='unidad-activity-list'>
										<li>
											Virus, que se extiende por todo el
											sistema informático e infecta los
											archivos con código malicioso.
										</li>
										<li>
											Ransomware (secuestro de datos),
											bloquea archivos, datos o sistemas, y
											amenaza con borrar, destruir o publicar
											los datos confidenciales.
										</li>
									</ul>
								</section>

								<div className='unidad-problem-grid'>
									<div className='unidad-problem-card'>
										<h4 className='unidad-problem-title'>
											Ciberespionaje
										</h4>
										<p className='unidad-problem-text'>
											Ciberataques realizados para obtener
											secretos de Estado, propiedad
											industrial, propiedad intelectual,
											información comercial sensible o datos
											de carácter personal. Es una de las
											amenazas más complejas y con mayor
											capacidad técnica. Su detección requiere
											de herramientas tecnológicamente muy
											avanzadas.
										</p>
									</div>
									<div className='unidad-problem-card'>
										<h4 className='unidad-problem-title'>
											Ciberterrorismo
										</h4>
										<p className='unidad-problem-text'>
											Actividad de los grupos terroristas que
											utilizan internet como soporte de
											comunicaciones y coordinación para
											obtener información de posibles
											objetivos en tareas de propaganda,
											radicalización o financiación de sus
											actividades. Estas actividades están
											dirigidas, además, a causar pánico o
											catástrofes en las redes y sistemas.
										</p>
									</div>
									<div className='unidad-problem-card'>
										<h4 className='unidad-problem-title'>
											Ciberdelito / cibercrimen
										</h4>
										<p className='unidad-problem-text'>
											Actividad que emplea las redes y
											sistemas como medio, objetivo o lugar
											del delito. Se les aplican todas las
											figuras delictivas del crimen
											tradicional, pero adaptadas al
											ciberespacio. Su motivación principal es
											el rendimiento económico, es decir,
											víctimas que dispongan de
											vulnerabilidad y con capacidad
											financiera para atender a sus demandas.
										</p>
									</div>
								</div>

								<section>
									<h3 className='unidad-section-title'>
										Estrategias de ciberseguridad
									</h3>
									<p className='unidad-paragraph'>
										Existe una tendencia a generar soluciones
										para gestionar la ciberseguridad con un
										enfoque principalmente hacia la
										prevención, la eliminación y la atención
										de problemas de ciberseguridad.
									</p>
									<p className='unidad-paragraph'>
										Un reto importante para los Gobiernos es
										manejar con responsabilidad la supervisión
										del ciberespacio y coordinar acciones con
										los operadores para legislar y generar un
										marco digital que ayude a reducir ataques,
										así como abordar las amenazas que conjugan
										seguridad y desinformación.
									</p>
									<p className='unidad-paragraph unidad-paragraph-bottom'>
										Es importante, además, la alfabetización
										digital, que se refiere no solo al conjunto
										de conocimientos, habilidades y actitudes
										para manejar eficazmente herramientas y
										desenvolverse en entornos digitales, sino
										que también implica la apropiación de los
										nuevos conocimientos a partir de aprender
										a utilizar los componentes del hardware, los
										aplicativos y los programas.
									</p>
									<p className='unidad-paragraph'>
										Algunas estrategias que se han
										implementado, son:
									</p>
									<h4 className='unidad-subheading'>
										Semana 3 · Conexión ciudadana
									</h4>
									<div className='unidad-info-box'>
										<p className='unidad-info-title'>
											Conexión ciudadana
										</p>
										<p className='unidad-info-text'>
											La revolución digital ha transformado la
											forma en que se vive, se trabaja y se
											comunica. Internet y los dispositivos
											móviles han creado una sociedad
											globalmente conectada, con acceso
											instantáneo a información y recursos.
											Sin embargo, esto también ha planteado
											desafíos en términos de privacidad y
											seguridad de datos.
										</p>
									</div>
									<ul className='unidad-consolidation-list'>
										<li>
											Soluciones de inteligencia artificial
											(IA) para el entendimiento, la
											predicción y la atención de amenazas.
										</li>
										<li>
											Herramientas de monitoreo o seguridad
											de la infraestructura de tecnologías de
											la información.
										</li>
										<li>
											Respecto del hardware, se reconocen
											invenciones para detectar y mitigar
											automáticamente riesgos asociados con
											la configuración del dispositivo de red
											para sistemas de gestión de edificios y
											otras infraestructuras.
										</li>
										<li>
											Software de administración de riesgos,
											así como interfaces de alertas y
											comunicación a usuarios respecto de
											amenazas en la red.
										</li>
										<li>
											Algoritmos de alta velocidad para la
											protección de contraseñas en forma de
											imagen, voz y texto.
										</li>
										<li>
											Diferentes esquemas de encriptamiento
											(multi-party computation, homomorphic
											encryption) son utilizados para ocultar
											información, que solo alguien con clave
											adecuada puede descifrar.
										</li>
										<li>
											Sistemas de monitoreo de la seguridad
											cibernética mediante huella digital
											para cada dispositivo en la red.
										</li>
										<li>
											Redes privadas virtuales que utilizan
											firewall para proteger la identidad del
											usuario; almacenamiento en el servidor
											de la nube con alta seguridad.
										</li>
									</ul>
								</section>

								<section>
									<h3 className='unidad-section-title'>
										Ciberseguridad en el marco de la legalidad
									</h3>
									<p className='unidad-paragraph unidad-paragraph-bottom'>
										Desde inicios de la década del 2000 los
										países han impulsado debates sobre el tema
										de ciberseguridad con el objetivo de
										comprender mejor el grado de compromiso de
										los países en materia de ciberseguridad,
										fomentar la adopción de buenas prácticas y
										proporcionar información útil para que los
										países mejoren sus posturas en materia de
										ciberseguridad. Fruto de esto se han
										establecido convenios y planes, entre los
										cuales destacan:
									</p>
								</section>

								<section>
									<p className='unidad-paragraph'>
										Convenio sobre la Ciberdelincuencia.
										Desarrollado en Budapest en el año 2001,
										surge de la necesidad de aplicar, con
										carácter prioritario, una política penal
										común con objeto de proteger a la sociedad
										frente a la ciberdelincuencia, en
										particular mediante la adopción de una
										legislación adecuada y la mejora de la
										cooperación internacional. Esto debido a
										los profundos cambios provocados por la
										digitalización y la globalización continua
										de las redes informáticas.
									</p>
									<p className='unidad-paragraph'>
										Derecho internacional. En el año 2013
										Naciones Unidas llegó a un consenso mínimo
										a través del Grupo de Expertos
										Gubernamentales sobre los Avances en la
										Información y las Telecomunicaciones. En
										el Informe de 2013 del GEG se llegó a un
										acuerdo en torno a la aplicabilidad al
										ciberespacio del derecho internacional
										existente, en concreto, la Carta de la ONU,
										que en su capítulo séptimo se refiere a la
										seguridad colectiva, así como las reglas
										básicas sobre responsabilidad
										internacional.
									</p>
									<p className='unidad-paragraph unidad-paragraph-bottom'>
										Plan Estratégico de Ciberseguridad. La
										Unión Europea presentó la Directiva
										Relativa a la Criminalización de Ataques
										contra los Sistemas de Información,
										aprobada en agosto de 2013, y la Directiva
										sobre la Seguridad de las Redes y de la
										Información (NIS), aprobada en julio de
										2016. La Directiva NIS es el elemento
										central de la estrategia de
										ciberseguridad europea. Tiene por objeto
										garantizar un nivel armonizado mínimo de
										seguridad en las redes y sistemas de
										información utilizados por operadores de
										servicios esenciales.
									</p>
									<p className='unidad-paragraph'>
										Plan de Acción de Ciberseguridad.
										Publicado por la Organización de Aviación
										Civil Internacional en enero de 2022. Sus
										Estados miembros y las partes interesadas
										de la industria se comprometen a escala
										mundial a tomar medidas al respecto, con la
										intención de ocuparse de manera
										colaborativa y sistémica de la
										ciberseguridad de la aviación civil y de
										mitigar las amenazas y los riesgos
										conexos.
									</p>
								</section>

								<section>
									<h3 className='unidad-section-title'>
										Ciberseguridad en los Gobiernos
									</h3>
									<p className='unidad-paragraph'>
										Garantizar la seguridad en el ciberespacio
										se ha convertido en un objetivo prioritario
										en las agendas de los Gobiernos ante
										amenazas a la seguridad nacional (Doc. 2).
										Cada vez preocupa más la posibilidad de
										ataques terroristas, de naturaleza política
										o de la criminalidad organizada, contra
										sistemas de información que formen parte de
										las infraestructuras críticas de los
										Estados.
									</p>
									<p className='unidad-paragraph'>
										El Índice Global de Ciberseguridad (IGC) es
										una iniciativa de la Unión Internacional de
										Telecomunicaciones (UIT), el organismo
										especializado de las Naciones Unidas en
										materia de TIC. Revela que la
										ciberseguridad es verdaderamente una
										cuestión de desarrollo y que existe una
										necesidad urgente de abordar la creciente
										brecha en materia de cibercapacidad entre
										los países desarrollados y los países en
										desarrollo.
									</p>
									<p className='unidad-paragraph unidad-paragraph-bottom'>
										Dado el problema de la acción colectiva de
										la ciberseguridad, algunos países procuran
										firmar no solo acuerdos bilaterales, sino
										también acuerdos multilaterales, como se
										muestra en la siguiente gráfica.
									</p>
								</section>

								<div className='unidad-doc-box'>
									<p className='unidad-doc-kicker'>
										Doc. 2 Políticas de ciberseguridad
									</p>
									<p className='unidad-doc-text'>
										La Comisión Europea y la Alta Representante
										de la Unión para Asuntos Exteriores y
										Política de Seguridad presentaron una nueva
										Estrategia de Ciberseguridad de la UE a
										finales de 2020.
									</p>
									<p className='unidad-doc-text'>
										La Estrategia abarca la seguridad de
										servicios esenciales como hospitales, redes
										energéticas y ferrocarriles. También cubre
										la seguridad del número cada vez mayor de
										objetos conectados en los hogares, oficinas
										y fábricas.
									</p>
									<p className='unidad-doc-text'>
										La Estrategia se centra en la creación de
										capacidades colectivas para responder a los
										principales ciberataques y trabajar con
										socios de todo el mundo para garantizar la
										seguridad internacional y la estabilidad en
										el ciberespacio.
									</p>
									<p className='unidad-doc-footer'>
										Fuente: Comisión Europea (2024). Políticas
										de ciberseguridad.
									</p>
								</div>

								<div className='unidad-chart-box'>
									<h4 className='unidad-chart-title'>
										Semana 3 · Número de países por continente
										con acuerdos multilaterales de
										ciberseguridad
									</h4>
									<p className='unidad-chart-footer'>
										Fuente: Unión Internacional de
										Telecomunicaciones (UIT)
									</p>
									<p className='unidad-paragraph'>
										Al menos un acuerdo multilateral
										firmando/ratificando
									</p>
									<ul className='unidad-activity-list'>
										<li>África</li>
										<li>Américas</li>
										<li>Estados Árabes</li>
										<li>Asia-Pacifico</li>
										<li>CEI</li>
										<li>Europa</li>
									</ul>																		
								</div>

								<section>
									<h3 className='unidad-section-title'>
										El Salvador y la ciberseguridad
									</h3>
									<p className='unidad-paragraph'>
										La ciberseguridad ha cobrado relevancia en
										El Salvador para el desarrollo económico,
										político, social y cultural del país, por
										lo que se convierte en prioridad del Estado
										proteger dicha información para garantizar
										la confidencialidad, la integridad, la
										seguridad y la disponibilidad de los datos
										en general. En este sentido, una de las
										estrategias implementadas en ciberseguridad
										por parte del Estado salvadoreño es:
									</p>
									<ul className='unidad-activity-list'>
										<li>
											La Ley Especial Contra los Delitos
											Informáticos y Conexos, que tiene por
											objeto proteger los bienes jurídicos de
											aquellas conductas delictivas cometidas
											por medio de las tecnologías de la
											información y de la comunicación, así
											como la prevención y sanción de los
											delitos cometidos en perjuicio de los
											datos almacenados, procesados o
											transferidos; los sistemas, su
											infraestructura o cualquiera de sus
											componentes, o los cometidos mediante el
											uso de dichas tecnologías que afecten
											intereses asociados a la identidad, la
											propiedad, la intimidad y la imagen de
											las personas naturales o jurídicas.
											Algunos artículos relacionados con
											delitos informáticos son:
										</li>
									</ul>
									<div className='unidad-info-box'>
										<p className='unidad-info-title'>
											Conexión ciudadana
										</p>
										<p className='unidad-info-text'>
											El Foro Económico Mundial expresa que la
											protección del dominio cibernético a
											través de actividades de capacitación en
											materia de ciberseguridad resulta
											fundamental, por cuanto contribuye a
											reducir problemas como la brecha
											digital y los riesgos cibernéticos.
										</p>
									</div>
								</section>

								<div className='unidad-problem-grid'>
									<div className='unidad-problem-card'>
										<h4 className='unidad-problem-title'>
											Estafa informática
										</h4>
										<p className='unidad-problem-text'>
											Art. 10. El que manipule o influya en el
											ingreso, el procesamiento o resultado de
											los datos de un sistema que utilice las
											tecnologías de la información y de la
											comunicación, ya sea mediante el uso de
											datos falsos o incompletos, el uso
											indebido de datos o programación,
											valiéndose de alguna operación
											informática o artificio tecnológico [...]
											será sancionado [...].
										</p>
									</div>
									<div className='unidad-problem-card'>
										<h4 className='unidad-problem-title'>
											Hurto por medios informáticos
										</h4>
										<p className='unidad-problem-text'>
											Art. 13. El que por medio del uso de las
											tecnologías de la información y de la
											comunicación se apodere de bienes o
											valores tangibles o intangibles de
											carácter personal o patrimonial,
											sustrayéndolos a su propietario, tenedor
											o poseedor, con el fin de obtener un
											provecho económico para sí o para otro,
											será sancionado [...].
										</p>
									</div>
									<div className='unidad-problem-card'>
										<h4 className='unidad-problem-title'>
											Acoso a niños y adolescentes o personas
											con discapacidad
										</h4>
										<p className='unidad-problem-text'>
											Art. 32. Quien atormente, hostigue,
											humille, insulte, denigre u otro tipo de
											conducta que afecte el normal desarrollo
											de la personalidad, amenace la
											estabilidad psicológica o emocional,
											ponga en riesgo la vida o la seguridad
											física, de un niño, [...] adolescente o
											persona con discapacidad, por medio del
											uso de las TIC, será sancionado [...].
										</p>
									</div>
								</div>

								<div className='unidad-doc-box'>
									<p className='unidad-doc-kicker'>
										Doc. 3 Ciberseguridad en Gobiernos
									</p>
									<p className='unidad-doc-text'>
										Los recientes ataques a escala global como
										Wannacry o Petya han puesto de manifiesto
										las carencias en el tema de ciberseguridad
										de los principales países y empresas a
										nivel mundial, lo que demuestra que la
										falta de mecanismos eficientes implementados
										puede paralizar un país en cuestión de
										horas.
									</p>
									<p className='unidad-doc-text'>
										Según el informe del Banco Interamericano
										de Desarrollo (BID) llamado «Ciberseguridad
										2016» en Latinoamérica, Brasil, Jamaica,
										Uruguay, Panamá, Trinidad y Tobago y
										Colombia tienen medidas contra amenazas de
										ciberseguridad, mientras que en el caso de
										México, Perú, Bahamas, Argentina, Antigua y
										Barbuda, Costa Rica, Bahamas, El Salvador,
										Haití, Surinam y República Dominicana están
										todavía en proceso de adoptar medidas
										eficientes en materia de ciberseguridad.
									</p>
									<p className='unidad-doc-text'>
										El informe agrega que cuatro de cada cinco
										países de la zona no presentan estrategias
										en materia de ciberseguridad, como planes
										de seguridad online y de protección de las
										infraestructuras críticas, dos de cada tres
										países no tienen ningún centro de comando y
										control de seguridad cibernética y la gran
										mayoría de ministerios carece actualmente
										de capacidad para hacer frente a los
										delitos cibernéticos, entre otras
										vulnerabilidades.
									</p>
									<p className='unidad-doc-footer'>
										Fuente: Rodríguez, A. (2024).
										Ciberseguridad en gobiernos.
									</p>
								</div>

								<section>
									<p className='unidad-paragraph unidad-paragraph-bottom'>
										Las directrices de la Unión Internacional
										de Telecomunicaciones (UIT) sobre la
										protección de la infancia en línea fueron
										concebidas para ayudar a los niños, los
										padres y los profesores a gestionar los
										riesgos en línea y, a su vez, a
										beneficiarse de las posibilidades que
										ofrece la tecnología digital y a reforzar
										sus aptitudes digitales. Asimismo, las
										directrices contienen recomendaciones
										dirigidas a los responsables políticos para
										acelerar el desarrollo y la adopción de una
										estrategia nacional de protección de la
										infancia en línea.
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

export default Semana3Unidad6Screen
