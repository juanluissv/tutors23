import React, { useState } from 'react'
import Sidebar from '../../../../components/Sidebar'
import Header from '../../../../components/Header'
import '../../../../App.css'

function Semana4Unidad3Screen () {
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
										Unidad 3 · Semana 4
									</h1>
									<h2 className='unidad-subtitle'>
										América Latina en el contexto de la Guerra Fría
									</h2>
								</div>

								<section>
									<h3 className='unidad-section-title'>
										Mural «Gloriosa victoria» (Diego Rivera)
									</h3>

									<div className='unidad-doc-box'>
										<p className='unidad-doc-kicker'>
											Doc. 1 — Guatemala, 1954
										</p>
										<p className='unidad-doc-text'>
											El mural &quot;Gloriosa victoria&quot; es una obra
											que escenifica la intervención de Estados Unidos
											en Guatemala (1954) para derrocar al presidente
											nacionalista Jacobo Árbenz.
										</p>
										<p className='unidad-doc-text'>
											Árbenz había realizado una reforma agraria
											afectando los intereses de la United Fruit
											Company, gran industria bananera que dominó la
											economía agroexportadora de la región.
										</p>
										<p className='unidad-doc-footer'>
											Fuente: Rivera, D. (1954). Gloriosa victoria.
										</p>
									</div>
								</section>

								<section>
									<h3 className='unidad-section-title'>
										América Latina en el contexto de la Guerra Fría
									</h3>
									<p className='unidad-paragraph'>
										Durante la Guerra Fría, América Latina fue un
										escenario donde se manifestó la polarización de
										las sociedades por diferencias ideológicas. En
										1947, ante la posibilidad de un conflicto total
										con la Unión Soviética, Estados Unidos adaptó
										su política exterior y estableció una estrategia
										de seguridad contra el comunismo en la región,
										por medio de mecanismos políticos como:
									</p>

									<ul className='unidad-consolidation-list'>
										<li>
											<strong>TIAR</strong> (Tratado Interamericano de
											Asistencia Recíproca): defensa colectiva
											continental, con instituciones militares
											latinoamericanas actuando bajo dirección
											estratégica de EE. UU. ante amenazas externas.
										</li>
										<li>
											<strong>OEA</strong> (Organización de los Estados
											Americanos): acordó el principio de no
											intervención de un país americano en otro.
										</li>
									</ul>

									<p className='unidad-paragraph'>
										Con el inicio de la guerra de Corea (1950), la
										administración Truman cambió la estrategia de
										guerra total por una de guerra limitada en sus
										territorios de control. Esta táctica se
										materializó en la Doctrina de Seguridad Nacional
										(DSN), que trasladó la defensa externa contra el
										comunismo a una noción de seguridad regional,
										como suma de seguridades internas de cada país.
									</p>
									<p className='unidad-paragraph unidad-paragraph-bottom'>
										Según la política exterior de EE. UU., mientras
										ellos se ocupaban del enfrentamiento global, las
										naciones latinoamericanas debían enfrentar dentro
										de sus territorios versiones locales del
										&quot;enemigo&quot;, reales o supuestas.
									</p>
								</section>

								<section>
									<h3 className='unidad-section-title'>
										La Revolución cubana
									</h3>

									<p className='unidad-paragraph'>
										En 1952, Cuba estaba bajo el gobierno dictatorial
										del general Fulgencio Batista, apoyado por EE.
										UU. debido a su oposición al comunismo. La
										persecución política, la corrupción y violaciones
										a derechos humanos intensificaron el malestar y
										profundizaron divisiones sociales y económicas.
									</p>
									<p className='unidad-paragraph'>
										Surgieron movimientos de oposición que buscaban
										un cambio radical. La insatisfacción con el
										gobierno autoritario y la búsqueda de alternativas
										más justas fueron factores que condujeron a la
										gestación de la Revolución cubana.
									</p>
									<p className='unidad-paragraph unidad-paragraph-bottom'>
										Hacia finales de 1958 la guerrilla logró varias
										victorias y el 1 de enero de 1959 los rebeldes
										tomaron La Habana, fecha considerada inicio de
										la Revolución. Para EE. UU. esto representó un
										peligro: según la teoría del dominó, si un país
										caía bajo influencia comunista, los vecinos
										seguirían.
									</p>

									<p className='unidad-paragraph'>
										Bajo esta premisa, EE. UU. intentó recuperar el
										control de Cuba. En 1961 respaldó a cubanos
										exiliados para invadir la isla por Bahía de
										Cochinos. La misión fracasó, pero evidenció la
										hostilidad hacia el régimen. Medidas económicas
										(como supresión del comercio) y el intento de
										invasión acercaron a Cuba a la URSS. Meses
										después, Castro declaró el carácter
										marxista-leninista de la revolución y el Partido
										Comunista ganó influencia.
									</p>

									<div className='unidad-doc-box'>
										<p className='unidad-doc-kicker'>
											Doc. 2 — La URSS y su política exterior
										</p>
										<p className='unidad-doc-text'>
											&quot;Cuba siempre ha tenido su propio camino
											político, económico y social y no fue un satélite
											de la Unión Soviética... Las relaciones con Cuba
											solo se establecieron un año y medio después de
											la revolución... Chile, con su vía pacífica... no
											había forma ni decisión para intervenir en zonas
											tan lejanas...&quot;
										</p>
										<p className='unidad-doc-footer'>
											Fuente: Leonov, N. (1999). La Inteligencia
											soviética en América Latina durante la Guerra
											Fría.
										</p>
									</div>
								</section>

								<section>
									<h3 className='unidad-section-title'>
										El impacto de la Revolución cubana y el
										surgimiento de las guerrillas
									</h3>

									<p className='unidad-paragraph'>
										El triunfo de 1959 tuvo un impacto profundo en
										América Latina y generó un efecto dominó tanto
										en el surgimiento de guerrillas y grupos
										insurgentes como en el establecimiento de
										dictaduras militares. Cuba se convirtió en un
										símbolo de resistencia, inspirando a grupos a
										levantarse contra dictaduras y gobiernos
										autoritarios. Organizaciones como las FARC
										(Colombia) y el FSLN (Nicaragua) encontraron en
										el ejemplo cubano una guía y fuente de apoyo.
									</p>

									<p className='unidad-paragraph unidad-paragraph-bottom'>
										Los gobiernos latinoamericanos recibieron
										asistencia económica de EE. UU. para prevenir la
										expansión del modelo revolucionario. En 1961,
										Kennedy presentó la Alianza para el Progreso, un
										programa para impulsar reformas graduales. Tras
										su fallecimiento, el programa perdió impulso y
										se sustituyó asistencia técnica por orientación
										militar: ejércitos recibieron entrenamiento para
										contrarrestar insurgencias.
									</p>

									<h3 className='unidad-section-title'>
										La instauración de las dictaduras militares
									</h3>
									<p className='unidad-paragraph'>
										La Revolución cubana también provocó una reacción
										de endurecimiento político y militar en el
										continente. El temor a la expansión del comunismo
										impulsó a élites locales a respaldar dictaduras
										militares para frenar movimientos insurgentes,
										con apoyo de EE. UU.
									</p>

									<div className='unidad-info-box'>
										<p className='unidad-info-title'>Glosario</p>
										<p className='unidad-info-text'>
											Insurgencia: rebelión o levantamiento en contra
											de una figura de autoridad.
										</p>
									</div>

									<div className='unidad-doc-box'>
										<p className='unidad-doc-kicker'>
											Doc. 3 — Las dictaduras militares en América Latina
										</p>
										<p className='unidad-doc-text'>
											A finales de los años setenta, quince de los
											veintiún principales estados de América Latina
											eran gobernados por dictadores militares. Muchos
											atacaron a la izquierda. En Argentina, casi 10 000
											personas fueron asesinadas por la junta militar
											(1976-1983), en su mayoría sin relación con
											guerrillas: organizadores obreros, periodistas,
											líderes estudiantiles o activistas de derechos
											humanos.
										</p>
										<p className='unidad-doc-footer'>
											Fuente: Westad, O. (2018). La Guerra Fría. Una
											historia mundial.
										</p>
									</div>

									<div className='unidad-info-box'>
										<p className='unidad-info-title'>
											Conexión histórica
										</p>
										<p className='unidad-info-text'>
											La Escuela de las Américas fue una institución
											estadounidense de instrucción militar que preparó
											a oficiales y soldados latinoamericanos en tácticas
											contrainsurgentes y operaciones militares desde
											1963.
										</p>
									</div>

									<div className='unidad-problem-grid'>
										<div className='unidad-problem-card'>
											<h4 className='unidad-problem-title'>
												Bolivia
											</h4>
											<p className='unidad-problem-text'>
												Hugo Banzer lideró un régimen dictatorial
												(1971-1978) con cierre de universidades y
												persecución de militantes de izquierda.
											</p>
										</div>
										<div className='unidad-problem-card'>
											<h4 className='unidad-problem-title'>
												Chile
											</h4>
											<p className='unidad-problem-text'>
												Salvador Allende fue elegido presidente (1970).
												En 1973 un golpe militar violento lo derrocó y
												murió en el proceso. Augusto Pinochet instauró
												un gobierno autoritario.
											</p>
										</div>
										<div className='unidad-problem-card'>
											<h4 className='unidad-problem-title'>
												Nicaragua
											</h4>
											<p className='unidad-problem-text'>
												Desde 1932 gobernó la familia Somoza. En 1962 se
												formó el FSLN, que derrocó a los Somoza en 1979.
											</p>
										</div>
										<div className='unidad-problem-card'>
											<h4 className='unidad-problem-title'>
												Paraguay
											</h4>
											<p className='unidad-problem-text'>
												Alfredo Stroessner gobernó de 1954 a 1989, una de
												las dictaduras militares más largas, sostenida
												por un sistema represivo.
											</p>
										</div>
										<div className='unidad-problem-card'>
											<h4 className='unidad-problem-title'>
												Argentina
											</h4>
											<p className='unidad-problem-text'>
												En 1976 Jorge Videla lideró un golpe de Estado
												apoyado por EE. UU. e instauró una dictadura que
												detuvo, torturó y desapareció opositores.
											</p>
										</div>
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

export default Semana4Unidad3Screen