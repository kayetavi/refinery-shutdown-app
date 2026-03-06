
/* ================= SUPABASE CONNECTION ================= */

const supabaseUrl = "https://YOUR_PROJECT_ID.supabase.co";
const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imxoa3RtY3FqeXdkdW9ocndzbXpiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzI2ODgzNzQsImV4cCI6MjA4ODI2NDM3NH0.JYT2qavvtwESRpJNTNmBmg9p78_u-lD8sjslnFaAZgQ";

const supabase = window.supabase.createClient(supabaseUrl, supabaseKey);


/* ================= GET TAG FROM URL ================= */

const urlParams = new URLSearchParams(window.location.search);
const tag = urlParams.get("tag");

let equipmentId = null;


/* ================= LOAD EQUIPMENT ================= */

async function loadEquipment(){

const { data, error } = await supabase
.from("equipment")
.select("*")
.eq("tag_number", tag)
.single();

if(error){

console.log(error);
return;

}

equipmentId = data.id;

document.getElementById("tagNumber").innerText = data.tag_number;
document.getElementById("status").innerText = data.workflow_status;
document.getElementById("shutdownDate").innerText = data.shutdown_date;

updateTimeline(data.workflow_status);

}


/* ================= TIMELINE UPDATE ================= */

function updateTimeline(status){

const steps = document.querySelectorAll(".timeline-step");

const workflow = [

"Shutdown Completed",
"Maintenance Started",
"Pre Cleaning Inspection",
"Observation Raised",
"Recommendation Issued",
"Repair Completed",
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

const newStatus = document.getElementById("statusSelect").value;

const { error } = await supabase
.from("equipment")
.update({ workflow_status: newStatus })
.eq("id", equipmentId);

if(error){

alert("Update failed");

}else{

alert("Status Updated");

document.getElementById("status").innerText = newStatus;

updateTimeline(newStatus);

}

}


/* ================= SAVE OBSERVATION ================= */

async function saveObservation(){

const text = document.getElementById("observationText").value;

if(!text){

alert("Enter observation");
return;

}

await supabase
.from("recommendations")
.insert({
equipment_id: equipmentId,
type:"observation",
text:text
});

alert("Observation Saved");

document.getElementById("observationText").value="";

}


/* ================= SAVE RECOMMENDATION ================= */

async function saveRecommendation(){

const text = document.getElementById("recommendationText").value;

if(!text){

alert("Enter recommendation");
return;

}

await supabase
.from("recommendations")
.insert({
equipment_id: equipmentId,
type:"recommendation",
text:text
});

alert("Recommendation Saved");

document.getElementById("recommendationText").value="";

}


/* ================= PAGE LOAD ================= */

loadEquipment();
