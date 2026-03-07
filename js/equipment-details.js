const supabaseUrl = "https://lhktmcqjywduohrwsmzb.supabase.co";
const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imxoa3RtY3FqeXdkdW9ocndzbXpiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzI2ODgzNzQsImV4cCI6MjA4ODI";

const supabase = window.supabase.createClient(supabaseUrl, supabaseKey);

// URL se equipment id lena
const urlParams = new URLSearchParams(window.location.search);
const equipmentId = urlParams.get("id");

console.log("Equipment ID:", equipmentId);

// page load
if(equipmentId){
loadEquipment();
}else{
alert("Equipment ID not found in URL");
}


// LOAD EQUIPMENT
async function loadEquipment(){

const { data, error } = await supabase
.from("equipment")
.select("*")
.eq("id", equipmentId)
.single();

if(error){
console.log("Equipment Load Error:", error);
return;
}

document.getElementById("tagNumber").innerText = data.tag_number || "";
document.getElementById("unit").innerText = data.unit || "";
document.getElementById("status").innerText = data.workflow_status || "";
document.getElementById("shutdownDate").innerText = data.shutdown_date || "";

highlightTimeline(data.workflow_status);

loadObservation();
loadRecommendation();

}


// UPDATE STATUS
async function updateStatus(){

let status = document.getElementById("statusSelect").value;

const { error } = await supabase
.from("equipment")
.update({ workflow_status: status })
.eq("id", equipmentId);

if(error){
console.log("Status Update Error:", error);
alert("Status update failed");
return;
}

alert("Status Updated");

loadEquipment();

}


// TIMELINE HIGHLIGHT
function highlightTimeline(currentStatus){

let steps = document.querySelectorAll(".timeline-step");

steps.forEach(step=>{

step.classList.remove("active");

if(step.innerText.trim() === currentStatus){
step.classList.add("active");
}

});

}


// SAVE OBSERVATION
async function saveObservation(){

let text = document.getElementById("observationText").value;

if(!text){
alert("Write Observation");
return;
}

const { error } = await supabase
.from("observation")
.insert([
{
equipment_id: equipmentId,
observation: text
}
]);

if(error){
console.log("Observation Save Error:", error);
alert("Save Failed");
return;
}

document.getElementById("observationText").value="";

loadObservation();

}


// LOAD OBSERVATION
async function loadObservation(){

const { data, error } = await supabase
.from("observation")
.select("*")
.eq("equipment_id", equipmentId)
.order("created_at",{ascending:false});

let table = document.getElementById("observationHistory");

table.innerHTML="";

if(error){
console.log("Observation Load Error:", error);
return;
}

if(!data || data.length==0){
table.innerHTML="<tr><td colspan='2'>No Observation</td></tr>";
return;
}

data.forEach(row=>{

let tr=document.createElement("tr");

tr.innerHTML=
`<td>${row.created_at.substring(0,10)}</td>
<td>${row.observation}</td>`;

table.appendChild(tr);

});

}


// SAVE RECOMMENDATION
async function saveRecommendation(){

let text = document.getElementById("recommendationText").value;

if(!text){
alert("Write Recommendation");
return;
}

const { error } = await supabase
.from("recommendations")
.insert([
{
equipment_id: equipmentId,
recommendation: text
}
]);

if(error){
console.log("Recommendation Save Error:", error);
alert("Save Failed");
return;
}

document.getElementById("recommendationText").value="";

loadRecommendation();

}


// LOAD RECOMMENDATION
async function loadRecommendation(){

const { data, error } = await supabase
.from("recommendations")
.select("*")
.eq("equipment_id", equipmentId)
.order("created_at",{ascending:false});

let table = document.getElementById("recommendationHistory");

table.innerHTML="";

if(error){
console.log("Recommendation Load Error:", error);
return;
}

if(!data || data.length==0){
table.innerHTML="<tr><td colspan='2'>No Recommendation</td></tr>";
return;
}

data.forEach(row=>{

let tr=document.createElement("tr");

tr.innerHTML=
`<td>${row.created_at.substring(0,10)}</td>
<td>${row.recommendation}</td>`;

table.appendChild(tr);

});

}
