import React, { useState } from 'react'
import Sidebar from '../../../../components/Sidebar'
import Header from '../../../../components/Header'
import '../../../../App.css'

function Semana3Unidad3Screen () {
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
										Unidad 3 · Semana 3
									</h1>
									<h2 className='unidad-subtitle'>
										Los bloques comunista y capitalista en el
										contexto de la Guerra Fría
									</h2>
								</div>

								<section>
									<h3 className='unidad-section-title'>
										Testimonio desde Vietnam (Guerra Fría)
									</h3>

									<div className='unidad-doc-box'>
										<p className='unidad-doc-kicker'>
											Doc. 1 — Testimonio de Ta Quang Thinh,
											enfermero de la guerra de Vietnam
										</p>
										<p className='unidad-doc-text'>
											&quot;Cuando llegué a casa todos, incluido yo
											mismo, estábamos hartos de la guerra. La
											aborrecíamos. No solo era cruel, sino
											absurda. Unos extranjeros caídos del cielo
											llegaron a nuestro país y nos forzaron a
											tomar las armas. ¿No cree que es absurdo?
											Solo queríamos prosperar y vivir como los
											demás.&quot;
										</p>
										<p className='unidad-doc-text'>
											&quot;Las pérdidas humanas fueron enormes, y no
											solo eso: nuestros ahorros, nuestras casas,
											nuestros cultivos y animales, todo se lo
											llevó la guerra. Guardo muchas cosas en mi
											memoria, pero no quiero recordarlas... No
											creo que a nadie le gustara.&quot;
										</p>
									</div>
								</section>

								<section>
									<h3 className='unidad-section-title'>
										El orden bipolar en la Guerra Fría
									</h3>
									<p className='unidad-paragraph'>
										Uno de los aspectos principales de la Guerra
										Fría fue la separación global en dos grandes
										bloques: el capitalista, encabezado por Estados
										Unidos, que incluyó a naciones de Europa
										occidental; y el comunista, liderado por la Unión
										Soviética, que comprendió países de Europa
										oriental.
									</p>

									<div className='unidad-consolidation-card'>
										<h4 className='unidad-consolidation-heading'>
											El bloque occidental o capitalista
										</h4>
										<p className='unidad-consolidation-text'>
											Se constituyó mediante estrategias y acuerdos
											políticos y económicos entre Estados Unidos y
											varios gobiernos de Europa occidental. Su
											objetivo principal era detener el avance del
											comunismo y promover la democracia.
										</p>
									</div>

									<div className='unidad-problem-grid'>
										<div className='unidad-problem-card'>
											<h4 className='unidad-problem-title'>
												Política
											</h4>
											<p className='unidad-problem-text'>
												Estados Unidos promovió la adopción de
												sistemas democráticos en su esfera de
												influencia. Entre sus principios destacaron
												elecciones libres, separación de poderes y
												reconocimiento de libertades y derechos.
											</p>
										</div>
										<div className='unidad-problem-card'>
											<h4 className='unidad-problem-title'>
												Economía
											</h4>
											<p className='unidad-problem-text'>
												Se mantuvo una economía capitalista basada en
												propiedad privada y mercado libre. Muchos
												gobiernos regularon sectores productivos y
												promovieron inversión y consumo para impulsar
												desarrollo económico.
											</p>
										</div>
										<div className='unidad-problem-card'>
											<h4 className='unidad-problem-title'>
												Alianzas militares
											</h4>
											<p className='unidad-problem-text'>
												En Europa surgió la OTAN (1949), que reunió a
												naciones occidentales bajo un bloque militar
												para protegerse ante posibles agresiones de la
												URSS.
											</p>
										</div>
									</div>

									<div className='unidad-doc-box'>
										<p className='unidad-doc-kicker'>
											Doc. 2 — El bloque oriental o comunista
										</p>
										<p className='unidad-doc-text'>
											Después de la Segunda Guerra Mundial, la Unión
											Soviética estableció su influencia en Europa del
											Este (excluyendo a Finlandia y Yugoslavia).
											Inicialmente hubo gobiernos de coalición con
											fuerte presencia comunista, pero entre 1946 y
											1948 los partidos comunistas, liderados por
											Stalin, consolidaron control absoluto.
										</p>
										<p className='unidad-doc-text'>
											El modelo soviético se caracterizó por la
											supremacía del partido comunista, la creación
											de sóviets (consejos de participación local) y
											una fuerza policial que combatía influencias
											capitalistas. Los gobiernos socialistas se
											transformaron en regímenes autoritarios,
											implementaron planificación central y
											estatización de industrias; el COMECON coordinó
											políticas económicas. En 1955 se estableció el
											Pacto de Varsovia como contrapeso a la OTAN.
										</p>
									</div>

									<div className='unidad-info-box'>
										<p className='unidad-info-title'>Glosario</p>
										<p className='unidad-info-text'>
											Universalismo: tendencia a regular de modo
											uniforme las relaciones de la sociedad.
										</p>
										<p className='unidad-info-text'>
											Mesianismo: confianza desmedida en un agente
											bienhechor que se espera.
										</p>
									</div>

									<div className='unidad-doc-box'>
										<p className='unidad-doc-kicker'>
											Los ideales comunes de los bloques enfrentados
										</p>
										<p className='unidad-doc-text'>
											Ambas ideologías, soviética y estadounidense,
											eran universalistas: sostenían que sus
											concepciones se aplicaban a todas las naciones.
											Ambas se entendían como progresistas y
											retrataban la historia como una marcha hacia el
											progreso, definido como expansión de su propia
											influencia. Con aspiraciones tan amplias, la
											convivencia permanente era imposible.
										</p>
										<p className='unidad-doc-footer'>
											Fuente: Leffler, M. P. y Westad, O. A.
											(2010). The Cambridge History of the Cold War.
										</p>
									</div>
								</section>

								<section>
									<h3 className='unidad-section-title'>
										Casos de conflictos en la Guerra Fría:
										guerra de Corea
									</h3>

									<p className='unidad-paragraph'>
										Aunque no hubo confrontaciones bélicas directas
										entre los bloques, sí se desencadenaron
										conflictos regionales en Asia, África y América
										que reflejaron intereses de EE. UU. y la Unión
										Soviética. Uno de estos fue la guerra de Corea.
									</p>

									<div className='unidad-doc-box'>
										<p className='unidad-doc-kicker'>
											Doc. 3 — Casos de conflictos: inicio de la
											guerra de Corea
										</p>
										<p className='unidad-doc-text'>
											El 15 de agosto de 1945, Corea se emancipó del
											dominio colonial japonés. Sin embargo, la
											intensificación de la Guerra Fría y la rivalidad
											entre capitalismo y comunismo impidieron un
											gobierno autónomo. Corea se dividió en dos zonas
											de ocupación, separadas por el paralelo 38°,
											dando lugar a Corea del Sur y Corea del Norte
											(1948).
										</p>
										<p className='unidad-doc-text'>
											El 25 de junio de 1950, Corea del Norte lanzó un
											ataque sorpresivo contra Corea del Sur. En
											respuesta, Estados Unidos, con respaldo de la
											ONU, desplegó tropas para defender al sur.
										</p>
										<p className='unidad-doc-text'>
											&quot;Alrededor de siete divisiones de élite del
											In-min-gun norcoreano... cruzaron la línea de
											demarcación... con la intención de conquistar el
											sur en tres semanas. [...] La guerra iba a durar
											tres años, no tres semanas.&quot;
										</p>
										<p className='unidad-doc-footer'>
											Fuente: Halberstam, D. (2009). La guerra
											olvidada. Historia de la guerra de Corea.
										</p>
									</div>

									<div className='unidad-info-box'>
										<p className='unidad-info-title'>Glosario</p>
										<p className='unidad-info-text'>
											In-min-gun: Ejército Popular de Corea (fuerzas
											militares de Corea del Norte).
										</p>
									</div>

									<div className='unidad-problem-grid'>
										<div className='unidad-problem-card'>
											<h4 className='unidad-problem-title'>
												Intervención del bloque oriental
											</h4>
											<p className='unidad-problem-text'>
												Corea del Norte contaba con respaldo de la URSS y
												China, aunque fueron cautelosos con la participación
												directa al inicio.
											</p>
										</div>
										<div className='unidad-problem-card'>
											<h4 className='unidad-problem-title'>
												Posición geográfica
											</h4>
											<p className='unidad-problem-text'>
												Para Estados Unidos, mantener influencia en la
												península coreana permitía contener la influencia
												soviética en Asia.
											</p>
										</div>
										<div className='unidad-problem-card'>
											<h4 className='unidad-problem-title'>
												Intervención del bloque occidental
											</h4>
											<p className='unidad-problem-text'>
												Estados Unidos y tropas de la ONU intervinieron,
												dando al conflicto carácter de Guerra Fría.
											</p>
										</div>
									</div>

									<h3 className='unidad-section-title'>
										Consecuencias de la guerra de Corea
									</h3>
									<p className='unidad-paragraph'>
										Tras negociaciones de paz, en 1953 se acordó la
										división de Corea en dos Estados separados por
										una zona desmilitarizada en la línea de
										armisticio.
									</p>
									<p className='unidad-paragraph unidad-paragraph-bottom'>
										Corea del Norte estableció un sistema unipartidista
										hermético; Corea del Sur, pese a dificultades,
										logró un sistema democrático con reconocimiento de
										derechos fundamentales y desarrollo económico
										impulsado por la industria.
									</p>

									<div className='unidad-doc-box'>
										<p className='unidad-doc-kicker'>
											Doc. 4 — Fronteras antes y después de la guerra
											de Corea
										</p>
										<p className='unidad-doc-text'>
											Frontera antes de la guerra: el paralelo 38°
											(junio de 1950). Frontera después de la guerra:
											la línea de armisticio (julio de 1953).
										</p>
										<p className='unidad-doc-footer'>
											Fuente: The Academy of Korean Studies (2019).
										</p>
									</div>

									<div className='unidad-info-box'>
										<p className='unidad-info-title'>
											Conexión histórica
										</p>
										<p className='unidad-info-text'>
											Atletas de Corea del Norte y Corea del Sur
											desfilaron bajo una misma bandera en los Juegos
											Olímpicos de Invierno de PyeongChang (2018), como
											acto simbólico de referencia a la unificación.
										</p>
									</div>

									<div className='unidad-info-box'>
										<p className='unidad-info-title'>Glosario</p>
										<p className='unidad-info-text'>
											Hermetismo: inaccesibilidad, impenetrabilidad.
										</p>
									</div>
								</section>

								<section>
									<h3 className='unidad-section-title'>
										Casos de conflictos: guerra de Vietnam
									</h3>

									<p className='unidad-paragraph'>
										Otro proceso importante fue la guerra de Vietnam.
										Tras el fin del dominio francés (1954), Vietnam
										quedó dividido en Vietnam del Norte (régimen
										comunista encabezado por Ho Chi Minh) y Vietnam
										del Sur (gobierno de Ngo Dinh Diem alineado a EE.
										UU.).
									</p>

									<p className='unidad-paragraph unidad-paragraph-bottom'>
										Surgió el Frente de Liberación Nacional (Vietcong),
										organización guerrillera compuesta principalmente
										por comunistas del sur, con apoyo del norte y de
										la Unión Soviética, buscando derrocar al gobierno
										de Diem y reunificar el país bajo un sistema
										comunista.
									</p>

									<div className='unidad-activities-grid'>
										<div className='unidad-activity-card'>
											<div className='unidad-activity-badge blue'>
												<span>1955</span>
											</div>
											<h4 className='unidad-activity-title'>
												Inicio del conflicto
											</h4>
											<p className='unidad-activity-text'>
												Ante la incapacidad del sur para contener al
												Vietcong, EE. UU. intervino enviando tropas.
											</p>
										</div>
										<div className='unidad-activity-card'>
											<div className='unidad-activity-badge orange'>
												<span>1960s</span>
											</div>
											<h4 className='unidad-activity-title'>
												Intensificación
											</h4>
											<p className='unidad-activity-text'>
												Se transformó en confrontación directa: EE. UU.
												aumentó su presencia militar en el sur y la URSS
												y China respaldaron al norte.
											</p>
										</div>
										<div className='unidad-activity-card'>
											<div className='unidad-activity-badge green'>
												<span>1973</span>
											</div>
											<h4 className='unidad-activity-title'>
												Acuerdos de París
											</h4>
											<p className='unidad-activity-text'>
												En enero de 1973 se firmó el cese al fuego.
												Richard Nixon redujo el envío de tropas.
											</p>
										</div>
									</div>

									<div className='unidad-doc-box'>
										<p className='unidad-doc-kicker'>
											Doc. 5 — El desenlace de la guerra de Vietnam
										</p>
										<p className='unidad-doc-text'>
											A pesar de su superioridad militar, EE. UU. no
											logró dominar a Vietnam del Norte ni vencer al
											Vietcong. El movimiento asociado a Ho Chi Minh
											ganó apoyo amplio, especialmente en zonas
											rurales, donde se percibía como alternativa para
											justicia y libertad.
										</p>
										<p className='unidad-doc-text'>
											La brutalidad del conflicto, transmitida
											globalmente, generó fuerte oposición
											internacional y movilizaciones sociales que
											obligaron a buscar una salida negociada. Vietnam
											se unificó bajo la República Socialista de
											Vietnam en 1976.
										</p>

										<p className='unidad-doc-kicker'>
											Postura de Martin Luther King Jr. frente a Vietnam
										</p>
										<p className='unidad-doc-text'>
											&quot;Hemos estado reclutando a los jóvenes negros
											damnificados por nuestra sociedad y enviándolos a
											12 875 kilómetros de distancia para que garanticen
											libertades en el sudeste asiático de las que no
											gozaban en el sudoeste de Georgia ni en East
											Harlem... nunca podría volver a alzar mi voz
											contra la violencia de los oprimidos... sin antes
											hablar claramente al mayor proveedor de violencia:
											mi propio Gobierno.&quot;
										</p>
										<p className='unidad-doc-footer'>
											Fuente: Martin Luther King Jr., &quot;Beyond
											Vietnam&quot; (4 de abril de 1967), en Westad, O. A.
											(2018). La Guerra Fría. Una historia mundial.
										</p>
									</div>

									<div className='unidad-info-box'>
										<p className='unidad-info-title'>
											Conexión histórica
										</p>
										<p className='unidad-info-text'>
											Mientras EE. UU. afrontaba la Guerra Fría en su
											política exterior, dentro de sus fronteras
											existieron conflictos relacionados con la lucha
											por los derechos civiles de las personas
											afroamericanas. Uno de los líderes activistas fue
											el reverendo Martin Luther King Jr.
										</p>
									</div>
								</section>

								<section>
									<h3 className='unidad-section-title'>
										Doc. 6 — Testimonio desde la guerra de Corea
									</h3>

									<div className='unidad-doc-box'>
										<p className='unidad-doc-kicker'>
											Doc. 6 — Testimonio de un joven de Corea del Sur
											que combatió con ambos ejércitos durante la guerra
											de Corea (Lee Young Ho)
										</p>
										<p className='unidad-doc-text'>
											&quot;Alguien gritó dirigiéndose hacia mí: ¡Camarada,
											acérquese! [...] Llevaba un brazalete rojo... me
											dijo que lo siguiera. No hubo explicaciones, pero
											yo ya estaba paralizado...&quot;
										</p>
										<p className='unidad-doc-text'>
											&quot;Me dieron una hoja de papel y me ordenaron que
											escribiera mis datos personales... trajeron a más
											jóvenes... nos ataron con una cuerda y nos llevaron
											a un destino desconocido...&quot;
										</p>
										<p className='unidad-doc-text'>
											&quot;Así me convertí en un soldado norcoreano y estaba
											en camino hacia un destino desconocido... Después
											de tres semanas de entrenamiento duro... usando el
											uniforme del Ejército Popular de Corea, disparé
											tres tiros de rifle por primera vez.&quot;
										</p>
										<p className='unidad-doc-footer'>
											Fuente: Peters, R. y Li, X. (2004). Voices from
											the Korean War. Personal Stories of American,
											Korean, and Chinese Soldiers.
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

export default Semana3Unidad3Screen