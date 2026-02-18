import React from 'react';

// Icon URLs from Figma
const imgIcon = "https://www.figma.com/api/mcp/asset/0af1f7fd-f3b0-447c-85f2-11ecd9f8aa71";
const imgIcon7 = "https://www.figma.com/api/mcp/asset/34081ae6-9743-48f6-89b6-b8e08cae2713";
const imgIcon8 = "https://www.figma.com/api/mcp/asset/57585464-16e0-42a2-b3c9-898747cb85ef";

function Header({ isSidebarOpen, toggleSidebar }) {


  return (
    <header className={`header ${!isSidebarOpen ? 'header-centered' : ''}`}>
      <div className="header-left">
        {/* {!isSidebarOpen && (
          <button className="toggle-sidebar-button" onClick={toggleSidebar}>
            <img src={imgIcon} alt="Menu" className="icon" />
          </button>
        )} */}

        {/* this is logo */}
        <div className="header-logo">
          <img src="https://app.asktolearn.co/assets/img/log4.png" alt="Ask to Learn" className="logo-image" />
          <span className="logo-text">Ask to Learn</span>
        </div>

        {/* <button className="header-button logo">
          <span>Ask to Learn AI Tutor</span>
        </button> */}



      </div>

      <button className="user-button">
        <img src={imgIcon8} alt="User" />
      </button>
    </header>
  );
}

export default Header;
