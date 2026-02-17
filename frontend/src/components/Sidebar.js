import React from 'react';
import { Link, useLocation } from 'react-router-dom'

// Icon URLs from Figma
const imgIcon = "https://www.figma.com/api/mcp/asset/0af1f7fd-f3b0-447c-85f2-11ecd9f8aa71";
const imgIcon1 = "https://www.figma.com/api/mcp/asset/72f23316-e1e2-4362-934d-a609aad86bdd";
const imgIcon2 = "https://www.figma.com/api/mcp/asset/89e3ab0c-527d-47d6-83c5-a3ae02fe3d06";
const imgIcon3 = "https://www.figma.com/api/mcp/asset/507bab4e-5164-4c9b-bb12-e263e9926c63";
const imgIcon4 = "https://www.figma.com/api/mcp/asset/4d054f7a-b61c-4036-a0c1-521fc8343796";
const imgIcon5 = "https://www.figma.com/api/mcp/asset/c3f70b4f-39b0-4f63-9e56-d912a8ab7cbe";
const imgIcon6 = "https://www.figma.com/api/mcp/asset/e8c2d8c3-6bc0-4958-b4aa-91805be6e734";

function Sidebar({ isOpen, toggleSidebar }) {
  const location = useLocation();
  
  return (
    <div className={`sidebar ${isOpen ? 'sidebar-open' : 'sidebar-closed'}`}>
      <div className="sidebar-header">
        <button className="menu-button" onClick={toggleSidebar}>
          <img src={imgIcon} alt="Menu" className="icon" />
        </button>
      </div>

      <div className="sidebar-content">
        <nav className="navigation">
          <button className="nav-button">
            <img src={imgIcon1} alt="" />
            <span>New Tutor</span>
          </button>
          <button className="nav-button">
            <img src={imgIcon5} alt="" />
            <span>Ask your Teacher</span>
          </button>
          {/* <button className="nav-button">
            <img src={imgIcon3} alt="" />
            <span>Images</span>
          </button>
          <button className="nav-button">
            <img src={imgIcon4} alt="" />
            <span>Apps</span>
          </button> */}
          <button className="nav-button">
            <img src={imgIcon6} alt="" />
            <span>Subjects</span>            
          </button>
          {/* <button className="nav-button">
            <img src={imgIcon6} alt="" />
            <span>Projects</span>
          </button> */}

          
        </nav>

        <h3 className="section-heading">Your Subjects</h3>

        <Link to="/subjects/langchain-docs" className="nav-button-link">
        <button className={`nav-button ${location.pathname === '/subjects/langchain-docs' ? 'menu2' : ''}`}>
          &nbsp; - Warren Buffett <br /> &nbsp; &nbsp; Shareholder Report
          </button>
          <a href="https://www.berkshirehathaway.com/letters/2023ltr.pdf" target="_blank" className="navButton22  ">
            Report Link
          </a> <br /><br />
          </Link>

          <Link to="/subjects/ciencias1" className="nav-button-link">
          <button className={`nav-button ${location.pathname === '/subjects/ciencias1' ? 'menu2' : ''}`}>
          &nbsp; - Ciencia y Tecnología <br /> &nbsp; &nbsp;  1 año bachillerato El Salvador
          </button>
          <a href="https://www.mined.gob.sv/materiales/2026/CIENCIA_Y_TECNOLOGIA/2.%20Libros%20de%20texto/Libro%20de%20texto%201.%C2%B0%20a%C3%B1o%20de%20bachillerato.pdf" target="_blank" className="navButton22  ">
            Book Link
          </a>
          </Link>


      </div>
    </div>
  );
}

export default Sidebar;
