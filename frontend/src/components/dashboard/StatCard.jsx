const StatCard = ({ label, value }) => (
  <article className="card stat-card">
    <p className="muted">{label}</p>
    <h3>{value}</h3>
  </article>
);

export default StatCard;
