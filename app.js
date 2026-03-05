const supabaseUrl = "lhktmcqjywduohrwsmzb";
const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imxoa3RtY3FqeXdkdW9ocndzbXpiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzI2ODgzNzQsImV4cCI6MjA4ODI2NDM3NH0.JYT2qavvtwESRpJNTNmBmg9p78_u-lD8sjslnFaAZgQ";

const supabase = window.supabase.createClient(supabaseUrl, supabaseKey);

// Add Unit
async function addUnit() {
  const name = document.getElementById("unitName").value;

  await supabase.from("units").insert([{ name }]);

  alert("Unit Added");
  loadUnits();
}

// Load Units
async function loadUnits() {
  const { data } = await supabase.from("units").select("*");

  const select = document.getElementById("unitSelect");
  select.innerHTML = "";

  data.forEach(unit => {
    const option = document.createElement("option");
    option.value = unit.id;
    option.textContent = unit.name;
    select.appendChild(option);
  });
}

// Add Equipment
async function addEquipment() {
  const tag = document.getElementById("equipTag").value;
  const name = document.getElementById("equipName").value;
  const unit_id = document.getElementById("unitSelect").value;

  await supabase.from("equipment").insert([
    { tag_number: tag, name, unit_id }
  ]);

  alert("Equipment Added");
  loadEquipment();
}

// Load Equipment
async function loadEquipment() {
  const { data } = await supabase
    .from("equipment")
    .select("*, units(name)");

  const list = document.getElementById("equipmentList");
  list.innerHTML = "";

  data.forEach(eq => {
    const li = document.createElement("li");
    li.textContent = `${eq.tag_number} - ${eq.name} (${eq.units?.name})`;
    list.appendChild(li);
  });
}

// Initial Load
loadUnits();
loadEquipment();
