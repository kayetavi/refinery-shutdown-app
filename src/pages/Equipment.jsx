import { useEffect, useState } from "react";
import { getEquipment } from "../services/equipmentService";
import { Link } from "react-router-dom";

export default function Equipment() {
  const [list, setList] = useState([]);

  useEffect(() => {
    load();
  }, []);

  async function load() {
    const data = await getEquipment();
    setList(data || []);
  }

  return (
    <div>
      <h2>Equipment</h2>
      {list.map(item => (
        <div key={item.id}>
          {item.equipment?.technical_number} - {item.status}
          <Link to={`/recommendation/${item.id}`}> Inspect </Link>
        </div>
      ))}
    </div>
  );
}
