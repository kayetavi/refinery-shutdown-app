async function submitNDT(equipment_id) {
  const ndt_type = document.getElementById("ndtType").value;
  const observation = document.getElementById("ndtObservation").value;
  const result = document.getElementById("ndtResult").value;

  await supabase.from("ndt_reports").insert([
    { equipment_id, ndt_type, observation, result }
  ]);

  if (result === "Defect Found") {
    await updateStatus(equipment_id, "Repair");
  } else {
    await updateStatus(equipment_id, "BoxUp");
  }
}
