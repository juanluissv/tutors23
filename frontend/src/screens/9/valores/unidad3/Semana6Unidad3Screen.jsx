import React, { useState } from 'react'
import Sidebar from '../../../../components/Sidebar'
import Header from '../../../../components/Header'
import '../../../../App.css'

function Semana6Unidad3Screen () {
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
										Unidad 3 · Semana 6
									</h1>
									<h2 className='unidad-subtitle'>
										Movimiento de Países No Alineados:
										autodeterminación, soberanía y rechazo al
										racismo
									</h2>
								</div>

								<section>
									<h3 className='unidad-section-title'>
										Contexto histórico del surgimiento del
										Movimiento de Países No Alineados
									</h3>

									<div className='unidad-doc-box'>
										<p className='unidad-doc-kicker'>
											Profundización — Bases del surgimiento
										</p>
										<p className='unidad-doc-text'>
											A principios de los años sesenta, la
											descolonización había transformado el mundo:
											había muchos más países independientes y
											estaban gobernados por no europeos. Europa
											había perdido poder, y los nuevos Estados
											exigían voz propia en los asuntos mundiales.
										</p>
										<p className='unidad-doc-text'>
											A la mayoría no le gustaba el orden
											internacional de la Guerra Fría, que sentían
											como una forma de control europeo. Sin
											embargo, la Guerra Fría los alcanzaba a través
											de conflictos dentro y fuera del país.
										</p>
										<p className='unidad-doc-text'>
											En las décadas de 1950 y 1960 surgieron
											nuevos Estados africanos y asiáticos, en un
											contexto de luchas por la independencia.
										</p>
										<p className='unidad-doc-text'>
											Durante la Guerra Fría, los países no alineados
											consideraron clave unirse para defender sus
											intereses frente a las superpotencias y
											contener el avance colonialista. Por eso se
											iniciaron reuniones con lineamientos
											filosóficos y políticos.
										</p>
										<p className='unidad-doc-footer'>
											Fuente: Westad, O. A. (2018). La Guerra Fría.
											Una historia mundial.
										</p>
									</div>

									<div className='unidad-info-box'>
										<p className='unidad-info-title'>Contexto</p>
										<p className='unidad-info-text'>
											El &quot;tercer mundo&quot; fue un término usado en la
											Guerra Fría para describir a países que no
											formaban parte de la esfera de influencia ni de
											Estados Unidos (primer mundo) ni de la Unión
											Soviética (segundo mundo).
										</p>
									</div>
								</section>

								<section>
									<h3 className='unidad-section-title'>
										El Movimiento de Países No Alineados (MNOAL)
									</h3>

									<div className='unidad-paragraph'>
										<p className='unidad-paragraph'>
											El Movimiento de Países No Alineados (MNOAL)
											es una organización que surgió en el contexto de
											la Guerra Fría y busca defender los intereses y
											aspiraciones de los países del tercer mundo.
										</p>
										<p className='unidad-paragraph unidad-paragraph-bottom'>
											Como antecedente, se reconoce la Conferencia
											de Bandung (1955). Fue convocada para discutir
											la paz, el papel de los países en desarrollo frente
											a la Guerra Fría, el desarrollo económico y la
											descolonización de países bajo ocupación
											colonial. La iniciativa provino de cinco
											primeros países descolonizados en Asia: Pakistán,
											India, Indonesia, Ceilán y Birmania.
										</p>
									</div>

									<div className='unidad-doc-box'>
										<p className='unidad-doc-kicker'>
											Doc. 2 — Diez Principios de Bandung (1955)
										</p>
										<ul className='unidad-consolidation-list'>
											<li>
												Respeto por los derechos humanos
												fundamentales y por los propósitos y
												principios de la Carta de Naciones Unidas
											</li>
											<li>
												Respeto a la soberanía y a la integridad
												territorial
											</li>
											<li>
												Igualdad de razas y de todas las naciones,
												grandes y pequeñas
											</li>
											<li>
												Abstención de intervención o injerencia en los
												asuntos internos de otro país
											</li>
											<li>
												Derecho a defenderse individual o colectivamente
												según la Carta de la ONU
											</li>
											<li>
												No usar mecanismos de defensa colectiva para
												intereses particulares de grandes potencias
											</li>
											<li>
												Abstenerse de actos o amenazas de agresión o
												uso de la fuerza
											</li>
											<li>
												Solución de controversias internacionales por
												vías pacíficas
											</li>
											<li>
												Promoción de intereses mutuos y cooperación
											</li>
											<li>
												Respeto a la justicia y las obligaciones
												internacionales
											</li>
										</ul>
										<p className='unidad-doc-footer'>
											Fuente: Principios de la Conferencia de
											Bandung (1955)
										</p>
									</div>
								</section>

								<section>
									<h3 className='unidad-section-title'>
										La conferencia de Belgrado
									</h3>

									<div className='unidad-doc-box'>
										<p className='unidad-doc-kicker'>
											Doc. 3 — Primera Cumbre del MNOAL (1961)
										</p>
										<p className='unidad-doc-text'>
											El Movimiento de Países No Alineados se estableció
											formalmente en la Primera Cumbre celebrada del
											1 al 6 de septiembre de 1961 en Belgrado,
											Yugoslavia. Asistieron 25 países miembros y 3
											delegaciones de países observadores. Parte de la
											declaración final expresa el fin de la injerencia del
											colonialismo ante nuevas naciones.
										</p>
										<p className='unidad-doc-text'>
											&quot;El imperialismo se está debilitando... los imperios
											coloniales y demás formas de opresión extranjera
											están gradualmente desapareciendo... se acelera el
											fin de la época de la opresión extranjera... la
											cooperación pacífica basada en independencia e
											igualdad de derechos es condición esencial para
											igualdad y progreso.&quot;
										</p>
										<p className='unidad-doc-footer'>
											Fuente: Declaración de Belgrado de países no
											alineados (1961)
										</p>
									</div>
								</section>

								<section>
									<h3 className='unidad-section-title'>
										El rol del MNOAL y el rechazo al apartheid
									</h3>

									<div className='unidad-doc-box'>
										<p className='unidad-doc-kicker'>
											Doc. 4 — El rol del Movimiento de Países No Alineados
										</p>
										<p className='unidad-doc-text'>
											Entre las características que unían al movimiento
											estaba la lucha contra el colonialismo y la
											autodeterminación, así como el rechazo al racismo.
											En este sentido, el accionar del MNOAL buscó apoyar
											causas que pretendían erradicar el racismo
											sistémico, como el apartheid en Sudáfrica.
										</p>
										<p className='unidad-doc-text'>
											El apartheid fue una segregación social basada en el
											color de piel, que determinaba el estatus en la
											sociedad: afectaba educación, empleo e incluso
											lugares de vivienda. Este sistema se estableció
											desde 1948 y culminó en la década de 1990.
										</p>
										<p className='unidad-doc-text'>
											En Sudáfrica surgieron movimientos contra este
											racismo institucionalizado, destacando Nelson Mandela.
											En el contexto internacional, el MNOAL desempeñó un
											rol considerable: brindó apoyo material, político y moral
											para la lucha contra el apartheid y fortaleció relaciones
											con países africanos, mayoritarios en el movimiento.
										</p>
										<p className='unidad-doc-footer'>
											Fuente: Monyae, D. (1999). South Africa And The Non-Aligned
											Movement (NAM): Confronting The New Global Challenges.
										</p>
									</div>

									<div className='unidad-info-box'>
										<p className='unidad-info-title'>Conexión histórica</p>
										<p className='unidad-info-text'>
											Nelson Mandela fue un activista contra el apartheid.
											Durante su lucha fue arrestado y condenado a prisión
											por 27 años. Luego de su liberación, fue elegido
											presidente de Sudáfrica. Hoy es recordado como símbolo
											de reconciliación a nivel local y mundial.
										</p>
									</div>
								</section>

								<section>
									<h3 className='unidad-section-title'>
										La importancia del Movimiento de Países No Alineados y su rol en la actualidad
									</h3>

									<div className='unidad-consolidation-card'>
										<p className='unidad-consolidation-text'>
											El trabajo del movimiento se guio por los Principios de Bandung,
											centrados en ideales políticos. Con el paso de los años, la
											cooperación económica y las cuestiones sociales y humanitarias
											se convirtieron en elementos centrales.
										</p>
										<p className='unidad-consolidation-text'>
											El MNOAL ha tenido un papel decisivo en la defensa de la paz y
											la seguridad internacional. Algunos logros incluyen:
										</p>
										<ul className='unidad-consolidation-list'>
											<li>
												Conformación de un proceso emancipador de pueblos de África, Asia,
												América Latina y otras regiones.
											</li>
											<li>
												Defensa de la paz mundial y promoción de valores del multilateralismo,
												así como propósitos y principios del derecho internacional y la Carta
												de Naciones Unidas.
											</li>
											<li>
												Cooperación para el desarme nuclear y establecimiento de zonas libres
												de armas nucleares.
											</li>
											<li>
												Condena y lucha contra el terrorismo en todas sus formas.
											</li>
											<li>
												Apoyo a esfuerzos de Naciones Unidas para el mantenimiento y consolidación
												de la paz.
											</li>
										</ul>
									</div>

									<div className='unidad-consolidation-card'>
										<h4 className='unidad-consolidation-heading'>
											El rol del MNOAL en el presente
										</h4>
										<p className='unidad-consolidation-text'>
											Actualmente, el MNOAL cuenta con 120 países miembros de todo el mundo,
											18 países observadores y 10 organizaciones observadoras. Defiende principios como:
										</p>
										<ul className='unidad-consolidation-list'>
											<li>Independencia y soberanía política</li>
											<li>Solución de conflictos internacionales sin uso de la fuerza</li>
											<li>No intervención en asuntos internos de países</li>
										</ul>
										<p className='unidad-consolidation-text'>
											Trabaja además en: promoción de un sistema internacional justo, solución de conflictos globales,
											respuesta ante auge del armamentismo y aumento de gastos militares. A diferencia de otras organizaciones,
											no tiene carta, ley o tratado fundacional formal, ni secretaría permanente; la coordinación y gestión es
											responsabilidad del país que ejerce la presidencia. Se han celebrado 19 conferencias.
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

export default Semana6Unidad3Screen