function Header({ activePage }) {
  return (
    <header className="topbar">
      <div>
        <span className="breadcrumb">Workspace / </span>
        <strong>{activePage}</strong>
      </div>

      <div className="topbar-right">
        <span className="online-dot"></span>
        <span>Prototype mode</span>
        <span className="top-avatar">AD</span>
      </div>
    </header>
  );
}

export default Header;