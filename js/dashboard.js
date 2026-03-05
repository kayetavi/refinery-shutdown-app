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


// 🧩 Populate Workflow Dropdown
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


// 🧩 Load Equipment Dropdown
async function loadEquipmentList() {

  const { data, error } = await supabase
    .from("equipment")
    .select("tag_number, workflow_status")
    .order("tag_number", { ascending: true });

  if (error) {
    console.error("Error loading equipment:", error);
    return;
  }

  const select = document.getElementById("equipmentSelect");
  if (!select) return;

  select.innerHTML = '<option value="">Select Equipment</option>';

  data.forEach(eq => {
    const option = document.createElement("option");
    option.value = eq.tag_number;
    option.textContent = `${eq.tag_number} (${eq.workflow_status || "No Status"})`;
    select.appendChild(option);
  });
}


// 🔄 Show Current Status when Equipment Selected
document.addEventListener("change", async function (e) {

  if (e.target.id === "equipmentSelect") {

    const tag = e.target.value;
    if (!tag) return;

    const { data } = await supabase
      .from("equipment")
      .select("workflow_status")
      .eq("tag_number", tag)
      .single();

    document.getElementById("currentStatusDisplay")
      .innerText = "Current Status: " + (data.workflow_status || "Not Started");
  }
});


// 🔄 Load Dashboard Counters
async function loadDashboard() {

  const { data, error } = await supabase
    .from("equipment")
    .select("workflow_status");

  if (error) {
    console.error("Dashboard load error:", error);
    return;
  }

  document.getElementById("maintenanceCount").innerText =
    data.filter(e => e.workflow_status === "Maintenance Started").length;

  document.getElementById("preCleanCount").innerText =
    data.filter(e => e.workflow_status === "Offered for Pre-Cleaning Inspection").length;

  document.getElementById("postCleanCount").innerText =
    data.filter(e => e.workflow_status === "Offered for Post-Cleaning Inspection").length;

  document.getElementById("boxupCount").innerText =
    data.filter(e => e.workflow_status === "Ready for Box-Up").length;
}


// 🚀 MOVE TO NEXT STEP (Sequential Only)
async function moveNextStep() {

  const equipNo = document.getElementById("equipmentSelect").value;

  if (!equipNo) {
    alert("Select Equipment First");
    return;
  }

  const { data, error } = await supabase
    .from("equipment")
    .select("*")
    .eq("tag_number", equipNo)
    .single();

  if (error || !data) {
    alert("Equipment not found!");
    return;
  }

  let currentStatus = data.workflow_status || STATUS_FLOW[0];

  const currentIndex = STATUS_FLOW.indexOf(currentStatus);

  if (currentIndex === -1) {
    alert("Invalid workflow status");
    return;
  }

  if (currentIndex === STATUS_FLOW.length - 1) {
    alert("Equipment Already Closed");
    return;
  }

  const nextStatus = STATUS_FLOW[currentIndex + 1];

  const { error: updateError } = await supabase
    .from("equipment")
    .update({ workflow_status: nextStatus })
    .eq("tag_number", equipNo);

  if (updateError) {
    alert("Update failed");
    return;
  }

  alert("Moved to: " + nextStatus);

  loadDashboard();
  loadEquipmentList();
}


// 🛠 MANUAL UPDATE (Restricted)
async function updateManually() {

  const equipNo = document.getElementById("equipmentSelect").value;
  const selectedStatus = document.getElementById("statusSelect").value;

  if (!equipNo || !selectedStatus) {
    alert("Select equipment and status");
    return;
  }

  if (selectedStatus === "Closed") {
    alert("Direct closing not allowed!");
    return;
  }

  const { error } = await supabase
    .from("equipment")
    .update({ workflow_status: selectedStatus })
    .eq("tag_number", equipNo);

  if (error) {
    alert("Manual update failed");
    return;
  }

  alert("Status Updated to: " + selectedStatus);

  loadDashboard();
  loadEquipmentList();
}


// 🔴 REAL-TIME LISTENER
supabase
  .channel("equipment-changes")
  .on(
    "postgres_changes",
    { event: "*", schema: "public", table: "equipment" },
    () => {
      loadDashboard();
      loadEquipmentList();
    }
  )
  .subscribe();


// 🔥 INITIAL LOAD
loadDashboard();
loadStatusDropdown();
loadEquipmentList();
