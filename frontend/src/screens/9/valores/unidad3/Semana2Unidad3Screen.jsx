

import React, { useState } from 'react'
import Sidebar from '../../../../components/Sidebar'
import Header from '../../../../components/Header'
import '../../../../App.css'

function Semana2Unidad3Screen () {
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
										Unidad 3 · Semana 2
									</h1>
									<h2 className='unidad-subtitle'>
										La Guerra Fría, el rol de la propaganda y el
										surgimiento de las Naciones Unidas
									</h2>
								</div>

								<section>
									<h3 className='unidad-section-title'>
										Mapa propagandístico «Dos mundos» (1950)
									</h3>

									<div className='unidad-doc-box'>
										<p className='unidad-doc-kicker'>
											Doc. 1 — Two Worlds 1950 / «Dos mundos,
											1950»
										</p>
										<p className='unidad-doc-text'>
											En la imagen se observan dos mapas del
											mundo. En el mapa principal se identifican
											la Unión Soviética (en rojo) y Estados
											Unidos (en azul), además de otros países
											coloreados según su influencia soviética o
											estadounidense. El mapa resalta también la
											cercanía geográfica entre ambas potencias.
										</p>
										<p className='unidad-doc-text'>
											Mapas como este se usaron como propaganda
											política para disuadir a los ciudadanos
											estadounidenses del avance soviético y, con
											él, del comunismo. Debido a la propaganda
											alarmista, los estadounidenses apoyaron
											programas de contención y apoyo a países
											después de la Segunda Guerra Mundial, como
											la doctrina Truman y el Plan Marshall.
										</p>
										<p className='unidad-doc-footer'>
											Fuente: Chapin, R. M. Time Magazine. Enero
											de 1950. Cornell University – PJ Mode
											Collection of Persuasive Cartography.
										</p>
									</div>
								</section>

								<section>
									<h3 className='unidad-section-title'>
										Los orígenes y las causas de la Guerra
										Fría
									</h3>
									<p className='unidad-paragraph'>
										Al finalizar la Segunda Guerra Mundial, Europa
										quedó destruida. Los países enfrentaron el
										reto de reconstrucción, no solo de sus ciudades,
										sino también de aspectos vitales como la
										economía y la forma de vida en la sociedad.
										Cuando la guerra concluyó, los aliados (Estados
										Unidos, Reino Unido y la Unión Soviética) ya
										habían discutido directrices de posguerra.
									</p>
									<p className='unidad-paragraph'>
										Alemania fue ocupada por los vencedores
										(Estados Unidos, Reino Unido, Francia y la
										Unión Soviética), lo que dividió el país en
										cuatro zonas. Su capital, Berlín, también quedó
										segmentada. En años posteriores, se construiría
										uno de los símbolos más representativos de la
										Guerra Fría: el Muro de Berlín.
									</p>
									<p className='unidad-paragraph unidad-paragraph-bottom'>
										La Segunda Guerra Mundial reordenó el
										posicionamiento de las potencias: Estados Unidos
										se consolidó como superpotencia política y
										económica, mientras la Unión Soviética, pese a
										los millones de fallecidos, demostró su
										capacidad al unirse a los aliados contra la
										Alemania nazi y los países del Eje. Aunque las
										razones de la alianza se desvanecieron, las
										diferencias aumentaron.
									</p>

									<div className='unidad-info-box'>
										<p className='unidad-info-title'>
											Conexión histórica
										</p>
										<p className='unidad-info-text'>
											La Revolución rusa fue un proceso histórico que
											cambió radicalmente la organización política
											de Rusia y dio paso a la conformación de la
											Unión Soviética. La revolución bolchevique,
											liderada por Lenin, derrotó a los Zares de la
											Rusia imperial.
										</p>
									</div>
								</section>

								<section>
									<h3 className='unidad-section-title'>
										Profundización
									</h3>

									<div className='unidad-doc-box'>
										<p className='unidad-doc-kicker'>
											Doc. 2 — Planes económicos de la Unión
											Soviética y Estados Unidos
										</p>
										<p className='unidad-doc-text'>
											Los planes económicos rivales reforzaron la
											división militar existente en Europa al crear
											esferas de influencia que competían entre sí.
											En Occidente, la asistencia económica del
											Plan Marshall revitalizó o creó gobiernos
											democráticos basados en el mercado libre (o al
											menos que lo toleraban). En el este, el Plan
											Molotov se convirtió en la base del COMECON,
											que integró economías de Europa del Este con
											la economía soviética.
										</p>
										<p className='unidad-doc-text'>
											La reglamentación económica del bloque oriental
											fue acompañada por una intensificación de la
											represión política, ya que se consideró que no
											era necesario aplacar la opinión occidental.
										</p>
										<p className='unidad-doc-footer'>
											Fuente: Powaski, R. E. (2000). La Guerra
											Fría. Estados Unidos y la Unión Soviética,
											1917-1991.
										</p>
									</div>
								</section>

								<section>
									<h3 className='unidad-section-title'>
										Surgimiento de las Naciones Unidas
									</h3>
									<p className='unidad-paragraph'>
										Una de las consecuencias de la Segunda Guerra
										Mundial fue la fundación de la Organización de
										las Naciones Unidas (United Nations, en inglés)
										(Doc. 3). Esta forma de organización de Estados
										ya había tenido un intento previo después de la
										Primera Guerra Mundial, llamada Liga de las
										Naciones, pero no logró los resultados esperados.
									</p>
									<p className='unidad-paragraph'>
										Durante la Segunda Guerra Mundial, los líderes
										estadounidenses pensaron en crear un organismo
										en el que los países pudieran ser miembros aun en
										tiempos de paz, para mediar conflictos, unir
										esfuerzos y permitir que las potencias mundiales
										ejercieran poder de decisión ante situaciones
										globales.
									</p>
									<p className='unidad-paragraph unidad-paragraph-bottom'>
										En este contexto también se crearon otros
										organismos internacionales, como el Fondo
										Monetario Internacional (FMI), encargado de
										equilibrar el sistema económico mundial, y
										posteriormente el Banco Mundial, encargado de
										otorgar préstamos a los países. Estas
										instituciones acompañaron directrices para la
										reconfiguración del mundo después de la Segunda
										Guerra Mundial y dieron paso a la Guerra Fría.
									</p>

									<div className='unidad-info-box'>
										<p className='unidad-info-title'>Glosario</p>
										<p className='unidad-info-text'>
											Veto: derecho a impedir alguna acción o ley.
										</p>
									</div>

									<div className='unidad-doc-box'>
										<p className='unidad-doc-kicker'>
											Doc. 3 — El surgimiento y los alcances de
											Naciones Unidas
										</p>
										<p className='unidad-doc-text'>
											El primer objetivo se hacía realidad a través de
											la Asamblea General de Naciones Unidas, que en
											sus comienzos tenía 51 miembros, entre los que
											figuraban veinte repúblicas latinoamericanas.
											El segundo se estructuraba a través del Consejo
											de Seguridad de Naciones Unidas, con cinco
											miembros: Estados Unidos, Gran Bretaña, la URSS,
											Francia y China. Cada uno tenía poder de veto
											contra cualquier propuesta.
										</p>
										<p className='unidad-doc-text'>
											Solo el Consejo de Seguridad podía emitir
											resoluciones vinculantes para todos los Estados
											miembros, incluso para decretar sanciones o
											accione militares. Stalin y los británicos no
											tenían mucha fe en la nueva organización, pero
											se dejaron llevar para complacer a su poderoso
											socio estadounidense. En 1945, nadie podía
											prever el papel mundial que Naciones Unidas
											desempeñaría conforme se extendía la Guerra Fría.
										</p>
										<p className='unidad-doc-footer'>
											Fuente: Westad, O. (2018). La Guerra Fría. Una
											historia mundial.
										</p>
									</div>
								</section>

								<section>
									<h3 className='unidad-section-title'>
										Etapas de la Guerra Fría
									</h3>

									<div className='unidad-problem-grid'>
										<div className='unidad-problem-card'>
											<h4 className='unidad-problem-title'>
												Etapa de contención (1945-1953)
											</h4>
											<p className='unidad-problem-text'>
												Destacaron Harry Truman y Iósif Stalin. Se
												consolidaron bloques capitalista y comunista,
												que crearon instituciones para marcar su
												esfera de influencia.
											</p>
										</div>

										<div className='unidad-problem-card'>
											<h4 className='unidad-problem-title'>
												Etapa de distensión (1953-1962)
											</h4>
											<p className='unidad-problem-text'>
												Con el fallecimiento de Stalin inició la
												desestalinización. La Guerra Fría se dimensionó
												como fenómeno global: Revolución cubana, crisis
												de los misiles (1962) y negociaciones que
												permitieron retirar misiles.
											</p>
										</div>

										<div className='unidad-problem-card'>
											<h4 className='unidad-problem-title'>
												Etapa de coexistencia pacífica (1962-1975)
											</h4>
											<p className='unidad-problem-text'>
												Las relaciones tensas se regularon por el diálogo.
												El conflicto se trasladó a África, Asia y América
												Latina, con ejemplos como la guerra de Vietnam y
												las repercusiones del conflicto en Afganistán.
											</p>
										</div>

										<div className='unidad-problem-card'>
											<h4 className='unidad-problem-title'>
												Etapa de cooperación entre sistemas (1975-1991)
											</h4>
											<p className='unidad-problem-text'>
												Ronald Reagan impulsó cambios y aumentó el
												presupuesto para armas avanzadas, mientras la URSS
												no podía equipararse. Con Mijaíl Gorbachov se
												plantearon reformas (Perestroika y Glasnost), cayó
												el Muro de Berlín en 1989 y en 1991 la URSS se
												disolvió, señalando el fin de la Guerra Fría para
												ciertos historiadores.
											</p>
										</div>
									</div>
								</section>

								<section>
									<h3 className='unidad-section-title'>
										Aspectos destacados de la Guerra Fría
									</h3>
									<p className='unidad-paragraph'>
										Durante la Guerra Fría se conformaron bloques
										capitalista y comunista, representados por
										Estados Unidos y la Unión Soviética. Estos aspectos
										ideológicos se materializaron en acciones y
										dictámenes políticos que influyeron en la
										administración de cada Estado.
									</p>

									<div className='unidad-problem-grid'>
										<div className='unidad-problem-card'>
											<h4 className='unidad-problem-title'>
												Sistema ideológico
											</h4>
											<p className='unidad-problem-text'>
												La administración y el discurso se organizaron
												alrededor de modelos antagónicos: capitalismo y
												comunismo.
											</p>
										</div>

										<div className='unidad-problem-card'>
											<h4 className='unidad-problem-title'>
												Carrera armamentista
											</h4>
											<p className='unidad-problem-text'>
												La competencia por armas nucleares y
												armamento sofisticado generó alarmas sobre la
												posibilidad de enfrentamientos bélicos directos.
											</p>
										</div>

										<div className='unidad-problem-card'>
											<h4 className='unidad-problem-title'>
												Carrera espacial
											</h4>
											<p className='unidad-problem-text'>
												La exploración del espacio se convirtió en una
												apuesta por prestigio internacional, impulsando
												avances científicos y tecnológicos.
											</p>
										</div>

										<div className='unidad-problem-card'>
											<h4 className='unidad-problem-title'>
												Desarrollo tecnológico
											</h4>
											<p className='unidad-problem-text'>
												Se invirtió en ciencia e informática y se
												incluyeron mejoras asociadas a electrodomésticos,
												lo que transformó la vida cotidiana.
											</p>
										</div>

										<div className='unidad-problem-card'>
											<h4 className='unidad-problem-title'>
												Impacto cultural y social
											</h4>
											<p className='unidad-problem-text'>
												Hubo persecuciones como la purga de miembros
												del partido comunista durante Stalin y el
												macartismo en Estados Unidos, con acusaciones
												políticas que afectaron empleos y aumentaron el
												miedo social ante una posible catástrofe.
											</p>
										</div>
									</div>

									<p className='unidad-paragraph unidad-paragraph-bottom'>
										Aunque las potencias no entraron en confrontación
										directa, sí se involucraron en conflictos de
										países con intereses o influencia. La competencia se
										evidenció en aspectos políticos, económicos y
										sociales.
									</p>
								</section>

								<section>
									<h3 className='unidad-section-title'>
										El rol de la propaganda en la Guerra Fría
									</h3>

									<p className='unidad-paragraph'>
										La propaganda fue una de las principales formas de
										difusión de ideas durante la Guerra Fría (Doc. 4).
										Por diferentes medios —prensa, arte, cine, caricatura
										política, panfletos, entre otros— se difundieron
										mensajes con el fin de influir en la opinión de la
										población sobre las bondades de un sistema político-
										económico y los peligros del sistema contrario. Los
										gobiernos no fueron los únicos responsables: también
										participaron iglesias, productoras de cine y otros
										sectores.
									</p>

									<div className='unidad-doc-box'>
										<p className='unidad-doc-kicker'>
											Doc. 4 — La Guerra Fría a través de la
											propaganda
										</p>
										<p className='unidad-doc-text'>
											El paradigma central de la Guerra Fría fue una
											batalla de ideas, no una batalla militar, económica
											o política. Se trató de una confrontación
											ideológica entre dos modelos antagónicos.
										</p>
										<p className='unidad-doc-text'>
											Como ejemplo de propaganda soviética, se presenta
											un póster donde aparece Lenin barriendo la tierra
											con una escoba roja, simbolizando que la
											implementación del comunismo eliminaría males
											asociados al capitalismo y a la religión, desde la
											perspectiva soviética. Otro póster muestra a
											Stalin en el centro, acompañado por una estatua de
											Lenin y personas con profesiones distintas delante
											de un fondo industrial, destacando el papel del
											líder y el progreso económico e industrial, junto
											con connotaciones anticapitalistas.
										</p>
										<p className='unidad-doc-text'>
											La propaganda estadounidense también buscaba infundir
											miedo: se presentan ejemplos como una portada de
											comic sobre lo que ocurriría si el comunismo llegara
											a Estados Unidos, donde la bandera estadounidense se
											encuentra rodeada de fuego y escenas con soldados
											sometiendo a otras personas, generando una
											representación caótica del impacto del comunismo.
											Asimismo, una caricatura política coloca a Stalin
											bajo un microscopio con la leyenda sobre Naciones
											Unidas examinando la causa del conflicto, usando
											la imagen para sugerir cautela sobre el papel de
											la Unión Soviética.
										</p>
										<p className='unidad-doc-footer'>
											Fuentes (pósters y caricaturas) según el documento original.
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

export default Semana2Unidad3Screen