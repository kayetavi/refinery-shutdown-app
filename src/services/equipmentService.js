import { supabase } from "../supabaseClient";

export async function getEquipment() {
  const { data } = await supabase
    .from("shutdown_equipment")
    .select("id, status, equipment(technical_number)");
  return data;
}
