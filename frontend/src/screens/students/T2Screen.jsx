import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom';
import Sidebar from '../../components/Sidebar'
import Header from '../../components/Header'
import '../../App.css'

function T2Screen () {
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
                            {/* content goes here */}
							
															
						</div>
					</div>
				</div>
			</div>
		</div>
	)
}

export default T2Screen