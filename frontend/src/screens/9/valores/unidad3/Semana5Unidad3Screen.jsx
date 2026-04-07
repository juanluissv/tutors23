import React, { useState } from 'react'
import Sidebar from '../../../../components/Sidebar'
import Header from '../../../../components/Header'
import '../../../../App.css'

function Semana5Unidad3Screen () {
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
										Unidad 3 · Semana 5
									</h1>
									<h2 className='unidad-subtitle'>
										Descolonización en África y Asia en el contexto
										de la Guerra Fría: independencias de Egipto y la
										India
									</h2>
								</div>

								<section>
									<h3 className='unidad-section-title'>
										Mahatma Gandhi y la independencia de la India
									</h3>

									<p className='unidad-paragraph unidad-paragraph-bottom'>
										India es un país asiático, diverso y complejo que
										por casi 200 años estuvo bajo el dominio inglés
										(1858-1947). En la primera mitad del siglo XX
										destacó Mahatma Gandhi, abogado indio formado en
										Inglaterra y con experiencia en Sudáfrica. Su
										misión fue la independencia de la India,
										promoviendo la no violencia y la desobediencia
										civil. Sus ideas influyeron en otros líderes como
										Martin Luther King Jr.
									</p>

									<div className='unidad-doc-box'>
										<p className='unidad-doc-kicker'>
											Doc. 1 — La no violencia de Mahatma Gandhi y
											la independencia de la India
										</p>
										<p className='unidad-doc-text'>
											&quot;En el momento en que estoy por lanzar la mayor
											campaña de mi vida, no puede haber odio hacia los
											británicos en mi corazón... Sin embargo, ustedes
											no deben recurrir a la violencia; eso pondría a
											la no violencia en la deshonra.&quot;
										</p>
										<p className='unidad-doc-text'>
											&quot;La no violencia es un arma incomparable... Si
											ustedes quieren la libertad verdadera, habrán de
											unirse, y tal unión creará verdadera democracia...
											Mi democracia significa que cada uno es su propio
											amo... olvidarán las diferencias entre hindúes y
											musulmanes.&quot;
										</p>
										<p className='unidad-doc-footer'>
											Fuente: Mahatma Gandhi (1942). El arma de la no
											violencia. Discurso en el Congreso Indio.
										</p>
									</div>
								</section>

								<section>
									<h3 className='unidad-section-title'>
										Los procesos de descolonización
									</h3>
									<p className='unidad-paragraph'>
										La descolonización es el proceso mediante el cual
										las colonias de los imperios europeos lograron su
										independencia y se convirtieron en países
										soberanos, principalmente en el siglo XX, tras la
										Segunda Guerra Mundial. Implica no solo retiro de
										autoridades coloniales y traspaso de poder, sino
										la redefinición de identidades nacionales, la
										reestructuración de economías y sociedades
										poscoloniales y la superación de herencias
										políticas, culturales y económicas.
									</p>
									<p className='unidad-paragraph unidad-paragraph-bottom'>
										La descolonización tuvo matices: negociaciones y
										referendos, guerras de liberación y conflictos
										violentos. Ejemplos: independencia de India y
										Pakistán (1947), gran parte de África (1950-1960),
										y países del sudeste asiático y el Caribe. Este
										proceso fue influenciado por la Guerra Fría, con
										intereses de EE. UU. y la URSS en nuevas naciones.
									</p>

									<div className='unidad-problem-grid'>
										<div className='unidad-problem-card'>
											<h4 className='unidad-problem-title'>
												Desarrollo del nacionalismo
											</h4>
											<p className='unidad-problem-text'>
												Programas organizados en favor de la
												independencia, con ideologías diversas:
												conservadores, liberales y clases populares
												revolucionarias.
											</p>
										</div>
										<div className='unidad-problem-card'>
											<h4 className='unidad-problem-title'>
												Solidaridad entre los pueblos
											</h4>
											<p className='unidad-problem-text'>
												Unidad contra el imperialismo europeo:
												panasianismo en Asia y panafricanismo en
												África.
											</p>
										</div>
										<div className='unidad-problem-card'>
											<h4 className='unidad-problem-title'>
												Renovación de valores culturales
											</h4>
											<p className='unidad-problem-text'>
												Reafirmación de identidad sociocultural como
												soporte ideológico de movimientos
												nacionalistas.
											</p>
										</div>
										<div className='unidad-problem-card'>
											<h4 className='unidad-problem-title'>
												ONU y política descolonizadora
											</h4>
											<p className='unidad-problem-text'>
												Compromiso basado en Carta del Atlántico y la
												Declaración relativa a territorios no
												autónomos.
											</p>
										</div>
										<div className='unidad-problem-card'>
											<h4 className='unidad-problem-title'>
												Transformación social
											</h4>
											<p className='unidad-problem-text'>
												Estructuras de recursos materiales y humanos
												impulsaron transformaciones económicas, sociales
												y culturales.
											</p>
										</div>
										<div className='unidad-problem-card'>
											<h4 className='unidad-problem-title'>
												Fin de antiguos imperios
											</h4>
											<p className='unidad-problem-text'>
												Potencias coloniales perdieron prestigio y
												nuevas superpotencias (EE. UU. y URSS) apoyaron
												la descolonización para debilitar a Europa.
											</p>
										</div>
									</div>
								</section>

								<section>
									<h3 className='unidad-section-title'>
										La descolonización en África
									</h3>
									<p className='unidad-paragraph'>
										La descolonización en África condujo a la
										independencia de antiguas colonias europeas,
										principalmente entre fines de 1940 y décadas de
										1950 y 1960. Entre causas destacaron:
									</p>
									<ul className='unidad-consolidation-list'>
										<li>
											Cambios económicos y sociales: infraestructura y
											comunicaciones difundieron nuevas ideas
											políticas.
										</li>
										<li>
											Transformación de la política internacional:
											rechazo de EE. UU., URSS y la ONU al sistema
											colonial y apoyo a movimientos afines en el marco
											de la Guerra Fría.
										</li>
									</ul>

									<div className='unidad-info-box'>
										<p className='unidad-info-title'>Glosario</p>
										<p className='unidad-info-text'>
											Emancipar: liberarse de cualquier clase de
											subordinación o dependencia.
										</p>
									</div>

									<div className='unidad-doc-box'>
										<p className='unidad-doc-kicker'>
											Mapa — Descolonización de África
										</p>
										<p className='unidad-doc-text'>
											El documento original incluye un mapa con fechas
											y potencias coloniales por territorio.
										</p>
										<p className='unidad-doc-footer'>
											Fuente: Gil Lobo, A. (2020). Descolonización de
											África. El Orden Mundial.
										</p>
									</div>
								</section>

								<section>
									<h3 className='unidad-section-title'>
										La independencia de Egipto
									</h3>
									<p className='unidad-paragraph'>
										Desde 1936 Egipto fue gobernado por el rey Faruk,
										en alianza con el Imperio británico. Hubo
										corrupción y mal gobierno; además, existía un
										grupo que buscaba negociar independencia total.
										La lucha por el poder se planteó entre británicos,
										monarquía y partido nacionalista, hasta el golpe
										revolucionario del 23 de julio de 1952, que
										destrozó el equilibrio previo y creó uno nuevo
										basado en intereses nacionales.
									</p>

									<p className='unidad-paragraph unidad-paragraph-bottom'>
										Una acción trascendental del gobierno de Nasser
										fue la nacionalización del canal de Suez (julio
										de 1956). Al controlar el canal, se aseguraba la
										economía egipcia y se facilitaban otros proyectos
										de infraestructura y desarrollo. El éxito temprano
										tuvo impacto en movimientos nacionalistas en el
										mundo árabe y África.
									</p>

									<div className='unidad-doc-box'>
										<p className='unidad-doc-kicker'>
											Doc. 2 — Egipto y la Revolución árabe
										</p>
										<p className='unidad-doc-text'>
											En julio de 1952 una sublevación armada del
											Movimiento de Oficiales Libres derrocó la
											monarquía e instaló la república (18 de junio de
											1953), aboliendo partidos políticos. Bajo Nasser,
											el régimen nacionalista se volcó hacia la URSS,
											que proveyó material militar. En 1956 se
											nacionalizó el canal de Suez y Reino Unido,
											Francia e Israel atacaron Egipto en octubre y
											noviembre.
										</p>
										<p className='unidad-doc-footer'>
											Fuente: Coggiola, O. (2011). Egipto y la
											Revolución árabe.
										</p>
									</div>

									<div className='unidad-doc-box'>
										<p className='unidad-doc-kicker'>
											Doc. 3 — Discurso de Nasser sobre la
											nacionalización del canal de Suez
										</p>
										<p className='unidad-doc-text'>
											&quot;Iremos hacia adelante para borrar de una vez
											por todas las huellas de la ocupación y de la
											explotación... nacionalizamos la Compañía del
											Canal... el canal de Suez para el interés de
											Egipto y no para la explotación... Somos ya
											libres e independientes.&quot;
										</p>
										<p className='unidad-doc-footer'>
											Fuente: Fragmento del discurso de Gamal Abdel
											Nasser (1956). Nacionalización del canal de
											Suez.
										</p>
									</div>
								</section>

								<section>
									<h3 className='unidad-section-title'>
										La crisis del canal de Suez
									</h3>
									<p className='unidad-paragraph'>
										El canal de Suez fue administrado por una
										compañía anglo-francesa desde 1869, hasta su
										nacionalización el 26 de julio de 1956. Reino
										Unido y Francia intentaron recuperar el control:
										en octubre Israel emprendió acciones militares
										contra Egipto y en noviembre franceses e ingleses
										se incorporaron. Hubo rechazo y presión de EE. UU.
										y la ONU para su retirada, con consecuencias
										geopolíticas.
									</p>

									<div className='unidad-doc-box'>
										<p className='unidad-doc-kicker'>
											Doc. 4 — Consecuencias de la crisis de Suez
										</p>
										<p className='unidad-doc-text'>
											La crisis dejó claro que Gran Bretaña y Francia
											no podían tomar medidas independientes contra la
											voluntad de EE. UU. Fue un revés al prestigio
											nacional de ambos. También mostró que en el mundo
											poscolonial la opinión pública importaba y que
											hacer alarde de fuerza bruta tenía costo. La
											descolonización se aceleró y se evidenció que el
											futuro de ambos países estaba en Europa y la
											alianza atlántica, no en África o Asia.
										</p>
										<p className='unidad-doc-footer'>
											Fuente: Westad, O. A. (2018). La Guerra Fría.
											Una historia mundial.
										</p>
									</div>
								</section>

								<section>
									<h3 className='unidad-section-title'>
										La descolonización en Asia
									</h3>
									<p className='unidad-paragraph'>
										En el contexto de la Guerra Fría se generaron
										movimientos de liberación nacional, destacando el
										derecho de pueblos colonizados a disponer de sí
										mismos. Esto se presentó con fuerza en países
										como India, Indonesia, Malasia y Filipinas.
									</p>
									<p className='unidad-paragraph'>
										La descolonización se debió al impulso de
										movimientos nacionalistas, cuyos líderes a menudo
										recibieron educación occidental. Fueron activos
										desde la Primera Guerra Mundial y ampliaron su
										presión luego de la Segunda Guerra Mundial, cuando
										Francia y Gran Bretaña mostraron no ser
										invencibles.
									</p>

									<h3 className='unidad-section-title'>
										La independencia de India
									</h3>
									<p className='unidad-paragraph'>
										A inicios del siglo XX, la India Británica
										(conformada por actuales India, Pakistán y
										Bangladesh) era una posesión colonial clave. Se
										desarrollaron movimientos independentistas
										diversos por pluralidad étnica y religiosa. Gandhi
										fue uno de los líderes más representativos.
									</p>
									<p className='unidad-paragraph unidad-paragraph-bottom'>
										Las acciones no violentas se difundieron; la
										Marcha de la Sal fue significativa contra el
										dominio inglés. La independencia llegó con la
										partición: en 1947 se decidió dividir en dos
										dominios: India (población hindú) y Pakistán
										(Penjab y Bengala, población musulmana), lo que
										generó enfrentamientos violentos y migración
										forzada. India conmemora su independencia el 15
										de agosto de 1947.
									</p>

									<div className='unidad-info-box'>
										<p className='unidad-info-title'>
											Conexión histórica
										</p>
										<p className='unidad-info-text'>
											La Marcha de la Sal (1930) fue una protesta
											pacífica: adquirir sal directamente de la playa,
											violando leyes inglesas sin recurrir a violencia.
										</p>
									</div>

									<div className='unidad-doc-box'>
										<p className='unidad-doc-kicker'>
											Doc. 5 — El movimiento nacionalista bajo el
											liderazgo de Gandhi (1919-1939)
										</p>
										<p className='unidad-doc-text'>
											Gandhi se convirtió en líder del movimiento
											nacionalista indio. En 1919-1920 dirigió una
											campaña; millones dejaron actividades con un
											hartal (cesar toda actividad por un día). Propuso
											negar acatamiento a leyes británicas. Pese a
											esfuerzos del gobierno por controlarlo, su
											influencia produjo resultados.
										</p>
										<p className='unidad-doc-footer'>
											Fuente: De la Torre del Río, R. (2014). Breve
											historia de la India contemporánea.
										</p>
									</div>
								</section>

								<section>
									<h3 className='unidad-section-title'>
										La partición de la India
									</h3>
									<p className='unidad-paragraph'>
										Tras la partición se produjo la mayor migración
										en masa de la historia, con un estimado de 15
										millones de desplazados. Hindús y sijs migraron a
										India y musulmanes al territorio pakistaní. Los
										meses posteriores se marcaron por radicalización
										del conflicto étnico.
									</p>
									<p className='unidad-paragraph unidad-paragraph-bottom'>
										Desde 1947 hasta 1951, Pakistán vivió inestabilidad.
										En 1956 se constituyó en república, alternando
										dictaduras militares y gobiernos civiles. En 1971,
										tras guerra y con intervención india, Pakistán
										Oriental se separó como Bangladesh.
									</p>

									<div className='unidad-info-box'>
										<p className='unidad-info-title'>
											Conexión histórica
										</p>
										<p className='unidad-info-text'>
											La partición fue traumática: se estima alrededor
											de un millón de muertes por el caos de movilización
											de poblaciones.
										</p>
									</div>
								</section>

								<section>
									<h3 className='unidad-section-title'>
										Doc. 6 — Declaración de la ONU (1960)
									</h3>

									<div className='unidad-doc-box'>
										<p className='unidad-doc-kicker'>
											Doc. 6 — Declaración sobre la concesión de la
											independencia a los países y pueblos coloniales
											(ONU, 1960)
										</p>
										<p className='unidad-doc-text'>
											&quot;Reconociendo el apasionado deseo de libertad...
											Convencida de que la continuación del colonialismo
											impide el desarrollo... Proclama solemnemente la
											necesidad de poner fin rápida e
											incondicionalmente al colonialismo...&quot;
										</p>
										<p className='unidad-doc-text'>
											Entre sus declaraciones: la sujeción a
											dominación extranjera niega derechos humanos; los
											pueblos tienen derecho de libre determinación;
											la falta de preparación no es pretexto para
											retrasar independencia; deben cesar medidas
											represivas y respetarse integridad territorial.
										</p>
										<p className='unidad-doc-footer'>
											Fuente: Organización de las Naciones Unidas
											(1960). Declaración sobre la concesión de la
											independencia a los países y pueblos coloniales.
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

export default Semana5Unidad3Screen