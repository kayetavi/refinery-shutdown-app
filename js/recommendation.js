async function addRecommendation(equipment_id) {
  const observation = document.getElementById("observation").value;
  const recommendation = document.getElementById("recommendation").value;

  await supabase.from("recommendations").insert([
    { equipment_id, observation, recommendation }
  ]);

  alert("Recommendation Added");
}
