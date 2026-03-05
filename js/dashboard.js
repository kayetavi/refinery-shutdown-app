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


// 🧩 Populate Dropdown
function loadStatusDropdown() {

  const select = document.getElementById("statusSelect");

  if (!select) return;

  select.innerHTML = '<option value="">Select Workflow Status</option>';

  STATUS_FLOW.forEach(status => {
    const option = document.createElement("option");
    option.value = status;
    option.textContent = status;
    select.appendChild(option);
  });
}


// 🔄 Load Dashboard Data
async function loadDashboard() {

  const { data, error } = await supabase
    .from("equipment")
    .select("*");

  if (error) {
    console.error("Error loading dashboard:", error);
    return;
  }

  if (!data) return;

  document.getElementById("maintenanceCount").innerText =
    data.filter(e => e.workflow_status === "Maintenance Started").length;

  document.getElementById("preCleanCount").innerText =
    data.filter(e => e.workflow_status === "Offered for Pre-Cleaning Inspection").length;

  document.getElementById("postCleanCount").innerText =
    data.filter(e => e.workflow_status === "Offered for Post-Cleaning Inspection").length;

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
    .eq("tag_number", equipNo);

  if (error) {
    alert("Database error!");
    console.error(error);
    return;
  }

  if (!data || data.length === 0) {
    alert("Equipment not found!");
    return;
  }

  const equipment = data[0];

  let currentStatus = equipment.workflow_status;

  // ✅ If null, start from first stage
  if (!currentStatus) {
    currentStatus = STATUS_FLOW[0];
  }

  const currentIndex = STATUS_FLOW.indexOf(currentStatus);

  if (currentIndex === -1) {
    alert("Invalid workflow status in database");
    return;
  }

  if (currentIndex === STATUS_FLOW.length - 1) {
    alert("Equipment Already Closed!");
    return;
  }

  const nextStatus = STATUS_FLOW[currentIndex + 1];

  const { error: updateError } = await supabase
    .from("equipment")
    .update({ workflow_status: nextStatus })
    .eq("tag_number", equipNo);

  if (updateError) {
    alert("Update failed!");
    console.error(updateError);
    return;
  }

  alert("Moved to: " + nextStatus);

  document.getElementById("equipNo").value = "";

  loadDashboard();
}


// 🛠 MANUAL UPDATE FUNCTION
async function updateManually() {

  const equipNo = document.getElementById("equipNo").value.trim();
  const selectedStatus = document.getElementById("statusSelect").value;

  if (!equipNo || !selectedStatus) {
    alert("Enter Equipment Number and Select Status");
    return;
  }

  const { error } = await supabase
    .from("equipment")
    .update({ workflow_status: selectedStatus })
    .eq("tag_number", equipNo);

  if (error) {
    alert("Manual update failed!");
    console.error(error);
    return;
  }

  alert("Status Updated to: " + selectedStatus);

  document.getElementById("equipNo").value = "";
  document.getElementById("statusSelect").value = "";

  loadDashboard();
}


// 🔴 REAL TIME LISTENER (PROFESSIONAL)
supabase
  .channel('equipment-changes')
  .on(
    'postgres_changes',
    {
      event: '*',
      schema: 'public',
      table: 'equipment'
    },
    (payload) => {
      console.log("Realtime Change:", payload);
      loadDashboard();
    }
  )
  .subscribe();


// 🔥 Initial Load
loadDashboard();
loadStatusDropdown();
