import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import Sidebar from '../../../components/Sidebar'
import Header from '../../../components/Header'
import '../../../App.css'
import './ValoresIndex.css'
import { VALORES_SECTIONS } from './valoresNavData'

function ValoresIndex () {
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
							<nav
								className='valores-index'
								aria-label='Índice de formación en valores'
							>
								<header className='valores-index__hero'>
									<p className='valores-index__eyebrow'>
										Grado 9 
									</p>
									<h1 className='valores-index__title'>
										Ciudadanía y Valores
									</h1>
									<p className='valores-index__subtitle'>
										Accede a cada semana por unidad. Elige
										una tarjeta para abrir la lección.
									</p>
									<img
										className='valores-index__hero-img'
										src='/valores.png'
										alt='Estudiantes de grado 9 aprendiendo al aire libre'
										loading='lazy'
										decoding='async'
									/>
								</header>

								<div className='valores-index__units'>
									{VALORES_SECTIONS.map((section) => (
										<section
											key={section.unit}
											className='valores-index__unit'
											aria-labelledby={`valores-u${
												section.unit
											}-title`}
										>
											<div className='valores-index__unit-head'>
												<span
													className='valores-index__unit-num'
													aria-hidden='true'
												>
													{section.unit}
												</span>
												<div
													className='valores-index__unit-text'
												>
													<h2
														id={`valores-u${
															section.unit
														}-title`}
														className='valores-index__unit-title'
													>
														{section.label}
													</h2>
													<p
														className='valores-index__unit-meta'
													>
														{section.weeks.length}{' '}
														semanas
													</p>
												</div>
											</div>
											<div className='valores-index__links'>
												{section.weeks.map((w) => (
													<Link
														key={w.to}
														className='valores-index__link'
														to={w.to}
													>
														{w.label}
													</Link>
												))}
											</div>
										</section>
									))}
								</div>
							</nav>
						</div>
					</div>
				</div>
			</div>
		</div>
	)
}

export default ValoresIndex
