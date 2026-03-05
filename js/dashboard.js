// =======================================
// 🔥 SUPABASE CONNECTION
// =======================================

const SUPABASE_URL = "https://lhktmcqjywduohrwsmzb.supabase.co";
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imxoa3RtY3FqeXdkdW9ocndzbXpiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzI2ODgzNzQsImV4cCI6MjA4ODI2NDM3NH0.JYT2qavvtwESRpJNTNmBmg9p78_u-lD8sjslnFaAZgQ";

const supabase = window.supabase.createClient(
  SUPABASE_URL,
  SUPABASE_KEY
);


// =======================================
// 🔥 COMPLETE REFINERY WORKFLOW
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
// ⏳ WAITING DAYS
// =======================================

function calculateWaitingDays(shutdownDate){

if(!shutdownDate) return "0 Days";

const today = new Date();
const shutDate = new Date(shutdownDate);

const diff = today - shutDate;

if(diff < 0) return "0 Days";

return Math.floor(diff/(1000*60*60*24))+" Days";

}


// =======================================
// 🧩 STATUS DROPDOWN
// =======================================

function loadStatusDropdown(){

const select = document.getElementById("statusSelect");

if(!select) return;

select.innerHTML=`<option value="">Select Workflow Status</option>`;

STATUS_FLOW.forEach((status,index)=>{

select.innerHTML += `

<option value="${status}">
${index+1}. ${status}
</option>

`;

});

}


// =======================================
// 🧩 EQUIPMENT DROPDOWN
// =======================================

async function loadEquipmentList(){

const {data,error} = await supabase
.from("equipment")
.select("tag_number,shutdown_date,workflow_status,unit_id")
.order("tag_number",{ascending:true});

if(error){

console.error("Equipment Load Error:",error);
return;

}

const select = document.getElementById("equipmentSelect");

if(!select) return;

select.innerHTML=`<option value="">Select Equipment</option>`;

data.forEach(eq=>{

const waiting = calculateWaitingDays(eq.shutdown_date);

select.innerHTML += `

<option value="${eq.tag_number}">
${eq.tag_number} | 
${eq.workflow_status || "Not Started"} | 
${waiting}
</option>

`;

});

}


// =======================================
// 📊 DASHBOARD METRICS
// =======================================

async function loadDashboard(){

const {data,error} = await supabase
.from("equipment")
.select("unit_id,workflow_status");

if(error){

console.error("Dashboard Error:",error);
return;

}

if(!data) return;

const totalEquipment = data.length;

const totalUnits =
[...new Set(data.map(e=>e.unit_id).filter(Boolean))].length;

const shutdownEquipment =
data.filter(e=>e.workflow_status!=="Closed").length;

const maintenance =
data.filter(e=>e.workflow_status==="Maintenance Started").length;

const preClean =
data.filter(e=>e.workflow_status==="Offered for Pre-Cleaning Inspection").length;

const postClean =
data.filter(e=>e.workflow_status==="Offered for Post-Cleaning Inspection").length;

const ndtPending =
data.filter(e=>e.workflow_status==="NDT Inspection").length;


// ===== UPDATE DASHBOARD =====

setText("totalEquipment",totalEquipment);
setText("totalUnits",totalUnits);
setText("shutdownCount",shutdownEquipment);
setText("maintenanceCount",maintenance);
setText("preCleanCount",preClean);
setText("postCleanCount",postClean);
setText("ndtPending",ndtPending);

calculateProgress(data);

}


// =======================================
// 📊 PROGRESS BAR
// =======================================

function calculateProgress(data){

const total = data.length;

const completed =
data.filter(e=>
e.workflow_status==="Ready for Box-Up" ||
e.workflow_status==="Closed"
).length;

const percent =
total===0 ? 0 :
Math.round((completed/total)*100);

const bar = document.querySelector(".progress-fill");

if(bar){

bar.style.width = percent+"%";
bar.innerText = percent+"%";

}

}


// =======================================
// 🚀 MOVE NEXT STEP
// =======================================

async function moveNextStep(){

const equipNo =
document.getElementById("equipmentSelect")?.value;

if(!equipNo){

alert("Select Equipment First");
return;

}

const {data,error} = await supabase
.from("equipment")
.select("*")
.eq("tag_number",equipNo)
.single();

if(error || !data){

alert("Equipment Not Found");
return;

}

const current =
data.workflow_status || STATUS_FLOW[0];

const index =
STATUS_FLOW.indexOf(current);

if(index===-1){

alert("Invalid Workflow Status");
return;

}

if(index===STATUS_FLOW.length-1){

alert("Equipment Already Closed");
return;

}

const nextStatus = STATUS_FLOW[index+1];

const {error:updateError} = await supabase
.from("equipment")
.update({

workflow_status:nextStatus,
workflow_step:index+1,
last_updated:new Date()

})
.eq("tag_number",equipNo);

if(updateError){

alert("Update Failed");
return;

}

alert("Moved to: "+nextStatus);

reloadAll();

}


// =======================================
// 🛠 MANUAL UPDATE
// =======================================

async function updateManually(){

const equipNo =
document.getElementById("equipmentSelect")?.value;

const selected =
document.getElementById("statusSelect")?.value;

if(!equipNo || !selected){

alert("Select Equipment & Status");
return;

}

if(selected==="Closed"){

alert("Direct Close Not Allowed");
return;

}

const stepIndex =
STATUS_FLOW.indexOf(selected);

const {error} = await supabase
.from("equipment")
.update({

workflow_status:selected,
workflow_step:stepIndex,
last_updated:new Date()

})
.eq("tag_number",equipNo);

if(error){

alert("Manual Update Failed");
return;

}

alert("Status Updated");

reloadAll();

}


// =======================================
// 🔁 HELPERS
// =======================================

function setText(id,value){

const el=document.getElementById(id);

if(el) el.innerText=value;

}

function reloadAll(){

loadDashboard();
loadEquipmentList();

}


// =======================================
// 🔴 REALTIME AUTO REFRESH
// =======================================

supabase
.channel("equipment-live")

.on(
"postgres_changes",
{event:"*",schema:"public",table:"equipment"},
payload=>{

console.log("Realtime update:",payload);

reloadAll();

}
)

.subscribe();


// =======================================
// 🚀 INITIAL LOAD
// =======================================

document.addEventListener("DOMContentLoaded",()=>{

loadDashboard();
loadStatusDropdown();
loadEquipmentList();

});
