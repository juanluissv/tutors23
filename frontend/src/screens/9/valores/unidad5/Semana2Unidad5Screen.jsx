import React, { useState } from 'react'
import Sidebar from '../../../../components/Sidebar'
import Header from '../../../../components/Header'
import '../../../../App.css'

function Semana2Unidad5Screen () {
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
										Unidad 5 · Semana 2
									</h1>
									<h2 className='unidad-subtitle'>
										Convivencia intercultural
									</h2>
								</div>

								<section>
									<div className='unidad-doc-box'>
										<p className='unidad-doc-kicker'>
											Doc. 1
										</p>
										<p className='unidad-doc-text'>
											<strong>
												Día del Respeto a la Diversidad
												Cultural en Guatemala
											</strong>
										</p>
										<p className='unidad-doc-text'>
											El Día del Respeto a la Diversidad
											Cultural se conmemora en nuestro país
											desde 2010 en reemplazo de la
											celebración del «Día de la Raza». Sin
											embargo, se modificó su denominación y
											se le dotó de un significado acorde al
											valor que asigna nuestra Constitución
											Nacional y diversos tratados y
											declaraciones de derechos humanos a la
											diversidad étnica y cultural. Este
											cambio implicó dejar atrás la
											conmemoración de la conquista de
											América para dar paso al análisis y a la
											valoración de la inmensa variedad de
											culturas que han aportado y aportan a la
											construcción de nuestra identidad. El
											reconocimiento de la diversidad
											cultural implica establecer espacios de
											comunicación y diálogo en medio de las
											diferencias, donde se incluya, desde
											la igualdad de derechos, lo que nos
											diferencia y lo que nos une para
											consensuar expectativas comunes, normas
											y valores para organizar la convivencia
											en la diferencia.
										</p>
										<p className='unidad-doc-footer'>
											Fuente: Susman, K. (2023). Cómo
											fomentar el respeto por las diferencias
											culturales.
										</p>
									</div>
								</section>

								<section>
									<h3 className='unidad-section-title'>
										La interconexión global y la diversidad
										cultural
									</h3>
									<p className='unidad-paragraph'>
										Las interacciones sociales, tanto en
										espacios físicos como digitales, se han
										vuelto indispensables en la vida
										cotidiana. La interconexión global,
										impulsada por la globalización, la
										migración y las tecnologías actuales, ha
										facilitado estas interacciones entre
										poblaciones culturalmente distintas,
										promoviendo la manifestación de una
										diversidad cultural sin precedentes.
										Algunos aspectos que lo han favorecido
										son:
									</p>

									<div className='unidad-problem-grid'>
										<div className='unidad-problem-card'>
											<h4 className='unidad-problem-title'>
												La globalización
											</h4>
											<p className='unidad-problem-text'>
												El comercio y las inversiones
												internacionales han impulsado la
												interacción entre personas y
												naciones de diversos orígenes
												culturales, lo que ha posibilitado
												el conocimiento de tradiciones,
												costumbres y perspectivas distintas.
											</p>
										</div>
										<div className='unidad-problem-card'>
											<h4 className='unidad-problem-title'>
												Las tecnologías actuales
											</h4>
											<p className='unidad-problem-text'>
												Las tecnologías actuales, como la
												internet, han dado lugar a la
												difusión de expresiones culturales
												variadas y también permiten el
												intercambio cultural a través de
												medios digitales como las redes
												sociales y plataformas en línea.
											</p>
										</div>
										<div className='unidad-problem-card'>
											<h4 className='unidad-problem-title'>
												La migración
											</h4>
											<p className='unidad-problem-text'>
												Los movimientos migratorios han
												llevado a que comunidades
												culturalmente diversas coexistan en
												espacios compartidos, enriqueciendo a
												las sociedades de destino, pero
												también planteando muchos retos de
												convivencia.
											</p>
										</div>
									</div>

									<p className='unidad-paragraph'>
										En este sentido, el incremento de la
										interconexión global ha visibilizado la
										diversidad cultural existente en el mundo.
										No obstante, esta diversidad a veces no es
										bien aceptada por todos, ya que el
										desconocimiento y el temor a lo diferente
										conduce a que algunas personas puedan
										sentirse amenazadas por prácticas y
										expresiones culturales que no comprenden,
										lo que a su vez tiene como consecuencias
										problemas vinculados con la discriminación
										y la exclusión. En el ámbito virtual,
										estas actitudes pueden manifestarse por
										medio de discursos de odio, ciberacoso y
										la creación de opiniones que refuerzan
										ideas intolerantes.
									</p>
									<p className='unidad-paragraph unidad-paragraph-bottom'>
										Así, en un mundo cada vez más
										interconectado, la convivencia en espacios
										presenciales y virtuales se ha vuelto un
										desafío. Por lo tanto, para construir una
										sociedad equitativa, es primordial que se
										reconozcan, respeten y valoren en igualdad
										de condiciones las diversas expresiones
										culturales, como las tradiciones, las
										costumbres, las normas, los valores y las
										formas de vida. La interculturalidad
										ofrece una respuesta a esta problemática,
										ya que fomenta el entendimiento entre
										culturas y promueve el diálogo y la
										convivencia pacífica.
									</p>

									<div className='unidad-info-box'>
										<p className='unidad-info-title'>
											Conexión ciudadana
										</p>
										<p className='unidad-info-text'>
											Cada cultura tiene sus propias
											tradiciones, valores, creencias y
											formas de expresión. Sin embargo, estas
											diferencias pueden generar
											malentendidos, incomodidades e incluso
											conflictos violentos cuando no existe un
											marco de respeto y comprensión mutua.
										</p>
									</div>
								</section>

								<section>
									<h3 className='unidad-section-title'>
										La importancia de la interculturalidad
										para la convivencia
									</h3>
									<p className='unidad-paragraph unidad-paragraph-bottom'>
										La interculturalidad tiene como objetivo
										lograr un equilibrio y una
										complementariedad entre la unidad necesaria
										para la convivencia en la sociedad y la
										diversidad cultural, que se manifiesta
										tanto a nivel individual como colectivo
										(Doc. 2).
									</p>
									<p className='unidad-paragraph'>
										Algunas características de la
										interculturalidad son:
									</p>
									<ul className='unidad-activity-list'>
										<li>
											Promover una comunicación más directa y
											una mayor interacción entre distintos
											grupos culturales, sin menospreciar ni
											desacreditar lo propio o lo ajeno.
										</li>
										<li>
											Fomentar y fortalecer iniciativas
											colaborativas que faciliten el
											aprendizaje, el trabajo conjunto y la
											acción colectiva.
										</li>
										<li>
											Incentivar la adopción de actitudes de
											empatía, respeto y solidaridad hacia las
											diferencias culturales.
										</li>
										<li>
											Facilitar las herramientas para
											identificar problemas y conflictos
											comunes, analizarlos y resolverlos de
											manera efectiva.
										</li>
									</ul>

									<div className='unidad-doc-box'>
										<p className='unidad-doc-kicker'>
											Doc. 2 ¿Qué es la interculturalidad?
										</p>
										<p className='unidad-doc-text'>
											Como concepto y práctica, la
											interculturalidad significa «entre
											culturas», pero no simplemente un
											contacto entre culturas, sino un
											intercambio que se establece en términos
											equitativos. Además de ser una meta por
											alcanzar, la interculturalidad debería
											ser entendida como un proceso permanente
											de relación, comunicación y aprendizaje
											entre personas, grupos, conocimientos,
											valores y tradiciones distintas,
											orientada a generar, construir y
											propiciar un respeto mutuo, y a un
											desarrollo pleno de las capacidades de
											los individuos, por encima de sus
											diferencias culturales y sociales. En
											sí, la interculturalidad intenta romper
											con la historia hegemónica de una
											cultura dominante y otras subordinadas
											y, de esa manera, reforzar las
											identidades tradicionalmente excluidas
											para construir, en la vida cotidiana,
											una convivencia de respeto y de
											legitimidad entre todos los grupos de la
											sociedad.
										</p>
										<p className='unidad-doc-footer'>
											Fuente: UNICEF (2015). La
											interculturalidad en la educación.
										</p>
									</div>
								</section>

								<section>
									<h3 className='unidad-section-title'>
										Maneras de convivir en contextos
										culturales diversos
									</h3>
									<p className='unidad-paragraph unidad-paragraph-bottom'>
										En espacios presenciales (comunidades,
										escuelas, lugares de trabajo,
										universidades y espacios públicos), así
										como en espacios virtuales (redes sociales,
										plataformas virtuales y blogs), se
										encuentran e interactúan personas con
										diferentes procedencias culturales,
										valores, tradiciones y formas de vida. Para
										convivir en armonía en estos contextos
										culturales diversos se requiere del
										respeto y la comprensión de las
										diferencias.
									</p>
									<p className='unidad-paragraph'>
										Algunas maneras en las que se puede lograr
										ese propósito en espacios presenciales son:
									</p>

									<div className='unidad-regions-grid'>
										<div className='unidad-region-card green'>
											<h4 className='unidad-region-title green'>
												Comunidades
											</h4>
											<ul className='unidad-consolidation-list'>
												<li>
													Fomentar la participación
													comunitaria organizando eventos
													interculturales que promuevan el
													conocimiento y el aprendizaje
													sobre la diversidad cultural.
												</li>
												<li>
													Respetar las tradiciones y las
													costumbres locales, con
													sensibilidad y empatía, mostrando
													disposición para aprender sobre
													los demás y valorar sus creencias.
												</li>
											</ul>
										</div>
										<div className='unidad-region-card orange'>
											<h4 className='unidad-region-title orange'>
												Escuelas
											</h4>
											<ul className='unidad-consolidation-list'>
												<li>
													Crear actividades que fomenten la
													interacción y el intercambio entre
													estudiantes de distintos orígenes
													culturales, que les permitan
													conocer sobre sus propias
													diferencias y valorarlas.
												</li>
												<li>
													Promover valores como el respeto
													y la comprensión mutua y gestionar
													adecuadamente conflictos
													relacionados con diferencias
													culturales.
												</li>
											</ul>
										</div>
										<div className='unidad-region-card blue'>
											<h4 className='unidad-region-title blue'>
												Universidades
											</h4>
											<ul className='unidad-consolidation-list'>
												<li>
													Integrar programas educativos,
													talleres, seminarios y actividades
													extracurriculares que incentiven a
													los estudiantes a la comprensión y
													el respeto por las diferentes
													culturas.
												</li>
												<li>
													Fomentar la investigación sobre
													temas relacionados con los
													desafíos de la interculturalidad y
													la diversidad cultural que permitan
													encontrar soluciones a los
													problemas que aquejan a las
													sociedades actuales.
												</li>
											</ul>
										</div>
										<div className='unidad-region-card green'>
											<h4 className='unidad-region-title green'>
												Lugares de trabajo
											</h4>
											<ul className='unidad-consolidation-list'>
												<li>
													Implementar políticas de inclusión
													social en los lugares de trabajo
													que promuevan la igualdad de
													oportunidades para todas las
													personas, independientemente de su
													origen cultural.
												</li>
												<li>
													Organizar sesiones de capacitación
													sobre diversidad cultural para
													empleados, abordando temas como los
													prejuicios inconscientes y la
													importancia de la empatía y el
													respeto en un entorno
													multicultural.
												</li>
											</ul>
										</div>
									</div>

									<div className='unidad-web-note'>
										<p className='unidad-web-note-title'>
											En la web
										</p>
										<p className='unidad-web-note-text'>
											Interculturalidad
										</p>
									</div>

									<p className='unidad-paragraph unidad-paragraph-bottom'>
										Los espacios virtuales ofrecen una
										oportunidad única para compartir
										conocimientos, experiencias y tradiciones
										entre diferentes culturas. Este intercambio
										enriquece a todas las partes y contribuye a
										construir una comunidad global más diversa
										y tolerante. Para convivir armoniosamente
										en estos entornos es necesario aplicar
										medidas basadas en los principios de la
										interculturalidad, que promueven el
										respeto, la empatía y la valoración
										positiva de las diferencias. Entre estas
										se incluyen:
									</p>
									<ul className='unidad-activity-list'>
										<li>
											Promover campañas de concientización
											sobre la importancia del respeto y la
											empatía durante las interacciones
											sociales en entornos virtuales.
										</li>
										<li>
											Denunciar y reportar contenido que
											promueva actitudes de intolerancia y
											acciones discriminatorias hacia
											personas de culturas diferentes.
										</li>
										<li>
											Crear grupos y espacios en línea donde
											personas de diferentes orígenes
											culturales puedan interactuar,
											colaborar y compartir experiencias.
										</li>
										<li>
											Incentivar la publicación y difusión de
											contenidos, información y recursos
											educativos que reflejen la importancia
											de comprender la diversidad cultural.
										</li>
										<li>
											Participar en plataformas de aprendizaje
											virtual que promuevan el conocimiento de
											diferentes culturas y el desarrollo de
											habilidades interculturales.
										</li>
										<li>
											Asegurar que las plataformas y espacios
											virtuales sean accesibles y usables para
											personas de todas las culturas,
											considerando aspectos como el idioma.
										</li>
									</ul>
								</section>

								<section>
									<h3 className='unidad-consolidation-title'>
										Consolidación
									</h3>

									<div className='unidad-doc-box'>
										<p className='unidad-doc-kicker'>
											Doc. 3 Atención sanitaria
											intercultural
										</p>
										<p className='unidad-doc-text'>
											¿Es posible tener servicios de salud con
											personal que se comunica en la lengua
											nativa de sus usuarios y valora la
											medicina ancestral? Estas son algunas
											características de los centros de salud
											acreditados en Perú para atender con
											pertinencia cultural. ¿A qué nos
											referimos cuando hablamos de salud
											intercultural? A un diálogo entre los
											sistemas de salud occidentales e
											indígenas, lo que se refleja en una
											atención que respeta y reconoce la
											diversidad cultural de las personas.
										</p>
										<p className='unidad-doc-footer'>
											Fuente: Tovar, A. (2023). Centros de
											salud intercultural en Perú.
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

export default Semana2Unidad5Screen
