import React from 'react'
import './Unidad1Semana1BosquesScreen.css'

const LeafIcon = ({ size = 22 }) => (
	<svg
		width={size}
		height={size}
		viewBox='0 0 24 24'
		fill='none'
		stroke='currentColor'
		strokeWidth='2'
		strokeLinecap='round'
		strokeLinejoin='round'
	>
		<path d='M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 4.18 2 8 0 5.5-4.78 10-10 10Z' />
		<path d='M2 21c0-3 1.85-5.36 5.08-6' />
	</svg>
)

const PrinterIcon = () => (
	<svg
		width='16'
		height='16'
		viewBox='0 0 24 24'
		fill='none'
		stroke='currentColor'
		strokeWidth='2'
		strokeLinecap='round'
		strokeLinejoin='round'
	>
		<polyline points='6 9 6 2 18 2 18 9' />
		<path d='M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2' />
		<rect x='6' y='14' width='12' height='8' />
	</svg>
)

const PhaseBanner = ({ label, variant }) => (
	<div className={`bosques-phase${variant ? ` bosques-phase--${variant}` : ''}`}>
		<span className='bosques-phase__icon'>
			<LeafIcon size={16} />
		</span>
		{label}
	</div>
)

function Unidad1Semana1BosquesScreen () {
	const handlePrint = () => {
		window.print()
	}

	return (
		<div className='bosques-doc'>
			<div className='bosques-toolbar'>
				<div className='bosques-toolbar__brand'>
					<span className='bosques-toolbar__leaf'>
						<LeafIcon />
					</span>
					<span className='bosques-toolbar__brand-text'>
						<strong>Tierra, recursos hídricos y seguridad alimentaria</strong>
						<span>Unidad 1 · Semana 1 — Los bosques tropicales</span>
					</span>
				</div>
				<button
					type='button'
					className='bosques-toolbar__print'
					onClick={handlePrint}
				>
					<PrinterIcon />
					Imprimir / Guardar PDF
				</button>
			</div>

			<div className='bosques-pages'>

				{/* ============ PAGE 1 · COVER ============ */}
				<section className='bosques-page bosques-cover'>
					<span className='bosques-page__num'>1 / 7</span>
					<span className='bosques-cover__unit'>
						<LeafIcon size={14} /> Unidad 1
					</span>
					<h1 className='bosques-cover__title'>
						Tierra, recursos hídricos y seguridad alimentaria
					</h1>
					<p className='bosques-cover__subtitle'>
						Una mirada al rol de los Estados y otros actores en la
						preservación y sostenibilidad de los recursos naturales.
					</p>
					<div className='bosques-cover__objectives'>
						<p className='bosques-cover__objectives-label'>
							En esta unidad aprenderemos a:
						</p>
						<p className='bosques-cover__objectives-text'>
							Valorar el rol de los Estados y otros actores en la
							preservación y sostenibilidad de los recursos
							naturales rumbo a una gobernanza efectiva.
						</p>
					</div>
					<div className='bosques-cover__deco' aria-hidden>
						<LeafIcon size={260} />
					</div>
				</section>

				{/* ============ PAGE 2 · EXPLORACIÓN ============ */}
				<section className='bosques-page'>
					<span className='bosques-page__num'>2 / 7 · pág. 10</span>
					<div className='bosques-page__folio'>
						<span className='dot' /> Unidad 1 · Semana 1
					</div>
					<PhaseBanner label='Exploración' variant='amber' />
					<h1 className='bosques-h1'>
						Los bosques tropicales en el mundo
					</h1>
					<p className='bosques-lede'>
						Activa tus conocimientos previos y reflexiona sobre la
						importancia de los bosques tropicales antes de profundizar.
					</p>

					<div className='bosques-activity'>
						<div className='bosques-activity__head'>
							<span className='bosques-activity__badge'>1</span>
							<div>
								<span className='bosques-activity__tag'>
									Actividad individual
								</span>
								<h3 className='bosques-activity__title'>Responde</h3>
							</div>
						</div>
						<div className='bosques-activity__body'>
							<ul className='bosques-list'>
								<li>
									<strong>a.</strong> ¿Cuál consideras que es la
									importancia de los bosques tropicales para la
									vida humana?
								</li>
								<li>
									<strong>b.</strong> ¿Qué acciones se implementan
									en tu localidad para proteger las zonas
									naturales o boscosas?
								</li>
							</ul>
						</div>
					</div>

					<div className='bosques-activity bosques-activity--blue'>
						<div className='bosques-activity__head'>
							<span className='bosques-activity__badge'>2</span>
							<div>
								<span className='bosques-activity__tag'>
									Actividad en pares
								</span>
								<h3 className='bosques-activity__title'>
									Investiguen la situación de los bosques
								</h3>
							</div>
						</div>
						<div className='bosques-activity__body'>
							<p>
								Busquen noticias recientes acerca de la situación
								de los bosques en El Salvador e identifiquen cuáles
								son las principales problemáticas que les afectan.
							</p>
							<ul className='bosques-list'>
								<li>
									<strong>a.</strong> Elaboren un esquema con
									ellas. Pueden guiarse con el siguiente ejemplo.
								</li>
							</ul>
							<div className='bosques-schema'>
								<div className='bosques-schema__node'>
									Problemas que afectan a los bosques tropicales
								</div>
								<div className='bosques-schema__connector' />
								<div className='bosques-schema__branches'>
									<span className='bosques-schema__branch'>
										Deforestación
									</span>
									<span className='bosques-schema__branch'>
										Incendios
									</span>
									<span className='bosques-schema__branch'>
										Contaminación
									</span>
									<span className='bosques-schema__branch'>
										Pérdida de biodiversidad
									</span>
								</div>
							</div>
						</div>
					</div>

					<div className='bosques-activity bosques-activity--amber'>
						<div className='bosques-activity__head'>
							<span className='bosques-activity__badge'>3</span>
							<div>
								<span className='bosques-activity__tag'>
									Actividad con docente
								</span>
								<h3 className='bosques-activity__title'>
									Estrategias para proteger los bosques
								</h3>
							</div>
						</div>
						<div className='bosques-activity__body'>
							<p>
								Piensen en acciones para proteger los bosques
								tropicales.
							</p>
							<ul className='bosques-list'>
								<li>
									<strong>a.</strong> Realicen una lluvia de
									ideas sobre distintas estrategias para
									sensibilizar a los miembros de su centro
									educativo y su comunidad acerca de la
									importancia de proteger los bosques tropicales.
								</li>
								<li>
									<strong>b.</strong> Escríbanlas en una tabla
									similar a la siguiente.
								</li>
								<li>
									<strong>c.</strong> Seleccionen tres
									estrategias y compartan en el pleno.
								</li>
							</ul>
						</div>
					</div>
				</section>

				{/* ============ PAGE 3 · PROFUNDIZACIÓN ============ */}
				<section className='bosques-page'>
					<span className='bosques-page__num'>3 / 7 · pág. 11</span>
					<div className='bosques-page__folio'>
						<span className='dot' /> Unidad 1 · Semana 1
					</div>
					<PhaseBanner label='Profundización' />

					<div className='bosques-columns'>
						<div>
							<h2 className='bosques-h2'>
								Los bosques: importancia y clasificación
							</h2>
							<p className='bosques-p'>
								Los bosques son ecosistemas complejos que
								desempeñan un papel vital para la vida humana.
								Cubren alrededor del <strong>31 %</strong> de la
								superficie terrestre del mundo y cumplen diversas
								funciones, entre las que se incluyen producción de
								oxígeno, purificación del aire, provisión de agua y
								de otros recursos naturales, por lo que son muy
								importantes para el mantenimiento de la salud y el
								equilibrio del planeta.
							</p>
							<p className='bosques-p'>
								La clasificación de los bosques se basa en
								distintos criterios, como la zona climática en la
								que se encuentran, el tipo de vegetación que los
								conforman o su función ecológica. En relación con la
								zona climática, los bosques se dividen en:
								tropicales, subtropicales, templados y boreales. De
								estos, las zonas tropicales destacan por tener la
								mayor proporción de bosques a nivel mundial,
								alcanzando el <strong>45 %</strong>, mientras que el
								resto se distribuye entre las otras zonas climáticas
								(Doc. 1).
							</p>

							<h2 className='bosques-h2'>
								Características de los bosques tropicales
							</h2>
							<p className='bosques-p'>
								Los bosques tropicales se localizan en la zona
								intertropical y constituyen uno de los ecosistemas
								más transcendentales a nivel mundial. Se
								caracterizan por su clima cálido y húmedo y
								experimentan precipitaciones abundantes a lo largo
								de todo el año, creando condiciones propicias para
								la vida vegetal y animal.
							</p>
							<p className='bosques-p'>
								Además, destacan por albergar una asombrosa
								diversidad biológica, con aproximadamente el{' '}
								<strong>60 %</strong> de las especies conocidas de
								fauna y flora a nivel mundial. Sin embargo, en las
								últimas décadas, la deforestación ha amenazado
								seriamente la salud y la estabilidad de estos,
								afectando a regiones enteras.
							</p>
						</div>

						<aside className='bosques-aside'>
							<div className='bosques-callout bosques-callout--web'>
								<p className='bosques-callout__kicker'>
									<LeafIcon size={13} /> En la web
								</p>
								<p className='bosques-callout__title'>
									Tipos de bosques tropicales
								</p>
								<p className='bosques-callout__text'>
									Explora recursos en línea para conocer las
									diferencias entre selvas húmedas, bosques
									secos y bosques nubosos.
								</p>
							</div>
							<div className='bosques-callout bosques-callout--geo'>
								<p className='bosques-callout__kicker'>
									<LeafIcon size={13} /> Conexión geográfica
								</p>
								<p className='bosques-callout__text'>
									Cerca del <strong>54 %</strong> de los bosques
									del mundo se concentran en cinco naciones:
									Rusia, Brasil, Canadá, Estados Unidos y China.
								</p>
							</div>
						</aside>
					</div>

					<div className='bosques-doc-box'>
						<div className='bosques-doc-box__head'>
							<span className='bosques-doc-box__chip'>Doc. 1</span>
							<p className='bosques-doc-box__title'>
								Distribución mundial de los bosques por zona
								climática
							</p>
						</div>
						<div className='bosques-doc-box__body'>
							<div className='bosques-chart'>
								<div className='bosques-chart__donut'>
									<div className='bosques-chart__hole'>
										<strong>45%</strong>
										<span>Tropical</span>
									</div>
								</div>
								<div className='bosques-chart__legend'>
									<div className='bosques-chart__row'>
										<span
											className='bosques-chart__swatch'
											style={{ background: 'var(--green-500)' }}
										/>
										<span className='bosques-chart__name'>
											Tropical
										</span>
										<span className='bosques-chart__pct'>
											45 %
										</span>
									</div>
									<div className='bosques-chart__row'>
										<span
											className='bosques-chart__swatch'
											style={{ background: 'var(--green-900)' }}
										/>
										<span className='bosques-chart__name'>
											Boreal
										</span>
										<span className='bosques-chart__pct'>
											27 %
										</span>
									</div>
									<div className='bosques-chart__row'>
										<span
											className='bosques-chart__swatch'
											style={{ background: 'var(--amber-500)' }}
										/>
										<span className='bosques-chart__name'>
											Templada
										</span>
										<span className='bosques-chart__pct'>
											16 %
										</span>
									</div>
									<div className='bosques-chart__row'>
										<span
											className='bosques-chart__swatch'
											style={{ background: 'var(--green-300)' }}
										/>
										<span className='bosques-chart__name'>
											Subtropical
										</span>
										<span className='bosques-chart__pct'>
											11 %
										</span>
									</div>
								</div>
							</div>
							<p className='bosques-doc-box__source'>
								Fuente: FAO (2020). Evaluación de los recursos
								forestales mundiales.
							</p>
						</div>
					</div>
				</section>

				{/* ============ PAGE 4 · PROBLEMÁTICAS ============ */}
				<section className='bosques-page'>
					<span className='bosques-page__num'>4 / 7 · pág. 12</span>
					<div className='bosques-page__folio'>
						<span className='dot' /> Unidad 1 · Semana 1
					</div>

					<div className='bosques-activity bosques-activity--blue'>
						<div className='bosques-activity__head'>
							<span className='bosques-activity__badge'>4</span>
							<div>
								<span className='bosques-activity__tag'>
									Actividad en pares
								</span>
								<h3 className='bosques-activity__title'>
									Sensibilidad humana en el ambiente
								</h3>
							</div>
						</div>
						<div className='bosques-activity__body'>
							<ul className='bosques-list'>
								<li>
									<strong>a.</strong> Identifiquen áreas boscosas
									o zonas que se caractericen por densa
									vegetación y diversidad biológica en territorio
									salvadoreño y busquen información sobre las
									problemáticas ambientales que afectan a sus
									habitantes.
								</li>
								<li>
									<strong>b.</strong> A partir de los datos
									recolectados, elaboren distintas propuestas que
									permitan dar respuestas viables y sostenibles
									para mejorar la calidad de vida de las
									poblaciones afectadas y su entorno.
								</li>
							</ul>
						</div>
					</div>

					<h2 className='bosques-h2'>
						Principales problemáticas de los bosques tropicales
					</h2>
					<p className='bosques-p'>
						Los bosques tropicales, a pesar de su importancia
						ecológica, se enfrentan a diversas problemáticas que ponen
						en riesgo su existencia. La deforestación es la principal
						problemática que les afecta (Doc. 2), producida
						mayoritariamente por actividades humanas como la
						agricultura intensiva, el pastoreo excesivo, la minería, la
						construcción de represas y la expansión urbana.
					</p>

					<div className='bosques-grid'>
						<div className='bosques-term'>
							<h4 className='bosques-term__title'>
								La deforestación
							</h4>
							<p className='bosques-term__text'>
								Es el proceso mediante el cual se elimina o reduce, a
								gran escala, la cobertura forestal de un área
								determinada. Puede ser causada por actividades
								humanas o naturales.
							</p>
						</div>
						<div className='bosques-term'>
							<h4 className='bosques-term__title'>
								La contaminación
							</h4>
							<p className='bosques-term__text'>
								Se produce al introducir agentes químicos que
								alteran el ecosistema forestal, como el vertido de
								residuos y las emisiones industriales.
							</p>
						</div>
						<div className='bosques-term'>
							<h4 className='bosques-term__title'>
								El cambio climático
							</h4>
							<p className='bosques-term__text'>
								Es la variación significativa de los patrones
								climáticos de la Tierra que afecta a los bosques
								tropicales causando que sean más vulnerables a las
								sequías, incendios e inundaciones.
							</p>
						</div>
						<div className='bosques-term'>
							<h4 className='bosques-term__title'>
								La sobreexplotación
							</h4>
							<p className='bosques-term__text'>
								La tala excesiva y la explotación de recursos
								forestales sin prácticas sostenibles agotan los
								recursos y amenazan la capacidad de regeneración
								natural de los bosques tropicales.
							</p>
						</div>
					</div>

					<div className='bosques-doc-box'>
						<div className='bosques-doc-box__head'>
							<span className='bosques-doc-box__chip'>Doc. 2</span>
							<p className='bosques-doc-box__title'>
								El impacto de las actividades productivas en la
								deforestación
							</p>
						</div>
						<div className='bosques-doc-box__body'>
							<p className='bosques-doc-box__text'>
								En un estudio reciente, la FAO concluyó que, entre
								2000 y 2018, casi el <strong>90 %</strong> de la
								deforestación en zonas tropicales guarda relación
								con la agricultura (el 52.3 % se derivaba de la
								ampliación de las tierras de cultivo y el 37.5 %, de
								la ampliación de las tierras de pastoreo de ganado).
							</p>
							<p className='bosques-doc-box__text'>
								Las tierras de cultivo provocaron más del 75 % de la
								deforestación de África y Asia. La causa más
								importante en América del Sur y Oceanía fue el
								pastoreo de ganado.
							</p>
							<p className='bosques-doc-box__source'>
								Fuente: FAO (2022). El estado de los bosques del
								mundo.
							</p>
						</div>
					</div>
				</section>

				{/* ============ PAGE 5 · REGIONES AFECTADAS ============ */}
				<section className='bosques-page'>
					<span className='bosques-page__num'>5 / 7 · pág. 13</span>
					<div className='bosques-page__folio'>
						<span className='dot' /> Unidad 1 · Semana 1
					</div>

					<h2 className='bosques-h2'>
						Regiones afectadas por la deforestación en bosques
						tropicales
					</h2>
					<p className='bosques-p'>
						Las regiones más afectadas por la deforestación en las
						zonas tropicales se localizan en América del Sur, el centro
						de África y el sudeste de Asia. En América del Sur, la
						deforestación se concentra en la Amazonía, que es el bosque
						tropical más grande del mundo. En África, la Selva del
						Congo se encuentra amenazada por la expansión de la
						agricultura, la ganadería y la minería. En Asia, la
						deforestación se produce principalmente en Indonesia,
						Malasia y Birmania, a causa del cultivo de palma aceitera y
						la sobreexplotación de madera para la industria de papel
						(Doc. 3).
					</p>
					<p className='bosques-p'>
						La conversión de bosques tropicales en plantaciones
						agrícolas para la producción de cultivos comerciales, como
						la soya y la palma aceitera, sigue siendo la causa más
						significativa de deforestación en todo el mundo. La
						expansión de tierras para el pastoreo y la ganadería, así
						como la industria del papel y la extracción ilegal de
						madera, también aumentan la degradación de los bosques y, en
						última instancia, su riesgo de desaparición.
					</p>

					<div className='bosques-doc-box'>
						<div className='bosques-doc-box__head'>
							<span className='bosques-doc-box__chip'>Doc. 3</span>
							<p className='bosques-doc-box__title'>
								Principales actividades productivas en bosques
								tropicales
							</p>
						</div>
						<div className='bosques-doc-box__body'>
							<div className='bosques-map'>
								<div className='bosques-map__legend'>
									<span>
										<span
											className='bosques-map__dot'
											style={{ background: 'var(--green-600)' }}
										/>
										Bosque tropical
									</span>
									<span>
										<span
											className='bosques-map__dot'
											style={{ background: '#b9842c' }}
										/>
										Zonas deforestadas
									</span>
									<span>
										<span
											className='bosques-map__dot'
											style={{ background: 'var(--teal-700)' }}
										/>
										Explotación forestal
									</span>
									<span>
										<span
											className='bosques-map__dot'
											style={{ background: 'var(--amber-500)' }}
										/>
										Plantaciones de palma
									</span>
									<span>
										<span
											className='bosques-map__dot'
											style={{ background: 'var(--green-300)' }}
										/>
										Plantaciones de soja
									</span>
									<span>
										<span
											className='bosques-map__dot'
											style={{ background: 'var(--ink-500)' }}
										/>
										Operación minera
									</span>
								</div>
								<div className='bosques-map__regions'>
									<span className='bosques-map__pin'>Amazonía</span>
									<span className='bosques-map__pin'>
										Cuenca del Congo
									</span>
									<span className='bosques-map__pin'>
										Bosques mesoamericanos
									</span>
									<span className='bosques-map__pin'>
										Bosques de Madagascar
									</span>
									<span className='bosques-map__pin'>
										Bosques del sudeste asiático
									</span>
									<span className='bosques-map__pin'>
										Bosques de Papúa Nueva Guinea
									</span>
								</div>
							</div>
							<p className='bosques-doc-box__source'>
								Fuente: Global Forest Watch. Monitoreo de bosques
								diseñado para la acción.
							</p>
						</div>
					</div>
				</section>

				{/* ============ PAGE 6 · CAUSAS POR REGIÓN ============ */}
				<section className='bosques-page'>
					<span className='bosques-page__num'>6 / 7 · pág. 14</span>
					<div className='bosques-page__folio'>
						<span className='dot' /> Unidad 1 · Semana 1
					</div>

					<div className='bosques-activity'>
						<div className='bosques-activity__head'>
							<span className='bosques-activity__badge'>5</span>
							<div>
								<span className='bosques-activity__tag'>
									Actividad en pares
								</span>
								<h3 className='bosques-activity__title'>
									Conexiones e interrelaciones
								</h3>
							</div>
						</div>
						<div className='bosques-activity__body'>
							<ul className='bosques-list'>
								<li>
									<strong>a.</strong> Identifiquen, con base en el
									documento 3, cuáles son las principales
									actividades productivas por continente.
								</li>
								<li>
									<strong>b.</strong> Elijan una de las
									actividades e investiguen tanto las causas como
									los efectos inmediatos, a mediano y largo plazo
									que tiene para el entorno natural y la vida
									humana.
								</li>
							</ul>
						</div>
					</div>

					<h2 className='bosques-h2'>
						Causas de la deforestación en los principales bosques
						tropicales
					</h2>
					<p className='bosques-p'>
						Estas tendencias revelan la urgencia de abordar la
						deforestación a nivel local, nacional e internacional, ya
						que las repercusiones medioambientales y sociales son
						negativas en todas las regiones afectadas.
					</p>

					<div className='bosques-regions'>
						<div className='bosques-region bosques-region--green'>
							<div className='bosques-region__label'>
								<span>Región</span>
								<strong>América del Sur</strong>
							</div>
							<p className='bosques-region__text'>
								Según el informe de 2022 del World Wildlife Fund
								(WWF), el 18 % de los bosques amazónicos se ha
								perdido completamente y otro 17 % está degradado
								debido al cultivo a gran escala de soya y a la
								expansión de tierras para pastoreo, junto con la
								minería y la sobreexplotación de madera, afectando la
								calidad del agua y del aire.
							</p>
						</div>
						<div className='bosques-region bosques-region--amber'>
							<div className='bosques-region__label'>
								<span>Región</span>
								<strong>Centro de África</strong>
							</div>
							<p className='bosques-region__text'>
								La cuenca del río Congo es la segunda zona tropical
								más grande a nivel mundial, con un área de 3.7
								millones de km². La causa principal de deforestación
								es la agricultura de subsistencia, seguida por la
								explotación forestal —industrial y artesanal— y las
								operaciones mineras, en aumento constante.
							</p>
						</div>
						<div className='bosques-region bosques-region--teal'>
							<div className='bosques-region__label'>
								<span>Región</span>
								<strong>Sudeste asiático</strong>
							</div>
							<p className='bosques-region__text'>
								Según WWF, la producción de aceite de palma es la
								principal causa de deforestación, especialmente en
								Indonesia y Malasia, que juntas producen el 84 % del
								aceite de palma del mundo. Las actividades madereras
								para la industria del papel y la tala y quema también
								generan un impacto significativo.
							</p>
						</div>
					</div>
				</section>

				{/* ============ PAGE 7 · CONSOLIDACIÓN ============ */}
				<section className='bosques-page'>
					<span className='bosques-page__num'>7 / 7 · pág. 15</span>
					<div className='bosques-page__folio'>
						<span className='dot' /> Unidad 1 · Semana 1
					</div>
					<PhaseBanner label='Consolidación' variant='teal' />

					<div className='bosques-activity'>
						<div className='bosques-activity__head'>
							<span className='bosques-activity__badge'>6</span>
							<div>
								<span className='bosques-activity__tag'>
									Actividad en pares
								</span>
								<h3 className='bosques-activity__title'>
									Acciones de conservación
								</h3>
							</div>
						</div>
						<div className='bosques-activity__body'>
							<p>
								Establezcan tres acciones que se pueden realizar
								desde diferentes entidades para la conservación de
								los bosques tropicales en el mundo considerando las
								principales problemáticas a las que se enfrentan.
							</p>
							<ul className='bosques-list'>
								<li>
									<strong>a.</strong> Anótenlas en su cuaderno.
								</li>
								<li>
									<strong>b.</strong> Comparen sus respuestas con
									otros pares y seleccionen las mejores
									propuestas.
								</li>
								<li>
									<strong>c.</strong> Compartan en pleno su
									selección final.
								</li>
							</ul>
						</div>
					</div>

					<div className='bosques-activity bosques-activity--amber'>
						<div className='bosques-activity__head'>
							<span className='bosques-activity__badge'>7</span>
							<div>
								<span className='bosques-activity__tag'>
									Actividad con docente
								</span>
								<h3 className='bosques-activity__title'>
									Elijan un bosque tropical
								</h3>
							</div>
						</div>
						<div className='bosques-activity__body'>
							<p>
								Formen equipos de trabajo y seleccionen uno de los
								siguientes bosques tropicales.
							</p>
							<div className='bosques-chips'>
								<span className='bosques-chip'>Amazonas</span>
								<span className='bosques-chip'>El Congo</span>
								<span className='bosques-chip'>El Daintree</span>
								<span className='bosques-chip'>
									Bosque Nuboso de Monteverde
								</span>
							</div>
						</div>
					</div>

					<div className='bosques-activity bosques-activity--blue'>
						<div className='bosques-activity__head'>
							<span className='bosques-activity__badge'>8</span>
							<div>
								<span className='bosques-activity__tag'>
									Actividad en equipo
								</span>
								<h3 className='bosques-activity__title'>
									Problemáticas y regiones afectadas
								</h3>
							</div>
						</div>
						<div className='bosques-activity__body'>
							<p>
								Identifiquen y expliquen las problemáticas de los
								bosques tropicales y las características específicas
								de las regiones afectadas por los procesos de
								deforestación. Para ello:
							</p>
							<ul className='bosques-list'>
								<li>
									<strong>a.</strong> Seleccionen uno de los
									bosques tropicales identificados en el contenido
									estudiado.
								</li>
								<li>
									<strong>b.</strong> Describan la zona en la que
									se ubica y los factores que causan la
									deforestación y otras problemáticas.
								</li>
								<li>
									<strong>c.</strong> Analicen los impactos en la
									biodiversidad y en el medioambiente, los efectos
									para las comunidades locales y las medidas de
									conservación existentes.
								</li>
								<li>
									<strong>d.</strong> Presenten sus hallazgos al
									resto de la clase y organicen una plenaria en la
									que comparen regiones.
								</li>
							</ul>
							<p>
								Investiguen datos sobre el bosque seleccionado y
								ordenen la información en una tabla como la
								siguiente:
							</p>
							<table className='bosques-table'>
								<thead>
									<tr>
										<th>Criterio</th>
										<th>Hallazgos del equipo</th>
									</tr>
								</thead>
								<tbody>
									<tr>
										<td>Ubicación</td>
										<td>—</td>
									</tr>
									<tr>
										<td>Biodiversidad</td>
										<td>—</td>
									</tr>
									<tr>
										<td>Clima</td>
										<td>—</td>
									</tr>
									<tr>
										<td>Amenazas ambientales</td>
										<td>—</td>
									</tr>
									<tr>
										<td>Comunidades indígenas</td>
										<td>—</td>
									</tr>
									<tr>
										<td>Esfuerzos de conservación</td>
										<td>—</td>
									</tr>
								</tbody>
							</table>
						</div>
					</div>
				</section>
			</div>

			<p className='bosques-footer'>
				Reproducción web del material de estudio · Unidad 1 · Semana 1 —
				Los bosques tropicales en el mundo
			</p>
		</div>
	)
}

export default Unidad1Semana1BosquesScreen
