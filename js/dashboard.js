// =======================================
// 🔥 COMPLETE SHUTDOWN WORKFLOW SYSTEM
// =======================================

// 📌 MASTER STATUS FLOW
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


// =======================================
// 🧩 LOAD STATUS DROPDOWN
// =======================================
function loadStatusDropdown() {

  const select = document.getElementById("statusSelect");
  if (!select) return;

  select.innerHTML = '<option value="">Select Workflow Status</option>';

  STATUS_FLOW.forEach((status, index) => {
    const option = document.createElement("option");
    option.value = status;
    option.textContent = `${index + 1}. ${status}`;
    select.appendChild(option);
  });
}


// =======================================
// 🧩 LOAD EQUIPMENT LIST
// =======================================
async function loadEquipmentList() {

  const { data, error } = await supabase
    .from("equipment")
    .select("tag_number, workflow_status, shutdown_date")
    .order("tag_number", { ascending: true });

  if (error) {
    console.error(error);
    return;
  }

  const select = document.getElementById("equipmentSelect");
  if (!select) return;

  select.innerHTML = '<option value="">Select Equipment</option>';

  data.forEach(eq => {

    const waitingDays = eq.shutdown_date
      ? calculateWaitingDays(eq.shutdown_date)
      : "0 Days";

    const option = document.createElement("option");
    option.value = eq.tag_number;
    option.textContent =
      `${eq.tag_number} | ${eq.workflow_status || "Not Started"} | ${waitingDays}`;

    select.appendChild(option);
  });
}


// =======================================
// 📊 DASHBOARD COUNTERS + PROGRESS
// =======================================
async function loadDashboard() {

  const { data, error } = await supabase
    .from("equipment")
    .select("workflow_status");

  if (error) {
    console.error(error);
    return;
  }

  const total = data.length;

  const maintenance = data.filter(e =>
    e.workflow_status === "Maintenance Started").length;

  const preclean = data.filter(e =>
    e.workflow_status === "Offered for Pre-Cleaning Inspection").length;

  const postclean = data.filter(e =>
    e.workflow_status === "Offered for Post-Cleaning Inspection").length;

  const boxup = data.filter(e =>
    e.workflow_status === "Ready for Box-Up").length;

  document.getElementById("maintenanceCount").innerText = maintenance;
  document.getElementById("preCleanCount").innerText = preclean;
  document.getElementById("postCleanCount").innerText = postclean;
  document.getElementById("boxupCount").innerText = boxup;

  // 🔥 AUTO PROGRESS %
  const closed = data.filter(e =>
    e.workflow_status === "Closed").length;

  const percent = total === 0
    ? 0
    : Math.round((closed / total) * 100);

  const progressBar = document.querySelector(".progress-fill");

  if (progressBar) {
    progressBar.style.width = percent + "%";
    progressBar.innerText = percent + "%";
  }
}


// =======================================
// ⏳ WAITING DAYS CALCULATION
// =======================================
function calculateWaitingDays(shutdownDate) {

  const today = new Date();
  const shutDate = new Date(shutdownDate);

  const diffTime = today - shutDate;

  return Math.floor(diffTime / (1000 * 60 * 60 * 24)) + " Days";
}


// =======================================
// 🚀 MOVE NEXT STEP (STRICT SEQUENTIAL)
// =======================================
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

  const currentStatus = data.workflow_status || STATUS_FLOW[0];
  const currentIndex = STATUS_FLOW.indexOf(currentStatus);

  if (currentIndex === STATUS_FLOW.length - 1) {
    alert("Already Closed");
    return;
  }

  const nextStatus = STATUS_FLOW[currentIndex + 1];

  const { error: updateError } = await supabase
    .from("equipment")
    .update({
      workflow_status: nextStatus,
      workflow_step: currentIndex + 1,
      last_updated: new Date()
    })
    .eq("tag_number", equipNo);

  if (updateError) {
    alert("Update failed");
    return;
  }

  alert("Moved to: " + nextStatus);

  loadDashboard();
  loadEquipmentList();
}


// =======================================
// 🛠 MANUAL UPDATE (WITH CONTROL)
// =======================================
async function updateManually() {

  const equipNo = document.getElementById("equipmentSelect").value;
  const selectedStatus = document.getElementById("statusSelect").value;

  if (!equipNo || !selectedStatus) {
    alert("Select equipment and status");
    return;
  }

  const currentIndex = STATUS_FLOW.indexOf(selectedStatus);

  if (currentIndex === STATUS_FLOW.length - 1) {
    alert("Direct closing not allowed!");
    return;
  }

  const { error } = await supabase
    .from("equipment")
    .update({
      workflow_status: selectedStatus,
      workflow_step: currentIndex,
      last_updated: new Date()
    })
    .eq("tag_number", equipNo);

  if (error) {
    alert("Manual update failed");
    return;
  }

  alert("Status Updated to: " + selectedStatus);

  loadDashboard();
  loadEquipmentList();
}


// =======================================
// 🔴 REAL-TIME LISTENER
// =======================================
supabase
  .channel("equipment-live")
  .on(
    "postgres_changes",
    { event: "*", schema: "public", table: "equipment" },
    () => {
      loadDashboard();
      loadEquipmentList();
    }
  )
  .subscribe();


// =======================================
// 🔥 INITIAL LOAD
// =======================================
document.addEventListener("DOMContentLoaded", () => {
  loadDashboard();
  loadStatusDropdown();
  loadEquipmentList();
});
