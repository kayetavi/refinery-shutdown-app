async function updateStatus(id, status) {
  await supabase
    .from("equipment")
    .update({ workflow_status: status })
    .eq("id", id);

  alert("Status Updated");
}
