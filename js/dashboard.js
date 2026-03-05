// 🔄 Load Dashboard Data
async function loadDashboard() {

  const { data, error } = await supabase
    .from("equipment")
    .select("*");

  if (error) {
    console.error("Error loading dashboard:", error);
    return;
  }

  // Maintenance Started Count
  document.getElementById("maintenanceCount").innerText =
    data.filter(e => e.workflow_status === "Maintenance Started").length;

  // Pre-Cleaning Pending
  document.getElementById("preCleanCount").innerText =
    data.filter(e => e.workflow_status === "Offered for Pre-Cleaning Inspection").length;

  // Post-Cleaning Pending
  document.getElementById("postCleanCount").innerText =
    data.filter(e => e.workflow_status === "Offered for Post-Cleaning Inspection").length;

  // Ready for Box-Up
  document.getElementById("boxupCount").innerText =
    data.filter(e => e.workflow_status === "Ready for Box-Up").length;
}


// 🔁 Auto Refresh every 10 seconds
setInterval(loadDashboard, 10000);

// First Load
loadDashboard();
