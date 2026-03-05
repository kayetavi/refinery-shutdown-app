import { Link } from "react-router-dom";

export default function Navbar() {
  return (
    <div className="navbar">
      <h3>Refinery Shutdown</h3>
      <Link to="/dashboard">Dashboard</Link>
      <Link to="/equipment">Equipment</Link>
    </div>
  );
}
