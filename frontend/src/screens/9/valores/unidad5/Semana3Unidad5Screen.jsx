import React, { useState } from 'react'
import Sidebar from '../../../../components/Sidebar'
import Header from '../../../../components/Header'
import '../../../../App.css'

function Semana3Unidad5Screen () {
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
										Unidad 5 · Semana 3
									</h1>
									<h2 className='unidad-subtitle'>
										Iniciativas globales para la
										interculturalidad
									</h2>
								</div>

								<section>
									<div className='unidad-doc-box'>
										<p className='unidad-doc-kicker'>
											Doc. 1
										</p>
										<p className='unidad-doc-text'>
											Fuente: UNESCO (2022). Formación
											intercultural en 42 países.
										</p>
										<p className='unidad-doc-text'>
											<strong>
												Círculos de relatos de la UNESCO
											</strong>
										</p>
										<p className='unidad-doc-text'>
											La Oficina de la UNESCO en El Cairo
											(Egipto) organizó actividades y
											talleres de fortalecimiento de
											capacidades destinados a iniciar
											formadores y jóvenes en métodos
											innovadores para adquirir competencias
											interculturales. Uno de esos métodos,
											denominado «Círculos de relatos», se
											basa en un elemento tradicional
											presente en todas las culturas, el
											arte de la narración, que se adapta a
											la transmisión de ese tipo de
											competencias.
										</p>
										<p className='unidad-doc-text'>
											Los participantes en los talleres
											cuentan en pequeños grupos sus
											experiencias personales y anudan
											vínculos afectivos entre sí,
											suscitando de este modo un proceso de
											transformación que fortalece sus
											capacidades de escucha, empatía,
											respeto y apertura mental con
											respecto a los demás, así como una
											toma de conciencia de su propio modo de
											ser.
										</p>
										<p className='unidad-doc-text'>
											La UNESCO está experimentando en
											varios países este método, que se
											expone con detalle en la obra
											publicada en 2020 con el título{' '}
											<em>
												Manual para el desarrollo de
												competencias interculturales.
												Círculos de narraciones
											</em>
											, donde se afirma que «aprender a
											escuchar y a dialogar sienta las bases
											del entendimiento intercultural».
										</p>
									</div>
								</section>

								<section>
									<h3 className='unidad-section-title'>
										Prácticas globales para el fomento de la
										interculturalidad
									</h3>
									<p className='unidad-paragraph unidad-paragraph-bottom'>
										Diversas instituciones internacionales,
										como la Organización de las Naciones
										Unidas (ONU) y la Organización de las
										Naciones Unidas para la Educación, la
										Ciencia y la Cultura (UNESCO), han
										implementado iniciativas y estrategias
										que buscan el fomento de la
										interculturalidad a nivel global y que
										han tenido repercusiones en las políticas
										nacionales de muchos países. Entre las
										principales formas de abordaje donde se
										han desarrollado dichas iniciativas se
										encuentran:
									</p>

									<h4 className='unidad-subheading'>
										Profundización
									</h4>
									<div className='unidad-problem-grid'>
										<div className='unidad-problem-card'>
											<h4 className='unidad-problem-title'>
												El diálogo intercultural
											</h4>
											<p className='unidad-problem-text'>
												Es un proceso de comunicación
												abierta y respetuosa entre personas
												de diferentes sistemas culturales
												que tiene como objetivo fortalecer
												aspectos como el entendimiento
												mutuo y la apreciación de la riqueza
												cultural.
											</p>
										</div>
										<div className='unidad-problem-card'>
											<h4 className='unidad-problem-title'>
												Las políticas públicas
												interculturales
											</h4>
											<p className='unidad-problem-text'>
												Son un conjunto de medidas y
												acciones gubernamentales que buscan
												desarrollar el reconocimiento, el
												respeto, la convivencia y la
												interacción equitativa entre
												diferentes culturas que coexisten
												en un mismo territorio.
											</p>
										</div>
										<div className='unidad-problem-card'>
											<h4 className='unidad-problem-title'>
												La educación intercultural
											</h4>
											<p className='unidad-problem-text'>
												Es una de las estrategias más
												importantes para el fomento de la
												interculturalidad. Esta se centra en
												impulsar y fortalecer el
												conocimiento, la comprensión y el
												respeto por la diversidad cultural
												desde el ámbito educativo formal.
											</p>
										</div>
									</div>
								</section>

								<section>
									<h3 className='unidad-section-title'>
										La educación intercultural en iniciativas
										globales
									</h3>
									<p className='unidad-paragraph'>
										La educación intercultural es un proceso
										educativo integral que va más allá de la
										simple tolerancia o coexistencia de
										diferentes culturas. Se trata de una
										orientación pedagógica que busca fomentar
										el respeto mutuo, la comprensión profunda
										de las diversas perspectivas culturales y
										la construcción de relaciones
										interculturales equitativas y justas,
										reconociendo que la diversidad cultural es
										una manera de enriquecer a la sociedad y
										que todas las culturas tienen algo valioso
										que aportar.
									</p>
									<p className='unidad-paragraph unidad-paragraph-bottom'>
										Algunos de los enfoques desarrollados por
										medio de la educación intercultural son:
									</p>
									<ul className='unidad-activity-list'>
										<li>
											<strong>Enfoque sociocrítico.</strong>{' '}
											Invita a los estudiantes a reflexionar
											sobre las relaciones de poder y las
											desigualdades sociales existentes entre
											diferentes culturas.
										</li>
										<li>
											<strong>
												Enfoque intercultural para la
												igualdad.
											</strong>{' '}
											Aborda las relaciones entre hombres y
											mujeres, cultura y educación,
											promoviendo la igualdad de
											oportunidades.
										</li>
										<li>
											<strong>
												Enfoque de aprendizaje experiencial.
											</strong>{' '}
											Fomenta el conocimiento por medio de
											experiencias directas con personas de
											otras culturas, como intercambios
											estudiantiles.
										</li>
									</ul>
									<p className='unidad-paragraph unidad-paragraph-bottom'>
										Para llevar a cabo estos enfoques y
										fomentar una verdadera educación
										intercultural, diversas organizaciones e
										instituciones han desarrollado una serie
										de proyectos e iniciativas a nivel global
										y regional. Algunos de los ejemplos más
										destacados son:
									</p>

									<div className='unidad-info-box'>
										<p className='unidad-info-title'>
											Conexión ciudadana
										</p>
										<p className='unidad-info-text'>
											La educación intercultural permite que
											grupos étnicos, como indígenas y
											afrodescendientes, históricamente
											marginados por sistemas educativos
											occidentales, preserven su cultura y
											saberes ancestrales, ya que busca que
											los estudiantes se desarrollen en su
											propio marco cultural.
										</p>
									</div>

									<ul className='unidad-activity-list unidad-paragraph-bottom'>
										<li>
											<strong>
												Red del Plan de Escuelas Asociadas
												de la UNESCO.
											</strong>{' '}
											Fomenta proyectos colaborativos entre
											escuelas de diferentes países,
											permitiendo a los estudiantes aprender
											sobre otras culturas y trabajar juntos
											en proyectos comunes.
										</li>
										<li>
											<strong>UNESCO.</strong> Promueve la
											educación intercultural a través de su
											programa de Educación para la
											Ciudadanía Mundial, que incluye la
											creación de materiales educativos y la
											capacitación de docentes en temas de
											diversidad cultural.
										</li>
										<li>
											<strong>
												Comisión Económica para América
												Latina y el Caribe (CEPAL).
											</strong>{' '}
											Impulsa políticas educativas que
											integran la perspectiva intercultural
											en el currículo escolar, promoviendo el
											respeto por las culturas indígenas y
											afrodescendientes.
										</li>
									</ul>
								</section>

								<section>
									<h3 className='unidad-section-title'>
										Iniciativas globales para fortalecer el
										diálogo intercultural
									</h3>
									<p className='unidad-paragraph unidad-paragraph-bottom'>
										El diálogo intercultural, como proceso
										comunicativo, se trata de un encuentro
										profundo que busca establecer conexiones
										positivas entre visiones del mundo
										distintas, fortalecer el entendimiento
										mutuo, incentivar el respeto y cultivar el
										aprecio por la rica diversidad cultural
										existente. El diálogo intercultural
										permite:
									</p>

									<div className='unidad-problem-grid'>
										<div className='unidad-problem-card'>
											<h4 className='unidad-problem-title'>
												Deconstruir prejuicios y
												estereotipos
											</h4>
											<p className='unidad-problem-text'>
												Interactuar de manera directa y
												auténtica con personas de otras
												culturas permite conocer y apreciar
												sus valores, normas, tradiciones y
												costumbres, lo que ayuda a
												reflexionar sobre los prejuicios
												propios y a cuestionar las ideas
												preconcebidas que limitan la
												convivencia.
											</p>
										</div>
										<div className='unidad-problem-card'>
											<h4 className='unidad-problem-title'>
												Resolver problemas de manera pacífica
											</h4>
											<p className='unidad-problem-text'>
												En caso de que surjan situaciones de
												tensión o conflicto, el diálogo
												intercultural ofrece un espacio para
												la comunicación constructiva, la
												negociación y la búsqueda de
												acuerdos mutuamente beneficiosos,
												evitando el recurso a la violencia y
												creando así un ambiente más propicio
												para la paz.
											</p>
										</div>
										<div className='unidad-problem-card'>
											<h4 className='unidad-problem-title'>
												Fortalecer la empatía y el respeto
											</h4>
											<p className='unidad-problem-text'>
												Conocer desde una perspectiva más
												profunda las motivaciones, emociones
												y desafíos de los demás, incluso de
												aquellos provenientes de entornos muy
												distintos. Escuchar sus historias,
												presenciar sus tradiciones y
												compartir experiencias desarrolla una
												conexión humana a pesar de las
												diferencias culturales.
											</p>
										</div>
									</div>

									<p className='unidad-paragraph'>
										El diálogo intercultural puede llevarse a
										cabo en diferentes espacios, como en
										foros, talleres y eventos públicos. La
										UNESCO organiza regularmente el Foro
										Mundial sobre el Diálogo Intercultural,
										que reúne a expertos, académicos y líderes
										de todo el mundo para discutir y compartir
										mejores prácticas en la promoción de la
										interculturalidad. Este foro proporciona
										una plataforma para el intercambio de
										ideas y experiencias, ayudando a
										construir puentes entre diferentes culturas
										(Doc. 2).
									</p>
									<p className='unidad-paragraph unidad-paragraph-bottom'>
										En América Latina, el Sistema de la
										Integración Centroamericana (SICA)
										facilita encuentros regionales que
										promueven el diálogo entre los diversos
										grupos étnicos y culturales de la región,
										abordando temas como la paz, la
										cooperación y el desarrollo sostenible.
										Estos encuentros fomentan la comprensión y
										el respeto mutuo, creando un entorno más
										inclusivo y cohesionado.
									</p>

									<div className='unidad-doc-box'>
										<p className='unidad-doc-kicker'>
											Doc. 2
										</p>
										<p className='unidad-doc-text'>
											<strong>
												El Foro Mundial sobre el Diálogo
												Intercultural
											</strong>
										</p>
										<p className='unidad-doc-text'>
											Desde 2011, el Foro Mundial sobre el
											Diálogo Intercultural —que se celebra
											cada dos años, en colaboración con la
											UNESCO y otras organizaciones
											internacionales y regionales, como la
											Alianza de Civilizaciones de las
											Naciones Unidas, el Consejo de Europa,
											la Organización del Mundo Islámico para
											la Educación, la Ciencia y la Cultura
											(ICESCO) y la Organización Mundial del
											Turismo (OMT)— tiene por objeto
											fortalecer y ampliar la base conceptual
											del diálogo intercultural y buscar
											formas de utilizar el diálogo como una
											herramienta útil para hacer frente a los
											desafíos mundiales, lograr la
											comprensión mutua, abarcar contextos
											socioculturales más amplios e
											incorporar valores genuinamente
											universales.
										</p>
										<p className='unidad-doc-footer'>
											Fuente: UNESCO (2022). Promoción del
											diálogo intercultural y la inclusión
											social en favor de una paz y un
											desarrollo sostenibles.
										</p>
									</div>
								</section>

								<section>
									<h3 className='unidad-section-title'>
										Las políticas públicas interculturales
									</h3>
									<p className='unidad-paragraph'>
										Las acciones e iniciativas impulsadas por
										organizaciones internacionales que
										promueven la interculturalidad a nivel
										mundial han repercutido en las políticas
										públicas de diversos países, que también
										buscan integrar la diversidad cultural en
										todos los aspectos de la sociedad. Los
										Gobiernos, como actores clave en la
										construcción de sociedades justas y
										equitativas, tienen la responsabilidad de
										promover la interculturalidad a través de
										la implementación de políticas públicas
										efectivas. Estas deben estar orientadas a
										fomentar el reconocimiento y la valoración
										de la diversidad cultural, impulsar el
										diálogo intercultural, luchar contra la
										discriminación y la xenofobia y garantizar
										los derechos de todos por igual.
									</p>
									<p className='unidad-paragraph unidad-paragraph-bottom'>
										Un ejemplo destacado de esta repercusión
										es la Política Nacional para la
										Interculturalidad en México. Inspirada por
										los principios promovidos por la UNESCO,
										busca construir una sociedad más inclusiva
										y respetuosa de la diversidad cultural,
										alineándose con las estrategias globales
										de promoción de la interculturalidad. La
										política aborda de manera integral tres
										ejes principales:
									</p>

									<ul className='unidad-activity-list unidad-paragraph-bottom'>
										<li>
											<strong>
												La educación intercultural.
											</strong>{' '}
											Esto incluye la incorporación de
											contenidos sobre diversidad cultural, la
											formación de docentes en competencias
											interculturales, el desarrollo de
											programas educativos bilingües y
											biculturales, y la creación de
											materiales didácticos.
										</li>
										<li>
											<strong>
												El reconocimiento de la diversidad
												cultural.
											</strong>{' '}
											La PNPI contribuye al reconocimiento
											constitucional de los pueblos indígenas
											como sujetos de derechos. También se
											busca proteger y preservar el
											patrimonio cultural indígena, incluyendo
											sus sitios arqueológicos, lenguas,
											tradiciones, conocimientos y expresiones
											artísticas.
										</li>
										<li>
											<strong>
												La participación de los pueblos
												indígenas en la vida pública.
											</strong>{' '}
											Se han establecido mecanismos para
											garantizar su inclusión en la toma de
											decisiones, creando espacios de diálogo y
											consulta. Asimismo, se respeta y apoya
											la autonomía y las formas tradicionales
											de organización de las comunidades
											indígenas.
										</li>
									</ul>

									<div className='unidad-web-note'>
										<p className='unidad-web-note-title'>
											En la web
										</p>
										<p className='unidad-web-note-text'>
											¿Qué es el Diálogo Intercultural?
										</p>
									</div>

									<h4 className='unidad-subheading'>
										Consolidación
									</h4>

									<div className='unidad-doc-box'>
										<p className='unidad-doc-kicker'>
											Doc. 3 Marco de la UNESCO para
											Habilitar el Diálogo Intercultural
										</p>
										<p className='unidad-doc-text'>
											El martes 12 de septiembre se llevó a
											cabo el lanzamiento regional en América
											Latina y el Caribe del Marco de la
											UNESCO para Habilitar el Diálogo
											Intercultural en la Ciudad de Panamá
											(Panamá). El evento reunió a más de 150
											líderes juveniles indígenas y
											afrodescendientes, diplomáticos,
											miembros de la academia y la sociedad
											civil, entre otros. La región
											latinoamericana y del Caribe es un
											crisol de culturas, que es hogar de 665
											millones de personas, incluidos 671
											pueblos indígenas que integran a 55
											millones de personas y 133 millones de
											personas afrodescendientes. El Marco,
											que abarca 160 países, proporciona datos
											nacionales, regionales y globales sobre
											las estructuras, valores y procesos que
											permiten que la educación intercultural
											sea eficaz como herramienta para la
											cohesión social, la acción colectiva y
											la resolución de conflictos.
										</p>
										<p className='unidad-doc-text'>
											Durante la primera mesa redonda,
											personas expertas reflexionaron sobre
											cómo utilizar el diálogo intercultural
											para ayudar a promover la paz, prevenir
											conflictos y fortalecer la cooperación.
											Este panel también fue una oportunidad
											para proponer caminos para el diálogo.
											«El diálogo intercultural nos permitirá
											acercarnos a otras culturas, conocer
											otras culturas y a partir de ahí
											construir mejores políticas públicas».
										</p>
										<p className='unidad-doc-footer'>
											Fuente: Gabriel Cuatin, Representante,
											Red de Jóvenes Indígenas para América
											Latina y el Caribe. UNESCO (2023).
											Necesitamos hablar: midiendo el diálogo
											intercultural para la paz y la
											inclusión.
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

export default Semana3Unidad5Screen
