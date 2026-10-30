function StatCard({ title, value, description, icon, color }) {
  return (
    <div className="stat-card">
      <div className="stat-top">
        <span>{title}</span>
        <span className={`stat-icon ${color}`}>{icon}</span>
      </div>

      <h3>{value}</h3>
      <p>{description}</p>
    </div>
  );
}

export default StatCard;