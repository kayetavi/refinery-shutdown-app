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

  const container = document.getElementById("unitsContainer");

  if(!container){
    console.error("unitsContainer div not found");
    return;
  }

  container.innerHTML = "Loading Units...";

  try{

    const { data, error } = await supabaseClient
      .from("equipment")
      .select("*");

    if(error){
      console.error("Supabase Error:", error);
      container.innerHTML = "Error loading units";
      return;
    }

    if(!data || data.length === 0){
      container.innerHTML = "No equipment found";
      return;
    }

    // ===== UNIQUE UNITS =====
    const units = [...new Set(
      data
      .map(e => e.unit)
      .filter(u => u !== null && u !== "")
    )];

    container.innerHTML = "";

    // ===== CREATE CARDS =====
    units.forEach(unit => {

      const total = data.filter(e => e.unit === unit).length;

      const ndt = data.filter(e =>
        e.unit === unit &&
        e.workflow_status === "NDT Inspection"
      ).length;

      const card = document.createElement("div");

      card.className = "unit-card";

      card.style.cursor = "pointer";

      card.innerHTML = `
        <h3>Unit : ${unit}</h3>
        <p>Total Equipment : ${total}</p>
        <p>NDT Pending : ${ndt}</p>
      `;

      card.addEventListener("click", () => {
        window.location.href =
        "equipment.html?unit=" + encodeURIComponent(unit);
      });

      container.appendChild(card);

    });

  }
  catch(err){
    console.error("Unit Load Error:", err);
    container.innerHTML = "Error loading units";
  }

}


// ================= PAGE LOAD =================

document.addEventListener("DOMContentLoaded", function(){
  loadUnits();
});
