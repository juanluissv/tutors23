import React from 'react';

// Icon URLs from Figma
const imgIcon = "https://www.figma.com/api/mcp/asset/b8cf5fd6-92d5-4c99-b108-f60d194c46cb";
const imgIcon1 = "https://www.figma.com/api/mcp/asset/d221d14f-259e-4419-a2ee-e0627fc41d53";
const imgIcon2 = "https://www.figma.com/api/mcp/asset/6d793fc1-7508-4bad-934b-4ccdbaf5fb95";
const imgIcon3 = "https://www.figma.com/api/mcp/asset/8db0f81f-e57d-4df6-b574-bdbbebb78fb9";
const imgIcon4 = "https://www.figma.com/api/mcp/asset/2b4a1e98-3d18-4211-9bcc-e9b795b24444";
const imgIcon5 = "https://www.figma.com/api/mcp/asset/5a2fab9e-f622-4d48-b32c-2ea77aaa4049";
const imgIcon6 = "https://www.figma.com/api/mcp/asset/f1fd38f0-abee-4ff0-a78a-bfe485366c42";

function Sidebar() {
  return (
    <div className="sidebar">
      <div className="sidebar-header">
        <button className="menu-button">
          <img src={imgIcon} alt="Menu" className="icon" />
        </button>
      </div>

      <div className="sidebar-content">
        <nav className="navigation">
          <button className="nav-button">
            <img src={imgIcon1} alt="" />
            <span>New chat</span>
          </button>
          <button className="nav-button">
            <img src={imgIcon2} alt="" />
            <span>Search chats</span>
          </button>
          <button className="nav-button">
            <img src={imgIcon3} alt="" />
            <span>Images</span>
          </button>
          <button className="nav-button">
            <img src={imgIcon4} alt="" />
            <span>Apps</span>
          </button>
          <button className="nav-button">
            <img src={imgIcon5} alt="" />
            <span>Codex</span>
          </button>
          <button className="nav-button">
            <img src={imgIcon6} alt="" />
            <span>Projects</span>
          </button>
        </nav>

        <h3 className="section-heading">Your chats</h3>
      </div>
    </div>
  );
}

export default Sidebar;
