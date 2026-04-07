import React, { useState } from 'react'
import Sidebar from '../../../../components/Sidebar'
import Header from '../../../../components/Header'
import '../../../../App.css'

function Semana5Unidad5Screen () {
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
										Unidad 5 · Semana 5
									</h1>
									<h2 className='unidad-subtitle'>
										Derechos humanos: mecanismos de defensa
										y participación ciudadana
									</h2>
								</div>

								<section>
									<div className='unidad-doc-box'>
										<p className='unidad-doc-kicker'>
											Doc. 1 «Tengo un sueño»: Martin
											Luther King
										</p>
										<p className='unidad-doc-text'>
											«Tengo un sueño, sueño que mis hijos
											vivan un día en un país donde no sean
											juzgados por el color de su piel»,
											dijo Martin Luther King en su
											discurso más conocido […].
										</p>
										<p className='unidad-doc-text'>
											[…] «Todos los seres humanos nacen
											libres e iguales en dignidad y
											derechos y, dotados como están de razón
											y conciencia, deben comportarse
											fraternalmente los unos con los otros»,
											reza el artículo 1 de la Declaración
											Universal de los Derechos Humanos
											[…].
										</p>
										<p className='unidad-doc-text'>
											[…] Martin Luther King se entregó a la
											causa de la igualdad y el respeto de
											los derechos humanos de la población
											negra de su país, de las personas más
											pobres y de todas las víctimas de
											injusticias. Su arma de combate fueron
											las protestas pacíficas, en las que
											pronunció discursos que siguen
											resonando en la actualidad […].
										</p>
										<p className='unidad-doc-footer'>
											Fuente: García, C. (2020). «Tengo un
											sueño»: Martin Luther King, un gigante
											de los derechos humanos.
										</p>
									</div>
								</section>

								<section>
									<h3 className='unidad-section-title'>
										Los derechos humanos
									</h3>
									<p className='unidad-paragraph'>
										Los derechos humanos se fortalecieron con
										la aprobación de la Declaración Universal
										de Derechos Humanos por parte de la
										Asamblea General de las Naciones Unidas
										el 10 de diciembre de 1948. Redactada
										como un ideal común por el que todos los
										pueblos y naciones deben esforzarse, en la
										Declaración se establecen claramente los
										derechos civiles, políticos, económicos,
										sociales y culturales básicos de los que
										todos los seres humanos deben gozar.
									</p>
									<p className='unidad-paragraph'>
										Los derechos humanos son inherentes a
										todos los seres humanos, sin distinción de
										raza, sexo, nacionalidad, origen étnico,
										lengua, religión o cualquier otra
										condición. Entre los derechos humanos se
										incluyen el derecho a la vida y a la
										libertad, a no estar sometido ni a
										esclavitud ni a torturas, a la libertad de
										opinión y de expresión, a la educación y
										al trabajo, entre otros. Estos derechos
										corresponden a todas las personas, sin
										discriminación alguna.
									</p>
									<p className='unidad-paragraph unidad-paragraph-bottom'>
										La Organización de las Naciones Unidas
										(ONU) colabora con los Gobiernos para
										fortalecer sus competencias relacionadas
										con los derechos humanos, alienta a los
										Estados a desarrollar políticas e
										instituciones acordes con esos derechos y
										proporciona asesoramiento y asistencia
										técnica en pos de estos objetivos.
									</p>

									<h3 className='unidad-section-title'>
										Mecanismos de defensa de los derechos
										humanos
									</h3>
									<p className='unidad-paragraph unidad-paragraph-bottom'>
										Los tratados internacionales sobre
										derechos humanos se desarrollaron después
										de la Segunda Guerra Mundial y emanan de
										los derechos reconocidos en la Declaración
										Universal de los Derechos Humanos.
									</p>
									<p className='unidad-paragraph unidad-paragraph-bottom'>
										Los diversos tratados son nombrados pactos
										o convenios. Entre los pactos
										internacionales en materia de derechos
										humanos se encuentran:
									</p>

									<h4 className='unidad-subheading'>
										Profundización
									</h4>

									<div className='unidad-info-box'>
										<p className='unidad-info-title'>
											Conexión geográfica
										</p>
										<p className='unidad-info-text'>
											El papel de la Oficina del Alto
											Comisionado de las Naciones Unidas
											para los Derechos Humanos (OACDH) es
											proteger y promover los derechos
											humanos. Es la oficina de la ONU más
											importante en esta materia y trabaja
											para asegurar que los estándares de
											derechos humanos se apliquen en todas
											las actividades de la ONU.
										</p>
									</div>

									<div className='unidad-problem-grid'>
										<div className='unidad-problem-card'>
											<h4 className='unidad-problem-title'>
												Pacto Internacional de Derechos
												Económicos, Sociales y Culturales
											</h4>
											<p className='unidad-problem-text'>
												Fue aprobado el 16 de diciembre de
												1966 por la Asamblea General de
												las Naciones Unidas (ONU). Hace
												referencia a los derechos
												económicos, sociales y culturales,
												que se consideran derechos de
												igualdad material, por medio de los
												cuales se pretende alcanzar la
												satisfacción de las necesidades
												básicas de las personas y el máximo
												nivel posible de vida digna.
											</p>
										</div>
										<div className='unidad-problem-card'>
											<h4 className='unidad-problem-title'>
												Pacto Internacional de Derechos
												Civiles y Políticos
											</h4>
											<p className='unidad-problem-text'>
												Fue adoptado por la Asamblea
												General de las Naciones Unidas el
												16 de diciembre de 1966. Establece
												los derechos que garantizan la
												protección de las personas,
												asegurando el respeto a la
												integridad personal, el ejercicio de
												las libertades fundamentales y la
												existencia de un marco jurídico con
												garantías en los procedimientos
												administrativos y judiciales.
											</p>
										</div>
									</div>
								</section>

								<section>
									<p className='unidad-paragraph unidad-paragraph-bottom'>
										Algunos de los principales convenios
										internacionales en materia de derechos
										humanos son:
									</p>

									<div className='unidad-doc-box'>
										<p className='unidad-doc-kicker'>
											Convención Internacional sobre la
											Eliminación de todas las Formas de
											Discriminación Racial
										</p>
										<p className='unidad-doc-text'>
											Fue aprobada por la Asamblea General
											de las Naciones Unidas en 1965 y entró
											en vigor en 1969. En ella, los Estados
											partes condenan la discriminación
											racial y se comprometen a seguir, por
											todos los medios apropiados y sin
											dilaciones, una política encaminada a
											eliminar la discriminación racial en
											todas sus formas y a promover el
											entendimiento entre todas las razas.
										</p>
									</div>

									<div className='unidad-doc-box'>
										<p className='unidad-doc-kicker'>
											Convención sobre los Derechos del Niño
										</p>
										<p className='unidad-doc-text'>
											Fue adoptada por la Asamblea General de
											Naciones Unidas el 20 de noviembre de
											1989 y entró en vigor en 1990. Todos
											los Estados parte están obligados a
											respetar los derechos de la infancia
											recogidos en la Convención y hacerlos
											cumplir sin distinción de color, sexo,
											idioma, religión, opiniones,
											procedencia, posición económica,
											impedimentos, nacimiento o cualquier
											otra condición de la niñez.
										</p>
									</div>

									<div className='unidad-doc-box'>
										<p className='unidad-doc-kicker'>
											Convención sobre la Eliminación de
											todas las Formas de Discriminación
											contra la Mujer
										</p>
										<p className='unidad-doc-text'>
											Fue adoptada por la Asamblea General de
											las Naciones Unidas el 18 de diciembre
											de 1979 y entró en vigor en 1981.
											Provee un marco obligatorio de
											cumplimiento para los países que la han
											ratificado para lograr la igualdad de
											las mujeres y las niñas y estipula que
											los Estados parte deben de garantizar
											la igualdad de trato, es decir, que no
											exista discriminación directa ni
											indirecta de la mujer.
										</p>
									</div>

									<div className='unidad-doc-box'>
										<p className='unidad-doc-kicker'>
											Convención sobre los Derechos de las
											personas con Discapacidad
										</p>
										<p className='unidad-doc-text'>
											Fue aprobada por la Asamblea General de
											las Naciones Unidas el 13 de diciembre
											de 2006 y entró en vigor en 2008. El
											objetivo de la Convención es promover,
											proteger y asegurar el pleno disfrute
											de todos los derechos humanos y las
											libertades fundamentales de todas las
											personas con discapacidad. Las personas
											con discapacidad son las que tienen a
											largo plazo impedimentos físicos,
											mentales, intelectuales o sensoriales
											que, en interacción con diversas
											barreras, puedan impedir su
											participación plena y efectiva en la
											sociedad en igualdad de condiciones.
										</p>
									</div>
								</section>

								<section>
									<h3 className='unidad-section-title'>
										Organizaciones internacionales que velan
										por la defensa de los derechos humanos
									</h3>
									<p className='unidad-paragraph'>
										A lo largo de la historia, las naciones y
										la propia sociedad civil se han valido de
										diversas instituciones para velar por la
										protección y el cumplimiento de estos
										derechos.
									</p>
									<p className='unidad-paragraph unidad-paragraph-bottom'>
										Existen organizaciones internacionales de
										la sociedad civil que trabajan a favor de
										los derechos humanos. Además, la ONU posee
										organizaciones importantes que trabajan en
										la defensa y el cumplimiento de los
										derechos, como el Programa Mundial de
										Alimentos (PMA), el Fondo de las Naciones
										Unidas para la Infancia (UNICEF), la
										Organización Mundial de la Salud (OMS), el
										Programa de las Naciones Unidas para el
										Desarrollo (PNUD), la Oficina de
										Coordinación de Asuntos Humanitarios
										(OCAH), el Alto Comisionado de las
										Naciones Unidas para los Derechos Humanos
										(ACNUDH).
									</p>

									<h4 className='unidad-subheading'>
										Organismos internacionales
									</h4>

									<div className='unidad-regions-grid'>
										<div className='unidad-region-card green'>
											<h4 className='unidad-region-title green'>
												Organización Internacional del
												Trabajo (OIT)
											</h4>
											<p className='unidad-region-text'>
												La OIT es una agencia de las
												Naciones Unidas, fundada en 1919,
												que se encarga de los asuntos
												relativos al trabajo y las
												relaciones laborales. Sus principales
												objetivos son promover los derechos
												laborales, fomentar oportunidades de
												trabajo decente, mejorar la
												protección social y fortalecer el
												diálogo para abordar temas
												relacionados con el trabajo.
											</p>
										</div>
										<div className='unidad-region-card orange'>
											<h4 className='unidad-region-title orange'>
												Fondo de las Naciones Unidas para
												la Infancia (UNICEF)
											</h4>
											<p className='unidad-region-text'>
												Es una organización de las Naciones
												Unidas con presencia en más de 190
												países cuyo objetivo es proveer de
												ayuda humanitaria a niños y familias
												en países en desarrollo. Con la
												Declaración de los Derechos del Niño,
												UNICEF se convirtió en un agente
												imprescindible al momento de dar
												respuesta a las necesidades de la
												infancia y proteger sus derechos.
											</p>
										</div>
										<div className='unidad-region-card blue'>
											<h4 className='unidad-region-title blue'>
												La Organización de las Naciones
												Unidas para la Educación, la
												Ciencia y la Cultura (UNESCO)
											</h4>
											<p className='unidad-region-text'>
												Promueve los derechos humanos y el
												Estado de derecho en sus esferas de
												competencia, con especial hincapié
												en el derecho a la educación, a la
												información, a la libertad de
												opinión y de expresión, a los
												derechos culturales, y el derecho a
												participar en los avances
												científicos y a participar en el
												progreso científico. Aboga por la
												promoción de los derechos humanos
												mediante la asistencia a los Estados
												miembros para examinar y desarrollar
												sus marcos jurídicos.
											</p>
										</div>
									</div>
								</section>

								<section>
									<h3 className='unidad-section-title'>
										Proteger los derechos humanos
									</h3>
									<p className='unidad-paragraph'>
										El derecho internacional establece la
										obligación de los Gobiernos a actuar de
										una manera determinada para promover y
										proteger los derechos humanos y las
										libertades fundamentales de los individuos
										o de los grupos o a abstenerse de
										emprender ciertas acciones que contravienen
										los derechos humanos.
									</p>
									<p className='unidad-paragraph unidad-paragraph-bottom'>
										Sin embargo, cuando estos derechos
										fundamentales son limitados por diferentes
										circunstancias, intervienen las
										organizaciones para velar por que se
										respeten. A continuación se presenta una
										noticia donde se refleja la intervención
										de los organismos internacionales para la
										protección de los derechos humanos (Doc.
										2).
									</p>

									<div className='unidad-web-note'>
										<p className='unidad-web-note-title'>
											En la web
										</p>
										<p className='unidad-web-note-text'>
											Organizaciones pro derechos humanos
										</p>
									</div>

									<div className='unidad-doc-box'>
										<p className='unidad-doc-kicker'>
											Doc. 2 Ucrania registra un impacto
											creciente de los ataques a la salud y la
											educación
										</p>
										<p className='unidad-doc-text'>
											Declaración conjunta del Dr. Jarno
											Habicht, representante de la OMS en
											Ucrania, y Munir Mammadzade,
											representante de UNICEF en Ucrania:
										</p>
										<ul className='unidad-activity-list'>
											<li>
												Desde febrero de 2022, la OMS ha
												documentado 1552 ataques a la salud,
												que han afectado a proveedores de
												servicios de salud, suministros,
												instalaciones, almacenes y transporte,
												incluidas ambulancias. Se han cobrado
												al menos 112 vidas, incluidos
												trabajadores de la salud y pacientes,
												y han herido a muchos más. Según el
												Gobierno, estos ataques han dañado o
												destruido más de 3800 escuelas en
												Ucrania. Los ataques a escuelas,
												hospitales y otras infraestructuras
												civiles son inaceptables y pueden
												constituir una violación del derecho
												internacional humanitario.
											</li>
											<li>
												El derecho a los servicios médicos y
												a la educación, especialmente en
												tiempos de crisis, nunca debe
												negarse. La interrupción del acceso a
												la atención sanitaria aumenta el
												riesgo de enfermedad o muerte. La
												interrupción del acceso a la
												educación afecta el desarrollo y el
												bienestar de los niños, poniendo en
												peligro su futuro.
											</li>
										</ul>
										<p className='unidad-doc-footer'>
											Fuente: OMS. (2024). Ucrania registra un
											impacto creciente de los ataques a la
											salud y la educación.
										</p>
									</div>
								</section>

								<section>
									<h3 className='unidad-section-title'>
										Defensa de los derechos humanos a nivel
										nacional
									</h3>
									<p className='unidad-paragraph unidad-paragraph-bottom'>
										Por medio de la ratificación de los
										tratados internacionales de derechos
										humanos, los Gobiernos se comprometen a
										adoptar medidas y leyes internas
										compatibles con las obligaciones y deberes
										dimanantes de los tratados. En caso de que
										los procedimientos judiciales nacionales no
										aborden los abusos contra los derechos
										humanos, existen mecanismos y procedimientos
										en el plano regional e internacional para
										presentar denuncias o comunicaciones
										individuales que ayudan a garantizar las
										normas internacionales de derechos humanos.
										Algunos de los mecanismos legales con los
										cuenta El Salvador para garantizar la
										defensa de los derechos humanos son:
									</p>

									<ul className='unidad-steps-list'>
										<li>
											<strong>
												La Constitución de la República de El
												Salvador.
											</strong>{' '}
											Establece los derechos individuales y
											sociales y garantiza su cumplimiento. En
											su artículo 2 expresa que toda persona
											tiene derecho a la vida, a la integridad
											física y moral, a la libertad, a la
											seguridad, al trabajo, a la propiedad y
											posesión, y a ser protegida en la
											conservación y defensa de los mismos.
										</li>
										<li>
											<strong>El Código de Familia.</strong>{' '}
											Establece el régimen jurídico de la
											familia, de los menores y de las
											personas adultas mayores y,
											consecuentemente, regula las relaciones
											de sus miembros y de estos con la
											sociedad y con las entidades estatales.
										</li>
										<li>
											<strong>El Código de Trabajo.</strong>{' '}
											Tiene por objeto principal armonizar las
											relaciones entre patronos y
											trabajadores, estableciendo sus derechos
											y obligaciones. Se funda en principios
											que tiendan al mejoramiento de las
											condiciones de vida de los trabajadores.
										</li>
									</ul>

									<p className='unidad-paragraph unidad-paragraph-bottom'>
										Existen además instituciones nacionales
										que velan por los derechos humanos.
										Participan en ella todas las esferas del
										Gobierno, junto con otras instituciones
										nacionales y la sociedad civil. Algunas de
										esas instituciones son las que conforman el
										Ministerio Público.
									</p>

									<ul className='unidad-steps-list'>
										<li>
											<strong>
												La Procuraduría General de la
												República.
											</strong>{' '}
											Le corresponde promover y atender con
											equidad la defensa de la familia, de las
											personas e intereses de los menores,
											incapaces y adultos mayores; conceder
											asistencia legal, atención psicosocial de
											carácter preventivo y servicios de
											mediación y conciliación; representar
											judicial y extrajudicialmente a las
											personas, especialmente de escasos
											recursos económicos, en defensa de la
											libertad individual, de los derechos
											laborales, de familia y derechos reales y
											personales.
										</li>
										<li>
											<strong>
												La Procuraduría para la Defensa de
												los Derechos Humanos.
											</strong>{' '}
											Tiene como misión ejercer el mandato
											constitucional de velar por el respeto y
											garantía de los derechos humanos,
											supervisando la actuación de la
											administración pública frente a las
											personas mediante acciones de protección,
											promoción y educación, contribuyendo con
											el Estado de derecho y la conformación de
											la cultura de paz.
										</li>
										<li>
											<strong>
												Fiscalía General de la República.
											</strong>{' '}
											Tiene como misión defender los intereses
											del Estado y de la sociedad. Además,
											tiene como fines la investigación de los
											delitos y el esclarecimiento de los
											hechos; otorgar una procuración de
											justicia eficaz, efectiva, apegada a
											derecho.
										</li>
									</ul>

									<div className='unidad-info-box'>
										<p className='unidad-info-title'>
											Glosario
										</p>
										<p className='unidad-info-text'>
											<strong>Ratificación.</strong> Aprobar o
											confirmar actos, palabras o escritos,
											dándolos por valederos y ciertos.
										</p>
									</div>
								</section>

								<section>
									<h3 className='unidad-section-title'>
										Participación ciudadana en la defensa de
										los derechos humanos
									</h3>
									<p className='unidad-paragraph'>
										La participación en la vida política y
										cultural es un derecho humano fundamental
										reconocido en una serie de tratados
										internacionales, empezando por la
										Declaración Universal de los Derechos
										Humanos, que establece el derecho a
										participar en el Gobierno, en elecciones
										libres y en la vida cultural de la
										comunidad, el derecho a la libertad de
										reunión y asociación pacífica y a afiliarse
										a los sindicatos. La participación es
										también un principio básico de los derechos
										humanos y una condición para la ciudadanía
										democrática de todas las personas.
									</p>
									<p className='unidad-paragraph unidad-paragraph-bottom'>
										Un ejemplo de participación ciudadana en El
										Salvador en la defensa de los derechos
										humanos en sus esferas de actuación son las
										organizaciones no gubernamentales (ONG).
										Entre ellas están:
									</p>

									<div className='unidad-info-box'>
										<p className='unidad-info-title'>
											Conexión ciudadana
										</p>
										<p className='unidad-info-text'>
											La participación no es solamente un
											derecho humano en sí mismo, también
											sirve de apoyo y depende de otros
											derechos que son vitales de forma
											colectiva para una gobernanza eficaz, el
											desarrollo y la paz.
										</p>
									</div>

									<div className='unidad-regions-grid'>
										<div className='unidad-region-card green'>
											<h4 className='unidad-region-title green'>
												La Organización de Mujeres
												Salvadoreñas por la Paz (ORMUSA)
											</h4>
											<p className='unidad-region-text'>
												Es una institución que promueve el
												desarrollo económico, social y
												político de las mujeres por medio de
												acciones de incidencia política,
												facilitando el acceso a la justicia y
												el desarrollo local y nacional, desde
												un enfoque de derechos humanos.
											</p>
										</div>
										<div className='unidad-region-card orange'>
											<h4 className='unidad-region-title orange'>
												Aldeas Infantiles SOS El Salvador
											</h4>
											<p className='unidad-region-text'>
												Es una asociación internacional con
												presencia en El Salvador. Promueve el
												fortalecimiento de comunidades
												protectoras de los derechos de la niñez
												y la adolescencia a través de actores
												y líderes de la comunidad para que
												desarrollen capacidades de autocuidado
												y protección. Brindan vivienda
												temporal a niños y adolescentes bajo
												protección especial.
											</p>
										</div>
									</div>
								</section>

								<section>
									<h3 className='unidad-consolidation-title'>
										Consolidación
									</h3>

									<div className='unidad-doc-box'>
										<p className='unidad-doc-kicker'>
											Doc. 3 Contribución de las Naciones
											Unidas para un mundo mejor
										</p>
										<p className='unidad-doc-text'>
											Más de 50 millones de refugiados que
											huían de la persecución, la violencia y
											la guerra han recibido ayuda de la
											Oficina del Alto Comisionado de las
											Naciones Unidas para los Refugiados
											(ACNUR) desde 1951, en un esfuerzo
											permanente, en el que suelen participar
											otros organismos.
										</p>
										<p className='unidad-doc-text'>
											El ACNUR trata de hallar soluciones a
											largo plazo o «duraderas» ayudando a los
											refugiados a regresar a sus países de
											origen, si las condiciones lo justifican,
											a integrarse en sus países de asilo o a
											reasentarse en terceros países. Más de
											33 millones de refugiados, personas que
											buscan asilo y desplazados internos, en
											su mayoría mujeres y niños, reciben ayuda
											de las Naciones Unidas en forma de
											alimentos, cobijo, atención médica,
											educación y repatriación.
										</p>
										<p className='unidad-doc-footer'>
											Fuente: Organización de las Naciones
											Unidas. 60 contribuciones de las
											Naciones Unidas para un mundo mejor.
										</p>
									</div>
								</section>

								<section>
									<h3 className='unidad-section-title'>
										Ciudadanía digital, medioambiente y
										sostenibilidad
									</h3>
									<p className='unidad-paragraph'>
										Unidad 6
									</p>
									<p className='unidad-paragraph'>
										En esta unidad aprenderemos a:
									</p>
									<p className='unidad-paragraph unidad-paragraph-bottom'>
										Analizar la ciudadanía digital considerando
										los diversos mecanismos y espacios de
										participación haciendo uso de las nuevas
										tecnologías con el propósito de desarrollar
										habilidades comunicativas y de empatía.
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

export default Semana5Unidad5Screen
