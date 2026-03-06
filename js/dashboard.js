// =======================================
// 🔥 SUPABASE CONNECTION
// =======================================

const SUPABASE_URL = "https://lhktmcqjywduohrwsmzb.supabase.co";

const SUPABASE_KEY =
"eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imxoa3RtY3FqeXdkdW9ocndzbXpiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzI2ODgzNzQsImV4cCI6MjA4ODI2NDM3NH0.JYT2qavvtwESRpJNTNmBmg9p78_u-lD8sjslnFaAZgQ";

const supabaseClient = supabase.createClient(
  SUPABASE_URL,
  SUPABASE_KEY
);


// =======================================
// MASTER WORKFLOW
// =======================================

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
// WAITING DAYS
// =======================================

function calculateWaitingDays(date){

if(!date) return "0 Days";

const diff = new Date() - new Date(date);

return Math.floor(diff/(1000*60*60*24)) + " Days";

}


// =======================================
// DASHBOARD METRICS
// =======================================

async function loadDashboard(){

try{

const {data,error} = await supabaseClient
.from("equipment")
.select("unit_id,workflow_status");

if(error) throw error;

if(!data) return;

const totalEquipment = data.length;

const totalUnits =
[...new Set(data.map(e=>e.unit_id).filter(Boolean))].length;

const shutdownCount =
data.filter(e=>e.workflow_status !== "Closed").length;

const preClean =
data.filter(e=>e.workflow_status === "Offered for Pre-Cleaning Inspection").length;

const postClean =
data.filter(e=>e.workflow_status === "Offered for Post-Cleaning Inspection").length;

const ndt =
data.filter(e=>e.workflow_status === "NDT Inspection").length;


setText("totalUnits", totalUnits);
setText("totalEquipment", totalEquipment);
setText("shutdownCount", shutdownCount);
setText("preCleanCount", preClean);
setText("postCleanCount", postClean);
setText("ndtPending", ndt);

calculateProgress(data);

}catch(err){

console.error("Dashboard Error:", err);

}

}


// =======================================
// PROGRESS BAR
// =======================================

function calculateProgress(data){

const total = data.length;

const completed =
data.filter(e =>
e.workflow_status === "Ready for Box-Up" ||
e.workflow_status === "Closed"
).length;

const percent =
total === 0 ? 0 :
Math.round((completed/total)*100);

const bar =
document.getElementById("progressFill");

if(bar){

bar.style.width = percent + "%";
bar.innerText = percent + "%";

}

}


// =======================================
// EQUIPMENT TABLE
// =======================================

async function loadEquipmentTable(){

try{

const {data,error} = await supabaseClient
.from("equipment")
.select("tag_number,workflow_status,shutdown_date,unit_id")
.order("tag_number",{ascending:true});

if(error) throw error;

const table =
document.getElementById("cduTableBody");

if(!table) return;

table.innerHTML="";

if(!data || data.length===0){

table.innerHTML=`
<tr>
<td colspan="4">No Equipment Found</td>
</tr>`;

return;

}

data.forEach(eq=>{

table.innerHTML+=`

<tr onclick="openEquipment('${eq.tag_number}')" style="cursor:pointer">

<td>${eq.tag_number}</td>

<td>${eq.workflow_status || "Not Started"}</td>

<td>${calculateWaitingDays(eq.shutdown_date)}</td>

<td>${eq.workflow_status || "-"}</td>

</tr>

`;

});

}catch(err){

console.error("Equipment Load Error:", err);

}

}


// =======================================
// OPEN EQUIPMENT DETAILS
// =======================================

function openEquipment(tag){

window.location.href =
"equipment-details.html?tag=" + encodeURIComponent(tag);

}


// =======================================
// ALERT SYSTEM
// =======================================

async function loadAlerts(){

try{

const {data,error} = await supabaseClient
.from("equipment")
.select("workflow_status");

if(error) throw error;

const alertsBox =
document.getElementById("alertsContainer");

if(!alertsBox) return;

alertsBox.innerHTML="";

const alertStatuses=[

"Observation Raised",
"Recommendation Issued",
"NDT Inspection",
"Maintenance Started"

];

alertStatuses.forEach(status=>{

const count =
data.filter(e=>e.workflow_status===status).length;

if(count>0){

alertsBox.innerHTML+=`

<div class="alert-item">

${status} (${count})

</div>

`;

}

});

}catch(err){

console.error("Alert Error:", err);

}

}


// =======================================
// HELPER
// =======================================

function setText(id,value){

const el = document.getElementById(id);

if(el) el.innerText = value;

}


// =======================================
// RELOAD ALL DATA
// =======================================

function reloadAll(){

loadDashboard();
loadEquipmentTable();
loadAlerts();

}


// =======================================
// REALTIME UPDATE
// =======================================

supabaseClient
.channel("equipment-live")
.on(
"postgres_changes",
{event:"*",schema:"public",table:"equipment"},
(payload)=>{

console.log("Realtime update:",payload);

reloadAll();

})
.subscribe();


// =======================================
// PAGE LOAD
// =======================================

document.addEventListener("DOMContentLoaded",()=>{

reloadAll();

});


// =======================================
// CARD NAVIGATION
// =======================================

function goToUnits(){

window.location.href = "units.html";

}

function goToEquipment(){

window.location.href = "equipment.html";

}

function filterStatus(status){

window.location.href =
"equipment.html?status=" + encodeURIComponent(status);

}
