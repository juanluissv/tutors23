import React, { useState, useRef } from 'react'
import Sidebar from '../../../../components/Sidebar'
import Header from '../../../../components/Header'
import { Link } from 'react-router-dom'
import '../../../../App.css'

function Semana1Unidad3Screen() {
	const [isSidebarOpen, setIsSidebarOpen] = useState(window.innerWidth > 768)
	const [questionText, setQuestionText] = useState('')
	const contentRef = useRef(null)
	const questionTextareaRef = useRef(null)

	const toggleSidebar = () => {
		setIsSidebarOpen(!isSidebarOpen)
	}

	const adjustQuestionTextareaHeight = (el) => {
		if (!el) return
		el.style.height = 'auto'
		const minH = 52
		const maxH = 200
		el.style.height = Math.min(Math.max(el.scrollHeight, minH), maxH) + 'px'
	}

	const handleQuestionChange = (e) => {
		setQuestionText(e.target.value)
		adjustQuestionTextareaHeight(e.target)
	}

	const handleSendQuestion = () => {
		if (!questionText.trim()) {
			return
		}

		const params = new URLSearchParams()
		params.set('query', questionText.trim())

		window.open(`/?${params.toString()}`, '_blank')
		setQuestionText('')
		if (questionTextareaRef.current) {
			questionTextareaRef.current.style.height = '52px'
		}
	}

    return (
		<div className="chat-app">
			<div className="main-container">
				<Sidebar isOpen={isSidebarOpen} toggleSidebar={toggleSidebar} />
				<div className="main-content">
					<Header isSidebarOpen={isSidebarOpen} toggleSidebar={toggleSidebar} />
					<div className="content-area" ref={contentRef}>
						<div className="center-content2">
							<div style={{ maxWidth: '900px', margin: '0 auto', padding: '20px' }}>

								<div style={{ textAlign: 'center', marginBottom: '40px' }}>
									
									
								</div>

								<div style={{ marginBottom: '60px' }}>
									<h2 style={{ fontSize: '36px', fontWeight: 'bold', color: '#1a1a1a', marginBottom: '40px' }}>La Segunda Guerra Mundial</h2>

									<div style={{ marginBottom: '40px' }}>
										<h3 style={{ fontSize: '24px', fontWeight: '600', color: '#1976d2', marginBottom: '20px' }}>Doc. 1 — Ilustraciones en el diario de Victor Lundy</h3>

										<div style={{ backgroundColor: '#f5f5f5', padding: '24px', borderRadius: '12px', marginBottom: '24px' }}>
											<p style={{ fontSize: '15px', lineHeight: '1.7', color: '#555', marginBottom: '12px' }}>
												Esta página está tomada del diario de un soldado estadounidense de la Segunda Guerra Mundial, Victor Lundy, quien se destacó en el frente occidental, específicamente en Francia. Por medio de su diario y sus dibujos se puede analizar una perspectiva particular de la guerra.
											</p>
											<p style={{ fontSize: '14px', fontStyle: 'italic', color: '#666', marginBottom: 0 }}>
												"Rompiendo la Línea Siegfried, ataque aéreo sobre Alemania visto en una caminata matutina. Sept. 13, 1944"
											</p>
										</div>
									</div>

									<div style={{ marginBottom: '40px' }}>
										<h3 style={{ fontSize: '28px', fontWeight: 'bold', color: '#1a1a1a', marginBottom: '20px' }}>La Segunda Guerra Mundial: contexto histórico y causas</h3>
										
										<p style={{ fontSize: '16px', lineHeight: '1.8', color: '#333', marginBottom: '16px' }}>
											La Segunda Guerra Mundial fue un conflicto bélico que aconteció entre 1939 a 1945. Para abordar este proceso histórico es necesario comprender las consecuencias de la Primera Guerra Mundial, ya que al concluir este conflicto se firmó el Tratado de Versalles, por el cual los países vencedores establecieron e impusieron las pautas de la posguerra.
										</p>

										<div style={{ backgroundColor: '#fff3e0', border: '2px solid #f57c00', borderRadius: '12px', padding: '24px', marginBottom: '24px' }}>
											<p style={{ fontSize: '15px', fontWeight: '600', color: '#e65100', marginBottom: '16px' }}>Sanciones del Tratado de Versalles a Alemania:</p>
											<div style={{ display: 'grid', gap: '16px' }}>
												<div>
													<p style={{ fontSize: '15px', fontWeight: '600', color: '#1a1a1a', marginBottom: '8px' }}>Aspecto geográfico</p>
													<p style={{ fontSize: '15px', lineHeight: '1.7', color: '#555', marginBottom: 0 }}>Se delimitaron las fronteras y territorios de Alemania. Asimismo, este país perdió sus colonias en África.</p>
												</div>
												<div>
													<p style={{ fontSize: '15px', fontWeight: '600', color: '#1a1a1a', marginBottom: '8px' }}>Aspecto militar</p>
													<p style={{ fontSize: '15px', lineHeight: '1.7', color: '#555', marginBottom: 0 }}>Se le prohibió a Alemania tener fuerza aérea militar; además, se limitó su ejército a 100,000 hombres.</p>
												</div>
												<div>
													<p style={{ fontSize: '15px', fontWeight: '600', color: '#1a1a1a', marginBottom: '8px' }}>Aspecto económico</p>
													<p style={{ fontSize: '15px', lineHeight: '1.7', color: '#555', marginBottom: 0 }}>Se considera la cláusula más rígida, ya que implicó la culpabilidad total de la guerra. Por ello, Alemania debía pagar por las reparaciones causadas por el conflicto a los países vencedores.</p>
												</div>
											</div>
										</div>

										<p style={{ fontSize: '16px', lineHeight: '1.8', color: '#333', marginBottom: '16px' }}>
											Alemania enfrentó una serie de retos para gobernar el país de la posguerra. Ante esta situación de inestabilidad, surge Adolf Hitler, un excombatiente de la Primera Guerra Mundial, quien, respaldado por el Partido Nacional Socialista de los Trabajadores Alemanes, fue ganando popularidad.
										</p>

										<div style={{ backgroundColor: '#ffebee', border: '2px solid #c62828', borderRadius: '12px', padding: '20px', marginBottom: '24px' }}>
											<p style={{ fontSize: '15px', fontWeight: '600', color: '#c62828', marginBottom: '8px' }}>Conexión histórica</p>
											<p style={{ fontSize: '15px', lineHeight: '1.7', color: '#333', marginBottom: 0 }}>
												Desde antes de la guerra, en Alemania se fue marcando cada vez más el discurso antisemita. Durante la guerra y el avance alemán, también se desplegó por Europa del Este la construcción de campos de concentración y de exterminio de la población judía europea. Al finalizar la guerra se estima que alrededor de seis millones de judíos fueron asesinados por el régimen nazi.
											</p>
										</div>
									</div>

									<div style={{ marginBottom: '40px' }}>
										<h3 style={{ fontSize: '24px', fontWeight: '600', color: '#1a1a1a', marginBottom: '20px' }}>Causas de la Segunda Guerra Mundial</h3>
										
										<div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px', marginBottom: '40px' }}>
											<div style={{ backgroundColor: '#fff', border: '2px solid #e0e0e0', borderRadius: '12px', padding: '24px' }}>
												<h4 style={{ fontSize: '18px', fontWeight: '600', color: '#1a1a1a', marginBottom: '12px' }}>El Tratado de Versalles</h4>
												<p style={{ fontSize: '15px', lineHeight: '1.6', color: '#555', marginBottom: 0 }}>
													Le otorgó la culpabilidad total de la guerra a Alemania. Esto condujo a que se generaran conflictos internos en el país.
												</p>
											</div>

											<div style={{ backgroundColor: '#fff', border: '2px solid #e0e0e0', borderRadius: '12px', padding: '24px' }}>
												<h4 style={{ fontSize: '18px', fontWeight: '600', color: '#1a1a1a', marginBottom: '12px' }}>Expansión territorial alemana</h4>
												<p style={{ fontSize: '15px', lineHeight: '1.6', color: '#555', marginBottom: 0 }}>
													Alemania ocupó militarmente la zona de Renania e inició una campaña de invasiones a otros países: Austria, Checoslovaquia y Polonia.
												</p>
											</div>

											<div style={{ backgroundColor: '#fff', border: '2px solid #e0e0e0', borderRadius: '12px', padding: '24px' }}>
												<h4 style={{ fontSize: '18px', fontWeight: '600', color: '#1a1a1a', marginBottom: '12px' }}>Política de apaciguamiento</h4>
												<p style={{ fontSize: '15px', lineHeight: '1.6', color: '#555', marginBottom: 0 }}>
													El Reino Unido y Francia optaron por ceder ante las anexiones e invasiones de Alemania, para evitar la confrontación directa.
												</p>
											</div>

											<div style={{ backgroundColor: '#fff', border: '2px solid #e0e0e0', borderRadius: '12px', padding: '24px' }}>
												<h4 style={{ fontSize: '18px', fontWeight: '600', color: '#1a1a1a', marginBottom: '12px' }}>Crisis económica de 1929</h4>
												<p style={{ fontSize: '15px', lineHeight: '1.6', color: '#555', marginBottom: 0 }}>
													Afectó considerablemente la economía europea, que se volvió dependiente después de la Primera Guerra Mundial.
												</p>
											</div>

											<div style={{ backgroundColor: '#fff', border: '2px solid #e0e0e0', borderRadius: '12px', padding: '24px' }}>
												<h4 style={{ fontSize: '18px', fontWeight: '600', color: '#1a1a1a', marginBottom: '12px' }}>Ascenso de los fascismos</h4>
												<p style={{ fontSize: '15px', lineHeight: '1.6', color: '#555', marginBottom: 0 }}>
													En Europa, en especial en Italia y Alemania. Estos gobiernos se caracterizaron por medidas autoritarias y xenófobas.
												</p>
											</div>
										</div>
									</div>

									<div style={{ marginBottom: '40px' }}>
										<h3 style={{ fontSize: '28px', fontWeight: 'bold', color: '#1a1a1a', marginBottom: '20px' }}>El inicio de la Segunda Guerra Mundial</h3>
										
										<p style={{ fontSize: '16px', lineHeight: '1.8', color: '#333', marginBottom: '24px' }}>
											El 1 de septiembre de 1939 Hitler dio la orden de invadir Polonia. A los tres días, el Reino Unido y Francia le declararon la guerra a Alemania. Estas acciones marcaron el inicio de la Segunda Guerra Mundial.
										</p>

										<div style={{ backgroundColor: '#f5f5f5', padding: '32px', borderRadius: '12px', marginBottom: '24px' }}>
											<h4 style={{ fontSize: '20px', fontWeight: '600', color: '#1a1a1a', marginBottom: '24px' }}>Países enfrentados</h4>
											
											<div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '24px', marginBottom: '32px' }}>
												<div>
													<h5 style={{ fontSize: '18px', fontWeight: '600', color: '#c62828', marginBottom: '12px' }}>Países del Eje</h5>
													<ul style={{ paddingLeft: '20px', marginBottom: 0 }}>
														<li style={{ fontSize: '15px', color: '#555', marginBottom: '4px' }}>Alemania</li>
														<li style={{ fontSize: '15px', color: '#555', marginBottom: '4px' }}>Italia</li>
														<li style={{ fontSize: '15px', color: '#555', marginBottom: 0 }}>Japón</li>
													</ul>
												</div>

        <div>
													<h5 style={{ fontSize: '18px', fontWeight: '600', color: '#1976d2', marginBottom: '12px' }}>Países Aliados</h5>
													<ul style={{ paddingLeft: '20px', marginBottom: 0 }}>
														<li style={{ fontSize: '15px', color: '#555', marginBottom: '4px' }}>Reino Unido</li>
														<li style={{ fontSize: '15px', color: '#555', marginBottom: '4px' }}>Francia</li>
														<li style={{ fontSize: '15px', color: '#555', marginBottom: '4px' }}>Unión Soviética</li>
														<li style={{ fontSize: '15px', color: '#555', marginBottom: '4px' }}>Estados Unidos</li>
														<li style={{ fontSize: '15px', color: '#555', marginBottom: 0 }}>Países de la Commonwealth</li>
													</ul>
												</div>
											</div>

											<h4 style={{ fontSize: '20px', fontWeight: '600', color: '#1a1a1a', marginBottom: '20px' }}>Principales acontecimientos</h4>
											
											<div style={{ display: 'grid', gap: '16px' }}>
												<div style={{ backgroundColor: '#fff', padding: '20px', borderRadius: '8px', border: '1px solid #e0e0e0' }}>
													<p style={{ fontSize: '14px', fontWeight: '600', color: '#1976d2', marginBottom: '8px' }}>Primera etapa (1939-1941)</p>
													<p style={{ fontSize: '15px', lineHeight: '1.7', color: '#555', marginBottom: 0 }}>
														Invasión alemana y soviética a Polonia. Expansión de la guerra al frente occidental: Francia, Reino Unido y otros países europeos. La guerra se extendió a las colonias europeas en África.
													</p>
												</div>

												<div style={{ backgroundColor: '#fff', padding: '20px', borderRadius: '8px', border: '1px solid #e0e0e0' }}>
													<p style={{ fontSize: '14px', fontWeight: '600', color: '#f57c00', marginBottom: '8px' }}>Segunda etapa (1942-1943)</p>
													<p style={{ fontSize: '15px', lineHeight: '1.7', color: '#555', marginBottom: 0 }}>
														Alemania invade la Unión Soviética. Japón ataca Pearl Harbor y Estados Unidos le declara la guerra. Estos acontecimientos determinan la dimensión global del conflicto. Los Aliados llegan a territorio italiano.
													</p>
												</div>

												<div style={{ backgroundColor: '#fff', padding: '20px', borderRadius: '8px', border: '1px solid #e0e0e0' }}>
													<p style={{ fontSize: '14px', fontWeight: '600', color: '#2e7d32', marginBottom: '8px' }}>Tercera etapa (1944-1945)</p>
													<p style={{ fontSize: '15px', lineHeight: '1.7', color: '#555', marginBottom: 0 }}>
														Los Aliados entran en Normandía ("el Día D") y avanzan hasta París. El ejército soviético llega a Berlín. Alemania se rinde en mayo de 1945. Estados Unidos lanza dos bombas atómicas en Japón y se firma la rendición oficial en septiembre de 1945.
													</p>
												</div>
											</div>
										</div>
									</div>

									<div style={{ marginBottom: '40px' }}>
										<h3 style={{ fontSize: '28px', fontWeight: 'bold', color: '#1a1a1a', marginBottom: '20px' }}>Diferentes perspectivas en la Segunda Guerra Mundial</h3>
										
										<p style={{ fontSize: '16px', lineHeight: '1.8', color: '#333', marginBottom: '24px' }}>
											Los líderes de los países involucrados plasmaron sus perspectivas a través de discursos, prensa y otros medios. A continuación, algunos fragmentos de discursos históricos:
										</p>

										<div style={{ display: 'grid', gap: '20px', marginBottom: '40px' }}>
											<div style={{ backgroundColor: '#e3f2fd', border: '2px solid #1976d2', borderRadius: '12px', padding: '24px' }}>
												<h4 style={{ fontSize: '18px', fontWeight: '600', color: '#0d47a1', marginBottom: '12px' }}>Winston Churchill (Reino Unido) - Junio 1940</h4>
												<p style={{ fontSize: '15px', fontStyle: 'italic', lineHeight: '1.7', color: '#333', marginBottom: 0 }}>
													"La Batalla de Gran Bretaña está a punto de comenzar. [...] Si fallamos, entonces todo el mundo, incluidos los Estados Unidos, se hundirá en el abismo de una nueva era oscura [...] si el Imperio británico y su Mancomunidad duran mil años, los hombres todavía dirán: 'esta fue su hora más gloriosa'."
												</p>
											</div>

											<div style={{ backgroundColor: '#ffebee', border: '2px solid #c62828', borderRadius: '12px', padding: '24px' }}>
												<h4 style={{ fontSize: '18px', fontWeight: '600', color: '#c62828', marginBottom: '12px' }}>Iósif Stalin (Unión Soviética) - Noviembre 1941</h4>
												<p style={{ fontSize: '15px', fontStyle: 'italic', lineHeight: '1.7', color: '#333', marginBottom: 0 }}>
													"No solo es una guerra entre dos ejércitos, es también una gran guerra del pueblo soviético contra las fuerzas del fascismo alemán. [...] En esta guerra tendremos aliados leales en los pueblos de Europa y América. Nuestra guerra por la libertad de nuestro país se mezclará con la de los pueblos de Europa y América por su independencia."
												</p>
											</div>

											<div style={{ backgroundColor: '#e8f5e9', border: '2px solid #2e7d32', borderRadius: '12px', padding: '24px' }}>
												<h4 style={{ fontSize: '18px', fontWeight: '600', color: '#1b5e20', marginBottom: '12px' }}>Franklin D. Roosevelt (Estados Unidos) - Diciembre 1941</h4>
												<p style={{ fontSize: '15px', fontStyle: 'italic', lineHeight: '1.7', color: '#333', marginBottom: 0 }}>
													"Ayer, el 7 de diciembre de 1941, una fecha que vivirá en la infamia, los Estados Unidos de América fueron repentina y deliberadamente atacados por las fuerzas navales y aéreas del imperio de Japón. [...] Con confianza en nuestras fuerzas armadas, con la determinación ilimitada de nuestra gente, ganaremos el inevitable triunfo con la ayuda de Dios."
												</p>
											</div>

											<div style={{ backgroundColor: '#fff3e0', border: '2px solid #f57c00', borderRadius: '12px', padding: '24px' }}>
												<h4 style={{ fontSize: '18px', fontWeight: '600', color: '#e65100', marginBottom: '12px' }}>Joseph Goebbels (Alemania Nazi) - Febrero 1943</h4>
												<p style={{ fontSize: '15px', fontStyle: 'italic', lineHeight: '1.7', color: '#333', marginBottom: 0 }}>
													"La tarea crítica del momento es ofrecer al Führer, a través de las medidas que tomamos en casa, reservas operativas que necesitará. [...] El pueblo alemán solo debe pensar en la guerra. Esto no prolongará la guerra, sino que la acortará: la guerra más total y más radical es también la más corta."
												</p>
											</div>
										</div>

										<div style={{ backgroundColor: '#f5f5f5', padding: '24px', borderRadius: '12px', marginBottom: '24px' }}>
											<p style={{ fontSize: '15px', fontWeight: '600', color: '#333', marginBottom: '12px' }}>Doc. 2 - Testimonio de un soldado estadounidense</p>
											<p style={{ fontSize: '15px', lineHeight: '1.7', color: '#555', marginBottom: '12px' }}>
												Jesse Breazley fue un soldado estadounidense que luchó en el frente occidental (Francia). En su testimonio reflexiona sobre la crueldad de la guerra:
											</p>
											<p style={{ fontSize: '15px', fontStyle: 'italic', lineHeight: '1.7', color: '#666', marginBottom: 0 }}>
												"Recuerdo a este soldado alemán herido mirándome, y yo lo miré a él. Nos miramos a los ojos fijamente. [...] Un tipo nuevo de mi grupo dijo que iba a dispararle. Y yo dije no, no vas a dispararle. Si le disparas, yo te dispararé. Él está controlado. [...] Pero yo no quería hacerle eso a un hombre indefenso. Podía verme en él y dije que no."
											</p>
										</div>
									</div>

									<div style={{ marginBottom: '40px' }}>
										<h3 style={{ fontSize: '28px', fontWeight: 'bold', color: '#1a1a1a', marginBottom: '20px' }}>El fin de la Segunda Guerra Mundial</h3>
										
										<p style={{ fontSize: '16px', lineHeight: '1.8', color: '#333', marginBottom: '16px' }}>
											Los acontecimientos decisivos que marcaron el fin de la guerra fueron el avance del ejército rojo a Berlín, el Día D o batalla de Normandía del 6 de junio de 1944 y el lanzamiento de la bomba atómica en las ciudades japonesas de Hiroshima y Nagasaki el 6 y el 9 de agosto de 1945.
										</p>

										<p style={{ fontSize: '16px', lineHeight: '1.8', color: '#333', marginBottom: '16px' }}>
											Durante abril de 1945, ante el avance del ejército soviético hacia Berlín, Hitler se ocultó en bunkers subterráneos y finalmente se suicidó. Alemania firmó su capitulación el 8 de mayo de 1945.
										</p>

										<p style={{ fontSize: '16px', lineHeight: '1.8', color: '#333', marginBottom: '24px' }}>
											Después de la devastación de las dos bombas nucleares, Japón se rindió oficialmente el 2 de septiembre de 1945.
										</p>

										<div style={{ backgroundColor: '#e3f2fd', border: '2px solid #1976d2', borderRadius: '12px', padding: '20px', marginBottom: '24px' }}>
											<p style={{ fontSize: '15px', fontWeight: '600', color: '#1976d2', marginBottom: '8px' }}>Glosario</p>
											<p style={{ fontSize: '15px', color: '#333', marginBottom: 0 }}>
												<strong>Capitulación:</strong> Acuerdos de rendición de un ejército o fuerza militar.
											</p>
										</div>
									</div>

									<div style={{ marginBottom: '40px' }}>
										<h3 style={{ fontSize: '28px', fontWeight: 'bold', color: '#1a1a1a', marginBottom: '20px' }}>Consecuencias de la Segunda Guerra Mundial</h3>
										
										<p style={{ fontSize: '16px', lineHeight: '1.8', color: '#333', marginBottom: '24px' }}>
											Es difícil precisar el impacto de la Segunda Guerra Mundial, ya que ha sido el conflicto de mayor magnitud tanto en pérdidas humanas como en daños materiales.
										</p>

										<div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '20px', marginBottom: '40px' }}>
											<div style={{ backgroundColor: '#e3f2fd', border: '2px solid #1976d2', borderRadius: '12px', padding: '24px' }}>
												<h4 style={{ fontSize: '18px', fontWeight: '600', color: '#0d47a1', marginBottom: '16px' }}>Consecuencias políticas</h4>
												<ul style={{ paddingLeft: '20px', marginBottom: 0 }}>
													<li style={{ fontSize: '15px', color: '#555', marginBottom: '8px' }}>Reconfiguración del mundo y en especial de Europa</li>
													<li style={{ fontSize: '15px', color: '#555', marginBottom: '8px' }}>Conformación de las Naciones Unidas</li>
													<li style={{ fontSize: '15px', color: '#555', marginBottom: 0 }}>Los Juicios de Núremberg y los Juicios de Tokio</li>
												</ul>
											</div>

											<div style={{ backgroundColor: '#fff3e0', border: '2px solid #f57c00', borderRadius: '12px', padding: '24px' }}>
												<h4 style={{ fontSize: '18px', fontWeight: '600', color: '#e65100', marginBottom: '16px' }}>Consecuencias económicas</h4>
												<ul style={{ paddingLeft: '20px', marginBottom: 0 }}>
													<li style={{ fontSize: '15px', color: '#555', marginBottom: '8px' }}>Destrucción de ciudades, centros industriales e infraestructura</li>
													<li style={{ fontSize: '15px', color: '#555', marginBottom: 0 }}>Dependencia del apoyo estadounidense para la reconstrucción de Europa (Plan Marshall)</li>
												</ul>
											</div>

											<div style={{ backgroundColor: '#ffebee', border: '2px solid #c62828', borderRadius: '12px', padding: '24px' }}>
												<h4 style={{ fontSize: '18px', fontWeight: '600', color: '#c62828', marginBottom: '16px' }}>Consecuencias sociales</h4>
												<ul style={{ paddingLeft: '20px', marginBottom: 0 }}>
													<li style={{ fontSize: '15px', color: '#555', marginBottom: '8px' }}>60 millones de muertes</li>
													<li style={{ fontSize: '15px', color: '#555', marginBottom: '8px' }}>Incorporación de las mujeres al campo laboral</li>
													<li style={{ fontSize: '15px', color: '#555', marginBottom: 0 }}>Desplazados y refugiados de guerra</li>
												</ul>
											</div>
										</div>

										<div style={{ backgroundColor: '#f5f5f5', padding: '24px', borderRadius: '12px', marginBottom: '24px' }}>
											<p style={{ fontSize: '15px', fontWeight: '600', color: '#333', marginBottom: '12px' }}>Doc. 3 - La división de Alemania</p>
											<p style={{ fontSize: '15px', lineHeight: '1.7', color: '#555', marginBottom: 0 }}>
												Las cuatro potencias ocupantes se repartieron Alemania por zonas. La URSS procedió a saquear su zona de ocupación, que más tarde sería la RDA (República Democrática Alemana). Estados Unidos se puso de acuerdo con Gran Bretaña para fusionar las regiones que ocupaban. Esta forma disímil de actuar distanció aún más a las dos principales potencias vencedoras, dando paso a la Guerra Fría.
											</p>
										</div>
									</div>

									
								</div>
							</div>
						</div>
					</div>
				</div>
			</div>
        </div>
    )
}

export default Semana1Unidad3Screen
