// ===============================
// SUPABASE CONNECTION
// ===============================

const SUPABASE_URL = "https://lhktmcqjywduohrwsmzb.supabase.co"

const SUPABASE_KEY =
"eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imxoa3RtY3FqeXdkdW9ocndzbXpiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzI2ODgzNzQsImV4cCI6MjA4ODI2NDM3NH0.JYT2qavvtwESRpJNTNmBmg9p78_u-lD8sjslnFaAZgQ"

const supabaseClient =
supabase.createClient(SUPABASE_URL, SUPABASE_KEY)


// ===============================
// GET TAG FROM URL
// ===============================

const urlParams = new URLSearchParams(window.location.search)

const tag = urlParams.get("tag")


// ===============================
// LOAD EQUIPMENT DETAILS
// ===============================

async function loadEquipment(){

if(!tag){

alert("No equipment selected")

return

}

const {data,error} = await supabaseClient
.from("equipment")
.select("*")
.eq("tag_number",tag)
.single()

if(error){

console.log(error)

return

}

document.getElementById("tagNumber").innerText = data.tag_number

document.getElementById("status").innerText =
data.workflow_status

document.getElementById("shutdownDate").innerText =
data.shutdown_date || "-"

document.getElementById("unit").innerText =
data.unit_id || "-"

}


// ===============================
// UPDATE STATUS
// ===============================

async function updateStatus(){

const newStatus =
document.getElementById("statusSelect").value

const {error} = await supabaseClient
.from("equipment")
.update({
workflow_status:newStatus
})
.eq("tag_number",tag)

if(error){

alert("Update Failed")

return

}

alert("Status Updated")

loadEquipment()

}


// ===============================
// SAVE OBSERVATION
// ===============================

async function saveObservation(){

const text =
document.getElementById("observationText").value

if(!text){

alert("Enter observation")

return

}

const {error} = await supabaseClient
.from("observations")
.insert([
{
tag_number:tag,
observation:text
}
])

if(error){

alert("Save Failed")

return

}

alert("Observation Saved")

document.getElementById("observationText").value=""

}


// ===============================
// SAVE RECOMMENDATION
// ===============================

async function saveRecommendation(){

const text =
document.getElementById("recommendationText").value

if(!text){

alert("Enter recommendation")

return

}

const {error} = await supabaseClient
.from("recommendations")
.insert([
{
tag_number:tag,
recommendation:text
}
])

if(error){

alert("Save Failed")

return

}

alert("Recommendation Saved")

document.getElementById("recommendationText").value=""

}


// ===============================
// PAGE LOAD
// ===============================

document.addEventListener(
"DOMContentLoaded",
loadEquipment
)
