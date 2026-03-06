// ================= SUPABASE =================

const supabaseUrl = "https://lhktmcqjywduohrwsmzb.supabase.co";

const supabaseKey =
"eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imxoa3RtY3FqeXdkdW9ocndzbXpiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzI2ODgzNzQsImV4cCI6MjA4ODI2";

const supabaseClient = supabase.createClient(
supabaseUrl,
supabaseKey
);


// ================= LOAD UNITS =================

async function loadUnits(){

try{

const {data,error} = await supabaseClient
.from("equipment")
.select("*");

if(error){
console.error("Supabase Error:",error);
return;
}

if(!data || data.length===0){
console.log("No Equipment Found");
return;
}


// ❗ NULL UNIT REMOVE
const units = [
...new Set(
data
.map(e=>e.unit)
.filter(u=>u && u.trim()!=="")
)
];

const container =
document.getElementById("unitsContainer");

if(!container){
console.error("unitsContainer not found in HTML");
return;
}

container.innerHTML="";


// ================= CREATE CARDS =================

units.forEach(unit=>{

const total =
data.filter(e=>e.unit===unit).length;

const ndt =
data.filter(e=>
e.unit===unit &&
e.workflow_status==="NDT Inspection"
).length;

const card = document.createElement("div");

card.className="unit-card";

card.style.cursor="pointer";

card.onclick=function(){
openUnit(unit);
};

card.innerHTML=`

<b>Unit :</b> ${unit} <br><br>

Total Equipment : ${total} <br>

NDT Pending : ${ndt}

`;

container.appendChild(card);

});

}catch(err){

console.error("Unit Load Error:",err);

}

}


// ================= OPEN UNIT =================

function openUnit(unit){

window.location.href =
"equipment.html?unit=" + encodeURIComponent(unit);

}


// ================= PAGE LOAD =================

document.addEventListener("DOMContentLoaded",()=>{

loadUnits();

});
