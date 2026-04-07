import React, { useState } from 'react'
import Sidebar from '../../../../components/Sidebar'
import Header from '../../../../components/Header'
import '../../../../App.css'

function Semana2Unidad6Screen () {
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
										Unidad 6 · Semana 2
									</h1>
									<h2 className='unidad-subtitle'>
										Participación democrática y gobiernos sin
										fronteras para la gobernanza
									</h2>
								</div>

								<div className='unidad-doc-box'>
									<p className='unidad-doc-kicker'>
										Doc. 1
									</p>
									<p className='unidad-doc-text'>
										La palabra netiqueta proviene de la
										combinación entre net (por red) y
										etiqueta. Son las normas de buen
										comportamiento en internet. Similares a
										las buenas prácticas de convivencia en el
										mundo real, las netiquetas abarcan todas
										las acciones digitales, más allá de las
										redes sociales, como comunicaciones por
										dispositivos móviles, correos
										electrónicos y comentarios en páginas
										web, especialmente aquellos que están
										visibles a los usuarios. Además de texto
										e imagen, las netiquetas incluyen el uso
										de recursos como emojis, stickers, memes
										y abreviaturas para transmitir
										sentimientos, respuestas e ideas en forma
										más rápida y directa como, por ejemplo,
										un pulgar para arriba expresando
										aprobación.
									</p>
									<p className='unidad-doc-text'>
										¿Qué son las netiquetas?
									</p>
									<p className='unidad-doc-footer'>
										Fuente: Ministerio de Justicia de
										Argentina (2023). Decálogo de buenas
										prácticas en internet.
									</p>
								</div>

								<section>
									<h3 className='unidad-section-title'>
										Importancia de la gobernanza en los
										niveles local, nacional e internacional
									</h3>
									<p className='unidad-paragraph'>
										La gobernanza es el proceso mediante el
										cual se toman y aplican decisiones en una
										sociedad, abarcando la interacción de
										diversos actores, como instituciones
										públicas, empresas, organizaciones civiles
										y ciudadanos. La gobernanza busca
										alcanzar objetivos comunes, gestionar
										recursos de manera eficiente y garantizar
										la participación de todos los
										involucrados.
									</p>
									<p className='unidad-paragraph unidad-paragraph-bottom'>
										La gobernanza es primordial para el
										desarrollo sostenible de un país porque
										permite establecer políticas públicas
										coherentes, combatir la corrupción,
										proteger los derechos humanos y promover
										la justicia social. Además, fomenta la
										confianza en las instituciones y la
										estabilidad política. Asimismo, la
										gobernanza internacional es crucial para
										abordar problemáticas que trascienden las
										fronteras nacionales, como el cambio
										climático, la seguridad global, el
										comercio internacional y la migración.
									</p>
								</section>

								<section>
									<h3 className='unidad-section-title'>
										La gobernanza digital
									</h3>
									<p className='unidad-paragraph unidad-paragraph-bottom'>
										Las nuevas tecnologías han transformado de
										forma sustancial las expresiones de
										participación democrática y la
										gobernanza, creando lo que se conoce como
										«gobernanza digital». Este concepto
										representa una evolución del proceso
										tradicional de toma de decisiones, ya que
										integra herramientas digitales que
										potencian la eficiencia, la transparencia
										y la inclusión de la ciudadanía en
										diversos procesos gubernamentales (Doc.
										2). Mediante plataformas en línea, redes
										sociales y aplicaciones móviles, se
										facilita el acceso a la información
										pública y se habilita la participación
										democrática directa en consultas. En este
										sentido, la gobernanza digital no solo
										optimiza la administración pública a
										escalas local y nacional, sino que
										también fortalece la cooperación
										internacional al permitir una interacción
										más fluida y coordinada entre países para
										abordar desafíos globales.
									</p>
									<h4 className='unidad-subheading'>
										Profundización
									</h4>
									<div className='unidad-doc-box'>
										<p className='unidad-doc-kicker'>
											Doc. 2 Gobernanza digital
										</p>
										<p className='unidad-doc-text'>
											Tradicionalmente se define al
											e-Gobierno o Gobierno electrónico
											como el uso de las TIC para mejorar
											las actividades de las distintas
											organizaciones del sector público.
											Hoy en día se está utilizando un
											concepto que logra abarcar más:
											gobernanza digital. Se refiere a la
											integración de las TIC en la
											administración pública con el
											objetivo de promover la
											transparencia, la eficiencia y la
											participación ciudadana. Sin
											embargo, la diferencia radica en que
											en el e-Gobierno la comunicación se da
											en un solo sentido, es decir, desde
											el Gobierno a los ciudadanos, pero la
											idea de la gobernanza digital
											consiste en que la comunicación fluya
											en ambos sentidos.
										</p>
										<p className='unidad-doc-footer'>
											Fuente: Saldaña, E. (2019).
											Gobernanza digital, un concepto más
											amplio que el e-Gobierno.
										</p>
									</div>
									<div className='unidad-info-box'>
										<p className='unidad-info-title'>
											Conexión ciudadana
										</p>
										<p className='unidad-info-text'>
											Organizaciones como las Naciones
											Unidas juegan un papel vital en la
											gobernanza a nivel global, ya que
											permiten la coordinación de esfuerzos
											y la promoción de la cooperación entre
											Gobiernos de diferentes países.
										</p>
									</div>
								</section>

								<section>
									<h3 className='unidad-section-title'>
										Beneficios de la gobernanza digital
									</h3>
									<p className='unidad-paragraph unidad-paragraph-bottom'>
										Entre algunos beneficios de la
										gobernanza digital se incluyen:
									</p>
									<h4 className='unidad-subheading'>
										Los Gobiernos sin fronteras
									</h4>
									<p className='unidad-paragraph'>
										Los Gobiernos sin fronteras representan un
										enfoque de gobernanza digital donde las
										tecnologías permiten la cooperación y la
										colaboración entre Gobiernos,
										organizaciones internacionales y actores
										no estatales para abordar problemáticas
										globales. Esto implica compartir
										información, recursos y conocimientos
										para encontrar soluciones conjuntas a
										problemas como el cambio climático, la
										migración, la seguridad y la salud
										pública.
									</p>
									<p className='unidad-paragraph unidad-paragraph-bottom'>
										La gobernanza digital facilita la
										colaboración entre Gobiernos sin
										fronteras al proporcionar herramientas y
										plataformas para la comunicación, el
										intercambio de información y la toma de
										decisiones conjunta. Por ejemplo, las
										plataformas digitales permiten a los
										ciudadanos de diferentes países participar
										en consultas públicas sobre políticas que
										afectan a la región o al mundo, y a los
										Gobiernos compartir datos y experiencias
										para mejorar la gestión de crisis y la
										prevención de desastres.
									</p>
									<div className='unidad-regions-grid'>
										<div className='unidad-region-card blue'>
											<h4 className='unidad-region-title blue'>
												Mayor acceso a servicios
												públicos y trámites en línea
											</h4>
											<p className='unidad-region-text'>
												La automatización de trámites y
												servicios públicos ha agilizado
												los procesos y reducido la
												burocracia. Esto significa que la
												ciudadanía puede realizar
												trámites como el pago de
												impuestos, la solicitud de
												documentos y la inscripción en
												programas sociales desde la
												comodidad de sus hogares.
											</p>
										</div>
										<div className='unidad-region-card green'>
											<h4 className='unidad-region-title green'>
												Aumento de la participación
												ciudadana
											</h4>
											<p className='unidad-region-text'>
												El uso de plataformas en línea,
												redes sociales y aplicaciones
												móviles ha facilitado la
												participación ciudadana en la toma
												de decisiones y el monitoreo de la
												gestión pública, permitiendo
												expresar opiniones, proponer ideas
												de manera directa y accesible
												desde cualquier lugar y en
												cualquier momento.
											</p>
										</div>
									</div>
								</section>

								<section>
									<p className='unidad-paragraph'>
										En este sentido, la ciudadanía digital
										brinda a los ciudadanos las herramientas
										y las habilidades necesarias para
										participar activamente en la vida política
										de su comunidad o país y en la resolución
										de problemas globales.
									</p>
									<div className='unidad-info-box'>
										<p className='unidad-info-text'>
											Al mismo tiempo impulsa el desarrollo
											de la ciudadanía digital al fomentar
											la participación efectiva y
											responsable de los ciudadanos en
											línea.
										</p>
									</div>
								</section>

								<section>
									<h3 className='unidad-section-title'>
										La ciudadanía digital y la participación
										democrática
									</h3>
									<p className='unidad-paragraph'>
										La ciudadanía digital es un concepto que
										abarca los derechos, las responsabilidades
										y las habilidades que las personas ejercen
										en el entorno virtual para participar de
										manera activa, crítica y responsable en
										la sociedad digital y la democracia. Esto
										incluye el uso seguro y ético de las
										tecnologías de la información y de la
										comunicación (TIC), la capacidad de
										acceder, analizar y evaluar información en
										línea, y la participación en debates y
										decisiones públicas a través de
										plataformas digitales.
									</p>
									<p className='unidad-paragraph unidad-paragraph-bottom'>
										El empoderamiento democrático es el
										proceso de fortalecer la capacidad de los
										ciudadanos para participar en la toma de
										decisiones políticas y en la vida cívica.
										En el contexto digital, esto implica dotar
										a los ciudadanos de los conocimientos,
										las habilidades y los recursos necesarios
										para comprender los problemas públicos,
										expresar sus opiniones, interactuar con
										los representantes electos y colaborar en
										la resolución de problemas a nivel local,
										nacional e internacional.
									</p>
									<h4 className='unidad-subheading'>
										La ciudadanía digital en diferentes
										contextos
									</h4>
									<p className='unidad-paragraph'>
										Dado que el uso de internet es dinámico y
										variado tanto a nivel individual como
										colectivo, el desafío en la formación
										ciudadana digital consiste en reconocer
										que la web no es solo una red de
										computadoras conectadas, sino que detrás
										de cada dispositivo hay personas de
										diferentes edades, sistemas culturales e
										identidades religiosas y políticas
										provenientes de diversos contextos
										sociales, económicos y territoriales.
										Estas personas utilizan y comparten
										información, contenidos, productos,
										recursos, servicios y datos creados por
										otros, y también generan y difunden
										conocimiento e información.
									</p>
									<p className='unidad-paragraph unidad-paragraph-bottom'>
										Dichas dinámicas llevan a los Gobiernos y
										a los sistemas educativos a reconocer
										internet como un espacio para el ejercicio
										y la defensa de los derechos humanos,
										donde niños, jóvenes y adultos, además de
										ser usuarios y consumidores en el entorno
										virtual, también son ciudadanos. En este
										sentido, la ciudadanía digital abarca una
										perspectiva integral que incluye tanto la
										seguridad y los riesgos relacionados con
										el uso inadecuado o la exposición a
										peligros en el entorno virtual, como las
										oportunidades y ventajas que brindan las
										TIC para desarrollar competencias
										ciudadanas que refuercen la democracia.
									</p>
									<div className='unidad-web-note'>
										<p className='unidad-web-note-title'>
											En la web
										</p>
										<p className='unidad-web-note-text'>
											¿Qué es la ciudadanía digital?
										</p>
									</div>
								</section>

								<section>
									<h3 className='unidad-section-title'>
										Dimensiones de la ciudadanía digital
									</h3>
									<p className='unidad-paragraph unidad-paragraph-bottom'>
										La ciudadanía digital abarca diversas
										dimensiones que reflejan las habilidades,
										los conocimientos y las actitudes
										necesarias para participar de manera
										responsable y efectiva en la sociedad
										digital. Estas dimensiones se
										interrelacionan y se complementan entre
										sí, formando un marco integral para
										comprender y ejercer la ciudadanía
										digital. Entre estas se encuentran:
									</p>
									<div className='unidad-skill-grid'>
										<div className='unidad-skill-card'>
											<h4 className='unidad-skill-title'>
												Acceso digital
											</h4>
											<p className='unidad-skill-text'>
												Es la base fundamental de la
												ciudadanía digital. Se refiere a
												la posibilidad de conectarse a
												internet y utilizar
												dispositivos. Sin acceso, las
												demás dimensiones de la
												ciudadanía digital no pueden
												desarrollarse plenamente. Es un
												derecho fundamental que permite
												a las personas participar en la
												sociedad de la información,
												acceder a servicios públicos en
												línea, comunicarse con otros y
												aprovechar las oportunidades que
												ofrece el mundo digital.
											</p>
										</div>
										<div className='unidad-skill-card'>
											<h4 className='unidad-skill-title'>
												Alfabetización digital
											</h4>
											<p className='unidad-skill-text'>
												Implica la capacidad de
												encontrar, evaluar, utilizar,
												compartir y crear contenido
												utilizando tecnologías digitales.
												Esto incluye habilidades básicas
												como el manejo de software y
												aplicaciones y la navegación en
												internet, así como habilidades más
												avanzadas como la producción de
												contenido multimedia.
											</p>
										</div>
										<div className='unidad-skill-card'>
											<h4 className='unidad-skill-title'>
												Seguridad digital
											</h4>
											<p className='unidad-skill-text'>
												Se refiere a la comprensión de los
												riesgos en línea, como el
												phishing, y tomar medidas para
												proteger la información personal y
												los datos importantes. Esto
												incluye el uso de contraseñas
												seguras, la actualización de
												software y la precaución al
												compartir información en línea. La
												seguridad digital también implica
												la protección de la privacidad
												evitando la divulgación de
												información personal no deseada y
												controlando la configuración de
												privacidad en las redes sociales y
												otras plataformas.
											</p>
										</div>
										<div className='unidad-skill-card'>
											<h4 className='unidad-skill-title'>
												Comportamiento ético y
												responsabilidad digital
											</h4>
											<p className='unidad-skill-text'>
												El comportamiento ético consiste
												en respetar los derechos de los
												demás, como la privacidad y la
												libertad de expresión, y cumplir
												con las normas de convivencia en
												línea, evitando prácticas como el
												ciberacoso, el discurso de odio y
												la difusión de información falsa.
												La responsabilidad digital
												involucra ser conscientes del
												impacto de las acciones que se
												realizan en línea y utilizar las
												tecnologías de manera que
												beneficien a la sociedad en
												general.
											</p>
										</div>
									</div>
								</section>

								<section>
									<h3 className='unidad-section-title'>
										La ciudadanía digital y la participación
										democrática
									</h3>
									<p className='unidad-paragraph unidad-paragraph-bottom'>
										La ciudadanía digital es muy importante
										en el fortalecimiento de la participación
										ciudadana al ampliar el acceso a la
										información y facilitar la comunicación y
										la colaboración con otras personas, sin
										importar su ubicación geográfica. Esto
										posibilita la organización de acciones
										colectivas y la promoción de causas
										sociales, potenciando la capacidad de la
										sociedad civil para influir en políticas
										públicas y otras medidas de beneficio
										colectivo. Por otro lado, la ciudadanía
										digital también ayuda a superar barreras
										tradicionales de participación. Permite
										que personas con discapacidades,
										minorías étnicas y otros grupos que han
										sido históricamente marginados se
										involucren; de esta forma, se promueve una
										participación más equitativa,
										fortaleciendo la democracia y la cohesión
										social.
									</p>
									<h4 className='unidad-subheading'>
										La juventud y la ciudadanía digital
									</h4>
									<p className='unidad-paragraph unidad-paragraph-bottom'>
										Actualmente, los ciudadanos tienen el
										poder para influir en las políticas
										públicas. Los jóvenes, pueden aprovechar
										las herramientas virtuales para
										informarse, organizarse y participar
										activamente en debates sobre temas que les
										importan. Algunas formas de hacerlo son:
									</p>
									<ul className='unidad-activity-list'>
										<li>
											Compartir información y debatir ideas
											en torno a causas importantes.
										</li>
										<li>
											Expresar opiniones y proponer
											soluciones a problemas públicos por
											medio de plataformas de consulta
											ciudadana.
										</li>
										<li>
											Trabajar en equipo para generar
											impacto y promover cambios positivos
											en la comunidad.
										</li>
									</ul>
									<div className='unidad-skill-grid'>
										<div className='unidad-skill-card'>
											<h4 className='unidad-skill-title'>
												Participación digital
											</h4>
											<p className='unidad-skill-text'>
												Se refiere al uso de herramientas
												digitales para participar
												activamente en la vida comunitaria.
												Esto incluye participar en debates
												en línea, colaborar en proyectos
												comunitarios y comunicarse con
												representantes políticos a través
												de plataformas digitales. La
												participación digital permite dar
												voz y voto a la ciudadanía en
												diferentes asuntos públicos.
											</p>
										</div>
										<div className='unidad-skill-card'>
											<h4 className='unidad-skill-title'>
												Comunicación y colaboración
												digital
											</h4>
											<p className='unidad-skill-text'>
												Incluye el uso de herramientas de
												comunicación en línea, como el
												correo electrónico, la mensajería
												instantánea, las videoconferencias y
												las redes sociales, así como la
												capacidad de trabajar en equipo en
												proyectos en línea. La
												colaboración y la comunicación
												digital, como habilidades digitales
												básicas, facilitan la conexión con
												personas de diferentes culturas y
												procedencias y fomenta el
												entendimiento intercultural y la
												cooperación global.
											</p>
										</div>
										<div className='unidad-skill-card'>
											<h4 className='unidad-skill-title'>
												Bienestar digital
											</h4>
											<p className='unidad-skill-text'>
												Implica mantener un equilibrio
												saludable entre el uso de
												tecnologías digitales y otras
												actividades de la vida diaria.
												Algunas acciones incluyen el
												establecimiento de límites de
												tiempo
												para el uso de dispositivos,
												desconectarse regularmente y
												evitar la sobrecarga de
												información. El bienestar digital
												es esencial para prevenir la
												adicción a la tecnología, el
												estrés y otros problemas de salud
												relacionados con el uso excesivo
												de dispositivos y medios
												digitales.
											</p>
										</div>
									</div>
								</section>

								<section>
									<h3 className='unidad-section-title'>
										Las nuevas tecnologías en el desarrollo de
										habilidades sociales y comunicativas
									</h3>
									<p className='unidad-paragraph'>
										En el contexto de la globalización y la
										creciente interconexión digital, el
										desarrollo de habilidades sociales y
										comunicativas se ha vuelto fundamental
										para el éxito personal y profesional. Las
										nuevas tecnologías, como las plataformas
										de comunicación en línea y las redes
										sociales, ofrecen un amplio abanico de
										herramientas que facilitan la interacción
										con individuos de diversas culturas y
										orígenes lingüísticos. El dominio de
										estas herramientas y la comprensión de su
										uso estratégico permiten establecer
										conexiones significativas, fomentar la
										colaboración y promover el entendimiento
										intercultural.
									</p>
									<p className='unidad-paragraph unidad-paragraph-bottom'>
										La adquisición de habilidades relacionadas
										con la comunicación efectiva en entornos
										digitales multiculturales no solo
										enriquece las relaciones interpersonales,
										sino que también prepara a los jóvenes
										para un futuro académico y laboral
										exitoso, donde la diversidad cultural y la
										colaboración son elementos fundamentales.
										Para lograr una comunicación efectiva en
										estos entornos, es esencial desarrollar
										ciertas habilidades clave, entre las que
										se encuentran:
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

export default Semana2Unidad6Screen
