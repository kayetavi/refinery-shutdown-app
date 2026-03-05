async function completeRepair(id) {
  await supabase
    .from("repairs")
    .update({ status: "Completed" })
    .eq("id", id);

  alert("Repair Completed");
}
