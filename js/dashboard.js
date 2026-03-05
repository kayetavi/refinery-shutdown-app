// =======================================
// REFINERY SHUTDOWN COMPLETE SYSTEM
// =======================================


// ================= WORKFLOW =================
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

if(diff < 0) return "0 Days";

return Math.floor(diff/(1000*60*60*24))+" Days";

}



// =======================================
// DASHBOARD METRICS
// =======================================
async function loadDashboard(){

const {data,error} = await supabaseClient
.from("equipment")
.select("unit_id,workflow_status");

if(error){
console.log("Dashboard Error",error);
return;
}

const totalEquipment = data.length;

const totalUnits =
[...new Set(data.map(e=>e.unit_id).filter(Boolean))].length;

const shutdownCount =
data.filter(e=>e.workflow_status!=="Closed").length;

const preClean =
data.filter(e=>e.workflow_status==="Offered for Pre-Cleaning Inspection").length;

const postClean =
data.filter(e=>e.workflow_status==="Offered for Post-Cleaning Inspection").length;

const ndt =
data.filter(e=>e.workflow_status==="NDT Inspection").length;



document.getElementById("totalUnits").innerText = totalUnits;
document.getElementById("totalEquipment").innerText = totalEquipment;
document.getElementById("shutdownCount").innerText = shutdownCount;
document.getElementById("preCleanCount").innerText = preClean;
document.getElementById("postCleanCount").innerText = postClean;
document.getElementById("ndtPending").innerText = ndt;



// progress

const completed =
data.filter(e =>
e.workflow_status==="Ready for Box-Up" ||
e.workflow_status==="Closed"
).length;

const percent =
totalEquipment===0 ? 0 :
Math.round((completed/totalEquipment)*100);

const bar = document.querySelector(".progress-fill");

if(bar){
bar.style.width = percent+"%";
bar.innerText = percent+"%";
}

}



// =======================================
// CDU EQUIPMENT TABLE
// =======================================
async function loadCDUTable(){

const {data,error} = await supabaseClient
.from("equipment")
.select("tag_number,workflow_status,shutdown_date")
.order("tag_number",{ascending:true});

const table = document.getElementById("cduTableBody");

table.innerHTML="";

if(error){
console.log("Table Error",error);
return;
}

data.forEach(eq=>{

table.innerHTML +=`

<tr onclick="openEquipmentDetails('${eq.tag_number}')">

<td>${eq.tag_number}</td>

<td>${eq.workflow_status || "Not Started"}</td>

<td>${calculateWaitingDays(eq.shutdown_date)}</td>

<td>${eq.workflow_status || "-"}</td>

</tr>

`;

});

}



// =======================================
// ALERT SYSTEM
// =======================================
async function loadAlerts(){

const {data,error} = await supabaseClient
.from("equipment")
.select("workflow_status");

const alertsBox = document.getElementById("alertsContainer");

alertsBox.innerHTML="";

if(error){
console.log(error);
return;
}

const alertStatuses = [

"Observation Raised",
"Recommendation Issued",
"NDT Inspection",
"Maintenance Started"

];

alertStatuses.forEach(status=>{

const count = data.filter(e=>e.workflow_status===status).length;

if(count>0){

alertsBox.innerHTML +=`

<div class="alert-item red">
${status} (${count})
</div>

`;

}

});

}



// =======================================
// PAGE NAVIGATION
// =======================================

function openUnits(){

window.location="units.html";

}

function openEquipment(){

window.location="equipment.html";

}

function filterEquipment(status){

window.location=`equipment.html?status=${status}`;

}

function openEquipmentDetails(tag){

window.location=`equipment-details.html?tag=${tag}`;

}



// =======================================
// REALTIME UPDATE
// =======================================

supabaseClient
.channel("equipment-live")
.on(
"postgres_changes",
{event:"*",schema:"public",table:"equipment"},
()=>{

loadDashboard();
loadCDUTable();
loadAlerts();

}
)
.subscribe();




// =======================================
// INIT
// =======================================

document.addEventListener("DOMContentLoaded",()=>{

loadDashboard();
loadCDUTable();
loadAlerts();

});
