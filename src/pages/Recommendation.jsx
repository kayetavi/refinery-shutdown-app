import { useParams } from "react-router-dom";
import { useState } from "react";
import { addRecommendation } from "../services/recommendationService";

export default function Recommendation() {
  const { id } = useParams();
  const [observation, setObservation] = useState("");
  const [recommendation, setRecommendation] = useState("");

  async function submit() {
    await addRecommendation({
      shutdown_equipment_id: id,
      stage: "Pre",
      observation,
      recommendation
    });
    alert("Saved");
  }

  return (
    <div>
      <h2>Recommendation</h2>
      <textarea placeholder="Observation" onChange={e=>setObservation(e.target.value)} />
      <textarea placeholder="Recommendation" onChange={e=>setRecommendation(e.target.value)} />
      <button onClick={submit}>Submit</button>
    </div>
  );
}
