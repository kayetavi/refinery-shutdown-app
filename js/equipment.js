const SUPABASE_URL="https://lhktmcqjywduohrwsmzb.supabase.co"

const SUPABASE_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imxoa3RtY3FqeXdkdW9ocndzbXpiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzI2ODgzNzQsImV4cCI6MjA4ODI2NDM3NH0.JYT2qavvtwESRpJNTNmBmg9p78_u-lD8sjslnFaAZgQ"

const supabaseClient=
supabase.createClient(SUPABASE_URL,SUPABASE_KEY)

const params = new URLSearchParams(window.location.search)

const statusFilter = params.get("status")


async function loadEquipment(){

let query =
supabaseClient
.from("equipment")
.select("*")
.order("tag_number")

if(statusFilter){

query = query.eq("workflow_status",statusFilter)

}

const {data,error}=await query

if(error){

console.log(error)

return

}

const table=document.getElementById("equipmentTable")

table.innerHTML=""

data.forEach(eq=>{

table.innerHTML+=`

<tr onclick="openEquipment('${eq.id}')">

<td>${eq.tag_number}</td>

<td>${eq.workflow_status}</td>

<td>${eq.shutdown_date ? eq.shutdown_date.substring(0,10) : ""}</td>

</tr>

`

})

}


function openEquipment(id){

window.location.href=
"equipment-details.html?id="+id

}

loadEquipment()
