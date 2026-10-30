const menuItems = [
  { name: "Dashboard", icon: "▦" },
  { name: "FDR Management", icon: "▤" },
  { name: "Institutions", icon: "🏛" },
  { name: "Documents", icon: "▧" },
  { name: "Verification", icon: "✓" },
  { name: "Maturity Alerts", icon: "◷" },
  { name: "Renewal & Release", icon: "↻" },
  { name: "Reports", icon: "▥" },
];

function Sidebar({ activePage, setActivePage }) {
  return (
    <aside className="sidebar">
      <div className="brand">
        <div className="brand-logo">SD</div>
        <div>
          <h1>SecureDeposit</h1>
          <p>AICTE PORTAL</p>
        </div>
      </div>

      <div className="side-label">WORKSPACE</div>

      <nav>
        {menuItems.map((item) => (
          <button
            key={item.name}
            className={`nav-item ${activePage === item.name ? "active" : ""}`}
            onClick={() => setActivePage(item.name)}
          >
            <span className="nav-icon">{item.icon}</span>
            {item.name}
          </button>
        ))}
      </nav>

      <div className="sidebar-bottom">
        <div className="user-avatar">AD</div>
        <div>
          <strong>Portal Administrator</strong>
          <p>Demo account</p>
        </div>
      </div>
    </aside>
  );
}

export default Sidebar;