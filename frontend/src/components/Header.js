import React from 'react';
import { useNavigate } from 'react-router-dom'
// Icon URLs from Figma
const imgIcon = "https://www.figma.com/api/mcp/asset/0af1f7fd-f3b0-447c-85f2-11ecd9f8aa71";
const imgIcon7 = "https://www.figma.com/api/mcp/asset/34081ae6-9743-48f6-89b6-b8e08cae2713";
const imgIcon8 = "/user.svg";

function Header({ isSidebarOpen, toggleSidebar }) {
  const navigate = useNavigate()

  return (
    <header className='header header-centered'>
             
      {/* when user click on logo go to home screen */}
      <div className="header-left">
        <div className="header-logo" onClick={() => navigate('/')}>
          <img src="https://app.asktolearn.co/assets/img/log4.png" alt="Ask to Learn" className="logo-image" />
          <span className="logo-text">Ask to Learn</span>
        </div>        
      </div>

      {/* when user click on button go to login screen */}
      <button className="user-button" onClick={() => navigate('/login')}>
        <img src={imgIcon8} alt="User" />
      </button>
    </header>
  );
}

export default Header;
