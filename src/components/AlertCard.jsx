export default function AlertCard({ title, count }) {
  return (
    <div className="card">
      <h4>{title}</h4>
      <h2>{count}</h2>
    </div>
  );
}
