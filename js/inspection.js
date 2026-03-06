const SUPABASE_URL = "https://lhktmcqjywduohrwsmzb.supabase.co";

const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imxoa3RtY3FqeXdkdW9ocndzbXpiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzI2ODgzNzQsImV4cCI6MjA4ODI2NDM3NH0.JYT2qavvtwESRpJNTNmBmg9p78_u-lD8sjslnFaAZgQ";

const supabase = window.supabase.createClient(
SUPABASE_URL,
SUPABASE_KEY
);

async function saveInspection(){

const unit = document.getElementById("unit").value;

const tag = document.getElementById("tag").value;

const inspector = document.getElementById("inspector").value;

const date = document.getElementById("date").value;

const status = document.getElementById("status").value;

const observation = document.getElementById("observation").value;

const recommendation = document.getElementById("recommendation").value;

const damagePhoto =
document.getElementById("damagePhoto").files[0];

const ndtReport =
document.getElementById("ndtReport").files[0];


let photoUrl = "";
let ndtUrl = "";


if(damagePhoto){

const {data,error} = await supabase.storage
.from("damage-photos")
.upload(`damage_${Date.now()}_${damagePhoto.name}`, damagePhoto);

photoUrl = data.path;

}

if(ndtReport){

const {data,error} = await supabase.storage
.from("ndt-reports")
.upload(`ndt_${Date.now()}_${ndtReport.name}`, ndtReport);

ndtUrl = data.path;

}


await supabase
.from("inspections")
.insert({

unit:unit,
tag_number:tag,
inspector:inspector,
inspection_date:date,
status:status,
observation:observation,
recommendation:recommendation,
damage_photo:photoUrl,
ndt_report:ndtUrl

});

alert("Inspection Saved");

}
