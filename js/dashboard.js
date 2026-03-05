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

  const progressBar
