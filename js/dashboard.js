async function loadDashboard() {
  const { data } = await supabase.from("equipment").select("*");

  document.getElementById("repairCount").innerText =
    data.filter(e => e.workflow_status === "Repair").length;

  document.getElementById("offerCount").innerText =
    data.filter(e => e.workflow_status === "Offered").length;
}

loadDashboard();
