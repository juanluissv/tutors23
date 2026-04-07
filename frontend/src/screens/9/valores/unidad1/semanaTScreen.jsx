import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom';
import Sidebar from '../../../../components/Sidebar'
import Header from '../../../../components/Header'
import '../../../../App.css'

function Semana1Screen () {
	const [isSidebarOpen, setIsSidebarOpen] = useState(
		window.innerWidth > 768,
	)
	
	const toggleSidebar = () => {
		setIsSidebarOpen(!isSidebarOpen);
	};

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
										Unidad 1 · Semana 1
									</h1>
									<h2 className='unidad-subtitle'>
										Los bosques tropicales en el mundo
									</h2>																	
								</div>																
								<section>
									<h3 className='unidad-section-title'>
										Los bosques: importancia y
										clasificación
									</h3>
									<p className='unidad-paragraph'>
										Los bosques son ecosistemas complejos
										que desempeñan un papel vital para la
										vida humana. Cubren alrededor del 31 %
										de la superficie terrestre del mundo
										y cumplen diversas funciones
									</p>
									<p className='unidad-paragraph'>
										Entre las que se incluyen la producción de
										oxígeno, la purificación del aire, la
										provisión de agua y de otros recursos
										naturales, por lo que son muy
										importantes para el mantenimiento de
										la salud y el equilibrio del planeta.
									</p>
									<p className='unidad-paragraph'>
										La clasificación de los bosques se
										basa en distintos criterios, como la
										zona climática en la que se
										encuentran, el tipo de vegetación que
										los conforma o su función ecológica.
									</p>
									<p className='unidad-paragraph unidad-paragraph-bottom'>
										En relación con la zona climática, los
										bosques se dividen en: tropicales,
										subtropicales, templados y boreales.
										De estos, las zonas tropicales
										destacan por tener la mayor proporción
										de bosques a nivel mundial,
										alcanzando el 45 %, mientras que el
										resto se distribuye entre las otras
										zonas climáticas.
									</p>

									<div className='unidad-chart-box'>
										<h4 className='unidad-chart-title'>
											Distribución mundial de los
											bosques por zona climática
										</h4>
										<div className='unidad-chart-grid'>
											<div className='unidad-chart-item'>
												<div className='unidad-chart-value tropical'>
													45%
												</div>
												<div className='unidad-chart-label'>
													Tropical
												</div>
											</div>
											<div className='unidad-chart-item'>
												<div className='unidad-chart-value boreal'>
													27%
												</div>
												<div className='unidad-chart-label'>
													Boreal
												</div>
											</div>
											<div className='unidad-chart-item'>
												<div className='unidad-chart-value templada'>
													16%
												</div>
												<div className='unidad-chart-label'>
													Templada
												</div>
											</div>
											<div className='unidad-chart-item'>
												<div className='unidad-chart-value subtropical'>
													11%
												</div>
												<div className='unidad-chart-label'>
													Subtropical
												</div>
											</div>
										</div>
										<p className='unidad-chart-footer'>
											Fuente: FAO (2020). Evaluación de
											los recursos forestales mundiales.
										</p>
									</div>

									<div className='unidad-info-box'>
										<p className='unidad-info-title'>
											Conexión geográfica
										</p>
										<p className='unidad-info-text'>
											Cerca del 54 % de los bosques del
											mundo se concentran en cinco
											naciones: Rusia, Brasil, Canadá,
											Estados Unidos y China.
										</p>
									</div>
								</section>

								<section>
									<h3 className='unidad-section-title'>
										Características de los bosques
										tropicales
									</h3>
									<p className='unidad-paragraph'>
										Los bosques tropicales se localizan en
										la zona intertropical y constituyen
										uno de los ecosistemas más
										transcendentales a nivel mundial.
									</p>
									<p className='unidad-paragraph'>
										Se caracterizan por su clima cálido y
										húmedo y experimentan precipitaciones
										abundantes a lo largo de todo el año,
										creando condiciones propicias para la
										vida vegetal y animal.
									</p>
									<p className='unidad-paragraph'>
										Además, destacan por albergar una
										asombrosa diversidad biológica, con
										aproximadamente el 60 % de las
										especies conocidas de fauna y flora a
										nivel mundial.
									</p>
									<p className='unidad-paragraph unidad-paragraph-bottom'>
										Sin embargo, en las últimas décadas,
										la deforestación ha amenazado
										seriamente la salud y la estabilidad
										de estos bosques, afectando a
										regiones enteras.
									</p>
								</section>

								<section>
									<h3 className='unidad-section-title'>
										Principales problemáticas de los
										bosques tropicales
									</h3>
									<p className='unidad-paragraph unidad-paragraph-bottom'>
										Los bosques tropicales, a pesar de su
										importancia ecológica, se enfrentan a
										diversas problemáticas que ponen en
										riesgo su existencia:
									</p>

									<div className='unidad-problem-grid'>
										<div className='unidad-problem-card'>
											<h4 className='unidad-problem-title'>
												La deforestación
											</h4>
											<p className='unidad-problem-text'>
												Es el proceso mediante el cual
												se elimina o reduce, a gran
												escala, la cobertura forestal
												de un área determinada. Puede
												ser causada por actividades
												humanas o naturales.
											</p>
										</div>
										<div className='unidad-problem-card'>
											<h4 className='unidad-problem-title'>
												La contaminación
											</h4>
											<p className='unidad-problem-text'>
												Se produce al introducir
												agentes químicos que alteran el
												ecosistema forestal, como el
												vertido de residuos y las
												emisiones industriales.
											</p>
										</div>
										<div className='unidad-problem-card'>
											<h4 className='unidad-problem-title'>
												El cambio climático
											</h4>
											<p className='unidad-problem-text'>
												Es la variación significativa de
												los patrones climáticos de la
												Tierra que afecta a los bosques
												tropicales, haciéndolos más
												vulnerables a sequías,
												incendios e inundaciones.
											</p>
										</div>
										<div className='unidad-problem-card'>
											<h4 className='unidad-problem-title'>
												La sobreexplotación
											</h4>
											<p className='unidad-problem-text'>
												La tala excesiva y la
												explotación de recursos
												forestales sin prácticas
												sostenibles agotan los recursos
												y amenazan la capacidad de
												regeneración natural de los
												bosques tropicales.
											</p>
										</div>
									</div>

									<div className='unidad-doc-box'>
										<p className='unidad-doc-kicker'>
											Doc. 2 — El impacto de las
											actividades productivas en la
											deforestación
										</p>
										<p className='unidad-doc-text'>
											En un estudio reciente, la FAO
											concluyó que, entre 2000 y 2018,
											casi el 90 % de la deforestación
											en zonas tropicales guarda
											relación con la agricultura (el
											52.3 % se derivaba de la
											ampliación de las tierras de
											cultivo y el 37.5 % de la
											ampliación de las tierras de
											pastoreo de ganado).
										</p>
										<p className='unidad-doc-text'>
											Las tierras de cultivo provocaron
											más del 75 % de la deforestación
											de África y Asia. La causa más
											importante en América del Sur y
											Oceanía fue el pastoreo de ganado.
										</p>
										<p className='unidad-doc-footer'>
											Fuente: FAO (2022). El estado de
											los bosques del mundo.
										</p>
									</div>
								</section>

								<section>
									<h3 className='unidad-section-title'>
										Regiones afectadas por la
										deforestación en bosques tropicales
									</h3>
									<p className='unidad-paragraph'>
										Las regiones más afectadas por la
										deforestación en las zonas tropicales
										se localizan en América del Sur, el
										centro de África y el sudeste de
										Asia.
									</p>
									<p className='unidad-paragraph'>
										En América del Sur, la deforestación
										se concentra en la Amazonía, que es
										el bosque tropical más grande del
										mundo. En África, la Selva del Congo
										se encuentra amenazada por la
										expansión de la agricultura, la
										ganadería y la minería.
									</p>
									<p className='unidad-paragraph unidad-paragraph-bottom'>
										En Asia, la deforestación se produce
										principalmente en Indonesia, Malasia
										y Birmania, a causa del cultivo de
										palma aceitera y la sobreexplotación
										de madera para la industria del
										papel.
									</p>

									<div className='unidad-regions-grid'>
										<div className='unidad-region-card green'>
											<h4 className='unidad-region-title green'>
												América del Sur
											</h4>
											<p className='unidad-region-text'>
												La deforestación se concentra
												en la Amazonía. Según WWF, el
												18 % de los bosques amazónicos
												se ha perdido completamente y
												otro 17 % está degradado debido
												al cultivo a gran escala de
												soya y a la expansión de tierras
												para pastoreo, junto con la
												minería y la sobreexplotación
												de madera.
											</p>
										</div>
										<div className='unidad-region-card orange'>
											<h4 className='unidad-region-title orange'>
												Centro de África
											</h4>
											<p className='unidad-region-text'>
												La cuenca del río Congo, con un
												área de 3.7 millones de km², es
												la segunda zona tropical más
												grande del mundo. La causa
												principal de deforestación es la
												agricultura de subsistencia,
												seguida por la explotación
												forestal, tanto industrial como
												artesanal, y las operaciones
												mineras.
											</p>
										</div>
										<div className='unidad-region-card blue'>
											<h4 className='unidad-region-title blue'>
												Sudeste asiático
											</h4>
											<p className='unidad-region-text'>
												La producción de aceite de palma
												es la principal causa de la
												deforestación, especialmente en
												Indonesia y Malasia, que juntas
												producen el 84 % del aceite de
												palma del mundo. Las actividades
												madereras destinadas a la
												industria del papel y las
												prácticas agrícolas de tala y
												quema también ejercen un impacto
												significativo.
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

export default Semana1Screen