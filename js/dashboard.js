 // 🔥 FULL WORKFLOW FLOW
const STATUS_FLOW = [
  "Shutdown Completed",
  "Handed Over to Maintenance",
  "Maintenance Started",
  "Offered for Pre-Cleaning Inspection",
  "Observation Raised",
  "Recommendation Issued",
  "Recommendation Attended",
  "Offered for Post-Cleaning Inspection",
  "NDT Inspection",
  "Ready for Box-Up",
  "Closed"
];


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


// 🚀 MOVE EQUIPMENT TO NEXT STEP
async function moveNextStep() {

  const equipNo = document.getElementById("equipNo").value.trim();

  if (!equipNo) {
    alert("Enter Equipment Number");
    return;
  }

  const { data, error } = await supabase
    .from("equipment")
    .select("*")
    .eq("equipment_no", equipNo)
    .single();

  if (error || !data) {
    alert("Equipment not found!");
    return;
  }

  const currentIndex = STATUS_FLOW.indexOf(data.workflow_status);

  if (currentIndex === -1) {
    alert("Invalid workflow status in database");
    return;
  }

  if (currentIndex === STATUS_FLOW.length - 1) {
    alert("Equipment Already Closed!");
    return;
  }

  const nextStatus = STATUS_FLOW[currentIndex + 1];

  const { updateError } = await supabase
    .from("equipment")
    .update({ workflow_status: nextStatus })
    .eq("equipment_no", equipNo);

  if (updateError) {
    alert("Update failed!");
    return;
  }

  alert("Moved to: " + nextStatus);

  loadDashboard();
}


// 🔁 Auto Refresh every 10 seconds
setInterval(loadDashboard, 10000);

// First Load
loadDashboard();
