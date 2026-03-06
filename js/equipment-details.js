/* ================= SUPABASE CONNECTION ================= */

const supabaseUrl = "https://lhktmcqjywduohrwsmzb.supabase.co";
const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imxoa3RtY3FqeXdkdW9ocndzbXpiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzI2ODgzNzQsImV4cCI6MjA4ODI2NDM3NH0.JYT2qavvtwESRpJNTNmBmg9p78_u-lD8sjslnFaAZgQ";

const supabase = window.supabase.createClient(supabaseUrl, supabaseKey);


/* ================= GET TAG FROM URL ================= */

const urlParams = new URLSearchParams(window.location.search);
const tag = urlParams.get("tag");

let equipmentId = null;


/* ================= PAGE INIT ================= */

document.addEventListener("DOMContentLoaded", () => {

if(!tag){

alert("No Equipment Tag Found in URL");

return;

}

loadEquipment();

});


/* ================= LOAD EQUIPMENT ================= */

async function loadEquipment(){

console.log("Loading equipment for tag:", tag);

const { data, error } = await supabase
.from("equipment")
.select("*")
.eq("tag_number", tag)
.single();

if(error){

console.error("Equipment Load Error:", error);

alert("Equipment not found");

return;

}

equipmentId = data.id;

document.getElementById("tagNumber").innerText = data.tag_number || "-";
  document.getElementById("unit").innerText = data.unit || "-";
document.getElementById("status").innerText = data.workflow_status || "-";
document.getElementById("shutdownDate").innerText = data.shutdown_date || "-";

updateTimeline(data.workflow_status);

loadHistory();

}


/* ================= TIMELINE UPDATE ================= */

function updateTimeline(status){

const steps = document.querySelectorAll(".timeline-step");

const workflow = [

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

const currentIndex = workflow.indexOf(status);

steps.forEach((step,index)=>{

step.classList.remove("active");

if(index <= currentIndex){
step.classList.add("active");
}

});

}


/* ================= UPDATE STATUS ================= */

async function updateStatus(){

if(!equipmentId){

alert("Equipment not loaded");

return;

}

const newStatus = document.getElementById("statusSelect").value;

if(!newStatus){

alert("Select Status");

return;

}

const { error } = await supabase
.from("equipment")
.update({
workflow_status: newStatus
})
.eq("id", equipmentId);

if(error){

console.error("Status Update Error:", error);

alert("Update failed");

}else{

alert("Status Updated Successfully");

document.getElementById("status").innerText = newStatus;

updateTimeline(newStatus);

}

}


/* ================= LOAD HISTORY ================= */

async function loadHistory(){

if(!equipmentId){
return;
}

const { data, error } = await supabase
.from("recommendations")
.select("*")
.eq("equipment_id", equipmentId)
.order("created_at",{ascending:false});

if(error){

console.error("History Load Error:", error);

return;

}

const obsTable = document.getElementById("observationHistory");
const recTable = document.getElementById("recommendationHistory");

obsTable.innerHTML="";
recTable.innerHTML="";

data.forEach(item=>{

const row = `
<tr>
<td>${new Date(item.created_at).toLocaleDateString()}</td>
<td>${item.text}</td>
</tr>
`;

if(item.type==="observation"){
obsTable.innerHTML += row;
}

if(item.type==="recommendation"){
recTable.innerHTML += row;
}

});

}


/* ================= SAVE OBSERVATION ================= */

async function saveObservation(){

if(!equipmentId){

alert("Equipment not loaded");

return;

}

const text = document.getElementById("observationText").value.trim();

if(text === ""){

alert("Enter observation");

return;

}

const { error } = await supabase
.from("recommendations")
.insert({
equipment_id: equipmentId,
type:"observation",
text:text
});

if(error){

console.error("Observation Save Error:", error);

alert("Error saving observation");

return;

}

alert("Observation Saved");

document.getElementById("observationText").value="";

loadHistory();

}


/* ================= SAVE RECOMMENDATION ================= */

async function saveRecommendation(){

if(!equipmentId){

alert("Equipment not loaded");

return;

}

const text = document.getElementById("recommendationText").value.trim();

if(text === ""){

alert("Enter recommendation");

return;

}

const { error } = await supabase
.from("recommendations")
.insert({
equipment_id: equipmentId,
type:"recommendation",
text:text
});

if(error){

console.error("Recommendation Save Error:", error);

alert("Error saving recommendation");

return;

}

alert("Recommendation Saved");

document.getElementById("recommendationText").value="";

loadHistory();

}
