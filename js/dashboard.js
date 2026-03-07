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
// WORKFLOW MASTER
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
// WAITING DAYS CALCULATOR
// =======================================

function calculateWaitingDays(date){

if(!date) return "-";

const diff = new Date() - new Date(date);

const days = Math.floor(diff/(1000*60*60*24));

if(days < 0) return "0 Days";

return days + " Days";

}


// =======================================
// DASHBOARD METRICS
// =======================================

async function loadDashboard(){

try{

const {data,error} = await supabaseClient
.from("equipment")
.select("*");

if(error){
console.error("Supabase error:",error);
return;
}

if(!data || data.length === 0){
console.log("No equipment data found");
return;
}

const totalEquipment = data.length;

const totalUnits =
[...new Set(data.map(e => e.unit || e.unit_id).filter(Boolean))].length;


// STATUS COUNTS

const shutdownCount =
data.filter(e => e.workflow_status !== "Closed").length;

const preClean =
data.filter(e => e.workflow_status === "Offered for Pre-Cleaning Inspection").length;

const postClean =
data.filter(e => e.workflow_status === "Offered for Post-Cleaning Inspection").length;

const ndt =
data.filter(e => e.workflow_status === "NDT Inspection").length;


// UPDATE KPI

setText("totalUnits", totalUnits);
setText("totalEquipment", totalEquipment);
setText("shutdownCount", shutdownCount);
setText("preCleanCount", preClean);
setText("postCleanCount", postClean);
setText("ndtPending", ndt);


// PROGRESS

calculateProgress(data);

}catch(err){

console.error("Dashboard Load Error:",err);

}

}


// =======================================
// SHUTDOWN PROGRESS BAR
// =======================================

function calculateProgress(data){

const total = data.length;

if(total === 0) return;

const completed =
data.filter(e =>
e.workflow_status === "Ready for Box-Up" ||
e.workflow_status === "Closed"
).length;

const percent =
Math.round((completed / total) * 100);

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
.select("*")
.order("tag_number",{ascending:true});

if(error){
console.error("Equipment load error:",error);
return;
}

const table =
document.getElementById("cduTableBody");

if(!table) return;

table.innerHTML="";

if(!data || data.length === 0){

table.innerHTML = `
<tr>
<td colspan="4">No Equipment Found</td>
</tr>
`;

return;

}

data.forEach(eq=>{

const status = eq.workflow_status || "Not Started";

const waiting = calculateWaitingDays(eq.shutdown_date);

const unit = eq.unit || eq.unit_id || "-";

const row = document.createElement("tr");

row.style.cursor = "pointer";


// ✅ FIXED NAVIGATION
row.onclick = function(){

openEquipment(eq.id);

};

row.innerHTML = `

<td>${eq.tag_number || "-"}</td>

<td>${status}</td>

<td>${waiting}</td>

<td>${unit}</td>

`;

table.appendChild(row);

});

}catch(err){

console.error("Equipment table error:",err);

}

}


// =======================================
// EQUIPMENT DETAILS PAGE
// =======================================

function openEquipment(id){

window.location.href =
"equipment-details.html?id=" + encodeURIComponent(id);

}


// =======================================
// ALERT SYSTEM
// =======================================

async function loadAlerts(){

try{

const {data,error} = await supabaseClient
.from("equipment")
.select("workflow_status,tag_number");

if(error){
console.error(error);
return;
}

const alertsBox =
document.getElementById("alertsContainer");

if(!alertsBox) return;

alertsBox.innerHTML = "";

const alertStatuses = [

"Observation Raised",
"Recommendation Issued",
"NDT Inspection",
"Maintenance Started"

];

alertStatuses.forEach(status=>{

const items =
data.filter(e=>e.workflow_status === status);

if(items.length > 0){

alertsBox.innerHTML += `

<div class="alert-item"
onclick="filterStatus('${status}')">

${status} (${items.length})

</div>

`;

}

});

}catch(err){

console.error("Alert error:",err);

}

}


// =======================================
// HELPER FUNCTION
// =======================================

function setText(id,value){

const el = document.getElementById(id);

if(el) el.innerText = value;

}


// =======================================
// RELOAD ALL DASHBOARD DATA
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
{
event:"*",
schema:"public",
table:"equipment"
},
(payload)=>{

console.log("Realtime update:",payload);

reloadAll()

})
.subscribe();


// =======================================
// PAGE LOAD
// =======================================

document.addEventListener("DOMContentLoaded",()=>{

console.log("Dashboard loaded");

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
