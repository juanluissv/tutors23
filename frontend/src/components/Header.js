import React from 'react';

// Icon URLs from Figma
const imgIcon = "https://www.figma.com/api/mcp/asset/b8cf5fd6-92d5-4c99-b108-f60d194c46cb";
const imgIcon7 = "https://www.figma.com/api/mcp/asset/af161c66-380d-444e-9482-9a285977b7fd";
const imgIcon8 = "https://www.figma.com/api/mcp/asset/d1ac8988-06bf-4483-ab30-0c3739cf1742";

function Header({ isSidebarOpen, toggleSidebar }) {

  console.log(isSidebarOpen);

  return (
    <header className={`header ${!isSidebarOpen ? 'header-centered' : ''}`}>
      <div className="header-left">
        {!isSidebarOpen && (
          <button className="toggle-sidebar-button" onClick={toggleSidebar}>
            <img src={imgIcon} alt="Menu" className="icon" />
          </button>
        )}
        <button className="header-button">
          <span>Ask to Learn AI Tutor</span>
          {/* <img src={imgIcon7} alt="Dropdown" /> */}
        </button>
      </div>
      <button className="user-button">
        <img src={imgIcon8} alt="User" />
      </button>
    </header>
  );
}

export default Header;
