import { supabase } from "../supabaseClient";

export async function getShutdownCount() {
  const { data } = await supabase
    .from("shutdown_equipment")
    .select("*");
  return data?.length || 0;
}
