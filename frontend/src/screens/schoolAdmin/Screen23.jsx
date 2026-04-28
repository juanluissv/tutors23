import React, { useState } from 'react'
import AdminSidebar from '../../components/AdminSidebar' 
import AdminHeader from '../../components/AdminHeader'
import '../../App.css'

function Screen23 () {
	const [isSidebarOpen, setIsSidebarOpen] = useState(
		window.innerWidth > 768,
	)
	
	const toggleSidebar = () => {
		setIsSidebarOpen(!isSidebarOpen);
	};

	return (
		<div className='chat-app chat-app--teacher-login ask-screen'>
			<div className='main-container'>
				<AdminSidebar isOpen={isSidebarOpen} toggleSidebar={toggleSidebar} />
				<div className='main-content'>
					<AdminHeader
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

export default Screen23