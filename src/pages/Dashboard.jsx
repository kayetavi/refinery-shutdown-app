import { useEffect, useState } from "react";
import AlertCard from "../components/AlertCard";
import { getShutdownCount } from "../services/shutdownService";

export default function Dashboard() {
  const [count, setCount] = useState(0);

  useEffect(() => {
    load();
  }, []);

  async function load() {
    const total = await getShutdownCount();
    setCount(total);
  }

  return (
    <div>
      <h2>Dashboard</h2>
      <AlertCard title="Total Equipment" count={count} />
    </div>
  );
}
